import { useState } from "react";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Layout from "../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import SectionHeading from "../components/SectionHeading";
import FAQAccordion from "../components/FAQAccordion";
import Reveal, { StaggerGroup, StaggerItem } from "../components/Reveal";
import { internshipHighlights, whoShouldApply, skillsValued, selectionProcess, careerFaqs } from "../data/careers";
import { submitWeb3Form } from "../utils/web3forms";
import { siteConfig } from "../data/siteConfig";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/careers"];

const initialForm = {
  name: "", email: "", phone: "", college: "", course: "", year: "",
  role: "", skills: "", portfolio: "", github: "", linkedin: "", resumeLink: "", why: "", consent: false,
};

export default function Careers() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.college.trim()) e.college = "Required";
    if (!form.course.trim()) e.course = "Required";
    if (!form.year.trim()) e.year = "Required";
    if (!form.role.trim()) e.role = "Required";
    if (!form.why.trim() || form.why.trim().length < 10) e.why = "Tell us a little more (10+ characters)";
    if (!form.resumeLink.trim()) e.resumeLink = "Add a resume link, or attach a file below";
    if (!form.consent) e.consent = "Consent is required to submit your application";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((p) => ({ ...p, [name]: type === "checkbox" ? checked : value }));
    if (errors[name]) setErrors((p) => ({ ...p, [name]: "" }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    if (!validate()) return;
    setStatus("sending");
    try {
      const data = await submitWeb3Form(e.target, { form_type: "Internship Application", subject: `Internship Application — ${form.name}` });
      if (data.success) {
        setStatus("success");
        e.target.reset();
        setForm(initialForm);
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const input = (name, extra = {}) => ({
    id: `intern-${name}`,
    name,
    value: form[name],
    onChange,
    className: `field-input${errors[name] ? " field-error" : ""}`,
    ...extra,
  });

  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/careers"
        jsonLd={[organizationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Careers", path: "/careers" }])]}
      />

      <PageHero
        label="Work With Brainlink Softwares"
        title="Learn By Building Real Software"
        subtitle="We regularly bring in students and early-career developers for hands-on, mentored work. Openings depend on current availability — apply and we'll follow up honestly either way."
      />

      {/* Life at Brainlink */}
      <section className="section">
        <div className="container">
          <SectionHeading label="Life at Brainlink" title="What Working Here Looks Like" />
          <StaggerGroup style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(230px, 1fr))", gap: 20 }}>
            {internshipHighlights.map((h) => {
              const Icon = h.icon;
              return (
                <StaggerItem key={h.title} className="card" style={{ textAlign: "center" }}>
                  <div style={{ display: "flex", justifyContent: "center", marginBottom: 12, color: "var(--accent)" }}>
                    <Icon size={26} strokeWidth={1.8} aria-hidden="true" />
                  </div>
                  <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.95rem", color: "var(--text)", marginBottom: 6 }}>{h.title}</h3>
                  <p style={{ fontSize: "0.83rem", color: "var(--muted)", lineHeight: 1.6 }}>{h.desc}</p>
                </StaggerItem>
              );
            })}
          </StaggerGroup>
        </div>
      </section>

      {/* Who should apply / skills valued / selection process */}
      <section className="section" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container who-skills-grid" style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 40 }}>
          <Reveal>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", color: "var(--text)", marginBottom: 18 }}>Who Should Apply</h2>
            <ul style={{ listStyle: "none", display: "flex", flexDirection: "column", gap: 12 }}>
              {whoShouldApply.map((w) => (
                <li key={w} style={{ display: "flex", gap: 10, fontSize: "0.88rem", color: "var(--muted)", lineHeight: 1.6 }}>
                  <CheckCircle2 size={16} style={{ color: "var(--success)", flexShrink: 0, marginTop: 2 }} aria-hidden="true" /> {w}
                </li>
              ))}
            </ul>
          </Reveal>
          <Reveal delay={0.1}>
            <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", color: "var(--text)", marginBottom: 18 }}>Skills We Value</h2>
            <div style={{ display: "flex", flexWrap: "wrap", gap: 10 }}>
              {skillsValued.map((s) => (
                <span key={s} className="tech-pill">{s}</span>
              ))}
            </div>
          </Reveal>
        </div>
      </section>

      {/* Selection process */}
      <section className="section">
        <div className="container">
          <SectionHeading label="Selection Process" title="How Applications Are Reviewed" />
          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 20, maxWidth: 900, margin: "0 auto" }}>
            {selectionProcess.map((s, i) => (
              <Reveal key={s.step} delay={i * 0.08} className="card">
                <div style={{ fontFamily: "var(--font-heading)", fontWeight: 800, fontSize: "1.4rem", color: "var(--accent)", marginBottom: 10 }}>
                  0{i + 1}
                </div>
                <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 600, fontSize: "0.95rem", color: "var(--text)", marginBottom: 8 }}>{s.step}</h3>
                <p style={{ fontSize: "0.85rem", color: "var(--muted)", lineHeight: 1.65 }}>{s.desc}</p>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* Application form */}
      <section className="section" id="apply" style={{ background: "var(--bg-card)", borderTop: "1px solid var(--border)", borderBottom: "1px solid var(--border)" }}>
        <div className="container" style={{ maxWidth: 720 }}>
          <SectionHeading label="Apply" title="Internship Application" subtitle="Openings depend on current availability. Submitting this form does not guarantee an interview or placement." />

          <form onSubmit={onSubmit} style={{ background: "var(--bg)", border: "1px solid var(--border)", borderRadius: 16, padding: "36px 32px", display: "flex", flexDirection: "column", gap: 20 }}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
              <div>
                <label className="field-label" htmlFor="intern-name">Full Name *</label>
                <input {...input("name")} type="text" placeholder="Jane Doe" />
                {errors.name && <p className="field-error-text">{errors.name}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="intern-email">Email *</label>
                <input {...input("email")} type="email" placeholder="jane@example.com" />
                {errors.email && <p className="field-error-text">{errors.email}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
              <div>
                <label className="field-label" htmlFor="intern-phone">Phone *</label>
                <input {...input("phone")} type="tel" placeholder="+91 98765 43210" />
                {errors.phone && <p className="field-error-text">{errors.phone}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="intern-role">Preferred Role *</label>
                <input {...input("role")} type="text" placeholder="e.g. Frontend Development Intern" />
                {errors.role && <p className="field-error-text">{errors.role}</p>}
              </div>
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 16 }} className="form-row-3">
              <div>
                <label className="field-label" htmlFor="intern-college">College / University *</label>
                <input {...input("college")} type="text" placeholder="Your institution" />
                {errors.college && <p className="field-error-text">{errors.college}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="intern-course">Course *</label>
                <input {...input("course")} type="text" placeholder="e.g. B.Tech CSE" />
                {errors.course && <p className="field-error-text">{errors.course}</p>}
              </div>
              <div>
                <label className="field-label" htmlFor="intern-year">Current Year *</label>
                <input {...input("year")} type="text" placeholder="e.g. 3rd Year" />
                {errors.year && <p className="field-error-text">{errors.year}</p>}
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="intern-skills">Skills</label>
              <input {...input("skills")} type="text" placeholder="React, Node.js, Figma..." />
            </div>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
              <div>
                <label className="field-label" htmlFor="intern-github">GitHub Link</label>
                <input {...input("github")} type="url" placeholder="https://github.com/yourname" />
              </div>
              <div>
                <label className="field-label" htmlFor="intern-linkedin">LinkedIn Link</label>
                <input {...input("linkedin")} type="url" placeholder="https://linkedin.com/in/yourname" />
              </div>
            </div>

            <div>
              <label className="field-label" htmlFor="intern-portfolio">Portfolio Link <span style={{ color: "var(--muted2)", fontWeight: 400 }}>(optional)</span></label>
              <input {...input("portfolio")} type="url" placeholder="https://yourportfolio.com" />
            </div>

            <div>
              <label className="field-label" htmlFor="intern-resumeLink">Resume Link *</label>
              <input {...input("resumeLink")} type="url" placeholder="Google Drive / Dropbox link to your resume" />
              {errors.resumeLink && <p className="field-error-text">{errors.resumeLink}</p>}
            </div>

            <div>
              <label className="field-label" htmlFor="intern-resume-file">Or Attach Resume <span style={{ color: "var(--muted2)", fontWeight: 400 }}>(PDF, optional)</span></label>
              <input id="intern-resume-file" name="resume" type="file" accept=".pdf,.doc,.docx" className="field-input" style={{ padding: "10px 14px" }} />
            </div>

            <div>
              <label className="field-label" htmlFor="intern-why">Why do you want to join Brainlink Softwares? *</label>
              <textarea {...input("why")} id="intern-why" rows={4} className={`field-textarea${errors.why ? " field-error" : ""}`} placeholder="A few sentences about what draws you to this internship..." />
              {errors.why && <p className="field-error-text">{errors.why}</p>}
            </div>

            <div className="field-checkbox-row">
              <input id="intern-consent" name="consent" type="checkbox" checked={form.consent} onChange={onChange} />
              <label htmlFor="intern-consent" style={{ fontSize: "0.82rem", color: "var(--muted)", lineHeight: 1.5 }}>
                I consent to Brainlink Softwares storing and reviewing this application. Submission does not guarantee an interview or placement. *
              </label>
            </div>
            {errors.consent && <p className="field-error-text">{errors.consent}</p>}

            <button type="submit" disabled={status === "sending"} className="btn-primary" style={{ justifyContent: "center", padding: "14px", width: "100%", opacity: status === "sending" ? 0.7 : 1 }}>
              {status === "sending" ? (<><Loader2 size={16} className="spin" aria-hidden="true" /> Submitting...</>) : "Submit Application"}
            </button>

            {status === "success" && (
              <div role="status" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 8, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                <CheckCircle2 size={18} style={{ color: "var(--success)" }} aria-hidden="true" />
                <p style={{ fontSize: "0.875rem", color: "var(--success)" }}>Application received. We'll reach out if there's a fit for a current opening.</p>
              </div>
            )}
            {status === "error" && (
              <div role="alert" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                <XCircle size={18} style={{ color: "var(--danger)" }} aria-hidden="true" />
                <p style={{ fontSize: "0.875rem", color: "var(--danger)" }}>Something went wrong. Please email your application to {siteConfig.email} instead.</p>
              </div>
            )}
          </form>
        </div>
      </section>

      {/* FAQ */}
      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <SectionHeading label="Questions" title="Internship FAQ" />
          <FAQAccordion items={careerFaqs} />
        </div>
      </section>

      <style>{`
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
        @media (max-width: 700px) {
          .who-skills-grid, .form-row-2, .form-row-3 { grid-template-columns: 1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
