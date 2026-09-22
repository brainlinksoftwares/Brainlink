import React, { useState, useEffect } from 'react';
import {
  Compass,
  Search,
  MapPin,
  Phone,
  Globe,
  Smartphone,
  Star,
  Flame,
  MessageSquare,
  PhoneCall,
  CheckCircle2,
  Copy,
  ExternalLink,
  Loader2,
  Filter,
  Sparkles,
  Download,
  AlertCircle,
  X,
} from 'lucide-react';
import { ExtractedLead } from '../types';
import { leadHunterService } from '../services/leadHunterService';
import { useAuth } from '../context/AuthContext';
import { useNotifications } from '../context/NotificationContext';

const QUICK_NICHES = [
  { label: '💈 Barber Shops', query: 'Barber' },
  { label: '💇 Salons & Spas', query: 'Salon' },
  { label: '🦷 Dental Clinics', query: 'Dentist' },
  { label: '🍽️ Restaurants & Cafes', query: 'Restaurant' },
  { label: '🏋️ Gyms & Fitness', query: 'Gym' },
  { label: '👗 Boutiques & Retail', query: 'Boutique' },
];

const POPULAR_CITIES = ['Noida', 'Lucknow', 'Delhi NCR', 'Bengaluru', 'Mumbai', 'Jaipur'];

