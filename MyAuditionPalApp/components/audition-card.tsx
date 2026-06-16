import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';
import Animated, {
  Extrapolation,
  FadeInDown,
  interpolate,
  useAnimatedStyle,
  type SharedValue,
} from 'react-native-reanimated';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { daysUntil, formatIsoDate } from '@/lib/date';
import { Audition, AuditionStatus, STATUS_LABELS, STATUS_ORDER } from '@/types/audition';

// Approximate audition-card height (incl. gap), used for the scroll-fade math.
const ROW_ESTIMATE = 190;

/** A short human hint like "today", "tomorrow", "in 3 days", "overdue". */
function relativeLabel(days: number | null): string {
  if (days === null) return '';
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/**
 * A single audition shown as a card, used by My Auditions and History.
 * If `onChangeStatus` is provided, the status badge becomes a dropdown.
 */
export function AuditionCard({
  audition,
  onPress,
  onLongPress,
  onChangeStatus,
  onMarkAttended,
  onDismissNudge,
  index = 0,
  scrollY,
}: {
  audition: Audition;
  onPress?: () => void;
  onLongPress?: () => void;
  onChangeStatus?: (status: AuditionStatus) => void;
  onMarkAttended?: (result?: string) => void;
  onDismissNudge?: () => void;
  index?: number; // position in the list, for a staggered entrance
  scrollY?: SharedValue<number>; // list scroll offset, for the scroll-fade effect
}) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const secondary = useThemeColor({}, 'secondary');
  const muted = useThemeColor({}, 'muted');
  const deadlineColor = useThemeColor({}, 'deadline');
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');
  const success = useThemeColor({}, 'success');

  const { width: screenWidth } = useWindowDimensions();
  const badgeRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultText, setResultText] = useState('');

  const MENU_WIDTH = 180;

  function openMenu() {
    badgeRef.current?.measureInWindow((x, y, width, height) => {
      const left = Math.min(Math.max(8, x + width - MENU_WIDTH), screenWidth - MENU_WIDTH - 8);
      setAnchor({ top: y + height + 6, left });
      setMenuOpen(true);
    });
  }

  function confirmAttended() {
    onMarkAttended?.(resultText.trim() || undefined);
    setResultOpen(false);
    setResultText('');
  }

  // Status badge colors: Interested = pink outline (like the View Details button),
  // Applied = solid pink, Attended = solid green.
  const badge =
    audition.status === 'applied'
      ? { bg: primary, fg: text, bd: primary }
      : audition.status === 'attended'
        ? { bg: success, fg: '#fff', bd: success }
        : { bg: surface, fg: primary, bd: primary };

  // Application deadline line, highlighted only when coming up (today–7 days).
  let deadlineLine: string | null = null;
  let deadlineUrgent = false;
  if (audition.applicationDeadline) {
    const days = daysUntil(audition.applicationDeadline);
    const relative = relativeLabel(days);
    deadlineLine = `Deadline ${formatIsoDate(audition.applicationDeadline)}${
      relative ? ` · ${relative}` : ''
    }`;
    deadlineUrgent = days !== null && days >= 0 && days <= 7;
  }

  const auditionDateLine = audition.auditionDate
    ? `Audition ${formatIsoDate(audition.auditionDate)}`
    : null;

  // Show a "Did you attend?" nudge once the audition date has passed.
  const auditionPassed = audition.auditionDate
    ? (daysUntil(audition.auditionDate) ?? 0) < 0
    : false;
  const showNudge =
    !!onMarkAttended &&
    audition.status !== 'attended' &&
    auditionPassed &&
    !audition.attendNudgeDismissed;

  const scrollStyle = useAnimatedStyle(() => {
    if (!scrollY) return {};
    const d = scrollY.value - index * ROW_ESTIMATE;
    return {
      opacity: interpolate(d, [0, 130], [1, 0.6], Extrapolation.CLAMP),
      transform: [{ scale: interpolate(d, [0, 130], [1, 0.97], Extrapolation.CLAMP) }],
    };
  });

  return (
    <Animated.View style={scrollStyle}>
    <Animated.View entering={FadeInDown.delay(Math.min(index, 10) * 60).duration(420)}>
    <Pressable
      onPress={onPress}
      onLongPress={onLongPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: surface, borderColor: border },
        pressed && styles.pressed,
      ]}>
      <View style={styles.header}>
        <ThemedText style={styles.ensemble}>{audition.ensemble}</ThemedText>
        {onChangeStatus ? (
          <Pressable
            ref={badgeRef}
            onPress={openMenu}
            style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.bd }]}>
            <ThemedText style={[styles.badgeText, { color: badge.fg }]}>
              {STATUS_LABELS[audition.status]} ▾
            </ThemedText>
          </Pressable>
        ) : (
          <View style={[styles.badge, { backgroundColor: badge.bg, borderColor: badge.bd }]}>
            <ThemedText style={[styles.badgeText, { color: badge.fg }]}>
              {STATUS_LABELS[audition.status]}
            </ThemedText>
          </View>
        )}
      </View>

      <ThemedText style={styles.position}>{audition.position}</ThemedText>

      <View style={styles.meta}>
        {audition.location ? (
          <MetaRow icon="map-marker-outline" text={audition.location} color={muted} />
        ) : null}
        {deadlineLine ? (
          <MetaRow
            icon="checkbox-marked-outline"
            text={deadlineLine}
            color={deadlineUrgent ? deadlineColor : muted}
          />
        ) : null}
        {auditionDateLine ? (
          <MetaRow icon="music-note-outline" text={auditionDateLine} color={muted} />
        ) : null}
        {audition.result ? (
          <MetaRow icon="trophy-outline" text={audition.result} color={muted} />
        ) : null}
      </View>

      {onPress ? (
        <Pressable
          onPress={onPress}
          style={({ pressed }) => [
            styles.detailsButton,
            { backgroundColor: surface, borderColor: primary },
            pressed && styles.pressed,
          ]}>
          <ThemedText style={[styles.detailsText, { color: primary }]}>View Details</ThemedText>
        </Pressable>
      ) : null}

      {showNudge ? (
        <View style={[styles.nudge, { borderColor: border }]}>
          <ThemedText style={styles.nudgeText}>Did you attend this audition?</ThemedText>
          <View style={styles.nudgeButtons}>
            <Pressable
              onPress={() => setResultOpen(true)}
              style={({ pressed }) => [
                styles.nudgeYes,
                { backgroundColor: secondary },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.actionText, { color: '#fff' }]}>Yes, attended</ThemedText>
            </Pressable>
            <Pressable onPress={onDismissNudge} hitSlop={6}>
              <ThemedText style={[styles.nudgeNot, { color: muted }]}>Not yet</ThemedText>
            </Pressable>
          </View>
        </View>
      ) : null}

      {/* "How did it go?" box — captures the result when confirming attendance */}
      <Modal visible={resultOpen} transparent animationType="fade" onRequestClose={() => setResultOpen(false)}>
        <Pressable style={styles.resultBackdrop} onPress={() => setResultOpen(false)}>
          <Pressable
            style={[styles.resultSheet, { backgroundColor: background, borderColor: border }]}
            onPress={() => {}}>
            <ThemedText type="subtitle">How did it go?</ThemedText>
            <ThemedText style={[styles.metaLine, { color: muted }]}>
              Add a result (optional) — you can edit it later.
            </ThemedText>
            <TextInput
              value={resultText}
              onChangeText={setResultText}
              placeholder="e.g. semi-finals"
              placeholderTextColor={muted}
              autoFocus
              style={[styles.resultInput, { backgroundColor: surface, borderColor: border, color: text }]}
            />
            <Pressable
              onPress={confirmAttended}
              style={({ pressed }) => [
                styles.resultSave,
                { backgroundColor: primary },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={[styles.actionText, { color: text }]}>Save</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {/* Status dropdown popover */}
      {onChangeStatus ? (
        <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <Pressable style={styles.menuBackdrop} onPress={() => setMenuOpen(false)}>
            <Pressable
              style={[
                styles.menu,
                { backgroundColor: background, borderColor: border, width: MENU_WIDTH },
                anchor && { top: anchor.top, left: anchor.left },
              ]}
              onPress={() => {}}>
              {STATUS_ORDER.map((option) => {
                const selected = option === audition.status;
                return (
                  <Pressable
                    key={option}
                    onPress={() => {
                      onChangeStatus(option);
                      setMenuOpen(false);
                    }}
                    style={({ pressed }) => [
                      styles.menuItem,
                      { borderBottomColor: border },
                      selected && { backgroundColor: primary },
                      pressed && styles.pressed,
                    ]}>
                    <ThemedText>{STATUS_LABELS[option]}</ThemedText>
                    {selected ? <ThemedText>✓</ThemedText> : null}
                  </Pressable>
                );
              })}
            </Pressable>
          </Pressable>
        </Modal>
      ) : null}
    </Pressable>
    </Animated.View>
    </Animated.View>
  );
}

