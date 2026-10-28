import importlib.util
import json
import os
import tempfile
import unittest
from datetime import datetime, timedelta, timezone
from pathlib import Path
from types import SimpleNamespace
from unittest.mock import patch

spec = importlib.util.spec_from_file_location(
    "website_publication", Path(__file__).with_name("website_publication.py")
)
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class Decisions(unittest.TestCase):
    def test_identity_binding_expiry_and_idempotency(self):
        with (
            tempfile.TemporaryDirectory() as d,
            patch.dict(os.environ, {"WEBSITE_PUBLICATION_REGISTRY": d}),
        ):
            identity = "a" * 32
            r = SimpleNamespace(
                user_id=123,
                chat_id=123,
                target_id=identity,
                action="approve",
                reply_to_message_id=42,
            )
            data = {
                "id": identity,
                "request_digest": "b" * 64,
                "message_id": 42,
                "expires_at": (
                    datetime.now(timezone.utc) + timedelta(hours=1)
                ).isoformat(),
            }
            Path(d, identity + ".json").write_text(json.dumps(data))
            r.user_id = 999
            self.assertEqual(module.handle(r, 123)["status"], "rejected")
            r.user_id = 123
            r.reply_to_message_id = 41
            self.assertEqual(module.handle(r, 123)["status"], "blocked")
            r.reply_to_message_id = 42
            self.assertEqual(
                module.handle(r, 123)["status"], "website_decision_recorded"
            )
            self.assertEqual(
                module.handle(r, 123)["status"], "website_decision_recorded"
            )
            r.action = "reject"
            self.assertEqual(module.handle(r, 123)["status"], "conflict")
            self.assertEqual(
                json.loads(Path(d, identity + ".decision.json").read_text())["action"],
                "publish_web",
            )


class WithdrawalDecision(unittest.TestCase):
    def test_unpublish_card_records_only_its_explicit_action(self):
        with (
            tempfile.TemporaryDirectory() as directory,
            patch.dict(os.environ, {"WEBSITE_PUBLICATION_REGISTRY": directory}),
        ):
            identity = "c" * 32
            request = SimpleNamespace(
                user_id=123,
                chat_id=123,
                target_id=identity,
                action="approve",
                reply_to_message_id=45,
            )
            data = {
                "id": identity,
                "request_digest": "d" * 64,
                "message_id": 45,
                "requested_action": "unpublish_web",
                "expires_at": (
                    datetime.now(timezone.utc) + timedelta(hours=1)
                ).isoformat(),
            }
            Path(directory, identity + ".json").write_text(json.dumps(data))
            self.assertEqual(
                module.handle(request, 123)["status"], "website_decision_recorded"
            )
            decision = json.loads(
                Path(directory, identity + ".decision.json").read_text()
            )
            self.assertEqual(decision["action"], "unpublish_web")


if __name__ == "__main__":
    unittest.main()
