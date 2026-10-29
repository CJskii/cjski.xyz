"""Verify merged website releases from the publisher host, then send a receipt.

Uses the existing website verifier and private registry. No model calls, deployment
API access or publication decision is made here. Telegram credentials stay local.
"""
from __future__ import annotations

import json
import os
from pathlib import Path
import re
import subprocess
import tempfile
import time
import urllib.request
from datetime import datetime, timezone


def run(args, *, cwd, input=None):
    return subprocess.run(args, cwd=cwd, input=input, text=True, capture_output=True, timeout=120)


def process(request_file: Path, repo: Path, execute=run):
    ident = request_file.stem
    if not re.fullmatch(r"[a-f0-9]{32}", ident):
        return "ignored"
    root = request_file.parent
    receipt = root / (ident + ".verified.json")
    if receipt.exists():
        return "already_verified"
    submitted = root / (ident + ".submitted.json")
    if not submitted.is_file():
        return "not_submitted"
    request = json.loads(request_file.read_text())
    decision = json.loads((root / (ident + ".decision.json")).read_text())
    if decision.get("action") not in ("publish_web", "unpublish_web"):
        return "ignored"
    publication = json.loads(submitted.read_text())
    url = publication.get("url", "")
    if not re.fullmatch(r"https://github\.com/CJskii/cjski\.xyz/pull/[0-9]+", url):
        raise ValueError("Unexpected publication PR")
    draft = Path(request["draft_directory"])
    record = json.loads((draft / "request.json").read_text())
    if request["id"] != ident or request["request_digest"] != decision["request_digest"]:
        raise ValueError("Publication decision binding mismatch")
    # Use the same approval contract as submission; never treat a PR as approval.
    validation = execute([
        "node", "--input-type=module", "-e",
        "import {verifyApproval} from './scripts/blog/contracts.mjs';let s='';for await(const x of process.stdin)s+=x;const p=JSON.parse(s);verifyApproval(p.record,p.decision);",
    ], cwd=repo, input=json.dumps({"record": record, "decision": decision}))
    if validation.returncode:
        raise ValueError("Exact publication approval no longer verifies")
    pr = execute(["gh", "pr", "view", url, "--json", "state,mergedAt,mergeStateStatus"], cwd=repo)
    if pr.returncode:
        return "pr_lookup_pending"
    state = json.loads(pr.stdout)
    if state.get("state") == "OPEN" and state.get("mergeStateStatus") == "BEHIND":
        execute(["gh", "pr", "update-branch", url], cwd=repo)
        return "awaiting_updated_checks"
    if state.get("state") == "CLOSED":
        return "closed_without_publication"
    if state.get("state") != "MERGED" or not state.get("mergedAt"):
        return "awaiting_merge"
    slug = record["slug"]
    if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
        raise ValueError("Invalid article slug")
    entries, withdrawn = [], []
    if decision["action"] == "publish_web":
        assets = []
        for asset in record["assets"]:
            name = asset["path"]
            if not re.fullmatch(r"assets/[a-zA-Z0-9_-]+\.(svg|png|webp|jpe?g)", name):
                raise ValueError("Invalid approved asset path")
            assets.append({"url": f"/blog/media/{slug}/{Path(name).name}", "sha256": record["files"][name]})
        entries = [{"slug": slug, "title": record["title"], "bundleDigest": record["bundle_digest"], "rendererDigest": record["renderer_digest"], "assets": assets}]
    else:
        withdrawn = [{"slug": slug, "request_digest": request["request_digest"]}]
    # A one-release catalogue avoids duplicate receipts for older articles. The
    # verifier checks live marker, HTML, exact asset hashes and discovery feeds.
    with tempfile.TemporaryDirectory(prefix="website-receipt-") as folder:
        stage = Path(folder)
        (stage / "content").mkdir()
        (stage / ".generated/blog").mkdir(parents=True)
        (stage / "content/articles.json").write_text(json.dumps(entries))
        (stage / ".generated/blog/withdrawn.json").write_text(json.dumps(withdrawn))
        verified = execute(["node", str(repo / "scripts/blog/verify-live.mjs")], cwd=stage)
    if verified.returncode:
        return "awaiting_live_verification"
    data = {"request_id": ident, "request_digest": request["request_digest"], "pr": url, "status": "verified", "verified_at": datetime.now(timezone.utc).isoformat()}
    with receipt.open("x") as file:
        json.dump(data, file, indent=2)
    receipt.chmod(0o600)
    return "verified"



def pending_notice(request, result, send, now=None):
    if result in ("not_submitted", "already_verified", "ignored", "verified"):
        return
    now = time.time() if now is None else now
    file = request.with_name(request.stem + ".verification-state.json")
    state = json.loads(file.read_text()) if file.exists() else {"first_seen": now, "alert_sent": False}
    state["stage"] = result
    if not state["alert_sent"] and (result == "closed_without_publication" or now - state["first_seen"] >= 1800):
        data = json.loads(request.read_text())
        send("Website publication needs attention\n\n" + data.get("title", data.get("slug", "Article")) + "\nStage: " + result.replace("_", " ") + "\n\nThe release has not been confirmed. Please ask me to investigate request " + request.stem + ".")
        state["alert_sent"] = True
    file.write_text(json.dumps(state))
    file.chmod(0o600)


def send_notice(text):
    token = os.environ["TELEGRAM_CONTENT_TOKEN"]
    body = json.dumps({"chat_id": os.environ["TELEGRAM_FOUNDER_CHAT_ID"], "text": text}).encode()
    request = urllib.request.Request("https://api.telegram.org/bot" + token + "/sendMessage", data=body, headers={"Content-Type": "application/json"})
    with urllib.request.urlopen(request, timeout=20) as response:
        if not json.load(response).get("ok"):
            raise RuntimeError("Publication attention notice rejected")


def main():
    os.umask(0o077)
    root = Path(os.environ["WEBSITE_PUBLICATION_REGISTRY"])
    repo = Path.cwd()
    # A missing receipt token must not be recorded as a successful notification.
    if not os.environ.get("TELEGRAM_CONTENT_TOKEN") or not os.environ.get("TELEGRAM_FOUNDER_CHAT_ID", "").isdigit():
        raise RuntimeError("Configure local publication receipt credentials")
    for request in root.glob("*.json"):
        if re.fullmatch(r"[a-f0-9]{32}\.json", request.name):
            try:
                result = process(request, repo)
                pending_notice(request, result, send_notice)
            except Exception:
                result = "verification_blocked"
            if result not in ("not_submitted", "already_verified", "ignored"):
                print(json.dumps({"request_id": request.stem, "status": result}), flush=True)


if __name__ == "__main__":
    main()
