import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { useApp } from '../AppContext';

const CATS = ['All', 'Emergency', 'Local'];

export default function PhoneNumbersScreen({ navigation }: any) {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh();
  const [cat, setCat] = useState('All');
  const numbers: any[] = (data as any).phoneNumbers || [];
  const filtered = cat === 'All' ? numbers : numbers.filter((n: any) => n.category === cat);

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Phone Numbers" />
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.body}>
          <View style={s.searchRow}>
            <MaterialIcons name="search" size={18} color={colors.textMuted} style={s.searchIco} />
            <TextInput style={s.searchInput} placeholder="Search contacts" placeholderTextColor={colors.textMuted} editable={false} />
          </View>
          <View style={s.tabRow}>
            {CATS.map(t => (
              <TouchableOpacity key={t} style={[s.tab, cat === t && s.tabActive]} onPress={() => setCat(t)}>
                <Text style={[s.tabTxt, cat === t && s.tabTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {filtered.map((item: any) => (
            <View key={item.id} style={s.card}>
              <View style={s.cardIcon}>
                <MaterialIcons name="phone" size={22} color={colors.teal} />
              </View>
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardNum}>{item.number}</Text>
              </View>
              <TouchableOpacity
                style={s.callBtn}
                onPress={() => Linking.openURL(`tel:${item.number.replace(/\s/g, '')}`)}
                accessibilityLabel={`Call ${item.title}`}
              >
                <MaterialIcons name="call" size={20} color={colors.teal} />
              </TouchableOpacity>
            </View>
          ))}
          <View style={s.warnBox}>
            <MaterialIcons name="warning-amber" size={14} color="#DC2626" />
            <Text style={s.warnTxt}>Demo numbers. Not for real calls.</Text>
          </View>
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
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  tabRow: { flexDirection: 'row', marginBottom: spacing.md },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  tabTxt: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  tabTxtActive: { color: colors.white },
  card: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardIcon: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 14, fontWeight: '700', color: colors.navy },
  cardNum: { fontSize: 13, color: colors.textMuted },
  callBtn: { width: 44, height: 44, borderRadius: 22, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center' },
  warnBox: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: '#FEE2E2', borderRadius: radius.sm, padding: spacing.sm, marginTop: spacing.sm },
  warnTxt: { color: '#DC2626', fontSize: 12 },
});
