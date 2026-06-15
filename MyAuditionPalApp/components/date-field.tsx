import DateTimePicker, { type DateTimePickerEvent } from '@react-native-community/datetimepicker';
import { useState } from 'react';
import { Modal, Platform, Pressable, StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { formatIsoDate, isoToDate, toIsoDate } from '@/lib/date';

/**
 * A labeled field that opens a calendar to pick a date.
 *
 * Stores/returns the date as an ISO "YYYY-MM-DD" string but shows it spelled out
 * (e.g. "September 1, 2026"). `value` undefined means no date chosen yet.
 */
export function DateField({
  label,
  value,
  onChange,
  placeholder = 'Select a date',
}: {
  label: string;
  value?: string;
  onChange: (iso: string | undefined) => void;
  placeholder?: string;
}) {
  const [show, setShow] = useState(false);

  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const muted = useThemeColor({}, 'muted');
  const background = useThemeColor({}, 'background');
  const primary = useThemeColor({}, 'primary');
  const text = useThemeColor({}, 'text');

  const seedDate = value ? isoToDate(value) : new Date();

  function handleChange(event: DateTimePickerEvent, selected?: Date) {
    if (Platform.OS === 'android') {
      setShow(false); // Android's dialog closes itself
      if (event.type === 'set' && selected) onChange(toIsoDate(selected));
    } else if (selected) {
      // iOS: update live while the sheet stays open until "Done"
      onChange(toIsoDate(selected));
    }
  }

  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>

      <Pressable
        onPress={() => setShow(true)}
        style={({ pressed }) => [
          styles.input,
          { backgroundColor: surface, borderColor: border },
          pressed && styles.pressed,
        ]}>
        <ThemedText style={value ? undefined : { color: muted }}>
          {value ? formatIsoDate(value) : placeholder}
        </ThemedText>
        {value ? (
          <Pressable onPress={() => onChange(undefined)} hitSlop={8}>
            <ThemedText style={{ color: muted }}>✕</ThemedText>
          </Pressable>
        ) : null}
      </Pressable>

      {Platform.OS === 'ios' ? (
        <Modal visible={show} transparent animationType="fade" onRequestClose={() => setShow(false)}>
          <Pressable style={styles.backdrop} onPress={() => setShow(false)}>
            <Pressable
              style={[styles.sheet, { backgroundColor: background, borderColor: border }]}
              onPress={() => {}}>
              <DateTimePicker value={seedDate} mode="date" display="inline" onChange={handleChange} />
              <Pressable
                onPress={() => setShow(false)}
                style={({ pressed }) => [
                  styles.done,
                  { backgroundColor: primary },
                  pressed && styles.pressed,
                ]}>
                <ThemedText style={[styles.doneText, { color: text }]}>Done</ThemedText>
              </Pressable>
            </Pressable>
          </Pressable>
        </Modal>
      ) : (
        show && <DateTimePicker value={seedDate} mode="date" onChange={handleChange} />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  field: { gap: 6, marginTop: 8 },
  label: { fontWeight: '600' },
  input: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
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
    borderWidth: 1,
    borderRadius: 16,
    padding: 12,
  },
  done: {
    marginTop: 8,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
  },
  doneText: { fontSize: 16, fontWeight: '700' },
});
