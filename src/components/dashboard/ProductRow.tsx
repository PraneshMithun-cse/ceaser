import { FlatList, StyleSheet, Text, View } from 'react-native';
import type { Product } from '../../data/products';
import { colors, displayScript, fonts, headlineStyle } from '../../theme/theme';
import ProductCard from './ProductCard';

type Props = {
  title: string;
  subtitle?: string;
  data: Product[];
};

export default function ProductRow({ title, subtitle, data }: Props) {
  return (
    <View style={styles.section}>
      <View style={styles.header}>
        <Text style={[headlineStyle(20), styles.title]}>{title}</Text>
        {subtitle ? <Text style={[styles.subtitle, displayScript]}>{subtitle}</Text> : null}
      </View>
      <FlatList
        horizontal
        data={data}
        keyExtractor={(p) => p.id}
        renderItem={({ item }) => <ProductCard product={item} />}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.row}
        ItemSeparatorComponent={() => <View style={{ width: 12 }} />}
        initialNumToRender={6}
        windowSize={5}
        removeClippedSubviews
      />
    </View>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: 26,
  },
  header: {
    paddingHorizontal: 20,
    marginBottom: 12,
  },
  title: {
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.clay,
    marginTop: 2,
    textTransform: 'none',
  },
  row: {
    paddingHorizontal: 20,
  },
});
