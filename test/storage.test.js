import { test } from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, readFile, writeFile, rm } from "node:fs/promises";
import { tmpdir } from "node:os";
import path from "node:path";

import { Storage } from "../src/storage.js";

async function tempStorage(t) {
  const dir = await mkdtemp(path.join(tmpdir(), "teundeun-"));
  const filePath = path.join(dir, "sessions.json");
  t.after(() => rm(dir, { recursive: true, force: true }));
  return new Storage(filePath);
}

test("creates storage when file does not exist", async (t) => {
  const storage = await tempStorage(t);
  const sessions = await storage.read();
  assert.deepEqual(sessions, []);
});

test("saves a new session", async (t) => {
  const storage = await tempStorage(t);
  const result = await storage.save("claude", "session-123", "remotion");
  assert.equal(result, "created");

  const sessions = await storage.read();
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].name, "remotion");
  assert.equal(sessions[0].provider, "claude");
  assert.equal(sessions[0].sessionId, "session-123");
});

test("updates session with same provider and name", async (t) => {
  const storage = await tempStorage(t);
  await storage.save("claude", "session-123", "remotion");
  const result = await storage.save("claude", "session-456", "remotion");
  assert.equal(result, "updated");

  const sessions = await storage.read();
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].sessionId, "session-456");
});

test("stores raw resume command", async (t) => {
  const storage = await tempStorage(t);
  await storage.save(
    "cmdc",
    "session-xyz",
    "teundeun",
    "/some/project",
    "cmdc --resume session-xyz",
  );

  const sessions = await storage.read();
  assert.equal(sessions[0].raw, "cmdc --resume session-xyz");
});

test("lists saved sessions", async (t) => {
  const storage = await tempStorage(t);
  await storage.save("claude", "session-123", "remotion");
  const sessions = await storage.read();
  assert.equal(sessions.length, 1);
  assert.equal(sessions[0].name, "remotion");
});

test("searches case-insensitively", async (t) => {
  const storage = await tempStorage(t);
  await storage.save("claude", "session-123", "Remotion");
  const matches = await storage.search("remo");
  assert.equal(matches.length, 1);
  assert.equal(matches[0].name, "Remotion");
});

test("deletes a session", async (t) => {
  const storage = await tempStorage(t);
  await storage.save("claude", "session-123", "remotion");
  const deleted = await storage.deleteByName("remotion");
  assert.equal(deleted, true);

  const sessions = await storage.read();
  assert.equal(sessions.length, 0);
});

test("handles a missing session on delete", async (t) => {
  const storage = await tempStorage(t);
  const deleted = await storage.deleteByName("missing");
  assert.equal(deleted, false);
});

test("errors when deleting an ambiguous session name", async (t) => {
  const storage = await tempStorage(t);
  await storage.save("claude", "session-1", "remotion");
  await storage.save("cmdc", "session-2", "remotion");
  await assert.rejects(
    () => storage.deleteByName("remotion"),
    /Multiple sessions named/,
  );
});

test("handles invalid JSON", async (t) => {
  const storage = await tempStorage(t);
  await writeFile(storage.filePath, "{ invalid json", "utf8");
  await assert.rejects(() => storage.read(), /Cannot read session data/);
});

test("passes correct session id to provider command", async (t) => {
  const captured = [];
  const fakeSpawn = (command, args) => {
    captured.push({ command, args });
    return {
      on() {
        return this;
      },
    };
  };

  const { resumeSession } = await import("../src/commands/resume.js");

  const storage = await tempStorage(t);
  await storage.save(
    "claude",
    "session-abc",
    "remotion",
    undefined,
    "claude --resume session-abc",
  );

  await resumeSession("remotion", fakeSpawn, storage);

  assert.equal(captured.length, 1);
  assert.equal(captured[0].command, "claude");
  assert.deepEqual(captured[0].args, ["--resume", "session-abc"]);
});
