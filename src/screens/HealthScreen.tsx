import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { useApp } from '../AppContext';

const HEALTH_BANNER = require('../../assets/images/banners/health-welfare-banner.png');

// Icon mapping for activities / links — vector icons with tinted boxes
const ACTIVITY_ICONS = [
  { name: 'favorite',       color: '#DC2626', bg: '#FEE2E2' },   // heart
  { name: 'support-agent',  color: '#0891B2', bg: '#CFFAFE' },   // support
  { name: 'volunteer-activism', color: '#16A34A', bg: '#DCFCE7' }, // volunteer
  { name: 'event',          color: '#7C3AED', bg: '#EDE9FE' },   // calendar/event
] as const;

export default function HealthScreen({ navigation }: any) {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh(['health']);
  const health: any = (data as any).health || {};

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title={health.name || 'Health & Welfare'} />
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.heroWrap}>
          <Image source={HEALTH_BANNER} style={s.heroBannerImg} resizeMode="cover" />
          <View style={s.heroOverlay}>
            <Text style={s.heroTitle}>{health.tagline}</Text>
            <Text style={s.heroDesc}>{health.description}</Text>
          </View>
        </View>
        <View style={s.body}>
          <Text style={s.sectionTitle}>Upcoming activities</Text>
          {(health.activities || []).map((a: any, i: number) => (
            <TouchableOpacity key={a.id} style={s.actCard} onPress={() => navigation.navigate('HealthActivity', { item: a })}>
              <View style={[s.actIconBox, { backgroundColor: ACTIVITY_ICONS[i % ACTIVITY_ICONS.length].bg }]}>
                <MaterialIcons name={ACTIVITY_ICONS[i % ACTIVITY_ICONS.length].name as any} size={22} color={ACTIVITY_ICONS[i % ACTIVITY_ICONS.length].color} />
              </View>
              <View style={s.actBody}>
                <Text style={s.actTitle}>{a.title}</Text>
                <View style={s.actDateRow}>
                  <MaterialIcons name="calendar-today" size={12} color={colors.textMuted} />
                  <Text style={s.actDate}>{a.date}</Text>
                </View>
                <View style={s.actLocRow}>
                  <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                  <Text style={s.actLoc}>{a.location}</Text>
                </View>
              </View>
            </TouchableOpacity>
          ))}
          {(health.activities || []).length > 0 && (
            <TouchableOpacity style={s.viewBtn} onPress={() => navigation.navigate('HealthActivity', { item: (health.activities || [])[0] })}>
              <Text style={s.viewBtnTxt}>View details</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: spacing.md }} />
          {(health.links || []).map((l: any, i: number) => (
            <TouchableOpacity key={l.id} style={s.linkCard} onPress={() => navigation.navigate('HealthActivity', { item: { id: l.id, title: l.title, desc: l.desc } })}>
              <View style={[s.actIconBox, { backgroundColor: ACTIVITY_ICONS[i % ACTIVITY_ICONS.length].bg }]}>
                <MaterialIcons name={ACTIVITY_ICONS[i % ACTIVITY_ICONS.length].name as any} size={20} color={ACTIVITY_ICONS[i % ACTIVITY_ICONS.length].color} />
              </View>
              <View style={s.linkBody}>
                <Text style={s.linkTitle}>{l.title}</Text>
                <Text style={s.linkDesc}>{l.desc}</Text>
              </View>
              <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  heroWrap: { height: 140 },
  heroBannerImg: { width: '100%', height: 140 },
  heroOverlay: { position: 'absolute', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(16,35,65,0.50)', justifyContent: 'center', alignItems: 'center', padding: spacing.md },
  heroTitle: { fontSize: 18, fontWeight: '800', color: colors.white, textAlign: 'center', marginBottom: 4 },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.85)', textAlign: 'center' },
  body: { padding: spacing.md },
  sectionTitle: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: spacing.sm },
  actCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  actIconBox: { width: 44, height: 44, borderRadius: 12, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  actBody: { flex: 1 },
  actTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  actDateRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 2 },
  actDate: { fontSize: 12, color: colors.textMuted },
  actLocRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  actLoc: { fontSize: 12, color: colors.textMuted },
  viewBtn: { backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 12, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  viewBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 14 },
  linkCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  linkBody: { flex: 1 },
  linkTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  linkDesc: { fontSize: 12, color: colors.textMuted },
});
