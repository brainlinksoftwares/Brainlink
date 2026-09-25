import React, { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { Menu, X } from "lucide-react";
import logo from "../assets/logo/logo.png";
import "../index.css";

const navLinks = [
  { label: "Home", to: "/" },
  { label: "Services", to: "/services" },
  { label: "Work", to: "/work" },
  { label: "About", to: "/about" },
  { label: "Founder", to: "/founder" },
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

      <nav
        aria-label="Primary"
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: scrolled ? "var(--nav-bg-scrolled)" : "rgba(255,255,255,0.86)",
          backdropFilter: "saturate(180%) blur(8px)",
          WebkitBackdropFilter: "saturate(180%) blur(8px)",
          borderBottom: "1px solid var(--border)",
          boxShadow: scrolled ? "var(--shadow-nav)" : "none",
          transition: "box-shadow 0.2s ease, padding 0.2s ease",
        }}
      >
        <div
          className="container"
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: scrolled ? "12px 24px" : "16px 24px",
            transition: "padding 0.2s ease",
          }}
        >
          <Link to="/" style={{ display: "flex", alignItems: "center", gap: 9, textDecoration: "none" }}>
            <img src={logo} alt="" style={{ height: 26, width: 26, objectFit: "contain" }} />
            <span style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1rem", color: "var(--text)" }}>
              Brainlink <span style={{ color: "var(--accent)" }}>Softwares</span>
            </span>
          </Link>

          <ul className="desktop-nav nav-list">
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

          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <Link to="/contact" className="btn-primary cta-desktop-only" style={{ padding: "9px 18px", fontSize: "0.85rem" }}>
              Start a Project
            </Link>

            <button
              ref={menuBtnRef}
              onClick={() => setOpen((o) => !o)}
              className="mobile-nav-btn icon-btn"
              aria-label={open ? "Close menu" : "Open menu"}
              aria-expanded={open}
              aria-controls="mobile-menu"
            >
              {open ? <X size={20} aria-hidden="true" /> : <Menu size={20} aria-hidden="true" />}
            </button>
          </div>
        </div>

        {/* Mobile menu */}
        <div
          id="mobile-menu"
          className="mobile-nav-btn"
          style={{
            maxHeight: open ? 640 : 0,
            overflow: "hidden",
            transition: "max-height 0.2s ease",
            background: "var(--mobile-menu-bg)",
            borderTop: open ? "1px solid var(--border)" : "none",
          }}
        >
          <div style={{ padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 4 }}>
            {navLinks.map((l) => (
              <Link
                key={l.label}
                to={l.to}
                onClick={() => setOpen(false)}
                className={isActive(l.to) ? "mobile-nav-link is-active" : "mobile-nav-link"}
                aria-current={isActive(l.to) ? "page" : undefined}
              >
                {l.label}
              </Link>
            ))}
            <Link to="/contact" onClick={() => setOpen(false)} className="btn-primary" style={{ marginTop: 14, justifyContent: "center" }}>
              Start a Project
            </Link>
          </div>
        </div>
      </nav>

      <div style={{ height: 72 }} />
    </>
  );
}
