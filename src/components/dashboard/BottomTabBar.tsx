import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../theme/theme';

const tabs = [
  { key: 'home', label: 'Home', icon: 'home' as const },
  { key: 'categories', label: 'Categories', icon: 'grid' as const },
  { key: 'cart', label: 'Cart', icon: 'cart' as const },
  { key: 'profile', label: 'Profile', icon: 'person' as const },
];

export default function BottomTabBar({ active = 'home' }: { active?: string }) {
  return (
    <View style={styles.bar}>
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <TouchableOpacity key={t.key} style={styles.tab} activeOpacity={0.7}>
            <Ionicons
              name={isActive ? t.icon : (`${t.icon}-outline` as any)}
              size={22}
              color={isActive ? colors.coral : colors.clay}
            />
            <Text style={[styles.label, isActive && styles.labelActive]}>{t.label}</Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.salt,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 63, 50, 0.08)',
    paddingTop: 8,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 3,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.clay,
  },
  labelActive: {
    color: colors.coral,
    fontFamily: fonts.bodySemiBold,
  },
});
