import { useKeyboard } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import { type DiaryFile, scanDiaryFiles } from "../services/diary-scanner.ts";
import { sortByFuzzyScore } from "../utils/fuzzy-match.ts";

interface DiaryBrowserProps {
  outputPath: string;
  onSelect: (filePath: string) => void;
}

export function DiaryBrowser({ outputPath, onSelect }: DiaryBrowserProps) {
  const [query, setQuery] = useState("");
  const [diaryFiles, setDiaryFiles] = useState<DiaryFile[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function loadDiaries() {
      setIsLoading(true);
      const files = await scanDiaryFiles(outputPath);
      setDiaryFiles(files);
      setIsLoading(false);
    }

    loadDiaries();
  }, [outputPath]);

  const filteredFiles = useMemo(() => {
    if (!query) {
      return diaryFiles;
    }
    return sortByFuzzyScore(
      diaryFiles,
      query,
      (f) => `${f.filename} ${f.displayDate}`,
    ).map(({ item }) => item);
  }, [diaryFiles, query]);

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, []);
  // query

  useKeyboard((key) => {
    if (key.name === "return") {
      const selected = filteredFiles[selectedIndex];
      if (selected) {
        onSelect(selected.path);
      }
    } else if (key.name === "up") {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.name === "down") {
      setSelectedIndex((prev) => Math.min(filteredFiles.length - 1, prev + 1));
    } else if (key.name === "backspace") {
      setQuery((prev) => prev.slice(0, -1));
    } else if (
      key.sequence &&
      key.sequence.length === 1 &&
      !key.ctrl &&
      !key.meta
    ) {
      setQuery((prev) => prev + key.sequence);
    }
  });

  const maxVisible = 10;

  return (
    <box flexDirection="column" padding={1}>
      <box
        border
        title="Dev Summary Browser"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        {isLoading ? (
          <text>
            <span fg="cyan">Scanning for diary files...</span>
          </text>
        ) : diaryFiles.length === 0 ? (
          <>
            <text>
              <span fg="yellow">No dev summary files found</span>
            </text>
            <text>
              <span fg="gray">
                Generate a summary first, then use Ctrl+D to browse.
              </span>
            </text>
            <text>
              <span fg="gray">Looking in: {outputPath}</span>
            </text>
          </>
        ) : (
          <>
            <box flexDirection="row" gap={1}>
              <text>Filter:</text>
              <box border backgroundColor="#1a1a2e" width={40}>
                <text>{query || " "}</text>
              </box>
            </box>

            <scrollbox height={maxVisible} focused>
              <box flexDirection="column">
                {filteredFiles.length === 0 ? (
                  <text>
                    <span fg="gray">No matching diary files</span>
                  </text>
                ) : (
                  filteredFiles.slice(0, maxVisible).map((file, index) => (
                    <text key={file.path}>
                      <span fg={index === selectedIndex ? "cyan" : "gray"}>
                        {index === selectedIndex ? "> " : "  "}
                      </span>
                      <span fg={index === selectedIndex ? "white" : "gray"}>
                        {file.displayDate}
                      </span>
                      <span fg="gray"> - </span>
                      <span fg={index === selectedIndex ? "cyan" : "gray"}>
                        {file.filename}
                      </span>
                    </text>
                  ))
                )}
              </box>
            </scrollbox>

            <text>
              <span fg="gray">
                {filteredFiles.length}{" "}
                {filteredFiles.length === 1 ? "file" : "files"} | [↑↓] Navigate
                [Enter] Preview
              </span>
            </text>
          </>
        )}
      </box>
    </box>
  );
}
