import { DEMO_STUDENT_USER_ID } from '@/services/studentTasks/demoTaskWorkflowBridge';

/** Стабильный id ученика в демо (даже если persist ещё не подставил user.id). */
export function resolveDemoStudentId(
  user: { id?: string | null; login?: string | null } | null | undefined
): string {
  const id = user?.id != null ? String(user.id).trim() : '';
  if (id) return id;
  const login = String(user?.login ?? '').trim().toLowerCase();
  if (login === 'mock-student') return DEMO_STUDENT_USER_ID;
  return 'unknown';
}
