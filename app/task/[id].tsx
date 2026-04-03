import CustomModal from '@/components/common/CustomModal';
import { MOCK_STUDENT_TASKS } from '@/components/task/mockStudentTasks';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo, useState } from 'react';
import {
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function TaskDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [submitVisible, setSubmitVisible] = useState(false);
  const [workLink, setWorkLink] = useState('');
  const [comment, setComment] = useState('');

  const task = useMemo(() => MOCK_STUDENT_TASKS.find((t) => t.id === id), [id]);

  const onBack = () => router.back();

  if (!task) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onBack} style={styles.backButton}>
            <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text }]}>Задание</Text>
          <View style={styles.placeholder} />
        </View>
        <Text style={[styles.missing, { color: colors.placeholder }]}>Задача не найдена.</Text>
      </SafeAreaView>
    );
  }

  const canSubmit = task.filter === 'active' || task.filter === 'overdue';
  const linkOk = workLink.trim().length > 0;
  const canPressSubmit = canSubmit && linkOk;

  const openSubmitModal = () => {
    if (!canPressSubmit) return;
    setSubmitVisible(true);
  };

  const handleConfirmSend = () => {
    setSubmitVisible(false);
    setWorkLink('');
    setComment('');
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Задание
        </Text>
        <View style={styles.placeholder} />
      </View>

      <KeyboardAvoidingView
        style={styles.flex}
        behavior={Platform.OS === 'ios' ? 'padding' : undefined}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 8 : 0}>
        <ScrollView
          style={styles.scroll}
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}>
          <Text style={[styles.course, { color: colors.placeholder }]}>{task.courseName}</Text>
          <Text style={[styles.title, { color: colors.text }]}>{task.title}</Text>
          <Text style={[styles.deadline, { color: colors.text }]}>Сдать до: {task.deadlineLabel}</Text>
          <Text style={[styles.reward, { color: colors.primary }]}>
            Награда: {task.rewardCoins} алгокоинов
          </Text>

          <Text style={[styles.lead, { color: colors.text }]}>{task.description}</Text>

          {task.sections.map((section) => (
            <View key={section.title} style={styles.section}>
              <Text style={[styles.sectionTitle, { color: colors.text }]}>{section.title}</Text>
              <Text style={[styles.sectionBody, { color: colors.text }]}>{section.body}</Text>
            </View>
          ))}

          {canSubmit ? (
            <>
              <Text style={[styles.formBlockTitle, { color: colors.text }]}>Сдача работы</Text>
              <Text style={[styles.inputLabel, { color: colors.placeholder }]}>
                Ссылка на работу <Text style={{ color: '#C62828' }}>*</Text>
              </Text>
              <TextInput
                value={workLink}
                onChangeText={setWorkLink}
                placeholder="https://… (репозиторий, облако, документ)"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.input,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                autoCapitalize="none"
                autoCorrect={false}
                keyboardType="url"
              />
              <Text style={[styles.inputLabel, { color: colors.placeholder, marginTop: 14 }]}>
                Комментарий для преподавателя
              </Text>
              <TextInput
                value={comment}
                onChangeText={setComment}
                placeholder="Кратко опишите, что сделали, если нужно пояснение"
                placeholderTextColor={colors.placeholder}
                style={[
                  styles.input,
                  styles.inputMultiline,
                  {
                    borderColor: colors.border,
                    color: colors.text,
                    backgroundColor: colors.background,
                  },
                ]}
                multiline
                textAlignVertical="top"
              />

              <TouchableOpacity
                style={[
                  styles.cta,
                  { backgroundColor: canPressSubmit ? colors.primary : colors.border },
                ]}
                onPress={openSubmitModal}
                disabled={!canPressSubmit}
                activeOpacity={0.9}>
                <Text style={styles.ctaText}>Отправить на проверку</Text>
              </TouchableOpacity>
              {!linkOk ? (
                <Text style={[styles.hint, { color: colors.placeholder }]}>
                  Укажите ссылку на работу, чтобы отправить задание.
                </Text>
              ) : null}
            </>
          ) : (
            <Text style={[styles.doneNote, { color: colors.success }]}>Задача уже выполнена.</Text>
          )}
        </ScrollView>
      </KeyboardAvoidingView>

      <CustomModal
        visible={submitVisible}
        title="Отправить на проверку?"
        subtitle="Преподаватель увидит ссылку, комментарий и сможет начислить алгокоины после проверки."
        okButtonText="Отправить"
        isNeedCancelButton
        cancelButtonText="Отмена"
        onCancel={() => setSubmitVisible(false)}
        onRequestClose={() => setSubmitVisible(false)}
        onSuccessModalClose={handleConfirmSend}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  flex: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backButton: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backButtonText: {
    fontSize: 24,
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: '700',
    textAlign: 'center',
  },
  placeholder: {
    width: 44,
  },
  missing: {
    textAlign: 'center',
    marginTop: 48,
    fontSize: 16,
    paddingHorizontal: 24,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 20,
    paddingBottom: 40,
  },
  course: {
    fontSize: 14,
    marginBottom: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '800',
    marginBottom: 12,
  },
  deadline: {
    fontSize: 16,
    marginBottom: 8,
  },
  reward: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 16,
  },
  lead: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 20,
    fontWeight: '500',
  },
  section: {
    marginBottom: 18,
  },
  sectionTitle: {
    fontSize: 15,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionBody: {
    fontSize: 15,
    lineHeight: 22,
  },
  formBlockTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginTop: 8,
    marginBottom: 12,
  },
  inputLabel: {
    fontSize: 13,
    marginBottom: 6,
    fontWeight: '500',
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 16,
  },
  inputMultiline: {
    minHeight: 100,
    paddingTop: 12,
  },
  cta: {
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 20,
  },
  ctaText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '700',
  },
  hint: {
    fontSize: 13,
    textAlign: 'center',
    marginTop: 10,
  },
  doneNote: {
    fontSize: 16,
    fontWeight: '600',
    marginTop: 8,
  },
});
