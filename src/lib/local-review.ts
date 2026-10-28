import type { IncomingMessage } from "http";
export function allowLocalReview(req: IncomingMessage) {
  const address = req.socket.remoteAddress;
  const host = req.headers.host || "";
  // Next adds forwarding headers internally; reject forwarding headers actually
  // received on the wire so a local reverse proxy cannot expose this preview.
  const received = req.rawHeaders
    ? req.rawHeaders
        .filter((_, index) => index % 2 === 0)
        .map((name) => name.toLowerCase())
    : Object.keys(req.headers);
  const forwarded = ["x-forwarded-for", "forwarded", "x-forwarded-host"].some(
    (name) => received.includes(name),
  );
  return (
    process.env.WEBSITE_LOCAL_REVIEW === "1" &&
    ["127.0.0.1", "::1", "::ffff:127.0.0.1"].includes(address || "") &&
    /^(127\.0\.0\.1|localhost|\[::1\])(?::\d+)?$/.test(host) &&
    !forwarded
  );
}
