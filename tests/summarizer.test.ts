import { beforeEach, describe, expect, it, mock } from "bun:test";
import type { RepoData } from "../src/types/index.ts";

const prompts: string[] = [];

mock.module("ai", () => ({
  generateText: async ({ prompt }: { prompt: string }) => {
    prompts.push(prompt);
    return { text: `generated-${prompts.length}` };
  },
}));

const { generateSummaries } = await import("../src/services/summarizer.ts");

describe("generateSummaries", () => {
  beforeEach(() => {
    prompts.length = 0;
  });

  it("returns fallback text when no repo data is provided", async () => {
    const result = await generateSummaries([], 1);

    expect(result.brag).toContain("# BRAG -");
    expect(result.devLog).toContain("# Dev Log -");
    expect(result.brag).toContain("No commits found");
    expect(prompts).toHaveLength(0);
  });

  it("builds prompts with commit data and returns AI text", async () => {
    const repoData: RepoData[] = [
      {
        repo: { name: "demo-repo", path: "/tmp/demo" },
        commits: [
          {
            hash: "abc123",
            message: "Add feature X",
            author: "Test User",
            date: "2026-02-01",
            diff: "+const x = 1",
          },
        ],
      },
    ];

    const result = await generateSummaries(repoData, 1);

    expect(result.brag).toBe("generated-1");
    expect(result.devLog).toBe("generated-2");
    expect(prompts).toHaveLength(2);

    const bragPrompt = prompts[0];
    const devLogPrompt = prompts[1];

    expect(bragPrompt).toContain("demo-repo");
    expect(bragPrompt).toContain("/tmp/demo");
    expect(bragPrompt).toContain("Add feature X");
    expect(bragPrompt).toContain("abc123");
    expect(bragPrompt).toContain("+const x = 1");

    expect(devLogPrompt).toContain("demo-repo");
    expect(devLogPrompt).toContain("Add feature X");
    expect(devLogPrompt).not.toContain("/tmp/demo");
    expect(devLogPrompt).not.toContain("abc123");
    expect(devLogPrompt).not.toContain("+const x = 1");
  });
});
