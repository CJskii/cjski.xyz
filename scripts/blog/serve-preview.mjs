import { createServer } from "node:http";
import { readFile, stat } from "node:fs/promises";
import path from "node:path";
const root = path.resolve(".generated/blog/dist"),
  prefix = process.env.BLOG_PREVIEW_BASE || "/blog",
  port = Number(process.env.BLOG_PREVIEW_PORT || 3102);
const types = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css",
  ".js": "text/javascript",
  ".svg": "image/svg+xml",
  ".png": "image/png",
  ".webp": "image/webp",
  ".woff2": "font/woff2",
};
createServer(async (req, res) => {
  res.setHeader("X-Robots-Tag", "noindex, nofollow, noarchive");
  res.setHeader("Cache-Control", "private, no-store");
  res.setHeader("X-Content-Type-Options", "nosniff");
  try {
    const u = new URL(req.url, "http://127.0.0.1");
    const pathname = decodeURIComponent(u.pathname);
    if (
      !["GET", "HEAD"].includes(req.method) ||
      !pathname.startsWith(prefix + "/")
    )
      throw Error();
    let file = path.resolve(root, pathname.slice(prefix.length + 1));
    if (!file.startsWith(root + path.sep)) throw Error();
    if ((await stat(file)).isDirectory()) file = path.join(file, "index.html");
    res.setHeader(
      "Content-Type",
      types[path.extname(file)] || "application/octet-stream",
    );
    const body = await readFile(file);
    res.end(req.method === "HEAD" ? undefined : body);
  } catch {
    res.statusCode = 404;
    res.end("Not found");
  }
}).listen(port, "127.0.0.1", function () {
  console.log(
    `Private preview: http://127.0.0.1:${this.address().port}${prefix}/SLUG`,
  );
});
