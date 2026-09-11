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

export async function saveSession(provider, args, { name }) {
  if (!args || args.length === 0) {
    throw new Error(
      "Resume command is required.",
    );
  }

  const sessionName = name || (await prompt("Session name: "));
  if (!sessionName) {
    throw new Error("Session name is required.");
  }

  const sessionId = args[args.length - 1];
  const raw = [provider, ...args].join(" ");

  const storage = new Storage();

  const matches = await storage.findByName(sessionName);
  const conflict = matches.find(
    (session) => session.provider !== provider.toLowerCase(),
  );
  if (conflict) {
    throw new Error(
      `Session name "${sessionName}" is already used. ` +
        "Choose a different name or delete the existing session first.",
    );
  }

  const result = await storage.save(
    provider,
    sessionId,
    sessionName,
    process.cwd(),
    raw,
  );

  if (result === "updated") {
    return `Session "${sessionName}" updated successfully.`;
  }
  return `Session "${sessionName}" saved successfully.`;
}
