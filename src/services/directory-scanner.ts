import { readdir } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

const IGNORED_DIRS = new Set([
  "node_modules",
  ".git",
  ".next",
  ".cache",
  "dist",
  "build",
  "vendor",
  "__pycache__",
  ".venv",
  "venv",
]);

export async function scanDirectories(
  startPath: string = homedir(),
  maxDepth: number = 3,
  includeStartPath: boolean = false,
): Promise<string[]> {
  const directories: string[] = [];
  await scanDir(startPath, 0, maxDepth, directories, includeStartPath);
  return directories;
}

async function scanDir(
  dir: string,
  currentDepth: number,
  maxDepth: number,
  results: string[],
  includeStartPath: boolean,
): Promise<void> {
  if (currentDepth > maxDepth) {
    return;
  }

  try {
    // Include start path if requested and at depth 0
    if (currentDepth === 0 && includeStartPath) {
      results.push(dir);
    }

    const entries = await readdir(dir, { withFileTypes: true });

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue;
      }

      const name = entry.name;

      // Skip hidden directories and ignored dirs
      if (name.startsWith(".") || IGNORED_DIRS.has(name)) {
        continue;
      }

      const fullPath = join(dir, name);
      results.push(fullPath);

      // Recursively scan subdirectory
      await scanDir(
        fullPath,
        currentDepth + 1,
        maxDepth,
        results,
        includeStartPath,
      );
    }
  } catch {
    // Skip directories we can't read (permissions, etc.)
  }
}
