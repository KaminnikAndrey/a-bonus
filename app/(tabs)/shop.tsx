import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getAllShopItems } from "@/services/shop/shopApi";
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, FlatList, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import ShopItemList, { H_PADDING, ShopItemListInfo } from '@/components/shop/ShopItemList';

export default function ShopScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [itemsList, setItemsList] = useState<ShopItemListInfo[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      await fetchShopItems(0, true);
      setIsLoading(false);
    })();
  }, []);

  const fetchShopItems = async (page: number = 0, reset: boolean = false) => {
    const {success, data, pagination} = await getAllShopItems(page, 20);
    if(success && data) {
      if (reset) {
        setItemsList(data);
      } else {
        setItemsList(prev => [...prev, ...data]);
      }
      
      if (pagination) {
        setHasMore(pagination.hasMore);
        setCurrentPage(pagination.currentPage);
      }
    }
  }

  const handleRefresh = async () => {
    setIsRefreshing(true);
    await fetchShopItems(0, true);
    setIsRefreshing(false);
  }

  const handleLoadMore = async () => {
    if (!isLoadingMore && hasMore) {
      setIsLoadingMore(true);
      await fetchShopItems(currentPage + 1, false);
      setIsLoadingMore(false);
    }
  }

  return (
    <SafeAreaView
      edges={['top']}
      style={[styles.container, { backgroundColor: colors.backgroundSurface }]}
    >
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Магазин подарков</Text>
      </View>
      <View style={styles.content}>
        {isLoading ? (
          <ActivityIndicator color="#6766AA" size="large" />
        ) : itemsList.length === 0 ? (
          <Text style={[styles.subtitle, { color: colors.text }]}>
            Магазин подарков пуст. Администратор ещё не добавил ассортимент.
          </Text>
        ) : (
          <FlatList
            style={styles.listContainer}
            data={itemsList}
            keyExtractor={(item) => item.id}
            renderItem={({ item }) => <ShopItemList {...item} />}
            numColumns={2}
            columnWrapperStyle={styles.columnWrap}
            contentContainerStyle={styles.listContent}
            showsVerticalScrollIndicator={false}
            refreshing={isRefreshing}
            onRefresh={handleRefresh}
            onEndReached={handleLoadMore}
            onEndReachedThreshold={0.5}
            ListFooterComponent={
              isLoadingMore ? (
                <ActivityIndicator color="#6766AA" size="small" style={{ marginVertical: 16 }} />
              ) : null
            }
          />
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: H_PADDING,
    paddingTop: 8,
    paddingBottom: 8,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 0,
  },
  title: {
    fontSize: 24,
    lineHeight: 31,
    textAlign: 'center',
    fontWeight: '700',
    letterSpacing: -0.48,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
    paddingHorizontal: 24,
  },
  listContainer: {
    flex: 1,
    width: '100%',
    alignSelf: 'stretch',
  },
  listContent: {
    paddingHorizontal: H_PADDING,
    paddingTop: 8,
    paddingBottom: 24,
  },
  columnWrap: {
    justifyContent: 'space-between',
  },
});
