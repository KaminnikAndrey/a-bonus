import DeleteTaskConfirmModal from '@/components/groupTasks/DeleteTaskConfirmModal';
import StudentStatusPickerModal from '@/components/groupTasks/StudentStatusPickerModal';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import {
  getMockTeacherGroupTaskDetail,
  getTeacherTaskStudentStatusLabel,
  TEACHER_TASK_STATUS_TEXT_COLOR,
  type TeacherTaskDetailStudent,
  type TeacherTaskStudentStatusKind,
} from '@/services/groupTasks/mockTeacherGroupTaskDetail';
import { hydrateMockCreatedTasks } from '@/services/groupTasks/mockCreatedTasksStore';
import { hydrateMockDeletedTeacherTasks } from '@/services/groupTasks/mockDeletedTeacherTasksStore';
import { hydrateMockTeacherTaskEdits } from '@/services/groupTasks/mockTeacherTaskEditStore';
import { removeMockTeacherGroupTaskById } from '@/services/groupTasks/mockTeacherGroupTasks';
import {
  hydrateMockTeacherTaskReviews,
  setTeacherStudentTaskStatus,
} from '@/services/groupTasks/mockTeacherTaskReviewStore';
import { userSelector } from '@/stores/auth/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import type { Href } from 'expo-router';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const CTA_PURPLE = '#6766AA';
const STUDENT_ROW_BG = '#ECECEF';
const CTA_RADIUS = 14;

