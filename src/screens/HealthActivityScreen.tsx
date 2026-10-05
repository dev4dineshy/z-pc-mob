import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';

export default function HealthActivityScreen({ route, navigation }: any) {
  const { item } = route.params ?? {};

  if (!item) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title="Health & Welfare" />
        <View style={s.notFound}>
          <MaterialIcons name="error-outline" size={48} color={colors.border} />
          <Text style={s.notFoundTitle}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  // ── Link-type items (from health.links) have fullContent ──
  const isLinkItem = !!item.fullContent;

  if (isLinkItem) {
    const { overview, points, contact } = item.fullContent as {
      overview: string;
      points: string[];
      contact?: string;
    };

    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title={item.title} />
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

          {/* Overview */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>OVERVIEW</Text>
            <Text style={s.sectionValue}>{overview}</Text>
          </View>

          {/* Key points */}
          <View style={s.section}>
            <Text style={s.sectionLabel}>WHAT THIS COVERS</Text>
            {points.map((point, i) => (
              <View key={i} style={s.pointRow}>
                <View style={s.bullet} />
                <Text style={s.pointTxt}>{point}</Text>
              </View>
            ))}
          </View>

          {/* Contact / action */}
          {contact ? (
            <View style={s.contactBox}>
              <MaterialIcons name="phone" size={16} color={colors.teal} style={{ marginTop: 2, flexShrink: 0 }} />
              <Text style={s.contactTxt}>{contact}</Text>
            </View>
          ) : null}

          <View style={{ height: spacing.xl }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  // ── Activity-type items (from health.activities) ──
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title="Activity Details" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Icon + title */}
        <View style={s.titleCard}>
          <View style={s.iconBox}>
            <MaterialIcons name="favorite" size={28} color="#DC2626" />
          </View>
          <Text style={s.title}>{item.title}</Text>
        </View>

        {/* Date */}
        {item.date ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>DATE</Text>
            <View style={s.infoRow}>
              <MaterialIcons name="calendar-today" size={16} color={colors.teal} />
              <Text style={s.infoTxt}>{item.date}</Text>
            </View>
          </View>
        ) : null}

        {/* Location */}
        {item.location ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>LOCATION</Text>
            <View style={s.infoRow}>
              <Ionicons name="location-outline" size={16} color={colors.teal} />
              <Text style={s.infoTxt}>{item.location}</Text>
            </View>
          </View>
        ) : null}

        {/* Description */}
        {item.desc ? (
          <View style={s.section}>
            <Text style={s.sectionLabel}>DETAILS</Text>
            <Text style={s.sectionValue}>{item.desc}</Text>
          </View>
        ) : null}

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  scroll:        { padding: spacing.md },

  /* Title card (activity type) */
  titleCard:     { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  iconBox:       { width: 56, height: 56, borderRadius: radius.md, backgroundColor: '#FEE2E2', justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  title:         { fontSize: 18, fontWeight: '800', color: colors.navy, textAlign: 'center', lineHeight: 26 },

  /* Sections */
  section:       { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 8 },
  sectionValue:  { fontSize: 14, color: colors.navy, lineHeight: 22 },

  /* Info row (date / location) */
  infoRow:       { flexDirection: 'row', alignItems: 'center', gap: 8 },
  infoTxt:       { fontSize: 14, color: colors.navy },

  /* Key points */
  pointRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bullet:        { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.teal, marginTop: 7, marginRight: spacing.sm, flexShrink: 0 },
  pointTxt:      { flex: 1, fontSize: 14, color: colors.navy, lineHeight: 22 },

  /* Contact box */
  contactBox:    { flexDirection: 'row', alignItems: 'flex-start', gap: spacing.sm, backgroundColor: colors.tealLight, borderRadius: radius.md, padding: spacing.md, marginTop: spacing.xs },
  contactTxt:    { flex: 1, fontSize: 14, color: colors.navy, lineHeight: 22 },

  /* Not found */
  notFound:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: spacing.md },
});
