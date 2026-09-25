import Layout from "../common/Layout";
import SEO, { breadcrumbSchema } from "../components/SEO";
import PageHero from "../components/PageHero";
import { siteConfig } from "../data/siteConfig";
import pageMeta from "../data/pageMeta.json";

const meta = pageMeta["/terms"];

const Section = ({ title, children }) => (
  <div style={{ marginBottom: 36 }}>
    <h2 style={{ fontFamily: "var(--font-heading)", fontWeight: 700, fontSize: "1.1rem", color: "var(--text)", marginBottom: 12 }}>{title}</h2>
    <div style={{ color: "var(--muted)", fontSize: "0.92rem", lineHeight: 1.85 }}>{children}</div>
  </div>
);

export default function Terms() {
  return (
    <Layout>
      <SEO
        title={meta.title}
        description={meta.description}
        path="/terms"
        jsonLd={breadcrumbSchema([{ name: "Home", path: "/" }, { name: "Terms & Conditions", path: "/terms" }])}
      />

      <PageHero label="Legal" title={meta.title} subtitle="Last updated: February 2026" maxWidth={760} />

      <section className="section">
        <div className="container" style={{ maxWidth: 760 }}>
          <Section title="1. Agreement to Terms">
            <p>
              These Terms govern your use of {siteConfig.domain} and any engagement with Brainlink Softwares, a
              registered MSME enterprise (UDYAM: {siteConfig.msmeUdyam}). By using this website or engaging our
              services, you agree to these Terms.
            </p>
          </Section>

          <Section title="2. Services">
            <p>
              Brainlink Softwares provides custom software development, web and mobile application development,
              UI/UX design, backend and API development, cloud deployment support, maintenance, and technical
              consulting. The specific scope, deliverables, timeline and cost for any project are defined in a
              written proposal agreed before work begins — nothing on this website constitutes a binding quote.
            </p>
          </Section>

          <Section title="3. Project Engagement & Scope">
            <p>
              Work begins once scope, timeline and payment terms are agreed in writing. Requests outside the agreed
              scope are treated as additional work and quoted separately before being carried out.
            </p>
          </Section>

          <Section title="4. Payments & Refunds">
            <p style={{ marginBottom: 12 }}>
              Payment structure (including any upfront deposit and milestone schedule) is agreed per project before
              work starts. Because software development involves real time and resource commitment from the point
              work begins, deposits and payments for completed milestones are generally non-refundable, except where
              otherwise agreed in writing for a specific project.
            </p>
            <p>
              Third-party costs — hosting, domains, payment gateways, and other external services — are billed
              separately by their respective providers and are not included in Brainlink Softwares' fees unless
              explicitly stated in the proposal.
            </p>
          </Section>

          <Section title="5. Intellectual Property">
            <p>
              Unless otherwise agreed in writing, ownership of custom code and deliverables created specifically for
              your project transfers to you upon full payment. Brainlink Softwares retains the right to reuse
              general-purpose components, internal tools and know-how that aren't specific to your project.
            </p>
          </Section>

          <Section title="6. Client Responsibilities">
            <p>
              Timely feedback, access to necessary accounts/systems, and accurate information are needed for us to
              deliver on schedule. Delays caused by missing client input may affect agreed timelines.
            </p>
          </Section>

          <Section title="7. Warranties & Limitations">
            <p>
              We take reasonable care to test and deliver working software, but we do not guarantee that software will
              be entirely free of defects. Post-launch support and bug-fix terms are defined per the agreed engagement
              model. Brainlink Softwares' liability for any claim is limited to the fees paid for the specific
              deliverable in question.
            </p>
          </Section>

          <Section title="8. Internship Applications">
            <p>
              Submitting an internship application through this website does not guarantee an interview, offer, or
              placement. Any internship terms, including compensation and certification, are communicated directly
              and individually before the internship begins.
            </p>
          </Section>

          <Section title="9. Changes to These Terms">
            <p>
              We may update these Terms from time to time. Continued use of this website after changes are posted
              constitutes acceptance of the revised Terms.
            </p>
          </Section>

          <Section title="10. Contact">
            <p>
              Questions about these Terms can be sent to{" "}
              <a href={`mailto:${siteConfig.email}`} style={{ color: "var(--accent)" }}>{siteConfig.email}</a> or{" "}
              <a href={siteConfig.phoneHref} style={{ color: "var(--accent)" }}>{siteConfig.phone}</a>.
            </p>
          </Section>
        </div>
      </section>
    </Layout>
  );
}
