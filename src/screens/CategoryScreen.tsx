import { useMemo, useState } from 'react';
import { FlatList, Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import {
  categories,
  categorySubgroups,
  productsByCategory,
  productsByGroup,
  type Product,
} from '../data/products';
import ProductCard from '../components/dashboard/ProductCard';
import BottomTabBar from '../components/dashboard/BottomTabBar';
import { colors, fonts, headlineStyle, radii } from '../theme/theme';

type SortKey = 'default' | 'price-asc' | 'price-desc' | 'name-asc';

const sortOptions: { key: SortKey; label: string }[] = [
  { key: 'default', label: 'Featured' },
  { key: 'price-asc', label: 'Price: Low to High' },
  { key: 'price-desc', label: 'Price: High to Low' },
  { key: 'name-asc', label: 'Name: A to Z' },
];

function sortProducts(products: Product[], sort: SortKey): Product[] {
  if (sort === 'default') return products;
  const copy = [...products];
  if (sort === 'price-asc') copy.sort((a, b) => a.price - b.price);
  else if (sort === 'price-desc') copy.sort((a, b) => b.price - a.price);
  else if (sort === 'name-asc') copy.sort((a, b) => a.name.localeCompare(b.name));
  return copy;
}

type Props = {
  categoryId: string;
  onBack: () => void;
  onNavigate: (screen: 'home' | 'categories' | 'cart' | 'profile') => void;
};

export default function CategoryScreen({ categoryId, onBack, onNavigate }: Props) {
  const [sort, setSort] = useState<SortKey>('default');
  const [subgroup, setSubgroup] = useState<string>('all');
  const category = categories.find((c) => c.id === categoryId);
  const subgroups = categorySubgroups[categoryId] ?? [];

  const products = useMemo(() => {
    const base = subgroup === 'all' ? productsByCategory(categoryId) : productsByGroup(subgroup);
    return sortProducts(base, sort);
  }, [categoryId, subgroup, sort]);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <TouchableOpacity onPress={onBack} style={styles.backButton} activeOpacity={0.7}>
          <Ionicons name="arrow-back" size={22} color={colors.ink} />
        </TouchableOpacity>
        <View style={styles.headerText}>
          {category ? (
            <Image source={category.icon} style={styles.headerIcon} resizeMode="cover" />
          ) : null}
          <Text style={[headlineStyle(20), styles.title]} numberOfLines={1}>
            {category?.label ?? 'Category'}
          </Text>
        </View>
      </View>

      {subgroups.length > 0 && (
        <ScrollView
          horizontal
          style={styles.subgroupScroll}
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.subgroupRow}
        >
          {[{ group: 'all', title: 'All' }, ...subgroups].map((item) => {
            const active = item.group === subgroup;
            return (
              <TouchableOpacity
                key={item.group}
                style={[styles.subgroupPill, active && styles.subgroupPillActive]}
                activeOpacity={0.8}
                onPress={() => setSubgroup(item.group)}
              >
                <Text style={[styles.subgroupText, active && styles.subgroupTextActive]}>
                  {item.title}
                </Text>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      <ScrollView
        horizontal
        style={styles.sortScroll}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.sortRow}
      >
        {sortOptions.map((item) => {
          const active = item.key === sort;
          return (
            <TouchableOpacity
              key={item.key}
              style={[styles.sortPill, active && styles.sortPillActive]}
              activeOpacity={0.8}
              onPress={() => setSort(item.key)}
            >
              <Text style={[styles.sortText, active && styles.sortTextActive]}>{item.label}</Text>
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <Text style={styles.count}>{products.length} products</Text>

      <FlatList
        data={products}
        keyExtractor={(p) => p.id}
        numColumns={2}
        columnWrapperStyle={styles.gridRow}
        contentContainerStyle={styles.gridContent}
        renderItem={({ item }) => (
          <View style={styles.gridItem}>
            <ProductCard product={item} fullWidth />
          </View>
        )}
        initialNumToRender={10}
        windowSize={7}
        removeClippedSubviews
      />
      <BottomTabBar
        active="categories"
        onTabPress={(key) => {
          if (key === 'home') onBack();
          else onNavigate(key);
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 16,
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.salt,
  },
  headerText: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  headerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
  },
  title: {
    color: colors.ink,
    flexShrink: 1,
  },
  subgroupScroll: {
    flexGrow: 0,
    height: 44,
    marginBottom: 12,
  },
  subgroupRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  subgroupPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.butter,
  },
  subgroupPillActive: {
    backgroundColor: colors.ink,
  },
  subgroupText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  subgroupTextActive: {
    color: colors.cream,
  },
  sortScroll: {
    flexGrow: 0,
    height: 48,
    marginBottom: 16,
  },
  sortRow: {
    paddingHorizontal: 20,
    gap: 8,
    alignItems: 'center',
  },
  sortPill: {
    paddingHorizontal: 14,
    paddingVertical: 9,
    borderRadius: radii.pill,
    backgroundColor: colors.salt,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.1)',
  },
  sortPillActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  sortText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    lineHeight: 16,
    color: colors.ink,
  },
  sortTextActive: {
    color: colors.cream,
  },
  count: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 16,
    color: colors.clay,
    paddingHorizontal: 20,
    marginBottom: 10,
  },
  gridContent: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  gridRow: {
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  gridItem: {
    width: '48%',
  },
});
