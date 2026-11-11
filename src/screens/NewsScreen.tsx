import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';
import { useApp } from '../AppContext';

// Map news item thumbnails by index (cycles)
const NEWS_THUMBS = [
  require('../../assets/images/thumbnails/community-meeting.png'),
  require('../../assets/images/thumbnails/library-news.png'),
  require('../../assets/images/thumbnails/roadworks-news.png'),
  require('../../assets/images/thumbnails/park-cleanup.png'),
  require('../../assets/images/thumbnails/education-school.png'),
  require('../../assets/images/thumbnails/health-clinic.png'),
];

const TABS = ['All', 'Community', 'Events'];

export default function NewsScreen({ navigation }: any) {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh(['news']);
  const [tab, setTab] = useState('All');
  const news: any[] = (data as any).news || [];
  const filtered = tab === 'All' ? news : news.filter((n: any) => n.category === tab);

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader
        variant="title"
        navigation={navigation}
        title="Latest News"
        rightSlot={
          <View>
            <MaterialIcons name="settings" size={22} color={colors.border} />
          </View>
        }
      />
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.body}>
          <View style={s.searchRow}>
            <MaterialIcons name="search" size={18} color={colors.textMuted} style={s.searchIco} />
            <TextInput style={s.searchInput} placeholder="Search news" placeholderTextColor={colors.textMuted} editable={false} />
          </View>
          <View style={s.tabRow}>
            {TABS.map(t => (
              <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
                <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
          </View>
          {/* Feature article */}
          {filtered[0] && (
            <TouchableOpacity style={s.featureCard} onPress={() => navigation.navigate('NewsArticle', { article: filtered[0], thumbIndex: 0 })}>
              <Image source={NEWS_THUMBS[0]} style={s.featureHeroImg} resizeMode="cover" />
              <Text style={s.featureTitle}>{filtered[0].title}</Text>
              <View style={[s.dateRow, s.featureDateRow]}>
                <MaterialIcons name="calendar-today" size={12} color={colors.textMuted} />
                <Text style={s.featureDate}>{filtered[0].date}</Text>
              </View>
              <Text style={s.featureBody}>{filtered[0].body}</Text>
            </TouchableOpacity>
          )}
          {/* List */}
          {filtered.slice(1).map((n: any, i: number) => (
            <TouchableOpacity key={n.id} style={s.listCard} onPress={() => navigation.navigate('NewsArticle', { article: n, thumbIndex: (i + 1) % 6 })}>
              <Image source={NEWS_THUMBS[(i + 1) % NEWS_THUMBS.length]} style={s.listThumb} resizeMode="cover" />
              <View style={s.listLeft}>
                <Text style={s.listTitle}>{n.title}</Text>
                <View style={s.dateRow}>
                  <MaterialIcons name="calendar-today" size={11} color={colors.textMuted} />
                  <Text style={s.listDate}>{n.date}</Text>
                </View>
                <Text style={s.listBody} numberOfLines={1}>{n.body}</Text>
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
  body: { padding: spacing.md },
  searchRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, paddingHorizontal: spacing.sm, marginBottom: spacing.sm },
  searchIco: { marginRight: 6 },
  dateRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  searchInput: { flex: 1, paddingVertical: 10, fontSize: 14 },
  tabRow: { flexDirection: 'row', marginBottom: spacing.md },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  tabTxt: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  tabTxtActive: { color: colors.white },
  featureCard: { backgroundColor: colors.white, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  featureHeroImg: { width: '100%', height: 140 },
  featureTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, padding: spacing.md, paddingBottom: 4 },
  featureDateRow: { paddingHorizontal: spacing.md },
  featureDate: { fontSize: 12, color: colors.textMuted },
  featureBody: { fontSize: 13, color: colors.textMuted, padding: spacing.md, paddingTop: 4 },
  listCard: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  listThumb: { width: 80, height: 70 },
  listLeft: { flex: 1, padding: spacing.sm },
  listTitle: { fontSize: 15, fontWeight: '700', color: colors.navy },
  listDate: { fontSize: 12, color: colors.textMuted },
  listBody: { fontSize: 13, color: colors.textMuted },
});
