import { Link } from "react-router-dom";
import { ArrowRight, CheckCircle2 } from "lucide-react";
import Layout from "../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import FAQAccordion from "../components/FAQAccordion";
import Reveal from "../components/Reveal";
import { services } from "../data/services";
import { servicesFaqs } from "../data/faqs";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/services"];

const engagementModels = [
  { title: "Project-Based Development", desc: "A defined scope, timeline and deliverable — best for a single product build with a clear end point." },
  { title: "Dedicated Development Support", desc: "Ongoing monthly capacity for feature work, fixes and improvements on a live product." },
  { title: "Maintenance & Enhancement", desc: "Keeping an existing system secure, updated and running smoothly after another team's build." },
  { title: "Technology Consulting", desc: "An outside technical opinion on architecture, stack choices or a system that's becoming hard to maintain." },
];

export default function Services() {
  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/services"
        jsonLd={[organizationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Services", path: "/services" }])]}
      />

      <PageHero
        label="Our Services"
        title={<>Software Engineering, <span style={{ color: "var(--accent)" }}>End to End.</span></>}
        subtitle="From a first working prototype to enterprise-scale systems — engineering, design and support for every stage of a product's life."
      >
        <Link to="/contact" className="btn-primary" style={{ fontSize: "0.95rem", padding: "14px 32px" }}>
          Start Your Project
        </Link>
      </PageHero>

      {/* Detailed services */}
      {services.map((s, i) => {
        const Icon = s.icon;
        return (
          <section
            key={s.id}
            id={s.id}
            className="section"
            style={{
              scrollMarginTop: 90,
              background: i % 2 === 0 ? "var(--bg)" : "var(--bg-card)",
              borderTop: "1px solid var(--border)",
            }}
          >
            <div className="container">
              <Reveal>
                <div style={{ display: "grid", gridTemplateColumns: "0.9fr 1.1fr", gap: 56, alignItems: "start" }} className="service-detail-grid">
                  <div>
                    <div
                      style={{
                        width: 56, height: 56, borderRadius: 14,
                        background: "rgba(var(--accent-rgb),0.1)", border: "1px solid rgba(var(--accent-rgb),0.2)",
                        display: "flex", alignItems: "center", justifyContent: "center", color: "var(--accent)", marginBottom: 20,
                      }}
                    >
                      <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
                    </div>
                    <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(1.4rem,3vw,1.9rem)", color: "var(--text)", marginBottom: 14, letterSpacing: "-0.01em" }}>
                      {s.title}
                    </h2>
                    <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 20 }}>{s.shortDesc}</p>

                    <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.72rem", fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>
                      Who It's For
                    </p>
                    <p style={{ color: "var(--muted)", fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 24 }}>{s.whoFor}</p>

                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                      {s.tech.map((t) => (
                        <span key={t} className="tech-pill" style={{ fontSize: "0.75rem", padding: "6px 12px" }}>{t}</span>
                      ))}
                    </div>
                  </div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="service-detail-cols">
                    <div className="card">
                      <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.72rem", fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                        Common Problems
                      </p>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                        {s.problems.map((p) => (
                          <li key={p} style={{ display: "flex", gap: 10, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>
                            <span style={{ color: "var(--danger)", flexShrink: 0 }}>•</span> {p}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card">
                      <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.72rem", fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 14 }}>
                        What We Deliver
                      </p>
                      <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
                        {s.deliverables.map((d) => (
                          <li key={d} style={{ display: "flex", gap: 10, fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.6 }}>
                            <CheckCircle2 size={15} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" /> {d}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="card" style={{ gridColumn: "1 / -1" }}>
                      <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.72rem", fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 10 }}>
                        Engagement Process
                      </p>
                      <p style={{ fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.75, marginBottom: 18 }}>{s.process}</p>
                      <Link
                        to="/contact"
                        style={{ display: "inline-flex", alignItems: "center", gap: 6, fontSize: "0.88rem", fontWeight: 600, color: "var(--accent)", textDecoration: "none", fontFamily: "var(--font-heading)" }}
                      >
                        Discuss This Service <ArrowRight size={15} aria-hidden="true" />
                      </Link>
                    </div>
                  </div>
                </div>
              </Reveal>
            </div>
          </section>
        );
      })}

      {/* Engagement models */}
      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <SectionHeading label="How We Engage" title="Engagement Models" subtitle="Different projects need different structures — here's how work with Brainlink Softwares is typically set up." />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {engagementModels.map((m) => (
              <div key={m.title} className="card">
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.98rem", color: "var(--text)", marginBottom: 8 }}>{m.title}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.65 }}>{m.desc}</p>
              </div>
            ))}
          </div>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/pricing" className="btn-secondary" style={{ fontSize: "0.9rem" }}>
              See Pricing & Engagement Details <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <SectionHeading label="Questions" title="Frequently Asked Questions" />
          <FAQAccordion items={servicesFaqs} />
        </div>
      </section>

      {/* CTA */}
      <section style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", padding: "80px 24px", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.8rem)", color: "var(--text)", marginBottom: 16, letterSpacing: "-0.02em" }}>
            Not sure where to start?
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "1rem", marginBottom: 36, lineHeight: 1.75, maxWidth: 460, margin: "0 auto 36px" }}>
            Tell us about your business. We'll recommend what will actually work for you — no upselling.
          </p>
          <Link to="/contact" className="btn-primary" style={{ padding: "14px 32px" }}>Get a Free Consultation</Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 860px) {
          .service-detail-grid { grid-template-columns: 1fr !important; }
        }
        @media (max-width: 560px) {
          .service-detail-cols { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
