import {google} from "@ai-sdk/google";
import {generateText, generateObject, embed} from "ai";
import {z} from "zod";

export interface ReviewIssue {
	file: string;
	line: number;
	severity: "critical" | "warning" | "suggestion";
	category: string;
	message: string;
}

export interface ReviewResult {
	summary: string;
	issues: ReviewIssue[];
}

export const generateBasicReview = async (
	title: string,
	diff: string,
): Promise<ReviewResult> => {
	const prompt = `You are a code reviewer. Analyze the following pull request diff and identify bugs and code style issues.

PR Title: ${title}

Code Changes:
\`\`\`diff
${diff}
\`\`\`

Provide a high-level summary of the changes and list any bugs or code style issues found. Format your response in Markdown.`;

	const {text} = await generateText({
		model: google("gemini-2.0-flash-lite"),
		prompt,
	});

	return {
		summary: text,
		issues: [],
	};
};

export const generateFullReview = async (
	title: string,
	diff: string,
	contextBlocks: string[] = [],
): Promise<ReviewResult> => {
	const prompt = `You are a senior code reviewer performing a thorough security and quality audit. Analyze the pull request diff for:
1. Bugs and logic errors
2. Security vulnerabilities
3. Performance bottlenecks
4. Code style and best practices

Context from Codebase (for reference) and Rules:
${contextBlocks.join("\n\n")}

PR Title: ${title}

Code Changes:
\`\`\`diff
${diff}
\`\`\`

Provide a comprehensive, detailed review.`;

	const {object} = await generateObject({
		model: google("gemini-2.0-flash"),
		schema: z.object({
			summary: z
				.string()
				.describe(
					"Walkthrough, Sequence Diagram, Strengths, Suggestions, and a Poem, formatted in Markdown",
				),
			issues: z
				.array(
					z.object({
						file: z.string().describe("File path of the issue"),
						line: z
							.number()
							.describe("Line number in the modified file (must be > 0)"),
						severity: z.enum(["critical", "warning", "suggestion"]),
						category: z
							.string()
							.describe("e.g. bug, security, performance, style"),
						message: z
							.string()
							.describe("Description of the issue and suggested fix"),
					}),
				)
				.describe(
					"List of specific issues found in the code changes to be posted as inline comments",
				),
		}),
		prompt,
	});

	return {
		summary: object.summary,
		issues: object.issues,
	};
};

export const generateEmbedding = async (text: string): Promise<number[]> => {
	const result = await embed({
		model: google.textEmbeddingModel("text-embedding-004"),
		value: text,
	});
	return result.embedding as number[];
};
