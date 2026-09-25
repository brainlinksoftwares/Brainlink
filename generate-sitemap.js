// generate-sitemap.js

const fs = require("fs");
const { SitemapStream, streamToPromise } = require("sitemap");

// ✅ Your website URL (change this to your actual domain)
const SITE_URL = "https://www.brainlink.in";

// ✅ List only public routes (ignore common components)
const routes = [
  { url: "/", changefreq: "daily", priority: 1.0 },
  { url: "/services", changefreq: "monthly", priority: 0.9 },
  { url: "/work", changefreq: "weekly", priority: 0.8 },
  { url: "/about", changefreq: "monthly", priority: 0.7 },
  { url: "/founder", changefreq: "monthly", priority: 0.7 },
  { url: "/pricing", changefreq: "monthly", priority: 0.8 },
  { url: "/careers", changefreq: "weekly", priority: 0.7 },
  { url: "/blog", changefreq: "daily", priority: 0.9 },
  { url: "/contact", changefreq: "monthly", priority: 0.8 },
  { url: "/privacy-policy", changefreq: "yearly", priority: 0.3 },
  { url: "/terms", changefreq: "yearly", priority: 0.3 },
];

(async () => {
  try {
    const sitemap = new SitemapStream({ hostname: SITE_URL });
    routes.forEach((route) => sitemap.write(route));
    sitemap.end();

    const xml = await streamToPromise(sitemap);
    const sitemapPath = "./public/sitemap.xml";

    fs.writeFileSync(sitemapPath, xml.toString());
    console.log("✅ Sitemap successfully created at:", sitemapPath);
  } catch (err) {
    console.error("❌ Error creating sitemap:", err);
  }
})();
