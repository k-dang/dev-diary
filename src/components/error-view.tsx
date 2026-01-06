import { useKeyboard } from "@opentui/react";

interface ErrorViewProps {
  error: string;
  onBack: () => void;
  onExit: () => void;
}

export function ErrorView({ error, onBack, onExit }: ErrorViewProps) {
  useKeyboard((key) => {
    if (key.name === "escape") {
      onBack();
    } else if (key.name === "return") {
      onExit();
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box border title="Error" padding={1} flexDirection="column" gap={1}>
        <text>
          <span fg="red">✗</span>
          <span> An error occurred</span>
        </text>

        <text>
          <span fg="red">{error}</span>
        </text>

        <text>
          <span fg="gray">[Esc] Go back [Enter] Exit</span>
        </text>
      </box>
    </box>
  );
}
