import { useKeyboard } from "@opentui/react";
import { useState } from "react";
import type { SummaryOutputs, SummaryStyle } from "../types/index.ts";

interface SuccessViewProps {
  outputFiles: SummaryOutputs;
  onPreview: (filePath: string) => void;
}

export function SuccessView({ outputFiles, onPreview }: SuccessViewProps) {
  const [selectedStyle, setSelectedStyle] = useState<SummaryStyle>("brag");

  useKeyboard((key) => {
    if (key.name === "up" || key.name === "down") {
      setSelectedStyle((prev) => (prev === "brag" ? "dev-log" : "brag"));
    }
    if (key.name === "p") {
      const filePath =
        selectedStyle === "brag" ? outputFiles.brag : outputFiles.devLog;
      onPreview(filePath);
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box border title="Complete" padding={1} flexDirection="column" gap={1}>
        <text>
          <span fg="green">✓</span>
          <span> Dev summaries generated successfully!</span>
        </text>

        <text>
          <span fg="gray">BRAG: </span>
          <span fg={selectedStyle === "brag" ? "cyan" : "gray"}>
            {outputFiles.brag}
          </span>
        </text>

        <text>
          <span fg="gray">Dev log: </span>
          <span fg={selectedStyle === "dev-log" ? "cyan" : "gray"}>
            {outputFiles.devLog}
          </span>
        </text>

        <box flexDirection="column" marginTop={1}>
          <text>
            <span fg="gray">[↑/↓] Toggle [P] Preview</span>
          </text>
        </box>
      </box>
    </box>
  );
}
