import React, { useMemo } from 'react';
import { StyleSheet, Text, View } from 'react-native';

/** Пороги накопленного EXP для входа в ранг (11 рангов). */
const RANK_THRESHOLDS = [0, 150, 350, 600, 900, 1300, 1750, 2300, 3000, 3900, 5000] as const;

const RANK_NAMES = [
  'Новичок',
  'Исследователь',
  'Кодер',
  'Скриптер',
  'Алгоритмист',
  'Мастер цикла',
  'Архитектор',
  'Оптимизатор',
  'Стратег',
  'Легенда',
  'Грандмастер',
] as const;

function computeRankState(totalExp: number) {
  const exp = Math.max(0, totalExp);
  let idx = 0;
  for (let i = RANK_NAMES.length - 1; i >= 0; i--) {
    if (exp >= RANK_THRESHOLDS[i]) {
      idx = i;
      break;
    }
  }
  const isMax = idx === RANK_NAMES.length - 1;
  const nextThreshold = isMax ? null : RANK_THRESHOLDS[idx + 1];
  const currentFloor = RANK_THRESHOLDS[idx];
  const expToNext = nextThreshold != null ? Math.max(0, nextThreshold - exp) : 0;
  const span = nextThreshold != null ? nextThreshold - currentFloor : 1;
  const progressRatio = nextThreshold != null ? Math.min(1, Math.max(0, (exp - currentFloor) / span)) : 1;

  return {
    idx,
    name: RANK_NAMES[idx],
    nextName: isMax ? null : RANK_NAMES[idx + 1],
    expToNext,
    progressRatio,
    isMax,
  };
}

type ThemeColors = {
  text: string;
  placeholder: string;
  border: string;
};

type Props = {
  totalExp: number;
  colors: ThemeColors;
};

export default function StudentRanksTab({ totalExp, colors }: Props) {
  const state = useMemo(() => computeRankState(totalExp), [totalExp]);

  return (
    <View style={styles.wrap}>
      <View style={[styles.rankCard, { borderColor: colors.border }]}>
        <Text style={styles.rankCardRankName} numberOfLines={1}>
          Ранг: {state.name}
        </Text>
        <Text style={styles.rankCardTitle}>
          Текущий опыт: {totalExp} EXP
        </Text>
        {state.isMax ? (
          <Text style={[styles.rankCardSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
            Максимальный ранг достигнут
          </Text>
        ) : (
          <Text style={[styles.rankCardSubtitle, { color: 'rgba(255,255,255,0.9)' }]}>
            До следующего ранга («{state.nextName}»): {state.expToNext} EXP
          </Text>
        )}
        {!state.isMax ? (
          <View style={styles.progressTrack}>
            <View style={[styles.progressFill, { width: `${Math.round(state.progressRatio * 100)}%` }]} />
          </View>
        ) : null}
      </View>

      <Text style={[styles.sectionTitle, { color: colors.text }]}>Путь рангов</Text>
      <Text style={[styles.sectionHint, { color: colors.placeholder }]}>
        Одиннадцать этапов — от Новичка до Грандмастера. Текущий этап выделен.
      </Text>

      <View style={styles.stepper}>
        {RANK_NAMES.map((name, i) => {
          const isPast = i < state.idx;
          const isCurrent = i === state.idx;
          const isFuture = i > state.idx;
          const lineActive = i < state.idx;

          return (
            <View key={name} style={styles.stepRow}>
              <View style={styles.stepLeft}>
                <View
                  style={[
                    styles.stepDot,
                    isCurrent && styles.stepDotCurrent,
                    isPast && styles.stepDotPast,
                    isFuture && [styles.stepDotFuture, { borderColor: colors.placeholder }],
                  ]}
                />
                {i < RANK_NAMES.length - 1 ? (
                  <View
                    style={[
                      styles.stepLine,
                      { height: 22, backgroundColor: lineActive ? '#6766AA' : '#E8E8E8' },
                    ]}
                  />
                ) : null}
              </View>
              <Text
                style={[
                  styles.stepLabel,
                  { color: colors.text },
                  isFuture && { color: colors.placeholder },
                  isCurrent && styles.stepLabelCurrent,
                ]}
              >
                {name}
              </Text>
            </View>
          );
        })}
      </View>

      <Text style={[styles.footerHint, { color: colors.placeholder }]}>
        Как копить EXP и зачем ранги — по иконке справки в шапке экрана.
      </Text>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingBottom: 8,
  },
  rankCard: {
    backgroundColor: '#6766AA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 3,
  },
  rankCardRankName: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 13,
    fontWeight: '600',
    marginBottom: 6,
    letterSpacing: 0.2,
  },
  rankCardTitle: {
    color: '#fff',
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 8,
  },
  rankCardSubtitle: {
    fontSize: 14,
    fontWeight: '500',
    lineHeight: 20,
    marginBottom: 12,
  },
  progressTrack: {
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255,255,255,0.35)',
    overflow: 'hidden',
  },
  progressFill: {
    height: '100%',
    borderRadius: 4,
    backgroundColor: '#fff',
  },
  sectionTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 6,
  },
  sectionHint: {
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 16,
  },
  stepper: {
    paddingLeft: 4,
  },
  stepRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  stepLeft: {
    width: 24,
    alignItems: 'center',
    marginRight: 16,
  },
  stepDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
  },
  stepDotCurrent: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#6766AA',
    borderWidth: 3,
    borderColor: '#D4D2F0',
  },
  stepDotPast: {
    backgroundColor: '#6766AA',
  },
  stepDotFuture: {
    backgroundColor: '#fff',
    borderWidth: 2,
  },
  stepLine: {
    width: 2,
    marginVertical: 2,
  },
  stepLabel: {
    flex: 1,
    fontSize: 15,
    lineHeight: 22,
    paddingTop: 0,
    paddingBottom: 18,
    fontWeight: '500',
  },
  stepLabelCurrent: {
    fontWeight: '700',
  },
  footerHint: {
    fontSize: 12,
    lineHeight: 17,
    marginTop: 8,
  },
});
