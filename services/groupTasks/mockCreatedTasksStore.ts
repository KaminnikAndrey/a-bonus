import AsyncStorage from '@react-native-async-storage/async-storage';

const LEGACY_STORAGE_KEY = 'mock_teacher_created_group_tasks_v1';

function storageKey(teacherId: string): string {
  const safe = String(teacherId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `mock_teacher_created_group_tasks_v2_${safe}`;
}

/** Совпадает с TeacherGroupTaskCard в mockTeacherGroupTasks (без импорта — избегаем цикла). */
export type StoredGroupTaskCard = {
  id: string;
  dateFrom: string;
  dateTo: string;
  title: string;
  reward: string;
};

export type CreatedTaskRow = {
  groupId: string;
  card: StoredGroupTaskCard;
};

const rowsByTeacher = new Map<string, CreatedTaskRow[]>();

/**
 * Подгружает задачи преподавателя из AsyncStorage в память (ключ зависит от `teacherId`).
 */
export async function hydrateMockCreatedTasks(teacherId: string): Promise<void> {
  const tid = String(teacherId || 'unknown');
  const key = storageKey(tid);
  try {
    let raw = await AsyncStorage.getItem(key);
    if (!raw && tid !== 'unknown') {
      const legacy = await AsyncStorage.getItem(LEGACY_STORAGE_KEY);
      if (legacy) {
        raw = legacy;
        await AsyncStorage.setItem(key, legacy);
      }
    }
    const list = raw ? (JSON.parse(raw) as CreatedTaskRow[]) : [];
    rowsByTeacher.set(tid, Array.isArray(list) ? list : []);
  } catch {
    rowsByTeacher.set(tid, []);
  }
}

export function getCreatedTasksForGroupSync(teacherId: string, groupId: string): StoredGroupTaskCard[] {
  const rows = rowsByTeacher.get(String(teacherId || 'unknown')) ?? [];
  return rows.filter((r) => r.groupId === groupId).map((r) => r.card);
}

export function findCreatedTaskCardById(teacherId: string, taskId: string): StoredGroupTaskCard | undefined {
  const rows = rowsByTeacher.get(String(teacherId || 'unknown')) ?? [];
  return rows.find((r) => r.card.id === taskId)?.card;
}

export function findCreatedTaskGroupId(teacherId: string, taskId: string): string | undefined {
  const rows = rowsByTeacher.get(String(teacherId || 'unknown')) ?? [];
  return rows.find((r) => r.card.id === taskId)?.groupId;
}

/**
 * Добавляет задачи и пытается сохранить на диск.
 * @returns true если запись в AsyncStorage прошла успешно
 */
/**
 * Удаляет задачу, созданную преподавателем на экране «Создать задачу».
 * Статические моки из `mockTeacherGroupTasks` не хранятся здесь — вернёт `false`.
 */
export async function updateMockCreatedTaskById(
  teacherId: string,
  taskId: string,
  patch: Partial<StoredGroupTaskCard>
): Promise<boolean> {
  const tid = String(teacherId || 'unknown');
  await hydrateMockCreatedTasks(tid);
  const cur = rowsByTeacher.get(tid) ?? [];
  const idx = cur.findIndex((r) => r.card.id === taskId);
  if (idx < 0) return false;
  const next = [...cur];
  next[idx] = { ...next[idx], card: { ...next[idx].card, ...patch } };
  rowsByTeacher.set(tid, next);
  try {
    await AsyncStorage.setItem(storageKey(tid), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export async function removeMockCreatedTaskById(
  teacherId: string,
  taskId: string
): Promise<boolean> {
  const tid = String(teacherId || 'unknown');
  await hydrateMockCreatedTasks(tid);
  const cur = rowsByTeacher.get(tid) ?? [];
  const next = cur.filter((r) => r.card.id !== taskId);
  if (next.length === cur.length) return false;
  rowsByTeacher.set(tid, next);
  try {
    await AsyncStorage.setItem(storageKey(tid), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

export async function appendMockCreatedTasks(
  teacherId: string,
  entries: CreatedTaskRow[]
): Promise<boolean> {
  const tid = String(teacherId || 'unknown');
  await hydrateMockCreatedTasks(tid);
  const cur = rowsByTeacher.get(tid) ?? [];
  const next = [...cur, ...entries];
  rowsByTeacher.set(tid, next);
  try {
    await AsyncStorage.setItem(storageKey(tid), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}

/** Сброс: память + ключ в хранилище для одного преподавателя. */
export async function clearMockCreatedTasksPersisted(teacherId: string): Promise<void> {
  const tid = String(teacherId || 'unknown');
  rowsByTeacher.delete(tid);
  try {
    await AsyncStorage.removeItem(storageKey(tid));
  } catch {
    /* ignore */
  }
}

export function invalidateMockCreatedTasksCache(): void {
  rowsByTeacher.clear();
}
