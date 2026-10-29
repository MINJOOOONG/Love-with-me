import { CherryBombOne_400Regular } from '@expo-google-fonts/cherry-bomb-one';
import { Jua_400Regular } from '@expo-google-fonts/jua';
import { useFonts } from 'expo-font';
import { Stack } from 'expo-router';
import * as SplashScreen from 'expo-splash-screen';
import { StatusBar } from 'expo-status-bar';
import { useEffect } from 'react';

import { AuthProvider, useAuth } from '@/lib/auth';
import { colors } from '@/lib/theme';

SplashScreen.preventAutoHideAsync();

function Root() {
  const [fontsLoaded] = useFonts({ CherryBombOne_400Regular, Jua_400Regular });
  const { ready } = useAuth();
  const done = fontsLoaded && ready;
  useEffect(() => {
    if (done) SplashScreen.hideAsync();
  }, [done]);
  if (!done) return null;
  return (
    <>
      <StatusBar style="dark" />
      <Stack screenOptions={{ headerShown: false, contentStyle: { backgroundColor: colors.stone }, animation: 'fade' }} />
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
