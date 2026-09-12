import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import type { Product } from '../../data/products';
import { useCart } from '../../context/CartContext';
import { useWishlist } from '../../context/WishlistContext';
import { colors, fonts, radii, shadows } from '../../theme/theme';

type Props = {
  product: Product;
  fullWidth?: boolean;
};

export default function ProductCard({ product, fullWidth }: Props) {
  const discountPct = Math.round(((product.mrp - product.price) / product.mrp) * 100);
  const { quantityOf, addItem, increment, decrement } = useCart();
  const { isWishlisted, toggle } = useWishlist();
  const qty = quantityOf(product.id);
  const liked = isWishlisted(product.id);

  return (
    <View style={[styles.card, fullWidth && styles.cardFullWidth]}>
      <View style={styles.imageWrap}>
        <View style={styles.imagePlaceholder}>
          <Ionicons name="image-outline" size={22} color="rgba(21, 63, 50, 0.15)" />
        </View>
        <Image
          source={{ uri: product.imageUri }}
          style={styles.image}
          contentFit="cover"
          transition={250}
          cachePolicy="memory-disk"
        />
        {discountPct > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPct}% OFF</Text>
          </View>
        )}
        <TouchableOpacity
          style={styles.wishlistButton}
          activeOpacity={0.75}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          onPress={() => toggle(product)}
        >
          <Ionicons
            name={liked ? 'heart' : 'heart-outline'}
            size={16}
            color={liked ? colors.coral : colors.ink}
          />
        </TouchableOpacity>
      </View>

      <Text style={styles.name} numberOfLines={2}>
        {product.name}
      </Text>
      <Text style={styles.weight}>{product.unit}</Text>

      <View style={styles.bottomRow}>
        <View>
          <Text style={styles.price}>₹{product.price}</Text>
          {product.mrp > product.price && (
            <Text style={styles.mrp}>₹{product.mrp}</Text>
          )}
        </View>
        {qty === 0 ? (
          <TouchableOpacity
            style={styles.addButton}
            activeOpacity={0.8}
            onPress={() => addItem(product)}
          >
            <Text style={styles.addText}>ADD</Text>
          </TouchableOpacity>
        ) : (
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
        )}
      </View>
    </View>
  );
}

const CARD_WIDTH = 148;

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 10,
    ...shadows.soft,
  },
  cardFullWidth: {
    width: '100%',
  },
  imageWrap: {
    width: '100%',
    height: 110,
    borderRadius: radii.sm,
    overflow: 'hidden',
    marginBottom: 8,
    backgroundColor: colors.cream,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  imagePlaceholder: {
    ...StyleSheet.absoluteFill,
    alignItems: 'center',
    justifyContent: 'center',
  },
  discountBadge: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: colors.coral,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  discountText: {
    fontFamily: fonts.bodyBold,
    fontSize: 9,
    color: colors.salt,
  },
  wishlistButton: {
    position: 'absolute',
    top: 6,
    right: 6,
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(244, 240, 223, 0.9)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  name: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
    lineHeight: 17,
    minHeight: 34,
  },
  weight: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.clay,
    marginTop: 2,
    marginBottom: 8,
  },
  bottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  price: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.ink,
  },
  mrp: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.clay,
    textDecorationLine: 'line-through',
  },
  addButton: {
    borderWidth: 1.5,
    borderColor: colors.coral,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 6,
    backgroundColor: colors.salt,
  },
  addText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.coral,
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
});
