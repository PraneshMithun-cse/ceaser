import { useMemo, useState } from 'react';
import { StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Image } from 'expo-image';
import { Ionicons } from '@expo/vector-icons';
import { useProducts } from '../../context/ProductsContext';
import { useCart } from '../../context/CartContext';
import { colors, displayScript, fonts, radii, shadows } from '../../theme/theme';

export default function SearchBar() {
  const [query, setQuery] = useState('');
  const { products } = useProducts();
  const { addItem, quantityOf, increment, decrement } = useCart();

  const results = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return [];
    return products
      .filter((p) => {
        return (
          p.name.toLowerCase().includes(q) ||
          p.nameTamil?.toLowerCase().includes(q) ||
          p.nameThanglish?.toLowerCase().includes(q) ||
          p.description?.toLowerCase().includes(q)
        );
      })
      .slice(0, 30);
  }, [query, products]);

  const isSearching = query.trim().length > 0;

  return (
    <View style={styles.container}>
      <View style={styles.bar}>
        <Ionicons name="search" size={18} color={colors.clay} />
        <View style={styles.inputWrap}>
          {!isSearching && (
            <Text style={[styles.placeholder, displayScript, styles.noPointerEvents]}>
              Search vegetables, seafood, flowers...
            </Text>
          )}
          <TextInput
            style={styles.input}
            value={query}
            onChangeText={setQuery}
            returnKeyType="search"
            autoCorrect={false}
          />
        </View>
        {isSearching && (
          <TouchableOpacity onPress={() => setQuery('')} hitSlop={10}>
            <Ionicons name="close-circle" size={18} color={colors.clay} />
          </TouchableOpacity>
        )}
      </View>

      {isSearching && (
        <View style={styles.resultsPanel}>
          {results.length === 0 ? (
            <Text style={styles.emptyText}>No products found for "{query}"</Text>
          ) : (
            results.map((product) => {
              const qty = quantityOf(product.id);
              return (
                <View key={product.id} style={styles.resultRow}>
                  <Image
                    source={{ uri: product.imageUri }}
                    style={styles.resultImage}
                    contentFit="cover"
                    transition={150}
                    cachePolicy="memory-disk"
                  />
                  <View style={styles.resultInfo}>
                    <Text style={styles.resultName} numberOfLines={1}>
                      {product.name}
                    </Text>
                    <Text style={styles.resultMeta}>
                      {product.unit} · ₹{product.price}
                    </Text>
                  </View>
                  {qty === 0 ? (
                    <TouchableOpacity
                      style={styles.addButton}
                      activeOpacity={0.85}
                      onPress={() => addItem(product)}
                    >
                      <Text style={styles.addButtonText}>ADD</Text>
                    </TouchableOpacity>
                  ) : (
                    <View style={styles.stepper}>
                      <TouchableOpacity
                        style={styles.stepperButton}
                        activeOpacity={0.8}
                        onPress={() => decrement(product.id)}
                      >
                        <Ionicons name="remove" size={13} color={colors.salt} />
                      </TouchableOpacity>
                      <Text style={styles.stepperQty}>{qty}</Text>
                      <TouchableOpacity
                        style={styles.stepperButton}
                        activeOpacity={0.8}
                        onPress={() => increment(product.id)}
                      >
                        <Ionicons name="add" size={13} color={colors.salt} />
                      </TouchableOpacity>
                    </View>
                  )}
                </View>
              );
            })
          )}
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    marginHorizontal: 20,
    marginBottom: 16,
  },
  bar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.salt,
    borderRadius: radii.pill,
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.08)',
  },
  inputWrap: {
    flex: 1,
    justifyContent: 'center',
  },
  placeholder: {
    position: 'absolute',
    fontSize: 15,
    color: colors.clay,
  },
  noPointerEvents: {
    pointerEvents: 'none',
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.ink,
    padding: 0,
  },
  resultsPanel: {
    marginTop: 10,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 10,
    gap: 8,
    ...shadows.soft,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.clay,
    textAlign: 'center',
    paddingVertical: 16,
  },
  resultRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    paddingVertical: 6,
  },
  resultImage: {
    width: 44,
    height: 44,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
  },
  resultInfo: {
    flex: 1,
    gap: 2,
  },
  resultName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  resultMeta: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: colors.clay,
  },
  addButton: {
    borderWidth: 1,
    borderColor: colors.coral,
    borderRadius: radii.sm,
    paddingHorizontal: 14,
    paddingVertical: 7,
  },
  addButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 11,
    color: colors.coral,
  },
  stepper: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: colors.coral,
    borderRadius: radii.sm,
    paddingHorizontal: 6,
    paddingVertical: 5,
  },
  stepperButton: {
    width: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepperQty: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.salt,
    minWidth: 14,
    textAlign: 'center',
  },
});
