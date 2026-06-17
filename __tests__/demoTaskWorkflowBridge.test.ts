import AsyncStorage from '@react-native-async-storage/async-storage';
import { getTeacherStudentStatusOverrideSync } from '@/services/groupTasks/mockTeacherTaskReviewStore';
import { invalidateMockTeacherTaskReviewCache } from '@/services/groupTasks/mockTeacherTaskReviewStore';
import {
  DEMO_STUDENT_USER_ID,
  DEMO_TEACHER_USER_ID,
  submitStudentTaskAnswerWithSync,
  syncStudentAfterTeacherReview,
} from '@/services/studentTasks/demoTaskWorkflowBridge';
import {
  getStudentTaskStateSync,
  hydrateMockStudentTaskState,
  invalidateMockStudentTaskStateCache,
} from '@/services/studentTasks/mockStudentTaskStateStore';
import { getResolvedStudentTask } from '@/services/studentTasks/studentTaskResolver';

const TASK = 'python-not-done';
const TEACHER_TASK = 'tg1-a2';
const GROUP_STUDENT = '105';

describe('demoTaskWorkflowBridge', () => {
  beforeEach(async () => {
    invalidateMockStudentTaskStateCache();
    invalidateMockTeacherTaskReviewCache();
    await AsyncStorage.clear();
  });

  it('submit from notCompleted → student review + teacher awaiting_review', async () => {
    expect(
      await submitStudentTaskAnswerWithSync(DEMO_STUDENT_USER_ID, TASK, 'Мой ответ\nhttps://example.com')
    ).toBe(true);

    await hydrateMockStudentTaskState(DEMO_STUDENT_USER_ID);
    const task = getResolvedStudentTask(DEMO_STUDENT_USER_ID, TASK);
    expect(task?.statusBadge?.variant).toBe('review');
    expect(task?.submittedAnswerPreview).toContain('Мой ответ');

    expect(
      getTeacherStudentStatusOverrideSync(DEMO_TEACHER_USER_ID, TEACHER_TASK, GROUP_STUDENT)
    ).toBe('awaiting_review');
  });

  it('teacher revision → student revision with comment', async () => {
    await submitStudentTaskAnswerWithSync(DEMO_STUDENT_USER_ID, TASK, 'answer');
    await syncStudentAfterTeacherReview(
      DEMO_TEACHER_USER_ID,
      TEACHER_TASK,
      GROUP_STUDENT,
      'revision',
      'Исправьте шаг 2'
    );

    await hydrateMockStudentTaskState(DEMO_STUDENT_USER_ID);
    const task = getResolvedStudentTask(DEMO_STUDENT_USER_ID, TASK);
    expect(task?.statusBadge?.variant).toBe('revision');
    expect(task?.teacherComment).toBe('Исправьте шаг 2');
    expect(getStudentTaskStateSync(DEMO_STUDENT_USER_ID, TASK)?.statusVariant).toBe('revision');
  });
});
