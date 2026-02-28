import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import React from 'react';
import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface WelcomeScreenProps {
  onRoleSelect: (role: 'student' | 'teacher') => void;
}

export default function WelcomeScreen({ onRoleSelect }: WelcomeScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];

  return (
    <SafeAreaView style={[styles.container]}>
        <View style={styles.content}>
          <View style={styles.logoContainer}>
            <Image style={styles.logo} source={require("@/assets/images/logo.png")}/>
          </View>


          <View style={styles.buttonContainer}>
            <TouchableOpacity
              style={[styles.primaryButton, { backgroundColor: colors.primary }]}
              onPress={() => onRoleSelect('student')}
              activeOpacity={0.8}
            >
              <Text style={styles.primaryButtonText}>Я ученик</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[styles.secondaryButton, { borderColor: colors.primary }]}
              onPress={() => onRoleSelect('teacher')}
              activeOpacity={0.8}
            >
              <Text style={[styles.secondaryButtonText, { color: colors.primary }]}>
                Я преподаватель
              </Text>
            </TouchableOpacity>
          </View>
        </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  logo: {
    width: 173,
    height: 111,
    margin: 8
  },
  logoContainer: {
    flex: 4,
    justifyContent: 'center'
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 80,
  },
  buttonContainer: {
    width: '100%',
    gap: 16,
    marginBottom: 10
  },
  primaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  secondaryButton: {
    paddingVertical: 16,
    paddingHorizontal: 24,
    borderRadius: 12,
    borderWidth: 1,
    alignItems: 'center',
  },
  secondaryButtonText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
