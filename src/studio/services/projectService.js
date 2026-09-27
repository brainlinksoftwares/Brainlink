import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
  orderBy,
  serverTimestamp,
} from 'firebase/firestore';
import { db } from '../config/firebase';
import { logAudit } from './auditService';
import { createNotification } from './notificationService';
import { generateEntityId } from '../utils/formatters';
import { logActivity } from './crmService';

export const PROJECT_CLOSURE_STEPS = [
  { id: 'tasks_done', label: 'All assigned project tasks completed & verified' },
  { id: 'milestones_done', label: 'All phase milestones formally approved' },
  { id: 'client_signoff', label: 'Client formal UAT approval & signoff received' },
  { id: 'final_deliverables', label: 'All production deliverables & assets uploaded' },
  { id: 'final_invoice', label: 'Final invoice generated & reconciled' },
  { id: 'payments_cleared', label: 'Zero outstanding balance / 100% payments cleared' },
  { id: 'source_code', label: 'Production codebase & repositories transferred' },
  { id: 'credentials_transferred', label: 'All production credentials & API keys handed over' },
  { id: 'tech_docs', label: 'System architecture, API & user documentation handed over' },
  { id: 'warranty_defined', label: 'Support & warranty maintenance period scheduled' },
  { id: 'feedback_testimonial', label: 'Client CSAT feedback & testimonial requested' },
];

// --- PROJECTS ---
export async function getProjects() {
  try {
    const coll = collection(db, 'projects');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getProjects error:', err);
    return [];
  }
}

export async function getProjectById(id) {
  try {
    const docRef = doc(db, 'projects', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('getProjectById error:', err);
    return null;
  }
}

export async function createProject(projData, userEmail) {
  try {
    const initialClosure = {};
    PROJECT_CLOSURE_STEPS.forEach(s => {
      initialClosure[s.id] = false;
    });

    const payload = {
      ...projData,
      projectId: projData.projectId || generateEntityId('PRJ'),
      name: projData.name || 'New Project',
      clientName: projData.clientName || 'Standard Client',
      budget: Number(projData.budget) || 0,
      status: projData.status || 'Active', // Planning, Active, On Hold, At Risk, Delayed, Completed, Cancelled
      priority: projData.priority || 'Medium',
      progress: Number(projData.progress) || 0,
      team: Array.isArray(projData.team) ? projData.team : (projData.team ? [projData.team] : []),
      closureChecklist: initialClosure,
      isClosed: false,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };

    const docRef = await addDoc(collection(db, 'projects'), payload);

    await logAudit({
      user: userEmail,
      action: 'Created Project',
      entity: 'projects',
      entityId: docRef.id,
      newValue: `${payload.name} (Budget: ₹${payload.budget})`,
    });

    await logActivity({
      type: 'Project',
      title: `Created Project: ${payload.name}`,
      description: `Project launched for ${payload.clientName}`,
      entityType: 'project',
      entityId: docRef.id,
      entityName: payload.name,
      userEmail,
    });

    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createProject error:', err);
    throw err;
  }
}

export async function updateProject(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'projects', id);
    const prevSnap = await getDoc(docRef);
    const prevData = prevSnap.data() || {};

    const payload = {
      ...updates,
      updatedAt: serverTimestamp(),
    };
    await updateDoc(docRef, payload);

    await logAudit({
      user: userEmail,
      action: 'Updated Project',
      entity: 'projects',
      entityId: id,
      newValue: JSON.stringify(updates),
    });

    return { id, ...prevData, ...payload };
  } catch (err) {
    console.error('updateProject error:', err);
    throw err;
  }
}

export async function updateProjectClosureStep(projectId, stepId, isCompleted, userEmail) {
  try {
    const docRef = doc(db, 'projects', projectId);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Project not found');

    const project = snap.data();
    const checklist = project.closureChecklist || {};
    const updatedChecklist = { ...checklist, [stepId]: isCompleted };

    const allStepsCompleted = PROJECT_CLOSURE_STEPS.every(s => updatedChecklist[s.id]);

    const updates = {
      closureChecklist: updatedChecklist,
      isClosed: allStepsCompleted,
      status: allStepsCompleted ? 'Completed' : project.status,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, updates);

    await logAudit({
      user: userEmail,
      action: 'Updated Project Closure Step',
      entity: 'projects',
      entityId: projectId,
      newValue: `${stepId}: ${isCompleted ? 'Done' : 'Pending'} (Closed: ${allStepsCompleted})`,
    });

    if (allStepsCompleted) {
      createNotification({
        title: 'Project Closed & Archived',
        message: `Project "${project.name}" has fulfilled all 11 closure requirements and is officially marked Closed!`,
        type: 'success',
        link: `/studio/projects/${projectId}`,
      });
    }

    return { id: projectId, ...project, ...updates };
  } catch (err) {
    console.error('updateProjectClosureStep error:', err);
    throw err;
  }
}

