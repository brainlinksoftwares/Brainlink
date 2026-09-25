import { Helmet } from "react-helmet-async";
import { founder } from "../data/founder";
import pageMeta from "../data/pageMeta.json";

const SITE_URL = "https://www.brainlink.in";
const SITE_NAME = "Brainlink Softwares";
// Brand logo for structured data; link previews use the 1200x630 cards in /public/og.
const DEFAULT_IMAGE = `${SITE_URL}/logo.png`;
const DEFAULT_OG_IMAGE = pageMeta["/"].image;
// Size of the generated preview cards (scripts/generate-og-images.js).
const OG_CARD = { width: 1200, height: 630 };

/**
 * Centralized per-page SEO: title, description, canonical, Open Graph,
 * Twitter card and optional JSON-LD structured data.
 */
export default function SEO({
  title,
  description,
  path = "/",
  image,
  imageAlt,
  type = "website",
  profile = null,
  noindex = false,
  jsonLd = null,
}) {
  const fullTitle = title ? `${title} | ${SITE_NAME}` : `${SITE_NAME} | Custom Software, Web & Mobile App Development`;
  const canonical = `${SITE_URL}${path === "/" ? "" : path}`;
  // Pages without an explicit image get their card from pageMeta.json.
  const ogImage = image || pageMeta[path]?.image || DEFAULT_OG_IMAGE;
  const ogImageAlt = imageAlt || pageMeta[path]?.imageAlt || fullTitle;
  const imageUrl = ogImage.startsWith("http") ? ogImage : `${SITE_URL}${ogImage}`;
  const isCard = ogImage.startsWith("/og/");
  const schemas = Array.isArray(jsonLd) ? jsonLd : jsonLd ? [jsonLd] : [];

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={canonical} />
      {noindex && <meta name="robots" content="noindex, nofollow" />}

      {/* Open Graph */}
      <meta property="og:type" content={type} />
      <meta property="og:site_name" content={SITE_NAME} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={canonical} />
      <meta property="og:image" content={imageUrl} />
      <meta property="og:image:secure_url" content={imageUrl} />
      {isCard && <meta property="og:image:type" content="image/jpeg" />}
      {isCard && <meta property="og:image:width" content={String(OG_CARD.width)} />}
      {isCard && <meta property="og:image:height" content={String(OG_CARD.height)} />}
      <meta property="og:image:alt" content={ogImageAlt} />
      <meta property="og:locale" content="en_IN" />
      {profile?.firstName && <meta property="profile:first_name" content={profile.firstName} />}
      {profile?.lastName && <meta property="profile:last_name" content={profile.lastName} />}

      {/* Twitter */}
      <meta name="twitter:card" content="summary_large_image" />
      <meta name="twitter:title" content={fullTitle} />
      <meta name="twitter:description" content={description} />
      <meta name="twitter:image" content={imageUrl} />
      <meta name="twitter:image:alt" content={ogImageAlt} />
      <meta name="twitter:site" content="@BrainlinkIndia" />

      {schemas.map((schema, i) => (
        <script key={i} type="application/ld+json">
          {JSON.stringify(schema)}
        </script>
      ))}
    </Helmet>
  );
}

export const organizationSchema = {
  "@context": "https://schema.org",
  "@type": "ProfessionalService",
  "name": SITE_NAME,
  "url": SITE_URL,
  "logo": DEFAULT_IMAGE,
  "image": DEFAULT_IMAGE,
  "email": "team.brainlink@gmail.com",
  "telephone": "+91-94123-30177",
  "priceRange": "₹₹",
  "@id": `${SITE_URL}/#organization`,
  "founder": {
    "@type": "Person",
    "@id": `${SITE_URL}${founder.path}#person`,
    "name": founder.name,
    "url": `${SITE_URL}${founder.path}`,
  },
  "address": {
    "@type": "PostalAddress",
    "streetAddress": "Meena Market Road, Kanth",
    "addressLocality": "Moradabad",
    "addressRegion": "Uttar Pradesh",
    "postalCode": "244501",
    "addressCountry": "IN",
  },
  "sameAs": [
    "https://www.linkedin.com/company/brainlinksoftwares/",
    "https://www.instagram.com/brainlinksoftwares/",
    "https://x.com/BrainlinkIndia",
  ],
  "openingHoursSpecification": [
    {
      "@type": "OpeningHoursSpecification",
      "dayOfWeek": ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"],
      "opens": "10:00",
      "closes": "19:00",
    },
  ],
};

export function breadcrumbSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, i) => ({
      "@type": "ListItem",
      "position": i + 1,
      "name": item.name,
      "item": `${SITE_URL}${item.path}`,
    })),
  };
}

export function serviceSchema({ name, description, url }) {
  return {
    "@context": "https://schema.org",
    "@type": "Service",
    "serviceType": name,
    "name": name,
    "description": description,
    "url": `${SITE_URL}${url}`,
    "provider": { "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
    "areaServed": "IN",
  };
}

export function articleSchema({ title, description, image, datePublished, dateModified, path }) {
  return {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": title,
    "description": description,
    "image": image || DEFAULT_IMAGE,
    "datePublished": datePublished,
    "dateModified": dateModified || datePublished,
    "author": { "@type": "Organization", "name": SITE_NAME },
    "publisher": {
      "@type": "Organization",
      "name": SITE_NAME,
      "logo": { "@type": "ImageObject", "url": DEFAULT_IMAGE },
    },
    "mainEntityOfPage": `${SITE_URL}${path}`,
  };
}

/** Person entity for the founder — referenced from the Organization by @id. */
export const personSchema = {
  "@context": "https://schema.org",
  "@type": "Person",
  "@id": `${SITE_URL}${founder.path}#person`,
  "name": founder.name,
  "givenName": founder.firstName,
  "familyName": founder.name.split(" ").slice(1).join(" "),
  "jobTitle": founder.role,
  "description": founder.summary,
  "url": `${SITE_URL}${founder.path}`,
  "image": {
    "@type": "ImageObject",
    "url": `${SITE_URL}${founder.portrait.src}`,
    "width": founder.portrait.width,
    "height": founder.portrait.height,
    "caption": founder.portrait.alt,
  },
  "worksFor": { "@id": `${SITE_URL}/#organization`, "@type": "Organization", "name": SITE_NAME, "url": SITE_URL },
  "address": {
    "@type": "PostalAddress",
    "addressLocality": "Moradabad",
    "addressRegion": "Uttar Pradesh",
    "addressCountry": "IN",
  },
  "knowsAbout": founder.knowsAbout,
  ...(founder.sameAs.length ? { "sameAs": founder.sameAs } : {}),
};

export function profilePageSchema({ path, name, description }) {
  return {
    "@context": "https://schema.org",
    "@type": "ProfilePage",
    "name": name,
    "description": description,
    "url": `${SITE_URL}${path}`,
    "mainEntity": { "@id": personSchema["@id"] },
    "primaryImageOfPage": { "@type": "ImageObject", "url": personSchema.image.url },
    "isPartOf": { "@type": "WebSite", "name": SITE_NAME, "url": SITE_URL },
  };
}

export function faqSchema(items) {
  return {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": items.map((item) => ({
      "@type": "Question",
      "name": item.q,
      "acceptedAnswer": { "@type": "Answer", "text": item.a },
    })),
  };
}

export { SITE_URL, SITE_NAME };
