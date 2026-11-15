/**
 * Centralized portfolio data. Only entries with verified: true are ever
 * rendered anywhere on the site (Home, Work, case studies, sitemap,
 * structured data). Do not add an entry here without a real, confirmed
 * client relationship — see project instructions before editing this file.
 */
export const portfolioProjects = [
  {
    id: "om-pictures",
    clientName: "Om Pictures",
    projectName: "Om Pictures Digital Presence",
    industry: "Photography, Videography & Creative Media",
    category: "Client Projects",
    relationship: "Client Project",
    headline: "Creating A Premium Digital Presence For A Creative Studio.",
    shortDescription:
      "Brainlink Softwares created a modern digital experience for Om Pictures to present photography, videography and creative services through an elegant, responsive and conversion-focused website.",
    problem:
      "Om Pictures needed a responsive, professional website to present its photography and videography portfolio — including wedding photography — and make it easy for prospective clients to enquire and connect on WhatsApp.",
    approach:
      "Brainlink Softwares designed and built a responsive frontend structured around portfolio presentation, with an enquiry experience, WhatsApp integration and an SEO-friendly page structure.",
    outcome:
      "A responsive, easy-to-navigate website that presents Om Pictures' creative work and gives visitors a direct path to enquire or start a conversation.",
    services: [
      "Website Design",
      "Website Development",
      "Responsive Frontend Development",
      "Portfolio Presentation",
      "WhatsApp Integration",
      "SEO-Friendly Structure",
    ],
    technologies: ["React", "Tailwind CSS", "Vercel"],
    projectUrl: null,
    status: "Client Project",
    featured: true,
    verified: true,
  },
  {
    id: "code-ace",
    clientName: "Code ACE",
    projectName: "Code ACE Coding Practice & Interview Platform",
    industry: "EdTech — Coding Practice & Assessments",
    category: "Tech Partnership",
    relationship: "Tech Partner",
    headline: "Engineering A Coding Practice Platform As Its Technology Partner.",
    shortDescription:
      "As Code ACE's technology partner, Brainlink Softwares engineers a coding practice platform with an in-browser code workspace, remote code evaluation, contests, daily challenges and AI-assisted interview preparation.",
    problem:
      "Code ACE needed a platform where learners can practise coding problems, take part in contests and prepare for interviews — with reliable code evaluation and services that can scale independently.",
    approach:
      "Brainlink Softwares built a React interface with a Monaco code workspace, a main Express API for accounts and practice, a separate contest service for schedules, judging and results, and Gemini-powered interview help, on PostgreSQL and Redis.",
    outcome:
      "A modular platform covering problem practice, submissions, contests and AI interview preparation, with services split so the contest workload can be deployed and scaled on its own.",
    services: [
      "Technology Partnership",
      "Web Application Development",
      "Backend & Microservice Engineering",
      "Code Evaluation Integration",
      "AI Integration",
      "Cloud Deployment",
    ],
    technologies: ["React", "Vite", "Redux", "Tailwind CSS", "daisyUI", "Node.js", "Express", "PostgreSQL", "Redis", "Gemini", "Docker"],
    projectUrl: null,
    status: "Tech Partner",
    featured: true,
    verified: true,
  },
  {
    id: "examshield",
    clientName: "ExamShield",
    projectName: "ExamShield — Proctored Online Assessment Platform",
    industry: "EdTech — Online Assessments & Proctoring",
    category: "Our Own Product",
    relationship: "Our Own Product",
    headline: "Our Own Product For Secure, Proctored Online Exams.",
    shortDescription:
      "ExamShield is Brainlink Softwares' in-house assessment platform: question banks, timed attempts, coding questions, automatic grading and browser and camera proctoring with reviewable evidence.",
    problem:
      "Institutions running online exams need a way to conduct timed assessments — including coding questions — while discouraging malpractice and giving examiners evidence they can review, instead of unverifiable claims.",
    approach:
      "We designed and built ExamShield end to end: a React exam interface with a Monaco code editor, an Express and PostgreSQL backend for question banks, access lists, attempts and grading, and an in-browser proctoring module using TensorFlow.js face and object detection plus live monitoring over WebSockets.",
    outcome:
      "A complete assessment workflow owned and developed by Brainlink Softwares, with a shared proctoring module that other platforms can integrate as a technology component.",
    services: [
      "Product Strategy & Design",
      "Web Application Development",
      "Browser & Camera Proctoring",
      "Real-Time Live Monitoring",
      "Automated Grading & Reports",
      "Cloud Deployment",
    ],
    technologies: ["React", "Vite", "Tailwind CSS", "Monaco Editor", "TensorFlow.js", "Node.js", "Express", "PostgreSQL", "WebSockets", "Docker"],
    projectUrl: null,
    status: "In-House Product",
    featured: true,
    verified: true,
  },
];

export const portfolioCategories = [
  "All Projects",
  ...Array.from(new Set(portfolioProjects.filter((p) => p.verified).map((p) => p.category))),
];

export const verifiedProjects = portfolioProjects.filter((p) => p.verified);
export const featuredProjects = verifiedProjects.filter((p) => p.featured);
export const getProjectById = (id) => verifiedProjects.find((p) => p.id === id);
