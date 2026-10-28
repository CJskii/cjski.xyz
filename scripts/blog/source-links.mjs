// Trusted post-sanitization presentation for Markdown references and source lists.
const textOf = (node) =>
  node.type === "text"
    ? node.value
    : (node.children || []).map(textOf).join("");
export default function sourceLinks() {
  return (tree) => {
    function visit(node) {
      if (node.type === "element" && node.tagName === "a") {
        const href = node.properties?.href;
        if (typeof href === "string" && /^https?:\/\//i.test(href)) {
          const citation = textOf(node).match(/^\[(\d{1,3})\]$/);
          const url = new URL(href);
          if (citation || url.origin !== "https://cjski.dev") {
            node.properties.target = "_blank";
            const rel = node.properties.rel;
            node.properties.rel = [
              ...new Set([
                ...(Array.isArray(rel)
                  ? rel
                  : typeof rel === "string"
                    ? rel.split(/\s+/)
                    : []),
                "noopener",
                "noreferrer",
              ]),
            ];
          }
          if (citation) {
            node.properties.className = ["source-citation"];
            node.properties.ariaLabel = `Source ${citation[1]} (opens in a new tab)`;
          }
        }
      }
      for (const child of node.children || []) visit(child);
    }
    visit(tree);
    let sources = false;
    for (const node of tree.children || []) {
      if (node.type !== "element") continue;
      if (/^h[12]$/.test(node.tagName))
        sources = /^sources$/i.test(textOf(node).trim());
      if (sources && ["ul", "ol"].includes(node.tagName)) {
        node.properties ||= {};
        node.properties.className = ["article-sources"];
      }
    }
  };
}
