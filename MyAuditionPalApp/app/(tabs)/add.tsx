import { useRouter } from 'expo-router';
import { Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { AuditionForm, AuditionFormValues } from '@/components/audition-form';
import { useAuditions } from '@/contexts/audition-context';
import { useThemeColor } from '@/hooks/use-theme-color';

export default function AddScreen() {
  const { addAudition } = useAuditions();
  const router = useRouter();

  const background = useThemeColor({}, 'background');

  function handleSubmit(values: AuditionFormValues) {
    addAudition(values);
    Alert.alert('Saved', 'Your audition has been added.', [
      { text: 'OK', onPress: () => router.navigate('/') },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
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
});
