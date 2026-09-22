import { Lead, DuplicateCheckResult } from '../types';

/**
 * Normalizes phone or whatsapp strings (removes spaces, dashes, parentheses, +91 prefixes)
 */
export function normalizePhoneNumber(phone?: string): string {
  if (!phone) return '';
  const digits = phone.replace(/\D/g, '');
  // If starts with 91 and has 12 digits, strip country code for consistent 10-digit check
  if (digits.startsWith('91') && digits.length === 12) {
    return digits.slice(2);
  }
  return digits;
}

/**
 * Normalizes email address
 */
export function normalizeEmail(email?: string): string {
  return (email || '').trim().toLowerCase();
}

/**
 * Normalizes company name (strips whitespace, common corporate suffixes)
 */
export function normalizeCompany(company?: string): string {
  return (company || '')
    .toLowerCase()
    .replace(/\b(ltd|pvt|inc|corp|technologies|softwares|solutions|llc)\b/gi, '')
    .replace(/[^a-z0-9]/g, '')
    .trim();
}

/**
 * Checks if a proposed lead shares email, phone, whatsapp, or company+email with any existing leads
 */
export function detectDuplicateLead(
  candidate: {
    email?: string;
    phone?: string;
    whatsapp?: string;
    company?: string;
  },
  existingLeads: Lead[],
  ignoreLeadId?: string
): DuplicateCheckResult {
  const normCandEmail = normalizeEmail(candidate.email);
  const normCandPhone = normalizePhoneNumber(candidate.phone);
  const normCandWhatsapp = normalizePhoneNumber(candidate.whatsapp);
  const normCandComp = normalizeCompany(candidate.company);

  const matchedLeads: Lead[] = [];
  const reasonsSet = new Set<string>();

  for (const lead of existingLeads) {
    if (lead.id === ignoreLeadId || lead.archived) continue;

    let matched = false;

    // 1. Email check
    if (normCandEmail && normalizeEmail(lead.email) === normCandEmail) {
      reasonsSet.add(`Matching email address (${candidate.email})`);
      matched = true;
    }

    // 2. Phone check
    if (normCandPhone && normalizePhoneNumber(lead.phone) === normCandPhone) {
      reasonsSet.add(`Matching primary phone number (${candidate.phone})`);
      matched = true;
    }

    // 3. WhatsApp check
    if (normCandWhatsapp && normalizePhoneNumber(lead.whatsapp) === normCandWhatsapp) {
      reasonsSet.add(`Matching WhatsApp number (${candidate.whatsapp})`);
      matched = true;
    }

    // 4. Cross-match Phone with WhatsApp
    if (normCandPhone && normalizePhoneNumber(lead.whatsapp) === normCandPhone) {
      reasonsSet.add(`Phone matches WhatsApp of an existing lead`);
      matched = true;
    }

    // 5. Company + Email match
    if (
      normCandComp &&
      normCandComp.length > 2 &&
      normCandEmail &&
      normalizeCompany(lead.company) === normCandComp &&
      normalizeEmail(lead.email) === normCandEmail
    ) {
      reasonsSet.add(`Company '${candidate.company}' with identical email`);
      matched = true;
    }

    if (matched) {
      matchedLeads.push(lead);
    }
  }

  return {
    isDuplicate: matchedLeads.length > 0,
    matchingLeads: matchedLeads,
    reasons: Array.from(reasonsSet),
  };
}
