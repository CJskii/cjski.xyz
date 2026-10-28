import test from "node:test";
import assert from "node:assert/strict";
import {
  isGithubSnapshot,
  normalizeRepos,
  normalizeCommits,
  parseContributions,
  createGithubService,
} from "../src/lib/github.ts";
const repo = {
  name: "example",
  private: false,
  owner: { login: "CJskii" },
  fork: false,
  archived: false,
  pushed_at: "2026-02-01T00:00:00Z",
  language: "TypeScript",
  stargazers_count: 0,
};
const commit = {
  sha: "a".repeat(40),
  author: { login: "CJskii" },
  commit: {
    author: { date: "2026-02-01T00:00:00Z" },
    message: "Implement a useful feature\n\nMore detail",
  },
};
const calendar = Array.from({ length: 310 }, (_, i) => {
  const date = new Date(Date.UTC(2025, 0, 1 + i)).toISOString().slice(0, 10);
  return `<td data-date="${date}" id="day-${i}" data-level="${i % 5}" class="ContributionCalendar-day"></td><tool-tip for="day-${i}">${i % 4} contributions on this day.</tool-tip>`;
}).join("");
const fallback = {
  checkedAt: "2026-01-01T00:00:00Z",
  status: "fresh",
  repos: normalizeRepos([repo]),
  commits: normalizeCommits([commit], "example"),
  calendar: parseContributions(calendar, new Date("2026-10-26")),
  events: [],
};

test("public repository normalisation excludes private and foreign repositories", () => {
  const result = normalizeRepos([
    repo,
    { ...repo, name: "private-work", private: true },
    { ...repo, owner: { login: "elsewhere" } },
    { ...repo, name: "../../bad" },
    { name: "missing-visibility" },
  ]);
  assert.deepEqual(
    result.map((value) => value.name),
    ["example"],
  );
  assert.equal(result[0].url, "https://github.com/CJskii/example");
});

test("commit output preserves dates, requires the correct author and links to an actual SHA", () => {
  const result = normalizeCommits(
    [
      commit,
      { ...commit, author: { login: "elsewhere" } },
      { ...commit, sha: "bad" },
    ],
    "example",
  );
  assert.equal(result.length, 1);
  assert.equal(result[0].date, "2026-02-01T00:00:00Z");
  assert.equal(result[0].message, "Implement a useful feature");
  assert.match(result[0].url, /\/commit\/a{40}$/);
});

test("calendar parsing uses real day counts and fails closed when markup changes", () => {
  const result = parseContributions(calendar, new Date("2026-10-26"));
  assert.equal(result.days.length, 310);
  assert.equal(
    result.total,
    result.days.reduce((sum, day) => sum + day.count, 0),
  );
  assert.throws(() => parseContributions("<div>Unavailable</div>"));
  const missing = parseContributions(
    calendar.replace(/<tool-tip for="day-0">[\s\S]*?<\/tool-tip>/, ""),
    new Date("2026-10-26"),
  );
  assert.equal(missing.days[0].count, null);
  assert.equal(missing.total, null);
});

test("upstream rate limits retain dated last-known activity rather than returning broken content", async () => {
  const get = createGithubService({
    fallback,
    now: () => new Date("2026-10-26"),
    fetcher: async () => new Response("rate limited", { status: 403 }),
  });
  const result = await get();
  assert.equal(result.status, "stale");
  assert.equal(result.checkedAt, fallback.checkedAt);
  assert.deepEqual(result.commits, fallback.commits);
});

test("simultaneous requests share a bounded refresh and reuse the cached result", async () => {
  const requests = new Map();
  const fetcher = async (input) => {
    const url = String(input);
    requests.set(url, (requests.get(url) || 0) + 1);
    await new Promise((resolve) => setTimeout(resolve, 2));
    const body = url.endsWith("/contributions")
      ? calendar
      : JSON.stringify(
          url.includes("/repos?")
            ? [repo]
            : url.includes("/commits?")
              ? [commit]
              : [],
        );
    return new Response(body);
  };
  const get = createGithubService({
    fallback,
    fetcher,
    now: () => new Date("2026-10-26"),
  });
  const [first, second] = await Promise.all([get(), get()]);
  assert.equal(first.status, "fresh");
  assert.strictEqual(first, second);
  assert.strictEqual(await get(), first);
  assert.ok([...requests.values()].every((count) => count === 1));
});

test("invalid upstream responses cannot replace the last-known repository and calendar data", async () => {
  const get = createGithubService({
    fallback,
    fetcher: async () => new Response('{"unexpected":true}'),
    now: () => new Date("2026-10-26"),
  });
  const result = await get();
  assert.equal(result.status, "stale");
  assert.equal(result.calendar.total, fallback.calendar.total);
});

test("client wire validation rejects incomplete activity objects", () => {
  assert.equal(isGithubSnapshot(fallback), true);
  assert.equal(
    isGithubSnapshot({ ...fallback, calendar: { days: [] } }),
    false,
  );
  assert.equal(
    isGithubSnapshot({ ...fallback, commits: [{ message: "missing fields" }] }),
    false,
  );
});
