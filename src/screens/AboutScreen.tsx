import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';

const PEOPLE_SYM     = require('../../assets/images/logos/people-symbol-about-screen.png');
const ABOUT_ICONS = [
  require('../../assets/images/icons/about-information.png'),
  require('../../assets/images/icons/about-services.png'),
  require('../../assets/images/icons/about-sharing.png'),
];

export default function AboutScreen({ navigation }: any) {
  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="About" />
      <ScrollView>
        <View style={s.hero}>
          <Image source={PEOPLE_SYM} style={s.heroPeople} resizeMode="contain" />
          <Text style={s.heroSub}>Your community information hub</Text>
          <Text style={s.heroDesc}>Explore updates, programmes and support information in one place.</Text>
        </View>
        <View style={s.body}>
          {[
            { img: ABOUT_ICONS[0], title: 'Stay informed', desc: 'Read posts published by the admin and browse local updates.' },
            { img: ABOUT_ICONS[1], title: 'Access services', desc: 'Find scheme information, useful contacts and complaint support.' },
            { img: ABOUT_ICONS[2], title: 'Share updates', desc: 'Share published post links with your community.' },
          ].map((item, i) => (
            <View key={i} style={s.card}>
              <Image source={item.img} style={s.cardIco} resizeMode="contain" />
              <View style={s.cardBody}>
                <Text style={s.cardTitle}>{item.title}</Text>
                <Text style={s.cardDesc}>{item.desc}</Text>
              </View>
            </View>
          ))}

          <Text style={s.version}>App version 1.0.0</Text>

          <TouchableOpacity style={s.contactBtn} onPress={() => navigation.navigate('Contact')}>
            <Text style={s.contactBtnTxt}>✉ Contact Us</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  hero: { backgroundColor: colors.navy, padding: spacing.xl, alignItems: 'center' },
  heroPeople: { width: 80, height: 80, marginBottom: spacing.sm },
  heroSub: { fontSize: 14, color: colors.teal, marginBottom: 8, fontWeight: '600' },
  heroDesc: { fontSize: 13, color: 'rgba(255,255,255,0.7)', textAlign: 'center' },
  body: { padding: spacing.lg },
  card: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  cardIco: { width: 44, height: 44, borderRadius: radius.md, marginRight: spacing.md },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 2 },
  cardDesc: { fontSize: 13, color: colors.textMuted },
  version: { textAlign: 'center', color: colors.textMuted, fontSize: 13, marginVertical: spacing.md },
  contactBtn: { backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center', marginTop: spacing.sm },
  contactBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
