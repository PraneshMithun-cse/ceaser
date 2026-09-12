import { useState } from 'react';
import { Modal, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchBar from '../components/dashboard/SearchBar';
import PromoBanner from '../components/dashboard/PromoBanner';
import CategoryGrid from '../components/dashboard/CategoryGrid';
import ProductRow from '../components/dashboard/ProductRow';
import BottomTabBar from '../components/dashboard/BottomTabBar';
import AuthModal from '../components/auth/AuthModal';
import BuyloMap from '../components/map/BuyloMap';
import { decorGroups, flowerGroups, seafoodGroups, vegFruitGroups } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import { useLocation } from '../context/LocationContext';
import { colors, fonts, headlineStyle } from '../theme/theme';

const groupedRows = [...vegFruitGroups, ...flowerGroups, ...seafoodGroups, ...decorGroups];

type Props = {
  onSelectCategory: (categoryId: string) => void;
  onNavigate: (screen: 'home' | 'categories' | 'cart' | 'profile') => void;
};

export default function DashboardScreen({ onSelectCategory, onNavigate }: Props) {
  const { productsByGroup, productsByCategory } = useProducts();
  const { isSignedIn } = useAuth();
  const { label, coords } = useLocation();
  const [showAuth, setShowAuth] = useState(false);
  const [showMap, setShowMap] = useState(false);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader
          onPressCart={() => onNavigate('cart')}
          onPressLogin={() => (isSignedIn ? onNavigate('profile') : setShowAuth(true))}
          onPressMap={() => setShowMap(true)}
        />
        <SearchBar />
        <PromoBanner />
        <CategoryGrid onSelectCategory={onSelectCategory} />
        {groupedRows.map((row) => (
          <ProductRow
            key={row.group}
            title={row.title}
            subtitle={row.subtitle || undefined}
            data={productsByGroup(row.group)}
          />
        ))}
        <ProductRow
          title="Scrap Dealers"
          subtitle="Doorstep pickup, instant payout"
          data={productsByCategory('scrap')}
        />
      </ScrollView>
      <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} />

      <Modal
        visible={showMap}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={() => setShowMap(false)}
      >
        <View style={styles.mapModalRoot}>
          <View style={styles.mapModalHeader}>
            <Text style={[headlineStyle(18), styles.mapModalTitle]} numberOfLines={1}>
              {label}
            </Text>
            <TouchableOpacity
              style={styles.mapModalClose}
              onPress={() => setShowMap(false)}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </TouchableOpacity>
          </View>
          {coords ? (
            <BuyloMap latitude={coords.latitude} longitude={coords.longitude} label={label} />
          ) : (
            <View style={styles.mapPending}>
              <Text style={styles.mapPendingText}>Detecting your location…</Text>
            </View>
          )}
        </View>
      </Modal>

      <BottomTabBar active="home" onTabPress={onNavigate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  scroll: {
    flex: 1,
  },
  content: {
    paddingTop: 8,
    paddingBottom: 12,
  },
  mapModalRoot: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  mapModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 63, 50, 0.08)',
  },
  mapModalTitle: {
    flex: 1,
    color: colors.ink,
  },
  mapModalClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.salt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPending: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapPendingText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.clay,
  },
});
