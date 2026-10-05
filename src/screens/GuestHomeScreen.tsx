import React from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  StyleSheet,
  StatusBar,
  Image,
  Dimensions,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';

const W = Dimensions.get('window').width;

const PARK_BANNER = require('../../assets/images/banners/home-community-banner.png');

export default function GuestHomeScreen({ navigation }: any): React.JSX.Element {
  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <StatusBar barStyle="dark-content" backgroundColor={colors.white} />

      <AppHeader
        variant="logo"
        rightSlot={
          <View style={s.guestChip}>
            <Text style={s.guestText}>Guest</Text>
          </View>
        }
      />

      <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={s.scroll}>

        {/* ── Hero headline ── */}
        <View style={s.heroText}>
          <Text style={s.heroTitle}>Stay connected.</Text>
          <Text style={s.heroSub}>Your community, in one place.</Text>
        </View>

        {/* ── Park banner ── */}
        <Image source={PARK_BANNER} style={s.bannerImg} resizeMode="cover" />

        {/* ── Public information label ── */}
        <View style={s.pubInfoWrap}>
          <Text style={s.pubInfoTitle}>Public information</Text>
          <Text style={s.pubInfoSub}>People · Places · Progress</Text>
        </View>

        {/* ── Login / Register buttons ── */}
        <View style={s.btnRow}>
          <TouchableOpacity
            style={s.btnLogin}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Login')}
            accessibilityLabel="Login"
          >
            <MaterialIcons name="login" size={20} color={colors.white} />
            <Text style={s.btnLoginTxt}>Login</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={s.btnRegister}
            activeOpacity={0.85}
            onPress={() => navigation.navigate('Register')}
            accessibilityLabel="Register"
          >
            <MaterialIcons name="person-add" size={20} color={colors.navy} />
            <Text style={s.btnRegTxt}>Register</Text>
          </TouchableOpacity>
        </View>

        {/* ── Divider ── */}
        <View style={s.divider} />

        {/* ── Explore section ── */}
        <View style={s.sectionHeader}>
          <Text style={s.sectionTitle}>Explore</Text>
          <Text style={s.sectionSub}>Available without signing in</Text>
        </View>

        {/* Party information card */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('PartyInfo')}
          accessibilityLabel="Party information"
        >
          <View style={[s.cardIconWrap, { backgroundColor: '#EAF1FC' }]}>
            <MaterialIcons name="flag" size={28} color="#2563EB" />
          </View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>Party information</Text>
            <Text style={s.cardDesc}>Our values, vision and manifesto.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
        </TouchableOpacity>

        {/* Schemes card */}
        <TouchableOpacity
          style={s.card}
          activeOpacity={0.8}
          onPress={() => navigation.navigate('Schemes')}
          accessibilityLabel="Schemes"
        >
          <View style={[s.cardIconWrap, { backgroundColor: '#FEF3EA' }]}>
            <MaterialIcons name="card-giftcard" size={28} color="#EA580C" />
          </View>
          <View style={s.cardBody}>
            <Text style={s.cardTitle}>Schemes</Text>
            <Text style={s.cardDesc}>Explore programmes and public initiatives.</Text>
          </View>
          <MaterialIcons name="chevron-right" size={22} color="#94A3B8" />
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const CARD_RADIUS = 14;

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.white },

  guestChip: {
    backgroundColor: '#EAF4F5',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: radius.full,
  },
  guestText: { color: colors.navy, fontSize: 12, fontWeight: '600' },

  scroll: { paddingBottom: 0 },

  heroText: { paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md },
  heroTitle: { fontSize: 30, fontWeight: '900', color: colors.navy, letterSpacing: -0.5 },
  heroSub: { fontSize: 15, color: '#64748B', marginTop: 4 },

  bannerImg: {
    width: W - spacing.md * 2,
    height: 200,
    borderRadius: CARD_RADIUS,
    alignSelf: 'center',
    marginBottom: spacing.md,
  },

  pubInfoWrap: { paddingHorizontal: spacing.md, marginBottom: spacing.md },
  pubInfoTitle: { fontSize: 20, fontWeight: '800', color: colors.navy },
  pubInfoSub: { fontSize: 13, color: '#64748B', marginTop: 2 },

  btnRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.sm,
    marginBottom: spacing.md,
  },
  btnLogin: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.teal,
    paddingVertical: 15,
    borderRadius: CARD_RADIUS,
  },
  btnLoginTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },

  btnRegister: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.white,
    paddingVertical: 15,
    borderRadius: CARD_RADIUS,
    borderWidth: 1.5,
    borderColor: colors.navy,
  },
  btnRegTxt: { color: colors.navy, fontWeight: '700', fontSize: 15 },

  divider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colors.border,
    marginHorizontal: spacing.md,
    marginBottom: spacing.lg,
  },

  sectionHeader: { paddingHorizontal: spacing.md, marginBottom: spacing.sm },
  sectionTitle: { fontSize: 22, fontWeight: '800', color: colors.navy },
  sectionSub: { fontSize: 13, color: '#64748B', marginTop: 2 },

  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: spacing.md,
    marginBottom: spacing.sm,
    padding: spacing.md,
    borderRadius: CARD_RADIUS,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.white,
  },
  cardIconWrap: {
    width: 52,
    height: 52,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: spacing.md,
  },
  cardBody: { flex: 1 },
  cardTitle: { fontSize: 15, fontWeight: '700', color: colors.navy, marginBottom: 2 },
  cardDesc: { fontSize: 13, color: '#64748B', lineHeight: 18 },

});
