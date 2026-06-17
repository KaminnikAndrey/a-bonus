import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appendMockCreatedTasks,
  getCreatedTasksForGroupSync,
  invalidateMockCreatedTasksCache,
} from '@/services/groupTasks/mockCreatedTasksStore';
import {
  buildTaskRewardLine,
  parseDdMmYyToIso,
  todayIsoLocal,
} from '@/services/groupTasks/createTaskFormUtils';

/** Логика экрана groupTask/create (onSubmit) без UI. */
async function createTaskLikeScreen(opts: {
  teacherId: string;
  title: string;
  groupIds: string[];
  coins: string;
  expLead: string;
  dateStart: string;
  dateEnd: string;
}) {
  const dateFromIso = parseDdMmYyToIso(opts.dateStart) ?? todayIsoLocal();
  let dateToIso = parseDdMmYyToIso(opts.dateEnd) ?? dateFromIso;
  if (dateToIso < dateFromIso) dateToIso = dateFromIso;

  const baseId = `created-${Date.now()}`;
  const reward = buildTaskRewardLine(opts.coins, opts.expLead);
  const entries = opts.groupIds.map((groupId) => ({
    groupId,
    card: {
      id: `${baseId}-${groupId}`,
      dateFrom: dateFromIso,
      dateTo: dateToIso,
      title: opts.title.trim(),
      reward,
    },
  }));

  return appendMockCreatedTasks(opts.teacherId, entries);
}

describe('create group task flow (mock-teacher)', () => {
  const TEACHER = '2';

  beforeEach(async () => {
    invalidateMockCreatedTasksCache();
    await AsyncStorage.clear();
  });

  it('создание задачи в двух группах', async () => {
    const ok = await createTaskLikeScreen({
      teacherId: TEACHER,
      title: 'Домашка по Python',
      groupIds: ['tg1', 'tg2'],
      coins: '10',
      expLead: '3',
      dateStart: '01.04.26',
      dateEnd: '10.04.26',
    });
    expect(ok).toBe(true);
    expect(getCreatedTasksForGroupSync(TEACHER, 'tg1')[0].title).toBe('Домашка по Python');
    expect(getCreatedTasksForGroupSync(TEACHER, 'tg2')[0].reward).toContain('EXP');
  });
});
