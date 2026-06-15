import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatIsoDate } from '@/lib/date';
import { Listing } from '@/types/listing';

/** A single discoverable listing, with a button to add it to your tracking. */
export function ListingCard({
  listing,
  added,
  onAdd,
}: {
  listing: Listing;
  added: boolean;
  onAdd: () => void;
}) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const muted = useThemeColor({}, 'muted');
  const secondary = useThemeColor({}, 'secondary');
  const text = useThemeColor({}, 'text');
  const success = useThemeColor({}, 'success');

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      <ThemedText type="defaultSemiBold" style={styles.ensemble}>
        {listing.ensemble}
      </ThemedText>
      <ThemedText>{listing.position}</ThemedText>
      {listing.location ? (
        <ThemedText style={[styles.meta, { color: muted }]}>{listing.location}</ThemedText>
      ) : null}
      {listing.applicationDeadline ? (
        <ThemedText style={[styles.meta, { color: muted }]}>
          Application deadline: {formatIsoDate(listing.applicationDeadline)}
        </ThemedText>
      ) : null}
      {listing.auditionDate ? (
        <ThemedText style={[styles.meta, { color: muted }]}>
          Audition date: {formatIsoDate(listing.auditionDate)}
        </ThemedText>
      ) : null}
      {listing.pay ? (
        <ThemedText style={[styles.meta, { color: muted }]}>{listing.pay}</ThemedText>
      ) : null}

      {listing.url ? (
        <Pressable onPress={() => Linking.openURL(listing.url!)} hitSlop={6}>
          <ThemedText style={[styles.link, { color: secondary }]}>View posting ↗</ThemedText>
        </Pressable>
      ) : null}

      <Pressable
        onPress={onAdd}
        disabled={added}
        style={({ pressed }) => [
          styles.button,
          { backgroundColor: added ? success : primary },
          pressed && styles.pressed,
        ]}>
        <ThemedText style={[styles.buttonText, { color: added ? '#fff' : text }]}>
          {added ? '✓ Added to Interested' : '♡ Add to Interested'}
        </ThemedText>
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { borderWidth: 1, borderRadius: 14, padding: 16, gap: 4 },
  ensemble: { fontSize: 17 },
  meta: { fontSize: 14 },
  link: { fontSize: 14, fontWeight: '600', marginTop: 4 },
  button: { marginTop: 12, borderRadius: 12, paddingVertical: 12, alignItems: 'center' },
  pressed: { opacity: 0.85 },
  buttonText: { fontSize: 15, fontWeight: '700' },
});
