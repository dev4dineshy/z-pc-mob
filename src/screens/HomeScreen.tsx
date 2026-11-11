import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  Dimensions,
  Image,
  Platform,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import {
  getPublishedPosts,
  platformColor,
  formatPostDate,
  ResolvedPost,
} from '../data/postsService';

// ─── Layout constants ────────────────────────────────────────────────────────
const W        = Dimensions.get('window').width;
const HPAD     = spacing.md;           // 16 — side padding
const CGAP     = spacing.sm;           // 8  — gap between service cards
// 3-col grid: total horizontal space minus side pads minus two inner gaps
const CARD_W   = (W - HPAD * 2 - CGAP * 2) / 3;

// Carousel card: 82% of screen width; left-pad + inter-card gap = 16 + 10
const CAROUSEL_CARD_W   = Math.round(W * 0.82);
const CAROUSEL_GAP      = 10;
const CAROUSEL_PAD_LEFT = HPAD;
// snap interval = card width + gap
const CAROUSEL_SNAP     = CAROUSEL_CARD_W + CAROUSEL_GAP;
// Fixed heights for consistent carousel row
const CAROUSEL_IMG_H    = 110;
const CAROUSEL_H_IMG    = 210;  // card with image
const CAROUSEL_H_TEXT   = 150;  // card text-only (no image)

// ─── Assets ──────────────────────────────────────────────────────────────────
const HOME_BANNER    = require('../../assets/images/banners/home-community-banner.png');
const PC_LOGO        = require('../../assets/images/logos/connected-people-symbol.png');

// Map API asset keys to bundled image sources.
const POST_ASSET_MAP: Record<string, any> = {
  'health-camp':  require('../../assets/images/thumbnails/health-clinic.png'),
  'park-cleanup': require('../../assets/images/thumbnails/park-cleanup.png'),
  'community-office': require('../../assets/images/thumbnails/community-office.png'),
  'road-infrastructure': require('../../assets/images/thumbnails/road-infrastructure.png'),
};

function resolveImageSource(imageUrl?: string | null): any | null {
  if (!imageUrl) return null;
  if (imageUrl.startsWith('asset:')) {
    const key = imageUrl.slice('asset:'.length);
    return POST_ASSET_MAP[key] ?? null;
  }
  // Remote URL
  return { uri: imageUrl };
}

// ─── Service grid config ─────────────────────────────────────────────────────
const ICON_SZ = 24;

type ServiceItem = {
  key: string;
  label: string;
  icon: React.ReactNode;
  bg: string;
};

const GRID: ServiceItem[] = [
  { key: 'PartyInfo',    label: 'Party',      icon: <Image source={PC_LOGO} style={{ width: ICON_SZ, height: ICON_SZ }} resizeMode="contain" />, bg: '#DBEAFE' },
  { key: 'Manifesto',    label: 'Manifesto',  icon: <MaterialIcons name="menu-book"        size={ICON_SZ} color="#7C3AED" />, bg: '#EDE9FE' },
  { key: 'CommunityHub', label: 'Party Activities',  icon: <MaterialIcons name="people"           size={ICON_SZ} color="#0891B2" />, bg: '#CFFAFE' },
  { key: 'News',         label: 'News',       icon: <MaterialIcons name="article"          size={ICON_SZ} color="#0D9488" />, bg: '#CCFBF1' },
  { key: 'Photos',       label: 'Photos',     icon: <MaterialIcons name="photo-library"    size={ICON_SZ} color="#B45309" />, bg: '#FEF3C7' },
  { key: 'Videos',       label: 'Videos',     icon: <MaterialIcons name="play-circle-fill" size={ICON_SZ} color="#DC2626" />, bg: '#FEE2E2' },
  { key: 'Development',  label: 'Projects',   icon: <MaterialIcons name="construction"     size={ICON_SZ} color="#EA580C" />, bg: '#FFEDD5' },
  // { key: 'Health',       label: 'Health',     icon: <MaterialIcons name="favorite"         size={ICON_SZ} color="#16A34A" />, bg: '#DCFCE7' },
  { key: 'Schemes',      label: 'Schemes',    icon: <MaterialIcons name="card-giftcard"    size={ICON_SZ} color="#BE185D" />, bg: '#FCE7F3' },
  { key: 'PhoneNumbers', label: 'Helpline',   icon: <MaterialIcons name="phone"            size={ICON_SZ} color="#0369A1" />, bg: '#E0F2FE' },
  { key: 'Complaints',   label: 'Complaints', icon: <MaterialIcons name="report-problem"   size={ICON_SZ} color="#B45309" />, bg: '#FEF3C7' },
  { key: 'Contact',      label: 'Office',     icon: <MaterialIcons name="location-on"      size={ICON_SZ} color="#4338CA" />, bg: '#E0E7FF' },
  { key: 'Feedback',     label: 'Feedback',   icon: <MaterialIcons name="rate-review"      size={ICON_SZ} color="#0F766E" />, bg: '#CCFBF1' },
  { key: 'About',        label: 'About',      icon: <Ionicons name="information-circle"    size={ICON_SZ} color="#475569" />, bg: '#F1F5F9' },
];

