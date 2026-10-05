export interface Region { id: string; name: string; }
export interface Candidate { id: string; name: string; regionId: string; email: string; bio: string; photoUrl: string | null; }
export interface Account { id: string; role: 'admin' | 'candidate' | 'user'; name: string; email: string; password: string; candidateId?: string; regionId?: string | null; }
export interface Channel { id: string; ownerType: 'party' | 'candidate'; ownerId: string; platform: 'facebook' | 'youtube' | 'x'; label: string; connected: boolean; }
export interface Post {
  id: string;
  ownerType: 'party' | 'candidate';
  ownerId: string;
  regionId: string | null;
  /** Short headline shown in cards */
  title: string;
  /** Full post body / caption — render this directly, do not fetch from social URL */
  body: string;
  status: 'draft' | 'published';
  channelIds: string[];
  /** Direct URL to the original social-media post, if synced */
  originalPostUrl?: string | null;
  metrics: { likes: number; comments: number; reshares: number };
  /** ISO date string — primary sort key */
  createdAt: string;
  /** ISO date string when admin pressed Publish (may differ from createdAt) */
  publishedAt?: string | null;
  /** Post category / type  */
  type?: 'update' | 'survey' | 'event' | 'announcement';
  /** Optional stored image URL (relative path or https) — never fetch from social URL */
  imageUrl?: string | null;
  /** Free-form tags */
  tags?: string[];
}
export interface Scheme { id: string; title: string; description: string; regionId?: string | null; candidateId?: string | null; }
export interface Notification { id: string; regionId: string | null; candidateId: string | null; postId: string; title: string; body?: string; read: boolean; createdAt: string; }
export interface Event { id: string; candidateId: string | null; regionId: string | null; title: string; date: string; description?: string; }
export interface Campaign { id: string; title: string; candidateId: string | null; regionId: string | null; body: string; status: string; createdAt: string; }
export interface Survey { id: string; title: string; candidateId: string | null; regionId: string | null; questions: string[]; responses: number; createdAt: string; }
export interface GalleryItem { id: string; title: string; regionId: string | null; candidateId: string | null; mediaUrls: string[]; createdAt: string; }
export interface VideoItem { id: string; title: string; regionId: string | null; candidateId: string | null; url: string | null; createdAt: string; }
export interface AppData {
  meta: { demo: boolean; description: string };
  party: { id: string; name: string; about: string; manifesto: string[] };
  regions: Region[];
  candidates: Candidate[];
  accounts: Account[];
  channels: Channel[];
  posts: Post[];
  schemes: Scheme[];
  notifications: Notification[];
  events: Event[];
  campaigns: Campaign[];
  surveys: Survey[];
  gallery: GalleryItem[];
  videos: VideoItem[];
  complaints: any[];
  feedback: any[];
}
