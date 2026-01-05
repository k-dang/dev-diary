# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Commands

```bash
bun install         # Install dependencies
bun run index.tsx   # Run the TUI application
```

## Environment Variables

```bash
GOOGLE_GENERATIVE_AI_API_KEY=<key>     # Required for AI summarization
DAILY_SUMMARY_OUTPUT=<path>            # Optional: output directory (default: ~/Documents/dev-diary)
DAILY_SUMMARY_DEPTH=3                  # Optional: max directory scan depth
DAILY_SUMMARY_DAYS=1                   # Optional: days of commits to include
```

## Tech Stack

- **Runtime**: Bun (v1.3.2+)
- **Language**: TypeScript with strict mode
- **TUI Framework**: @opentui/react (React-based terminal UI)
- **AI**: Vercel AI SDK with Google Gemini

## Architecture

```
src/
├── app.tsx                 # Main TUI component - orchestrates flow between phases
├── components/             # TUI view components for each phase
│   ├── directory-input.tsx # Input fields for directory and output path
│   ├── repo-list.tsx       # Displays discovered git repos
│   ├── progress-view.tsx   # Progress indicator during operations
│   └── success-view.tsx    # Final screen with output file path
├── services/               # Core business logic
│   ├── git-scanner.ts      # Recursively finds .git folders in directory
│   ├── git-data.ts         # Extracts commits/diffs via Bun.spawn git commands
│   └── summarizer.ts       # Generates dev diary via Gemini AI
├── hooks/
│   └── use-app-state.ts    # State machine managing app phases (input→scanning→preview→fetching→summarizing→complete)
├── types/
│   └── index.ts            # TypeScript interfaces (GitRepo, CommitInfo, AppState, etc.)
└── utils/
    ├── config.ts           # Reads config from environment variables
    └── markdown.ts         # Writes dev-diary-YYYY-MM-DD.md files
```

## App Flow

1. **Input** - User enters directory to scan and output path
2. **Scanning** - Recursively find git repos (skips node_modules, max depth 3)
3. **Preview** - Show discovered repos, user confirms with Enter
4. **Fetching** - Get commits + diffs from last day for each repo via git CLI
5. **Summarizing** - Call Gemini to generate dev diary markdown
6. **Complete** - Show output file path
