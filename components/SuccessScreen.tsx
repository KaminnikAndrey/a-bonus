import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useRouter } from 'expo-router';
import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

interface SuccessScreenProps {
  userRole: string;
}

export default function SuccessScreen({userRole }: SuccessScreenProps) {
  const colorScheme = useColorScheme();
  const colors = Colors[colorScheme ?? 'light'];
  const router = useRouter();
  const scaleAnim = useRef(new Animated.Value(0)).current;
  const fadeAnim = useRef(new Animated.Value(0)).current;
  
  const dotAnims = useRef(
    Array.from({ length: 8 }, () => new Animated.Value(0))
  ).current;

  // Позиции точек 
  const dotPositions = [
    { top: 20, left: 30, size: 6 },
    { top: 56, left: 110, size: 14 },
    { top: 10, left: 58, size: 5 },
    { top: 56, left: 10, size: 3 },
    { top: 15, left: 90, size: 9 },
    { top: 103, left: 55, size: 3 },
    { top: 15, left: 10, size: 12 },
    { top: 97, left: 86, size: 5 },
    { top: 90, left: 15, size: 13 },
  ];

  useEffect(() => {

    Animated.sequence([
      Animated.timing(scaleAnim, {
        toValue: 1,
        duration: 600,
        useNativeDriver: true,
      }),
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
    ]).start();


    // Анимация появления точек с разными интервалами
    const dotsAnimations = dotAnims.map((anim, index) => 
      Animated.timing(anim, {
        toValue: 1,
        duration: 400,
        delay: index * 100, 
        useNativeDriver: true,
      })
    );
    
    Animated.stagger(200, dotsAnimations).start();
  }, []);


  return (
    <SafeAreaView style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View style={styles.content}>
        <View style={styles.iconContainer}>
          <Animated.View
            style={[
              styles.successIcon,
              {
                backgroundColor: colors.primary,
                borderColor: colors.primaryLight,
                transform: [{ scale: scaleAnim }],
              }
            ]}
          >
            <Text style={styles.checkmark}>✓</Text>
          </Animated.View>
          
          <View style={styles.dotsContainer}>
            {dotPositions.map((position, index) => (
              <Animated.View
                key={index}
                style={[
                  styles.dot,
                  {
                    backgroundColor: colors.primaryLight,
                    top: position.top,
                    left: position.left,
                    width: position.size,
                    height: position.size,
                    borderRadius: position.size / 2,
                    opacity: dotAnims[index],
                  }
                ]}
              />
            ))}
          </View>
        </View>

        <Animated.View style={{ opacity: fadeAnim }}>
          <Text style={[styles.successTitle, { color: colors.text }]}>
            Успешно!
          </Text>
          
          <Text style={[styles.successMessage, { color: colors.text }]}>
            Вы успешно авторизовались в нашем приложении как{' '}
            <Text style={{ color: colors.primary, fontWeight: 'bold' }}>
              {userRole == 'student' ? 'Ученик' : 'Преподаватель'}
            </Text>.
          </Text>
        </Animated.View>

        <TouchableOpacity
          style={[styles.continueButton, { backgroundColor: colors.primary }]}
          onPress={() => router.replace('/(tabs)/profile')}
          activeOpacity={0.8}
        >
          <Text style={styles.continueButtonText}>Продолжить</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 24,
  },
  iconContainer: {
    position: 'relative',
    marginBottom: 32,
  },
  successIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    borderWidth: 3,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkmark: {
    color: '#fff',
    fontSize: 32,
    fontWeight: 'bold',
  },
  dotsContainer: {
    position: 'absolute',
    width: 120,
    height: 120,
    top: -20,
    left: -20,
  },
  dot: {
    position: 'absolute',
  },
  successTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    textAlign: 'center',
    marginBottom: 16,
  },
  successMessage: {
    fontSize: 16,
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 48,
  },
  continueButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    borderRadius: 12,
    alignItems: 'center',
    minWidth: 200,
  },
  continueButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
});
