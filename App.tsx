import { useCallback, useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { ClerkProvider } from '@clerk/expo';
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
import CategoriesScreen from './src/screens/CategoriesScreen';
import CategoryScreen from './src/screens/CategoryScreen';
import CartScreen from './src/screens/CartScreen';
import ProfileScreen from './src/screens/ProfileScreen';
import { CartProvider } from './src/context/CartContext';
import { ProductsProvider } from './src/context/ProductsContext';
import { LocationProvider } from './src/context/LocationContext';
import { WishlistProvider } from './src/context/WishlistContext';
import { OrdersProvider } from './src/context/OrdersContext';
import MiniCartBar from './src/components/cart/MiniCartBar';
import OrderTrackingModal from './src/components/orders/OrderTrackingModal';
import { clerkTokenCache } from './src/lib/clerkTokenCache';
import { colors } from './src/theme/theme';

type TabScreen = 'home' | 'categories' | 'cart' | 'profile';

const clerkPublishableKey = process.env.EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY;
if (!clerkPublishableKey) {
  throw new Error(
    'Missing EXPO_PUBLIC_CLERK_PUBLISHABLE_KEY — set it in mobile/.env (see .env, gitignored).',
  );
}

SplashScreen.preventAutoHideAsync().catch(() => {});

export default function App() {
  const [customFontsLoaded, setCustomFontsLoaded] = useState(false);
  const [bootDone, setBootDone] = useState(false);
  const [activeCategoryId, setActiveCategoryId] = useState<string | null>(null);
  const [tab, setTab] = useState<TabScreen>('home');

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

  const goHome = () => {
    setActiveCategoryId(null);
    setTab('home');
  };

  const closeCategory = () => setActiveCategoryId(null);

  const handleNavigate = (screen: TabScreen) => {
    if (screen === 'home') {
      goHome();
      return;
    }
    setActiveCategoryId(null);
    setTab(screen);
  };

  let screen;
  if (!bootDone) {
    screen = <BootSplashScreen onFinished={() => setBootDone(true)} />;
  } else if (activeCategoryId) {
    screen = (
      <CategoryScreen
        categoryId={activeCategoryId}
        onBack={closeCategory}
        onNavigate={handleNavigate}
      />
    );
  } else if (tab === 'categories') {
    screen = <CategoriesScreen onSelectCategory={setActiveCategoryId} onNavigate={handleNavigate} />;
  } else if (tab === 'cart') {
    screen = <CartScreen onNavigate={handleNavigate} />;
  } else if (tab === 'profile') {
    screen = <ProfileScreen onNavigate={handleNavigate} />;
  } else {
    screen = (
      <DashboardScreen onSelectCategory={setActiveCategoryId} onNavigate={handleNavigate} />
    );
  }

  return (
    <ClerkProvider publishableKey={clerkPublishableKey} tokenCache={clerkTokenCache}>
      <SafeAreaProvider>
        <ProductsProvider>
          <CartProvider>
            <WishlistProvider>
              <LocationProvider>
                <OrdersProvider>
                  <View style={styles.root} onLayout={onLayoutRootView}>
                    {screen}
                    <MiniCartBar
                      visible={bootDone && tab !== 'cart'}
                      onPress={() => handleNavigate('cart')}
                    />
                    <OrderTrackingModal onGoHome={goHome} />
                    <StatusBar style="dark" />
                  </View>
                </OrdersProvider>
              </LocationProvider>
            </WishlistProvider>
          </CartProvider>
        </ProductsProvider>
      </SafeAreaProvider>
    </ClerkProvider>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
});
