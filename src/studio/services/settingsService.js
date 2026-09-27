import { doc, getDoc, setDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logAudit } from './auditService';

export const DEFAULT_COMPANY_SETTINGS = {
  companyName: 'Brainlink Softwares',
  tagline: 'Modern Digital Engineering & AI Solutions',
  website: 'https://brainlink.in',
  studioDomain: 'studio.brainlink.in',
  primaryEmail: 'vishnoiaaditya29@gmail.com',
  financeEmail: 'ceo.brainlink@gmail.com',
  phone: '+91 98765 43210',
  address: 'Brainlink Softwares HQ, Tech Park, India',
  gstin: '07AAAAA0000A1Z5',
  pan: 'ABCDE1234F',
  bankName: 'HDFC Bank Ltd',
  accountNumber: '50200012345678',
  ifscCode: 'HDFC0001234',
  upiId: 'brainlink@upi',
  currency: 'INR',
  currencySymbol: '₹',
  defaultGstRate: 18,
  invoicePrefix: 'INV',
  quotationPrefix: 'QUOT',
  proposalPrefix: 'PROP',
  invoiceTerms: 'Payment due within 15 days of invoice issue date. Late fees of 1.5% per month applicable on unpaid balances.',
  updatedAt: null,
};

export async function getCompanySettings() {
  try {
    const docRef = doc(db, 'settings', 'company_profile');
    const snap = await getDoc(docRef);
    if (snap.exists()) {
      return { ...DEFAULT_COMPANY_SETTINGS, ...snap.data() };
    }
    return DEFAULT_COMPANY_SETTINGS;
  } catch (err) {
    console.warn('Could not load company settings from Firestore, using defaults:', err);
    return DEFAULT_COMPANY_SETTINGS;
  }
}

export async function saveCompanySettings(newSettings, userEmail) {
  try {
    const docRef = doc(db, 'settings', 'company_profile');
    const payload = {
      ...newSettings,
      updatedAt: serverTimestamp(),
      updatedBy: userEmail || 'system',
    };
    await setDoc(docRef, payload, { merge: true });
    logAudit({
      user: userEmail,
      action: 'Updated Company Settings',
      entity: 'settings',
      entityId: 'company_profile',
      newValue: JSON.stringify(newSettings),
    });
    return payload;
  } catch (err) {
    console.error('Failed to save company settings:', err);
    throw err;
  }
}
