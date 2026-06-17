import { configureStore } from '@reduxjs/toolkit';
import { login, persistedReducer } from '@/stores/auth/authStore';

export function createTestStore() {
  return configureStore({
    reducer: { auth: persistedReducer },
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware({ serializableCheck: false }),
  });
}

export function seedMockStudent(store: ReturnType<typeof createTestStore>) {
  store.dispatch(
    login({
      user: { id: '1', role: 'student', login: 'mock-student' },
      creds: { login: 'mock-student', password: 'demo' },
    })
  );
}

export function seedMockTeacher(store: ReturnType<typeof createTestStore>) {
  store.dispatch(
    login({
      user: { id: '2', role: 'teacher', login: 'mock-teacher' },
      creds: { login: 'mock-teacher', password: 'demo' },
    })
  );
}
