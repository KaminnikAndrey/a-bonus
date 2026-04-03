import { StudentTask, TaskTabFilter } from '@/components/task/mockStudentTasks';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

const FILTER_LABELS: Record<TaskTabFilter, string> = {
  active: 'Активна',
  overdue: 'Просрочена',
  completed: 'Выполнена',
};

type Props = {
  task: StudentTask;
  onPress: () => void;
};

export default function TaskCard({ task, onPress }: Props) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const badgeColors = {
    active: { bg: colors.primaryLight + '44', text: colors.primary },
    overdue: { bg: '#FFEBEE', text: '#C62828' },
    completed: { bg: colors.successLight, text: colors.success },
  };
  const badge = badgeColors[task.filter];

  return (
    <Pressable
      onPress={onPress}
      style={({ pressed }) => [
        styles.card,
        { backgroundColor: colors.background, borderColor: colors.border },
        pressed && { opacity: 0.92 },
      ]}>
      <View style={styles.topRow}>
        <Text style={[styles.course, { color: colors.placeholder }]} numberOfLines={1}>
          {task.courseName}
        </Text>
        <View style={[styles.badge, { backgroundColor: badge.bg }]}>
          <Text style={[styles.badgeText, { color: badge.text }]}>{FILTER_LABELS[task.filter]}</Text>
        </View>
      </View>
      <Text style={[styles.title, { color: colors.text }]} numberOfLines={2}>
        {task.title}
      </Text>
      <Text style={[styles.deadline, { color: colors.text }]}>до {task.deadlineLabel}</Text>
      <Text style={[styles.reward, { color: colors.primary }]}>+{task.rewardCoins} алгокоинов</Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 14,
    marginBottom: 12,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
    gap: 8,
  },
  course: {
    flex: 1,
    fontSize: 13,
  },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  title: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  deadline: {
    fontSize: 14,
    marginBottom: 4,
  },
  reward: {
    fontSize: 14,
    fontWeight: '600',
  },
});
