import { ProjectFeedProvider, useProjectFeed } from '@/contexts/ProjectFeedContext';
import { buildPublishedProject } from '@/services/feed/mockProjectFeed';
import { createTestStore, seedMockStudent } from '@/__tests__/helpers/testStore';
import { renderHook, act } from '@testing-library/react-native';
import React, { type ReactNode } from 'react';
import { Provider } from 'react-redux';

function wrapper(store: ReturnType<typeof createTestStore>) {
  return function Wrap({ children }: { children: ReactNode }) {
    return (
      <Provider store={store}>
        <ProjectFeedProvider>{children}</ProjectFeedProvider>
      </Provider>
    );
  };
}

describe('ProjectFeedContext mutations', () => {
  it('addProject prepends to feed', () => {
    const store = createTestStore();
    seedMockStudent(store);
    const { result } = renderHook(() => useProjectFeed(), { wrapper: wrapper(store) });

    const before = result.current.items.length;
    const item = buildPublishedProject({
      title: 'Новый проект',
      link: '',
      description: 'Описание',
      visibility: 'all',
    });

    act(() => {
      result.current.addProject(item);
    });

    expect(result.current.items.length).toBe(before + 1);
    expect(result.current.items[0].title).toBe('Новый проект');
  });

  it('hideProject removes item from visible list', () => {
    const store = createTestStore();
    seedMockStudent(store);
    const { result } = renderHook(() => useProjectFeed(), { wrapper: wrapper(store) });

    const targetId = result.current.items[0]?.id;
    expect(targetId).toBeTruthy();

    act(() => {
      result.current.hideProject(targetId!);
    });

    expect(result.current.items.find((p) => p.id === targetId)).toBeUndefined();
    expect(result.current.isProjectHidden(targetId!)).toBe(true);
  });

  it('toggleLike increments count once', () => {
    const store = createTestStore();
    seedMockStudent(store);
    const { result } = renderHook(() => useProjectFeed(), { wrapper: wrapper(store) });

    const item = result.current.items[0];
    const base = result.current.getLikeCount(item);

    act(() => {
      result.current.toggleLike(item.id);
    });
    expect(result.current.isLiked(item.id)).toBe(true);
    expect(result.current.getLikeCount(item)).toBe(base + 1);

    act(() => {
      result.current.toggleLike(item.id);
    });
    expect(result.current.isLiked(item.id)).toBe(false);
    expect(result.current.getLikeCount(item)).toBe(base);
  });
});
