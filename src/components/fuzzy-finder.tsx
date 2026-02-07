import { homedir } from "node:os";
import { useKeyboard } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import { scanDirectories } from "../services/directory-scanner.ts";
import { sortByFuzzyScore } from "../utils/fuzzy-match.ts";

interface FuzzyFinderProps {
  onSelect: (path: string) => void;
  onCancel: () => void;
}

export function FuzzyFinder({ onSelect, onCancel }: FuzzyFinderProps) {
  const [query, setQuery] = useState("");
  const [directories, setDirectories] = useState<string[]>([]);
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Scan directories on mount
  useEffect(() => {
    async function loadDirectories() {
      setIsLoading(true);
      const dirs = await scanDirectories(homedir(), 3);
      setDirectories(dirs);
      setIsLoading(false);
    }

    loadDirectories();
  }, []);

  // Filter directories based on query
  const filteredDirs = useMemo(() => {
    if (!query) {
      return directories.slice(0, 50); // Show first 50 when no query
    }
    return sortByFuzzyScore(directories, query, (d) => d)
      .slice(0, 50)
      .map(({ item }) => item);
  }, [directories, query]);

  const maxVisible = 10;
  const visibleDirs = filteredDirs.slice(0, maxVisible);

  useEffect(() => {
    setSelectedIndex((prev) =>
      visibleDirs.length === 0 ? 0 : Math.min(prev, visibleDirs.length - 1),
    );
  }, [visibleDirs.length]);

  useKeyboard((key) => {
    if (key.name === "escape") {
      onCancel();
    } else if (key.name === "return") {
      const selected = visibleDirs[selectedIndex];
      if (selected) {
        onSelect(selected);
      }
    } else if (key.name === "up") {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.name === "down") {
      setSelectedIndex((prev) =>
        visibleDirs.length === 0
          ? 0
          : Math.min(visibleDirs.length - 1, prev + 1),
      );
    } else if (key.name === "backspace") {
      setQuery((prev) => prev.slice(0, -1));
      setSelectedIndex(0);
    } else if (
      key.sequence &&
      key.sequence.length === 1 &&
      !key.ctrl &&
      !key.meta
    ) {
      setQuery((prev) => prev + key.sequence);
      setSelectedIndex(0);
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box
        border
        title="Dev Diary Directory Picker"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        {isLoading ? (
          <text>
            <span fg="cyan">Scanning directories...</span>
          </text>
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
                {filteredDirs.length === 0 ? (
                  <text>
                    <span fg="gray">No matching directories</span>
                  </text>
                ) : (
                  visibleDirs.map((dir, index) => (
                    <text key={dir}>
                      <span fg={index === selectedIndex ? "cyan" : "gray"}>
                        {index === selectedIndex ? "> " : "  "}
                      </span>
                      <span fg={index === selectedIndex ? "white" : "gray"}>
                        {dir}
                      </span>
                    </text>
                  ))
                )}
              </box>
            </scrollbox>

            <text>
              <span fg="gray">
                {filteredDirs.length} results | [↑↓] Navigate [Enter] Select
                [Esc] Cancel
              </span>
            </text>
          </>
        )}
      </box>
    </box>
  );
}
