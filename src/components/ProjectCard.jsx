import { Link } from "react-router-dom";
import { ArrowRight, Handshake, Rocket, Briefcase } from "lucide-react";
import { BrowserMockup } from "./ProductMockup";

// Relationship → badge style, mockup accent and icon (teal, with Dodger Blue for the partnership).
const RELATIONSHIP = {
  "Client Project": { badge: "badge-client", accent: "var(--accent)", Icon: Briefcase },
  "Tech Partner": { badge: "badge-partner", accent: "var(--blue)", Icon: Handshake },
  "Our Own Product": { badge: "badge-primary", accent: "var(--accent)", Icon: Rocket },
};

export default function ProjectCard({ project, detailed = false }) {
  const rel = RELATIONSHIP[project.relationship] || RELATIONSHIP["Client Project"];
  const { Icon } = rel;

  return (
    <div className="card project-card" style={{ padding: 0, overflow: "hidden", height: "100%" }}>
      <figure style={{ margin: 0, padding: 24, background: "var(--bg-card2)", borderBottom: "1px solid var(--border)", position: "relative", display: "block" }}>
        <span className={`badge ${rel.badge} gap-1`} style={{ position: "absolute", top: 14, right: 14, zIndex: 1, fontWeight: 600, padding: "10px 12px" }}>
          <Icon size={12} aria-hidden="true" /> {project.relationship || project.status}
        </span>
        <BrowserMockup accent={rel.accent} />
      </figure>

      <div className="card-body" style={{ padding: 28, gap: 14 }}>
        <div>
          <p style={{ fontSize: "0.76rem", color: rel.accent, fontWeight: 600, marginBottom: 4, letterSpacing: "0.02em" }}>{project.industry}</p>
          <h3 className="card-title" style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.25rem", color: "var(--text)" }}>
            {project.clientName}
          </h3>
          {detailed && project.projectName && (
            <p style={{ fontSize: "0.85rem", color: "var(--muted2)", marginTop: 2 }}>{project.projectName}</p>
          )}
        </div>

        <p style={{ fontSize: "0.9rem", color: "var(--muted)", lineHeight: 1.65 }}>{project.shortDescription}</p>

        {detailed && (
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(160px,1fr))", gap: 16, paddingTop: 4 }}>
            {[
              { l: "Challenge", v: project.problem },
              { l: "Approach", v: project.approach },
              { l: "Outcome", v: project.outcome },
            ].map((row) => (
              <div key={row.l} style={{ background: "var(--bg-card2)", border: "1px solid var(--border)", borderRadius: 12, padding: 14 }}>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.68rem", fontWeight: 700, color: "var(--accent)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 6 }}>
                  {row.l}
                </p>
                <p style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.6 }}>{row.v}</p>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
          {(detailed ? project.services : project.services.slice(0, 3)).map((s) => (
            <span key={s} className="badge badge-ghost" style={{ fontSize: "0.72rem", padding: "10px 10px", border: "1px solid var(--border)", background: "var(--bg-card2)", color: "var(--text)" }}>{s}</span>
          ))}
        </div>

        {detailed && (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {project.technologies.map((t) => (
              <span key={t} className="badge badge-outline" style={{ fontSize: "0.7rem", color: "var(--muted)", borderColor: "var(--border)" }}>{t}</span>
            ))}
          </div>
        )}

        <div className="card-actions" style={{ marginTop: "auto", paddingTop: 8, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span style={{ fontSize: "0.78rem", color: "var(--muted2)" }}>{project.status}</span>
          {!detailed && (
            <Link
              to={`/work#${project.id}`}
              className="btn btn-ghost btn-sm"
              style={{ color: "var(--accent)", paddingInline: 8 }}
            >
              View Case Study <ArrowRight size={14} className="hover-arrow" aria-hidden="true" />
            </Link>
          )}
        </div>
      </div>
    </div>
  );
}