export async function deleteProject(id, userEmail) {
  try {
    const docRef = doc(db, 'projects', id);
    await updateDoc(docRef, { status: 'Cancelled', cancelledAt: serverTimestamp() });
    await logAudit({
      user: userEmail,
      action: 'Cancelled Project',
      entity: 'projects',
      entityId: id,
    });
  } catch (err) {
    console.error('deleteProject error:', err);
    throw err;
  }
}

// --- MILESTONES ---
export async function getMilestones(projectId = null) {
  try {
    const coll = collection(db, 'milestones');
    const q = projectId
      ? query(coll, where('projectId', '==', projectId))
      : query(coll, orderBy('dueDate', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getMilestones error:', err);
    return [];
  }
}

export async function createMilestone(mileData, userEmail) {
  try {
    const payload = {
      ...mileData,
      status: mileData.status || 'Pending', // Pending, In Progress, Completed
      completionPercentage: Number(mileData.completionPercentage) || 0,
      paymentPercentage: Number(mileData.paymentPercentage) || 0,
      billingAmount: Number(mileData.billingAmount) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };
    const docRef = await addDoc(collection(db, 'milestones'), payload);
    await logAudit({
      user: userEmail,
      action: 'Created Milestone',
      entity: 'milestones',
      entityId: docRef.id,
      newValue: `${payload.name} (${payload.paymentPercentage}% billing)`,
    });
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createMilestone error:', err);
    throw err;
  }
}

export async function updateMilestone(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'milestones', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    return { id, ...updates };
  } catch (err) {
    console.error('updateMilestone error:', err);
    throw err;
  }
}

export async function deleteMilestone(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'milestones', id));
  } catch (err) {
    console.error('deleteMilestone error:', err);
    throw err;
  }
}

// --- TASKS ---
export async function getTasks(projectId = null) {
  try {
    const coll = collection(db, 'tasks');
    const q = projectId
      ? query(coll, where('projectId', '==', projectId))
      : query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getTasks error:', err);
    return [];
  }
}

export async function createTask(taskData, userEmail) {
  try {
    const payload = {
      ...taskData,
      taskId: taskData.taskId || generateEntityId('TSK'),
      status: taskData.status || 'Todo', // Todo, In Progress, Review, Blocked, Completed
      priority: taskData.priority || 'Medium',
      estimatedHours: Number(taskData.estimatedHours) || 0,
      actualHours: Number(taskData.actualHours) || 0,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };
    const docRef = await addDoc(collection(db, 'tasks'), payload);
    await logAudit({
      user: userEmail,
      action: 'Created Task',
      entity: 'tasks',
      entityId: docRef.id,
      newValue: payload.title,
    });
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createTask error:', err);
    throw err;
  }
}

export async function updateTask(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'tasks', id);
    await updateDoc(docRef, { ...updates, updatedAt: serverTimestamp() });
    return { id, ...updates };
  } catch (err) {
    console.error('updateTask error:', err);
    throw err;
  }
}

export async function deleteTask(id, userEmail) {
  try {
    await deleteDoc(doc(db, 'tasks', id));
  } catch (err) {
    console.error('deleteTask error:', err);
    throw err;
  }
}

// --- TIME TRACKING ---
export async function getTimeEntries(projectId = null) {
  try {
    const coll = collection(db, 'time_entries');
    const q = projectId
      ? query(coll, where('projectId', '==', projectId))
      : query(coll, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getTimeEntries error:', err);
    return [];
  }
}

export async function addTimeEntry(entryData, userEmail) {
  try {
    const payload = {
      ...entryData,
      hours: Number(entryData.hours) || 0,
      user: userEmail || 'system',
      createdAt: serverTimestamp(),
    };
    const docRef = await addDoc(collection(db, 'time_entries'), payload);
    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('addTimeEntry error:', err);
    throw err;
  }
}
