import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuditionCard } from '@/components/audition-card';
import { ThemedText } from '@/components/themed-text';
import { useAuditions } from '@/contexts/audition-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Audition, isActive } from '@/types/audition';

// The date we sort history by: the audition date if known, else when it was created.
function sortKey(audition: Audition): string {
  return audition.auditionDate ?? audition.createdAt;
}

export default function HistoryScreen() {
  const { auditions, loading, deleteAudition, updateAudition } = useAuditions();
  const router = useRouter();

  const background = useThemeColor({}, 'background');
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const primary = useThemeColor({}, 'primary');

  // History = everything that's been attended, newest first.
  const completed = auditions
    .filter((audition) => !isActive(audition))
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

  // "Patterns to work on": count tagged improvement areas across attended auditions.
  const counts: Record<string, number> = {};
  completed.forEach((a) => {
    (a.improvementAreas ?? []).forEach((area) => {
      counts[area] = (counts[area] ?? 0) + 1;
    });
  });
  const patterns = Object.entries(counts).sort((a, b) => b[1] - a[1]);

  function confirmDelete(id: string, ensemble: string) {
    Alert.alert('Delete audition', `Remove "${ensemble}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: () => deleteAudition(id) },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : completed.length === 0 ? (
        <View style={styles.center}>
          <ThemedText type="title" style={styles.emptyTitle}>
            📜 No history yet
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Auditions you mark as &quot;Attended&quot; will appear here, with their results.
          </ThemedText>
        </View>
      ) : (
        <FlatList
          data={completed}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <View>
              <ThemedText type="title" style={styles.heading}>
                📜 History
              </ThemedText>
              {patterns.length > 0 ? (
                <View style={[styles.patterns, { backgroundColor: surface, borderColor: border }]}>
                  <ThemedText style={styles.patternsTitle}>Patterns to work on</ThemedText>
                  <ThemedText style={[styles.patternsHint, { color: muted }]}>
                    Most-tagged areas across your attended auditions
                  </ThemedText>
                  <View style={styles.patternChips}>
                    {patterns.slice(0, 8).map(([area, count]) => (
                      <View key={area} style={[styles.patternChip, { borderColor: primary }]}>
                        <ThemedText style={styles.patternChipText}>{area}</ThemedText>
                        <View style={[styles.countBubble, { backgroundColor: primary }]}>
                          <ThemedText style={styles.countText}>{count}</ThemedText>
                        </View>
                      </View>
                    ))}
                  </View>
                </View>
              ) : null}
            </View>
          }
          renderItem={({ item }) => (
            <AuditionCard
              audition={item}
              onPress={() => router.push(`/audition/${item.id}`)}
              onLongPress={() => confirmDelete(item.id, item.ensemble)}
              onChangeStatus={(status) => updateAudition(item.id, { status })}
            />
          )}
        />
      )}
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
  patterns: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 16,
    gap: 6,
    marginBottom: 6,
  },
  patternsTitle: { fontSize: 16, fontWeight: '700' },
  patternsHint: { fontSize: 13 },
  patternChips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginTop: 6 },
  patternChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderWidth: 1.5,
    borderRadius: 999,
    paddingLeft: 12,
    paddingRight: 6,
    paddingVertical: 5,
  },
  patternChipText: { fontSize: 13, fontWeight: '600' },
  countBubble: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countText: { color: '#fff', fontSize: 12, fontWeight: '700' },
});
