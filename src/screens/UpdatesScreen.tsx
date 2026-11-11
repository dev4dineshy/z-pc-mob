import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Linking, Image, Dimensions } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { getNotificationsForUser } from '../data/dataService';
import { useApp } from '../AppContext';
import { markNotificationRead } from '../data/dataService';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { formatTimestamp } from '../utils/date';

const W = Dimensions.get('window').width;

// ─── Party logo (same mark used in AppHeader) ────────────────────────────────
const PARTY_LOGO = require('../../assets/images/logos/connected-people-symbol.png');

// ─── Thumbnail map (same keys used in posts imageUrl) ────────────────────────
const THUMB_MAP: Record<string, any> = {
  'asset:health-camp':          require('../../assets/images/thumbnails/health-clinic.png'),
  'asset:park-cleanup':         require('../../assets/images/thumbnails/park-cleanup.png'),
  'asset:community-office':     require('../../assets/images/thumbnails/community-office.png'),
  'asset:road-infrastructure':  require('../../assets/images/thumbnails/road-infrastructure.png'),
  'asset:education-school':     require('../../assets/images/thumbnails/education-school.png'),
  'asset:survey-clipboard':     require('../../assets/images/thumbnails/survey-clipboard.png'),
  'asset:street-lighting':      require('../../assets/images/thumbnails/street-lighting.png'),
};

// ─── Platform config ──────────────────────────────────────────────────────────
type Platform = 'facebook' | 'youtube' | 'x' | 'instagram';

const PLATFORM_CFG: Record<Platform, { color: string; icon: string; label: string }> = {
  facebook:  { color: '#1877F2', icon: 'facebook',       label: 'Facebook' },
  youtube:   { color: '#FF0000', icon: 'ondemand-video', label: 'YouTube' },
  x:         { color: '#14171A', icon: 'close',          label: 'X' },
  instagram: { color: '#C13584', icon: 'camera-alt',     label: 'Instagram' },
};

function detectPlatform(url?: string | null): Platform | null {
  if (!url) return null;
  if (url.includes('facebook.com'))  return 'facebook';
  if (url.includes('youtube.com') || url.includes('youtu.be')) return 'youtube';
  if (url.includes('instagram.com')) return 'instagram';
  if (url.includes('x.com') || url.includes('twitter.com')) return 'x';
  return null;
}

// ─── Time-ago helper ──────────────────────────────────────────────────────────
function timeAgo(dateStr: string): string {
  return formatTimestamp(dateStr);
}

// ─── Resolve navigation on tap ────────────────────────────────────────────────
async function resolveAction(notification: any, data: any, navigation: any): Promise<void> {
  const post = data.posts?.find((p: any) => p.id === notification.postId);
  if (!post) return;

  if (post.originalPostUrl) {
    try {
      await Linking.openURL(post.originalPostUrl);
      return;
    } catch { /* fall through */ }
  }

  switch (post.type) {
    case 'survey':      navigation.navigate('Schemes');                             break;
    case 'event':       navigation.navigate('CommunityHub');                        break;
    default:            navigation.navigate('PostDetail', { postId: post.id });     break;
  }
}

// ─── Avatar: logo for party, initials for candidate ──────────────────────────
function Avatar({ isParty, name, size = 44, bg = colors.teal }: { isParty: boolean; name: string; size?: number; bg?: string }) {
  if (isParty) {
    return (
      <View style={[av.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: colors.navy }]}>
        <Image source={PARTY_LOGO} style={{ width: size * 0.62, height: size * 0.62 }} resizeMode="contain" />
      </View>
    );
  }
  const parts = name.trim().split(' ');
  const letters = (parts[0]?.[0] ?? '') + (parts[1]?.[0] ?? '');
  return (
    <View style={[av.wrap, { width: size, height: size, borderRadius: size / 2, backgroundColor: bg }]}>
      <Text style={[av.txt, { fontSize: size * 0.36 }]}>{letters.toUpperCase()}</Text>
    </View>
  );
}
const av = StyleSheet.create({
  wrap: { justifyContent: 'center', alignItems: 'center' },
  txt:  { color: '#fff', fontWeight: '800' },
});

