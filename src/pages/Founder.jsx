import { Link } from "react-router-dom";
import { MapPin, Quote, ArrowRight, Building2 } from "lucide-react";
import Layout from "../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema, personSchema, profilePageSchema, faqSchema } from "../components/SEO";
import SectionHeading from "../components/SectionHeading";
import FAQAccordion from "../components/FAQAccordion";
import Reveal, { StaggerGroup, StaggerItem } from "../components/Reveal";
import { WhatsAppIcon } from "../components/icons/BrandIcons";
import { founder } from "../data/founder";
import { siteConfig } from "../data/siteConfig";

const PAGE_TITLE = `${founder.name} — ${founder.role}`;

export default function Founder() {
  return (
    <Layout>
      <SEO
        title={PAGE_TITLE}
        description={founder.summary}
        path={founder.path}
        type="profile"
        image={founder.portrait.src}
        imageAlt={founder.portrait.alt}
        profile={{ firstName: founder.firstName, lastName: founder.name.split(" ").slice(1).join(" ") }}
        jsonLd={[
          profilePageSchema({ path: founder.path, name: PAGE_TITLE, description: founder.summary }),
          personSchema,
          organizationSchema,
          faqSchema(founder.faqs),
          breadcrumbSchema([
            { name: "Home", path: "/" },
            { name: "About", path: "/about" },
            { name: founder.name, path: founder.path },
          ]),
        ]}
      />

      {/* ── Hero ─────────────────────────────────────────────── */}
      <section className="fp-hero">
        <div className="container fp-hero-grid">
          <Reveal>
            <nav aria-label="Breadcrumb" className="fp-crumbs">
              <Link to="/">Home</Link> <span aria-hidden="true">/</span> <Link to="/about">About</Link>{" "}
              <span aria-hidden="true">/</span> <span aria-current="page">Founder</span>
            </nav>
            <span className="label">Founder · {founder.company}</span>
            <h1 className="fp-name">{founder.name}</h1>
            <p className="fp-role">{founder.role}</p>
            <p className="fp-headline">{founder.headline}</p>

            <ul className="fp-facts">
              <li><MapPin size={16} aria-hidden="true" /> {founder.location}</li>
              <li><Building2 size={16} aria-hidden="true" /> MSME-registered studio</li>
            </ul>

            <div className="fp-actions">
              <Link to="/contact" className="btn-primary" style={{ padding: "13px 26px" }}>
                Talk to {founder.firstName} <ArrowRight size={16} aria-hidden="true" />
              </Link>
              <a
                href={siteConfig.whatsappHref(`Hi ${founder.firstName}, I'd like to discuss a project.`)}
                target="_blank"
                rel="noopener noreferrer"
                className="btn-secondary"
                style={{ padding: "13px 22px" }}
              >
                <WhatsAppIcon width={16} height={16} /> WhatsApp
              </a>
            </div>
          </Reveal>

          <Reveal delay={0.12} className="fp-portrait-wrap">
            <div className="fp-portrait-glow" aria-hidden="true" />
            <div className="fp-portrait">
              <img
                src={founder.portrait.src}
                alt={founder.portrait.alt}
                width={founder.portrait.width}
                height={founder.portrait.height}
                fetchpriority="high"
                decoding="async"
              />
            </div>
            <div className="fp-badge">
              <span className="fp-badge-dot" aria-hidden="true" />
              Building at {founder.company}
            </div>
          </Reveal>
        </div>

        <div className="container">
          <StaggerGroup className="fp-stats">
            {founder.highlights.map((h) => (
              <StaggerItem key={h.label} className="fp-stat">
                <p className="fp-stat-value">{h.value}</p>
                <p className="fp-stat-label">{h.label}</p>
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Quote ────────────────────────────────────────────── */}
      <section className="fp-quote-band">
        <Reveal className="container" style={{ maxWidth: 860, textAlign: "center" }}>
          <Quote size={40} style={{ color: "var(--accent)", opacity: 0.5, marginBottom: 20 }} aria-hidden="true" />
          <blockquote className="fp-quote">{founder.quote}</blockquote>
          <p className="fp-quote-cite">— {founder.name}</p>
        </Reveal>
      </section>

      {/* ── Story ────────────────────────────────────────────── */}
      <section className="section">
        <div className="container fp-story-grid">
          <Reveal className="fp-story-aside">
            <span className="label">The Story</span>
            <h2 className="section-title">Why {founder.firstName} Started {founder.company}</h2>
            <img
              src={founder.gallery[0].src}
              alt={founder.gallery[0].alt}
              width={founder.gallery[0].width}
              height={founder.gallery[0].height}
              loading="lazy"
              decoding="async"
              className="fp-story-img"
            />
          </Reveal>
          <Reveal delay={0.1}>
            {founder.bio.map((para, i) => (
              <p key={i} className={i === 0 ? "fp-bio fp-bio-lead" : "fp-bio"}>{para}</p>
            ))}
          </Reveal>
        </div>
      </section>

      {/* ── Focus ────────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-card2)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container">
          <SectionHeading label="How Aaditya Works" title="What You Get Working With the Founder" />
          <StaggerGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 20 }}>
            {founder.focus.map((f, i) => {
              const Icon = f.icon;
              return (
                <StaggerItem key={f.title} className="card fp-focus-card">
                  <span className="fp-focus-num" aria-hidden="true">0{i + 1}</span>
                  <span className="fp-focus-icon"><Icon size={22} strokeWidth={1.8} aria-hidden="true" /></span>
                  <h3>{f.title}</h3>
                  <p>{f.desc}</p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* ── Gallery ──────────────────────────────────────────── */}
      <section className="section">
        <div className="container">
          <SectionHeading label="Gallery" title="Beyond the Code" />
          <StaggerGroup className="fp-gallery">
            {founder.gallery.slice(1).concat(founder.gallery[0]).map((img, i) => (
              <StaggerItem key={img.src} className={`fp-gallery-item fp-gallery-item-${i}`}>
                <img src={img.src} alt={img.alt} width={img.width} height={img.height} loading="lazy" decoding="async" />
              </StaggerItem>
            ))}
          </StaggerGroup>
        </div>
      </section>

      {/* ── FAQ ──────────────────────────────────────────────── */}
      <section className="section" style={{ background: "var(--bg-card2)", borderTop: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 780 }}>
          <SectionHeading label="FAQ" title={`About ${founder.name}`} />
          <FAQAccordion items={founder.faqs} />
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────── */}
      <section className="fp-cta">
        <Reveal className="container" style={{ textAlign: "center", maxWidth: 680 }}>
          <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "clamp(1.8rem,4vw,2.6rem)", color: "var(--text)", marginBottom: 14 }}>
            Have an idea? Talk to {founder.firstName} directly.
          </h2>
          <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.75, marginBottom: 28 }}>
            No sales layer, no hand-offs — just a straight conversation about what you want to build.
          </p>
          <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
            <Link to="/contact" className="btn-primary" style={{ padding: "14px 32px" }}>Start a Conversation</Link>
            <Link to="/work" className="btn-secondary" style={{ padding: "14px 26px" }}>See Our Work</Link>
          </div>
        </Reveal>
      </section>

      <style>{`
        .fp-hero {
          padding: 112px 24px 64px;
          background:
            radial-gradient(900px 480px at 85% 10%, rgba(var(--accent-rgb),0.10), transparent 60%),
            var(--bg-card2);
          border-bottom: 1px solid var(--border);
          overflow: hidden;
        }
        .fp-hero-grid {
          display: grid;
          grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr);
          gap: 64px;
          align-items: center;
        }
        .fp-crumbs { font-size: 0.8rem; color: var(--muted2); margin-bottom: 22px; display: flex; gap: 6px; flex-wrap: wrap; }
        .fp-crumbs a { color: var(--muted); text-decoration: none; }
        .fp-crumbs a:hover { color: var(--accent); }
        .fp-name {
          font-size: clamp(2.6rem, 6vw, 4.2rem);
          font-weight: 800;
          line-height: 1.05;
          letter-spacing: -0.02em;
          color: var(--text);
          margin-bottom: 10px;
        }
        .fp-role { font-family: var(--font-heading); font-weight: 600; font-size: 1.1rem; color: var(--accent); margin-bottom: 22px; }
        .fp-headline { font-size: 1.1rem; line-height: 1.7; color: var(--muted); max-width: 520px; margin-bottom: 26px; }
        .fp-facts { list-style: none; display: flex; flex-wrap: wrap; gap: 10px; margin-bottom: 32px; padding: 0; }
        .fp-facts li {
          display: inline-flex; align-items: center; gap: 8px;
          font-size: 0.85rem; color: var(--text);
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 999px; padding: 8px 14px;
        }
        .fp-facts li svg { color: var(--accent); }
        .fp-actions { display: flex; gap: 12px; flex-wrap: wrap; }

        .fp-portrait-wrap { position: relative; max-width: 440px; justify-self: end; width: 100%; }
        .fp-portrait-glow {
          position: absolute; inset: 8% -6% -6% 8%;
          border-radius: 28px;
          background: linear-gradient(135deg, var(--accent), rgba(var(--accent-rgb),0.2));
          opacity: 0.18;
          transform: rotate(4deg);
        }
        .fp-portrait {
          position: relative;
          border-radius: 28px;
          overflow: hidden;
          aspect-ratio: 4 / 5;
          border: 1px solid var(--border);
          box-shadow: 0 30px 60px -20px rgba(17,24,39,0.35);
          background: var(--bg-card);
        }
        .fp-portrait img { width: 100%; height: 100%; object-fit: cover; object-position: center 15%; display: block; }
        .fp-badge {
          position: absolute; left: -24px; bottom: 32px;
          display: inline-flex; align-items: center; gap: 10px;
          background: var(--bg-card); border: 1px solid var(--border);
          border-radius: 999px; padding: 10px 18px;
          font-family: var(--font-heading); font-weight: 600; font-size: 0.85rem; color: var(--text);
          box-shadow: var(--shadow-md);
        }
        .fp-badge-dot {
          width: 9px; height: 9px; border-radius: 50%; background: var(--success);
          box-shadow: 0 0 0 4px rgba(var(--success-rgb),0.18);
        }

        .fp-stats {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 1px;
          margin-top: 64px;
          background: var(--border);
          border: 1px solid var(--border); border-radius: 18px; overflow: hidden;
        }
        .fp-stat { background: var(--bg-card); padding: 26px 24px; text-align: center; }
        .fp-stat-value { font-family: var(--font-heading); font-weight: 800; font-size: 1.6rem; color: var(--text); }
        .fp-stat-label { font-size: 0.85rem; color: var(--muted); margin-top: 4px; }

        .fp-quote-band { padding: 96px 24px; background: var(--accent-soft); border-bottom: 1px solid var(--border); }
        .fp-quote {
          font-family: var(--font-heading); font-weight: 700;
          font-size: clamp(1.4rem, 3vw, 2.1rem); line-height: 1.45;
          color: var(--text); margin: 0 0 20px;
        }
        .fp-quote-cite { font-size: 0.95rem; color: var(--accent); font-weight: 600; }

        .fp-story-grid { display: grid; grid-template-columns: minmax(0, 5fr) minmax(0, 7fr); gap: 64px; align-items: start; }
        .fp-story-aside { position: sticky; top: 100px; }
        .fp-story-img {
          width: 100%; height: auto; aspect-ratio: 3 / 2; object-fit: cover;
          border-radius: 18px; border: 1px solid var(--border); margin-top: 20px; display: block;
        }
        .fp-bio { color: var(--muted); font-size: 1rem; line-height: 1.9; margin-bottom: 22px; }
        .fp-bio-lead { font-size: 1.2rem; line-height: 1.75; color: var(--text); font-weight: 500; }

        .fp-focus-card { position: relative; overflow: hidden; }
        .fp-focus-num {
          position: absolute; top: 14px; right: 18px;
          font-family: var(--font-heading); font-weight: 800; font-size: 2.4rem;
          color: var(--accent); opacity: 0.08;
        }
        .fp-focus-icon {
          display: inline-flex; align-items: center; justify-content: center;
          width: 46px; height: 46px; border-radius: 12px;
          background: var(--accent-soft); color: var(--accent); margin-bottom: 16px;
        }
        .fp-focus-card h3 { font-family: var(--font-heading); font-weight: 700; font-size: 1.02rem; color: var(--text); margin-bottom: 8px; }
        .fp-focus-card p { font-size: 0.88rem; color: var(--muted); line-height: 1.7; }

        .fp-gallery {
          display: grid;
          grid-template-columns: repeat(4, 1fr);
          grid-auto-rows: 220px;
          gap: 16px;
        }
        .fp-gallery-item { border-radius: 18px; overflow: hidden; border: 1px solid var(--border); background: var(--bg-card2); }
        .fp-gallery-item img {
          width: 100%; height: 100%; object-fit: cover; object-position: center 30%; display: block;
          transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .fp-gallery-item:hover img { transform: scale(1.05); }
        .fp-gallery-item-0 { grid-column: span 2; grid-row: span 2; }
        .fp-gallery-item-1 { grid-column: span 2; }
        .fp-gallery-item-2, .fp-gallery-item-3 { grid-column: span 1; }

        .fp-cta { padding: 96px 24px; border-top: 1px solid var(--border); }

        @media (max-width: 900px) {
          .fp-hero-grid, .fp-story-grid { grid-template-columns: 1fr; gap: 48px; }
          .fp-portrait-wrap { justify-self: center; max-width: 380px; }
          .fp-story-aside { position: static; }
        }
        @media (max-width: 640px) {
          .fp-hero { padding: 96px 16px 48px; }
          .fp-badge { left: 12px; bottom: 16px; }
          .fp-stats { margin-top: 40px; }
          .fp-stat { padding: 18px 8px; }
          .fp-stat-value { font-size: 1.05rem; }
          .fp-stat-label { font-size: 0.72rem; }
          .fp-gallery { grid-template-columns: 1fr 1fr; grid-auto-rows: 160px; }
          .fp-gallery-item-0 { grid-column: span 2; grid-row: span 2; }
          .fp-gallery-item-1 { grid-column: span 2; }
        }
      `}</style>
    </Layout>
  );
}
