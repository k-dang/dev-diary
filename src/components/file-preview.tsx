import { RGBA, SyntaxStyle } from "@opentui/core";
import { useTerminalDimensions } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";

const markdownSyntaxStyle = SyntaxStyle.fromStyles({
  "markup.heading.1": { fg: RGBA.fromHex("#7dd3fc"), bold: true },
  "markup.heading.2": { fg: RGBA.fromHex("#93c5fd"), bold: true },
  "markup.heading.3": { fg: RGBA.fromHex("#a5b4fc"), bold: true },
  "markup.list": { fg: RGBA.fromHex("#c4b5fd") },
  "markup.raw": { fg: RGBA.fromHex("#f9a8d4") },
  default: { fg: RGBA.fromHex("#e5e7eb") },
});

interface FilePreviewProps {
  filePath: string;
}

export function FilePreview({ filePath }: FilePreviewProps) {
  const [content, setContent] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const { height: rows } = useTerminalDimensions();

  // Calculate visible height (account for borders, padding, header, footer)
  const visibleHeight = Math.max(5, rows - 12);

  const totalLines = useMemo(() => {
    if (!content) {
      return 0;
    }
    return content.split("\n").length;
  }, [content]);

  useEffect(() => {
    let cancelled = false;

    async function loadFile() {
      try {
        setIsLoading(true);
        const file = Bun.file(filePath);
        const text = await file.text();
        if (!cancelled) {
          setContent(text);
          setIsLoading(false);
        }
      } catch (error) {
        if (!cancelled) {
          setContent(
            `Error reading file: ${error instanceof Error ? error.message : "Unknown error"}`,
          );
          setIsLoading(false);
        }
      }
    }

    loadFile();

    return () => {
      cancelled = true;
    };
  }, [filePath]);

  return (
    <box flexDirection="column" padding={1}>
      <box
        border
        title="File Preview"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <box flexDirection="row" justifyContent="space-between">
          <text>
            <span fg="gray">File: </span>
            <span fg="cyan">{filePath}</span>
          </text>
          {!isLoading && (
            <text>
              <span fg="gray">{totalLines} lines</span>
            </text>
          )}
        </box>

        <box
          border
          borderStyle="single"
          padding={1}
          flexDirection="column"
          marginTop={1}
          height={visibleHeight + 2}
        >
          {isLoading ? (
            <text>
              <span fg="gray">Loading file...</span>
            </text>
          ) : (
            <scrollbox focused height={visibleHeight}>
              <markdown content={content} syntaxStyle={markdownSyntaxStyle} />
            </scrollbox>
          )}
        </box>

        <box marginTop={1}>
          <text>
            <span fg="gray">[↑↓/PgUp/PgDn] Scroll [Esc] Back</span>
          </text>
        </box>
      </box>
    </box>
  );
}
