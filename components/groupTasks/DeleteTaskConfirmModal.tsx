import React from 'react';
import { Modal, Pressable, StyleSheet, Text, View } from 'react-native';

const CANCEL_RED = '#FF3B30';
const CONFIRM_BLUE = '#007AFF';
const SUBTITLE_GRAY = '#666666';
const DIVIDER = '#E5E5E5';

type Props = {
  visible: boolean;
  onCancel: () => void;
  onConfirm: () => void;
};

/**
 * Подтверждение удаления задачи. RN Modal — поверх навигации; внутри — фон + карточка.
 */
export default function DeleteTaskConfirmModal({ visible, onCancel, onConfirm }: Props) {
  if (!visible) {
    return null;
  }

  return (
    <Modal
      animationType="fade"
      transparent
      visible={visible}
      onRequestClose={onCancel}
      statusBarTranslucent
      hardwareAccelerated>
      <View style={styles.modalRoot} pointerEvents="box-none">
        <Pressable style={styles.backdrop} onPress={onCancel} accessibilityLabel="Закрыть" />
        <View style={styles.sheetWrap} pointerEvents="box-none">
          <View style={styles.sheet} pointerEvents="auto">
            <View style={styles.body}>
              <Text style={styles.title}>Удалить задачу</Text>
              <Text style={styles.subtitle}>
                Задача будет безвозвратно удалена, ученики потеряют к ней доступ
              </Text>
            </View>
            <View style={styles.hDivider} />
            <View style={styles.actions}>
              <Pressable
                style={({ pressed }) => [styles.actionHalf, pressed && styles.actionPressed]}
                onPress={onCancel}>
                <Text style={styles.cancelText}>Отмена</Text>
              </Pressable>
              <View style={styles.vDivider} />
              <Pressable
                style={({ pressed }) => [styles.actionHalf, pressed && styles.actionPressed]}
                onPress={onConfirm}>
                <Text style={styles.confirmText}>Подтвердить</Text>
              </Pressable>
            </View>
          </View>
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
  },
  sheetWrap: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 28,
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
    paddingTop: 26,
    paddingBottom: 22,
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
    color: '#000000',
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontSize: 15,
    fontWeight: '400',
    color: SUBTITLE_GRAY,
    textAlign: 'center',
    lineHeight: 22,
  },
  hDivider: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
  },
  actions: {
    flexDirection: 'row',
    minHeight: 52,
    alignItems: 'stretch',
  },
  actionHalf: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
  },
  actionPressed: {
    backgroundColor: 'rgba(0, 0, 0, 0.04)',
  },
  vDivider: {
    width: StyleSheet.hairlineWidth,
    backgroundColor: DIVIDER,
  },
  cancelText: {
    fontSize: 17,
    fontWeight: '600',
    color: CANCEL_RED,
    textAlign: 'center',
  },
  confirmText: {
    fontSize: 17,
    fontWeight: '600',
    color: CONFIRM_BLUE,
    textAlign: 'center',
  },
});
