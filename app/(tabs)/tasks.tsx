import TaskCard from '@/components/task/TaskCard';
import { MOCK_STUDENT_TASKS, TaskTabFilter } from '@/components/task/mockStudentTasks';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FILTERS: { key: TaskTabFilter; label: string }[] = [
  { key: 'active', label: 'В работе' },
  { key: 'overdue', label: 'Просроченные' },
  { key: 'completed', label: 'Выполненные' },
];

export default function TasksScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const [filter, setFilter] = useState<TaskTabFilter>('active');

  const tasks = useMemo(() => MOCK_STUDENT_TASKS.filter((t) => t.filter === filter), [filter]);

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Ваши задачи</Text>
      </View>
      <View style={styles.chipsRow}>
        {FILTERS.map((f) => {
          const active = filter === f.key;
          return (
            <Pressable
              key={f.key}
              onPress={() => setFilter(f.key)}
              style={[
                styles.chip,
                {
                  backgroundColor: active ? colors.primary : colors.background,
                  borderColor: active ? colors.primary : colors.border,
                },
              ]}>
              <Text style={[styles.chipLabel, { color: active ? '#fff' : colors.text }]}>{f.label}</Text>
            </Pressable>
          );
        })}
      </View>
      <FlatList
        data={tasks}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.placeholder }]}>
            В этой категории пока нет задач.
          </Text>
        }
        renderItem={({ item }) => (
          <TaskCard task={item} onPress={() => router.push(`/task/${item.id}`)} />
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    paddingHorizontal: 16,
    marginBottom: 12,
  },
  chip: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
  },
  chipLabel: {
    fontSize: 14,
    fontWeight: '600',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    marginTop: 32,
    fontSize: 16,
  },
});
