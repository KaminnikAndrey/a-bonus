export type ProjectFeedTab = 'all' | 'myGroup' | 'myProjects';

export type ProjectFeedItem = {
  id: string;
  authorName: string;
  title: string;
  /** Краткий текст / превью в карточке ленты. */
  body: string;
  /** Полное описание на экране проекта; если нет — показывается body. */
  fullDescription?: string;
  likes: number;
  inMyGroup: boolean;
  isMine: boolean;
  stack: string;
  meta: string;
};

export function getProjectDetailDescription(p: ProjectFeedItem): string {
  return p.fullDescription?.trim() ? p.fullDescription : p.body;
}

/** Текст описания как в макете «Лента проектов» (Figma). */
const MOCK_BODY_LONG =
  'Описание: Процесс включает в себя увлажнение и массаж рук, обработку кутикулы, подпиливание и придание ...';

export const MOCK_PROJECT_FEED: ProjectFeedItem[] = [
  {
    id: 'p-go',
    authorName: 'Коссе Иван Николаевич',
    title: 'Проект на GO',
    body: MOCK_BODY_LONG,
    fullDescription:
      'Описание: В проекте заложены принципы UX-дизайна, ориентированные на детей и подростков: понятные сценарии, крупные зоны нажатий и позитивная обратная связь. Задача — повысить мотивацию учеников через дружелюбный интерфейс и снижение когнитивной нагрузки.',
    likes: 11,
    inMyGroup: true,
    isMine: false,
    stack: 'Go, PostgreSQL',
    meta: '2 апреля',
  },
  {
    id: 'p-ivan',
    authorName: 'Иванов Иван Ниванович',
    title: 'Мой первый проект',
    body: MOCK_BODY_LONG,
    fullDescription:
      `${MOCK_BODY_LONG}\n\n` +
      'Это мой первый проект в ленте: собрал прототип по заданию преподавателя, оформил описание и залил в общий раздел группы. Буду рад обратной связи и советам, что улучшить в следующей версии.',
    likes: 13,
    inMyGroup: true,
    isMine: false,
    stack: 'Учебный проект',
    meta: '1 апреля',
  },
  {
    id: 'p1',
    authorName: 'Смирнов Алексей Петрович',
    title: 'Визуализатор сортировок',
    body:
      'Описание: анимация пузырьковой и быстрой сортировки на canvas. Можно менять скорость и размер массива.',
    fullDescription:
      'Описание: анимация пузырьковой и быстрой сортировки на canvas. Можно менять скорость и размер массива.\n\n' +
      'Реализация на чистом Canvas API: генерация массива, пошаговый пересчёт состояния, requestAnimationFrame. Есть панель настроек — размер массива (10–200) и задержка кадра. Исходники в открытом репозитории, лицензия MIT.',
    likes: 24,
    inMyGroup: true,
    isMine: false,
    stack: 'JavaScript, Canvas',
    meta: '2 апреля',
  },
  {
    id: 'p2',
    authorName: 'Петрова Мария Игоревна',
    title: 'Телеграм-бот для напоминаний ДЗ',
    body:
      'Описание: бот читает расписание из Google Sheets и шлёт напоминания за сутки до дедлайна.',
    fullDescription:
      'Описание: бот читает расписание из Google Sheets и шлёт напоминания за сутки до дедлайна.\n\n' +
      'Стек: Python 3.12, aiogram 3.x, сервисный аккаунт Google. Таблица: колонки «предмет», «задание», «дедлайн». Бот работает в группе класса, команды /today и /week. Хостинг на VPS, systemd unit для автозапуска.',
    likes: 8,
    inMyGroup: true,
    isMine: false,
    stack: 'Python, aiogram',
    meta: '30 марта',
  },
  {
    id: 'p3',
    authorName: 'Даниил Орлов',
    title: 'Лендинг школьного музея',
    body:
      'Описание: одностраничник с галереей и формой записи на экскурсию. Адаптив, тёмная тема.',
    fullDescription:
      'Описание: одностраничник с галереей и формой записи на экскурсию. Адаптив, тёмная тема.\n\n' +
      'Вёрстка по БЭМ, CSS-переменные для светлой/тёмной темы. Форма с валидацией на клиенте; отправка имитируется (демо). Галерея — CSS grid, ленивая подгрузка изображений.',
    likes: 15,
    inMyGroup: false,
    isMine: true,
    stack: 'HTML, CSS, JS',
    meta: '28 марта',
  },
  {
    id: 'p-mine2',
    authorName: 'Вы (демо)',
    title: 'Мой первый API',
    body: 'Описание: учебный CRUD на Express и SQLite для каталога книг.',
    fullDescription:
      'Описание: учебный CRUD на Express и SQLite для каталога книг.\n\n' +
      'Эндпоинты: GET/POST /books, GET/PATCH/DELETE /books/:id. SQLite файл в ./data. Задеплоено на Render free tier, cold start возможен.',
    likes: 3,
    inMyGroup: true,
    isMine: true,
    stack: 'Node.js, SQLite',
    meta: '25 марта',
  },
];

export function filterProjectFeedByTab(
  list: ProjectFeedItem[],
  tab: ProjectFeedTab
): ProjectFeedItem[] {
  if (tab === 'all') return list;
  if (tab === 'myGroup') return list.filter((p) => p.inMyGroup);
  return list.filter((p) => p.isMine);
}

export function getProjectFeedItemById(id: string): ProjectFeedItem | undefined {
  return MOCK_PROJECT_FEED.find((p) => p.id === id);
}

export function buildPublishedProject(input: {
  title: string;
  link: string;
  description: string;
  visibility: 'all' | 'group';
}): ProjectFeedItem {
  const desc = input.description.trim();
  const url = input.link.trim();
  const body = desc || url || 'Описание появится позже.';
  const fullParts = [
    desc ? `Описание: ${desc}` : '',
    url ? `Ссылка: ${url}` : '',
  ].filter(Boolean);
  return {
    id: `pub-${Date.now()}`,
    authorName: 'Вы',
    title: input.title.trim(),
    body,
    fullDescription: fullParts.length ? fullParts.join('\n\n') : undefined,
    likes: 0,
    inMyGroup: input.visibility === 'group',
    isMine: true,
    stack: url ? 'Ссылка' : 'Проект',
    meta: new Intl.DateTimeFormat('ru-RU', { day: 'numeric', month: 'long' }).format(new Date()),
  };
}

export type ProjectComment = {
  id: string;
  authorName: string;
  text: string;
};

/** Демо-комментарии как в макете «Подробнее о проекте». */
export function getMockCommentsForProject(_projectId: string): ProjectComment[] {
  return [
    { id: 'c1', authorName: 'Петя Васильев', text: 'Отличный проект, продолжай в том же духе' },
    { id: 'c2', authorName: 'Иванов Петр Сергеевич', text: 'Я бы сделал лучше 😇' },
    { id: 'c3', authorName: 'Канаева Анна Владимировна', text: '😀😀😀😀' },
  ];
}
