import spawn from "cross-spawn";
import { access } from "node:fs/promises";
import { Storage } from "../storage.js";

function parseRaw(raw) {
  const [command, ...args] = raw.trim().split(/\s+/);
  return { command, args };
}

export async function resumeSession(name, spawnFn = spawn, storage = new Storage()) {
  const matches = await storage.findByName(name);

  if (matches.length === 0) {
    throw new Error(`No session named "${name}" found.`);
  }

  if (matches.length > 1) {
    const providers = matches.map((session) => session.provider).join(", ");
    throw new Error(
      `Multiple sessions named "${name}" across providers: ${providers}. ` +
        `Use a unique name or delete duplicates.`,
    );
  }

  const session = matches[0];

  const raw = session.raw || `${session.provider} --resume ${session.sessionId}`;

  if (session.path) {
    try {
      await access(session.path);
    } catch {
      throw new Error(`Stored path "${session.path}" no longer exists.`);
    }
  }

  const { command, args } = parseRaw(raw);

  const options = { stdio: "inherit" };
  if (session.path) {
    options.cwd = session.path;
  }

  const child = spawnFn(command, args, options);

  child.on("error", (error) => {
    if (error.code === "ENOENT") {
      process.stderr.write(
        `Provider executable "${command}" not found in PATH.\n`,
      );
      return;
    }
    process.stderr.write(`Failed to run provider: ${error.message}\n`);
  });

  child.on("exit", (code) => {
    if (code !== 0) {
      process.stderr.write(
        `Provider exited with code ${code ?? "unknown"}.\n`,
      );
    }
  });

  return child;
}
