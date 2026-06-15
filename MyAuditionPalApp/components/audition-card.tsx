import { Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { Audition, STATUS_LABELS } from '@/types/audition';

/**
 * A single audition shown as a card. Used by both the My Auditions and
 * History tabs, so the look stays consistent in one place.
 */
export function AuditionCard({
  audition,
  onPress,
  onLongPress,
}: {
  audition: Audition;
  onPress?: () => void;
  onLongPress?: () => void;
}) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const muted = useThemeColor({}, 'muted');

  // Show the next date that matters: the deadline if there is one, else the audition date.
  const dateLine = audition.applicationDeadline
    ? `Deadline: ${audition.applicationDeadline}`
    : audition.auditionDate
      ? `Audition: ${audition.auditionDate}`
      : null;

  return (
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: surface, borderColor: border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.header}>
        <ThemedText type="defaultSemiBold" style={styles.ensemble}>
          {audition.ensemble}
        </ThemedText>
        <View style={[styles.badge, { backgroundColor: primary }]}>
          <ThemedText style={styles.badgeText}>{STATUS_LABELS[audition.status]}</ThemedText>
        </View>
      </View>
      <ThemedText>{audition.position}</ThemedText>
      {audition.location ? (
        <ThemedText style={[styles.meta, { color: muted }]}>{audition.location}</ThemedText>
      ) : null}
      {dateLine ? (
        <ThemedText style={[styles.meta, { color: muted }]}>{dateLine}</ThemedText>
      ) : null}
      {audition.result ? (
        <ThemedText style={[styles.meta, { color: muted }]}>Result: {audition.result}</ThemedText>
      ) : null}
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: 14,
    padding: 16,
    gap: 4,
  },
  pressed: { opacity: 0.85 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  ensemble: { flex: 1, fontSize: 17 },
  badge: {
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  badgeText: { fontSize: 12, fontWeight: '600' },
  meta: { fontSize: 14 },
});
