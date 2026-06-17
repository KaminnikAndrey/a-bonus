import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  applyStudentTaskTeacherReview,
  hydrateMockStudentTaskState,
  invalidateMockStudentTaskStateCache,
  submitStudentTaskAnswer,
} from '@/services/studentTasks/mockStudentTaskStateStore';
import { getResolvedStudentTask } from '@/services/studentTasks/studentTaskResolver';

const STUDENT = '1';
const TASK = 'python-not-done';

describe('mockStudentTaskStateStore', () => {
  beforeEach(async () => {
    invalidateMockStudentTaskStateCache();
    await AsyncStorage.clear();
  });

  it('submitStudentTaskAnswer → ожидает проверки', async () => {
    expect(await submitStudentTaskAnswer(STUDENT, TASK, 'Мой ответ\nhttps://link.dev')).toBe(true);
    await hydrateMockStudentTaskState(STUDENT);
    const task = getResolvedStudentTask(STUDENT, TASK);
    expect(task?.statusBadge?.variant).toBe('review');
    expect(task?.submittedAnswerPreview).toContain('Мой ответ');
  });

  it('applyStudentTaskTeacherReview accept → принята / completed', async () => {
    await submitStudentTaskAnswer(STUDENT, TASK, 'answer');
    expect(await applyStudentTaskTeacherReview(STUDENT, TASK, 'accept', 'Отлично!')).toBe(true);
    await hydrateMockStudentTaskState(STUDENT);
    const task = getResolvedStudentTask(STUDENT, TASK);
    expect(task?.statusBadge?.variant).toBe('accepted');
    expect(task?.filter).toBe('completed');
  });

  it('applyStudentTaskTeacherReview revision → на доработке', async () => {
    await submitStudentTaskAnswer(STUDENT, TASK, 'answer');
    expect(await applyStudentTaskTeacherReview(STUDENT, TASK, 'revision', 'Исправьте')).toBe(true);
    await hydrateMockStudentTaskState(STUDENT);
    const task = getResolvedStudentTask(STUDENT, TASK);
    expect(task?.statusBadge?.variant).toBe('revision');
    expect(task?.teacherComment).toBe('Исправьте');
  });
});
