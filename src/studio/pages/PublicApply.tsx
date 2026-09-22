import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Building,
  User,
  Phone,
  Mail,
  Globe,
  Briefcase,
  ShieldCheck,
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { detectDuplicateLead } from '../services/duplicateService';
import {
  DEFAULT_SERVICES,
  BUDGET_RANGES,
  TIMELINE_OPTIONS,
} from '../config/crmConfig';

export const PublicApply: React.FC = () => {
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    service: 'Web Applications',
    budget: '₹1,00,000 – ₹5,00,000',
    requirement: '',
    timeline: '1 – 2 weeks',
  });

  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const errs: Record<string, string> = {};
    if (!form.name.trim()) errs.name = 'Please provide your full name';
    if (!form.email.trim() && !form.phone.trim()) {
      errs.email = 'Please provide either an email or phone number';
      errs.phone = 'Please provide either an email or phone number';
    }
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please enter a valid email address';
    }
    if (!form.requirement.trim() || form.requirement.trim().length < 10) {
      errs.requirement = 'Please describe your project requirement (at least 10 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFieldChange = (name: string, value: string) => {
    setForm((p) => ({ ...p, [name]: value }));
    if (errors[name]) {
      setErrors((p) => ({ ...p, [name]: '' }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setSubmitting(true);

    try {
      // 1. Fetch existing leads for duplicate check
      const existingLeads = await leadService.getAllLeads();
      const dupCheck = detectDuplicateLead(
        {
          email: form.email,
          phone: form.phone,
          whatsapp: form.whatsapp,
          company: form.company,
        },
        existingLeads
      );

      if (dupCheck.isDuplicate && dupCheck.matchingLeads.length > 0) {
        // Update existing lead requirement without exposing internal CRM info
        const existing = dupCheck.matchingLeads[0];
        await leadService.updateLead(
          existing.id,
          {
            requirement: `${existing.requirement}\n\n[New Public Web Inquiry]: ${form.requirement}`,
            lastContactAt: new Date().toISOString(),
          },
          { id: 'public_form', name: 'Website Public Form' }
        );
      } else {
        // Create new lead with source="Website", status="New"
        await leadService.createLead(
          {
            name: form.name.trim(),
            company: form.company.trim() || 'Direct Inquiry',
            email: form.email.trim(),
            phone: form.phone.trim(),
            whatsapp: form.whatsapp.trim() || form.phone.trim(),
            website: form.website.trim(),
            service: form.service,
            budget: form.budget,
            requirement: form.requirement.trim(),
            timeline: form.timeline,
            source: 'Website',
            status: 'New',
            priority: 'High',
          },
          { id: 'public_form', name: 'Website Public Form' }
        );
      }

      setSuccess(true);
    } catch (err) {
      console.error(err);
      alert('An error occurred submitting your inquiry. Please try again or contact us via WhatsApp.');
    } finally {
      setSubmitting(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
        <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-4">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
            <CheckCircle2 className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-bold text-slate-900">Inquiry Received</h2>
          <p className="text-xs text-slate-500 leading-relaxed">
            Thank you for reaching out to <strong className="text-slate-700">Brainlink Softwares</strong>.
            Our technical team has received your project requirement and will review your specifications within 24 hours.
          </p>
          <div className="pt-2">
            <button
              onClick={() => {
                setSuccess(false);
                setForm({
                  name: '',
                  company: '',
                  email: '',
                  phone: '',
                  whatsapp: '',
                  website: '',
                  service: 'Web Applications',
                  budget: '₹1,00,000 – ₹5,00,000',
                  requirement: '',
                  timeline: '1 – 2 weeks',
                });
              }}
              className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              Submit Another Inquiry
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-2xl mx-auto space-y-6">
        {/* Branding header */}
        <div className="text-center space-y-2">
          <div className="inline-flex items-center justify-center w-12 h-12 rounded-2xl bg-gradient-to-tr from-blue-600 via-indigo-600 to-cyan-400 text-white shadow-md shadow-blue-500/20 mb-2">
            <Sparkles className="w-6 h-6" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-slate-900">
            Start Your Project with Brainlink
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 max-w-md mx-auto">
            Tell us about your software, web, or mobile app requirement to get a detailed technical proposal and roadmap.
          </p>
        </div>

        {/* Public Form Card */}
        <form
          onSubmit={handleSubmit}
          className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xl shadow-slate-200/50 space-y-5 text-xs"
        >
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Your Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g. Anand Kumar"
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none ${
                  errors.name ? 'border-rose-400' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                placeholder="e.g. FinTrack Solutions"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="anand@company.com"
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none ${
                  errors.email ? 'border-rose-400' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+91 98200 12345"
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none ${
                  errors.phone ? 'border-rose-400' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                WhatsApp Number (optional)
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                placeholder="9820012345"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Current Website (optional)
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                placeholder="https://yourcompany.com"
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Service Required
              </label>
              <select
                value={form.service}
                onChange={(e) => handleFieldChange('service', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
              >
                {DEFAULT_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Target Budget
              </label>
              <select
                value={form.budget}
                onChange={(e) => handleFieldChange('budget', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
              >
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Expected Timeline
              </label>
              <select
                value={form.timeline}
                onChange={(e) => handleFieldChange('timeline', e.target.value)}
                className="w-full px-3.5 py-2.5 border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 bg-white"
              >
                {TIMELINE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block font-semibold text-slate-700 mb-1">
                Project Requirement Details <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={form.requirement}
                onChange={(e) => handleFieldChange('requirement', e.target.value)}
                placeholder="Please describe what you are looking to build, desired features, any existing systems to integrate, or references..."
                className={`w-full px-3.5 py-2.5 border rounded-xl focus:outline-none ${
                  errors.requirement ? 'border-rose-400' : 'border-slate-200 focus:border-blue-600'
                }`}
              />
              {errors.requirement && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.requirement}</p>
              )}
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              disabled={submitting}
              className="w-full flex items-center justify-center gap-2 py-3 px-4 text-xs font-bold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-md transition-all disabled:opacity-50"
            >
              {submitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Submitting Inquiry...</span>
                </>
              ) : (
                <>
                  <span>Send Project Requirement</span>
                  <Send className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>

          <div className="flex items-center justify-center gap-1.5 text-[11px] text-slate-400 pt-2">
            <ShieldCheck className="w-3.5 h-3.5 text-slate-400" />
            <span>Brainlink Softwares Privacy Assured &bull; Non-Disclosure Protected</span>
          </div>
        </form>
      </div>
    </div>
  );
};
