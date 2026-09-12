import { Image, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { categories } from '../../data/products';
import { colors, fonts } from '../../theme/theme';

type Props = {
  onSelectCategory: (categoryId: string) => void;
};

export default function CategoryGrid({ onSelectCategory }: Props) {
  return (
    <View style={styles.section}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
      >
        {categories.map((c) => (
          <TouchableOpacity
            key={c.id}
            style={styles.item}
            activeOpacity={0.75}
            onPress={() => onSelectCategory(c.id)}
          >
            <View style={[styles.circle, { backgroundColor: c.tint }]}>
              <Image source={c.icon} style={styles.icon} resizeMode="cover" />
            </View>
            <Text style={styles.label} numberOfLines={2}>
              {c.shortLabel}
            </Text>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 24,
  },
  row: {
    paddingHorizontal: 20,
    gap: 18,
  },
  item: {
    alignItems: 'center',
    width: 76,
    gap: 8,
  },
  circle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    overflow: 'hidden',
  },
  icon: {
    width: '100%',
    height: '100%',
  },
  label: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    textAlign: 'center',
    color: colors.ink,
    lineHeight: 14,
  },
});
