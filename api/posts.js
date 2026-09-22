import { neon } from "@neondatabase/serverless";

const sql = neon(process.env.DATABASE_URL);

export default async function handler(req, res) {

  try {
    const posts = await sql`
      SELECT id,title,slug,excerpt,featured_image,created_at
FROM posts
WHERE status='published'
ORDER BY created_at DESC
    `;

    res.status(200).json(posts);

  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}
