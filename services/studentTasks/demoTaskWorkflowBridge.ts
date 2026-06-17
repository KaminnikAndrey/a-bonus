import type { TaskStatusBadgeVariant } from '@/components/task/mockStudentTasks';
import type { TeacherTaskStudentStatusKind } from '@/services/groupTasks/mockTeacherGroupTaskDetail';
import {
  upsertTeacherTaskSubmission,
  type TeacherReviewAction,
} from '@/services/groupTasks/mockTeacherTaskReviewStore';
import {
  applyStudentTaskStatusDirect,
  applyStudentTaskTeacherReview,
  submitStudentTaskAnswer,
} from '@/services/studentTasks/mockStudentTaskStateStore';

/** Демо: mock-student (id=1) ↔ преподаватель (id=2). */
export const DEMO_STUDENT_USER_ID = '1';
export const DEMO_TEACHER_USER_ID = '2';

const DEMO_LINKS: Array<{
  studentTaskId: string;
  teacherTaskId: string;
  teacherGroupStudentId: string;
}> = [
  { studentTaskId: 'python-not-done', teacherTaskId: 'tg1-a2', teacherGroupStudentId: '105' },
  { studentTaskId: 'python-awaiting-review', teacherTaskId: 'tg1-a2', teacherGroupStudentId: '105' },
  { studentTaskId: 'python-revision', teacherTaskId: 'tg1-a2', teacherGroupStudentId: '105' },
  { studentTaskId: 'python-accepted', teacherTaskId: 'tg1-a2', teacherGroupStudentId: '105' },
];

export function findTeacherLinkForStudentTask(
  studentUserId: string,
  studentTaskId: string
): { teacherId: string; teacherTaskId: string; teacherGroupStudentId: string } | undefined {
  const link = DEMO_LINKS.find((l) => l.studentTaskId === studentTaskId);
  if (!link || safeId(studentUserId) !== DEMO_STUDENT_USER_ID) return undefined;
  return { teacherId: DEMO_TEACHER_USER_ID, ...link };
}

export function findStudentLinkForTeacherTask(
  teacherUserId: string,
  teacherTaskId: string,
  groupStudentId: string
): { studentUserId: string; studentTaskId: string } | undefined {
  if (safeId(teacherUserId) !== DEMO_TEACHER_USER_ID) return undefined;
  const link = DEMO_LINKS.find(
    (l) => l.teacherTaskId === teacherTaskId && l.teacherGroupStudentId === groupStudentId
  );
  if (!link) return undefined;
  return { studentUserId: DEMO_STUDENT_USER_ID, studentTaskId: link.studentTaskId };
}

function safeId(id: string): string {
  return String(id || 'unknown').replace(/[^a-zA-Z0-9_-]/g, '_');
}

function teacherStatusToStudentVariant(
  status: TeacherTaskStudentStatusKind
): TaskStatusBadgeVariant {
  switch (status) {
    case 'awaiting_review':
      return 'review';
    case 'revision':
      return 'revision';
    case 'accepted':
      return 'accepted';
    case 'not_completed':
    default:
      return 'notCompleted';
  }
}

export async function submitStudentTaskAnswerWithSync(
  studentUserId: string,
  studentTaskId: string,
  answer: string
): Promise<boolean> {
  const ok = await submitStudentTaskAnswer(studentUserId, studentTaskId, answer);
  if (!ok) return false;
  try {
    await syncTeacherAfterStudentSubmit(studentUserId, studentTaskId, answer);
  } catch {
    /* ignore */
  }
  return true;
}

export async function syncTeacherAfterStudentSubmit(
  studentUserId: string,
  studentTaskId: string,
  answer: string
): Promise<void> {
  const link = findTeacherLinkForStudentTask(studentUserId, studentTaskId);
  if (!link) return;

  const urlMatch = answer.match(/https?:\/\/\S+/i);
  await upsertTeacherTaskSubmission(
    link.teacherId,
    link.teacherTaskId,
    link.teacherGroupStudentId,
    {
      attemptNumber: 1,
      link: urlMatch?.[0],
      studentMessage: answer.trim(),
    }
  );
}

export async function syncStudentAfterTeacherReview(
  teacherUserId: string,
  teacherTaskId: string,
  groupStudentId: string,
  action: TeacherReviewAction,
  teacherComment?: string
): Promise<void> {
  const link = findStudentLinkForTeacherTask(teacherUserId, teacherTaskId, groupStudentId);
  if (!link) return;
  await applyStudentTaskTeacherReview(
    link.studentUserId,
    link.studentTaskId,
    action,
    teacherComment
  );
}

export async function syncStudentAfterTeacherStatusSet(
  teacherUserId: string,
  teacherTaskId: string,
  groupStudentId: string,
  status: TeacherTaskStudentStatusKind,
  teacherComment?: string
): Promise<void> {
  const link = findStudentLinkForTeacherTask(teacherUserId, teacherTaskId, groupStudentId);
  if (!link) return;

  const variant = teacherStatusToStudentVariant(status);
  const filter = status === 'accepted' ? 'completed' : 'active';

  if (status === 'awaiting_review') {
    await applyStudentTaskStatusDirect(link.studentUserId, link.studentTaskId, {
      statusVariant: 'review',
      filter: 'active',
      preserveSubmittedAnswer: true,
    });
    return;
  }

  if (status === 'revision' || status === 'accepted') {
    await applyStudentTaskTeacherReview(
      link.studentUserId,
      link.studentTaskId,
      status === 'accepted' ? 'accept' : 'revision',
      teacherComment
    );
    return;
  }

  await applyStudentTaskStatusDirect(link.studentUserId, link.studentTaskId, {
    statusVariant: variant,
    filter,
    teacherComment: status === 'not_completed' ? undefined : teacherComment,
    preserveSubmittedAnswer: status !== 'not_completed',
  });
}
