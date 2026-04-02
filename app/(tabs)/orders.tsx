import OrderListItem, { OrderListItemDtoType } from '@/components/order/OrderListItem';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAllOrdersByUser } from '@/services/orders/ordersApi';
import { useFocusEffect } from '@react-navigation/native';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { ActivityIndicator, SectionList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function OrdersScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [ordersListDto, setOrdersListDto] = useState<OrderListItemDtoType[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const sectionListRef = useRef<SectionList>(null);

  const refreshOrders = async () => {
    setIsRefreshing(true);
    await fetchAllOrdersByUser(0, true);
    setIsRefreshing(false);
    sectionListRef.current?.scrollToLocation({
      sectionIndex: 0,
      itemIndex: 0,
      animated: true,
    });
  };

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchAllOrdersByUser(0, true);
      setIsLoading(false);
    })();
  }, []);

  useFocusEffect(
    useCallback(() => {
      let mounted = true;
      (async () => {
        const { success, data, pagination } = await getAllOrdersByUser(0, 5);
        if (!mounted) return;
        if (success && data) {
          setOrdersListDto(data);
          if (pagination) {
            setHasMore(pagination.hasMore);
            setCurrentPage(pagination.currentPage);
          }
        }
      })();
      return () => {
        mounted = false;
      };
    }, [])
  );

  const fetchAllOrdersByUser = async (page: number = 0, reset: boolean = false) => {
    const { success, data, pagination } = await getAllOrdersByUser(page, 5);
    if (success && data) {
      if (reset) {
        setOrdersListDto(data);
      } else {
        const mergedData: OrderListItemDtoType[] = [];
        const dateMap = new Map<string, OrderListItemDtoType>();

        ordersListDto.forEach(section => {
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
        setOrdersListDto(mergedData);
      }

      if (pagination) {
        setHasMore(pagination.hasMore);
        setCurrentPage(pagination.currentPage);
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchAllOrdersByUser(0, true);
    setIsRefreshing(false);
  }

  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      await fetchAllOrdersByUser(currentPage + 1, false);
      setIsLoadingMore(false);
    }
  }

  return (
    <SafeAreaView edges={['top']} style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Ваши заказы</Text>
      </View>
      <View style={styles.content}>
        {isLoading ? <ActivityIndicator color={"#6766AA"} size={'large'} /> : ordersListDto.length == 0 ?
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Вы не сделали ни одного заказа. Копите алгокоины и заказывайте крутые подарки - ваши заказы отобразятся в этом разделе.
          </Text>
          :
          <SectionList
            ref={sectionListRef}
            style={styles.listContainer}
            showsVerticalScrollIndicator={false}
            keyExtractor={(item) => item.id}
            sections={ordersListDto}
            renderItem={({ item }) => (<OrderListItem order={item} onOrderCancelled={refreshOrders} />)}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={isLoadingMore ? <ActivityIndicator color={"#6766AA"} size={'small'} style={{ marginVertical: 16 }} /> : null}
            renderSectionHeader={({ section: { date } }) => (
              <View style={styles.dateContainer}>
                <Text style={styles.dateText}>{date}</Text>
              </View>
            )}
          />

        }

      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
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
