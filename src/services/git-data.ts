import type { GitRepo, CommitInfo, RepoData } from "../types/index.ts"

async function runGitCommand(repoPath: string, args: string[]): Promise<string> {
  const proc = Bun.spawn(["git", ...args], {
    cwd: repoPath,
    stdout: "pipe",
    stderr: "pipe",
  })

  const output = await new Response(proc.stdout).text()
  await proc.exited

  return output.trim()
}

export async function getCommitsFromLastDays(
  repoPath: string,
  days: number = 1
): Promise<Omit<CommitInfo, "diff">[]> {
  const format = "%H|%s|%an|%ai"
  const output = await runGitCommand(repoPath, [
    "log",
    `--since=${days} days ago`,
    `--format=${format}`,
  ])

  if (!output) {
    return []
  }

  const commits: Omit<CommitInfo, "diff">[] = []

  for (const line of output.split("\n")) {
    if (!line.trim()) continue

    const parts = line.split("|")
    if (parts.length >= 4) {
      commits.push({
        hash: parts[0] ?? "",
        message: parts[1] ?? "",
        author: parts[2] ?? "",
        date: parts[3] ?? "",
      })
    }
  }

  return commits
}

export async function getCommitDiff(repoPath: string, hash: string): Promise<string> {
  const output = await runGitCommand(repoPath, ["show", "--format=", hash])
  return output
}

export async function getRepoData(
  repo: GitRepo,
  days: number = 1
): Promise<RepoData> {
  const commitsWithoutDiff = await getCommitsFromLastDays(repo.path, days)

  const commits: CommitInfo[] = await Promise.all(
    commitsWithoutDiff.map(async (commit) => {
      const diff = await getCommitDiff(repo.path, commit.hash)
      return {
        ...commit,
        diff,
      }
    })
  )

  return {
    repo,
    commits,
  }
}

export async function getAllRepoData(
  repos: GitRepo[],
  days: number = 1,
  onProgress?: (current: number, total: number, repoName: string) => void
): Promise<RepoData[]> {
  const results: RepoData[] = []

  for (let i = 0; i < repos.length; i++) {
    const repo = repos[i]
    if (!repo) continue

    onProgress?.(i + 1, repos.length, repo.name)
    const data = await getRepoData(repo, days)

    // Only include repos with commits
    if (data.commits.length > 0) {
      results.push(data)
    }
  }

  return results
}
