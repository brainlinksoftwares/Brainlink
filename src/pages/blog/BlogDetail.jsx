import { useParams, Link } from "react-router-dom";
import { useEffect, useState, useRef, useCallback } from "react";
import { ArrowLeft, Calendar, Share2 } from "lucide-react";
import { LinkedInIcon, XIcon, WhatsAppIcon } from "../../components/icons/BrandIcons";
import Layout from "../../common/Layout";
import SEO, { articleSchema, breadcrumbSchema, SITE_URL } from "../../components/SEO";
import pageMeta from "../../data/pageMeta.json";
import LoadingState from "../../components/LoadingState";
import BlogCard from "../../components/blog/BlogCard";

function slugify(text) {
  return text.toLowerCase().trim().replace(/[^\w\s-]/g, "").replace(/\s+/g, "-");
}
export default function BlogDetail() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [toc, setToc] = useState([]);
  const contentRef = useRef(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchPost() {
      setLoading(true);
      setNotFound(false);
      try {
        const res = await fetch(`/api/posts/${slug}`);
        if (res.status === 404) { if (!cancelled) { setNotFound(true); setPost(null); } return; }
        if (!res.ok) throw new Error("Failed to fetch");
        const data = await res.json();
        const postData = Array.isArray(data) ? data[0] : data;
        if (!cancelled) setPost(postData || null);
      } catch (err) {
        console.error("Blog fetch error:", err);
        if (!cancelled) setPost(null);
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchPost();
    return () => { cancelled = true; };
  }, [slug]);

  useEffect(() => {
    fetch("/api/posts")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRelated(data.filter((p) => p.slug !== slug).slice(0, 3));
      })
      .catch(() => {});
  }, [slug]);

  const buildToc = useCallback(() => {
    if (!contentRef.current) return;
    const headings = contentRef.current.querySelectorAll("h2, h3");
    const items = [];
    headings.forEach((h) => {
      const id = h.id || slugify(h.textContent || "");
      h.id = id;
      items.push({ id, text: h.textContent, level: h.tagName });
    });
    setToc(items);
  }, []);

  useEffect(() => {
    if (post?.content) {
      const t = setTimeout(buildToc, 0);
      return () => clearTimeout(t);
    }
  }, [post, buildToc]);

  const pageUrl = `${SITE_URL}/blog/${slug}`;

  return (
    <Layout>
      {post && (
        <SEO
          title={post.meta_title || post.title}
          description={post.meta_description || post.excerpt || `Read ${post.title} on the Brainlink Softwares blog.`}
          path={`/blog/${slug}`}
          image={post.featured_image || pageMeta["/blog"].image}
          imageAlt={post.title}
          type="article"
          jsonLd={[
            articleSchema({
              title: post.title,
              description: post.excerpt,
              image: post.featured_image,
              datePublished: post.created_at,
              dateModified: post.updated_at,
              path: `/blog/${slug}`,
            }),
            breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/blog" }, { name: post.title, path: `/blog/${slug}` }]),
          ]}
        />
      )}

      <main style={{ minHeight: "70vh", padding: "104px 24px 64px" }}>
        {loading ? (
          <LoadingState label="Loading article..." minHeight={320} />
        ) : notFound || !post ? (
          <div style={{ textAlign: "center", padding: "80px 0" }}>
            <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(1.5rem,4vw,2.5rem)", color: "var(--text)", marginBottom: 12 }}>Article Not Found</h1>
            <p style={{ color: "var(--muted)", marginBottom: 24 }}>The post you're looking for was moved or deleted.</p>
            <Link to="/blog" className="btn-primary">Back to Blog</Link>
          </div>
        ) : (
          <article style={{ maxWidth: 760, margin: "0 auto" }}>
            <Link to="/blog" style={{ display: "inline-flex", alignItems: "center", gap: 6, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.85rem", marginBottom: 32 }}>
              <ArrowLeft size={15} aria-hidden="true" /> Back to articles
            </Link>

            {post.featured_image && (
              <img
                src={post.featured_image}
                alt={post.title}
                style={{ width: "100%", maxHeight: 450, objectFit: "cover", borderRadius: 16, marginBottom: 40, border: "1px solid var(--border)" }}
              />
            )}

            <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(2rem, 5vw, 3.2rem)", color: "var(--text)", lineHeight: 1.15, marginBottom: 24, letterSpacing: "-0.02em" }}>
              {post.title}
            </h1>

            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 16, color: "var(--muted)", fontFamily: "var(--font-body)", fontSize: "0.85rem", marginBottom: 32, borderBottom: "1px solid var(--border)", paddingBottom: 24 }}>
              {post.created_at && (
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <Calendar size={15} aria-hidden="true" />
                  <time dateTime={post.created_at}>{new Date(post.created_at).toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" })}</time>
                </div>
              )}
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: "0.8rem" }}><Share2 size={14} aria-hidden="true" /> Share:</span>
                <a href={`https://x.com/intent/tweet?url=${encodeURIComponent(pageUrl)}&text=${encodeURIComponent(post.title)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on X" style={{ color: "var(--muted)" }}>
                  <XIcon width={16} height={16} />
                </a>
                <a href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(pageUrl)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on LinkedIn" style={{ color: "var(--muted)" }}>
                  <LinkedInIcon width={16} height={16} />
                </a>
                <a href={`https://wa.me/?text=${encodeURIComponent(`${post.title} ${pageUrl}`)}`} target="_blank" rel="noopener noreferrer" aria-label="Share on WhatsApp" style={{ color: "var(--muted)" }}>
                  <WhatsAppIcon width={16} height={16} />
                </a>
              </div>
            </div>

            {post.excerpt && (
              <p style={{ color: "var(--text)", fontSize: "1.15rem", lineHeight: 1.7, marginBottom: 40, fontWeight: 500 }}>
                {post.excerpt}
              </p>
            )}

            {toc.length > 1 && (
              <nav aria-label="Table of contents" style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 12, padding: "20px 24px", marginBottom: 40 }}>
                <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.8rem", color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 12 }}>On this page</p>
                <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 8 }}>
                  {toc.map((item) => (
                    <li key={item.id} style={{ paddingLeft: item.level === "H3" ? 16 : 0 }}>
                      <a href={`#${item.id}`} style={{ fontSize: "0.85rem", color: "var(--accent)", textDecoration: "none" }}>{item.text}</a>
                    </li>
                  ))}
                </ul>
              </nav>
            )}

            {post.content ? (
              <div ref={contentRef} className="prose-dark" dangerouslySetInnerHTML={{ __html: post.content }} />
            ) : (
              <p style={{ color: "var(--muted)", fontSize: "1.1rem", lineHeight: 1.8 }}>No content added yet.</p>
            )}

            {post.keywords?.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 12, marginTop: 48, paddingTop: 32, borderTop: "1px solid var(--border)" }}>
                {post.keywords.map((tag) => (
                  <span key={tag} style={{ background: "var(--hamburger-bg)", border: "1px solid var(--border)", color: "var(--muted)", padding: "6px 14px", borderRadius: 50, fontSize: "0.75rem", fontFamily: "var(--font-heading)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                    #{tag}
                  </span>
                ))}
              </div>
            )}

            {related.length > 0 && (
              <div style={{ marginTop: 64, paddingTop: 40, borderTop: "1px solid var(--border)" }}>
                <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", color: "var(--text)", marginBottom: 24 }}>Related Articles</h2>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 24 }}>
                  {related.map((p) => <BlogCard key={p.id} post={p} />)}
                </div>
              </div>
            )}
          </article>
        )}
      </main>

      <style>{`
        .prose-dark { color: var(--text); font-family: var(--font-body); line-height: 1.8; font-size: 1.05rem; }
        .prose-dark p { margin-bottom: 24px; color: var(--muted); }
        .prose-dark h2 { font-family: var(--font-heading); font-size: 1.8rem; font-weight: 700; color: var(--text); margin: 48px 0 20px; scroll-margin-top: 90px; }
        .prose-dark h3 { font-family: var(--font-heading); font-size: 1.4rem; font-weight: 600; color: var(--text); margin: 32px 0 16px; scroll-margin-top: 90px; }
        .prose-dark a { color: var(--accent); text-decoration: none; border-bottom: 1px solid transparent; transition: border-color 0.2s; }
        .prose-dark a:hover { border-color: var(--accent); }
        .prose-dark ul, .prose-dark ol { margin-bottom: 24px; padding-left: 24px; color: var(--muted); }
        .prose-dark li { margin-bottom: 10px; }
        .prose-dark strong { color: var(--text); font-weight: 600; }
        .prose-dark img { max-width: 100%; border-radius: 12px; margin: 32px 0; border: 1px solid var(--border); }
      `}</style>
    </Layout>
  );
}
