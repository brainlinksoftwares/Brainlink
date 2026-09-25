import { neon } from "@neondatabase/serverless";
import { SITE_URL, injectHead } from "../scripts/headTags.js";
import pageMeta from "../src/data/pageMeta.json";

/**
 * Serves /blog/:slug (see vercel.json) as the SPA's index.html with that
 * post's title, description and featured image injected, so link previews
 * on WhatsApp/LinkedIn/X show the article instead of the homepage card.
 * The React app then boots normally on top of it.
 */
let templateCache = null;

async function loadTemplate(req) {
  if (templateCache) return templateCache;
  const proto = req.headers["x-forwarded-proto"] || "https";
  const res = await fetch(`${proto}://${req.headers.host}/index.html`);
  if (!res.ok) throw new Error(`index.html fetch failed: ${res.status}`);
  templateCache = await res.text();
  return templateCache;
}

// Returns the post, null when it doesn't exist, or undefined when the DB
// couldn't be reached (so a transient error never turns into a 404).
async function loadPost(slug) {
  if (!slug) return null;
  if (!process.env.DATABASE_URL) return undefined;
  try {
    const sql = neon(process.env.DATABASE_URL);
    const rows = await sql`
      SELECT title, meta_title, meta_description, excerpt, featured_image
      FROM posts
      WHERE slug = ${slug} AND status = 'published'
      LIMIT 1
    `;
    return rows[0] || null;
  } catch (err) {
    console.error("blog-page: failed to load post", err);
    return undefined;
  }
}

export default async function handler(req, res) {
  const slug = String(req.query.slug || "");
  let html;
  try {
    html = await loadTemplate(req);
  } catch (err) {
    console.error(err);
    res.status(502).send("Temporarily unavailable");
    return;
  }

  const post = await loadPost(slug);
  if (post) {
    html = injectHead(
      html,
      {
        title: post.meta_title || post.title,
        description: post.meta_description || post.excerpt || `Read ${post.title} on the Brainlink Softwares blog.`,
        image: post.featured_image || pageMeta["/blog"].image,
        imageAlt: post.title,
        type: "article",
      },
      `${SITE_URL}/blog/${encodeURIComponent(slug)}`
    );
  }

  res.setHeader("Content-Type", "text/html; charset=utf-8");
  res.setHeader("Cache-Control", "public, max-age=0, s-maxage=600, stale-while-revalidate=86400");
  // Unknown posts still get the app (it renders its own not-found state).
  res.status(post === null ? 404 : 200).send(html);
}
