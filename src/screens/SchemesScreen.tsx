import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { useApp } from '../AppContext';

const CATS = ['All', 'Education', 'Housing', 'Health'];

export default function SchemesScreen({ navigation }: any): React.JSX.Element {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh(['schemes']);
  const [filter, setFilter] = useState('All');
  const [query, setQuery] = useState('');

  const schemes = (data.schemes || []).filter((s: any) => {
    const matchCat = filter === 'All' || (s.category || '').toLowerCase() === filter.toLowerCase();
    const matchQ = !query || s.title.toLowerCase().includes(query.toLowerCase());
    return matchCat && matchQ;
  });

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Government Schemes" />

      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.body}>
          <View style={s.searchRow}>
            <MaterialIcons name="search" size={18} color={colors.textMuted} style={s.searchIco} />
            <TextInput style={s.searchInput} value={query} onChangeText={setQuery} placeholder="Search schemes" placeholderTextColor={colors.textMuted} />
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.filterScroll}>
            {CATS.map(c => (
              <TouchableOpacity key={c} style={[s.chip, filter === c && s.chipActive]} onPress={() => setFilter(c)}>
                <Text style={[s.chipTxt, filter === c && s.chipTxtActive]}>{c}</Text>
              </TouchableOpacity>
            ))}
          </ScrollView>

          {schemes.map((sc: any) => (
            <View key={sc.id} style={s.card}>
              <View style={s.cardLeft}>
                <View style={s.cardIcoBox}>
                  <MaterialIcons name="eco" size={24} color={colors.teal} />
                </View>
                <View style={s.cardBody}>
                  <Text style={s.cardTitle}>{sc.title}</Text>
                  {sc.programme ? <Text style={s.cardProg}>{sc.programme}</Text> : null}
                  <Text style={s.cardDesc} numberOfLines={2}>{sc.description}</Text>
                </View>
              </View>
              <TouchableOpacity style={s.eligBtn} onPress={() => navigation.navigate('SchemeDetail', { scheme: sc })}>
                <Text style={s.eligTxt}>View eligibility</Text>
              </TouchableOpacity>
            </View>
          ))}

          {schemes.length === 0 && (
            <View style={s.empty}>
              <Text style={s.emptyTxt}>No schemes found.</Text>
            </View>
          )}

        </View>
      </RefreshableScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, marginBottom: spacing.sm },
  searchIco: { marginRight: 6 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.navy },
  filterScroll: { marginBottom: spacing.md },
  chip: { paddingHorizontal: 16, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipTxt: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  chipTxtActive: { color: colors.white },
  card: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardLeft: { flexDirection: 'row', marginBottom: spacing.sm },
  cardIcoBox: { width: 48, height: 48, borderRadius: radius.md, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.navy },
  cardProg: { fontSize: 12, color: colors.textMuted, marginBottom: 2 },
  cardDesc: { fontSize: 13, color: colors.textMuted },
  eligBtn: { backgroundColor: colors.tealLight, borderRadius: radius.sm, paddingVertical: 8, alignItems: 'center' },
  eligTxt: { color: colors.teal, fontSize: 13, fontWeight: '600' },
  empty: { paddingVertical: spacing.xl, alignItems: 'center' },
  emptyTxt: { color: colors.textMuted, fontSize: 14 },
});
