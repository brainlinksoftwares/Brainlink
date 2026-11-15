import Reveal from "./Reveal";

/**
 * Shared hero block for inner pages (Services, About, Pricing, Careers, ...).
 */
export default function PageHero({ label, title, subtitle, children, maxWidth = 680 }) {
  return (
    <section
      style={{
        padding: "112px 24px 64px",
        textAlign: "center",
        background: "var(--bg-card2)",
        borderBottom: "1px solid var(--border)",
      }}
    >
      <div style={{ maxWidth, margin: "0 auto" }}>
        <Reveal>
          {label && <span className="eyebrow">{label}</span>}
          <h1
            style={{
              fontSize: "clamp(2.1rem, 4.5vw, 3.2rem)",
              fontWeight: 700,
              color: "var(--text)",
              marginBottom: 16,
              lineHeight: 1.15,
            }}
          >
            {title}
          </h1>
          {subtitle && (
            <p style={{ color: "var(--muted)", fontSize: "1rem", lineHeight: 1.75, marginBottom: children ? 32 : 0 }}>
              {subtitle}
            </p>
          )}
          {children}
        </Reveal>
      </div>
    </section>
  );
}
