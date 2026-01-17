#!/usr/bin/env bun
import { mkdirSync } from "node:fs";

const targets = [
  { name: "windows-x64", target: "bun-windows-x64", ext: ".exe" },
  { name: "linux-x64", target: "bun-linux-x64", ext: "" },
  { name: "darwin-arm64", target: "bun-darwin-arm64", ext: "" },
  { name: "darwin-x64", target: "bun-darwin-x64", ext: "" },
] as const;

type Target = (typeof targets)[number]["name"];

function getCurrentPlatformTarget(): Target {
  const platform = process.platform;
  const arch = process.arch;

  if (platform === "win32" && arch === "x64") return "windows-x64";
  if (platform === "linux" && arch === "x64") return "linux-x64";
  if (platform === "darwin" && arch === "arm64") return "darwin-arm64";
  if (platform === "darwin" && arch === "x64") return "darwin-x64";

  throw new Error(`Unsupported platform: ${platform}-${arch}`);
}

async function buildExecutable(targetName?: Target) {
  mkdirSync("dist", { recursive: true });

  // Default to current platform (cross-compilation not supported due to native deps)
  const effectiveTarget = targetName ?? getCurrentPlatformTarget();

  const targetsToBuild = targets.filter((t) => t.name === effectiveTarget);

  if (targetsToBuild.length === 0) {
    console.error(`Unknown target: ${targetName}`);
    console.log(`Available targets: ${targets.map((t) => t.name).join(", ")}`);
    process.exit(1);
  }

  for (const { name, target, ext } of targetsToBuild) {
    const outfile = `dist/dev-diary-${name}${ext}`;
    console.log(`📦 Building ${name}...`);

    const result = await Bun.build({
      entrypoints: ["./index.tsx"],
      compile: {
        target,
        outfile,
      },
      minify: true,
      sourcemap: "linked",
    });

    if (!result.success) {
      console.error(`✗ Failed to build ${name}:`);
      for (const log of result.logs) {
        console.error(log);
      }
      process.exit(1);
    }

    console.log(`✓ Built: ${outfile}`);
  }

  console.log("\n✓ Build complete!");
}

// Parse CLI args: bun run scripts/build-exe.ts [target]
const targetArg = process.argv[2] as Target | undefined;
await buildExecutable(targetArg);
