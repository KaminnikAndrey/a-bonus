import { useProjectFeed } from '@/contexts/ProjectFeedContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { buildPublishedProject } from '@/services/feed/mockProjectFeed';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useState } from 'react';
import {
  Alert,
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const PURPLE = '#6B6BB3';
const TOGGLE_INACTIVE_BG = '#EBEBF0';
const TOGGLE_INACTIVE_TEXT = '#5C5C5C';
const INPUT_BORDER = '#D0D0D0';

type Visibility = 'all' | 'group';

export default function PublishProjectScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { addProject } = useProjectFeed();

  const [title, setTitle] = useState('');
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const [visibility, setVisibility] = useState<Visibility>('group');

  const onPublish = () => {
    const name = title.trim();
    if (!name) {
      Alert.alert('Название', 'Введите название проекта.');
      return;
    }
    addProject(
      buildPublishedProject({
        title: name,
        link,
        description,
        visibility,
      })
    );
    router.back();
  };

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={0}>
        <ScrollView
          contentContainerStyle={styles.scroll}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Pressable
            onPress={() => router.back()}
            style={styles.backRow}
            hitSlop={8}
            accessibilityRole="button"
            accessibilityLabel="Назад">
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.pageTitle, { color: colors.text }]}>Опубликовать проект</Text>

          <TextInput
            value={title}
            onChangeText={setTitle}
            placeholder="Название"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              { borderColor: INPUT_BORDER, color: colors.text, backgroundColor: colors.background },
            ]}
          />

          <TextInput
            value={link}
            onChangeText={setLink}
            placeholder="Ссылка"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              { borderColor: INPUT_BORDER, color: colors.text, backgroundColor: colors.background },
            ]}
            autoCapitalize="none"
            autoCorrect={false}
            keyboardType="url"
          />

          <TextInput
            value={description}
            onChangeText={setDescription}
            placeholder="Описание"
            placeholderTextColor={colors.placeholder}
            style={[
              styles.input,
              styles.inputMultiline,
              { borderColor: INPUT_BORDER, color: colors.text, backgroundColor: colors.background },
            ]}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.toggleRow}>
            <Pressable
              onPress={() => setVisibility('all')}
              style={[
                styles.togglePill,
                styles.togglePillLeft,
                visibility === 'all'
                  ? { backgroundColor: PURPLE }
                  : { backgroundColor: TOGGLE_INACTIVE_BG },
              ]}>
              <Text
                style={[
                  styles.toggleText,
                  visibility === 'all' ? styles.toggleTextActive : { color: TOGGLE_INACTIVE_TEXT },
                ]}>
                Виден всем
              </Text>
            </Pressable>
            <Pressable
              onPress={() => setVisibility('group')}
              style={[
                styles.togglePill,
                visibility === 'group'
                  ? { backgroundColor: PURPLE }
                  : { backgroundColor: TOGGLE_INACTIVE_BG },
              ]}>
              <Text
                style={[
                  styles.toggleText,
                  visibility === 'group' ? styles.toggleTextActive : { color: TOGGLE_INACTIVE_TEXT },
                ]}>
                Виден группе
              </Text>
            </Pressable>
          </View>
        </ScrollView>

        <View style={[styles.footer, { paddingBottom: Math.max(insets.bottom, 16) }]}>
          <Pressable style={styles.publishBtn} onPress={onPublish}>
            <Text style={styles.publishBtnText}>Опубликовать</Text>
          </Pressable>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  scroll: {
    paddingHorizontal: 20,
    paddingTop: 4,
    paddingBottom: 24,
  },
  backRow: {
    marginBottom: 4,
    alignSelf: 'flex-start',
  },
  pageTitle: {
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 28,
  },
  input: {
    borderWidth: 1,
    borderRadius: 16,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    marginBottom: 14,
  },
  inputMultiline: {
    minHeight: 140,
    paddingTop: 14,
  },
  toggleRow: {
    flexDirection: 'row',
    marginTop: 8,
  },
  togglePill: {
    flex: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  togglePillLeft: {
    marginRight: 10,
  },
  toggleText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  toggleTextActive: {
    color: '#FFFFFF',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: '#E5E5E5',
  },
  publishBtn: {
    backgroundColor: PURPLE,
    borderRadius: 28,
    paddingVertical: 16,
    alignItems: 'center',
  },
  publishBtnText: {
    color: '#FFFFFF',
    fontSize: 17,
    fontWeight: '700',
  },
});
