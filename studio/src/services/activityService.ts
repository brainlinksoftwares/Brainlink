import { Activity, ActivityType } from '../types';
import { storageEngine } from './storageEngine';

const COLLECTION = 'activities';

export const activityService = {
  logActivity: async (data: {
    entityType: 'lead' | 'client' | 'project' | 'task' | 'user';
    entityId: string;
    type: ActivityType;
    description: string;
    actorId: string;
    actorName: string;
    metadata?: Record<string, any>;
  }): Promise<Activity> => {
    const activities = storageEngine.get<Activity>(COLLECTION);

    const newActivity: Activity = {
      id: 'act_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7),
      entityType: data.entityType,
      entityId: data.entityId,
      type: data.type,
      description: data.description,
      actorId: data.actorId,
      actorName: data.actorName || 'System',
      metadata: data.metadata || {},
      createdAt: new Date().toISOString(),
    };

    // Store newest first
    const updated = [newActivity, ...activities];
    storageEngine.set(COLLECTION, updated);

    return newActivity;
  },

  getActivitiesForEntity: async (
    entityType: 'lead' | 'client' | 'project' | 'task' | 'user',
    entityId: string
  ): Promise<Activity[]> => {
    const activities = storageEngine.get<Activity>(COLLECTION);
    return activities.filter(
      (a) => a.entityType === entityType && a.entityId === entityId
    );
  },

  getAllActivities: async (limitCount = 50): Promise<Activity[]> => {
    const activities = storageEngine.get<Activity>(COLLECTION);
    return activities.slice(0, limitCount);
  },

  subscribe: (callback: () => void): (() => void) => {
    return storageEngine.subscribe(COLLECTION, callback);
  },
};
