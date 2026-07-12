import type { BorderReport, CompanionPost } from '../types';
import { apiRequest } from './client';

export async function fetchCompanionPosts() {
  return apiRequest<{ posts: CompanionPost[] }>('/api/community/companions', { method: 'GET' }, true);
}

export async function createCompanionPost(payload: {
  route: string;
  date: string;
  seatsNeeded: number;
  message: string;
  transport?: string;
}) {
  return apiRequest<{ posts: CompanionPost[] }>(
    '/api/community/companions',
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
}

export async function fetchBorderReports(checkpointId: string) {
  return apiRequest<{ reports: BorderReport[] }>(
    `/api/community/border?checkpointId=${encodeURIComponent(checkpointId)}`,
    { method: 'GET' },
    true,
  );
}

export async function createBorderReport(payload: { checkpointId: string; message: string }) {
  return apiRequest<{ reports: BorderReport[] }>(
    '/api/community/border',
    { method: 'POST', body: JSON.stringify(payload) },
    true,
  );
}
