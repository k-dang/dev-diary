import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";

interface FilePreviewProps {
  filePath: string;
  onBack: () => void;
}

export function FilePreview({ filePath, onBack }: FilePreviewProps) {
  const [content, setContent] = useState<string>("Loading...");
  const [isLoading, setIsLoading] = useState(true);

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

  useKeyboard((key) => {
    if (key.name === "escape" || key.name === "q" || key.name === "b") {
      onBack();
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box
        border
        title="File Preview"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <text>
          <span fg="gray">File: </span>
          <span fg="cyan">{filePath}</span>
        </text>

        <box
          border
          borderStyle="single"
          padding={1}
          flexDirection="column"
          marginTop={1}
        >
          <text>
            {isLoading ? (
              <span fg="gray">Loading file...</span>
            ) : (
              content
            )}
          </text>
        </box>

        <box marginTop={1}>
          <text>
            <span fg="gray">[B] Back [Q/Esc] Back</span>
          </text>
        </box>
      </box>
    </box>
  );
}
