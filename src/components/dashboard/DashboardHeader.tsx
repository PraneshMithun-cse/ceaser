import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, headlineStyle } from '../../theme/theme';

export default function DashboardHeader() {
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

      <TouchableOpacity style={styles.cartButton} activeOpacity={0.75}>
        <Ionicons name="cart-outline" size={22} color={colors.salt} />
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
});
