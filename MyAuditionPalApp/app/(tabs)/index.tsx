import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, Pressable, SectionList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuditionCard } from '@/components/audition-card';
import { ScreenHeader } from '@/components/screen-header';
import { ThemedText } from '@/components/themed-text';
import { useAuditions } from '@/contexts/audition-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { daysUntil } from '@/lib/date';
import { Audition, isActive } from '@/types/audition';

// The soonest relevant date (deadline first, else audition date) in "days from now".
// Used to sort within a section; items with no date sort last.
function soonest(audition: Audition): number {
  const iso = audition.applicationDeadline ?? audition.auditionDate;
  const days = iso ? daysUntil(iso) : null;
  return days ?? Number.MAX_SAFE_INTEGER;
}

export default function MyAuditionsScreen() {
  const { auditions, loading, deleteAudition, updateAudition } = useAuditions();
  const router = useRouter();

  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');

  // My Auditions = everything still in progress (not yet attended), grouped by status.
  const active = auditions.filter(isActive);
  const bySoonest = (a: Audition, b: Audition) => soonest(a) - soonest(b);

  const sections = [
    { title: 'Interested', data: active.filter((a) => a.status === 'interested').sort(bySoonest) },
    { title: 'Applied', data: active.filter((a) => a.status === 'applied').sort(bySoonest) },
  ].filter((section) => section.data.length > 0);

  function confirmDelete(id: string, ensemble: string) {
    Alert.alert('Delete audition', `Remove "${ensemble}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAudition(id) },
    ]);
  }

  if (loading) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: background }]}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  if (active.length === 0) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: background }]}>
        <ThemedText type="title" style={styles.emptyTitle}>
          No Auditions Yet
        </ThemedText>
        <ThemedText style={styles.emptyText}>Document the work. Trust the process.</ThemedText>
        <Pressable
          onPress={() => router.navigate('/add')}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: primary },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={[styles.buttonText, { color: text }]}>Add an audition</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      <SectionList
        sections={sections}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.list}
        stickySectionHeadersEnabled={false}
        ListHeaderComponent={
          <ScreenHeader
            title="My Auditions"
            right={
              <Pressable
                onPress={() => router.navigate('/browse')}
                style={({ pressed }) => [
                  styles.browseButton,
                  { backgroundColor: primary },
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={styles.browseButtonText}>Browse</ThemedText>
              </Pressable>
            }
          />
        }
        renderSectionHeader={({ section }) => (
          <ThemedText style={[styles.sectionHeader, { color: muted }]}>
            {section.title.toUpperCase()} · {section.data.length}
          </ThemedText>
        )}
        renderItem={({ item, index }) => (
          <AuditionCard
            audition={item}
            index={index}
            onPress={() => router.push(`/audition/${item.id}`)}
            onLongPress={() => confirmDelete(item.id, item.ensemble)}
            onChangeStatus={(status) => updateAudition(item.id, { status })}
            onMarkAttended={() => updateAudition(item.id, { status: 'attended' })}
            onDismissNudge={() => updateAudition(item.id, { attendNudgeDismissed: true })}
          />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center', padding: 32, gap: 12 },
  emptyTitle: { textAlign: 'center' },
  emptyText: { textAlign: 'center', opacity: 0.7 },
  list: { padding: 20, gap: 14 },
  heading: { marginBottom: 8 },
  sectionHeader: { fontSize: 13, fontWeight: '700', letterSpacing: 0.5, marginTop: 10, marginBottom: 2 },
  button: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
  browseButton: { borderRadius: 999, paddingHorizontal: 16, paddingVertical: 8 },
  browseButtonText: { color: '#fff', fontSize: 14, fontWeight: '700' },
});
