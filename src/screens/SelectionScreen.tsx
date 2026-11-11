import React, { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { saveRegionCandidate } from '../data/dataService';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';

export default function SelectionScreen({ navigation }: any): React.JSX.Element {
  const { data, setData, session, setSession } = useApp();
  const account = session;
  const regions = data?.regions || [];
  const candidates = data?.candidates || [];

  const [selectedRegion, setSelectedRegion] = useState<string>(account?.regionId || '');
  const [selectedCandidate, setSelectedCandidate] = useState<string>(account?.candidateId || '');
  const [saving, setSaving] = useState(false);

  const filteredCandidates = candidates.filter((c: any) => c.regionId === selectedRegion);

  function handleRegionSelect(regionId: string) {
    setSelectedRegion(regionId);
    setSelectedCandidate('');
  }

  async function handleSave() {
    if (!selectedRegion || !selectedCandidate || !account) return;
    setSaving(true);
    try {
      const updated = await saveRegionCandidate(account.id, selectedRegion, selectedCandidate, data);
      await setSession(updated);
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    } catch (error) { Alert.alert('Unable to save', error instanceof Error ? error.message : 'Please try again.'); }
    finally { setSaving(false); }
  }

  const selRegion = regions.find((r: any) => r.id === selectedRegion);
  const selCandidate = filteredCandidates.find((c: any) => c.id === selectedCandidate);

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="logo" />
      <ScrollView contentContainerStyle={s.container}>

        <View style={s.body}>
          <Text style={s.title}>Choose your region{'\n'}and candidate</Text>
          <Text style={s.subtitle}>Set your preferences</Text>
          <Text style={s.desc}>Select the region you belong to and choose a candidate to support.</Text>

          <Text style={s.label}>Region</Text>
          {regions.map((r: any) => (
            <TouchableOpacity
              key={r.id}
              style={[s.option, selectedRegion === r.id && s.optionActive]}
              onPress={() => handleRegionSelect(r.id)}
            >
              <Ionicons name="location-outline" size={18} color={selectedRegion === r.id ? colors.teal : colors.textMuted} />
              <Text style={[s.optionText, selectedRegion === r.id && s.optionTextActive]}>{r.name}</Text>
              {selectedRegion === r.id && <MaterialIcons name="check" size={18} color={colors.teal} />}
            </TouchableOpacity>
          ))}

          <Text style={[s.label, { marginTop: spacing.lg }]}>Candidate</Text>
          {selectedRegion ? (
            filteredCandidates.length > 0 ? (
              <>
                <Text style={s.hint}>Candidates shown belong to {selRegion?.name}.</Text>
                {filteredCandidates.map((c: any) => (
                  <TouchableOpacity
                    key={c.id}
                    style={[s.option, selectedCandidate === c.id && s.optionActive]}
                    onPress={() => setSelectedCandidate(c.id)}
                  >
                    <MaterialIcons name="person-outline" size={20} color={selectedCandidate === c.id ? colors.teal : colors.textMuted} />
                    <Text style={[s.optionText, selectedCandidate === c.id && s.optionTextActive]}>{c.name}</Text>
                    {selectedCandidate === c.id && <MaterialIcons name="check" size={18} color={colors.teal} />}
                  </TouchableOpacity>
                ))}
              </>
            ) : (
              <Text style={s.hint}>No candidates available for this region.</Text>
            )
          ) : (
            <Text style={s.hint}>Select a region first.</Text>
          )}

          {selectedRegion && selectedCandidate && (
            <View style={s.summary}>
              <Text style={s.summaryTitle}>Your selection</Text>
              <View style={s.summaryRow}>
                <Ionicons name="location-outline" size={20} color={colors.teal} style={s.summaryIco} />
                <View>
                  <Text style={s.summaryLabel}>Region</Text>
                  <Text style={s.summaryVal}>{selRegion?.name}</Text>
                </View>
              </View>
              <View style={s.summaryRow}>
                <MaterialIcons name="person-outline" size={20} color={colors.teal} style={s.summaryIco} />
                <View>
                  <Text style={s.summaryLabel}>Candidate</Text>
                  <Text style={s.summaryVal}>{selCandidate?.name}</Text>
                </View>
              </View>
            </View>
          )}

          <TouchableOpacity
            style={[s.btn, (!selectedRegion || !selectedCandidate) && s.btnDisabled]}
            onPress={handleSave}
            disabled={!selectedRegion || !selectedCandidate || saving}
          >
            <Text style={s.btnText}>{saving ? 'Saving…' : 'Save and Continue'}</Text>
            {!saving && <MaterialIcons name="arrow-forward" size={18} color={colors.white} />}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  container: { flexGrow: 1 },
  body: { padding: spacing.lg },
  title: { fontSize: 24, fontWeight: 'bold', color: colors.navy, marginBottom: 4 },
  subtitle: { fontSize: 14, fontWeight: '600', color: colors.teal, marginBottom: 4 },
  desc: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '700', color: colors.navy, marginBottom: spacing.sm, textTransform: 'uppercase', letterSpacing: 0.5 },
  option: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, backgroundColor: colors.white },
  optionActive: { borderColor: colors.teal, backgroundColor: colors.tealLight },
  optionText: { flex: 1, fontSize: 15, color: colors.navy, marginLeft: spacing.sm },
  optionTextActive: { fontWeight: '600', color: colors.teal },
  hint: { fontSize: 12, color: colors.textMuted, marginBottom: spacing.sm, fontStyle: 'italic' },
  summary: { backgroundColor: colors.tealLight, borderRadius: radius.md, padding: spacing.md, marginVertical: spacing.lg },
  summaryTitle: { fontSize: 14, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  summaryRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.sm },
  summaryIco: { marginRight: spacing.sm },
  summaryLabel: { fontSize: 11, color: colors.textMuted },
  summaryVal: { fontSize: 15, fontWeight: '700', color: colors.navy },
  btn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 14, marginTop: spacing.md },
  btnDisabled: { backgroundColor: '#94A3B8' },
  btnText: { color: colors.white, fontWeight: 'bold', fontSize: 16 },
});
