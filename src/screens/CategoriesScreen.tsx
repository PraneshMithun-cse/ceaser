import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { categories } from '../data/products';
import { useProducts } from '../context/ProductsContext';
import BottomTabBar from '../components/dashboard/BottomTabBar';
import { colors, displayScript, fonts, headlineStyle, radii, shadows } from '../theme/theme';

type Props = {
  onSelectCategory: (categoryId: string) => void;
  onNavigate: (screen: 'home' | 'categories' | 'cart' | 'profile') => void;
};

export default function CategoriesScreen({ onSelectCategory, onNavigate }: Props) {
  const { productsByCategory } = useProducts();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={[headlineStyle(24), styles.title]}>Categories</Text>
        <Text style={[styles.subtitle, displayScript]}>Browse everything Buylo's vendors offer</Text>
      </View>

      <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
        {categories.map((c) => {
          const count = productsByCategory(c.id).length;
          return (
            <TouchableOpacity
              key={c.id}
              style={styles.card}
              activeOpacity={0.85}
              onPress={() => onSelectCategory(c.id)}
            >
              <View style={[styles.iconWrap, { backgroundColor: c.tint }]}>
                <Image source={c.icon} style={styles.icon} resizeMode="cover" />
              </View>
              <View style={styles.cardInfo}>
                <Text style={styles.cardLabel}>{c.label}</Text>
                <Text style={styles.cardCount}>{count} items available</Text>
              </View>
              <Ionicons name="chevron-forward" size={20} color={colors.clay} />
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <BottomTabBar active="categories" onTabPress={onNavigate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
    gap: 4,
  },
  title: {
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.clay,
  },
  grid: {
    paddingHorizontal: 20,
    paddingBottom: 24,
    gap: 12,
  },
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 14,
    ...shadows.soft,
  },
  iconWrap: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  cardInfo: {
    flex: 1,
    gap: 2,
  },
  cardLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
  },
  cardCount: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.clay,
  },
});
