import { mkdir, writeFile } from "fs/promises"
import { join } from "path"

function getDateString(): string {
  const now = new Date()
  const year = now.getFullYear()
  const month = String(now.getMonth() + 1).padStart(2, "0")
  const day = String(now.getDate()).padStart(2, "0")
  return `${year}-${month}-${day}`
}

export async function writeDevDiary(
  content: string,
  outputDir: string
): Promise<string> {
  // Ensure output directory exists
  await mkdir(outputDir, { recursive: true })

  const filename = `dev-diary-${getDateString()}.md`
  const filepath = join(outputDir, filename)

  await writeFile(filepath, content, "utf-8")

  return filepath
}
