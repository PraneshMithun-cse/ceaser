import { Image, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import type { Product } from '../../data/products';
import { colors, fonts, radii, shadows } from '../../theme/theme';

export default function ProductCard({ product }: { product: Product }) {
  const discountPct = Math.round(((product.mrp - product.price) / product.mrp) * 100);

  return (
    <View style={styles.card}>
      <View style={styles.imageWrap}>
        <Image source={{ uri: product.imageUri }} style={styles.image} resizeMode="cover" />
        {discountPct > 0 && (
          <View style={styles.discountBadge}>
            <Text style={styles.discountText}>{discountPct}% OFF</Text>
          </View>
        )}
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
        <TouchableOpacity style={styles.addButton} activeOpacity={0.8}>
          <Text style={styles.addText}>ADD</Text>
        </TouchableOpacity>
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
});
