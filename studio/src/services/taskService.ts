import { Task, TaskStatus } from '../types';
import { storageEngine } from './storageEngine';
import { activityService } from './activityService';

const COLLECTION = 'tasks';

export const taskService = {
  getAllTasks: async (): Promise<Task[]> => {
    return storageEngine.get<Task>(COLLECTION);
  },

  createTask: async (
    data: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>,
    actor: { id: string; name: string }
  ): Promise<Task> => {
    const all = storageEngine.get<Task>(COLLECTION);
    const now = new Date().toISOString();

    const newTask: Task = {
      ...data,
      id: 'tsk_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: now,
      updatedAt: now,
    };

    storageEngine.set(COLLECTION, [newTask, ...all]);

    await activityService.logActivity({
      entityType: 'task',
      entityId: newTask.id,
      type: 'task_created',
      description: `Task created: "${newTask.title}" for ${newTask.assignedToName || 'team'}`,
      actorId: actor.id,
      actorName: actor.name,
    });

    return newTask;
  },

  updateTaskStatus: async (
    id: string,
    status: TaskStatus,
    actor: { id: string; name: string }
  ): Promise<Task> => {
    const all = storageEngine.get<Task>(COLLECTION);
    const index = all.findIndex((t) => t.id === id);
    if (index === -1) throw new Error('Task not found');

    const item = all[index];
    const now = new Date().toISOString();

    const updated: Task = {
      ...item,
      status,
      updatedAt: now,
    };

    all[index] = updated;
    storageEngine.set(COLLECTION, [...all]);

    await activityService.logActivity({
      entityType: 'task',
      entityId: id,
      type: 'task_status_changed',
      description: `Task "${item.title}" status changed to ${status}`,
      actorId: actor.id,
      actorName: actor.name,
    });

    return updated;
  },

  deleteTask: async (id: string): Promise<void> => {
    const all = storageEngine.get<Task>(COLLECTION);
    storageEngine.set(
      COLLECTION,
      all.filter((t) => t.id !== id)
    );
  },

  subscribe: (callback: () => void): (() => void) => {
    return storageEngine.subscribe(COLLECTION, callback);
  },
};
