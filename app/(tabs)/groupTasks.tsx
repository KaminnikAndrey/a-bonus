import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { hydrateMockCreatedTasks } from '@/services/groupTasks/mockCreatedTasksStore';
import { hydrateMockDeletedTeacherTasks } from '@/services/groupTasks/mockDeletedTeacherTasksStore';
import {
  getMockTeacherGroupTasksMerged,
  getMockTeacherGroupTaskTabs,
  type TeacherGroupTaskCard,
} from '@/services/groupTasks/mockTeacherGroupTasks';
import { userSelector } from '@/stores/auth/authStore';
import { Ionicons } from '@expo/vector-icons';
import type { Href } from 'expo-router';
import { useRouter } from 'expo-router';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const TAB_PURPLE = '#6766AA';

function formatShortRu(iso: string): string {
  const [y, m, d] = iso.split('-').map(Number);
  if (!y || !m || !d) return iso;
  return `${String(d).padStart(2, '0')}.${String(m).padStart(2, '0')}.${String(y).slice(-2)}`;
}

function TaskCard({
  item,
  colors,
  onPress,
}: {
  item: TeacherGroupTaskCard;
  colors: (typeof Colors)['light'];
  onPress: () => void;
}) {
  const range = `${formatShortRu(item.dateFrom)} - ${formatShortRu(item.dateTo)}`;
  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.background, borderColor: colors.border },
        pressed && { opacity: 0.92 },
      ]}>
      <Text style={styles.cardDates}>{range}</Text>
      <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
      <Text style={[styles.cardReward, { color: colors.text }]}>{item.reward}</Text>
    </Pressable>
  );
}

export default function GroupTasksScreen() {
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useSelector(userSelector);
  const teacherId =
    user?.id != null && String(user.id).trim() !== '' ? String(user.id) : 'unknown';

  /** Локальные мок-задачи по группам для любого преподавателя (до API). Раньше только mock-teacher — из-за этого в «демо» показывалась заглушка про сервер. */
  const useOfflineTeacherTasksUi = useMemo(() => {
    const role = String(user?.role ?? '').toLowerCase();
    return role === 'teacher' && user?.id != null && String(user.id).trim() !== '';
  }, [user?.role, user?.id]);

  const tabs = useMemo(
    () => (useOfflineTeacherTasksUi ? getMockTeacherGroupTaskTabs() : []),
    [useOfflineTeacherTasksUi]
  );
  const [selectedId, setSelectedId] = useState(tabs[0]?.id ?? '');

  const [listTick, setListTick] = useState(0);

  useEffect(() => {
    const first = tabs[0]?.id ?? '';
    setSelectedId((prev) => (tabs.some((t) => t.id === prev) ? prev : first));
  }, [tabs]);

  useFocusEffect(
    useCallback(() => {
      if (!useOfflineTeacherTasksUi) return;
      let cancelled = false;
      void (async () => {
        await hydrateMockCreatedTasks(teacherId);
        await hydrateMockDeletedTeacherTasks(teacherId);
        if (!cancelled) setListTick((t) => t + 1);
      })();
      return () => {
        cancelled = true;
      };
    }, [useOfflineTeacherTasksUi, teacherId])
  );

  const { active, overdue } = useMemo(
    () => getMockTeacherGroupTasksMerged(selectedId, teacherId),
    [selectedId, listTick, teacherId]
  );

  if (!user || String(user.role ?? '').toLowerCase() !== 'teacher') {
    return (
      <SafeAreaView edges={['top']} style={styles.safe}>
        <Text style={[styles.fallback, { color: colors.placeholder }]}>
          Раздел доступен только преподавателям.
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.headerSide}
          onPress={() => router.push('/groupTask/create' as Href)}
          accessibilityLabel="Добавить задачу"
          hitSlop={12}>
          <Ionicons name="add" size={28} color={colors.text} />
        </Pressable>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={2}>
          Задачи по группам
        </Text>
        <View style={styles.headerSide} />
      </View>

      {tabs.length > 0 ? (
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.pillsScroll}
          style={styles.pillsRow}>
          {tabs.map((tab) => {
            const on = tab.id === selectedId;
            return (
              <Pressable
                key={tab.id}
                onPress={() => setSelectedId(tab.id)}
                style={[
                  styles.pill,
                  {
                    backgroundColor: on ? TAB_PURPLE : colors.background,
                    borderColor: on ? TAB_PURPLE : colors.border,
                  },
                ]}>
                <Text
                  style={[styles.pillText, { color: on ? '#fff' : colors.placeholder }]}
                  numberOfLines={2}>
                  {tab.name}
                </Text>
              </Pressable>
            );
          })}
        </ScrollView>
      ) : (
        <Text style={[styles.noGroupsHint, { color: colors.placeholder }]}>
          Не удалось загрузить список групп. Проверьте, что вы вошли как преподаватель.
        </Text>
      )}

      <ScrollView
        style={styles.body}
        contentContainerStyle={styles.bodyContent}
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.sectionTitle, { color: colors.text }]}>Активные</Text>
        {active.length === 0 ? (
          <Text style={[styles.empty, { color: colors.placeholder }]}>Нет активных задач.</Text>
        ) : (
          active.map((item) => (
            <TaskCard
              key={item.id}
              item={item}
              colors={colors}
              onPress={() => router.push(`/groupTask/${item.id}` as Href)}
            />
          ))
        )}

        <Text style={[styles.sectionTitle, styles.sectionSpaced, { color: colors.text }]}>
          Просроченные
        </Text>
        {overdue.length === 0 ? (
          <Text style={[styles.empty, { color: colors.placeholder }]}>Нет просроченных задач.</Text>
        ) : (
          overdue.map((item) => (
            <TaskCard
              key={item.id}
              item={item}
              colors={colors}
              onPress={() => router.push(`/groupTask/${item.id}` as Href)}
            />
          ))
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  fallback: {
    textAlign: 'center',
    marginTop: 48,
    paddingHorizontal: 24,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  headerSide: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerTitle: {
    flex: 1,
    fontSize: 22,
    fontWeight: '700',
    textAlign: 'center',
  },
  noGroupsHint: {
    paddingHorizontal: 16,
    paddingBottom: 12,
    fontSize: 15,
  },
  pillsRow: {
    maxHeight: 70,
    flexGrow: 0,
  },
  pillsScroll: {
    paddingHorizontal: 16,
    paddingBottom: 8,
    gap: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  pill: {
    paddingHorizontal: 22,
    paddingVertical: 10,
    borderRadius: 26,
    borderWidth: 1,
    maxWidth: 260,
    justifyContent: 'center',
    alignItems: 'center',
  },
  pillText: {
    fontSize: 16,
    fontWeight: '600',
    textAlign: 'center',
  },
  body: {
    flex: 1,
  },
  bodyContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 12,
  },
  sectionSpaced: {
    marginTop: 20,
  },
  empty: {
    fontSize: 15,
    marginBottom: 8,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 25,
    marginBottom: 10,
  },
  cardDates: {
    fontSize: 13,
    marginBottom: 6,
    color: '#000000',
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
  },
  cardReward: {
    fontSize: 15,
    fontWeight: '700',
  },
});
