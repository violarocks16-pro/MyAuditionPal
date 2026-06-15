import { useRef, useState } from 'react';
import { Modal, Pressable, StyleSheet, TextInput, useWindowDimensions, View } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { daysUntil, formatIsoDate } from '@/lib/date';
import { Audition, AuditionStatus, STATUS_LABELS, STATUS_ORDER } from '@/types/audition';

/** A short human hint like "today", "tomorrow", "in 3 days", "overdue". */
function relativeLabel(days: number | null): string {
  if (days === null) return '';
  if (days < 0) return 'overdue';
  if (days === 0) return 'today';
  if (days === 1) return 'tomorrow';
  return `in ${days} days`;
}

/**
 * A single audition shown as a card. Used by both the My Auditions and History
 * tabs. If `onChangeStatus` is provided, the status badge becomes a dropdown.
 */
export function AuditionCard({
  audition,
  onPress,
  onLongPress,
  onChangeStatus,
  onMarkAttended,
  onDismissNudge,
}: {
  audition: Audition;
  onPress?: () => void;
  onLongPress?: () => void;
  onChangeStatus?: (status: AuditionStatus) => void;
  onMarkAttended?: (result?: string) => void; // enables the "Did you attend?" nudge
  onDismissNudge?: () => void;
}) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const muted = useThemeColor({}, 'muted');
  const deadlineColor = useThemeColor({}, 'deadline');
  const background = useThemeColor({}, 'background');
  const text = useThemeColor({}, 'text');

  const { width: screenWidth } = useWindowDimensions();
  const badgeRef = useRef<View>(null);
  const [menuOpen, setMenuOpen] = useState(false);
  const [anchor, setAnchor] = useState<{ top: number; left: number } | null>(null);
  const [resultOpen, setResultOpen] = useState(false);
  const [resultText, setResultText] = useState('');

  function confirmAttended() {
    onMarkAttended?.(resultText.trim() || undefined);
    setResultOpen(false);
    setResultText('');
  }

  const MENU_WIDTH = 180;

  // Measure the badge's on-screen position so the popover appears right under it.
  function openMenu() {
    badgeRef.current?.measureInWindow((x, y, width, height) => {
      const left = Math.min(Math.max(8, x + width - MENU_WIDTH), screenWidth - MENU_WIDTH - 8);
      setAnchor({ top: y + height + 6, left });
      setMenuOpen(true);
    });
  }

  // Application deadline line, with an urgency hint. Only highlight when it's
  // coming up (today through 7 days away) — not once it has already passed.
  let deadlineLine: string | null = null;
  let deadlineUrgent = false;
  if (audition.applicationDeadline) {
    const days = daysUntil(audition.applicationDeadline);
    const relative = relativeLabel(days);
    deadlineLine = `Application deadline: ${formatIsoDate(audition.applicationDeadline)}${
      relative ? ` (${relative})` : ''
    }`;
    deadlineUrgent = days !== null && days >= 0 && days <= 7;
  }

  const auditionDateLine = audition.auditionDate
    ? `Audition date: ${formatIsoDate(audition.auditionDate)}`
    : null;

  // Show a gentle "Did you attend?" nudge once the audition date has passed
  // (and it isn't already attended or previously dismissed).
  const auditionPassed = audition.auditionDate ? (daysUntil(audition.auditionDate) ?? 0) < 0 : false;
  const showNudge =
    !!onMarkAttended &&
    audition.status !== 'attended' &&
    auditionPassed &&
    !audition.attendNudgeDismissed;

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
        {onChangeStatus ? (
          <Pressable ref={badgeRef} onPress={openMenu} style={[styles.badge, { backgroundColor: primary }]}>
            <ThemedText style={styles.badgeText}>{STATUS_LABELS[audition.status]} ▾</ThemedText>
          </Pressable>
        ) : (
          <View style={[styles.badge, { backgroundColor: primary }]}>
            <ThemedText style={styles.badgeText}>{STATUS_LABELS[audition.status]}</ThemedText>
          </View>
        )}
      </View>

      <ThemedText>{audition.position}</ThemedText>
      {audition.location ? (
        <ThemedText style={[styles.meta, { color: muted }]}>{audition.location}</ThemedText>
      ) : null}
      {deadlineLine ? (
        <ThemedText style={[styles.meta, { color: deadlineUrgent ? deadlineColor : muted }]}>
          {deadlineLine}
        </ThemedText>
      ) : null}
      {auditionDateLine ? (
        <ThemedText style={[styles.meta, { color: muted }]}>{auditionDateLine}</ThemedText>
      ) : null}
      {audition.result ? (
        <ThemedText style={[styles.meta, { color: muted }]}>Result: {audition.result}</ThemedText>
      ) : null}

      {showNudge ? (
        <View style={[styles.nudge, { borderColor: border }]}>
          <ThemedText style={styles.nudgeText}>Did you attend this audition?</ThemedText>
          <View style={styles.nudgeButtons}>
            <Pressable
              onPress={() => setResultOpen(true)}
              style={({ pressed }) => [
                styles.nudgeYes,
                { backgroundColor: primary },
                pressed && styles.pressed,
              ]}>
              <ThemedText style={styles.nudgeYesText}>Yes, attended</ThemedText>
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
            <ThemedText style={[styles.meta, { color: muted }]}>
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
              <ThemedText style={[styles.nudgeYesText, { color: text }]}>Save</ThemedText>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>

      {onChangeStatus ? (
        <Modal visible={menuOpen} transparent animationType="fade" onRequestClose={() => setMenuOpen(false)}>
          <Pressable style={styles.backdrop} onPress={() => setMenuOpen(false)}>
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
  nudge: {
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    paddingTop: 10,
    gap: 8,
  },
  nudgeText: { fontSize: 14, fontWeight: '600' },
  nudgeButtons: { flexDirection: 'row', alignItems: 'center', gap: 16 },
  nudgeYes: { borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  nudgeYesText: { fontSize: 13, fontWeight: '700' },
  nudgeNot: { fontSize: 13, fontWeight: '600' },
  resultBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
    justifyContent: 'center',
    padding: 28,
  },
  resultSheet: {
    borderWidth: 1,
    borderRadius: 16,
    padding: 20,
    gap: 10,
  },
  resultInput: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  resultSave: {
    marginTop: 4,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  menu: {
    position: 'absolute',
    borderWidth: 1,
    borderRadius: 12,
    overflow: 'hidden',
    // soft shadow so it reads as a floating popover
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
