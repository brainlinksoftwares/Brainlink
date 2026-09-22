import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Save,
  Loader2,
  AlertCircle,
  Building,
  User as UserIcon,
  Phone,
  Mail,
  Globe,
  Briefcase,
  Clock,
  Calendar,
  Sparkles,
} from 'lucide-react';
import { leadService } from '../services/leadService';
import { teamService } from '../services/teamService';
import { followUpService } from '../services/followUpService';
import { detectDuplicateLead } from '../services/duplicateService';
import { useAuth } from '../context/AuthContext';
import { Lead, User, LeadStatus, LeadPriority, FollowUpType } from '../types';
import { DuplicateModal } from '../components/common/DuplicateModal';
import {
  DEFAULT_LEAD_STATUSES,
  DEFAULT_LEAD_SOURCES,
  DEFAULT_SERVICES,
  BUDGET_RANGES,
  TIMELINE_OPTIONS,
  COMPANY_SIZE_OPTIONS,
  FOLLOW_UP_TYPES,
} from '../config/crmConfig';

export const LeadCreate: React.FC = () => {
  const navigate = useNavigate();
  const { user } = useAuth();

  const [users, setUsers] = useState<User[]>([]);
  const [existingLeads, setExistingLeads] = useState<Lead[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Duplicate state
  const [duplicateModalOpen, setDuplicateModalOpen] = useState(false);
  const [duplicateReasons, setDuplicateReasons] = useState<string[]>([]);
  const [matchedLeads, setMatchedLeads] = useState<Lead[]>([]);

  // Form state
  const [form, setForm] = useState({
    name: '',
    company: '',
    email: '',
    phone: '',
    whatsapp: '',
    website: '',
    location: '',
    industry: '',
    companySize: '',
    budget: '',
    service: 'Web Applications',
    requirement: '',
    timeline: '',
    source: 'Website',
    campaign: '',
    status: 'New' as LeadStatus,
    priority: 'Medium' as LeadPriority,
    assignedTo: user?.id || '',
    // Initial follow-up
    createFollowUp: false,
    nextFollowUpDate: '',
    followUpType: 'Call' as FollowUpType,
    followUpNotes: '',
  });

  useEffect(() => {
    teamService.getAllUsers().then(setUsers);
    leadService.getAllLeads().then(setExistingLeads);
  }, []);

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!form.name.trim()) errs.name = 'Prospect name is required';
    if (!form.phone.trim() && !form.email.trim()) {
      errs.email = 'At least an email or phone number is required';
      errs.phone = 'At least an email or phone number is required';
    }
    if (form.email.trim() && !/\S+@\S+\.\S+/.test(form.email)) {
      errs.email = 'Please enter a valid email format';
    }
    if (!form.requirement.trim() || form.requirement.trim().length < 8) {
      errs.requirement = 'Please describe the project requirement (minimum 8 characters)';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleFieldChange = (name: string, value: any) => {
    setForm((prev) => ({ ...prev, [name]: value }));
    if (errors[name]) {
      setErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const executeLeadCreation = async () => {
    if (!user) return;
    setSubmitting(true);

    try {
      const assignedUser = users.find((u) => u.id === form.assignedTo);

      // Create lead
      const newLead = await leadService.createLead(
        {
          name: form.name.trim(),
          company: form.company.trim(),
          email: form.email.trim(),
          phone: form.phone.trim(),
          whatsapp: form.whatsapp.trim() || form.phone.trim(),
          website: form.website.trim(),
          location: form.location.trim(),
          industry: form.industry.trim(),
          companySize: form.companySize,
          budget: form.budget,
          service: form.service,
          requirement: form.requirement.trim(),
          timeline: form.timeline,
          source: form.source,
          campaign: form.campaign.trim(),
          status: form.status,
          priority: form.priority,
          assignedTo: form.assignedTo,
          assignedToName: assignedUser?.name || '',
          nextFollowUpAt: form.nextFollowUpDate || undefined,
          followUpType: form.createFollowUp ? form.followUpType : undefined,
        },
        { id: user.id, name: user.name }
      );

      // Create initial follow-up if scheduled
      if (form.createFollowUp && form.nextFollowUpDate) {
        await followUpService.createFollowUp(
          {
            leadId: newLead.id,
            leadName: newLead.name,
            leadCompany: newLead.company,
            assignedTo: form.assignedTo || user.id,
            assignedToName: assignedUser?.name || user.name,
            type: form.followUpType,
            scheduledAt: new Date(form.nextFollowUpDate).toISOString(),
            notes: form.followUpNotes || 'Initial discovery follow-up',
          },
          { id: user.id, name: user.name }
        );
      }

      navigate(`/leads/${newLead.id}`);
    } catch (err: any) {
      console.error(err);
      alert(err.message || 'Failed to create lead.');
    } finally {
      setSubmitting(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;

    // 1. Run duplicate check
    const dupCheck = detectDuplicateLead(
      {
        email: form.email,
        phone: form.phone,
        whatsapp: form.whatsapp,
        company: form.company,
      },
      existingLeads
    );

    if (dupCheck.isDuplicate) {
      setDuplicateReasons(dupCheck.reasons);
      setMatchedLeads(dupCheck.matchingLeads);
      setDuplicateModalOpen(true);
      return;
    }

    // 2. No duplicate, proceed
    await executeLeadCreation();
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => navigate('/leads')}
            className="p-2 text-slate-400 hover:text-slate-700 hover:bg-white rounded-xl border border-slate-200 shadow-2xs transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
          <div>
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
              Create New Lead
            </h1>
            <p className="text-xs sm:text-sm text-slate-500">
              Capture customer enquiry with automated duplicate verification
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={handleSubmit}
          disabled={submitting}
          className="inline-flex items-center gap-2 px-4 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
        >
          {submitting ? (
            <Loader2 className="w-4 h-4 animate-spin" />
          ) : (
            <Save className="w-4 h-4" />
          )}
          <span>Save Lead</span>
        </button>
      </div>

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Section 1: Basic Information */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-blue-600" />
            Basic Contact Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Full Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                required
                value={form.name}
                onChange={(e) => handleFieldChange('name', e.target.value)}
                placeholder="e.g. Vikram Malhotra"
                className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.name ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
                }`}
              />
              {errors.name && <p className="text-[11px] text-rose-600 mt-1">{errors.name}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company / Organization
              </label>
              <input
                type="text"
                value={form.company}
                onChange={(e) => handleFieldChange('company', e.target.value)}
                placeholder="e.g. Apex Healthtech Pvt Ltd"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Work Email Address
              </label>
              <input
                type="email"
                value={form.email}
                onChange={(e) => handleFieldChange('email', e.target.value)}
                placeholder="name@company.com"
                className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.email ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
                }`}
              />
              {errors.email && <p className="text-[11px] text-rose-600 mt-1">{errors.email}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Phone Number
              </label>
              <input
                type="tel"
                value={form.phone}
                onChange={(e) => handleFieldChange('phone', e.target.value)}
                placeholder="+91 98200 12345"
                className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.phone ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
                }`}
              />
              {errors.phone && <p className="text-[11px] text-rose-600 mt-1">{errors.phone}</p>}
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                WhatsApp Number (if different)
              </label>
              <input
                type="tel"
                value={form.whatsapp}
                onChange={(e) => handleFieldChange('whatsapp', e.target.value)}
                placeholder="9820012345"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Website / Portfolio URL
              </label>
              <input
                type="url"
                value={form.website}
                onChange={(e) => handleFieldChange('website', e.target.value)}
                placeholder="https://example.com"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Location (City, State, Country)
              </label>
              <input
                type="text"
                value={form.location}
                onChange={(e) => handleFieldChange('location', e.target.value)}
                placeholder="e.g. Bangalore, India"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-600/10"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Business & Project Scope */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4 text-indigo-600" />
            Project Scope &amp; Business Information
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Service Interested <span className="text-rose-500">*</span>
              </label>
              <select
                value={form.service}
                onChange={(e) => handleFieldChange('service', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                {DEFAULT_SERVICES.map((s) => (
                  <option key={s} value={s}>
                    {s}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Budget Estimation
              </label>
              <select
                value={form.budget}
                onChange={(e) => handleFieldChange('budget', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                <option value="">Select budget range...</option>
                {BUDGET_RANGES.map((b) => (
                  <option key={b} value={b}>
                    {b}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Expected Timeline
              </label>
              <select
                value={form.timeline}
                onChange={(e) => handleFieldChange('timeline', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                <option value="">Select expected launch...</option>
                {TIMELINE_OPTIONS.map((t) => (
                  <option key={t} value={t}>
                    {t}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Company Size
              </label>
              <select
                value={form.companySize}
                onChange={(e) => handleFieldChange('companySize', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                <option value="">Select size...</option>
                {COMPANY_SIZE_OPTIONS.map((cs) => (
                  <option key={cs} value={cs}>
                    {cs}
                  </option>
                ))}
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Complete Project Requirement <span className="text-rose-500">*</span>
              </label>
              <textarea
                rows={4}
                required
                value={form.requirement}
                onChange={(e) => handleFieldChange('requirement', e.target.value)}
                placeholder="Describe project deliverables, architecture requirements, feature specifications, or notes from initial consultation..."
                className={`w-full px-3 py-2 text-xs border rounded-xl focus:outline-none focus:ring-2 ${
                  errors.requirement ? 'border-rose-400 focus:ring-rose-200' : 'border-slate-200 focus:border-blue-600 focus:ring-blue-600/10'
                }`}
              />
              {errors.requirement && (
                <p className="text-[11px] text-rose-600 mt-1">{errors.requirement}</p>
              )}
            </div>
          </div>
        </div>

        {/* Section 3: CRM Assignment & Pipeline Stage */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Building className="w-4 h-4 text-purple-600" />
            CRM Pipeline &amp; Assignment
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Lead Source
              </label>
              <select
                value={form.source}
                onChange={(e) => handleFieldChange('source', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                {DEFAULT_LEAD_SOURCES.map((src) => (
                  <option key={src} value={src}>
                    {src}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Status Stage
              </label>
              <select
                value={form.status}
                onChange={(e) => handleFieldChange('status', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                {DEFAULT_LEAD_STATUSES.map((s) => (
                  <option key={s.key} value={s.key}>
                    {s.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Priority
              </label>
              <select
                value={form.priority}
                onChange={(e) => handleFieldChange('priority', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                <option value="Low">Low</option>
                <option value="Medium">Medium</option>
                <option value="High">High</option>
                <option value="Urgent">Urgent</option>
              </select>
            </div>

            <div className="md:col-span-2">
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Assign Lead To Team Member
              </label>
              <select
                value={form.assignedTo}
                onChange={(e) => handleFieldChange('assignedTo', e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              >
                <option value="">Unassigned</option>
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-700 mb-1">
                Marketing Campaign (optional)
              </label>
              <input
                type="text"
                value={form.campaign}
                onChange={(e) => handleFieldChange('campaign', e.target.value)}
                placeholder="e.g. Q3_GoogleAds_Healthcare"
                className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>
        </div>

        {/* Section 4: Optional Follow-up Scheduling */}
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-900 flex items-center gap-2">
              <Clock className="w-4 h-4 text-amber-600" />
              Schedule Initial Follow-up
            </h2>
            <label className="flex items-center gap-2 cursor-pointer text-xs font-medium text-slate-700">
              <input
                type="checkbox"
                checked={form.createFollowUp}
                onChange={(e) => handleFieldChange('createFollowUp', e.target.checked)}
                className="w-4 h-4 rounded text-blue-600 focus:ring-blue-500"
              />
              Schedule follow-up now
            </label>
          </div>

          {form.createFollowUp && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-100">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-up Date &amp; Time
                </label>
                <input
                  type="datetime-local"
                  value={form.nextFollowUpDate}
                  onChange={(e) => handleFieldChange('nextFollowUpDate', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-up Type
                </label>
                <select
                  value={form.followUpType}
                  onChange={(e) => handleFieldChange('followUpType', e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                >
                  {FOLLOW_UP_TYPES.map((ft) => (
                    <option key={ft} value={ft}>
                      {ft}
                    </option>
                  ))}
                </select>
              </div>

              <div className="md:col-span-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Follow-up Objective / Agenda
                </label>
                <input
                  type="text"
                  value={form.followUpNotes}
                  onChange={(e) => handleFieldChange('followUpNotes', e.target.value)}
                  placeholder="e.g. Schedule 15-min discovery call to understand API requirements"
                  className="w-full px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
                />
              </div>
            </div>
          )}
        </div>

        {/* Action footer */}
        <div className="flex items-center justify-end gap-3 pt-2">
          <button
            type="button"
            onClick={() => navigate('/leads')}
            className="px-4 py-2.5 text-xs font-medium text-slate-600 hover:text-slate-800 bg-white hover:bg-slate-100 border border-slate-200 rounded-xl transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={submitting}
            className="inline-flex items-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow-sm transition-all disabled:opacity-50"
          >
            {submitting ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>Save &amp; Create Lead</span>
          </button>
        </div>
      </form>

      {/* Duplicate Warning Modal */}
      <DuplicateModal
        isOpen={duplicateModalOpen}
        onClose={() => setDuplicateModalOpen(false)}
        reasons={duplicateReasons}
        matchingLeads={matchedLeads}
        onOpenExisting={(id) => {
          setDuplicateModalOpen(false);
          navigate(`/leads/${id}`);
        }}
        onCreateAnyway={async () => {
          setDuplicateModalOpen(false);
          await executeLeadCreation();
        }}
      />
    </div>
  );
};
