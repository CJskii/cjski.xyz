import importlib.util
import json
from pathlib import Path
from subprocess import CompletedProcess
import tempfile
import unittest

spec = importlib.util.spec_from_file_location("website_receipts", Path(__file__).with_name("website_receipts.py"))
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)


class ReceiptFlow(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.addCleanup(self.temp.cleanup)
        self.root = Path(self.temp.name)
        self.ident = "a" * 32
        self.request = self.root / (self.ident + ".json")
        draft = self.root / "draft"
        draft.mkdir()
        (draft / "request.json").write_text(json.dumps({"slug": "synthetic-note", "title": "Synthetic note", "bundle_digest": "b" * 64, "renderer_digest": "c" * 64, "assets": [{"path": "assets/figure.svg"}], "files": {"assets/figure.svg": "d" * 64}}))
        self.request.write_text(json.dumps({"id": self.ident, "request_digest": "e" * 64, "draft_directory": str(draft)}))
        (self.root / (self.ident + ".decision.json")).write_text(json.dumps({"action": "publish_web", "request_digest": "e" * 64}))
        (self.root / (self.ident + ".submitted.json")).write_text(json.dumps({"url": "https://github.com/CJskii/cjski.xyz/pull/123"}))
        self.merged, self.approved, self.live = True, True, True
        self.live_calls = 0

    def execute(self, args, *, cwd, input=None):
        if args[0] == "gh":
            return CompletedProcess(args, 0, json.dumps({"state": "MERGED" if self.merged else "OPEN", "mergedAt": "2026-10-28T12:00:00Z" if self.merged else None}), "")
        if "--input-type=module" in args:
            return CompletedProcess(args, 0 if self.approved else 1, "", "")
        self.live_calls += 1
        entries = json.loads((Path(cwd) / "content/articles.json").read_text())
        self.assertEqual([x["slug"] for x in entries], ["synthetic-note"])
        self.assertEqual(entries[0]["assets"][0]["url"], "/blog/media/synthetic-note/figure.svg")
        self.assertNotIn("approved_by", entries[0])
        return CompletedProcess(args, 0 if self.live else 1, "", "")

    def test_pending_pr_does_not_verify_or_notify(self):
        self.merged = False
        self.assertEqual(module.process(self.request, self.root, self.execute), "awaiting_merge")
        self.assertEqual(self.live_calls, 0)

    def test_exact_live_release_creates_one_private_receipt(self):
        self.assertEqual(module.process(self.request, self.root, self.execute), "verified")
        self.assertEqual(module.process(self.request, self.root, self.execute), "already_verified")
        self.assertEqual(self.live_calls, 1)
        self.assertEqual((self.root / (self.ident + ".verified.json")).stat().st_mode & 0o777, 0o600)

    def test_live_failure_remains_pending_and_retry_can_succeed(self):
        self.live = False
        self.assertEqual(module.process(self.request, self.root, self.execute), "awaiting_live_verification")
        self.assertFalse((self.root / (self.ident + ".verified.json")).exists())
        self.live = True
        self.assertEqual(module.process(self.request, self.root, self.execute), "verified")

    def test_invalidated_approval_cannot_send_receipt(self):
        self.approved = False
        with self.assertRaisesRegex(ValueError, "approval"):
            module.process(self.request, self.root, self.execute)
        self.assertEqual(self.live_calls, 0)

    def test_changed_decision_binding_cannot_send_receipt(self):
        (self.root / (self.ident + ".decision.json")).write_text(json.dumps({"action": "publish_web", "request_digest": "f" * 64}))
        with self.assertRaisesRegex(ValueError, "binding"):
            module.process(self.request, self.root, self.execute)
        self.assertEqual(self.live_calls, 0)

    def test_stalled_release_alert_is_delayed_and_sent_once(self):
        sent = []
        module.pending_notice(self.request, "awaiting_live_verification", sent.append, now=100)
        self.assertEqual(sent, [])
        module.pending_notice(self.request, "awaiting_live_verification", sent.append, now=1901)
        module.pending_notice(self.request, "awaiting_live_verification", sent.append, now=2000)
        self.assertEqual(len(sent), 1)
        self.assertIn("not been confirmed", sent[0])
