# dev-diary

[![npm version](https://badge.fury.io/js/%40k-dang%2Fdev-diary.svg)](https://www.npmjs.com/package/@k-dang/dev-diary)

A terminal UI application that scans your local git repositories, collects recent commits, and generates an AI-powered "dev diary" summarizing your work.

## Features

- Fuzzy-finder directory picker for easy navigation
- Recursively scans for git repositories (skips `node_modules`)
- Collects commits and diffs from recent days
- Generates a narrative dev diary using AI via Vercel AI Gateway
- Outputs a markdown file to your chosen location
- Remembers your preferences across sessions

## Prerequisites

- Vercel AI Gateway API key (required for AI summarization)
- [Bun](https://bun.sh) v1.3.2 or higher (only for npm installation or development)

**Note**: Standalone binaries include the Bun runtime, so you don't need to install Bun separately.

## Installation

### Standalone Binary (No npm/Bun Required - Recommended)

Install with a single command:

```bash
curl -fsSL https://raw.githubusercontent.com/k-dang/dev-diary/main/install.sh | sh
```

Or manually download the latest binary for your platform from [GitHub Releases](https://github.com/k-dang/dev-diary/releases):
- **Windows**: `dev-diary-windows-x64.exe`
- **macOS (Apple Silicon)**: `dev-diary-darwin-arm64`
- **macOS (Intel)**: `dev-diary-darwin-x64`
- **Linux**: `dev-diary-linux-x64`

Make it executable and run:
```bash
chmod +x dev-diary-*
./dev-diary-*
```

### Using npx (No Installation Required)

```bash
npx @k-dang/dev-diary
```

### Global Installation via npm

```bash
npm install -g @k-dang/dev-diary
```

### For Development

```bash
git clone https://github.com/k-dang/dev-diary.git
cd dev-diary
bun install
```

## Usage

### Quick Start

```bash
# Set your API key
export AI_GATEWAY_API_KEY=your-key-here

# Run the CLI
dev-diary
```

Or with npx:

```bash
AI_GATEWAY_API_KEY=your-key npx @k-dang/dev-diary
```

Or if installed globally:

```bash
AI_GATEWAY_API_KEY=your-key dev-diary
```

### Interactive Flow

1. **Input** - Select a directory to scan and output path using the fuzzy finder
2. **Scanning** - Finds all git repositories recursively (max depth: 3)
3. **Preview** - Review discovered repos, press Enter to confirm
4. **Fetching** - Collects commits and diffs from each repo
5. **Summarizing** - AI generates a dev diary narrative
6. **Complete** - Markdown file saved to output directory

### Output

Generates a markdown file named `dev-diary-YYYY-MM-DD.md` in your output directory:

```markdown
# Dev Diary - January 15, 2026

## Summary
Today's work focused on...

## Repository: my-project
- Implemented feature X
- Fixed bug in component Y
...
```

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key | *required* |
| `DAILY_SUMMARY_OUTPUT` | Output directory | `~/Documents/dev-diary` |
| `DAILY_SUMMARY_DEPTH` | Max directory scan depth | `3` |
| `DAILY_SUMMARY_DAYS` | Days of commits to include | `1` |

## Tech Stack

- **Runtime**: Bun (JavaScript runtime & bundler)
- **Language**: TypeScript with strict mode
- **TUI**: @opentui/react (React-based terminal UI)
- **AI**: Vercel AI SDK with Google Gemini

## Development

### Publishing to npm

This package is automatically published to npm via GitHub Actions when changes are pushed to the `main` branch. The workflow:

1. Runs TypeScript type checking (`bun run check`)
2. Runs code linting (`bun run lint`)
3. Checks if the version in `package.json` has changed
4. Publishes to npm if the version is new

**To publish a new version:**
1. Update the version in `package.json`
2. Commit and push to main
3. GitHub Actions will automatically publish to npm

**Required Secret:** `NPM_TOKEN` must be configured in repository secrets for automated publishing.

### Creating Releases

Standalone binaries are automatically built for all platforms when you push a version tag:

```bash
# Update version in package.json, then:
git tag v0.2.1
git push origin v0.2.1
```

GitHub Actions will:
1. Build executables for Windows, macOS (ARM64 + x64), and Linux
2. Create a GitHub Release with auto-generated release notes
3. Attach all binaries to the release

Binaries are built on native runners to ensure compatibility.
