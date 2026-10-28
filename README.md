# CJSKI / Cold Boot

Personal portfolio for CJSKI, a software and AI engineer. The site includes
selected projects, earlier engineering work, a self-hosted Lab, public GitHub
activity, contact options and Cold Boot publication links.

## Development

Use Node 24 and npm; the npm lockfile replaces the old Bun lockfile.

```sh
nvm use
npm ci
npm run dev
```

Development binds to loopback. Production builds exclude unpublished articles.

```sh
npm run typecheck
npm test
npm run build
npm run start:local
```

The framework-specific contributor instructions are in [AGENTS.md](AGENTS.md).

## Preview from another computer

After building, run:

```sh
npm run preview:lan
```

The launcher binds port 3101 to a private Ethernet/Wi-Fi IPv4 address and prints
the URL. Open that URL on a computer on the same network. Set
`WEBSITE_PREVIEW_HOST` to choose a different private interface. The LAN preview
clears the draft-review flag; unpublished articles and their media stay blocked.

## Content and identity

- `src/lib/site.ts`: public identity, navigation, booking and publication URLs.
- `content/project-register.json`: featured/earlier project placement and scope.
- `content/featured-projects.json`: additional public projects.
- `content/project-dates.json`: repository creation dates used for sorting.
- `content/etherway-case-study.json`: source-backed Etherway case study.
- `content/lab-projects.json`: Lab entries; companion JSON files hold services,
  agent roles, home automations and selected integrations.
- `content/github-snapshot.json`: dated fallback for bounded public GitHub reads.

Existing numeric project routes remain available even when a project is not
featured. The contracts page is a read-only historical index. Wallet/auth demo
routes are retired; the old transaction API returns HTTP 410.

The newsletter points to the owner-provided Beehiiv signup. The homepage card and
newsletter page open it in a new tab. The /blog index now lists explicitly released articles rendered by the bundled Astro build. The
site does not collect email addresses or send newsletters itself.

## Private article review

Unpublished packages belong under `content/private/`, outside `public/` and
ignored by Git. Re-import the approved draft package on a fresh checkout:

```sh
npm run import:article -- /absolute/path/to/reviewed-package
npm run review
```

The private review server binds to loopback on port 3100. Its draft and media
routes require an explicit review flag, loopback socket/host and no forwarded
headers. For access from another computer, use your existing authenticated SSH
connection to forward port 3100 locally. Do not expose the review server publicly.

The importer checks the package's draft/publication state and file hashes.
Changes to reviewed content require a fresh package; layout changes require
fresh render checks. Public pages, sitemap and feed filter out drafts, fixtures,
future posts and content without publication authorisation.

## Browser and route verification

With the production preview and private review server running:

```sh
npm run test:http
npm run test:browser
node scripts/verify-expansion.mjs
```

Install Chromium with `npx playwright install chromium`, or set
`PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` to an existing compatible executable.
Set `WEBSITE_PUBLIC_TEST_URL` and `WEBSITE_REVIEW_URL` when using different
preview addresses. Results and screenshots are generated under `docs/website/`
and remain local review artifacts.

Builds and browser checks verify the candidate; they do not establish that a
public deployment, provider signup confirmation or email delivery has succeeded.

## Visual assets

Project covers and hardware artwork are original SVG/code illustrations, not
screenshots of working applications or exact product photographs. Existing
project banners are retained where available. Hardware model labels and private
endpoints are omitted. Animation respects reduced motion by default; explicit
play/pause is remembered in the browser.

Tool-logo sources and attribution are in [BRAND_ASSETS.md](docs/website/BRAND_ASSETS.md).
Font licences are under `public/fonts/`.

Private handoff notes, unpublished source and generated review records stay out
of version control. Local commits do not grant approval to push, deploy or
publish an article.
