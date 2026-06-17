import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { appendMockCreatedTasks, hydrateMockCreatedTasks } from '@/services/groupTasks/mockCreatedTasksStore';
import {
  buildTaskRewardLine,
  isoToDdMmYy,
  parseDdMmYyToIso,
  parseTaskRewardLine,
  todayIsoLocal,
} from '@/services/groupTasks/createTaskFormUtils';
import { getMockTeacherGroupTaskDetail } from '@/services/groupTasks/mockTeacherGroupTaskDetail';
import { hydrateMockTeacherTaskEdits } from '@/services/groupTasks/mockTeacherTaskEditStore';
import {
  getMockTeacherGroupTaskTabs,
  updateMockTeacherGroupTask,
} from '@/services/groupTasks/mockTeacherGroupTasks';
import { useLocalSearchParams } from 'expo-router';
import { userSelector } from '@/stores/auth/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import {
  Alert,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from 'react-native';
import { SafeAreaView, useSafeAreaInsets } from 'react-native-safe-area-context';
import { useSelector } from 'react-redux';

const TAB_PURPLE = '#6766AA';
const INPUT_RADIUS = 12;

export default function CreateGroupTaskScreen() {
  const router = useRouter();
  const { taskId: taskIdParam } = useLocalSearchParams<{ taskId?: string }>();
  const editTaskId = Array.isArray(taskIdParam) ? taskIdParam[0] : taskIdParam;
  const isEditMode = Boolean(editTaskId?.trim());

  const insets = useSafeAreaInsets();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useSelector(userSelector);
  const teacherId =
    user?.id != null && String(user.id).trim() !== '' ? String(user.id) : 'unknown';

  const groupChips = useMemo(() => getMockTeacherGroupTaskTabs(), []);

  const [title, setTitle] = useState('');
  const [coins, setCoins] = useState('');
  const [expLead, setExpLead] = useState('');
  const [dateStart, setDateStart] = useState('');
  const [dateEnd, setDateEnd] = useState('');
  const [description, setDescription] = useState('');
  const [selectedGroupIds, setSelectedGroupIds] = useState<Set<string>>(
    () => new Set(['tg3', 'tg-lunch', 'tg-long'])
  );
  const [editFormLoaded, setEditFormLoaded] = useState(!isEditMode);

  React.useEffect(() => {
    if (!isEditMode || !editTaskId) return;
    let cancelled = false;
    void (async () => {
      await hydrateMockCreatedTasks(teacherId);
      await hydrateMockTeacherTaskEdits(teacherId);
      const detail = getMockTeacherGroupTaskDetail(editTaskId, teacherId);
      if (cancelled) return;
      if (!detail) {
        Alert.alert('Задача', 'Не удалось загрузить задачу для редактирования.');
        router.back();
        return;
      }
      const { coins, expLead } = parseTaskRewardLine(detail.reward);
      setTitle(detail.title);
      setCoins(coins);
      setExpLead(expLead);
      setDateStart(isoToDdMmYy(detail.dateFrom));
      setDateEnd(isoToDdMmYy(detail.dateTo));
      setDescription(detail.descriptionSteps.join('\n'));
      setSelectedGroupIds(new Set([detail.groupId]));
      setEditFormLoaded(true);
    })();
    return () => {
      cancelled = true;
    };
  }, [isEditMode, editTaskId, teacherId, router]);

  const toggleGroup = useCallback((id: string) => {
    if (isEditMode) return;
    setSelectedGroupIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, [isEditMode]);

  const onClose = () => router.back();

  const onSubmit = async () => {
    if (!title.trim()) {
      Alert.alert('Название', 'Укажите название задачи.');
      return;
    }
    if (selectedGroupIds.size === 0) {
      Alert.alert('Группы', 'Выберите хотя бы одну группу.');
      return;
    }
    const dateFromIso = parseDdMmYyToIso(dateStart) ?? todayIsoLocal();
    let dateToIso = parseDdMmYyToIso(dateEnd) ?? dateFromIso;
    if (dateToIso < dateFromIso) dateToIso = dateFromIso;

    const reward = buildTaskRewardLine(coins, expLead);
    const descriptionSteps = description
      .split('\n')
      .map((line) => line.trim())
      .filter(Boolean);

    if (isEditMode && editTaskId) {
      const ok = await updateMockTeacherGroupTask(teacherId, editTaskId, {
        title: title.trim(),
        reward,
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        descriptionSteps:
          descriptionSteps.length > 0 ? descriptionSteps : ['Уточните условие задания у преподавателя.'],
      });
      if (!ok) {
        Alert.alert('Ошибка', 'Не удалось сохранить изменения.');
        return;
      }
      router.back();
      return;
    }

    const baseId = `created-${Date.now()}`;
    const entries = Array.from(selectedGroupIds).map((groupId) => ({
      groupId,
      card: {
        id: `${baseId}-${groupId}`,
        dateFrom: dateFromIso,
        dateTo: dateToIso,
        title: title.trim(),
        reward,
      },
    }));

    await hydrateMockCreatedTasks(teacherId);
    const persisted = await appendMockCreatedTasks(teacherId, entries);
    if (!persisted) {
      Alert.alert(
        'Задача добавлена',
        'Список обновлён. Запись на диск временно недоступна — после перезапуска приложения эта задача может пропасть.',
        [{ text: 'Понятно', onPress: () => router.back() }]
      );
      return;
    }
    router.back();
  };

  const isTeacher = useMemo(() => String(user?.role ?? '').toLowerCase() === 'teacher', [user?.role]);

  if (!user || !isTeacher) {
    return (
      <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
        <Text style={[styles.fallback, { color: colors.placeholder }]}>Раздел доступен только преподавателям.</Text>
      </SafeAreaView>
    );
  }

  const inputStyle = [
    styles.input,
    { borderColor: colors.border, color: colors.text, backgroundColor: colors.background },
  ];

  return (
    <SafeAreaView style={[styles.safe, { backgroundColor: colors.background }]} edges={['top', 'bottom']}>
      <Pressable style={styles.dismissRow} onPress={onClose} hitSlop={16} accessibilityLabel="Закрыть">
        <Ionicons name="chevron-down" size={28} color={colors.text} />
      </Pressable>
      <Text style={[styles.screenTitle, { color: colors.text }]}>
        {isEditMode ? 'Изменить задачу' : 'Создать задачу'}
      </Text>

      {isEditMode && editFormLoaded ? (
        <Text style={[styles.editHint, { color: colors.placeholder }]}>
          Группа: {groupChips.find((g) => selectedGroupIds.has(g.id))?.name ?? '—'}
        </Text>
      ) : null}

      <ScrollView
        style={styles.scroll}
        contentContainerStyle={[styles.scrollContent, { paddingBottom: 24 + Math.max(insets.bottom, 12) }]}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}>
        <Text style={[styles.label, { color: colors.text }]}>Название</Text>
        <TextInput
          style={inputStyle}
          value={title}
          onChangeText={setTitle}
          placeholder="Введите название"
          placeholderTextColor={colors.placeholder}
        />

        <Text style={[styles.label, styles.labelSpaced, { color: colors.text }]}>Награда в алгокоинах</Text>
        <TextInput
          style={inputStyle}
          value={coins}
          onChangeText={setCoins}
          placeholder="Например: 12"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
        />

        <Text style={[styles.label, styles.labelSpaced, { color: colors.text }]}>
          Награда в EXP первым трем (необязат.)
        </Text>
        <TextInput
          style={inputStyle}
          value={expLead}
          onChangeText={setExpLead}
          placeholder="Например: 3"
          placeholderTextColor={colors.placeholder}
          keyboardType="numeric"
        />
        <Text style={[styles.hint, { color: colors.placeholder }]}>
          Первые три ученика из группы, чьё решение будет принято раньше чем у остальных, получат дополнительную
          награду в виде EXP.
        </Text>

        <View style={styles.dateRow}>
          <View style={styles.dateCol}>
            <Text style={[styles.label, { color: colors.text }]}>Дата начала</Text>
            <TextInput
              style={inputStyle}
              value={dateStart}
              onChangeText={setDateStart}
              placeholder="дд.мм.гг"
              placeholderTextColor={colors.placeholder}
            />
          </View>
          <View style={styles.dateGap} />
          <View style={styles.dateCol}>
            <Text style={[styles.label, { color: colors.text }]}>Дата окончания</Text>
            <TextInput
              style={inputStyle}
              value={dateEnd}
              onChangeText={setDateEnd}
              placeholder="дд.мм.гг"
              placeholderTextColor={colors.placeholder}
            />
          </View>
        </View>
        <Text style={[styles.hint, { color: colors.placeholder }]}>
          Формат даты: дд.мм.гг. После окончания срока, ученики смогут отправить задачу на проверку, но награду уже не
          получат.
        </Text>

        <Text style={[styles.label, styles.labelSpaced, { color: colors.text }]}>Описание</Text>
        <TextInput
          style={[inputStyle, styles.textArea]}
          value={description}
          onChangeText={setDescription}
          placeholder="Опишите задание"
          placeholderTextColor={colors.placeholder}
          multiline
          textAlignVertical="top"
        />

        {!isEditMode ? (
          <>
            <Text style={[styles.label, styles.labelSpaced, { color: colors.text }]}>Группы</Text>
            <View style={styles.chipsWrap}>
              {groupChips.map((g) => {
                const on = selectedGroupIds.has(g.id);
                return (
                  <Pressable
                    key={g.id}
                    onPress={() => toggleGroup(g.id)}
                    style={[
                      styles.chip,
                      {
                        backgroundColor: on ? TAB_PURPLE : colors.background,
                        borderColor: on ? TAB_PURPLE : colors.border,
                      },
                    ]}>
                    <Text
                      style={[styles.chipText, { color: on ? '#fff' : colors.text }]}
                      numberOfLines={2}>
                      {g.name}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
            <Text style={[styles.hint, styles.hintAfterChips, { color: colors.placeholder }]}>
              Все ученики из выбранных групп увидят эту задачу
            </Text>
          </>
        ) : null}

        <Pressable
          style={({ pressed }) => [
            styles.submitBtn,
            { backgroundColor: TAB_PURPLE },
            pressed && { opacity: 0.9 },
            isEditMode && !editFormLoaded && styles.submitBtnDisabled,
          ]}
          disabled={isEditMode && !editFormLoaded}
          onPress={() => void onSubmit()}>
          <Text style={styles.submitBtnText}>{isEditMode ? 'Сохранить' : 'Создать'}</Text>
        </Pressable>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  fallback: {
    textAlign: 'center',
    marginTop: 48,
    paddingHorizontal: 24,
  },
  dismissRow: {
    alignItems: 'center',
    paddingTop: 4,
    paddingBottom: 4,
  },
  screenTitle: {
    fontSize: 20,
    fontWeight: '700',
    textAlign: 'center',
    marginBottom: 8,
    paddingHorizontal: 16,
  },
  editHint: {
    textAlign: 'center',
    fontSize: 14,
    marginBottom: 12,
    paddingHorizontal: 20,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
  },
  label: {
    fontSize: 15,
    fontWeight: '600',
    marginBottom: 8,
  },
  labelSpaced: {
    marginTop: 18,
  },
  input: {
    borderWidth: 1,
    borderRadius: INPUT_RADIUS,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  textArea: {
    minHeight: 120,
    paddingTop: 12,
  },
  hint: {
    fontSize: 13,
    lineHeight: 18,
    marginTop: 8,
  },
  hintAfterChips: {
    marginTop: 4,
    marginBottom: 8,
  },
  dateRow: {
    flexDirection: 'row',
    marginTop: 18,
    alignItems: 'flex-start',
  },
  dateCol: {
    flex: 1,
  },
  dateGap: {
    width: 12,
  },
  chipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginTop: 4,
  },
  chip: {
    width: '47%',
    flexGrow: 1,
    paddingVertical: 12,
    paddingHorizontal: 12,
    borderRadius: INPUT_RADIUS,
    borderWidth: 1,
    justifyContent: 'center',
    alignItems: 'center',
    minHeight: 48,
  },
  chipText: {
    fontSize: 14,
    fontWeight: '600',
    textAlign: 'center',
  },
  submitBtn: {
    marginTop: 28,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
  },
  submitBtnDisabled: {
    opacity: 0.5,
  },
});
