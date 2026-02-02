import { describe, expect, it } from "bun:test";
import { mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import {
  getConfig,
  getDefaultDays,
  getDefaultDirectory,
  getDefaultOutputPath,
} from "../src/utils/config.ts";
import {
  getConfigPath,
  loadPersistedConfig,
  savePersistedConfig,
} from "../src/utils/persistence.ts";
import { withTempHome, writeTextFile } from "./test-helpers.ts";

describe("config and persistence", () => {
  it("reads config from environment", async () => {
    await withTempHome(async () => {
      const originalKey = process.env.AI_GATEWAY_API_KEY;
      const originalOutput = process.env.DAILY_SUMMARY_OUTPUT;
      const originalDepth = process.env.DAILY_SUMMARY_DEPTH;
      const originalDays = process.env.DAILY_SUMMARY_DAYS;
      try {
        process.env.AI_GATEWAY_API_KEY = "test-key";
        process.env.DAILY_SUMMARY_OUTPUT = "/tmp/output";
        process.env.DAILY_SUMMARY_DEPTH = "5";
        process.env.DAILY_SUMMARY_DAYS = "7";

        const config = getConfig();
        expect(config.aiGatewayKey).toBe("test-key");
        expect(config.outputDir).toBe("/tmp/output");
        expect(config.maxDepth).toBe(5);
        expect(config.daysToInclude).toBe(7);
      } finally {
        if (originalKey === undefined) {
          delete process.env.AI_GATEWAY_API_KEY;
        } else {
          process.env.AI_GATEWAY_API_KEY = originalKey;
        }

        if (originalOutput === undefined) {
          delete process.env.DAILY_SUMMARY_OUTPUT;
        } else {
          process.env.DAILY_SUMMARY_OUTPUT = originalOutput;
        }

        if (originalDepth === undefined) {
          delete process.env.DAILY_SUMMARY_DEPTH;
        } else {
          process.env.DAILY_SUMMARY_DEPTH = originalDepth;
        }

        if (originalDays === undefined) {
          delete process.env.DAILY_SUMMARY_DAYS;
        } else {
          process.env.DAILY_SUMMARY_DAYS = originalDays;
        }
      }
    });
  });

  it("uses persisted defaults when present", async () => {
    await withTempHome(async () => {
      await savePersistedConfig({
        directory: "/tmp/dir",
        outputPath: "/tmp/out",
        daysToInclude: 3,
      });

      const [dir, output, days] = await Promise.all([
        getDefaultDirectory(),
        getDefaultOutputPath(),
        getDefaultDays(),
      ]);

      expect(dir).toBe("/tmp/dir");
      expect(output).toBe("/tmp/out");
      expect(days).toBe(3);
    });
  });

  it("falls back to env when persisted days are invalid", async () => {
    await withTempHome(async () => {
      const originalEnv = process.env.DAILY_SUMMARY_DAYS;
      try {
        process.env.DAILY_SUMMARY_DAYS = "14";
        await savePersistedConfig({ daysToInclude: 2 });
        const days = await getDefaultDays();
        expect(days).toBe(14);
      } finally {
        if (originalEnv === undefined) {
          delete process.env.DAILY_SUMMARY_DAYS;
        } else {
          process.env.DAILY_SUMMARY_DAYS = originalEnv;
        }
      }
    });
  });

  it("returns empty config on invalid JSON", async () => {
    await withTempHome(async () => {
      const configPath = getConfigPath();
      await mkdir(dirname(configPath), { recursive: true });
      await writeTextFile(configPath, "not-json");

      const config = await loadPersistedConfig();
      expect(config).toEqual({});
    });
  });
});
