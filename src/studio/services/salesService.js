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
import { logActivity } from './crmService';

export const PIPELINE_STAGES = [
  { id: 'New Lead', name: 'New Lead', defaultProbability: 10, color: 'border-slate-400' },
  { id: 'Contacted', name: 'Contacted', defaultProbability: 25, color: 'border-blue-400' },
  { id: 'Qualified', name: 'Qualified', defaultProbability: 40, color: 'border-cyan-400' },
  { id: 'Meeting', name: 'Meeting Scheduled', defaultProbability: 50, color: 'border-indigo-400' },
  { id: 'Proposal', name: 'Proposal Sent', defaultProbability: 70, color: 'border-purple-400' },
  { id: 'Negotiation', name: 'Negotiation', defaultProbability: 85, color: 'border-amber-400' },
  { id: 'Won', name: 'Deal Won', defaultProbability: 100, color: 'border-emerald-500' },
  { id: 'Lost', name: 'Closed Lost', defaultProbability: 0, color: 'border-rose-400' },
];

// --- DEALS ---
export async function getDeals() {
  try {
    const coll = collection(db, 'deals');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getDeals error:', err);
    return [];
  }
}

export async function createDeal(dealData, userEmail) {
  try {
    const value = Number(dealData.value) || 0;
    const probability = dealData.probability !== undefined ? Number(dealData.probability) : 50;
    const weightedValue = Math.round((value * probability) / 100);

    const payload = {
      ...dealData,
      dealId: dealData.dealId || generateEntityId('DEAL'),
      value,
      probability,
      weightedValue,
      stage: dealData.stage || 'New Lead',
      priority: dealData.priority || 'Medium',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };

    const docRef = await addDoc(collection(db, 'deals'), payload);

    await logAudit({
      user: userEmail,
      action: 'Created Deal',
      entity: 'deals',
      entityId: docRef.id,
      newValue: `${payload.name} (₹${value})`,
    });

    await logActivity({
      type: 'Deal',
      title: `Created deal: ${payload.name}`,
      description: `Value: ₹${value} | Stage: ${payload.stage}`,
      entityType: 'deal',
      entityId: docRef.id,
      entityName: payload.name,
      userEmail,
    });

    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createDeal error:', err);
    throw err;
  }
}

export async function updateDealStage(id, newStage, userEmail) {
  try {
    const docRef = doc(db, 'deals', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Deal not found');

    const deal = snap.data();
    const stageObj = PIPELINE_STAGES.find(s => s.id === newStage) || { defaultProbability: deal.probability };
    const probability = stageObj.defaultProbability !== undefined ? stageObj.defaultProbability : deal.probability;
    const weightedValue = Math.round(((deal.value || 0) * probability) / 100);

    const updates = {
      stage: newStage,
      probability,
      weightedValue,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updates);

    await logAudit({
      user: userEmail,
      action: 'Updated Deal Stage',
      entity: 'deals',
      entityId: id,
      previousValue: deal.stage,
      newValue: newStage,
    });

    await logActivity({
      type: 'StatusChange',
      title: `Deal moved to ${newStage}`,
      description: `Deal "${deal.name}" shifted from ${deal.stage} to ${newStage}`,
      entityType: 'deal',
      entityId: id,
      entityName: deal.name,
      userEmail,
    });

    if (newStage === 'Won') {
      createNotification({
        title: '🎉 Deal Won!',
        message: `Deal "${deal.name}" for ₹${deal.value || 0} has been marked WON! Ready for client onboarding.`,
        type: 'success',
        link: '/studio/clients/onboarding',
      });
    }

    return { id, ...deal, ...updates };
  } catch (err) {
    console.error('updateDealStage error:', err);
    throw err;
  }
}

export async function updateDeal(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'deals', id);
    const prevSnap = await getDoc(docRef);
    const prevData = prevSnap.data() || {};

    const value = updates.value !== undefined ? Number(updates.value) : prevData.value;
    const probability = updates.probability !== undefined ? Number(updates.probability) : prevData.probability;
    const weightedValue = Math.round(((value || 0) * (probability || 0)) / 100);

    const payload = {
      ...updates,
      value,
      probability,
      weightedValue,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, payload);

    await logAudit({
      user: userEmail,
      action: 'Updated Deal',
      entity: 'deals',
      entityId: id,
      newValue: JSON.stringify(updates),
    });

    return { id, ...prevData, ...payload };
  } catch (err) {
    console.error('updateDeal error:', err);
    throw err;
  }
}

