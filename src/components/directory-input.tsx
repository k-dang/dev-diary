import { useKeyboard } from "@opentui/react";
import { useEffect, useState } from "react";
import { FuzzyFinder } from "./fuzzy-finder.tsx";

interface DirectoryInputProps {
  directory: string;
  outputPath: string;
  daysToInclude: number;
  onDirectoryChange: (value: string) => void;
  onOutputPathChange: (value: string) => void;
  onDaysChange: (days: number) => void;
  onSubmit: () => void;
  onOverlayVisibilityChange?: (isVisible: boolean) => void;
}

type FocusedField = "directory" | "output" | "days";

const DAYS_OPTIONS = [1, 3, 7, 14, 30];

const FIELD_FOCUS_BG = "#1a1a2e";

export function DirectoryInput({
  directory,
  outputPath,
  daysToInclude,
  onDirectoryChange,
  onOutputPathChange,
  onDaysChange,
  onSubmit,
  onOverlayVisibilityChange,
}: DirectoryInputProps) {
  const [focused, setFocused] = useState<FocusedField>("directory");
  const [showFinder, setShowFinder] = useState(false);
  const [finderTarget, setFinderTarget] = useState<FocusedField>("directory");

  useEffect(() => {
    onOverlayVisibilityChange?.(showFinder);
  }, [showFinder, onOverlayVisibilityChange]);

  useKeyboard((key) => {
    if (showFinder) return; // Let finder handle keys when open

    if (key.name === "up") {
      setFocused((prev) => {
        if (prev === "days") return "output";
        if (prev === "output") return "directory";
        return "directory";
      });
    } else if (key.name === "down") {
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
      <box border title="Dev Diary" padding={1} flexDirection="column" gap={1}>
        <text>
          <span fg="cyan">
            Scan Git repositories and generate BRAG and dev log entries
          </span>
        </text>

        <box
          border
          borderStyle="rounded"
          padding={1}
          height={5}
          backgroundColor={focused === "directory" ? FIELD_FOCUS_BG : undefined}
          title="Scan directory (Ctrl+F)"
        >
          <input
            placeholder="Enter directory path..."
            focused={focused === "directory"}
            value={directory}
            onInput={onDirectoryChange}
            style={{ focusedBackgroundColor: "transparent" }}
          />
        </box>

        <box
          border
          borderStyle="rounded"
          padding={1}
          height={5}
          backgroundColor={focused === "output" ? FIELD_FOCUS_BG : undefined}
          title="Output path (Ctrl+F)"
        >
          <input
            placeholder="Enter output directory..."
            focused={focused === "output"}
            value={outputPath}
            onInput={onOutputPathChange}
            style={{ focusedBackgroundColor: "transparent" }}
          />
        </box>

        <box
          border
          borderStyle="rounded"
          padding={1}
          backgroundColor={focused === "days" ? FIELD_FOCUS_BG : undefined}
          title="Days to include (←/→)"
        >
          <text>
            <span fg={focused === "days" ? "white" : "gray"}>
              {daysToInclude} {daysToInclude === 1 ? "day" : "days"}
            </span>
          </text>
        </box>

        <text>
          <span fg="#8693a7">
            [↑↓] Next/Prev field [Ctrl+D] Diaries [Enter] Start [Esc/Ctrl+C]
            Quit
          </span>
        </text>
      </box>
    </box>
  );
}
