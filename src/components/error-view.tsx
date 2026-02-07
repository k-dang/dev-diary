interface ErrorViewProps {
  error: string;
}

export function ErrorView({ error }: ErrorViewProps) {
  return (
    <box flexDirection="column" padding={1}>
      <box
        border
        title="Dev Diary Error"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <text>
          <span fg="red">✗</span>
          <span> An error occurred</span>
        </text>

        <text>
          <span fg="red">{error}</span>
        </text>

        <text>
          <span fg="gray">[Esc] Back</span>
        </text>
      </box>
    </box>
  );
}
