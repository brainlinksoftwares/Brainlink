import { User, UserRole, UserStatus } from '../types';
import { storageEngine } from './storageEngine';
import { activityService } from './activityService';

const COLLECTION = 'users';

const DEFAULT_USERS: User[] = [
  {
    id: 'usr_admin_1',
    name: 'Brainlink Admin',
    email: 'admin@brainlink.in',
    role: 'admin',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_manager_1',
    name: 'Sales Manager',
    email: 'manager@brainlink.in',
    role: 'manager',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
  {
    id: 'usr_sales_1',
    name: 'Aaditya Vishnoi',
    email: 'aaditya@brainlink.in',
    role: 'sales',
    status: 'active',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  },
];

export const teamService = {
  getAllUsers: async (): Promise<User[]> => {
    let users = storageEngine.get<User>(COLLECTION);
    if (users.length === 0) {
      storageEngine.set(COLLECTION, DEFAULT_USERS);
      users = DEFAULT_USERS;
    }
    return users;
  },

  getUserById: async (id: string): Promise<User | null> => {
    const users = await teamService.getAllUsers();
    return users.find((u) => u.id === id) || null;
  },

  addUser: async (
    data: { name: string; email: string; role: UserRole },
    actor: { id: string; name: string }
  ): Promise<User> => {
    const users = await teamService.getAllUsers();
    const existing = users.find((u) => u.email.toLowerCase() === data.email.toLowerCase());
    if (existing) {
      throw new Error('A team member with this email address already exists.');
    }

    const now = new Date().toISOString();
    const newUser: User = {
      id: 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 6),
      name: data.name,
      email: data.email,
      role: data.role,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    storageEngine.set(COLLECTION, [...users, newUser]);

    await activityService.logActivity({
      entityType: 'user',
      entityId: newUser.id,
      type: 'lead_updated',
      description: `New team member added: ${newUser.name} (${newUser.role})`,
      actorId: actor.id,
      actorName: actor.name,
    });

    return newUser;
  },

  updateUserRole: async (
    id: string,
    newRole: UserRole,
    actor: { id: string; name: string }
  ): Promise<User> => {
    const users = await teamService.getAllUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');

    const updated: User = {
      ...users[index],
      role: newRole,
      updatedAt: new Date().toISOString(),
    };

    users[index] = updated;
    storageEngine.set(COLLECTION, [...users]);

    await activityService.logActivity({
      entityType: 'user',
      entityId: id,
      type: 'lead_updated',
      description: `Role updated for ${updated.name} to ${newRole}`,
      actorId: actor.id,
      actorName: actor.name,
    });

    return updated;
  },

  updateTeamMemberRole: async (
    id: string,
    newRole: UserRole,
    actor: { id: string; name: string }
  ): Promise<User> => {
    return teamService.updateUserRole(id, newRole, actor);
  },

  toggleUserStatus: async (
    id: string,
    actor: { id: string; name: string }
  ): Promise<User> => {
    const users = await teamService.getAllUsers();
    const index = users.findIndex((u) => u.id === id);
    if (index === -1) throw new Error('User not found');

    const newStatus: UserStatus = users[index].status === 'active' ? 'inactive' : 'active';
    const updated: User = {
      ...users[index],
      status: newStatus,
      updatedAt: new Date().toISOString(),
    };

    users[index] = updated;
    storageEngine.set(COLLECTION, [...users]);

    await activityService.logActivity({
      entityType: 'user',
      entityId: id,
      type: 'lead_updated',
      description: `User account ${updated.name} set to ${newStatus}`,
      actorId: actor.id,
      actorName: actor.name,
    });

    return updated;
  },

  subscribe: (callback: () => void): (() => void) => {
    return storageEngine.subscribe(COLLECTION, callback);
  },
};
