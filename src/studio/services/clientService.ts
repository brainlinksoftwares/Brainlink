import { Client, Lead } from '../types';
import { storageEngine } from './storageEngine';
import { activityService } from './activityService';
import { leadService } from './leadService';

const COLLECTION = 'clients';

export const clientService = {
  getAllClients: async (): Promise<Client[]> => {
    return storageEngine.get<Client>(COLLECTION);
  },

  getClientById: async (id: string): Promise<Client | null> => {
    const clients = storageEngine.get<Client>(COLLECTION);
    return clients.find((c) => c.id === id) || null;
  },

  createClient: async (
    data: Omit<Client, 'id' | 'createdAt' | 'updatedAt'>,
    actor: { id: string; name: string }
  ): Promise<Client> => {
    const clients = storageEngine.get<Client>(COLLECTION);
    const now = new Date().toISOString();

    const newClient: Client = {
      ...data,
      id: 'cli_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: now,
      updatedAt: now,
    };

    storageEngine.set(COLLECTION, [newClient, ...clients]);

    await activityService.logActivity({
      entityType: 'client',
      entityId: newClient.id,
      type: 'client_converted',
      description: `Client account created for "${newClient.company}"`,
      actorId: actor.id,
      actorName: actor.name,
      metadata: { contractValue: newClient.contractValue },
    });

    return newClient;
  },

  convertLeadToClient: async (
    lead: Lead,
    extra: {
      contractValue: number;
      startDate: string;
      notes?: string;
    },
    actor: { id: string; name: string }
  ): Promise<Client> => {
    // 1. Mark lead as Won
    await leadService.updateLeadStatus(lead.id, 'Won', actor);

    // 2. Create client record
    const client = await clientService.createClient(
      {
        leadId: lead.id,
        company: lead.company || lead.name,
        contactName: lead.name,
        email: lead.email,
        phone: lead.phone,
        website: lead.website || '',
        services: lead.service ? [lead.service] : [],
        contractValue: extra.contractValue || 0,
        startDate: extra.startDate || new Date().toISOString().split('T')[0],
        assignedTo: lead.assignedTo || actor.id,
        assignedToName: lead.assignedToName || actor.name,
        notes: extra.notes || lead.requirement || '',
      },
      actor
    );

    // 3. Log conversion on Lead timeline
    await activityService.logActivity({
      entityType: 'lead',
      entityId: lead.id,
      type: 'client_converted',
      description: `Lead converted to active client: "${client.company}" with contract value ₹${extra.contractValue.toLocaleString('en-IN')}`,
      actorId: actor.id,
      actorName: actor.name,
      metadata: { clientId: client.id },
    });

    return client;
  },

  updateClient: async (
    id: string,
    updates: Partial<Client>,
    actor: { id: string; name: string }
  ): Promise<Client> => {
    const clients = storageEngine.get<Client>(COLLECTION);
    const index = clients.findIndex((c) => c.id === id);
    if (index === -1) throw new Error('Client not found');

    const updated: Client = {
      ...clients[index],
      ...updates,
      updatedAt: new Date().toISOString(),
    };

    clients[index] = updated;
    storageEngine.set(COLLECTION, [...clients]);
    return updated;
  },

  subscribe: (callback: () => void): (() => void) => {
    return storageEngine.subscribe(COLLECTION, callback);
  },
};
