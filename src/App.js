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
const Founder = lazy(() => import("./pages/Founder"));
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

// Eagerly initiate StudioApp chunk fetch if already on studio domain or /studio path
if (typeof window !== 'undefined' && (
  window.location.hostname === 'studio.brainlink.in' ||
  window.location.hostname.startsWith('studio.') ||
  window.location.pathname.startsWith('/studio')
)) {
  import("./studio/StudioApp");
}

function RouteFallback() {
  return <LoadingState label="Loading..." minHeight="60vh" />;
}

function StudioFallback() {
  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      backgroundColor: '#090B10',
      color: '#F5F7FA',
      fontFamily: "'Outfit', -apple-system, BlinkMacSystemFont, sans-serif"
    }}>
      <div style={{
        width: 40,
        height: 40,
        borderRadius: 10,
        background: 'linear-gradient(135deg, #315CFF 0%, #1A3BBB 100%)',
        color: '#FFFFFF',
        fontWeight: 700,
        fontSize: 14,
        letterSpacing: '0.04em',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        boxShadow: '0 8px 24px rgba(49,92,255,0.28)',
        marginBottom: 16
      }}>
        BS
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'center',
        gap: 8,
        fontSize: 13,
        fontWeight: 500,
        color: '#8893A6',
        letterSpacing: '0.02em'
      }}>
        <div style={{
          width: 14,
          height: 14,
          borderRadius: '50%',
          border: '2px solid #315CFF',
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
        <span>Initializing Brainlink Studio...</span>
      </div>
      <style>{`@keyframes spin { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </div>
  );
}

function AnimatedRoutes() {
  const location = useLocation();
  const isStudioDomain = typeof window !== 'undefined' && (
    window.location.hostname === 'studio.brainlink.in' ||
    window.location.hostname.startsWith('studio.')
  );

  if (isStudioDomain) {
    // Break out of any infinite /dashboard/dashboard or /studio prefixes on the studio subdomain
    if (location.pathname.includes('/dashboard/dashboard') || location.pathname.startsWith('/studio')) {
      const cleanSubPath = location.pathname
        .replace(/^\/studio\/?/, '/')
        .replace(/(\/dashboard)+/g, '/dashboard');
      return <Navigate to={cleanSubPath || '/dashboard'} replace />;
    }

    return (
      <Suspense fallback={<StudioFallback />}>
        <Routes>
          <Route path="/*" element={<StudioApp basePath="" />} />
        </Routes>
      </Suspense>
    );
  }

  // On main domain (brainlink.in), sanitize any dashboard looping under /studio
  if (location.pathname.includes('/dashboard/dashboard')) {
    const cleanMainPath = location.pathname.replace(/(\/dashboard)+/g, '/dashboard');
    return <Navigate to={cleanMainPath} replace />;
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
            <Route path="/founder" element={<Founder />} />
            <Route path="/aaditya-vishnoi" element={<Navigate to="/founder" replace />} />
            <Route path="/pricing" element={<Pricing />} />
            <Route path="/careers" element={<Careers />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/blog" element={<BlogList />} />
            <Route path="/blog/:slug" element={<BlogDetail />} />
            <Route path="/privacy-policy" element={<Privacy />} />
            <Route path="/terms" element={<Terms />} />
            <Route path="/verify-certificate" element={<VerifyCertificate />} />
            <Route path="/verify-certificate/:certificateSlug" element={<VerifyCertificateResult />} />

            {/* Brainlink Studio Platform */}
            <Route path="/studio/*" element={<StudioApp basePath="/studio" />} />

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
