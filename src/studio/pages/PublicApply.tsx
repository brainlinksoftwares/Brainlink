import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  ShieldCheck,
  Smartphone,
  Globe,
  Scissors,
  Bot,
  Layers,
  ArrowRight,
  Clock,
  MessageSquare,
  Award,
  Zap,
  X,
  Check,
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { detectDuplicateLead } from '../services/duplicateService';
import { useAuth } from '../context/AuthContext';

// Project categories & base metrics
const SERVICE_TIERS = [
  {
    id: 'local_business',
    title: 'Local Business & Booking App',
    subtitle: 'Barbers, Salons, Clinics, Gyms, Restaurants',
    icon: Scissors,
    basePrice: '₹35,000 – ₹75,000',
    timeline: '1 – 2 Weeks',
    features: ['Instant Appointment Booking', 'WhatsApp Auto-Confirmations', 'Mobile Optimized UI', 'Google Business Sync'],
  },
  {
    id: 'web_app',
    title: 'Custom Web Application',
    subtitle: 'Client Portals, Marketplaces, Management Hubs',
    icon: Globe,
    basePrice: '₹85,000 – ₹2,50,000',
    timeline: '2 – 3 Weeks',
    features: ['High-Performance React UI', 'User Auth & Role Management', 'Custom Database Architecture', 'Stripe / Razorpay Payments'],
  },
  {
    id: 'mobile_app',
    title: 'iOS & Android Mobile App',
    subtitle: 'Cross-Platform Native Experience',
    icon: Smartphone,
    basePrice: '₹1,50,000 – ₹4,00,000',
    timeline: '3 – 5 Weeks',
    features: ['Play Store & App Store Publish', 'Push Notifications Engine', 'Offline Mode & Local Storage', 'Fast Smooth 60fps Native UX'],
  },
  {
    id: 'saas_cloud',
    title: 'SaaS Platform / Enterprise ERP',
    subtitle: 'Multi-Tenant Subscription Systems',
    icon: Layers,
    basePrice: '₹3,00,000 – ₹8,00,000',
    timeline: '4 – 8 Weeks',
    features: ['Multi-Tenant Database', 'Subscription & Billing Tiers', 'Staff & Team Workspaces', 'REST / GraphQL APIs'],
  },
  {
    id: 'ai_automation',
    title: 'AI & WhatsApp Automation Bot',
    subtitle: '24/7 Auto-Replying & Lead Capture',
    icon: Bot,
    basePrice: '₹30,000 – ₹90,000',
    timeline: '1 – 2 Weeks',
    features: ['Official WhatsApp Cloud API', 'Automated Lead Qualification', 'Google Sheets / CRM Sync', 'Smart FAQ Answering'],
  },
];

const ADDON_FEATURES = [
  { id: 'whatsapp_bot', name: 'WhatsApp Auto-Reminder & Confirmation Bot', cost: '+₹15k' },
  { id: 'online_payments', name: 'Online Payments (UPI, Cards, NetBanking)', cost: '+₹10k' },
  { id: 'custom_admin', name: 'Executive Admin & Analytics Dashboard', cost: '+₹25k' },
  { id: 'customer_loyalty', name: 'Customer Loyalty Points & Referral Program', cost: '+₹18k' },
  { id: 'google_seo', name: 'Local Google Maps & Business SEO Setup', cost: '+₹12k' },
];

