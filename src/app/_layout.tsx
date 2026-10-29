import { Fraunces_300Light, Fraunces_300Light_Italic } from '@expo-google-fonts/fraunces';
import { GowunBatang_400Regular, GowunBatang_700Bold } from '@expo-google-fonts/gowun-batang';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function Root() {
  const [fontsLoaded] = useFonts({ Fraunces_300Light, Fraunces_300Light_Italic, GowunBatang_400Regular, GowunBatang_700Bold });
  const { ready } = useAuth();
  const done = fontsLoaded && ready;
  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);
  if (!done) return null;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.paper }, animation: 'fade' }} />
    </>
  );
}

export default function Layout() {
  return (
    <AuthProvider>
      <Root />
    </AuthProvider>
  );
}
