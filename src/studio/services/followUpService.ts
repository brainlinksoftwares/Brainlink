import { FollowUp, FollowUpStatus, FollowUpType } from '../types';
import { storageEngine } from './storageEngine';
import { activityService } from './activityService';

const COLLECTION = 'followups';

export const followUpService = {
  getAllFollowUps: async (): Promise<FollowUp[]> => {
    return storageEngine.get<FollowUp>(COLLECTION);
  },

  getFollowUpsForLead: async (leadId: string): Promise<FollowUp[]> => {
    const all = storageEngine.get<FollowUp>(COLLECTION);
    return all.filter((f) => f.leadId === leadId);
  },

  getGroupedFollowUps: async () => {
    const all = storageEngine.get<FollowUp>(COLLECTION);
    const now = new Date();
    const todayStr = now.toISOString().split('T')[0];

    const today: FollowUp[] = [];
    const upcoming: FollowUp[] = [];
    const overdue: FollowUp[] = [];
    const completed: FollowUp[] = [];

    all.forEach((item) => {
      if (item.status === 'completed') {
        completed.push(item);
        return;
      }
      const itemDateStr = item.scheduledAt.split('T')[0];
      const itemTime = new Date(item.scheduledAt).getTime();
      const currentTime = now.getTime();

      if (itemDateStr === todayStr) {
        today.push(item);
      } else if (itemTime < currentTime) {
        overdue.push(item);
      } else {
        upcoming.push(item);
      }
    });

    return { today, upcoming, overdue, completed };
  },

  createFollowUp: async (
    data: Omit<FollowUp, 'id' | 'createdAt' | 'updatedAt' | 'status'>,
    actor: { id: string; name: string }
  ): Promise<FollowUp> => {
    const all = storageEngine.get<FollowUp>(COLLECTION);
    const now = new Date().toISOString();

    const newFollowUp: FollowUp = {
      ...data,
      id: 'fu_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      status: 'pending',
      createdAt: now,
      updatedAt: now,
    };

    storageEngine.set(COLLECTION, [newFollowUp, ...all]);

    await activityService.logActivity({
      entityType: 'lead',
      entityId: data.leadId,
      type: 'followup_created',
      description: `Follow-up scheduled (${data.type}) for ${new Date(data.scheduledAt).toLocaleDateString()}`,
      actorId: actor.id,
      actorName: actor.name,
      metadata: { type: data.type, scheduledAt: data.scheduledAt },
    });

    return newFollowUp;
  },

  completeFollowUp: async (
    id: string,
    notes: string,
    actor: { id: string; name: string }
  ): Promise<FollowUp> => {
    const all = storageEngine.get<FollowUp>(COLLECTION);
    const index = all.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Follow-up not found');

    const item = all[index];
    const now = new Date().toISOString();

    const updated: FollowUp = {
      ...item,
      status: 'completed',
      notes: notes ? `${item.notes ? item.notes + ' | ' : ''}Completion Note: ${notes}` : item.notes,
      completedAt: now,
      updatedAt: now,
    };

    all[index] = updated;
    storageEngine.set(COLLECTION, [...all]);

    await activityService.logActivity({
      entityType: 'lead',
      entityId: item.leadId,
      type: 'followup_completed',
      description: `Follow-up marked completed (${item.type})`,
      actorId: actor.id,
      actorName: actor.name,
      metadata: { completionNotes: notes },
    });

    return updated;
  },

  rescheduleFollowUp: async (
    id: string,
    newScheduledAt: string,
    actor: { id: string; name: string }
  ): Promise<FollowUp> => {
    const all = storageEngine.get<FollowUp>(COLLECTION);
    const index = all.findIndex((f) => f.id === id);
    if (index === -1) throw new Error('Follow-up not found');

    const item = all[index];
    const now = new Date().toISOString();

    const updated: FollowUp = {
      ...item,
      status: 'rescheduled',
      scheduledAt: newScheduledAt,
      updatedAt: now,
    };

    all[index] = updated;
    storageEngine.set(COLLECTION, [...all]);

    await activityService.logActivity({
      entityType: 'lead',
      entityId: item.leadId,
      type: 'followup_created',
      description: `Follow-up rescheduled to ${new Date(newScheduledAt).toLocaleString()}`,
      actorId: actor.id,
      actorName: actor.name,
    });

    return updated;
  },

  deleteFollowUp: async (id: string): Promise<void> => {
    const all = storageEngine.get<FollowUp>(COLLECTION);
    const filtered = all.filter((f) => f.id !== id);
    storageEngine.set(COLLECTION, filtered);
  },

  subscribe: (callback: () => void): (() => void) => {
    return storageEngine.subscribe(COLLECTION, callback);
  },
};
