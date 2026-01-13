# daily-summary

A terminal UI application that scans your local git repositories, collects recent commits, and generates an AI-powered "dev diary" summarizing your work.

## Features

- Fuzzy-finder directory picker for easy navigation
- Recursively scans for git repositories (skips `node_modules`)
- Collects commits and diffs from the last day
- Generates a narrative dev diary using AI via Vercel AI Gateway
- Outputs a markdown file to your chosen location

## Prerequisites

- [Bun](https://bun.sh) v1.3.2+
- A Vercel AI Gateway API key

## Installation

```bash
bun install
```

## Usage

Set your API key and run the app:

```bash
export AI_GATEWAY_API_KEY=<your-key>
bun run index.tsx
```

### App Flow

1. **Input** - Select a directory to scan and output path using the fuzzy finder
2. **Scanning** - Finds all git repositories recursively
3. **Preview** - Review discovered repos, press Enter to confirm
4. **Fetching** - Collects commits and diffs from each repo
5. **Summarizing** - Gemini AI generates a dev diary narrative
6. **Complete** - Markdown file saved to output directory

## Configuration

| Environment Variable | Description | Default |
|---------------------|-------------|---------|
| `AI_GATEWAY_API_KEY` | Vercel AI Gateway API key | *required* |
| `DAILY_SUMMARY_OUTPUT` | Output directory | `~/Documents/dev-diary` |
| `DAILY_SUMMARY_DEPTH` | Max directory scan depth | `3` |
| `DAILY_SUMMARY_DAYS` | Days of commits to include | `1` |

## Tech Stack

- **Runtime**: Bun
- **Language**: TypeScript
- **TUI**: @opentui/react
- **AI**: Vercel AI SDK + Google Gemini
