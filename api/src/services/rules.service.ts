import {eq, and} from "drizzle-orm";
import {db} from "../db";
import {reviewRulesTable, usersTable} from "../db/schema";

export const createRule = async (userId: number, rule: string) => {
	const users = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.id, userId));

	if (users[0]?.plan !== "pro") {
		throw Object.assign(
			new Error("Custom review rules are only available on the Pro plan"),
			{
				statusCode: 403,
			},
		);
	}

	const newRule = await db
		.insert(reviewRulesTable)
		.values({userId, rule})
		.returning();

	return newRule[0];
};

export const getUserRules = async (userId: number) => {
	return db
		.select()
		.from(reviewRulesTable)
		.where(and(eq(reviewRulesTable.userId, userId)));
};

export const getActiveUserRules = async (userId: number) => {
	return db
		.select()
		.from(reviewRulesTable)
		.where(
			and(
				eq(reviewRulesTable.userId, userId),
				eq(reviewRulesTable.isActive, true),
			),
		);
};

export const deleteRule = async (ruleId: number, userId: number) => {
	const deleted = await db
		.delete(reviewRulesTable)
		.where(
			and(eq(reviewRulesTable.id, ruleId), eq(reviewRulesTable.userId, userId)),
		)
		.returning();

	if (deleted.length === 0) {
		throw Object.assign(new Error("Rule not found"), {statusCode: 404});
	}

	return deleted[0];
};

export const toggleRule = async (ruleId: number, userId: number) => {
	const rules = await db
		.select()
		.from(reviewRulesTable)
		.where(
			and(eq(reviewRulesTable.id, ruleId), eq(reviewRulesTable.userId, userId)),
		);

	if (rules.length === 0) {
		throw Object.assign(new Error("Rule not found"), {statusCode: 404});
	}

	const updated = await db
		.update(reviewRulesTable)
		.set({isActive: !rules[0].isActive})
		.where(eq(reviewRulesTable.id, ruleId))
		.returning();

	return updated[0];
};
