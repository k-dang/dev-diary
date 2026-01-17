#!/usr/bin/env bun
import { chmodSync, mkdirSync, writeFileSync } from "node:fs";
import { join } from "node:path";
import { $ } from "bun";

// Ensure dist directory exists
mkdirSync("dist", { recursive: true });

// Run bun build
console.log("📦 Building package...");
await $`bun build index.tsx --outdir dist --target bun --format esm --sourcemap --minify`;

// Read the built file
const distPath = join(process.cwd(), "dist", "index.js");
const content = await Bun.file(distPath).text();

// Prepend shebang
const withShebang = `#!/usr/bin/env bun\n${content}`;
writeFileSync(distPath, withShebang);

// Make executable (Unix-like systems)
try {
  chmodSync(distPath, 0o755);
  console.log("✓ Made dist/index.js executable");
} catch (e) {
  // Ignore on Windows
}

console.log("✓ Build complete: dist/index.js");
