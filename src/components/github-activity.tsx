import { useEffect, useState } from "react";
import { GitCommitHorizontal, GitFork, Code2 } from "lucide-react";
import { isGithubSnapshot, type GithubSnapshot } from "@/lib/github";
import { site } from "@/lib/site";
const displayDate = (value: string) =>
  new Date(value).toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
const monthName = (value: string) =>
  new Date(value + "-01T00:00:00Z").toLocaleDateString("en-GB", {
    month: "short",
    year: "numeric",
    timeZone: "UTC",
  });
export function GithubActivity({ initial }: { initial: GithubSnapshot }) {
  const [data, setData] = useState(initial);
  useEffect(() => {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 6500);
    fetch("/api/github/activity", { signal: controller.signal })
      .then(async (response) => {
        if (!response.ok) throw new Error();
        const value = await response.json();
        if (isGithubSnapshot(value)) setData(value);
      })
      .catch(() => {});
    return () => {
      window.clearTimeout(timeout);
      controller.abort();
    };
  }, []);
  const months = new Map<string, number>();
  for (const day of data.calendar.days)
    if (day.count !== null)
      months.set(
        day.date.slice(0, 7),
        (months.get(day.date.slice(0, 7)) || 0) + day.count,
      );
  const languages = new Map<string, number>();
  for (const repo of data.repos) {
    const name = repo.language || "Other";
    languages.set(name, (languages.get(name) || 0) + 1);
  }
  const ranked = [...languages].sort((a, b) => b[1] - a[1]);
  return (
    <section className="github-section" aria-labelledby="github-heading">
      <div className="section-heading">
        <h2 id="github-heading">On GitHub</h2>
        <a
          className="text-link"
          href={site.github}
          target="_blank"
          rel="noopener noreferrer"
        >
          View profile
        </a>
      </div>
      <div className="github-calendar-panel">
        <div className="github-overview">
          <div>
            <strong>
              {data.calendar.total === null
                ? "Contribution activity"
                : data.calendar.total.toLocaleString("en-GB")}
            </strong>
            <span>
              {data.calendar.total === null
                ? "From the GitHub profile calendar"
                : "GitHub contributions"}
            </span>
          </div>
          <div className="repo-count">
            <GitFork size={19} aria-hidden="true" />
            <span>
              <strong>{data.repos.length || "—"}</strong> public repositories
            </span>
          </div>
        </div>
        {data.calendar.days.length ? (
          <>
            <div
              className="calendar-scroll"
              role="region"
              aria-label="GitHub contribution calendar"
              tabIndex={0}
            >
              <div className="calendar-chart">
                <div className="calendar-months" aria-hidden="true">
                  {data.calendar.days.map((day, index) =>
                    (index === 0 && Number(day.date.slice(8)) <= 24) ||
                    (index > 0 &&
                      day.date.slice(5, 7) !==
                        data.calendar.days[index - 1].date.slice(5, 7)) ? (
                      <span
                        key={day.date}
                        style={{ gridColumn: Math.floor(index / 7) + 1 }}
                      >
                        {new Date(day.date + "T00:00:00Z").toLocaleDateString(
                          "en-GB",
                          { month: "short", timeZone: "UTC" },
                        )}
                      </span>
                    ) : null,
                  )}
                </div>
                <div
                  className="calendar-days"
                  role="img"
                  aria-label={`GitHub profile contribution calendar from ${displayDate(data.calendar.days[0].date)} to ${displayDate(data.calendar.days.at(-1)!.date)}. A monthly breakdown follows.`}
                >
                  {data.calendar.days.map((day) => (
                    <span
                      key={day.date}
                      data-level={day.level}
                      title={`${displayDate(day.date)}: ${day.count === null ? `activity level ${day.level} of 4` : `${day.count} contributions`}`}
                    />
                  ))}
                </div>
                <div className="calendar-legend" aria-hidden="true">
                  <span>Less</span>
                  {[0, 1, 2, 3, 4].map((level) => (
                    <i key={level} data-level={level} />
                  ))}
                  <span>More</span>
                </div>
              </div>
            </div>
            <details className="calendar-breakdown">
              <summary>Monthly contribution breakdown</summary>
              <dl>
                {[...months].map(([month, count]) => (
                  <div key={month}>
                    <dt>{monthName(month)}</dt>
                    <dd>{count}</dd>
                  </div>
                ))}
              </dl>
            </details>
          </>
        ) : (
          <p className="activity-empty">
            The contribution calendar is temporarily unavailable. You can still
            view the profile on GitHub.
          </p>
        )}
        <div className="github-sync">
          <span>GitHub profile calendar</span>
          <span>
            {data.status === "stale" ? "Last known sync" : "Synced"}{" "}
            {displayDate(data.checkedAt)}
          </span>
        </div>
      </div>
      <div className="github-detail-grid">
        <div className="github-commits">
          <h3>
            <GitCommitHorizontal size={20} aria-hidden="true" />
            Latest public commits
          </h3>
          {data.commits.length ? (
            <ol>
              {data.commits.slice(0, 3).map((commit) => (
                <li key={commit.sha}>
                  <a
                    href={commit.url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    <span className="commit-message">{commit.message}</span>
                    <span className="commit-meta">
                      <span>{commit.repo}</span>
                      <time dateTime={commit.date}>
                        {displayDate(commit.date)}
                      </time>
                    </span>
                  </a>
                </li>
              ))}
            </ol>
          ) : (
            <p className="activity-empty">
              No recent public commit details are available.
            </p>
          )}
        </div>
        <div className="github-languages">
          <h3>
            <Code2 size={20} aria-hidden="true" />
            Repository mix
          </h3>
          <p>By primary language</p>
          <div className="language-bar" aria-hidden="true">
            {ranked.map(([language, count], index) => (
              <span
                key={language}
                data-tone={index % 5}
                style={{ flex: count }}
              />
            ))}
          </div>
          <ul>
            {ranked.slice(0, 4).map(([language, count], index) => (
              <li key={language}>
                <span>
                  <i data-tone={index % 5} />
                  {language}
                </span>
                <span>
                  {count} {count === 1 ? "repo" : "repos"}
                </span>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
