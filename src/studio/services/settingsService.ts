import { storageEngine } from './storageEngine';
import { DEFAULT_LEAD_SOURCES, DEFAULT_SERVICES } from '../config/crmConfig';

const SOURCES_KEY = 'crm_sources';
const SERVICES_KEY = 'crm_services';

export interface IntegrationStatus {
  id: string;
  name: string;
  category: 'Communication' | 'Ads' | 'Calendar' | 'Email';
  description: string;
  icon: string;
  connected: boolean;
  configuredAt?: string;
}

export const INITIAL_INTEGRATIONS: IntegrationStatus[] = [
  {
    id: 'whatsapp_business',
    name: 'WhatsApp Business Cloud API',
    category: 'Communication',
    description: 'Direct WhatsApp notification & lead messaging bridge',
    icon: 'MessageSquare',
    connected: false,
  },
  {
    id: 'google_workspace',
    name: 'Google Workspace (Gmail & Calendar)',
    category: 'Communication',
    description: 'Sync client meetings, sales calls, and thread logs',
    icon: 'Mail',
    connected: false,
  },
  {
    id: 'meta_lead_ads',
    name: 'Meta Lead Ads (Facebook & Instagram)',
    category: 'Ads',
    description: 'Auto-ingest ad form submissions straight into Brainlink pipeline',
    icon: 'Globe',
    connected: false,
  },
  {
    id: 'linkedin_sales',
    name: 'LinkedIn Lead Gen Forms',
    category: 'Ads',
    description: 'Capture B2B decision-maker leads directly from LinkedIn campaigns',
    icon: 'Share2',
    connected: false,
  },
  {
    id: 'public_web_forms',
    name: 'Brainlink Website Form Webhook (/apply)',
    category: 'Communication',
    description: 'Active public embed webhook for website lead capture',
    icon: 'Code',
    connected: true, // Active out of the box via /apply!
  },
];

export const settingsService = {
  getLeadSources: async (): Promise<string[]> => {
    const list = storageEngine.get<string>(SOURCES_KEY);
    return list.length > 0 ? list : DEFAULT_LEAD_SOURCES;
  },

  setLeadSources: async (sources: string[]): Promise<void> => {
    storageEngine.set(SOURCES_KEY, sources);
  },

  getServices: async (): Promise<string[]> => {
    const list = storageEngine.get<string>(SERVICES_KEY);
    return list.length > 0 ? list : DEFAULT_SERVICES;
  },

  setServices: async (services: string[]): Promise<void> => {
    storageEngine.set(SERVICES_KEY, services);
  },

  getIntegrations: async (): Promise<IntegrationStatus[]> => {
    const list = storageEngine.get<IntegrationStatus>('crm_integrations');
    return list.length > 0 ? list : INITIAL_INTEGRATIONS;
  },

  updateIntegrationStatus: async (
    id: string,
    connected: boolean
  ): Promise<IntegrationStatus[]> => {
    const current = await settingsService.getIntegrations();
    const updated = current.map((item) =>
      item.id === id
        ? {
            ...item,
            connected,
            configuredAt: connected ? new Date().toISOString() : undefined,
          }
        : item
    );
    storageEngine.set('crm_integrations', updated);
    return updated;
  },
};
