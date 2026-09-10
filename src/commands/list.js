import { Storage } from "../storage.js";
import { formatTable } from "../formatter.js";

export async function listSessions() {
  const storage = new Storage();
  const sessions = await storage.read();

  if (sessions.length === 0) {
    return "No sessions saved yet. Use `tdn save <provider> --resume <id> --name <name>`.";
  }

  return formatTable(sessions, { includeProvider: false, includePath: true });
}
