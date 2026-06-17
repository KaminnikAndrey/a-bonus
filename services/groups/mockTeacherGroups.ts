import type { Student } from '@/components/group/StudentListItem';
import { appendMockEnrollmentHistory } from '@/services/coins/mockCoinsHistoryStore';
import { getMockTeacherGroupTaskTabs } from '@/services/groupTasks/mockTeacherGroupTasks';
import { store } from '@/stores/auth/authStore';

/** Логин демо-преподавателя (см. `tryDevMockLogin` в authApi). */
export const MOCK_TEACHER_LOGIN = 'mock-teacher';

/** Мок групп включается только для этого логина; остальные преподаватели ходят в API. */
export function isMockTeacherGroupsUser(login: string | null | undefined): boolean {
  return (login ?? '').trim().toLowerCase() === MOCK_TEACHER_LOGIN;
}

/** Демо-преподаватель из `authApi` (mock-teacher) всегда с id=2. Для старого persist без `user.login`. */
export function isMockTeacherUserId(userId: string | number | null | undefined): boolean {
  return String(userId ?? '').trim() === '2';
}

const MOCK_DELAY_MS = 350;

function delay(ms: number) {
  return new Promise<void>((resolve) => setTimeout(resolve, ms));
}

export type MockGroup = {
  id: string;
  name: string;
};

/** Те же вкладки, что на «Задачи по группам» и «Создать задачу». */
export function getMockTeacherGroupsTabs(): MockGroup[] {
  return getMockTeacherGroupTaskTabs().map((t) => ({ id: t.id, name: t.name }));
}

/** Счётчики на экране «Группы» — сколько зачислить; по умолчанию 0 у всех. */
export const MOCK_STUDENTS_BY_GROUP: Record<string, Student[]> = {
  tg1: [
    { id: '101', fullname: 'Величко Алиса Павловна', coins: '0' },
    { id: '102', fullname: 'Поляков Артём Вячеславович', coins: '0' },
    { id: '103', fullname: 'Коссе Иван Николаевич', coins: '0' },
    { id: '104', fullname: 'Соколов Артем Иванович', coins: '0' },
    { id: '105', fullname: 'Бут Данил Игоревич', coins: '0' },
  ],
  'tg-child': [
    { id: 'c01', fullname: 'Смирнов Даниил Олегович', coins: '0' },
    { id: 'c02', fullname: 'Морозова Елизавета Андреевна', coins: '0' },
  ],
  tg3: [
    { id: '301', fullname: 'Новиков Артём Павлович', coins: '0' },
    { id: '302', fullname: 'Фёдорова София Романовна', coins: '0' },
  ],
  'tg-lunch': [
    { id: 'l01', fullname: 'Волков Пётр Николаевич', coins: '0' },
    { id: 'l02', fullname: 'Лебедев Максим Дмитриевич', coins: '0' },
  ],
  tg2: [
    { id: '201', fullname: 'Смирнов Даниил Олегович', coins: '0' },
    { id: '202', fullname: 'Морозова Елизавета Андреевна', coins: '0' },
    { id: '203', fullname: 'Орлова Виктория Ильинична', coins: '0' },
  ],
  'tg-long': [
    { id: 't01', fullname: 'Кузнецов Роман Сергеевич', coins: '0' },
    { id: 't02', fullname: 'Иванов Иван Петрович', coins: '0' },
  ],
};

export async function mockGetAllGroups(
  page: number,
  _size: number
): Promise<{
  success: boolean;
  data: MockGroup[];
  pagination?: { hasMore: boolean; currentPage: number; totalPages: number };
  error?: string;
}> {
  await delay(MOCK_DELAY_MS);
  if (page === 0) {
    return {
      success: true,
      data: getMockTeacherGroupsTabs(),
      pagination: {
        hasMore: false,
        currentPage: 0,
        totalPages: 1,
      },
    };
  }
  return {
    success: true,
    data: [],
    pagination: {
      hasMore: false,
      currentPage: page,
      totalPages: 1,
    },
  };
}

function studentsForEnrollmentUi(list: Student[]): Student[] {
  return list.map((s) => ({ ...s, coins: '0' }));
}

/** Синхронный список учеников группы (те же данные, что на экране «Группы»). */
export function getMockStudentsByGroupSync(groupId: string): Student[] {
  const list = MOCK_STUDENTS_BY_GROUP[groupId];
  if (!list?.length) {
    return [{ id: '999', fullname: 'Нет учеников в демо-группе', coins: '0' }];
  }
  return studentsForEnrollmentUi(list);
}

export async function mockGetStudentsByGroup(groupId: string): Promise<{
  success: boolean;
  data: Student[];
  error?: string;
}> {
  await delay(MOCK_DELAY_MS);
  const list = MOCK_STUDENTS_BY_GROUP[groupId] ?? [
    { id: '999', fullname: 'Нет учеников в демо-группе', coins: '0' },
  ];
  return {
    success: true,
    data: studentsForEnrollmentUi(list),
  };
}

export async function mockGiveCoinsToStudents(
  _groupId: string,
  studentList: Student[]
): Promise<{ success: boolean; error?: string }> {
  await delay(MOCK_DELAY_MS);
  const withCoins = studentList.filter((s) => s.coins && parseInt(s.coins, 10) > 0);
  if (withCoins.length === 0) {
    return { success: false, error: 'Не указано количество коинов для начисления' };
  }

  const auth = store.getState()?.auth;
  const teacherId =
    auth?.user?.id != null && String(auth.user.id).trim() !== ''
      ? String(auth.user.id)
      : 'unknown';
  const login = (auth?.creds?.login ?? auth?.user?.login ?? '').trim();
  const teacherName = login ? `Преподаватель (${login})` : 'Демо Преподаватель';

  await appendMockEnrollmentHistory(
    teacherId,
    withCoins.map((s) => ({
      studentName: s.fullname,
      coins: parseInt(s.coins, 10),
      teacherName,
    }))
  );

  return { success: true };
}
