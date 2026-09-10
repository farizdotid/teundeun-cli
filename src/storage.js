import { promises as fs } from "node:fs";
import path from "node:path";
import os from "node:os";

function defaultStoragePath() {
  if (process.platform === "win32") {
    const base = process.env.APPDATA || path.join(os.homedir(), "AppData", "Roaming");
    return path.join(base, "teundeun", "sessions.json");
  }
  return path.join(os.homedir(), ".teundeun", "sessions.json");
}

export class Storage {
  constructor(filePath = defaultStoragePath()) {
    this.filePath = filePath;
  }

  async read() {
    try {
      const raw = await fs.readFile(this.filePath, "utf8");
      return JSON.parse(raw);
    } catch (error) {
      if (error.code === "ENOENT") {
        return [];
      }
      throw new Error(
        `Cannot read session data at ${this.filePath}. ` +
          "The file may be invalid JSON. Fix or remove it before retrying.",
      );
    }
  }

  async write(sessions) {
    await fs.mkdir(path.dirname(this.filePath), { recursive: true });
    await fs.writeFile(this.filePath, `${JSON.stringify(sessions, null, 2)}\n`, "utf8");
  }

  async findByName(name) {
    const sessions = await this.read();
    return sessions.filter(
      (session) => session.name.toLowerCase() === name.toLowerCase(),
    );
  }

  async search(query) {
    const sessions = await this.read();
    const normalized = query.toLowerCase();
    return sessions.filter((session) =>
      session.name.toLowerCase().includes(normalized),
    );
  }

  async save(provider, sessionId, name, path, raw) {
    const sessions = await this.read();
    const normalizedProvider = provider.toLowerCase();
    const now = new Date().toISOString();

    const existing = sessions.find(
      (session) =>
        session.provider === normalizedProvider && session.name === name,
    );

    if (existing) {
      existing.sessionId = sessionId;
      existing.path = path;
      existing.raw = raw;
      existing.updatedAt = now;
    } else {
      sessions.push({
        name,
        provider: normalizedProvider,
        sessionId,
        path,
        raw,
        createdAt: now,
        updatedAt: now,
      });
    }

    await this.write(sessions);
    return existing ? "updated" : "created";
  }

  async deleteByName(name) {
    const sessions = await this.read();
    const normalized = name.toLowerCase();
    const matches = sessions.filter(
      (session) => session.name.toLowerCase() === normalized,
    );

    if (matches.length === 0) {
      return false;
    }

    if (matches.length > 1) {
      const providers = matches.map((session) => session.provider).join(", ");
      throw new Error(
        `Multiple sessions named "${name}" across providers: ${providers}. ` +
          `Use a unique name or delete duplicates.`,
      );
    }

    const index = sessions.findIndex(
      (session) => session.name.toLowerCase() === normalized,
    );
    sessions.splice(index, 1);
    await this.write(sessions);
    return true;
  }
}
