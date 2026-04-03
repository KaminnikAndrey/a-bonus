export type ProjectFeedItem = {
  id: string;
  title: string;
  body: string;
  meta: string;
  authorName: string;
  stack: string;
};

export const MOCK_PROJECT_FEED: ProjectFeedItem[] = [
  {
    id: 'p1',
    title: 'Визуализатор сортировок',
    body:
      'Сделал анимацию пузырьковой и быстрой сортировки на canvas. Код на GitHub, можно менять скорость и размер массива. Буду рад фидбеку в комментариях.',
    meta: '2 апреля',
    authorName: 'Алексей · 9 «Б»',
    stack: 'JavaScript, Canvas',
  },
  {
    id: 'p2',
    title: 'Телеграм-бот для напоминаний ДЗ',
    body:
      'Бот парсит расписание из таблицы и шлёт напоминания за день до дедлайна. Планирую добавить интеграцию с Google Calendar.',
    meta: '30 марта',
    authorName: 'Мария · 10 «А»',
    stack: 'Python, aiogram',
  },
  {
    id: 'p3',
    title: 'Лендинг школьного музея',
    body:
      'Одностраничник с галереей и формой записи на экскурсию. Адаптив вёрстка, тёмная тема по переключателю.',
    meta: '28 марта',
    authorName: 'Даниил · 9 «В»',
    stack: 'HTML, CSS, немного JS',
  },
];

export function getProjectFeedItemById(id: string): ProjectFeedItem | undefined {
  return MOCK_PROJECT_FEED.find((p) => p.id === id);
}
