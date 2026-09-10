function pad(text, width) {
  return text.padEnd(width);
}

function relativeTime(iso) {
  const date = new Date(iso);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return date.toISOString().slice(0, 10);
}

function formatCell(session, column) {
  if (column.key === "updatedAt") {
    return relativeTime(session.updatedAt);
  }
  return String(session[column.key] ?? "");
}

export function formatTable(
  sessions,
  { includeProvider = true, includePath = false } = {},
) {
  const columns = [
    { key: "name", label: "NAME" },
    ...(includeProvider ? [{ key: "provider", label: "PROVIDER" }] : []),
    ...(includePath ? [{ key: "path", label: "PATH" }] : []),
    { key: "sessionId", label: "SESSION ID" },
    { key: "updatedAt", label: "UPDATED" },
  ];

  const widths = columns.map((column) =>
    Math.max(
      column.label.length,
      ...sessions.map((session) => formatCell(session, column).length),
    ),
  );

  const header = columns
    .map((column, index) => pad(column.label, widths[index]))
    .join("  ");

  const rows = sessions.map((session) =>
    columns
      .map((column, index) => pad(formatCell(session, column), widths[index]))
      .join("  "),
  );

  return [header, ...rows].join("\n");
}
