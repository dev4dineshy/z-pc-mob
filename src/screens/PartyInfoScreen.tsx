import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { useApp } from '../AppContext';

const PARTY_BANNER = require('../../assets/images/banners/home-community-banner.png');
const PC_LOGO      = require('../../assets/images/logos/connected-people-symbol.png');

// ─── Platform colour + icon ───────────────────────────────────────────────────
function platformColor(platform: string): string {
  if (platform === 'facebook') return '#1877F2';
  if (platform === 'youtube')  return '#FF0000';
  if (platform === 'x')        return '#14171A';
  return colors.textMuted;
}
function platformIcon(platform: string): string {
  if (platform === 'facebook') return 'facebook';
  if (platform === 'youtube')  return 'ondemand-video';
  if (platform === 'x')        return 'close'; // closest MaterialIcons for X
  return 'link';
}
function platformLabel(platform: string): string {
  if (platform === 'facebook') return 'Facebook';
  if (platform === 'youtube')  return 'YouTube';
  if (platform === 'x')        return 'X';
  return platform;
}

// ─── Social channel row ───────────────────────────────────────────────────────
function ChannelRow({ ch }: { ch: any }) {
  const col     = platformColor(ch.platform);
  const icon    = platformIcon(ch.platform);
  const plLabel = platformLabel(ch.platform);
  const isVerified: boolean = ch.verified === true;

  async function handleOpen() {
    if (!isVerified || !ch.url) return;
    try {
      await Linking.openURL(ch.url);
    } catch {
      // silently ignore — URL open failure
    }
  }

  return (
    <View style={[r.row, !isVerified && r.rowUnverified]}>
      {/* Platform icon */}
      <View style={[r.iconWrap, { backgroundColor: col + '18' }]}>
        <MaterialIcons name={icon as any} size={20} color={isVerified ? col : colors.textMuted} />
      </View>

      {/* Label */}
      <View style={r.body}>
        <Text style={[r.label, !isVerified && r.labelMuted]}>{ch.label}</Text>
        <Text style={r.sub}>{plLabel}</Text>
      </View>

      {/* Status chip */}
      {isVerified ? (
        <TouchableOpacity style={r.openBtn} onPress={handleOpen} activeOpacity={0.75}>
          <MaterialIcons name="open-in-new" size={14} color={colors.teal} />
          <Text style={r.openTxt}>Open</Text>
        </TouchableOpacity>
      ) : (
        <View style={r.unverifiedChip}>
          <MaterialIcons name="pending" size={13} color={colors.warning} />
          <Text style={r.unverifiedTxt}>Link pending</Text>
        </View>
      )}
    </View>
  );
}

const r = StyleSheet.create({
  row:           { flexDirection: 'row', alignItems: 'center', paddingVertical: 10, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  rowUnverified: { opacity: 0.75 },
  iconWrap:      { width: 36, height: 36, borderRadius: 10, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm, flexShrink: 0 },
  body:          { flex: 1 },
  label:         { fontSize: 13, fontWeight: '600', color: colors.navy },
  labelMuted:    { color: colors.textMuted },
  sub:           { fontSize: 11, color: colors.textMuted, marginTop: 1 },
  openBtn:       { flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: colors.tealLight, borderRadius: 6, paddingHorizontal: 10, paddingVertical: 5 },
  openTxt:       { fontSize: 12, fontWeight: '600', color: colors.teal },
  unverifiedChip:{ flexDirection: 'row', alignItems: 'center', gap: 4, backgroundColor: '#FEF3C7', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  unverifiedTxt: { fontSize: 11, fontWeight: '600', color: colors.warning },
});

// ─── Screen ───────────────────────────────────────────────────────────────────
export default function PartyInfoScreen({ navigation }: any): React.JSX.Element {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh();
  const party = data.party;

  // Party-owned channels only
  const partyChannels: any[] = (data as any).channels?.filter(
    (ch: any) => ch.ownerType === 'party' && ch.ownerId === party.id
  ) ?? [];

  const hasUnverified = partyChannels.some((ch: any) => ch.verified === false);

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Party Information" />
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
        contentContainerStyle={s.container}
      >
        {/* Hero banner */}
        <View style={s.heroBox}>
          <Image source={PARTY_BANNER} style={s.heroBannerImg} resizeMode="cover" />
          <View style={s.heroBannerOverlay}>
            <Image source={PC_LOGO} style={s.heroLeaf} resizeMode="contain" />
            <Text style={s.partyName}>{party.name}</Text>
          </View>
        </View>

        {/* About */}
        <View style={s.card}>
          <Text style={s.cardTitle}>About</Text>
          <Text style={s.cardBody}>{party.about}</Text>
        </View>

        {/* Manifesto highlights */}
        <View style={s.card}>
          <Text style={s.cardTitle}>Our Manifesto</Text>
          {party.manifesto.map((item: string, i: number) => (
            <View key={i} style={s.manifestoItem}>
              <View style={s.bullet} />
              <Text style={s.manifestoText}>{item}</Text>
            </View>
          ))}
        </View>

        {/* Social channels */}
        {partyChannels.length > 0 && (
          <View style={s.card}>
            <Text style={s.cardTitle}>Follow us</Text>
            <Text style={s.cardSub}>Official social media channels</Text>

            {partyChannels.map((ch: any) => (
              <ChannelRow key={ch.id} ch={ch} />
            ))}

            {/* Notice when any channel link is pending verification */}
            {hasUnverified && (
              <View style={s.pendingNotice}>
                <MaterialIcons name="info-outline" size={14} color={colors.warning} />
                <Text style={s.pendingTxt}>
                  Some links are marked "Link pending" because the official account URL has not yet been confirmed. Links will become active once verified.
                </Text>
              </View>
            )}
          </View>
        )}

        <View style={{ height: 32 }} />
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:               { flex: 1, backgroundColor: colors.background },
  container:          { padding: spacing.md },
  heroBox:            { borderRadius: radius.lg, overflow: 'hidden', marginBottom: spacing.md, height: 160 },
  heroBannerImg:      { width: '100%', height: 160 },
  heroBannerOverlay:  { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(16,35,65,0.55)', justifyContent: 'center', alignItems: 'center' },
  heroLeaf:           { width: 52, height: 52, marginBottom: spacing.sm },
  partyName:          { color: colors.white, fontSize: 22, fontWeight: 'bold', textAlign: 'center' },
  card:               { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.lg, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  cardTitle:          { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  cardSub:            { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm },
  cardBody:           { fontSize: 14, color: colors.textMuted, lineHeight: 22 },
  manifestoItem:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: spacing.sm },
  bullet:             { width: 8, height: 8, borderRadius: 4, backgroundColor: colors.teal, marginTop: 6, marginRight: spacing.sm },
  manifestoText:      { flex: 1, fontSize: 14, color: colors.navy, lineHeight: 22 },
  pendingNotice:      { flexDirection: 'row', alignItems: 'flex-start', gap: 6, backgroundColor: '#FFFBEB', borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.md, borderWidth: 1, borderColor: '#FDE68A' },
  pendingTxt:         { flex: 1, fontSize: 12, color: '#92400E', lineHeight: 18 },
});
