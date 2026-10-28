export interface GithubRepo {
  name: string;
  url: string;
  description: string;
  language: string | null;
  stars: number;
  fork: boolean;
  archived: boolean;
  pushedAt: string;
}
export interface GithubCommit {
  message: string;
  date: string;
  repo: string;
  url: string;
  sha: string;
}
export interface ContributionDay {
  date: string;
  level: number;
  count: number | null;
}
export interface GithubSnapshot {
  checkedAt: string;
  status: "fresh" | "stale" | "unavailable";
  repos: GithubRepo[];
  commits: GithubCommit[];
  calendar: { days: ContributionDay[]; total: number | null };
  events: { type: string; repo: string; date: string }[];
}
const account = "CJskii";
const object = (value: unknown): Record<string, unknown> =>
  value !== null && typeof value === "object"
    ? (value as Record<string, unknown>)
    : {};
const text = (value: unknown, max = 200) =>
  typeof value === "string" ? value.slice(0, max) : "";
const date = (value: unknown) =>
  typeof value === "string" && Number.isFinite(Date.parse(value)) ? value : "";
export function normalizeRepos(value: unknown): GithubRepo[] {
  if (!Array.isArray(value)) throw new Error("Invalid repository response");
  return value.slice(0, 100).flatMap((item) => {
    const repo = object(item);
    const name = text(repo.name, 100);
    if (
      repo.private !== false ||
      !/^[\w.-]+$/.test(name) ||
      text(object(repo.owner).login).toLowerCase() !== account.toLowerCase() ||
      !date(repo.pushed_at)
    )
      return [];
    return [
      {
        name,
        url: `https://github.com/${account}/${name}`,
        description: text(repo.description),
        language:
          typeof repo.language === "string" ? text(repo.language, 40) : null,
        stars:
          typeof repo.stargazers_count === "number" ? repo.stargazers_count : 0,
        fork: repo.fork === true,
        archived: repo.archived === true,
        pushedAt: date(repo.pushed_at),
      },
    ];
  });
}
export function normalizeCommits(value: unknown, repo: string): GithubCommit[] {
  if (!Array.isArray(value)) throw new Error("Invalid commit response");
  return value.slice(0, 3).flatMap((item) => {
    const entry = object(item);
    const commit = object(entry.commit);
    const sha = text(entry.sha, 64);
    const when = date(object(commit.author).date);
    if (
      !/^[a-f0-9]{40,64}$/.test(sha) ||
      !when ||
      text(object(entry.author).login).toLowerCase() !== account.toLowerCase()
    )
      return [];
    return [
      {
        message: text(commit.message, 500).split("\n")[0].slice(0, 160),
        date: when,
        repo,
        sha,
        url: `https://github.com/${account}/${repo}/commit/${sha}`,
      },
    ];
  });
}
export function parseContributions(
  html: string,
  today = new Date(),
): GithubSnapshot["calendar"] {
  const labels = new Map<string, number>();
  for (const match of html.matchAll(
    /<tool-tip\b([^>]*)>([\s\S]*?)<\/tool-tip>/g,
  )) {
    const id = match[1].match(/\bfor="([^"]+)"/)?.[1];
    const label = match[2].replace(/<[^>]+>/g, "").trim();
    const amount = label.match(/^([\d,]+) contributions?\b/i);
    if (id && (amount || /^No contributions\b/i.test(label)))
      labels.set(id, amount ? Number(amount[1].replaceAll(",", "")) : 0);
  }
  const days: ContributionDay[] = [];
  const last = today.toISOString().slice(0, 10);
  for (const match of html.matchAll(/<td\b([^>]*\bdata-date="[^"]+"[^>]*)>/g)) {
    const attrs = match[1];
    if (!attrs.includes("ContributionCalendar-day")) continue;
    const when = attrs.match(/\bdata-date="(\d{4}-\d{2}-\d{2})"/)?.[1];
    const id = attrs.match(/\bid="([^"]+)"/)?.[1];
    const level = Number(attrs.match(/\bdata-level="([0-4])"/)?.[1]);
    if (when && when <= last && Number.isFinite(level))
      days.push({
        date: when,
        level,
        count: id && labels.has(id) ? labels.get(id)! : null,
      });
  }
  const sorted = [...new Map(days.map((day) => [day.date, day])).values()].sort(
    (a, b) => a.date.localeCompare(b.date),
  );
  if (sorted.length < 300 || sorted.length > 400)
    throw new Error("Contribution calendar format changed");
  return {
    days: sorted,
    total: sorted.every((day) => day.count !== null)
      ? sorted.reduce((sum, day) => sum + day.count!, 0)
      : null,
  };
}
export function normalizeEvents(value: unknown): GithubSnapshot["events"] {
  if (!Array.isArray(value)) throw new Error("Invalid event response");
  return value.slice(0, 100).flatMap((item) => {
    const event = object(item);
    const repo = text(object(event.repo).name, 150);
    const when = date(event.created_at);
    return event.public === true && /^[\w.-]+\/[\w.-]+$/.test(repo) && when
      ? [{ type: text(event.type, 50), repo, date: when }]
      : [];
  });
}
export function createGithubService({
  fallback,
  fetcher = fetch,
  now = () => new Date(),
}: {
  fallback: GithubSnapshot;
  fetcher?: typeof fetch;
  now?: () => Date;
}) {
  let cache: GithubSnapshot | null = null;
  let expiry = 0;
  let pending: Promise<GithubSnapshot> | null = null;
  async function request(url: string, html = false): Promise<unknown> {
    const response = await fetcher(url, {
      headers: {
        Accept: html ? "text/html" : "application/vnd.github+json",
        "User-Agent": "cjski-portfolio",
        "Accept-Language": "en",
      },
      signal: AbortSignal.timeout(4500),
    });
    if (!response.ok) throw new Error("GitHub is unavailable");
    const body = await response.text();
    if (body.length > 1500000) throw new Error("GitHub response is too large");
    return html ? body : JSON.parse(body);
  }
  async function refresh(): Promise<GithubSnapshot> {
    try {
      const [rawRepos, rawEvents, html] = await Promise.all([
        request(
          `https://api.github.com/users/${account}/repos?per_page=100&sort=pushed`,
        ),
        request(
          `https://api.github.com/users/${account}/events/public?per_page=100`,
        ),
        request(`https://github.com/users/${account}/contributions`, true),
      ]);
      const repos = normalizeRepos(rawRepos);
      const candidates = repos
        .filter((repo) => !repo.fork && !repo.archived)
        .sort((a, b) => b.pushedAt.localeCompare(a.pushedAt))
        .slice(0, 3);
      const results = await Promise.allSettled(
        candidates.map(async (repo) =>
          normalizeCommits(
            await request(
              `https://api.github.com/repos/${account}/${repo.name}/commits?per_page=3&author=${account}`,
            ),
            repo.name,
          ),
        ),
      );
      const commits = results
        .flatMap((result) =>
          result.status === "fulfilled" ? result.value : [],
        )
        .sort((a, b) => b.date.localeCompare(a.date))
        .slice(0, 4);
      if (!commits.length && fallback.commits.length)
        throw new Error("Commit response unavailable");
      cache = {
        checkedAt: now().toISOString(),
        status: "fresh",
        repos,
        commits,
        events: normalizeEvents(rawEvents),
        calendar: parseContributions(String(html), now()),
      };
      expiry = now().getTime() + 15 * 60 * 1000;
      return cache;
    } catch {
      const previous = cache || fallback;
      cache = {
        ...previous,
        status: previous.repos.length ? "stale" : "unavailable",
      };
      expiry = now().getTime() + 60 * 1000;
      return cache;
    }
  }
  return async () => {
    if (cache && now().getTime() < expiry) return cache;
    if (pending) return pending;
    pending = refresh();
    try {
      return await pending;
    } finally {
      pending = null;
    }
  };
}

