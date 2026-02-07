import { useKeyboard } from "@opentui/react";
import type { GitRepo } from "../types/index.ts";

interface RepoListProps {
  repos: GitRepo[];
  onConfirm: () => void;
}

export function RepoList({ repos, onConfirm }: RepoListProps) {
  useKeyboard((key) => {
    if (key.name === "return") {
      onConfirm();
    }
  });

  return (
    <box flexDirection="column" padding={1}>
      <box
        border
        title={`Dev Diary Repositories (${repos.length})`}
        padding={1}
        flexDirection="column"
        gap={1}
      >
        <scrollbox height={15} focused>
          <box flexDirection="column">
            {repos.map((repo, index) => (
              <text key={`${repo.name}-${index}`}>
                <span fg="green">• </span>
                <span fg="white">{repo.name}</span>
                <span fg="gray"> - {repo.path}</span>
              </text>
            ))}
          </box>
        </scrollbox>

        <text>
          <span fg="gray">[Enter] Continue [Esc] Back</span>
        </text>
      </box>
    </box>
  );
}