export const PublicApply: React.FC = () => {
  const { user } = useAuth();

  // Selected estimator config
  const [selectedService, setSelectedService] = useState('local_business');
  const [selectedAddons, setSelectedAddons] = useState<string[]>([
    'whatsapp_bot',
    'online_payments',
  ]);

  // Lead Form
  const [form, setForm] = useState({
    name: '',
    phone: '',
    email: '',
    company: '',
    website: '',
    requirement: '',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Lead auto-capture tracking (secures leads even if they don't submit)
  const draftLeadIdRef = useRef<string | null>(null);
  const autoSaveTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Exit-Intent Modal
  const [showExitModal, setShowExitModal] = useState(false);
  const [exitModalShown, setExitModalShown] = useState(false);
  const [exitPhone, setExitPhone] = useState('');
  const [exitSubmitted, setExitSubmitted] = useState(false);

  const activeServiceObj =
    SERVICE_TIERS.find((s) => s.id === selectedService) || SERVICE_TIERS[0];

  const toggleAddon = (id: string) => {
    setSelectedAddons((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  // Auto-Save Incomplete Form Lead
  // This automatically secures the lead in Studio CRM as soon as the user enters a valid phone or email!
  const triggerAutoSaveLead = (currentForm = form) => {
    const hasContact =
      (currentForm.phone && currentForm.phone.replace(/\D/g, '').length >= 10) ||
      (currentForm.email && currentForm.email.includes('@'));

    if (!hasContact) return;

    if (autoSaveTimeoutRef.current) {
      clearTimeout(autoSaveTimeoutRef.current);
    }

    autoSaveTimeoutRef.current = setTimeout(async () => {
      try {
        const requirementSummary = `[INCOMPLETE / AUTO-CAPTURED LEAD]
Selected Service: ${activeServiceObj.title}
Estimated Budget: ${activeServiceObj.basePrice}
Add-ons Configured: ${selectedAddons.join(', ') || 'None'}
User Entered Notes: ${currentForm.requirement || 'None entered yet'}
Note: This user entered their contact details on studio.brainlink.in but has not finalized submission. Follow up immediately via WhatsApp!`;

        if (draftLeadIdRef.current) {
          // Update existing draft
          await leadService.updateLead(
            draftLeadIdRef.current,
            {
              name: currentForm.name.trim() || 'Website Visitor (Partial Fill)',
              company: currentForm.company.trim() || 'Direct Online Inquiry',
              phone: currentForm.phone.trim(),
              email: currentForm.email.trim(),
              website: currentForm.website.trim(),
              requirement: requirementSummary,
            },
            { id: 'auto_capture_bot', name: 'Auto-Capture Intelligence' }
          );
        } else {
          // Create draft lead
          const newDraft = await leadService.createLead(
            {
              name: currentForm.name.trim() || 'Website Visitor (Partial Fill)',
              company: currentForm.company.trim() || 'Direct Online Inquiry',
              phone: currentForm.phone.trim(),
              whatsapp: currentForm.phone.replace(/\D/g, ''),
              email: currentForm.email.trim(),
              website: currentForm.website.trim(),
              service: activeServiceObj.title,
              budget: activeServiceObj.basePrice,
              timeline: activeServiceObj.timeline,
              requirement: requirementSummary,
              source: 'Website (Incomplete/Abandoned)',
              status: 'New',
              priority: 'High',
            },
            { id: 'auto_capture_bot', name: 'Auto-Capture Intelligence' }
          );
          draftLeadIdRef.current = newDraft.id;
        }
      } catch (e) {
        console.error('Auto-capture error:', e);
      }
    }, 1200);
  };

  const handleFieldChange = (field: string, val: string) => {
    const updated = { ...form, [field]: val };
    setForm(updated);
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: '' }));
    }
    triggerAutoSaveLead(updated);
  };

  // Exit-Intent Listener (User moves cursor towards top bar to leave)
  useEffect(() => {
    const handleMouseLeave = (e: MouseEvent) => {
      if (e.clientY <= 15 && !exitModalShown && !success) {
        setShowExitModal(true);
        setExitModalShown(true);
      }
    };

    document.addEventListener('mouseleave', handleMouseLeave);
    return () => {
      document.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [exitModalShown, success]);

  // Handle final submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please enter your name';
    if (!form.phone.trim() && !form.email.trim()) {
      errs.phone = 'Please provide a WhatsApp/phone number or email';
    }
    if (form.phone.trim() && form.phone.replace(/\D/g, '').length < 10) {
      errs.phone = 'Please enter a valid 10-digit mobile number';
    }

    if (Object.keys(errs).length > 0) {
      setErrors(errs);
      return;
    }

    setSubmitting(true);

    try {
      const fullRequirement = `[Project Inquiry via Brainlink Studio Hub]
Service: ${activeServiceObj.title}
Estimated Budget Tier: ${activeServiceObj.basePrice}
Timeline Expectation: ${activeServiceObj.timeline}
Selected Features: ${selectedAddons.map((id) => ADDON_FEATURES.find((a) => a.id === id)?.name).join(', ')}

Client Specifications:
${form.requirement || 'No custom notes provided. Ready for initial technical discussion.'}

Business Website: ${form.website || 'None / New Business'}`;

      if (draftLeadIdRef.current) {
        // Upgrade existing draft lead to complete submitted lead
        await leadService.updateLead(
          draftLeadIdRef.current,
          {
            name: form.name.trim(),
            company: form.company.trim() || `${form.name.trim()}'s Business`,
            phone: form.phone.trim(),
            whatsapp: form.phone.replace(/\D/g, ''),
            email: form.email.trim(),
            website: form.website.trim(),
            service: activeServiceObj.title,
            budget: activeServiceObj.basePrice,
            timeline: activeServiceObj.timeline,
            requirement: fullRequirement,
            source: 'Website (Direct Quote Request)',
            status: 'New',
            priority: 'Urgent',
            lastContactAt: new Date().toISOString(),
          },
          { id: 'public_portal', name: 'Studio Web Hub' }
        );
      } else {
        // Create fresh lead
        const existingLeads = await leadService.getAllLeads();
        const dupCheck = detectDuplicateLead(
          {
            email: form.email,
            phone: form.phone,
            company: form.company,
          },
          existingLeads
        );

        if (dupCheck.isDuplicate && dupCheck.matchingLeads.length > 0) {
          const existing = dupCheck.matchingLeads[0];
          await leadService.updateLead(
            existing.id,
            {
              requirement: `${existing.requirement}\n\n[New Inquiry ${new Date().toLocaleDateString()}]: ${fullRequirement}`,
              lastContactAt: new Date().toISOString(),
            },
            { id: 'public_portal', name: 'Studio Web Hub' }
          );
        } else {
          await leadService.createLead(
            {
              name: form.name.trim(),
              company: form.company.trim() || `${form.name.trim()}'s Business`,
              phone: form.phone.trim(),
              whatsapp: form.phone.replace(/\D/g, ''),
              email: form.email.trim(),
              website: form.website.trim(),
              service: activeServiceObj.title,
              budget: activeServiceObj.basePrice,
              timeline: activeServiceObj.timeline,
              requirement: fullRequirement,
              source: 'Website (Direct Quote Request)',
              status: 'New',
              priority: 'Urgent',
            },
            { id: 'public_portal', name: 'Studio Web Hub' }
          );
        }
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('Could not submit. Please connect with our team directly on WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleExitLeadSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!exitPhone.trim() || exitPhone.replace(/\D/g, '').length < 10) return;

    try {
      await leadService.createLead(
        {
          name: 'Exit-Intent Hot Lead',
          company: 'Direct Web Visitor',
          phone: exitPhone.trim(),
          whatsapp: exitPhone.replace(/\D/g, ''),
          email: '',
          service: activeServiceObj.title,
          budget: activeServiceObj.basePrice,
          requirement: `[EXIT-INTENT CAPTURE]
Visitor requested Free Software Architecture Blueprint & ₹10,000 Credit Voucher.
Configured service in estimator: ${activeServiceObj.title}
Phone/WhatsApp: ${exitPhone}`,
          source: 'Website (Exit-Intent Recovery)',
          status: 'New',
          priority: 'Urgent',
        },
        { id: 'exit_intent_bot', name: 'Exit Recovery Bot' }
      );
      setExitSubmitted(true);
      setTimeout(() => setShowExitModal(false), 2500);
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col selection:bg-blue-600 selection:text-white">
      {/* Top Floating Glass Navigation Header */}
      <header className="sticky top-0 z-40 bg-slate-950/80 backdrop-blur-xl border-b border-slate-800/80 px-4 sm:px-8 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 flex items-center justify-center text-white font-black shadow-lg shadow-blue-500/25">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-white text-base tracking-tight leading-none">
                Brainlink Studio
              </span>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/10 text-cyan-400 border border-blue-500/30">
                MSME Registered
              </span>
            </div>
            <p className="text-[11px] text-slate-400 font-medium">
              Software Engineering &amp; App Studio
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <a
            href="https://wa.me/919811054321?text=Hi%20Brainlink%20Studio%2C%20I%20want%20to%20discuss%20a%20software%20%2F%20app%20project"
            target="_blank"
            rel="noreferrer"
            className="hidden sm:inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-xl transition-all"
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp Architect</span>
          </a>

          {user ? (
            <Link
              to="/dashboard"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-bold text-white bg-blue-600 hover:bg-blue-700 rounded-xl shadow-md transition-all"
            >
              <span>Go to CRM Dashboard</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          ) : (
            <Link
              to="/login"
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 text-xs font-semibold text-slate-300 hover:text-white bg-slate-800/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-all"
            >
              <span>Staff CRM Login</span>
            </Link>
          )}
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-14 space-y-12">
        {/* Hero Section */}
        <div className="text-center space-y-4 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-gradient-to-r from-blue-500/10 via-indigo-500/10 to-cyan-500/10 border border-blue-500/20 text-cyan-400 text-xs font-bold">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Turn Walk-Ins &amp; Inquiries into 24/7 Automated Revenue</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white leading-tight">
            Build Your Custom App or Website{' '}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 via-cyan-400 to-indigo-300">
              In 7 to 14 Days
            </span>
          </h1>

          <p className="text-sm sm:text-base text-slate-300 max-w-2xl mx-auto leading-relaxed">
            Whether you run a <strong className="text-white">barber shop, beauty salon, clinic, restaurant</strong>, or need a scalable <strong className="text-white">web/mobile application</strong> — we build production-ready digital products with zero tech hassle.
          </p>

          {/* Value Badges */}
          <div className="flex flex-wrap items-center justify-center gap-4 text-xs text-slate-400 pt-2">
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> 100% Source Code Ownership
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> Non-Disclosure Agreement Guaranteed
            </span>
            <span className="flex items-center gap-1.5">
              <Check className="w-4 h-4 text-emerald-400" /> MSME Registered Studio (UP, India)
            </span>
          </div>
        </div>

        {/* Success View */}
        {success ? (
          <div className="max-w-lg mx-auto bg-slate-900 border border-slate-800 rounded-3xl p-8 text-center space-y-5 shadow-2xl">
            <div className="w-16 h-16 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-2xl flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle2 className="w-9 h-9" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-bold text-white">Proposal Request Received!</h2>
              <p className="text-xs sm:text-sm text-slate-400 leading-relaxed">
                Thank you, <strong className="text-white">{form.name || 'there'}</strong>! Our lead engineering architect is reviewing your configuration for <span className="text-cyan-400">{activeServiceObj.title}</span>.
              </p>
              <div className="p-3 bg-slate-800/60 rounded-xl text-xs text-slate-300 text-left space-y-1 border border-slate-700">
                <div>&bull; <strong className="text-white">Estimated Budget:</strong> {activeServiceObj.basePrice}</div>
                <div>&bull; <strong className="text-white">Delivery Timeline:</strong> {activeServiceObj.timeline}</div>
                <div>&bull; <strong className="text-white">Next Step:</strong> We will WhatsApp you a personalized video demo &amp; roadmap within 2 hours.</div>
              </div>
            </div>

            <div className="pt-2 flex flex-col sm:flex-row gap-3">
              <a
                href={`https://wa.me/919811054321?text=${encodeURIComponent(
                  `Hi Brainlink Studio! I just submitted an inquiry for "${activeServiceObj.title}" for ${form.name}. Here is my phone number: ${form.phone}`
                )}`}
                target="_blank"
                rel="noreferrer"
                className="flex-1 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 shadow-lg transition-all"
              >
                <MessageSquare className="w-4 h-4" />
                <span>Fast-Track on WhatsApp</span>
              </a>
              <button
                onClick={() => {
                  setSuccess(false);
                  draftLeadIdRef.current = null;
                }}
                className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold text-xs rounded-xl"
              >
                Configure Another Build
              </button>
            </div>
          </div>
        ) : (
          /* Interactive Estimator & Lead Capture Grid */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left 7 Cols: Interactive Scope & Estimator */}
            <div className="lg:col-span-7 space-y-6">
              <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-6 shadow-xl">
                <div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <Sparkles className="w-4 h-4" /> Step 1: Select Your Platform
                    </span>
                    <span className="text-xs text-slate-400">Live Cost Estimator</span>
                  </div>
                  <h3 className="text-lg font-bold text-white mt-1">
                    What are you looking to launch?
                  </h3>
                </div>

                {/* Service Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {SERVICE_TIERS.map((tier) => {
                    const Icon = tier.icon;
                    const isSelected = selectedService === tier.id;

                    return (
                      <div
                        key={tier.id}
                        onClick={() => setSelectedService(tier.id)}
                        className={`p-4 rounded-2xl border cursor-pointer transition-all flex flex-col justify-between ${
                          isSelected
                            ? 'bg-blue-950/40 border-blue-500 shadow-md shadow-blue-500/10 ring-1 ring-blue-500'
                            : 'bg-slate-950/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40'
                        }`}
                      >
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <div
                              className={`w-9 h-9 rounded-xl flex items-center justify-center ${
                                isSelected
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-800 text-slate-400'
                              }`}
                            >
                              <Icon className="w-5 h-5" />
                            </div>
                            {isSelected && (
                              <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-500/20 text-cyan-300">
                                Selected
                              </span>
                            )}
                          </div>
                          <h4 className="text-sm font-bold text-white">{tier.title}</h4>
                          <p className="text-[11px] text-slate-400 leading-tight">
                            {tier.subtitle}
                          </p>
                        </div>

                        <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                          <span className="font-bold text-white">{tier.basePrice}</span>
                          <span className="text-slate-400 flex items-center gap-1 text-[11px]">
                            <Clock className="w-3 h-3 text-slate-500" /> {tier.timeline}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Add-on features */}
                <div className="space-y-3 pt-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black uppercase tracking-wider text-cyan-400">
                      Step 2: Add-On Modules
                    </span>
                    <span className="text-[11px] text-slate-400">Customized to your business</span>
                  </div>

                  <div className="space-y-2">
                    {ADDON_FEATURES.map((addon) => {
                      const isChecked = selectedAddons.includes(addon.id);

                      return (
                        <div
                          key={addon.id}
                          onClick={() => toggleAddon(addon.id)}
                          className={`p-3 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                            isChecked
                              ? 'bg-slate-800/80 border-cyan-500/50 text-white'
                              : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-5 h-5 rounded-lg flex items-center justify-center border text-xs ${
                                isChecked
                                  ? 'bg-cyan-500 border-cyan-500 text-slate-950 font-bold'
                                  : 'border-slate-700'
                              }`}
                            >
                              {isChecked && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                            </div>
                            <span className="text-xs font-semibold">{addon.name}</span>
                          </div>
                          <span className="text-xs font-bold text-cyan-400">{addon.cost}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Estimator Summary Bar */}
                <div className="bg-gradient-to-r from-blue-950/60 to-slate-900 border border-blue-500/30 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                      Estimated Project Scope
                    </span>
                    <div className="text-base font-extrabold text-white flex items-center gap-2">
                      <span>{activeServiceObj.title}</span>
                      <span className="text-xs text-cyan-400 font-semibold">
                        ({selectedAddons.length} Add-ons)
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 text-right">
                    <div>
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Estimated Budget
                      </div>
                      <div className="text-sm font-black text-amber-400">
                        {activeServiceObj.basePrice}
                      </div>
                    </div>
                    <div className="pl-4 border-l border-slate-800">
                      <div className="text-[10px] uppercase tracking-wider text-slate-400 font-bold">
                        Timeline
                      </div>
                      <div className="text-sm font-black text-emerald-400">
                        {activeServiceObj.timeline}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Social Proof & Guarantees */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <Award className="w-5 h-5 text-amber-400 mx-auto" />
                  <h5 className="text-xs font-bold text-white">Full IP Rights</h5>
                  <p className="text-[11px] text-slate-400">You own 100% of the code &amp; design assets</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <ShieldCheck className="w-5 h-5 text-emerald-400 mx-auto" />
                  <h5 className="text-xs font-bold text-white">Strict NDA</h5>
                  <p className="text-[11px] text-slate-400">Your trade secrets &amp; ideas stay strictly confidential</p>
                </div>
                <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 text-center space-y-1">
                  <Zap className="w-5 h-5 text-cyan-400 mx-auto" />
                  <h5 className="text-xs font-bold text-white">Rapid Delivery</h5>
                  <p className="text-[11px] text-slate-400">Working prototype ready in first 7 days</p>
                </div>
              </div>
            </div>

            {/* Right 5 Cols: Conversion-Optimized Lead Form */}
            <div className="lg:col-span-5 space-y-4">
              <form
                onSubmit={handleSubmit}
                className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-7 space-y-4 shadow-2xl relative"
              >
                <div>
                  <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px] font-bold uppercase tracking-wider mb-2">
                    <Check className="w-3 h-3" /> Zero Commitment &bull; Free Strategy
                  </div>
                  <h3 className="text-lg font-bold text-white">
                    Get Your Custom Scope &amp; Quote
                  </h3>
                  <p className="text-xs text-slate-400">
                    Fill in your details below. Our technical leads will respond within 2 hours.
                  </p>
                </div>

                <div className="space-y-3.5 text-xs">
                  {/* Name */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Your Name <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="text"
                      required
                      value={form.name}
                      onChange={(e) => handleFieldChange('name', e.target.value)}
                      placeholder="e.g. Anand Kumar / Owner"
                      className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors.name ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                      }`}
                    />
                    {errors.name && <p className="text-[10px] text-rose-400 mt-1">{errors.name}</p>}
                  </div>

                  {/* Phone / WhatsApp */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Phone / WhatsApp Number <span className="text-rose-400">*</span>
                    </label>
                    <input
                      type="tel"
                      required
                      value={form.phone}
                      onChange={(e) => handleFieldChange('phone', e.target.value)}
                      placeholder="+91 98200 12345"
                      className={`w-full px-3.5 py-2.5 bg-slate-950 border rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-blue-500 ${
                        errors.phone ? 'border-rose-500' : 'border-slate-800 focus:border-blue-500'
                      }`}
                    />
                    {errors.phone && <p className="text-[10px] text-rose-400 mt-1">{errors.phone}</p>}
                  </div>

                  {/* Email & Business */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        Email Address
                      </label>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => handleFieldChange('email', e.target.value)}
                        placeholder="anand@business.in"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block font-bold text-slate-300 mb-1">
                        Business / Brand Name
                      </label>
                      <input
                        type="text"
                        value={form.company}
                        onChange={(e) => handleFieldChange('company', e.target.value)}
                        placeholder="e.g. Royal Salon / FinTrack"
                        className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                      />
                    </div>
                  </div>

                  {/* Current website if any */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Existing Website / Google Business Link (optional)
                    </label>
                    <input
                      type="url"
                      value={form.website}
                      onChange={(e) => handleFieldChange('website', e.target.value)}
                      placeholder="https://..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  {/* Requirement Details */}
                  <div>
                    <label className="block font-bold text-slate-300 mb-1">
                      Project Notes &amp; Specific Ideas
                    </label>
                    <textarea
                      rows={3}
                      value={form.requirement}
                      onChange={(e) => handleFieldChange('requirement', e.target.value)}
                      placeholder="e.g. We are a barber shop with 2 branches in Noida. We want an automated booking system where customers pick time slots and get WhatsApp reminders..."
                      className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:border-blue-500"
                    />
                  </div>
                </div>

                {/* Submit button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={submitting}
                    className="w-full py-3 px-4 bg-gradient-to-r from-blue-600 via-indigo-600 to-cyan-500 hover:from-blue-500 hover:to-cyan-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-blue-500/25 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                  >
                    {submitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Generating Proposal...</span>
                      </>
                    ) : (
                      <>
                        <span>Get Instant Technical Proposal &amp; Quote</span>
                        <Send className="w-3.5 h-3.5" />
                      </>
                    )}
                  </button>
                </div>

                <div className="text-center pt-1">
                  <p className="text-[11px] text-slate-500">
                    🔒 Protected under Brainlink Softwares Non-Disclosure Policy. Zero spam.
                  </p>
                </div>
              </form>

              {/* Direct WhatsApp Callout */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h5 className="font-bold text-white">Prefer a 5-minute quick chat?</h5>
                  <p className="text-[11px] text-slate-400">Speak directly with our technical founder</p>
                </div>
                <a
                  href="https://wa.me/919811054321?text=Hi%20Brainlink%20Studio%2C%20can%20we%20have%20a%20quick%205-minute%20discussion%20about%20building%20an%20app%20%2F%20website%3F"
                  target="_blank"
                  rel="noreferrer"
                  className="px-3 py-2 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-xl shrink-0 flex items-center gap-1.5 shadow-md transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>
          </div>
        )}

        {/* Case Studies / Proof of Transformation Section */}
        <div className="pt-8 border-t border-slate-800 space-y-6">
          <div className="text-center space-y-2 max-w-xl mx-auto">
            <h3 className="text-xl sm:text-2xl font-black text-white">
              Proven Digital Systems That Drive Bookings
            </h3>
            <p className="text-xs text-slate-400">
              How local business owners eliminate missed calls, reduce no-shows by 85%, and double repeat customer visits.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400">Barber &amp; Salon Chain</span>
              <h4 className="text-sm font-bold text-white">
                Automated WhatsApp Booking System
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Replaced manual phone call appointments with a 30-second mobile booking link. Saved 3 hours daily for the front desk with automated slot confirmation.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> +240 New Appointments / Month
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400">Healthcare Clinic</span>
              <h4 className="text-sm font-bold text-white">
                Patient Slot Portal &amp; Tele-Consult
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Built a seamless web app where patients select doctors, upload prescriptions, and pay fees online directly via UPI and credit cards.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> 89% Drop in Waiting Room Congestion
              </div>
            </div>

            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 space-y-3">
              <span className="text-xs font-black uppercase text-cyan-400">FinTech &amp; Retail</span>
              <h4 className="text-sm font-bold text-white">
                Custom SaaS Dashboard &amp; Invoicing
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                Full-stack React &amp; Cloud database solution tracking GST invoices, recurring customer subscriptions, and dispatch delivery routes.
              </p>
              <div className="pt-2 text-xs font-bold text-emerald-400 flex items-center gap-1">
                <Check className="w-3.5 h-3.5" /> Zero Manual Accounting Errors
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="mt-16 border-t border-slate-800/80 py-8 px-4 sm:px-8 text-center text-xs text-slate-500 space-y-2">
        <p className="text-slate-400 font-semibold">
          Brainlink Softwares &bull; MSME Registered Engineering Studio &bull; Uttar Pradesh, India
        </p>
        <p className="text-[11px] text-slate-500">
          Empowering modern businesses, startups, and enterprises with custom digital engineering.
        </p>
      </footer>

      {/* Exit-Intent Value Rescue Modal */}
      {showExitModal && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-blue-500/40 rounded-3xl max-w-md w-full p-6 sm:p-7 shadow-2xl space-y-4 relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setShowExitModal(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            {exitSubmitted ? (
              <div className="text-center py-6 space-y-3">
                <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-2xl flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-base font-bold text-white">Blueprint &amp; Voucher Reserved!</h3>
                <p className="text-xs text-slate-400">
                  Our senior engineering architect will send your tailored roadmap and ₹10,000 credit code directly to your WhatsApp.
                </p>
              </div>
            ) : (
              <form onSubmit={handleExitLeadSubmit} className="space-y-4">
                <div className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-extrabold uppercase tracking-wider">
                  ⚡ Special Studio Credit
                </div>

                <div className="space-y-1">
                  <h3 className="text-lg font-black text-white">
                    Wait! Don't leave without your Free Tech Blueprint
                  </h3>
                  <p className="text-xs text-slate-400 leading-relaxed">
                    Enter your WhatsApp number to receive our <strong className="text-white">5-Page System Architecture &amp; Cost Optimization Blueprint</strong> plus a <strong className="text-cyan-400">₹10,000 Credit Voucher</strong> towards your first build.
                  </p>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-slate-300 mb-1">
                    Your WhatsApp Number
                  </label>
                  <input
                    type="tel"
                    required
                    value={exitPhone}
                    onChange={(e) => setExitPhone(e.target.value)}
                    placeholder="+91 98200 12345"
                    className="w-full px-3.5 py-2.5 bg-slate-950 border border-slate-700 rounded-xl text-white placeholder-slate-500 text-xs focus:outline-none focus:border-cyan-400"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 bg-gradient-to-r from-emerald-600 to-teal-500 hover:from-emerald-500 hover:to-teal-400 text-white font-extrabold text-xs rounded-xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2 transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Send Blueprint on WhatsApp</span>
                </button>

                <p className="text-[10px] text-center text-slate-500">
                  100% Free &bull; No obligation &bull; Instant WhatsApp Delivery
                </p>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
