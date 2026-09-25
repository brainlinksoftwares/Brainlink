import { useState } from "react";
import { Phone, Mail, MapPin, CheckCircle2, XCircle, Loader2 } from "lucide-react";
import Layout from "../common/Layout";
import SEO, { organizationSchema, breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import { WhatsAppIcon } from "../components/icons/BrandIcons";
import { submitWeb3Form } from "../utils/web3forms";
import { siteConfig } from "../data/siteConfig";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/contact"];

const services = [
  "Custom Software Development", "Website / Web Application", "Mobile App Development",
  "SaaS Platform Development", "Startup MVP", "Backend / API Development", "UI/UX Design",
  "Cloud Deployment & DevOps", "Maintenance & Support", "Technical Consulting", "Not sure yet",
];

const budgets = ["Under ₹25,000", "₹25,000 – ₹1,00,000", "₹1,00,000 – ₹5,00,000", "₹5,00,000+", "Not sure yet"];

const initialForm = {
  name: "", company: "", email: "", phone: "", service: "", budget: "",
  startDate: "", description: "", contactMethod: "Email", consent: false,
};

export default function Contact() {
  const [form, setForm] = useState(initialForm);
  const [errors, setErrors] = useState({});
  const [status, setStatus] = useState("");

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = "Required";
    if (!form.email.trim()) e.email = "Required";
    else if (!/\S+@\S+\.\S+/.test(form.email)) e.email = "Invalid email";
    if (!form.phone.trim()) e.phone = "Required";
    if (!form.service) e.service = "Please select a service";
    if (!form.description.trim() || form.description.trim().length < 10) e.description = "At least 10 characters";
    if (!form.consent) e.consent = "Please accept to continue";
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
      const data = await submitWeb3Form(e.target, { subject: `New Project Enquiry — ${form.name}` });
      if (data.success) {
        setStatus("success");
        e.target.reset();
        setForm(initialForm);
      } else setStatus("error");
    } catch {
      setStatus("error");
    }
  };

  const input = (name) => ({
    id: `contact-${name}`,
    name,
    value: form[name],
    onChange,
    className: `field-input${errors[name] ? " field-error" : ""}`,
  });

  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/contact"
        jsonLd={[organizationSchema, breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Contact", path: "/contact" }])]}
      />

      <PageHero
        label="Contact Us"
        title={<>Let's Talk About Your <span style={{ color: "var(--accent)" }}>Project</span></>}
        subtitle="Tell us what you need and we'll come back within 24 hours with a clear plan — no jargon, no pressure."
      />

      <section className="section" style={{ paddingTop: 48, borderTop: "1px solid var(--border)" }}>
        <div className="container">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1.6fr", gap: 56, alignItems: "start" }} className="contact-grid">

            {/* Left — info */}
            <div>
              <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.3rem", color: "var(--text)", marginBottom: 8 }}>
                Get In Touch
              </h2>
              <p style={{ color: "var(--muted)", fontSize: "0.875rem", lineHeight: 1.8, marginBottom: 36 }}>
                Prefer a quick chat? Reach us directly on WhatsApp or call us.
              </p>

              {[
                { icon: Phone, label: "Phone", val: siteConfig.phone, href: siteConfig.phoneHref },
                { icon: Mail, label: "Email", val: siteConfig.email, href: `mailto:${siteConfig.email}` },
                { icon: MapPin, label: "Location", val: siteConfig.address, href: null },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.label} style={{ display: "flex", gap: 16, alignItems: "flex-start", marginBottom: 24 }}>
                    <div style={{ width: 42, height: 42, background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10, display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                      <Icon size={18} style={{ color: "var(--text)" }} aria-hidden="true" />
                    </div>
                    <div>
                      <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 4 }}>{item.label}</p>
                      {item.href
                        ? <a href={item.href} style={{ fontSize: "0.875rem", color: "var(--text)", textDecoration: "none" }}>{item.val}</a>
                        : <span style={{ fontSize: "0.875rem", color: "var(--text)" }}>{item.val}</span>}
                    </div>
                  </div>
                );
              })}

              <a href={siteConfig.whatsappHref()} target="_blank" rel="noopener noreferrer" className="btn-whatsapp" style={{ marginTop: 16, width: "100%", justifyContent: "center", padding: "14px" }}>
                <WhatsAppIcon width={17} height={17} /> Chat on WhatsApp
              </a>

              <div style={{ marginTop: 28, padding: "18px 20px", background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 10 }}>
                <p style={{ fontFamily: "var(--font-heading)", fontSize: "0.75rem", fontWeight: 600, color: "var(--muted2)", textTransform: "uppercase", letterSpacing: "0.06em", marginBottom: 8 }}>Working Hours</p>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)", lineHeight: 1.7 }}>{siteConfig.hours.weekdays}</p>
                <p style={{ fontSize: "0.875rem", color: "var(--muted)" }}>{siteConfig.hours.weekend}</p>
              </div>
            </div>

            {/* Right — form */}
            <div style={{ background: "var(--bg-card)", border: "1px solid var(--border)", borderRadius: 16, padding: "40px 36px" }}>
              <h3 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.15rem", color: "var(--text)", marginBottom: 28 }}>Tell Us About Your Project</h3>

              <form onSubmit={onSubmit} style={{ display: "flex", flexDirection: "column", gap: 20 }}>
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
                  <div>
                    <label className="field-label" htmlFor="contact-name">Full Name *</label>
                    <input {...input("name")} type="text" placeholder="John Doe" />
                    {errors.name && <p className="field-error-text">{errors.name}</p>}
                  </div>
                  <div>
                    <label className="field-label" htmlFor="contact-company">Business / Organization</label>
                    <input {...input("company")} type="text" placeholder="Optional" />
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
                  <div>
                    <label className="field-label" htmlFor="contact-email">Email *</label>
                    <input {...input("email")} type="email" placeholder="you@example.com" />
                    {errors.email && <p className="field-error-text">{errors.email}</p>}
                  </div>
                  <div>
                    <label className="field-label" htmlFor="contact-phone">Phone *</label>
                    <input {...input("phone")} type="tel" placeholder="+91 98765 43210" />
                    {errors.phone && <p className="field-error-text">{errors.phone}</p>}
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
                  <div>
                    <label className="field-label" htmlFor="contact-service">Service Required *</label>
                    <select {...input("service")} id="contact-service" className={`field-select${errors.service ? " field-error" : ""}`}>
                      <option value="">Select a service</option>
                      {services.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                    {errors.service && <p className="field-error-text">{errors.service}</p>}
                  </div>
                  <div>
                    <label className="field-label" htmlFor="contact-budget">Approximate Budget</label>
                    <select {...input("budget")} id="contact-budget" className="field-select">
                      <option value="">Select a range</option>
                      {budgets.map((b) => <option key={b} value={b}>{b}</option>)}
                    </select>
                  </div>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }} className="form-row-2">
                  <div>
                    <label className="field-label" htmlFor="contact-startDate">Expected Start Date</label>
                    <input {...input("startDate")} type="text" placeholder="e.g. Within 2 weeks" />
                  </div>
                  <div>
                    <label className="field-label" htmlFor="contact-contactMethod">Preferred Contact Method</label>
                    <select {...input("contactMethod")} id="contact-contactMethod" className="field-select">
                      <option>Email</option>
                      <option>Phone Call</option>
                      <option>WhatsApp</option>
                    </select>
                  </div>
                </div>

                <div>
                  <label className="field-label" htmlFor="contact-description">Project Description *</label>
                  <textarea {...input("description")} id="contact-description" rows={5} className={`field-textarea${errors.description ? " field-error" : ""}`} placeholder="Tell us about your project or what you need help with..." />
                  {errors.description && <p className="field-error-text">{errors.description}</p>}
                </div>

                <div className="field-checkbox-row">
                  <input id="contact-consent" name="consent" type="checkbox" checked={form.consent} onChange={onChange} />
                  <label htmlFor="contact-consent" style={{ fontSize: "0.8rem", color: "var(--muted)", lineHeight: 1.5 }}>
                    I agree to be contacted about this enquiry. We never spam or share your details. *
                  </label>
                </div>
                {errors.consent && <p className="field-error-text">{errors.consent}</p>}

                <button type="submit" disabled={status === "sending"} className="btn-primary" style={{ justifyContent: "center", padding: "14px", fontSize: "0.9rem", width: "100%", opacity: status === "sending" ? 0.7 : 1 }}>
                  {status === "sending" ? (<><Loader2 size={16} className="spin" aria-hidden="true" /> Sending...</>) : "Send Message"}
                </button>

                {status === "success" && (
                  <div role="status" style={{ background: "rgba(52,211,153,0.08)", border: "1px solid rgba(52,211,153,0.25)", borderRadius: 8, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                    <CheckCircle2 size={18} style={{ color: "var(--success)" }} aria-hidden="true" />
                    <p style={{ fontSize: "0.875rem", color: "var(--success)" }}>Message sent! We'll get back to you within 24 hours.</p>
                  </div>
                )}
                {status === "error" && (
                  <div role="alert" style={{ background: "rgba(239,68,68,0.08)", border: "1px solid rgba(239,68,68,0.25)", borderRadius: 8, padding: "14px 16px", display: "flex", gap: 10, alignItems: "center" }}>
                    <XCircle size={18} style={{ color: "var(--danger)" }} aria-hidden="true" />
                    <p style={{ fontSize: "0.875rem", color: "var(--danger)" }}>Something went wrong. Please try calling us directly at {siteConfig.phone}.</p>
                  </div>
                )}

                <p style={{ fontFamily: "var(--font-body)", fontSize: "0.75rem", color: "var(--muted2)", textAlign: "center", lineHeight: 1.6 }}>
                  By submitting, you agree to our <a href="/privacy-policy" style={{ color: "var(--accent)" }}>privacy policy</a>. We never spam.
                </p>
              </form>
            </div>
          </div>
        </div>
      </section>

      <style>{`
        .spin { animation: spin 0.9s linear infinite; }
        @keyframes spin { to { transform: rotate(360deg); } }
        @media (prefers-reduced-motion: reduce) { .spin { animation: none; } }
        @media (max-width:768px) {
          .contact-grid, .form-row-2 { grid-template-columns:1fr !important; }
        }
      `}</style>
    </Layout>
  );
}
