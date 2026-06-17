import {
  buildPublishedProject,
  filterProjectFeedByTab,
  getProjectDetailDescription,
  getProjectFeedItemById,
  type ProjectFeedItem,
} from '@/services/feed/mockProjectFeed';

const sample: ProjectFeedItem[] = [
  {
    id: 'a',
    authorName: 'A',
    title: 'T1',
    body: 'short',
    fullDescription: 'full',
    likes: 1,
    inMyGroup: true,
    isMine: false,
    stack: 'x',
    meta: 'm',
  },
  {
    id: 'b',
    authorName: 'B',
    title: 'T2',
    body: 'only body',
    likes: 0,
    inMyGroup: false,
    isMine: true,
    stack: 'y',
    meta: 'm',
  },
];

describe('filterProjectFeedByTab', () => {
  it('returns all for tab all', () => {
    expect(filterProjectFeedByTab(sample, 'all')).toHaveLength(2);
  });

  it('filters myGroup', () => {
    expect(filterProjectFeedByTab(sample, 'myGroup').map((p) => p.id)).toEqual(['a']);
  });

  it('filters myProjects', () => {
    expect(filterProjectFeedByTab(sample, 'myProjects').map((p) => p.id)).toEqual(['b']);
  });
});

describe('getProjectDetailDescription', () => {
  it('prefers fullDescription', () => {
    expect(getProjectDetailDescription(sample[0])).toBe('full');
  });

  it('falls back to body', () => {
    expect(getProjectDetailDescription(sample[1])).toBe('only body');
  });
});

describe('getProjectFeedItemById', () => {
  it('finds student mock item', () => {
    expect(getProjectFeedItemById('p-go')?.title).toBe('Проект на GO');
  });

  it('finds teacher mock item', () => {
    expect(getProjectFeedItemById('t-p1')?.authorName).toContain('Преподаватель');
  });

  it('returns undefined for unknown id', () => {
    expect(getProjectFeedItemById('missing')).toBeUndefined();
  });
});

describe('buildPublishedProject', () => {
  beforeEach(() => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-04-02T10:00:00Z'));
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('marks group visibility', () => {
    const item = buildPublishedProject({
      title: ' My title ',
      link: '',
      description: 'Desc',
      visibility: 'group',
    });
    expect(item.inMyGroup).toBe(true);
    expect(item.isMine).toBe(true);
    expect(item.title).toBe('My title');
    expect(item.body).toContain('Desc');
  });

  it('uses custom author name', () => {
    const item = buildPublishedProject(
      { title: 'X', link: 'https://x.dev', description: '', visibility: 'all' },
      { authorName: 'Иван' }
    );
    expect(item.authorName).toBe('Иван');
    expect(item.stack).toBe('Ссылка');
  });
});
