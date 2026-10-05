import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';

export default function DevelopmentDetailScreen({ route, navigation }: any) {
  const { item } = route.params ?? {};

  if (!item) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title="Programme Details" />
        <View style={s.notFound}>
          <MaterialIcons name="error-outline" size={48} color={colors.border} />
          <Text style={s.notFoundTitle}>Programme not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const isOngoing = item.status === 'Ongoing';

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title="Programme Details" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Title + status */}
        <View style={s.titleCard}>
          <Text style={s.title}>{item.title}</Text>
          <View style={s.metaRow}>
            <View style={[s.statusBadge, isOngoing ? s.badgeOngoing : s.badgeDone]}>
              <MaterialIcons
                name={isOngoing ? 'schedule' : 'check-circle'}
                size={12}
                color={isOngoing ? '#16A34A' : '#0369A1'}
              />
              <Text style={[s.statusTxt, { color: isOngoing ? '#16A34A' : '#0369A1' }]}>{item.status}</Text>
            </View>
            <View style={s.wardRow}>
              <Ionicons name="location-outline" size={13} color={colors.textMuted} />
              <Text style={s.wardTxt}>{item.ward}</Text>
            </View>
          </View>
        </View>

        {/* Progress */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>PROGRESS</Text>
          <View style={s.progressBar}>
            <View style={[s.progressFill, { width: `${item.progress}%` as any }]} />
          </View>
          <Text style={s.progressTxt}>{item.progress}% complete</Text>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DESCRIPTION</Text>
          <Text style={s.sectionValue}>{item.description}</Text>
        </View>

        {/* Location */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>LOCATION</Text>
          <View style={s.infoRow}>
            <Ionicons name="location-outline" size={16} color={colors.teal} />
            <Text style={s.infoTxt}>{item.ward}</Text>
          </View>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  scroll:        { padding: spacing.md },
  titleCard:     { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border },
  title:         { fontSize: 18, fontWeight: '800', color: colors.navy, marginBottom: spacing.sm, lineHeight: 26 },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: spacing.sm, flexWrap: 'wrap' },
  statusBadge:   { flexDirection: 'row', alignItems: 'center', gap: 4, paddingHorizontal: 10, paddingVertical: 4, borderRadius: radius.full },
  badgeOngoing:  { backgroundColor: '#DCFCE7' },
  badgeDone:     { backgroundColor: '#E0F2FE' },
  statusTxt:     { fontSize: 12, fontWeight: '700' },
  wardRow:       { flexDirection: 'row', alignItems: 'center', gap: 3 },
  wardTxt:       { fontSize: 13, color: colors.textMuted },
  section:       { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  sectionValue:  { fontSize: 14, color: colors.navy, lineHeight: 22 },
  progressBar:   { height: 8, backgroundColor: colors.border, borderRadius: 4, marginBottom: 6 },
  progressFill:  { height: 8, backgroundColor: colors.teal, borderRadius: 4 },
  progressTxt:   { fontSize: 13, color: colors.textMuted },
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTxt:       { fontSize: 14, color: colors.navy },
  notFound:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: spacing.md },
});
