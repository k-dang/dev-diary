import { generateText } from "ai";
import type { RepoData } from "../types/index.ts";

function formatRepoDataForPrompt(repoData: RepoData[]): string {
  const sections: string[] = [];

  for (const { repo, commits } of repoData) {
    if (commits.length === 0) continue;

    const commitSections = commits.map((commit) => {
      return `### Commit: ${commit.message}
Author: ${commit.author}
Date: ${commit.date}
Hash: ${commit.hash}

\`\`\`diff
${commit.diff}
\`\`\``;
    });

    sections.push(`## Repository: ${repo.name}
Path: ${repo.path}

${commitSections.join("\n\n")}`);
  }

  return sections.join("\n\n---\n\n");
}

export async function generateSummary(repoData: RepoData[]): Promise<string> {
  if (repoData.length === 0) {
    return "# Dev Diary\n\nNo commits found for the specified time period.";
  }

  const formattedData = formatRepoDataForPrompt(repoData);
  const today = new Date().toLocaleDateString("en-US", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const prompt = `You are writing a developer's daily diary entry for ${today}. Given the following git commits and diffs from multiple repositories, write a cohesive narrative summarizing the day's work.

Guidelines:
- Write in first person ("I worked on...", "I fixed...", "I implemented...")
- Focus on what was accomplished and why, not just what files changed
- Group related changes together logically
- Include relevant technical details but keep it readable as a journal entry
- Start with a brief overview, then go into specifics
- Use markdown formatting for readability
- Keep the tone professional but personal

Here are the commits and changes:

${formattedData}

Write the diary entry now. Start with a "# Dev Diary - ${today}" heading.`;

  const { text } = await generateText({
    model: "google/gemini-2.5-flash-lite",
    prompt,
  });

  return text;
}
