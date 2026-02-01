export type AppPhase =
  | "input"
  | "scanning"
  | "preview"
  | "fetching"
  | "summarizing"
  | "complete"
  | "file-preview"
  | "diary-browser"
  | "error";

export interface GitRepo {
  path: string;
  name: string;
}

export interface CommitInfo {
  hash: string;
  message: string;
  author: string;
  date: string;
  diff: string;
}

export interface RepoData {
  repo: GitRepo;
  commits: CommitInfo[];
}

export type SummaryStyle = "brag" | "dev-log";

export interface SummaryOutputs {
  brag: string;
  devLog: string;
}

export interface AppState {
  phase: AppPhase;
  previousPhase?: AppPhase;
  directory: string;
  outputPath: string;
  daysToInclude: number;
  repos: GitRepo[];
  repoData: RepoData[];
  outputFile: string;
  outputFiles: SummaryOutputs;
  error?: string;
  progress?: {
    current: number;
    total: number;
    currentRepo?: string;
  };
}

export interface AppActions {
  setDirectory: (dir: string) => void;
  setOutputPath: (path: string) => void;
  setDaysToInclude: (days: number) => void;
  startScan: () => Promise<void>;
  confirmPreview: () => Promise<void>;
  showFilePreview: (filePath: string) => void;
  showDiaryBrowser: () => void;
  selectDiaryFile: (path: string) => void;
  goBack: () => void;
}
