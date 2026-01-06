import { homedir } from "node:os";
import { join } from "node:path";

export interface Config {
  aiGatewayKey: string;
  outputDir: string;
  maxDepth: number;
  daysToInclude: number;
}

export function getConfig(): Config {
  const aiGatewayKey = process.env.AI_GATEWAY_API_KEY;
  if (!aiGatewayKey) {
    throw new Error("AI_GATEWAY_API_KEY environment variable is required");
  }

  const outputDir =
    process.env.DAILY_SUMMARY_OUTPUT ||
    join(homedir(), "Documents", "dev-diary");

  const maxDepth = parseInt(process.env.DAILY_SUMMARY_DEPTH || "3", 10);
  const daysToInclude = parseInt(process.env.DAILY_SUMMARY_DAYS || "1", 10);

  return {
    aiGatewayKey,
    outputDir,
    maxDepth,
    daysToInclude,
  };
}

export function getDefaultDirectory(): string {
  return process.cwd();
}

export function getDefaultOutputPath(): string {
  return (
    process.env.DAILY_SUMMARY_OUTPUT ||
    join(homedir(), "Documents", "dev-diary")
  );
}

export function getDefaultDays(): number {
  return parseInt(process.env.DAILY_SUMMARY_DAYS || "1", 10);
}
