import { Link } from "react-router-dom";
import Layout from "./Layout";
import SEO from "../components/SEO";
import "../index.css";

export default function NotFound() {
  return (
    <Layout>
      <SEO title="Page Not Found" description="The page you're looking for doesn't exist or has been moved." path="/404" noindex />
      <div
        style={{
          minHeight: "70vh", background: "var(--bg)",
          display: "flex", flexDirection: "column",
          alignItems: "center", justifyContent: "center",
          textAlign: "center", padding: 40,
        }}
      >
        <div style={{
          fontFamily: "var(--font-heading)", fontWeight: 800,
          fontSize: "clamp(6rem,20vw,10rem)",
          color: "var(--accent)", lineHeight: 1,
          opacity: 0.25, marginBottom: 24,
          letterSpacing: "-0.04em",
        }}>404</div>
        <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "clamp(1.5rem,4vw,2.2rem)", color: "var(--text)", marginBottom: 12 }}>
          Page Not Found
        </h1>
        <p style={{ color: "var(--muted)", fontSize: "0.95rem", marginBottom: 36, maxWidth: 360, lineHeight: 1.75 }}>
          The page you're looking for doesn't exist or has been moved.
        </p>
        <Link to="/" className="btn btn-primary">← Back to Home</Link>
      </div>
    </Layout>
  );
}
