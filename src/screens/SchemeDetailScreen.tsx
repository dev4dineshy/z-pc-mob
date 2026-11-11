import React from 'react';
import { View, Text, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';

export default function SchemeDetailScreen({ route, navigation }: any) {
  const { scheme } = route.params ?? {};

  if (!scheme) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title="Scheme Details" />
        <View style={s.notFound}>
          <MaterialIcons name="error-outline" size={48} color={colors.border} />
          <Text style={s.notFoundTitle}>Scheme not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title="Scheme Details" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        {/* Icon + title card */}
        <View style={s.titleCard}>
          <View style={s.iconBox}>
            <MaterialIcons name="eco" size={28} color={colors.teal} />
          </View>
          <Text style={s.title}>{scheme.title}</Text>
          {scheme.category ? (
            <View style={s.catBadge}>
              <Text style={s.catTxt}>{scheme.category}</Text>
            </View>
          ) : null}
        </View>

        {/* Programme */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>PROGRAMME</Text>
          <Text style={s.sectionValue}>{scheme.programme || 'Government Scheme'}</Text>
        </View>

        {/* Description */}
        <View style={s.section}>
          <Text style={s.sectionLabel}>DESCRIPTION</Text>
          <Text style={s.sectionValue}>{scheme.description}</Text>
        </View>

        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:         { flex: 1, backgroundColor: colors.background },
  scroll:       { padding: spacing.md },
  titleCard:    { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, alignItems: 'center' },
  iconBox:      { width: 56, height: 56, borderRadius: radius.md, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  title:        { fontSize: 18, fontWeight: '800', color: colors.navy, textAlign: 'center', marginBottom: 6 },
  catBadge:     { backgroundColor: colors.tealLight, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4 },
  catTxt:       { fontSize: 12, fontWeight: '700', color: colors.teal },
  section:      { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  sectionLabel: { fontSize: 11, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.6, marginBottom: 6 },
  sectionValue: { fontSize: 14, color: colors.navy, lineHeight: 22 },
  notFound:     { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  notFoundTitle:{ fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: spacing.md },
});
