import { readFileSync } from "node:fs";
import path from "node:path";
export default function responsiveFigures(options = {}) {
  return (tree) => {
    let entries = [];
    try {
      entries = JSON.parse(
        readFileSync(
          options.cataloguePath ||
            path.resolve(".generated/blog/catalogue.json"),
          "utf8",
        ),
      );
    } catch {
      return;
    }
    const pairs = new Map();
    for (const entry of entries)
      for (const asset of entry.assets || []) {
        if (asset.url.endsWith(".svg") && !asset.url.endsWith("-mobile.svg")) {
          const other = entry.assets.find(
            (a) =>
              a.url === asset.url.replace(/(?:-desktop)?\.svg$/, "-mobile.svg"),
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
                  media: "(max-width: 1050px)",
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
