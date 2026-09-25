/**
 * Builds the crawler-facing <head> tags (title, description, canonical,
 * Open Graph, Twitter) and injects them into the built index.html.
 *
 * Shared by scripts/prerender-meta.js (static routes, at build time) and
 * api/blog-page.js (blog posts, per request). Output must stay in sync with
 * what src/components/SEO.jsx renders in the browser.
 *
 * Every tag carries data-prerender; src/index.js strips them on boot so
 * react-helmet-async owns the head once the app runs.
 */
const SITE_URL = "https://www.brainlink.in";
const SITE_NAME = "Brainlink Softwares";
const OG_CARD = { width: 1200, height: 630 };

const esc = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/"/g, "&quot;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fullTitle = (title) => (title ? `${title} | ${SITE_NAME}` : SITE_NAME);

/**
 * @param {object} meta  { title, description, image, imageAlt, type }
 * @param {string|null} url  absolute canonical URL, or null to omit canonical/og:url
 */
function headTags(meta, url) {
  const title = fullTitle(meta.title);
  const image = meta.image.startsWith("http") ? meta.image : `${SITE_URL}${meta.image}`;
  const isCard = meta.image.startsWith("/og/");
  const imageAlt = meta.imageAlt || title;
  const tag = (html) => html.replace(/^<(\w+)/, "<$1 data-prerender");
  return [
    `<title>${esc(title)}</title>`,
    `<meta name="description" content="${esc(meta.description)}" />`,
    url && `<link rel="canonical" href="${esc(url)}" />`,
    `<meta property="og:type" content="${esc(meta.type || "website")}" />`,
    `<meta property="og:site_name" content="${SITE_NAME}" />`,
    `<meta property="og:title" content="${esc(title)}" />`,
    `<meta property="og:description" content="${esc(meta.description)}" />`,
    url && `<meta property="og:url" content="${esc(url)}" />`,
    `<meta property="og:image" content="${esc(image)}" />`,
    `<meta property="og:image:secure_url" content="${esc(image)}" />`,
    isCard && `<meta property="og:image:type" content="image/jpeg" />`,
    isCard && `<meta property="og:image:width" content="${OG_CARD.width}" />`,
    isCard && `<meta property="og:image:height" content="${OG_CARD.height}" />`,
    `<meta property="og:image:alt" content="${esc(imageAlt)}" />`,
    `<meta property="og:locale" content="en_IN" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="twitter:site" content="@BrainlinkIndia" />`,
    `<meta name="twitter:title" content="${esc(title)}" />`,
    `<meta name="twitter:description" content="${esc(meta.description)}" />`,
    `<meta name="twitter:image" content="${esc(image)}" />`,
    `<meta name="twitter:image:alt" content="${esc(imageAlt)}" />`,
  ]
    .filter(Boolean)
    .map(tag)
    .join("");
}

/** Replace the template's generic title/description with route-specific tags. */
function injectHead(html, meta, url) {
  const stripped = html
    .replace(/<title[^>]*>[\s\S]*?<\/title>/i, "")
    .replace(/<meta[^>]*name="description"[^>]*>/i, "")
    // Drop any tags a previous injection left behind.
    .replace(/<(?:meta|link)[^>]*data-prerender[^>]*>/gi, "");
  if (!stripped.includes("</head>")) throw new Error("index.html has no </head>");
  return stripped.replace("</head>", `${headTags(meta, url)}</head>`);
}

module.exports = { SITE_URL, SITE_NAME, headTags, injectHead };
