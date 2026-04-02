import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { login as loginApi } from '@/services/auth/authApi';
import React, { useState } from 'react';
import { ActivityIndicator, Alert, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface AuthScreenProps {
  onBack: () => void;
  onSuccess: (login: string, userData: { id: string; role: 'student' | 'teacher' }, password: string) => void;
  userRole: 'student' | 'teacher';
}

export default function AuthScreen({ onBack, onSuccess, userRole }: AuthScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const [login, setLogin] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!login.trim() || !password.trim()) {
      Alert.alert('Ошибка', 'Пожалуйста, заполните все поля');
      return;
    }

    setIsLoading(true);
    try {
      const { success, data, error } = await loginApi(login.trim(), password);
      
      if (success && data && data.user) {
        const userRoleFromApi = data.user.role.toLowerCase();
        const expectedRole = userRole === 'teacher' ? 'teacher' : 'student';
        
        if (userRoleFromApi !== expectedRole) {
          Alert.alert('Ошибка', `Вы выбрали роль "${userRole === 'teacher' ? 'Преподаватель' : 'Студент'}", но ваш аккаунт имеет другую роль`);//бред, но если есть две кнопку, то пусть будет две кнопки
          setIsLoading(false);
          return;
        }

        const storeUser = {
          id: data.user.id?.toString() || '',
          role: userRoleFromApi === 'teacher' ? 'teacher' : 'student' as 'student' | 'teacher',
        };

        onSuccess(login.trim(), storeUser, password);
      } else {
        Alert.alert('Ошибка', error || 'Неверный логин или пароль');
      }
    } catch (error: any) {
      Alert.alert('Ошибка', 'Произошла ошибка при авторизации. Проверьте подключение к серверу.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton}>
          <Text style={[styles.backButtonText, { color: colors.text }]}>←</Text>
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Авторизация</Text>
        <View style={styles.placeholder} />
      </View>

      <View style={styles.content}>
        <View style={styles.inputContainer}>
          <TextInput
            style={[
              styles.input,
              {
                borderColor: colors.border,
                color: colors.text,
              }
            ]}
            placeholder="Логин"
            placeholderTextColor={colors.placeholder}
            value={login}
            onChangeText={setLogin}
            autoCapitalize="none"
          />
          
          <View style={styles.passwordContainer}>
            <TextInput
              style={[
                styles.input,
                styles.passwordInput,
                {
                  borderColor: colors.border,
                  color: colors.text,
                }
              ]}
              placeholder="Пароль"
              placeholderTextColor={colors.placeholder}
              value={password}
              onChangeText={setPassword}
              secureTextEntry={!showPassword}
            />
            <TouchableOpacity
              style={styles.eyeButton}
              onPress={() => setShowPassword(!showPassword)}
            >
              <Text style={[styles.eyeButtonText, { color: colors.placeholder }]}>
                {showPassword ? '👁️' : '👁️‍🗨️'}
              </Text>
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity
          style={[
            styles.loginButton, 
            { backgroundColor: colors.primary },
            isLoading && styles.loginButtonDisabled
          ]}
          onPress={handleLogin}
          activeOpacity={0.8}
          disabled={isLoading}
        >
          {isLoading ? (
            <ActivityIndicator color="#fff" />
          ) : (
            <Text style={styles.loginButtonText}>Войти</Text>
          )}
        </TouchableOpacity>

        {__DEV__ && (
          <Text style={[styles.devHint, { color: colors.placeholder }]}>
            Демо без сервера: логин mock-student или mock-teacher, пароль любой.
          </Text>
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
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  backButton: {
    padding: 8,
  },
  backButtonText: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  placeholder: {
    width: 40,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'center',
  },
  inputContainer: {
    gap: 16,
    marginBottom: 32,
  },
  input: {
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 16,
    fontSize: 16,
  },
  passwordContainer: {
    position: 'relative',
  },
  passwordInput: {
    paddingRight: 50,
  },
  eyeButton: {
    position: 'absolute',
    right: 16,
    top: 10,
    padding: 4,
  },
  eyeButtonText: {
    fontSize: 20,
  },
  loginButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  loginButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  loginButtonDisabled: {
    opacity: 0.6,
  },
  devHint: {
    marginTop: 20,
    fontSize: 13,
    lineHeight: 18,
    textAlign: 'center',
  },
});
