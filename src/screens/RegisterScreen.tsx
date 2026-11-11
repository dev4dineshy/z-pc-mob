import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, StyleSheet, KeyboardAvoidingView, Platform, ScrollView, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import { colors, spacing, radius } from '../theme';
import { registerUser } from '../data/dataService';
import { useApp } from '../AppContext';
import AppHeader from '../components/AppHeader';

const REG_BANNER = require('../../assets/images/banners/registration-community-banner.png');
const STRONG_PASSWORD = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d).{8,128}$/;
const PASSWORD_MESSAGE = 'Password must be 8 to 128 characters and contain uppercase, lowercase, and a number';

export default function RegisterScreen({ navigation }: any): React.JSX.Element {
  const { data, setData, setSession } = useApp();
  const [name, setName]         = useState('');
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [confirm, setConfirm]   = useState('');
  const [showPass, setShowPass] = useState(false);
  const [showConf, setShowConf] = useState(false);
  const [error, setError]       = useState('');
  const [loading, setLoading]   = useState(false);

  async function handleRegister() {
    setError('');
    if (!name.trim())                         return setError('Full name is required');
    if (!email.trim() || !email.includes('@')) return setError('Valid email is required');
    if (!STRONG_PASSWORD.test(password))      return setError(PASSWORD_MESSAGE);
    if (password !== confirm)                 return setError('Passwords do not match');
    setLoading(true);
    const result = await registerUser(name.trim(), email.trim().toLowerCase(), password, data);
    setLoading(false);
    if (result.error) return setError(result.error);
    if (result.account) {
      await setSession(result.account);
      navigation.reset({ index: 0, routes: [{ name: 'Selection' }] });
    }
  }

  return (
    <SafeAreaView style={s.safe} edges={['top']}>
      <AppHeader variant="logo-back" navigation={navigation} backFallback="GuestHome" />

      <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : undefined} style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={s.container} keyboardShouldPersistTaps="handled">

          <Image source={REG_BANNER} style={s.heroBanner} resizeMode="cover" />

          <View style={s.form}>
            <Text style={s.title}>Registration</Text>
            <Text style={s.subtitle}>Create your account</Text>

            {!!error && (
              <View style={s.errBox}><Text style={s.errText}>{error}</Text></View>
            )}

            {/* Full name */}
            <Text style={s.label}>Full name</Text>
            <View style={s.inputRow}>
              <MaterialIcons name="person-outline" size={18} color={colors.textMuted} style={s.ico} />
              <TextInput style={s.input} value={name} onChangeText={setName} placeholder="Your full name" placeholderTextColor={colors.textMuted} />
            </View>

            {/* Email */}
            <Text style={s.label}>Email address</Text>
            <View style={s.inputRow}>
              <MaterialIcons name="email" size={18} color={colors.textMuted} style={s.ico} />
              <TextInput style={s.input} value={email} onChangeText={setEmail} placeholder="you@example.com" keyboardType="email-address" autoCapitalize="none" placeholderTextColor={colors.textMuted} />
            </View>

            {/* Password */}
            <Text style={s.label}>Password</Text>
            <View style={s.inputRow}>
              <MaterialIcons name="lock-outline" size={18} color={colors.textMuted} style={s.ico} />
              <TextInput style={s.input} value={password} onChangeText={setPassword} secureTextEntry={!showPass} placeholder="••••••••" placeholderTextColor={colors.textMuted} />
              <TouchableOpacity onPress={() => setShowPass(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel={showPass ? 'Hide password' : 'Show password'}>
                <MaterialIcons name={showPass ? 'visibility-off' : 'visibility'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>
            <Text style={s.passwordHint}>{PASSWORD_MESSAGE}.</Text>

            {/* Confirm password */}
            <Text style={s.label}>Confirm password</Text>
            <View style={s.inputRow}>
              <MaterialIcons name="lock-outline" size={18} color={colors.textMuted} style={s.ico} />
              <TextInput style={s.input} value={confirm} onChangeText={setConfirm} secureTextEntry={!showConf} placeholder="••••••••" placeholderTextColor={colors.textMuted} />
              <TouchableOpacity onPress={() => setShowConf(v => !v)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }} accessibilityLabel={showConf ? 'Hide confirm password' : 'Show confirm password'}>
                <MaterialIcons name={showConf ? 'visibility-off' : 'visibility'} size={20} color={colors.textMuted} />
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={s.btn} onPress={handleRegister} disabled={loading}>
              <Text style={s.btnText}>{loading ? 'Creating…' : 'Create Account'}</Text>
              {!loading && <MaterialIcons name="arrow-forward" size={18} color={colors.white} />}
            </TouchableOpacity>

            <View style={s.bottomRow}>
              <Text style={s.bottomTxt}>Already have an account? </Text>
              <TouchableOpacity onPress={() => navigation.navigate('Login')}>
                <Text style={s.bottomLink}>Login</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const s = StyleSheet.create({
  safe:       { flex: 1, backgroundColor: colors.white },
  container:  { flexGrow: 1 },
  heroBanner: { width: '100%', height: 180 },
  form:       { padding: spacing.lg, backgroundColor: colors.white },
  title:      { fontSize: 28, fontWeight: '800', color: colors.navy, marginBottom: 4 },
  subtitle:   { fontSize: 14, color: colors.textMuted, marginBottom: spacing.lg },
  label:      { fontSize: 13, fontWeight: '600', color: colors.navy, marginBottom: 6, marginTop: spacing.sm },
  inputRow:   { flexDirection: 'row', alignItems: 'center', borderWidth: 1.5, borderColor: colors.border, borderRadius: radius.md, paddingHorizontal: spacing.sm, backgroundColor: colors.background, marginBottom: 4 },
  ico:        { marginRight: 8 },
  input:      { flex: 1, paddingVertical: 13, fontSize: 15, color: colors.navy },
  passwordHint: { color: colors.textMuted, fontSize: 12, lineHeight: 17, marginTop: 2 },
  btn:        { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 8, backgroundColor: colors.teal, borderRadius: radius.md, paddingVertical: 15, marginTop: spacing.lg, marginBottom: spacing.md },
  btnText:    { color: colors.white, fontWeight: '800', fontSize: 16 },
  bottomRow:  { flexDirection: 'row', justifyContent: 'center', marginBottom: spacing.sm },
  bottomTxt:  { color: colors.textMuted, fontSize: 14 },
  bottomLink: { color: colors.teal, fontWeight: '700', fontSize: 14 },
  errBox:     { backgroundColor: '#FEE2E2', borderRadius: radius.sm, padding: spacing.sm, marginBottom: spacing.sm },
  errText:    { color: '#DC2626', fontSize: 13 },
});
