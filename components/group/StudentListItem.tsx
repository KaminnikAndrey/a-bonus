import React from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

export type Student = {
  id: string;
  fullname: string;
  coins: string;
};

const STEP_COLOR = '#6766AA';

type Props = Student & {
  colors: {
    text: string;
    border: string;
    background: string;
    placeholder: string;
  };
  bumpCoins: (id: string, delta: number) => void;
};

const StudentListItem = ({ id, fullname, coins, colors, bumpCoins }: Props) => {
  const n = Math.max(0, Math.min(10, parseInt(coins || '0', 10) || 0));

  return (
    <View style={styles.row}>
      <View style={[styles.nameBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Text style={[styles.nameText, { color: colors.text }]} numberOfLines={1}>
          {fullname}
        </Text>
      </View>
      <View style={[styles.counterBox, { borderColor: colors.border, backgroundColor: colors.background }]}>
        <Pressable
          onPress={() => bumpCoins(id, -1)}
          disabled={n <= 0}
          hitSlop={10}
          style={({ pressed }) => [
            styles.stepBtn,
            pressed && styles.stepBtnPressed,
            n <= 0 && styles.stepBtnDisabled,
          ]}
          accessibilityLabel="Минус">
          <Text style={[styles.stepSymbol, { color: n <= 0 ? '#ccc' : STEP_COLOR }]}>−</Text>
        </Pressable>
        <Text style={[styles.counterValue, { color: colors.text }]}>{n}</Text>
        <Pressable
          onPress={() => bumpCoins(id, 1)}
          hitSlop={10}
          style={({ pressed }) => [styles.stepBtn, pressed && styles.stepBtnPressed]}
          accessibilityLabel="Плюс">
          <Text style={[styles.stepSymbol, { color: STEP_COLOR }]}>+</Text>
        </Pressable>
      </View>
    </View>
  );
};

export default StudentListItem;

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginBottom: 12,
  },
  nameBox: {
    flex: 1,
    minWidth: 0,
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 14,
    paddingHorizontal: 14,
    justifyContent: 'center',
  },
  nameText: {
    fontSize: 15,
    fontWeight: '500',
  },
  counterBox: {
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderRadius: 14,
    paddingVertical: 4,
    paddingHorizontal: 6,
    minWidth: 124,
    justifyContent: 'space-between',
  },
  stepBtn: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 10,
  },
  stepBtnPressed: {
    opacity: 0.65,
  },
  stepBtnDisabled: {
    opacity: 0.35,
  },
  stepSymbol: {
    fontSize: 26,
    fontWeight: '700',
    lineHeight: 30,
    textAlign: 'center',
  },
  counterValue: {
    fontSize: 18,
    fontWeight: '700',
    minWidth: 28,
    textAlign: 'center',
  },
});
