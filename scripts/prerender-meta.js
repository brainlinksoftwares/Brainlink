/**
 * Post-build step: writes build/<route>/index.html for every static route in
 * src/data/pageMeta.json with that route's <title>, description, canonical,
 * Open Graph and Twitter tags baked into the HTML.
 *
 * Why: this is a client-rendered SPA, so crawlers that don't run JavaScript
 * (WhatsApp, LinkedIn, Facebook, X, Slack link previews) only ever saw the
 * generic index.html. Vercel serves these static files before the SPA
 * rewrite, so /founder now ships founder-specific tags.
 *
 * Tags are marked data-prerender; src/index.js removes them on boot so
 * react-helmet-async is the single source of head tags in the browser.
 */
const fs = require("fs");
const path = require("path");

const SITE_URL = "https://www.brainlink.in";
const SITE_NAME = "Brainlink Softwares";
const DEFAULT_IMAGE = "/logo.png";
const BUILD_DIR = path.join(__dirname, "..", "build");

const pageMeta = require("../src/data/pageMeta.json");

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Must match the title format in src/components/SEO.jsx.
const fullTitle = (title) => (title ? `${title} | ${SITE_NAME}` : SITE_NAME);

function headTags(route, meta, { withUrl }) {
  const title = fullTitle(meta.title);
  const image = `${SITE_URL}${meta.image || DEFAULT_IMAGE}`;
  const imageAlt = meta.imageAlt || SITE_NAME;
  const url = `${SITE_URL}${route === "/" ? "" : route}`;
  const tags = [
    `<title data-prerender>${esc(title)}</title>`,
    `<meta data-prerender name="description" content="${esc(meta.description)}" />`,
    withUrl && `<link data-prerender rel="canonical" href="${esc(url)}" />`,
    `<meta data-prerender property="og:type" content="${esc(meta.type || "website")}" />`,
    `<meta data-prerender property="og:site_name" content="${SITE_NAME}" />`,
    `<meta data-prerender property="og:title" content="${esc(title)}" />`,
    `<meta data-prerender property="og:description" content="${esc(meta.description)}" />`,
    withUrl && `<meta data-prerender property="og:url" content="${esc(url)}" />`,
    `<meta data-prerender property="og:image" content="${esc(image)}" />`,
    `<meta data-prerender property="og:image:alt" content="${esc(imageAlt)}" />`,
    `<meta data-prerender property="og:locale" content="en_IN" />`,
    `<meta data-prerender name="twitter:card" content="summary_large_image" />`,
    `<meta data-prerender name="twitter:site" content="@BrainlinkIndia" />`,
    `<meta data-prerender name="twitter:title" content="${esc(title)}" />`,
    `<meta data-prerender name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta data-prerender name="twitter:image" content="${esc(image)}" />`,
  ];
  return tags.filter(Boolean).join("");
}

function render(template, route, meta, opts) {
  const stripped = template
    .replace(/<title>[\s\S]*?<\/title>/i, "")
    .replace(/<meta[^>]*name="description"[^>]*>/i, "");
  if (!stripped.includes("</head>")) throw new Error("build/index.html has no </head>");
  return stripped.replace("</head>", `${headTags(route, meta, opts)}</head>`);
}

const templatePath = path.join(BUILD_DIR, "index.html");
const template = fs.readFileSync(templatePath, "utf8");

for (const [route, meta] of Object.entries(pageMeta)) {
  if (route === "/") continue;
  const outDir = path.join(BUILD_DIR, route);
  fs.mkdirSync(outDir, { recursive: true });
  fs.writeFileSync(path.join(outDir, "index.html"), render(template, route, meta, { withUrl: true }));
}

// index.html doubles as the SPA fallback for every other URL (blog posts,
// certificate results...), so it gets the home tags without a canonical/og:url
// that would wrongly point those pages at the homepage.
fs.writeFileSync(templatePath, render(template, "/", pageMeta["/"], { withUrl: false }));

console.log(`Prerendered meta for ${Object.keys(pageMeta).length} routes.`);
