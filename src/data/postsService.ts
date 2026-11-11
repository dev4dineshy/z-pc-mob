/**
 * postsService.ts
 *
 * All post-related queries for the mobile app.
 *
 * Operates on the API-backed AppData loaded by the application context.
 *
 * Post visibility rules (mirrors the web admin portal):
 *   - Only posts with status === 'published' are shown.
 *   - Drafts are never exposed.
 *   - Posts are sorted newest-first by publishedAt ?? createdAt.
 */

import { AppData, Post, Channel, Candidate } from '../types';
import { formatTimestamp, timestampToMilliseconds } from '../utils/date';

// ─── Public post shape ────────────────────────────────────────────────────────

/** Resolved post with denormalised owner and channel info */
export interface ResolvedPost extends Post {
  ownerName: string;
  ownerLabel: string;
  platformLabels: string[];
  platforms: Array<'facebook' | 'youtube' | 'x'>;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function sortKey(p: Post): number {
  return timestampToMilliseconds(p.publishedAt ?? p.createdAt);
}

function resolvePost(post: Post, data: AppData): ResolvedPost {
  let ownerName = 'PeopleConnect';
  let ownerLabel = 'PeopleConnect';

  if (post.ownerType === 'party') {
    ownerName  = data.party?.name ?? 'Party';
    ownerLabel = data.party?.name ?? 'Party';
  } else if (post.ownerType === 'candidate') {
    const cand: Candidate | undefined = data.candidates.find(c => c.id === post.ownerId);
    if (cand) {
      const region = data.regions.find(r => r.id === cand.regionId);
      ownerName  = cand.name;
      ownerLabel = region ? `${cand.name} · ${region.name}` : cand.name;
    }
  }

  const channels: Channel[] = (post.channelIds ?? [])
    .map(id => data.channels.find(ch => ch.id === id))
    .filter(Boolean) as Channel[];

  const platforms = [...new Set(channels.map(ch => ch.platform))];
  const platformLabels = platforms.map(p =>
    p === 'facebook' ? 'Facebook' : p === 'youtube' ? 'YouTube' : 'X'
  );

  return { ...post, ownerName, ownerLabel, platformLabels, platforms };
}

// ─── Public API ───────────────────────────────────────────────────────────────

/**
 * Return all published posts, newest first.
 * Pass `regionId` to include region-specific posts alongside global ones.
 */
export function getPublishedPosts(
  data: AppData,
  options?: { regionId?: string | null; limit?: number; offset?: number }
): ResolvedPost[] {
  const { regionId, limit, offset = 0 } = options ?? {};

  const filtered = data.posts
    .filter(p => {
      if (p.status !== 'published') return false;
      // global posts (regionId === null) always visible
      if (p.regionId === null) return true;
      // region-specific: only show if the user is in that region
      if (regionId) return p.regionId === regionId;
      return false;   // no region set → skip region-specific posts
    })
    .sort((a, b) => sortKey(b) - sortKey(a));

  const paged = limit != null
    ? filtered.slice(offset, offset + limit)
    : filtered.slice(offset);

  return paged.map(p => resolvePost(p, data));
}

/** Return a single published post by id, or null if not found / not published. */
export function getPublishedPost(
  id: string,
  data: AppData
): ResolvedPost | null {
  const post = data.posts.find(p => p.id === id && p.status === 'published');
  return post ? resolvePost(post, data) : null;
}

/** Format a date string for display, e.g. "30 Sep 2026" */
export function formatPostDate(dateStr: string): string {
  return formatTimestamp(dateStr);
}

/** Human-readable post type label */
export function postTypeLabel(type?: string | null): string {
  switch (type) {
    case 'event':        return 'Event';
    case 'survey':       return 'Survey';
    case 'announcement': return 'Announcement';
    case 'update':
    default:             return 'Update';
  }
}

/** Accent colour per post type */
export function postTypeColor(type?: string | null): string {
  switch (type) {
    case 'event':        return '#0891B2';   // cyan
    case 'survey':       return '#7C3AED';   // purple
    case 'announcement': return '#2563EB';   // blue
    case 'update':
    default:             return '#0D9488';   // teal
  }
}

/** Platform accent colour */
export function platformColor(platform: 'facebook' | 'youtube' | 'x'): string {
  switch (platform) {
    case 'facebook': return '#1877F2';
    case 'youtube':  return '#FF0000';
    case 'x':        return '#14171A';
  }
}
