import { chmod, readdir } from "node:fs/promises";
import path from "node:path";
// Only compiled static output is shared with the unprivileged preview server.
// Draft source, evidence and review directories retain their private modes.
export async function readableStaticOutput(folder) {
  const entries = await readdir(folder, { withFileTypes: true });
  for (const entry of entries) {
    const target = path.join(folder, entry.name);
    if (entry.isSymbolicLink()) throw Error("Static output symlink rejected");
    if (entry.isDirectory()) await readableStaticOutput(target);
    else if (entry.isFile()) await chmod(target, 0o644);
    else throw Error("Unexpected static output entry");
  }
  await chmod(folder, 0o755);
}
