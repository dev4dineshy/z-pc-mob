/**
 * AppHeader — universal header for PeopleConnect
 *
 * Variants driven by props:
 *
 *  variant="home"        logo + region pill + avatar
 *  variant="logo"        logo only (Selection, GuestHome)
 *  variant="logo-back"   back + logo (Login, Register, About)
 *  variant="logo-title"  back + logo + sub-title (CommunityHub)
 *  variant="title"       back + title (all inner screens)
 *
 * Optional right-side slot: pass `rightSlot` for extra icons / chips.
 */

import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Image,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';

// ── Assets ────────────────────────────────────────────────────────────────────
const CONNECTED_LOGO = require('../../assets/images/logos/connected-people-symbol.png');
const AVATAR_IMG     = require('../../assets/images/thumbnails/profile-avatar.png');

// ── Types ─────────────────────────────────────────────────────────────────────
export type AppHeaderVariant =
  | 'home'        // logo + region + avatar
  | 'logo'        // logo only
  | 'logo-back'   // back chevron + logo
  | 'logo-title'  // back + logo (small) + sub-title below
  | 'title';      // back + title text

export interface AppHeaderProps {
  variant: AppHeaderVariant;

  // navigation — required on screens with a back button
  navigation?: any;

  // "title" variant
  title?: string;

  // "home" / "logo" / "logo-back" / "logo-title"
  // (logo is always the connected-people mark + "PeopleConnect" wordmark)

  // "home" variant extras
  region?: { id: string; name: string } | null | undefined;
  onAvatarPress?: () => void;

  // right-side extra slot (any icon button)
  rightSlot?: React.ReactNode;

  // back destination override (if no history, navigate here instead)
  backFallback?: string;
}

// ── Constants ─────────────────────────────────────────────────────────────────
const HEADER_H        = 56;   // consistent height across all variants
const BACK_HIT        = 48;   // minimum touch target
const LOGO_MARK_SIZE  = 30;
const LOGO_FONT       = 17;

// ── Component ─────────────────────────────────────────────────────────────────
export default function AppHeader({
  variant,
  navigation,
  title,
  region,
  onAvatarPress,
  rightSlot,
  backFallback,
}: AppHeaderProps) {

  function handleBack() {
    if (!navigation) return;
    if (navigation.canGoBack()) {
      navigation.goBack();
    } else if (backFallback) {
      navigation.navigate(backFallback);
    }
  }

  // ── Back button ─────────────────────────────────────────────────────────────
  const BackBtn = (
    <TouchableOpacity
      onPress={handleBack}
      style={s.backBtn}
      activeOpacity={0.65}
      accessibilityLabel="Go back"
      accessibilityRole="button"
      hitSlop={{ top: 8, bottom: 8, left: 4, right: 4 }}
    >
      <View style={s.backCircle}>
        <MaterialIcons name="chevron-left" size={24} color={colors.navy} />
      </View>
    </TouchableOpacity>
  );

  // ── Logo mark + wordmark ─────────────────────────────────────────────────────
  const Logo = (
    <View style={s.logoRow}>
      <Image source={CONNECTED_LOGO} style={s.logoMark} resizeMode="contain" />
      <View style={s.logoTextWrap}>
        <Text style={s.logoWordDark}>People</Text>
        <Text style={s.logoWordTeal}>Connect</Text>
      </View>
    </View>
  );

  // ── Region pill ───────────────────────────────────────────────────────────────
  const RegionPill = region ? (
    <View style={s.regionPill}>
      <Ionicons name="location-outline" size={14} color={colors.teal} />
      <Text style={s.regionTxt} numberOfLines={1}>{region.name}</Text>
    </View>
  ) : null;

  // ── Avatar ────────────────────────────────────────────────────────────────────
  const Avatar = (
    <TouchableOpacity
      onPress={onAvatarPress}
      style={s.avatarWrap}
      activeOpacity={0.8}
      accessibilityLabel="View profile"
      accessibilityRole="button"
    >
      <Image source={AVATAR_IMG} style={s.avatarImg} resizeMode="cover" />
    </TouchableOpacity>
  );

  // ── Render by variant ────────────────────────────────────────────────────────
  let inner: React.ReactNode;

  if (variant === 'home') {
    inner = (
      <View style={s.row}>
        {Logo}
        <View style={s.right}>
          {RegionPill}
          {Avatar}
        </View>
      </View>
    );

  } else if (variant === 'logo') {
    inner = (
      <View style={s.row}>
        {Logo}
        {rightSlot ? <View style={s.right}>{rightSlot}</View> : null}
      </View>
    );

  } else if (variant === 'logo-back') {
    inner = (
      <View style={s.row}>
        {BackBtn}
        {Logo}
        {rightSlot ? <View style={s.right}>{rightSlot}</View> : <View style={s.backSpacer} />}
      </View>
    );

  } else if (variant === 'logo-title') {
    // two-line: back + logo on top row, title on second row
    inner = (
      <View>
        <View style={[s.row, { marginBottom: 4 }]}>
          {BackBtn}
          {Logo}
        </View>
        {title ? <Text style={s.subTitle}>{title}</Text> : null}
      </View>
    );

  } else {
    // variant === 'title'
    inner = (
      <View style={s.row}>
        {BackBtn}
        <Text style={s.titleTxt} numberOfLines={1}>{title ?? ''}</Text>
        {rightSlot
          ? <View style={s.right}>{rightSlot}</View>
          : <View style={s.titleSpacer} />}
      </View>
    );
  }

  return (
    <View style={s.container}>
      {inner}
    </View>
  );
}

// ── Styles ─────────────────────────────────────────────────────────────────────
const s = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    paddingHorizontal: spacing.md,
    paddingVertical: 10,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colors.border,
    minHeight: HEADER_H,
    justifyContent: 'center',
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  right: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginLeft: 'auto',
  },

  // Back button
  backBtn: {
    width: BACK_HIT,
    height: BACK_HIT,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: -10,   // optical alignment — keeps chevron visually at left edge
    marginRight: 2,
  },
  backCircle: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    justifyContent: 'center',
    alignItems: 'center',
  },
  // Invisible spacer mirrors the back button on the right so the title stays centred
  titleSpacer: { width: BACK_HIT, marginLeft: 'auto' },
  backSpacer:  { flex: 1 },

  // Logo
  logoRow:      { flexDirection: 'row', alignItems: 'center', gap: 6 },
  logoMark:     { width: LOGO_MARK_SIZE, height: LOGO_MARK_SIZE },
  logoTextWrap: { flexDirection: 'row', alignItems: 'center' },
  logoWordDark: { fontSize: LOGO_FONT, fontWeight: '800', color: colors.navy, letterSpacing: -0.3 },
  logoWordTeal: { fontSize: LOGO_FONT, fontWeight: '800', color: colors.teal, letterSpacing: -0.3 },

  // Region pill
  regionPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.tealLight,
    borderWidth: 1,
    borderColor: '#C2DFE0',
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: radius.full,
    maxWidth: 170,
    flexShrink: 1,
  },
  regionTxt: { fontSize: 12, color: colors.teal, fontWeight: '600', flexShrink: 1 },

  // Avatar
  avatarWrap: { width: 34, height: 34, borderRadius: 17, overflow: 'hidden' },
  avatarImg:  { width: 34, height: 34 },

  // Title variant
  titleTxt: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    color: colors.navy,
    letterSpacing: -0.2,
    marginLeft: 2,
  },

  // Sub-title (logo-title variant, e.g. CommunityHub)
  subTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: colors.navy,
    letterSpacing: -0.3,
    marginTop: 2,
    marginLeft: 2,
  },
});
