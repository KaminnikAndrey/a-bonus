import AsyncStorage from '@react-native-async-storage/async-storage';
import { getPersistedMockEnrollmentEntriesSync } from '@/services/coins/mockCoinsHistoryStore';
import { giveCoinsToStudens } from '@/services/groups/groupsApi';
import { createTestStore, seedMockTeacher } from '@/__tests__/helpers/testStore';
import { login, store } from '@/stores/auth/authStore';

describe('giveCoinsToStudens (mock teacher)', () => {
  beforeEach(async () => {
    await AsyncStorage.clear();
    const testStore = createTestStore();
    seedMockTeacher(testStore);
    // groupsApi.mockGiveCoinsToStudents reads global `store`
    const state = testStore.getState();
    store.dispatch(
      login({
        user: state.auth.user!,
        creds: state.auth.creds!,
      })
    );
  });

  it('начисление коинов студентам пишет историю', async () => {
    const result = await giveCoinsToStudens(
      'tg1',
      [
        { id: '101', fullname: 'Величко Алиса', coins: '10' },
        { id: '102', fullname: 'Поляков Артём', coins: '3' },
      ],
      true
    );
    expect(result.success).toBe(true);
    const history = getPersistedMockEnrollmentEntriesSync('2');
    expect(history.length).toBeGreaterThanOrEqual(2);
    expect(history.some((e) => e.student_name === 'Величко Алиса' && e.enrolled_coins === 10)).toBe(
      true
    );
  });

  it('ошибка если коины не указаны', async () => {
    const result = await giveCoinsToStudens(
      'tg1',
      [{ id: '101', fullname: 'Test', coins: '0' }],
      true
    );
    expect(result.success).toBe(false);
    expect(result.error).toMatch(/коинов/i);
  });
});
