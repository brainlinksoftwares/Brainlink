import { Suspense, lazy } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { HelmetProvider } from "react-helmet-async";
import { SpeedInsights } from "@vercel/speed-insights/react";
import { AnimatePresence } from "framer-motion";
import ScrollToTop from "./common/ScrollToTop";
import LoadingState from "./components/LoadingState";
import PageFade from "./components/PageFade";
import "./index.css";

const Index = lazy(() => import("./pages/Index"));
const Services = lazy(() => import("./pages/Services"));
const Work = lazy(() => import("./pages/Work"));
const About = lazy(() => import("./pages/About"));
const Pricing = lazy(() => import("./pages/Pricing"));
const Careers = lazy(() => import("./pages/Careers"));
const Contact = lazy(() => import("./pages/Contact"));
const Privacy = lazy(() => import("./pages/Privacy"));
const Terms = lazy(() => import("./pages/Terms"));
const BlogList = lazy(() => import("./pages/blog/BlogList"));
const BlogDetail = lazy(() => import("./pages/blog/BlogDetail"));
const VerifyCertificate = lazy(() => import("./pages/VerifyCertificate"));
const VerifyCertificateResult = lazy(() => import("./pages/VerifyCertificateResult"));
const NotFound = lazy(() => import("./common/NotFound"));

const StudioApp = lazy(() => import("./studio/StudioApp"));
const PublicApply = lazy(() => import("./studio/pages/PublicApply"));

function RouteFallback() {
  return <LoadingState label="Loading..." minHeight="60vh" />;
}

const isStudioSubdomain =
  typeof window !== "undefined" &&
  (window.location.hostname === "studio.brainlink.in" ||
    window.location.hostname.startsWith("studio."));

function AnimatedRoutes() {
  const location = useLocation();

  if (isStudioSubdomain) {
    return (
      <Suspense fallback={<RouteFallback />}>
        <StudioApp />
      </Suspense>
    );
  }

  return (
    <AnimatePresence mode="wait">
      <PageFade key={location.pathname}>
        <Suspense fallback={<RouteFallback />}>
          <Routes location={location}>
            <Route path="/" element={<Index />} />
            <Route path="/services" element={<Services />} />
            <Route path="/work" element={<Work />} />
            <Route path="/about" element={<About />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/verify-certificate" element={<VerifyCertificate />} />
            <Route path="/verify-certificate/:certificateSlug" element={<VerifyCertificateResult />} />

            {/* Public Lead Capture Form for marketing embeds */}
            <Route path="/apply" element={<PublicApply />} />

            {/* Brainlink Studio accessible in dev/testing via /studio/* */}
            <Route path="/studio/*" element={<StudioApp />} />

            {/* Legacy URLs kept working via redirect, not a hard 404 */}
            <Route path="/service" element={<Navigate to="/services" replace />} />
            <Route path="/plans" element={<Navigate to="/pricing" replace />} />
            <Route path="/team" element={<Navigate to="/about" replace />} />

            <Route path="*" element={<NotFound />} />
          </Routes>
        </Suspense>
      </PageFade>
    </AnimatePresence>
  );
}

export default function App() {
  return (
    <HelmetProvider>
      <Router>
        <ScrollToTop />
        <AnimatedRoutes />
        <SpeedInsights />
      </Router>
    </HelmetProvider>
  );
}
