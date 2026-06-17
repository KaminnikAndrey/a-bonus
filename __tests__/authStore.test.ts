import { configureStore } from '@reduxjs/toolkit';
import { login, logout, persistedReducer, userSelector } from '@/stores/auth/authStore';

function createTestStore() {
  return configureStore({
    reducer: { auth: persistedReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

describe('authStore', () => {
  it('login stores user and creds', () => {
    const store = createTestStore();
    store.dispatch(
      login({
        user: { id: '1', role: 'student', login: 'mock-student' },
        creds: { login: 'mock-student', password: 'secret' },
      })
    );
    const state = store.getState();
    expect(userSelector(state)).toEqual({
      id: '1',
      role: 'student',
      login: 'mock-student',
    });
    expect(state.auth.creds).toEqual({ login: 'mock-student', password: 'secret' });
  });

  it('logout clears session', () => {
    const store = createTestStore();
    store.dispatch(
      login({
        user: { id: '2', role: 'teacher' },
        creds: { login: 't', password: 'p' },
      })
    );
    store.dispatch(logout());
    expect(userSelector(store.getState())).toBeNull();
    expect(store.getState().auth.creds).toBeNull();
  });
});
