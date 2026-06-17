import AsyncStorage from '@react-native-async-storage/async-storage';
import { getMockTeacherGroupTaskDetail } from '@/services/groupTasks/mockTeacherGroupTaskDetail';
import {
  applyTeacherTaskReview,
  hydrateMockTeacherTaskReviews,
  invalidateMockTeacherTaskReviewCache,
  setTeacherStudentTaskStatus,
} from '@/services/groupTasks/mockTeacherTaskReviewStore';

const TEACHER = '2';
const TASK = 'tg1-a2';
const STUDENT = '105';

describe('mockTeacherTaskReviewStore', () => {
  beforeEach(async () => {
    invalidateMockTeacherTaskReviewCache();
    await AsyncStorage.clear();
  });

  it('applyTeacherTaskReview accept обновляет статус в detail', async () => {
    await applyTeacherTaskReview(TEACHER, TASK, STUDENT, 'accept');
    await hydrateMockTeacherTaskReviews(TEACHER);
    const detail = getMockTeacherGroupTaskDetail(TASK, TEACHER);
    const s = detail?.students.find((x) => x.id === STUDENT);
    expect(s?.status).toBe('accepted');
  });

  it('hydrate does not wipe in-memory status saved before await completes', async () => {
    const getItem = AsyncStorage.getItem as jest.Mock;
    getItem.mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(null), 20);
        })
    );
    void setTeacherStudentTaskStatus(TEACHER, TASK, STUDENT, 'revision');
    await new Promise((r) => setTimeout(r, 0));
    await hydrateMockTeacherTaskReviews(TEACHER);
    const detail = getMockTeacherGroupTaskDetail(TASK, TEACHER);
    expect(detail?.students.find((x) => x.id === STUDENT)?.status).toBe('revision');
    getItem.mockReset();
  });

  it('setTeacherStudentTaskStatus sets not_completed', async () => {
    await setTeacherStudentTaskStatus(TEACHER, TASK, STUDENT, 'not_completed');
    await hydrateMockTeacherTaskReviews(TEACHER);
    const detail = getMockTeacherGroupTaskDetail(TASK, TEACHER);
    expect(detail?.students.find((x) => x.id === STUDENT)?.status).toBe('not_completed');
  });

  it('applyTeacherTaskReview revision', async () => {
    await applyTeacherTaskReview(TEACHER, TASK, STUDENT, 'revision', 'Переделайте шаг 3');
    await hydrateMockTeacherTaskReviews(TEACHER);
    const detail = getMockTeacherGroupTaskDetail(TASK, TEACHER);
    expect(detail?.students.find((x) => x.id === STUDENT)?.status).toBe('revision');
  });
});
