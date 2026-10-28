// Read-only checks. Never creates a branch/PR, changes GitHub settings or deploys.
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
function command(bin, args) {
  const r = spawnSync(bin, args, { encoding: "utf8", timeout: 20000 });
  return { ok: r.status === 0, text: r.stdout || "" };
}
function api(endpoint) {
  const result = command("gh", ["api", endpoint]);
  try {
    return result.ok ? JSON.parse(result.text) : null;
  } catch {
    return null;
  }
}
const remote = command("git", ["remote", "get-url", "origin"]).text.trim();
const match = remote.match(/github\.com[:/]([^/]+\/[^/]+?)(?:\.git)?$/);
const repo = match?.[1];
const gh = command("gh", ["auth", "status"]).ok;
const repository = repo && gh ? api("repos/" + repo) : null;
const branch = repository?.default_branch || "main";
const protection = repository
  ? api(`repos/${repo}/branches/${branch}/protection`)
  : null;
const variables = repository ? api(`repos/${repo}/actions/variables`) : null;
const secrets = repository ? api(`repos/${repo}/actions/secrets`) : null;
const names = new Set(secrets?.secrets?.map((s) => s.name) || []);
const result = {
  repository: repo || null,
  github_authenticated: gh,
  can_create_pr: !!repository?.permissions?.push,
  working_tree_clean:
    command("git", ["status", "--porcelain"]).text.trim() === "",
  branch_checks_required: !!protection?.required_status_checks,
  branch_review_required: !!protection?.required_pull_request_reviews,
  protected_auto_merge:
    !!protection?.required_status_checks && !!repository?.allow_auto_merge,
  ci_deployment_enabled:
    variables?.variables?.some(
      (v) => v.name === "ENABLE_COOLIFY_DEPLOY" && v.value === "true",
    ) || false,
  ci_deployment_secrets: ["COOLIFY_DEPLOY_WEBHOOK", "COOLIFY_TOKEN"].every(
    (n) => names.has(n),
  ),
  ci_receipt_secrets: [
    "TELEGRAM_CONTENT_TOKEN",
    "TELEGRAM_FOUNDER_CHAT_ID",
  ].every((n) => names.has(n)),
  registry_configured:
    !!process.env.WEBSITE_PUBLICATION_REGISTRY &&
    existsSync(process.env.WEBSITE_PUBLICATION_REGISTRY),
  publisher_enabled: process.env.WEBSITE_PUBLISHER_ENABLED === "1",
  public_catalogue: path.resolve("content/articles.json"),
};
console.log(JSON.stringify(result, null, 2));
