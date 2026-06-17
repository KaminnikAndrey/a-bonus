import {
  getTaskDetailBadge,
  type StudentTask,
  type TaskStatusBadgeVariant,
} from '@/components/task/mockStudentTasks';

export type StudentTaskFooterMode = 'submit' | 'resubmit' | 'pending' | 'done' | 'overdue' | null;

export type StudentTaskScreenUi = {
  /** Комментарий преподавателя (доработка / принята с похвалой). */
  showTeacherComment: boolean;
  /** Только чтение: уже отправленный ответ. */
  showSubmittedAnswer: boolean;
  /** Редактируемое поле ответа. */
  showAnswerEditor: boolean;
  canSubmit: boolean;
  footerMode: StudentTaskFooterMode;
  submitButtonLabel: string;
  disabledFooterLabel: string;
  statusHint: string;
  submitModalTitle: string;
  submitModalSubtitle: string;
};

function hasText(value?: string): boolean {
  return Boolean(value?.trim());
}

/**
 * Правила экрана «Подробнее о задаче» для ученика по статусу проверки.
 */
export function getStudentTaskScreenUi(task: StudentTask): StudentTaskScreenUi {
  const variant = getTaskDetailBadge(task).variant;

  const base = (overrides: Partial<StudentTaskScreenUi>): StudentTaskScreenUi => ({
    showTeacherComment: false,
    showSubmittedAnswer: false,
    showAnswerEditor: false,
    canSubmit: false,
    footerMode: null,
    submitButtonLabel: 'Отправить на проверку',
    disabledFooterLabel: '',
    statusHint: '',
    submitModalTitle: 'Отправить на проверку?',
    submitModalSubtitle:
      'Преподаватель увидит ваш ответ и сможет начислить награду после проверки.',
    ...overrides,
  });

  switch (variant as TaskStatusBadgeVariant) {
    case 'revision':
      return base({
        showTeacherComment: hasText(task.teacherComment),
        showAnswerEditor: true,
        canSubmit: true,
        footerMode: 'resubmit',
        submitButtonLabel: 'Отправить повторно',
        statusHint: hasText(task.teacherComment)
          ? 'Исправьте работу по комментарию преподавателя и отправьте снова.'
          : 'Внесите правки и отправьте работу повторно.',
        submitModalTitle: 'Отправить повторно?',
        submitModalSubtitle:
          'Преподаватель получит обновлённый ответ и снова проверит задание.',
      });

    case 'review':
      return base({
        showSubmittedAnswer: hasText(task.submittedAnswerPreview),
        footerMode: 'pending',
        disabledFooterLabel: 'Ожидает проверки',
        statusHint: 'Ответ отправлен. Дождитесь проверки — изменить или дополнить его сейчас нельзя.',
      });

    case 'accepted':
      return base({
        showTeacherComment: hasText(task.teacherComment),
        showSubmittedAnswer: hasText(task.submittedAnswerPreview),
        footerMode: 'done',
        disabledFooterLabel: 'Задание выполнено',
        statusHint: 'Работа принята. Награда будет начислена по правилам курса.',
      });

    case 'overdue':
      return base({
        showAnswerEditor: true,
        canSubmit: true,
        footerMode: 'submit',
        statusHint:
          'Срок сдачи истёк, но вы можете отправить ответ — преподаватель решит, учитывать ли просрочку.',
      });

    case 'completed':
      return base({
        showSubmittedAnswer: hasText(task.submittedAnswerPreview),
        footerMode: 'done',
        disabledFooterLabel: 'Задание выполнено',
        statusHint: 'Задание отмечено как выполненное.',
      });

    case 'notCompleted':
    case 'active':
    default:
      return base({
        showAnswerEditor: true,
        canSubmit: true,
        footerMode: 'submit',
        statusHint: 'Заполните ответ и отправьте работу на проверку.',
      });
  }
}
