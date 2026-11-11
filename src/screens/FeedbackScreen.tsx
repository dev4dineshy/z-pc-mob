import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Alert } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import AppHeader from '../components/AppHeader';
import { useApp } from '../AppContext';
import { createFeedback } from '../data/dataService';

const TOPICS = ['App experience', 'Content', 'Services', 'General'];

export default function FeedbackScreen({ navigation }: any) {
  const { data, setData } = useApp();
  const [rating, setRating] = useState(0);
  const [topic, setTopic] = useState('App experience');
  const [text, setText] = useState('');
  const [name, setName] = useState('');
  const [submitted, setSubmitted] = useState(false);

  async function handleSubmit() {
    if (!rating || !text.trim()) return;
    try {
      const feedback = await createFeedback({ rating, topic, text: text.trim(), name: name.trim() });
      setData({ ...data, feedback: [...data.feedback, feedback] }); setSubmitted(true);
    } catch (error) { Alert.alert('Submission failed', error instanceof Error ? error.message : 'Please try again.'); }
  }

  if (submitted) return (
    <SafeAreaView style={s.safe}>
      <View style={s.center}>
        <View style={s.successCircle}>
          <MaterialIcons name="check" size={36} color={colors.white} />
        </View>
        <Text style={s.successTitle}>Thank you for your feedback!</Text>
        <TouchableOpacity style={s.btn} onPress={() => setSubmitted(false)}>
          <Text style={s.btnTxt}>Submit another</Text>
        </TouchableOpacity>
        <TouchableOpacity style={s.backLink} onPress={() => navigation.goBack()}>
          <MaterialIcons name="arrow-back" size={16} color={colors.teal} />
          <Text style={s.backLinkTxt}>Go back</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );

  return (
    <SafeAreaView style={s.safe}>
      <AppHeader variant="title" navigation={navigation} title="Feedback" />
      <ScrollView>
        <View style={s.body}>
          <Text style={s.pageTitle}>Share your experience</Text>
          <Text style={s.pageSub}>Your suggestions help us improve.</Text>

          <Text style={s.label}>How would you rate your overall experience?</Text>
          <View style={s.starsRow}>
            {[1,2,3,4,5].map(i => (
              <TouchableOpacity key={i} onPress={() => setRating(i)} accessibilityLabel={`${i} star${i > 1 ? 's' : ''}`}>
                <MaterialIcons
                  name={i <= rating ? 'star' : 'star-border'}
                  size={36}
                  color={i <= rating ? '#FBBF24' : colors.border}
                />
              </TouchableOpacity>
            ))}
          </View>

          <View style={s.formGroup}>
            <Text style={s.label}>Topic</Text>
            <View style={s.selectRow}>
              {TOPICS.map(t => (
                <TouchableOpacity key={t} style={[s.chip, topic === t && s.chipActive]} onPress={() => setTopic(t)}>
                  <Text style={[s.chipTxt, topic === t && s.chipTxtActive]}>{t}</Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={s.formGroup}>
            <Text style={s.label}>Your feedback</Text>
            <TextInput style={[s.input, s.textarea]} value={text} onChangeText={setText} placeholder="The scheme information is easy to find..." placeholderTextColor={colors.textMuted} multiline numberOfLines={4} maxLength={500} />
            <Text style={s.charCount}>{text.length}/500</Text>
          </View>

          <View style={s.formGroup}>
            <Text style={s.label}>Name (optional)</Text>
            <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your name" placeholderTextColor={colors.textMuted} />
          </View>

          <TouchableOpacity style={[s.submitBtn, (!rating || !text) && s.submitBtnDisabled]} onPress={handleSubmit} disabled={!rating || !text}>
            <MaterialIcons name="send" size={18} color={colors.white} />
            <Text style={s.submitBtnTxt}>Submit feedback</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe: { flex: 1, backgroundColor: colors.background },
  body: { padding: spacing.lg },
  pageTitle: { fontSize: 24, fontWeight: '800', color: colors.navy, marginBottom: 4 },
  pageSub: { fontSize: 13, color: colors.textMuted, marginBottom: spacing.lg },
  label: { fontSize: 13, fontWeight: '600', color: colors.navy, marginBottom: 8 },
  starsRow: { flexDirection: 'row', marginBottom: spacing.lg, gap: 4 },
  formGroup: { marginBottom: spacing.md },
  selectRow: { flexDirection: 'row', flexWrap: 'wrap' },
  chip: { paddingHorizontal: 14, paddingVertical: 7, borderRadius: radius.full, backgroundColor: colors.white, borderWidth: 1, borderColor: colors.border, marginRight: spacing.sm, marginBottom: spacing.sm },
  chipActive: { backgroundColor: colors.teal, borderColor: colors.teal },
  chipTxt: { fontSize: 13, color: colors.navy, fontWeight: '600' },
  chipTxtActive: { color: colors.white },
  input: { borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, padding: spacing.sm, fontSize: 14, color: colors.navy, backgroundColor: colors.white },
  textarea: { height: 100, textAlignVertical: 'top' as any },
  charCount: { textAlign: 'right', fontSize: 12, color: colors.textMuted, marginTop: 4 },
  submitBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 14, marginTop: spacing.sm },
  submitBtnDisabled: { backgroundColor: '#94A3B8' },
  submitBtnTxt: { color: colors.white, fontWeight: '700', fontSize: 15 },
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  successCircle: { width: 80, height: 80, borderRadius: 40, backgroundColor: colors.teal, justifyContent: 'center', alignItems: 'center', marginBottom: spacing.md },
  successTitle: { fontSize: 20, fontWeight: '700', color: colors.navy, marginBottom: spacing.lg, textAlign: 'center' },
  btn: { backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 12, paddingHorizontal: spacing.xl, marginBottom: spacing.md },
  btnTxt: { color: colors.white, fontWeight: '700', fontSize: 14 },
  backLink: { flexDirection: 'row', alignItems: 'center', gap: 4, marginTop: 4 },
  backLinkTxt: { color: colors.teal, fontWeight: '600', fontSize: 14 },
});
