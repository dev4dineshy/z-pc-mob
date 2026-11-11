import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { loginUser } from '../data/dataService';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';

const LOGIN_BANNER = require('../../assets/images/banners/login-community-banner.png');

export default function LoginScreen({ navigation }: any): React.JSX.Element {
  const { setSession } = useApp();
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleLogin() {
    setError('');
    if (!email.trim()) return setError('Email is required');
    if (!password)     return setError('Password is required');
    setLoading(true);
    try {
      const acc = await loginUser(email.trim().toLowerCase(), password);
      if (!acc) return setError('Invalid email or password');
      await setSession(acc);
      navigation.reset({ index: 0, routes: [{ name: 'Selection' }] });
    } catch (err) { setError(err instanceof Error ? err.message : 'Unable to connect to the server.'); }
    finally { setLoading(false); }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="logo-back" navigation={navigation} backFallback="GuestHome" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

          <Image source={LOGIN_BANNER} style={s.heroBanner} resizeMode="cover" />

          <View style={s.form}>
            <Text style={s.title}>Login</Text>
            <Text style={s.subtitle}>Welcome back</Text>

            {!!error && (
              <View style={s.errBox}><Text style={s.errText}>{error}</Text></View>
            )}

            <Text style={s.label}>Email address</Text>
            <View style={s.inputRow}>
              <MaterialIcons name="email" size={18} color={colors.textMuted} style={s.ico} />
              <TextInput
                style={s.input}
                value={email}
                onChangeText={setEmail}
                placeholder="you@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                placeholderTextColor={colors.textMuted}
              />
            </View>

            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <MaterialIcons name="lock-outline" size={18} color={colors.textMuted} style={s.ico} />
              <TextInput
                style={s.input}
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPass}
                placeholder="••••••••"
                placeholderTextColor={colors.textMuted}
              />
              <TouchableOpacity
                onPress={() => setShowPass(v => !v)}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityLabel={showPass ? 'Hide password' : 'Show password'}
              >
                <MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.forgotRow}>
              <Text style={s.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={s.btn} onPress={handleLogin} disabled={loading}>
              <Text style={s.btnText}>{loading ? 'Signing in…' : 'Login'}</Text>
            </TouchableOpacity>

            <View style={s.bottomRow}>
              <Text style={s.bottomTxt}>New to PeopleConnect? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Register')}>
                <Text style={s.bottomLink}>Register</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()}>
              <MaterialIcons name="arrow-back" size={14} color={colors.textMuted} />
              <Text style={s.backBtnTxt}>Back to public view</Text>
            </TouchableOpacity>

          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.white },
  container:  { flexGrow: 1 },
  heroBanner: { width: '100%', height: 200 },
  form:       { padding: spacing.lg, backgroundColor: colors.white },
  title:      { fontSize: 30, fontWeight: '800', color: colors.navy, marginBottom: 4 },
  subtitle:   { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  label:      { fontSize: 13, fontWeight: '600', color: colors.navy, marginBottom: 6, marginTop: spacing.sm },
  inputRow:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm, backgroundColor: colors.background, marginBottom: 4 },
  ico:        { marginRight: 8 },
  input:      { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.navy },
  forgotRow:  { alignItems: 'flex-end', marginVertical: spacing.sm },
  forgotText: { color: colors.teal, fontSize: 13 },
  btn:        { backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 15, alignItems: 'center', marginTop: spacing.sm, marginBottom: spacing.md },
  btnText:    { color: colors.white, fontWeight: '800', fontSize: 16 },
  bottomRow:  { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.md },
  bottomTxt:  { color: colors.textMuted, fontSize: 14 },
  bottomLink: { color: colors.teal, fontWeight: '700', fontSize: 14 },
  backBtn:    { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 4, marginBottom: spacing.md },
  backBtnTxt: { color: colors.textMuted, fontSize: 13 },
  errBox:     { backgroundColor: '#FEE2E2', borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  errText:    { color: '#DC2626', fontSize: 13 },
  hintBox:    { backgroundColor: colors.tealLight, borderRadius: radius.sm, padding: spacing.sm, marginTop: 4 },
  hintTxt:    { color: colors.teal, fontSize: 12, textAlign: 'center' },
});
