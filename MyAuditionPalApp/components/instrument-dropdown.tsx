import { useState } from 'react';
import { FlatList, Modal, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { INSTRUMENTS } from '@/constants/instruments';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * A drop-down menu for choosing an instrument.
 *
 * Shows a compact field with the current choice; tapping it opens a pop-up list
 * of all instruments. Built from a Modal + list (no extra library), so it works
 * in Expo Go and we can style it with the app palette.
 */
export function InstrumentDropdown({
  value,
  onSelect,
  placeholder = 'Select your instrument',
}: {
  value?: string;
  onSelect: (instrument: string) => void;
  placeholder?: string;
}) {
  const [open, setOpen] = useState(false);

  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const muted = useThemeColor({}, 'muted');

  return (
    <>
      {/* The closed field */}
      <Pressable
        onPress={() => setOpen(true)}
        style={({ pressed }) => [
          styles.field,
          { backgroundColor: surface, borderColor: border },
          pressed && styles.pressed,
        ]}>
        <ThemedText style={value ? undefined : { color: muted }}>{value ?? placeholder}</ThemedText>
        <ThemedText style={{ color: muted }}>▾</ThemedText>
      </Pressable>

      {/* The pop-up list */}
      <Modal visible={open} transparent animationType="fade" onRequestClose={() => setOpen(false)}>
        {/* Tapping the dimmed background closes the menu */}
        <Pressable style={styles.backdrop} onPress={() => setOpen(false)}>
          {/* Stop taps inside the sheet from closing it */}
          <Pressable
            style={[styles.sheet, { backgroundColor: background, borderColor: border }]}
            onPress={() => {}}>
            <FlatList
              data={INSTRUMENTS}
              keyExtractor={(item) => item}
              renderItem={({ item }) => {
                const selected = item === value;
                return (
                  <Pressable
                    onPress={() => {
                      onSelect(item);
                      setOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.option,
                      { borderBottomColor: border },
                      selected && { backgroundColor: primary },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText>{item}</ThemedText>
                    {selected ? <ThemedText>✓</ThemedText> : null}
                  </Pressable>
                );
              }}
            />
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  field: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  pressed: { opacity: 0.85 },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 24,
  },
  sheet: {
    maxHeight: '70%',
    borderWidth: 1,
    borderRadius: 16,
    overflow: 'hidden',
  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 18,
    paddingVertical: 16,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
