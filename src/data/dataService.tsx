/**
 * dataService.tsx
 *
 * Session is stored with expo-secure-store — works in Expo Go on Android/iOS,
 * persists across full app restarts. Falls back to localStorage on web.
 *
 * App data (posts, regions, etc.) uses @react-native-async-storage which is
 * fine for non-sensitive bulk data — if it fails it just reloads seed data.
 */

import * as SecureStore from 'expo-secure-store';
import { SEED } from './seedData';
import { AppData, Account } from '../types';

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Is localStorage available (web/browser)? */
const isWeb = typeof localStorage !== 'undefined';

/** Read a value — SecureStore on native, localStorage on web. */
async function read(key: string): Promise<string | null> {
  try {
    if (isWeb) return localStorage.getItem(key);
    return await SecureStore.getItemAsync(key);
  } catch {
    return null;
  }
}

/** Write a value — SecureStore on native, localStorage on web. */
async function write(key: string, value: string): Promise<void> {
  try {
    if (isWeb) { localStorage.setItem(key, value); return; }
    await SecureStore.setItemAsync(key, value);
  } catch { /* ignore */ }
}

/** Delete a value. */
async function remove(key: string): Promise<void> {
  try {
    if (isWeb) { localStorage.removeItem(key); return; }
    await SecureStore.deleteItemAsync(key);
  } catch { /* ignore */ }
}

// ─── Keys ─────────────────────────────────────────────────────────────────────

const SESSION_KEY = 'pc_session';
const DATA_KEY    = 'pc_data';

// ─── App data ─────────────────────────────────────────────────────────────────

const SEED_VERSION    = '7';          // bump this whenever seed accounts change
const SEED_VER_KEY    = 'pc_seed_ver';

export async function loadData(): Promise<AppData> {
  try {
    const ver = await read(SEED_VER_KEY);
    if (ver !== SEED_VERSION) {
      // Seed has been updated — wipe cached data so fresh seed is used
      await remove(DATA_KEY);
      await write(SEED_VER_KEY, SEED_VERSION);
      return JSON.parse(JSON.stringify(SEED));
    }
    const raw = await read(DATA_KEY);
    return raw ? JSON.parse(raw) : JSON.parse(JSON.stringify(SEED));
  } catch {
    return JSON.parse(JSON.stringify(SEED));
  }
}

export async function saveData(data: AppData): Promise<void> {
  await write(DATA_KEY, JSON.stringify(data));
}

export async function resetData(): Promise<AppData> {
  const fresh = JSON.parse(JSON.stringify(SEED));
  await write(DATA_KEY, JSON.stringify(fresh));
  return fresh;
}

// ─── Session — persisted across restarts via SecureStore ─────────────────────

export async function getSession(): Promise<Account | null> {
  try {
    const raw = await read(SESSION_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export async function setSession(session: Account): Promise<void> {
  await write(SESSION_KEY, JSON.stringify(session));
}

export async function clearSession(): Promise<void> {
  await remove(SESSION_KEY);
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export async function loginUser(
  email: string, password: string, data: AppData
): Promise<Account | null> {
  const acc = data.accounts.find(
    (a) => a.email === email && a.password === password && a.role === 'user'
  );
  return acc ?? null;
}

export async function registerUser(
  name: string, email: string, password: string, data: AppData
): Promise<{ account?: Account; error?: string }> {
  if (data.accounts.find((a) => a.email === email)) {
    return { error: 'Email already registered' };
  }
  const newAcc: Account = {
    id: 'u' + Date.now(),
    role: 'user',
    name,
    email,
    password,
    regionId: null,
    candidateId: undefined,
  };
  data.accounts.push(newAcc);
  await saveData(data);
  return { account: newAcc };
}

export async function saveRegionCandidate(
  accountId: string, regionId: string, candidateId: string, data: AppData
): Promise<void> {
  const acc = data.accounts.find((a) => a.id === accountId);
  if (acc) {
    acc.regionId   = regionId;
    acc.candidateId = candidateId;
    await saveData(data);
  }
}

// ─── Queries ─────────────────────────────────────────────────────────────────

export function getNotificationsForUser(account: Account, data: AppData) {
  if (!account.regionId) return data.notifications.filter((n) => n.regionId === null);
  return data.notifications.filter(
    (n) => n.regionId === account.regionId || n.regionId === null
  );
}

export function getPostsForUser(account: Account, data: AppData) {
  return data.posts.filter(
    (p) =>
      p.status === 'published' &&
      (p.ownerType === 'party' || p.regionId === account.regionId)
  );
}
