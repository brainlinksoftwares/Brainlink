import { collection, addDoc, getDocs, query, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function logAudit({ user, action, entity, entityId = '', previousValue = '', newValue = '', details = '' }) {
  try {
    const userAgent = typeof window !== 'undefined' ? window.navigator.userAgent : '';
    await addDoc(collection(db, 'audit_logs'), {
      timestamp: serverTimestamp(),
      user: user || 'system',
      action,
      entity,
      entityId: String(entityId),
      previousValue: typeof previousValue === 'object' ? JSON.stringify(previousValue) : String(previousValue),
      newValue: typeof newValue === 'object' ? JSON.stringify(newValue) : String(newValue),
      details,
      userAgent: userAgent.slice(0, 150),
    });
  } catch (err) {
    console.warn('Audit log write error (non-fatal):', err);
  }
}

export async function getAuditLogs(maxCount = 100) {
  try {
    const q = query(collection(db, 'audit_logs'), orderBy('timestamp', 'desc'), limit(maxCount));
    const snap = await getDocs(q);
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  } catch (err) {
    console.error('Failed to get audit logs:', err);
    return [];
  }
}
