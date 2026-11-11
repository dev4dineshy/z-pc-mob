import React, { useState, useCallback } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  RefreshControl,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';
import { useRefresh } from '../hooks/useRefresh';
import {
  getPublishedPosts,
  postTypeLabel,
  postTypeColor,
  platformColor,
  formatPostDate,
  ResolvedPost,
} from '../data/postsService';

// ─── Constants ────────────────────────────────────────────────────────────────
const PAGE         = 10;
const TYPE_TABS    = ['All', 'Update', 'Event', 'Survey', 'Announcement'] as const;
const SOURCE_TABS  = ['All', 'Party', 'Candidate'] as const;

// ─── Platform badge ───────────────────────────────────────────────────────────
function PlatformBadge({ platform }: { platform: 'facebook' | 'youtube' | 'x' }) {
  const iconName =
    platform === 'facebook' ? 'facebook' :
    platform === 'youtube'  ? 'ondemand-video' : 'close';     // 'close' = X placeholder
  const label =
    platform === 'facebook' ? 'Facebook' :
    platform === 'youtube'  ? 'YouTube'  : 'X';
  const col = platformColor(platform);
  return (
    <View style={[pb.wrap, { borderColor: col + '40', backgroundColor: col + '12' }]}>
      <MaterialIcons name={iconName as any} size={11} color={col} />
      <Text style={[pb.txt, { color: col }]}>{label}</Text>
    </View>
  );
}
const pb = StyleSheet.create({
  wrap: { flexDirection: 'row', alignItems: 'center', gap: 3, borderWidth: 1, borderRadius: 4, paddingHorizontal: 6, paddingVertical: 2, marginRight: 4 },
  txt:  { fontSize: 10, fontWeight: '600' },
});

