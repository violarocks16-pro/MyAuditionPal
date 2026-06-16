import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { useCallback, useEffect, useState } from 'react';
import {
  ActivityIndicator,
  Alert,
  FlatList,
  Pressable,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import { ListingCard } from '@/components/listing-card';
import { ThemedText } from '@/components/themed-text';
import { useAuditions } from '@/contexts/audition-context';
import { useProfile } from '@/contexts/profile-context';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useThemeColor } from '@/hooks/use-theme-color';
import { fetchListings } from '@/lib/listings';
import { Listing } from '@/types/listing';

export default function BrowseScreen() {
  const { profile } = useProfile();
  const { auditions, addAudition, deleteAudition } = useAuditions();
  const router = useRouter();

  // Browse's own scheme: light = gray backdrop + white header/cards; dark = black + gray.
  const dark = (useColorScheme() ?? 'light') === 'dark';
  const background = dark ? '#000000' : '#F4F4F6';
  const headerBg = dark ? '#2C2C2E' : '#FFFFFF';
  const cardBorder = dark ? '#3A3A3C' : '#E8E8EA';
  const muted = useThemeColor({}, 'muted');
  const deadline = useThemeColor({}, 'deadline');
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');

  const instrument = profile.instrument;

  const [listings, setListings] = useState<Listing[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(false);
  const [query, setQuery] = useState('');

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

  // Live text filter over ensemble / position / location.
  const q = query.trim().toLowerCase();
  const visible = q
    ? listings.filter((l) =>
        `${l.ensemble} ${l.position} ${l.location ?? ''}`.toLowerCase().includes(q)
      )
    : listings;

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

  // Un-heart: delete the audition this listing created (with a confirm).
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
      {/* Pinned header band + search bar */}
      <View style={styles.topSection}>
        <View style={[styles.header, { backgroundColor: headerBg }]}>
          <ThemedText style={styles.headerTitle}>
            {instrument ? `Upcoming ${instrument} Auditions` : 'Upcoming Auditions'}
          </ThemedText>
          <Pressable
            onPress={() => router.navigate('/add')}
            style={({ pressed }) => [
              styles.fab,
              { backgroundColor: primary },
              pressed && styles.fabPressed,
            ]}
            accessibilityLabel="Add an audition">
            <MaterialCommunityIcons name="plus" size={26} color="#fff" />
          </Pressable>
        </View>

        <View style={[styles.searchBar, { backgroundColor: headerBg, borderColor: cardBorder }]}>
          <MaterialCommunityIcons name="magnify" size={20} color={muted} />
          <TextInput
            value={query}
            onChangeText={setQuery}
            placeholder="Search by ensemble, position, location"
            placeholderTextColor={muted}
            autoCorrect={false}
            returnKeyType="search"
            style={[styles.searchInput, { color: text }]}
          />
          {query ? (
            <Pressable onPress={() => setQuery('')} hitSlop={8}>
              <MaterialCommunityIcons name="close-circle" size={18} color={muted} />
            </Pressable>
          ) : null}
        </View>
      </View>

      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator />
        </View>
      ) : (
        <FlatList
          data={visible}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          onRefresh={load}
          refreshing={loading}
          keyboardShouldPersistTaps="handled"
          ListEmptyComponent={
            error ? (
              <ThemedText style={[styles.empty, { color: deadline }]}>
                Couldn&apos;t load listings. Pull down to try again, and check your connection.
              </ThemedText>
            ) : q ? (
              <ThemedText style={[styles.empty, { color: muted }]}>
                No auditions match “{query}”.
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
  topSection: { paddingHorizontal: 20, paddingTop: 16, gap: 12 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 12,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 2,
  },
  headerTitle: { flex: 1, fontSize: 22, fontWeight: '700' },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
  },
  searchInput: { flex: 1, fontSize: 15, paddingVertical: 0 },
  list: { paddingHorizontal: 20, paddingTop: 14, paddingBottom: 20, gap: 14 },
  empty: { textAlign: 'center', marginTop: 40, paddingHorizontal: 20 },
  fab: { width: 44, height: 44, borderRadius: 22, alignItems: 'center', justifyContent: 'center' },
  fabPressed: { opacity: 0.85 },
});
