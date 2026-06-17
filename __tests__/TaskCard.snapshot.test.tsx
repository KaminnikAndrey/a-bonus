import TaskCard from '@/components/task/TaskCard';
import type { StudentTask } from '@/components/task/mockStudentTasks';
import { render } from '@testing-library/react-native';
import React from 'react';

const baseTask: StudentTask = {
  id: 'snap-1',
  title: 'Реализовать REST API для каталога',
  description: 'Краткое описание',
  sections: [],
  deadlineLabel: '20.04.26',
  rewardCoins: 15,
  courseName: 'Backend на Go',
  filter: 'active',
};

describe('TaskCard snapshots', () => {
  it('active task (default badge)', () => {
    const tree = render(<TaskCard task={baseTask} onPress={jest.fn()} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('overdue task', () => {
    const task: StudentTask = { ...baseTask, id: 'snap-2', filter: 'overdue' };
    const tree = render(<TaskCard task={task} onPress={jest.fn()} />).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('completed with custom badge', () => {
    const task: StudentTask = {
      ...baseTask,
      id: 'snap-3',
      filter: 'completed',
      statusBadge: { label: 'Принята', variant: 'accepted' },
    };
    const tree = render(<TaskCard task={task} onPress={jest.fn()} />).toJSON();
    expect(tree).toMatchSnapshot();
  });
});
