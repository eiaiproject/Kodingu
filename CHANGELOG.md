# Changelog

All notable changes to Kodingu are recorded here. The format follows [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and the project uses [Semantic Versioning](https://semver.org/).

## [Unreleased]

### Added

- Contributor guide, code of conduct, changelog, issue forms, pull request template, and code owners.
- CodeQL analysis and a gitleaks history scan in CI.
- Dependency audit and UI audit scripts in the verification workflow.

### Changed

- Control borders now meet 3:1 contrast, and no interface text is smaller than `0.75rem`.
- Spacing, type, radius, motion, and preview colors use shared tokens; responsive rules use 600, 860, and 1080px.
- The JavaScript preflight runs in a worker created inside a sandboxed frame, so it is isolated and still interruptible.
- Font files are cached for one year and the site sends `Cross-Origin-Opener-Policy`.
- The icon set only includes the 20 icons the site uses.
- Certificate and page renderers use escaped HTML templates and smaller helpers.
- README claims now match the shipped UI, sitemap, reset behavior, and content files.
- The service worker cache advances to v20.

### Removed

- The historical review document and local audit artifacts.

## [1.0.0] - 2026-11-01

### Added

- Three courses, 70 lessons, four guided projects, and six extra challenges.
- In-browser editor with checks, previews, drafts, and progress in `localStorage`.
- Static reading pages, sitemap, share image, offline shell, and certificates.
