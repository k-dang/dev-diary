import { useEffect } from "react"
import { useAppState } from "./hooks/use-app-state.ts"
import { DirectoryInput } from "./components/directory-input.tsx"
import { RepoList } from "./components/repo-list.tsx"
import { ProgressView } from "./components/progress-view.tsx"
import { SuccessView } from "./components/success-view.tsx"
import { ErrorView } from "./components/error-view.tsx"

export function App() {
  const { state, actions } = useAppState()

  // Handle async state transitions
  useEffect(() => {
    if (state.phase === "scanning") {
      // Scanning is triggered by startScan action
    }
  }, [state.phase])

  switch (state.phase) {
    case "input":
      return (
        <DirectoryInput
          directory={state.directory}
          outputPath={state.outputPath}
          onDirectoryChange={actions.setDirectory}
          onOutputPathChange={actions.setOutputPath}
          onSubmit={actions.startScan}
        />
      )

    case "scanning":
      return <ProgressView phase="scanning" />

    case "preview":
      return (
        <RepoList
          repos={state.repos}
          onConfirm={actions.confirmPreview}
          onBack={actions.goBack}
        />
      )

    case "fetching":
      return <ProgressView phase="fetching" progress={state.progress} />

    case "summarizing":
      return <ProgressView phase="summarizing" />

    case "complete":
      return <SuccessView outputFile={state.outputFile} onExit={actions.exit} />

    case "error":
      return (
        <ErrorView
          error={state.error ?? "Unknown error"}
          onBack={actions.goBack}
          onExit={actions.exit}
        />
      )

    default:
      return <text>Unknown state</text>
  }
}
