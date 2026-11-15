import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X, ArrowRight } from "lucide-react";
import logo from "../assets/logo/logo.png";
import "../index.css";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Pricing", to: "/pricing" },
  { label: "Careers", to: "/careers" },
  { label: "Insights", to: "/blog" },
  { label: "Contact", to: "/contact" },
];

export default function Header() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const { pathname } = useLocation();
  const menuBtnRef = useRef(null);

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 8);
    fn();
    window.addEventListener("scroll", fn, { passive: true });
    return () => window.removeEventListener("scroll", fn);
  }, []);

  useEffect(() => setOpen(false), [pathname]);

  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [open]);

  useEffect(() => {
    const onKeyDown = (e) => {
      if (e.key === "Escape" && open) {
        setOpen(false);
        menuBtnRef.current?.focus();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [open]);

  // Nested routes (e.g. /blog/:slug) keep their parent tab highlighted.
  const isActive = (to) => (to === "/" ? pathname === "/" : pathname === to || pathname.startsWith(`${to}/`));

  return (
    <>
      <a href="#main-content" className="skip-link">Skip to main content</a>

      <header
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? "var(--nav-bg-scrolled)" : "var(--nav-bg)",
          backdropFilter: "saturate(180%) blur(12px)",
          WebkitBackdropFilter: "saturate(180%) blur(12px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: scrolled ? "var(--shadow-nav)" : "none",
          transition: "box-shadow 0.2s ease, background 0.2s ease",
        }}
      >
        <nav aria-label="Primary" className="navbar container" style={{ padding: scrolled ? "6px 20px" : "10px 20px", transition: "padding 0.2s ease" }}>
          <div className="navbar-start" style={{ width: "auto", flex: 1 }}>
            <Link to="/" style={{ display: "flex", alignItems: "center", gap: 10, textDecoration: "none" }}>
              <span className="brand-mark">
                <img src={logo} alt="" style={{ height: 22, width: 22, objectFit: "contain" }} />
              </span>
              <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.05rem", color: "var(--text)", letterSpacing: "-0.01em", whiteSpace: "nowrap" }}>
                Brainlink <span className="text-blue">Softwares</span>
              </span>
            </Link>
          </div>

          <div className="navbar-center desktop-nav">
            <ul className="menu menu-horizontal nav-list">
              {navLinks.map((l) => (
                <li key={l.label}>
                  <Link
                    to={l.to}
                    className={isActive(l.to) ? "nav-link is-active" : "nav-link"}
                    aria-current={isActive(l.to) ? "page" : undefined}
                  >
                    {l.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="navbar-end" style={{ width: "auto", flex: 1, gap: 8 }}>
            <Link to="/contact" className="btn btn-primary btn-sm cta-desktop-only" style={{ height: 38, minHeight: 38, padding: "0 16px" }}>
              Start a Project <ArrowRight size={14} aria-hidden="true" />
            </Link>

            <button
              ref={menuBtnRef}
              onClick={() => setOpen((o) => !o)}
              className="mobile-nav-btn btn btn-ghost btn-square btn-sm"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </nav>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className="mobile-nav-btn"
          style={{
            maxHeight: open ? 640 : 0,
            overflow: "hidden",
            transition: "max-height 0.25s ease",
            background: "var(--mobile-menu-bg)",
            borderTop: open ? "1px solid var(--border)" : "none",
            flexDirection: "column",
          }}
        >
          <ul className="menu" style={{ padding: "12px 16px 4px", width: "100%" }}>
            {navLinks.map((l) => (
              <li key={l.label}>
                <Link
                  to={l.to}
                  onClick={() => setOpen(false)}
                  className={isActive(l.to) ? "mobile-nav-link is-active" : "mobile-nav-link"}
                  aria-current={isActive(l.to) ? "page" : undefined}
                >
                  {l.label}
                </Link>
              </li>
            ))}
          </ul>
          <div style={{ padding: "8px 20px 20px" }}>
            <Link to="/contact" onClick={() => setOpen(false)} className="btn btn-primary btn-block">
              Start a Project <ArrowRight size={16} aria-hidden="true" />
            </Link>
          </div>
        </div>
      </header>

      <div style={{ height: 72 }} />
    </>
  );
}
