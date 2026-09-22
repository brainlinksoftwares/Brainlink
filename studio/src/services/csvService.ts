import { Lead, LeadStatus, LeadPriority } from '../types';
import { detectDuplicateLead } from './duplicateService';

export interface CsvLeadRow {
  name: string;
  company: string;
  email: string;
  phone: string;
  website?: string;
  source?: string;
  service?: string;
  status?: string;
  priority?: string;
  notes?: string;
}

export interface ParsedCsvResult {
  validRows: {
    data: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'>;
    raw: CsvLeadRow;
  }[];
  duplicateRows: {
    raw: CsvLeadRow;
    reasons: string[];
    matchingLeadName: string;
  }[];
  invalidRows: {
    raw: Record<string, string>;
    error: string;
  }[];
  totalParsed: number;
}

export const csvService = {
  /**
   * Generates a downloadable CSV string from a list of leads
   */
  exportLeadsToCsv: (leads: Lead[]): string => {
    const headers = [
      'ID',
      'Name',
      'Company',
      'Email',
      'Phone',
      'WhatsApp',
      'Website',
      'Lead Source',
      'Service Interested',
      'Budget',
      'Status',
      'Priority',
      'Assigned To',
      'Created Date',
      'Requirement',
    ];

    const escapeCsv = (val?: string | number | null) => {
      if (val === undefined || val === null) return '""';
      const str = String(val).replace(/"/g, '""');
      return `"${str}"`;
    };

    const rows = leads.map((lead) => [
      escapeCsv(lead.id),
      escapeCsv(lead.name),
      escapeCsv(lead.company),
      escapeCsv(lead.email),
      escapeCsv(lead.phone),
      escapeCsv(lead.whatsapp),
      escapeCsv(lead.website),
      escapeCsv(lead.source),
      escapeCsv(lead.service),
      escapeCsv(lead.budget),
      escapeCsv(lead.status),
      escapeCsv(lead.priority),
      escapeCsv(lead.assignedToName || 'Unassigned'),
      escapeCsv(new Date(lead.createdAt).toLocaleDateString('en-IN')),
      escapeCsv(lead.requirement),
    ]);

    return [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
  },

  /**
   * Trigger browser file download for a CSV string
   */
  downloadCsv: (csvContent: string, fileName = 'leads_export.csv') => {
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', fileName);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Basic CSV Parser handling quotes, commas, and newlines
   */
  parseRawCsv: (csvText: string): Record<string, string>[] => {
    const lines = csvText.split(/\r\n|\n|\r/).filter((l) => l.trim().length > 0);
    if (lines.length < 2) return [];

    // Parse header
    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let insideQuote = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (insideQuote && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            insideQuote = !insideQuote;
          }
        } else if (char === ',' && !insideQuote) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const rawHeaders = parseLine(lines[0]).map((h) =>
      h.toLowerCase().replace(/[^a-z0-9]/g, '')
    );

    const rows: Record<string, string>[] = [];

    for (let i = 1; i < lines.length; i++) {
      const values = parseLine(lines[i]);
      const obj: Record<string, string> = {};
      rawHeaders.forEach((h, idx) => {
        obj[h] = values[idx] || '';
      });
      rows.push(obj);
    }

    return rows;
  },

  /**
   * Validates parsed CSV rows against schema and detects duplicates
   */
  validateCsvRows: (
    rawRows: Record<string, string>[],
    existingLeads: Lead[]
  ): ParsedCsvResult => {
    const validRows: ParsedCsvResult['validRows'] = [];
    const duplicateRows: ParsedCsvResult['duplicateRows'] = [];
    const invalidRows: ParsedCsvResult['invalidRows'] = [];

    // Map common header name variations
    const getField = (row: Record<string, string>, keys: string[]): string => {
      for (const k of keys) {
        if (row[k]) return row[k];
      }
      return '';
    };

    rawRows.forEach((row) => {
      const name = getField(row, ['name', 'fullname', 'contactname', 'leadname']);
      const email = getField(row, ['email', 'emailaddress', 'mail']);
      const phone = getField(row, ['phone', 'phonenumber', 'mobile', 'cell', 'tel']);
      const company = getField(row, ['company', 'companyname', 'organization', 'business']);
      const website = getField(row, ['website', 'site', 'url', 'web']);
      const source = getField(row, ['source', 'leadsource']) || 'Other';
      const service = getField(row, ['service', 'serviceinterested', 'requirementtype']) || 'Custom Development';
      const statusRaw = getField(row, ['status', 'leadstatus']) || 'New';
      const priorityRaw = getField(row, ['priority', 'leadpriority']) || 'Medium';
      const notes = getField(row, ['notes', 'requirement', 'description', 'message']);

      // 1. Validation checks
      if (!name) {
        invalidRows.push({ raw: row, error: 'Missing full name' });
        return;
      }
      if (!email && !phone) {
        invalidRows.push({ raw: row, error: 'Must provide either Email or Phone number' });
        return;
      }
      if (email && !/\S+@\S+\.\S+/.test(email)) {
        invalidRows.push({ raw: row, error: `Invalid email address format (${email})` });
        return;
      }

      const status: LeadStatus = ['New', 'Contacted', 'Qualified', 'Proposal Sent', 'Negotiation', 'Won', 'Lost', 'On Hold'].includes(statusRaw)
        ? (statusRaw as LeadStatus)
        : 'New';

      const priority: LeadPriority = ['Low', 'Medium', 'High', 'Urgent'].includes(priorityRaw)
        ? (priorityRaw as LeadPriority)
        : 'Medium';

      // 2. Duplicate Detection
      const dupCheck = detectDuplicateLead(
        { email, phone, company },
        existingLeads
      );

      const leadData: Omit<Lead, 'id' | 'createdAt' | 'updatedAt'> = {
        name,
        company: company || 'Direct Lead',
        email: email || '',
        phone: phone || '',
        website: website || '',
        source,
        service,
        requirement: notes || 'Imported via CSV',
        status,
        priority,
      };

      const rawItem: CsvLeadRow = {
        name,
        company,
        email,
        phone,
        website,
        source,
        service,
        status,
        priority,
        notes,
      };

      if (dupCheck.isDuplicate) {
        duplicateRows.push({
          raw: rawItem,
          reasons: dupCheck.reasons,
          matchingLeadName: dupCheck.matchingLeads[0]?.name || 'Existing Lead',
        });
      } else {
        validRows.push({
          data: leadData,
          raw: rawItem,
        });
      }
    });

    return {
      validRows,
      duplicateRows,
      invalidRows,
      totalParsed: rawRows.length,
    };
  },
};
