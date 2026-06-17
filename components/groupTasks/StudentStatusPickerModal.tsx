import {
  getTeacherTaskStudentStatusLabel,
  TEACHER_TASK_STATUS_OPTIONS,
  TEACHER_TASK_STATUS_TEXT_COLOR,
  type TeacherTaskStudentStatusKind,
} from '@/services/groupTasks/mockTeacherGroupTaskDetail';
import React from 'react';
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

const DIVIDER = '#E5E5E5';

type Props = {
  visible: boolean;
  studentName: string;
  currentStatus: TeacherTaskStudentStatusKind;
  onCancel: () => void;
  onSelect: (status: TeacherTaskStudentStatusKind) => void;
  onOpenReview?: () => void;
};

export default function StudentStatusPickerModal({
  visible,
  studentName,
  currentStatus,
  onCancel,
  onSelect,
  onOpenReview,
}: Props) {
  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
      statusBarTranslucent
      hardwareAccelerated>
      <View style={styles.modalRoot}>
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Закрыть" />
        <View style={styles.sheetWrap}>
          <Pressable style={styles.sheet} onPress={(e) => e.stopPropagation()}>
            <View style={styles.body}>
              <Text style={styles.title}>Статус ученика</Text>
              <Text style={styles.subtitle} numberOfLines={2}>
                {studentName}
              </Text>
            </View>
            {onOpenReview ? (
              <>
                <View style={styles.hDivider} />
                <TouchableOpacity
                  activeOpacity={0.7}
                  style={styles.optionRow}
                  onPress={onOpenReview}>
                  <Text style={styles.reviewLink}>Проверить сдачу</Text>
                </TouchableOpacity>
              </>
            ) : null}
            <View style={styles.hDivider} />
            {TEACHER_TASK_STATUS_OPTIONS.map((status, index) => {
              const selected = status === currentStatus;
              return (
                <React.Fragment key={status}>
                  {index > 0 ? <View style={styles.hDivider} /> : null}
                  <TouchableOpacity
                    activeOpacity={0.7}
                    style={styles.optionRow}
                    onPress={() => {
                      onSelect(status);
                    }}
                    accessibilityState={{ selected }}>
                    <Text
                      style={[
                        styles.optionText,
                        { color: TEACHER_TASK_STATUS_TEXT_COLOR[status] },
                        selected && styles.optionTextSelected,
                      ]}>
                      {getTeacherTaskStudentStatusLabel(status)}
                      {selected ? ' ✓' : ''}
                    </Text>
                  </TouchableOpacity>
                </React.Fragment>
              );
            })}
            <View style={styles.hDivider} />
            <TouchableOpacity activeOpacity={0.7} style={styles.optionRow} onPress={onCancel}>
              <Text style={styles.cancelText}>Отмена</Text>
            </TouchableOpacity>
          </Pressable>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  modalRoot: {
    flex: 1,
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.35)',
    zIndex: 0,
  },
  sheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
    zIndex: 1,
  },
  sheet: {
    width: '100%',
    maxWidth: 340,
    backgroundColor: '#fff',
    borderRadius: 20,
    overflow: 'hidden',
    elevation: 12,
  },
  body: {
    paddingHorizontal: 22,
    paddingTop: 22,
    paddingBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#666',
    textAlign: 'center',
    lineHeight: 22,
  },
  hDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
  },
  optionRow: {
    paddingVertical: 14,
    paddingHorizontal: 20,
    alignItems: 'center',
  },
  optionText: {
    fontSize: 17,
    fontWeight: '600',
    textAlign: 'center',
  },
  optionTextSelected: {
    fontWeight: '700',
  },
  reviewLink: {
    fontSize: 17,
    fontWeight: '600',
    color: '#6766AA',
    textAlign: 'center',
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: '#FF3B30',
    textAlign: 'center',
  },
});
