import {
  collection,
  doc,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { logAudit } from './auditService';
import { generateEntityId } from '../utils/formatters';

export const DOCUMENT_CATEGORIES = [
  'Contracts',
  'Proposals',
  'Quotations',
  'Invoices',
  'Receipts',
  'Client Documents',
  'Project Documents',
  'Internal Documents',
];

export async function getDocuments() {
  try {
    const coll = collection(db, 'documents');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getDocuments error:', err);
    return [];
  }
}

export async function createDocumentRecord(docData, userEmail) {
  try {
    const payload = {
      ...docData,
      docId: docData.docId || generateEntityId('DOC'),
      title: docData.title || 'Untitled Document',
      category: docData.category || 'Internal Documents',
      fileUrl: docData.fileUrl || '',
      fileSize: docData.fileSize || '1.2 MB',
      fileType: docData.fileType || 'PDF',
      version: docData.version || 'v1.0',
      isPublicToClient: Boolean(docData.isPublicToClient),
      tags: Array.isArray(docData.tags) ? docData.tags : (docData.tags ? [docData.tags] : []),
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      uploadedBy: userEmail || 'system',
    };

    const docRef = await addDoc(collection(db, 'documents'), payload);

    await logAudit({
      user: userEmail,
      action: 'Uploaded Document Record',
      entity: 'documents',
      entityId: docRef.id,
      newValue: `${payload.title} (${payload.category})`,
    });

    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createDocumentRecord error:', err);
    throw err;
  }
}

export async function updateDocumentRecord(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'documents', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    return { id, ...updates };
  } catch (err) {
    console.error('updateDocumentRecord error:', err);
    throw err;
  }
}

export async function deleteDocumentRecord(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'documents', id));
    await logAudit({
      user: userEmail,
      action: 'Deleted Document Record',
      entity: 'documents',
      entityId: id,
    });
  } catch (err) {
    console.error('deleteDocumentRecord error:', err);
    throw err;
  }
}
