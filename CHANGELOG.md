# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [0.3.0] - 2026-02-01

### Added
- Unit tests
- Dev log support
- Day-aware summary generation

### Changed
- Added Biome ignore configuration for repository hygiene

## [0.2.3] - 2026-01-22

### Changed
- Updated install script instructions

## [0.2.2] - 2026-01-19

### Added
- Install scripts for binary distributions

### Fixed
- macOS builder configuration

## [0.2.1] - 2026-01-17

### Fixed
- Postinstall package handling

## [0.2.0] - 2026-01-17

### Added
- Day switch controls
- Formatting and linting setup
- Build scripts
- GitHub Actions workflow
- Back navigation from success screen
- User email filtering
- Persisted state and additional UI improvements
- Postinstall script

### Changed
- Fuzzy finder UI improvements
- Moved file operations to Bun file methods
- Updated required env var to `AI_GATEWAY_API_KEY`
- Updated lint command and project agent docs

### Fixed
- Incorrect environment variable usage
- Missing parameter handling

## [0.1.0] - 2026-01-15

### Added
- Initial npm release
- TUI-based git repository scanner
- AI-powered dev diary generation with Google Gemini
- Fuzzy finder for directory selection
- Persistent configuration storage
- Multi-day commit history support
- Environment variable configuration
