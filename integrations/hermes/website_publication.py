"""Explicit web-publication decision adapter for the existing content Telegram bot.

No polling, Git operation or deployment happens in the callback. The operator
configures a private registry shared with the website publisher worker.
"""

from __future__ import annotations

import json
import os
import re
from datetime import UTC, datetime
from pathlib import Path


def handle(request, founder_id):
    if request.user_id != founder_id or request.chat_id != founder_id:
        return {"response_message": "Access denied.", "status": "rejected"}
    registry = os.environ.get("WEBSITE_PUBLICATION_REGISTRY")
    if not registry:
        return {
            "response_message": "Website publisher is not configured. Nothing was published.",
            "status": "blocked",
        }
    if not re.fullmatch(r"[a-f0-9]{32}", request.target_id or ""):
        return {"response_message": "Invalid website request.", "status": "blocked"}
    root = Path(registry)
    try:
        source = root / (request.target_id + ".json")
        if source.is_symlink():
            raise ValueError()
        data = json.loads(source.read_text())
        if data["id"] != request.target_id or not re.fullmatch(
            r"[a-f0-9]{64}", data["request_digest"]
        ):
            raise ValueError()
        if datetime.fromisoformat(data["expires_at"]) <= datetime.now(UTC):
            return {
                "response_message": "This website review expired. Request a fresh preview and card.",
                "status": "expired",
            }
        requested = data.get("requested_action", "publish_web")
        if requested not in ("publish_web", "unpublish_web"):
            raise ValueError()
        action = {
            "approve": requested,
            "reject": "keep_published"
            if requested == "unpublish_web"
            else "keep_draft",
        }.get(request.action)
        if (
            not action
            or not request.reply_to_message_id
            or data.get("message_id") != request.reply_to_message_id
        ):
            raise ValueError()
        decision = {
            "action": action,
            "request_digest": data["request_digest"],
            "approved_by": f"founder_telegram:{request.user_id}",
            "message_id": request.reply_to_message_id,
            "approved_at": datetime.now(UTC).isoformat(),
        }
        output = root / (request.target_id + ".decision.json")
        try:
            with output.open("x") as stream:
                json.dump(decision, stream, sort_keys=True)
            output.chmod(0o600)
        except FileExistsError:
            existing = json.loads(output.read_text())
            if (
                existing.get("action") != action
                or existing.get("request_digest") != data["request_digest"]
            ):
                return {
                    "response_message": "This review already has a different decision. Request a new review.",
                    "status": "conflict",
                }
        return {
            "status": "website_decision_recorded",
            "response_message": "Website publication approved for this revision. The publisher must still pass build/deployment checks; a live-link receipt will confirm publication."
            if action == "publish_web"
            else "Unpublish approved for this exact article revision. Removal will be confirmed after deployment."
            if action == "unpublish_web"
            else "Kept in its current state. No website change was authorised.",
        }
    except (OSError, ValueError, KeyError, TypeError):
        return {
            "response_message": "Website request unavailable or invalid. Nothing was published.",
            "status": "blocked",
        }
