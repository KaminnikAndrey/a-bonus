import { MOCK_PROJECT_FEED, type ProjectFeedItem } from '@/services/feed/mockProjectFeed';
import React, {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react';

type ProjectFeedContextValue = {
  items: ProjectFeedItem[];
  addProject: (item: ProjectFeedItem) => void;
  toggleLike: (projectId: string) => void;
  isLiked: (projectId: string) => boolean;
  getLikeCount: (item: ProjectFeedItem) => number;
};

const ProjectFeedContext = createContext<ProjectFeedContextValue | null>(null);

export function ProjectFeedProvider({ children }: { children: ReactNode }) {
  const [published, setPublished] = useState<ProjectFeedItem[]>([]);
  const [likedIds, setLikedIds] = useState<Set<string>>(() => new Set());

  const items = useMemo(() => [...published, ...MOCK_PROJECT_FEED], [published]);
  const addProject = useCallback((item: ProjectFeedItem) => {
    setPublished((prev) => [item, ...prev]);
  }, []);

  const toggleLike = useCallback((projectId: string) => {
    setLikedIds((prev) => {
      const next = new Set(prev);
      if (next.has(projectId)) next.delete(projectId);
      else next.add(projectId);
      return next;
    });
  }, []);

  const isLiked = useCallback((projectId: string) => likedIds.has(projectId), [likedIds]);

  const getLikeCount = useCallback(
    (item: ProjectFeedItem) => item.likes + (likedIds.has(item.id) ? 1 : 0),
    [likedIds]
  );

  const value = useMemo(
    () => ({ items, addProject, toggleLike, isLiked, getLikeCount }),
    [items, addProject, toggleLike, isLiked, getLikeCount]
  );

  return <ProjectFeedContext.Provider value={value}>{children}</ProjectFeedContext.Provider>;
}

export function useProjectFeed() {
  const ctx = useContext(ProjectFeedContext);
  if (!ctx) {
    throw new Error('useProjectFeed must be used within ProjectFeedProvider');
  }
  return ctx;
}
