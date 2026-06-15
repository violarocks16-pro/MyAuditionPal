import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { InstrumentDropdown } from '@/components/instrument-dropdown';
import { ThemedText } from '@/components/themed-text';
import { useProfile } from '@/contexts/profile-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const { profile, loading, setInstrument } = useProfile();

  const background = useThemeColor({}, 'background');
  const muted = useThemeColor({}, 'muted');

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
        <ThemedText type="title">👤 Profile</ThemedText>
        <ThemedText style={[styles.subtitle, { color: muted }]}>
          Your instrument personalizes the app and will filter audition discovery later.
        </ThemedText>

        <ThemedText style={styles.label}>Instrument</ThemedText>
        <InstrumentDropdown value={profile.instrument} onSelect={setInstrument} />
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  content: { padding: 20, gap: 8 },
  subtitle: { fontSize: 14, marginBottom: 8 },
  label: { fontWeight: '600', marginTop: 8 },
});
