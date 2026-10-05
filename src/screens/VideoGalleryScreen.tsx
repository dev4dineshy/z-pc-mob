import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { useApp } from '../AppContext';

// ─── Thumbnail asset map ──────────────────────────────────────────────────────
const THUMB_MAP: Record<string, any> = {
  'community-update-video':  require('../../assets/images/thumbnails/community-update-video.png'),
  'programme-building-video':require('../../assets/images/thumbnails/programme-building-video.png'),
  'public-meeting-video':    require('../../assets/images/thumbnails/public-meeting-video.png'),
  'park-cleanup':            require('../../assets/images/thumbnails/park-cleanup.png'),
  'community-meeting':       require('../../assets/images/thumbnails/community-meeting.png'),
};

const FALLBACK_THUMBS = [
  require('../../assets/images/thumbnails/community-update-video.png'),
  require('../../assets/images/thumbnails/programme-building-video.png'),
  require('../../assets/images/thumbnails/public-meeting-video.png'),
];

function thumbFor(v: any, index: number): any {
  if (v.thumbnailKey && THUMB_MAP[v.thumbnailKey]) return THUMB_MAP[v.thumbnailKey];
  return FALLBACK_THUMBS[index % FALLBACK_THUMBS.length];
}

const TABS = ['All', 'Updates', 'Events'];

// ─── Video card ───────────────────────────────────────────────────────────────
function VideoCard({
  video,
  index,
  onPress,
}: {
  video: any;
  index: number;
  onPress: () => void;
}) {
  const thumb = thumbFor(video, index);
  const isUnavailable = !video.url && video.sourceType !== 'youtube';

  return (
    <TouchableOpacity style={s.card} activeOpacity={0.8} onPress={onPress}>
      {/* Thumbnail */}
      <View style={s.thumb}>
        <Image source={thumb} style={s.thumbImg} resizeMode="cover" />
        <View style={[s.playOverlay, isUnavailable && s.playOverlayUnavailable]}>
          <MaterialIcons
            name={isUnavailable ? 'videocam-off' : 'play-arrow'}
            size={20}
            color={colors.white}
          />
        </View>
        {video.duration ? (
          <View style={s.durationBadge}>
            <Text style={s.durationTxt}>{video.duration}</Text>
          </View>
        ) : null}
        {video.sourceType === 'youtube' && (
          <View style={s.youtubeBadge}>
            <MaterialIcons name="ondemand-video" size={12} color="#FF0000" />
            <Text style={s.youtubeTxt}>YouTube</Text>
          </View>
        )}
      </View>

      {/* Meta */}
      <View style={s.cardBody}>
        <Text style={s.cardTitle} numberOfLines={2}>{video.title}</Text>
        <Text style={s.cardDesc} numberOfLines={2}>{video.description}</Text>
        {video.category ? (
          <View style={s.catBadge}>
            <Text style={s.catTxt}>{video.category}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VideoGalleryScreen({ navigation }: any) {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh();
  const [tab, setTab] = useState('All');
  const videos: any[] = (data as any).videos || [];
  const filtered = tab === 'All'
    ? videos
    : videos.filter((v: any) => v.category === tab);

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Video Gallery" />
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.body}>
          {/* Category tabs */}
          <View style={s.tabRow}>
            {TABS.map(t => (
              <TouchableOpacity
                key={t}
                style={[s.tab, tab === t && s.tabActive]}
                onPress={() => setTab(t)}
              >
                <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>

          {filtered.map((v: any, i: number) => (
            <VideoCard
              key={v.id}
              video={v}
              index={i}
              onPress={() => navigation.navigate('VideoPlayer', { video: v })}
            />
          ))}

          {filtered.length === 0 && (
            <View style={s.empty}>
              <MaterialIcons name="videocam-off" size={48} color={colors.border} />
              <Text style={s.emptyTxt}>No videos in this category.</Text>
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
  body: { padding: spacing.md },

  tabRow: { flexDirection: 'row', marginBottom: spacing.md },
  tab: {
    paddingHorizontal: 14,
    paddingVertical: 7,
    borderRadius: radius.full,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    marginRight: spacing.sm,
  },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  tabTxt:    { fontSize: 13, color: colors.navy, fontWeight: '600' },
  tabTxtActive: { color: colors.white },

  card: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: colors.white,
    borderRadius: radius.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
  },

  thumb: {
    width: 110,
    height: 80,
    backgroundColor: colors.navy,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden',
    flexShrink: 0,
  },
  thumbImg: { position: 'absolute', width: 110, height: 80 },
  playOverlay: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  playOverlayUnavailable: { backgroundColor: 'rgba(0,0,0,0.4)' },
  durationBadge: {
    position: 'absolute',
    bottom: 4,
    right: 4,
    backgroundColor: 'rgba(0,0,0,0.72)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  durationTxt: { color: colors.white, fontSize: 11, fontWeight: '600' },
  youtubeBadge: {
    position: 'absolute',
    top: 4,
    left: 4,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 4,
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  youtubeTxt: { fontSize: 10, fontWeight: '700', color: '#FF0000' },

  cardBody: { flex: 1, padding: spacing.sm, paddingLeft: spacing.md },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 3 },
  cardDesc:  { fontSize: 12, color: colors.textMuted, lineHeight: 17, marginBottom: 6 },
  catBadge:  {
    alignSelf: 'flex-start',
    backgroundColor: colors.tealLight,
    borderRadius: radius.full,
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  catTxt: { fontSize: 11, color: colors.teal, fontWeight: '600' },

  empty: { alignItems: 'center', paddingVertical: spacing.xl },
  emptyTxt: { fontSize: 14, color: colors.textMuted, marginTop: spacing.sm },
});
