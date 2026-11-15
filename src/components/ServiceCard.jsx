import { Link } from "react-router-dom";
import { ArrowRight } from "lucide-react";

export default function ServiceCard({ service }) {
  const Icon = service.icon;
  return (
    <Link
      to={`/services#${service.id}`}
      className="card"
      style={{
        display: "flex",
        flexDirection: "column",
        textDecoration: "none",
        height: "100%",
        gap: 12,
      }}
    >
      <div
        style={{
          width: 40,
          height: 40,
          borderRadius: 10,
          background: "var(--blue-soft)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          color: "var(--blue)",
        }}
      >
        <Icon size={20} strokeWidth={1.75} aria-hidden="true" />
      </div>
      <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "1rem", color: "var(--text)" }}>
        {service.title}
      </h3>
      <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.65, flexGrow: 1 }}>
        {service.shortDesc}
      </p>
      <span
        style={{
          display: "inline-flex",
          alignItems: "center",
          gap: 6,
          fontFamily: "var(--font-heading)",
          fontWeight: 600,
          fontSize: "0.82rem",
          color: "var(--accent)",
        }}
      >
        Learn More <ArrowRight size={14} className="hover-arrow" aria-hidden="true" />
      </span>
    </Link>
  );
}
