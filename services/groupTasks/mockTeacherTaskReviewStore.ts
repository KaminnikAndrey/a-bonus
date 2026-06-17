import type { TeacherTaskStudentStatusKind } from '@/services/groupTasks/mockTeacherGroupTaskDetail';
import type { TeacherTaskSubmissionAttempt } from '@/services/groupTasks/mockTeacherTaskStudentReview';
import {
  syncStudentAfterTeacherReview,
  syncStudentAfterTeacherStatusSet,
} from '@/services/studentTasks/demoTaskWorkflowBridge';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type TeacherReviewAction = 'accept' | 'revision';

type ReviewEntry = {
  status: TeacherTaskStudentStatusKind;
  teacherComment?: string;
  submissions: TeacherTaskSubmissionAttempt[];
};

const byTeacher = new Map<string, Record<string, ReviewEntry>>();

function safeId(id: string): string {
  return String(id || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function entryKey(taskId: string, studentId: string): string {
  return `${taskId}:${studentId}`;
}

function storageKey(teacherId: string): string {
  return `mock_teacher_task_reviews_v1_${safeId(teacherId)}`;
}

export async function hydrateMockTeacherTaskReviews(teacherId: string): Promise<void> {
  const tid = safeId(teacherId);
  try {
    const raw = await AsyncStorage.getItem(storageKey(tid));
    const fromDisk = raw ? (JSON.parse(raw) as Record<string, ReviewEntry>) : {};
    const parsed = fromDisk && typeof fromDisk === 'object' ? fromDisk : {};
    /** Читаем память после await — иначе гонка с setTeacherStudentTaskStatus затирает новый статус. */
    const inMemory = byTeacher.get(tid) ?? {};
    byTeacher.set(tid, { ...parsed, ...inMemory });
  } catch {
    byTeacher.set(tid, byTeacher.get(tid) ?? {});
  }
}

export function getTeacherStudentStatusOverrideSync(
  teacherId: string,
  taskId: string,
  studentId: string
): TeacherTaskStudentStatusKind | undefined {
  return byTeacher.get(safeId(teacherId))?.[entryKey(taskId, studentId)]?.status;
}

export function getTeacherReviewSubmissionsSync(
  teacherId: string,
  taskId: string,
  studentId: string
): TeacherTaskSubmissionAttempt[] | undefined {
  const subs = byTeacher.get(safeId(teacherId))?.[entryKey(taskId, studentId)]?.submissions;
  return subs?.length ? subs : undefined;
}

export function getTeacherReviewCommentSync(
  teacherId: string,
  taskId: string,
  studentId: string
): string | undefined {
  return byTeacher.get(safeId(teacherId))?.[entryKey(taskId, studentId)]?.teacherComment;
}

async function persist(teacherId: string): Promise<boolean> {
  const tid = safeId(teacherId);
  try {
    await AsyncStorage.setItem(storageKey(tid), JSON.stringify(byTeacher.get(tid) ?? {}));
    return true;
  } catch {
    return false;
  }
}

/** Установить статус ученика по задаче (с экрана детали или вручную). */
export async function setTeacherStudentTaskStatus(
  teacherId: string,
  taskId: string,
  studentId: string,
  status: TeacherTaskStudentStatusKind
): Promise<boolean> {
  const tid = safeId(teacherId);
  if (!byTeacher.has(tid)) {
    await hydrateMockTeacherTaskReviews(teacherId);
  }
  const map = { ...(byTeacher.get(tid) ?? {}) };
  const key = entryKey(taskId, studentId);
  const prev = map[key];
  map[key] = {
    status,
    teacherComment: prev?.teacherComment,
    submissions: prev?.submissions ?? [],
  };
  byTeacher.set(tid, map);
  const ok = await persist(tid);
  if (ok) {
    await syncStudentAfterTeacherStatusSet(teacherId, taskId, studentId, status);
  }
  return ok;
}

/** Принять работу или отправить на доработку с комментарием. */
export async function applyTeacherTaskReview(
  teacherId: string,
  taskId: string,
  studentId: string,
  action: TeacherReviewAction,
  teacherComment?: string
): Promise<boolean> {
  const tid = safeId(teacherId);
  if (!byTeacher.has(tid)) {
    await hydrateMockTeacherTaskReviews(teacherId);
  }
  const map = { ...(byTeacher.get(tid) ?? {}) };
  const key = entryKey(taskId, studentId);
  const prev = map[key];

  const comment = teacherComment?.trim() || prev?.teacherComment;
  const status: TeacherTaskStudentStatusKind =
    action === 'accept' ? 'accepted' : 'revision';

  const submissions = prev?.submissions?.length
    ? prev.submissions.map((a, i, arr) =>
        i === arr.length - 1 && comment
          ? { ...a, teacherComment: comment }
          : a
      )
    : [];

  map[key] = {
    status,
    teacherComment: comment,
    submissions,
  };
  byTeacher.set(tid, map);
  const ok = await persist(tid);
  if (ok) {
    await syncStudentAfterTeacherReview(teacherId, taskId, studentId, action, teacherComment);
  }
  return ok;
}

/** Сохранить сдачу ученика (демо: можно вызывать при открытии проверки). */
export async function upsertTeacherTaskSubmission(
  teacherId: string,
  taskId: string,
  studentId: string,
  submission: TeacherTaskSubmissionAttempt
): Promise<boolean> {
  const tid = safeId(teacherId);
  if (!byTeacher.has(tid)) {
    await hydrateMockTeacherTaskReviews(teacherId);
  }
  const map = { ...(byTeacher.get(tid) ?? {}) };
  const key = entryKey(taskId, studentId);
  const prev = map[key];
  map[key] = {
    status: prev?.status ?? 'awaiting_review',
    teacherComment: prev?.teacherComment,
    submissions: [...(prev?.submissions ?? []), submission],
  };
  byTeacher.set(tid, map);
  return persist(tid);
}

export function invalidateMockTeacherTaskReviewCache(): void {
  byTeacher.clear();
}
