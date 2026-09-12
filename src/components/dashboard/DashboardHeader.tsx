import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../../context/CartContext';
import { colors, fonts, headlineStyle } from '../../theme/theme';

type Props = {
  onPressCart: () => void;
};

export default function DashboardHeader({ onPressCart }: Props) {
  const { totalCount } = useCart();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.timeBadge}>
          <Ionicons name="flash" size={14} color={colors.ink} />
          <Text style={styles.timeText}>12 mins</Text>
        </View>
        <TouchableOpacity style={styles.locationRow} activeOpacity={0.7}>
          <Ionicons name="location-sharp" size={16} color={colors.coral} />
          <Text style={[headlineStyle(18), styles.locationText]} numberOfLines={1}>
            Chennai, Tamil Nadu
          </Text>
          <Ionicons name="chevron-down" size={16} color={colors.ink} />
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.cartButton} activeOpacity={0.75} onPress={onPressCart}>
        <Ionicons name="cart-outline" size={22} color={colors.salt} />
        {totalCount > 0 && (
          <View style={styles.cartBadge}>
            <Text style={styles.cartBadgeText}>{totalCount > 9 ? '9+' : totalCount}</Text>
          </View>
        )}
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 8,
    paddingBottom: 12,
  },
  left: {
    flex: 1,
    gap: 4,
  },
  timeBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    alignSelf: 'flex-start',
    backgroundColor: colors.butter,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 999,
  },
  timeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.ink,
  },
  locationRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 2,
  },
  locationText: {
    color: colors.ink,
    maxWidth: 220,
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  cartBadge: {
    position: 'absolute',
    top: -2,
    right: -2,
    minWidth: 18,
    height: 18,
    borderRadius: 9,
    paddingHorizontal: 4,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: colors.cream,
  },
  cartBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    lineHeight: 13,
    color: colors.salt,
  },
});
