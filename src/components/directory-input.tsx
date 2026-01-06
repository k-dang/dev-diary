import { useState } from "react";
import { useKeyboard } from "@opentui/react";
import { FuzzyFinder } from "./fuzzy-finder.tsx";

interface DirectoryInputProps {
  directory: string;
  outputPath: string;
  daysToInclude: number;
  onDirectoryChange: (value: string) => void;
  onOutputPathChange: (value: string) => void;
  onDaysChange: (days: number) => void;
  onSubmit: () => void;
}

type FocusedField = "directory" | "output" | "days";

const DAYS_OPTIONS = [1, 3, 7, 14, 30];

export function DirectoryInput({
  directory,
  outputPath,
  daysToInclude,
  onDirectoryChange,
  onOutputPathChange,
  onDaysChange,
  onSubmit,
}: DirectoryInputProps) {
  const [focused, setFocused] = useState<FocusedField>("directory");
  const [showFinder, setShowFinder] = useState(false);
  const [finderTarget, setFinderTarget] = useState<FocusedField>("directory");

  useKeyboard((key) => {
    if (showFinder) return; // Let finder handle keys when open

    if (key.name === "tab") {
      setFocused((prev) => {
        if (prev === "directory") return "output";
        if (prev === "output") return "days";
        return "directory";
      });
    } else if (key.name === "return") {
      onSubmit();
    } else if (key.ctrl && key.name === "f") {
      // Open fuzzy finder for currently focused field (not for days)
      if (focused !== "days") {
        setFinderTarget(focused);
        setShowFinder(true);
      }
    } else if (
      focused === "days" &&
      (key.name === "left" || key.name === "right")
    ) {
      const currentIndex = DAYS_OPTIONS.indexOf(daysToInclude);
      const validIndex = currentIndex === -1 ? 0 : currentIndex;
      if (key.name === "left" && validIndex > 0) {
        const newValue = DAYS_OPTIONS[validIndex - 1];
        if (newValue !== undefined) onDaysChange(newValue);
      } else if (key.name === "right" && validIndex < DAYS_OPTIONS.length - 1) {
        const newValue = DAYS_OPTIONS[validIndex + 1];
        if (newValue !== undefined) onDaysChange(newValue);
      }
    }
  });

  const handleFinderSelect = (path: string) => {
    if (finderTarget === "directory") {
      onDirectoryChange(path);
    } else {
      onOutputPathChange(path);
    }
    setShowFinder(false);
  };

  const handleFinderCancel = () => {
    setShowFinder(false);
  };

  if (showFinder) {
    return (
      <FuzzyFinder
        onSelect={handleFinderSelect}
        onCancel={handleFinderCancel}
      />
    );
  }

  return (
    <box flexDirection="column" padding={1}>
      <box
        border
        title="Daily Summary"
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <text>
          <span fg="cyan">
            Scan your git repositories and generate a dev diary
          </span>
        </text>

        <box flexDirection="column" gap={1}>
          <text>
            Scan directory: <span fg="gray">(Ctrl+F to browse)</span>
          </text>
          <box
            border
            backgroundColor={focused === "directory" ? "#1a1a2e" : undefined}
          >
            <input
              placeholder="Enter directory path..."
              focused={focused === "directory"}
              value={directory}
              onInput={onDirectoryChange}
            />
          </box>
        </box>

        <box flexDirection="column" gap={1}>
          <text>
            Output path: <span fg="gray">(Ctrl+F to browse)</span>
          </text>
          <box
            border
            backgroundColor={focused === "output" ? "#1a1a2e" : undefined}
          >
            <input
              placeholder="Enter output directory..."
              focused={focused === "output"}
              value={outputPath}
              onInput={onOutputPathChange}
            />
          </box>
        </box>

        <box flexDirection="column" gap={1}>
          <text>
            Days to include: <span fg="gray">(←/→ to change)</span>
          </text>
          <box
            border
            backgroundColor={focused === "days" ? "#1a1a2e" : undefined}
            padding={1}
          >
            <text>
              <span fg={focused === "days" ? "cyan" : "gray"}>◀</span>
              {"  "}
              <span fg={focused === "days" ? "white" : "gray"}>
                {daysToInclude} {daysToInclude === 1 ? "day" : "days"}
              </span>
              {"  "}
              <span fg={focused === "days" ? "cyan" : "gray"}>▶</span>
            </text>
          </box>
        </box>

        <text>
          <span fg="gray">
            [Tab] Switch fields [←/→] Days [Ctrl+F] Browse [Enter] Start
          </span>
        </text>
      </box>
    </box>
  );
}
