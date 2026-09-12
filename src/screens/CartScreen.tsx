import { Image } from 'expo-image';
import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import BottomTabBar from '../components/dashboard/BottomTabBar';
import { colors, fonts, headlineStyle, radii, shadows } from '../theme/theme';

const DELIVERY_FEE = 25;

type Props = {
  onNavigate: (screen: 'home' | 'categories' | 'cart' | 'profile') => void;
};

export default function CartScreen({ onNavigate }: Props) {
  const { lines, increment, decrement, removeItem, totalCount, totalPrice } = useCart();

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={[headlineStyle(24), styles.title]}>Cart</Text>
        {totalCount > 0 && <Text style={styles.subtitle}>{totalCount} items</Text>}
      </View>

      {lines.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color="rgba(21, 63, 50, 0.2)" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={styles.emptyText}>Add items from the dashboard to see them here.</Text>
          <TouchableOpacity
            style={styles.shopButton}
            activeOpacity={0.85}
            onPress={() => onNavigate('home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {lines.map(({ product, qty }) => (
              <View key={product.id} style={styles.line}>
                <Image
                  source={{ uri: product.imageUri }}
                  style={styles.lineImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.lineUnit}>{product.unit}</Text>
                  <Text style={styles.linePrice}>₹{product.price * qty}</Text>
                </View>
                <View style={styles.lineActions}>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepperButton}
                      activeOpacity={0.8}
                      onPress={() => decrement(product.id)}
                    >
                      <Ionicons name="remove" size={14} color={colors.salt} />
                    </TouchableOpacity>
                    <Text style={styles.stepperQty}>{qty}</Text>
                    <TouchableOpacity
                      style={styles.stepperButton}
                      activeOpacity={0.8}
                      onPress={() => increment(product.id)}
                    >
                      <Ionicons name="add" size={14} color={colors.salt} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(product.id)} activeOpacity={0.7}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{totalPrice}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery fee</Text>
                <Text style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>₹{totalPrice + DELIVERY_FEE}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.checkoutTotalLabel}>Total</Text>
              <Text style={styles.checkoutTotalValue}>₹{totalPrice + DELIVERY_FEE}</Text>
            </View>
            <TouchableOpacity style={styles.checkoutButton} activeOpacity={0.85}>
              <Text style={styles.checkoutButtonText}>Proceed to Checkout</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <BottomTabBar active="cart" onTabPress={onNavigate} />
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
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.clay,
    marginBottom: 4,
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.clay,
    textAlign: 'center',
    marginBottom: 12,
  },
  shopButton: {
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  shopButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.cream,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  line: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 10,
    marginBottom: 12,
    ...shadows.soft,
  },
  lineImage: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
  },
  lineInfo: {
    flex: 1,
    gap: 2,
  },
  lineName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  lineUnit: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.clay,
  },
  linePrice: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
    marginTop: 4,
  },
  lineActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.coral,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  stepperButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    lineHeight: 16,
    color: colors.salt,
    minWidth: 14,
    textAlign: 'center',
  },
  removeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.clay,
    textDecorationLine: 'underline',
  },
  summary: {
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.clay,
  },
  summaryValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 63, 50, 0.1)',
    paddingTop: 10,
  },
  summaryTotalLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  summaryTotalValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.salt,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 63, 50, 0.08)',
  },
  checkoutTotalLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.clay,
  },
  checkoutTotalValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  checkoutButton: {
    backgroundColor: colors.ink,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  checkoutButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.cream,
  },
});
