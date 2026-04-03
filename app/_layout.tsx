import { DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { setStore } from '@/services/commonApi'; // Добавьте этот импорт
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { ImageBackground, StyleSheet } from 'react-native';
import 'react-native-reanimated';
import { Provider } from "react-redux";
import { PersistGate } from "redux-persist/integration/react";

import { ProjectFeedProvider } from '@/contexts/ProjectFeedContext';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { persistor, store } from '@/stores/auth/authStore';

console.log('Устанавливаем store в API');
setStore(store);

export const unstable_settings = {
    anchor: 'auth',
};


export default function RootLayout() {
  const colorScheme = useColorScheme();

  const theme = {
    ...DefaultTheme,
    colors: {
      ...DefaultTheme.colors,
      primary: Colors[colorScheme ?? 'light'].primary,
      background: 'transparent',
      card: 'transparent',
      text: Colors[colorScheme ?? 'light'].text,
      border: Colors[colorScheme ?? 'light'].border,
      notification: Colors[colorScheme ?? 'light'].primary,
    },
  };

  return (
    <Provider store={store}>
      <PersistGate persistor={persistor}>
        <ThemeProvider value={theme}>
          <ProjectFeedProvider>
          <ImageBackground 
            style={styles.container} 
            imageStyle={styles.backgroundImage} 
            source={require("@/assets/images/background.jpg")}
          >
            <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
            <Stack
              screenOptions={{
                headerShown: false,
                animation: 'default',
                presentation: 'card',
                animationTypeForReplace: 'push',
              }}
            >
              <Stack.Screen 
                name="auth" 
                options={{ 
                  headerShown: false,
                  animation: 'fade',
                }} 
              />
              <Stack.Screen 
                name="(tabs)" 
                options={{ 
                  headerShown: false,
                  animation: 'fade',
                }} 
              />
              <Stack.Screen 
                name="shop/[id]" 
                options={{ 
                  headerShown: false,
                  animation: 'slide_from_right',
                  presentation: 'card',
                }} 
              />
              <Stack.Screen
                name="feed/[id]"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="feed/publish"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
              <Stack.Screen
                name="ranks-info"
                options={{
                  headerShown: false,
                  animation: 'slide_from_right',
                  presentation: 'card',
                }}
              />
            </Stack>
          </ImageBackground>
          </ProjectFeedProvider>
        </ThemeProvider>
      </PersistGate>
    </Provider>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  backgroundImage: {
    opacity: 0.07
  },
});
