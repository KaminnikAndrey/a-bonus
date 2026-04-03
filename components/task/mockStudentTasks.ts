export type TaskTabFilter = 'active' | 'overdue' | 'completed';

export type TaskDetailSection = {
  title: string;
  body: string;
};

/** Бейдж статуса на экране «Подробнее о задаче». */
export type TaskStatusBadgeVariant =
  | 'revision'
  | 'active'
  | 'overdue'
  | 'completed'
  | 'accepted'
  /** Отправлено, ждём преподавателя — кнопка сдачи неактивна. */
  | 'review'
  /** Не зачтено / нужно переделать — кнопка «Отправить» снова доступна. */
  | 'notCompleted';

export type TaskStatusBadge = {
  label: string;
  variant: TaskStatusBadgeVariant;
};

export type StudentTask = {
  id: string;
  title: string;
  /** Краткий лид под заголовком. */
  description: string;
  /** Подробные блоки (как на экране задачи в макете). */
  sections: TaskDetailSection[];
  deadlineLabel: string;
  rewardCoins: number;
  courseName: string;
  filter: TaskTabFilter;
  /** Если задан — показывается на детальном экране; иначе бейдж выводится из filter. */
  statusBadge?: TaskStatusBadge;
  /** EXP к награде, напр. «+ 3 EXP». */
  rewardExp?: number;
  /** Доп. текст к награде, напр. «первым трем!». */
  rewardLeadNote?: string;
  /** Период в формате макета, напр. «13.04.26 - 20.04.26». */
  periodLabel?: string;
  /** Пронумерованное описание под заголовком «Описание». */
  descriptionSteps?: string[];
  /** Блок «Комментарий преподавателя». */
  teacherComment?: string;
  /** Демо: предзаполненный черновик (статус «Не выполнена» и т.п.). */
  initialAnswerDraft?: string;
  /** Текст отправленного ответа только для чтения при «Ожидает проверки». */
  submittedAnswerPreview?: string;
};

export function getTaskDetailBadge(task: StudentTask): TaskStatusBadge {
  if (task.statusBadge) return task.statusBadge;
  if (task.filter === 'overdue') return { label: 'Просрочена', variant: 'overdue' };
  if (task.filter === 'completed') return { label: 'Выполнена', variant: 'completed' };
  return { label: 'Не выполнена', variant: 'active' };
}

const BADGE_VARIANT_COLORS: Record<
  TaskStatusBadgeVariant,
  { backgroundColor: string; textColor: string }
> = {
  revision: { backgroundColor: '#FEF9C3', textColor: '#A16207' },
  /** Обычные задачи «в работе» — тот же текст и палитра, что у явного «Не выполнена». */
  active: { backgroundColor: '#FFEBEB', textColor: '#C62828' },
  overdue: { backgroundColor: '#FEE2E2', textColor: '#B91C1C' },
  completed: { backgroundColor: '#DCFCE7', textColor: '#15803D' },
  /** Работа принята преподавателем (макет «Принята»). */
  accepted: { backgroundColor: '#ECFDF5', textColor: '#166534' },
  /** Как «На доработке» (revision). */
  review: { backgroundColor: '#FEF9C3', textColor: '#A16207' },
  notCompleted: { backgroundColor: '#FFEBEB', textColor: '#C62828' },
};

export function getTaskBadgeColors(variant: TaskStatusBadgeVariant) {
  return BADGE_VARIANT_COLORS[variant];
}

