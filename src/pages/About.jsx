import { Link } from "react-router-dom";
import { MapPin, Target, Eye as EyeIcon } from "lucide-react";
import Layout from "../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import Reveal, { StaggerGroup, StaggerItem } from "../components/Reveal";
import { coreValues } from "../data/values";
import { siteConfig } from "../data/siteConfig";
import FounderSpotlight from "../components/FounderSpotlight";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/about"];

export default function About() {
  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/about"
        jsonLd={[organizationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "About", path: "/about" }])]}
      />

      <PageHero
        label="About Brainlink Softwares"
        title="A Software Studio Built on Direct Collaboration"
        subtitle="We're a small, MSME-registered team of engineers and designers based in Uttar Pradesh, building software for businesses that want a technical partner they can actually reach."
      />

      {/* Introduction */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <Reveal>
            <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.9, marginBottom: 20 }}>
              Brainlink Softwares is a registered MSME enterprise (UDYAM: {siteConfig.msmeUdyam}) specializing in custom
              software development, web design, and long-term software maintenance. We work directly with founders and
              business owners — no outsourcing layer, no account managers relaying messages between you and the people
              actually writing the code.
            </p>
            <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.9 }}>
              We're early in our journey as a public-facing studio, and we'd rather be upfront about that than inflate
              our track record. What we can promise is straightforward: honest scoping, visible progress, and a team
              that stays reachable after launch.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Founder */}
      <section className="section" id="founder" style={{ background: "var(--bg-card2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <FounderSpotlight />
        </div>
      </section>

      {/* Mission / Vision */}
      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }} className="mv-grid">
            <Reveal className="card" style={{ padding: 36 }}>
              <Target size={26} style={{ color: "var(--accent)", marginBottom: 16 }} aria-hidden="true" />
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.2rem", color: "var(--text)", marginBottom: 12 }}>Our Mission</h2>
              <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.8 }}>
                To help businesses and ambitious founders transform ideas into practical, scalable and well-engineered
                digital products.
              </p>
            </Reveal>
            <Reveal delay={0.1} className="card" style={{ padding: 36 }}>
              <EyeIcon size={26} style={{ color: "var(--accent)", marginBottom: 16 }} aria-hidden="true" />
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.2rem", color: "var(--text)", marginBottom: 12 }}>Our Vision</h2>
              <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.8 }}>
                To build a trusted technology company known for honest collaboration, strong engineering and meaningful
                digital innovation.
              </p>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Values */}
      <section className="section">
        <div className="container">
          <SectionHeading label="Our Values" title="What Guides How We Work" />
          <StaggerGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {coreValues.map((v) => {
              const Icon = v.icon;
              return (
                <StaggerItem key={v.title} className="card">
                  <Icon size={22} style={{ color: "var(--accent)", marginBottom: 14 }} strokeWidth={1.8} aria-hidden="true" />
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1rem", color: "var(--text)", marginBottom: 8 }}>{v.title}</h3>
                  <p style={{ fontSize: "0.87rem", color: "var(--muted)", lineHeight: 1.7 }}>{v.desc}</p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Engineering philosophy + how we work */}
      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container philosophy-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56 }}>
          <Reveal>
            <span className="label">Engineering Philosophy</span>
            <h2 className="section-title" style={{ fontSize: "1.6rem" }}>Practical Over Impressive</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.85 }}>
              We choose technology because it solves your problem well, not because it looks good on a portfolio. That
              means simple, maintainable architecture by default — and more sophisticated engineering only when the
              problem actually calls for it. Code you or a future team can read and extend matters more to us than
              clever abstractions.
            </p>
          </Reveal>
          <Reveal delay={0.1}>
            <span className="label">Transparency Commitment</span>
            <h2 className="section-title" style={{ fontSize: "1.6rem" }}>No Surprises, No Jargon</h2>
            <p style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.85 }}>
              You'll know what's being built, why, and what it costs before work starts — and you'll see progress on a
              real staging link, not just a status update. If something is going to take longer or cost more than
              planned, we tell you as soon as we know, not at delivery.
            </p>
          </Reveal>
        </div>
      </section>

      {/* Learning & internship culture */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760, textAlign: "center" }}>
          <SectionHeading label="Learning Culture" title="A Team That Grows Through Real Work" subtitle="We regularly bring in students and early-career developers for practical, mentored internship work — subject to current availability. It's how we keep fresh perspective in the team, and how we give back to people starting their careers." />
          <Link to="/careers" className="btn-secondary" style={{ fontSize: "0.9rem" }}>See Careers & Internships</Link>
        </div>
      </section>

      {/* Location */}
      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ textAlign: "center", maxWidth: 560 }}>
          <MapPin size={26} style={{ color: "var(--accent)", marginBottom: 16 }} aria-hidden="true" />
          <h2 className="section-title" style={{ fontSize: "1.5rem" }}>Where We Work</h2>
          <p style={{ color: "var(--muted)", fontSize: "0.95rem", lineHeight: 1.85, marginBottom: 8 }}>
            Based in {siteConfig.address}. We work remotely with clients across India and take on select engagements
            beyond, depending on time zone overlap and project fit.
          </p>
        </div>
      </section>

      {/* CTA */}
      <section style={{ padding: "80px 24px", textAlign: "center" }}>
        <div className="container">
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--text)", marginBottom: 16 }}>
            Want to work together?
          </h2>
          <Link to="/contact" className="btn-primary" style={{ padding: "14px 32px" }}>Let's Talk</Link>
        </div>
      </section>

      <style>{`
        @media (max-width: 768px) {
          .mv-grid, .philosophy-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
