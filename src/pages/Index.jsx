import { Link } from "react-router-dom";
import { ArrowRight, Phone } from "lucide-react";
import Layout from "../common/Layout";
import SEO, { organizationSchema } from "../components/SEO";
import HeroVisual from "../components/HeroVisual";
import { BrowserMockup, PhoneMockup } from "../components/ProductMockup";
import SectionHeading from "../components/SectionHeading";
import ServiceCard from "../components/ServiceCard";
import ProjectCard from "../components/ProjectCard";
import ProcessSteps from "../components/ProcessSteps";
import TechStack from "../components/TechStack";
import FounderSpotlight from "../components/FounderSpotlight";
import Reveal, { StaggerGroup, StaggerItem } from "../components/Reveal";
import { WhatsAppIcon } from "../components/icons/BrandIcons";
import { homeServices } from "../data/services";
import { processSteps } from "../data/process";
import { techModules } from "../data/techStack";
import { featuredProjects } from "../data/portfolio";
import { whyBrainlink } from "../data/values";
import { internshipHighlights } from "../data/careers";
import { siteConfig } from "../data/siteConfig";

export default function Index() {
  const omPictures = featuredProjects.find((p) => p.id === "om-pictures");

  return (
    <Layout>
      <SEO
        title="Custom Software, Web & Mobile App Development"
        description="Brainlink Softwares builds scalable software, modern web applications, mobile apps and digital products for startups and growing businesses."
        path="/"
        jsonLd={organizationSchema}
      />

      {/* ── 1. HERO ──────────────────────────────────────────── */}
      <section style={{ padding: "112px 24px 80px" }}>
        <div className="container hero-grid" style={{ display: "grid", gridTemplateColumns: "1.05fr 0.95fr", gap: 56, alignItems: "center" }}>
          <Reveal>
            <span className="label">Software Engineering & Digital Product Studio</span>
            <h1
              style={{
                fontSize: "clamp(3.25rem, 6vw, 6rem)",
                fontWeight: 700,
                color: "var(--text)",
                lineHeight: 1.06,
                marginBottom: 22,
                letterSpacing: "-0.02em",
              }}
            >
              Digital Products Built For Real Business Growth.
            </h1>
            <p style={{ fontSize: "1.1rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: 32, maxWidth: 520 }}>
              Brainlink Softwares helps businesses and ambitious founders build scalable software, modern websites,
              mobile applications and digital platforms.
            </p>
            <div style={{ display: "flex", gap: 14, flexWrap: "wrap", marginBottom: 28 }}>
              <Link to="/contact" className="btn-primary" style={{ fontSize: "0.95rem", padding: "13px 26px" }}>
                Start A Project <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <Link to="/work" className="btn-secondary" style={{ fontSize: "0.95rem", padding: "13px 26px" }}>
                View Our Work
              </Link>
            </div>
            <p style={{ fontSize: "0.85rem", color: "var(--muted2)" }}>
              Strategy, design, development and technical support under one roof.
            </p>
          </Reveal>

          <Reveal delay={0.1} className="hero-visual-wrap">
            <HeroVisual />
          </Reveal>
        </div>
      </section>

      {/* ── 2. SELECTED CLIENT WORK ──────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-card2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <SectionHeading
            label="Our Work"
            title="Selected Client Work"
            subtitle="Verified engagements — shown honestly, without an inflated client count."
          />
          <StaggerGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(320px, 1fr))", gap: 28 }}>
            {featuredProjects.map((project) => (
              <StaggerItem key={project.id}>
                <ProjectCard project={project} />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── 3. SERVICES ───────────────────────────────────────── */}
      <section className="section" id="services">
        <div className="container">
          <SectionHeading
            label="What We Do"
            title="Services Built Around Your Product"
            subtitle="From a first working prototype to a fully scaled platform."
          />
          <StaggerGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(260px, 1fr))", gap: 20 }}>
            {homeServices.map((s) => (
              <StaggerItem key={s.id}>
                <ServiceCard service={s} />
              </StaggerItem>
            ))}
          </StaggerGroup>
          <div style={{ textAlign: "center", marginTop: 40 }}>
            <Link to="/services" className="btn-secondary" style={{ fontSize: "0.9rem" }}>
              View All Services <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 4. FEATURED PROJECT: OM PICTURES ─────────────────── */}
      {omPictures && (
        <section className="section">
          <div className="container">
            <div className="editorial-grid editorial-grid-reverse" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 56, alignItems: "center" }}>
              <Reveal className="editorial-visual-first" style={{ position: "relative" }}>
                <BrowserMockup accent="#B45309" style={{ maxWidth: 420, margin: "0 auto" }} />
                <PhoneMockup accent="#B45309" style={{ position: "absolute", bottom: -20, left: "8%" }} />
              </Reveal>
              <Reveal delay={0.1}>
                <span className="label">{omPictures.industry}</span>
                <h2 className="section-title">{omPictures.headline}</h2>
                <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.75, marginBottom: 24 }}>
                  {omPictures.shortDescription}
                </p>
                <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 28 }}>
                  {omPictures.services.map((s) => (
                    <span key={s} className="tech-pill" style={{ fontSize: "0.75rem" }}>{s}</span>
                  ))}
                </div>
                <Link to={`/work#${omPictures.id}`} className="btn-secondary" style={{ fontSize: "0.9rem" }}>
                  View Case Study <ArrowRight size={15} aria-hidden="true" />
                </Link>
              </Reveal>
            </div>
          </div>
        </section>
      )}

      {/* ── 5. HOW WE WORK ───────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-card2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <SectionHeading label="Our Process" title="How We Work" subtitle="A clear, proven process — so you always know what's happening next." />
          <ProcessSteps steps={processSteps} />
        </div>
      </section>

      {/* ── 6. WHY BRAINLINK SOFTWARES ───────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionHeading label="Why Brainlink Softwares" title="What You Can Expect Working With Us" />
          <StaggerGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 40 }}>
            {whyBrainlink.map((w) => (
              <StaggerItem key={w.title}>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", color: "var(--text)", marginBottom: 8 }}>{w.title}</h3>
                <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.7 }}>{w.desc}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
          <div style={{ marginTop: 88 }}>
            <FounderSpotlight label="Led by the Founder" />
          </div>
        </div>
      </section>

      {/* ── 7. TECHNOLOGY STACK ──────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-card2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <SectionHeading label="Our Stack" title="Technologies We Build With" subtitle="Verified technologies we actually use in production — nothing aspirational." />
          <TechStack modules={techModules} />
        </div>
      </section>

      {/* ── 8. CAREERS AND INTERNSHIPS ───────────────────────── */}
      <section className="section" id="careers">
        <div className="container">
          <SectionHeading
            label="Careers & Internships"
            title="Learn By Building Real Digital Products."
            subtitle="For students, fresh graduates and developers who want practical, mentored experience — subject to current availability."
          />
          <StaggerGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, marginBottom: 40 }}>
            {internshipHighlights.map((h) => {
              const Icon = h.icon;
              return (
                <StaggerItem key={h.title} className="card" style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "var(--accent)" }}>
                    <Icon size={24} strokeWidth={1.75} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.95rem", color: "var(--text)", marginBottom: 6 }}>{h.title}</h3>
                  <p style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.6 }}>{h.desc}</p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
          <div style={{ textAlign: "center" }}>
            <Link to="/careers" className="btn-primary" style={{ fontSize: "0.9rem" }}>
              Explore Opportunities <ArrowRight size={15} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>

      {/* ── 9. FINAL CTA ─────────────────────────────────────── */}
      <section style={{ padding: "96px 24px", textAlign: "center", background: "var(--accent-soft)", borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <Reveal>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(2rem, 4.5vw, 3rem)", color: "var(--text)", marginBottom: 16 }}>
              Have A Digital Product In Mind?
            </h2>
            <p style={{ color: "var(--muted)", fontSize: "1rem", marginBottom: 36, lineHeight: 1.75, maxWidth: 480, margin: "0 auto 36px" }}>
              Let's discuss your idea and create a practical plan to design, develop and launch it.
            </p>
            <div style={{ display: "flex", gap: 16, justifyContent: "center", flexWrap: "wrap" }}>
              <Link to="/contact" className="btn-primary" style={{ fontSize: "0.95rem", padding: "13px 28px" }}>
                <Phone size={16} aria-hidden="true" /> Start A Project
              </Link>
              <a href={siteConfig.whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ fontSize: "0.95rem", padding: "13px 28px" }}>
                <WhatsAppIcon width={17} height={17} /> Chat On WhatsApp
              </a>
            </div>
          </Reveal>
        </div>
      </section>

      <style>{`
        @media (max-width: 900px) {
          .hero-grid, .editorial-grid { grid-template-columns: 1fr !important; }
          .hero-visual-wrap { order: -1; }
          .editorial-grid-reverse .editorial-visual-first { order: -1; }
        }
      `}</style>
    </Layout>
  );
}
