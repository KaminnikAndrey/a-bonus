import AsyncStorage from '@react-native-async-storage/async-storage';

function storageKey(teacherId: string): string {
  const safe = String(teacherId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `mock_teacher_deleted_group_tasks_v1_${safe}`;
}

const deletedByTeacher = new Map<string, Set<string>>();

export async function hydrateMockDeletedTeacherTasks(teacherId: string): Promise<void> {
  const tid = String(teacherId || 'unknown');
  try {
    const raw = await AsyncStorage.getItem(storageKey(tid));
    const ids = raw ? (JSON.parse(raw) as string[]) : [];
    deletedByTeacher.set(tid, new Set(Array.isArray(ids) ? ids : []));
  } catch {
    deletedByTeacher.set(tid, new Set());
  }
}

export function isMockTeacherTaskDeletedSync(teacherId: string, taskId: string): boolean {
  const set = deletedByTeacher.get(String(teacherId || 'unknown'));
  return set?.has(taskId) ?? false;
}

export async function markMockTeacherTaskDeleted(
  teacherId: string,
  taskId: string
): Promise<boolean> {
  const tid = String(teacherId || 'unknown');
  await hydrateMockDeletedTeacherTasks(tid);
  const set = deletedByTeacher.get(tid) ?? new Set<string>();
  if (set.has(taskId)) return true;
  set.add(taskId);
  deletedByTeacher.set(tid, set);
  try {
    await AsyncStorage.setItem(storageKey(tid), JSON.stringify([...set]));
    return true;
  } catch {
    return false;
  }
}

export async function clearMockDeletedTeacherTasksPersisted(teacherId: string): Promise<void> {
  const tid = String(teacherId || 'unknown');
  deletedByTeacher.delete(tid);
  try {
    await AsyncStorage.removeItem(storageKey(tid));
  } catch {
    /* ignore */
  }
}

export function invalidateMockDeletedTeacherTasksCache(): void {
  deletedByTeacher.clear();
}
