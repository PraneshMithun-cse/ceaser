import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import {
  useFonts,
  Inter_400Regular,
  Inter_500Medium,
  Inter_600SemiBold,
  Inter_700Bold,
} from '@expo-google-fonts/inter';
import BootSplashScreen from './src/screens/BootSplashScreen';
import DashboardScreen from './src/screens/DashboardScreen';
import { colors } from './src/theme/theme';

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [customFontsLoaded, setCustomFontsLoaded] = useState(false);
  const [bootDone, setBootDone] = useState(false);

  const [interLoaded] = useFonts({
    Inter_400Regular,
    Inter_500Medium,
    Inter_600SemiBold,
    Inter_700Bold,
  });

  useEffect(() => {
    Font.loadAsync({
      'RocGrotesk-Black': require('./assets/fonts/RocGrotesk-Black.otf'),
      'ThingsToRemember-Regular': require('./assets/fonts/ThingsToRemember-Regular.otf'),
    })
      .then(() => setCustomFontsLoaded(true))
      .catch(() => setCustomFontsLoaded(true));
  }, []);

  const fontsReady = interLoaded && customFontsLoaded;

  const onLayoutRootView = useCallback(async () => {
    if (fontsReady) {
      // Native splash carries no logo (backgroundColor only) so this handoff
      // never overlaps with BootSplashScreen's own logo — see app.json.
      await SplashScreen.hideAsync();
    }
  }, [fontsReady]);

  if (!fontsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <View style={styles.root} onLayout={onLayoutRootView}>
        {!bootDone ? (
          <BootSplashScreen onFinished={() => setBootDone(true)} />
        ) : (
          <DashboardScreen />
        )}
        <StatusBar style="dark" />
      </View>
    </SafeAreaProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
});
