import { useKeyboard } from "@opentui/react";
import { useEffect, useMemo, useState } from "react";
import {
  getCommonStartPaths,
  scanDirectories,
} from "../services/directory-scanner.ts";
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
      const startPaths = getCommonStartPaths();
      const allDirs: string[] = [];

      // Scan each common starting path
      for (const startPath of startPaths) {
        try {
          const dirs = await scanDirectories(startPath, 2);
          // Only add the start path if scanning succeeded (means it exists)
          allDirs.push(startPath);
          allDirs.push(...dirs);
        } catch {
          // Skip paths that don't exist
        }
      }

      // Remove duplicates and sort
      const uniqueDirs = [...new Set(allDirs)].sort();
      setDirectories(uniqueDirs);
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

  // Reset selection when filter changes
  useEffect(() => {
    setSelectedIndex(0);
  }, []);
  // query

  useKeyboard((key) => {
    if (key.name === "escape") {
      onCancel();
    } else if (key.name === "return") {
      const selected = filteredDirs[selectedIndex];
      if (selected) {
        onSelect(selected);
      }
    } else if (key.name === "up") {
      setSelectedIndex((prev) => Math.max(0, prev - 1));
    } else if (key.name === "down") {
      setSelectedIndex((prev) => Math.min(filteredDirs.length - 1, prev + 1));
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
        title="Select Directory"
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
                  filteredDirs.slice(0, maxVisible).map((dir, index) => (
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
