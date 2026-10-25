import { apiClient } from './apiClient';
import { ExternalIntelligenceItem } from '../types';

const JSONPLACEHOLDER_BASE = 'https://jsonplaceholder.typicode.com';

const CATEGORIES = [
  'CYBER_SECURITY',
  'TELEMETRY',
  'FINANCIAL_AUDIT',
  'BALLISTICS',
  'SURVEILLANCE_DISPATCH',
  'INTERPOL_BULLETIN'
];

/**
 * Maps raw JSONPlaceholder posts into classified intelligence intelligence items
 */
const enrichPost = (post: any): ExternalIntelligenceItem => {
  const category = CATEGORIES[post.id % CATEGORIES.length];
  const reliability = 65 + ((post.id * 17) % 34); // Deterministic score 65-98%
  return {
    id: post.id,
    title: post.title.toUpperCase(),
    body: post.body,
    userId: post.userId,
    category,
    source: `GLOBAL-INTEL-FEED-#${post.userId}`,
    reliability
  };
};

export const intelligenceApi = {
  /**
   * Fetch paginated or batch external demonstration intelligence records
   */
  async getRecords(limit: number = 30, signal?: AbortSignal): Promise<ExternalIntelligenceItem[]> {
    const raw = await apiClient.get<any[]>(`${JSONPLACEHOLDER_BASE}/posts?_limit=${limit}`, { signal });
    return raw.map(enrichPost);
  },

  /**
   * Fetch a single external intelligence record by ID
   */
  async getRecordById(id: number | string, signal?: AbortSignal): Promise<ExternalIntelligenceItem> {
    const raw = await apiClient.get<any>(`${JSONPLACEHOLDER_BASE}/posts/${id}`, { signal });
    return enrichPost(raw);
  },

  /**
   * Create demonstration record via REST POST
   * Note: JSONPlaceholder simulates writes and returns the created mock record with id 101
   */
  async createRecord(payload: { title: string; body: string; userId?: number }, signal?: AbortSignal): Promise<ExternalIntelligenceItem> {
    const response = await apiClient.post<any>(`${JSONPLACEHOLDER_BASE}/posts`, {
      title: payload.title,
      body: payload.body,
      userId: payload.userId || 1
    }, { signal });
    return enrichPost(response);
  },

  /**
   * Update demonstration record via REST PUT
   */
  async updateRecord(id: number | string, payload: { title: string; body: string }, signal?: AbortSignal): Promise<ExternalIntelligenceItem> {
    const response = await apiClient.put<any>(`${JSONPLACEHOLDER_BASE}/posts/${id}`, {
      id: Number(id),
      title: payload.title,
      body: payload.body,
      userId: 1
    }, { signal });
    return enrichPost(response);
  },

  /**
   * Delete demonstration record via REST DELETE
   */
  async deleteRecord(id: number | string, signal?: AbortSignal): Promise<{ success: boolean; id: number | string }> {
    await apiClient.delete<any>(`${JSONPLACEHOLDER_BASE}/posts/${id}`, { signal });
    return { success: true, id };
  }
};
