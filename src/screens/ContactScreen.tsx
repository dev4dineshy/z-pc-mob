import React from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Linking, Image } from 'react-native';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, radius } from '../theme';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';

const RIVERSIDE = require('../../assets/images/banners/riverside-park.png');

export default function ContactScreen({ navigation }: any) {
  const { data } = useApp();
  const contact: any = (data as any).contact || {};

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Community Office" />
      <ScrollView>
        {/* Map preview — static image with Juba label */}
        <View style={s.mapPlaceholder}>
          <Image source={RIVERSIDE} style={s.mapImg} resizeMode="cover" />
          <View style={s.mapLabelRow}>
            <View style={s.mapLabelInner}>
              <Ionicons name="location-outline" size={13} color={colors.navy} />
              <Text style={s.mapLabel}>{contact.mapLabel || 'Juba, South Sudan'}</Text>
            </View>
          </View>
        </View>

        <View style={s.body}>
          {[
            { ico: <Ionicons name="location-outline" size={18} color={colors.teal} />, label: contact.address, onPress: undefined },
            { ico: <MaterialIcons name="phone"        size={18} color={colors.teal} />, label: contact.phone,   onPress: () => Linking.openURL(`tel:${contact.phone?.replace(/\s/g, '')}`) },
            { ico: <MaterialIcons name="email"        size={18} color={colors.teal} />, label: contact.email,   onPress: () => Linking.openURL(`mailto:${contact.email}`) },
            { ico: <MaterialIcons name="access-time"  size={18} color={colors.teal} />, label: contact.hours,   onPress: undefined },
          ].map((row, i) => (
            <TouchableOpacity key={i} style={s.row} onPress={row.onPress} disabled={!row.onPress}>
              <View style={s.rowIcoBox}>{row.ico}</View>
              <Text style={s.rowVal}>{row.label}</Text>
              {row.onPress && <MaterialIcons name="chevron-right" size={20} color={colors.textMuted} />}
            </TouchableOpacity>
          ))}

          {/* Directions — use stored coordinates when available, otherwise fall back to address text */}
          <TouchableOpacity
            style={s.dirBtn}
            onPress={() => {
              const coords = contact.mapCoords;
              const url = coords
                ? `https://maps.google.com/?q=${coords.lat},${coords.lng}`
                : `https://maps.google.com/?q=${encodeURIComponent(contact.address || 'Juba, South Sudan')}`;
              Linking.openURL(url);
            }}
          >
            <MaterialIcons name="navigation" size={18} color={colors.white} />
            <Text style={s.dirBtnTxt}>Get directions</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  mapPlaceholder: { height: 160, position: 'relative' },
  mapImg: { width: '100%', height: 160 },
  mapLabelRow: { position: 'absolute', bottom: 8, left: 12, backgroundColor: 'rgba(255,255,255,0.85)', borderRadius: 6, paddingHorizontal: 8, paddingVertical: 4 },
  mapLabelInner: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  mapLabel: { fontSize: 12, color: colors.navy, fontWeight: '600' },
  body: { padding: spacing.md },
  row: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  rowIcoBox: { width: 36, height: 36, borderRadius: 18, backgroundColor: colors.tealLight, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  rowVal: { flex: 1, fontSize: 14, color: colors.navy },
  dirBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 14, marginTop: spacing.md, marginBottom: spacing.sm },
  dirBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },
});
