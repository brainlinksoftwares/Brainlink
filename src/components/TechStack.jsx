import { LayoutTemplate, Server, Database, Sparkles, Cloud } from "lucide-react";
import { StaggerGroup, StaggerItem } from "./Reveal";
import { techCategories } from "../data/techStack";

const ICONS = {
  Frontend: LayoutTemplate,
  Backend: Server,
  Data: Database,
  AI: Sparkles,
  Infrastructure: Cloud,
};

export default function TechStack({ modules, categories = techCategories }) {
  const grouped = categories
    .map((cat) => ({ ...cat, items: modules.filter((m) => m.category === cat.id) }))
    .filter((g) => g.items.length);

  return (
    <StaggerGroup className="stack-grid">
      {grouped.map((group) => {
        const Icon = ICONS[group.id] || Sparkles;
        return (
          <StaggerItem key={group.id} className="card stack-card">
            <div className="stack-card-head">
              <span className="stack-icon"><Icon size={20} strokeWidth={1.75} aria-hidden="true" /></span>
              <div style={{ flex: 1 }}>
                <h3 style={{ fontSize: "1rem", color: "var(--text)" }}>{group.title}</h3>
                <p style={{ fontSize: "0.78rem", color: "var(--muted2)", lineHeight: 1.45 }}>{group.desc}</p>
              </div>
              <span className="badge badge-partner" style={{ fontWeight: 700 }} aria-label={`${group.items.length} technologies`}>
                {group.items.length}
              </span>
            </div>
            <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
              {group.items.map((tech) => (
                <li key={tech.name} className="stack-item">
                  <span className="stack-item-name">{tech.name}</span>
                  {tech.note && <span className="stack-item-note">{tech.note}</span>}
                </li>
              ))}
            </ul>
          </StaggerItem>
        );
      })}
    </StaggerGroup>
  );
}
