import type { AppSettings, VisaTrackerState } from '../types';
import { apiRequest } from './client';

export type ServerSettings = Omit<AppSettings, 'pinEnabled' | 'pinCode'>;

export async function fetchTracker() {
  return apiRequest<{ tracker: VisaTrackerState }>('/api/tracker', { method: 'GET' }, true);
}

export async function saveTracker(tracker: VisaTrackerState) {
  return apiRequest<{ tracker: VisaTrackerState }>(
    '/api/tracker',
    { method: 'PUT', body: JSON.stringify(tracker) },
    true,
  );
}

export async function patchTracker(patch: Partial<VisaTrackerState>) {
  return apiRequest<{ tracker: VisaTrackerState }>(
    '/api/tracker',
    { method: 'PATCH', body: JSON.stringify(patch) },
    true,
  );
}

export async function fetchSettings() {
  return apiRequest<{ settings: ServerSettings }>('/api/settings', { method: 'GET' }, true);
}

export async function saveSettings(settings: ServerSettings) {
  return apiRequest<{ settings: ServerSettings }>(
    '/api/settings',
    { method: 'PUT', body: JSON.stringify(settings) },
    true,
  );
}

export async function patchSettings(patch: Partial<ServerSettings>) {
  return apiRequest<{ settings: ServerSettings }>(
    '/api/settings',
    { method: 'PATCH', body: JSON.stringify(patch) },
    true,
  );
}
