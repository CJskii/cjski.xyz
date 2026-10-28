import { defineConfig } from "astro/config";
import expressiveCode from "astro-expressive-code";
import tailwindcss from "@tailwindcss/vite";
import { unified } from "@astrojs/markdown-remark";
import rehypeSanitize, { defaultSchema } from "rehype-sanitize";
import responsiveFigures from "../scripts/blog/responsive-figures.mjs";
import sourceLinks from "../scripts/blog/source-links.mjs";
export default defineConfig({
  compressHTML: true,
  site: "https://cjski.dev",
  base:
    process.env.BLOG_PRIVATE_PREVIEW === "1"
      ? process.env.BLOG_PREVIEW_BASE || "/blog"
      : "/blog",
  trailingSlash: "never",
  output: "static",
  outDir: "../.generated/blog/dist",
  publicDir: "../.generated/blog/public",
  integrations: [
    expressiveCode({
      themes: ["github-light", "github-dark"],
      useDarkModeMediaQuery: false,
      themeCssSelector: (theme) =>
        theme.type === "dark" ? ".dark" : ":root:not(.dark)",
    }),
  ],
  markdown: {
    processor: unified({
      rehypePlugins: [
        responsiveFigures,
        [
          rehypeSanitize,
          {
            ...defaultSchema,
            tagNames: [...defaultSchema.tagNames, "picture", "source"],
            attributes: {
              ...defaultSchema.attributes,
              source: ["srcSet", "media"],
            },
          },
        ],
        sourceLinks,
      ],
    }),
  },
  vite: {
    plugins: [tailwindcss()],
    define: {
      __HERMES_PRIVATE_PREVIEW__: JSON.stringify(
        process.env.BLOG_PRIVATE_PREVIEW === "1",
      ),
      __HERMES_PREVIEW_SLUG__: JSON.stringify(""),
    },
  },
});
