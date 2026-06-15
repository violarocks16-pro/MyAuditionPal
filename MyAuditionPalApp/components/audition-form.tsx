import { Image } from 'expo-image';
import * as FileSystem from 'expo-file-system/legacy';
import * as ImagePicker from 'expo-image-picker';
import { useState } from 'react';
import {
  Alert,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  TextInput,
  View,
} from 'react-native';

import { DateField } from '@/components/date-field';
import { ThemedText } from '@/components/themed-text';
import { useThemeColor } from '@/hooks/use-theme-color';
import { AuditionStatus, STATUS_LABELS, STATUS_ORDER } from '@/types/audition';

/** The editable fields of an audition — what the form collects and hands back. */
export type AuditionFormValues = {
  ensemble: string;
  position: string;
  location?: string;
  applicationDeadline?: string;
  auditionDate?: string;
  repertoire?: string;
  repertoirePhotoUri?: string;
  notes?: string;
  status: AuditionStatus;
  result?: string;
};

/**
 * The shared audition form, used by both the Add screen and the Edit screen.
 * `initial` seeds the fields (empty for Add, the existing audition for Edit).
 */
export function AuditionForm({
  initial,
  submitLabel,
  onSubmit,
  title,
  subtitle,
}: {
  initial?: Partial<AuditionFormValues>;
  submitLabel: string;
  onSubmit: (values: AuditionFormValues) => void;
  title?: string;
  subtitle?: string;
}) {
  const [ensemble, setEnsemble] = useState(initial?.ensemble ?? '');
  const [position, setPosition] = useState(initial?.position ?? '');
  const [location, setLocation] = useState(initial?.location ?? '');
  const [applicationDeadline, setApplicationDeadline] = useState(initial?.applicationDeadline ?? '');
  const [auditionDate, setAuditionDate] = useState(initial?.auditionDate ?? '');
  const [repertoire, setRepertoire] = useState(initial?.repertoire ?? '');
  const [repertoirePhotoUri, setRepertoirePhotoUri] = useState<string | undefined>(
    initial?.repertoirePhotoUri
  );
  const [notes, setNotes] = useState(initial?.notes ?? '');
  const [status, setStatus] = useState<AuditionStatus>(initial?.status ?? 'interested');
  const [result, setResult] = useState(initial?.result ?? '');

  const border = useThemeColor({}, 'border');
  const primary = useThemeColor({}, 'primary');
  const surface = useThemeColor({}, 'surface');
  const muted = useThemeColor({}, 'muted');
  const text = useThemeColor({}, 'text');

  async function persistPhoto(tempUri: string) {
    try {
      const destination = `${FileSystem.documentDirectory}rep-${Date.now()}.jpg`;
      await FileSystem.copyAsync({ from: tempUri, to: destination });
      setRepertoirePhotoUri(destination);
    } catch {
      setRepertoirePhotoUri(tempUri);
    }
  }

  async function takePhoto() {
    const permission = await ImagePicker.requestCameraPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Camera access needed', 'Please allow camera access to take a photo.');
      return;
    }
    const picked = await ImagePicker.launchCameraAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!picked.canceled) persistPhoto(picked.assets[0].uri);
  }

  async function chooseFromLibrary() {
    const permission = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (!permission.granted) {
      Alert.alert('Photo access needed', 'Please allow photo library access to upload a photo.');
      return;
    }
    const picked = await ImagePicker.launchImageLibraryAsync({ mediaTypes: ['images'], quality: 0.6 });
    if (!picked.canceled) persistPhoto(picked.assets[0].uri);
  }

  function addPhoto() {
    Alert.alert('Repertoire photo', 'Add a photo of your repertoire list', [
      { text: 'Take photo', onPress: takePhoto },
      { text: 'Choose from library', onPress: chooseFromLibrary },
      { text: 'Cancel', style: 'cancel' },
    ]);
  }

  function handleSubmit() {
    if (!ensemble.trim() || !position.trim()) {
      Alert.alert('Almost there', 'Please enter at least the ensemble and the position.');
      return;
    }
    const orUndefined = (value: string) => (value.trim() ? value.trim() : undefined);

    Keyboard.dismiss();
    onSubmit({
      ensemble: ensemble.trim(),
      position: position.trim(),
      location: orUndefined(location),
      applicationDeadline: applicationDeadline || undefined,
      auditionDate: auditionDate || undefined,
      repertoire: orUndefined(repertoire),
      repertoirePhotoUri,
      notes: orUndefined(notes),
      status,
      result: status === 'attended' ? orUndefined(result) : undefined,
    });
  }

  return (
    <KeyboardAvoidingView
      style={styles.flex}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}>
      <ScrollView contentContainerStyle={styles.content} keyboardShouldPersistTaps="handled">
        {title ? <ThemedText type="title">{title}</ThemedText> : null}
        {subtitle ? <ThemedText style={styles.intro}>{subtitle}</ThemedText> : null}

        <Field label="Ensemble *" value={ensemble} onChangeText={setEnsemble}
          placeholder="e.g. Boston Symphony Orchestra" />
        <Field label="Position *" value={position} onChangeText={setPosition}
          placeholder="e.g. Section Cello" />
        <Field label="Location" value={location} onChangeText={setLocation}
          placeholder="e.g. Boston, MA" />
        <DateField label="Application deadline" value={applicationDeadline || undefined}
          onChange={(iso) => setApplicationDeadline(iso ?? '')} placeholder="Select a date" />
        <DateField label="Audition date" value={auditionDate || undefined}
          onChange={(iso) => setAuditionDate(iso ?? '')} placeholder="Select a date" />
        <Field label="Repertoire" value={repertoire} onChangeText={setRepertoire}
          placeholder="Type pieces, or add a photo below" multiline />

        <View style={styles.field}>
          <ThemedText style={styles.label}>Repertoire photo</ThemedText>
          {repertoirePhotoUri ? (
            <View style={styles.photoWrap}>
              <Image source={{ uri: repertoirePhotoUri }} style={styles.photo} contentFit="cover" />
              <Pressable
                onPress={() => setRepertoirePhotoUri(undefined)}
                style={[styles.removePhoto, { backgroundColor: surface, borderColor: border }]}>
                <ThemedText style={styles.removePhotoText}>Remove photo</ThemedText>
              </Pressable>
            </View>
          ) : (
            <Pressable
              onPress={addPhoto}
              style={({ pressed }) => [
                styles.photoButton,
                { backgroundColor: surface, borderColor: border },
                pressed && styles.buttonPressed,
              ]}>
              <ThemedText>📷 Take or upload a photo</ThemedText>
            </Pressable>
          )}
        </View>

        <Field label="Private notes" value={notes} onChangeText={setNotes}
          placeholder="Anything you want to remember" multiline />

        <View style={styles.field}>
          <ThemedText style={styles.label}>Status</ThemedText>
          <View style={styles.chips}>
            {STATUS_ORDER.map((option) => {
              const selected = option === status;
              return (
                <Pressable
                  key={option}
                  onPress={() => setStatus(option)}
                  style={[
                    styles.chip,
                    { borderColor: border },
                    selected && { backgroundColor: primary, borderColor: primary },
                  ]}>
                  <ThemedText style={styles.chipText}>{STATUS_LABELS[option]}</ThemedText>
                </Pressable>
              );
            })}
          </View>
        </View>

        {status === 'attended' && (
          <Field label="Result (optional)" value={result} onChangeText={setResult}
            placeholder="e.g. semi-finals" />
        )}

        <Pressable
          onPress={handleSubmit}
          style={({ pressed }) => [
            styles.button,
            { backgroundColor: primary },
            pressed && styles.buttonPressed,
          ]}>
          <ThemedText style={[styles.buttonText, { color: text }]}>{submitLabel}</ThemedText>
        </Pressable>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function Field({
  label,
  value,
  onChangeText,
  placeholder,
  multiline,
}: {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  multiline?: boolean;
}) {
  const surface = useThemeColor({}, 'surface');
  const border = useThemeColor({}, 'border');
  const text = useThemeColor({}, 'text');
  const muted = useThemeColor({}, 'muted');

  return (
    <View style={styles.field}>
      <ThemedText style={styles.label}>{label}</ThemedText>
      <TextInput
        value={value}
        onChangeText={onChangeText}
        placeholder={placeholder}
        placeholderTextColor={muted}
        multiline={multiline}
        style={[
          styles.input,
          { backgroundColor: surface, borderColor: border, color: text },
          multiline && styles.inputMultiline,
        ]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1 },
  content: { padding: 20, gap: 8, paddingBottom: 40 },
  intro: { opacity: 0.7, marginBottom: 8 },
  field: { gap: 6, marginTop: 8 },
  label: { fontWeight: '600' },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputMultiline: { minHeight: 80, textAlignVertical: 'top' },
  photoButton: { borderWidth: 1, borderRadius: 12, paddingVertical: 16, alignItems: 'center' },
  photoWrap: { gap: 8 },
  photo: { width: '100%', height: 200, borderRadius: 12 },
  removePhoto: { borderWidth: 1, borderRadius: 10, paddingVertical: 10, alignItems: 'center' },
  removePhotoText: { fontSize: 14 },
  chips: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  chip: { borderWidth: 1, borderRadius: 999, paddingHorizontal: 14, paddingVertical: 8 },
  chipText: { fontSize: 14 },
  button: { marginTop: 24, borderRadius: 14, paddingVertical: 16, alignItems: 'center' },
  buttonPressed: { opacity: 0.8 },
  buttonText: { fontSize: 17, fontWeight: '700' },
});
