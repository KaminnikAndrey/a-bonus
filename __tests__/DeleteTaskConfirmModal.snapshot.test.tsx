import DeleteTaskConfirmModal from '@/components/groupTasks/DeleteTaskConfirmModal';
import { fireEvent, render } from '@testing-library/react-native';
import React from 'react';

describe('DeleteTaskConfirmModal', () => {
  it('matches snapshot when visible', () => {
    const tree = render(
      <DeleteTaskConfirmModal visible onCancel={jest.fn()} onConfirm={jest.fn()} />
    ).toJSON();
    expect(tree).toMatchSnapshot();
  });

  it('calls onConfirm when Подтвердить pressed', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = render(
      <DeleteTaskConfirmModal visible onCancel={onCancel} onConfirm={onConfirm} />
    );
    fireEvent.press(getByText('Подтвердить'));
    expect(onConfirm).toHaveBeenCalledTimes(1);
    expect(onCancel).not.toHaveBeenCalled();
  });

  it('calls onCancel when Отмена pressed', () => {
    const onConfirm = jest.fn();
    const onCancel = jest.fn();
    const { getByText } = render(
      <DeleteTaskConfirmModal visible onCancel={onCancel} onConfirm={onConfirm} />
    );
    fireEvent.press(getByText('Отмена'));
    expect(onCancel).toHaveBeenCalledTimes(1);
    expect(onConfirm).not.toHaveBeenCalled();
  });
});
