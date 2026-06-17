import CustomModal from '@/components/common/CustomModal';
import {
  getTaskBadgeColors,
  getTaskDetailBadge,
  mergeStudentTaskWithState,
  type StudentTask,
} from '@/components/task/mockStudentTasks';
import { getStudentTaskScreenUi } from '@/components/task/studentTaskScreenUi';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { submitStudentTaskAnswerWithSync } from '@/services/studentTasks/demoTaskWorkflowBridge';
import { resolveDemoStudentId } from '@/services/studentTasks/resolveDemoStudentId';
import {
  hydrateMockStudentTaskState,
  setStudentTaskStateInMemory,
  type StudentTaskPersistedState,
} from '@/services/studentTasks/mockStudentTaskStateStore';
import { getResolvedStudentTask } from '@/services/studentTasks/studentTaskResolver';
import { userSelector } from '@/stores/auth/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
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
import { useSelector } from 'react-redux';

const INPUT_RADIUS = 16;
const CTA_RADIUS = 28;
const ACCEPTED_TASK_CTA_BG = '#C4B5E0';
const REVIEW_PENDING_CTA_BG = '#B8AEE0';

function buildRewardLine(task: StudentTask): string {
  const coins = `${task.rewardCoins} коинов`;
  const exp = task.rewardExp != null ? ` + ${task.rewardExp} EXP` : '';
  const tail = task.rewardLeadNote ? ` ${task.rewardLeadNote}` : '';
  return `${coins}${exp}${tail}`;
}

export default function TaskDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const taskId = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [submitVisible, setSubmitVisible] = useState(false);
  const [answerDraft, setAnswerDraft] = useState('');
  const [taskTick, setTaskTick] = useState(0);
  const [optimisticState, setOptimisticState] = useState<StudentTaskPersistedState | null>(null);
  const blockHydrateRef = React.useRef(false);
  const user = useSelector(userSelector);
  const studentId = resolveDemoStudentId(user);

  useFocusEffect(
    useCallback(() => {
      if (blockHydrateRef.current) return;
      let cancelled = false;
      void (async () => {
        await hydrateMockStudentTaskState(studentId);
        if (!cancelled) setTaskTick((t) => t + 1);
      })();
      return () => {
        cancelled = true;
      };
    }, [studentId])
  );

  const task = useMemo(() => {
    if (!taskId) return undefined;
    const resolved = getResolvedStudentTask(studentId, taskId);
    if (!resolved) return undefined;
    if (optimisticState) {
      return mergeStudentTaskWithState(resolved, optimisticState);
    }
    return resolved;
  }, [taskId, studentId, taskTick, optimisticState]);

  const screenUi = useMemo(() => (task ? getStudentTaskScreenUi(task) : null), [task]);

  useEffect(() => {
    if (!task || !screenUi) return;
    if (screenUi.showAnswerEditor) {
      setAnswerDraft(task.initialAnswerDraft ?? task.submittedAnswerPreview ?? '');
    } else {
      setAnswerDraft('');
    }
  }, [task?.id, task?.initialAnswerDraft, task?.submittedAnswerPreview, screenUi?.showAnswerEditor]);

  const onBack = () => router.back();

  if (!task || !screenUi) {
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
  const answerOk = answerDraft.trim().length > 0;
  const canPressSubmit = screenUi.canSubmit && screenUi.showAnswerEditor && answerOk;

  const openSubmitModal = () => {
    if (!canPressSubmit) return;
    setSubmitVisible(true);
  };

  const handleConfirmSend = () => {
    if (!taskId || !answerDraft.trim() || studentId === 'unknown') return;
    const answer = answerDraft.trim();
    const nextState: StudentTaskPersistedState = {
      statusVariant: 'review',
      filter: 'active',
      submittedAnswer: answer,
    };

    setSubmitVisible(false);
    blockHydrateRef.current = true;
    setOptimisticState(nextState);
    setStudentTaskStateInMemory(studentId, taskId, nextState);
    setTaskTick((t) => t + 1);

    void (async () => {
      try {
        await submitStudentTaskAnswerWithSync(studentId, taskId, answer);
      } finally {
        blockHydrateRef.current = false;
        setOptimisticState(null);
        setTaskTick((t) => t + 1);
      }
    })();
  };

  const footerDisabledBg =
    screenUi.footerMode === 'done' ? ACCEPTED_TASK_CTA_BG : REVIEW_PENDING_CTA_BG;

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
            style={[styles.statusBadge, { backgroundColor: badgeColors.backgroundColor }]}>
            <Text style={[styles.statusBadgeText, { color: badgeColors.textColor }]}>
              {detailBadge.label}
            </Text>
          </View>

          {screenUi.statusHint ? (
            <Text style={[styles.statusHint, { color: colors.placeholder }]}>{screenUi.statusHint}</Text>
          ) : null}

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
                <Text key={index} style={[styles.stepLine, { color: colors.text }]}>
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

          {screenUi.showTeacherComment && task.teacherComment ? (
            <View style={[styles.block, styles.teacherCommentBlock]}>
              <Text style={[styles.blockHeading, { color: colors.text }]}>
                Комментарий преподавателя
              </Text>
              <Text style={[styles.teacherCommentBody, { color: colors.text }]}>
                {task.teacherComment}
              </Text>
            </View>
          ) : null}

          {screenUi.showSubmittedAnswer && task.submittedAnswerPreview ? (
            <View style={styles.block}>
              <Text style={[styles.blockHeading, { color: colors.text }]}>Ваш ответ</Text>
              <Text style={[styles.teacherCommentBody, { color: colors.text }]}>
                {task.submittedAnswerPreview}
              </Text>
            </View>
          ) : null}

          {screenUi.showAnswerEditor ? (
            <>
              <Text style={[styles.blockHeading, { color: colors.text }]}>
                {screenUi.footerMode === 'resubmit' ? 'Исправленный ответ' : 'Ваш ответ'}
              </Text>
              <TextInput
                value={answerDraft}
                onChangeText={setAnswerDraft}
                placeholder="Текст ответа или ссылка на работу (Scratch, репозиторий…)"
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
                  Заполните поле, чтобы отправить работу.
                </Text>
              ) : null}
            </>
          ) : null}
        </ScrollView>

        {screenUi.footerMode === 'submit' || screenUi.footerMode === 'resubmit' ? (
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
              <Text style={styles.ctaText}>{screenUi.submitButtonLabel}</Text>
            </TouchableOpacity>
          </View>
        ) : screenUi.footerMode === 'done' || screenUi.footerMode === 'pending' ? (
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
              style={[styles.cta, { backgroundColor: footerDisabledBg }]}
              accessibilityLabel={screenUi.disabledFooterLabel}
              accessibilityState={{ disabled: true }}>
              <Text style={styles.ctaText}>{screenUi.disabledFooterLabel}</Text>
            </TouchableOpacity>
          </View>
        ) : null}
      </KeyboardAvoidingView>

      <CustomModal
        visible={submitVisible}
        title={screenUi.submitModalTitle}
        subtitle={screenUi.submitModalSubtitle}
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
    marginBottom: 10,
  },
  statusBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  statusHint: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 14,
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
  teacherCommentBlock: {
    backgroundColor: '#FFF9E6',
    borderRadius: 12,
    padding: 14,
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
    marginTop: 4,
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
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
