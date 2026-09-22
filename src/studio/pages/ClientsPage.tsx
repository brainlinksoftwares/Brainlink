import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Building2,
  Mail,
  Phone,
  Globe,
  Briefcase,
  ExternalLink,
} from 'lucide-react';
import { clientService } from '../services/clientService';
import { projectService } from '../services/projectService';
import { Client, Project } from '../types';
import { EmptyState } from '../components/common/EmptyState';

export const ClientsPage: React.FC = () => {
  const navigate = useNavigate();
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const [loading, setLoading] = useState(true);

  const loadData = async () => {
    setLoading(true);
    try {
      const [c, p] = await Promise.all([
        clientService.getAllClients(),
        projectService.getAllProjects(),
      ]);
      setClients(c);
      setProjects(p);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    const unsub = clientService.subscribe(loadData);
    return () => unsub();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-24">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
            Converted Clients &amp; Accounts
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Active client accounts converted from Won sales pipeline leads
          </p>
        </div>

        <button
          onClick={() => navigate('/projects')}
          className="inline-flex items-center gap-1.5 px-3.5 py-2 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-xl shadow-2xs transition-colors"
        >
          <Briefcase className="w-4 h-4 text-slate-500" />
          View Active Projects
        </button>
      </div>

      {clients.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No client accounts converted yet"
          description="When a lead in your CRM reaches the 'Won' stage, convert it into an official client account with contracted project milestones."
          actionLabel="View Leads Pipeline"
          onAction={() => navigate('/pipeline')}
        />
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {clients.map((client) => {
            const clientProjects = projects.filter((p) => p.clientId === client.id);

            return (
              <div
                key={client.id}
                className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{client.company}</h3>
                      <p className="text-xs text-slate-500 mt-0.5">
                        Contact: <span className="font-semibold text-slate-700">{client.contactName}</span>
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[11px] font-bold text-emerald-700 bg-emerald-50 rounded-full border border-emerald-200">
                      Active
                    </span>
                  </div>

                  <div className="space-y-1.5 text-xs text-slate-600">
                    {client.email && (
                      <div className="flex items-center gap-2">
                        <Mail className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.email}</span>
                      </div>
                    )}
                    {client.phone && (
                      <div className="flex items-center gap-2">
                        <Phone className="w-3.5 h-3.5 text-slate-400" />
                        <span>{client.phone}</span>
                      </div>
                    )}
                    {client.website && (
                      <div className="flex items-center gap-2">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        <span className="truncate">{client.website}</span>
                      </div>
                    )}
                  </div>

                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs space-y-1">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Contract Value:</span>
                      <span className="font-bold text-slate-900">
                        ₹{client.contractValue.toLocaleString('en-IN')}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Start Date:</span>
                      <span className="font-medium text-slate-700">
                        {new Date(client.startDate).toLocaleDateString('en-IN', {
                          month: 'short',
                          day: 'numeric',
                          year: 'numeric',
                        })}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Account Owner:</span>
                      <span className="font-medium text-slate-700">{client.assignedToName || 'Team'}</span>
                    </div>
                  </div>

                  {client.notes && (
                    <p className="text-[11px] text-slate-500 italic line-clamp-2">
                      "{client.notes}"
                    </p>
                  )}
                </div>

                <div className="pt-3 mt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-slate-500 font-medium">
                    {clientProjects.length} Active Project{clientProjects.length === 1 ? '' : 's'}
                  </span>
                  {client.leadId && (
                    <button
                      onClick={() => navigate(`/leads/${client.leadId}`)}
                      className="text-blue-600 hover:underline flex items-center gap-1 font-medium"
                    >
                      Lead Record
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
