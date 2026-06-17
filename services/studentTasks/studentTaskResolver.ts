import {
  MOCK_STUDENT_TASKS,
  mergeStudentTaskWithState,
  stripIrrelevantTeacherCommentForBaseTask,
  type StudentTask,
} from '@/components/task/mockStudentTasks';
import { getStudentTaskStateSync } from '@/services/studentTasks/mockStudentTaskStateStore';

function resolveTask(studentId: string, base: StudentTask): StudentTask {
  const state = getStudentTaskStateSync(studentId, base.id);
  const merged = mergeStudentTaskWithState(base, state);
  return state ? merged : stripIrrelevantTeacherCommentForBaseTask(merged);
}

export function getResolvedStudentTask(studentId: string, taskId: string): StudentTask | undefined {
  const base = MOCK_STUDENT_TASKS.find((t) => t.id === taskId);
  if (!base) return undefined;
  return resolveTask(studentId, base);
}

export function listStudentTasksForStudent(studentId: string): StudentTask[] {
  void studentId;
  return MOCK_STUDENT_TASKS.map((t) => resolveTask(studentId, t));
}
