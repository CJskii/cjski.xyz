import { readFileSync } from "node:fs";
import path from "node:path";
export default function responsiveFigures() {
  return (tree) => {
    let entries = [];
    try {
      entries = JSON.parse(
        readFileSync(path.resolve(".generated/blog/catalogue.json"), "utf8"),
      );
    } catch {
      return;
    }
    const pairs = new Map();
    for (const entry of entries)
      for (const asset of entry.assets || []) {
        if (asset.url.endsWith("-desktop.svg")) {
          const other = entry.assets.find(
            (a) => a.url === asset.url.replace("-desktop.svg", "-mobile.svg"),
          );
          if (other) pairs.set(asset.url, other.url);
        }
      }
    function walk(node) {
      for (const [index, child] of (node.children || []).entries()) {
        if (
          child.type === "element" &&
          child.tagName === "img" &&
          pairs.has(child.properties?.src)
        )
          node.children[index] = {
            type: "element",
            tagName: "picture",
            properties: {},
            children: [
              {
                type: "element",
                tagName: "source",
                properties: {
                  media: "(max-width: 600px)",
                  srcSet: pairs.get(child.properties.src),
                },
                children: [],
              },
              child,
            ],
          };
        else walk(child);
      }
    }
    walk(tree);
  };
}
