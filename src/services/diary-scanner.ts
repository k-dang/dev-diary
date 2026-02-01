import { join } from "node:path";
import { Glob } from "bun";

export interface DiaryFile {
  path: string;
  filename: string;
  date: string;
  displayDate: string;
}

const DIARY_FILENAME_REGEX = /dev-(?:diary|log)-(\d{4}-\d{2}-\d{2})\.md/;

function formatDisplayDate(dateStr: string): string {
  const date = new Date(`${dateStr}T00:00:00`);
  return date.toLocaleDateString("en-US", {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export async function scanDiaryFiles(outputDir: string): Promise<DiaryFile[]> {
  const diaryFiles: DiaryFile[] = [];

  try {
    const patterns = ["dev-diary-*.md", "dev-log-*.md"];
    for (const pattern of patterns) {
      const glob = new Glob(pattern);
      for await (const filename of glob.scan({ cwd: outputDir })) {
        const match = DIARY_FILENAME_REGEX.exec(filename);
        if (match?.[1]) {
          diaryFiles.push({
            path: join(outputDir, filename),
            filename,
            date: match[1],
            displayDate: formatDisplayDate(match[1]),
          });
        }
      }
    }
  } catch {
    // Directory doesn't exist or can't be read - return empty array
    return [];
  }

  // Sort by date descending (newest first)
  diaryFiles.sort((a, b) => b.date.localeCompare(a.date));

  return diaryFiles;
}
