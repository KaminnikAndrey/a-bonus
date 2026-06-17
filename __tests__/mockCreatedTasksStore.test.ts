import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appendMockCreatedTasks,
  clearMockCreatedTasksPersisted,
  findCreatedTaskCardById,
  getCreatedTasksForGroupSync,
  hydrateMockCreatedTasks,
  invalidateMockCreatedTasksCache,
  removeMockCreatedTaskById,
  updateMockCreatedTaskById,
  type CreatedTaskRow,
} from '@/services/groupTasks/mockCreatedTasksStore';
import { getMockTeacherGroupTasksMerged, updateMockTeacherGroupTask } from '@/services/groupTasks/mockTeacherGroupTasks';
import { invalidateMockTeacherTaskEditsCache } from '@/services/groupTasks/mockTeacherTaskEditStore';
import { getMockTeacherGroupTaskDetail } from '@/services/groupTasks/mockTeacherGroupTaskDetail';

const TEACHER = 'teacher-test-1';
const GROUP = 'tg1';

const sampleEntry = (): CreatedTaskRow => ({
  groupId: GROUP,
  card: {
    id: 'created-task-1',
    dateFrom: '2026-04-01',
    dateTo: '2026-04-10',
    title: 'Тестовая задача',
    reward: '5 коинов',
  },
});

describe('mockCreatedTasksStore CRUD', () => {
  beforeEach(async () => {
    invalidateMockCreatedTasksCache();
    invalidateMockTeacherTaskEditsCache();
    await AsyncStorage.clear();
  });

  it('append + hydrate + read by group', async () => {
    const ok = await appendMockCreatedTasks(TEACHER, [sampleEntry()]);
    expect(ok).toBe(true);

    invalidateMockCreatedTasksCache();
    await hydrateMockCreatedTasks(TEACHER);

    const cards = getCreatedTasksForGroupSync(TEACHER, GROUP);
    expect(cards).toHaveLength(1);
    expect(cards[0].title).toBe('Тестовая задача');
  });

  it('findCreatedTaskCardById', async () => {
    await appendMockCreatedTasks(TEACHER, [sampleEntry()]);
    const card = findCreatedTaskCardById(TEACHER, 'created-task-1');
    expect(card?.reward).toBe('5 коинов');
  });

  it('removeMockCreatedTaskById deletes persisted task', async () => {
    await appendMockCreatedTasks(TEACHER, [sampleEntry()]);
    const removed = await removeMockCreatedTaskById(TEACHER, 'created-task-1');
    expect(removed).toBe(true);
    expect(getCreatedTasksForGroupSync(TEACHER, GROUP)).toHaveLength(0);
  });

  it('removeMockCreatedTaskById returns false for unknown id', async () => {
    await appendMockCreatedTasks(TEACHER, [sampleEntry()]);
    const removed = await removeMockCreatedTaskById(TEACHER, 'no-such-task');
    expect(removed).toBe(false);
    expect(getCreatedTasksForGroupSync(TEACHER, GROUP)).toHaveLength(1);
  });

  it('clearMockCreatedTasksPersisted wipes storage', async () => {
    await appendMockCreatedTasks(TEACHER, [sampleEntry()]);
    await clearMockCreatedTasksPersisted(TEACHER);
    await hydrateMockCreatedTasks(TEACHER);
    expect(getCreatedTasksForGroupSync(TEACHER, GROUP)).toHaveLength(0);
  });

  it('updateMockCreatedTaskById updates title', async () => {
    await appendMockCreatedTasks(TEACHER, [sampleEntry()]);
    const ok = await updateMockCreatedTaskById(TEACHER, 'created-task-1', { title: 'Новое название' });
    expect(ok).toBe(true);
    expect(findCreatedTaskCardById(TEACHER, 'created-task-1')?.title).toBe('Новое название');
  });

  it('updateMockTeacherGroupTask edits static demo task', async () => {
    const ok = await updateMockTeacherGroupTask(TEACHER, 'tg1-a1', {
      title: 'Обновлённая Scratch',
      reward: '10 коинов',
      dateFrom: '2026-05-01',
      dateTo: '2026-05-10',
      descriptionSteps: ['Шаг 1', 'Шаг 2'],
    });
    expect(ok).toBe(true);
    const detail = getMockTeacherGroupTaskDetail('tg1-a1', TEACHER);
    expect(detail?.title).toBe('Обновлённая Scratch');
    expect(detail?.descriptionSteps).toEqual(['Шаг 1', 'Шаг 2']);
  });

  it('merged list includes created tasks at the top of active', async () => {
    await appendMockCreatedTasks(TEACHER, [sampleEntry()]);
    const merged = getMockTeacherGroupTasksMerged(GROUP, TEACHER);
    expect(merged.active[0]?.id).toBe('created-task-1');
  });
});
