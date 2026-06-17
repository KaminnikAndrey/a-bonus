import {
  findTeacherGroupTaskCardById,
  getMockTeacherGroupTaskTabs,
} from '@/services/groupTasks/mockTeacherGroupTasks';
import {
  getMockTeacherGroupTaskDetail,
  getTeacherTaskStudentStatusLabel,
} from '@/services/groupTasks/mockTeacherGroupTaskDetail';
import { getMockTeacherTaskStudentSubmissions } from '@/services/groupTasks/mockTeacherTaskStudentReview';

const TEACHER = '2';

describe('mock teacher group tasks (read + review data)', () => {
  it('tabs and static task card', () => {
    const tabs = getMockTeacherGroupTaskTabs();
    expect(tabs.length).toBeGreaterThan(0);
    const card = findTeacherGroupTaskCardById('tg1-a1', TEACHER);
    expect(card?.title).toBeTruthy();
  });

  it('task detail uses students from task group', () => {
    const tg1 = getMockTeacherGroupTaskDetail('tg1-a1', TEACHER);
    const child = getMockTeacherGroupTaskDetail('tg-child-a1', TEACHER);
    expect(tg1?.groupName).toBe('Группа 1');
    expect(child?.groupName).toBe('Детская группа');
    expect(tg1?.students.some((s) => s.fullName.includes('Величко'))).toBe(true);
    expect(child?.students.some((s) => s.fullName.includes('Смирнов'))).toBe(true);
    expect(tg1?.students[0]?.fullName).not.toBe(child?.students[0]?.fullName);
    expect(getTeacherTaskStudentStatusLabel('awaiting_review')).toBe('Ожидает проверки');
  });

  it('student submissions for review screen', () => {
    const attempts = getMockTeacherTaskStudentSubmissions('tg1-a2', '105');
    expect(attempts.length).toBeGreaterThan(0);
    expect(attempts[0].attemptNumber).toBeGreaterThanOrEqual(1);
  });
});
