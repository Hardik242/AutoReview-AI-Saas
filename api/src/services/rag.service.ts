import {eq, sql} from "drizzle-orm";
import {db} from "../db";
import {codeEmbeddingsTable} from "../db/schema";
import {generateEmbedding} from "./gemini.service";

export const embedAndStoreFile = async (
	repositoryId: number,
	filePath: string,
	content: string,
) => {
	const chunks = splitIntoChunks(content, 1000);

	for (const chunk of chunks) {
		const embedding = await generateEmbedding(chunk);

		await db.insert(codeEmbeddingsTable).values({
			repositoryId,
			filePath,
			chunkContent: chunk,
			embedding,
		});
	}
};

export const findSimilarCode = async (
	repositoryId: number,
	queryText: string,
	limit: number = 5,
): Promise<string> => {
	const queryEmbedding = await generateEmbedding(queryText);
	const embeddingStr = `[${queryEmbedding.join(",")}]`;

	const results = await db.execute(sql`
    SELECT file_path, chunk_content,
           1 - (embedding <=> ${embeddingStr}::vector) as similarity
    FROM code_embeddings
    WHERE repository_id = ${repositoryId}
      AND embedding IS NOT NULL
    ORDER BY embedding <=> ${embeddingStr}::vector
    LIMIT ${limit}
  `);

	if (!results.rows || results.rows.length === 0) {
		return "";
	}

	return results.rows
		.map(
			(row: any) =>
				`### ${row.file_path}\n\`\`\`\n${row.chunk_content}\n\`\`\``,
		)
		.join("\n\n");
};

export const clearRepoEmbeddings = async (repositoryId: number) => {
	await db
		.delete(codeEmbeddingsTable)
		.where(eq(codeEmbeddingsTable.repositoryId, repositoryId));
};

const splitIntoChunks = (text: string, maxChars: number): string[] => {
	const lines = text.split("\n");
	const chunks: string[] = [];
	let current = "";

	for (const line of lines) {
		if (current.length + line.length + 1 > maxChars && current.length > 0) {
			chunks.push(current);
			current = "";
		}
		current += (current ? "\n" : "") + line;
	}

	if (current) {
		chunks.push(current);
	}

	return chunks;
};
