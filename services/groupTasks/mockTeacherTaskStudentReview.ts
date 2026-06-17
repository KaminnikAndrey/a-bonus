import {
  getTeacherReviewCommentSync,
  getTeacherReviewSubmissionsSync,
} from '@/services/groupTasks/mockTeacherTaskReviewStore';

export type TeacherTaskSubmissionAttempt = {
  attemptNumber: number;
  /** Ссылка на работу (если есть) */
  link?: string;
  /** Текст ответа ученика */
  studentMessage?: string;
  /** Предыдущий комментарий преподавателя к этой попытке */
  teacherComment?: string;
};

const KEY = (taskId: string, studentId: string) => `${taskId}:${studentId}`;

/** Демо-история сдач для экрана проверки (ожидает проверки). */
const SUBMISSIONS_BY_TASK_STUDENT: Record<string, TeacherTaskSubmissionAttempt[]> = {
  'tg1-a2:105': [
    {
      attemptNumber: 1,
      link: 'https://www.ekarta-ek.ru/',
    },
  ],
};

export function getMockTeacherTaskStudentSubmissions(
  taskId: string,
  studentId: string,
  teacherId?: string
): TeacherTaskSubmissionAttempt[] {
  const baseline = SUBMISSIONS_BY_TASK_STUDENT[KEY(taskId, studentId)] ?? [];
  if (!teacherId) return baseline;
  const stored = getTeacherReviewSubmissionsSync(teacherId, taskId, studentId);
  if (stored?.length) return stored;
  const comment = getTeacherReviewCommentSync(teacherId, taskId, studentId);
  if (comment && baseline.length) {
    return baseline.map((a, i, arr) =>
      i === arr.length - 1 ? { ...a, teacherComment: comment } : a
    );
  }
  return baseline;
}
