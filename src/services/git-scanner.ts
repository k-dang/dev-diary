import { readdir, stat } from "fs/promises"
import { join, basename } from "path"
import type { GitRepo } from "../types/index.ts"

const IGNORED_DIRS = new Set(["node_modules", ".git", "vendor", "dist", "build", ".next"])

export async function scanForRepos(
  directory: string,
  maxDepth: number = 3
): Promise<GitRepo[]> {
  const repos: GitRepo[] = []
  await scanDirectory(directory, 0, maxDepth, repos)
  return repos
}

async function scanDirectory(
  dir: string,
  currentDepth: number,
  maxDepth: number,
  repos: GitRepo[]
): Promise<void> {
  if (currentDepth > maxDepth) {
    return
  }

  try {
    const entries = await readdir(dir, { withFileTypes: true })

    for (const entry of entries) {
      if (!entry.isDirectory()) {
        continue
      }

      const name = entry.name

      if (IGNORED_DIRS.has(name)) {
        continue
      }

      const fullPath = join(dir, name)

      if (name === ".git") {
        // Parent directory is a git repo
        repos.push({
          path: dir,
          name: basename(dir),
        })
        return // Don't descend into .git
      }

      // Check if this directory contains a .git folder
      const gitPath = join(fullPath, ".git")
      try {
        const gitStat = await stat(gitPath)
        if (gitStat.isDirectory()) {
          repos.push({
            path: fullPath,
            name: name,
          })
          // Don't descend into git repos
          continue
        }
      } catch {
        // .git doesn't exist, continue scanning
      }

      // Recursively scan subdirectory
      await scanDirectory(fullPath, currentDepth + 1, maxDepth, repos)
    }
  } catch (error) {
    // Skip directories we can't read
    console.error(`Cannot read directory: ${dir}`)
  }
}
