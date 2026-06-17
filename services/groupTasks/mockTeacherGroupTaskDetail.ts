import type { TeacherGroupTaskCard } from '@/services/groupTasks/mockTeacherGroupTasks';
import {
  findTeacherGroupIdForTask,
  findTeacherGroupTaskCardById,
  getMockTeacherGroupTabName,
} from '@/services/groupTasks/mockTeacherGroupTasks';
import { getMockStudentsByGroupSync } from '@/services/groups/mockTeacherGroups';
import { getMockTeacherTaskEditSync } from '@/services/groupTasks/mockTeacherTaskEditStore';
import { getTeacherStudentStatusOverrideSync } from '@/services/groupTasks/mockTeacherTaskReviewStore';

export type TeacherTaskStudentStatusKind =
  | 'awaiting_review'
  | 'revision'
  | 'not_completed'
  | 'accepted';

export type TeacherTaskDetailStudent = {
  id: string;
  fullName: string;
  status: TeacherTaskStudentStatusKind;
};

export type TeacherGroupTaskDetail = TeacherGroupTaskCard & {
  groupId: string;
  groupName: string;
  descriptionSteps: string[];
  students: TeacherTaskDetailStudent[];
};

const STATUS_LABEL: Record<TeacherTaskStudentStatusKind, string> = {
  awaiting_review: 'Ожидает проверки',
  revision: 'На доработке',
  not_completed: 'Не выполнена',
  accepted: 'Принята',
};

export function getTeacherTaskStudentStatusLabel(status: TeacherTaskStudentStatusKind): string {
  return STATUS_LABEL[status];
}

export const TEACHER_TASK_STATUS_OPTIONS: TeacherTaskStudentStatusKind[] = [
  'not_completed',
  'awaiting_review',
  'revision',
  'accepted',
];

export const TEACHER_TASK_STATUS_TEXT_COLOR: Record<TeacherTaskStudentStatusKind, string> = {
  awaiting_review: '#B8860B',
  revision: '#B8860B',
  not_completed: '#C62828',
  accepted: '#2E7D32',
};

const DEFAULT_STEPS = [
  'Ознакомьтесь с формулировкой задания и требованиями к результату.',
  'Выполните работу в указанной среде или по инструкции преподавателя.',
  'Проверьте результат перед отправкой.',
  'При необходимости приложите ссылку или файл с решением.',
  'Дождитесь проверки и комментария преподавателя.',
];

const PYTHON_STEPS = [
  'Откройте среду разработки Python (например, VS Code или PyCharm).',
  'Создайте файл с решением и напишите код согласно условию задачи.',
  'Запустите программу локально и убедитесь, что она работает без ошибок.',
  'При необходимости оформите код в репозитории или подготовьте архив.',
  'Прикрепите ссылку или инструкцию для проверки в ответе на задание.',
];

const SCRATCH_STEPS = [
  'Откройте Scratch и создайте проект по условию.',
  'Сохраните проект и получите ссылку «Поделиться».',
  'Проверьте, что по ссылке открывается именно ваша работа.',
  'Сдайте ссылку преподавателю способом, указанным в задании.',
];

/** Демо: у кого есть сдача на проверку (совпадает с mockTeacherTaskStudentReview). */
const DEMO_AWAITING_STUDENT: Record<string, string> = {
  'tg1-a2': '105',
};

const STATUS_CYCLE: TeacherTaskStudentStatusKind[] = [
  'not_completed',
  'revision',
  'accepted',
];

function getDescriptionStepsForTask(taskId: string, card: TeacherGroupTaskCard): string[] {
  if (taskId === 'tg1-a2' || taskId === 'tg-long-a1') return PYTHON_STEPS;
  const title = card.title.toLowerCase();
  if (title.includes('python')) return PYTHON_STEPS;
  if (title.includes('scratch')) return SCRATCH_STEPS;
  return DEFAULT_STEPS;
}

function defaultStatusForStudent(
  taskId: string,
  studentId: string,
  index: number
): TeacherTaskStudentStatusKind {
  if (DEMO_AWAITING_STUDENT[taskId] === studentId) return 'awaiting_review';
  return STATUS_CYCLE[index % STATUS_CYCLE.length];
}

export function getMockTeacherGroupTaskDetail(
  taskId: string | undefined,
  teacherId: string
): TeacherGroupTaskDetail | undefined {
  if (!taskId) return undefined;
  const card = findTeacherGroupTaskCardById(taskId, teacherId);
  if (!card) return undefined;

  const groupId = findTeacherGroupIdForTask(taskId, teacherId);
  if (!groupId) return undefined;

  const groupName = getMockTeacherGroupTabName(groupId);
  const groupStudents = getMockStudentsByGroupSync(groupId);
  const students: TeacherTaskDetailStudent[] = groupStudents.map((s, index) => {
    const override = getTeacherStudentStatusOverrideSync(teacherId, taskId, s.id);
    const status =
      override !== undefined ? override : defaultStatusForStudent(taskId, s.id, index);
    return { id: s.id, fullName: s.fullname, status };
  });

  const edit = getMockTeacherTaskEditSync(teacherId, taskId);
  const descriptionSteps =
    edit?.descriptionSteps?.length
      ? edit.descriptionSteps
      : getDescriptionStepsForTask(taskId, card);

  return {
    ...card,
    groupId,
    groupName,
    descriptionSteps,
    students,
  };
}