// ─── Component ───────────────────────────────────────────────────────────────
export default function HomeScreen({ navigation }: any): React.JSX.Element {
  const { data, session } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh(['party', 'regions', 'candidates', 'channels', 'posts']);
  const account = session;
  const region  = data.regions?.find((r: any) => r.id === account?.regionId);

  const displayName = account?.name ?? '';

  // Latest 3 published posts for the carousel
  const latestPosts = getPublishedPosts(data, { regionId: account?.regionId, limit: 3 });
  // Determine if any post in the carousel has an image (drives fixed vs auto height)
  const anyHasImage = latestPosts.some(p => !!p.imageUrl);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>

      <AppHeader
        variant="home"
        navigation={navigation}
        region={region}
        onAvatarPress={() => navigation.navigate('Profile')}
      />

      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
        contentContainerStyle={s.scroll}
      >

        {/* ── Hero banner ─────────────────────────────────────────────── */}
        <View style={s.heroCard}>
          <Image source={HOME_BANNER} style={s.heroImg} resizeMode="cover" />
          <View style={s.heroOverlay}>
            <Text style={s.heroTitle}>Stronger Communities{'\n'}Brighter Tomorrows</Text>
            <Text style={s.heroSub}>People · Places · Progress</Text>
          </View>
        </View>

        {/* ── Greeting ────────────────────────────────────────────────── */}
        <View style={s.greetRow}>
          <Text style={s.greetName}>
            {displayName ? `Hello, ${displayName}` : 'Welcome'}
          </Text>
          <Text style={s.greetSub}>Stay informed. Stay connected.</Text>
        </View>

        {/* ── Latest posts carousel ────────────────────────────────────── */}
        {latestPosts.length > 0 && (
          <View style={s.carouselSection}>
            {/* Section header */}
            <View style={s.sectionHeaderRow}>
              <Text style={s.sectionTitle}>Latest posts</Text>
              <TouchableOpacity
                onPress={() => navigation.navigate('Posts')}
                style={s.viewAllBtn}
                activeOpacity={0.7}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
              >
                <Text style={s.viewAllTxt}>View all</Text>
                <MaterialIcons name="chevron-right" size={16} color={colors.teal} />
              </TouchableOpacity>
            </View>

            {/* Horizontal scroll */}
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              snapToInterval={CAROUSEL_SNAP}
              snapToAlignment="start"
              decelerationRate="fast"
              contentContainerStyle={[
                s.carouselContent,
                // Right padding = screen width minus one full card, so last card
                // can snap flush to left edge
                { paddingRight: W - CAROUSEL_CARD_W - CAROUSEL_PAD_LEFT },
              ]}
            >
              {latestPosts.map((post, idx) => (
                <UpdateCard
                  key={post.id}
                  post={post}
                  cardHeight={anyHasImage ? CAROUSEL_H_IMG : CAROUSEL_H_TEXT}
                  isFirst={idx === 0}
                  navigation={navigation}
                />
              ))}
            </ScrollView>
          </View>
        )}

        {/* ── Services section ────────────────────────────────────────── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Explore services</Text>
        </View>

        <View style={s.grid}>
          {chunk(GRID, 3).map((row, ri) => (
            <View key={ri} style={s.gridRow}>
              {row.map((item, ci) => (
                <ServiceCard
                  key={item.key}
                  item={item}
                  style={ci > 0 ? { marginLeft: CGAP } : undefined}
                  onPress={() => navigation.navigate(item.key)}
                />
              ))}
            </View>
          ))}
        </View>

        <View style={{ height: spacing.xl }} />
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

// ─── UpdateCard (carousel item) ──────────────────────────────────────────────
// Maps a platform to its MaterialIcons icon name
function platformIconName(platform: 'facebook' | 'youtube' | 'x'): string {
  switch (platform) {
    case 'facebook': return 'facebook';
    case 'youtube':  return 'ondemand-video';
    case 'x':        return 'close'; // closest available in MaterialIcons for X/Twitter
  }
}

function UpdateCard({
  post,
  cardHeight,
  isFirst,
  navigation,
}: {
  post: ResolvedPost;
  cardHeight: number;
  isFirst: boolean;
  navigation: any;
}) {
  const [urlError, setUrlError] = useState<string | null>(null);
  const imgSource = resolveImageSource(post.imageUrl);
  const hasImage = !!imgSource;
  const primaryPlatform = post.platforms[0] ?? null;

  async function handleOpenLink() {
    const url = post.originalPostUrl;
    if (!url) { setUrlError('No link saved for this post.'); return; }
    setUrlError(null);
    try { await Linking.openURL(url); }
    catch { setUrlError('Could not open this link on your device.'); }
  }

  return (
    <TouchableOpacity
      activeOpacity={0.88}
      onPress={() => navigation.navigate('PostDetail', { postId: post.id })}
      style={[
        s.updateCard,
        { width: CAROUSEL_CARD_W, height: urlError ? undefined : cardHeight },
        isFirst ? { marginLeft: CAROUSEL_PAD_LEFT } : { marginLeft: CAROUSEL_GAP },
      ]}
    >
      {/* Thumbnail */}
      {hasImage && (
        <Image source={imgSource} style={s.updateCardImg} resizeMode="cover" />
      )}

      {/* Text body */}
      <View style={[s.updateCardBody, !hasImage && s.updateCardBodyNoImg]}>
        <Text style={s.updateTitle} numberOfLines={2}>{post.title}</Text>

        {/* Footer: platform icon + date + open link */}
        <View style={s.updateFooter}>
          {primaryPlatform && (
            <View style={[s.platformIconWrap, { backgroundColor: platformColor(primaryPlatform) + '18' }]}>
              <MaterialIcons
                name={platformIconName(primaryPlatform) as any}
                size={13}
                color={platformColor(primaryPlatform)}
              />
            </View>
          )}

          <View style={s.dateRow}>
            <MaterialIcons name="calendar-today" size={10} color={colors.textMuted} />
            <Text style={s.dateText}>{formatPostDate(post.publishedAt ?? post.createdAt)}</Text>
          </View>

          {/* Open external link — stopPropagation so card tap still goes to PostDetail */}
          <TouchableOpacity
            onPress={e => { e.stopPropagation?.(); handleOpenLink(); }}
            style={s.openPostBtn}
            activeOpacity={0.7}
            accessibilityLabel={`Open link: ${post.title}`}
            accessibilityRole="link"
          >
            <Text style={s.openPostTxt}>Open link</Text>
            <MaterialIcons name="open-in-new" size={12} color={colors.teal} />
          </TouchableOpacity>
        </View>

        {urlError ? (
          <View style={s.urlErrorRow}>
            <MaterialIcons name="error-outline" size={12} color={colors.error} />
            <Text style={s.urlErrorTxt}>{urlError}</Text>
          </View>
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

// ─── ServiceCard ─────────────────────────────────────────────────────────────
function ServiceCard({
  item,
  style,
  onPress,
}: {
  item: ServiceItem;
  style?: any;
  onPress: () => void;
}) {
  return (
    <TouchableOpacity
      activeOpacity={0.75}
      style={[s.card, style]}
      onPress={onPress}
    >
      <View style={[s.iconBox, { backgroundColor: item.bg }]}>
        {item.icon}
      </View>
      <Text style={s.cardLabel} numberOfLines={2}>{item.label}</Text>
    </TouchableOpacity>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  safe:   { flex: 1, backgroundColor: colors.background },
  scroll: { paddingBottom: spacing.md },

  /* ── Hero banner ── */
  heroCard: {
    marginHorizontal: HPAD,
    marginTop: spacing.md,
    borderRadius: radius.lg,
    height: 190,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.10, shadowRadius: 6 },
      android: { elevation: 3 },
    }),
  },
  heroImg: { width: '100%', height: 190 },
  heroOverlay: {
    position: 'absolute',
    top: 0, bottom: 0, left: 0, right: 0,
    justifyContent: 'flex-end',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    backgroundColor: 'rgba(16,35,65,0.30)',
  },
  heroTitle: {
    color: colors.white,
    fontSize: 18,
    fontWeight: '800',
    lineHeight: 25,
    letterSpacing: -0.2,
  },
  heroSub: {
    color: 'rgba(255,255,255,0.82)',
    fontSize: 12,
    marginTop: 4,
    fontWeight: '500',
    letterSpacing: 0.3,
  },

  /* ── Greeting ── */
  greetRow: {
    paddingHorizontal: HPAD,
    paddingTop: spacing.md,
    paddingBottom: spacing.sm,
  },
  greetName: {
    fontSize: 22,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.3,
  },
  greetSub: {
    fontSize: 14,
    color: colors.textMuted,
    marginTop: 2,
  },

  /* ── Carousel section ── */
  carouselSection: {
    marginBottom: spacing.sm,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: HPAD,
    paddingTop: spacing.sm,
    paddingBottom: spacing.xs,
  },
  viewAllBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
    // ensure 48px touch target height
    paddingVertical: spacing.sm,
  },
  viewAllTxt: {
    fontSize: 13,
    fontWeight: '600',
    color: colors.teal,
  },
  carouselContent: {
    paddingBottom: spacing.sm,
    alignItems: 'flex-start',
  },

  /* ── Update card (carousel item) ── */
  updateCard: {
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    overflow: 'hidden',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.07, shadowRadius: 5 },
      android: { elevation: 2 },
    }),
  },
  updateCardImg: {
    width: '100%',
    height: CAROUSEL_IMG_H,
  },
  updateCardBody: {
    flex: 1,
    padding: spacing.sm + 2,   // 10px
    justifyContent: 'space-between',
  },
  updateCardBodyNoImg: {
    // When there is no image, give a bit more top breathing room
    paddingTop: spacing.md,
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm + 2,
  },

  /* Title */
  updateTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: colors.navy,
    lineHeight: 20,
    marginBottom: 6,
    letterSpacing: -0.1,
  },

  /* Footer */
  updateFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 'auto' as any,
  },
  platformIconWrap: {
    width: 22,
    height: 22,
    borderRadius: 6,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 4,
  },
  openPostBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    marginLeft: 'auto' as any,
  },
  openPostTxt: {
    fontSize: 11,
    fontWeight: '600',
    color: colors.teal,
  },
  urlErrorRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: spacing.xs,
  },
  urlErrorTxt: {
    fontSize: 11,
    color: colors.error,
    flex: 1,
  },
  dateRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  dateText: {
    fontSize: 11,
    color: colors.textMuted,
    fontWeight: '500',
  },

  /* ── Section header ── */
  sectionHeader: {
    paddingHorizontal: HPAD,
    paddingTop: spacing.sm,
    paddingBottom: spacing.sm,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.2,
  },

  /* ── Grid ── */
  grid: {
    paddingHorizontal: HPAD,
    gap: CGAP,
  },
  gridRow: {
    flexDirection: 'row',
  },

  /* ── Service card ── */
  card: {
    width: CARD_W,
    backgroundColor: colors.white,
    borderRadius: radius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 4,
    minHeight: 88,
    justifyContent: 'center',
    ...Platform.select({
      ios:     { shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.06, shadowRadius: 4 },
      android: { elevation: 1 },
    }),
  },
  iconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: colors.navy,
    textAlign: 'center',
    lineHeight: 15,
    paddingHorizontal: 2,
  },
});

// ─── Helpers ─────────────────────────────────────────────────────────────────
function chunk<T>(arr: T[], n: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += n) out.push(arr.slice(i, i + n));
  return out;
}
