import { collection, addDoc, getDocs, updateDoc, doc, query, where, orderBy, limit, serverTimestamp } from 'firebase/firestore';
import { db } from '../config/firebase';

export async function createNotification({ recipientId = null, recipientRole = null, title, message, type = 'info', link = '' }) {
  try {
    await addDoc(collection(db, 'notifications'), {
      recipientId,
      recipientRole,
      title,
      message,
      type,
      link,
      read: false,
      createdAt: serverTimestamp(),
    });
  } catch (err) {
    console.warn('Failed to create notification:', err);
  }
}

export async function getNotifications(userId, userRole, maxCount = 30) {
  try {
    const coll = collection(db, 'notifications');
    const snap = await getDocs(query(coll, orderBy('createdAt', 'desc'), limit(maxCount)));
    const all = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    // Filter relevant notifications
    return all.filter(n => {
      if (!n.recipientId && !n.recipientRole) return true;
      if (n.recipientId === userId) return true;
      if (n.recipientRole === userRole) return true;
      return false;
    });
  } catch (err) {
    console.error('Error fetching notifications:', err);
    return [];
  }
}

export async function markNotificationAsRead(notifId) {
  try {
    await updateDoc(doc(db, 'notifications', notifId), { read: true });
  } catch (err) {
    console.error('Failed to mark notification read:', err);
  }
}
