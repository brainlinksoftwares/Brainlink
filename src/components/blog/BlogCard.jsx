import { Link } from "react-router-dom";
import { ImageIcon, ArrowRight } from "lucide-react";

export default function BlogCard({ post }) {
  return (
    <div className="card" style={{ padding: 0, overflow: "hidden", display: "flex", flexDirection: "column", height: "100%" }}>
      {post.featured_image ? (
        <img
          src={post.featured_image}
          alt={post.title}
          loading="lazy"
          style={{ width: "100%", height: 200, objectFit: "cover", borderBottom: "1px solid var(--border)" }}
        />
      ) : (
        <div style={{ width: "100%", height: 200, background: "var(--bg-card2)", borderBottom: "1px solid var(--border)", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <ImageIcon size={32} style={{ color: "var(--muted)" }} aria-hidden="true" />
        </div>
      )}

      <div style={{ padding: 24, display: "flex", flexDirection: "column", flexGrow: 1 }}>
        <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: 12, lineHeight: 1.4 }}>
          {post.title}
        </h3>
        <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: 24, flexGrow: 1 }}>
          {post.excerpt && post.excerpt.length > 100 ? `${post.excerpt.substring(0, 100)}...` : post.excerpt}
        </p>

        <Link
          to={`/blog/${post.slug}`}
          style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.85rem", color: "var(--accent)", textDecoration: "none", display: "inline-flex", alignItems: "center", gap: 6 }}
        >
          Read Article <ArrowRight size={14} aria-hidden="true" />
        </Link>
      </div>
    </div>
  );
}
