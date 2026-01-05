export type AppPhase =
  | "input"
  | "scanning"
  | "preview"
  | "fetching"
  | "summarizing"
  | "complete"
  | "error"

export interface GitRepo {
  path: string
  name: string
}

export interface CommitInfo {
  hash: string
  message: string
  author: string
  date: string
  diff: string
}

export interface RepoData {
  repo: GitRepo
  commits: CommitInfo[]
}

export interface AppState {
  phase: AppPhase
  directory: string
  outputPath: string
  daysToInclude: number
  repos: GitRepo[]
  repoData: RepoData[]
  outputFile: string
  error?: string
  progress?: {
    current: number
    total: number
    currentRepo?: string
  }
}

export interface AppActions {
  setDirectory: (dir: string) => void
  setOutputPath: (path: string) => void
  setDaysToInclude: (days: number) => void
  startScan: () => Promise<void>
  confirmPreview: () => Promise<void>
  goBack: () => void
  exit: () => void
}
