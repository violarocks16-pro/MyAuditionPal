import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { AuditionProvider } from '@/contexts/audition-context';
import { AuthProvider } from '@/contexts/auth-context';
import { ProfileProvider } from '@/contexts/profile-context';
import { useColorScheme } from '@/hooks/use-color-scheme';

export const unstable_settings = {
  anchor: '(tabs)',
};

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <ProfileProvider>
        <AuditionProvider>
          <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
            <Stack>
              <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
              <Stack.Screen name="onboarding" options={{ headerShown: false }} />
              <Stack.Screen name="audition/[id]" options={{ headerShown: false }} />
              <Stack.Screen name="add" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="sign-in" options={{ presentation: 'modal', headerShown: false }} />
              <Stack.Screen name="modal" options={{ presentation: 'modal', title: 'Modal' }} />
            </Stack>
            <StatusBar style="auto" />
          </ThemeProvider>
        </AuditionProvider>
      </ProfileProvider>
    </AuthProvider>
  );
}
