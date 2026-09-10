# Teundeun CLI

Save and resume your AI coding sessions.

"Teundeun" is Sundanese for "to store" or "to save".

- Command: `tdn`
- npm package: `teundeun`

## Features

- Save an AI session ID with a memorable name.
- List all saved sessions.
- Search sessions by name (case-insensitive, partial match).
- Resume a saved session from the terminal.
- Delete saved sessions.
- Store all data locally in a JSON file.
- No account, backend, or cloud service required.

## Install

Requires Node.js 18 or newer.

```bash
npm install -g teundeun
```

Use without global install:

```bash
npx teundeun list
```

## Usage

### Save a session

```bash
tdn save claude --resume 10f02415-921e-4e73-af88-f6d20dc41494
```

Teundeun prompts for a session name if you don't pass `--name`. Saving the
same provider and name updates the stored session ID.

### List sessions

```bash
tdn list
```

### Search sessions

```bash
tdn search remotion
```

### Resume a session

```bash
tdn resume remotion
```

The provider process inherits your terminal so you can interact with it
normally. If the session was saved from a specific directory, Teundeun
changes into that directory before running the provider command.

### Delete a session

```bash
tdn delete remotion
```

Confirm when prompted. Use `--force` to skip confirmation:

```bash
tdn delete remotion --force
```

## Data storage

Session data is stored locally:

- Windows: `%APPDATA%\teundeun\sessions.json`
- macOS/Linux: `~/.teundeun/sessions.json`

The file is created automatically. Do not commit `sessions.json` to a
repository, as it contains session IDs.

Each record stores the name, session ID, the directory it was
saved from (`path`), the exact resume command (`raw`), and timestamps.
`resume` uses `path` to cd into the right directory and `raw` to run the
exact command; both are optional.

## Development

```bash
npm install
npm test
npm link
```

Run tests with `npm test`.

## License

MIT
