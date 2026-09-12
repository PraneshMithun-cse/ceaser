import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuth } from '@clerk/expo';
import { useCart } from '../../context/CartContext';
import { useLocation } from '../../context/LocationContext';
import { colors, fonts, headlineStyle } from '../../theme/theme';

type Props = {
  onPressCart: () => void;
  onPressLogin: () => void;
  onPressMap: () => void;
};

export default function DashboardHeader({ onPressCart, onPressLogin, onPressMap }: Props) {
  const { totalCount } = useCart();
  const { isSignedIn } = useAuth();
  const { label, detecting, detectLocation } = useLocation();

  return (
    <View style={styles.row}>
      <View style={styles.left}>
        <View style={styles.timeBadge}>
          <Ionicons name="flash" size={14} color={colors.ink} />
          <Text style={styles.timeText}>12 mins</Text>
        </View>
        <TouchableOpacity
          style={styles.locationRow}
          activeOpacity={0.7}
          onPress={detectLocation}
          disabled={detecting}
        >
          <Ionicons name="location-sharp" size={16} color={colors.coral} />
          <Text style={[headlineStyle(18), styles.locationText]} numberOfLines={1}>
            {label}
          </Text>
          {detecting ? (
            <ActivityIndicator size="small" color={colors.ink} />
          ) : (
            <Ionicons name="chevron-down" size={16} color={colors.ink} />
          )}
        </TouchableOpacity>
        <TouchableOpacity style={styles.mapLink} activeOpacity={0.7} onPress={onPressMap}>
          <Ionicons name="map-outline" size={13} color={colors.clay} />
          <Text style={styles.mapLinkText}>View on map</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actions}>
        <TouchableOpacity style={styles.loginButton} activeOpacity={0.75} onPress={onPressLogin}>
          <Ionicons
            name={isSignedIn ? 'person' : 'person-outline'}
            size={20}
            color={colors.ink}
          />
        </TouchableOpacity>

        <TouchableOpacity style={styles.cartButton} activeOpacity={0.75} onPress={onPressCart}>
          <Ionicons name="cart-outline" size={22} color={colors.salt} />
          {totalCount > 0 && (
            <View style={styles.cartBadge}>
              <Text style={styles.cartBadgeText}>{totalCount > 9 ? '9+' : totalCount}</Text>
            </View>
          )}
        </TouchableOpacity>
      </View>
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
  mapLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  mapLinkText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    color: colors.clay,
    textDecorationLine: 'underline',
  },
  actions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 2,
  },
  loginButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.salt,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
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
