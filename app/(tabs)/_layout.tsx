import { Ionicons } from '@expo/vector-icons';
import { Tabs } from 'expo-router';
import React from 'react';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { userSelector } from '@/stores/auth/authStore';
import { useSelector } from 'react-redux';


export default function TabLayout() {
  const colorScheme = useColorScheme();
  const user  = useSelector(userSelector);

  if (!user || !user.role) {
    return <Tabs />;
  }


  return (
    <Tabs
      screenOptions={{
        tabBarActiveTintColor: Colors[colorScheme ?? 'light'].primary,
        tabBarInactiveTintColor: Colors[colorScheme ?? 'light'].tabIconDefault,
        tabBarStyle: {
          backgroundColor: Colors[colorScheme ?? 'light'].background,
          borderTopColor: Colors[colorScheme ?? 'light'].border,
        },
        headerShown: false,
      }}>
      <Tabs.Screen
        name="profile"
        options={{
          title: 'Профиль',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="shop"
        options={{
          href: user?.role == 'student' ? '/shop' : null,
          title: 'Магазин',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="bag" size={size} color={color} />
          ),
        }}

      />
      <Tabs.Screen
        name="orders"
        options={{
          href: user?.role == 'student' ? '/orders' : null,
          title: 'Заказы',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="receipt" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="groups"
        options={{
          href: user?.role == 'teacher' ? '/groups' : null,
          title: 'Группы',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="people" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="coins"
        options={{
          href: user?.role == 'teacher' ? '/coins' : null,
          title: 'Зачисления',
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="cash" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  )
}
