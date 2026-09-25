import { neon } from "@neondatabase/serverless";
import pageMeta from "../src/data/pageMeta.json";

const BASE_URL = "https://www.brainlink.in";

// Crawl hints per static route; every route in pageMeta.json is included.
const ROUTE_HINTS = {
  "/": { changefreq: "daily", priority: "1.0" },
  "/services": { changefreq: "monthly", priority: "0.9" },
  "/blog": { changefreq: "daily", priority: "0.9" },
  "/work": { changefreq: "weekly", priority: "0.8" },
  "/pricing": { changefreq: "monthly", priority: "0.8" },
  "/contact": { changefreq: "monthly", priority: "0.8" },
  "/careers": { changefreq: "weekly", priority: "0.7" },
  "/privacy-policy": { changefreq: "yearly", priority: "0.3" },
  "/terms": { changefreq: "yearly", priority: "0.3" },
};

const xmlEscape = (s) =>
  String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");

function urlEntry({ loc, lastmod, changefreq = "monthly", priority = "0.7", image }) {
  return [
    "  <url>",
    `    <loc>${xmlEscape(loc)}</loc>`,
    lastmod && `    <lastmod>${lastmod}</lastmod>`,
    `    <changefreq>${changefreq}</changefreq>`,
    `    <priority>${priority}</priority>`,
    image &&
      `    <image:image><image:loc>${xmlEscape(image.loc)}</image:loc><image:title>${xmlEscape(image.title)}</image:title></image:image>`,
    "  </url>",
  ]
    .filter(Boolean)
    .join("\n");
}

async function fetchBlogPosts() {
  if (!process.env.DATABASE_URL) return [];
  try {
    const sql = neon(process.env.DATABASE_URL);
    return await sql`
      SELECT slug, updated_at
      FROM posts
      WHERE status = 'published'
      ORDER BY created_at DESC
    `;
  } catch (err) {
    // A DB hiccup shouldn't take the whole sitemap down — serve static routes.
    console.error("sitemap: failed to load blog posts", err);
    return [];
  }
}

export default async function handler(req, res) {
  const staticUrls = Object.entries(pageMeta).map(([route, meta]) =>
    urlEntry({
      loc: `${BASE_URL}${route === "/" ? "" : route}`,
      ...ROUTE_HINTS[route],
      image: meta.image && { loc: `${BASE_URL}${meta.image}`, title: meta.imageAlt || meta.title },
    })
  );

  const posts = await fetchBlogPosts();
  const blogUrls = posts.map((post) =>
    urlEntry({
      loc: `${BASE_URL}/blog/${post.slug}`,
      lastmod: post.updated_at ? new Date(post.updated_at).toISOString() : undefined,
      changefreq: "weekly",
      priority: "0.8",
    })
  );

  const sitemap = [
    '<?xml version="1.0" encoding="UTF-8"?>',
    '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">',
    ...staticUrls,
    ...blogUrls,
    "</urlset>",
  ].join("\n");

  res.setHeader("Content-Type", "application/xml; charset=utf-8");
  res.setHeader("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400");
  res.status(200).send(sitemap);
}
