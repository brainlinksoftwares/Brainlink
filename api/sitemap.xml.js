import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {
  try {
    const baseUrl = "https://www.brainlink.in";

    // Fetch published blogs
    const posts = await sql`
      SELECT slug, updated_at
      FROM posts
      WHERE status='published'
      ORDER BY created_at DESC
    `;

    const blogUrls = posts.map(post => `
      <url>
        <loc>${baseUrl}/blog/${post.slug}</loc>
        <lastmod>${new Date(post.updated_at).toISOString()}</lastmod>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>
    `).join("");

    const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
    <urlset 
      xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"
      xmlns:news="http://www.google.com/schemas/sitemap-news/0.9"
      xmlns:xhtml="http://www.w3.org/1999/xhtml"
      xmlns:image="http://www.google.com/schemas/sitemap-image/1.1"
      xmlns:video="http://www.google.com/schemas/sitemap-video/1.1">

      <!-- Homepage -->
      <url>
        <loc>${baseUrl}</loc>
        <changefreq>daily</changefreq>
        <priority>1.0</priority>
      </url>

      <!-- Static Pages -->
      <url>
        <loc>${baseUrl}/services</loc>
        <changefreq>monthly</changefreq>
        <priority>0.9</priority>
      </url>

      <url>
        <loc>${baseUrl}/work</loc>
        <changefreq>weekly</changefreq>
        <priority>0.8</priority>
      </url>

      <url>
        <loc>${baseUrl}/about</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
      </url>

      <url>
        <loc>${baseUrl}/founder</loc>
        <changefreq>monthly</changefreq>
        <priority>0.7</priority>
        <image:image>
          <image:loc>${baseUrl}/images/founder/aaditya-vishnoi-founder-brainlink-softwares.jpeg</image:loc>
          <image:title>Aaditya Vishnoi, Founder of Brainlink Softwares</image:title>
        </image:image>
      </url>

      <url>
        <loc>${baseUrl}/pricing</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>

      <url>
        <loc>${baseUrl}/careers</loc>
        <changefreq>weekly</changefreq>
        <priority>0.7</priority>
      </url>

      <url>
        <loc>${baseUrl}/contact</loc>
        <changefreq>monthly</changefreq>
        <priority>0.8</priority>
      </url>

      <url>
        <loc>${baseUrl}/privacy-policy</loc>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
      </url>

      <url>
        <loc>${baseUrl}/terms</loc>
        <changefreq>yearly</changefreq>
        <priority>0.3</priority>
      </url>

      <!-- Blog Listing -->
      <url>
        <loc>${baseUrl}/blog</loc>
        <changefreq>daily</changefreq>
        <priority>0.9</priority>
      </url>

      ${blogUrls}

    </urlset>`;

    res.setHeader("Content-Type", "application/xml");
    res.status(200).send(sitemap);

  } catch (err) {
    console.error(err);
    res.status(500).send("Error generating sitemap");
  }
}