import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Linking,
  Share,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';
import {
  getPublishedPost,
  postTypeLabel,
  postTypeColor,
  platformColor,
  formatPostDate,
} from '../data/postsService';

// ─── Platform row item ────────────────────────────────────────────────────────
function PlatformRow({
  platform,
  label,
}: {
  platform: 'facebook' | 'youtube' | 'x';
  label: string;
}) {
  const col       = platformColor(platform);
  const iconName  =
    platform === 'facebook' ? 'facebook' :
    platform === 'youtube'  ? 'ondemand-video' : 'close';

  return (
    <View style={[pd.platformRow, { borderColor: col + '30' }]}>
      <View style={[pd.platformIcon, { backgroundColor: col + '18' }]}>
        <MaterialIcons name={iconName as any} size={18} color={col} />
      </View>
      <Text style={pd.platformLabel}>{label}</Text>
    </View>
  );
}
const pd = StyleSheet.create({
  platformRow:  { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: radius.md, padding: spacing.sm, marginBottom: spacing.xs, gap: spacing.sm },
  platformIcon: { width: 34, height: 34, borderRadius: 8, justifyContent: 'center', alignItems: 'center' },
  platformLabel:{ fontSize: 13, fontWeight: '600', color: colors.navy },
});

// ─── Metric chip ─────────────────────────────────────────────────────────────
function MetricChip({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <View style={mc.wrap}>
      <Text style={mc.icon}>{icon}</Text>
      <Text style={mc.value}>{value}</Text>
      <Text style={mc.label}>{label}</Text>
    </View>
  );
}
const mc = StyleSheet.create({
  wrap:  { alignItems: 'center', flex: 1 },
  icon:  { fontSize: 18, marginBottom: 2 },
  value: { fontSize: 16, fontWeight: '700', color: colors.navy },
  label: { fontSize: 11, color: colors.textMuted },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PostDetailScreen({ route, navigation }: any) {
  const { data } = useApp();
  const postId: string = route.params?.postId;
  const post = getPublishedPost(postId, data);

  // ── Not found ──
  if (!post) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title="Post" />
        <View style={s.notFound}>
          <MaterialIcons name="error-outline" size={48} color={colors.border} />
          <Text style={s.notFoundTitle}>Post not found</Text>
          <Text style={s.notFoundSub}>This post may have been unpublished or removed.</Text>
          <TouchableOpacity style={s.notFoundBtn} onPress={() => navigation.goBack()}>
            <Text style={s.notFoundBtnTxt}>Go back</Text>
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    );
  }

  const typeCol   = postTypeColor(post.type);
  const typeLabel = postTypeLabel(post.type);

  const [linkError, setLinkError] = useState<string | null>(null);

  async function handleOpenOriginal() {
    if (!post.originalPostUrl) return;
    setLinkError(null);
    // Skip canOpenURL — it returns false for many valid https URLs on Android
    try {
      await Linking.openURL(post.originalPostUrl);
    } catch {
      setLinkError('Unable to open the link. Make sure you have a browser installed.');
    }
  }

  async function handleShare() {
    try {
      await Share.share({
        title: post.title,
        message: post.originalPostUrl
          ? `${post.title}\n\n${post.originalPostUrl}`
          : post.title,
      });
    } catch { /* cancelled */ }
  }

  async function handleShareToFacebook() {
    if (!post.originalPostUrl) return;
    // Facebook sharer — opens FB app natively on mobile if installed,
    // falls back to Facebook web share dialog in browser
    const fbUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(post.originalPostUrl)}`;
    try {
      await Linking.openURL(fbUrl);
    } catch {
      setLinkError('Could not open Facebook. Make sure the app is installed or try again.');
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader
        variant="title"
        navigation={navigation}
        title={typeLabel}
        rightSlot={
          <TouchableOpacity
            onPress={handleShare}
            hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            accessibilityLabel="Share post"
          >
            <MaterialIcons name="share" size={22} color={colors.navy} />
          </TouchableOpacity>
        }
      />

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={s.scroll}
      >
        {/* ── Type badge ── */}
        <View style={[s.typeBadge, { backgroundColor: typeCol + '18' }]}>
          <View style={[s.typeDot, { backgroundColor: typeCol }]} />
          <Text style={[s.typeTxt, { color: typeCol }]}>{typeLabel}</Text>
        </View>

        {/* ── Title ── */}
        <Text style={s.title}>{post.title}</Text>

        {/* ── Meta row ── */}
        <View style={s.metaRow}>
          <MaterialIcons name="account-circle" size={16} color={colors.textMuted} />
          <Text style={s.metaOwner}>{post.ownerLabel}</Text>
        </View>
        <View style={[s.metaRow, { marginTop: 2, marginBottom: spacing.md }]}>
          <MaterialIcons name="calendar-today" size={14} color={colors.textMuted} />
          <Text style={s.metaDate}>
            {formatPostDate(post.publishedAt ?? post.createdAt)}
          </Text>
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Body ── */}
        <Text style={s.body}>{post.body}</Text>

        {/* ── Tags ── */}
        {post.tags && post.tags.length > 0 && (
          <View style={s.tagsRow}>
            {post.tags.map(tag => (
              <View key={tag} style={s.tag}>
                <Text style={s.tagTxt}>#{tag}</Text>
              </View>
            ))}
          </View>
        )}

        {/* ── Engagement metrics ── */}
        {(post.metrics.likes > 0 || post.metrics.comments > 0 || post.metrics.reshares > 0) && (
          <View style={s.metricsCard}>
            <Text style={s.metricsHeading}>Engagement</Text>
            <View style={s.metricsRow}>
              <MetricChip icon="👍" value={post.metrics.likes}    label="Likes" />
              <MetricChip icon="💬" value={post.metrics.comments} label="Comments" />
              <MetricChip icon="🔁" value={post.metrics.reshares} label="Shares" />
            </View>
          </View>
        )}

        {/* ── Published on platforms ── */}
        {post.platforms.length > 0 && (
          <View style={s.section}>
            <Text style={s.sectionHeading}>Published on</Text>
            {post.platforms.map((p, i) => (
              <PlatformRow key={p} platform={p} label={post.platformLabels[i]} />
            ))}
          </View>
        )}

        {/* ── View original post button ── */}
        {post.originalPostUrl ? (
          <>
            <TouchableOpacity style={s.originalBtn} onPress={handleOpenOriginal} activeOpacity={0.8}>
              <MaterialIcons name="open-in-new" size={18} color={colors.white} />
              <Text style={s.originalBtnTxt}>View original post</Text>
            </TouchableOpacity>

            {/* ── Share to Facebook ── */}
            <TouchableOpacity style={s.fbShareBtn} onPress={handleShareToFacebook} activeOpacity={0.85}>
              <MaterialIcons name="facebook" size={20} color={colors.white} />
              <Text style={s.fbShareBtnTxt}>Share on Facebook</Text>
            </TouchableOpacity>

            {linkError ? (
              <View style={s.linkErrNote}>
                <MaterialIcons name="error-outline" size={14} color={colors.error} />
                <Text style={s.linkErrTxt}>{linkError}</Text>
              </View>
            ) : null}
          </>
        ) : (
          <View style={s.noUrlNote}>
            <MaterialIcons name="info-outline" size={14} color={colors.textMuted} />
            <Text style={s.noUrlTxt}>Original social media link not available for this post.</Text>
          </View>
        )}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md },

  /* Type badge */
  typeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
    marginBottom: 10,
    gap: 6,
  },
  typeDot: { width: 7, height: 7, borderRadius: 3.5 },
  typeTxt: { fontSize: 12, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.5 },

  /* Title */
  title: {
    fontSize: 22,
    fontWeight: '800',
    color: colors.navy,
    lineHeight: 30,
    letterSpacing: -0.3,
    marginBottom: spacing.sm,
  },

  /* Meta */
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 5 },
  metaOwner: { fontSize: 13, color: colors.textMuted, fontWeight: '500' },
  metaDate:  { fontSize: 13, color: colors.textMuted },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginVertical: spacing.md,
  },

  /* Body */
  body: {
    fontSize: 15,
    color: colors.navy,
    lineHeight: 24,
    marginBottom: spacing.md,
  },

  /* Tags */
  tagsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: spacing.xs, marginBottom: spacing.md },
  tag:     { backgroundColor: colors.tealLight, borderRadius: radius.full, paddingHorizontal: 10, paddingVertical: 4 },
  tagTxt:  { fontSize: 12, color: colors.teal, fontWeight: '600' },

  /* Metrics */
  metricsCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.md,
  },
  metricsHeading: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm },
  metricsRow:     { flexDirection: 'row' },

  /* Platforms section */
  section:        { marginBottom: spacing.md },
  sectionHeading: { fontSize: 12, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: spacing.sm },

  /* Original post button */
  originalBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  originalBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },

  /* Share to Facebook button */
  fbShareBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1877F2',
    borderRadius: radius.md,
    paddingVertical: 14,
    marginBottom: spacing.sm,
  },
  fbShareBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },

  noUrlNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.background,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  noUrlTxt:    { fontSize: 13, color: colors.textMuted, flex: 1, lineHeight: 18 },

  linkErrNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: '#FECACA',
    padding: spacing.sm,
    marginTop: spacing.xs,
    marginBottom: spacing.sm,
  },
  linkErrTxt: { fontSize: 13, color: colors.error, flex: 1, lineHeight: 18 },

  /* Not found */
  notFound:       { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  notFoundTitle:  { fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: spacing.md },
  notFoundSub:    { fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: 'center', lineHeight: 20 },
  notFoundBtn:    { marginTop: spacing.lg, backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.xl },
  notFoundBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
