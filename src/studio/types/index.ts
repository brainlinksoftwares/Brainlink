export type UserRole = 'admin' | 'manager' | 'sales';

export type UserStatus = 'active' | 'inactive';

export interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  status: UserStatus;
  photoURL?: string;
  createdAt: string;
  updatedAt: string;
}

export type LeadStatus =
  | 'New'
  | 'Contacted'
  | 'Qualified'
  | 'Proposal Sent'
  | 'Negotiation'
  | 'Won'
  | 'Lost'
  | 'On Hold';

export type LeadPriority = 'Low' | 'Medium' | 'High' | 'Urgent';

export type FollowUpType =
  | 'Call'
  | 'WhatsApp'
  | 'Email'
  | 'Meeting'
  | 'Demo'
  | 'Proposal Follow-up'
  | 'Other';

export interface Lead {
  id: string;
  name: string;
  company: string;
  email: string;
  phone: string;
  whatsapp?: string;
  website?: string;
  location?: string;
  industry?: string;
  companySize?: string;
  budget?: string;
  service: string;
  requirement: string;
  timeline?: string;
  source: string;
  campaign?: string;
  status: LeadStatus;
  priority: LeadPriority;
  assignedTo?: string; // User ID
  assignedToName?: string;
  archived?: boolean;
  createdAt: string;
  updatedAt: string;
  lastContactAt?: string;
  nextFollowUpAt?: string;
  followUpType?: FollowUpType;
}

export type ActivityType =
  | 'lead_created'
  | 'lead_updated'
  | 'lead_archived'
  | 'status_changed'
  | 'lead_assigned'
  | 'note_added'
  | 'call_logged'
  | 'email_logged'
  | 'meeting_scheduled'
  | 'followup_created'
  | 'followup_completed'
  | 'proposal_sent'
  | 'client_converted'
  | 'project_created'
  | 'task_created'
  | 'task_status_changed';

export interface Activity {
  id: string;
  entityType: 'lead' | 'client' | 'project' | 'task' | 'user';
  entityId: string;
  type: ActivityType;
  description: string;
  actorId: string;
  actorName: string;
  metadata?: Record<string, any>;
  createdAt: string;
}

export type FollowUpStatus = 'pending' | 'completed' | 'rescheduled' | 'cancelled';

export interface FollowUp {
  id: string;
  leadId: string;
  leadName?: string;
  leadCompany?: string;
  assignedTo: string;
  assignedToName?: string;
  type: FollowUpType;
  scheduledAt: string; // ISO string
  status: FollowUpStatus;
  notes: string;
  completedAt?: string;
  createdAt: string;
  updatedAt: string;
}

export type TaskPriority = 'Low' | 'Medium' | 'High' | 'Urgent';
export type TaskStatus = 'Pending' | 'In Progress' | 'Completed' | 'Cancelled';

export interface Task {
  id: string;
  title: string;
  description?: string;
  leadId?: string;
  leadName?: string;
  assignedTo: string;
  assignedToName?: string;
  priority: TaskPriority;
  status: TaskStatus;
  dueDate: string;
  createdAt: string;
  updatedAt: string;
}

export interface Client {
  id: string;
  leadId?: string;
  company: string;
  contactName: string;
  email: string;
  phone: string;
  website?: string;
  services: string[];
  contractValue: number;
  startDate: string;
  assignedTo: string;
  assignedToName?: string;
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export type ProjectStatus = 'Planning' | 'Active' | 'On Hold' | 'Completed' | 'Cancelled';

export interface Project {
  id: string;
  clientId: string;
  clientName?: string;
  name: string;
  service: string;
  value: number;
  status: ProjectStatus;
  startDate: string;
  expectedCompletion?: string;
  assignedTeam: string[];
  notes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface NotificationItem {
  id: string;
  userId: string;
  title: string;
  message: string;
  type: 'lead_assigned' | 'followup_due' | 'followup_overdue' | 'status_changed' | 'task_assigned';
  link?: string;
  read: boolean;
  createdAt: string;
}

export interface DuplicateCheckResult {
  isDuplicate: boolean;
  matchingLeads: Lead[];
  reasons: string[];
}
