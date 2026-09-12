import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts } from '../../theme/theme';

export type TabKey = 'home' | 'categories' | 'cart' | 'profile';

const tabs: { key: TabKey; label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { key: 'home', label: 'Home', icon: 'home' },
  { key: 'categories', label: 'Categories', icon: 'grid' },
  { key: 'cart', label: 'Cart', icon: 'cart' },
  { key: 'profile', label: 'Profile', icon: 'person' },
];

type Props = {
  active?: TabKey;
  onTabPress?: (key: TabKey) => void;
};

export default function BottomTabBar({ active = 'home', onTabPress }: Props) {
  return (
    <View style={styles.bar}>
      {tabs.map((t) => {
        const isActive = t.key === active;
        return (
          <TouchableOpacity
            key={t.key}
            style={styles.tab}
            activeOpacity={0.7}
            onPress={() => onTabPress?.(t.key)}
          >
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
