import { useEffect, useState } from "react";
import { FileText } from "lucide-react";
import Layout from "../../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema } from "../../components/SEO";
import PageHero from "../../components/PageHero";
import BlogCard from "../../components/blog/BlogCard";
import LoadingState from "../../components/LoadingState";
import ErrorState from "../../components/ErrorState";
import pageMeta from "../../data/pageMeta.json";

const meta = pageMeta["/blog"];

export default function BlogList() {
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetch("/api/posts")
      .then((res) => res.json())
      .then((data) => {
        setPosts(Array.isArray(data) ? data : []);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Blog list fetch error:", err);
        setError(true);
        setLoading(false);
      });
  }, []);

  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/blog"
        jsonLd={[organizationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Insights", path: "/blog" }])]}
      />

      <PageHero label="The Knowledge Library" title="Brainlink Blog" subtitle="Practical notes on software development, web engineering, and building digital products." />

      <section className="section">
        <div className="container">
          {loading ? (
            <LoadingState label="Loading articles..." />
          ) : error ? (
            <ErrorState title="Couldn't load articles" message="Please refresh the page, or check back shortly." />
          ) : posts.length === 0 ? (
            <div style={{ textAlign: "center", padding: "64px 0" }}>
              <FileText size={40} style={{ color: "var(--muted2)", marginBottom: 20 }} aria-hidden="true" />
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1.2rem", color: "var(--text)", marginBottom: 8 }}>No posts yet</h3>
              <p style={{ color: "var(--muted)" }}>Check back later for fresh insights.</p>
            </div>
          ) : (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(300px, 1fr))", gap: 32 }}>
              {posts.map((post) => (
                <BlogCard key={post.id} post={post} />
              ))}
            </div>
          )}
        </div>
      </section>
    </Layout>
  );
}
