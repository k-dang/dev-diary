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
): Promise<string[]> {
  const directories: string[] = [];
  await scanDir(startPath, 0, maxDepth, directories);
  return directories;
}

async function scanDir(
  dir: string,
  currentDepth: number,
  maxDepth: number,
  results: string[],
): Promise<void> {
  if (currentDepth > maxDepth) {
    return;
  }

  try {
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
      await scanDir(fullPath, currentDepth + 1, maxDepth, results);
    }
  } catch {
    // Skip directories we can't read (permissions, etc.)
  }
}

export function getCommonStartPaths(): string[] {
  const home = homedir();
  return [
    home,
    join(home, "Documents"),
    join(home, "Projects"),
    join(home, "projects"),
    join(home, "dev"),
    join(home, "Development"),
    join(home, "code"),
    join(home, "Code"),
    join(home, "repos"),
    join(home, "workspace"),
  ];
}
