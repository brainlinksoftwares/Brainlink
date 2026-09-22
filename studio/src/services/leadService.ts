import { Lead, LeadStatus } from '../types';
import { storageEngine } from './storageEngine';
import { activityService } from './activityService';

const COLLECTION = 'leads';

export interface LeadFilterOptions {
  search?: string;
  status?: string;
  source?: string;
  priority?: string;
  assignedTo?: string;
  startDate?: string;
  endDate?: string;
  includeArchived?: boolean;
}

export const leadService = {
  getAllLeads: async (): Promise<Lead[]> => {
    return storageEngine.get<Lead>(COLLECTION);
  },

  getLeadById: async (id: string): Promise<Lead | null> => {
    const leads = storageEngine.get<Lead>(COLLECTION);
    return leads.find((l) => l.id === id) || null;
  },

  filterLeads: (leads: Lead[], filters: LeadFilterOptions): Lead[] => {
    return leads.filter((lead) => {
      // Archived filter
      if (!filters.includeArchived && lead.archived) return false;
      if (filters.includeArchived && !lead.archived) return false;

      // Status filter
      if (filters.status && filters.status !== 'all' && lead.status !== filters.status) {
        return false;
      }

      // Source filter
      if (filters.source && filters.source !== 'all' && lead.source !== filters.source) {
        return false;
      }

      // Priority filter
      if (filters.priority && filters.priority !== 'all' && lead.priority !== filters.priority) {
        return false;
      }

      // Assigned to filter
      if (filters.assignedTo && filters.assignedTo !== 'all') {
        if (filters.assignedTo === 'unassigned') {
          if (lead.assignedTo) return false;
        } else if (lead.assignedTo !== filters.assignedTo) {
          return false;
        }
      }

      // Date range filter
      if (filters.startDate) {
        const leadDate = new Date(lead.createdAt).getTime();
        const start = new Date(filters.startDate).getTime();
        if (leadDate < start) return false;
      }
      if (filters.endDate) {
        const leadDate = new Date(lead.createdAt).getTime();
        const end = new Date(filters.endDate + 'T23:59:59').getTime();
        if (leadDate > end) return false;
      }

      // Search query (across name, company, email, phone, requirement)
      if (filters.search && filters.search.trim()) {
        const q = filters.search.toLowerCase().trim();
        const matches =
          lead.name.toLowerCase().includes(q) ||
          lead.company.toLowerCase().includes(q) ||
          lead.email.toLowerCase().includes(q) ||
          lead.phone.toLowerCase().includes(q) ||
          (lead.requirement && lead.requirement.toLowerCase().includes(q)) ||
          (lead.service && lead.service.toLowerCase().includes(q));
        if (!matches) return false;
      }

      return true;
    });
  },

  createLead: async (
    leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>,
    actor: { id: string; name: string }
  ): Promise<Lead> => {
    const leads = storageEngine.get<Lead>(COLLECTION);
    const now = new Date().toISOString();

    const newLead: Lead = {
      ...leadData,
      id: 'lead_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: now,
      updatedAt: now,
    };

    const updated = [newLead, ...leads];
    storageEngine.set(COLLECTION, updated);

    // Audit log
    await activityService.logActivity({
      entityType: 'lead',
      entityId: newLead.id,
      type: 'lead_created',
      description: `Lead created for "${newLead.name}" (${newLead.company || 'Individual'})`,
      actorId: actor.id,
      actorName: actor.name,
      metadata: { source: newLead.source, service: newLead.service },
    });

    return newLead;
  },

  updateLead: async (
    id: string,
    updates: Partial<Lead>,
    actor: { id: string; name: string }
  ): Promise<Lead> => {
    const leads = storageEngine.get<Lead>(COLLECTION);
    const index = leads.findIndex((l) => l.id === id);
    if (index === -1) throw new Error('Lead not found');

    const oldLead = leads[index];
    const now = new Date().toISOString();
    const updatedLead: Lead = {
      ...oldLead,
      ...updates,
      updatedAt: now,
    };

    leads[index] = updatedLead;
    storageEngine.set(COLLECTION, [...leads]);

    // Check status change
    if (updates.status && updates.status !== oldLead.status) {
      await activityService.logActivity({
        entityType: 'lead',
        entityId: id,
        type: 'status_changed',
        description: `Status changed from "${oldLead.status}" to "${updates.status}"`,
        actorId: actor.id,
        actorName: actor.name,
        metadata: { from: oldLead.status, to: updates.status },
      });
    }

    // Check assignment change
    if (updates.assignedTo !== undefined && updates.assignedTo !== oldLead.assignedTo) {
      await activityService.logActivity({
        entityType: 'lead',
        entityId: id,
        type: 'lead_assigned',
        description: updates.assignedToName
          ? `Lead assigned to ${updates.assignedToName}`
          : 'Lead assignment cleared',
        actorId: actor.id,
        actorName: actor.name,
        metadata: { assignedTo: updates.assignedTo },
      });
    }

    return updatedLead;
  },

  updateLeadStatus: async (
    id: string,
    newStatus: LeadStatus,
    actor: { id: string; name: string }
  ): Promise<Lead> => {
    return leadService.updateLead(id, { status: newStatus }, actor);
  },

  archiveLead: async (id: string, actor: { id: string; name: string }): Promise<void> => {
    await leadService.updateLead(id, { archived: true }, actor);
    await activityService.logActivity({
      entityType: 'lead',
      entityId: id,
      type: 'lead_archived',
      description: 'Lead was archived',
      actorId: actor.id,
      actorName: actor.name,
    });
  },

  deleteLead: async (id: string, actor: { id: string; name: string }): Promise<void> => {
    const leads = storageEngine.get<Lead>(COLLECTION);
    const existing = leads.find((l) => l.id === id);
    const filtered = leads.filter((l) => l.id !== id);
    storageEngine.set(COLLECTION, filtered);

    if (existing) {
      await activityService.logActivity({
        entityType: 'lead',
        entityId: id,
        type: 'lead_archived',
        description: `Permanently deleted lead: ${existing.name}`,
        actorId: actor.id,
        actorName: actor.name,
      });
    }
  },

  batchCreateLeads: async (
    leadsToCreate: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[],
    actor: { id: string; name: string }
  ): Promise<Lead[]> => {
    const leads = storageEngine.get<Lead>(COLLECTION);
    const now = new Date().toISOString();
    const createdList: Lead[] = [];

    leadsToCreate.forEach((item, idx) => {
      const created: Lead = {
        ...item,
        id: 'lead_' + (Date.now() + idx) + '_' + Math.random().toString(36).substring(2, 6),
        createdAt: now,
        updatedAt: now,
      };
      createdList.push(created);
    });

    storageEngine.set(COLLECTION, [...createdList, ...leads]);

    await activityService.logActivity({
      entityType: 'lead',
      entityId: 'batch_' + Date.now(),
      type: 'lead_created',
      description: `Imported ${createdList.length} leads via CSV batch`,
      actorId: actor.id,
      actorName: actor.name,
    });

    return createdList;
  },

  subscribe: (callback: () => void): (() => void) => {
    return storageEngine.subscribe(COLLECTION, callback);
  },
};
