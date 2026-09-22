import { Project, ProjectStatus } from '../types';
import { storageEngine } from './storageEngine';
import { activityService } from './activityService';

const COLLECTION = 'projects';

export const projectService = {
  getAllProjects: async (): Promise<Project[]> => {
    return storageEngine.get<Project>(COLLECTION);
  },

  getProjectsForClient: async (clientId: string): Promise<Project[]> => {
    const all = storageEngine.get<Project>(COLLECTION);
    return all.filter((p) => p.clientId === clientId);
  },

  createProject: async (
    data: Omit<Project, 'id' | 'createdAt' | 'updatedAt'>,
    actor: { id: string; name: string }
  ): Promise<Project> => {
    const all = storageEngine.get<Project>(COLLECTION);
    const now = new Date().toISOString();

    const newProject: Project = {
      ...data,
      id: 'proj_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      createdAt: now,
      updatedAt: now,
    };

    storageEngine.set(COLLECTION, [newProject, ...all]);

    await activityService.logActivity({
      entityType: 'project',
      entityId: newProject.id,
      type: 'project_created',
      description: `New project initiated: "${newProject.name}" (Value: ₹${newProject.value.toLocaleString('en-IN')})`,
      actorId: actor.id,
      actorName: actor.name,
      metadata: { clientId: newProject.clientId, service: newProject.service },
    });

    return newProject;
  },

  updateProjectStatus: async (
    id: string,
    status: ProjectStatus,
    actor: { id: string; name: string }
  ): Promise<Project> => {
    const all = storageEngine.get<Project>(COLLECTION);
    const index = all.findIndex((p) => p.id === id);
    if (index === -1) throw new Error('Project not found');

    const updated: Project = {
      ...all[index],
      status,
      updatedAt: new Date().toISOString(),
    };

    all[index] = updated;
    storageEngine.set(COLLECTION, [...all]);

    await activityService.logActivity({
      entityType: 'project',
      entityId: id,
      type: 'project_created',
      description: `Project status changed to: ${status}`,
      actorId: actor.id,
      actorName: actor.name,
    });

    return updated;
  },

  subscribe: (callback: () => void): (() => void) => {
    return storageEngine.subscribe(COLLECTION, callback);
  },
};
