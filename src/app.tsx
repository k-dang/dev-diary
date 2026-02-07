import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import { DiaryBrowser } from "./components/diary-browser.tsx";
import { DirectoryInput } from "./components/directory-input.tsx";
import { ErrorView } from "./components/error-view.tsx";
import { FilePreview } from "./components/file-preview.tsx";
import { ProgressView } from "./components/progress-view.tsx";
import { RepoList } from "./components/repo-list.tsx";
import { SuccessView } from "./components/success-view.tsx";
import { useAppState } from "./hooks/use-app-state.ts";

export function App() {
  const { state, actions } = useAppState();
  const [isInputOverlayOpen, setIsInputOverlayOpen] = useState(false);

  // Global shortcuts
  const diaryBrowserAllowedPhases = ["input"];
  const backAllowedPhases = [
    "preview",
    "file-preview",
    "diary-browser",
    "complete",
    "error",
  ];
  useKeyboard((key) => {
    if (key.ctrl && key.name === "c") {
      process.exit(0);
    }

    if (
      key.name === "escape" &&
      state.phase === "input" &&
      !isInputOverlayOpen
    ) {
      process.exit(0);
    }

    if (
      key.ctrl &&
      key.name === "d" &&
      diaryBrowserAllowedPhases.includes(state.phase)
    ) {
      actions.showDiaryBrowser();
      return;
    }

    if (key.name === "escape" && backAllowedPhases.includes(state.phase)) {
      actions.goBack();
    }
  });

  switch (state.phase) {
    case "input":
      return (
        <DirectoryInput
          directory={state.directory}
          outputPath={state.outputPath}
          daysToInclude={state.daysToInclude}
          onDirectoryChange={actions.setDirectory}
          onOutputPathChange={actions.setOutputPath}
          onDaysChange={actions.setDaysToInclude}
          onSubmit={actions.startScan}
          onOverlayVisibilityChange={setIsInputOverlayOpen}
        />
      );

    case "scanning":
      return <ProgressView phase="scanning" />;

    case "preview":
      return (
        <RepoList repos={state.repos} onConfirm={actions.confirmPreview} />
      );

    case "fetching":
      return <ProgressView phase="fetching" progress={state.progress} />;

    case "summarizing":
      return <ProgressView phase="summarizing" />;

    case "complete":
      return (
        <SuccessView
          outputFiles={state.outputFiles}
          onPreview={actions.showFilePreview}
        />
      );

    case "file-preview":
      return <FilePreview filePath={state.outputFile} />;

    case "diary-browser":
      return (
        <DiaryBrowser
          outputPath={state.outputPath}
          onSelect={actions.selectDiaryFile}
        />
      );

    case "error":
      return <ErrorView error={state.error ?? "Unknown error"} />;

    default:
      return <text>Unknown state</text>;
  }
}
