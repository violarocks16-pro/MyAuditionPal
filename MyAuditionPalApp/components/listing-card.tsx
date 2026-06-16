import { MaterialCommunityIcons } from '@expo/vector-icons';
import { Linking, Pressable, StyleSheet, View } from 'react-native';
import Animated, { FadeInDown } from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatIsoDate } from '@/lib/date';
import { Listing } from '@/types/listing';

/** A single discoverable listing. Tap the heart to add it to your tracking. */
export function ListingCard({
  listing,
  added,
  onAdd,
  onRemove,
  index = 0,
}: {
  listing: Listing;
  added: boolean;
  onAdd: () => void;
  onRemove: () => void;
  index?: number; // position in the list, for a staggered entrance
}) {
  const dark = (useColorScheme() ?? 'light') === 'dark';
  const secondary = useThemeColor({}, 'secondary');
  const brightPink = '#EC4899';

  // Browse uses its own scheme: light = white cards on gray; dark = gray cards on black.
  const cardBg = dark ? '#2C2C2E' : '#FFFFFF';
  const cardBorder = dark ? '#3A3A3C' : '#E8E8EA';
  const bodyColor = dark ? '#FFFFFF' : '#000000'; // position
  const metaColor = dark ? '#EBEBEB' : '#000000'; // meta text + icons

  // Location and pay share one line to keep cards short.
  const facts = [listing.location, listing.pay].filter(Boolean).join('  ·  ');

  return (
    <Animated.View
      entering={FadeInDown.delay(Math.min(index, 10) * 60).duration(420)}
      style={[styles.card, { backgroundColor: cardBg, borderColor: cardBorder }]}>
      <View style={styles.header}>
        <View style={styles.titleBlock}>
          <ThemedText style={[styles.ensemble, { color: brightPink }]}>{listing.ensemble}</ThemedText>
          <ThemedText style={[styles.position, { color: bodyColor }]}>{listing.position}</ThemedText>
        </View>
        <Pressable onPress={added ? onRemove : onAdd} hitSlop={10} style={styles.heart}>
          <ThemedText style={[styles.heartIcon, { color: added ? secondary : metaColor }]}>
            {added ? '♥' : '♡'}
          </ThemedText>
        </Pressable>
      </View>

      <View style={styles.body}>
        <View style={styles.meta}>
          {facts ? <MetaRow icon="map-marker-outline" text={facts} color={metaColor} /> : null}
          {listing.applicationDeadline ? (
            <MetaRow
              icon="checkbox-marked-outline"
              text={`Deadline ${formatIsoDate(listing.applicationDeadline)}`}
              color={metaColor}
            />
          ) : null}
          {listing.auditionDate ? (
            <MetaRow
              icon="music-note-outline"
              text={`Audition ${formatIsoDate(listing.auditionDate)}`}
              color={metaColor}
            />
          ) : null}
        </View>

        {listing.url ? (
          <Pressable
            onPress={() => Linking.openURL(listing.url!)}
            style={({ pressed }) => [
              styles.detailsButton,
              { backgroundColor: cardBg, borderColor: brightPink },
              pressed && styles.pressed,
            ]}>
            <ThemedText style={[styles.detailsText, { color: brightPink }]}>View Details</ThemedText>
          </Pressable>
        ) : null}
      </View>
    </Animated.View>
  );
}

/** One meta line with a leading outline icon (location / deadline / audition). */
function MetaRow({
  icon,
  text,
  color,
}: {
  icon: keyof typeof MaterialCommunityIcons.glyphMap;
  text: string;
  color: string;
}) {
  return (
    <View style={styles.metaRow}>
      <MaterialCommunityIcons name={icon} size={15} color={color} />
      <ThemedText style={[styles.metaLine, { color }]}>{text}</ThemedText>
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
  body: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', gap: 12, marginTop: 6 },
  meta: { flex: 1, gap: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLine: { fontSize: 13, lineHeight: 18, flexShrink: 1 },
  detailsButton: {
    borderRadius: 10,
    borderWidth: 1.5,
    paddingHorizontal: 14,
    paddingVertical: 8,
  },
  detailsText: { fontSize: 13, fontWeight: '700' },
  pressed: { opacity: 0.85 },
});
