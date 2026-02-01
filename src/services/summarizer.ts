import { generateText } from "ai";
import type { RepoData, SummaryOutputs } from "../types/index.ts";

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

function buildBragPrompt(formattedData: string, periodLabel: string): string {
  return `You are writing a developer's BRAG document entry for ${periodLabel}. Given the following git commits and diffs from multiple repositories, write a concise, achievement-focused summary of the work.

Guidelines:
- Write in first person ("I delivered...", "I improved...", "I shipped...")
- Emphasize impact, outcomes, and business/user value
- Highlight ownership, scope, and complexity where relevant
- Group related changes into accomplishment bullets or short sections
- Include concrete technical details only when they reinforce impact
- Use markdown formatting for readability
- Keep the tone confident, professional, and results-oriented
- Avoid diary or play-by-play narration

Here are the commits and changes:

${formattedData}

Write the BRAG entry now. Start with a "# BRAG - ${periodLabel}" heading.`;
}

function buildDevLogPrompt(formattedData: string, periodLabel: string): string {
  return `You are writing a developer's dev log for ${periodLabel}. Given the following git commits and diffs from multiple repositories, write a concise record of the work.

Guidelines:
- Use first person ("I worked on...", "I updated...", "I investigated...")
- Focus on what was done and why, not on impact or achievements
- Prefer short sections grouped by repository or theme
- Keep the tone factual, lightweight, and chronological where sensible
- Include technical details that clarify scope or intent
- Use markdown formatting for readability
- Avoid bragging or performance language

Here are the commits and changes:

${formattedData}

Write the dev log now. Start with a "# Dev Log - ${periodLabel}" heading.`;
}

function buildPeriodLabel(daysToInclude: number): string {
  if (daysToInclude <= 1) {
    return new Date().toLocaleDateString("en-US", {
      weekday: "long",
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  }

  return `Last ${daysToInclude} days`;
}

export async function generateSummaries(
  repoData: RepoData[],
  daysToInclude: number,
): Promise<SummaryOutputs> {
  const periodLabel = buildPeriodLabel(daysToInclude);

  if (repoData.length === 0) {
    const empty = "No commits found for the specified time period.";
    return {
      brag: `# BRAG - ${periodLabel}\n\n${empty}`,
      devLog: `# Dev Log - ${periodLabel}\n\n${empty}`,
    };
  }

  const formattedData = formatRepoDataForPrompt(repoData);

  const [bragResult, devLogResult] = await Promise.all([
    generateText({
      model: "google/gemini-2.5-flash-lite",
      prompt: buildBragPrompt(formattedData, periodLabel),
    }),
    generateText({
      model: "google/gemini-2.5-flash-lite",
      prompt: buildDevLogPrompt(formattedData, periodLabel),
    }),
  ]);

  return {
    brag: bragResult.text,
    devLog: devLogResult.text,
  };
}
