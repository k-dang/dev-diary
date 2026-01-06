import { useCallback, useState } from "react";
import { getAllRepoData } from "../services/git-data.ts";
import { scanForRepos } from "../services/git-scanner.ts";
import { generateSummary } from "../services/summarizer.ts";
import type { AppActions, AppState } from "../types/index.ts";
import {
  getConfig,
  getDefaultDays,
  getDefaultDirectory,
  getDefaultOutputPath,
} from "../utils/config.ts";
import { writeDevDiary } from "../utils/markdown.ts";

interface UseAppStateReturn {
  state: AppState;
  actions: AppActions;
}

export function useAppState(): UseAppStateReturn {
  const [state, setState] = useState<AppState>({
    phase: "input",
    directory: getDefaultDirectory(),
    outputPath: getDefaultOutputPath(),
    daysToInclude: getDefaultDays(),
    repos: [],
    repoData: [],
    outputFile: "",
  });

  const setDirectory = useCallback((dir: string) => {
    setState((prev) => ({ ...prev, directory: dir }));
  }, []);

  const setOutputPath = useCallback((path: string) => {
    setState((prev) => ({ ...prev, outputPath: path }));
  }, []);

  const setDaysToInclude = useCallback((days: number) => {
    setState((prev) => ({ ...prev, daysToInclude: days }));
  }, []);

  const startScan = useCallback(async () => {
    setState((prev) => ({ ...prev, phase: "scanning" }));

    try {
      const config = getConfig();
      const repos = await scanForRepos(state.directory, config.maxDepth);

      if (repos.length === 0) {
        setState((prev) => ({
          ...prev,
          phase: "error",
          error: "No git repositories found in the specified directory.",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        phase: "preview",
        repos,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        phase: "error",
        error:
          error instanceof Error ? error.message : "Failed to scan directory",
      }));
    }
  }, [state.directory]);

  const confirmPreview = useCallback(async () => {
    setState((prev) => ({
      ...prev,
      phase: "fetching",
      progress: { current: 0, total: state.repos.length },
    }));

    try {
      const repoData = await getAllRepoData(
        state.repos,
        state.daysToInclude,
        (current, total, repoName) => {
          setState((prev) => ({
            ...prev,
            progress: { current, total, currentRepo: repoName },
          }));
        },
      );

      if (repoData.length === 0) {
        setState((prev) => ({
          ...prev,
          phase: "error",
          error: "No commits found in the last day across any repositories.",
        }));
        return;
      }

      setState((prev) => ({
        ...prev,
        phase: "summarizing",
        repoData,
      }));

      const summary = await generateSummary(repoData);
      const outputFile = await writeDevDiary(summary, state.outputPath);

      setState((prev) => ({
        ...prev,
        phase: "complete",
        outputFile,
      }));
    } catch (error) {
      setState((prev) => ({
        ...prev,
        phase: "error",
        error:
          error instanceof Error ? error.message : "Failed to generate summary",
      }));
    }
  }, [state.repos, state.outputPath, state.daysToInclude]);

  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.phase) {
        case "preview":
          return { ...prev, phase: "input", repos: [] };
        case "error":
          return { ...prev, phase: "input", error: undefined };
        default:
          return prev;
      }
    });
  }, []);

  const exit = useCallback(() => {
    process.exit(0);
  }, []);

  return {
    state,
    actions: {
      setDirectory,
      setOutputPath,
      setDaysToInclude,
      startScan,
      confirmPreview,
      goBack,
      exit,
    },
  };
}
