import {
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  onAuthStateChanged,
  User as FirebaseUser,
} from 'firebase/auth';
import { auth, googleProvider, isFirebaseConfigured } from '../config/firebase';
import { User, UserRole } from '../types';
import { teamService } from './teamService';

const AUTH_USER_KEY = 'current_auth_user';

export interface AuthSession {
  user: User;
  isFirebase: boolean;
}

export const authService = {
  isConfigured: (): boolean => isFirebaseConfigured,

  getCurrentUser: (): User | null => {
    try {
      const stored = localStorage.getItem(`brainlink_studio_${AUTH_USER_KEY}`);
      return stored ? JSON.parse(stored) : null;
    } catch {
      return null;
    }
  },

  setCurrentUser: (user: User | null): void => {
    if (user) {
      localStorage.setItem(`brainlink_studio_${AUTH_USER_KEY}`, JSON.stringify(user));
    } else {
      localStorage.removeItem(`brainlink_studio_${AUTH_USER_KEY}`);
    }
  },

  loginWithEmail: async (email: string, password: string): Promise<User> => {
    if (isFirebaseConfigured && auth) {
      const cred = await signInWithEmailAndPassword(auth, email, password);
      const appUser = await authService.syncFirebaseUser(cred.user);
      authService.setCurrentUser(appUser);
      return appUser;
    } else {
      // Demo / Local test mode when Firebase credentials not yet added to .env
      const users = await teamService.getAllUsers();
      const existing = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (existing) {
        if (existing.status === 'inactive') {
          throw new Error('This user account has been disabled by an administrator.');
        }
        authService.setCurrentUser(existing);
        return existing;
      }

      // If logging in with demo credentials or any new email
      const role: UserRole = email.includes('admin') ? 'admin' : email.includes('manager') ? 'manager' : 'sales';
      const newUser: User = {
        id: 'usr_' + Date.now(),
        name: email.split('@')[0].replace('.', ' '),
        email: email,
        role,
        status: 'active',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      await teamService.addUser({ name: newUser.name, email: newUser.email, role: newUser.role }, { id: 'sys', name: 'System' });
      authService.setCurrentUser(newUser);
      return newUser;
    }
  },

  loginWithGoogle: async (): Promise<User> => {
    if (isFirebaseConfigured && auth && googleProvider) {
      const cred = await signInWithPopup(auth, googleProvider);
      const appUser = await authService.syncFirebaseUser(cred.user);
      authService.setCurrentUser(appUser);
      return appUser;
    } else {
      // Demo mode fallback for Google auth
      const demoUser: User = {
        id: 'usr_google_admin',
        name: 'Brainlink Admin (Google)',
        email: 'admin@brainlink.in',
        role: 'admin',
        status: 'active',
        photoURL: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop&crop=face',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      authService.setCurrentUser(demoUser);
      return demoUser;
    }
  },

  sendPasswordReset: async (email: string): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      // Simulated reset acknowledgement
      await new Promise((resolve) => setTimeout(resolve, 600));
    }
  },

  logout: async (): Promise<void> => {
    if (isFirebaseConfigured && auth) {
      await signOut(auth);
    }
    authService.setCurrentUser(null);
  },

  syncFirebaseUser: async (fbUser: FirebaseUser): Promise<User> => {
    const users = await teamService.getAllUsers();
    let user = users.find((u) => u.email.toLowerCase() === (fbUser.email || '').toLowerCase());

    if (!user) {
      const role: UserRole = (fbUser.email || '').includes('admin') ? 'admin' : 'sales';
      user = {
        id: fbUser.uid,
        name: fbUser.displayName || fbUser.email?.split('@')[0] || 'Team Member',
        email: fbUser.email || '',
        role,
        status: 'active',
        photoURL: fbUser.photoURL || undefined,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      try {
        await teamService.addUser({ name: user.name, email: user.email, role: user.role }, { id: 'sys', name: 'System' });
      } catch {
        // User already in list
      }
    }

    return user;
  },

  onAuthStateChange: (callback: (user: User | null) => void): (() => void) => {
    if (isFirebaseConfigured && auth) {
      return onAuthStateChanged(auth, async (fbUser) => {
        if (fbUser) {
          const synced = await authService.syncFirebaseUser(fbUser);
          authService.setCurrentUser(synced);
          callback(synced);
        } else {
          authService.setCurrentUser(null);
          callback(null);
        }
      });
    } else {
      const current = authService.getCurrentUser();
      callback(current);
      return () => {};
    }
  },
};
