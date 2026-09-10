# Contributing to Teundeun

Thanks for contributing.

## Setup

```bash
npm install
npm test
```

## Project structure

- `src/cli.js` — Commander CLI wiring.
- `src/storage.js` — local JSON storage.
- `src/formatter.js` — table output.
- `src/commands/` — command handlers.
- `test/` — automated tests.

Provider is a free-text label — `save` builds the resume command as
`<provider> --resume <sessionId>` and stores it as `raw`, no registry
needed to support a new AI coding tool.

## Tests

Run tests with:

```bash
npm test
```

Storage tests use a temporary directory and never modify your real Teundeun
data.

## Pull requests

- Keep changes small and focused.
- Add or update tests for new behavior.
- Follow the existing code style.
- Run `npm test` before submitting.
