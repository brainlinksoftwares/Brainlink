import React, { createContext, useContext, useEffect, useState } from 'react';
import {
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signInWithPopup,
  signOut,
  sendPasswordResetEmail,
  updateProfile,
} from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { auth, db, googleProvider } from '../config/firebase';
import { ROLES, ALL_PERMISSIONS, DEFAULT_ROLE_PERMISSIONS, isUserSuperAdmin, hasPermission } from './rbac';
import { logAudit } from '../services/auditService';

const AuthContext = createContext(null);
const SESSION_CACHE_KEY = 'brainlink_studio_session_v2';

function getCachedSession() {
  try {
    const raw = localStorage.getItem(SESSION_CACHE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    return null;
  }
}

function saveCachedSession(user, profile) {
  try {
    if (!user) {
      localStorage.removeItem(SESSION_CACHE_KEY);
    } else {
      localStorage.setItem(
        SESSION_CACHE_KEY,
        JSON.stringify({
          user: {
            uid: user.uid,
            email: user.email,
            displayName: user.displayName || profile?.displayName,
            photoURL: user.photoURL || '',
          },
          profile,
        })
      );
    }
  } catch (e) {
    // Ignore storage quota errors
  }
}

export function AuthProvider({ children }) {
  const cached = getCachedSession();
  const [currentUser, setCurrentUser] = useState(cached?.user || null);
  const [userProfile, setUserProfile] = useState(cached?.profile || null);
  // If we already have a cached session, do NOT block first paint!
  const [loading, setLoading] = useState(!cached?.user);
  const [simulatedRole, setSimulatedRole] = useState(null);

  useEffect(() => {
    let isMounted = true;

    // Safety timeout: If Firebase auth takes > 2.5s on cold starts, unblock UI
    const timeout = setTimeout(() => {
      if (isMounted && loading) {
        setLoading(false);
      }
    }, 2500);

    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      clearTimeout(timeout);
      if (!isMounted) return;

      if (firebaseUser) {
        const isSuper = isUserSuperAdmin(firebaseUser.email);
        const fallbackProfile = {
          uid: firebaseUser.uid,
          email: firebaseUser.email,
          displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
          photoURL: firebaseUser.photoURL || '',
          role: isSuper ? ROLES.SUPER_ADMIN : ROLES.SALES_EXECUTIVE,
          permissions: isSuper ? ALL_PERMISSIONS : DEFAULT_ROLE_PERMISSIONS[ROLES.SALES_EXECUTIVE],
          status: 'active',
        };

        // If not already populated, immediately set currentUser so UI renders
        setCurrentUser(firebaseUser);
        if (!userProfile) {
          setUserProfile(fallbackProfile);
        }
        setLoading(false);

        // Fetch / sync complete Firestore profile in the background
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let profileData = null;
          if (!userDocSnap.exists()) {
            profileData = {
              ...fallbackProfile,
              createdAt: serverTimestamp(),
              lastLoginAt: serverTimestamp(),
            };
            await setDoc(userDocRef, profileData);
            logAudit({
              user: firebaseUser.email,
              action: 'User Provisioned',
              entity: 'users',
              entityId: firebaseUser.uid,
              newValue: profileData.role,
            });
          } else {
            profileData = userDocSnap.data();

            if (isSuper && profileData.role !== ROLES.SUPER_ADMIN) {
              profileData.role = ROLES.SUPER_ADMIN;
              profileData.permissions = ALL_PERMISSIONS;
              await updateDoc(userDocRef, {
                role: ROLES.SUPER_ADMIN,
                permissions: ALL_PERMISSIONS,
                lastLoginAt: serverTimestamp(),
              });
            } else {
              updateDoc(userDocRef, {
                lastLoginAt: serverTimestamp(),
              }).catch(() => {});
            }
          }

          if (isMounted) {
            setUserProfile(profileData);
            saveCachedSession(firebaseUser, profileData);
          }
        } catch (error) {
          console.warn('Background profile sync warning:', error);
          if (isMounted && !userProfile) {
            setUserProfile(fallbackProfile);
            saveCachedSession(firebaseUser, fallbackProfile);
          }
        }
      } else {
        if (isMounted) {
          setCurrentUser(null);
          setUserProfile(null);
          setSimulatedRole(null);
          saveCachedSession(null, null);
          setLoading(false);
        }
      }
    });

    return () => {
      isMounted = false;
      clearTimeout(timeout);
      unsubscribe();
    };
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
    const isSuper = isUserSuperAdmin(cred.user.email);
    const initialProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email.split('@')[0],
      photoURL: cred.user.photoURL || '',
      role: isSuper ? ROLES.SUPER_ADMIN : ROLES.SALES_EXECUTIVE,
      permissions: isSuper ? ALL_PERMISSIONS : DEFAULT_ROLE_PERMISSIONS[ROLES.SALES_EXECUTIVE],
      status: 'active',
    };
    setCurrentUser(cred.user);
    setUserProfile(initialProfile);
    saveCachedSession(cred.user, initialProfile);
    logAudit({
      user: cred.user.email,
      action: 'User Login',
      entity: 'auth',
      entityId: cred.user.uid,
      newValue: 'Successful Email Login',
    });
    return cred.user;
  };

  const loginWithGoogle = async () => {
    const cred = await signInWithPopup(auth, googleProvider);
    const isSuper = isUserSuperAdmin(cred.user.email);
    const initialProfile = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: cred.user.displayName || cred.user.email.split('@')[0],
      photoURL: cred.user.photoURL || '',
      role: isSuper ? ROLES.SUPER_ADMIN : ROLES.SALES_EXECUTIVE,
      permissions: isSuper ? ALL_PERMISSIONS : DEFAULT_ROLE_PERMISSIONS[ROLES.SALES_EXECUTIVE],
      status: 'active',
    };
    setCurrentUser(cred.user);
    setUserProfile(initialProfile);
    saveCachedSession(cred.user, initialProfile);
    logAudit({
      user: cred.user.email,
      action: 'User Login (Google)',
      entity: 'auth',
      entityId: cred.user.uid,
      newValue: 'Successful Google SSO',
    });
    return cred.user;
  };

  const signup = async (email, password, displayName, role = ROLES.SALES_EXECUTIVE) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    const isSuper = isUserSuperAdmin(email);
    const userRole = isSuper ? ROLES.SUPER_ADMIN : role;
    const permissions = isSuper ? ALL_PERMISSIONS : (DEFAULT_ROLE_PERMISSIONS[userRole] || []);

    const profileData = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: displayName || email.split('@')[0],
      photoURL: '',
      role: userRole,
      permissions,
      status: 'active',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };

    await setDoc(doc(db, 'users', cred.user.uid), profileData);
    setCurrentUser(cred.user);
    setUserProfile(profileData);
    saveCachedSession(cred.user, profileData);

    logAudit({
      user: email,
      action: 'User Registration',
      entity: 'auth',
      entityId: cred.user.uid,
      newValue: `Role: ${userRole}`,
    });

    return cred.user;
  };

  const logout = async () => {
    if (currentUser?.email) {
      logAudit({
        user: currentUser.email,
        action: 'User Sign Out',
        entity: 'auth',
        entityId: currentUser.uid,
        newValue: 'Sign Out Completed',
      });
    }
    saveCachedSession(null, null);
    try {
      sessionStorage.removeItem('brainlink_dashboard_cache_v2');
    } catch (e) {}
    setCurrentUser(null);
    setUserProfile(null);
    setSimulatedRole(null);
    await signOut(auth);
  };

  const resetPassword = async (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  // Active role is either the simulated role (for testing) or actual assigned role
  const effectiveRole = simulatedRole || userProfile?.role || ROLES.GUEST;

  const value = {
    currentUser,
    userProfile,
    role: effectiveRole,
    actualRole: userProfile?.role,
    simulatedRole,
    setSimulatedRole,
    isSuperAdmin: effectiveRole === ROLES.SUPER_ADMIN,
    loading,
    login,
    loginWithGoogle,
    signup,
    logout,
    resetPassword,
    hasPermission: (permission) => hasPermission(effectiveRole, permission),
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
