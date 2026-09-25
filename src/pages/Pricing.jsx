import { Link } from "react-router-dom";
import { Check, X as XIcon } from "lucide-react";
import Layout from "../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import FAQAccordion from "../components/FAQAccordion";
import Reveal from "../components/Reveal";
import { engagementModels } from "../data/engagementModels";
import { pricingFaqs } from "../data/faqs";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/pricing"];

export default function Pricing() {
  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/pricing"
        jsonLd={[organizationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Pricing", path: "/pricing" }])]}
      />

      <PageHero
        label="Pricing & Engagement"
        title="Clear Engagement Models, Not Rigid Packages"
        subtitle="Software development doesn't fit neatly into fixed tiers. Here's how we structure engagements, what's included, and where the real cost drivers are."
      />

      <section className="section">
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, alignItems: "start" }}>
            {engagementModels.map((m, i) => (
              <Reveal key={m.id} delay={i * 0.05}>
                <div
                  style={{
                    background: m.highlight ? "rgba(var(--accent-rgb),0.06)" : "var(--bg-card)",
                    border: m.highlight ? "2px solid var(--accent)" : "1px solid var(--border)",
                    borderRadius: 16,
                    padding: 32,
                    position: "relative",
                    height: "100%",
                    display: "flex",
                    flexDirection: "column",
                  }}
                >
                  {m.tag && (
                    <div
                      style={{
                        position: "absolute", top: -14, left: "50%", transform: "translateX(-50%)",
                        background: "var(--accent)", color: "#fff", fontFamily: "var(--font-heading)",
                        fontWeight: 600, fontSize: "0.72rem", padding: "4px 14px", borderRadius: 50, whiteSpace: "nowrap",
                      }}
                    >
                      {m.tag}
                    </div>
                  )}

                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", marginBottom: 6 }}>{m.name}</h3>
                  <p style={{ fontSize: "0.82rem", color: "var(--muted)", marginBottom: 18, lineHeight: 1.6 }}>{m.desc}</p>

                  <div style={{ marginBottom: 22 }}>
                    <span style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.7rem", color: "var(--text)" }}>{m.startingPrice}</span>
                    <div style={{ color: "var(--muted2)", fontSize: "0.78rem", marginTop: 2 }}>{m.priceNote}</div>
                  </div>

                  <div style={{ marginBottom: 16 }}>
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                      Included
                    </p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                      {m.includes.map((inc) => (
                        <li key={inc} style={{ display: "flex", gap: 8, fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                          <Check size={14} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" /> {inc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ marginBottom: 20 }}>
                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.7rem", fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 10 }}>
                      Not Included
                    </p>
                    <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 9 }}>
                      {m.excludes.map((exc) => (
                        <li key={exc} style={{ display: "flex", gap: 8, fontSize: "0.82rem", color: "var(--muted2)", lineHeight: 1.5 }}>
                          <XIcon size={14} style={{ flexShrink: 0, marginTop: 2 }} aria-hidden="true" /> {exc}
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div style={{ borderTop: "1px solid var(--border)", paddingTop: 16, marginBottom: 20, display: "flex", flexDirection: "column", gap: 8 }}>
                    <p style={{ fontSize: "0.76rem", color: "var(--muted2)", lineHeight: 1.6 }}><strong style={{ color: "var(--muted)" }}>Conditions: </strong>{m.conditions}</p>
                    <p style={{ fontSize: "0.76rem", color: "var(--muted2)", lineHeight: 1.6 }}><strong style={{ color: "var(--muted)" }}>Revisions: </strong>{m.revisions}</p>
                    <p style={{ fontSize: "0.76rem", color: "var(--muted2)", lineHeight: 1.6 }}><strong style={{ color: "var(--muted)" }}>Support: </strong>{m.support}</p>
                  </div>

                  <Link
                    to="/contact"
                    style={{
                      marginTop: "auto", display: "block", textAlign: "center",
                      fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.85rem",
                      padding: "12px 20px", borderRadius: 8, textDecoration: "none",
                      background: m.highlight ? "var(--accent)" : "transparent",
                      color: m.highlight ? "#fff" : "var(--accent)",
                      border: m.highlight ? "none" : "1px solid rgba(var(--accent-rgb),0.4)",
                    }}
                  >
                    {m.cta}
                  </Link>
                </div>
              </Reveal>
            ))}
          </div>

          <p style={{ textAlign: "center", marginTop: 40, fontSize: "0.85rem", color: "var(--muted2)" }}>
            Not sure which model fits? <Link to="/contact" style={{ color: "var(--accent)", textDecoration: "none", fontWeight: 500 }}>Request a project estimate</Link> — it's free and comes with a written scope.
          </p>
        </div>
      </section>

      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 760 }}>
          <SectionHeading label="Questions" title="Pricing FAQ" />
          <FAQAccordion items={pricingFaqs} />
        </div>
      </section>

      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--text)", marginBottom: 16 }}>
            Get a Project Estimate
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 32, maxWidth: 440, margin: "0 auto 32px", lineHeight: 1.75 }}>
            Tell us what you're building — we'll follow up with a realistic scope and cost, not a sales pitch.
          </p>
          <Link to="/contact" className="btn-primary" style={{ padding: "14px 32px" }}>Request an Estimate</Link>
        </div>
      </section>
    </Layout>
  );
}
