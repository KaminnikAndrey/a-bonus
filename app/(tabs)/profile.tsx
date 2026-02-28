import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { getProfileInfo, Profile } from '@/services/profile/profileApi';
import { logout, userSelector } from '@/stores/auth/authStore';
import { router } from 'expo-router';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useDispatch, useSelector } from 'react-redux';

export default function ProfileScreen() {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const user = useSelector(userSelector);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const dispatch = useDispatch();

  useEffect(() => {
    (async () => {
      setIsLoading(true);
      const { success, data } = await getProfileInfo();
      if (success && data) {
        setProfile(data)
      }
      setIsLoading(false);
    })();
  }, []);

  const onLogout = () => {
    dispatch(logout());
    router.push("/")
  }

  const handleLogout = () => {
    Alert.alert(
      'Выход',
      'Вы уверены, что хотите выйти?',
      [
        { text: 'Отмена', style: 'cancel' },
        { text: 'Выйти', style: 'destructive', onPress: onLogout },
      ]
    );
  };

  if (!user) {
    return (
      <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
        <Text style={[styles.errorText, { color: colors.text }]}>
          Пользователь не найден
        </Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Профиль</Text>
      </View>
      <View style={styles.content}>
        {isLoading ? <ActivityIndicator color={"#6766AA"} size={'large'} /> :
          <>
            {user?.role === 'student' ?
              (
                <View style={[styles.algoCard, { borderColor: colors.border }]}>
                  <View style={styles.leftSide}>
                    <Image source={require("@/assets/images/logo-white.png")} style={styles.logo}/>
                    <View>
                      <Text style={[styles.infoLabel, { color: 'white' }]}>
                        Ваш баланс: 
                      </Text>
                      <Text style={[styles.infoLabel, { color: 'white' }]}>
                        {profile?.algocoins} алгокоинов
                      </Text>
                    </View>
                  </View>
                  <View style={styles.rightSide}>
                    <Image source={require("@/assets/images/robot.png")} style={styles.robot}/>
                  </View>
                </View>
              ) : null
            }

            <View style={[styles.infoCard, { borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                Логин: {profile?.login}
              </Text>
            </View>

            <View style={[styles.infoCard, { borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                ФИО: {profile?.fullName}
              </Text>
            </View>

            <View style={[styles.infoCard, { borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                Email: {profile?.email}
              </Text>
            </View>

            <View style={[styles.infoCard, { borderColor: colors.border }]}>
              <Text style={[styles.infoLabel, { color: colors.text }]}>
                Дата рождения: {profile?.birthDate}
              </Text>
            </View>

            <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
              <Text style={styles.logoutText}>Выйти</Text>
            </TouchableOpacity>
          </>
        }
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo:{
    width: 61,
    height: 39
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
  content: {
    flex: 1,
    paddingHorizontal: 16,
    paddingTop: 24,
  },
  algoCard: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'space-between',
    backgroundColor: '#6766AA',
    borderRadius: 20,
    padding: 20,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    maxHeight: 150,
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
    paddingRight: 0
  },
  leftSide: {
    flex: 1,
    justifyContent: 'space-between',
  },
  rightSide: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'flex-end'
  },
  robot: {
    position: 'relative',
    width: 142,
    height: 142,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '500',
  },
  logoutButton: {
    marginTop: 32,
    alignItems: 'center',
  },
  logoutText: {
    color: '#FF4444',
    fontSize: 16,
    fontWeight: '600',
  },
  errorText: {
    fontSize: 18,
    textAlign: 'center',
    marginTop: 50,
  },
});
