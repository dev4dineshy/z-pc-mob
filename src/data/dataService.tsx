import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';
import { Account, AppData } from '../types';
import { encryptLoginPassword } from '../utils/passwordEncryption';

const API_URL = (process.env.EXPO_PUBLIC_API_URL || (Platform.OS === 'android' ? 'http://10.0.2.2:8000/api/v1' : 'http://127.0.0.1:8000/api/v1')).replace(/\/$/, '');
const isWeb = typeof localStorage !== 'undefined';
const SESSION_KEY = 'pc_session';
const ACCESS_KEY = 'pc_access';
const REFRESH_KEY = 'pc_refresh';

async function read(key: string): Promise<string | null> {
  try { return isWeb ? localStorage.getItem(key) : await SecureStore.getItemAsync(key); } catch { return null; }
}
async function write(key: string, value: string): Promise<void> {
  if (isWeb) localStorage.setItem(key, value); else await SecureStore.setItemAsync(key, value);
}
async function remove(key: string): Promise<void> {
  try { if (isWeb) localStorage.removeItem(key); else await SecureStore.deleteItemAsync(key); } catch { /* already absent */ }
}

export class ApiError extends Error {
  constructor(message: string, public status: number, public details?: unknown) { super(message); }
}
function errorMessage(payload: any): string {
  const details = payload?.error?.details ?? payload;
  if (typeof details === 'string') return details;
  if (details?.detail) return String(details.detail);
  if (details && typeof details === 'object') {
    const first = Object.values(details).flat()[0]; if (first) return String(first);
  }
  return 'The request could not be completed.';
}

function unwrapPayload<T>(payload: any): T {
  if (payload?.success === true && Object.prototype.hasOwnProperty.call(payload, 'data')) {
    return payload.data as T;
  }
  return payload as T;
}

async function refreshAccess(): Promise<boolean> {
  const refresh = await read(REFRESH_KEY); if (!refresh) return false;
  const response = await fetch(`${API_URL}/auth/refresh/`, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ refresh }) });
  if (!response.ok) return false;
  const tokens = unwrapPayload<{ access: string; refresh: string }>(await response.json()); await write(ACCESS_KEY, tokens.access);
  if (tokens.refresh) await write(REFRESH_KEY, tokens.refresh);
  return true;
}

export async function apiRequest<T>(path: string, init: RequestInit = {}, retry = true): Promise<T> {
  const headers = new Headers(init.headers); const access = await read(ACCESS_KEY);
  if (!headers.has('Content-Type')) headers.set('Content-Type', 'application/json');
  if (access) headers.set('Authorization', `Bearer ${access}`);
  const url = path.startsWith('http') ? path : `${API_URL}/${path.replace(/^\//, '')}`;
  const method = init.method ?? 'GET';
  if (__DEV__) console.debug(`[API] ${method} ${url}`);
  const response = await fetch(url, { ...init, headers });
  if (__DEV__) console.debug(`[API] ${method} ${url} -> ${response.status}`);
  if (response.status === 401 && retry && await refreshAccess()) return apiRequest<T>(path, init, false);
  if (response.status === 204) return undefined as T;
  const payload = await response.json().catch(() => null);
  if (!response.ok) throw new ApiError(errorMessage(payload), response.status, payload?.error?.details);
  return unwrapPayload<T>(payload);
}

async function list<T = any>(path: string): Promise<T[]> {
  const payload: any = await apiRequest<any>(path);
  if (Array.isArray(payload)) return payload;
  return Array.isArray(payload?.data) ? payload.data : (payload?.results ?? []);
}
async function optional<T>(path: string, fallback: T): Promise<T> {
  try { return await apiRequest<T>(path); }
  catch (error) { if (error instanceof ApiError && error.status === 404) return fallback; throw error; }
}

export const createEmptyData = (): AppData => ({
  meta: { description: 'PeopleConnect API data' }, party: { id: '', name: '', about: '', manifesto: [] },
  regions: [], candidates: [], accounts: [], channels: [], posts: [], schemes: [], notifications: [], events: [], campaigns: [],
  surveys: [], gallery: [], videos: [], news: [], development: [], phoneNumbers: [], manifesto_items: [], complaints: [], feedback: [],
});

export type DataResource = 'party' | 'regions' | 'candidates' | 'accounts' | 'channels' |
  'posts' | 'schemes' | 'notifications' | 'events' | 'campaigns' | 'surveys' | 'gallery' |
  'videos' | 'news' | 'development' | 'health' | 'phoneNumbers' | 'contact' |
  'manifesto_items' | 'complaints' | 'feedback';

const resourceBatches = new Map<string, Promise<Partial<AppData>>>();

