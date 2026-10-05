/**
 * VideoPlayerScreen
 *
 * Plays a single video using expo-video's VideoView + useVideoPlayer.
 *
 * Behaviour:
 *  - No autoplay — user must press Play.
 *  - Only one player exists per screen mount; destroyed on unmount.
 *  - Pauses on blur (user navigates away or apps to background).
 *  - Native controls handle play/pause, seek, mute, and fullscreen.
 *  - Fullscreen uses landscape orientation (expo-video handles rotation).
 *  - YouTube / non-embeddable: shows an "Open video" fallback that opens
 *    the URL in the browser / YouTube app.
 *  - loading / error / unavailable states shown without dialogs.
 */

import React, { useCallback, useEffect, useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Linking,
  Dimensions,
  ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useFocusEffect } from '@react-navigation/native';
import { MaterialIcons } from '@expo/vector-icons';
import { VideoView, useVideoPlayer } from 'expo-video';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';

// ─── Thumbnail asset map (mirrors VideoGalleryScreen) ────────────────────────
const THUMB_MAP: Record<string, any> = {
  'community-update-video':   require('../../assets/images/thumbnails/community-update-video.png'),
  'programme-building-video': require('../../assets/images/thumbnails/programme-building-video.png'),
  'public-meeting-video':     require('../../assets/images/thumbnails/public-meeting-video.png'),
  'park-cleanup':             require('../../assets/images/thumbnails/park-cleanup.png'),
  'community-meeting':        require('../../assets/images/thumbnails/community-meeting.png'),
};
const FALLBACK_THUMB = require('../../assets/images/thumbnails/community-update-video.png');

function thumbFor(video: any): any {
  if (video?.thumbnailKey && THUMB_MAP[video.thumbnailKey]) return THUMB_MAP[video.thumbnailKey];
  return FALLBACK_THUMB;
}

// ─── Player width — full screen width ────────────────────────────────────────
const SCREEN_W = Dimensions.get('window').width;
const PLAYER_H = Math.round(SCREEN_W * (9 / 16));   // 16:9 aspect ratio

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function VideoPlayerScreen({ route, navigation }: any) {
  const video = route.params?.video;

  // ── Guard: no video param ──
  if (!video) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title="Video" />
        <View style={s.center}>
          <MaterialIcons name="error-outline" size={48} color={colors.border} />
          <Text style={s.stateTitle}>Video not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const sourceType: string = video.sourceType ?? 'unavailable';
  const hasDirectUrl = sourceType === 'direct' && !!video.url;
  const isYoutube    = sourceType === 'youtube';

  return hasDirectUrl
    ? <DirectPlayer video={video} navigation={navigation} />
    : <FallbackPlayer video={video} navigation={navigation} isYoutube={isYoutube} />;
}

