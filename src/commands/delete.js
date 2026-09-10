import { createInterface } from "node:readline";
import { Storage } from "../storage.js";

function confirm(message) {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(`${message} [y/N] `, (answer) => {
      readline.close();
      resolve(answer.trim().toLowerCase() === "y");
    });
  });
}

export async function deleteSession(name, { force = false } = {}) {
  const storage = new Storage();

  if (!force) {
    const confirmed = await confirm(`Delete session "${name}"?`);
    if (!confirmed) {
      return "Delete cancelled.";
    }
  }

  const deleted = await storage.deleteByName(name);

  if (!deleted) {
    throw new Error(`No session named "${name}" found.`);
  }

  return `Session "${name}" deleted successfully.`;
}