export const MOCK_STUDENT_TASKS: StudentTask[] = [
  {
    id: 'python-revision',
    title: 'Задача на написание кода python',
    description: 'Пошаговое задание: среда, синтаксис и сдача работы.',
    descriptionSteps: [
      'Откройте среду разработки (IDLE, VS Code или PyCharm) и создайте новый файл .py.',
      'Найдите в материалах урока пример с выводом в консоль и ориентируйтесь на него.',
      'Проверьте настройки интерпретатора Python 3.x в проекте.',
      'Напишите программу по условию: следите за синтаксисом, отступами и именами переменных.',
      'Сохраните файл, запустите код локально и подготовьте ответ — ссылку на Scratch или текст решения.',
    ],
    sections: [],
    deadlineLabel: '20 апреля, 23:59',
    rewardCoins: 12,
    rewardExp: 3,
    rewardLeadNote: 'первым трем!',
    periodLabel: '13.04.26 - 20.04.26',
    teacherComment:
      'Неверный синтаксис! Я же объяснял на занятии все, исправляй давай!',
    courseName: 'Python, 8 «А»',
    filter: 'active',
    statusBadge: { label: 'На доработке', variant: 'revision' },
  },
  {
    id: 'python-not-done',
    title: 'Задача на написание кода python',
    description: 'Пошаговое задание: среда, синтаксис и сдача работы.',
    descriptionSteps: [
      'Откройте среду разработки (IDLE, VS Code или PyCharm) и создайте новый файл .py.',
      'Найдите в материалах урока пример с выводом в консоль и ориентируйтесь на него.',
      'Проверьте настройки интерпретатора Python 3.x в проекте.',
      'Напишите программу по условию: следите за синтаксисом, отступами и именами переменных.',
      'Сохраните файл, запустите код локально и подготовьте ответ — ссылку на Scratch или текст решения.',
    ],
    sections: [],
    deadlineLabel: '20 апреля, 23:59',
    rewardCoins: 12,
    rewardExp: 3,
    rewardLeadNote: 'первым трем!',
    periodLabel: '13.04.26 - 20.04.26',
    teacherComment:
      'Неверный синтаксис! Я же объяснял на занятии все, исправляй давай!',
    courseName: 'Python, 8 «А»',
    filter: 'active',
    statusBadge: { label: 'Не выполнена', variant: 'notCompleted' },
    initialAnswerDraft: 'Привет я Петя\nhttps://www.google.com/',
  },
  {
    id: 'python-awaiting-review',
    title: 'Задача на написание кода python',
    description: 'Пошаговое задание: среда, синтаксис и сдача работы.',
    descriptionSteps: [
      'Откройте среду разработки (IDLE, VS Code или PyCharm) и создайте новый файл .py.',
      'Найдите в материалах урока пример с выводом в консоль и ориентируйтесь на него.',
      'Проверьте настройки интерпретатора Python 3.x в проекте.',
      'Напишите программу по условию: следите за синтаксисом, отступами и именами переменных.',
      'Сохраните файл, запустите код локально и подготовьте ответ — ссылку на Scratch или текст решения.',
    ],
    sections: [],
    deadlineLabel: '20 апреля, 23:59',
    rewardCoins: 12,
    rewardExp: 3,
    rewardLeadNote: 'первым трем!',
    periodLabel: '13.04.26 - 20.04.26',
    teacherComment:
      'Неверный синтаксис! Я же объяснял на занятии все, исправляй давай!',
    courseName: 'Python, 8 «А»',
    filter: 'active',
    statusBadge: { label: 'Ожидает проверки', variant: 'review' },
    submittedAnswerPreview: 'Привет я Петя\nhttps://www.google.com/',
  },
  {
    id: 'python-accepted',
    title: 'Задача на написание кода python',
    description: 'Пошаговое задание: среда, синтаксис и сдача работы.',
    descriptionSteps: [
      'Откройте среду разработки (IDLE, VS Code или PyCharm) и создайте новый файл .py.',
      'Найдите в материалах урока пример с выводом в консоль и ориентируйтесь на него.',
      'Проверьте настройки интерпретатора Python 3.x в проекте.',
      'Напишите программу по условию: следите за синтаксисом, отступами и именами переменных.',
      'Сохраните файл, запустите код локально и подготовьте ответ — ссылку на Scratch или текст решения.',
    ],
    sections: [],
    deadlineLabel: '20 апреля, 23:59',
    rewardCoins: 12,
    rewardExp: 3,
    rewardLeadNote: 'первым трем!',
    periodLabel: '13.04.26 - 20.04.26',
    teacherComment:
      'Неверный синтаксис! Я же объяснял на занятии все, исправляй давай!',
    courseName: 'Python, 8 «А»',
    filter: 'completed',
    statusBadge: { label: 'Принята', variant: 'accepted' },
  },
  {
    id: '1',
    title: 'Решить задачу на циклы',
    description: 'Таблица умножения 10×10 на Python — базовая тренировка вложенных циклов.',
    sections: [
      {
        title: 'Цель',
        body: 'Закрепить работу с циклами for и вложенными циклами, форматированием вывода в консоль.',
      },
      {
        title: 'Что нужно сделать',
        body: 'Напишите программу, которая выводит таблицу умножения от 1×1 до 10×10. Числа выровняйте в столбцах так, чтобы таблица читалась в консоли (можно через f-строки или format).',
      },
      {
        title: 'Формат сдачи',
        body: 'Прикрепите файл .py или дайте ссылку на репозиторий (GitHub / GitLab). В комментарии укажите, как запустить скрипт, если нужны аргументы.',
      },
      {
        title: 'Критерии проверки',
        body: 'Корректные границы циклов (1…10), нет жёстко забитой «картинки» таблицы — именно расчёт в циклах. Код читаемый, есть комментарий с ФИО и группой.',
      },
    ],
    deadlineLabel: '15 апреля, 23:59',
    rewardCoins: 50,
    courseName: 'Python, 9 «Б»',
    filter: 'active',
  },
  {
    id: '2',
    title: 'Мини-проект: TODO на React',
    description: 'Интерактивный список дел на React с локальным состоянием.',
    sections: [
      {
        title: 'Цель',
        body: 'Научиться управлять списком элементов в UI: добавление, отображение и удаление через состояние компонента.',
      },
      {
        title: 'Что нужно сделать',
        body: 'Создайте приложение со списком задач: поле ввода и кнопка «Добавить», каждый пункт с кнопкой «Удалить». Обязательно используйте useState; разбивка на компоненты приветствуется.',
      },
      {
        title: 'Формат сдачи',
        body: 'Ссылка на репозиторий или на задеплоенную демо-версию (Vercel / Netlify / GitHub Pages). В README кратко опишите, как установить и запустить проект локально.',
      },
      {
        title: 'Критерии проверки',
        body: 'Нет ошибок в консоли, состояние не «теряется» при типичных действиях, интерфейс понятен без инструкции. Плагиат исключается — решение должно быть вашим.',
      },
    ],
    deadlineLabel: '18 апреля, 18:00',
    rewardCoins: 80,
    courseName: 'Веб-разработка',
    filter: 'active',
  },
  {
    id: '3',
    title: 'Контрольная: массивы',
    description: 'Письменное решение задач по массивам из методички.',
    sections: [
      {
        title: 'Цель',
        body: 'Проверить умение работать с индексацией, проходом по массиву и базовыми алгоритмами (поиск, сумма, фильтрация).',
      },
      {
        title: 'Что нужно сделать',
        body: 'Решите 5 задач из методички, страницы 42–44. Каждая задача — ход решения и ответ. Рисунки и схемы допускаются от руки с последующей фотофиксацией.',
      },
      {
        title: 'Формат сдачи',
        body: 'Чёткие фото или скан всех листов одним архивом / альбомом. Имя файлов: Фамилия_задачаN.jpg. Либо один PDF.',
      },
      {
        title: 'Критерии проверки',
        body: 'Виден ход решения, не только ответ. Задачи пронумерованы в соответствии с методичкой. Читаемый почерк или печатный текст.',
      },
    ],
    deadlineLabel: '28 марта, 20:00',
    rewardCoins: 40,
    courseName: 'Алгоритмы',
    filter: 'overdue',
  },
  {
    id: '4',
    title: 'Презентация по теме «Сети»',
    description: 'Краткая презентация об основах сетей и работе браузера.',
    sections: [
      {
        title: 'Цель',
        body: 'Объяснить простыми словами, как устроены IP, DNS и что происходит при вводе адреса в браузере.',
      },
      {
        title: 'Что нужно сделать',
        body: '5–7 слайдов: определения, пример IP и домена, схема «запрос в браузере» (клиент → DNS → сервер). Без копирования больших кусков из Википедии.',
      },
      {
        title: 'Формат сдачи',
        body: 'Файл .pptx / .pdf или ссылка на Google Slides с правами «по ссылке» для просмотра.',
      },
      {
        title: 'Критерии проверки',
        body: 'Логичная структура, на слайдах — тезисы, а не сплошной текст. Упомянуты IP, DNS и хотя бы один пример запроса.',
      },
    ],
    deadlineLabel: '1 марта, 12:00',
    rewardCoins: 60,
    courseName: 'Информатика',
    filter: 'completed',
  },
];
