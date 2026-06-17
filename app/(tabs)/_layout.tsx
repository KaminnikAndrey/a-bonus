import CheckSquareIcon from '@/assets/images/check-square.svg';
import TabTasksIcon from '@/assets/images/tab-tasks.svg';
import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { userSelector } from '@/stores/auth/authStore';
import { useSelector } from 'react-redux';

const TAB_ACTIVE_BG = '#6766AA';
const TAB_CELL = 40;
const TAB_RADIUS = 16;

function TabBarIconCell({ focused, children }: { focused: boolean; children: React.ReactNode }) {
  const opacity = useRef(new Animated.Value(focused ? 1 : 0)).current;

  useEffect(() => {
    Animated.timing(opacity, {
      toValue: focused ? 1 : 0,
      duration: 200,
      useNativeDriver: true,
    }).start();
  }, [focused, opacity]);

  return (
    <View style={styles.cell}>
      <Animated.View pointerEvents="none" style={[styles.activePill, { opacity }]} />
      {children}
    </View>
  );
}

export default function TabLayout() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useSelector(userSelector);
  const inactive = colors.tabIconDefault;
  const iconWhite = '#FFFFFF';

  /** Без сессии не монтируем вкладки — иначе на web «пустые» Modal из заказов/групп блокируют и экран auth. */
  if (!user || !user.role) {
    return null;
  }

  const role = String(user?.role ?? '').toLowerCase();
  const isTeacher = role === 'teacher';
  const isStudent = role === 'student';

  return (
    <Tabs
      screenOptions={{
        tabBarShowLabel: false,
        tabBarActiveTintColor: TAB_ACTIVE_BG,
        tabBarInactiveTintColor: inactive,
        tabBarStyle: {
          backgroundColor: colors.background,
          borderTopColor: colors.border,
        },
        tabBarItemStyle: styles.tabBarItem,
        headerShown: false,
      }}>
      {/*
        Порядок среди видимых вкладок: 1 Профиль → 2 Задачи (студ.) / Задачи по группам (преп.) → 3 Лента → 4–5.
        href /(tabs)/feed — чтобы не пересекаться с корневыми app/feed/[id] и publish.
      */}
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <Ionicons name="person" size={size} color={focused ? iconWhite : inactive} />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="tasks"
        options={{
          href: isStudent ? '/tasks' : null,
          title: 'Задачи',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <TabTasksIcon
                width={size}
                height={size}
                color={focused ? iconWhite : inactive}
              />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="groupTasks"
        options={{
          href: isTeacher ? '/groupTasks' : null,
          title: 'Задачи по группам',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <TabTasksIcon
                width={size}
                height={size}
                color={focused ? iconWhite : inactive}
              />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="feed"
        options={{
          href: isStudent || isTeacher ? '/(tabs)/feed' : null,
          title: 'Лента проектов',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <Ionicons name="newspaper-outline" size={size} color={focused ? iconWhite : inactive} />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          href: isStudent ? '/shop' : null,
          title: 'Магазин',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <Ionicons name="bag" size={size} color={focused ? iconWhite : inactive} />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="orders"
        options={{
          href: isStudent ? '/orders' : null,
          title: 'Заказы',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <CheckSquareIcon
                width={size}
                height={size}
                color={focused ? iconWhite : inactive}
              />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          href: isTeacher ? '/groups' : null,
          title: 'Группы',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <Ionicons name="document-text-outline" size={size} color={focused ? iconWhite : inactive} />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="coins"
        options={{
          href: isTeacher ? '/coins' : null,
          title: 'Зачисления',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <Ionicons name="cash" size={size} color={focused ? iconWhite : inactive} />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen name="calendar" options={{ href: null }} />
    </Tabs>
  );
}

const styles = StyleSheet.create({
  tabBarItem: {
    paddingVertical: 4,
  },
  cell: {
    width: TAB_CELL,
    height: TAB_CELL,
    justifyContent: 'center',
    alignItems: 'center',
  },
  activePill: {
    ...StyleSheet.absoluteFillObject,
    width: TAB_CELL,
    height: TAB_CELL,
    borderRadius: TAB_RADIUS,
    backgroundColor: TAB_ACTIVE_BG,
  },
});
