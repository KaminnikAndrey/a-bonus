import {
  findCreatedTaskCardById,
  findCreatedTaskGroupId,
  getCreatedTasksForGroupSync,
  removeMockCreatedTaskById,
  updateMockCreatedTaskById,
  type StoredGroupTaskCard,
} from '@/services/groupTasks/mockCreatedTasksStore';
import {
  getMockTeacherTaskEditSync,
  hydrateMockTeacherTaskEdits,
  setMockTeacherTaskEdit,
  type TeacherTaskEditPatch,
} from '@/services/groupTasks/mockTeacherTaskEditStore';
import {
  hydrateMockDeletedTeacherTasks,
  isMockTeacherTaskDeletedSync,
  markMockTeacherTaskDeleted,
} from '@/services/groupTasks/mockDeletedTeacherTasksStore';

export type TeacherGroupTaskTab = {
  id: string;
  name: string;
};

export type TeacherGroupTaskCard = {
  id: string;
  dateFrom: string;
  dateTo: string;
  title: string;
  reward: string;
};

export type TeacherGroupTasksPayload = {
  active: TeacherGroupTaskCard[];
  overdue: TeacherGroupTaskCard[];
};

const ISO = (y: number, m: number, d: number) =>
  `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

/** Демо-вкладки групп (совпадают с чипами на экране «Создать задачу»). */
const TABS: TeacherGroupTaskTab[] = [
  { id: 'tg1', name: 'Группа 1' },
  { id: 'tg-child', name: 'Детская группа' },
  { id: 'tg3', name: 'Вечерняя группа' },
  { id: 'tg-lunch', name: 'Группа обед' },
  { id: 'tg2', name: 'Группа 2' },
  { id: 'tg-long', name: 'Пример длинного названия группы' },
];

const BY_GROUP: Record<string, TeacherGroupTasksPayload> = {
  tg1: {
    active: [
      {
        id: 'tg1-a1',
        dateFrom: ISO(2026, 6, 10),
        dateTo: ISO(2026, 6, 30),
        title: 'Задача в Scratch',
        reward: '8 коинов',
      },
      {
        id: 'tg1-a2',
        dateFrom: ISO(2026, 6, 5),
        dateTo: ISO(2026, 6, 22),
        title: 'Задача на написание кода python',
        reward: '12 коинов + 3 EXP первым трем!',
      },
    ],
    overdue: [
      {
        id: 'tg1-o1',
        dateFrom: ISO(2026, 5, 20),
        dateTo: ISO(2026, 6, 8),
        title: 'Задача в Scratch',
        reward: '8 коинов',
      },
    ],
  },
  'tg-child': {
    active: [
      {
        id: 'tg-child-a1',
        dateFrom: ISO(2026, 6, 8),
        dateTo: ISO(2026, 6, 25),
        title: 'Рисунок в Tux Paint по теме «Весна»',
        reward: '5 коинов',
      },
      {
        id: 'tg-child-a2',
        dateFrom: ISO(2026, 6, 12),
        dateTo: ISO(2026, 7, 1),
        title: 'Счёт до 20 в Scratch Jr',
        reward: '6 коинов + 1 EXP первым трем!',
      },
    ],
    overdue: [
      {
        id: 'tg-child-o1',
        dateFrom: ISO(2026, 5, 15),
        dateTo: ISO(2026, 5, 28),
        title: 'Собери пазл из 12 деталей (фото)',
        reward: '4 коина',
      },
    ],
  },
  tg2: {
    active: [
      {
        id: 'tg2-a1',
        dateFrom: ISO(2026, 6, 5),
        dateTo: ISO(2026, 6, 20),
        title: 'Верстка лендинга',
        reward: '15 коинов',
      },
      {
        id: 'tg2-a2',
        dateFrom: ISO(2026, 6, 10),
        dateTo: ISO(2026, 6, 30),
        title: 'Адаптивная сетка на CSS Grid',
        reward: '10 коинов',
      },
    ],
    overdue: [],
  },
  tg3: {
    active: [
      {
        id: 'tg3-a1',
        dateFrom: ISO(2026, 6, 1),
        dateTo: ISO(2026, 6, 28),
        title: 'Мини-проект на Python',
        reward: '20 коинов',
      },
    ],
    overdue: [
      {
        id: 'tg3-o1',
        dateFrom: ISO(2026, 5, 10),
        dateTo: ISO(2026, 5, 25),
        title: 'Упражнения по циклам',
        reward: '5 коинов',
      },
    ],
  },
  'tg-lunch': {
    active: [
      {
        id: 'tg-lunch-a1',
        dateFrom: ISO(2026, 6, 10),
        dateTo: ISO(2026, 6, 24),
        title: 'Кроссворд по информатике (15 слов)',
        reward: '7 коинов',
      },
      {
        id: 'tg-lunch-a2',
        dateFrom: ISO(2026, 6, 12),
        dateTo: ISO(2026, 6, 30),
        title: 'Блиц-тест: клавиатура и горячие клавиши',
        reward: '5 коинов',
      },
    ],
    overdue: [],
  },
  'tg-long': {
    active: [
      {
        id: 'tg-long-a1',
        dateFrom: ISO(2026, 6, 1),
        dateTo: ISO(2026, 6, 30),
        title: 'Подготовка к олимпиаде: задачи на строки и массивы',
        reward: '25 коинов + 5 EXP первым трем!',
      },
    ],
    overdue: [
      {
        id: 'tg-long-o1',
        dateFrom: ISO(2026, 5, 1),
        dateTo: ISO(2026, 5, 20),
        title: 'Разбор прошлогоднего тура (письменно)',
        reward: '12 коинов',
      },
    ],
  },
};

export function getMockTeacherGroupTaskTabs(): TeacherGroupTaskTab[] {
  return TABS;
}

export function getMockTeacherGroupTabName(groupId: string): string {
  return TABS.find((t) => t.id === groupId)?.name ?? 'Группа';
}

/** Группа, к которой относится задача (статическая или созданная преподавателем). */
export function findTeacherGroupIdForTask(taskId: string, teacherId: string): string | undefined {
  const fromCreated = findCreatedTaskGroupId(teacherId, taskId);
  if (fromCreated) return fromCreated;
  for (const [groupId, payload] of Object.entries(BY_GROUP)) {
    const inGroup = [...payload.active, ...payload.overdue].some((t) => t.id === taskId);
    if (inGroup) return groupId;
  }
  return undefined;
}

export function getMockTeacherGroupTasks(groupId: string): TeacherGroupTasksPayload {
  return BY_GROUP[groupId] ?? { active: [], overdue: [] };
}

function filterDeletedCards(
  teacherId: string,
  cards: TeacherGroupTaskCard[]
): TeacherGroupTaskCard[] {
  return cards.filter((c) => !isMockTeacherTaskDeletedSync(teacherId, c.id));
}

/** Статические моки + задачи, созданные на экране «Создать задачу» (AsyncStorage по teacherId). */
export function getMockTeacherGroupTasksMerged(
  groupId: string,
  teacherId: string
): TeacherGroupTasksPayload {
  const base = BY_GROUP[groupId] ?? { active: [], overdue: [] };
  const created = getCreatedTasksForGroupSync(teacherId, groupId) as TeacherGroupTaskCard[];
  return {
    active: filterDeletedCards(teacherId, [...created, ...base.active]),
    overdue: filterDeletedCards(teacherId, [...base.overdue]),
  };
}

function applyTaskEditPatch(card: TeacherGroupTaskCard, patch: TeacherTaskEditPatch): TeacherGroupTaskCard {
  const { descriptionSteps: _steps, ...cardPatch } = patch;
  return { ...card, ...cardPatch };
}

export function findTeacherGroupTaskCardById(
  taskId: string,
  teacherId: string
): TeacherGroupTaskCard | undefined {
  if (isMockTeacherTaskDeletedSync(teacherId, taskId)) return undefined;
  const edit = getMockTeacherTaskEditSync(teacherId, taskId);
  const fromCreated = findCreatedTaskCardById(teacherId, taskId) as TeacherGroupTaskCard | undefined;
  if (fromCreated) return edit ? applyTaskEditPatch(fromCreated, edit) : fromCreated;
  for (const payload of Object.values(BY_GROUP)) {
    const found = [...payload.active, ...payload.overdue].find((t) => t.id === taskId);
    if (found) return edit ? applyTaskEditPatch(found, edit) : found;
  }
  return undefined;
}

export type UpdateTeacherGroupTaskInput = {
  title: string;
  reward: string;
  dateFrom: string;
  dateTo: string;
  descriptionSteps: string[];
};

/** Обновляет созданную задачу или сохраняет правки демо-задачи. */
export async function updateMockTeacherGroupTask(
  teacherId: string,
  taskId: string,
  input: UpdateTeacherGroupTaskInput
): Promise<boolean> {
  const tid = String(teacherId || 'unknown');
  await hydrateMockTeacherTaskEdits(tid);
  const cardPatch: Partial<StoredGroupTaskCard> = {
    title: input.title,
    reward: input.reward,
    dateFrom: input.dateFrom,
    dateTo: input.dateTo,
  };
  const editPatch: TeacherTaskEditPatch = { ...cardPatch, descriptionSteps: input.descriptionSteps };

  if (findCreatedTaskGroupId(tid, taskId)) {
    const ok = await updateMockCreatedTaskById(tid, taskId, cardPatch);
    if (ok) await setMockTeacherTaskEdit(tid, taskId, { descriptionSteps: input.descriptionSteps });
    return ok;
  }

  if (!findTeacherGroupIdForTask(taskId, tid)) return false;
  return setMockTeacherTaskEdit(tid, taskId, editPatch);
}

/**
 * Удаляет задачу: созданную преподавателем (AsyncStorage) или демо из статического списка.
 */
export async function removeMockTeacherGroupTaskById(
  teacherId: string,
  taskId: string
): Promise<boolean> {
  const tid = String(teacherId || 'unknown');
  await hydrateMockDeletedTeacherTasks(tid);
  const removedCreated = await removeMockCreatedTaskById(tid, taskId);
  if (removedCreated) return true;
  return markMockTeacherTaskDeleted(tid, taskId);
}
