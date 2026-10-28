import test from "node:test";
import assert from "node:assert/strict";
import { createMarkdownProcessor } from "@astrojs/markdown-remark";
import rehypeSanitize from "rehype-sanitize";
import sourceLinks from "../scripts/blog/source-links.mjs";

test("numbered references and readable source bullets render as safe new-tab links", async () => {
  const processor = await createMarkdownProcessor({
    syntaxHighlight: false,
    rehypePlugins: [rehypeSanitize, sourceLinks],
  });
  const { code } = await processor.render(
    "A container is a process.[[1]](https://docs.docker.com/example)\n\n## Sources\n\n- **[1]** [Docker: What is a container?](https://docs.docker.com/example)\n- **[21]** [Citizens Advice: unused subscriptions](https://www.citizensadvice.org.uk/example)",
  );
  assert.match(code, /class="source-citation"/);
  assert.match(code, /aria-label="Source 1 \(opens in a new tab\)"/);
  assert.match(code, />\[1\]<\/a>/);
  assert.match(code, /class="article-sources"/);
  assert.equal((code.match(/target="_blank"/g) || []).length, 3);
  assert.equal((code.match(/rel="noopener noreferrer"/g) || []).length, 3);
  assert.match(code, /<li><strong>\[21\]<\/strong>/);
});

test("internal navigation, code samples and stripped unsafe links keep their boundaries", async () => {
  const processor = await createMarkdownProcessor({
    syntaxHighlight: false,
    rehypePlugins: [rehypeSanitize, sourceLinks],
  });
  const { code } = await processor.render(
    "[About](/about) [Internal](https://cjski.dev/blog/example) [Unsafe](javascript:alert)\n\n`[1]`",
  );
  assert.doesNotMatch(code, /target="_blank"/);
  assert.doesNotMatch(code, /href="javascript:/);
  assert.match(code, /<code>\[1\]<\/code>/);
});
