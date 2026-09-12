import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { colors, fonts, headlineStyle, radii, shadows } from '../../theme/theme';

export default function PromoBanner() {
  return (
    <View style={styles.wrap}>
      <LinearGradient
        colors={[colors.butter, colors.saffron]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.card}
      >
        <View style={styles.textBlock}>
          <Text style={styles.eyebrow}>Everything, Delivered Local</Text>
          <Text style={[headlineStyle(28), styles.title]}>FRESH PICKS{'\n'}EVERY DAY</Text>
          <TouchableOpacity style={styles.cta} activeOpacity={0.85}>
            <Text style={styles.ctaText}>Shop now</Text>
          </TouchableOpacity>
        </View>
      </LinearGradient>
    </View>
  );
}

const styles = StyleSheet.create({
  wrap: {
    paddingHorizontal: 20,
    marginBottom: 24,
  },
  card: {
    borderRadius: radii.lg,
    padding: 20,
    minHeight: 150,
    justifyContent: 'center',
    ...shadows.glow,
  },
  textBlock: {
    gap: 8,
  },
  eyebrow: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    letterSpacing: 1,
    textTransform: 'uppercase',
    color: colors.kelp,
  },
  title: {
    color: colors.ink,
    marginBottom: 4,
  },
  cta: {
    alignSelf: 'flex-start',
    backgroundColor: colors.ink,
    paddingHorizontal: 18,
    paddingVertical: 9,
    borderRadius: radii.pill,
    marginTop: 4,
  },
  ctaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.cream,
  },
});
