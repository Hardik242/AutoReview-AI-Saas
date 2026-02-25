import axios from "axios";
import {eq} from "drizzle-orm";
import {db} from "../db";
import {usersTable} from "../db/schema";
import {env} from "../config/env";

interface GitHubTokenResponse {
	access_token: string;
	token_type: string;
	scope: string;
}

interface GitHubUser {
	id: number;
	login: string;
	email: string | null;
	avatar_url: string;
}

export const exchangeCodeForToken = async (code: string): Promise<string> => {
	const response = await axios.post<GitHubTokenResponse>(
		"https://github.com/login/oauth/access_token",
		{
			client_id: env.GITHUB_CLIENT_ID,
			client_secret: env.GITHUB_CLIENT_SECRET,
			code,
		},
		{
			headers: {Accept: "application/json"},
		},
	);

	if (!response.data.access_token) {
		throw new Error("Failed to exchange code for GitHub access token");
	}

	return response.data.access_token;
};

export const getGitHubUser = async (
	accessToken: string,
): Promise<GitHubUser> => {
	const response = await axios.get<GitHubUser>("https://api.github.com/user", {
		headers: {
			Authorization: `Bearer ${accessToken}`,
		},
	});

	return response.data;
};

export const findOrCreateUser = async (
	githubUser: GitHubUser,
	githubAccessToken: string,
) => {
	const existingUsers = await db
		.select()
		.from(usersTable)
		.where(eq(usersTable.githubId, String(githubUser.id)));

	if (existingUsers.length > 0) {
		const updated = await db
			.update(usersTable)
			.set({
				githubAccessToken,
				username: githubUser.login,
				email: githubUser.email,
				avatarUrl: githubUser.avatar_url,
				updatedAt: new Date(),
			})
			.where(eq(usersTable.id, existingUsers[0].id))
			.returning();
		return updated[0];
	}

	const newUsers = await db
		.insert(usersTable)
		.values({
			githubId: String(githubUser.id),
			username: githubUser.login,
			email: githubUser.email,
			avatarUrl: githubUser.avatar_url,
			githubAccessToken,
		})
		.returning();

	return newUsers[0];
};
