# AGENTS.md

A terminal UI application that scans your local git repositories, collects recent commits, and generates an AI-powered "dev diary" summarizing your work.

## Tech Stack

- **Runtime**: Bun (v1.3.2+)
- **Language**: TypeScript with strict mode
- **TUI Framework**: @opentui/react (React-based terminal UI)
- **AI**: Vercel AI SDK with Google Gemini (gemini-2.5-flash-lite)

## Architecture

```
src/
├── app.tsx                    # Main TUI component - orchestrates flow between phases
├── components/                # TUI view components for each phase
│   ├── directory-input.tsx    # Input fields for directory and output path
│   ├── repo-list.tsx          # Displays discovered git repos
│   ├── progress-view.tsx      # Progress indicator during operations
│   ├── success-view.tsx       # Final screen with output file path
│   ├── error-view.tsx         # Error display component
│   ├── file-preview.tsx       # Preview component for files
│   └── fuzzy-finder.tsx       # Fuzzy search component for file/directory selection
├── services/                  # Core business logic
│   ├── git-scanner.ts         # Recursively finds .git folders in directory
│   ├── directory-scanner.ts   # Directory scanning utilities
│   ├── git-data.ts            # Extracts commits/diffs via Bun.spawn git commands
│   └── summarizer.ts          # Generates dev diary via Gemini AI
├── hooks/
│   └── use-app-state.ts       # State machine managing app phases (input→scanning→preview→fetching→summarizing→complete)
├── types/
│   └── index.ts               # TypeScript interfaces (GitRepo, CommitInfo, AppState, etc.)
└── utils/
    ├── config.ts              # Reads config from environment variables
    ├── markdown.ts            # Writes dev-diary-YYYY-MM-DD.md files
    ├── persistence.ts         # Persists user preferences across sessions
    └── fuzzy-match.ts         # Fuzzy matching algorithm utilities
```

## Commands

```bash
bun install         # Install dependencies
bun run index.tsx   # Run the TUI application
bun run build       # Build for production
bun run build:exe   # Build standalone executable
bun run format      # Run the formatter
bun run lint        # Run the linter
bun run check       # Run the type checker
```
