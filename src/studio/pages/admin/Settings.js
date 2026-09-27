import React, { useState, useEffect, useCallback } from 'react';
import {
  Building2,
  Receipt,
  CreditCard,
  Sparkles,
  Save,
  Database,
  Shield,
  Palette,
  Bell,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCompanySettings, saveCompanySettings, DEFAULT_COMPANY_SETTINGS } from '../../services/settingsService';
import { seedStarterData } from '../../services/seedService';

export default function Settings() {
  const { userProfile, isSuperAdmin } = useAuth();
  const toast = useToast();

  const [activeCategory, setActiveCategory] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_COMPANY_SETTINGS);

  const loadSettings = useCallback(async () => {
    setLoading(true);
    try {
      const data = await getCompanySettings();
      setSettings(data);
    } catch (err) {
      toast.error('Failed to load company settings');
    } finally {
      setLoading(false);
    }
  }, [toast]);

  useEffect(() => {
    loadSettings();
  }, [loadSettings]);

  const handleSave = async (e) => {
    if (e) e.preventDefault();
    setSaving(true);
    try {
      await saveCompanySettings(settings, userProfile?.email);
      toast.success('Settings saved successfully');
    } catch (err) {
      toast.error('Failed to update company configuration');
    } finally {
      setSaving(false);
    }
  };

  const handleSeed = async () => {
    setSeeding(true);
    try {
      await seedStarterData(userProfile?.email);
      toast.success('Enterprise sample dataset seeded successfully');
    } catch (err) {
      toast.error('Failed to seed dataset');
    } finally {
      setSeeding(false);
    }
  };

  const categories = [
    { id: 'company', label: 'Company Profile', icon: Building2 },
    { id: 'branding', label: 'Branding & Logo', icon: Palette },
    { id: 'invoicing', label: 'Tax & Invoicing', icon: Receipt },
    { id: 'banking', label: 'Bank & UPI Coordinates', icon: CreditCard },
    { id: 'security', label: 'Security & Access', icon: Shield },
    { id: 'developer', label: 'Data & Seed Tools', icon: Database },
  ];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-2 border-b border-slate-200 dark:border-slate-800">
        <div>
          <h1 className="text-lg font-semibold tracking-tight text-slate-900 dark:text-white">
            Workspace Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure Brainlink Softwares company credentials, tax rules, and developer tooling.
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="st-btn-primary st-btn-sm"
        >
          <Save className="w-3.5 h-3.5" />
          <span>{saving ? 'Saving...' : 'Save Configuration'}</span>
        </button>
      </div>

      {/* 2-Column SaaS Settings Layout */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        {/* Left Settings Navigation */}
        <div className="md:col-span-3 space-y-1">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-xs font-medium transition-colors text-left ${
                  isActive
                    ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 font-semibold'
                    : 'text-slate-600 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                }`}
              >
                <Icon className="w-4 h-4 shrink-0" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Right Settings Content Panel */}
        <div className="md:col-span-9">
          <div className="st-card p-5">
            {activeCategory === 'company' && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Company Profile
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Official business registration details used on contracts and reports.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Legal Entity Name
                    </label>
                    <input
                      type="text"
                      value={settings.companyName || ''}
                      onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                      className="st-input"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Official Contact Email
                    </label>
                    <input
                      type="email"
                      value={settings.email || ''}
                      onChange={(e) => setSettings({ ...settings, email: e.target.value })}
                      className="st-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Official Phone
                    </label>
                    <input
                      type="tel"
                      value={settings.phone || ''}
                      onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                      className="st-input"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Website URL
                    </label>
                    <input
                      type="url"
                      value={settings.website || ''}
                      onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                      className="st-input"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Registered Office Address
                  </label>
                  <textarea
                    rows={2}
                    value={settings.address || ''}
                    onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                    className="st-textarea"
                  />
                </div>
              </div>
            )}

            {activeCategory === 'branding' && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Branding & Aesthetics
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Configure visual identity assets displayed across client-facing invoices and portal.
                  </p>
                </div>

                <div className="flex items-center gap-4 p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-700">
                  <div className="w-12 h-12 rounded-lg bg-blue-600 text-white font-bold text-sm flex items-center justify-center">
                    BS
                  </div>
                  <div>
                    <div className="font-semibold text-slate-900 dark:text-white">Brainlink Studio</div>
                    <div className="text-[11px] text-slate-500">Brainlink Blue (#315CFF) • Inter Modern Typography</div>
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    Invoice Watermark / Tagline
                  </label>
                  <input
                    type="text"
                    value={settings.tagline || 'Engineering Scalable Software & AI Products'}
                    onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                    className="st-input"
                  />
                </div>
              </div>
            )}

            {activeCategory === 'invoicing' && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Indian GST & Invoicing Engine
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Configure GSTIN, HSN codes, and default payment terms.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      GSTIN (15 Digits)
                    </label>
                    <input
                      type="text"
                      value={settings.gstin || ''}
                      onChange={(e) => setSettings({ ...settings, gstin: e.target.value })}
                      placeholder="07AABCU9603R1ZM"
                      className="st-input font-mono uppercase"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      PAN Number
                    </label>
                    <input
                      type="text"
                      value={settings.pan || ''}
                      onChange={(e) => setSettings({ ...settings, pan: e.target.value })}
                      placeholder="AABCU9603R"
                      className="st-input font-mono uppercase"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Default SAC/HSN Code
                    </label>
                    <input
                      type="text"
                      value={settings.defaultHsn || '998314'}
                      onChange={(e) => setSettings({ ...settings, defaultHsn: e.target.value })}
                      className="st-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Default GST Rate (%)
                    </label>
                    <input
                      type="number"
                      value={settings.defaultGstRate || 18}
                      onChange={(e) => setSettings({ ...settings, defaultGstRate: Number(e.target.value) })}
                      className="st-input font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'banking' && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Bank Account & UPI Settlement
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Bank coordinates printed on tax invoices for NEFT/RTGS/IMPS wire transfers.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Bank Name
                    </label>
                    <input
                      type="text"
                      value={settings.bankName || ''}
                      onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                      placeholder="HDFC Bank"
                      className="st-input"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Account Holder Name
                    </label>
                    <input
                      type="text"
                      value={settings.accountHolder || ''}
                      onChange={(e) => setSettings({ ...settings, accountHolder: e.target.value })}
                      placeholder="Brainlink Softwares"
                      className="st-input"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      Account Number
                    </label>
                    <input
                      type="text"
                      value={settings.accountNumber || ''}
                      onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                      className="st-input font-mono"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                      IFSC Code
                    </label>
                    <input
                      type="text"
                      value={settings.ifsc || ''}
                      onChange={(e) => setSettings({ ...settings, ifsc: e.target.value })}
                      placeholder="HDFC0001234"
                      className="st-input font-mono uppercase"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-600 dark:text-slate-300 font-medium mb-1">
                    UPI ID / VPA
                  </label>
                  <input
                    type="text"
                    value={settings.upiId || 'brainlink@hdfcbank'}
                    onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                    className="st-input font-mono"
                  />
                </div>
              </div>
            )}

            {activeCategory === 'security' && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Access & Role Security
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Authorized Super Administrators and security policies.
                  </p>
                </div>

                <div className="space-y-2">
                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Aaditya Vishnoi</div>
                      <div className="text-[11px] text-slate-500">vishnoiaaditya29@gmail.com</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      SUPER ADMIN
                    </span>
                  </div>

                  <div className="p-3 rounded-lg border border-slate-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-800/40 flex items-center justify-between">
                    <div>
                      <div className="font-semibold text-slate-900 dark:text-white">Brainlink CEO</div>
                      <div className="text-[11px] text-slate-500">ceo.brainlink@gmail.com</div>
                    </div>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-semibold bg-blue-50 text-blue-700 dark:bg-blue-950/60 dark:text-blue-300 border border-blue-200 dark:border-blue-900">
                      SUPER ADMIN
                    </span>
                  </div>
                </div>
              </div>
            )}

            {activeCategory === 'developer' && (
              <div className="space-y-4 text-xs">
                <div className="pb-3 border-b border-slate-100 dark:border-slate-800">
                  <h3 className="text-sm font-semibold text-slate-900 dark:text-white">
                    Developer & Seed Tooling
                  </h3>
                  <p className="text-slate-500 dark:text-slate-400 text-[11px] mt-0.5">
                    Generate realistic production datasets for evaluating charts, pipeline, and invoices.
                  </p>
                </div>

                <div className="p-4 rounded-lg bg-slate-50 dark:bg-slate-800/40 border border-slate-200 dark:border-slate-800 space-y-3">
                  <div className="flex items-center gap-2 text-slate-800 dark:text-white font-semibold">
                    <Database className="w-4 h-4 text-blue-600" />
                    <span>Starter Production Dataset</span>
                  </div>
                  <p className="text-slate-500 dark:text-slate-400 leading-relaxed text-[11px]">
                    Populates realistic leads, sales pipeline deals with probabilities, active project sprints, milestones, GST invoices with itemized SAC codes, and payments.
                  </p>
                  {isSuperAdmin && (
                    <button
                      onClick={handleSeed}
                      disabled={seeding}
                      className="st-btn-secondary st-btn-sm"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      <span>{seeding ? 'Seeding data...' : 'Seed Sample Records'}</span>
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