export function isGithubSnapshot(value: unknown): value is GithubSnapshot {
  const data = object(value);
  const calendar = object(data.calendar);
  const finite = (number: unknown) =>
    typeof number === "number" && Number.isFinite(number) && number >= 0;
  return (
    !!date(data.checkedAt) &&
    ["fresh", "stale", "unavailable"].includes(String(data.status)) &&
    Array.isArray(data.repos) &&
    data.repos.length <= 100 &&
    data.repos.every((item) => {
      const repo = object(item);
      return (
        /^[\w.-]+$/.test(text(repo.name)) &&
        /^https:\/\/github\.com\/CJskii\/[\w.-]+$/.test(text(repo.url))
      );
    }) &&
    Array.isArray(data.commits) &&
    data.commits.length <= 4 &&
    data.commits.every((item) => {
      const commit = object(item);
      return (
        !!date(commit.date) &&
        typeof commit.message === "string" &&
        /^https:\/\/github\.com\/CJskii\/[\w.-]+\/commit\/[a-f0-9]{40,64}$/.test(
          text(commit.url),
        )
      );
    }) &&
    (calendar.total === null || finite(calendar.total)) &&
    Array.isArray(calendar.days) &&
    calendar.days.length <= 400 &&
    calendar.days.every((item) => {
      const day = object(item);
      return (
        /^\d{4}-\d{2}-\d{2}$/.test(text(day.date)) &&
        Number.isInteger(day.level) &&
        Number(day.level) >= 0 &&
        Number(day.level) <= 4 &&
        (day.count === null || finite(day.count))
      );
    })
  );
}
