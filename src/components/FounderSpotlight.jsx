import { Link } from "react-router-dom";
import { ArrowRight, Quote } from "lucide-react";
import Reveal from "./Reveal";
import { founder } from "../data/founder";

/**
 * Compact founder teaser used on Home and About. Links to the full
 * /founder profile so the long-form content lives on one canonical URL.
 */
export default function FounderSpotlight({ label = "Meet the Founder" }) {
  return (
    <Reveal>
      <div className="founder-spotlight">
        <div className="founder-spotlight-photo">
          <img
            src={founder.portrait.src}
            alt={founder.portrait.alt}
            width={founder.portrait.width}
            height={founder.portrait.height}
            loading="lazy"
            decoding="async"
          />
        </div>
        <div className="founder-spotlight-body">
          <span className="label">{label}</span>
          <Quote size={28} className="founder-spotlight-quote-icon" aria-hidden="true" />
          <p className="founder-spotlight-quote">{founder.quote}</p>
          <div className="founder-spotlight-meta">
            <div>
              <p className="founder-spotlight-name">{founder.name}</p>
              <p className="founder-spotlight-role">{founder.role}, {founder.company}</p>
            </div>
            <Link to={founder.path} className="btn-secondary" style={{ fontSize: "0.88rem" }}>
              Read {founder.firstName}'s story <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </div>

      <style>{`
        .founder-spotlight {
          display: grid;
          grid-template-columns: minmax(0, 340px) minmax(0, 1fr);
          gap: 48px;
          align-items: center;
          background: var(--bg-card);
          border: 1px solid var(--border);
          border-radius: 24px;
          padding: 28px;
          box-shadow: var(--shadow-md);
          position: relative;
          overflow: hidden;
        }
        .founder-spotlight::before {
          content: "";
          position: absolute;
          width: 420px; height: 420px;
          right: -140px; top: -180px;
          background: radial-gradient(circle, rgba(var(--accent-rgb),0.12), transparent 70%);
          pointer-events: none;
        }
        .founder-spotlight-photo {
          border-radius: 18px;
          overflow: hidden;
          aspect-ratio: 4 / 5;
          background: var(--bg-card2);
        }
        .founder-spotlight-photo img {
          width: 100%; height: 100%;
          object-fit: cover; object-position: center 20%;
          display: block;
          transition: transform 0.6s cubic-bezier(0.22,1,0.36,1);
        }
        .founder-spotlight:hover .founder-spotlight-photo img { transform: scale(1.04); }
        .founder-spotlight-body { position: relative; padding-right: 20px; }
        .founder-spotlight-quote-icon { color: var(--accent); opacity: 0.5; display: block; margin-bottom: 12px; }
        .founder-spotlight-quote {
          font-family: var(--font-heading);
          font-weight: 600;
          font-size: clamp(1.15rem, 2.2vw, 1.5rem);
          line-height: 1.5;
          color: var(--text);
          margin-bottom: 32px;
        }
        .founder-spotlight-meta {
          display: flex; align-items: center; justify-content: space-between;
          gap: 20px; flex-wrap: wrap;
          padding-top: 24px; border-top: 1px solid var(--border);
        }
        .founder-spotlight-name { font-family: var(--font-heading); font-weight: 700; font-size: 1.05rem; color: var(--text); }
        .founder-spotlight-role { font-size: 0.85rem; color: var(--muted); margin-top: 2px; }
        @media (max-width: 768px) {
          .founder-spotlight { grid-template-columns: 1fr; gap: 28px; padding: 20px; }
          .founder-spotlight-photo { aspect-ratio: 1 / 1; }
          .founder-spotlight-body { padding-right: 0; }
        }
      `}</style>
    </Reveal>
  );
}
