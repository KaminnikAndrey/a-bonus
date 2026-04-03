import { useProjectFeed } from '@/contexts/ProjectFeedContext';
import { filterProjectFeedByTab, type ProjectFeedTab } from '@/services/feed/mockProjectFeed';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import React, { useCallback, useMemo, useState } from 'react';
import { Alert, FlatList, Pressable, ScrollView, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

const FEED_TABS: { key: ProjectFeedTab; label: string }[] = [
  { key: 'all', label: 'Все проекты' },
  { key: 'myGroup', label: 'Моя группа' },
  { key: 'myProjects', label: 'Мои проекты' },
];

/** Градиент карточки — сиреневый, как в макете Figma «Лента проектов». */
const CARD_GRADIENT = ['#B8B0E8', '#9590D6', '#7A74C4', '#6766AA'] as const;

const CHIP_BORDER = '#D0D0D0';
const CHIP_TEXT_INACTIVE = '#8A8A8A';

/** Ряд вкладок ленты: макет 375px — padding слева/справа 16, между кнопками gap 10. */
const FEED_CHIPS_ROW_PADDING = 16;
const FEED_CHIP_GAP = 10;
const FEED_DESIGN_WIDTH = 375;
const FEED_CHIP_WIDTH =
  (FEED_DESIGN_WIDTH - FEED_CHIPS_ROW_PADDING * 2 - FEED_CHIP_GAP * 2) / 3;
const FEED_CHIP_HEIGHT = 40;

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const { items: feedItems, toggleLike, isLiked, getLikeCount } = useProjectFeed();
  const [tab, setTab] = useState<ProjectFeedTab>('all');
  const [deletedIds, setDeletedIds] = useState<string[]>([]);

  const data = useMemo(() => {
    const list = filterProjectFeedByTab(feedItems, tab);
    return list.filter((p) => !deletedIds.includes(p.id));
  }, [feedItems, tab, deletedIds]);

  const confirmDelete = useCallback((projectId: string, projectTitle: string) => {
    Alert.alert(
      'Удалить проект?',
      `«${projectTitle}» будет убран из списка.`,
      [
        { text: 'Отмена', style: 'cancel' },
        {
          text: 'Удалить',
          style: 'destructive',
          onPress: () => setDeletedIds((prev) => (prev.includes(projectId) ? prev : [...prev, projectId])),
        },
      ]
    );
  }, []);

  return (
    <SafeAreaView edges={['top']} style={[styles.safe, { backgroundColor: colors.background }]}>
      <View style={styles.headerRow}>
        <Pressable
          style={styles.headerSideBtn}
          onPress={() => router.push('/feed/publish')}
          hitSlop={8}>
          <Ionicons name="add" size={30} color={colors.text} />
        </Pressable>
        <Text style={[styles.title, { color: colors.text }]}>Лента проектов</Text>
        <View style={styles.headerSideBtn} />
      </View>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={styles.chipsScroll}
        contentContainerStyle={styles.chipsScrollContent}
        keyboardShouldPersistTaps="handled">
        {FEED_TABS.map((t, index) => {
          const active = tab === t.key;
          const isLast = index === FEED_TABS.length - 1;
          return (
            <Pressable
              key={t.key}
              onPress={() => setTab(t.key)}
              style={[
                styles.chip,
                !isLast && styles.chipSpacing,
                {
                  backgroundColor: active ? '#6766AA' : colors.background,
                  borderColor: active ? '#6766AA' : CHIP_BORDER,
                },
              ]}>
              <Text
                style={[styles.chipLabel, { color: active ? '#fff' : CHIP_TEXT_INACTIVE }]}
                numberOfLines={1}>
                {t.label}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>
      <FlatList
        data={data}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <Text style={[styles.empty, { color: colors.placeholder }]}>
            В этой категории пока нет проектов.
          </Text>
        }
        renderItem={({ item }) => {
          const isMyProjectsTab = tab === 'myProjects';
          const openDetail = () => router.push(`/feed/${item.id}`);

          return (
            <View style={styles.cardOuter}>
              <LinearGradient
                colors={[...CARD_GRADIENT]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={[styles.cardGradient, isMyProjectsTab && styles.cardGradientWithActions]}>
                <Pressable
                  style={styles.likesCorner}
                  onPress={() => toggleLike(item.id)}
                  hitSlop={10}
                  accessibilityRole="button"
                  accessibilityLabel={isLiked(item.id) ? 'Убрать лайк' : 'Поставить лайк'}
                  accessibilityState={{ selected: isLiked(item.id) }}>
                  <Ionicons
                    name={isLiked(item.id) ? 'heart' : 'heart-outline'}
                    size={18}
                    color="#FFFFFF"
                  />
                  <Text style={[styles.likesText, styles.likesTextGap]}>{getLikeCount(item)}</Text>
                </Pressable>

                {isMyProjectsTab ? (
                  <>
                    <Pressable onPress={openDetail} style={styles.cardPressable}>
                      <Text style={styles.authorText}>{item.authorName}</Text>
                      <Text style={styles.cardTitle}>{item.title}</Text>
                      <Text style={styles.descText} numberOfLines={3}>
                        {item.body}
                      </Text>
                    </Pressable>
                    <View style={styles.myProjectActions}>
                      <Pressable
                        style={styles.editBtn}
                        onPress={() => Alert.alert('Изменить', 'Редактирование проекта появится позже.')}
                        accessibilityRole="button"
                        accessibilityLabel="Изменить проект">
                        <Text style={styles.editBtnText}>Изменить</Text>
                      </Pressable>
                      <Pressable
                        style={styles.deleteBtn}
                        onPress={() => confirmDelete(item.id, item.title)}
                        accessibilityRole="button"
                        accessibilityLabel="Удалить проект">
                        <Ionicons name="trash-outline" size={22} color="#FFFFFF" />
                      </Pressable>
                    </View>
                  </>
                ) : (
                  <Pressable onPress={openDetail} style={({ pressed }) => [styles.cardPressableFull, pressed && { opacity: 0.94 }]}>
                    <Text style={styles.authorText}>{item.authorName}</Text>
                    <Text style={styles.cardTitle}>{item.title}</Text>
                    <Text style={styles.descText} numberOfLines={3}>
                      {item.body}
                    </Text>
                  </Pressable>
                )}
              </LinearGradient>
            </View>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingTop: 4,
    paddingBottom: 10,
  },
  headerSideBtn: {
    width: 44,
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    flex: 1,
    fontSize: 24,
    fontWeight: '700',
    textAlign: 'center',
    letterSpacing: -0.3,
  },
  chipsScroll: {
    flexGrow: 0,
    marginBottom: 22,
  },
  chipsScrollContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: FEED_CHIPS_ROW_PADDING,
    paddingVertical: 12,
    flexGrow: 1,
    justifyContent: 'center',
    minWidth: '100%',
  },
  chipSpacing: {
    marginRight: FEED_CHIP_GAP,
  },
  chip: {
    width: FEED_CHIP_WIDTH,
    height: FEED_CHIP_HEIGHT,
    borderRadius: FEED_CHIP_HEIGHT / 2,
    borderWidth: 1,
    flexShrink: 0,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 6,
  },
  chipLabel: {
    fontSize: 13,
    fontWeight: '600',
    textAlign: 'center',
  },
  listContent: {
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: 24,
  },
  empty: {
    textAlign: 'center',
    marginTop: 24,
    fontSize: 16,
  },
  cardOuter: {
    marginBottom: 14,
    borderRadius: 16,
    overflow: 'hidden',
    shadowColor: '#3D3A6D',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 6,
  },
  cardGradient: {
    borderRadius: 16,
    paddingHorizontal: 18,
    paddingTop: 18,
    paddingBottom: 20,
    paddingRight: 72,
    minHeight: 140,
  },
  cardGradientWithActions: {
    paddingBottom: 16,
    minHeight: 0,
  },
  cardPressable: {
    paddingBottom: 4,
  },
  cardPressableFull: {
    minHeight: 120,
    paddingBottom: 4,
  },
  myProjectActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 14,
    paddingRight: 0,
  },
  editBtn: {
    flex: 1,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  editBtnText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '600',
  },
  deleteBtn: {
    width: 50,
    height: 50,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.95)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  likesCorner: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 4,
    elevation: 4,
    flexDirection: 'row',
    alignItems: 'center',
    padding: 6,
  },
  likesText: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
  },
  likesTextGap: {
    marginLeft: 4,
  },
  authorText: {
    color: 'rgba(255,255,255,0.92)',
    fontSize: 13,
    lineHeight: 18,
    marginBottom: 6,
    paddingRight: 8,
  },
  cardTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '700',
    lineHeight: 24,
    marginBottom: 10,
  },
  descText: {
    color: 'rgba(255,255,255,0.95)',
    fontSize: 14,
    lineHeight: 20,
  },
});
