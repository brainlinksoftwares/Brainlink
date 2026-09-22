-- ==============================================================================
-- BRAINLINK SOFTWARES — COMPLETE DATABASE SCHEMA & DATA RESTORE
-- Target Database: PostgreSQL (Neon, Supabase, or self-hosted)
-- Account: dev.brainlink@gmail.com
-- ==============================================================================

-- 1. Enable pgcrypto extension for UUIDs
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- 2. Create tables
CREATE TABLE IF NOT EXISTS posts (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    slug VARCHAR(255) NOT NULL UNIQUE,
    excerpt TEXT,
    content TEXT NOT NULL,
    featured_image TEXT,
    meta_title VARCHAR(255),
    meta_description TEXT,
    keywords TEXT[],
    status VARCHAR(50) DEFAULT 'draft',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS certificates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    certificate_number VARCHAR(100) NOT NULL UNIQUE,
    certificate_slug VARCHAR(120) NOT NULL UNIQUE,
    recipient_name VARCHAR(200) NOT NULL,
    recipient_email VARCHAR(255),
    certificate_title VARCHAR(255) NOT NULL,
    internship_role VARCHAR(255),
    department VARCHAR(255),
    project_name VARCHAR(255),
    organisation_name VARCHAR(255) NOT NULL DEFAULT 'Brainlink Softwares',
    internship_start_date DATE,
    internship_end_date DATE,
    issue_date DATE NOT NULL,
    expiry_date DATE,
    status VARCHAR(20) NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'valid', 'revoked', 'expired')),
    certificate_file_url TEXT,
    public_note TEXT,
    internal_note TEXT,
    revoked_at TIMESTAMPTZ,
    revocation_reason_public TEXT,
    revocation_reason_internal TEXT,
    issued_by VARCHAR(255),
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_posts_slug ON posts(slug);
CREATE INDEX IF NOT EXISTS idx_posts_status ON posts(status);
CREATE INDEX IF NOT EXISTS idx_certificates_number ON certificates(certificate_number);
CREATE INDEX IF NOT EXISTS idx_certificates_slug ON certificates(certificate_slug);
CREATE INDEX IF NOT EXISTS idx_certificates_status ON certificates(status);

-- 3. Clear existing rows if re-running
TRUNCATE TABLE posts CASCADE;
TRUNCATE TABLE certificates CASCADE;

