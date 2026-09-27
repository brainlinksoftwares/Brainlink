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

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [userProfile, setUserProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [simulatedRole, setSimulatedRole] = useState(null); // Allows Super Admin to preview other roles

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const userDocSnap = await getDoc(userDocRef);

          let profileData = null;
          const isSuper = isUserSuperAdmin(firebaseUser.email);

          if (!userDocSnap.exists()) {
            // Provision user in Firestore
            profileData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email,
              displayName: firebaseUser.displayName || firebaseUser.email.split('@')[0],
              photoURL: firebaseUser.photoURL || '',
              role: isSuper ? ROLES.SUPER_ADMIN : ROLES.SALES_EXECUTIVE,
              permissions: isSuper ? ALL_PERMISSIONS : DEFAULT_ROLE_PERMISSIONS[ROLES.SALES_EXECUTIVE],
              status: 'active',
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

            // If user's email is in Super Admin list, make sure they have SUPER_ADMIN role
            if (isSuper && profileData.role !== ROLES.SUPER_ADMIN) {
              profileData.role = ROLES.SUPER_ADMIN;
              profileData.permissions = ALL_PERMISSIONS;
              await updateDoc(userDocRef, {
                role: ROLES.SUPER_ADMIN,
                permissions: ALL_PERMISSIONS,
                lastLoginAt: serverTimestamp(),
              });
            } else {
              await updateDoc(userDocRef, {
                lastLoginAt: serverTimestamp(),
              }).catch(() => {});
            }
          }

          setCurrentUser(firebaseUser);
          setUserProfile(profileData);
        } catch (error) {
          console.error('Error fetching user profile from Firestore:', error);
          // Fallback minimal profile if Firestore read is initially restricted
          const isSuper = isUserSuperAdmin(firebaseUser.email);
          setCurrentUser(firebaseUser);
          setUserProfile({
            uid: firebaseUser.uid,
            email: firebaseUser.email,
            displayName: firebaseUser.displayName || firebaseUser.email,
            role: isSuper ? ROLES.SUPER_ADMIN : ROLES.SALES_EXECUTIVE,
            permissions: isSuper ? ALL_PERMISSIONS : DEFAULT_ROLE_PERMISSIONS[ROLES.SALES_EXECUTIVE],
            status: 'active',
          });
        }
      } else {
        setCurrentUser(null);
        setUserProfile(null);
        setSimulatedRole(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email, password) => {
    const cred = await signInWithEmailAndPassword(auth, email, password);
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
    logAudit({
      user: cred.user.email,
      action: 'User Login Google',
      entity: 'auth',
      entityId: cred.user.uid,
      newValue: 'Successful Google Sign-In',
    });
    return cred.user;
  };

  const register = async (email, password, displayName, role = ROLES.SALES_EXECUTIVE) => {
    const cred = await createUserWithEmailAndPassword(auth, email, password);
    if (displayName) {
      await updateProfile(cred.user, { displayName });
    }
    const isSuper = isUserSuperAdmin(email);
    const assignedRole = isSuper ? ROLES.SUPER_ADMIN : role;
    const permissions = assignedRole === ROLES.SUPER_ADMIN ? ALL_PERMISSIONS : (DEFAULT_ROLE_PERMISSIONS[assignedRole] || []);

    const profileData = {
      uid: cred.user.uid,
      email: cred.user.email,
      displayName: displayName || email.split('@')[0],
      photoURL: '',
      role: assignedRole,
      permissions,
      status: 'active',
      createdAt: serverTimestamp(),
      lastLoginAt: serverTimestamp(),
    };
    await setDoc(doc(db, 'users', cred.user.uid), profileData);
    setUserProfile(profileData);
    return cred.user;
  };

  const logout = async () => {
    if (currentUser) {
      logAudit({
        user: currentUser.email,
        action: 'User Logout',
        entity: 'auth',
        entityId: currentUser.uid,
        newValue: 'Logged out',
      });
    }
    return signOut(auth);
  };

  const resetPassword = (email) => {
    return sendPasswordResetEmail(auth, email);
  };

  const effectiveRole = simulatedRole || userProfile?.role || ROLES.CLIENT;
  const isSuperAdmin = userProfile?.role === ROLES.SUPER_ADMIN || isUserSuperAdmin(currentUser?.email);

  const checkPermission = (perm) => {
    return hasPermission(effectiveRole, userProfile?.permissions, perm);
  };

  const value = {
    currentUser,
    userProfile,
    role: effectiveRole,
    realRole: userProfile?.role,
    isSuperAdmin,
    loading,
    simulatedRole,
    setSimulatedRole,
    login,
    loginWithGoogle,
    register,
    logout,
    resetPassword,
    hasPermission: checkPermission,
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