// ─── Direct player (expo-video) ───────────────────────────────────────────────
function DirectPlayer({ video, navigation }: { video: any; navigation: any }) {
  const [status, setStatus] = useState<'loading' | 'ready' | 'error'>('loading');
  const [errMsg, setErrMsg] = useState<string>('');
  const [firstFrameReady, setFirstFrameReady] = useState(false);

  const player = useVideoPlayer(video.url as string, p => {
    p.loop = false;
    p.staysActiveInBackground = false;
    // Do NOT call p.play() here — no autoplay
  });

  // ── Pause when screen loses focus ──────────────────────────────────────────
  useFocusEffect(
    useCallback(() => {
      return () => {
        // Guard against "shared object already released" crash on unmount
        try {
          if (player.playing) player.pause();
        } catch { /* player already released — safe to ignore */ }
      };
    }, [player]),
  );

  // ── Track player status ────────────────────────────────────────────────────
  useEffect(() => {
    let sub: { remove: () => void } | null = null;
    try {
      sub = player.addListener('statusChange', ({ status: s, error }) => {
        if (s === 'readyToPlay') setStatus('ready');
        else if (s === 'error') {
          setStatus('error');
          setErrMsg(error?.message ?? 'Playback error. Please try again.');
        }
      });
    } catch { /* player already released on fast navigation */ }
    return () => {
      try { sub?.remove(); } catch { /* safe to ignore */ }
    };
  }, [player]);

  const thumb = thumbFor(video);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title={video.title} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* ── Player area ── */}
        <View style={s.playerWrap}>

          {/* Native VideoView */}
          <VideoView
            player={player}
            style={s.player}
            contentFit="contain"
            nativeControls
            fullscreenOptions={{
              enable: true,
              orientation: 'landscape',
            }}
            onFirstFrameRender={() => setFirstFrameReady(true)}
          />

          {/* Pre-play cover: thumbnail + large play button */}
          {!firstFrameReady && status !== 'error' && (
            <View style={s.cover} pointerEvents="none">
              <Image source={thumb} style={s.coverThumb} resizeMode="cover" />
              <View style={s.coverOverlay} />
              <View style={s.coverPlay}>
                <MaterialIcons name="play-circle-fill" size={56} color={colors.white} />
              </View>
            </View>
          )}

          {/* Loading state (shown on top of cover while loading) */}
          {status === 'loading' && !firstFrameReady && (
            <View style={s.loadingBadge} pointerEvents="none">
              <Text style={s.loadingTxt}>Loading…</Text>
            </View>
          )}

          {/* Error state */}
          {status === 'error' && (
            <View style={s.errorOverlay}>
              <MaterialIcons name="error-outline" size={36} color={colors.white} />
              <Text style={s.errorTitle}>Playback failed</Text>
              <Text style={s.errorSub} numberOfLines={2}>{errMsg}</Text>
              <TouchableOpacity
                style={s.retryBtn}
                onPress={() => {
                  setStatus('loading');
                  setErrMsg('');
                  setFirstFrameReady(false);
                  player.replay();
                }}
              >
                <MaterialIcons name="refresh" size={18} color={colors.navy} />
                <Text style={s.retryTxt}>Retry</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* ── Meta ── */}
        <View style={s.meta}>
          <Text style={s.metaTitle}>{video.title}</Text>
          {video.duration ? (
            <View style={s.metaRow}>
              <MaterialIcons name="schedule" size={14} color={colors.textMuted} />
              <Text style={s.metaDetail}>{video.duration}</Text>
            </View>
          ) : null}
          {video.category ? (
            <View style={s.catBadge}>
              <Text style={s.catTxt}>{video.category}</Text>
            </View>
          ) : null}
          {video.description ? (
            <Text style={s.metaDesc}>{video.description}</Text>
          ) : null}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Fallback player (YouTube / no URL / external link) ───────────────────────
function FallbackPlayer({
  video,
  navigation,
  isYoutube,
}: {
  video: any;
  navigation: any;
  isYoutube: boolean;
}) {
  const [linkError, setLinkError] = useState<string | null>(null);
  const thumb = thumbFor(video);
  const hasUrl = !!video.url;

  async function handleOpen() {
    if (!video.url) return;
    setLinkError(null);
    try {
      const supported = await Linking.canOpenURL(video.url);
      if (supported) {
        await Linking.openURL(video.url);
      } else {
        try { await Linking.openURL(video.url); }
        catch { setLinkError('Could not open this link on your device.'); }
      }
    } catch {
      setLinkError('Could not open this link on your device.');
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title={video.title} />

      <ScrollView showsVerticalScrollIndicator={false}>

        {/* Thumbnail hero */}
        <View style={s.playerWrap}>
          <Image source={thumb} style={s.player} resizeMode="cover" />
          <View style={s.coverOverlay} />
          <View style={s.externalBadge}>
            {isYoutube ? (
              <MaterialIcons name="ondemand-video" size={16} color="#FF0000" />
            ) : (
              <MaterialIcons name="videocam-off" size={16} color={colors.textMuted} />
            )}
            <Text style={s.externalBadgeTxt}>
              {isYoutube ? 'YouTube' : 'Video unavailable'}
            </Text>
          </View>
        </View>

        {/* Meta */}
        <View style={s.meta}>
          <Text style={s.metaTitle}>{video.title}</Text>
          {video.category ? (
            <View style={s.catBadge}>
              <Text style={s.catTxt}>{video.category}</Text>
            </View>
          ) : null}
          {video.description ? (
            <Text style={s.metaDesc}>{video.description}</Text>
          ) : null}

          {/* Open externally */}
          {hasUrl ? (
            <>
              <TouchableOpacity style={s.openBtn} onPress={handleOpen} activeOpacity={0.8}>
                <MaterialIcons name="open-in-new" size={18} color={colors.white} />
                <Text style={s.openBtnTxt}>
                  {isYoutube ? 'Open in YouTube' : 'Open video'}
                </Text>
              </TouchableOpacity>
              {linkError ? (
                <View style={s.linkErr}>
                  <MaterialIcons name="error-outline" size={14} color={colors.error} />
                  <Text style={s.linkErrTxt}>{linkError}</Text>
                </View>
              ) : null}
            </>
          ) : (
            <View style={s.unavailableNote}>
              <MaterialIcons name="info-outline" size={16} color={colors.textMuted} />
              <Text style={s.unavailableTxt}>
                This video is not currently available for playback.
              </Text>
            </View>
          )}
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// ─── Styles ───────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },

  /* Player / thumbnail container */
  playerWrap: {
    width: SCREEN_W,
    height: PLAYER_H,
    backgroundColor: '#000',
    position: 'relative',
  },
  player: {
    width: SCREEN_W,
    height: PLAYER_H,
  },

  /* Cover shown until first frame */
  cover: {
    ...StyleSheet.absoluteFill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  coverThumb: {
    ...StyleSheet.absoluteFill,
    width: SCREEN_W,
    height: PLAYER_H,
  },
  coverOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.38)',
  },
  coverPlay: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
  },

  /* Loading badge */
  loadingBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  loadingTxt: { color: colors.white, fontSize: 12, fontWeight: '600' },

  /* Error overlay */
  errorOverlay: {
    ...StyleSheet.absoluteFill,
    backgroundColor: 'rgba(0,0,0,0.82)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing.lg,
  },
  errorTitle: { fontSize: 16, fontWeight: '700', color: colors.white, marginTop: spacing.sm },
  errorSub:   { fontSize: 13, color: 'rgba(255,255,255,0.75)', marginTop: 4, textAlign: 'center', lineHeight: 18 },
  retryBtn:   {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: spacing.md,
    backgroundColor: colors.white,
    borderRadius: radius.sm,
    paddingVertical: 10,
    paddingHorizontal: 20,
  },
  retryTxt: { fontSize: 14, fontWeight: '700', color: colors.navy },

  /* External badge (on fallback thumbnail) */
  externalBadge: {
    position: 'absolute',
    bottom: spacing.sm,
    left: spacing.sm,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(255,255,255,0.92)',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  externalBadgeTxt: { fontSize: 12, fontWeight: '700', color: colors.navy },

  /* Meta section */
  meta:       { padding: spacing.md },
  metaTitle:  { fontSize: 18, fontWeight: '800', color: colors.navy, lineHeight: 26, marginBottom: spacing.xs },
  metaRow:    { flexDirection: 'row', alignItems: 'center', gap: 5, marginBottom: 6 },
  metaDetail: { fontSize: 13, color: colors.textMuted },
  catBadge:   {
    alignSelf: 'flex-start',
    backgroundColor: colors.tealLight,
    borderRadius: radius.full,
    paddingHorizontal: 10,
    paddingVertical: 3,
    marginBottom: spacing.sm,
  },
  catTxt:     { fontSize: 12, color: colors.teal, fontWeight: '600' },
  metaDesc:   { fontSize: 14, color: colors.textMuted, lineHeight: 22 },

  /* Open externally button */
  openBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.teal,
    borderRadius: radius.md,
    paddingVertical: 14,
    marginTop: spacing.md,
  },
  openBtnTxt: { color: colors.white, fontSize: 15, fontWeight: '700' },

  linkErr: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderRadius: radius.sm,
    padding: spacing.sm,
    marginTop: spacing.xs,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  linkErrTxt: { fontSize: 13, color: colors.error, flex: 1 },

  /* Unavailable note */
  unavailableNote: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.white,
    borderRadius: radius.md,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing.md,
    marginTop: spacing.md,
  },
  unavailableTxt: { flex: 1, fontSize: 13, color: colors.textMuted, lineHeight: 20 },

  /* Not found */
  stateTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: spacing.md },
});
