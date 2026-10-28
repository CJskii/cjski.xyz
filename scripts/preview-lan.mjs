import { networkInterfaces } from "node:os";
import { spawn } from "node:child_process";
import { existsSync } from "node:fs";

// Bind the candidate to a private interface rather than every server interface.
const isPrivate = (address) =>
  /^(10\.|192\.168\.|172\.(1[6-9]|2\d|3[01])\.)/.test(address);
const interfaces = Object.entries(networkInterfaces());
const addresses = interfaces.flatMap(([name, entries]) =>
  /^(en|eth|wl|Wi-Fi|Ethernet)/i.test(name)
    ? (entries || []).filter(
        (entry) =>
          entry.family === "IPv4" &&
          !entry.internal &&
          isPrivate(entry.address),
      )
    : [],
);
const host = process.env.WEBSITE_PREVIEW_HOST || addresses[0]?.address;
if (!host || !isPrivate(host)) {
  throw new Error(
    "Set WEBSITE_PREVIEW_HOST to this server's private LAN IPv4 address.",
  );
}
if (!existsSync(".next/BUILD_ID")) {
  throw new Error("Run npm run build before starting the LAN preview.");
}
const env = { ...process.env };
delete env.WEBSITE_LOCAL_REVIEW;
console.log(`LAN candidate: http://${host}:3101`);
console.log(
  "Unpublished article routes and media remain disabled on this preview.",
);
const server = spawn(
  process.execPath,
  [
    "node_modules/next/dist/bin/next",
    "start",
    "--hostname",
    host,
    "--port",
    "3101",
  ],
  { stdio: "inherit", env },
);
for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => server.kill(signal));
}
server.on("error", (error) => {
  console.error(error.message);
  process.exitCode = 1;
});
server.on("exit", (code) => {
  process.exitCode = code || 0;
});
