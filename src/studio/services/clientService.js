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

export const ONBOARDING_STEPS = [
  { id: 'client_info', label: 'Client Information Verified', category: 'General' },
  { id: 'billing_info', label: 'Billing Address Confirmed', category: 'Finance' },
  { id: 'gst_pan', label: 'GSTIN & PAN Details Verified', category: 'Finance' },
  { id: 'master_agreement', label: 'Master Services Agreement (MSA) Signed', category: 'Legal' },
  { id: 'scope_confirmation', label: 'Project Scope & Deliverables Confirmed', category: 'Project' },
  { id: 'payment_terms', label: 'Payment Terms & Milestone Schedule Agreed', category: 'Finance' },
  { id: 'project_creation', label: 'Workspace & Project Setup Created', category: 'Project' },
  { id: 'team_assignment', label: 'Project Manager & Team Assigned', category: 'Team' },
  { id: 'doc_collection', label: 'Brand Assets & Access Credentials Collected', category: 'Operations' },
  { id: 'kickoff_meeting', label: 'Kickoff Meeting Conducted with Stakeholders', category: 'Client' },
];

export async function getClients() {
  try {
    const coll = collection(db, 'clients');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getClients error:', err);
    return [];
  }
}

export async function getClientById(id) {
  try {
    const docRef = doc(db, 'clients', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('getClientById error:', err);
    return null;
  }
}

export async function createClient(clientData, userEmail) {
  try {
    const initialChecklist = {};
    ONBOARDING_STEPS.forEach(step => {
      initialChecklist[step.id] = false;
    });

    const payload = {
      ...clientData,
      clientId: clientData.clientId || generateEntityId('CLI'),
      companyName: clientData.companyName || clientData.name || 'Unnamed Client',
      primaryContact: clientData.primaryContact || clientData.name || '',
      email: clientData.email || '',
      phone: clientData.phone || '',
      gstin: clientData.gstin || '',
      pan: clientData.pan || '',
      billingAddress: clientData.billingAddress || '',
      industry: clientData.industry || 'Technology',
      status: clientData.status || 'Active', // Active, Onboarding, Inactive, Archived
      onboardingProgress: 0,
      checklist: initialChecklist,
      totalRevenue: 0,
      outstandingAmount: 0,
      activeProjectsCount: 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };

    const docRef = await addDoc(collection(db, 'clients'), payload);

    await logAudit({
      user: userEmail,
      action: 'Created Client',
      entity: 'clients',
      entityId: docRef.id,
      newValue: payload.companyName,
    });

    await logActivity({
      type: 'Client',
      title: `Client Profile Created: ${payload.companyName}`,
      description: `New client added to Brainlink Studio system`,
      entityType: 'client',
      entityId: docRef.id,
      entityName: payload.companyName,
      userEmail,
    });

    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createClient error:', err);
    throw err;
  }
}

export async function convertDealToClient(deal, userEmail) {
  try {
    const newClient = await createClient(
      {
        companyName: deal.company || deal.name,
        primaryContact: deal.contactName || deal.name,
        email: deal.email || '',
        phone: deal.phone || '',
        dealId: deal.id,
        initialDealValue: deal.value || 0,
        status: 'Onboarding',
      },
      userEmail
    );

    createNotification({
      title: 'Client Onboarding Launched',
      message: `Onboarding checklist initialized for ${deal.company || deal.name}`,
      type: 'info',
      link: `/studio/clients/${newClient.id}`,
    });

    return newClient;
  } catch (err) {
    console.error('convertDealToClient error:', err);
    throw err;
  }
}

export async function updateClientChecklist(clientId, stepId, completed, userEmail) {
  try {
    const docRef = doc(db, 'clients', clientId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Client not found');

    const data = snap.data();
    const currentChecklist = data.checklist || {};
    const updatedChecklist = { ...currentChecklist, [stepId]: completed };

    const totalSteps = ONBOARDING_STEPS.length;
    const completedCount = ONBOARDING_STEPS.filter(s => updatedChecklist[s.id]).length;
    const onboardingProgress = Math.round((completedCount / totalSteps) * 100);

    const updates = {
      checklist: updatedChecklist,
      onboardingProgress,
      status: onboardingProgress === 100 ? 'Active' : data.status,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updates);

    await logAudit({
      user: userEmail,
      action: 'Updated Onboarding Step',
      entity: 'clients',
      entityId: clientId,
      newValue: `${stepId}: ${completed ? 'Done' : 'Pending'} (Progress: ${onboardingProgress}%)`,
    });

    return { ...data, ...updates };
  } catch (err) {
    console.error('updateClientChecklist error:', err);
    throw err;
  }
}

export async function updateClient(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'clients', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    await logAudit({
      user: userEmail,
      action: 'Updated Client Profile',
      entity: 'clients',
      entityId: id,
      newValue: JSON.stringify(updates),
    });
    return { id, ...updates };
  } catch (err) {
    console.error('updateClient error:', err);
    throw err;
  }
}

export async function deleteClient(id, userEmail) {
  try {
    // Soft delete / archive to preserve financial integrity
    const docRef = doc(db, 'clients', id);
    await updateDoc(docRef, {
      status: 'Archived',
      archivedAt: serverTimestamp(),
      archivedBy: userEmail,
    });
    await logAudit({
      user: userEmail,
      action: 'Archived Client',
      entity: 'clients',
      entityId: id,
    });
  } catch (err) {
    console.error('deleteClient error:', err);
    throw err;
  }
}
