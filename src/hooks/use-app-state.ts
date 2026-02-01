import { homedir } from "node:os";
import { join } from "node:path";
import { useCallback, useEffect, useState } from "react";
import { getAllRepoData } from "../services/git-data.ts";
import { scanForRepos } from "../services/git-scanner.ts";
import { generateSummaries } from "../services/summarizer.ts";
import type { AppActions, AppState } from "../types/index.ts";
import {
  getConfig,
  getDefaultDays,
  getDefaultDirectory,
  getDefaultOutputPath,
} from "../utils/config.ts";
import { writeDevDiary } from "../utils/markdown.ts";
import { savePersistedConfig } from "../utils/persistence.ts";

interface UseAppStateReturn {
  state: AppState;
  actions: AppActions;
}

// Fallback values for initial state (before persisted config loads)
function getFallbackDirectory(): string {
  return process.cwd();
}

function getFallbackOutputPath(): string {
  return (
    process.env.DAILY_SUMMARY_OUTPUT ||
    join(homedir(), "Documents", "dev-diary")
  );
}

function getFallbackDays(): number {
  return parseInt(process.env.DAILY_SUMMARY_DAYS || "1", 10);
}

export function useAppState(): UseAppStateReturn {
  const [state, setState] = useState<AppState>({
    phase: "input",
    directory: getFallbackDirectory(),
    outputPath: getFallbackOutputPath(),
    daysToInclude: getFallbackDays(),
    repos: [],
    repoData: [],
    outputFile: "",
    outputFiles: { brag: "", devLog: "" },
  });

  // Load persisted defaults asynchronously after mount
  useEffect(() => {
    async function loadDefaults() {
      try {
        const [directory, outputPath, daysToInclude] = await Promise.all([
          getDefaultDirectory(),
          getDefaultOutputPath(),
          getDefaultDays(),
        ]);

        setState((prev) => ({
          ...prev,
          directory,
          outputPath,
          daysToInclude,
        }));
      } catch (error) {
        // If loading fails, keep fallback values
        console.error("Failed to load persisted config:", error);
      }
    }

    loadDefaults();
  }, []);

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
    // Save user selections for next time
    await savePersistedConfig({
      directory: state.directory,
      outputPath: state.outputPath,
      daysToInclude: state.daysToInclude,
    });

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
  }, [state.directory, state.outputPath, state.daysToInclude]);

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

      const summaries = await generateSummaries(repoData);
      const [bragFile, devLogFile] = await Promise.all([
        writeDevDiary(summaries.brag, state.outputPath, "brag"),
        writeDevDiary(summaries.devLog, state.outputPath, "dev-log"),
      ]);

      setState((prev) => ({
        ...prev,
        phase: "complete",
        outputFile: bragFile,
        outputFiles: { brag: bragFile, devLog: devLogFile },
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

  const showFilePreview = useCallback((filePath: string) => {
    setState((prev) => ({
      ...prev,
      outputFile: filePath,
      phase: "file-preview",
      previousPhase: prev.phase,
    }));
  }, []);

  const showDiaryBrowser = useCallback(() => {
    setState((prev) => ({
      ...prev,
      phase: "diary-browser",
      previousPhase: prev.phase,
    }));
  }, []);

  const selectDiaryFile = useCallback((path: string) => {
    setState((prev) => ({
      ...prev,
      outputFile: path,
      phase: "file-preview",
      previousPhase: "diary-browser",
    }));
  }, []);

  const goBack = useCallback(() => {
    setState((prev) => {
      switch (prev.phase) {
        case "preview":
          return { ...prev, phase: "input", repos: [] };
        case "file-preview":
          // Return to diary browser if that's where we came from
          if (prev.previousPhase === "diary-browser") {
            return {
              ...prev,
              phase: "diary-browser",
              previousPhase: undefined,
            };
          }
          return { ...prev, phase: "complete", previousPhase: undefined };
        case "diary-browser":
          // Return to wherever we came from
          return {
            ...prev,
            phase: prev.previousPhase ?? "input",
            previousPhase: undefined,
          };
        case "complete":
          return { ...prev, phase: "input" };
        case "error":
          return { ...prev, phase: "input", error: undefined };
        default:
          return prev;
      }
    });
  }, []);

  return {
    state,
    actions: {
      setDirectory,
      setOutputPath,
      setDaysToInclude,
      startScan,
      confirmPreview,
      showFilePreview,
      showDiaryBrowser,
      selectDiaryFile,
      goBack,
    },
  };
}
