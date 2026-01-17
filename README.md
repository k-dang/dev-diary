# dev-diary

> AI-powered dev diary generator that scans your git repositories and creates a narrative summary of your work

A terminal UI application that scans your local git repositories, collects recent commits, and generates an AI-powered "dev diary" summarizing your work.

## Features

- Fuzzy-finder directory picker for easy navigation
- Recursively scans for git repositories (skips `node_modules`)
- Collects commits and diffs from recent days
- Generates a narrative dev diary using AI via Vercel AI Gateway
- Outputs a markdown file to your chosen location
- Remembers your preferences across sessions

## Prerequisites

This project requires the following:

- [Bun](https://bun.sh) v1.3.2 or higher
- Vercel AI Gateway API key

## Installation

### Using npx (No Installation Required - Recommended)

```bash
npx @k-dang/dev-diary
```

### Global Installation

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
