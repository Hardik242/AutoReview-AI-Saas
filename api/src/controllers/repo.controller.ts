import {Response, NextFunction} from "express";
import {
	connectRepository,
	disconnectRepository,
	getUserRepositories,
} from "../services/repo.service";
import {listGitHubRepos} from "../services/github.service";
import {getUserById} from "../services/user.service";
import {AuthenticatedRequest} from "../types";

export const connect = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const {githubRepoId, fullName} = req.body;

		if (
			!githubRepoId ||
			!fullName ||
			typeof githubRepoId !== "string" ||
			typeof fullName !== "string"
		) {
			res.status(400).json({
				success: false,
				message: "githubRepoId and fullName are required strings",
			});
			return;
		}

		const repo = await connectRepository(req.userId!, githubRepoId, fullName);
		res.status(201).json({success: true, data: repo});
	} catch (error) {
		next(error);
	}
};

export const disconnect = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const repoId = parseInt(req.params.id as string, 10);
		if (isNaN(repoId)) {
			res.status(400).json({success: false, message: "Invalid repository ID"});
			return;
		}
		const repo = await disconnectRepository(repoId, req.userId!);
		res.status(200).json({success: true, data: repo});
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
		const repos = await getUserRepositories(req.userId!);
		res.status(200).json({success: true, data: repos});
	} catch (error) {
		next(error);
	}
};

export const listGitHub = async (
	req: AuthenticatedRequest,
	res: Response,
	next: NextFunction,
) => {
	try {
		const user = await getUserById(req.userId!);

		if (!user.githubAccessToken) {
			throw Object.assign(
				new Error("GitHub access token not found. Please re-login."),
				{statusCode: 401},
			);
		}

		const repos = await listGitHubRepos(user.githubAccessToken);
		res.status(200).json({success: true, data: repos});
	} catch (error) {
		next(error);
	}
};
