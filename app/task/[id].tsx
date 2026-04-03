import CustomModal from '@/components/common/CustomModal';
import {
  getTaskBadgeColors,
  getTaskDetailBadge,
  MOCK_STUDENT_TASKS,
} from '@/components/task/mockStudentTasks';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useEffect, useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';

const INPUT_RADIUS = 16;
const CTA_RADIUS = 28;
/** Нижняя кнопка в состоянии «принята» — приглушённый лавандовый, макет Figma. */
const ACCEPTED_TASK_CTA_BG = '#C4B5E0';
/** «Ожидает проверки» — та же форма CTA, но неактивная (не насыщенный фиолетовый). */
const REVIEW_PENDING_CTA_BG = '#B8AEE0';

function buildRewardLine(task: (typeof MOCK_STUDENT_TASKS)[0]): string {
  const coins = `${task.rewardCoins} коинов`;
  const exp =
    task.rewardExp != null ? ` + ${task.rewardExp} EXP` : '';
  const tail = task.rewardLeadNote ? ` ${task.rewardLeadNote}` : '';
  return `${coins}${exp}${tail}`;
}

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [submitVisible, setSubmitVisible] = useState(false);
  const [answerDraft, setAnswerDraft] = useState('');

  const task = useMemo(() => MOCK_STUDENT_TASKS.find((t) => t.id === id), [id]);

  useEffect(() => {
    setAnswerDraft(task?.initialAnswerDraft ?? '');
  }, [task?.id, task?.initialAnswerDraft]);

  const onBack = () => router.back();

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]} edges={['top']}>
        <View style={styles.header}>
          <Pressable onPress={onBack} style={styles.headerIcon} hitSlop={8} accessibilityLabel="Назад">
            <Ionicons name="chevron-back" size={28} color={colors.text} />
          </Pressable>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Подробнее о задаче</Text>
          <View style={styles.headerIcon} />
        </View>
        <Text style={[styles.missing, { color: colors.placeholder }]}>Задача не найдена.</Text>
      </SafeAreaView>
    );
  }

  const detailBadge = getTaskDetailBadge(task);
  const badgeColors = getTaskBadgeColors(detailBadge.variant);
  const isTeacherAccepted = detailBadge.variant === 'accepted';
  const isAwaitingReview = detailBadge.variant === 'review';
  /** Поле ответа и сдача — только при статусе «Не выполнена». */
  const showAnswerField =
    detailBadge.variant === 'notCompleted' &&
    (task.filter === 'active' || task.filter === 'overdue');
  const answerOk = answerDraft.trim().length > 0;
  const canPressSubmit = showAnswerField && answerOk;

  const openSubmitModal = () => {
    if (!canPressSubmit) return;
    setSubmitVisible(true);
  };

  const handleConfirmSend = () => {
    setSubmitVisible(false);
    setAnswerDraft('');
  };

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

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 0}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <View
            style={[
              styles.statusBadge,
              { backgroundColor: badgeColors.backgroundColor },
            ]}>
            <Text style={[styles.statusBadgeText, { color: badgeColors.textColor }]}>
              {detailBadge.label}
            </Text>
          </View>

          <Text style={[styles.taskTitle, { color: colors.text }]}>{task.title}</Text>

          <Text style={[styles.rewardLine, { color: colors.text }]}>{buildRewardLine(task)}</Text>

          <Text style={[styles.periodLine, { color: colors.placeholder }]}>
            {task.periodLabel ?? `Сдать до: ${task.deadlineLabel}`}
          </Text>

          <Text style={[styles.courseLine, { color: colors.placeholder }]}>{task.courseName}</Text>

          {task.descriptionSteps && task.descriptionSteps.length > 0 ? (
            <View style={styles.block}>
              <Text style={[styles.blockHeading, { color: colors.text }]}>Описание</Text>
              {task.descriptionSteps.map((step, index) => (
                <Text
                  key={index}
                  style={[styles.stepLine, { color: colors.text }]}>
                  {index + 1}. {step}
                </Text>
              ))}
            </View>
          ) : (
            <>
              {task.description ? (
                <Text style={[styles.lead, { color: colors.text }]}>{task.description}</Text>
              ) : null}
              {task.sections.map((section) => (
                <View key={section.title} style={styles.block}>
                  <Text style={[styles.blockHeading, { color: colors.text }]}>{section.title}</Text>
                  <Text style={[styles.sectionBody, { color: colors.text }]}>{section.body}</Text>
                </View>
              ))}
            </>
          )}

          {task.teacherComment ? (
            <View style={styles.block}>
              <Text style={[styles.blockHeading, { color: colors.text }]}>
                Комментарий преподавателя:
              </Text>
              <Text style={[styles.teacherCommentBody, { color: colors.text }]}>
                {task.teacherComment}
              </Text>
            </View>
          ) : null}

          {showAnswerField ? (
            <>
              <TextInput
                value={answerDraft}
                onChangeText={setAnswerDraft}
                placeholder="Поле для ввода ответа / Ссылка на Scratch"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.answerInput,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                multiline
                textAlignVertical="top"
                autoCapitalize="sentences"
              />
              {!answerOk ? (
                <Text style={[styles.hint, { color: colors.placeholder }]}>
                  Заполните поле, чтобы отправить работу на проверку.
                </Text>
              ) : null}
            </>
          ) : task.filter === 'completed' && !isTeacherAccepted ? (
            <Text style={[styles.doneNote, { color: colors.success }]}>Задача уже выполнена.</Text>
          ) : null}
        </ScrollView>

        {showAnswerField ? (
          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(insets.bottom, 16),
                borderTopColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}>
            <TouchableOpacity
              style={[
                styles.cta,
                { backgroundColor: canPressSubmit ? colors.primary : colors.border },
              ]}
              onPress={openSubmitModal}
              disabled={!canPressSubmit}
              activeOpacity={0.9}>
              <Text style={styles.ctaText}>Отправить на проверку</Text>
            </TouchableOpacity>
          </View>
        ) : isTeacherAccepted ? (
          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(insets.bottom, 16),
                borderTopColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}>
            <TouchableOpacity
              activeOpacity={1}
              disabled
              style={[styles.cta, { backgroundColor: ACCEPTED_TASK_CTA_BG }]}
              accessibilityLabel="Задание выполнено"
              accessibilityState={{ disabled: true }}>
              <Text style={styles.ctaText}>Задание выполнено</Text>
            </TouchableOpacity>
          </View>
        ) : isAwaitingReview ? (
          <View
            style={[
              styles.footer,
              {
                paddingBottom: Math.max(insets.bottom, 16),
                borderTopColor: colors.border,
                backgroundColor: colors.background,
              },
            ]}>
            <TouchableOpacity
              activeOpacity={1}
              disabled
              style={[styles.cta, { backgroundColor: REVIEW_PENDING_CTA_BG }]}
              accessibilityLabel="Ожидает проверки"
              accessibilityState={{ disabled: true }}>
              <Text style={styles.ctaText}>Ожидает проверки</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <CustomModal
        visible={submitVisible}
        title="Отправить на проверку?"
        subtitle="Преподаватель увидит ваш ответ и сможет начислить награду после проверки."
        okButtonText="Отправить"
        isNeedCancelButton
        cancelButtonText="Отмена"
        onCancel={() => setSubmitVisible(false)}
        onRequestClose={() => setSubmitVisible(false)}
        onSuccessModalClose={handleConfirmSend}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
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
    paddingBottom: 24,
  },
  statusBadge: {
    alignSelf: 'flex-start',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 16,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 12,
  },
  rewardLine: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 8,
  },
  periodLine: {
    fontSize: 14,
    marginBottom: 6,
  },
  courseLine: {
    fontSize: 13,
    marginBottom: 22,
  },
  block: {
    marginBottom: 22,
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
  lead: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  teacherCommentBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  answerInput: {
    borderWidth: 1,
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    minHeight: 140,
    marginTop: 8,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  doneNote: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
  footer: {
    paddingHorizontal: 20,
    paddingTop: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
  },
  cta: {
    borderRadius: CTA_RADIUS,
    paddingVertical: 16,
    alignItems: 'center',
  },
  ctaText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
});