// ─── Post card ────────────────────────────────────────────────────────────────
function PostCard({ post, onPress }: { post: ResolvedPost; onPress: () => void }) {
  const typeCol   = postTypeColor(post.type);
  const typeLabel = postTypeLabel(post.type);

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.75} onPress={onPress}>
      {/* Type tag */}
      <View style={[s.typeTag, { backgroundColor: typeCol + '18' }]}>
        <View style={[s.typeDot, { backgroundColor: typeCol }]} />
        <Text style={[s.typeTxt, { color: typeCol }]}>{typeLabel}</Text>
      </View>

      {/* Title */}
      <Text style={s.cardTitle} numberOfLines={2}>{post.title}</Text>

      {/* Body preview */}
      <Text style={s.cardBody} numberOfLines={3}>{post.body}</Text>

      {/* Footer: owner | date | platforms */}
      <View style={s.cardFooter}>
        <View style={s.ownerRow}>
          <MaterialIcons name="account-circle" size={14} color={colors.textMuted} />
          <Text style={s.ownerTxt} numberOfLines={1}>{post.ownerLabel}</Text>
        </View>
        <Text style={s.dateTxt}>{formatPostDate(post.publishedAt ?? post.createdAt)}</Text>
      </View>

      {post.platforms.length > 0 && (
        <View style={s.platformsRow}>
          {post.platforms.map(p => <PlatformBadge key={p} platform={p} />)}
        </View>
      )}
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PostsScreen({ navigation }: any) {
  const { data, session } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh(['party', 'regions', 'candidates', 'channels', 'posts']);
  const regionId = session?.regionId;

  const [typeFilter,   setTypeFilter]   = useState<string>('All');
  const [sourceFilter, setSourceFilter] = useState<string>('All');
  const [visibleCount, setVisibleCount] = useState(PAGE);

  // Derive posts filtered by both type and source
  const allPosts = getPublishedPosts(data, { regionId });
  const filtered = allPosts.filter(p => {
    const typeOk   = typeFilter   === 'All' || postTypeLabel(p.type) === typeFilter;
    const sourceOk = sourceFilter === 'All' || p.ownerType === sourceFilter.toLowerCase();
    return typeOk && sourceOk;
  });
  const visible = filtered.slice(0, visibleCount);
  const hasMore = visibleCount < filtered.length;

  const handleTypeChange = useCallback((tab: string) => {
    setTypeFilter(tab);
    setVisibleCount(PAGE);
  }, []);

  const handleSourceChange = useCallback((tab: string) => {
    setSourceFilter(tab);
    setVisibleCount(PAGE);
  }, []);

  const handleLoadMore = useCallback(() => {
    if (hasMore) setVisibleCount(c => c + PAGE);
  }, [hasMore]);

  const renderItem = useCallback(({ item }: { item: ResolvedPost }) => (
    <PostCard
      post={item}
      onPress={() => navigation.navigate('PostDetail', { postId: item.id })}
    />
  ), [navigation]);

  const ListHeader = (
    <>
      {/* Error banner */}
      {errorMsg ? (
        <View style={s.errorBanner}>
          <MaterialIcons name="wifi-off" size={14} color={colors.error} />
          <Text style={s.errorTxt} numberOfLines={2}>{errorMsg}</Text>
          <TouchableOpacity onPress={clearError} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
            <Text style={s.retryTxt}>Retry</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      {/* ── Source filter: All / Party / Candidate ── */}
      <View style={s.sourceRow}>
        {SOURCE_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.sourceTab, sourceFilter === tab && s.sourceTabActive]}
            onPress={() => handleSourceChange(tab)}
          >
            {tab === 'Party' && (
              <MaterialIcons name="flag" size={13}
                color={sourceFilter === tab ? colors.white : colors.navy} />
            )}
            {tab === 'Candidate' && (
              <MaterialIcons name="person" size={13}
                color={sourceFilter === tab ? colors.white : colors.navy} />
            )}
            <Text style={[s.sourceTabTxt, sourceFilter === tab && s.sourceTabTxtActive]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* ── Type filter tabs ── */}
      <View style={s.tabsRow}>
        {TYPE_TABS.map(tab => (
          <TouchableOpacity
            key={tab}
            style={[s.tab, typeFilter === tab && s.tabActive]}
            onPress={() => handleTypeChange(tab)}
          >
            <Text style={[s.tabTxt, typeFilter === tab && s.tabTxtActive]}>{tab}</Text>
          </TouchableOpacity>
        ))}
      </View>

      {filtered.length === 0 && !refreshing && (
        <View style={s.empty}>
          <MaterialIcons name="dynamic-feed" size={48} color={colors.border} />
          <Text style={s.emptyTitle}>No posts yet</Text>
          <Text style={s.emptySub}>
            {sourceFilter !== 'All'
              ? `No ${sourceFilter.toLowerCase()} posts${typeFilter !== 'All' ? ` of type "${typeFilter.toLowerCase()}"` : ''} yet.`
              : typeFilter === 'All'
                ? 'Published posts will appear here.'
                : `No ${typeFilter.toLowerCase()} posts yet.`}
          </Text>
        </View>
      )}
    </>
  );

  const ListFooter = hasMore ? (
    <TouchableOpacity style={s.loadMore} onPress={handleLoadMore}>
      <Text style={s.loadMoreTxt}>Load more</Text>
      <MaterialIcons name="expand-more" size={18} color={colors.teal} />
    </TouchableOpacity>
  ) : filtered.length > 0 ? (
    <Text style={s.endTxt}>— End of posts —</Text>
  ) : null;

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title="Posts" />

      <FlatList
        data={visible}
        keyExtractor={item => item.id}
        renderItem={renderItem}
        contentContainerStyle={s.list}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.teal}
            colors={[colors.teal]}
            progressBackgroundColor={colors.white}
          />
        }
      />
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  list: { padding: spacing.md, paddingBottom: spacing.xl },

  /* Source filter row */
  sourceRow: {
    flexDirection: 'row',
    gap: spacing.sm,
    marginBottom: spacing.sm,
  },
  sourceTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1.5,
    borderColor: colors.border,
  },
  sourceTabActive:    { backgroundColor: colors.navy, borderColor: colors.navy },
  sourceTabTxt:       { fontSize: 13, color: colors.navy, fontWeight: '600' },
  sourceTabTxtActive: { color: colors.white },

  /* Type filter tabs */
  tabsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: spacing.xs,
    marginBottom: spacing.md,
  },
  tab: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
  },
  tabActive:    { backgroundColor: colors.teal, borderColor: colors.teal },
  tabTxt:       { fontSize: 13, color: colors.navy, fontWeight: '500' },
  tabTxtActive: { color: colors.white, fontWeight: '600' },

  /* Post card */
  card: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },

  typeTag: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 3,
    marginBottom: 8,
    gap: 5,
  },
  typeDot: { width: 6, height: 6, borderRadius: 3 },
  typeTxt: { fontSize: 11, fontWeight: '700', textTransform: 'uppercase', letterSpacing: 0.4 },

  cardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 21,
    marginBottom: 6,
  },
  cardBody: {
    fontSize: 13,
    color: colors.textMuted,
    lineHeight: 19,
    marginBottom: 10,
  },

  cardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  ownerRow: { flexDirection: 'row', alignItems: 'center', gap: 4, flex: 1, marginRight: 8 },
  ownerTxt: { fontSize: 12, color: colors.textMuted, fontWeight: '500', flexShrink: 1 },
  dateTxt:  { fontSize: 12, color: colors.textMuted },

  platformsRow: { flexDirection: 'row', flexWrap: 'wrap', marginTop: 2 },

  /* Error banner */
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEE2E2',
    borderRadius: 8,
    marginBottom: spacing.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  errorTxt: { flex: 1, fontSize: 12, color: colors.error, lineHeight: 16 },
  retryTxt: { fontSize: 12, fontWeight: '700', color: colors.error },

  /* Empty state */
  empty: { alignItems: 'center', paddingVertical: 48 },
  emptyTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginTop: 12 },
  emptySub:   { fontSize: 13, color: colors.textMuted, marginTop: 4, textAlign: 'center' },

  /* Pagination */
  loadMore: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    paddingVertical: spacing.md,
  },
  loadMoreTxt: { fontSize: 14, color: colors.teal, fontWeight: '600' },
  endTxt: {
    textAlign: 'center',
    fontSize: 12,
    color: colors.textMuted,
    paddingVertical: spacing.md,
  },
});
