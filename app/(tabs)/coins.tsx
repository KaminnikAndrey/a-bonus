import CoinsHistoryListItem, { CoinsHistoryListItemDto } from '@/components/coin/CoinsHistoryListItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAllCoinsHistory } from '@/services/coins/coinsApi';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export type CoinsHistoryData = {
  date: string
  data: CoinsHistoryListItemDto[]
}

export default function CoinsScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [history, setHistory] = useState<CoinsHistoryData[]>([]);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchAllCoinsHistory(0, true);
      setIsLoading(false);
    })()
  }, []);

  const fetchAllCoinsHistory = async (page: number = 0, reset: boolean = false) => {
    const { success, data, pagination } = await getAllCoinsHistory(page, 20);

    if (success && data) {
      if (reset) {
        setHistory(data);
      } else {
        const mergedData: CoinsHistoryData[] = [];
        const dateMap = new Map<string, CoinsHistoryData>();
        
        history.forEach(section => {
          dateMap.set(section.date, { ...section });
        });
        
        data.forEach(section => {
          if (dateMap.has(section.date)) {
            const existing = dateMap.get(section.date)!;
            existing.data = [...existing.data, ...section.data];
          } else {
            dateMap.set(section.date, { ...section });
          }
        });
        
        mergedData.push(...Array.from(dateMap.values()));
        setHistory(mergedData);
      }
      
      if (pagination) {
        setHasMore(pagination.hasMore);
        setCurrentPage(pagination.currentPage);
      } else {
        setHasMore(false);
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllCoinsHistory(0, true);
    setIsRefreshing(false);
  }

  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      await fetchAllCoinsHistory(currentPage + 1, false);
      setIsLoadingMore(false);
    }
  }

  return (
    <SafeAreaView edges={["top"]} style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>История зачислений</Text>
      </View>
      <View style={styles.content}>
        { isLoading ? <ActivityIndicator color={"#6766AA"} size={'large'}/> :
          (history.length <= 0) ? (
            <Text style={[styles.subtitle, { color: colors.text }]}>
              История начислений пуста. Начисляйте алгокоины ученикам - операции отобразятся в этом разделе.
            </Text>
          ) :
            (
              <SectionList
                style={styles.listContainer}
                showsVerticalScrollIndicator={false}
                sections={history}
                renderItem={({ item }) => (<CoinsHistoryListItem fullname={item.fullname} coins={item.coins} />)}
                refreshing={isRefreshing}
                onRefresh={handleRefresh}
                onEndReached={handleLoadMore}
                onEndReachedThreshold={0.5}
                ListFooterComponent={isLoadingMore ? <ActivityIndicator color={"#6766AA"} size={'small'} style={{ marginVertical: 16 }} /> : null}
                renderSectionHeader={({ section: { date } }) => (
                  <View style={styles.dateContainer}>
                    <Text style={styles.dateText}>{date}</Text>
                  </View>)
                }
              />
            )
      }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  listContainer: {
    flex: 1,
    width: "100%"
  },
  dateContainer: {
    justifyContent: "flex-start",
    marginVertical: 16
  },
  dateText: {
    fontSize: 16,
    fontWeight: 'bold'
  },
});
