import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, UserRole } from '../types';
import { authService } from '../services/authService';
import { hasPermission, PermissionAction, canAccessLead } from '../config/permissions';

interface AuthContextType {
  user: User | null;
  role: UserRole | null;
  loading: boolean;
  isFirebase: boolean;
  login: (email: string, password: string) => Promise<User>;
  loginGoogle: () => Promise<User>;
  logout: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  checkPermission: (action: PermissionAction) => boolean;
  canViewLead: (lead: { assignedTo?: string }) => boolean;
  switchRole: (newRole: UserRole) => void; // Convenient dev/demo switcher
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(authService.getCurrentUser());
  const [loading, setLoading] = useState<boolean>(true);
  const isFirebase = authService.isConfigured();

  useEffect(() => {
    const unsubscribe = authService.onAuthStateChange((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  const login = async (email: string, password: string): Promise<User> => {
    const loggedInUser = await authService.loginWithEmail(email, password);
    setUser(loggedInUser);
    return loggedInUser;
  };

  const loginGoogle = async (): Promise<User> => {
    const loggedInUser = await authService.loginWithGoogle();
    setUser(loggedInUser);
    return loggedInUser;
  };

  const logout = async (): Promise<void> => {
    await authService.logout();
    setUser(null);
  };

  const resetPassword = async (email: string): Promise<void> => {
    await authService.sendPasswordReset(email);
  };

  const checkPermission = (action: PermissionAction): boolean => {
    return hasPermission(user?.role, action);
  };

  const canViewLead = (lead: { assignedTo?: string }): boolean => {
    if (!user) return false;
    return canAccessLead(user.role, user.id, lead);
  };

  const switchRole = (newRole: UserRole) => {
    if (!user) return;
    const updated = { ...user, role: newRole };
    authService.setCurrentUser(updated);
    setUser(updated);
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        role: user?.role || null,
        loading,
        isFirebase,
        login,
        loginGoogle,
        logout,
        resetPassword,
        checkPermission,
        canViewLead,
        switchRole,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
