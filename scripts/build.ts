#!/usr/bin/env bun
import { chmodSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

// Run bun build
console.log("📦 Building package...");
await $`bun build index.tsx --outdir dist --target bun --format esm --sourcemap --minify`;

// Read the built file
const distPath = join(process.cwd(), "dist", "index.js");
const content = await Bun.file(distPath).text();

// Prepend shebang
const withShebang = `#!/usr/bin/env bun\n${content}`;
await Bun.write(distPath, withShebang);

// Make executable (Unix-like systems)
try {
  chmodSync(distPath, 0o755);
  console.log("✓ Made dist/index.js executable");
} catch {
  // Ignore on Windows
}

console.log("✓ Build complete: dist/index.js");
