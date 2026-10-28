"""Install the adapter into a PREPARED engine checkout, not a running container.
Run the engine tests/build its image before any deployment.
"""

from pathlib import Path
import argparse
import shutil

p = argparse.ArgumentParser()
p.add_argument("--project", required=True)
args = p.parse_args()
services = Path(args.project) / "src/problem_engine/services"
bridge = services / "telegram_bridge.py"
text = bridge.read_text()
parse_hook = """        if data.startswith("web:"):
            parts = data.split(":")
            if len(parts) == 3 and parts[1] in ("approve", "reject"):
                return parts[1], "website_release", parts[2], None
"""
handle_hook = """        if request.target_type == "website_release":
            from problem_engine.services.website_publication import handle

            return handle(request, self.config.founder_chat_id)
"""
if '"website_release"' not in text:
    parse_at = "        if data in (\n"
    handle_at = '        if request.target_type in ("trend_angles", "trend_reject"):'
    if text.count(parse_at) != 1 or text.count(handle_at) != 1:
        raise SystemExit("Engine layout changed; review adapter insertion manually")
    text = text.replace(parse_at, parse_hook + parse_at, 1).replace(
        handle_at, handle_hook + "\n" + handle_at, 1
    )
    bridge.write_text(text)
shutil.copyfile(
    Path(__file__).with_name("website_publication.py"),
    services / "website_publication.py",
)
print(
    "Installed explicit website callback adapter in prepared checkout; no daemon started or restarted."
)
