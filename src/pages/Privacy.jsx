import Layout from "../common/Layout";
import SEO, { breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import { siteConfig } from "../data/siteConfig";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/privacy-policy"];

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: 12 }}>{title}</h2>
    <div style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.85 }}>{children}</div>
  </div>
);

export default function Privacy() {
  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/privacy-policy"
        jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Privacy Policy", path: "/privacy-policy" }])}
      />

      <PageHero label="Legal" title={meta.title} subtitle="Last updated: February 2026" maxWidth={760} />

      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <Section title="1. Overview">
            <p>
              This Privacy Policy explains what information Brainlink Softwares ("we", "us") collects through{" "}
              {siteConfig.domain}, how it is used, and the choices you have. By using this website or submitting a
              form, you agree to the practices described here.
            </p>
          </Section>

          <Section title="2. Information We Collect">
            <p style={{ marginBottom: 12 }}>We collect information you provide directly, such as when you:</p>
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>Submit the contact or project enquiry form (name, email, phone, business name, project details, budget range)</li>
              <li>Submit an internship application (education details, skills, portfolio/resume links)</li>
              <li>Contact us directly via email, phone or WhatsApp</li>
            </ul>
            <p style={{ marginTop: 12 }}>
              We also collect limited technical information automatically, such as browser type and general usage
              analytics, to understand how the website is used and to keep it running reliably.
            </p>
          </Section>

          <Section title="3. How We Use Information">
            <ul style={{ paddingLeft: 20, display: "flex", flexDirection: "column", gap: 8 }}>
              <li>To respond to enquiries and discuss project or internship requests</li>
              <li>To provide services you've engaged us for</li>
              <li>To improve this website's content, performance and usability</li>
            </ul>
            <p style={{ marginTop: 12 }}>We do not sell your personal information to third parties.</p>
          </Section>

          <Section title="4. Third-Party Services">
            <p>
              Form submissions on this website are processed through <strong>Web3Forms</strong>, a third-party form
              delivery service, which forwards submissions to our email inbox. This website is hosted on{" "}
              <strong>Vercel</strong>, and our blog content is stored in a <strong>Neon PostgreSQL</strong> database.
              Each of these providers processes data under their own privacy terms.
            </p>
          </Section>

          <Section title="5. Data Retention">
            <p>
              We retain enquiry and application information for as long as reasonably necessary to respond to your
              request or maintain a business relationship, after which it may be deleted or anonymized.
            </p>
          </Section>

          <Section title="6. Your Choices">
            <p>
              You can request access to, correction of, or deletion of information you've submitted to us by emailing{" "}
              <a href={`mailto:${siteConfig.email}`} style={{ color: "var(--accent)" }}>{siteConfig.email}</a>. We will
              respond within a reasonable timeframe.
            </p>
          </Section>

          <Section title="7. Cookies">
            <p>
              This website may use minimal, functional cookies or local storage for basic site functionality.
              These do not track you across other websites.
            </p>
          </Section>

          <Section title="8. Changes to This Policy">
            <p>
              We may update this policy from time to time. Material changes will be reflected by updating the "last
              updated" date above.
            </p>
          </Section>

          <Section title="9. Contact">
            <p>
              Questions about this policy can be sent to{" "}
              <a href={`mailto:${siteConfig.email}`} style={{ color: "var(--accent)" }}>{siteConfig.email}</a> or{" "}
              <a href={siteConfig.phoneHref} style={{ color: "var(--accent)" }}>{siteConfig.phone}</a>.
            </p>
          </Section>
        </div>
      </section>
    </Layout>
  );
}
