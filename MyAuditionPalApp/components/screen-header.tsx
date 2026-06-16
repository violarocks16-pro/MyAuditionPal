import { ReactNode } from 'react';
import { StyleSheet, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';

/**
 * The header band used at the top of each tab — a rounded surface card with the
 * screen title (and an optional right-side action), matching the Browse header.
 */
export function ScreenHeader({ title, right }: { title: string; right?: ReactNode }) {
  const surface = useThemeColor({}, 'surface');
  return (
    <View style={[styles.header, { backgroundColor: surface }]}>
      <ThemedText style={styles.title}>{title}</ThemedText>
      {right}
    </View>
  );
}

const styles = StyleSheet.create({
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
  title: { flex: 1, fontSize: 22, fontWeight: '700' },
});
