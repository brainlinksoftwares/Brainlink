/**
 * Generates 1200x630 link-preview (Open Graph) JPEGs into public/og/ by
 * screenshotting an HTML template with a local Chrome/Edge.
 *
 * Run manually when titles change:  npm run og-images
 * The images are committed, so Vercel builds don't need a browser.
 */
const fs = require("fs");
const os = require("os");
const path = require("path");
const { execFileSync } = require("child_process");

const ROOT = path.join(__dirname, "..");
const OUT_DIR = path.join(ROOT, "public", "og");

// route → image slug + card copy (kept short so it reads in a thumbnail)
const CARDS = {
  "/": { slug: "home", label: "Software Engineering Studio", headline: "Digital products built for real business growth." },
  "/services": { slug: "services", label: "Services", headline: "Web, mobile, SaaS & custom software development." },
  "/work": { slug: "work", label: "Case Studies", headline: "Real client work — problem, approach and outcome." },
  "/about": { slug: "about", label: "About Us", headline: "A software studio built on direct collaboration." },
  "/founder": { slug: "founder", label: "Meet the Founder", headline: "Aaditya Vishnoi", sub: "Founder & Lead Engineer", photo: "images/founder/aaditya-vishnoi-founder-brainlink-softwares.jpeg" },
  "/pricing": { slug: "pricing", label: "Pricing", headline: "Transparent engagement models for every stage." },
  "/careers": { slug: "careers", label: "Careers & Internships", headline: "Grow by building real software, with mentorship." },
  "/contact": { slug: "contact", label: "Contact", headline: "Let's talk about what you want to build." },
  "/blog": { slug: "blog", label: "Insights", headline: "Practical guides on software, web & startups." },
  "/privacy-policy": { slug: "privacy-policy", label: "Legal", headline: "Privacy Policy" },
  "/terms": { slug: "terms", label: "Legal", headline: "Terms & Conditions" },
  "/verify-certificate": { slug: "verify-certificate", label: "Credentials", headline: "Verify a Brainlink Softwares certificate." },
};

const BROWSERS = [
  "C:/Program Files/Google/Chrome/Application/chrome.exe",
  "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe",
  "/Applications/Google Chrome.app/Contents/MacOS/Google Chrome",
  "/usr/bin/google-chrome",
  "/usr/bin/chromium",
];

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
const fileUrl = (p) => "file:///" + path.resolve(p).replace(/\\/g, "/");

function template(card) {
  const logo = fileUrl(path.join(ROOT, "public", "logo.png"));
  const photo = card.photo && fileUrl(path.join(ROOT, "public", card.photo));
  return `<!doctype html><html><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@600;700;800&family=Inter:wght@500;600&display=block" rel="stylesheet">
<style>
  *{margin:0;padding:0;box-sizing:border-box}
  html,body{width:1200px;height:630px;overflow:hidden}
  body{font-family:Inter,sans-serif;background:#F7F8FA;position:relative;display:flex}
  .glow{position:absolute;width:900px;height:900px;right:-300px;top:-420px;border-radius:50%;
        background:radial-gradient(circle,rgba(49,92,255,.20),rgba(49,92,255,0) 65%)}
  .grid{position:absolute;inset:0;background-image:linear-gradient(rgba(17,24,39,.045) 1px,transparent 1px),
        linear-gradient(90deg,rgba(17,24,39,.045) 1px,transparent 1px);background-size:48px 48px;
        mask-image:linear-gradient(90deg,#000 0%,transparent 75%)}
  .main{position:relative;flex:1;padding:64px 72px;display:flex;flex-direction:column}
  .brand{display:flex;align-items:center;gap:14px;font-family:'Plus Jakarta Sans';font-weight:700;font-size:30px;color:#111827}
  .brand img{width:44px;height:44px;object-fit:contain}
  .brand span{color:#315CFF}
  .body{margin-top:auto;margin-bottom:auto}
  .label{display:inline-block;font-family:'Plus Jakarta Sans';font-weight:700;font-size:22px;color:#315CFF;
         background:#EEF2FF;border:1px solid rgba(49,92,255,.25);border-radius:999px;padding:8px 20px;margin-bottom:26px}
  h1{font-family:'Plus Jakarta Sans';font-weight:800;color:#111827;letter-spacing:-.02em;line-height:1.1;
     font-size:${card.photo ? 70 : card.headline.length > 40 ? 58 : 68}px;max-width:${card.photo ? 620 : 980}px}
  .sub{margin-top:18px;font-family:'Plus Jakarta Sans';font-weight:600;font-size:32px;color:#315CFF}
  .foot{display:flex;align-items:center;gap:14px;font-weight:600;font-size:22px;color:#667085}
  .dot{width:10px;height:10px;border-radius:50%;background:#315CFF}
  .bar{position:absolute;left:0;right:0;bottom:0;height:10px;background:linear-gradient(90deg,#315CFF,#7C9BFF)}
  .photo{position:relative;width:430px;margin:40px 48px 50px 0;border-radius:32px;overflow:hidden;
         box-shadow:0 30px 60px -20px rgba(17,24,39,.45);border:1px solid #E5E9F0}
  .photo img{width:100%;height:100%;object-fit:cover;object-position:center 18%}
</style></head><body>
  <div class="glow"></div><div class="grid"></div>
  <div class="main">
    <div class="brand"><img src="${logo}" alt=""><div>Brainlink <span>Softwares</span></div></div>
    <div class="body">
      <div class="label">${esc(card.label)}</div>
      <h1>${esc(card.headline)}</h1>
      ${card.sub ? `<div class="sub">${esc(card.sub)}</div>` : ""}
    </div>
    <div class="foot"><span class="dot"></span>brainlink.in · MSME-registered · Uttar Pradesh, India</div>
  </div>
  ${photo ? `<div class="photo"><img src="${photo}" alt=""></div>` : ""}
  <div class="bar"></div>
</body></html>`;
}

const browser = BROWSERS.find((b) => fs.existsSync(b));
if (!browser) {
  console.error("No Chrome/Edge found — install one or add its path to BROWSERS.");
  process.exit(1);
}

fs.mkdirSync(OUT_DIR, { recursive: true });
const tmp = fs.mkdtempSync(path.join(os.tmpdir(), "og-"));

for (const [route, card] of Object.entries(CARDS)) {
  const html = path.join(tmp, `${card.slug}.html`);
  fs.writeFileSync(html, template(card));
  const out = path.join(OUT_DIR, `${card.slug}.jpg`);
  execFileSync(browser, [
    "--headless=new",
    "--disable-gpu",
    "--hide-scrollbars",
    "--allow-file-access-from-files",
    "--force-device-scale-factor=1",
    "--window-size=1200,630",
    "--virtual-time-budget=5000",
    `--screenshot=${out}`,
    fileUrl(html),
  ], { stdio: "ignore" });
  console.log(`${route} → public/og/${card.slug}.jpg`);
}

fs.rmSync(tmp, { recursive: true, force: true });
