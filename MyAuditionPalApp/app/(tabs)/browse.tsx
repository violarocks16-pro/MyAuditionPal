import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListingCard } from '@/components/listing-card';
import { ThemedText } from '@/components/themed-text';
import { useAuditions } from '@/contexts/audition-context';
import { useProfile } from '@/contexts/profile-context';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fetchListings } from '@/lib/listings';
import { Listing } from '@/types/listing';

export default function BrowseScreen() {
  const { profile } = useProfile();
  const { auditions, addAudition, deleteAudition } = useAuditions();

  const background = useThemeColor({}, 'background');
  const muted = useThemeColor({}, 'muted');
  const deadline = useThemeColor({}, 'deadline');

  const instrument = profile.instrument;

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);

  const load = useCallback(async () => {
    setError(false);
    try {
      const data = await fetchListings(instrument);
      setListings(data);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  }, [instrument]);

  // Load when the screen first mounts and whenever the instrument changes.
  useEffect(() => {
    setLoading(true);
    load();
  }, [load]);

  // Which listings are already in the user's tracking (so we can show "Added").
  const addedIds = new Set(
    auditions.map((a) => a.sourceListingId).filter((id): id is string => !!id)
  );

  function addListing(listing: Listing) {
    addAudition({
      ensemble: listing.ensemble,
      position: listing.position,
      location: listing.location,
      applicationDeadline: listing.applicationDeadline,
      auditionDate: listing.auditionDate,
      notes: listing.notes,
      status: 'interested',
      sourceListingId: listing.id,
    });
  }

  // Un-heart: delete the audition this listing created (with a confirm, since it
  // may have your own edits by now).
  function removeListing(listing: Listing) {
    const existing = auditions.find((a) => a.sourceListingId === listing.id);
    if (!existing) return;
    Alert.alert('Remove from your auditions', `Remove "${listing.ensemble}"?`, [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: () => deleteAudition(existing.id) },
    ]);
  }

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: background }]} edges={['top']}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={listings}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
          ListHeaderComponent={
            <View style={styles.header}>
              <ThemedText type="title">🔎 Browse auditions</ThemedText>
              <ThemedText style={[styles.subtitle, { color: muted }]}>
                {instrument
                  ? `Showing listings for ${instrument}`
                  : 'Set your instrument in Profile to filter listings'}
              </ThemedText>
            </View>
          }
          ListEmptyComponent={
            error ? (
              <ThemedText style={[styles.empty, { color: deadline }]}>
                Couldn&apos;t load listings. Pull down to try again, and check your connection.
              </ThemedText>
            ) : (
              <ThemedText style={[styles.empty, { color: muted }]}>
                No listings yet{instrument ? ` for ${instrument}` : ''}. More are added over time —
                check back soon.
              </ThemedText>
            )
          }
          renderItem={({ item }) => (
            <ListingCard
              listing={item}
              added={addedIds.has(item.id)}
              onAdd={() => addListing(item)}
              onRemove={() => removeListing(item)}
            />
          )}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  list: { padding: 20, gap: 14 },
  header: { gap: 4, marginBottom: 8 },
  subtitle: { fontSize: 14 },
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
});
