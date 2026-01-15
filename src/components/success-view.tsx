import { useKeyboard } from "@opentui/react";

interface SuccessViewProps {
  outputFile: string;
  onPreview: () => void;
}

export function SuccessView({ outputFile, onPreview }: SuccessViewProps) {
  useKeyboard((key) => {
    if (key.name === "p") {
      onPreview();
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box border title="Complete" padding={1} flexDirection="column" gap={1}>
        <text>
          <span fg="green">✓</span>
          <span> Dev diary generated successfully!</span>
        </text>

        <text>
          <span fg="gray">Saved to: </span>
          <span fg="cyan">{outputFile}</span>
        </text>

        <box flexDirection="column" marginTop={1}>
          <text>
            <span fg="gray">[P] Preview file</span>
          </text>
        </box>
      </box>
    </box>
  );
}
