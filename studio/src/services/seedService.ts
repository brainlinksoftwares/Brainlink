import { Lead, FollowUp, Task, Client, Project } from '../types';
import { storageEngine } from './storageEngine';

const SAMPLE_LEADS: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>[] = [
  {
    name: 'Vikram Malhotra',
    company: 'Apex Healthtech Pvt Ltd',
    email: 'vikram@apexhealth.in',
    phone: '+91 98200 12345',
    whatsapp: '9820012345',
    website: 'https://apexhealth.in',
    location: 'Bangalore, India',
    industry: 'Healthcare',
    companySize: '11-50 employees (Growing SME)',
    budget: '₹5,00,000 – ₹15,00,000',
    service: 'Web Applications',
    requirement: 'Need a HIPAA-compliant doctor appointment and patient records telemedicine portal with WebRTC video calling.',
    timeline: '1 – 2 weeks',
    source: 'Google',
    status: 'Qualified',
    priority: 'High',
    assignedTo: 'usr_sales_1',
    assignedToName: 'Aaditya Vishnoi',
  },
  {
    name: 'Pooja Singhania',
    company: 'Singhania Retail Logistics',
    email: 'pooja@singhania.com',
    phone: '+91 98110 54321',
    whatsapp: '9811054321',
    website: 'https://singhanialogistics.com',
    location: 'Mumbai, India',
    industry: 'Logistics',
    companySize: '51-200 employees (Mid-Market)',
    budget: '₹15,00,000+',
    service: 'ERP Development',
    requirement: 'End-to-end warehouse inventory dispatch and driver fleet route optimization ERP software with live GPS tracking.',
    timeline: 'Immediate (< 1 week)',
    source: 'LinkedIn',
    status: 'Proposal Sent',
    priority: 'Urgent',
    assignedTo: 'usr_sales_1',
    assignedToName: 'Aaditya Vishnoi',
  },
  {
    name: 'Anand Kumar',
    company: 'FinTrack Solutions',
    email: 'anand@fintrack.co',
    phone: '+91 99345 67890',
    whatsapp: '9934567890',
    website: 'https://fintrack.co',
    location: 'Gurugram, India',
    industry: 'FinTech',
    companySize: '1-10 employees (Startup / Small)',
    budget: '₹1,00,000 – ₹5,00,000',
    service: 'SaaS Development',
    requirement: 'Multi-tenant SaaS dashboard for GST invoices, billing automation, and WhatsApp payment reminder triggers.',
    timeline: '2 – 4 weeks',
    source: 'Website',
    status: 'Negotiation',
    priority: 'High',
    assignedTo: 'usr_sales_1',
    assignedToName: 'Aaditya Vishnoi',
  },
  {
    name: 'Rohan Sharma',
    company: 'BlueWave Academy',
    email: 'rohan@bluewave.edu',
    phone: '+91 97123 98765',
    whatsapp: '9712398765',
    website: 'https://bluewave.edu',
    location: 'Delhi, India',
    industry: 'EdTech',
    companySize: '11-50 employees (Growing SME)',
    budget: '₹1,00,000 – ₹5,00,000',
    service: 'Website Development',
    requirement: 'Redesign LMS school portal with Razorpay subscription integration, student forum, and video course hosting.',
    timeline: '1 – 3 months',
    source: 'Referral',
    status: 'Won',
    priority: 'Medium',
    assignedTo: 'usr_admin_1',
    assignedToName: 'Brainlink Admin',
  },
  {
    name: 'Neha Verma',
    company: 'Kavya Jewels',
    email: 'neha@kavyajewels.in',
    phone: '+91 94555 88990',
    whatsapp: '9455588990',
    location: 'Jaipur, India',
    industry: 'E-commerce',
    companySize: '1-10 employees (Startup / Small)',
    budget: '₹25,000 – ₹1,00,000',
    service: 'E-commerce Development',
    requirement: 'Luxury jewelry storefront with virtual try-on and insured courier dispatch integration.',
    timeline: 'Immediate (< 1 week)',
    source: 'Instagram',
    status: 'New',
    priority: 'Urgent',
  },
  {
    name: 'Kunal Deshmukh',
    company: 'UrbanNest Spaces',
    email: 'kunal@urbannest.in',
    phone: '+91 98888 11223',
    whatsapp: '9888811223',
    location: 'Pune, India',
    industry: 'Real Estate',
    companySize: '11-50 employees (Growing SME)',
    budget: '₹1,00,000 – ₹5,00,000',
    service: 'CRM Development',
    requirement: 'Custom real estate broker lead routing and site visit booking calendar.',
    timeline: '2 – 4 weeks',
    source: 'Google',
    status: 'Contacted',
    priority: 'Medium',
    assignedTo: 'usr_manager_1',
    assignedToName: 'Sales Manager',
  },
  {
    name: 'Sunil Rao',
    company: 'GreenLeaf Agro',
    email: 'sunil@greenleaf.in',
    phone: '+91 93456 78120',
    location: 'Hyderabad, India',
    industry: 'Agriculture',
    companySize: '1-10 employees (Startup / Small)',
    budget: 'Under ₹25,000',
    service: 'Website Development',
    requirement: 'Organic farm produce catalog website.',
    timeline: 'Flexible',
    source: 'Cold Outreach',
    status: 'Lost',
    priority: 'Low',
  },
];

