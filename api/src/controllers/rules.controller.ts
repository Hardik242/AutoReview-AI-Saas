import {Response, NextFunction} from "express";
import {
	createRule,
	getUserRules,
	deleteRule,
	toggleRule,
} from "../services/rules.service";
import {AuthenticatedRequest} from "../types";

export const create = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {rule} = req.body;

		if (!rule || typeof rule !== "string" || rule.trim().length === 0) {
			res
				.status(400)
				.json({
					success: false,
					message: "rule is required and must be a non-empty string",
				});
			return;
		}

		const newRule = await createRule(req.userId!, rule.trim());
		res.status(201).json({success: true, data: newRule});
	} catch (error) {
		next(error);
	}
};

export const list = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const rules = await getUserRules(req.userId!);
		res.status(200).json({success: true, data: rules});
	} catch (error) {
		next(error);
	}
};

export const remove = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const ruleId = parseInt(req.params.id as string, 10);
		if (isNaN(ruleId)) {
			res.status(400).json({success: false, message: "Invalid rule ID"});
			return;
		}
		const deleted = await deleteRule(ruleId, req.userId!);
		res.status(200).json({success: true, data: deleted});
	} catch (error) {
		next(error);
	}
};

export const toggle = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const ruleId = parseInt(req.params.id as string, 10);
		if (isNaN(ruleId)) {
			res.status(400).json({success: false, message: "Invalid rule ID"});
			return;
		}
		const toggled = await toggleRule(ruleId, req.userId!);
		res.status(200).json({success: true, data: toggled});
	} catch (error) {
		next(error);
	}
};
