import { useCallback, useEffect, useMemo, useState } from "react";
import { useParams, Link } from "react-router-dom";
import {
  ShieldCheck, Clock3, SearchX, AlertTriangle,
  RotateCw, FileText, Calendar, User, Briefcase, Building2, FolderKanban, Award,
} from "lucide-react";
import Layout from "../common/Layout";
import SEO from "../components/SEO";
import Reveal from "../components/Reveal";
import { normalizeCertificateInput, validateCertificateSlug, CERTIFICATE_FORMAT_EXAMPLE } from "../utils/certificateFormat";
import { CERTIFICATE_STATUS_META, TONE_COLORS } from "../data/certificateStatus";

function formatDate(value) {
  if (!value) return null;
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "long", year: "numeric" });
}

function Field({ icon: Icon, label, value }) {
  if (!value) return null;
  return (
    <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
      <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--bg-card2)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, color: "var(--accent)" }}>
        <Icon size={16} aria-hidden="true" />
      </div>
      <div>
        <p style={{ fontSize: "0.7rem", fontWeight: 700, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.05em", marginBottom: 2 }}>{label}</p>
        <p style={{ fontSize: "0.92rem", color: "var(--text)", fontWeight: 500 }}>{value}</p>
      </div>
    </div>
  );
}

function StatusBanner({ tone, icon: Icon, heading }) {
  const colors = TONE_COLORS[tone] || TONE_COLORS.neutral;
  return (
    <div style={{ display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center", marginBottom: 28 }}>
      <div
        style={{
          width: 64, height: 64, borderRadius: "50%",
          background: `rgba(${colors.rgb},0.1)`, border: `1.5px solid rgba(${colors.rgb},0.3)`,
          display: "flex", alignItems: "center", justifyContent: "center", color: colors.fg, marginBottom: 16,
        }}
      >
        <Icon size={28} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.6rem", color: colors.fg }}>{heading}</h1>
    </div>
  );
}

function CenteredMessage({ tone = "neutral", icon: Icon, heading, children, actions }) {
  const colors = TONE_COLORS[tone] || TONE_COLORS.neutral;
  return (
    <div className="card" style={{ padding: "48px 32px", textAlign: "center", maxWidth: 480, margin: "0 auto" }}>
      <div
        style={{
          width: 60, height: 60, borderRadius: "50%", margin: "0 auto 20px",
          background: `rgba(${colors.rgb},0.1)`, border: `1.5px solid rgba(${colors.rgb},0.3)`,
          display: "flex", alignItems: "center", justifyContent: "center", color: colors.fg,
        }}
      >
        <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
      </div>
      <h1 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.35rem", color: "var(--text)", marginBottom: 12 }}>{heading}</h1>
      <div style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.7, marginBottom: actions ? 28 : 0 }}>{children}</div>
      {actions}
    </div>
  );
}

