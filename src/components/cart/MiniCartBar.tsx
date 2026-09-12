import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { colors, fonts, radii, shadows } from '../../theme/theme';

type Props = {
  visible: boolean;
  onPress: () => void;
};

export default function MiniCartBar({ visible, onPress }: Props) {
  const { totalCount, totalPrice } = useCart();
  const translateY = useRef(new Animated.Value(160)).current;
  const scale = useRef(new Animated.Value(1)).current;
  const prevCount = useRef(totalCount);

  useEffect(() => {
    Animated.timing(translateY, {
      toValue: visible && totalCount > 0 ? 0 : 160,
      duration: 260,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [visible, totalCount]);

  useEffect(() => {
    if (totalCount > prevCount.current) {
      Animated.sequence([
        Animated.timing(scale, { toValue: 1.05, duration: 120, useNativeDriver: true }),
        Animated.timing(scale, { toValue: 1, duration: 120, useNativeDriver: true }),
      ]).start();
    }
    prevCount.current = totalCount;
  }, [totalCount]);

  if (totalCount === 0) return null;

  return (
    <Animated.View
      pointerEvents={visible ? 'box-none' : 'none'}
      style={[styles.wrap, { transform: [{ translateY }] }]}
    >
      <Animated.View style={[styles.bar, { transform: [{ scale }] }]}>
        <TouchableOpacity style={styles.content} activeOpacity={0.9} onPress={onPress}>
          <View style={styles.badge}>
            <Ionicons name="cart" size={16} color={colors.salt} />
            <Text style={styles.badgeText}>{totalCount > 9 ? '9+' : totalCount}</Text>
          </View>
          <Text style={styles.label} numberOfLines={1}>
            {totalCount} item{totalCount > 1 ? 's' : ''} added · ₹{totalPrice}
          </Text>
          <View style={styles.cta}>
            <Text style={styles.ctaText}>Proceed to Cart</Text>
            <Ionicons name="arrow-forward" size={15} color={colors.ink} />
          </View>
        </TouchableOpacity>
      </Animated.View>
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    position: 'absolute',
    left: 0,
    right: 0,
    bottom: 72,
    alignItems: 'center',
    paddingHorizontal: 16,
  },
  bar: {
    width: '100%',
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    ...shadows.soft,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 10,
    paddingHorizontal: 14,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  badgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.salt,
  },
  label: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.salt,
  },
  cta: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: colors.salt,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.ink,
  },
});
