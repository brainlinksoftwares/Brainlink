import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { logAudit } from './auditService';
import { createNotification } from './notificationService';
import { generateEntityId } from '../utils/formatters';

// --- LEADS ---
export async function getLeads() {
  try {
    const coll = collection(db, 'leads');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getLeads error:', err);
    return [];
  }
}

export async function createLead(leadData, userEmail) {
  try {
    const customId = leadData.leadId || generateEntityId('LEAD');
    const payload = {
      ...leadData,
      leadId: customId,
      status: leadData.status || 'New',
      priority: leadData.priority || 'Medium',
      leadScore: Number(leadData.leadScore) || 50,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };

    const docRef = await addDoc(collection(db, 'leads'), payload);

    await logAudit({
      user: userEmail,
      action: 'Created Lead',
      entity: 'leads',
      entityId: docRef.id,
      newValue: `${payload.name} (${payload.company || 'No Company'})`,
    });

    if (payload.assignedTo) {
      createNotification({
        recipientId: payload.assignedTo,
        title: 'New Lead Assigned',
        message: `Lead ${payload.name} has been assigned to you.`,
        type: 'info',
        link: '/studio/crm/leads',
      });
    }

    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createLead error:', err);
    throw err;
  }
}

export async function updateLead(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'leads', id);
    const prevSnap = await getDoc(docRef);
    const prevData = prevSnap.data() || {};

    const payload = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, payload);

    await logAudit({
      user: userEmail,
      action: 'Updated Lead',
      entity: 'leads',
      entityId: id,
      previousValue: prevData.status || '',
      newValue: updates.status || 'Updated',
    });

    return { id, ...prevData, ...payload };
  } catch (err) {
    console.error('updateLead error:', err);
    throw err;
  }
}

export async function deleteLead(id, userEmail) {
  try {
    const docRef = doc(db, 'leads', id);
    const snap = await getDoc(docRef);
    await deleteDoc(docRef);

    await logAudit({
      user: userEmail,
      action: 'Deleted Lead',
      entity: 'leads',
      entityId: id,
      previousValue: snap.exists() ? snap.data().name : '',
    });
  } catch (err) {
    console.error('deleteLead error:', err);
    throw err;
  }
}

// --- CONTACTS ---
export async function getContacts() {
  try {
    const coll = collection(db, 'contacts');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getContacts error:', err);
    return [];
  }
}

export async function createContact(contactData, userEmail) {
  try {
    const payload = {
      ...contactData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };
    const docRef = await addDoc(collection(db, 'contacts'), payload);
    await logAudit({
      user: userEmail,
      action: 'Created Contact',
      entity: 'contacts',
      entityId: docRef.id,
      newValue: payload.name,
    });
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createContact error:', err);
    throw err;
  }
}

export async function updateContact(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'contacts', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    await logAudit({
      user: userEmail,
      action: 'Updated Contact',
      entity: 'contacts',
      entityId: id,
      newValue: JSON.stringify(updates),
    });
  } catch (err) {
    console.error('updateContact error:', err);
    throw err;
  }
}

export async function deleteContact(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'contacts', id));
    await logAudit({
      user: userEmail,
      action: 'Deleted Contact',
      entity: 'contacts',
      entityId: id,
    });
  } catch (err) {
    console.error('deleteContact error:', err);
    throw err;
  }
}

// --- COMPANIES ---
export async function getCompanies() {
  try {
    const coll = collection(db, 'companies');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getCompanies error:', err);
    return [];
  }
}

export async function createCompany(companyData, userEmail) {
  try {
    const payload = {
      ...companyData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };
    const docRef = await addDoc(collection(db, 'companies'), payload);
    await logAudit({
      user: userEmail,
      action: 'Created Company',
      entity: 'companies',
      entityId: docRef.id,
      newValue: payload.name,
    });
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createCompany error:', err);
    throw err;
  }
}

export async function updateCompany(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'companies', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    await logAudit({
      user: userEmail,
      action: 'Updated Company',
      entity: 'companies',
      entityId: id,
      newValue: JSON.stringify(updates),
    });
  } catch (err) {
    console.error('updateCompany error:', err);
    throw err;
  }
}

export async function deleteCompany(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'companies', id));
    await logAudit({
      user: userEmail,
      action: 'Deleted Company',
      entity: 'companies',
      entityId: id,
    });
  } catch (err) {
    console.error('deleteCompany error:', err);
    throw err;
  }
}

// --- ACTIVITIES & FOLLOW-UPS ---
export async function getActivities(maxCount = 50) {
  try {
    const coll = collection(db, 'activities');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.slice(0, maxCount).map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getActivities error:', err);
    return [];
  }
}

export async function logActivity({ type, title, description, entityType, entityId, entityName, userEmail }) {
  try {
    const payload = {
      type: type || 'Note', // Call, Meeting, Email, Note, Task, StatusChange
      title,
      description: description || '',
      entityType: entityType || 'general',
      entityId: entityId || '',
      entityName: entityName || '',
      user: userEmail || 'system',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'activities'), payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.warn('logActivity write error:', err);
  }
}
