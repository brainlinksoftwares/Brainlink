import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { ShieldCheck, ArrowRight, Loader2 } from "lucide-react";
import Layout from "../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import Reveal from "../components/Reveal";
import { normalizeCertificateInput, validateCertificateSlug, CERTIFICATE_FORMAT_EXAMPLE } from "../utils/certificateFormat";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/verify-certificate"];

export default function VerifyCertificate() {
  const [value, setValue] = useState("");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const navigate = useNavigate();

  const onSubmit = (e) => {
    e.preventDefault();
    if (submitting) return;

    const trimmed = value.trim();
    if (!trimmed) {
      setError("Enter the Certificate ID printed on your certificate.");
      return;
    }

    const slug = normalizeCertificateInput(trimmed);
    if (!validateCertificateSlug(slug)) {
      setError(`That doesn't look like a valid Certificate ID. Expected format: ${CERTIFICATE_FORMAT_EXAMPLE}`);
      return;
    }

    setError("");
    setSubmitting(true);
    navigate(`/verify-certificate/${slug}`);
  };

  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/verify-certificate"
        jsonLd={[organizationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Verify Certificate", path: "/verify-certificate" }])]}
      />

      <PageHero
        label="Credential Verification"
        title="Verify Your Certificate"
        subtitle="Enter the Certificate ID printed on your certificate to verify its authenticity against the official Brainlink Softwares records."
        maxWidth={640}
      />

      <section className="section" style={{ paddingTop: 48 }}>
        <div className="container" style={{ maxWidth: 560 }}>
          <Reveal>
            <form
              onSubmit={onSubmit}
              className="card"
              style={{ padding: "36px 32px", display: "flex", flexDirection: "column", gap: 20 }}
              noValidate
            >
              <div>
                <label className="field-label" htmlFor="certificate-id">
                  Certificate ID
                </label>
                <input
                  id="certificate-id"
                  name="certificateId"
                  type="text"
                  autoComplete="off"
                  autoCapitalize="characters"
                  spellCheck={false}
                  value={value}
                  onChange={(e) => { setValue(e.target.value); if (error) setError(""); }}
                  placeholder={CERTIFICATE_FORMAT_EXAMPLE}
                  className={`field-input${error ? " field-error" : ""}`}
                  style={{ fontFamily: "var(--font-heading)", letterSpacing: "0.02em" }}
                  aria-invalid={!!error}
                  aria-describedby={error ? "certificate-id-error" : "certificate-id-hint"}
                />
                {error ? (
                  <p id="certificate-id-error" role="alert" className="field-error-text">{error}</p>
                ) : (
                  <p id="certificate-id-hint" style={{ fontSize: "0.78rem", color: "var(--muted2)", marginTop: 6 }}>
                    Example: {CERTIFICATE_FORMAT_EXAMPLE} — the ID printed at the bottom of your certificate or in its QR code.
                  </p>
                )}
              </div>

              <button
                type="submit"
                className="btn-primary"
                disabled={submitting}
                style={{ justifyContent: "center", padding: "14px", width: "100%", opacity: submitting ? 0.75 : 1 }}
              >
                {submitting ? (
                  <>
                    <Loader2 size={16} className="spin" aria-hidden="true" /> Verifying...
                  </>
                ) : (
                  <>
                    Verify Certificate <ArrowRight size={16} aria-hidden="true" />
                  </>
                )}
              </button>
            </form>
          </Reveal>

          <Reveal delay={0.08}>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-start", marginTop: 28, padding: "16px 18px", background: "var(--bg-card2)", borderRadius: 12, border: "1px solid var(--border)" }}>
              <ShieldCheck size={18} style={{ color: "var(--accent)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" />
              <p style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.65 }}>
                Verification confirms that the certificate record exists in the official Brainlink Softwares
                database. It does not provide access to private employment, performance, or personal records.
              </p>
            </div>
          </Reveal>

          <p style={{ textAlign: "center", marginTop: 32 }}>
            <Link to="/" style={{ color: "var(--accent)", fontSize: "0.85rem", fontWeight: 600, textDecoration: "none" }}>
              ← Back to Homepage
            </Link>
          </p>
        </div>
      </section>

      <style>{`
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
      `}</style>
    </Layout>
  );
}
