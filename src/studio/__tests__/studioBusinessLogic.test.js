import {
  calculateInvoiceTotals,
} from '../services/financeService';
import {
  ROLES,
  ALL_PERMISSIONS,
  DEFAULT_ROLE_PERMISSIONS,
  isUserSuperAdmin,
  hasPermission,
} from '../context/rbac';
import {
  formatINR,
  numberToWordsINR,
  generateEntityId,
} from '../utils/formatters';
import { ONBOARDING_STEPS } from '../services/clientService';
import { PROJECT_CLOSURE_STEPS } from '../services/projectService';

describe('Brainlink Studio — Financial & Tax Calculations (Section 51)', () => {
  test('calculates Intra-state GST (CGST 9% + SGST 9%) accurately', () => {
    const items = [
      { description: 'Cloud Infrastructure & API Architecture', quantity: 1, rate: 100000 },
      { description: 'UI/UX Design System', quantity: 2, rate: 25000 },
    ];
    // Subtotal = 150000, Discount = 10000 => Taxable = 140000
    // CGST (9%) = 12600, SGST (9%) = 12600 => Total Tax = 25200 => Total = 165200
    const calc = calculateInvoiceTotals(items, 10000, 'intra', 18);

    expect(calc.subtotal).toBe(150000);
    expect(calc.discount).toBe(10000);
    expect(calc.taxableAmount).toBe(140000);
    expect(calc.cgst).toBe(12600);
    expect(calc.sgst).toBe(12600);
    expect(calc.igst).toBe(0);
    expect(calc.totalTax).toBe(25200);
    expect(calc.total).toBe(165200);
  });

  test('calculates Inter-state GST (IGST 18%) accurately', () => {
    const items = [
      { description: 'Enterprise Fullstack Web Suite', quantity: 1, rate: 420000 },
    ];
    const calc = calculateInvoiceTotals(items, 0, 'inter', 18);

    expect(calc.subtotal).toBe(420000);
    expect(calc.discount).toBe(0);
    expect(calc.taxableAmount).toBe(420000);
    expect(calc.cgst).toBe(0);
    expect(calc.sgst).toBe(0);
    expect(calc.igst).toBe(75600);
    expect(calc.totalTax).toBe(75600);
    expect(calc.total).toBe(495600);
  });

  test('handles zero and discount greater than subtotal without negative taxables', () => {
    const items = [{ description: 'Consultation', quantity: 1, rate: 5000 }];
    const calc = calculateInvoiceTotals(items, 10000, 'intra', 18);

    expect(calc.taxableAmount).toBe(0);
    expect(calc.total).toBe(0);
  });
});

describe('Brainlink Studio — RBAC & Security Permission Checks (Section 6 & 36)', () => {
  test('identifies configured Super Admins correctly', () => {
    expect(isUserSuperAdmin('vishnoiaaditya29@gmail.com')).toBe(true);
    expect(isUserSuperAdmin('ceo.brainlink@gmail.com')).toBe(true);
    expect(isUserSuperAdmin('random.user@external.com')).toBe(false);
  });

  test('Super Admin role has universal authorization across all permissions', () => {
    ALL_PERMISSIONS.forEach((perm) => {
      expect(hasPermission(ROLES.SUPER_ADMIN, [], perm)).toBe(true);
    });
  });

  test('Finance role has finance/invoicing permissions but cannot manage settings or users', () => {
    expect(hasPermission(ROLES.FINANCE, DEFAULT_ROLE_PERMISSIONS[ROLES.FINANCE], 'finance.view')).toBe(true);
    expect(hasPermission(ROLES.FINANCE, DEFAULT_ROLE_PERMISSIONS[ROLES.FINANCE], 'invoice.create')).toBe(true);
    expect(hasPermission(ROLES.FINANCE, DEFAULT_ROLE_PERMISSIONS[ROLES.FINANCE], 'invoice.send')).toBe(true);
    expect(hasPermission(ROLES.FINANCE, DEFAULT_ROLE_PERMISSIONS[ROLES.FINANCE], 'settings.manage')).toBe(false);
    expect(hasPermission(ROLES.FINANCE, DEFAULT_ROLE_PERMISSIONS[ROLES.FINANCE], 'users.delete')).toBe(false);
  });

  test('Client role is strictly restricted to Client Portal only', () => {
    expect(hasPermission(ROLES.CLIENT, DEFAULT_ROLE_PERMISSIONS[ROLES.CLIENT], 'client.portal')).toBe(true);
    expect(hasPermission(ROLES.CLIENT, DEFAULT_ROLE_PERMISSIONS[ROLES.CLIENT], 'finance.view')).toBe(false);
    expect(hasPermission(ROLES.CLIENT, DEFAULT_ROLE_PERMISSIONS[ROLES.CLIENT], 'crm.view')).toBe(false);
    expect(hasPermission(ROLES.CLIENT, DEFAULT_ROLE_PERMISSIONS[ROLES.CLIENT], 'sales.create')).toBe(false);
  });
});

describe('Brainlink Studio — Indian Currency & Words Formatting (Section 39 & 52)', () => {
  test('formats INR with Indian commas standard ₹1,25,000', () => {
    expect(formatINR(125000)).toBe('₹1,25,000');
    expect(formatINR(1400000)).toBe('₹14,00,000');
    expect(formatINR(0)).toBe('₹0');
  });

  test('converts numeric values to formal Indian English words for GST invoices', () => {
    const words = numberToWordsINR(495600);
    expect(words).toContain('Four Lakh');
    expect(words).toContain('Ninety Five Thousand');
    expect(words).toContain('Six Hundred');
    expect(words).toContain('Rupees');
  });

  test('generates compliant entity IDs with prefixes', () => {
    const invId = generateEntityId('INV');
    expect(invId).toMatch(/^INV-\d{4}-\d{4}$/);

    const leadId = generateEntityId('LEAD');
    expect(leadId).toMatch(/^LEAD-\d{4}-\d{4}$/);
  });
});

describe('Brainlink Studio — Onboarding & Closure Workflows (Section 16 & 27)', () => {
  test('onboarding checklist has all 10 mandatory operational criteria', () => {
    expect(ONBOARDING_STEPS.length).toBe(10);
    const stepIds = ONBOARDING_STEPS.map(s => s.id);
    expect(stepIds).toContain('client_info');
    expect(stepIds).toContain('gst_pan');
    expect(stepIds).toContain('master_agreement');
    expect(stepIds).toContain('kickoff_meeting');
  });

  test('project closure workflow has all 11 handover requirements', () => {
    expect(PROJECT_CLOSURE_STEPS.length).toBe(11);
    const stepIds = PROJECT_CLOSURE_STEPS.map(s => s.id);
    expect(stepIds).toContain('tasks_done');
    expect(stepIds).toContain('final_invoice');
    expect(stepIds).toContain('payments_cleared');
    expect(stepIds).toContain('source_code');
    expect(stepIds).toContain('credentials_transferred');
  });
});
