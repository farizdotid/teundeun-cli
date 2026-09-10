import { createInterface } from "node:readline";
import { Storage } from "../storage.js";

function prompt(message) {
  const readline = createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    readline.question(message, (answer) => {
      readline.close();
      resolve(answer.trim());
    });
  });
}

export async function saveSession(provider, { resume, name }) {
  const sessionName = name || (await prompt("Session name: "));
  if (!sessionName) {
    throw new Error("Session name is required.");
  }

  const raw = `${provider} --resume ${resume}`;

  const storage = new Storage();
  const result = await storage.save(
    provider,
    resume,
    sessionName,
    process.cwd(),
    raw,
  );

  if (result === "updated") {
    return `Session "${sessionName}" updated successfully.`;
  }
  return `Session "${sessionName}" saved successfully.`;
}
