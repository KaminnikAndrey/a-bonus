import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  clearMockDeletedTeacherTasksPersisted,
  hydrateMockDeletedTeacherTasks,
  invalidateMockDeletedTeacherTasksCache,
  isMockTeacherTaskDeletedSync,
  markMockTeacherTaskDeleted,
} from '@/services/groupTasks/mockDeletedTeacherTasksStore';
import {
  getMockTeacherGroupTasksMerged,
  removeMockTeacherGroupTaskById,
} from '@/services/groupTasks/mockTeacherGroupTasks';

const TEACHER = '2';
const GROUP = 'tg1';
const STATIC_TASK = 'tg1-a1';

describe('mockDeletedTeacherTasksStore', () => {
  beforeEach(async () => {
    invalidateMockDeletedTeacherTasksCache();
    await AsyncStorage.clear();
  });

  it('markMockTeacherTaskDeleted hides static task from merged list', async () => {
    const before = getMockTeacherGroupTasksMerged(GROUP, TEACHER);
    expect(before.active.some((t) => t.id === STATIC_TASK)).toBe(true);

    await markMockTeacherTaskDeleted(TEACHER, STATIC_TASK);
    const after = getMockTeacherGroupTasksMerged(GROUP, TEACHER);
    expect(after.active.some((t) => t.id === STATIC_TASK)).toBe(false);
  });

  it('removeMockTeacherGroupTaskById removes static demo task', async () => {
    const ok = await removeMockTeacherGroupTaskById(TEACHER, STATIC_TASK);
    expect(ok).toBe(true);
    expect(isMockTeacherTaskDeletedSync(TEACHER, STATIC_TASK)).toBe(true);

    invalidateMockDeletedTeacherTasksCache();
    await hydrateMockDeletedTeacherTasks(TEACHER);
    expect(isMockTeacherTaskDeletedSync(TEACHER, STATIC_TASK)).toBe(true);
  });

  it('clearMockDeletedTeacherTasksPersisted resets deleted ids', async () => {
    await markMockTeacherTaskDeleted(TEACHER, STATIC_TASK);
    await clearMockDeletedTeacherTasksPersisted(TEACHER);
    expect(isMockTeacherTaskDeletedSync(TEACHER, STATIC_TASK)).toBe(false);
  });
});
