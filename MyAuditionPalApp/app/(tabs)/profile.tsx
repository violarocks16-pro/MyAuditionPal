import { useRouter } from 'expo-router';
import { ActivityIndicator, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InstrumentDropdown } from '@/components/instrument-dropdown';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { useAuth } from '@/contexts/auth-context';
import { useProfile } from '@/contexts/profile-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const { profile, loading, setInstrument } = useProfile();
  const { session, signOut } = useAuth();
  const router = useRouter();

  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const muted = useThemeColor({}, 'muted');
  const text = useThemeColor({}, 'text');

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: background }]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      <View style={styles.content}>
        <ScreenHeader title="Profile" />

        {/* Account */}
        <ThemedText style={styles.sectionLabel}>Account</ThemedText>
        {session ? (
          <View style={styles.gap}>
            <ThemedText style={{ color: muted }}>Signed in as {session.user.email}</ThemedText>
            <Pressable
              onPress={signOut}
              style={({ pressed }) => [
                styles.outlineButton,
                { borderColor: border, backgroundColor: surface },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={styles.outlineButtonText}>Sign out</ThemedText>
            </Pressable>
          </View>
        ) : (
          <View style={styles.gap}>
            <ThemedText style={{ color: muted }}>
              You&apos;re browsing as a guest. Sign in to back up and sync your auditions across
              devices.
            </ThemedText>
            <Pressable
              onPress={() => router.navigate('/sign-in')}
              style={({ pressed }) => [
                styles.button,
                { backgroundColor: primary },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.buttonText, { color: text }]}>
                Sign in / Create account
              </ThemedText>
            </Pressable>
          </View>
        )}

        {/* Instrument */}
        <ThemedText style={styles.sectionLabel}>Instrument</ThemedText>
        <ThemedText style={[styles.hint, { color: muted }]}>
          Personalizes the app and filters audition listings.
        </ThemedText>
        <InstrumentDropdown value={profile.instrument} onSelect={setInstrument} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 8 },
  sectionLabel: { fontWeight: '700', fontSize: 16, marginTop: 20 },
  hint: { fontSize: 13 },
  gap: { gap: 10, marginTop: 4 },
  button: { borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  buttonText: { fontSize: 16, fontWeight: '700' },
  outlineButton: { borderWidth: 1, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  outlineButtonText: { fontSize: 16, fontWeight: '600' },
  pressed: { opacity: 0.8 },
});
