import { Linking, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatIsoDate } from '@/lib/date';
import { Listing } from '@/types/listing';

/** A single discoverable listing. Tap the heart to add it to your tracking. */
export function ListingCard({
  listing,
  added,
  onAdd,
  onRemove,
}: {
  listing: Listing;
  added: boolean;
  onAdd: () => void;
  onRemove: () => void;
}) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const secondary = useThemeColor({}, 'secondary');
  const brightPink = '#EC4899';

  // Location and pay share one line to keep cards short.
  const facts = [listing.location ? `📍 ${listing.location}` : null, listing.pay ? `💰 ${listing.pay}` : null]
    .filter(Boolean)
    .join('   ');

  return (
    <View style={[styles.card, { backgroundColor: surface, borderColor: border }]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <ThemedText style={styles.ensemble}>{listing.ensemble}</ThemedText>
          <ThemedText style={styles.position}>{listing.position}</ThemedText>
        </View>
        <Pressable onPress={added ? onRemove : onAdd} hitSlop={10} style={styles.heart}>
          <ThemedText style={[styles.heartIcon, { color: added ? secondary : muted }]}>
            {added ? '♥' : '♡'}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.meta}>
        {facts ? <ThemedText style={[styles.metaLine, { color: muted }]}>{facts}</ThemedText> : null}
        {listing.applicationDeadline ? (
          <ThemedText style={[styles.metaLine, { color: muted }]}>
            ⏳ Deadline {formatIsoDate(listing.applicationDeadline)}
          </ThemedText>
        ) : null}
        {listing.auditionDate ? (
          <ThemedText style={[styles.metaLine, { color: muted }]}>
            🎭 Audition {formatIsoDate(listing.auditionDate)}
          </ThemedText>
        ) : null}
      </View>

      {listing.url ? (
        <Pressable
          onPress={() => Linking.openURL(listing.url!)}
          style={({ pressed }) => [
            styles.detailsButton,
            { backgroundColor: brightPink },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={styles.detailsText}>View Details</ThemedText>
        </Pressable>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 12,
    gap: 4,
    shadowColor: '#5a4a42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  header: { flexDirection: 'row', alignItems: 'flex-start', gap: 8 },
  titleBlock: { flex: 1, gap: 1 },
  ensemble: { fontSize: 17, fontWeight: '700', lineHeight: 22 },
  position: { fontSize: 14 },
  heart: { paddingLeft: 4 },
  heartIcon: { fontSize: 26, lineHeight: 28 },
  meta: { gap: 2, marginTop: 4 },
  metaLine: { fontSize: 13, lineHeight: 18 },
  detailsButton: {
    alignSelf: 'flex-start',
    marginTop: 10,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detailsText: { fontSize: 13, fontWeight: '700', color: '#fff' },
  pressed: { opacity: 0.85 },
});
