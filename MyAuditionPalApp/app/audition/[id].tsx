import { useLocalSearchParams, useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuditionForm, AuditionFormValues } from '@/components/audition-form';
import { ThemedText } from '@/components/themed-text';
import { useAuditions } from '@/contexts/audition-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function EditAuditionScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { auditions, updateAudition, deleteAudition } = useAuditions();
  const router = useRouter();

  const background = useThemeColor({}, 'background');
  const muted = useThemeColor({}, 'muted');
  const deadline = useThemeColor({}, 'deadline');

  const audition = auditions.find((a) => a.id === id);

  if (!audition) {
    return (
      <SafeAreaView style={[styles.safe, styles.center, { backgroundColor: background }]}>
        <ThemedText>Audition not found.</ThemedText>
        <Pressable onPress={() => router.back()}>
          <ThemedText style={{ color: muted }}>Go back</ThemedText>
        </Pressable>
      </SafeAreaView>
    );
  }

  function handleSubmit(values: AuditionFormValues) {
    updateAudition(audition!.id, values);
    router.back();
  }

  function handleDelete() {
    Alert.alert('Delete audition', `Remove "${audition!.ensemble}"?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Delete',
        style: 'destructive',
        onPress: () => {
          deleteAudition(audition!.id);
          router.back();
        },
      },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      <View style={styles.bar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ThemedText>‹ Back</ThemedText>
        </Pressable>
        <Pressable onPress={handleDelete} hitSlop={8}>
          <ThemedText style={{ color: deadline }}>Delete</ThemedText>
        </Pressable>
      </View>
      <AuditionForm
        title="Edit audition"
        initial={audition}
        submitLabel="Save changes"
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { alignItems: 'center', justifyContent: 'center', gap: 12 },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 12,
  },
});
