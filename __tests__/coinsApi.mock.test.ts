import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAllCoinsHistory } from '@/services/coins/coinsApi';
import { appendMockEnrollmentHistory, invalidateMockCoinsHistoryCache } from '@/services/coins/mockCoinsHistoryStore';
import { createTestStore, seedMockTeacher } from '@/__tests__/helpers/testStore';
import { login, store } from '@/stores/auth/authStore';

describe('getAllCoinsHistory (mock teacher)', () => {
  beforeEach(async () => {
    invalidateMockCoinsHistoryCache();
    await AsyncStorage.clear();
    const ts = createTestStore();
    seedMockTeacher(ts);
    const s = ts.getState();
    store.dispatch(login({ user: s.auth.user!, creds: s.auth.creds! }));
  });

  it('включает локально добавленные зачисления', async () => {
    await appendMockEnrollmentHistory('2', [
      { studentName: 'Тестовый Ученик', coins: 99, teacherName: 'Демо' },
    ]);

    const result = await getAllCoinsHistory(0, 50, true);
    expect(result.success).toBe(true);
    const flat = result.data.flatMap((g) => g.data);
    expect(flat.some((row) => row.fullname === 'Тестовый Ученик' && row.coins === 99)).toBe(true);
  });
});
