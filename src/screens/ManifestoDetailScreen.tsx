import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';

// ─── Rich content per manifesto item id ──────────────────────────────────────
// Keyed by manifesto_item id from seedData

type DetailContent = {
  overview: string;
  points: string[];
  goal: string;
};

const DETAIL_CONTENT: Record<string, DetailContent> = {
  m1: {
    overview:
      'Every child and young person deserves access to quality education, regardless of where they live. Our Education Access commitment focuses on removing practical barriers that prevent learners from reaching their full potential.',
    points: [
      'Expand community learning centres to underserved areas so residents have access to libraries, study rooms, and educational resources close to home.',
      'Support early childhood development by funding accessible crèche and pre-school programmes for families who need them most.',
      'Partner with local schools to supply textbooks, stationery, and digital devices to learners from lower-income households.',
      'Establish adult literacy and skills programmes so that every resident — regardless of age — has the opportunity to learn and grow.',
      'Provide bursary information sessions to help eligible families understand and apply for financial assistance for further education.',
    ],
    goal:
      'Ensure that no resident is held back by a lack of access to learning. Education is the foundation of a stronger, fairer community.',
  },
  m2: {
    overview:
      'Healthy communities are the backbone of a thriving society. Our Community Health commitment focuses on bringing health awareness, prevention, and support services closer to where people live.',
    points: [
      'Organise regular community health camps offering free blood pressure, diabetes, and general wellness screenings for all residents.',
      'Run health education workshops in community halls covering nutrition, maternal health, mental wellbeing, and disease prevention.',
      'Strengthen the referral network between community volunteers and local clinics so residents can get the right care quickly.',
      'Support the Health Welfare Association in expanding its reach, especially in areas with limited access to formal health facilities.',
      'Promote mental health awareness and reduce stigma by providing safe spaces for conversations and peer support.',
    ],
    goal:
      'Build a community where every resident has the knowledge, access, and support to live a healthier life.',
  },
  m3: {
    overview:
      'Well-maintained roads, reliable street lighting, and safe public spaces are essential for daily life. Our Public Infrastructure commitment addresses the physical foundations that connect and protect our community.',
    points: [
      'Prioritise the repair and maintenance of roads and pavements in wards with the highest levels of deterioration.',
      'Complete the rollout of energy-efficient street lighting in remaining unlit areas to improve safety for pedestrians and residents.',
      'Upgrade public parks, recreational facilities, and green spaces so they are safe, clean, and accessible to all ages.',
      'Improve stormwater drainage in flood-prone neighbourhoods to reduce damage to homes and roads during heavy rains.',
      'Install clear road signage, pedestrian crossings, and traffic calming measures in high-risk areas near schools and community centres.',
    ],
    goal:
      'Create public spaces and infrastructure that are safe, functional, and a source of pride for every resident.',
  },
};

// Fallback content for items without specific entries
function getFallbackContent(item: any): DetailContent {
  return {
    overview: `Our commitment to ${item.title} is central to building a stronger and more connected community. This initiative reflects the priorities raised by residents and is guided by the principle that everyone deserves fair access to essential services and opportunities.`,
    points: [
      'Conduct regular community consultations to understand the specific needs and challenges residents face.',
      'Work with partner organisations and local government structures to coordinate effective delivery.',
      'Communicate progress openly so residents can hold us accountable to the commitments we make.',
      'Prioritise the most vulnerable households and communities when allocating resources and support.',
      'Review outcomes annually and adjust our approach based on what is and is not working.',
    ],
    goal: `Deliver meaningful, lasting improvements in ${item.title} that residents can see and feel in their daily lives.`,
  };
}

// ─── Screen ───────────────────────────────────────────────────────────────────

export default function ManifestoDetailScreen({ route, navigation }: any) {
  const { item } = route.params ?? {};

  if (!item) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title="Manifesto" />
        <View style={s.notFound}>
          <MaterialIcons name="error-outline" size={48} color={colors.border} />
          <Text style={s.notFoundTitle}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  const content: DetailContent = DETAIL_CONTENT[item.id] ?? getFallbackContent(item);

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title="Manifesto" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* Title card */}
        <View style={s.titleCard}>
          <View style={s.iconBox}>
            <Text style={s.iconText}>{item.icon}</Text>
          </View>
          <View style={s.categoryBadge}>
            <Text style={s.categoryTxt}>{item.category}</Text>
          </View>
          <Text style={s.title}>{item.title}</Text>
        </View>

        {/* Overview */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>OVERVIEW</Text>
          <Text style={s.overviewTxt}>{content.overview}</Text>
        </View>

        {/* Key commitments */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>KEY COMMITMENTS</Text>
          {content.points.map((point, i) => (
            <View key={i} style={s.pointRow}>
              <View style={s.bullet} />
              <Text style={s.pointTxt}>{point}</Text>
            </View>
          ))}
        </View>

        {/* Goal */}
        <View style={s.goalBox}>
          <MaterialIcons name="flag" size={18} color={colors.teal} style={s.goalIcon} />
          <Text style={s.goalTxt}>{content.goal}</Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  scroll:        { padding: spacing.md },

  titleCard:     {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.lg,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderColor: colors.border,
    alignItems: 'center',
  },
  iconBox:       {
    width: 64,
    height: 64,
    borderRadius: radius.md,
    backgroundColor: colors.tealLight,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing.sm,
  },
  iconText:      { fontSize: 32 },
  categoryBadge: {
    backgroundColor: colors.tealLight,
    borderRadius: radius.full,
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: spacing.sm,
  },
  categoryTxt:   { fontSize: 12, color: colors.teal, fontWeight: '700' },
  title:         { fontSize: 20, fontWeight: '800', color: colors.navy, textAlign: 'center', lineHeight: 28 },

  section:       {
    backgroundColor: colors.white,
    borderRadius: radius.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
    borderWidth: 1,
    borderColor: colors.border,
  },
  sectionLabel:  { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.7, marginBottom: spacing.sm },
  overviewTxt:   { fontSize: 14, color: colors.navy, lineHeight: 22 },

  pointRow:      { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 10 },
  bullet:        { width: 7, height: 7, borderRadius: 3.5, backgroundColor: colors.teal, marginTop: 7, marginRight: spacing.sm, flexShrink: 0 },
  pointTxt:      { flex: 1, fontSize: 14, color: colors.navy, lineHeight: 22 },

  goalBox:       {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing.sm,
    backgroundColor: colors.tealLight,
    borderRadius: radius.md,
    padding: spacing.md,
    marginTop: spacing.xs,
  },
  goalIcon:      { marginTop: 2, flexShrink: 0 },
  goalTxt:       { flex: 1, fontSize: 14, color: colors.navy, lineHeight: 22, fontStyle: 'italic' },

  notFound:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: spacing.md },
});
