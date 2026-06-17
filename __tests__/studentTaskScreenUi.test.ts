import { MOCK_STUDENT_TASKS } from '@/components/task/mockStudentTasks';
import { getStudentTaskScreenUi } from '@/components/task/studentTaskScreenUi';

describe('getStudentTaskScreenUi', () => {
  it('не выполнена: поле ответа и отправка, без комментария', () => {
    const task = MOCK_STUDENT_TASKS.find((t) => t.id === 'python-not-done')!;
    const ui = getStudentTaskScreenUi(task);
    expect(ui.showTeacherComment).toBe(false);
    expect(ui.showAnswerEditor).toBe(true);
    expect(ui.showSubmittedAnswer).toBe(false);
    expect(ui.footerMode).toBe('submit');
    expect(ui.canSubmit).toBe(true);
  });

  it('ожидает проверки: только просмотр ответа, без редактирования', () => {
    const task = MOCK_STUDENT_TASKS.find((t) => t.id === 'python-awaiting-review')!;
    const ui = getStudentTaskScreenUi(task);
    expect(ui.showTeacherComment).toBe(false);
    expect(ui.showAnswerEditor).toBe(false);
    expect(ui.showSubmittedAnswer).toBe(true);
    expect(ui.footerMode).toBe('pending');
    expect(ui.canSubmit).toBe(false);
  });

  it('на доработке: комментарий, поле и повторная отправка', () => {
    const task = MOCK_STUDENT_TASKS.find((t) => t.id === 'python-revision')!;
    const ui = getStudentTaskScreenUi(task);
    expect(ui.showTeacherComment).toBe(true);
    expect(ui.showAnswerEditor).toBe(true);
    expect(ui.footerMode).toBe('resubmit');
    expect(ui.submitButtonLabel).toContain('повторно');
  });

  it('принята: комментарий и ответ только для чтения', () => {
    const task = MOCK_STUDENT_TASKS.find((t) => t.id === 'python-accepted')!;
    const ui = getStudentTaskScreenUi(task);
    expect(ui.showTeacherComment).toBe(true);
    expect(ui.showSubmittedAnswer).toBe(true);
    expect(ui.showAnswerEditor).toBe(false);
    expect(ui.footerMode).toBe('done');
  });
});
