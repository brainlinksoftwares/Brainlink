import {
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
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

// --- INVOICES ---
export async function getInvoices() {
  try {
    const coll = collection(db, 'invoices');
    const q = query(coll, orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getInvoices error:', err);
    return [];
  }
}

export async function getInvoiceById(id) {
  try {
    const docRef = doc(db, 'invoices', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
  } catch (err) {
    console.error('getInvoiceById error:', err);
    return null;
  }
}

// Calculate Indian GST invoice values accurately
export function calculateInvoiceTotals(items = [], discount = 0, taxType = 'intra', taxRate = 18) {
  const subtotal = items.reduce((acc, it) => acc + (Number(it.quantity) || 0) * (Number(it.rate) || 0), 0);
  const discountAmount = Number(discount) || 0;
  const taxableAmount = Math.max(0, subtotal - discountAmount);

  let cgst = 0;
  let sgst = 0;
  let igst = 0;

  if (taxType === 'intra') {
    const halfRate = (Number(taxRate) || 18) / 2;
    cgst = Math.round((taxableAmount * halfRate) / 100);
    sgst = Math.round((taxableAmount * halfRate) / 100);
  } else if (taxType === 'inter') {
    igst = Math.round((taxableAmount * (Number(taxRate) || 18)) / 100);
  }

  const totalTax = cgst + sgst + igst;
  const total = taxableAmount + totalTax;

  return {
    subtotal,
    discount: discountAmount,
    taxableAmount,
    taxType,
    taxRate: Number(taxRate) || 18,
    cgst,
    sgst,
    igst,
    totalTax,
    total,
  };
}

export async function createInvoice(invoiceData, userEmail) {
  try {
    const calc = calculateInvoiceTotals(
      invoiceData.items || [],
      invoiceData.discount || 0,
      invoiceData.taxType || 'intra',
      invoiceData.taxRate || 18
    );

    const invoiceNumber = invoiceData.invoiceNumber || generateEntityId('INV');
    const total = calc.total;
    const paidAmount = 0;
    const outstandingAmount = total;

    const payload = {
      ...invoiceData,
      invoiceNumber,
      items: invoiceData.items || [],
      ...calc,
      paidAmount,
      outstandingAmount,
      status: invoiceData.status || 'Sent', // Draft, Sent, Partially Paid, Paid, Overdue, Cancelled
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };

    const docRef = await addDoc(collection(db, 'invoices'), payload);

    await logAudit({
      user: userEmail,
      action: 'Created Invoice',
      entity: 'invoices',
      entityId: docRef.id,
      newValue: `${invoiceNumber} - Total: ₹${total} (Client: ${invoiceData.clientName || 'N/A'})`,
    });

    // Append to Transaction Ledger
    await recordTransaction({
      type: 'INVOICE_CREATED',
      entity: 'invoices',
      entityId: docRef.id,
      reference: invoiceNumber,
      amount: total,
      description: `Invoice ${invoiceNumber} created for ${invoiceData.clientName || 'Client'}`,
      userEmail,
    });

    await logActivity({
      type: 'Invoice',
      title: `Invoice Generated: ${invoiceNumber}`,
      description: `Amount: ₹${total} | Due Date: ${invoiceData.dueDate || 'N/A'}`,
      entityType: 'invoice',
      entityId: docRef.id,
      entityName: invoiceNumber,
      userEmail,
    });

    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createInvoice error:', err);
    throw err;
  }
}

export async function updateInvoice(id, updates, userEmail) {
  try {
    const docRef = doc(db, 'invoices', id);
    const prevSnap = await getDoc(docRef);
    const prevData = prevSnap.data() || {};

    let calc = {};
    if (updates.items || updates.discount !== undefined || updates.taxType || updates.taxRate) {
      calc = calculateInvoiceTotals(
        updates.items || prevData.items || [],
        updates.discount !== undefined ? updates.discount : prevData.discount,
        updates.taxType || prevData.taxType || 'intra',
        updates.taxRate || prevData.taxRate || 18
      );
    }

    const paidAmount = updates.paidAmount !== undefined ? Number(updates.paidAmount) : (prevData.paidAmount || 0);
    const total = calc.total !== undefined ? calc.total : prevData.total;
    const outstandingAmount = Math.max(0, total - paidAmount);

    let status = updates.status || prevData.status;
    if (paidAmount >= total && total > 0) {
      status = 'Paid';
    } else if (paidAmount > 0 && paidAmount < total) {
      status = 'Partially Paid';
    }

    const payload = {
      ...updates,
      ...calc,
      total,
      paidAmount,
      outstandingAmount,
      status,
      updatedAt: serverTimestamp(),
    };

    await updateDoc(docRef, payload);

    await logAudit({
      user: userEmail,
      action: 'Updated Invoice',
      entity: 'invoices',
      entityId: id,
      newValue: `Status: ${status}, Outstanding: ₹${outstandingAmount}`,
    });

    return { id, ...prevData, ...payload };
  } catch (err) {
    console.error('updateInvoice error:', err);
    throw err;
  }
}

export async function cancelInvoice(id, reason, userEmail) {
  try {
    const docRef = doc(db, 'invoices', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) throw new Error('Invoice not found');
    const data = snap.data();

    await updateDoc(docRef, {
      status: 'Cancelled',
      cancelReason: reason || 'Cancelled by admin',
      cancelledAt: serverTimestamp(),
      cancelledBy: userEmail,
    });

    await logAudit({
      user: userEmail,
      action: 'Cancelled Invoice',
      entity: 'invoices',
      entityId: id,
      newValue: reason || 'Cancelled',
    });

    await recordTransaction({
      type: 'INVOICE_CANCELLED',
      entity: 'invoices',
      entityId: id,
      reference: data.invoiceNumber,
      amount: -data.total,
      description: `Cancelled Invoice ${data.invoiceNumber}: ${reason || 'N/A'}`,
      userEmail,
    });
  } catch (err) {
    console.error('cancelInvoice error:', err);
    throw err;
  }
}

// --- PAYMENTS ---
export async function getPayments() {
  try {
    const coll = collection(db, 'payments');
    const q = query(coll, orderBy('paymentDate', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getPayments error:', err);
    return [];
  }
}

export async function recordPayment(paymentData, userEmail) {
  try {
    const amount = Number(paymentData.amount) || 0;
    const paymentId = paymentData.paymentId || generateEntityId('PAY');

    const paymentPayload = {
      ...paymentData,
      paymentId,
      amount,
      paymentDate: paymentData.paymentDate || new Date().toISOString().split('T')[0],
      paymentMethod: paymentData.paymentMethod || 'Bank Transfer', // Bank Transfer, UPI, Cash, Card, Payment Gateway
      createdAt: serverTimestamp(),
      recordedBy: userEmail || 'system',
    };

    const paymentDocRef = await addDoc(collection(db, 'payments'), paymentPayload);

    // Auto-update linked invoice
    if (paymentData.invoiceId) {
      const invRef = doc(db, 'invoices', paymentData.invoiceId);
      const invSnap = await getDoc(invRef);
      if (invSnap.exists()) {
        const inv = invSnap.data();
        const currentPaid = Number(inv.paidAmount) || 0;
        const newPaid = currentPaid + amount;
        const total = Number(inv.total) || 0;
        const newOutstanding = Math.max(0, total - newPaid);
        const newStatus = newOutstanding <= 0 ? 'Paid' : 'Partially Paid';

        await updateDoc(invRef, {
          paidAmount: newPaid,
          outstandingAmount: newOutstanding,
          status: newStatus,
          updatedAt: serverTimestamp(),
        });

        await logAudit({
          user: userEmail,
          action: 'Updated Invoice via Payment',
          entity: 'invoices',
          entityId: paymentData.invoiceId,
          newValue: `Paid: ₹${newPaid}, Outstanding: ₹${newOutstanding}, Status: ${newStatus}`,
        });
      }
    }

    // Append to Transaction Ledger
    await recordTransaction({
      type: 'PAYMENT_RECEIVED',
      entity: 'payments',
      entityId: paymentDocRef.id,
      reference: paymentPayload.transactionReference || paymentId,
      amount: amount,
      description: `Payment received: ₹${amount} via ${paymentPayload.paymentMethod} (Ref: ${paymentPayload.transactionReference || 'N/A'})`,
      userEmail,
    });

    createNotification({
      title: 'Payment Received',
      message: `₹${amount} recorded via ${paymentPayload.paymentMethod}`,
      type: 'success',
      link: '/studio/finance/payments',
    });

    return { id: paymentDocRef.id, ...paymentPayload };
  } catch (err) {
    console.error('recordPayment error:', err);
    throw err;
  }
}

// --- EXPENSES ---
export async function getExpenses() {
  try {
    const coll = collection(db, 'expenses');
    const q = query(coll, orderBy('date', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getExpenses error:', err);
    return [];
  }
}

export async function createExpense(expenseData, userEmail) {
  try {
    const amount = Number(expenseData.amount) || 0;
    const expenseId = expenseData.expenseId || generateEntityId('EXP');

    const payload = {
      ...expenseData,
      expenseId,
      amount,
      category: expenseData.category || 'Software', // Software, Hosting, Advertising, Office, Travel, Salary, Contractor, Equipment, Marketing, Miscellaneous
      date: expenseData.date || new Date().toISOString().split('T')[0],
      createdAt: serverTimestamp(),
      createdBy: userEmail || 'system',
    };

    const docRef = await addDoc(collection(db, 'expenses'), payload);

    await logAudit({
      user: userEmail,
      action: 'Added Expense',
      entity: 'expenses',
      entityId: docRef.id,
      newValue: `${payload.category} - ₹${amount}: ${payload.description}`,
    });

    // Transaction Ledger
    await recordTransaction({
      type: 'EXPENSE_ADDED',
      entity: 'expenses',
      entityId: docRef.id,
      reference: expenseId,
      amount: -amount,
      description: `Expense: ${payload.category} - ${payload.description}`,
      userEmail,
    });

    return { id: docRef.id, ...payload };
  } catch (err) {
    console.error('createExpense error:', err);
    throw err;
  }
}

export async function deleteExpense(id, userEmail) {
  try {
    const docRef = doc(db, 'expenses', id);
    const snap = await getDoc(docRef);
    if (!snap.exists()) return;
    const data = snap.data();

    // Mark as reversed rather than completely removing financial trail
    await updateDoc(docRef, {
      reversed: true,
      reversedAt: serverTimestamp(),
      reversedBy: userEmail,
    });

    await logAudit({
      user: userEmail,
      action: 'Reversed Expense',
      entity: 'expenses',
      entityId: id,
    });

    await recordTransaction({
      type: 'EXPENSE_REVERSED',
      entity: 'expenses',
      entityId: id,
      reference: data.expenseId,
      amount: data.amount,
      description: `Reversed expense ${data.expenseId}`,
      userEmail,
    });
  } catch (err) {
    console.error('deleteExpense error:', err);
    throw err;
  }
}

// --- TRANSACTION LEDGER ---
export async function getTransactions(maxCount = 100) {
  try {
    const coll = collection(db, 'transactions');
    const q = query(coll, orderBy('timestamp', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.slice(0, maxCount).map(d => ({ id: d.id, ...d.data() }));
  } catch (err) {
    console.error('getTransactions error:', err);
    return [];
  }
}

export async function recordTransaction({ type, entity, entityId, reference, amount, description, userEmail }) {
  try {
    await addDoc(collection(db, 'transactions'), {
      timestamp: serverTimestamp(),
      type, // INVOICE_CREATED, PAYMENT_RECEIVED, EXPENSE_ADDED, EXPENSE_REVERSED, INVOICE_CANCELLED
      entity: entity || 'general',
      entityId: String(entityId || ''),
      reference: reference || '',
      amount: Number(amount) || 0,
      description: description || '',
      user: userEmail || 'system',
    });
  } catch (err) {
    console.warn('recordTransaction ledger error:', err);
  }
}
