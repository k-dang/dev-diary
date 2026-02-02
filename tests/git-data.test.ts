import { describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import {
  getAllRepoData,
  getCommitDiff,
  getCommitsFromLastDays,
} from "../src/services/git-data.ts";
import type { GitRepo } from "../src/types/index.ts";
import {
  createTempDir,
  removeTempDir,
  runGit,
  withTempHome,
  writeTextFile,
} from "./test-helpers.ts";

async function initRepo(repoPath: string): Promise<void> {
  await mkdir(repoPath, { recursive: true });
  await runGit(repoPath, ["init"]);
}

async function initRepoWithCommit(repoPath: string): Promise<string> {
  await initRepo(repoPath);
  await runGit(repoPath, ["config", "user.email", "test@example.com"]);
  await runGit(repoPath, ["config", "user.name", "Test User"]);

  const filePath = join(repoPath, "file.txt");
  await writeTextFile(filePath, "hello world\n");
  await runGit(repoPath, ["add", "."]);
  const commitResult = await runGit(repoPath, [
    "commit",
    "-m",
    "Initial commit",
  ]);

  expect(commitResult.exitCode).toBe(0);
  const hash = (await runGit(repoPath, ["rev-parse", "HEAD"])).stdout;
  return hash;
}

describe("git-data", () => {
  it("reads commits from the last day with diffs", async () => {
    await withTempHome(async () => {
      const root = await createTempDir();
      try {
        const repoPath = join(root, "repo");
        const hash = await initRepoWithCommit(repoPath);

        const commits = await getCommitsFromLastDays(repoPath, 1);
        expect(commits).toHaveLength(1);
        expect(commits[0]?.message).toBe("Initial commit");
        expect(commits[0]?.hash).toBe(hash);

        const diff = await getCommitDiff(repoPath, hash);
        expect(diff).toContain("file.txt");
        expect(diff).toContain("hello world");
      } finally {
        await removeTempDir(root);
      }
    });
  });

  it("aggregates repo data and reports progress", async () => {
    await withTempHome(async () => {
      const root = await createTempDir();
      try {
        const repoWithCommit = join(root, "repo-with-commit");
        const repoWithoutCommit = join(root, "repo-no-commit");
        await initRepoWithCommit(repoWithCommit);
        await initRepo(repoWithoutCommit);

        const repos: GitRepo[] = [
          { name: "repo-with-commit", path: repoWithCommit },
          { name: "repo-no-commit", path: repoWithoutCommit },
        ];

        const progressCalls: Array<{
          current: number;
          total: number;
          name: string;
        }> = [];
        const data = await getAllRepoData(
          repos,
          1,
          (current, total, repoName) => {
            progressCalls.push({ current, total, name: repoName });
          },
        );

        expect(progressCalls).toHaveLength(2);
        expect(progressCalls[0]).toEqual({
          current: 1,
          total: 2,
          name: "repo-with-commit",
        });
        expect(progressCalls[1]).toEqual({
          current: 2,
          total: 2,
          name: "repo-no-commit",
        });

        expect(data).toHaveLength(1);
        expect(data[0]?.repo.name).toBe("repo-with-commit");
        expect(data[0]?.commits).toHaveLength(1);
      } finally {
        await removeTempDir(root);
      }
    });
  });
});
