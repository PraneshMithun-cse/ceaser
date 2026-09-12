import { ScrollView, StyleSheet, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import DashboardHeader from '../components/dashboard/DashboardHeader';
import SearchBar from '../components/dashboard/SearchBar';
import PromoBanner from '../components/dashboard/PromoBanner';
import CategoryGrid from '../components/dashboard/CategoryGrid';
import ProductRow from '../components/dashboard/ProductRow';
import BottomTabBar from '../components/dashboard/BottomTabBar';
import {
  decorGroups,
  flowerGroups,
  productsByCategory,
  productsByGroup,
  seafoodGroups,
  vegFruitGroups,
} from '../data/products';
import { colors } from '../theme/theme';

const groupedRows = [...vegFruitGroups, ...flowerGroups, ...seafoodGroups, ...decorGroups];

type Props = {
  onSelectCategory: (categoryId: string) => void;
  onNavigate: (screen: 'home' | 'categories' | 'cart' | 'profile') => void;
};

export default function DashboardScreen({ onSelectCategory, onNavigate }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        <DashboardHeader onPressCart={() => onNavigate('cart')} />
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
});
