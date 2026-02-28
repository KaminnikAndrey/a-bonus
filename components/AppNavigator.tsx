import { userSelector } from '@/stores/auth/authStore';
import { Redirect } from 'expo-router';
import React from 'react';
import { useSelector } from 'react-redux';

export default function AppNavigator() {
  const user = useSelector(userSelector);

  if (user) {
    return <Redirect href="/(tabs)/profile" />;
  } else {
    return <Redirect href="/auth" />;
  }
}
