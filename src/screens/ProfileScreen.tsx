import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';

export default function ProfileScreen({ navigation }: any): React.JSX.Element {
  const { data, session, logout } = useApp();
  const account = session;
  const region    = data.regions.find((r: any) => r.id === account?.regionId);
  const candidate = data.candidates.find((c: any) => c.id === account?.candidateId);

  function handleLogout() {
    Alert.alert('Logout', 'Are you sure you want to logout?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Logout', style: 'destructive', onPress: logout }
    ]);
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="title" title="Profile" navigation={navigation} />
      <ScrollView>
        <View style={s.avatarSection}>
          <View style={s.avatar}><Text style={s.avatarTxt}>{account?.name?.[0] ?? 'U'}</Text></View>
          <Text style={s.name}>{account?.name ?? '—'}</Text>
          <Text style={s.email}>{account?.email ?? '—'}</Text>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>My Preferences</Text>
          <View style={s.row}>
            <Ionicons name="location-outline" size={20} color={colors.textMuted} style={s.rowIco} />
            <View style={s.rowBody}>
              <Text style={s.rowLabel}>Region</Text>
              <Text style={s.rowVal}>{region?.name || 'Not set'}</Text>
            </View>
            <TouchableOpacity onPress={() => navigation.navigate('Selection')}>
              <Text style={s.changeBtn}>Change</Text>
            </TouchableOpacity>
          </View>
          <View style={[s.row, { borderBottomWidth: 0 }]}>
            <MaterialIcons name="person-outline" size={20} color={colors.textMuted} style={s.rowIco} />
            <View style={s.rowBody}>
              <Text style={s.rowLabel}>Candidate</Text>
              <Text style={s.rowVal}>{candidate?.name || 'Not set'}</Text>
            </View>
          </View>
        </View>

        <View style={s.card}>
          <Text style={s.cardTitle}>Account</Text>
          <View style={s.row}>
            <MaterialIcons name="badge" size={20} color={colors.textMuted} style={s.rowIco} />
            <View style={s.rowBody}>
              <Text style={s.rowLabel}>Account ID</Text>
              <Text style={s.rowVal}>{account?.id}</Text>
            </View>
          </View>
          <View style={[s.row, { borderBottomWidth: 0 }]}>
            <MaterialIcons name="verified-user" size={20} color={colors.textMuted} style={s.rowIco} />
            <View style={s.rowBody}>
              <Text style={s.rowLabel}>Role</Text>
              <Text style={s.rowVal}>Registered User</Text>
            </View>
          </View>
        </View>

        <TouchableOpacity style={s.logoutBtn} onPress={handleLogout}>
          <Text style={s.logoutTxt}>Logout</Text>
        </TouchableOpacity>

        <View style={{ height: 32 }} />
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  avatarSection: { alignItems: 'center', paddingVertical: spacing.xl, backgroundColor: colors.navy },
  avatar: { width: 72, height: 72, borderRadius: 36, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.sm },
  avatarTxt: { color: colors.white, fontSize: 30, fontWeight: 'bold' },
  name: { color: colors.white, fontSize: 18, fontWeight: 'bold' },
  email: { color: colors.teal, fontSize: 13, marginTop: 2 },
  card: { backgroundColor: colors.white, marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: radius.md, borderWidth: 1, borderColor: colors.border, padding: spacing.md },
  cardTitle: { fontSize: 13, fontWeight: '700', color: colors.textMuted, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: spacing.sm },
  row: { flexDirection: 'row', alignItems: 'center', paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: colors.border },
  rowIco: { marginRight: spacing.sm },
  rowBody: { flex: 1 },
  rowLabel: { fontSize: 11, color: colors.textMuted },
  rowVal: { fontSize: 15, color: colors.navy, fontWeight: '600' },
  changeBtn: { color: colors.teal, fontSize: 13, fontWeight: '600' },
  resetBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, backgroundColor: colors.tealLight, borderRadius: radius.sm, padding: spacing.md },
  resetBtnTxt: { color: colors.teal, fontWeight: '600', fontSize: 14 },
  logoutBtn: { backgroundColor: '#FEE2E2', marginHorizontal: spacing.md, marginTop: spacing.md, borderRadius: radius.md, padding: spacing.md, alignItems: 'center' },
  logoutTxt: { color: colors.error, fontWeight: 'bold', fontSize: 15 },
});
