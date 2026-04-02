import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const PARAGRAPHS = [
  'Твой путь состоит из одиннадцати рангов: Новичок, Исследователь, Кодер, Скриптер, Алгоритмист, Мастер цикла, затем Архитектор, Оптимизатор, Стратег, Легенда и на вершине — Грандмастер. Чем выше ранг, тем больше крутых возможностей открывается. EXP (опыт) ты получаешь за всё, что делаешь в приложении: публикуешь проекты и делишься ими, оставляешь комментарии под работами друзей, ставишь лайки, вовремя сдаёшь домашние задания и, конечно, посещаешь уроки. Каждое твоё действие приближает к новому уровню!',
  'Когда ты поднимаешься на следующий ранг, тебя ждёт награда — коины, которые можно сразу потратить в магазине. Чем выше твой ранг, тем более редкие товары становятся доступны.',
  'Хочешь первым пробовать новые фишки, участвовать в закрытых розыгрышах и получать эксклюзивные награды? Прокачивай свой ранг! Чем активнее ты в приложении, тем быстрее растёшь. Начни уже сегодня — публикуй проекты, комментируй, сдавай задания и поднимайся к вершине!',
];

export default function RanksInfoScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={2}>
          Ранги и награды
        </Text>
        <View style={styles.headerSpacer} />
      </View>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {PARAGRAPHS.map((p, i) => (
          <Text key={i} style={[styles.paragraph, { color: colors.text }]}>
            {p}
          </Text>
        ))}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 8,
    paddingVertical: 12,
  },
  backBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  backText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    flex: 1,
    fontSize: 18,
    fontWeight: 'bold',
    textAlign: 'center',
  },
  headerSpacer: {
    width: 44,
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingBottom: 32,
  },
  paragraph: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 16,
  },
});
