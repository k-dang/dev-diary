import { useKeyboard, useTerminalDimensions } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";

interface FilePreviewProps {
  filePath: string;
}

export function FilePreview({ filePath }: FilePreviewProps) {
  const [content, setContent] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true);
  const [scrollOffset, setScrollOffset] = useState(0);
  const { height: rows } = useTerminalDimensions();

  // Calculate visible height (account for borders, padding, header, footer)
  const visibleHeight = Math.max(5, rows - 12);

  const lines = useMemo(() => content.split("\n"), [content]);
  const totalLines = lines.length;
  const maxScroll = Math.max(0, totalLines - visibleHeight);

  useEffect(() => {
    let cancelled = false;

    async function loadFile() {
      try {
        setIsLoading(true);
        setScrollOffset(0);
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

  useKeyboard((key) => {
    if (key.name === "up" || key.name === "k") {
      setScrollOffset((prev) => Math.max(0, prev - 1));
    } else if (key.name === "down" || key.name === "j") {
      setScrollOffset((prev) => Math.min(maxScroll, prev + 1));
    } else if (key.name === "pageup") {
      setScrollOffset((prev) => Math.max(0, prev - visibleHeight));
    } else if (key.name === "pagedown") {
      setScrollOffset((prev) => Math.min(maxScroll, prev + visibleHeight));
    } else if (key.name === "home" || key.sequence === "g") {
      setScrollOffset(0);
    } else if (key.name === "end" || key.sequence === "G") {
      setScrollOffset(maxScroll);
    }
  });

  const visibleLines = useMemo(() => {
    return lines.slice(scrollOffset, scrollOffset + visibleHeight);
  }, [lines, scrollOffset, visibleHeight]);

  const scrollPercent =
    maxScroll > 0 ? Math.round((scrollOffset / maxScroll) * 100) : 100;

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
          {!isLoading && totalLines > visibleHeight && (
            <text>
              <span fg="gray">
                Lines {scrollOffset + 1}-
                {Math.min(scrollOffset + visibleHeight, totalLines)} of{" "}
                {totalLines} ({scrollPercent}%)
              </span>
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
            visibleLines.map((line) => <text key={line}>{line || " "}</text>)
          )}
        </box>

        <box marginTop={1}>
          <text>
            <span fg="gray">
              [↑↓/jk] Scroll [PgUp/PgDn] Page [g/G] Top/Bottom
            </span>
          </text>
        </box>
      </box>
    </box>
  );
}
