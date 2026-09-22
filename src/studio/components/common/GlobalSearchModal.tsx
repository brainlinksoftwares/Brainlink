import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, UserCheck, Briefcase, Building, Phone, Mail, X, ArrowRight } from 'lucide-react';
import { leadService } from '../../services/leadService';
import { clientService } from '../../services/clientService';
import { projectService } from '../../services/projectService';
import { Lead, Client, Project } from '../../types';
import { StatusBadge } from './StatusBadge';

interface GlobalSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const GlobalSearchModal: React.FC<GlobalSearchModalProps> = ({ isOpen, onClose }) => {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [leads, setLeads] = useState<Lead[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [projects, setProjects] = useState<Project[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      leadService.getAllLeads().then(setLeads);
      clientService.getAllClients().then(setClients);
      projectService.getAllProjects().then(setProjects);
    } else {
      setQuery('');
    }
  }, [isOpen]);

  if (!isOpen) return null;

  const q = query.toLowerCase().trim();

  // Filter matched results
  const matchedLeads = q
    ? leads.filter(
        (l) =>
          l.name.toLowerCase().includes(q) ||
          l.company.toLowerCase().includes(q) ||
          l.email.toLowerCase().includes(q) ||
          l.phone.toLowerCase().includes(q)
      ).slice(0, 5)
    : [];

  const matchedClients = q
    ? clients.filter(
        (c) =>
          c.company.toLowerCase().includes(q) ||
          c.contactName.toLowerCase().includes(q) ||
          c.email.toLowerCase().includes(q) ||
          c.phone.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const matchedProjects = q
    ? projects.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          (p.clientName && p.clientName.toLowerCase().includes(q)) ||
          p.service.toLowerCase().includes(q)
      ).slice(0, 4)
    : [];

  const totalResults = matchedLeads.length + matchedClients.length + matchedProjects.length;

  const handleSelectLead = (id: string) => {
    onClose();
    navigate(`/leads/${id}`);
  };

  const handleSelectClient = (id: string) => {
    onClose();
    navigate(`/clients`);
  };

  const handleSelectProject = (id: string) => {
    onClose();
    navigate(`/projects`);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/60 backdrop-blur-sm flex items-start justify-center pt-20 p-4">
      <div className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden transform transition-all animate-in fade-in zoom-in-95 duration-150">
        {/* Search input bar */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-200">
          <Search className="w-5 h-5 text-slate-400 mr-3 shrink-0" />
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads, companies, emails, phone numbers, clients, projects... (Ctrl + K)"
            className="w-full text-sm text-slate-900 placeholder-slate-400 bg-transparent border-0 focus:outline-none"
          />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 text-slate-400 hover:text-slate-600 rounded-md mr-1"
            >
              <X className="w-4 h-4" />
            </button>
          )}
          <kbd className="hidden sm:inline-block px-2 py-0.5 text-[10px] font-semibold text-slate-400 bg-slate-100 border border-slate-200 rounded">
            ESC
          </kbd>
        </div>

        {/* Results area */}
        <div className="max-h-96 overflow-y-auto p-4 space-y-4">
          {!q && (
            <div className="py-8 text-center text-xs text-slate-400">
              Type to search leads, clients, projects, or contacts
            </div>
          )}

          {q && totalResults === 0 && (
            <div className="py-8 text-center">
              <p className="text-sm font-medium text-slate-700">No results found for "{query}"</p>
              <p className="text-xs text-slate-400 mt-1">Try searching by company, email address, or phone number.</p>
            </div>
          )}

          {/* Leads section */}
          {matchedLeads.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <UserCheck className="w-3.5 h-3.5" />
                Leads ({matchedLeads.length})
              </div>
              <div className="space-y-1">
                {matchedLeads.map((lead) => (
                  <button
                    key={lead.id}
                    onClick={() => handleSelectLead(lead.id)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-medium text-slate-900 group-hover:text-blue-600 transition-colors">
                          {lead.name}
                        </span>
                        <StatusBadge status={lead.status} size="sm" />
                      </div>
                      <div className="flex items-center gap-3 text-xs text-slate-500 mt-0.5">
                        <span className="flex items-center gap-1">
                          <Building className="w-3 h-3 text-slate-400" />
                          {lead.company}
                        </span>
                        {lead.email && (
                          <span className="flex items-center gap-1">
                            <Mail className="w-3 h-3 text-slate-400" />
                            {lead.email}
                          </span>
                        )}
                        {lead.phone && (
                          <span className="flex items-center gap-1">
                            <Phone className="w-3 h-3 text-slate-400" />
                            {lead.phone}
                          </span>
                        )}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-blue-600 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Clients section */}
          {matchedClients.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Building className="w-3.5 h-3.5" />
                Clients ({matchedClients.length})
              </div>
              <div className="space-y-1">
                {matchedClients.map((client) => (
                  <button
                    key={client.id}
                    onClick={() => handleSelectClient(client.id)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 group-hover:text-emerald-600 transition-colors">
                        {client.company}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {client.contactName} &bull; {client.email} &bull; ₹{client.contractValue.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-emerald-600 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects section */}
          {matchedProjects.length > 0 && (
            <div>
              <div className="flex items-center gap-1.5 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                <Briefcase className="w-3.5 h-3.5" />
                Projects ({matchedProjects.length})
              </div>
              <div className="space-y-1">
                {matchedProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => handleSelectProject(p.id)}
                    className="w-full text-left p-2.5 rounded-xl hover:bg-slate-50 flex items-center justify-between group transition-colors"
                  >
                    <div>
                      <div className="text-sm font-medium text-slate-900 group-hover:text-purple-600 transition-colors">
                        {p.name}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {p.service} &bull; Status: {p.status} &bull; ₹{p.value.toLocaleString('en-IN')}
                      </div>
                    </div>
                    <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-purple-600 opacity-0 group-hover:opacity-100 transition-all" />
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
