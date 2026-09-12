import { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, shadows } from '../../theme/theme';

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

function Tab({
  label,
  icon,
  isActive,
  onPress,
}: {
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
  isActive: boolean;
  onPress?: () => void;
}) {
  const scale = useRef(new Animated.Value(isActive ? 1 : 0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: isActive ? 1 : 0,
      friction: 7,
      tension: 90,
      useNativeDriver: true,
    }).start();
  }, [isActive, scale]);

  return (
    <TouchableOpacity style={styles.tab} activeOpacity={0.7} onPress={onPress}>
      <View style={styles.iconSlot}>
        <Animated.View
          style={[
            styles.pill,
            {
              opacity: scale,
              transform: [{ scale: scale.interpolate({ inputRange: [0, 1], outputRange: [0.6, 1] }) }],
            },
          ]}
        />
        <Ionicons
          name={isActive ? icon : (`${icon}-outline` as any)}
          size={22}
          color={isActive ? colors.salt : colors.clay}
        />
      </View>
      <Text style={[styles.label, isActive && styles.labelActive]}>{label}</Text>
    </TouchableOpacity>
  );
}

export default function BottomTabBar({ active = 'home', onTabPress }: Props) {
  return (
    <View style={styles.bar}>
      {tabs.map((t) => (
        <Tab
          key={t.key}
          label={t.label}
          icon={t.icon}
          isActive={t.key === active}
          onPress={() => onTabPress?.(t.key)}
        />
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  bar: {
    flexDirection: 'row',
    backgroundColor: colors.salt,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingTop: 10,
    paddingBottom: 4,
    ...shadows.soft,
  },
  tab: {
    flex: 1,
    alignItems: 'center',
    gap: 4,
  },
  iconSlot: {
    width: 44,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pill: {
    position: 'absolute',
    width: 44,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.coral,
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 10,
    color: colors.clay,
  },
  labelActive: {
    color: colors.coral,
    fontFamily: fonts.bodyBold,
  },
});
