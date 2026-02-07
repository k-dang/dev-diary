import { useEffect, useState } from "react";

interface ProgressViewProps {
  phase: "scanning" | "fetching" | "summarizing";
  progress?: {
    current: number;
    total: number;
    currentRepo?: string;
  };
}

const SPINNER_FRAMES = ["⠋", "⠙", "⠹", "⠸", "⠼", "⠴", "⠦", "⠧", "⠇", "⠏"];

export function ProgressView({ phase, progress }: ProgressViewProps) {
  const [spinnerIndex, setSpinnerIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setSpinnerIndex((prev) => (prev + 1) % SPINNER_FRAMES.length);
    }, 80);

    return () => clearInterval(interval);
  }, []);

  const spinner = SPINNER_FRAMES[spinnerIndex];

  const getMessage = () => {
    switch (phase) {
      case "scanning":
        return "Scanning for Git repositories...";
      case "fetching":
        if (progress) {
          return `Fetching git data... (${progress.current}/${progress.total})`;
        }
        return "Fetching git data...";
      case "summarizing":
        return "Generating Dev Diary with AI...";
      default:
        return "Processing...";
    }
  };

  return (
    <box flexDirection="column" padding={1}>
      <box border title="Dev Diary" padding={1} flexDirection="column" gap={1}>
        <text>
          <span fg="cyan">{spinner}</span>
          <span> {getMessage()}</span>
        </text>

        {phase === "fetching" && progress?.currentRepo && (
          <text>
            <span fg="gray">Current: </span>
            <span fg="yellow">{progress.currentRepo}</span>
          </text>
        )}

        {phase === "summarizing" && (
          <text>
            <span fg="gray">This may take a moment...</span>
          </text>
        )}
      </box>
    </box>
  );
}
