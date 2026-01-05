import { useState } from "react"
import { useKeyboard } from "@opentui/react"
import { FuzzyFinder } from "./fuzzy-finder.tsx"

interface DirectoryInputProps {
  directory: string
  outputPath: string
  onDirectoryChange: (value: string) => void
  onOutputPathChange: (value: string) => void
  onSubmit: () => void
}

type FocusedField = "directory" | "output"

export function DirectoryInput({
  directory,
  outputPath,
  onDirectoryChange,
  onOutputPathChange,
  onSubmit,
}: DirectoryInputProps) {
  const [focused, setFocused] = useState<FocusedField>("directory")
  const [showFinder, setShowFinder] = useState(false)
  const [finderTarget, setFinderTarget] = useState<FocusedField>("directory")

  useKeyboard((key) => {
    if (showFinder) return // Let finder handle keys when open

    if (key.name === "tab") {
      setFocused((prev) => (prev === "directory" ? "output" : "directory"))
    } else if (key.name === "return") {
      onSubmit()
    } else if (key.ctrl && key.name === "f") {
      // Open fuzzy finder for currently focused field
      setFinderTarget(focused)
      setShowFinder(true)
    }
  })

  const handleFinderSelect = (path: string) => {
    if (finderTarget === "directory") {
      onDirectoryChange(path)
    } else {
      onOutputPathChange(path)
    }
    setShowFinder(false)
  }

  const handleFinderCancel = () => {
    setShowFinder(false)
  }

  if (showFinder) {
    return <FuzzyFinder onSelect={handleFinderSelect} onCancel={handleFinderCancel} />
  }

  return (
    <box flexDirection="column" padding={1}>
      <box border title="Daily Summary" padding={1} flexDirection="column" gap={1}>
        <text>
          <span fg="cyan">Scan your git repositories and generate a dev diary</span>
        </text>

        <box flexDirection="column" gap={1}>
          <text>
            Scan directory: <span fg="gray">(Ctrl+F to browse)</span>
          </text>
          <box border backgroundColor={focused === "directory" ? "#1a1a2e" : undefined}>
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
          <box border backgroundColor={focused === "output" ? "#1a1a2e" : undefined}>
            <input
              placeholder="Enter output directory..."
              focused={focused === "output"}
              value={outputPath}
              onInput={onOutputPathChange}
            />
          </box>
        </box>

        <text>
          <span fg="gray">[Tab] Switch fields  [Ctrl+F] Browse  [Enter] Start scan</span>
        </text>
      </box>
    </box>
  )
}
