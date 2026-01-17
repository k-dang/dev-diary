import { homedir } from "node:os";
import { join } from "node:path";

export interface PersistedConfig {
  directory?: string;
  outputPath?: string;
  daysToInclude?: number;
}

/**
 * Returns the full path to the config file
 */
export function getConfigPath(): string {
  return join(homedir(), ".config", "dev-dairy", "config.json");
}

/**
 * Loads persisted config from ~/.config/dev-dairy/config.json
 * Returns empty object on any error (file doesn't exist, invalid JSON, etc.)
 */
export async function loadPersistedConfig(): Promise<PersistedConfig> {
  try {
    const configPath = getConfigPath();
    const file = Bun.file(configPath);
    const content = await file.text();
    const config = JSON.parse(content);
    return config;
  } catch {
    // File doesn't exist, invalid JSON, or permission error - return empty config
    return {};
  }
}

/**
 * Saves persisted config to ~/.config/dev-dairy/config.json
 * Creates directory if needed. Logs errors but doesn't throw.
 */
export async function savePersistedConfig(
  config: PersistedConfig,
): Promise<void> {
  try {
    const configPath = getConfigPath();
    const configJson = JSON.stringify(config, null, 2);

    // Write config with pretty formatting, creating parent directories if needed
    await Bun.write(configPath, configJson, { createPath: true });
  } catch (error) {
    // Log error but don't crash the app
    console.error("Failed to save config:", error);
  }
}
