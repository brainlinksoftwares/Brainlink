import React, { useState, useEffect } from 'react';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Layers,
  Share2,
  Plus,
  Trash2,
  CheckCircle2,
  ExternalLink,
  MessageSquare,
  Mail,
  Calendar,
  Globe,
  Code,
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { settingsService, IntegrationStatus } from '../services/settingsService';
import { DEFAULT_LEAD_STATUSES, DEFAULT_LEAD_PRIORITIES } from '../config/crmConfig';

export const SettingsPage: React.FC = () => {
  const { user, role } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'crm' | 'integrations' | 'permissions'>('crm');

  const [sources, setSources] = useState<string[]>([]);
  const [newSource, setNewSource] = useState('');

  const [servicesList, setServicesList] = useState<string[]>([]);
  const [newService, setNewService] = useState('');

  const [integrations, setIntegrations] = useState<IntegrationStatus[]>([]);

  useEffect(() => {
    settingsService.getLeadSources().then(setSources);
    settingsService.getServices().then(setServicesList);
    settingsService.getIntegrations().then(setIntegrations);
  }, []);

  const handleAddSource = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSource.trim() || sources.includes(newSource.trim())) return;
    const updated = [...sources, newSource.trim()];
    setSources(updated);
    await settingsService.setLeadSources(updated);
    setNewSource('');
  };

  const handleRemoveSource = async (sourceToRemove: string) => {
    const updated = sources.filter((s) => s !== sourceToRemove);
    setSources(updated);
    await settingsService.setLeadSources(updated);
  };

  const handleAddService = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newService.trim() || servicesList.includes(newService.trim())) return;
    const updated = [...servicesList, newService.trim()];
    setServicesList(updated);
    await settingsService.setServices(updated);
    setNewService('');
  };

  const handleRemoveService = async (serviceToRemove: string) => {
    const updated = servicesList.filter((s) => s !== serviceToRemove);
    setServicesList(updated);
    await settingsService.setServices(updated);
  };

  const handleToggleIntegration = async (id: string, currentState: boolean) => {
    const updated = await settingsService.updateIntegrationStatus(id, !currentState);
    setIntegrations(updated);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
          Settings &amp; Configuration
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
          Configure lead sources, service offerings, integration hooks, and CRM parameters
        </p>
      </div>

      {/* Tabs */}
      <div className="flex border-b border-slate-200 gap-4 text-xs font-semibold">
        <button
          onClick={() => setActiveTab('crm')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'crm'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          CRM Customization
        </button>

        <button
          onClick={() => setActiveTab('integrations')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'integrations'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Integration Interfaces
        </button>

        <button
          onClick={() => setActiveTab('profile')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'profile'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          My Profile
        </button>

        <button
          onClick={() => setActiveTab('permissions')}
          className={`pb-3 border-b-2 transition-all ${
            activeTab === 'permissions'
              ? 'border-blue-600 text-blue-600'
              : 'border-transparent text-slate-500 hover:text-slate-800'
          }`}
        >
          Role Permissions Matrix
        </button>
      </div>

      {/* CRM Customization Tab */}
      {activeTab === 'crm' && (
        <div className="space-y-6">
          {/* Services Catalog */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Services Catalog</h3>
              <p className="text-xs text-slate-500">
                Services selectable on lead creation and in client proposals
              </p>
            </div>

            <form onSubmit={handleAddService} className="flex gap-2">
              <input
                type="text"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Add new service (e.g. AI Workflow Automation)..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={!newService.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Service
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {servicesList.map((srv) => (
                <span
                  key={srv}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  {srv}
                  {role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveService(srv)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      &times;
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Lead Sources */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configurable Lead Sources</h3>
              <p className="text-xs text-slate-500">
                Inbound acquisition channels mapped for marketing attribution
              </p>
            </div>

            <form onSubmit={handleAddSource} className="flex gap-2">
              <input
                type="text"
                value={newSource}
                onChange={(e) => setNewSource(e.target.value)}
                placeholder="Add new source (e.g. Clutch, Tech Event)..."
                className="flex-1 px-3 py-2 text-xs border border-slate-200 rounded-xl focus:outline-none focus:border-blue-600"
              />
              <button
                type="submit"
                disabled={!newSource.trim()}
                className="inline-flex items-center gap-1.5 px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl transition-colors disabled:opacity-40"
              >
                <Plus className="w-3.5 h-3.5" />
                Add Source
              </button>
            </form>

            <div className="flex flex-wrap gap-2 pt-2">
              {sources.map((src) => (
                <span
                  key={src}
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-slate-50 border border-slate-200 rounded-xl text-slate-700"
                >
                  {src}
                  {role === 'admin' && (
                    <button
                      type="button"
                      onClick={() => handleRemoveSource(src)}
                      className="text-slate-400 hover:text-rose-600 ml-1"
                    >
                      &times;
                    </button>
                  )}
                </span>
              ))}
            </div>
          </div>

          {/* Pipeline Stages Display */}
          <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
            <div>
              <h3 className="text-sm font-bold text-slate-900">Configured Pipeline Stages</h3>
              <p className="text-xs text-slate-500">
                Active workflow stages mapped to the sales Kanban and conversion funnel
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {DEFAULT_LEAD_STATUSES.map((st, i) => (
                <div
                  key={st.key}
                  className="p-3 rounded-xl border border-slate-200/80 bg-slate-50/50 flex items-center gap-2 text-xs"
                >
                  <span className="w-5 h-5 rounded-full bg-white border border-slate-200 text-[10px] font-bold text-slate-600 flex items-center justify-center shrink-0">
                    {i + 1}
                  </span>
                  <span className="font-semibold text-slate-800 truncate">{st.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Integrations Tab */}
      {activeTab === 'integrations' && (
        <div className="space-y-4">
          <div className="p-4 bg-blue-50 border border-blue-200 rounded-2xl text-xs text-blue-800">
            <strong>Architecture Integration Placeholders:</strong> In accordance with requirement #26, these interfaces are prepared for API webhook and OAuth linking without fake mock responses.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {integrations.map((item) => (
              <div
                key={item.id}
                className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex flex-col justify-between"
              >
                <div className="space-y-2">
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 bg-slate-100 text-slate-600 rounded">
                      {item.category}
                    </span>
                    <span
                      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full border ${
                        item.connected
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                          : 'bg-slate-100 text-slate-500 border-slate-200'
                      }`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${item.connected ? 'bg-emerald-500' : 'bg-slate-400'}`} />
                      {item.connected ? 'Active Hook' : 'Ready to Connect'}
                    </span>
                  </div>

                  <h4 className="text-sm font-bold text-slate-900">{item.name}</h4>
                  <p className="text-xs text-slate-500 leading-relaxed">{item.description}</p>
                </div>

                <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between">
                  {item.id === 'public_web_forms' ? (
                    <a
                      href="/apply"
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs font-semibold text-blue-600 hover:underline flex items-center gap-1"
                    >
                      View Embed URL (/apply)
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleToggleIntegration(item.id, item.connected)}
                      className={`px-3 py-1.5 text-xs font-semibold rounded-xl transition-colors ${
                        item.connected
                          ? 'bg-rose-50 text-rose-700 hover:bg-rose-100'
                          : 'bg-slate-900 text-white hover:bg-slate-800'
                      }`}
                    >
                      {item.connected ? 'Disconnect Hook' : 'Configure API Key'}
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Profile Tab */}
      {activeTab === 'profile' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4 max-w-lg">
          <h3 className="text-sm font-bold text-slate-900">User Profile Details</h3>
          <div className="flex items-center gap-4 py-2">
            <div className="w-14 h-14 rounded-2xl bg-slate-900 text-white font-bold text-lg flex items-center justify-center">
              {user?.name?.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="text-base font-bold text-slate-900">{user?.name}</p>
              <p className="text-xs text-slate-500">{user?.email}</p>
              <span className="inline-block mt-1 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-blue-50 text-blue-700 rounded border border-blue-200">
                Active Role: {role}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Permissions Matrix Tab */}
      {activeTab === 'permissions' && (
        <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-2xs space-y-4">
          <div>
            <h3 className="text-sm font-bold text-slate-900">Role-Based Access Control (RBAC)</h3>
            <p className="text-xs text-slate-500">Centrally implemented security permissions matrix</p>
          </div>

          <div className="overflow-x-auto border border-slate-200 rounded-xl">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-600 font-semibold uppercase">
                <tr>
                  <th className="py-2.5 px-4">Capability</th>
                  <th className="py-2.5 px-4 text-center">Admin</th>
                  <th className="py-2.5 px-4 text-center">Manager</th>
                  <th className="py-2.5 px-4 text-center">Sales</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {[
                  { name: 'View All Inbound Leads', admin: true, manager: true, sales: false },
                  { name: 'View Assigned Leads', admin: true, manager: true, sales: true },
                  { name: 'Create New Leads', admin: true, manager: true, sales: true },
                  { name: 'Edit Any Lead Details', admin: true, manager: true, sales: false },
                  { name: 'Delete / Archive Leads', admin: true, manager: false, sales: false },
                  { name: 'Assign Leads to Employees', admin: true, manager: true, sales: false },
                  { name: 'Convert Won Lead to Client', admin: true, manager: true, sales: false },
                  { name: 'Import CSV Batch Records', admin: true, manager: false, sales: false },
                  { name: 'Export Filtered Leads CSV', admin: true, manager: false, sales: false },
                  { name: 'Team & Role Management', admin: true, manager: false, sales: false },
                  { name: 'CRM & Service Configuration', admin: true, manager: false, sales: false },
                ].map((row, idx) => (
                  <tr key={idx} className="hover:bg-slate-50">
                    <td className="py-2.5 px-4 font-medium text-slate-800">{row.name}</td>
                    <td className="py-2.5 px-4 text-center">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {row.manager ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">&mdash;</span>
                      )}
                    </td>
                    <td className="py-2.5 px-4 text-center">
                      {row.sales ? (
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 mx-auto" />
                      ) : (
                        <span className="text-slate-300 font-bold">&mdash;</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
