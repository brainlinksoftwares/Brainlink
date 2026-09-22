import { initializeApp, getApps, FirebaseApp } from 'firebase/app';
import { getAuth, Auth, GoogleAuthProvider } from 'firebase/auth';
import { getFirestore, Firestore } from 'firebase/firestore';
import { getAnalytics, isSupported, Analytics } from 'firebase/analytics';

// Support both REACT_APP_ (Create React App) and VITE_ (Vite) env naming conventions
const firebaseConfig = {
  apiKey:
    process.env.REACT_APP_FIREBASE_API_KEY ||
    (typeof process !== 'undefined' && process.env.VITE_FIREBASE_API_KEY) ||
    'AIzaSyA42rWcSnG2mUokdGOKTRVz0O5K62DSaAQ',
  authDomain:
    process.env.REACT_APP_FIREBASE_AUTH_DOMAIN ||
    (typeof process !== 'undefined' && process.env.VITE_FIREBASE_AUTH_DOMAIN) ||
    'brainlinksoftwares.firebaseapp.com',
  projectId:
    process.env.REACT_APP_FIREBASE_PROJECT_ID ||
    (typeof process !== 'undefined' && process.env.VITE_FIREBASE_PROJECT_ID) ||
    'brainlinksoftwares',
  storageBucket:
    process.env.REACT_APP_FIREBASE_STORAGE_BUCKET ||
    (typeof process !== 'undefined' && process.env.VITE_FIREBASE_STORAGE_BUCKET) ||
    'brainlinksoftwares.firebasestorage.app',
  messagingSenderId:
    process.env.REACT_APP_FIREBASE_MESSAGING_SENDER_ID ||
    (typeof process !== 'undefined' && process.env.VITE_FIREBASE_MESSAGING_SENDER_ID) ||
    '595517739090',
  appId:
    process.env.REACT_APP_FIREBASE_APP_ID ||
    (typeof process !== 'undefined' && process.env.VITE_FIREBASE_APP_ID) ||
    '1:595517739090:web:4579d915f2c5dfcf950f8b',
  measurementId:
    process.env.REACT_APP_FIREBASE_MEASUREMENT_ID ||
    (typeof process !== 'undefined' && process.env.VITE_FIREBASE_MEASUREMENT_ID) ||
    'G-BS6RR7WKZS',
};

export const isFirebaseConfigured = Boolean(
  firebaseConfig.apiKey &&
  firebaseConfig.apiKey !== 'your_api_key_here' &&
  firebaseConfig.projectId
);

let app: FirebaseApp | null = null;
let auth: Auth | null = null;
let db: Firestore | null = null;
let analytics: Analytics | null = null;
let googleProvider: GoogleAuthProvider | null = null;

if (isFirebaseConfigured) {
  try {
    app = getApps().length > 0 ? getApps()[0] : initializeApp(firebaseConfig);
    auth = getAuth(app);
    db = getFirestore(app);
    googleProvider = new GoogleAuthProvider();

    if (typeof window !== 'undefined') {
      isSupported().then((supported) => {
        if (supported && app) {
          analytics = getAnalytics(app);
        }
      });
    }
  } catch (err) {
    console.warn('Firebase initialization notice:', err);
  }
}

export { app, auth, db, analytics, googleProvider, firebaseConfig };
