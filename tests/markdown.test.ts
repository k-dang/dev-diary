import { describe, expect, it } from "bun:test";
import { join } from "node:path";
import { writeDevDiary } from "../src/utils/markdown.ts";
import { createTempDir, removeTempDir } from "./test-helpers.ts";

describe("writeDevDiary", () => {
  it("writes a markdown file with the expected prefix", async () => {
    const outputDir = await createTempDir();
    try {
      const content = "# Test\n\nHello";
      const filePath = await writeDevDiary(content, outputDir, "brag");

      const today = new Date();
      const dateString = `${today.getFullYear()}-${String(
        today.getMonth() + 1,
      ).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      expect(filePath).toBe(join(outputDir, `dev-diary-${dateString}.md`));

      const written = await Bun.file(filePath).text();
      expect(written).toBe(content);
    } finally {
      await removeTempDir(outputDir);
    }
  });

  it("uses dev-log prefix when requested", async () => {
    const outputDir = await createTempDir();
    try {
      const filePath = await writeDevDiary("log", outputDir, "dev-log");
      expect(filePath).toContain("dev-log-");
    } finally {
      await removeTempDir(outputDir);
    }
  });
});