export default function VerifyCertificateResult() {
  const { certificateSlug } = useParams();
  const normalizedSlug = useMemo(() => normalizeCertificateInput(certificateSlug || ""), [certificateSlug]);
  const [state, setState] = useState({ phase: "loading" });

  const fetchCertificate = useCallback(async () => {
    if (!validateCertificateSlug(normalizedSlug)) {
      setState({ phase: "invalid" });
      return;
    }

    setState({ phase: "loading" });

    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 10000);

    try {
      const res = await fetch(`/api/certificates/${encodeURIComponent(normalizedSlug)}`, { signal: controller.signal });
      const data = await res.json().catch(() => null);

      if (!data || typeof data.status !== "string") {
        setState({ phase: "error" });
        return;
      }

      if (data.status === "found" && data.certificate) {
        const verifiedAt = new Date().toLocaleString("en-GB", { day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit" });
        setState({ phase: "found", certificate: data.certificate, verifiedAt });
      } else if (data.status === "not_found") {
        setState({ phase: "not_found" });
      } else if (data.status === "invalid_format") {
        setState({ phase: "invalid" });
      } else {
        setState({ phase: "error" });
      }
    } catch {
      setState({ phase: "error" });
    } finally {
      clearTimeout(timeout);
    }
  }, [normalizedSlug]);

  useEffect(() => {
    fetchCertificate();
  }, [fetchCertificate]);


  return (
    <Layout>
      <SEO
        title="Certificate Verification"
        description="Certificate verification result from Brainlink Softwares' official credential records."
        path={`/verify-certificate/${normalizedSlug || ""}`}
        noindex
      />

      <div style={{ minHeight: "70vh", padding: "128px 24px 80px", background: "var(--bg-card2)" }}>
        <div className="container" style={{ maxWidth: 640 }}>

          {state.phase === "loading" && (
            <div className="card" style={{ padding: "56px 32px", textAlign: "center" }}>
              <RotateCw size={30} className="cert-spin" style={{ color: "var(--accent)" }} aria-hidden="true" />
              <p style={{ fontFamily: "var(--font-heading)", fontWeight: 600, color: "var(--muted)", marginTop: 16 }}>
                Checking official records...
              </p>
            </div>
          )}

          {state.phase === "invalid" && (
            <Reveal>
              <CenteredMessage
                tone="danger"
                icon={AlertTriangle}
                heading="Invalid Certificate ID"
                actions={<Link to="/verify-certificate" className="btn btn-primary" style={{ justifyContent: "center" }}>Back to Verification Form</Link>}
              >
                <p style={{ marginBottom: 10 }}>The certificate ID or link you used isn't in a recognized format.</p>
                <p>
                  Correct format example: <br />
                  <code style={{ fontFamily: "var(--font-heading)", color: "var(--text)", fontWeight: 600 }}>{CERTIFICATE_FORMAT_EXAMPLE}</code>
                </p>
              </CenteredMessage>
            </Reveal>
          )}

          {state.phase === "not_found" && (
            <Reveal>
              <CenteredMessage
                tone="neutral"
                icon={SearchX}
                heading="Certificate Not Found"
                actions={
                  <div style={{ display: "flex", gap: 12, justifyContent: "center", flexWrap: "wrap" }}>
                    <Link to="/verify-certificate" className="btn btn-primary">Verify Another Certificate</Link>
                    <Link to="/contact" className="btn btn-outline btn-primary">Contact Us</Link>
                  </div>
                }
              >
                <p style={{ marginBottom: 8 }}>
                  No certificate matches <strong style={{ color: "var(--text)" }}>{normalizedSlug}</strong>.
                </p>
                <p>This ID may be incorrect, mistyped, or may not have been issued by Brainlink Softwares.</p>
              </CenteredMessage>
            </Reveal>
          )}

          {state.phase === "error" && (
            <Reveal>
              <CenteredMessage
                tone="warning"
                icon={AlertTriangle}
                heading="Verification Temporarily Unavailable"
                actions={
                  <button onClick={fetchCertificate} className="btn btn-primary" style={{ justifyContent: "center" }}>
                    <RotateCw size={16} aria-hidden="true" /> Retry
                  </button>
                }
              >
                We couldn't reach the certificate records right now. This is usually temporary — please try again in
                a moment.
              </CenteredMessage>
            </Reveal>
          )}

          {state.phase === "found" && (() => {
            const cert = state.certificate;
            const meta = CERTIFICATE_STATUS_META[cert.status] || CERTIFICATE_STATUS_META.pending;

            if (cert.status === "valid") {
              return (
                <Reveal>
                  <div className="card" style={{ padding: "40px 36px", borderTop: "3px solid var(--success)" }}>
                    <StatusBanner tone={meta.tone} icon={meta.icon} heading={meta.heading} />

                    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 22, marginBottom: 28 }} className="cert-field-grid">
                      <Field icon={User} label="Recipient" value={cert.recipient_name} />
                      <Field icon={Award} label="Certificate ID" value={cert.certificate_number} />
                      <Field icon={FileText} label="Certificate Title" value={cert.certificate_title} />
                      <Field icon={Briefcase} label="Internship Role" value={cert.internship_role} />
                      <Field icon={Building2} label="Department" value={cert.department} />
                      <Field icon={FolderKanban} label="Project / Client" value={cert.project_name} />
                      <Field icon={Calendar} label="Internship Start" value={formatDate(cert.internship_start_date)} />
                      <Field icon={Calendar} label="Internship End" value={formatDate(cert.internship_end_date)} />
                      <Field icon={Calendar} label="Issue Date" value={formatDate(cert.issue_date)} />
                      <Field icon={Building2} label="Issuing Organisation" value={cert.organisation_name} />
                      <Field icon={ShieldCheck} label="Status" value="Valid" />
                      <Field icon={Clock3} label="Verified On" value={state.verifiedAt} />
                    </div>

                    {cert.public_note && (
                      <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.7, marginBottom: 24, padding: "14px 16px", background: "var(--bg-card2)", borderRadius: 10 }}>
                        {cert.public_note}
                      </p>
                    )}

                    {cert.certificate_file_url && (
                      <a
                        href={cert.certificate_file_url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="btn btn-outline btn-primary"
                        style={{ width: "100%", justifyContent: "center", marginBottom: 20 }}
                      >
                        <FileText size={16} aria-hidden="true" /> View Certificate File
                      </a>
                    )}

                    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 20, textAlign: "center" }}>
                      <p style={{ fontSize: "0.85rem", color: "var(--text)", fontWeight: 500, lineHeight: 1.7, marginBottom: 8 }}>
                        This certificate has been verified against the official records of Brainlink Softwares.
                      </p>
                      <p style={{ fontSize: "0.78rem", color: "var(--muted2)" }}>Issued and verified by Brainlink Softwares</p>
                    </div>
                  </div>
                </Reveal>
              );
            }

            if (cert.status === "revoked") {
              return (
                <Reveal>
                  <CenteredMessage tone="danger" icon={meta.icon} heading={meta.heading}>
                    <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
                      <Field icon={User} label="Recipient" value={cert.recipient_name} />
                      <Field icon={Award} label="Certificate ID" value={cert.certificate_number} />
                      <Field icon={Calendar} label="Revoked On" value={formatDate(cert.revoked_at)} />
                    </div>
                    <p style={{ marginTop: 14 }}>
                      {cert.revocation_reason_public || "This certificate has been revoked by the issuing organisation and is no longer valid."}
                    </p>
                  </CenteredMessage>
                </Reveal>
              );
            }

            if (cert.status === "expired") {
              return (
                <Reveal>
                  <CenteredMessage tone="warning" icon={meta.icon} heading={meta.heading}>
                    <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
                      <Field icon={User} label="Recipient" value={cert.recipient_name} />
                      <Field icon={Award} label="Certificate ID" value={cert.certificate_number} />
                      <Field icon={FileText} label="Certificate Title" value={cert.certificate_title} />
                      <Field icon={Calendar} label="Expiry Date" value={formatDate(cert.expiry_date)} />
                    </div>
                    <p style={{ marginTop: 14 }}>
                      This certificate record exists in our system but is no longer active.
                    </p>
                  </CenteredMessage>
                </Reveal>
              );
            }

            // pending
            return (
              <Reveal>
                <CenteredMessage tone="warning" icon={meta.icon} heading={meta.heading}>
                  <div style={{ textAlign: "left", display: "flex", flexDirection: "column", gap: 14, marginBottom: 8 }}>
                    <Field icon={User} label="Recipient" value={cert.recipient_name} />
                    <Field icon={Award} label="Certificate ID" value={cert.certificate_number} />
                  </div>
                  <p style={{ marginTop: 14 }}>
                    This certificate record exists but has not yet been activated for public verification. Please
                    check back later or contact Brainlink Softwares.
                  </p>
                </CenteredMessage>
              </Reveal>
            );
          })()}

        </div>
      </div>

      <style>{`
        .cert-spin { animation: certSpin 1s linear infinite; }
        @keyframes certSpin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .cert-spin { animation: none; } }
        @media (max-width: 600px) {
          .cert-field-grid { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
