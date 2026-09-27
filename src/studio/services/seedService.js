import { collection, addDoc, getDocs, deleteDoc, doc, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';
import { logAudit } from './auditService';

export async function seedStarterData(userEmail) {
  try {
    // 1. Create realistic sample leads
    const lead1 = await addDoc(collection(db, 'leads'), {
      leadId: 'LEAD-2026-1001',
      name: 'Rohan Sharma',
      company: 'Zenith Logistics Tech',
      email: 'rohan@zenithlogistics.in',
      phone: '+91 98200 12345',
      whatsapp: '+91 98200 12345',
      website: 'https://zenithlogistics.in',
      source: 'LinkedIn',
      industry: 'Logistics & Supply Chain',
      location: 'Mumbai, Maharashtra',
      requirement: 'Custom Fleet Tracking ERP & Driver Dispatch Portal',
      budget: 850000,
      assignedTo: 'Aaditya Vishnoi',
      leadScore: 85,
      status: 'Qualified',
      priority: 'High',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    const lead2 = await addDoc(collection(db, 'leads'), {
      leadId: 'LEAD-2026-1002',
      name: 'Pooja Iyer',
      company: 'Nova Health Systems',
      email: 'pooja.i@novahealth.co',
      phone: '+91 98450 67890',
      whatsapp: '+91 98450 67890',
      website: 'https://novahealth.co',
      source: 'Website',
      industry: 'Healthcare',
      location: 'Bengaluru, Karnataka',
      requirement: 'HIPAA & ABHA Compliant Patient Telemedicine Suite',
      budget: 1400000,
      assignedTo: 'Aaditya Vishnoi',
      leadScore: 92,
      status: 'Proposal Sent',
      priority: 'High',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    // 2. Create sample contacts
    await addDoc(collection(db, 'contacts'), {
      name: 'Rohan Sharma',
      email: 'rohan@zenithlogistics.in',
      phone: '+91 98200 12345',
      whatsapp: '+91 98200 12345',
      designation: 'CTO & Co-Founder',
      company: 'Zenith Logistics Tech',
      relationship: 'Key Decision Maker',
      notes: 'Prefers weekly sprint syncs on Tuesdays',
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    // 3. Create sample companies
    await addDoc(collection(db, 'companies'), {
      name: 'Nova Health Systems',
      website: 'https://novahealth.co',
      industry: 'Healthcare SaaS',
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      billingAddress: 'Indiranagar 100ft Road, Bengaluru, Karnataka 560038',
      primaryContact: 'Pooja Iyer',
      email: 'finance@novahealth.co',
      phone: '+91 98450 67890',
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    // 4. Create sample Deals
    await addDoc(collection(db, 'deals'), {
      dealId: 'DEAL-2026-001',
      name: 'Fleet Dispatch AI & Telemetry Engine',
      company: 'Zenith Logistics Tech',
      value: 850000,
      probability: 70,
      weightedValue: 595000,
      stage: 'Proposal',
      priority: 'High',
      expectedClose: '2026-10-15',
      owner: 'Aaditya Vishnoi',
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    const wonDeal = await addDoc(collection(db, 'deals'), {
      dealId: 'DEAL-2026-002',
      name: 'NextGen Telehealth Portal & Video Consultation',
      company: 'Nova Health Systems',
      value: 1400000,
      probability: 100,
      weightedValue: 1400000,
      stage: 'Won',
      priority: 'High',
      expectedClose: '2026-09-20',
      owner: 'Aaditya Vishnoi',
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    // 5. Create sample Client from Won deal
    const clientDoc = await addDoc(collection(db, 'clients'), {
      clientId: 'CLI-2026-0042',
      companyName: 'Nova Health Systems',
      primaryContact: 'Pooja Iyer',
      email: 'pooja.i@novahealth.co',
      phone: '+91 98450 67890',
      gstin: '29ABCDE1234F1Z5',
      pan: 'ABCDE1234F',
      billingAddress: '42 Tech Park, Bengaluru, Karnataka - 560038',
      industry: 'Healthcare',
      status: 'Active',
      onboardingProgress: 80,
      checklist: {
        client_info: true,
        billing_info: true,
        gst_pan: true,
        master_agreement: true,
        scope_confirmation: true,
        payment_terms: true,
        project_creation: true,
        team_assignment: true,
        doc_collection: false,
        kickoff_meeting: false,
      },
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    // 6. Create sample Project
    const projectDoc = await addDoc(collection(db, 'projects'), {
      projectId: 'PRJ-2026-001',
      name: 'Telemedicine Web & Mobile Suite',
      clientId: clientDoc.id,
      clientName: 'Nova Health Systems',
      description: 'End-to-end patient scheduling, WebRTC video consultation, prescription signing, and payment gateway integration.',
      budget: 1400000,
      status: 'Active',
      priority: 'High',
      progress: 65,
      startDate: '2026-09-01',
      deadline: '2026-11-30',
      projectManager: 'Aaditya Vishnoi',
      team: ['Aaditya Vishnoi', 'Senior Fullstack Engineer', 'UI/UX Lead'],
      isClosed: false,
      closureChecklist: {},
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    // 7. Create sample Milestones
    await addDoc(collection(db, 'milestones'), {
      projectId: projectDoc.id,
      name: 'Phase 1: Architecture & UI Design System',
      dueDate: '2026-09-15',
      status: 'Completed',
      completionPercentage: 100,
      paymentPercentage: 30,
      billingAmount: 420000,
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'milestones'), {
      projectId: projectDoc.id,
      name: 'Phase 2: Video Consultation & EHR Integration',
      dueDate: '2026-10-15',
      status: 'In Progress',
      completionPercentage: 50,
      paymentPercentage: 40,
      billingAmount: 560000,
      createdAt: serverTimestamp(),
    });

    // 8. Create sample Tasks
    await addDoc(collection(db, 'tasks'), {
      taskId: 'TSK-101',
      title: 'Setup WebRTC Video Signaling Server & Turn/Stun relays',
      projectId: projectDoc.id,
      assignedTo: 'Aaditya Vishnoi',
      status: 'In Progress',
      priority: 'High',
      estimatedHours: 40,
      actualHours: 24,
      startDate: '2026-09-20',
      dueDate: '2026-10-05',
      createdAt: serverTimestamp(),
    });

    await addDoc(collection(db, 'tasks'), {
      taskId: 'TSK-102',
      title: 'Design Doctors Consultation Prescription Pad in Canvas',
      projectId: projectDoc.id,
      assignedTo: 'UI/UX Lead',
      status: 'Review',
      priority: 'Medium',
      estimatedHours: 25,
      actualHours: 25,
      startDate: '2026-09-22',
      dueDate: '2026-09-28',
      createdAt: serverTimestamp(),
    });

    // 9. Create sample GST Invoice
    const invoiceDoc = await addDoc(collection(db, 'invoices'), {
      invoiceNumber: 'INV-2026-0042',
      invoiceDate: '2026-09-05',
      dueDate: '2026-09-20',
      clientId: clientDoc.id,
      clientName: 'Nova Health Systems',
      clientEmail: 'pooja.i@novahealth.co',
      clientCompany: 'Nova Health Systems Pvt Ltd',
      clientGstin: '29ABCDE1234F1Z5',
      billingAddress: '42 Tech Park, Bengaluru, Karnataka - 560038',
      taxType: 'inter', // IGST
      taxRate: 18,
      subtotal: 420000,
      discount: 0,
      taxableAmount: 420000,
      igst: 75600,
      cgst: 0,
      sgst: 0,
      totalTax: 75600,
      total: 495600,
      paidAmount: 495600,
      outstandingAmount: 0,
      status: 'Paid',
      items: [
        {
          description: 'Phase 1: Architecture Blueprint & Telemedicine UI Design System',
          hsn: '998314',
          quantity: 1,
          rate: 420000,
        },
      ],
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    // 10. Record Payment
    await addDoc(collection(db, 'payments'), {
      paymentId: 'PAY-2026-0031',
      invoiceId: invoiceDoc.id,
      invoiceNumber: 'INV-2026-0042',
      clientName: 'Nova Health Systems',
      amount: 495600,
      paymentDate: '2026-09-18',
      paymentMethod: 'Bank Transfer',
      transactionReference: 'NEFT/HDFC/987123982',
      notes: 'Milestone 1 full settlement cleared',
      createdAt: serverTimestamp(),
      recordedBy: userEmail || 'system',
    });

    // 11. Sample Expenses
    await addDoc(collection(db, 'expenses'), {
      expenseId: 'EXP-2026-001',
      category: 'Hosting',
      description: 'AWS Cloud Infrastructure & Dedicated TURN Server deployment',
      amount: 28500,
      date: '2026-09-10',
      vendor: 'Amazon Web Services',
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    await addDoc(collection(db, 'expenses'), {
      expenseId: 'EXP-2026-002',
      category: 'Software',
      description: 'Figma Organization Seats & GitHub Enterprise Licenses',
      amount: 14200,
      date: '2026-09-12',
      vendor: 'Figma & GitHub',
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    });

    // 12. Financial Ledger Transactions
    await addDoc(collection(db, 'transactions'), {
      timestamp: serverTimestamp(),
      type: 'INVOICE_CREATED',
      entity: 'invoices',
      entityId: invoiceDoc.id,
      reference: 'INV-2026-0042',
      amount: 495600,
      description: 'Invoice INV-2026-0042 created for Nova Health Systems',
      user: userEmail || 'system',
    });

    await addDoc(collection(db, 'transactions'), {
      timestamp: serverTimestamp(),
      type: 'PAYMENT_RECEIVED',
      entity: 'payments',
      reference: 'NEFT/HDFC/987123982',
      amount: 495600,
      description: 'Payment received: ₹4,95,600 via Bank Transfer (NEFT/HDFC/987123982)',
      user: userEmail || 'system',
    });

    await addDoc(collection(db, 'transactions'), {
      timestamp: serverTimestamp(),
      type: 'EXPENSE_ADDED',
      entity: 'expenses',
      reference: 'EXP-2026-001',
      amount: -28500,
      description: 'Hosting Expense: AWS Cloud Infrastructure & TURN Server',
      user: userEmail || 'system',
    });

    // Audit log
    await logAudit({
      user: userEmail,
      action: 'Seeded Starter Data',
      entity: 'system',
      entityId: 'seed',
      newValue: 'Populated starter leads, deals, projects, invoice & payments',
    });

    return true;
  } catch (err) {
    console.error('seedStarterData failed:', err);
    throw err;
  }
}
