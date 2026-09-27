import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  Building2,
  Receipt,
  CreditCard,
  Sparkles,
  Save,
  CheckCircle2,
  Database,
  RefreshCw,
} from 'lucide-react';
import Tabs from '../../components/ui/Tabs';
import { useAuth } from '../../context/AuthContext';
import { useToast } from '../../context/ToastContext';
import { getCompanySettings, saveCompanySettings, DEFAULT_COMPANY_SETTINGS } from '../../services/settingsService';
import { seedStarterData } from '../../services/seedService';

export default function Settings() {
  const { userProfile, role, isSuperAdmin } = useAuth();
  const toast = useToast();

  const [activeTab, setActiveTab] = useState('company');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [seeding, setSeeding] = useState(false);

  const [settings, setSettings] = useState(DEFAULT_COMPANY_SETTINGS);

  useEffect(() => {
    async function loadSettings() {
      setLoading(true);
      try {
        const data = await getCompanySettings();
        setSettings(data);
      } catch (err) {
        toast.error('Failed to load company settings');
      } finally {
        setLoading(false);
      }
    }
    loadSettings();
  }, [toast]);

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await saveCompanySettings(settings, userProfile?.email);
      toast.success('Company settings saved successfully');
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
      toast.success('Starter dataset successfully populated into Firestore!');
    } catch (err) {
      toast.error('Failed to seed starter data');
    } finally {
      setSeeding(false);
    }
  };

  const tabs = [
    { id: 'company', label: 'Company Profile & Tax', icon: Building2 },
    { id: 'banking', label: 'Bank Details & UPI', icon: CreditCard },
    { id: 'invoice', label: 'Invoicing & Terms', icon: Receipt },
    { id: 'developer', label: 'Developer Tools & Seed', icon: Database },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 font-heading">
            System Configuration & Settings
          </h1>
          <p className="text-xs text-slate-500 mt-1">
            Section 33 compliance: corporate parameters, GST details, banking coordinates, and invoice branding
          </p>
        </div>

        <button
          onClick={handleSave}
          disabled={saving}
          className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
        >
          <Save className="w-4 h-4" />
          <span>{saving ? 'Saving Changes...' : 'Save Configuration'}</span>
        </button>
      </div>

      <Tabs tabs={tabs} activeTab={activeTab} onChange={setActiveTab} />

      <form onSubmit={handleSave} className="bg-white rounded-xl border border-slate-200/80 p-6 shadow-sm">
        {activeTab === 'company' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Corporate Identity & Legal Data
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Company Legal Name *</label>
                <input
                  type="text"
                  required
                  value={settings.companyName}
                  onChange={(e) => setSettings({ ...settings, companyName: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Brand Tagline</label>
                <input
                  type="text"
                  value={settings.tagline}
                  onChange={(e) => setSettings({ ...settings, tagline: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Primary Official Email</label>
                <input
                  type="email"
                  value={settings.primaryEmail}
                  onChange={(e) => setSettings({ ...settings, primaryEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Finance / Billing Email</label>
                <input
                  type="email"
                  value={settings.financeEmail}
                  onChange={(e) => setSettings({ ...settings, financeEmail: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Phone Number</label>
                <input
                  type="tel"
                  value={settings.phone}
                  onChange={(e) => setSettings({ ...settings, phone: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Main Website</label>
                <input
                  type="text"
                  value={settings.website}
                  onChange={(e) => setSettings({ ...settings, website: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate GSTIN</label>
                <input
                  type="text"
                  value={settings.gstin}
                  onChange={(e) => setSettings({ ...settings, gstin: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Corporate PAN</label>
                <input
                  type="text"
                  value={settings.pan}
                  onChange={(e) => setSettings({ ...settings, pan: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div className="sm:col-span-2">
                <label className="block font-semibold text-slate-700 mb-1">Registered Business Address</label>
                <textarea
                  rows={2}
                  value={settings.address}
                  onChange={(e) => setSettings({ ...settings, address: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'banking' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Bank Coordinates & UPI Configuration
            </h3>
            <p className="text-slate-500 text-[11px]">
              These details are printed automatically on generated PDF invoices and quotations.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Bank Name</label>
                <input
                  type="text"
                  value={settings.bankName}
                  onChange={(e) => setSettings({ ...settings, bankName: e.target.value })}
                  placeholder="e.g. HDFC Bank Ltd"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={settings.accountNumber}
                  onChange={(e) => setSettings({ ...settings, accountNumber: e.target.value })}
                  placeholder="e.g. 50200012345678"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">IFSC Code</label>
                <input
                  type="text"
                  value={settings.ifscCode}
                  onChange={(e) => setSettings({ ...settings, ifscCode: e.target.value.toUpperCase() })}
                  placeholder="e.g. HDFC0001234"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Official UPI ID / VPA</label>
                <input
                  type="text"
                  value={settings.upiId}
                  onChange={(e) => setSettings({ ...settings, upiId: e.target.value })}
                  placeholder="brainlink@upi"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono font-bold"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'invoice' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Tax & Invoicing Defaults
            </h3>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Invoice Prefix</label>
                <input
                  type="text"
                  value={settings.invoicePrefix}
                  onChange={(e) => setSettings({ ...settings, invoicePrefix: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Quotation Prefix</label>
                <input
                  type="text"
                  value={settings.quotationPrefix}
                  onChange={(e) => setSettings({ ...settings, quotationPrefix: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500 font-mono"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Default GST Rate (%)</label>
                <input
                  type="number"
                  value={settings.defaultGstRate}
                  onChange={(e) => setSettings({ ...settings, defaultGstRate: Number(e.target.value) })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="sm:col-span-3">
                <label className="block font-semibold text-slate-700 mb-1">Standard Terms & Conditions</label>
                <textarea
                  rows={3}
                  value={settings.invoiceTerms}
                  onChange={(e) => setSettings({ ...settings, invoiceTerms: e.target.value })}
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
          </div>
        )}

        {activeTab === 'developer' && (
          <div className="space-y-4 text-xs">
            <h3 className="text-sm font-bold text-slate-900 pb-2 border-b border-slate-100">
              Developer Utilities & Starter Data
            </h3>
            <p className="text-slate-500 leading-relaxed">
              In accordance with Section 43, mock records are never hard-coded in the UI. If you want to populate an authentic starting dataset (leads, pipeline deals, projects, milestones, tasks, GST invoice, and payments in INR), click below.
            </p>

            <div className="p-4 bg-slate-50 border border-slate-200 rounded-xl flex items-center justify-between">
              <div>
                <h4 className="font-bold text-slate-900">Populate Starter Production Dataset</h4>
                <p className="text-slate-500 text-[11px] mt-0.5">
                  Creates realistic sample deals (e.g. Telemedicine Suite, Zenith Logistics), client profile, tasks, and an invoice.
                </p>
              </div>

              <button
                type="button"
                onClick={handleSeed}
                disabled={seeding}
                className="px-4 py-2 font-semibold text-white bg-blue-600 hover:bg-blue-700 rounded-lg shadow-sm transition-all disabled:opacity-50"
              >
                {seeding ? 'Populating...' : 'Seed Starter Data'}
              </button>
            </div>
          </div>
        )}
      </form>
    </div>
  );
}
