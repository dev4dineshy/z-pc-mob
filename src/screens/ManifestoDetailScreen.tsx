import React from 'react';
import { ScrollView, StyleSheet, Text, View } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';

import AppHeader from '../components/AppHeader';
import { colors, radius, spacing } from '../theme';

export default function ManifestoDetailScreen({ route, navigation }: any) {
  const { item } = route.params ?? {};

  if (!item) {
    return (
      <SafeAreaView style={styles.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title="Manifesto" />
        <View style={styles.notFound}>
          <MaterialIcons name="error-outline" size={48} color={colors.border} />
          <Text style={styles.notFoundTitle}>Item not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title="Manifesto" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scroll}>
        <View style={styles.titleCard}>
          {item.icon ? <Text style={styles.iconText}>{item.icon}</Text> : null}
          {item.category ? (
            <View style={styles.categoryBadge}>
              <Text style={styles.categoryText}>{item.category}</Text>
            </View>
          ) : null}
          <Text style={styles.title}>{item.title}</Text>
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionLabel}>OVERVIEW</Text>
          <Text style={styles.description}>{item.description}</Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  scroll: { padding: spacing.md },
  titleCard: {
    alignItems: 'center',
    padding: spacing.lg,
    marginBottom: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  iconText: { marginBottom: spacing.sm, fontSize: 32 },
  categoryBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    marginBottom: spacing.sm,
    backgroundColor: colors.tealLight,
    borderRadius: radius.full,
  },
  categoryText: { color: colors.teal, fontSize: 12, fontWeight: '700' },
  title: {
    color: colors.navy,
    fontSize: 20,
    fontWeight: '800',
    lineHeight: 28,
    textAlign: 'center',
  },
  section: {
    padding: spacing.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.border,
    borderRadius: radius.md,
  },
  sectionLabel: {
    marginBottom: spacing.sm,
    color: colors.textMuted,
    fontSize: 11,
    fontWeight: '700',
    letterSpacing: 0.7,
  },
  description: { color: colors.navy, fontSize: 14, lineHeight: 22 },
  notFound: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    padding: spacing.xl,
  },
  notFoundTitle: {
    marginTop: spacing.md,
    color: colors.navy,
    fontSize: 18,
    fontWeight: '700',
  },
});
