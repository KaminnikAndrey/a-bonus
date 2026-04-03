import { getProjectFeedItemById } from '@/services/feed/mockProjectFeed';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useLocalSearchParams, useRouter } from 'expo-router';
import React, { useMemo } from 'react';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function ProjectFeedDetailScreen() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  const project = useMemo(() => (id ? getProjectFeedItemById(id) : undefined), [id]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn} hitSlop={12}>
          <Text style={[styles.backText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]} numberOfLines={1}>
          Проект
        </Text>
        <View style={styles.headerSide} />
      </View>

      {project ? (
        <ScrollView contentContainerStyle={styles.scroll} showsVerticalScrollIndicator={false}>
          <Text style={[styles.title, { color: colors.text }]}>{project.title}</Text>
          <Text style={[styles.meta, { color: colors.placeholder }]}>
            {project.meta} · {project.authorName}
          </Text>
          <View style={[styles.tagPill, { borderColor: colors.border }]}>
            <Text style={[styles.tagText, { color: colors.primary }]}>{project.stack}</Text>
          </View>
          <Text style={[styles.body, { color: colors.text }]}>{project.body}</Text>
        </ScrollView>
      ) : (
        <Text style={[styles.empty, { color: colors.placeholder }]}>Проект не найден.</Text>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 10,
  },
  backBtn: { width: 44, height: 44, justifyContent: 'center', alignItems: 'center' },
  backText: { fontSize: 24 },
  headerTitle: { flex: 1, fontSize: 18, fontWeight: '700', textAlign: 'center' },
  headerSide: { width: 44 },
  scroll: { paddingHorizontal: 20, paddingBottom: 32 },
  title: { fontSize: 22, fontWeight: '800', marginBottom: 8 },
  meta: { fontSize: 14, marginBottom: 12 },
  tagPill: {
    alignSelf: 'flex-start',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: 1,
    marginBottom: 20,
  },
  tagText: { fontSize: 13, fontWeight: '600' },
  body: { fontSize: 16, lineHeight: 24 },
  empty: { textAlign: 'center', marginTop: 48, paddingHorizontal: 24, fontSize: 16 },
});
