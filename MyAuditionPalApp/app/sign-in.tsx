import { useRouter } from 'expo-router';
import { useState } from 'react';
import {
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function SignInScreen() {
  const { signIn, signUp } = useAuth();
  const router = useRouter();

  const [mode, setMode] = useState<'signin' | 'signup'>('signin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const muted = useThemeColor({}, 'muted');
  const text = useThemeColor({}, 'text');
  const deadline = useThemeColor({}, 'deadline');
  const success = useThemeColor({}, 'success');

  async function submit() {
    if (!email.trim() || !password) {
      setError('Please enter your email and a password.');
      return;
    }
    setBusy(true);
    setError(null);
    setNotice(null);
    const result = mode === 'signin' ? await signIn(email, password) : await signUp(email, password);
    setBusy(false);
    if (result.error) {
      setError(result.error);
      return;
    }
    if (mode === 'signup' && result.needsConfirmation) {
      // Account created but must be confirmed via email before signing in.
      setNotice('Check your email to confirm your account, then sign in.');
      setMode('signin');
      setPassword('');
      return;
    }
    router.back();
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
        <View style={styles.topBar}>
          <Pressable onPress={() => router.back()} hitSlop={8}>
            <ThemedText style={{ color: muted }}>Close</ThemedText>
          </Pressable>
        </View>

        <View style={styles.content}>
          <ThemedText type="title">{mode === 'signin' ? 'Sign in' : 'Create account'}</ThemedText>
          <ThemedText style={[styles.subtitle, { color: muted }]}>
            Back up and sync your auditions across devices.
          </ThemedText>

          <TextInput
            value={email}
            onChangeText={setEmail}
            placeholder="Email"
            placeholderTextColor={muted}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="email-address"
            textContentType="emailAddress"
            style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
          />
          <TextInput
            value={password}
            onChangeText={setPassword}
            placeholder="Password"
            placeholderTextColor={muted}
            secureTextEntry
            autoCapitalize="none"
            style={[styles.input, { backgroundColor: surface, borderColor: border, color: text }]}
          />

          {error ? <ThemedText style={{ color: deadline }}>{error}</ThemedText> : null}
          {notice ? <ThemedText style={{ color: success }}>{notice}</ThemedText> : null}

          <Pressable
            onPress={submit}
            disabled={busy}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: primary },
              (pressed || busy) && styles.pressed,
            ]}>
            {busy ? (
              <ActivityIndicator color={text} />
            ) : (
              <ThemedText style={[styles.buttonText, { color: text }]}>
                {mode === 'signin' ? 'Sign in' : 'Create account'}
              </ThemedText>
            )}
          </Pressable>

          <Pressable
            onPress={() => {
              setMode(mode === 'signin' ? 'signup' : 'signin');
              setError(null);
              setNotice(null);
            }}
            hitSlop={8}>
            <ThemedText style={[styles.toggle, { color: muted }]}>
              {mode === 'signin'
                ? 'New here? Create an account'
                : 'Already have an account? Sign in'}
            </ThemedText>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  flex: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'flex-end' },
  content: { paddingHorizontal: 24, gap: 12 },
  subtitle: { fontSize: 14, marginBottom: 8 },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 14,
    fontSize: 16,
  },
  button: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  pressed: { opacity: 0.8 },
  buttonText: { fontSize: 17, fontWeight: '700' },
  toggle: { textAlign: 'center', marginTop: 8, fontWeight: '600' },
});
