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

const BADGE_BY_VARIANT: Record<TaskStatusBadgeVariant, TaskStatusBadge> = {
  revision: { label: 'На доработке', variant: 'revision' },
  active: { label: 'Не выполнена', variant: 'notCompleted' },
  overdue: { label: 'Просрочена', variant: 'overdue' },
  completed: { label: 'Выполнена', variant: 'completed' },
  accepted: { label: 'Принята', variant: 'accepted' },
  review: { label: 'Ожидает проверки', variant: 'review' },
  notCompleted: { label: 'Не выполнена', variant: 'notCompleted' },
};

export function getTaskDetailBadge(task: StudentTask): TaskStatusBadge {
  if (task.statusBadge) return task.statusBadge;
  if (task.filter === 'overdue') return { label: 'Просрочена', variant: 'overdue' };
  if (task.filter === 'completed') return { label: 'Выполнена', variant: 'completed' };
  return { label: 'Не выполнена', variant: 'active' };
}

/** Объединяет мок-задачу с локальным состоянием (сдача / проверка). */
export function mergeStudentTaskWithState(
  base: StudentTask,
  state?: {
    statusVariant: TaskStatusBadgeVariant;
    filter?: TaskTabFilter;
    submittedAnswer: string;
    teacherComment?: string;
  }
): StudentTask {
  if (!state) return base;
  const statusBadge = BADGE_BY_VARIANT[state.statusVariant] ?? base.statusBadge;
  const showTeacherComment =
    state.statusVariant === 'revision' || state.statusVariant === 'accepted';
  return {
    ...base,
    filter: state.filter ?? base.filter,
    statusBadge,
    submittedAnswerPreview:
      state.statusVariant === 'review' ||
      state.statusVariant === 'accepted' ||
      state.statusVariant === 'completed'
        ? state.submittedAnswer
        : undefined,
    teacherComment: showTeacherComment
      ? state.teacherComment ?? base.teacherComment
      : undefined,
    initialAnswerDraft:
      state.statusVariant === 'notCompleted' || state.statusVariant === 'revision'
        ? state.submittedAnswer
        : undefined,
  };
}

