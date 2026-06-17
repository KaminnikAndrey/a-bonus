import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  appendMockEnrollmentHistory,
  getPersistedMockEnrollmentEntriesSync,
  hydrateMockCoinsHistory,
  invalidateMockCoinsHistoryCache,
} from '@/services/coins/mockCoinsHistoryStore';

const TEACHER = 't-coins-1';

describe('mockCoinsHistoryStore', () => {
  beforeEach(async () => {
    invalidateMockCoinsHistoryCache();
    await AsyncStorage.clear();
  });

  it('appendMockEnrollmentHistory prepends entries', async () => {
    const ok = await appendMockEnrollmentHistory(TEACHER, [
      { studentName: 'Иванов И.', coins: 5, teacherName: 'Преподаватель' },
    ]);
    expect(ok).toBe(true);
    const entries = getPersistedMockEnrollmentEntriesSync(TEACHER);
    expect(entries).toHaveLength(1);
    expect(entries[0].student_name).toBe('Иванов И.');
    expect(entries[0].enrolled_coins).toBe(5);
  });

  it('append with empty list is no-op success', async () => {
    expect(await appendMockEnrollmentHistory(TEACHER, [])).toBe(true);
    expect(getPersistedMockEnrollmentEntriesSync(TEACHER)).toHaveLength(0);
  });

  it('hydrate restores from AsyncStorage', async () => {
    await appendMockEnrollmentHistory(TEACHER, [
      { studentName: 'A', coins: 1, teacherName: 'T' },
    ]);
    await hydrateMockCoinsHistory(TEACHER);
    expect(getPersistedMockEnrollmentEntriesSync(TEACHER)).toHaveLength(1);
  });
});
