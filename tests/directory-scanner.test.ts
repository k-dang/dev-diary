import { describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { scanDirectories } from "../src/services/directory-scanner.ts";
import { createTempDir, removeTempDir } from "./test-helpers.ts";

describe("scanDirectories", () => {
  it("returns directories and excludes hidden or ignored paths", async () => {
    const root = await createTempDir();
    try {
      await mkdir(join(root, "project"), { recursive: true });
      await mkdir(join(root, ".hidden"), { recursive: true });
      await mkdir(join(root, "node_modules"), { recursive: true });

      const results = await scanDirectories(root, 1, false);

      expect(results).toContain(join(root, "project"));
      expect(results).not.toContain(join(root, ".hidden"));
      expect(results).not.toContain(join(root, "node_modules"));
    } finally {
      await removeTempDir(root);
    }
  });

  it("includes start path when requested and respects depth", async () => {
    const root = await createTempDir();
    try {
      await mkdir(join(root, "level-1", "level-2"), { recursive: true });

      const results = await scanDirectories(root, 0, true);

      expect(results).toEqual([root, join(root, "level-1")]);
    } finally {
      await removeTempDir(root);
    }
  });
});
