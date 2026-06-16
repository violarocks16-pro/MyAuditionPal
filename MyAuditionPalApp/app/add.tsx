import { useRouter } from 'expo-router';
import { Alert, Pressable, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuditionForm, AuditionFormValues } from '@/components/audition-form';
import { ThemedText } from '@/components/themed-text';
import { useAuditions } from '@/contexts/audition-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AddScreen() {
  const { addAudition } = useAuditions();
  const router = useRouter();

  const background = useThemeColor({}, 'background');
  const muted = useThemeColor({}, 'muted');

  function handleSubmit(values: AuditionFormValues) {
    addAudition(values);
    Alert.alert('Saved', 'Your audition has been added.', [
      { text: 'OK', onPress: () => router.back() },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      <View style={styles.topBar}>
        <Pressable onPress={() => router.back()} hitSlop={8}>
          <ThemedText style={{ color: muted }}>Close</ThemedText>
        </Pressable>
      </View>
      <AuditionForm
        title="➕ Add an audition"
        subtitle="Add one you're preparing for, or one you've already taken."
        submitLabel="Save audition"
        onSubmit={handleSubmit}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  topBar: { paddingHorizontal: 20, paddingVertical: 12, alignItems: 'flex-end' },
});
