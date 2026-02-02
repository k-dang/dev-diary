import { describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { scanForRepos } from "../src/services/git-scanner.ts";
import { createTempDir, removeTempDir } from "./test-helpers.ts";

describe("scanForRepos", () => {
  it("finds git repos in subdirectories", async () => {
    const root = await createTempDir();
    try {
      const repoA = join(root, "repo-a");
      const repoB = join(root, "repo-b");
      await mkdir(join(repoA, ".git"), { recursive: true });
      await mkdir(join(repoB, ".git"), { recursive: true });

      const repos = await scanForRepos(root, 3);
      const repoNames = repos.map((repo) => repo.name).sort();

      expect(repoNames).toEqual(["repo-a", "repo-b"]);
    } finally {
      await removeTempDir(root);
    }
  });

  it("respects maxDepth and ignores node_modules", async () => {
    const root = await createTempDir();
    try {
      const shallowRepo = join(root, "repo-shallow");
      const deepRepo = join(root, "level-1", "level-2", "repo-deep");
      const ignoredRepo = join(root, "node_modules", "repo-ignored");

      await mkdir(join(shallowRepo, ".git"), { recursive: true });
      await mkdir(join(deepRepo, ".git"), { recursive: true });
      await mkdir(join(ignoredRepo, ".git"), { recursive: true });

      const repos = await scanForRepos(root, 1);
      const repoNames = repos.map((repo) => repo.name);

      expect(repoNames).toEqual(["repo-shallow"]);
    } finally {
      await removeTempDir(root);
    }
  });
});
