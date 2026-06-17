import type { TaskStatusBadgeVariant, TaskTabFilter } from '@/components/task/mockStudentTasks';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type StudentTaskPersistedState = {
  statusVariant: TaskStatusBadgeVariant;
  filter?: TaskTabFilter;
  submittedAnswer: string;
  teacherComment?: string;
};

const byStudent = new Map<string, Record<string, StudentTaskPersistedState>>();

function safeId(id: string): string {
  return String(id || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function storageKey(studentId: string): string {
  return `mock_student_task_state_v1_${safeId(studentId)}`;
}

export async function hydrateMockStudentTaskState(studentId: string): Promise<void> {
  const sid = safeId(studentId);
  try {
    const raw = await AsyncStorage.getItem(storageKey(sid));
    const fromDisk = raw ? (JSON.parse(raw) as Record<string, StudentTaskPersistedState>) : {};
    const parsed = fromDisk && typeof fromDisk === 'object' ? fromDisk : {};
    const inMemory = byStudent.get(sid) ?? {};
    byStudent.set(sid, { ...parsed, ...inMemory });
  } catch {
    byStudent.set(sid, byStudent.get(sid) ?? {});
  }
}

export function getStudentTaskStateSync(
  studentId: string,
  taskId: string
): StudentTaskPersistedState | undefined {
  return byStudent.get(safeId(studentId))?.[taskId];
}

async function persist(studentId: string): Promise<boolean> {
  const sid = safeId(studentId);
  const data = byStudent.get(sid) ?? {};
  try {
    await AsyncStorage.setItem(storageKey(sid), JSON.stringify(data));
    return true;
  } catch {
    return false;
  }
}

async function writeState(
  studentId: string,
  taskId: string,
  entry: StudentTaskPersistedState
): Promise<boolean> {
  const sid = safeId(studentId);
  const cur = { ...(byStudent.get(sid) ?? {}) };
  cur[taskId] = entry;
  byStudent.set(sid, cur);
  return persist(studentId);
}

/** Сразу в память (до persist) — для мгновенного UI. */
export function setStudentTaskStateInMemory(
  studentId: string,
  taskId: string,
  entry: StudentTaskPersistedState
): void {
  const sid = safeId(studentId);
  const cur = { ...(byStudent.get(sid) ?? {}) };
  cur[taskId] = entry;
  byStudent.set(sid, cur);
}

/** Сдача ответа: «Не выполнена» / «На доработке» → «Ожидает проверки». */
export async function submitStudentTaskAnswer(
  studentId: string,
  taskId: string,
  answer: string
): Promise<boolean> {
  const text = answer.trim();
  if (!text) return false;

  return writeState(studentId, taskId, {
    statusVariant: 'review',
    filter: 'active',
    submittedAnswer: text,
    teacherComment: undefined,
  });
}

export type StudentTaskStatusDirectPatch = {
  statusVariant: TaskStatusBadgeVariant;
  filter?: TaskTabFilter;
  submittedAnswer?: string;
  teacherComment?: string;
  preserveSubmittedAnswer?: boolean;
};

/** Прямая установка статуса (синхронизация с преподавателем). */
export async function applyStudentTaskStatusDirect(
  studentId: string,
  taskId: string,
  patch: StudentTaskStatusDirectPatch
): Promise<boolean> {
  if (!byStudent.has(safeId(studentId))) {
    await hydrateMockStudentTaskState(studentId);
  }
  const prev = byStudent.get(safeId(studentId))?.[taskId];
  const submittedAnswer = patch.preserveSubmittedAnswer
    ? patch.submittedAnswer ?? prev?.submittedAnswer ?? ''
    : patch.submittedAnswer ?? prev?.submittedAnswer ?? '';

  return writeState(studentId, taskId, {
    statusVariant: patch.statusVariant,
    filter: patch.filter ?? (patch.statusVariant === 'accepted' ? 'completed' : 'active'),
    submittedAnswer,
    teacherComment: patch.teacherComment,
  });
}

/** Проверка преподавателем: принять или отправить на доработку. */
export async function applyStudentTaskTeacherReview(
  studentId: string,
  taskId: string,
  action: 'accept' | 'revision',
  teacherComment?: string
): Promise<boolean> {
  if (!byStudent.has(safeId(studentId))) {
    await hydrateMockStudentTaskState(studentId);
  }
  const prev = byStudent.get(safeId(studentId))?.[taskId];
  const submittedAnswer = prev?.submittedAnswer ?? '';

  if (action === 'accept') {
    return writeState(studentId, taskId, {
      statusVariant: 'accepted',
      filter: 'completed',
      submittedAnswer,
      teacherComment: teacherComment?.trim() || prev?.teacherComment,
    });
  }

  return writeState(studentId, taskId, {
    statusVariant: 'revision',
    filter: 'active',
    submittedAnswer,
    teacherComment: teacherComment?.trim() || prev?.teacherComment,
  });
}

export function invalidateMockStudentTaskStateCache(): void {
  byStudent.clear();
}
