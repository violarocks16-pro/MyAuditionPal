import { ActivityIndicator, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ThemedText } from '@/components/themed-text';
import { INSTRUMENTS } from '@/constants/instruments';
import { useProfile } from '@/contexts/profile-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function ProfileScreen() {
  const { profile, loading, setInstrument } = useProfile();

  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
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
      <FlatList
        data={INSTRUMENTS}
        keyExtractor={(item) => item}
        contentContainerStyle={styles.list}
        ListHeaderComponent={
          <View style={styles.header}>
            <ThemedText type="title">👤 Profile</ThemedText>
            <ThemedText style={[styles.subtitle, { color: muted }]}>
              Your instrument personalizes the app and will filter audition discovery later.
            </ThemedText>
            <ThemedText type="subtitle" style={styles.sectionTitle}>
              Instrument
            </ThemedText>
            <ThemedText style={[styles.current, { color: muted }]}>
              {profile.instrument ? `Currently: ${profile.instrument}` : 'Not set yet — pick one below.'}
            </ThemedText>
          </View>
        }
        renderItem={({ item }) => {
          const selected = item === profile.instrument;
          return (
            <Pressable
              onPress={() => setInstrument(item)}
              style={({ pressed }) => [
                styles.row,
                { backgroundColor: selected ? primary : surface, borderColor: border },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={styles.rowText}>{item}</ThemedText>
              {selected ? <ThemedText style={styles.check}>✓</ThemedText> : null}
            </Pressable>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, gap: 8 },
  header: { gap: 6, marginBottom: 8 },
  subtitle: { fontSize: 14 },
  sectionTitle: { marginTop: 12 },
  current: { fontSize: 14 },
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.85 },
  rowText: { fontSize: 16 },
  check: { fontSize: 16, fontWeight: '700' },
});
