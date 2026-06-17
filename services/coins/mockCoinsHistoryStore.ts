import AsyncStorage from '@react-native-async-storage/async-storage';
import type { EnrollmentHistoryDTO } from '@/services/types';

function storageKey(teacherId: string): string {
  const safe = String(teacherId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `mock_teacher_coins_history_v1_${safe}`;
}

const entriesByTeacher = new Map<string, EnrollmentHistoryDTO[]>();

/**
 * Загружает из AsyncStorage записи зачислений, сделанные в демо (экран «Группы»).
 */
export async function hydrateMockCoinsHistory(teacherId: string): Promise<void> {
  const tid = String(teacherId || 'unknown');
  try {
    const raw = await AsyncStorage.getItem(storageKey(tid));
    const list = raw ? (JSON.parse(raw) as EnrollmentHistoryDTO[]) : [];
    entriesByTeacher.set(tid, Array.isArray(list) ? list : []);
  } catch {
    entriesByTeacher.set(tid, []);
  }
}

export function getPersistedMockEnrollmentEntriesSync(teacherId: string): EnrollmentHistoryDTO[] {
  return entriesByTeacher.get(String(teacherId || 'unknown')) ?? [];
}

/** Сброс in-memory кэша (тесты). */
export function invalidateMockCoinsHistoryCache(): void {
  entriesByTeacher.clear();
}

/**
 * Добавляет операции зачисления (после подтверждения на экране «Группы»).
 * Новые записи идут в начало списка (самые свежие сверху при сортировке по дате).
 */
export async function appendMockEnrollmentHistory(
  teacherId: string,
  items: { studentName: string; coins: number; teacherName: string }[]
): Promise<boolean> {
  const tid = String(teacherId || 'unknown');
  if (items.length === 0) return true;
  await hydrateMockCoinsHistory(tid);
  const iso = new Date().toISOString();
  const batch: EnrollmentHistoryDTO[] = items.map((it) => ({
    teacher_name: it.teacherName,
    student_name: it.studentName,
    enrolled_coins: it.coins,
    date: iso,
  }));
  const prev = entriesByTeacher.get(tid) ?? [];
  const next = [...batch, ...prev];
  entriesByTeacher.set(tid, next);
  try {
    await AsyncStorage.setItem(storageKey(tid), JSON.stringify(next));
    return true;
  } catch {
    return false;
  }
}