export const LeadHunterPage: React.FC = () => {
  const { user } = useAuth();
  const { addNotification } = useNotifications();

  const [query, setQuery] = useState('Barber');
  const [location, setLocation] = useState('Noida');
  const [onlyMissingWebsite, setOnlyMissingWebsite] = useState(true);
  const [minRating, setMinRating] = useState(4.0);

  const [loading, setLoading] = useState(false);
  const [leads, setLeads] = useState<ExtractedLead[]>([]);
  const [importingId, setImportingId] = useState<string | null>(null);
  const [batchImporting, setBatchImporting] = useState(false);

  // Outreach pitch modal state
  const [activeModalLead, setActiveModalLead] = useState<ExtractedLead | null>(null);
  const [modalFormat, setModalFormat] = useState<'whatsapp' | 'call'>('whatsapp');
  const [copied, setCopied] = useState(false);

  const handleSearch = async (overrideQuery?: string, overrideCity?: string) => {
    const q = overrideQuery !== undefined ? overrideQuery : query;
    const l = overrideCity !== undefined ? overrideCity : location;

    setLoading(true);
    try {
      const results = await leadHunterService.searchLeads({
        query: q,
        location: l,
        onlyMissingWebsite,
        onlyMissingApp: true,
        minRating,
      });
      setLeads(results);
    } catch (err) {
      console.error(err);
      addNotification({
        userId: user?.id || 'all',
        title: 'Search Error',
        message: 'Could not extract Google listings. Please try again.',
        type: 'status_changed',
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    handleSearch();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleImportLead = async (lead: ExtractedLead) => {
    if (!user) return;
    setImportingId(lead.id);
    try {
      await leadHunterService.importToCrm(lead, {
        id: user.id,
        name: user.name,
      });
      setLeads((prev) =>
        prev.map((item) => (item.id === lead.id ? { ...item, alreadyInCrm: true } : item))
      );
      addNotification({
        userId: user.id,
        title: 'Lead Imported to CRM',
        message: `Successfully added "${lead.name}" to active sales pipeline.`,
        type: 'lead_assigned',
        link: '/leads',
      });
    } catch (err) {
      console.error(err);
      addNotification({
        userId: user?.id || 'all',
        title: 'Import Failed',
        message: 'Could not import lead to CRM.',
        type: 'status_changed',
      });
    } finally {
      setImportingId(null);
    }
  };

  const handleBatchImport = async () => {
    if (!user) return;
    const eligible = leads.filter((l) => !l.alreadyInCrm);
    if (eligible.length === 0) {
      alert('All current leads are already imported to your CRM.');
      return;
    }

    setBatchImporting(true);
    try {
      const count = await leadHunterService.batchImportToCrm(eligible, {
        id: user.id,
        name: user.name,
      });
      setLeads((prev) => prev.map((item) => ({ ...item, alreadyInCrm: true })));
      addNotification({
        userId: user.id,
        title: 'Batch Import Complete',
        message: `Imported ${count} high-opportunity leads directly into Studio CRM!`,
        type: 'lead_assigned',
        link: '/leads',
      });
    } catch (err) {
      console.error(err);
    } finally {
      setBatchImporting(false);
    }
  };

  const openOutreachModal = (lead: ExtractedLead, format: 'whatsapp' | 'call') => {
    setActiveModalLead(lead);
    setModalFormat(format);
    setCopied(false);
  };

  const copyOutreachPitch = () => {
    if (!activeModalLead) return;
    const script = leadHunterService.generateOutreachScript(activeModalLead, modalFormat);
    navigator.clipboard.writeText(script);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const missingWebsiteCount = leads.filter((l) => !l.hasWebsite).length;
  const notImportedCount = leads.filter((l) => !l.alreadyInCrm).length;

  return (
    <div className="space-y-6">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-blue-900 rounded-3xl p-6 sm:p-8 text-white relative overflow-hidden shadow-xl border border-indigo-800/40">
        <div className="absolute top-0 right-0 -mt-10 -mr-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/20 border border-blue-400/30 text-blue-300 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Google Business &amp; Local Maps Intelligence</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              Automatic Lead Hunter
            </h1>
            <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
              Extract real local businesses (Barbers, Salons, Clinics, Gyms) with verified phone numbers that 
              <strong className="text-white"> lack a modern website or mobile app</strong> — ready for your agency sales pitch!
            </p>
          </div>

          {/* Quick Metrics */}
          <div className="flex items-center gap-3 sm:gap-4 shrink-0">
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[100px]">
              <div className="text-xl sm:text-2xl font-black text-amber-400">{missingWebsiteCount}</div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold mt-0.5">No Website</div>
            </div>
            <div className="bg-white/10 backdrop-blur-md rounded-2xl p-3 sm:p-4 border border-white/10 text-center min-w-[100px]">
              <div className="text-xl sm:text-2xl font-black text-emerald-400">100%</div>
              <div className="text-[10px] text-slate-300 uppercase tracking-wider font-semibold mt-0.5">Verified Phone</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search & Intelligence Controls */}
      <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm space-y-4">
        {/* Quick Niche Pills */}
        <div className="flex flex-wrap items-center gap-2 pb-1 border-b border-slate-100">
          <span className="text-xs font-bold text-slate-500 mr-1 flex items-center gap-1">
            <Flame className="w-3.5 h-3.5 text-rose-500" /> Hot Niches:
          </span>
          {QUICK_NICHES.map((niche) => (
            <button
              key={niche.query}
              type="button"
              onClick={() => {
                setQuery(niche.query);
                handleSearch(niche.query, location);
              }}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
                query.toLowerCase() === niche.query.toLowerCase()
                  ? 'bg-blue-600 text-white shadow-sm shadow-blue-500/30'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {niche.label}
            </button>
          ))}
        </div>

        {/* Search Inputs */}
        <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
          <div className="md:col-span-4 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              Target Niche / Keyword
            </label>
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="e.g. Barber shop, Salon, Dentist..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="md:col-span-3 relative">
            <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-wider mb-1">
              City / Location
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                value={location}
                onChange={(e) => setLocation(e.target.value)}
                placeholder="e.g. Noida, Lucknow, Delhi..."
                className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
            </div>
          </div>

          <div className="md:col-span-3 flex items-end">
            <label className="flex items-center gap-2 p-2 bg-slate-50 border border-slate-200 rounded-xl w-full cursor-pointer hover:bg-slate-100">
              <input
                type="checkbox"
                checked={onlyMissingWebsite}
                onChange={(e) => setOnlyMissingWebsite(e.target.checked)}
                className="w-4 h-4 text-blue-600 rounded"
              />
              <span className="text-xs font-semibold text-slate-700">
                Only No Website (Prime Leads)
              </span>
            </label>
          </div>

          <div className="md:col-span-2 flex items-end">
            <button
              onClick={() => handleSearch()}
              disabled={loading}
              className="w-full py-2.5 px-4 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all disabled:opacity-50"
            >
              {loading ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Searching...</span>
                </>
              ) : (
                <>
                  <Compass className="w-4 h-4" />
                  <span>Extract Leads</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Quick city suggestions */}
        <div className="flex items-center gap-1.5 text-xs text-slate-400">
          <span>Popular:</span>
          {POPULAR_CITIES.map((c) => (
            <button
              key={c}
              onClick={() => {
                setLocation(c);
                handleSearch(query, c);
              }}
              className="text-blue-600 hover:underline px-1"
            >
              {c}
            </button>
          ))}
        </div>
      </div>

      {/* Results Header with Batch Action */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 px-1">
        <div>
          <h2 className="text-base font-bold text-slate-900 flex items-center gap-2">
            <span>Extracted Business Leads</span>
            <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-100 text-blue-700 font-semibold">
              {leads.length} Found
            </span>
          </h2>
          <p className="text-xs text-slate-500">
            Filtered for high-potential local businesses in {location}
          </p>
        </div>

        {leads.length > 0 && (
          <button
            onClick={handleBatchImport}
            disabled={batchImporting || notImportedCount === 0}
            className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-sm transition-all disabled:opacity-40"
          >
            {batchImporting ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Importing Leads...</span>
              </>
            ) : (
              <>
                <Download className="w-3.5 h-3.5" />
                <span>Import All to CRM ({notImportedCount})</span>
              </>
            )}
          </button>
        )}
      </div>

      {/* Extracted Leads Cards Grid */}
      {loading ? (
        <div className="bg-white rounded-3xl p-16 text-center border border-slate-200">
          <Loader2 className="w-8 h-8 text-blue-600 animate-spin mx-auto mb-3" />
          <p className="text-sm font-bold text-slate-900">Querying Google Business &amp; Local Maps Intelligence...</p>
          <p className="text-xs text-slate-500 mt-1">Analyzing website presence, mobile app availability, and ratings</p>
        </div>
      ) : leads.length === 0 ? (
        <div className="bg-white rounded-3xl p-12 text-center border border-slate-200 space-y-3">
          <AlertCircle className="w-10 h-10 text-amber-500 mx-auto" />
          <h3 className="text-base font-bold text-slate-900">No matching businesses found</h3>
          <p className="text-xs text-slate-500 max-w-md mx-auto">
            Try broadening your search keyword (e.g. "Salon" instead of "Men Hair Stylist") or selecting a larger city.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {leads.map((lead) => {
            const isImporting = importingId === lead.id;

            return (
              <div
                key={lead.id}
                className="bg-white rounded-2xl p-5 border border-slate-200 hover:border-blue-400 hover:shadow-lg transition-all flex flex-col justify-between space-y-4 relative group"
              >
                {/* Top Badge: Opportunity score */}
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1.5">
                    <span
                      className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full flex items-center gap-1 ${
                        lead.opportunityScore === 'Hot'
                          ? 'bg-rose-100 text-rose-700 border border-rose-200'
                          : 'bg-amber-100 text-amber-700 border border-amber-200'
                      }`}
                    >
                      <Flame className="w-3 h-3" />
                      {lead.opportunityScore} Opportunity
                    </span>
                    <span className="text-[11px] text-slate-400 font-medium">{lead.category}</span>
                  </div>

                  {lead.alreadyInCrm && (
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <CheckCircle2 className="w-3 h-3" /> In CRM
                    </span>
                  )}
                </div>

                {/* Business Details */}
                <div className="space-y-2">
                  <h3 className="text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-blue-600 transition-colors">
                    {lead.name}
                  </h3>

                  <div className="flex items-center gap-3 text-xs text-slate-600">
                    <div className="flex items-center gap-1 text-amber-500 font-bold">
                      <Star className="w-3.5 h-3.5 fill-amber-400" />
                      <span>{lead.rating}</span>
                      <span className="text-slate-400 font-normal">({lead.reviewCount})</span>
                    </div>

                    <a
                      href={lead.googleMapsUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-[11px] text-blue-600 hover:underline flex items-center gap-1"
                    >
                      <MapPin className="w-3 h-3" />
                      <span>View Map</span>
                      <ExternalLink className="w-2.5 h-2.5" />
                    </a>
                  </div>

                  <p className="text-[11px] text-slate-500 line-clamp-2 leading-relaxed">
                    {lead.address}
                  </p>
                </div>

                {/* Website & App Badges */}
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <div
                    className={`p-2 rounded-xl text-center border text-[11px] font-semibold flex items-center justify-center gap-1.5 ${
                      lead.hasWebsite
                        ? 'bg-slate-50 border-slate-200 text-slate-700'
                        : 'bg-rose-50 border-rose-200 text-rose-700'
                    }`}
                  >
                    <Globe className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">{lead.hasWebsite ? 'Has Website' : 'NO WEBSITE'}</span>
                  </div>

                  <div className="p-2 rounded-xl text-center border text-[11px] font-semibold bg-rose-50 border-rose-200 text-rose-700 flex items-center justify-center gap-1.5">
                    <Smartphone className="w-3.5 h-3.5 shrink-0" />
                    <span className="truncate">NO MOBILE APP</span>
                  </div>
                </div>

                {/* Contact & Opportunity Reason */}
                <div className="bg-slate-50 rounded-xl p-2.5 border border-slate-100 space-y-1 text-xs">
                  <div className="flex items-center justify-between">
                    <span className="text-[11px] font-semibold text-slate-500 flex items-center gap-1">
                      <Phone className="w-3 h-3 text-slate-400" /> Phone:
                    </span>
                    <a
                      href={`tel:${lead.phone.replace(/[^0-9+]/g, '')}`}
                      className="text-xs font-bold text-slate-800 hover:text-blue-600"
                    >
                      {lead.phone}
                    </a>
                  </div>
                  <p className="text-[10px] text-slate-500 leading-tight pt-1 border-t border-slate-200/60">
                    💡 {lead.opportunityReason}
                  </p>
                </div>

                {/* Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => openOutreachModal(lead, 'whatsapp')}
                    className="flex-1 py-2 px-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-700 font-bold text-[11px] rounded-xl flex items-center justify-center gap-1.5 border border-emerald-200 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" />
                    <span>WhatsApp Pitch</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => openOutreachModal(lead, 'call')}
                    className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl transition-colors"
                    title="Cold Call Script"
                  >
                    <PhoneCall className="w-3.5 h-3.5" />
                  </button>

                  <button
                    type="button"
                    disabled={lead.alreadyInCrm || isImporting}
                    onClick={() => handleImportLead(lead)}
                    className={`py-2 px-3 text-[11px] font-bold rounded-xl flex items-center justify-center gap-1 transition-all ${
                      lead.alreadyInCrm
                        ? 'bg-slate-100 text-slate-400 cursor-not-allowed'
                        : 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm'
                    }`}
                  >
                    {isImporting ? (
                      <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    ) : lead.alreadyInCrm ? (
                      <span>Saved</span>
                    ) : (
                      <>
                        <Download className="w-3.5 h-3.5" />
                        <span>Add CRM</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Outreach Pitch Modal */}
      {activeModalLead && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-lg w-full p-6 shadow-2xl border border-slate-200 space-y-4 animate-in fade-in zoom-in-95 duration-150">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2 py-0.5 rounded-full">
                  Tailored Outreach Script
                </span>
                <h3 className="text-base font-bold text-slate-900 mt-1">
                  {activeModalLead.name}
                </h3>
              </div>
              <button
                onClick={() => setActiveModalLead(null)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Format toggle: WhatsApp vs Call */}
            <div className="flex items-center gap-2 bg-slate-100 p-1 rounded-xl">
              <button
                onClick={() => setModalFormat('whatsapp')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  modalFormat === 'whatsapp'
                    ? 'bg-white text-emerald-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                <span>WhatsApp Message</span>
              </button>
              <button
                onClick={() => setModalFormat('call')}
                className={`flex-1 py-1.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                  modalFormat === 'call'
                    ? 'bg-white text-blue-700 shadow-sm font-bold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                <PhoneCall className="w-3.5 h-3.5 text-blue-600" />
                <span>Cold Call Script</span>
              </button>
            </div>

            {/* Generated Script Box */}
            <div className="relative">
              <pre className="w-full bg-slate-50 border border-slate-200 rounded-2xl p-4 text-xs font-mono text-slate-700 whitespace-pre-wrap leading-relaxed max-h-60 overflow-y-auto">
                {leadHunterService.generateOutreachScript(activeModalLead, modalFormat)}
              </pre>
            </div>

            {/* Modal Actions */}
            <div className="flex items-center justify-between gap-3 pt-2">
              <button
                onClick={copyOutreachPitch}
                className="py-2.5 px-4 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                {copied ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4" />}
                <span>{copied ? 'Copied to Clipboard!' : 'Copy Script'}</span>
              </button>

              {modalFormat === 'whatsapp' ? (
                <a
                  href={`https://wa.me/${activeModalLead.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                    leadHunterService.generateOutreachScript(activeModalLead, 'whatsapp')
                  )}`}
                  target="_blank"
                  rel="noreferrer"
                  className="py-2.5 px-5 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span>Open in WhatsApp</span>
                </a>
              ) : (
                <a
                  href={`tel:${activeModalLead.phone.replace(/[^0-9+]/g, '')}`}
                  className="py-2.5 px-5 bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 shadow-md transition-all"
                >
                  <Phone className="w-4 h-4" />
                  <span>Dial Phone Now</span>
                </a>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
