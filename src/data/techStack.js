/**
 * Technologies genuinely used to build and run Brainlink Softwares' own
 * products (ExamShield), our partner work (Code ACE) and this website —
 * not an aspirational list.
 */
export const techCategories = [
  { id: "Frontend", title: "Frontend", desc: "Fast, accessible interfaces for web apps and sites." },
  { id: "Backend", title: "Backend & APIs", desc: "Services, APIs and real-time features." },
  { id: "Data", title: "Data & Storage", desc: "Relational data, caching and media." },
  { id: "AI", title: "AI & Intelligence", desc: "AI features and in-browser ML." },
  { id: "Infrastructure", title: "Cloud & DevOps", desc: "Shipping, hosting and running in production." },
];

export const techModules = [
  { name: "React", category: "Frontend", note: "Interactive interfaces across every product we ship." },
  { name: "Vite", category: "Frontend", note: "Fast builds for ExamShield and Code ACE." },
  { name: "Tailwind CSS + daisyUI", category: "Frontend", note: "Consistent, themeable UI components." },
  { name: "Framer Motion", category: "Frontend", note: "Purposeful motion and page transitions." },
  { name: "Monaco Editor", category: "Frontend", note: "In-browser code editing for coding assessments." },

  { name: "Node.js + Express", category: "Backend", note: "REST APIs and microservices." },
  { name: "WebSockets", category: "Backend", note: "Real-time live exam monitoring." },
  { name: "Firebase Auth", category: "Backend", note: "Sign-in and identity for client platforms." },
  { name: "Vercel Functions", category: "Backend", note: "Serverless APIs behind this website." },

  { name: "PostgreSQL", category: "Data", note: "Primary database for our products." },
  { name: "Neon", category: "Data", note: "Serverless Postgres for this site's blog and certificates." },
  { name: "Redis", category: "Data", note: "Caching and short-lived state." },
  { name: "Cloudinary", category: "Data", note: "Image and video storage and delivery." },

  { name: "Google Gemini", category: "AI", note: "AI coding help and interview practice in Code ACE." },
  { name: "Claude (Anthropic)", category: "AI", note: "AI-assisted features in ExamShield." },
  { name: "TensorFlow.js", category: "AI", note: "On-device face and object detection for proctoring." },

  { name: "Docker", category: "Infrastructure", note: "Containerised services and deployments." },
  { name: "Vercel", category: "Infrastructure", note: "Hosting and deploys for this site." },
  { name: "Cloudflare", category: "Infrastructure", note: "DNS, tunnels and edge security." },
  { name: "GitHub", category: "Infrastructure", note: "Version control, reviews and CI." },
];
