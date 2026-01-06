import { useKeyboard } from "@opentui/react";

interface SuccessViewProps {
  outputFile: string;
  onExit: () => void;
}

export function SuccessView({ outputFile, onExit }: SuccessViewProps) {
  useKeyboard((key) => {
    if (key.name === "return") {
      onExit();
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

        <text>
          <span fg="gray">[Enter] Exit</span>
        </text>
      </box>
    </box>
  );
}