export async function loadResources(resources: DataResource[]): Promise<Partial<AppData>> {
  const unique = [...new Set(resources)];
  const key = [...unique].sort().join('|');
  const existing = resourceBatches.get(key);
  if (existing) return existing;
  const request = Promise.all(unique.map(async (resource) => {
    switch (resource) {
      case 'party': return [resource, (await optional('party/', createEmptyData().party)) ?? createEmptyData().party];
      case 'regions': return [resource, await list('regions/')];
      case 'candidates': return [resource, await list('candidates/')];
      case 'accounts': return [resource, await list('users/')];
      case 'channels': return [resource, await list('channels/')];
      case 'posts': return [resource, await list('posts/')];
      case 'schemes': return [resource, await list('schemes/')];
      case 'notifications': return [resource, await list('notifications/')];
      case 'events': return [resource, await list('events/')];
      case 'campaigns': return [resource, await list('campaigns/')];
      case 'surveys': return [resource, await list('surveys/')];
      case 'gallery': return [resource, await list('gallery/')];
      case 'videos': return [resource, await list('videos/')];
      case 'news': return [resource, await list('news/')];
      case 'development': return [resource, await list('development/')];
      case 'health': return [resource, await optional('health/', undefined)];
      case 'phoneNumbers': return [resource, await list('phone-numbers/')];
      case 'contact': return [resource, await optional('contact/', undefined)];
      case 'manifesto_items': return [resource, await list('manifesto/')];
      case 'complaints': return [resource, await list('complaints/')];
      case 'feedback': return [resource, await list('feedback/')];
    }
  })).then((entries) => Object.fromEntries(entries) as Partial<AppData>);
  resourceBatches.set(key, request);
  try { return await request; }
  finally { resourceBatches.delete(key); }
}

export async function getSession(): Promise<Account | null> {
  const raw = await read(SESSION_KEY); if (!raw) return null;
  try {
    const account = await apiRequest<Account>('auth/me/'); await write(SESSION_KEY, JSON.stringify(account)); return account;
  } catch (error) {
    if (error instanceof ApiError && error.status === 401) {
      await clearLocalSession();
      return null;
    }
    throw error;
  }
}
export async function setSession(session: Account): Promise<void> { await write(SESSION_KEY, JSON.stringify(session)); }
async function clearLocalSession() { await Promise.all([remove(SESSION_KEY), remove(ACCESS_KEY), remove(REFRESH_KEY)]); }
export async function clearSession(): Promise<void> {
  const refresh = await read(REFRESH_KEY);
  try { if (refresh) await apiRequest('auth/logout/', { method: 'POST', body: JSON.stringify({ refresh }) }); }
  finally { await clearLocalSession(); }
}

async function persistAuth(result: { access: string; refresh: string; user: Account }) {
  await Promise.all([write(ACCESS_KEY, result.access), write(REFRESH_KEY, result.refresh), write(SESSION_KEY, JSON.stringify(result.user))]);
}
export async function loginUser(email: string, password: string, _data?: AppData): Promise<Account | null> {
  try {
    const result = await apiRequest<{ access: string; refresh: string; user: Account }>('auth/login/', {
      method: 'POST',
      headers: { 'X-Client-Type': 'mobile' },
      body: JSON.stringify({ userName: email, password: encryptLoginPassword(password) }),
    });
    await persistAuth(result); return result.user;
  } catch (error) { if (error instanceof ApiError && error.status < 500) return null; throw error; }
}
export async function registerUser(name: string, email: string, password: string, _data?: AppData): Promise<{ account?: Account; error?: string }> {
  try {
    const result = await apiRequest<{ access: string; refresh: string; user: Account }>('auth/register/', { method: 'POST', body: JSON.stringify({ name, email, password }) });
    await persistAuth(result); return { account: result.user };
  } catch (error) { return { error: error instanceof Error ? error.message : 'Registration failed.' }; }
}
export async function saveRegionCandidate(_accountId: string, regionId: string, candidateId: string, _data?: AppData): Promise<Account> {
  const account = await apiRequest<Account>('auth/preferences/', { method: 'PATCH', body: JSON.stringify({ regionId, candidateId }) });
  await setSession(account); return account;
}
export const createComplaint = (payload: { category: string; location: string; description: string }) => apiRequest<any>('complaints/', { method: 'POST', body: JSON.stringify(payload) });
export const createFeedback = (payload: { rating: number; topic: string; text: string; name: string }) => apiRequest<any>('feedback/', { method: 'POST', body: JSON.stringify(payload) });
export const markNotificationRead = (id: string) => apiRequest<any>(`notifications/${id}/`, { method: 'PATCH', body: JSON.stringify({ read: true }) });

export function getNotificationsForUser(account: Account, data: AppData) {
  if (!account.regionId) return data.notifications.filter(n => n.regionId === null);
  return data.notifications.filter(n => n.regionId === account.regionId || n.regionId === null);
}
export function getPostsForUser(account: Account, data: AppData) {
  return data.posts.filter(p => p.status === 'published' && (p.ownerType === 'party' || p.regionId === account.regionId));
}
