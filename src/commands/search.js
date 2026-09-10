import { Storage } from "../storage.js";
import { formatTable } from "../formatter.js";

export async function searchSessions(query) {
  const storage = new Storage();
  const matches = await storage.search(query);

  if (matches.length === 0) {
    return `No sessions match "${query}".`;
  }

  return formatTable(matches);
}
