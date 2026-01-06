import { useKeyboard } from "@opentui/react";
import type { GitRepo } from "../types/index.ts";

interface RepoListProps {
  repos: GitRepo[];
  onConfirm: () => void;
  onBack: () => void;
}

export function RepoList({ repos, onConfirm, onBack }: RepoListProps) {
  useKeyboard((key) => {
    if (key.name === "return") {
      onConfirm();
    } else if (key.name === "escape") {
      onBack();
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box
        border
        title={`Found ${repos.length} repositories`}
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <scrollbox height={15} focused>
          <box flexDirection="column">
            {repos.map((repo, index) => (
              <text key={`${repo.name}-${index}`}>
                <span fg="green"> </span>
                <span fg="white">{repo.name}</span>
                <span fg="gray"> - {repo.path}</span>
              </text>
            ))}
          </box>
        </scrollbox>

        <text>
          <span fg="gray">[Enter] Continue [Esc] Go back</span>
        </text>
      </box>
    </box>
  );
}
