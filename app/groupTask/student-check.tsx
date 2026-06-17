import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getMockTeacherGroupTaskDetail,
  getTeacherTaskStudentStatusLabel,
  TEACHER_TASK_STATUS_TEXT_COLOR,
} from '@/services/groupTasks/mockTeacherGroupTaskDetail';
import { getMockTeacherTaskStudentSubmissions } from '@/services/groupTasks/mockTeacherTaskStudentReview';
import { hydrateMockCreatedTasks } from '@/services/groupTasks/mockCreatedTasksStore';
import {
  applyTeacherTaskReview,
  hydrateMockTeacherTaskReviews,
} from '@/services/groupTasks/mockTeacherTaskReviewStore';
import { userSelector } from '@/stores/auth/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const CTA_PURPLE = '#6766AA';
const STUDENT_ROW_BG = '#ECECEF';
const CTA_RADIUS = 14;
const INPUT_RADIUS = 12;

function oneParam(v: string | string[] | undefined): string | undefined {
  if (v == null) return undefined;
  const raw = Array.isArray(v) ? v[0] : v;
  if (raw === '') return undefined;
  try {
    return decodeURIComponent(raw);
  } catch {
    return raw;
  }
}

function formatShortRu(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(y).slice(-2)}`;
}

export default function TeacherGroupTaskStudentCheckScreen() {
  const raw = useLocalSearchParams<{ taskId?: string | string[]; studentId?: string | string[] }>();
  const taskId = oneParam(raw.taskId);
  const studentId = oneParam(raw.studentId);

  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useSelector(userSelector);
  const teacherId =
    user?.id != null && String(user.id).trim() !== '' ? String(user.id) : 'unknown';

  const [comment, setComment] = useState('');
  const [reviewTick, setReviewTick] = useState(0);

  useEffect(() => {
    void hydrateMockCreatedTasks(teacherId);
    void hydrateMockTeacherTaskReviews(teacherId);
  }, [teacherId]);

  const detail = useMemo(() => {
    void reviewTick;
    return taskId ? getMockTeacherGroupTaskDetail(taskId, teacherId) : undefined;
  }, [taskId, teacherId, reviewTick]);

  const student = useMemo(
    () => (detail && studentId ? detail.students.find((s) => s.id === studentId) : undefined),
    [detail, studentId]
  );

  const attempts = useMemo(() => {
    void reviewTick;
    return taskId && studentId
      ? getMockTeacherTaskStudentSubmissions(taskId, studentId, teacherId)
      : [];
  }, [taskId, studentId, teacherId, reviewTick]);

  const onBack = () => router.back();

  const canOpenReview =
    detail &&
    student &&
    student.status === 'awaiting_review' &&
    String(user?.role ?? '').toLowerCase() === 'teacher';

  const dateRange = detail
    ? `${formatShortRu(detail.dateFrom)} - ${formatShortRu(detail.dateTo)}`
    : '';

  const submitReview = (action: 'revision' | 'accept') => {
    if (!taskId || !studentId) return;
    if (action === 'revision' && !comment.trim()) {
      Alert.alert('Комментарий', 'Добавьте комментарий для доработки.');
      return;
    }
    void (async () => {
      await applyTeacherTaskReview(teacherId, taskId, studentId, action, comment);
      await hydrateMockTeacherTaskReviews(teacherId);
      setReviewTick((t) => t + 1);
      const title = action === 'accept' ? 'Принято' : 'Отправлено на доработку';
      const msg =
        action === 'accept'
          ? 'Решение ученика принято.'
          : 'Ученику отправлен комментарий на доработку.';
      Alert.alert(title, msg, [{ text: 'OK', onPress: () => router.back() }]);
    })();
  };

  const inputStyle = [
    styles.commentInput,
    {
      borderColor: colors.border,
      color: colors.text,
      backgroundColor: colors.background,
    },
  ];

  if (!canOpenReview) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.headerIcon} hitSlop={8} accessibilityLabel="Назад">
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            Подробнее о задаче
          </Text>
          <View style={styles.headerIcon} />
        </View>
        <Text style={[styles.missing, { color: colors.placeholder }]}>
          Проверка с комментарием доступна только для учеников со статусом «Ожидает проверки».
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
      <View style={styles.mainColumn}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.headerIcon} hitSlop={8} accessibilityLabel="Назад">
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
            Подробнее о задаче
          </Text>
          <View style={styles.headerIcon} />
        </View>

        <ScrollView
          style={styles.scroll}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingBottom: 24 + Math.max(insets.bottom, 8) },
          ]}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.taskTitle, { color: colors.text }]}>{detail.title}</Text>
          <Text style={[styles.rewardLine, { color: colors.text }]}>{detail.reward}</Text>
          <Text style={[styles.periodLine, { color: colors.placeholder }]}>{dateRange}</Text>

          <View style={styles.block}>
            <Text style={[styles.blockHeading, { color: colors.text }]}>Описание:</Text>
            {detail.descriptionSteps.map((step, index) => (
              <Text key={index} style={[styles.stepLine, { color: colors.text }]}>
                {index + 1}. {step}
              </Text>
            ))}
          </View>

          <Text style={[styles.studentsSectionTitle, { color: colors.text }]}>Ученики и статус:</Text>
          <View style={[styles.studentRow, { backgroundColor: STUDENT_ROW_BG }]}>
            <Text style={[styles.studentName, { color: colors.text }]} numberOfLines={1}>
              {student.fullName}
            </Text>
            <Text
              style={[styles.studentStatus, { color: TEACHER_TASK_STATUS_TEXT_COLOR[student.status] }]}
              numberOfLines={1}>
              {getTeacherTaskStudentStatusLabel(student.status)}
            </Text>
          </View>

          {attempts.map((a) => (
            <View key={a.attemptNumber} style={styles.attemptBlock}>
              <Text style={[styles.attemptTitle, { color: colors.text }]}>
                Ответ на задание (попытка {a.attemptNumber}):
              </Text>
              {a.link ? (
                <Text
                  style={[styles.linkLine, { color: CTA_PURPLE }]}
                  onPress={() => void Linking.openURL(a.link!)}
                  accessibilityRole="link">
                  {a.link}
                </Text>
              ) : null}
              {a.studentMessage ? (
                <Text style={[styles.bodyText, { color: colors.text }]}>{a.studentMessage}</Text>
              ) : null}
              {a.teacherComment ? (
                <View>
                  <Text style={[styles.commentLabel, { color: colors.text }]}>Комментарий:</Text>
                  <Text style={[styles.bodyText, { color: colors.text }]}>{a.teacherComment}</Text>
                </View>
              ) : null}
            </View>
          ))}

          <TextInput
            style={inputStyle}
            value={comment}
            onChangeText={setComment}
            placeholder="Введите комментарий (не обязательно)"
            placeholderTextColor={colors.placeholder}
            multiline
            textAlignVertical="top"
          />

          <View style={styles.actionsRow}>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: CTA_PURPLE },
                pressed && styles.actionBtnPressed,
              ]}
              onPress={() => submitReview('revision')}
              accessibilityLabel="На доработку">
              <Text style={styles.actionBtnText}>На доработку</Text>
            </Pressable>
            <Pressable
              style={({ pressed }) => [
                styles.actionBtn,
                { backgroundColor: CTA_PURPLE },
                pressed && styles.actionBtnPressed,
              ]}
              onPress={() => submitReview('accept')}
              accessibilityLabel="Принять">
              <Text style={styles.actionBtnText}>Принять</Text>
            </Pressable>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  mainColumn: {
    flex: 1,
    minHeight: 0,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 4,
    paddingVertical: 8,
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
  missing: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
    paddingHorizontal: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 10,
  },
  rewardLine: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  periodLine: {
    fontSize: 14,
    marginBottom: 20,
  },
  block: {
    marginBottom: 24,
  },
  blockHeading: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 10,
  },
  stepLine: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  studentsSectionTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  studentName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  studentStatus: {
    fontSize: 14,
    fontWeight: '600',
    maxWidth: '46%',
    textAlign: 'right',
  },
  attemptBlock: {
    marginBottom: 20,
  },
  attemptTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 8,
  },
  linkLine: {
    fontSize: 14,
    marginBottom: 8,
    textDecorationLine: 'underline',
  },
  commentLabel: {
    fontSize: 14,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 4,
  },
  bodyText: {
    fontSize: 15,
    lineHeight: 22,
  },
  commentInput: {
    borderWidth: 1,
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
    minHeight: 100,
    marginBottom: 16,
  },
  actionsRow: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 16,
  },
  actionBtn: {
    flex: 1,
    borderRadius: CTA_RADIUS,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionBtnPressed: {
    opacity: 0.88,
  },
  actionBtnText: {
    color: '#fff',
    fontSize: 15,
    fontWeight: '700',
  },
});
