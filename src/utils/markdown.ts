import { join } from "node:path";

function getDateString(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export async function writeDevDiary(
  content: string,
  outputDir: string,
): Promise<string> {
  const filename = `dev-diary-${getDateString()}.md`;
  const filepath = join(outputDir, filename);

  // Write file, creating parent directories if needed
  await Bun.write(filepath, content, { createPath: true });

  return filepath;
}
