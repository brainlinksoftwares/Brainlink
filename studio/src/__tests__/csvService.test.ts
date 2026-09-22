import { csvService } from '../services/csvService';
import { Lead } from '../types';

describe('CSV Service Import & Export Suite', () => {
  const mockLeads: Lead[] = [
    {
      id: 'lead_1',
      name: 'Anand Kumar',
      company: 'FinTrack Solutions',
      email: 'anand@fintrack.co',
      phone: '+91 99345 67890',
      whatsapp: '9934567890',
      website: 'https://fintrack.co',
      service: 'SaaS Development',
      requirement: 'Multi-tenant SaaS dashboard for GST billing',
      budget: '₹1,00,000 – ₹5,00,000',
      source: 'Website',
      status: 'Qualified',
      priority: 'High',
      assignedTo: 'usr_1',
      assignedToName: 'Aaditya Vishnoi',
      createdAt: '2026-01-01T10:00:00Z',
      updatedAt: '2026-01-01T10:00:00Z',
    },
  ];

  test('exports leads to CSV formatted string with headers', () => {
    const csv = csvService.exportLeadsToCsv(mockLeads);
    expect(csv).toContain('ID,Name,Company,Email,Phone,WhatsApp,Website,Lead Source');
    expect(csv).toContain('"Anand Kumar"');
    expect(csv).toContain('"FinTrack Solutions"');
    expect(csv).toContain('"anand@fintrack.co"');
  });

  test('parses raw CSV text into mapped objects', () => {
    const csvRaw = `Name,Company,Email,Phone,Service\n"Kunal","UrbanNest","kunal@urbannest.in","9888811223","CRM Development"`;
    const rows = csvService.parseRawCsv(csvRaw);
    expect(rows.length).toBe(1);
    expect(rows[0].name).toBe('Kunal');
    expect(rows[0].company).toBe('UrbanNest');
    expect(rows[0].email).toBe('kunal@urbannest.in');
  });

  test('validates records, catches missing required fields and detects duplicates', () => {
    const rows: Record<string, string>[] = [
      {
        name: 'Valid Prospect',
        company: 'New Corp',
        email: 'prospect@newcorp.in',
        phone: '9777711111',
        service: 'Web Applications',
      },
      {
        name: 'Duplicate Prospect',
        company: 'FinTrack Solutions',
        email: 'anand@fintrack.co', // duplicate with mockLeads[0]
        phone: '9934567890',
      },
      {
        name: '', // missing name
        email: 'noname@company.com',
      },
      {
        name: 'Invalid Email Person',
        email: 'bad-email-format',
      },
    ];

    const result = csvService.validateCsvRows(rows, mockLeads);

    expect(result.validRows.length).toBe(1);
    expect(result.validRows[0].data.name).toBe('Valid Prospect');

    expect(result.duplicateRows.length).toBe(1);
    expect(result.duplicateRows[0].raw.name).toBe('Duplicate Prospect');

    expect(result.invalidRows.length).toBe(2);
  });
});
