import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';
import RefreshableScrollView from '../components/RefreshableScrollView';
import { useRefresh } from '../hooks/useRefresh';

const TABS = ['All', 'Updates', 'Surveys'];
const SORTS = ['Latest first', 'Oldest first'];

const POST_THUMBS = [
  require('../../assets/images/thumbnails/community-meeting.png'),
  require('../../assets/images/thumbnails/survey-clipboard.png'),
  require('../../assets/images/thumbnails/park-cleanup.png'),
  require('../../assets/images/thumbnails/community-office.png'),
  require('../../assets/images/thumbnails/party-community-illustration.png'),
];

export default function CommunityHubScreen({ navigation }: any) {
  const { data } = useApp();
  const { refreshing, onRefresh, errorMsg, clearError } = useRefresh();
  const [tab, setTab] = useState('All');
  const [sort, setSort] = useState('Latest first');

  const posts = data.posts.filter((p: any) => {
    if (p.status !== 'published') return false;
    if (tab === 'Surveys') return p.type === 'survey';
    if (tab === 'Updates') return p.type === 'update' || !p.type;
    return true;
  });

  const sorted = [...posts].sort((a: any, b: any) =>
    sort === 'Latest first'
      ? new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      : new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
  );

  function cycleSort() {
    setSort(s => (s === 'Latest first' ? 'Oldest first' : 'Latest first'));
  }

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Community Hub" />
      <RefreshableScrollView
        refreshing={refreshing}
        onRefresh={onRefresh}
        errorMsg={errorMsg}
        clearError={clearError}
      >
        <View style={s.body}>
          <View style={s.searchRow}>
            <MaterialIcons name="search" size={18} color={colors.textMuted} style={s.searchIco} />
            <TextInput style={s.searchInput} placeholder="Search updates and surveys" placeholderTextColor={colors.textMuted} editable={false} />
          </View>

          <View style={s.tabRow}>
            {TABS.map(t => (
              <TouchableOpacity key={t} style={[s.tab, tab === t && s.tabActive]} onPress={() => setTab(t)}>
                <Text style={[s.tabTxt, tab === t && s.tabTxtActive]}>{t}</Text>
              </TouchableOpacity>
            ))}
            <TouchableOpacity style={s.sortBtn} onPress={cycleSort}>
              <Text style={s.sortTxt}>{sort}</Text>
              <MaterialIcons name="swap-vert" size={14} color={colors.textMuted} />
            </TouchableOpacity>
          </View>

          {sorted.map((p: any) => (
            <View key={p.id} style={s.card}>
            <Image source={POST_THUMBS[sorted.indexOf(p) % POST_THUMBS.length]} style={s.cardHeroImg} resizeMode="cover" />
              <View style={s.cardBody}>
                <View style={s.cardTagRow}>
                  <View style={[s.tag, p.type === 'survey' ? s.tagSurvey : s.tagUpdate]}>
                    <Text style={s.tagTxt}>{p.type === 'survey' ? 'Survey' : 'Update'}</Text>
                  </View>
                </View>
                <Text style={s.cardTitle}>{p.title}</Text>
                <Text style={s.cardAuthor}>Published by {p.ownerType === 'party' ? 'admin' : 'candidate'}</Text>
                <Text style={s.cardDate}>{p.createdAt}</Text>
                <Text style={s.cardDesc} numberOfLines={2}>{p.body}</Text>
                {p.type === 'survey' ? (
                  <View style={s.surveyNote}>
                    <MaterialIcons name="info-outline" size={13} color="#92400E" />
                    <Text style={s.surveyNoteTxt}>Survey demo — responses not collected in this preview.</Text>
                  </View>
                ) : (
                  <View style={s.cardActions}>
                    <TouchableOpacity style={s.openBtn} onPress={() => navigation.navigate('PostDetail', { postId: p.id })}>
                      <Text style={s.openBtnTxt}>View details</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>
            </View>
          ))}

          {posts.length === 0 && <Text style={s.empty}>No items found.</Text>}
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
  tabRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  tab: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  tabTxt: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  tabTxtActive: { color: colors.white },
  sortBtn: { flexDirection: 'row', alignItems: 'center', gap: 2, marginLeft: 'auto' as any },
  sortTxt: { fontSize: 12, color: colors.textMuted },
  card: { backgroundColor: colors.white, borderRadius: radius.md, marginBottom: spacing.md, borderWidth: 1, borderColor: colors.border, overflow: 'hidden' },
  cardHeroImg: { width: '100%', height: 120 },
  cardBody: { padding: spacing.md },
  cardTagRow: { marginBottom: 4 },
  tag: { alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full },
  tagUpdate: { backgroundColor: colors.tealLight },
  tagSurvey: { backgroundColor: '#FEF9C3' },
  tagTxt: { fontSize: 11, fontWeight: '700', color: colors.navy },
  cardTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 2 },
  cardAuthor: { fontSize: 12, color: colors.textMuted },
  cardDate: { fontSize: 12, color: colors.textMuted, marginBottom: 4 },
  cardDesc: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.sm },
  cardActions: { flexDirection: 'row' },
  openBtn: { backgroundColor: colors.teal, borderRadius: radius.sm, paddingVertical: 8, paddingHorizontal: 14 },
  openBtnTxt: { color: colors.white, fontSize: 13, fontWeight: '600' },
  surveyNote: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: '#FEF9C3', borderRadius: radius.sm, padding: spacing.sm },
  surveyNoteTxt: { fontSize: 12, color: '#92400E', flex: 1 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
});
