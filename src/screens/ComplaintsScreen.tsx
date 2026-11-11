import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons, Ionicons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import { useApp } from '../AppContext';
import { createComplaint } from '../data/dataService';

const CATEGORIES = ['Street lighting', 'Roads', 'Waste management', 'Water supply', 'Parks', 'Other'];

export default function ComplaintsScreen({ navigation }: any) {
  const { data, setData } = useApp();
  const [tab, setTab] = useState<'new' | 'mine'>('new');
  const [category, setCategory] = useState('');
  const [location, setLocation] = useState('');
  const [desc, setDesc] = useState('');
  const [agreed, setAgreed] = useState(false);
  const [submitted, setSubmitted] = useState<any>(null);

  const myComplaints: any[] = data.complaints || [];

  async function handleSubmit() {
    if (!category || !desc.trim()) return;
    try {
      const complaint = await createComplaint({ category, location, description: desc.trim() });
      setData({ ...data, complaints: [...data.complaints, complaint] }); setSubmitted(complaint);
      setCategory(''); setLocation(''); setDesc(''); setAgreed(false);
    } catch (error) { Alert.alert('Submission failed', error instanceof Error ? error.message : 'Please try again.'); }
  }

  if (submitted) return (
    <SafeAreaView style={s.safe}>
      <ScrollView contentContainerStyle={s.successContainer}>
        <View style={s.successCircle}>
          <MaterialIcons name="check" size={40} color={colors.white} />
        </View>
        <Text style={s.successTitle}>Complaint submitted</Text>
        <Text style={s.successRef}>Reference number</Text>
        <View style={s.refBox}>
          <Text style={s.refNum}>{submitted.ref}</Text>
          <MaterialIcons name="content-copy" size={18} color={colors.textMuted} />
        </View>
        <View style={s.statusCard}>
          <Text style={s.statusTitle}>{submitted.category}</Text>
          <View style={s.statusBadge}><Text style={s.statusBadgeTxt}>Received</Text></View>
          <View style={s.timeline}>
            <View style={s.timelineRow}>
              <MaterialIcons name="radio-button-on" size={14} color={colors.teal} />
              <Text style={s.timelineActive}>Received · {submitted.date}</Text>
            </View>
            <View style={s.timelineRow}>
              <MaterialIcons name="radio-button-off" size={14} color={colors.textMuted} />
              <Text style={s.timelineInactive}>Under review</Text>
            </View>
            <View style={s.timelineRow}>
              <MaterialIcons name="radio-button-off" size={14} color={colors.textMuted} />
              <Text style={s.timelineInactive}>Resolved</Text>
            </View>
          </View>
          <View style={s.summaryLocRow}>
            <Ionicons name="location-outline" size={13} color={colors.textMuted} />
            <Text style={s.summaryLoc}>{submitted.location || 'Location not provided'}</Text>
          </View>
        </View>
        <TouchableOpacity style={s.successBackBtn} onPress={() => setSubmitted(null)}>
          <MaterialIcons name="arrow-back" size={16} color={colors.white} />
          <Text style={s.backBtnTxt}>Back to my complaints</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Complaints" />
      <View style={s.tabWrap}>
        <View style={s.tabRow}>
          <TouchableOpacity style={[s.tab, tab === 'new' && s.tabActive]} onPress={() => setTab('new')}>
            <Text style={[s.tabTxt, tab === 'new' && s.tabTxtActive]}>New complaint</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[s.tab, tab === 'mine' && s.tabActive]} onPress={() => setTab('mine')}>
            <Text style={[s.tabTxt, tab === 'mine' && s.tabTxtActive]}>My complaints</Text>
          </TouchableOpacity>
        </View>
      </View>

      {tab === 'new' ? (
        <ScrollView>
          <View style={s.body}>
            <View style={s.formGroup}>
              <Text style={s.label}>Category</Text>
              <View style={s.selectBox}>
                <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                  {CATEGORIES.map(c => (
                    <TouchableOpacity key={c} style={[s.catChip, category === c && s.catChipActive]} onPress={() => setCategory(c)}>
                      <Text style={[s.catChipTxt, category === c && s.catChipTxtActive]}>{c}</Text>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
            <View style={s.formGroup}>
              <Text style={s.label}>Location</Text>
              <View style={s.inputRow}><Ionicons name="location-outline" size={16} color={colors.textMuted} style={s.inputIco} /><TextInput style={s.input} value={location} onChangeText={setLocation} placeholder="Enter location or ward" placeholderTextColor={colors.textMuted} /></View>
            </View>
            <View style={s.formGroup}>
              <Text style={s.label}>Description</Text>
              <TextInput style={[s.input, s.textarea]} value={desc} onChangeText={setDesc} placeholder="Streetlight near the park is not working." placeholderTextColor={colors.textMuted} multiline numberOfLines={3} />
            </View>
            <View style={s.formGroup}>
              <Text style={s.label}>Add photo (optional)</Text>
              <View style={s.photoPicker}>
                <MaterialIcons name="add-photo-alternate" size={32} color={colors.textMuted} />
                <Text style={s.photoTxt}>Add photo (optional){'\n'}Tap to choose a photo</Text>
              </View>
            </View>
            <TouchableOpacity style={s.agreeRow} onPress={() => setAgreed(!agreed)}>
              <View style={[s.checkbox, agreed && s.checkboxActive]}>
                {agreed && <MaterialIcons name="check" size={13} color={colors.white} />}
              </View>
              <Text style={s.agreeTxt}>I agree to share these details for follow-up.</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.submitBtn, (!category || !desc) && s.submitBtnDisabled]} onPress={handleSubmit} disabled={!category || !desc}>
              <Text style={s.submitBtnTxt}>Submit complaint</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        <ScrollView>
          <View style={s.body}>
            {myComplaints.length === 0
              ? <Text style={s.empty}>No complaints submitted yet.</Text>
              : myComplaints.map((c: any) => (
                <View key={c.id} style={s.complaintCard}>
                  <Text style={s.complaintRef}>{c.ref}</Text>
                  <Text style={s.complaintCat}>{c.category}</Text>
                  <Text style={s.complaintStatus}>Status: {c.status}</Text>
                  <Text style={s.complaintDate}>{c.date}</Text>
                </View>
              ))
            }
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  tabWrap: { backgroundColor: colors.white, paddingHorizontal: spacing.md, paddingTop: spacing.sm, paddingBottom: spacing.sm, borderBottomWidth: StyleSheet.hairlineWidth, borderBottomColor: colors.border },
  tabRow: { flexDirection: 'row' },
  tab: { paddingHorizontal: 16, paddingVertical: 8, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm },
  tabActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  tabTxt: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  tabTxtActive: { color: colors.white },
  body: { padding: spacing.md },
  formGroup: { marginBottom: spacing.md },
  label: { fontSize: 13, fontWeight: '600', color: colors.navy, marginBottom: 6 },
  selectBox: { marginBottom: 4 },
  catChip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.sm, borderWidth: 1, borderColor: colors.border, backgroundColor: colors.white, marginRight: spacing.sm },
  catChipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  catChipTxt: { fontSize: 13, color: colors.navy },
  catChipTxtActive: { color: colors.white },
  inputRow: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm, backgroundColor: colors.white },
  inputIco: { marginRight: 6, marginLeft: 2 },
  input: { flex: 1, paddingVertical: 10, fontSize: 14, color: colors.navy, borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, backgroundColor: colors.white },
  textarea: { height: 80, textAlignVertical: 'top' as any },
  photoPicker: { borderWidth: 1, borderColor: colors.border, borderRadius: radius.md, borderStyle: 'dashed' as any, padding: spacing.lg, alignItems: 'center', backgroundColor: colors.white, gap: 6 },
  photoTxt: { fontSize: 13, color: colors.textMuted, textAlign: 'center' },
  agreeRow: { flexDirection: 'row', alignItems: 'center', marginBottom: spacing.md },
  checkbox: { width: 20, height: 20, borderWidth: 1.5, borderColor: colors.border, borderRadius: 4, justifyContent: 'center', alignItems: 'center', marginRight: spacing.sm },
  checkboxActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  agreeTxt: { flex: 1, fontSize: 13, color: colors.navy },
  submitBtn: { backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 14, alignItems: 'center' },
  submitBtnDisabled: { backgroundColor: '#94A3B8' },
  submitBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },
  empty: { textAlign: 'center', color: colors.textMuted, marginTop: spacing.xl },
  complaintCard: { backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, marginBottom: spacing.sm, borderWidth: 1, borderColor: colors.border },
  complaintRef: { fontSize: 14, fontWeight: '700', color: colors.navy },
  complaintCat: { fontSize: 13, color: colors.textMuted },
  complaintStatus: { fontSize: 13, color: colors.teal },
  complaintDate: { fontSize: 12, color: colors.textMuted },
  successContainer: { padding: spacing.lg, alignItems: 'center' },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  successTitle: { fontSize: 22, fontWeight: '800', color: colors.navy, marginBottom: 4 },
  successRef: { fontSize: 13, color: colors.textMuted, marginBottom: 6 },
  refBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginBottom: spacing.sm },
  refNum: { fontSize: 16, fontWeight: '700', color: colors.navy, flex: 1 },
  statusCard: { width: '100%', backgroundColor: colors.white, borderRadius: radius.md, padding: spacing.md, borderWidth: 1, borderColor: colors.border, marginTop: spacing.md },
  statusTitle: { fontSize: 16, fontWeight: '700', color: colors.navy, marginBottom: 4 },
  statusBadge: { backgroundColor: colors.tealLight, paddingHorizontal: 10, paddingVertical: 3, borderRadius: radius.full, alignSelf: 'flex-start', marginBottom: spacing.sm },
  statusBadgeTxt: { color: colors.teal, fontSize: 12, fontWeight: '700' },
  timeline: { marginBottom: spacing.sm },
  timelineRow: { flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 },
  timelineActive: { fontSize: 13, color: colors.teal, fontWeight: '600' },
  timelineInactive: { fontSize: 13, color: colors.textMuted },
  summaryLocRow: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  summaryLoc: { fontSize: 13, color: colors.textMuted },
  successBackBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.xl, marginTop: spacing.lg },
  backBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 14 },
});
