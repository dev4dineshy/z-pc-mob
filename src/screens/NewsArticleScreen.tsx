import React from 'react';
import { View, Text, ScrollView, StyleSheet, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';

const NEWS_THUMBS = [
  require('../../assets/images/thumbnails/community-meeting.png'),
  require('../../assets/images/thumbnails/library-news.png'),
  require('../../assets/images/thumbnails/roadworks-news.png'),
  require('../../assets/images/thumbnails/park-cleanup.png'),
  require('../../assets/images/thumbnails/education-school.png'),
  require('../../assets/images/thumbnails/health-clinic.png'),
];

export default function NewsArticleScreen({ route, navigation }: any) {
  const { article, thumbIndex = 0 } = route.params ?? {};

  if (!article) {
    return (
      <SafeAreaView style={s.safe} edges={['top']}>
        <AppHeader variant="title" navigation={navigation} title="Article" />
        <View style={s.notFound}>
          <MaterialIcons name="error-outline" size={48} color={colors.border} />
          <Text style={s.notFoundTitle}>Article not found</Text>
          <Text style={s.notFoundSub}>This article could not be loaded.</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" navigation={navigation} title="News" />
      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>
        <Image
          source={NEWS_THUMBS[thumbIndex % NEWS_THUMBS.length]}
          style={s.heroImg}
          resizeMode="cover"
        />
        {article.category ? (
          <View style={s.catBadge}>
            <Text style={s.catTxt}>{article.category}</Text>
          </View>
        ) : null}
        <Text style={s.title}>{article.title}</Text>
        <View style={s.metaRow}>
          <MaterialIcons name="calendar-today" size={13} color={colors.textMuted} />
          <Text style={s.metaDate}>{article.date}</Text>
        </View>
        <View style={s.divider} />
        <Text style={s.body}>{article.body}</Text>
        <View style={{ height: spacing.xl }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:          { flex: 1, backgroundColor: colors.background },
  scroll:        { padding: 0 },
  heroImg:       { width: '100%', height: 200 },
  catBadge:      { alignSelf: 'flex-start', backgroundColor: colors.tealLight, borderRadius: radius.full, paddingHorizontal: 12, paddingVertical: 4, margin: spacing.md, marginBottom: 8 },
  catTxt:        { fontSize: 12, fontWeight: '700', color: colors.teal },
  title:         { fontSize: 20, fontWeight: '800', color: colors.navy, lineHeight: 28, paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  metaRow:       { flexDirection: 'row', alignItems: 'center', gap: 5, paddingHorizontal: spacing.md, marginBottom: spacing.md },
  metaDate:      { fontSize: 13, color: colors.textMuted },
  divider:       { height: StyleSheet.hairlineWidth, backgroundColor: colors.border, marginHorizontal: spacing.md, marginBottom: spacing.md },
  body:          { fontSize: 15, color: colors.navy, lineHeight: 24, paddingHorizontal: spacing.md },
  notFound:      { flex: 1, alignItems: 'center', justifyContent: 'center', padding: spacing.xl },
  notFoundTitle: { fontSize: 18, fontWeight: '700', color: colors.navy, marginTop: spacing.md },
  notFoundSub:   { fontSize: 14, color: colors.textMuted, marginTop: 4, textAlign: 'center' },
});
