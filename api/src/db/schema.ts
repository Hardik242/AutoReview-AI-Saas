import {
	pgTable,
	serial,
	varchar,
	timestamp,
	integer,
	boolean,
	text,
	pgEnum,
	vector,
} from "drizzle-orm/pg-core";

export const planEnum = pgEnum("plan", ["free", "pro"]);

export const usersTable = pgTable("users", {
	id: serial("id").primaryKey(),
	githubId: varchar("github_id", {length: 255}).notNull().unique(),
	username: varchar("username", {length: 255}).notNull(),
	email: varchar("email", {length: 255}),
	avatarUrl: varchar("avatar_url", {length: 512}),
	githubAccessToken: varchar("github_access_token", {length: 512}),
	plan: planEnum("plan").default("free").notNull(),
	reviewsLimit: integer("reviews_limit").default(30).notNull(),
	reviewsUsed: integer("reviews_used").default(0).notNull(),
	reviewsResetAt: timestamp("reviews_reset_at").defaultNow().notNull(),
	stripeCustomerId: varchar("stripe_customer_id", {length: 255}),
	stripeSubscriptionId: varchar("stripe_subscription_id", {length: 255}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const repositoriesTable = pgTable("repositories", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => usersTable.id, {onDelete: "cascade"}),
	githubRepoId: varchar("github_repo_id", {length: 255}).notNull().unique(),
	fullName: varchar("full_name", {length: 255}).notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	webhookId: varchar("webhook_id", {length: 255}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

export const reviewRulesTable = pgTable("review_rules", {
	id: serial("id").primaryKey(),
	userId: integer("user_id")
		.notNull()
		.references(() => usersTable.id, {onDelete: "cascade"}),
	rule: text("rule").notNull(),
	isActive: boolean("is_active").default(true).notNull(),
	createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const reviewsTable = pgTable("reviews", {
	id: serial("id").primaryKey(),
	repositoryId: integer("repository_id")
		.notNull()
		.references(() => repositoriesTable.id, {onDelete: "cascade"}),
	userId: integer("user_id")
		.notNull()
		.references(() => usersTable.id, {onDelete: "cascade"}),
	prNumber: integer("pr_number").notNull(),
	prTitle: varchar("pr_title", {length: 512}),
	status: varchar("status", {length: 50}).default("pending").notNull(),
	reviewType: varchar("review_type", {length: 50}).notNull(),
	summary: text("summary"),
	issuesFound: integer("issues_found").default(0),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	completedAt: timestamp("completed_at"),
});

export const codeEmbeddingsTable = pgTable("code_embeddings", {
	id: serial("id").primaryKey(),
	repositoryId: integer("repository_id")
		.notNull()
		.references(() => repositoriesTable.id, {onDelete: "cascade"}),
	filePath: varchar("file_path", {length: 1024}).notNull(),
	chunkContent: text("chunk_content").notNull(),
	embedding: vector("embedding", {dimensions: 768}),
	createdAt: timestamp("created_at").defaultNow().notNull(),
	updatedAt: timestamp("updated_at").defaultNow().notNull(),
});
