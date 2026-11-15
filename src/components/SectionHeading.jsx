import Reveal from "./Reveal";

export default function SectionHeading({ label, title, subtitle, center = true, style }) {
  return (
    <Reveal>
      <div style={{ textAlign: center ? "center" : "left", marginBottom: 56, ...style }}>
        {label && <span className="eyebrow">{label}</span>}
        <h2 className="section-title">{title}</h2>
        {subtitle && (
          <p className="section-sub" style={center ? { margin: "0 auto" } : undefined}>
            {subtitle}
          </p>
        )}
      </div>
    </Reveal>
  );
}
