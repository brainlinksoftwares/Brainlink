import { leadHunterService } from '../services/leadHunterService';

describe('Google Business Lead Hunter Suite', () => {
  test('extracts local leads for Barber niche with valid phone numbers and opportunity scoring', async () => {
    const leads = await leadHunterService.searchLeads({
      query: 'Barber',
      location: 'Noida',
      onlyMissingWebsite: true,
      onlyMissingApp: true,
      minRating: 4.0,
    });

    expect(leads.length).toBeGreaterThan(0);
    const first = leads[0];
    expect(first.name).toContain('Barber');
    expect(first.city).toBe('Noida');
    expect(first.phone).toMatch(/^\+91/);
    expect(first.hasWebsite).toBe(false);
    expect(first.opportunityScore).toBe('Hot');
    expect(first.googleMapsUrl).toContain('google.com/maps');
  });

  test('generates tailored WhatsApp and phone pitch script with business name and rating', async () => {
    const mockLead = {
      id: 'test_123',
      name: 'Royal Barber Lounge',
      category: 'Barber',
      city: 'Lucknow',
      address: 'Hazratganj, Lucknow',
      phone: '+91 98100 12345',
      whatsappAvailable: true,
      hasWebsite: false,
      hasMobileApp: false,
      rating: 4.6,
      reviewCount: 110,
      opportunityScore: 'Hot' as const,
      opportunityReason: 'Prime target with no website',
      recommendedServices: ['Appointment Booking System'],
    };

    const whatsappPitch = leadHunterService.generateOutreachScript(mockLead, 'whatsapp');
    expect(whatsappPitch).toContain('Royal Barber Lounge');
    expect(whatsappPitch).toContain('Lucknow');
    expect(whatsappPitch).toContain('4.6★');
    expect(whatsappPitch).toContain('Brainlink Softwares');

    const callScript = leadHunterService.generateOutreachScript(mockLead, 'call');
    expect(callScript).toContain('Pitch Call Script');
    expect(callScript).toContain('Royal Barber Lounge');
  });
});
