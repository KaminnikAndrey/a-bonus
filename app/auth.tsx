import AuthScreen from '@/components/AuthScreen';
import SuccessScreen from '@/components/SuccessScreen';
import WelcomeScreen from '@/components/WelcomeScreen';
import { login, userSelector } from '@/stores/auth/authStore';
import { useRouter } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';

type Screen = 'welcome' | 'auth' | 'success';

export default function AuthFlowScreen() {
  const [currentScreen, setCurrentScreen] = useState<Screen>('welcome');
  const [userRole, setUserRole] = useState<'student' | 'teacher'>('student');
  const user = useSelector(userSelector);
  const dispatch = useDispatch();
  const router = useRouter();

  useEffect(() => {
    if (user) {
      router.replace('/profile');
    }
  }, []);

  const handleRoleSelect = (role: 'student' | 'teacher') => {
    setUserRole(role);
    setCurrentScreen('auth');
  };

  const handleBackToWelcome = () => {
    setCurrentScreen('welcome');
  };

  const handleAuthSuccess = (loginValue: string, userData: { id: string; role: 'student' | 'teacher' }, password: string) => {
    dispatch(login({
      user: userData,
      creds: {
        login: loginValue,
        password: password,
      }
    }));
    setCurrentScreen('success');
  };

  const renderScreen = () => {
    switch (currentScreen) {
      case 'welcome':
        return <WelcomeScreen onRoleSelect={handleRoleSelect} />;
      case 'auth':
        return (
          <AuthScreen
            onBack={handleBackToWelcome}
            onSuccess={handleAuthSuccess}
            userRole={userRole}
          />
        );
      case 'success':
        return (
          <SuccessScreen
            userRole={userRole}
          />
        );
      default:
        return <WelcomeScreen onRoleSelect={handleRoleSelect} />;
    }
  };

  return (
    <View style={styles.container}>
      {renderScreen()}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
});

