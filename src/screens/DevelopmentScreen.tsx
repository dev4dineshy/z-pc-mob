import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { useApp } from '../AppContext';

const DEV_THUMBS = [
  require('../../assets/images/thumbnails/road-infrastructure.png'),
  require('../../assets/images/thumbnails/park-development.png'),
  require('../../assets/images/thumbnails/street-lighting.png'),
  require('../../assets/images/thumbnails/community-office.png'),
  require('../../assets/images/thumbnails/education-school.png'),
];

export default function DevelopmentScreen({ navigation }: any) {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh();
  const [status, setStatus] = useState<'Ongoing' | 'Completed'>('Ongoing');
  const dev: any[] = (data as any).development || [];
  const filtered = dev.filter((d: any) => d.status === status);

  const [area, setArea] = useState('All areas');
  const areas = ['All areas', 'Ward 01', 'Ward 02', 'Ward 03', 'Ward 04'];

  const areaFiltered = area === 'All areas' ? filtered : filtered.filter((d: any) => d.ward === area);

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Development" />
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.body}>
          <View style={s.areaRow}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {areas.map(a => (
                <TouchableOpacity key={a} style={[s.areaBtn, area === a && s.areaBtnActive]} onPress={() => setArea(a)}>
                  <Text style={[s.areaTxt, area === a && s.areaTxtActive]}>{a}</Text>
                  {area === a
                    ? <MaterialIcons name="check" size={12} color={colors.teal} />
                    : <MaterialIcons name="keyboard-arrow-down" size={12} color={colors.textMuted} />
                  }
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={s.tabRow}>
            {(['Ongoing', 'Completed'] as const).map(t => (
              <TouchableOpacity key={t} style={[s.tab, status === t && s.tabActive]} onPress={() => setStatus(t)}>
                <Text style={[s.tabTxt, status === t && s.tabTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {areaFiltered.map((d: any) => (
            <View key={d.id} style={s.card}>
              <View style={s.cardHero}>
                <Image source={DEV_THUMBS[areaFiltered.indexOf(d) % DEV_THUMBS.length]} style={s.cardHeroImg} resizeMode="cover" />
                <View style={[s.statusBadge, d.status === 'Ongoing' ? s.badgeOngoing : s.badgeDone]}>
                  <MaterialIcons
                    name={d.status === 'Ongoing' ? 'schedule' : 'check-circle'}
                    size={11}
                    color={d.status === 'Ongoing' ? '#16A34A' : '#0369A1'}
                  />
                  <Text style={s.badgeTxt}>{d.status}</Text>
                </View>
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{d.title}</Text>
                <View style={s.cardWardRow}>
                  <Ionicons name="location-outline" size={12} color={colors.textMuted} />
                  <Text style={s.cardWard}>{d.ward}</Text>
                </View>
                <View style={s.progressBar}>
                  <View style={[s.progressFill, { width: `${d.progress}%` as any }]} />
                </View>
                <Text style={s.progressTxt}>Progress {d.progress}%</Text>
                <Text style={s.cardDesc}>{d.description}</Text>
                <TouchableOpacity style={s.viewBtn} onPress={() => navigation.navigate('DevelopmentDetail', { item: d })}>
                  <Text style={s.viewBtnTxt}>View programme</Text>
                  <MaterialIcons name="chevron-right" size={16} color={colors.navy} />
                </TouchableOpacity>
              </View>
            </View>
          ))}
          {areaFiltered.length === 0 && <Text style={s.empty}>No {status.toLowerCase()} programmes.</Text>}
        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.md },
  areaRow: { marginBottom: spacing.sm },
  areaBtn: { flexDirection: 'row', alignItems: 'center', gap: 4, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingHorizontal: 14, paddingVertical: 8, marginRight: spacing.sm, backgroundColor: colors.white },
  areaBtnActive: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  areaTxt: { fontSize: 13, color: colors.navy },
  areaTxtActive: { color: colors.teal, fontWeight: '700' },
  tabRow: { flexDirection: 'row', backgroundColor: colors.tealLight, borderRadius: radius.full, padding: 4, marginBottom: spacing.md },
  tab: { flex: 1, paddingVertical: 8, borderRadius: radius.full, alignItems: 'center' },
  tabActive: { backgroundColor: colors.white },
  tabTxt: { fontSize: 13, color: colors.textMuted, fontWeight: '600' },
  tabTxtActive: { color: colors.teal },
  card: { backgroundColor: colors.white, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardHero: { height: 120, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center' },
  cardHeroImg: { position: 'absolute', width: '100%', height: 120 },
  statusBadge: { flexDirection: 'row', alignItems: 'center', gap: 4, position: 'absolute', top: spacing.sm, right: spacing.sm, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeOngoing: { backgroundColor: '#DCFCE7' },
  badgeDone: { backgroundColor: '#E0F2FE' },
  badgeTxt: { fontSize: 11, fontWeight: '700', color: colors.navy },
  cardBody: { padding: spacing.md },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  cardWardRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginBottom: 8 },
  cardWard: { fontSize: 12, color: colors.textMuted },
  progressBar: { height: 6, backgroundColor: colors.border, borderRadius: 3, marginBottom: 4 },
  progressFill: { height: 6, backgroundColor: colors.teal, borderRadius: 3 },
  progressTxt: { fontSize: 12, color: colors.textMuted, marginBottom: 8 },
  cardDesc: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  viewBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 2, borderWidth: 1, borderColor: colors.border, borderRadius: radius.sm, paddingVertical: 8 },
  viewBtnTxt: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
