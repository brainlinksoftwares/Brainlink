import { useState } from "react";
import { Link } from "react-router-dom";
import Layout from "../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import ProjectCard from "../components/ProjectCard";
import Reveal from "../components/Reveal";
import { verifiedProjects, portfolioCategories } from "../data/portfolio";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/work"];

export default function Work() {
  const [active, setActive] = useState("All Projects");
  const filtered = active === "All Projects" ? verifiedProjects : verifiedProjects.filter((p) => p.category === active);

  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/work"
        jsonLd={[organizationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Work", path: "/work" }])]}
      />

      <PageHero
        label="Case Studies"
        title="Our Work"
        subtitle="Verified engagements only — no invented clients, metrics or results."
      />

      <section className="section">
        <div className="container">
          {portfolioCategories.length > 2 && (
            <div role="group" aria-label="Filter projects by category" style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center", marginBottom: 48 }}>
              {portfolioCategories.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setActive(cat)}
                  aria-pressed={active === cat}
                  style={{
                    padding: "9px 20px",
                    borderRadius: 50,
                    fontFamily: "var(--font-heading)",
                    fontWeight: 600,
                    fontSize: "0.82rem",
                    cursor: "pointer",
                    border: active === cat ? "1px solid var(--accent)" : "1px solid var(--border)",
                    background: active === cat ? "rgba(var(--accent-rgb),0.08)" : "var(--bg-card)",
                    color: active === cat ? "var(--accent)" : "var(--muted)",
                    transition: "all 0.2s",
                  }}
                >
                  {cat}
                </button>
              ))}
            </div>
          )}

          {filtered.length > 0 ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(360px, 1fr))", gap: 32 }}>
              {filtered.map((project) => (
                <Reveal key={project.id} id={project.id} style={{ scrollMarginTop: 100 }}>
                  <ProjectCard project={project} detailed />
                </Reveal>
              ))}
            </div>
          ) : (
            <p style={{ textAlign: "center", color: "var(--muted)" }}>No projects in this category yet.</p>
          )}
        </div>
      </section>

      <section style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", padding: "80px 24px", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(1.6rem,4vw,2.4rem)", color: "var(--text)", marginBottom: 14 }}>
            Want to be our next case study?
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 32, maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.75 }}>
            Tell us what you're building and we'll give you an honest read on scope and approach.
          </p>
          <Link to="/contact" className="btn-primary" style={{ padding: "14px 32px" }}>Start a Project</Link>
        </div>
      </section>
    </Layout>
  );
}
