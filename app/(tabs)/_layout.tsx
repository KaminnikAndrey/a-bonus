import CheckSquareIcon from '@/assets/images/check-square.svg';
import CpuTabIcon from '@/assets/images/cpu.svg';
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

  if (!user || !user.role) {
    return <Tabs screenOptions={{ tabBarShowLabel: false }} />;
  }

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
          href: user?.role === 'student' ? '/tasks' : null,
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
        name="feed"
        options={{
          href: user?.role === 'student' ? '/feed' : null,
          title: 'Лента проектов',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <CpuTabIcon width={size} height={size} color={focused ? iconWhite : inactive} />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          href: user?.role === 'student' ? '/shop' : null,
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
          href: user?.role === 'student' ? '/orders' : null,
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
          href: user?.role === 'teacher' ? '/groups' : null,
          title: 'Группы',
          tabBarIcon: ({ focused, size }) => (
            <TabBarIconCell focused={focused}>
              <Ionicons name="people" size={size} color={focused ? iconWhite : inactive} />
            </TabBarIconCell>
          ),
        }}
      />
      <Tabs.Screen
        name="coins"
        options={{
          href: user?.role === 'teacher' ? '/coins' : null,
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
