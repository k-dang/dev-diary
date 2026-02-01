interface ErrorViewProps {
  error: string;
}

export function ErrorView({ error }: ErrorViewProps) {
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
      </box>
    </box>
  );
}
