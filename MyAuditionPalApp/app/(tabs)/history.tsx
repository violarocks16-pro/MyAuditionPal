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

  // History = everything that's been attended, newest first.
  const completed = auditions
    .filter((audition) => !isActive(audition))
    .sort((a, b) => sortKey(b).localeCompare(sortKey(a)));

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
            <ThemedText type="title" style={styles.heading}>
              📜 History
            </ThemedText>
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
});
