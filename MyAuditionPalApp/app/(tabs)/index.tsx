import { useRouter } from 'expo-router';
import { ActivityIndicator, Alert, FlatList, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuditionCard } from '@/components/audition-card';
import { ThemedText } from '@/components/themed-text';
import { useAuditions } from '@/contexts/audition-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { isActive } from '@/types/audition';

export default function MyAuditionsScreen() {
  const { auditions, loading, deleteAudition } = useAuditions();
  const router = useRouter();

  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');

  // My Auditions = everything still in progress (not yet attended).
  const active = auditions.filter(isActive);

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
      ) : active.length === 0 ? (
        <View style={styles.center}>
          <ThemedText type="title" style={styles.emptyTitle}>
            🎯 No auditions yet
          </ThemedText>
          <ThemedText style={styles.emptyText}>
            Add one you&apos;re preparing for, or one you&apos;ve already taken.
          </ThemedText>
          <Pressable
            onPress={() => router.navigate('/add')}
            style={({ pressed }) => [
              styles.button,
              { backgroundColor: primary },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.buttonText, { color: text }]}>Add an audition</ThemedText>
          </Pressable>
        </View>
      ) : (
        <FlatList
          data={active}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          ListHeaderComponent={
            <ThemedText type="title" style={styles.heading}>
              🎯 My Auditions
            </ThemedText>
          }
          renderItem={({ item }) => (
            <AuditionCard
              audition={item}
              onPress={() => router.push(`/audition/${item.id}`)}
              onLongPress={() => confirmDelete(item.id, item.ensemble)}
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
  list: { padding: 20, gap: 12 },
  heading: { marginBottom: 4 },
  button: {
    marginTop: 8,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 24,
  },
  pressed: { opacity: 0.8 },
  buttonText: { fontSize: 16, fontWeight: '700' },
});