// ─── Platform badge ───────────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: Platform }) {
  const cfg = PLATFORM_CFG[platform];
  return (
    <View style={[pb.wrap, { backgroundColor: cfg.color }]}>
      <MaterialIcons name={cfg.icon as any} size={10} color="#fff" />
    </View>
  );
}
const pb = StyleSheet.create({
  wrap: { width: 18, height: 18, borderRadius: 9, justifyContent: 'center', alignItems: 'center', borderWidth: 1.5, borderColor: '#fff' },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function UpdatesScreen({ navigation }: any): React.JSX.Element {
  const { data, setData, session } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh(['notifications', 'posts', 'candidates', 'party', 'regions']);
  const account = session;
  const region  = data.regions.find((r: any) => r.id === account?.regionId);
  const notifications = account ? getNotificationsForUser(account, data) : [];

  async function markRead(nId: string) {
    await markNotificationRead(nId);
    const updated = {
      ...data,
      notifications: data.notifications.map((x: any) =>
        x.id === nId ? { ...x, read: true } : x,
      ),
    };
    setData(updated);
  }

  async function handlePress(n: any) {
    await markRead(n.id);
    await resolveAction(n, data, navigation);
  }

  const unread = notifications.filter((n: any) => !n.read).length;

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="home" region={region} />

      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.body}>

          {/* ── Header row ── */}
          <View style={s.headerRow}>
            <Text style={s.title}>Notifications</Text>
            {unread > 0 && (
              <View style={s.badge}>
                <Text style={s.badgeTxt}>{unread}</Text>
              </View>
            )}
          </View>

          {notifications.length === 0 && (
            <View style={s.empty}>
              <MaterialIcons name="notifications-off" size={44} color={colors.border} />
              <Text style={s.emptyTxt}>No notifications yet.</Text>
              <Text style={s.emptySubTxt}>Updates from your region will appear here.</Text>
            </View>
          )}

          {notifications.map((n: any) => {
            const post     = data.posts?.find((p: any) => p.id === n.postId);
            const owner    = post?.ownerType === 'candidate'
              ? data.candidates?.find((c: any) => c.id === post?.ownerId)
              : null;
            const isParty   = post?.ownerType === 'party';
            const ownerName = owner?.name ?? data.party?.name ?? 'PeopleConnect Party';
            const avatarBg  = owner ? '#137F89' : colors.navy;

            const thumb     = post?.imageUrl ? THUMB_MAP[post.imageUrl] ?? null : null;
            const platform  = detectPlatform(post?.originalPostUrl);
            const cfg       = platform ? PLATFORM_CFG[platform] : null;

            return (
              <TouchableOpacity
                key={n.id}
                style={[s.card, !n.read && s.cardUnread]}
                onPress={() => handlePress(n)}
                activeOpacity={0.78}
              >
                {/* ── Left: avatar + platform badge ── */}
                <View style={s.avatarCol}>
                  <Avatar isParty={isParty} name={ownerName} size={44} bg={avatarBg} />
                  {platform && (
                    <View style={s.badgePos}>
                      <PlatformBadge platform={platform} />
                    </View>
                  )}
                </View>

                {/* ── Middle: text ── */}
                <View style={s.textCol}>
                  {/* Title line */}
                  <Text style={s.cardTitle} numberOfLines={2}>
                    <Text style={s.ownerName}>{ownerName} </Text>
                    <Text style={s.actionTxt}>{n.title.replace(ownerName, '').trim()}</Text>
                  </Text>

                  {/* Body snippet */}
                  <Text style={s.cardBody} numberOfLines={2}>{n.body}</Text>

                  {/* Footer: time + platform label */}
                  <View style={s.footRow}>
                    <Text style={[s.timeAgo, !n.read && s.timeAgoUnread]}>{timeAgo(n.createdAt)}</Text>
                    {cfg && (
                      <>
                        <View style={s.dot} />
                        <Text style={[s.platLabel, { color: cfg.color }]}>{cfg.label}</Text>
                      </>
                    )}
                    {!n.read && <View style={s.unreadDot} />}
                  </View>
                </View>

                {/* ── Right: thumbnail ── */}
                {thumb ? (
                  <Image source={thumb} style={s.thumb} resizeMode="cover" />
                ) : (
                  <View style={[s.thumbPlaceholder, cfg && { backgroundColor: cfg.color + '18' }]}>
                    <MaterialIcons
                      name={cfg ? (cfg.icon as any) : 'article'}
                      size={20}
                      color={cfg ? cfg.color : colors.textMuted}
                    />
                  </View>
                )}
              </TouchableOpacity>
            );
          })}

          {/* ── Footer hint ── */}
          {notifications.length > 0 && (
            <View style={s.infoBox}>
              <MaterialIcons name="info-outline" size={13} color={colors.textMuted} style={{ marginTop: 1 }} />
              <Text style={s.infoTxt}>Tap to open the post in the original app.</Text>
            </View>
          )}

        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { paddingBottom: spacing.xl },

  headerRow: {
    flexDirection: 'row', alignItems: 'center', gap: spacing.sm,
    paddingHorizontal: spacing.md, paddingTop: spacing.md, paddingBottom: spacing.sm,
  },
  title: { fontSize: 20, fontWeight: '800', color: colors.navy },
  badge: { backgroundColor: colors.teal, borderRadius: radius.full, minWidth: 22, height: 22, justifyContent: 'center', alignItems: 'center', paddingHorizontal: 6 },
  badgeTxt: { color: '#fff', fontSize: 12, fontWeight: '800' },

  // ── Cards ──
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.white,
    paddingVertical: 14,
    paddingHorizontal: spacing.md,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    gap: 12,
  },
  cardUnread: { backgroundColor: '#F0FAF9' },

  // ── Avatar column ──
  avatarCol: { position: 'relative' },
  badgePos:  { position: 'absolute', bottom: -2, right: -2 },

  // ── Text column ──
  textCol:   { flex: 1 },
  cardTitle: { fontSize: 13, color: colors.navy, lineHeight: 18, marginBottom: 3 },
  ownerName: { fontWeight: '800' },
  actionTxt: { fontWeight: '400' },
  cardBody:  { fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: 5 },

  footRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  timeAgo:      { fontSize: 11, color: colors.textMuted, fontWeight: '500' },
  timeAgoUnread:{ color: colors.teal, fontWeight: '700' },
  dot:          { width: 3, height: 3, borderRadius: 1.5, backgroundColor: colors.textMuted },
  platLabel:    { fontSize: 11, fontWeight: '700' },
  unreadDot:    { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.teal, marginLeft: 'auto' as any },

  // ── Thumbnail ──
  thumb: {
    width: 56, height: 56, borderRadius: radius.sm,
  },
  thumbPlaceholder: {
    width: 56, height: 56, borderRadius: radius.sm,
    backgroundColor: colors.background, justifyContent: 'center', alignItems: 'center',
  },

  // ── Empty ──
  empty:      { alignItems: 'center', paddingVertical: 60, gap: spacing.sm },
  emptyTxt:   { fontSize: 15, fontWeight: '700', color: colors.navy },
  emptySubTxt:{ fontSize: 13, color: colors.textMuted },

  // ── Info ──
  infoBox: {
    flexDirection: 'row', alignItems: 'flex-start', gap: 5,
    margin: spacing.md, backgroundColor: colors.tealLight,
    borderRadius: radius.md, padding: spacing.sm,
  },
  infoTxt: { flex: 1, fontSize: 12, color: colors.textMuted },
});
