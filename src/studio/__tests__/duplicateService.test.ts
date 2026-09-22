import {
  detectDuplicateLead,
  normalizePhoneNumber,
  normalizeEmail,
  normalizeCompany,
} from '../services/duplicateService';
import { Lead } from '../types';

describe('Duplicate Lead Detection Suite', () => {
  const mockExistingLeads: Lead[] = [
    {
      id: 'lead_1',
      name: 'Vikram Malhotra',
      company: 'Apex Healthtech Pvt Ltd',
      email: 'vikram@apexhealth.in',
      phone: '+91 98200 12345',
      whatsapp: '9820012345',
      service: 'Web Applications',
      requirement: 'Telemedicine portal',
      source: 'Google',
      status: 'Qualified',
      priority: 'High',
      createdAt: '2026-01-01T00:00:00Z',
      updatedAt: '2026-01-01T00:00:00Z',
    },
    {
      id: 'lead_2',
      name: 'Pooja Singhania',
      company: 'Singhania Logistics Ltd',
      email: 'pooja@singhania.com',
      phone: '9811054321',
      service: 'ERP Development',
      requirement: 'Warehouse inventory',
      source: 'LinkedIn',
      status: 'Proposal Sent',
      priority: 'Urgent',
      createdAt: '2026-01-02T00:00:00Z',
      updatedAt: '2026-01-02T00:00:00Z',
    },
  ];

  test('normalizes phone numbers removing non-digits and leading 91', () => {
    expect(normalizePhoneNumber('+91 98200-12345')).toBe('9820012345');
    expect(normalizePhoneNumber('(981) 105-4321')).toBe('9811054321');
    expect(normalizePhoneNumber('')).toBe('');
  });

  test('normalizes email addresses to lowercase and trimmed', () => {
    expect(normalizeEmail('  Vikram@ApexHealth.IN ')).toBe('vikram@apexhealth.in');
  });

  test('normalizes company names removing corporate suffixes and punctuation', () => {
    expect(normalizeCompany('Apex Healthtech Pvt Ltd')).toBe('apexhealthtech');
    expect(normalizeCompany('Singhania Logistics Ltd.')).toBe('singhanialogistics');
  });

  test('detects duplicate on matching email', () => {
    const result = detectDuplicateLead(
      { email: 'VIKRAM@apexhealth.in' },
      mockExistingLeads
    );
    expect(result.isDuplicate).toBe(true);
    expect(result.matchingLeads.length).toBe(1);
    expect(result.matchingLeads[0].name).toBe('Vikram Malhotra');
  });

  test('detects duplicate on matching phone or whatsapp', () => {
    const result = detectDuplicateLead(
      { phone: '98200-12345' },
      mockExistingLeads
    );
    expect(result.isDuplicate).toBe(true);
    expect(result.matchingLeads[0].id).toBe('lead_1');
  });

  test('ignores current lead ID when updating existing record', () => {
    const result = detectDuplicateLead(
      { email: 'vikram@apexhealth.in', phone: '9820012345' },
      mockExistingLeads,
      'lead_1' // ignoreLeadId
    );
    expect(result.isDuplicate).toBe(false);
  });

  test('allows genuinely distinct new lead', () => {
    const result = detectDuplicateLead(
      {
        email: 'rahul@newcompany.com',
        phone: '9999988888',
        company: 'Brand New Tech',
      },
      mockExistingLeads
    );
    expect(result.isDuplicate).toBe(false);
    expect(result.matchingLeads.length).toBe(0);
  });
});