export async function deleteDeal(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'deals', id));
    await logAudit({
      user: userEmail,
      action: 'Deleted Deal',
      entity: 'deals',
      entityId: id,
    });
  } catch (err) {
    console.error('deleteDeal error:', err);
    throw err;
  }
}

// --- MEETINGS ---
export async function getMeetings() {
  try {
    const coll = collection(db, 'meetings');
    const q = query(coll, orderBy('date', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getMeetings error:', err);
    return [];
  }
}

export async function createMeeting(meetingData, userEmail) {
  try {
    const payload = {
      ...meetingData,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };
    const docRef = await addDoc(collection(db, 'meetings'), payload);
    await logAudit({
      user: userEmail,
      action: 'Scheduled Meeting',
      entity: 'meetings',
      entityId: docRef.id,
      newValue: `${payload.title} on ${payload.date}`,
    });
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createMeeting error:', err);
    throw err;
  }
}

export async function updateMeeting(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'meetings', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    return { id, ...updates };
  } catch (err) {
    console.error('updateMeeting error:', err);
    throw err;
  }
}

export async function deleteMeeting(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'meetings', id));
  } catch (err) {
    console.error('deleteMeeting error:', err);
    throw err;
  }
}

// --- PROPOSALS ---
export async function getProposals() {
  try {
    const coll = collection(db, 'proposals');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getProposals error:', err);
    return [];
  }
}

export async function createProposal(propData, userEmail) {
  try {
    const proposalNumber = propData.proposalNumber || generateEntityId('PROP');
    const payload = {
      ...propData,
      proposalNumber,
      status: propData.status || 'Draft', // Draft, Sent, Viewed, Accepted, Rejected, Expired
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };
    const docRef = await addDoc(collection(db, 'proposals'), payload);
    await logAudit({
      user: userEmail,
      action: 'Created Proposal',
      entity: 'proposals',
      entityId: docRef.id,
      newValue: `${proposalNumber} - ${payload.title}`,
    });
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createProposal error:', err);
    throw err;
  }
}

export async function updateProposal(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'proposals', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    await logAudit({
      user: userEmail,
      action: 'Updated Proposal',
      entity: 'proposals',
      entityId: id,
      newValue: updates.status || 'Updated',
    });
    return { id, ...updates };
  } catch (err) {
    console.error('updateProposal error:', err);
    throw err;
  }
}

export async function deleteProposal(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'proposals', id));
  } catch (err) {
    console.error('deleteProposal error:', err);
    throw err;
  }
}

// --- QUOTATIONS ---
export async function getQuotations() {
  try {
    const coll = collection(db, 'quotations');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getQuotations error:', err);
    return [];
  }
}

export async function createQuotation(quotData, userEmail) {
  try {
    const quotationNumber = quotData.quotationNumber || generateEntityId('QUOT');
    const subtotal = Number(quotData.subtotal) || 0;
    const discount = Number(quotData.discount) || 0;
    const tax = Number(quotData.tax) || 0;
    const total = subtotal - discount + tax;

    const payload = {
      ...quotData,
      quotationNumber,
      subtotal,
      discount,
      tax,
      total,
      status: quotData.status || 'Draft',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };
    const docRef = await addDoc(collection(db, 'quotations'), payload);
    await logAudit({
      user: userEmail,
      action: 'Created Quotation',
      entity: 'quotations',
      entityId: docRef.id,
      newValue: `${quotationNumber} - ₹${total}`,
    });
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createQuotation error:', err);
    throw err;
  }
}

export async function updateQuotation(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'quotations', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    return { id, ...updates };
  } catch (err) {
    console.error('updateQuotation error:', err);
    throw err;
  }
}

export async function deleteQuotation(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'quotations', id));
  } catch (err) {
    console.error('deleteQuotation error:', err);
    throw err;
  }
}
