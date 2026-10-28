export function publicArticles(entries, now = new Date()) {
  return entries.filter(
    (entry) =>
      entry.draft === false &&
      entry.fixture !== true &&
      entry.publicationAuthorised === true &&
      typeof entry.publishedAt === "string" &&
      Number.isFinite(Date.parse(entry.publishedAt)) &&
      Date.parse(entry.publishedAt) <= now.getTime(),
  );
}
export function escapeXml(value) {
  return String(value).replace(
    /[<>&"']/g,
    (char) =>
      ({
        "<": "&lt;",
        ">": "&gt;",
        "&": "&amp;",
        '"': "&quot;",
        "'": "&apos;",
      })[char],
  );
}
