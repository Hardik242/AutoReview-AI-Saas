const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000";
const BASE = `${API_URL}/api/v1`;

async function request<T>(endpoint: string, options?: RequestInit): Promise<T> {
	const res = await fetch(`${BASE}${endpoint}`, {
		...options,
		credentials: "include",
		headers: {
			"Content-Type": "application/json",
			...options?.headers,
		},
	});

	if (res.status === 401) {
		throw new AuthError("Not authenticated");
	}

	const json = await res.json();

	if (!res.ok || !json.success) {
		throw new Error(json.message || "Something went wrong");
	}

	return json.data as T;
}

export class AuthError extends Error {
	constructor(message: string) {
		super(message);
		this.name = "AuthError";
	}
}

export const api = {
	auth: {
		loginUrl: () => `${BASE}/auth/github`,
		logout: () => request("/auth/logout", {method: "POST"}),
	},
	user: {
		profile: () => request<UserProfile>("/user/profile"),
		stats: () => request<UserStats>("/user/stats"),
	},
	repos: {
		list: () => request<Repo[]>("/repos"),
		github: () => request<GitHubRepo[]>("/repos/github"),
		connect: (githubRepoId: string, fullName: string) =>
			request("/repos/connect", {
				method: "POST",
				body: JSON.stringify({githubRepoId, fullName}),
			}),
		disconnect: (id: number) => request(`/repos/${id}`, {method: "DELETE"}),
	},
	reviews: {
		list: (limit = 20, offset = 0) =>
			request<Review[]>(`/reviews?limit=${limit}&offset=${offset}`),
		get: (id: number) => request<Review>(`/reviews/${id}`),
	},
	rules: {
		list: () => request<Rule[]>("/rules"),
		create: (rule: string) =>
			request("/rules", {method: "POST", body: JSON.stringify({rule})}),
		delete: (id: number) => request(`/rules/${id}`, {method: "DELETE"}),
		toggle: (id: number) => request(`/rules/${id}/toggle`, {method: "PATCH"}),
	},
	stripe: {
		checkout: () =>
			request<{url: string}>("/stripe/checkout", {method: "POST"}),
		portal: () => request<{url: string}>("/stripe/portal", {method: "POST"}),
	},
};

export interface UserProfile {
	id: number;
	username: string;
	email: string | null;
	avatarUrl: string | null;
	plan: "free" | "pro";
	reviewsUsed: number;
	reviewsLimit: number;
	reviewsResetAt: string;
}

export interface UserStats {
	totalRepos: number;
	totalReviews: number;
	monthlyReviews: number;
	completed: number;
	failed: number;
	queued: number;
	processing: number;
	issuesFound: number;
	successRate: number;
	dailyReviews: {date: string; count: number}[];
}

export interface GitHubRepo {
	id: string;
	fullName: string;
	name: string;
	private: boolean;
	description: string | null;
	language: string | null;
	updatedAt: string | null;
}

export interface Repo {
	id: number;
	githubRepoId: string;
	fullName: string;
	isActive: boolean;
	webhookId: string | null;
	createdAt: string;
	updatedAt: string;
}

export interface Review {
	id: number;
	repositoryId: number;
	repoFullName: string | null;
	userId: number;
	prNumber: number;
	prTitle: string | null;
	status: "pending" | "queued" | "processing" | "completed" | "failed";
	reviewType: string;
	summary: string | null;
	issuesFound: number | null;
	createdAt: string;
	completedAt: string | null;
}

export interface Rule {
	id: number;
	userId: number;
	rule: string;
	isActive: boolean;
	createdAt: string;
}
