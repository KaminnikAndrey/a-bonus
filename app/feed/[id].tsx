import { useProjectFeed } from '@/contexts/ProjectFeedContext';
import {
  getMockCommentsForProject,
  getProjectDetailDescription,
  type ProjectComment,
} from '@/services/feed/mockProjectFeed';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { StatusBar } from 'expo-status-bar';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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

/** Акцент и кнопки — как в макете «Подробнее о проекте». */
const ACCENT = '#6B6EB2';
const LIKE_PILL_BG = '#E8E6F4';

export default function ProjectFeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const { items: feedItems, toggleLike, isLiked, getLikeCount } = useProjectFeed();

  const project = useMemo(
    () => (id ? feedItems.find((p) => p.id === id) : undefined),
    [id, feedItems]
  );
  const description = useMemo(
    () => (project ? getProjectDetailDescription(project) : ''),
    [project]
  );

  const [comments, setComments] = useState<ProjectComment[]>([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (id) setComments(getMockCommentsForProject(id));
  }, [id]);

  const sendComment = useCallback(() => {
    const t = draft.trim();
    if (!t) return;
    setComments((prev) => [
      ...prev,
      { id: `local-${Date.now()}`, authorName: 'Вы', text: t },
    ]);
    setDraft('');
  }, [draft]);

  if (!project) {
    return (
      <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        <View style={styles.headerRow}>
          <Pressable onPress={() => router.back()} style={styles.headerIcon} hitSlop={12}>
            <Ionicons name="chevron-back" size={26} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Подробнее о проекте</Text>
          <View style={styles.headerIcon} />
        </View>
        <Text style={[styles.empty, { color: colors.placeholder }]}>Проект не найден.</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.screen, { backgroundColor: colors.background }]} edges={['top']}>
      <StatusBar style="dark" />
      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <View style={styles.flex}>
          <ScrollView
            style={styles.flex}
            contentContainerStyle={styles.scrollInner}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}>
            <View style={styles.headerRow}>
              <Pressable onPress={() => router.back()} style={styles.headerIcon} hitSlop={12}>
                <Ionicons name="chevron-back" size={26} color={colors.text} />
              </Pressable>
              <Text style={[styles.headerTitle, { color: colors.text }]}>Подробнее о проекте</Text>
              <View style={styles.headerIcon} />
            </View>

            <View style={styles.authorRow}>
              <Text style={[styles.authorName, { color: colors.text }]} numberOfLines={2}>
                {project.authorName}
              </Text>
              <Pressable
                style={styles.likePill}
                onPress={() => toggleLike(project.id)}
                accessibilityRole="button"
                accessibilityLabel={isLiked(project.id) ? 'Убрать лайк' : 'Поставить лайк'}
                accessibilityState={{ selected: isLiked(project.id) }}>
                <Ionicons
                  name={isLiked(project.id) ? 'heart' : 'heart-outline'}
                  size={18}
                  color={isLiked(project.id) ? ACCENT : colors.text}
                />
                <Text style={[styles.likeCount, { color: colors.text }]}>{getLikeCount(project)}</Text>
              </Pressable>
            </View>

            <Text style={[styles.projectTitle, { color: colors.text }]}>{project.title}</Text>

            <Text style={[styles.description, { color: colors.placeholder }]}>{description}</Text>

            <Text style={[styles.commentsHeading, { color: colors.text }]}>Комментарии</Text>

            {comments.map((c) => (
              <View key={c.id} style={styles.commentBlock}>
                <View style={[styles.avatar, { borderColor: colors.border }]}>
                  <Ionicons name="person" size={22} color={colors.placeholder} />
                </View>
                <View style={styles.commentBody}>
                  <Text style={[styles.commentAuthor, { color: colors.text }]}>{c.authorName}</Text>
                  <Text style={[styles.commentText, { color: colors.placeholder }]}>{c.text}</Text>
                </View>
              </View>
            ))}

            <View style={styles.inputRow}>
              <TextInput
                value={draft}
                onChangeText={setDraft}
                placeholder="Введите комментарий"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                multiline
                maxLength={500}
              />
              <Pressable
                style={[styles.sendBtn, { backgroundColor: ACCENT }]}
                onPress={sendComment}
                accessibilityLabel="Отправить комментарий">
                <Ionicons name="send" size={20} color="#FFFFFF" />
              </Pressable>
            </View>
          </ScrollView>

          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(insets.bottom, 12),
                borderTopColor: colors.border,
              },
            ]}>
            <Pressable
              style={[styles.cta, { backgroundColor: ACCENT }]}
              onPress={() =>
                Alert.alert('Переход к проекту', 'Ссылка на материалы проекта появится после подключения к серверу.')
              }>
              <Text style={styles.ctaText}>Перейти к проекту</Text>
            </Pressable>
          </View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  screen: { flex: 1 },
  flex: { flex: 1 },
  scrollInner: {
    paddingHorizontal: 20,
    paddingBottom: 16,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20,
  },
  headerIcon: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    textAlign: 'center',
  },
  authorRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  authorName: {
    flex: 1,
    fontSize: 17,
    fontWeight: '700',
    lineHeight: 24,
    marginRight: 12,
  },
  likePill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: LIKE_PILL_BG,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 20,
  },
  likeCount: {
    fontSize: 15,
    fontWeight: '700',
    marginLeft: 6,
  },
  projectTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 14,
  },
  description: {
    fontSize: 15,
    lineHeight: 23,
    marginBottom: 28,
  },
  commentsHeading: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 16,
  },
  commentBlock: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 18,
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  commentBody: {
    flex: 1,
    paddingTop: 2,
  },
  commentAuthor: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 4,
  },
  commentText: {
    fontSize: 14,
    lineHeight: 20,
  },
  inputRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginTop: 8,
  },
  input: {
    flex: 1,
    minHeight: 48,
    maxHeight: 120,
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 15,
    marginRight: 10,
  },
  sendBtn: {
    width: 48,
    height: 48,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
  },
  empty: { textAlign: 'center', marginTop: 48, paddingHorizontal: 24, fontSize: 16 },
});
