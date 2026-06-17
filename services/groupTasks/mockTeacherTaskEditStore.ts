import AsyncStorage from '@react-native-async-storage/async-storage';
import type { StoredGroupTaskCard } from '@/services/groupTasks/mockCreatedTasksStore';

function storageKey(teacherId: string): string {
  const safe = String(teacherId || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
  return `mock_teacher_edited_group_tasks_v1_${safe}`;
}

export type TeacherTaskEditPatch = Partial<StoredGroupTaskCard> & {
  descriptionSteps?: string[];
};

const editsByTeacher = new Map<string, Record<string, TeacherTaskEditPatch>>();

export async function hydrateMockTeacherTaskEdits(teacherId: string): Promise<void> {
  const tid = String(teacherId || 'unknown');
  try {
    const raw = await AsyncStorage.getItem(storageKey(tid));
    const obj = raw ? (JSON.parse(raw) as Record<string, TeacherTaskEditPatch>) : {};
    editsByTeacher.set(tid, obj && typeof obj === 'object' ? obj : {});
  } catch {
    editsByTeacher.set(tid, {});
  }
}

export function getMockTeacherTaskEditSync(
  teacherId: string,
  taskId: string
): TeacherTaskEditPatch | undefined {
  return editsByTeacher.get(String(teacherId || 'unknown'))?.[taskId];
}

export async function setMockTeacherTaskEdit(
  teacherId: string,
  taskId: string,
  patch: TeacherTaskEditPatch
): Promise<boolean> {
  const tid = String(teacherId || 'unknown');
  await hydrateMockTeacherTaskEdits(tid);
  const all = { ...(editsByTeacher.get(tid) ?? {}), [taskId]: patch };
  editsByTeacher.set(tid, all);
  try {
    await AsyncStorage.setItem(storageKey(tid), JSON.stringify(all));
    return true;
  } catch {
    return false;
  }
}

export function invalidateMockTeacherTaskEditsCache(): void {
  editsByTeacher.clear();
}