function formatShortRu(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(y).slice(-2)}`;
}

export default function TeacherGroupTaskDetailScreen() {
  const { id: idParam } = useLocalSearchParams<{ id: string }>();
  const id = Array.isArray(idParam) ? idParam[0] : idParam;
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useSelector(userSelector);
  const teacherId =
    user?.id != null && String(user.id).trim() !== '' ? String(user.id) : 'unknown';

  const [detailTick, setDetailTick] = useState(0);
  /** Локальные статусы — сразу обновляют UI, не зависят от гонки hydrate при закрытии модалки. */
  const [statusByStudentId, setStatusByStudentId] = useState<
    Record<string, TeacherTaskStudentStatusKind>
  >({});

  useEffect(() => {
    setStatusByStudentId({});
  }, [id, teacherId]);

  const reloadFromStore = useCallback(async () => {
    await hydrateMockCreatedTasks(teacherId);
    await hydrateMockDeletedTeacherTasks(teacherId);
    await hydrateMockTeacherTaskEdits(teacherId);
    await hydrateMockTeacherTaskReviews(teacherId);
    setDetailTick((t) => t + 1);
  }, [teacherId]);

  useFocusEffect(
    useCallback(() => {
      void reloadFromStore();
    }, [reloadFromStore])
  );

  const detail = useMemo(() => {
    void detailTick;
    return getMockTeacherGroupTaskDetail(id, teacherId);
  }, [id, teacherId, detailTick]);

  const studentsForList = useMemo(() => {
    if (!detail) return [];
    return detail.students.map((s) => ({
      ...s,
      status: statusByStudentId[s.id] ?? s.status,
    }));
  }, [detail, statusByStudentId]);

  useEffect(() => {
    if (!detail) return;
    setStatusByStudentId((prev) => {
      let changed = false;
      const next = { ...prev };
      for (const s of detail.students) {
        if (next[s.id] === undefined) {
          next[s.id] = s.status;
          changed = true;
        }
      }
      return changed ? next : prev;
    });
  }, [detail]);
  const [deleteModalVisible, setDeleteModalVisible] = useState(false);
  const [statusPickerStudent, setStatusPickerStudent] = useState<TeacherTaskDetailStudent | null>(
    null
  );
  const statusPickerStudentRef = useRef<TeacherTaskDetailStudent | null>(null);
  const onBack = () => router.back();

  const handleConfirmDelete = () => {
    setDeleteModalVisible(false);
    void (async () => {
      if (id) {
        await removeMockTeacherGroupTaskById(teacherId, id);
      }
      router.back();
    })();
  };

  const dateRange = detail
    ? `${formatShortRu(detail.dateFrom)} - ${formatShortRu(detail.dateTo)}`
    : '';

  const openStudentReview = (studentId: string) => {
    if (!id) return;
    const q = new URLSearchParams({ taskId: id, studentId });
    router.push(`/groupTask/student-check?${q.toString()}` as Href);
  };

  const openEdit = () => {
    if (!id) return;
    router.push({ pathname: '/groupTask/create', params: { taskId: id } } as Href);
  };

  const openStatusPicker = (student: TeacherTaskDetailStudent) => {
    statusPickerStudentRef.current = student;
    setStatusPickerStudent(student);
  };

  const closeStatusPicker = () => {
    statusPickerStudentRef.current = null;
    setStatusPickerStudent(null);
  };

  const handleSelectStatus = (status: TeacherTaskDetailStudent['status']) => {
    const student = statusPickerStudentRef.current;
    if (!id || !student) return;
    setStatusByStudentId((prev) => ({ ...prev, [student.id]: status }));
    closeStatusPicker();
    void (async () => {
      await setTeacherStudentTaskStatus(teacherId, id, student.id, status);
      setDetailTick((t) => t + 1);
    })();
  };

  const handleOpenReviewFromPicker = () => {
    const student = statusPickerStudentRef.current;
    if (!student) return;
    const studentId = student.id;
    closeStatusPicker();
    openStudentReview(studentId);
  };

  if (!detail) {
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
        <Text style={[styles.missing, { color: colors.placeholder }]}>Задача не найдена.</Text>
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
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="always"
          nestedScrollEnabled>
          <Text style={[styles.taskTitle, { color: colors.text }]}>{detail.title}</Text>
          <Text style={[styles.groupLine, { color: colors.primary }]}>{detail.groupName}</Text>
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
          <Text style={[styles.studentsHint, { color: colors.placeholder }]}>
            Нажмите на ученика, чтобы изменить статус
          </Text>
          {studentsForList.map((s) => (
            <TouchableOpacity
              key={s.id}
              activeOpacity={0.88}
              onPress={() => openStatusPicker(s)}
              style={[styles.studentRow, { backgroundColor: STUDENT_ROW_BG }]}
              accessibilityLabel={`${s.fullName}, ${getTeacherTaskStudentStatusLabel(s.status)}, изменить статус`}
              accessibilityRole="button">
              <Text style={[styles.studentName, { color: colors.text }]} numberOfLines={1}>
                {s.fullName}
              </Text>
              <View style={styles.studentStatusWrap}>
                <Text
                  style={[styles.studentStatus, { color: TEACHER_TASK_STATUS_TEXT_COLOR[s.status] }]}
                  numberOfLines={1}>
                  {getTeacherTaskStudentStatusLabel(s.status)}
                </Text>
                <Ionicons name="chevron-down" size={16} color={colors.placeholder} />
              </View>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <View
          style={[
            styles.footer,
            {
              paddingBottom: Math.max(insets.bottom, 16),
              borderTopColor: colors.border,
              backgroundColor: colors.background,
            },
          ]}>
          <Pressable
            style={({ pressed }) => [
              styles.footerBtn,
              { backgroundColor: CTA_PURPLE },
              pressed && styles.footerBtnPressed,
            ]}
            onPress={openEdit}
            hitSlop={8}
            accessibilityLabel="Изменить задачу">
            <Text style={styles.footerBtnText}>Изменить</Text>
          </Pressable>
          <Pressable
            style={({ pressed }) => [
              styles.footerBtn,
              { backgroundColor: CTA_PURPLE },
              pressed && styles.footerBtnPressed,
            ]}
            onPress={() => setDeleteModalVisible(true)}
            hitSlop={8}
            accessibilityLabel="Удалить задачу">
            <Text style={styles.footerBtnText}>Удалить</Text>
          </Pressable>
        </View>
      </View>

      <DeleteTaskConfirmModal
        visible={deleteModalVisible}
        onCancel={() => setDeleteModalVisible(false)}
        onConfirm={handleConfirmDelete}
      />

      <StudentStatusPickerModal
        visible={statusPickerStudent != null}
        studentName={statusPickerStudent?.fullName ?? ''}
        currentStatus={statusPickerStudent?.status ?? 'not_completed'}
        onCancel={closeStatusPicker}
        onSelect={handleSelectStatus}
        onOpenReview={
          statusPickerStudent?.status === 'awaiting_review' ? handleOpenReviewFromPicker : undefined
        }
      />
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
    paddingBottom: 24,
  },
  taskTitle: {
    fontSize: 22,
    fontWeight: '800',
    lineHeight: 28,
    marginBottom: 6,
  },
  groupLine: {
    fontSize: 15,
    fontWeight: '600',
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
    marginBottom: 6,
  },
  studentsHint: {
    fontSize: 13,
    marginBottom: 12,
  },
  studentRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 12,
    marginBottom: 10,
    gap: 12,
  },
  studentName: {
    flex: 1,
    fontSize: 15,
    fontWeight: '500',
  },
  studentStatusWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    maxWidth: '52%',
  },
  studentStatus: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'right',
    flexShrink: 1,
  },
  footer: {
    flexDirection: 'row',
    paddingHorizontal: 16,
    paddingTop: 12,
    gap: 12,
    borderTopWidth: StyleSheet.hairlineWidth,
    flexShrink: 0,
  },
  footerBtn: {
    flex: 1,
    borderRadius: CTA_RADIUS,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  footerBtnPressed: {
    opacity: 0.88,
  },
  footerBtnText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
});
