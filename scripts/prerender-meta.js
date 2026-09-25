/**
 * Post-build step: writes build/<route>/index.html for every static route in
 * src/data/pageMeta.json with that route's <title>, description, canonical,
 * Open Graph and Twitter tags baked into the HTML.
 *
 * Why: this is a client-rendered SPA, so crawlers that don't run JavaScript
 * (WhatsApp, LinkedIn, Facebook, X, Slack link previews) only ever saw the
 * generic index.html. Vercel serves these static files before the SPA
 * rewrite, so /founder now ships founder-specific tags. Blog posts are
 * handled per request by api/blog-page.js.
 */
const fs = require("fs");
const path = require("path");
const { SITE_URL, injectHead } = require("./headTags");
const pageMeta = require("../src/data/pageMeta.json");

const BUILD_DIR = path.join(__dirname, "..", "build");
const templatePath = path.join(BUILD_DIR, "index.html");
const template = fs.readFileSync(templatePath, "utf8");

for (const [route, meta] of Object.entries(pageMeta)) {
  if (route === "/") continue;
  const outDir = path.join(BUILD_DIR, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), injectHead(template, meta, `${SITE_URL}${route}`));
}

// index.html doubles as the SPA fallback for every other URL (certificate
// results, unknown paths...), so it gets the home tags without a
// canonical/og:url that would wrongly point those pages at the homepage.
fs.writeFileSync(templatePath, injectHead(template, pageMeta["/"], null));

console.log(`Prerendered meta for ${Object.keys(pageMeta).length} routes.`);