/** Без локального состояния — не показываем комментарий там, где проверки ещё не было. */
export function stripIrrelevantTeacherCommentForBaseTask(task: StudentTask): StudentTask {
  const variant = task.statusBadge?.variant;
  if (variant === 'revision' || variant === 'accepted') return task;
  if (variant === 'review' || variant === 'notCompleted' || variant === 'active') {
    return { ...task, teacherComment: undefined };
  }
  return task;
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
  // —— Не выполнена (×4) ——
  {
    id: 'python-not-done',
    title: 'Калькулятор на Python',
    description: 'Консольная программа: сложение, вычитание, умножение и деление двух чисел.',
    descriptionSteps: [
      'Создайте файл calculator.py и подключите ввод с клавиатуры через input().',
      'Попросите пользователя ввести два числа и операцию (+, −, *, /).',
      'Обработайте деление на ноль отдельным сообщением об ошибке.',
      'Выведите результат в понятном формате, например: «12 + 5 = 17».',
      'Отправьте код файла или ссылку на репозиторий с инструкцией запуска.',
    ],
    sections: [],
    deadlineLabel: '28 июня, 23:59',
    rewardCoins: 10,
    rewardExp: 2,
    periodLabel: '10.06.26 - 28.06.26',
    courseName: 'Python, 8 «А»',
    filter: 'active',
    statusBadge: { label: 'Не выполнена', variant: 'notCompleted' },
  },
  {
    id: 'st-not-done-2',
    title: 'Анимация «Прыгающий мяч» в Scratch',
    description: 'Создайте спрайт мяча с отскоком от краёв сцены.',
    descriptionSteps: [
      'Добавьте спрайт «мяч» и фон по желанию.',
      'Настройте движение и поворот при касании края сцены.',
      'Добавьте звук отскока (опционально).',
      'Проверьте, что мяч не застревает в углу.',
      'Отправьте ссылку на проект Scratch.',
    ],
    sections: [],
    deadlineLabel: '30 июня, 18:00',
    rewardCoins: 15,
    rewardExp: 4,
    courseName: 'Scratch, 6 «В»',
    filter: 'active',
    statusBadge: { label: 'Не выполнена', variant: 'notCompleted' },
  },
  {
    id: 'st-not-done-3',
    title: 'REST API: список книг на Express',
    description: 'Учебный сервер с GET /books и POST /books, данные в памяти.',
    descriptionSteps: [
      'Инициализируйте проект: npm init, установите express.',
      'Реализуйте GET /books — массив объектов { id, title, author }.',
      'Реализуйте POST /books — добавление с авто-increment id.',
      'Проверьте запросы через curl или Postman.',
      'Отправьте ссылку на репозиторий и скриншот ответа API.',
    ],
    sections: [],
    deadlineLabel: '26 июня, 23:59',
    rewardCoins: 22,
    rewardExp: 5,
    periodLabel: '12.06.26 - 26.06.26',
    courseName: 'Backend на Node.js',
    filter: 'active',
    statusBadge: { label: 'Не выполнена', variant: 'notCompleted' },
  },
  {
    id: 'st-not-done-4',
    title: 'Эссе: «Как работает интернет»',
    description: 'Краткий текст (1–1,5 страницы) простым языком для одноклассников.',
    descriptionSteps: [
      'Объясните, что такое IP-адрес и доменное имя.',
      'Опишите роль DNS при открытии сайта в браузере.',
      'Приведите один пример HTTP-запроса (GET) и ответа сервера.',
      'Добавьте схему или список шагов «от клика до страницы».',
      'Отправьте PDF или документ Google Docs с доступом по ссылке.',
    ],
    sections: [],
    deadlineLabel: '1 июля, 12:00',
    rewardCoins: 12,
    courseName: 'Информатика, 8 «А»',
    filter: 'active',
    statusBadge: { label: 'Не выполнена', variant: 'notCompleted' },
  },

  // —— Ожидает проверки (×2) ——
  {
    id: 'python-awaiting-review',
    title: 'Таблица умножения 10×10',
    description: 'Вложенные циклы for и аккуратный вывод в консоль.',
    descriptionSteps: [
      'Используйте два вложенных цикла от 1 до 10.',
      'Выровняйте столбцы через f-строки или format.',
      'Не выводите таблицу одной длинной строкой — нужны переносы строк.',
      'Добавьте в начале файла комментарий с ФИО.',
      'Отправьте файл .py или ссылку на репозиторий.',
    ],
    sections: [],
    deadlineLabel: '20 июня, 23:59',
    rewardCoins: 12,
    rewardExp: 3,
    rewardLeadNote: 'первым трем!',
    periodLabel: '05.06.26 - 20.06.26',
    courseName: 'Python, 8 «А»',
    filter: 'active',
    statusBadge: { label: 'Ожидает проверки', variant: 'review' },
    submittedAnswerPreview:
      'for i in range(1, 11):\n    for j in range(1, 11):\n        print(f"{i*j:4}", end="")\n    print()',
  },
  {
    id: 'st-review-2',
    title: 'Лендинг «Мой любимый предмет»',
    description: 'Одностраничный сайт на HTML и CSS без JavaScript.',
    descriptionSteps: [
      'Сверстайте шапку, блок с текстом и блок с картинкой.',
      'Используйте flexbox или grid для раскладки.',
      'Подключите хотя бы один Google Font.',
      'Проверьте отображение на ширине 360px.',
      'Отправьте ссылку на GitHub Pages или архив с index.html.',
    ],
    sections: [],
    deadlineLabel: '22 июня, 21:00',
    rewardCoins: 20,
    rewardExp: 5,
    courseName: 'Веб-разработка',
    filter: 'active',
    statusBadge: { label: 'Ожидает проверки', variant: 'review' },
    submittedAnswerPreview: 'https://example.github.io/my-subject-landing/index.html',
  },

  // —— На доработке (×2) ——
  {
    id: 'python-revision',
    title: 'Сортировка списка чисел',
    description: 'Реализуйте пузырьковую или выборочную сортировку без sort().',
    descriptionSteps: [
      'Считайте список чисел из input или задайте в коде.',
      'Реализуйте алгоритм сортировки вручную.',
      'Выведите список до и после сортировки.',
      'Добавьте комментарии к основным шагам алгоритма.',
      'Исправьте замечания преподавателя и отправьте снова.',
    ],
    sections: [],
    deadlineLabel: '24 июня, 23:59',
    rewardCoins: 14,
    rewardExp: 4,
    periodLabel: '03.06.26 - 24.06.26',
    teacherComment:
      'Неверный синтаксис! Я же объяснял на занятии — исправьте отступы и проверьте границы цикла.',
    courseName: 'Python, 8 «А»',
    filter: 'active',
    statusBadge: { label: 'На доработке', variant: 'revision' },
    initialAnswerDraft: 'nums = [5, 2, 8, 1]\n# TODO: sort without .sort()',
  },
  {
    id: 'st-revision-2',
    title: 'Игра «Угадай число»',
    description: 'Компьютер загадывает число от 1 до 100, пользователь угадывает.',
    descriptionSteps: [
      'Используйте модуль random для загаданного числа.',
      'После каждой попытки подсказывайте «больше» или «меньше».',
      'Считайте количество попыток.',
      'Завершите игру сообщением о победе.',
      'Учтите комментарий преподавателя и отправьте исправленную версию.',
    ],
    sections: [],
    deadlineLabel: '19 июня, 20:00',
    rewardCoins: 18,
    courseName: 'Python, 9 «Б»',
    filter: 'active',
    statusBadge: { label: 'На доработке', variant: 'revision' },
    teacherComment: 'Нет обработки нечислового ввода — добавьте try/except или проверку isdigit().',
    initialAnswerDraft: 'import random\nsecret = random.randint(1, 100)\n# guess loop',
  },

  // —— Принята (×2) ——
  {
    id: 'python-accepted',
    title: 'Функция подсчёта слов в строке',
    description: 'Напишите функцию word_count(text), возвращающую число слов.',
    descriptionSteps: [
      'Разбейте строку на слова через split().',
      'Игнорируйте лишние пробелы по краям.',
      'Проверьте на пустой строке — должно быть 0.',
      'Добавьте 2–3 тестовых вызова в if __name__ == "__main__".',
      'Отправьте готовый файл .py.',
    ],
    sections: [],
    deadlineLabel: '10 июня, 23:59',
    rewardCoins: 12,
    rewardExp: 3,
    periodLabel: '25.05.26 - 10.06.26',
    teacherComment: 'Отличная работа! Все условия выполнены, награда будет начислена.',
    courseName: 'Python, 8 «А»',
    filter: 'completed',
    statusBadge: { label: 'Принята', variant: 'accepted' },
    submittedAnswerPreview:
      'def word_count(text):\n    return len(text.strip().split()) if text.strip() else 0',
  },
  {
    id: 'st-accepted-2',
    title: 'Мини-проект: TODO на React',
    description: 'Список дел с добавлением и удалением через useState.',
    descriptionSteps: [
      'Поле ввода и кнопка «Добавить».',
      'Список пунктов с кнопкой «Удалить» у каждого.',
      'Разбейте на компоненты App и TodoItem.',
      'README с командами npm install / npm start.',
      'Ссылка на репозиторий или деплой.',
    ],
    sections: [],
    deadlineLabel: '5 июня, 18:00',
    rewardCoins: 35,
    rewardExp: 8,
    teacherComment: 'Чистый код и понятный интерфейс. Молодец!',
    courseName: 'Веб-разработка',
    filter: 'completed',
    statusBadge: { label: 'Принята', variant: 'accepted' },
    submittedAnswerPreview: 'https://github.com/demo-student/react-todo-mini',
  },

  // —— Просрочена (×2) ——
  {
    id: 'st-overdue-1',
    title: 'Контрольная: массивы',
    description: 'Письменное решение пяти задач из методички (стр. 42–44).',
    sections: [
      {
        title: 'Что нужно сделать',
        body: 'Решите 5 задач: ход решения и ответ. Допускается фото тетради.',
      },
      {
        title: 'Формат сдачи',
        body: 'PDF или архив с фото. Имена файлов: Фамилия_задачаN.jpg.',
      },
    ],
    deadlineLabel: '5 июня, 20:00',
    rewardCoins: 40,
    courseName: 'Алгоритмы',
    filter: 'overdue',
    statusBadge: { label: 'Просрочена', variant: 'overdue' },
  },
  {
    id: 'st-overdue-2',
    title: 'Диаграмма классов UML',
    description: 'Нарисуйте диаграмму для системы «Библиотека»: Книга, Читатель, Выдача.',
    descriptionSteps: [
      'Выделите не менее трёх классов с атрибутами.',
      'Покажите связи: ассоциация, агрегация или наследование.',
      'Подпишите кратко роли классов.',
      'Экспорт в PNG или PDF.',
      'Отправьте файл или ссылку на draw.io.',
    ],
    sections: [],
    deadlineLabel: '12 июня, 12:00',
    rewardCoins: 25,
    courseName: 'Проектирование ПО',
    filter: 'overdue',
    statusBadge: { label: 'Просрочена', variant: 'overdue' },
  },

  // —— Выполнена (×2) ——
  {
    id: 'st-completed-1',
    title: 'Презентация «Как работает браузер»',
    description: '5–7 слайдов: DNS, HTTP, отображение страницы.',
    sections: [
      {
        title: 'Критерии',
        body: 'Есть IP, DNS, схема запроса. Тезисы, не простыня текста.',
      },
    ],
    deadlineLabel: '25 мая, 12:00',
    rewardCoins: 60,
    courseName: 'Информатика',
    filter: 'completed',
    statusBadge: { label: 'Выполнена', variant: 'completed' },
    submittedAnswerPreview: 'https://docs.google.com/presentation/d/demo-browser-deck',
  },
  {
    id: 'st-completed-2',
    title: 'Тест по основам Git',
    description: 'Онлайн-тест в LMS: ветки, commit, merge.',
    descriptionSteps: [
      'Пройдите тест в личном кабинете LMS.',
      'Минимум 80% правильных ответов.',
      'При необходимости — одна пересдача.',
    ],
    sections: [],
    deadlineLabel: '20 мая, 23:59',
    rewardCoins: 8,
    courseName: 'Инструменты разработчика',
    filter: 'completed',
    statusBadge: { label: 'Выполнена', variant: 'completed' },
    submittedAnswerPreview: 'Тест пройден: 92% (18/20). Дата: 19.05.2026.',
  },
];
