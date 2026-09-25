import { Code2, Users, MessageSquare, GraduationCap } from "lucide-react";
import pageMeta from "./pageMeta.json";

/**
 * Founder profile — single source for the /founder page, the founder
 * spotlight on Home/About, and the Person/ProfilePage structured data.
 * Images live in /public so they have stable absolute URLs for og:image
 * and JSON-LD.
 */
const IMG = "/images/founder";

export const founder = {
  name: "Aaditya Vishnoi",
  firstName: "Aaditya",
  role: "Founder & Lead Engineer",
  company: "Brainlink Softwares",
  path: "/founder",
  location: "Kanth, Moradabad, Uttar Pradesh",
  // Add personal profile URLs here (LinkedIn, X, GitHub...) — they feed
  // the Person schema's sameAs and the social links on the founder page.
  sameAs: [],
  portrait: {
    src: `${IMG}/aaditya-vishnoi-founder-brainlink-softwares.jpeg`,
    width: 1066,
    height: 1600,
    alt: "Aaditya Vishnoi, Founder & Lead Engineer of Brainlink Softwares",
  },
  gallery: [
    { src: `${IMG}/aaditya-vishnoi-1.jpeg`, width: 1600, height: 1066, alt: "Aaditya Vishnoi, founder of Brainlink Softwares, smiling" },
    { src: `${IMG}/aaditya-vishnoi-2.jpeg`, width: 1600, height: 1066, alt: "Aaditya Vishnoi standing beside a bookshelf" },
    { src: `${IMG}/aaditya-vishnoi-3.jpeg`, width: 1600, height: 1066, alt: "Aaditya Vishnoi in a library corridor" },
    { src: `${IMG}/aaditya-vishnoi-4.jpeg`, width: 1600, height: 1066, alt: "Aaditya Vishnoi smiling in an office hallway" },
  ],
  headline: "Building software the honest way — directly with the people who use it.",
  // Page title/description live in pageMeta.json (shared with the build-time prerender).
  summary: pageMeta["/founder"].description,
  quote:
    "I started Brainlink because I wanted clients to talk directly to the people building their product — no middle layers, no inflated promises, just honest engineering.",
  bio: [
    "Aaditya Vishnoi founded Brainlink Softwares with a simple idea: small businesses and early-stage founders deserve the same quality of engineering as large companies, delivered by a team they can actually reach.",
    "As the studio's lead engineer, Aaditya stays hands-on in every project — from the first scoping call and architecture decisions to code reviews and post-launch support. The guiding belief is that good software starts with understanding the business problem first and picking technology second.",
    "Beyond client work, Aaditya is committed to building local tech talent. Through Brainlink's internship programme, students and early-career developers are mentored on real projects, gaining practical experience that classrooms alone can't provide.",
  ],
  highlights: [
    { value: "MSME", label: "Registered studio" },
    { value: "1:1", label: "Direct founder access" },
    { value: "End-to-end", label: "Scoping to support" },
  ],
  focus: [
    { icon: Code2, title: "Hands-on Engineering", desc: "Personally involved in architecture, code quality and delivery on every project." },
    { icon: MessageSquare, title: "Direct Communication", desc: "Clients speak with Aaditya directly — no account managers in between." },
    { icon: Users, title: "Client Partnerships", desc: "Focused on long-term relationships over one-off transactions." },
    { icon: GraduationCap, title: "Mentorship", desc: "Guides interns and junior developers through real-world project work." },
  ],
  knowsAbout: [
    "Custom Software Development",
    "Web Application Development",
    "Mobile App Development",
    "SaaS Product Development",
    "Software Architecture",
  ],
  faqs: [
    {
      q: "Who is the founder of Brainlink Softwares?",
      a: "Brainlink Softwares was founded by Aaditya Vishnoi, who also leads engineering at the studio.",
    },
    {
      q: "Where is Brainlink Softwares based?",
      a: "Brainlink Softwares is based in Kanth, Moradabad, Uttar Pradesh, and works remotely with clients across India.",
    },
    {
      q: "Can I speak directly with Aaditya Vishnoi about my project?",
      a: "Yes. Clients work directly with Aaditya and the engineering team — there are no account managers in between. Reach out through the contact page or WhatsApp to set up a call.",
    },
    {
      q: "Does Aaditya Vishnoi mentor interns?",
      a: "Yes. Through Brainlink's internship programme, Aaditya mentors students and early-career developers on real client projects, subject to current availability.",
    },
  ],
};
