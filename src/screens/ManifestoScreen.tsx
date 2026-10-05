import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import { useApp } from '../AppContext';

const CATS = ['All', 'Education', 'Health', 'Infrastructure'];

export default function ManifestoScreen({ navigation }: any) {
  const { data } = useApp();
  const [filter, setFilter] = useState('All');
  const items: any[] = (data as any).manifesto_items || [];
  const filtered = filter === 'All' ? items : items.filter((i: any) => i.category === filter);

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Manifesto" />
      <ScrollView showsVerticalScrollIndicator={false}>
        <View style={s.body}>
          <Text style={s.subtitle}>Our commitments to the community</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterRow}>
            {CATS.map(c => (
              <TouchableOpacity key={c} style={[s.chip, filter === c && s.chipActive]} onPress={() => setFilter(c)}>
                <Text style={[s.chipTxt, filter === c && s.chipTxtActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
          {filtered.map((item: any) => (
            <TouchableOpacity
              key={item.id}
              style={s.card}
              activeOpacity={0.75}
              onPress={() => navigation.navigate('ManifestoDetail', { item })}
            >
              <View style={s.cardIcoBox}>
                <Text style={s.cardIco}>{item.icon}</Text>
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardDesc} numberOfLines={2}>{item.description}</Text>
                <View style={s.categoryRow}>
                  <View style={s.categoryBadge}>
                    <Text style={s.categoryTxt}>{item.category}</Text>
                  </View>
                </View>
              </View>
              <MaterialIcons name="chevron-right" size={22} color={colors.textMuted} />
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  body:          { padding: spacing.md },
  subtitle:      { fontSize: 15, fontWeight: '600', color: colors.navy, marginBottom: spacing.sm },
  filterRow:     { marginBottom: spacing.md },
  chip:          { paddingHorizontal: 16, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  chipActive:    { backgroundColor: colors.teal, borderColor: colors.teal },
  chipTxt:       { fontSize: 13, color: colors.navy, fontWeight: '600' },
  chipTxtActive: { color: colors.white },
  card:          { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardIcoBox:    { width: 52, height: 52, borderRadius: radius.sm, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm, flexShrink: 0 },
  cardIco:       { fontSize: 26 },
  cardBody:      { flex: 1 },
  cardTitle:     { fontSize: 15, fontWeight: '700', color: colors.navy },
  cardDesc:      { fontSize: 12, color: colors.textMuted, marginTop: 2, lineHeight: 18 },
  categoryRow:   { marginTop: spacing.xs },
  categoryBadge: { alignSelf: 'flex-start', backgroundColor: colors.tealLight, borderRadius: radius.full, paddingHorizontal: 8, paddingVertical: 2 },
  categoryTxt:   { fontSize: 11, color: colors.teal, fontWeight: '600' },
});