/** One meta line with a leading outline icon (matches the Browse cards). */
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
    borderRadius: 16,
    padding: 16,
    gap: 6,
    // soft floating shadow for a calm, raised feel
    shadowColor: '#5a4a42',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 2,
  },
  pressed: { opacity: 0.9 },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 10,
  },
  ensemble: { flex: 1, fontSize: 18, fontWeight: '700', lineHeight: 23 },
  position: { fontSize: 15, marginTop: -2 },
  meta: { gap: 4, marginTop: 4 },
  metaRow: { flexDirection: 'row', alignItems: 'center', gap: 6 },
  metaLine: { fontSize: 14, lineHeight: 19, flexShrink: 1 },
  detailsButton: {
    marginTop: 12,
    borderWidth: 1.5,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailsText: { fontSize: 14, fontWeight: '700' },
  badge: {
    borderRadius: 999,
    borderWidth: 1.5,
    paddingHorizontal: 11,
    paddingVertical: 5,
  },
  badgeText: { fontSize: 12, fontWeight: '700' },
  actionText: { fontSize: 15, fontWeight: '700' },
  // nudge
  nudge: { marginTop: 12, borderTopWidth: StyleSheet.hairlineWidth, paddingTop: 12, gap: 10 },
  nudgeText: { fontSize: 14, fontWeight: '600' },
  nudgeButtons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  nudgeYes: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  nudgeNot: { fontSize: 13, fontWeight: '600' },
  // result modal
  resultBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 28,
  },
  resultSheet: { borderWidth: 1, borderRadius: 16, padding: 20, gap: 10 },
  resultInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  resultSave: { marginTop: 4, borderRadius: 14, paddingVertical: 14, alignItems: 'center' },
  // status popover
  menuBackdrop: { flex: 1, backgroundColor: 'transparent' },
  menu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 12,
    elevation: 8,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
});