-- 4. Restore Posts Data
INSERT INTO posts (id, title, slug, excerpt, content, featured_image, meta_title, meta_description, keywords, status, created_at, updated_at)
VALUES
(
  4,
  'Website Development Cost in India (2026 Complete Guide)',
  'website-cost-india',
  'Understand the real cost of website development in India, including pricing factors, hidden costs, and how to budget smartly.',
  '<h2>Introduction</h2>\n  <p>Website development costs in India vary widely depending on complexity, features, and business requirements. Whether you need a simple portfolio site or a full-scale business platform, understanding pricing helps you avoid overspending and poor quality work.</p>\n\n  <h2>Average Website Development Cost in India</h2>\n  <ul>\n    <li><strong>Basic Website:</strong> ₹5,000 – ₹25,000</li>\n    <li><strong>Business Website:</strong> ₹25,000 – ₹80,000</li>\n    <li><strong>E-commerce Website:</strong> ₹50,000 – ₹2,00,000+</li>\n    <li><strong>Custom Web Applications:</strong> ₹1,50,000+</li>\n  </ul>\n\n  <h2>Key Factors Affecting Cost</h2>\n  <h3>1. Design Complexity</h3>\n  <p>Custom UI/UX design costs more than template-based websites but significantly improves brand credibility.</p>\n\n  <h3>2. Features & Functionality</h3>\n  <p>Login systems, payment gateways, dashboards, and integrations increase development time and cost.</p>\n\n  <h3>3. Technology Stack</h3>\n  <p>Modern frameworks like React, Next.js, or custom backend APIs increase initial cost but improve scalability.</p>\n\n  <h3>4. Hosting & Domain</h3>\n  <p>Domains typically cost ₹800–₹1,500 yearly, while hosting ranges from ₹2,000 to ₹20,000 depending on traffic.</p>\n\n  <h2>Hidden Costs Most People Ignore</h2>\n  <ul>\n    <li>Maintenance and updates</li>\n    <li>Security implementation</li>\n    <li>SEO optimization</li>\n    <li>Content creation</li>\n    <li>Performance optimization</li>\n  </ul>\n\n  <h2>How to Save Money Smartly</h2>\n  <p>Don’t always go for the cheapest option. Poor development leads to redesign costs later. Focus on scalability and long-term value.</p>\n\n  <h2>Final Thoughts</h2>\n  <p>Website development is an investment, not an expense. Choosing the right developer and technology stack ensures long-term business growth and online credibility.</p>\n  \n  <p><strong>Need help building your website?</strong> Contact professionals who understand business goals, not just coding.</p>\n  ',
  'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d',
  'Website Development Cost in India 2026 – Full Pricing Guide',
  'Complete guide to website development cost in India. Learn pricing, hidden charges, budgeting tips, and business website investment insights.',
  ARRAY['website development cost', 'website cost india', 'web development pricing', 'business website cost', 'website budget india'],
  'published',
  '2026-02-08 11:12:19.648+00',
  '2026-02-08 11:12:19.648+00'
),
(
  5,
  'Complete Guide to SEO for Business Websites (2026)',
  'seo-guide-business-website',
  'Learn practical SEO strategies to rank your business website on Google including technical SEO, content optimization, and backlink strategy.',
  '<h2>Introduction</h2>\n  <p>Search Engine Optimization (SEO) is essential for any business website aiming to gain organic traffic from Google. A properly optimized website can significantly reduce marketing costs while improving brand authority.</p>\n\n  <h2>Why SEO Matters for Businesses</h2>\n  <ul>\n    <li>Long-term free traffic</li>\n    <li>Higher credibility and trust</li>\n    <li>Better conversion rates</li>\n    <li>Improved brand visibility</li>\n  </ul>\n\n  <h2>Technical SEO Fundamentals</h2>\n  <h3>Website Speed</h3>\n  <p>Fast-loading websites rank better. Optimize images, use caching, and choose reliable hosting.</p>\n\n  <h3>Mobile Optimization</h3>\n  <p>Google uses mobile-first indexing. Ensure responsive design and fast mobile performance.</p>\n\n  <h3>Structured Data</h3>\n  <p>Schema markup helps search engines understand your content better and improves click-through rates.</p>\n\n  <h2>Content Optimization Strategy</h2>\n  <p>Quality content is still the strongest SEO factor. Focus on solving real user problems rather than keyword stuffing.</p>\n\n  <ul>\n    <li>Use proper headings (H1–H3)</li>\n    <li>Write clear, helpful content</li>\n    <li>Add internal links</li>\n    <li>Update old articles regularly</li>\n  </ul>\n\n  <h2>Backlink Strategy</h2>\n  <p>Backlinks act as trust signals. Focus on quality rather than quantity:</p>\n\n  <ul>\n    <li>Guest blogging</li>\n    <li>Industry partnerships</li>\n    <li>Content marketing</li>\n    <li>Social media visibility</li>\n  </ul>\n\n  <h2>Common SEO Mistakes</h2>\n  <ul>\n    <li>Ignoring technical SEO</li>\n    <li>Duplicate content</li>\n    <li>Poor mobile experience</li>\n    <li>Slow website speed</li>\n  </ul>\n\n  <h2>Final Thoughts</h2>\n  <p>SEO is a continuous process. Businesses that invest consistently in optimization gain long-term competitive advantage and sustainable traffic growth.</p>\n\n  <p><strong>Pro Tip:</strong> Combine SEO with quality product/service delivery — ranking alone is not enough for business success.</p>\n  ',
  'https://images.unsplash.com/photo-1432888622747-4eb9a8efeb07',
  'SEO Guide for Business Websites 2026 – Rank Higher on Google',
  'Comprehensive SEO guide for business websites covering technical SEO, content strategy, backlinks, and ranking improvement techniques.',
  ARRAY['seo guide', 'business website seo', 'google ranking tips', 'technical seo', 'seo strategy 2026'],
  'published',
  '2026-02-08 11:46:16.386+00',
  '2026-02-08 11:46:16.386+00'
),
(
  6,
  'Artificial Intelligence Explained: Reality, Impact, and Future',
  'artificial-intelligence-explained-guide',
  'A deep practical guide to Artificial Intelligence explaining how it works, its real-world impact, risks, myths, and future trends.',
  '\n  <h2>Introduction</h2>\n  <p>\n  Artificial Intelligence (AI) is rapidly transforming industries,\n  businesses, and everyday life. From recommendation systems on\n  streaming platforms to advanced automation tools in companies,\n  AI has moved far beyond research labs.\n  </p>\n\n  <p>\n  This guide explains AI clearly — without hype — focusing on real\n  applications, practical impact, and future direction.\n  </p>\n\n  <br>\n\n  <h2>What Artificial Intelligence Actually Means</h2>\n  <p>\n  AI refers to computer systems designed to perform tasks normally\n  requiring human intelligence. These tasks include language\n  understanding, pattern recognition, prediction, and decision-making.\n  </p>\n\n  <p><strong>Authoritative Source:</strong>\n  <a href=\"https://aiindex.stanford.edu/\" target=\"_blank\">\n  Stanford AI Index Report\n  </a></p>\n\n  <br>\n\n  <h2>Main Types of AI Today</h2>\n\n  <h3>Narrow AI</h3>\n  <p>\n  Most AI today is narrow AI, meaning it performs specific tasks\n  extremely well but lacks general intelligence. Examples include\n  chatbots, recommendation engines, and fraud detection systems.\n  </p>\n\n  <h3>Generative AI</h3>\n  <p>\n  Generative AI can create text, images, audio, and even code.\n  Large language models and image generation tools fall into\n  this category.\n  </p>\n\n  <p><strong>Research Reference:</strong>\n  <a href=\"https://openai.com/research\" target=\"_blank\">\n  OpenAI Research Publications\n  </a></p>\n\n  <br>\n\n  <h2>Real Business Impact</h2>\n  <p>Companies use AI mainly for:</p>\n\n  <ul>\n    <li>Customer support automation</li>\n    <li>Predictive analytics</li>\n    <li>Marketing optimization</li>\n    <li>Fraud detection</li>\n    <li>Process automation</li>\n  </ul>\n\n  <p><strong>Industry Report:</strong>\n  <a href=\"https://www.mckinsey.com/capabilities/quantumblack/our-insights/the-state-of-ai\" target=\"_blank\">\n  McKinsey State of AI\n  </a></p>\n\n  <br>\n\n  <h2>Common AI Myths</h2>\n\n  <h3>Myth 1 — AI Will Replace All Jobs</h3>\n  <p>\n  AI usually augments human work rather than completely replacing it.\n  New roles are emerging alongside automation.\n  </p>\n\n  <h3>Myth 2 — AI Thinks Like Humans</h3>\n  <p>\n  AI models detect patterns but do not possess consciousness or\n  human understanding.\n  </p>\n\n  <h3>Myth 3 — AI Is Always Accurate</h3>\n  <p>\n  AI systems can produce incorrect results, especially when trained\n  on incomplete or biased data.\n  </p>\n\n  <br>\n\n  <h2>Risks and Challenges</h2>\n\n  <ul>\n    <li>Data privacy concerns</li>\n    <li>Bias in training data</li>\n    <li>Security misuse risks</li>\n    <li>Ethical considerations</li>\n  </ul>\n\n  <p><strong>Framework Reference:</strong>\n  <a href=\"https://www.nist.gov/artificial-intelligence\" target=\"_blank\">\n  NIST AI Risk Management Framework\n  </a></p>\n\n  <br>\n\n  <h2>Future Outlook</h2>\n  <p>\n  Experts expect more AI-human collaboration, better automation\n  tools, stronger regulation, and wider adoption across industries.\n  Progress will likely remain gradual rather than sudden.\n  </p>\n\n  <br>\n\n  <h2>Final Thoughts</h2>\n  <p>\n  AI is neither magic nor a threat by default. It is a powerful tool.\n  Businesses and individuals who learn to use it responsibly will\n  gain significant advantages in productivity and innovation.\n  </p>\n\n  <p>\n  The key is understanding both capabilities and limitations rather\n  than following hype.\n  </p>\n  ',
  'https://images.unsplash.com/photo-1677442136019-21780ecad995',
  'Artificial Intelligence Guide – Impact, Reality & Future',
  'Complete AI guide explaining artificial intelligence, business impact, myths, risks, and future trends with credible sources.',
  ARRAY['artificial intelligence', 'ai guide', 'future of ai', 'machine learning', 'ai business impact'],
  'published',
  '2026-02-08 12:03:43.042+00',
  '2026-02-08 12:03:43.042+00'
),
(
  7,
  'Building Secure APIs: A Practical Guide for Developers (2026)',
  'building-secure-apis-practical-guide',
  'Learn how to build secure APIs with authentication, encryption, validation, rate limiting, and best practices used in modern software development.',
  '<h2>Introduction</h2>\n\n<p>\nAPIs are the backbone of modern software applications. Whether building SaaS platforms,\nmobile apps, or enterprise software, APIs handle sensitive data and core business logic.\n</p>\n\n<p>\nPoor API security can lead to data breaches, service disruption, financial losses,\nand serious reputation damage. This guide explains practical security techniques\ndevelopers should implement from day one.\n</p>\n<br>\n<hr>\n<br>\n<h2>Authentication vs Authorization</h2>\n\n<p><strong>Authentication</strong> verifies who the user is.</p>\n<p><strong>Authorization</strong> determines what the user is allowed to access.</p>\n\n<p>\nModern APIs commonly use JWT tokens, OAuth 2.0, API keys, or session authentication,\ndepending on the system architecture and security requirements.\n</p>\n<br>\n<hr>\n<br>\n<h2>Always Use HTTPS Encryption</h2>\n\n<p>\nHTTPS encrypts data in transit and protects sensitive information from interception.\nToday, exposing production APIs without HTTPS is considered a major security risk.\n</p>\n\n<ul>\n<li>Prevents data interception</li>\n<li>Builds user trust</li>\n<li>Supports compliance standards</li>\n</ul>\n<br>\n<hr>\n<br>\n<h2>Input Validation Best Practices</h2>\n\n<p>\nUnvalidated input is one of the most common security vulnerabilities.\nIt can lead to SQL injection, cross-site scripting (XSS),\nand system crashes.\n</p>\n\n<ul>\n<li>Validate all inputs on the server side</li>\n<li>Use parameterized database queries</li>\n<li>Sanitize user input properly</li>\n<li>Reject unexpected or unknown fields</li>\n</ul>\n<br>\n<hr>\n<br>\n<h2>Rate Limiting and Abuse Protection</h2>\n\n<p>\nRate limiting protects APIs from brute-force attacks,\nautomated scraping, and server overload.\n</p>\n\n<ul>\n<li>IP-based request limiting</li>\n<li>User/account throttling</li>\n<li>Traffic anomaly monitoring</li>\n</ul>\n<br>\n<hr>\n<br>\n<h2>Secure API Keys Properly</h2>\n\n<p>\nAPI keys must be treated like passwords.\nImproper handling can expose entire systems.\n</p>\n\n<ul>\n<li>Store keys in environment variables</li>\n<li>Rotate keys periodically</li>\n<li>Never expose keys in frontend code</li>\n<li>Monitor usage continuously</li>\n</ul>\n<br>\n<hr>\n<br>\n<h2>Recommended Resources</h2>\n\n<ul>\n<li>\nOWASP API Security Top 10 —\n<a href=\"https://owasp.org/www-project-api-security/\" target=\"_blank\">\nhttps://owasp.org/www-project-api-security/\n</a>\n</li>\n\n<li>\nMDN Web Security Docs —\n<a href=\"https://developer.mozilla.org/en-US/docs/Web/Security\" target=\"_blank\">\nhttps://developer.mozilla.org/en-US/docs/Web/Security\n</a>\n</li>\n\n<li>\nGoogle Cloud API Security —\n<a href=\"https://cloud.google.com/apis/design/security\" target=\"_blank\">\nhttps://cloud.google.com/apis/design/security\n</a>\n</li>\n\n<li>\nAuth0 Security Documentation —\n<a href=\"https://auth0.com/docs/secure\" target=\"_blank\">\nhttps://auth0.com/docs/secure\n</a>\n</li>\n</ul>\n<br>\n<hr>\n<br>\n<h2>Final Thoughts</h2>\n\n<p>\nAPI security should never be an afterthought.\nImplement authentication, encryption, validation,\nmonitoring, and access control early rather than\nfixing vulnerabilities later.\n</p>\n\n<p>\nAs software ecosystems grow more interconnected,\nsecure APIs become critical for protecting both\nusers and business credibility.\n</p>\n',
  'https://images.unsplash.com/photo-1555949963-aa79dcee981c',
  'Building Secure APIs Guide – Authentication, Encryption, Best Practices',
  'Complete practical guide to building secure APIs covering authentication, encryption, validation, rate limiting, and modern security practices.',
  ARRAY['api security', 'secure api development', 'backend security', 'jwt authentication', 'web api best practices'],
  'published',
  '2026-02-09 05:37:34.594+00',
  '2026-02-09 05:37:34.594+00'
),
(
  8,
  'How to Build a SaaS MVP in 2026 – Practical Developer & Startup Guide',
  'build-saas-mvp-guide-2026',
  'Learn how to build a SaaS MVP efficiently in 2026 with practical development steps, tools, security tips, and real startup strategies.',
  '<h2>Introduction</h2>\n\n  <p>\n  Building a SaaS product today is faster than ever, but also more competitive.\n  Startups that validate ideas quickly using a Minimum Viable Product (MVP)\n  have a significantly higher chance of success compared to those building\n  large products without early feedback.\n  </p>\n\n  <p>\n  This guide explains how developers, founders, and businesses can build a\n  scalable SaaS MVP efficiently in 2026 using modern tools, best practices,\n  and realistic development strategies.\n  </p>\n<br>\n  <hr>\n<br>\n  <h2>What Exactly Is a SaaS MVP?</h2>\n\n  <p>\n  A Minimum Viable Product (MVP) is the simplest functional version of your\n  software that solves a core problem for users.\n  </p>\n\n  <ul>\n    <li>Focuses only on essential features</li>\n    <li>Allows early user testing</li>\n    <li>Reduces development cost and time</li>\n    <li>Validates business demand quickly</li>\n  </ul>\n\n  <p>\n  The goal is learning quickly — not building perfection.\n  </p>\n<br>\n  <hr>\n<br>\n  <h2>Step 1 — Validate Your Idea First</h2>\n\n  <p>\n  Before writing code, confirm that real users actually need your solution.\n  Many SaaS products fail not because of bad technology,\n  but because there is no real demand.\n  </p>\n\n  <ul>\n    <li>Talk to potential users</li>\n    <li>Study competitors</li>\n    <li>Create a simple landing page</li>\n    <li>Collect early feedback</li>\n  </ul>\n\n  <p>\n  Validation saves months of unnecessary development.\n  </p>\n<br>\n  <hr>\n<br>\n  <h2>Step 2 — Choose the Right Tech Stack</h2>\n\n  <p>\n  Your tech stack should support rapid development and future scalability.\n  A commonly used modern SaaS stack includes:\n  </p>\n\n  <ul>\n    <li>Frontend: React / Next.js</li>\n    <li>Backend: Node.js / Python / Go</li>\n    <li>Database: PostgreSQL / MongoDB</li>\n    <li>Hosting: Vercel, AWS, or cloud platforms</li>\n  </ul>\n\n  <p>\n  Avoid unnecessary complexity early — simplicity accelerates launch.\n  </p>\n<br>\n  <hr>\n<br>\n  <h2>Step 3 — Focus on Core Features Only</h2>\n\n  <p>\n  Feature overload is the biggest MVP killer.\n  Start with only essential features:\n  </p>\n\n  <ul>\n    <li>User authentication</li>\n    <li>Main product functionality</li>\n    <li>Basic dashboard</li>\n    <li>Payment integration if required</li>\n  </ul>\n\n  <p>\n  Everything else can be added later.\n  </p>\n<br>\n  <hr>\n<br>\n  <h2>Step 4 — Prioritize Security From Day One</h2>\n\n  <p>\n  Even MVP products handle user data.\n  Basic security practices must be implemented early:\n  </p>\n\n  <ul>\n    <li>HTTPS encryption</li>\n    <li>Secure authentication</li>\n    <li>API validation</li>\n    <li>Environment variable protection</li>\n  </ul>\n\n  <p>\n  Security issues later are far more expensive to fix.\n  </p>\n<br>\n  <hr>\n<br>\n  <h2>Step 5 — Launch Early, Iterate Fast</h2>\n\n  <p>\n  Your first version will not be perfect — and that is normal.\n  Early launch helps:\n  </p>\n\n  <ul>\n    <li>Collect real user feedback</li>\n    <li>Identify practical issues</li>\n    <li>Improve product-market fit</li>\n    <li>Build initial traction</li>\n  </ul>\n\n  <p>\n  Speed beats perfection in early SaaS development.\n  </p>\n<br>\n  <hr>\n<br>\n  <h2>Common MVP Development Mistakes</h2>\n\n  <ul>\n    <li>Overbuilding unnecessary features</li>\n    <li>Ignoring user feedback</li>\n    <li>Choosing complex architecture too early</li>\n    <li>Neglecting performance or security</li>\n    <li>Delaying launch excessively</li>\n  </ul>\n<br>\n  <hr>\n<br>\n  <h2>Tools That Accelerate SaaS Development</h2>\n\n  <ul>\n    <li>Firebase or Supabase for backend acceleration</li>\n    <li>Stripe for payments</li>\n    <li>Auth0 or Clerk for authentication</li>\n    <li>Docker for deployment consistency</li>\n    <li>Analytics tools for user insights</li>\n  </ul>\n\n  <p>\n  Using proven tools reduces development time and bugs.\n  </p>\n<br>\n  <hr>\n<br>\n  <h2>Final Thoughts</h2>\n\n  <p>\n  Building a SaaS MVP in 2026 is more accessible than ever,\n  but success depends on clarity, speed, and execution.\n  Focus on solving one real problem well,\n  launch early, learn continuously,\n  and improve based on real feedback.\n  </p>\n\n  <p>\n  A successful MVP is not the final product —\n  it is the beginning of a validated business.\n  </p>\n  ',
  'https://images.unsplash.com/photo-1551288049-bebda4e38f71',
  'How to Build a SaaS MVP in 2026 – Complete Practical Guide',
  'Step-by-step guide to building a SaaS MVP including validation, tech stack, security, development tools, and startup best practices.',
  ARRAY['saas development', 'mvp development', 'startup software', 'software development guide', 'build saas product'],
  'published',
  '2026-02-09 22:54:11.809+00',
  '2026-02-09 22:54:11.809+00'
);

