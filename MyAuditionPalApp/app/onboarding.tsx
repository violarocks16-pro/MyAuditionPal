import { useRouter } from 'expo-router';
import { Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InstrumentDropdown } from '@/components/instrument-dropdown';
import { ThemedText } from '@/components/themed-text';
import { useProfile } from '@/contexts/profile-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function OnboardingScreen() {
  const { profile, setInstrument } = useProfile();
  const router = useRouter();

  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');

  const canContinue = !!profile.instrument;

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]}>
      <View style={styles.content}>
        <ThemedText type="title" style={styles.title}>
          Welcome to MyAuditionPal 🎵
        </ThemedText>
        <ThemedText style={[styles.subtitle, { color: muted }]}>
          Let&apos;s start with your instrument. It personalizes the app and will filter which
          auditions you see later.
        </ThemedText>

        <ThemedText style={styles.label}>Your instrument</ThemedText>
        <InstrumentDropdown value={profile.instrument} onSelect={setInstrument} />

        <Pressable
          disabled={!canContinue}
          onPress={() => router.replace('/')}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: primary },
            !canContinue && styles.disabled,
            pressed && styles.pressed,
          ]}>
          <ThemedText style={[styles.buttonText, { color: text }]}>Continue</ThemedText>
        </Pressable>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  content: { flex: 1, padding: 24, justifyContent: 'center', gap: 12 },
  title: { textAlign: 'center' },
  subtitle: { textAlign: 'center', fontSize: 15, marginBottom: 12 },
  label: { fontWeight: '600', marginTop: 8 },
  button: {
    marginTop: 24,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  disabled: { opacity: 0.4 },
  pressed: { opacity: 0.8 },
  buttonText: { fontSize: 17, fontWeight: '700' },
});
