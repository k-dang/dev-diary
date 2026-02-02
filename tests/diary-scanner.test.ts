import { describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { join } from "node:path";
import { scanDiaryFiles } from "../src/services/diary-scanner.ts";
import { createTempDir, removeTempDir, writeTextFile } from "./test-helpers.ts";

describe("scanDiaryFiles", () => {
  it("finds diary files and sorts by date", async () => {
    const outputDir = await createTempDir();
    try {
      await mkdir(outputDir, { recursive: true });
      await writeTextFile(join(outputDir, "dev-diary-2026-01-01.md"), "a");
      await writeTextFile(join(outputDir, "dev-log-2026-01-03.md"), "b");
      await writeTextFile(join(outputDir, "dev-diary-2025-12-31.md"), "c");
      await writeTextFile(join(outputDir, "notes.txt"), "ignore");

      const files = await scanDiaryFiles(outputDir);
      const dates = files.map((file) => file.date);

      expect(dates).toEqual(["2026-01-03", "2026-01-01", "2025-12-31"]);
      expect(files[0]?.filename).toBe("dev-log-2026-01-03.md");
    } finally {
      await removeTempDir(outputDir);
    }
  });

  it("returns empty array when directory does not exist", async () => {
    const root = await createTempDir();
    try {
      const missingDir = join(root, "missing");
      const files = await scanDiaryFiles(missingDir);
      expect(files).toEqual([]);
    } finally {
      await removeTempDir(root);
    }
  });
});