-- Adjust sequence for posts.id
SELECT setval('posts_id_seq', (SELECT MAX(id) FROM posts));

-- 5. Restore Certificates Data
INSERT INTO certificates (
  id, certificate_number, certificate_slug, recipient_name, recipient_email,
  certificate_title, internship_role, department, project_name, organisation_name,
  internship_start_date, internship_end_date, issue_date, status,
  certificate_file_url, public_note, issued_by, created_at, updated_at
)
VALUES
(
  '9831c90a-11ba-495c-ad45-0c2123f3bbb7',
  'BLS/CERT/2026/AUG-002',
  'BLS-CERT-2026-AUG-002',
  'Arnim Jha',
  'jhaarnim8441@gmail.com',
  'Certificate of Internship',
  'UI/UX Design Intern',
  'Product Design Department',
  'Parkin10 Mobility Private Limited',
  'Brainlink Softwares',
  '2026-07-09',
  '2026-08-09',
  '2026-08-09',
  'valid',
  'https://drive.google.com/file/d/1YfBz-o4vtp8uJ5OjwcCy8v6o3w0g040T/view?usp=sharing',
  'Successfully completed the Web Development Internship at Brainlink Softwares with professionalism, dedication, and strong skills while contributing to the assigned projects.',
  'Brainlink Softwares',
  '2026-08-02 06:02:00+00',
  '2026-08-09 19:29:10.913+00'
),
(
  '2c5a8465-0615-4c93-acdc-3a71d248b6d8',
  'BLS/CERT/2026/AUG-001',
  'BLS-CERT-2026-AUG-001',
  'Jigyasha Chaudhary',
  'jiyachaudhary484@gmail.com',
  'Certificate of Internship',
  'Web Development Intern',
  'Web Development Department',
  'Parkin10 Mobility Private Ltd. / Om Pictures',
  'Brainlink Softwares',
  '2026-07-09',
  '2026-08-09',
  '2026-08-09',
  'valid',
  'https://drive.google.com/file/d/1q_n5croU_BsR11Crxu8lQeh_NDrhUDKp/view?usp=sharing',
  'Successfully completed the Web Development Internship at Brainlink Softwares with professionalism, dedication, and strong skills while contributing to the assigned projects.',
  'Brainlink Softwares',
  '2026-08-02 00:01:12.906+00',
  '2026-08-20 20:10:19.681+00'
);