export const seedService = {
  seedSampleData: () => {
    const now = new Date();
    const nowIso = now.toISOString();

    // 1. Create leads
    const createdLeads: Lead[] = SAMPLE_LEADS.map((item, idx) => ({
      ...item,
      id: 'lead_seed_' + (idx + 1),
      createdAt: new Date(now.getTime() - (SAMPLE_LEADS.length - idx) * 86400000 * 2).toISOString(),
      updatedAt: nowIso,
    }));
    storageEngine.set('leads', createdLeads);

    // 2. Create sample FollowUps
    const sampleFollowUps: FollowUp[] = [
      {
        id: 'fu_seed_1',
        leadId: createdLeads[0].id,
        leadName: createdLeads[0].name,
        leadCompany: createdLeads[0].company,
        assignedTo: 'usr_sales_1',
        assignedToName: 'Aaditya Vishnoi',
        type: 'Call',
        scheduledAt: new Date(now.getTime() + 3600000 * 3).toISOString(), // Today
        status: 'pending',
        notes: 'Walkthrough technical specs for HIPAA teleconsultation modules',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 'fu_seed_2',
        leadId: createdLeads[1].id,
        leadName: createdLeads[1].name,
        leadCompany: createdLeads[1].company,
        assignedTo: 'usr_sales_1',
        assignedToName: 'Aaditya Vishnoi',
        type: 'Proposal Follow-up',
        scheduledAt: new Date(now.getTime() + 86400000 * 2).toISOString(), // Upcoming
        status: 'pending',
        notes: 'Check feedback on customized ERP milestone pricing schedule',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 'fu_seed_3',
        leadId: createdLeads[5].id,
        leadName: createdLeads[5].name,
        leadCompany: createdLeads[5].company,
        assignedTo: 'usr_manager_1',
        assignedToName: 'Sales Manager',
        type: 'Meeting',
        scheduledAt: new Date(now.getTime() - 86400000 * 2).toISOString(), // Overdue
        status: 'pending',
        notes: 'Product demo for real estate site booking CRM',
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];
    storageEngine.set('followups', sampleFollowUps);

    // 3. Create sample Tasks
    const sampleTasks: Task[] = [
      {
        id: 'tsk_seed_1',
        title: 'Draft technical architecture proposal for Singhania Logistics ERP',
        leadId: createdLeads[1].id,
        leadName: createdLeads[1].name,
        assignedTo: 'usr_sales_1',
        assignedToName: 'Aaditya Vishnoi',
        priority: 'Urgent',
        status: 'In Progress',
        dueDate: new Date(now.getTime() + 86400000).toISOString().split('T')[0],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
      {
        id: 'tsk_seed_2',
        title: 'Prepare demo sandbox for Apex Healthtech telemedicine portal',
        leadId: createdLeads[0].id,
        leadName: createdLeads[0].name,
        assignedTo: 'usr_admin_1',
        assignedToName: 'Brainlink Admin',
        priority: 'High',
        status: 'Pending',
        dueDate: new Date(now.getTime() + 86400000 * 3).toISOString().split('T')[0],
        createdAt: nowIso,
        updatedAt: nowIso,
      },
    ];
    storageEngine.set('tasks', sampleTasks);

    // 4. Create sample Client & Project for Won lead
    const wonLead = createdLeads[3];
    const sampleClient: Client = {
      id: 'cli_seed_1',
      leadId: wonLead.id,
      company: wonLead.company,
      contactName: wonLead.name,
      email: wonLead.email,
      phone: wonLead.phone,
      website: wonLead.website,
      services: [wonLead.service],
      contractValue: 450000,
      startDate: new Date(now.getTime() - 86400000 * 10).toISOString().split('T')[0],
      assignedTo: 'usr_admin_1',
      assignedToName: 'Brainlink Admin',
      notes: 'LMS portal with Razorpay subscription and video course hosting.',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    storageEngine.set('clients', [sampleClient]);

    const sampleProject: Project = {
      id: 'proj_seed_1',
      clientId: sampleClient.id,
      clientName: sampleClient.company,
      name: 'BlueWave Academy LMS Portal',
      service: 'Website Development',
      value: 450000,
      status: 'Active',
      startDate: sampleClient.startDate,
      expectedCompletion: new Date(now.getTime() + 86400000 * 35).toISOString().split('T')[0],
      assignedTeam: ['Aaditya Vishnoi', 'Brainlink Admin'],
      notes: 'Milestone 1: Wireframes and Design System approved.',
      createdAt: nowIso,
      updatedAt: nowIso,
    };
    storageEngine.set('projects', [sampleProject]);
  },

  clearAllData: () => {
    storageEngine.clearAll();
  },
};
