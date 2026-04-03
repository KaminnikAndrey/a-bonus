import { MOCK_PROJECT_FEED } from '@/services/feed/mockProjectFeed';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React from 'react';
import { FlatList, Pressable, StyleSheet, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function FeedScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();

  return (
    <SafeAreaView edges={['top']} style={styles.safe}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Лента проектов</Text>
      </View>
      <FlatList
        data={MOCK_PROJECT_FEED}
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => router.push(`/feed/${item.id}`)}
            style={({ pressed }) => [
              styles.card,
              { backgroundColor: colors.background, borderColor: colors.border },
              pressed && { opacity: 0.92 },
            ]}>
            <Text style={[styles.cardTitle, { color: colors.text }]}>{item.title}</Text>
            <Text style={[styles.author, { color: colors.placeholder }]}>{item.authorName}</Text>
            <Text style={[styles.meta, { color: colors.placeholder }]}>{item.meta}</Text>
            <Text style={[styles.preview, { color: colors.text }]} numberOfLines={3}>
              {item.body}
            </Text>
            <Text style={[styles.stack, { color: colors.primary }]}>{item.stack}</Text>
          </Pressable>
        )}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: 'transparent',
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
  listContent: {
    paddingHorizontal: 16,
    paddingBottom: 24,
  },
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 16,
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 17,
    fontWeight: '700',
    marginBottom: 4,
  },
  author: {
    fontSize: 13,
    marginBottom: 4,
  },
  meta: {
    fontSize: 13,
    marginBottom: 10,
  },
  preview: {
    fontSize: 15,
    lineHeight: 22,
    marginBottom: 10,
  },
  stack: {
    fontSize: 13,
    fontWeight: '600',
  },
});
