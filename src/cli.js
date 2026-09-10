#!/usr/bin/env node
import { Command } from "commander";
import { saveSession } from "./commands/save.js";
import { listSessions } from "./commands/list.js";
import { searchSessions } from "./commands/search.js";
import { resumeSession } from "./commands/resume.js";
import { deleteSession } from "./commands/delete.js";

const program = new Command();

program
  .name("tdn")
  .description("Save and resume your AI coding sessions.")
  .version("0.2.0")
  .enablePositionalOptions();

program
  .command("save")
  .description("Save or update a session")
  .argument("<provider>", "Provider name (e.g. claude, opencode, commandcode)")
  .argument(
    "<args...>",
    "Resume flag and session ID exactly as the provider CLI prints them, e.g. -s <id> or --resume <id>",
  )
  .option("--name <sessionName>", "Memorable name for the session (prompts if omitted)")
  .passThroughOptions()
  .action(async (provider, args, options) => {
    try {
      console.log(await saveSession(provider, args, options));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

program
  .command("list")
  .description("Display all saved sessions")
  .action(async () => {
    try {
      console.log(await listSessions());
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

program
  .command("search")
  .description("Search sessions by name")
  .argument("<query>", "Search query (case-insensitive, partial match)")
  .action(async (query) => {
    try {
      console.log(await searchSessions(query));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

program
  .command("resume")
  .description("Resume a saved session")
  .argument("<name...>", "Session name to resume")
  .action(async (name) => {
    try {
      await resumeSession(name.join(" "));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

program
  .command("delete")
  .description("Delete a saved session")
  .argument("<name...>", "Session name")
  .option("--force", "Skip confirmation")
  .action(async (name, options) => {
    try {
      console.log(await deleteSession(name.join(" "), options));
    } catch (error) {
      console.error(`Error: ${error.message}`);
      process.exitCode = 1;
    }
  });

program.parseAsync(process.argv);
