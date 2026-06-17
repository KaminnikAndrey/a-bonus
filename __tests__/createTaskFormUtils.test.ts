import {
  buildTaskRewardLine,
  parseDdMmYyToIso,
  todayIsoLocal,
} from '@/services/groupTasks/createTaskFormUtils';

describe('parseDdMmYyToIso', () => {
  it('parses dd.mm.yy', () => {
    expect(parseDdMmYyToIso('05.03.26')).toBe('2026-03-05');
  });

  it('parses dd.mm.yyyy', () => {
    expect(parseDdMmYyToIso('1.12.2025')).toBe('2025-12-01');
  });

  it('returns null for invalid format', () => {
    expect(parseDdMmYyToIso('2026-03-05')).toBeNull();
    expect(parseDdMmYyToIso('')).toBeNull();
    expect(parseDdMmYyToIso('32.01.26')).toBeNull();
    expect(parseDdMmYyToIso('05.13.26')).toBeNull();
  });
});

describe('buildTaskRewardLine', () => {
  it('formats coins only', () => {
    expect(buildTaskRewardLine('10', '')).toBe('10 коинов');
  });

  it('formats coins and EXP bonus', () => {
    expect(buildTaskRewardLine('5', '3')).toBe('5 коинов + 3 EXP первым трем!');
  });

  it('uses zero coins when empty', () => {
    expect(buildTaskRewardLine('', '2')).toBe('0 коинов + 2 EXP первым трем!');
  });
});

describe('todayIsoLocal', () => {
  it('returns YYYY-MM-DD for mocked date', () => {
    jest.useFakeTimers();
    jest.setSystemTime(new Date('2026-05-19T12:00:00'));
    expect(todayIsoLocal()).toBe('2026-05-19');
    jest.useRealTimers();
  });
});
