import { getProfileInfo, getAlgocoins } from '@/services/profile/profileApi';
import { createTestStore, seedMockStudent, seedMockTeacher } from '@/__tests__/helpers/testStore';
import { login, store } from '@/stores/auth/authStore';

function syncStore(testStore: ReturnType<typeof createTestStore>) {
  const s = testStore.getState();
  store.dispatch(login({ user: s.auth.user!, creds: s.auth.creds! }));
}

describe('profileApi (mock-student / mock-teacher)', () => {
  it('mock-student profile and algocoins', async () => {
    const ts = createTestStore();
    seedMockStudent(ts);
    syncStore(ts);

    const profile = await getProfileInfo();
    expect(profile.success).toBe(true);
    expect(profile.data?.login).toBe('mock-student');
    expect(profile.data?.algocoins).toBe(1250);
    expect(profile.data?.experiencePoints).toBe(450);

    const coins = await getAlgocoins();
    expect(coins.success).toBe(true);
    expect(coins.data).toBe(1250);
  });

  it('mock-teacher profile', async () => {
    const ts = createTestStore();
    seedMockTeacher(ts);
    syncStore(ts);

    const profile = await getProfileInfo();
    expect(profile.success).toBe(true);
    expect(profile.data?.login).toBe('mock-teacher');
    expect(profile.data?.algocoins).toBe(0);
  });
});
