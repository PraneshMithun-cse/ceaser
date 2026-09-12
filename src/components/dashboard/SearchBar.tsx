import { StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors, fonts, radii } from '../../theme/theme';

export default function SearchBar() {
  return (
    <TouchableOpacity style={styles.bar} activeOpacity={0.8}>
      <Ionicons name="search" size={18} color={colors.clay} />
      <Text style={styles.placeholder}>Search vegetables, seafood, flowers...</Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  bar: {
    marginHorizontal: 20,
    marginBottom: 16,
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
  placeholder: {
    fontFamily: fonts.body,
    fontSize: 14,
    color: colors.clay,
  },
});
