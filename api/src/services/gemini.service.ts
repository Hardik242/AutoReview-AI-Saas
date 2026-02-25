import {GoogleGenerativeAI} from "@google/generative-ai";
import {env} from "../config/env";
import {PRFile} from "./github.service";

const genAI = new GoogleGenerativeAI(env.GEMINI_API_KEY);

export interface ReviewIssue {
	file: string;
	line: number;
	severity: "critical" | "warning" | "suggestion";
	category: string;
	message: string;
	fix?: string;
}

export interface ReviewResult {
	summary: string;
	issues: ReviewIssue[];
}

const buildBasicPrompt = (files: PRFile[]): string => {
	const diffs = files
		.filter((f) => f.patch)
		.map((f) => `### ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
		.join("\n\n");

	return `You are a code reviewer. Analyze the following pull request diff and identify bugs and code style issues.

Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "Brief overall summary of the review",
  "issues": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "severity": "critical|warning|suggestion",
      "category": "bug|style",
      "message": "Description of the issue"
    }
  ]
}

If no issues are found, return: {"summary": "Code looks good!", "issues": []}

PR Diff:
${diffs}`;
};

const buildFullPrompt = (
	files: PRFile[],
	repoContext: string,
	customRules: string[],
): string => {
	const diffs = files
		.filter((f) => f.patch)
		.map((f) => `### ${f.filename}\n\`\`\`diff\n${f.patch}\n\`\`\``)
		.join("\n\n");

	const rulesSection =
		customRules.length > 0
			? `\n\nCustom Rules (enforce these strictly):\n${customRules.map((r, i) => `${i + 1}. ${r}`).join("\n")}`
			: "";

	const contextSection = repoContext
		? `\n\nRelevant Repository Context (existing code for reference):\n${repoContext}`
		: "";

	return `You are a senior code reviewer performing a thorough security and quality audit. Analyze the following pull request diff for:
1. Bugs and logic errors
2. Security vulnerabilities (SQL injection, XSS, auth bypass, secrets exposure, IDOR)
3. Performance bottlenecks
4. Code style and best practices
${rulesSection}
${contextSection}

Respond ONLY with a valid JSON object in this exact format:
{
  "summary": "Brief overall summary of the review",
  "issues": [
    {
      "file": "path/to/file.ts",
      "line": 42,
      "severity": "critical|warning|suggestion",
      "category": "bug|security|performance|style",
      "message": "Description of the issue",
      "fix": "The corrected code (only for critical/warning severity)"
    }
  ]
}

If no issues are found, return: {"summary": "Code looks good! No issues found.", "issues": []}

PR Diff:
${diffs}`;
};

export const generateBasicReview = async (
	files: PRFile[],
): Promise<ReviewResult> => {
	const model = genAI.getGenerativeModel({model: "gemini-2.0-flash-lite"});
	const prompt = buildBasicPrompt(files);

	const result = await model.generateContent(prompt);
	const text = result.response.text();

	const jsonMatch = text.match(/\{[\s\S]*\}/);
	if (!jsonMatch) {
		return {summary: "Failed to parse review response", issues: []};
	}

	return JSON.parse(jsonMatch[0]) as ReviewResult;
};

export const generateFullReview = async (
	files: PRFile[],
	repoContext: string,
	customRules: string[],
): Promise<ReviewResult> => {
	const model = genAI.getGenerativeModel({model: "gemini-2.0-flash"});
	const prompt = buildFullPrompt(files, repoContext, customRules);

	const result = await model.generateContent(prompt);
	const text = result.response.text();

	const jsonMatch = text.match(/\{[\s\S]*\}/);
	if (!jsonMatch) {
		return {summary: "Failed to parse review response", issues: []};
	}

	return JSON.parse(jsonMatch[0]) as ReviewResult;
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
	const model = genAI.getGenerativeModel({model: "gemini-embedding-001"});
	const result = await model.embedContent(text);
	return result.embedding.values;
};
