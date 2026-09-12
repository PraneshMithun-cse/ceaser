import { ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import BottomTabBar from '../components/dashboard/BottomTabBar';
import { colors, fonts, headlineStyle, radii, shadows } from '../theme/theme';

type MenuItem = {
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const menuItems: MenuItem[] = [
  { icon: 'receipt-outline', label: 'My Orders' },
  { icon: 'location-outline', label: 'Saved Addresses' },
  { icon: 'card-outline', label: 'Payment Methods' },
  { icon: 'heart-outline', label: 'Wishlist' },
  { icon: 'notifications-outline', label: 'Notifications' },
  { icon: 'help-circle-outline', label: 'Help & Support' },
  { icon: 'settings-outline', label: 'Settings' },
];

type Props = {
  onNavigate: (screen: 'home' | 'categories' | 'cart' | 'profile') => void;
};

export default function ProfileScreen({ onNavigate }: Props) {
  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[headlineStyle(24), styles.title]}>Profile</Text>

        <View style={styles.guestCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.salt} />
          </View>
          <View style={styles.guestText}>
            <Text style={styles.guestTitle}>You're browsing as a guest</Text>
            <Text style={styles.guestSubtitle}>Sign in to track orders and save addresses</Text>
          </View>
        </View>

        <TouchableOpacity style={styles.signInButton} activeOpacity={0.85}>
          <Text style={styles.signInText}>Sign In</Text>
        </TouchableOpacity>

        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.label}
              style={[styles.menuRow, i === menuItems.length - 1 && styles.menuRowLast]}
              activeOpacity={0.7}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={18} color={colors.ink} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.clay} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Buylo v1.0.0</Text>
      </ScrollView>

      <BottomTabBar active="profile" onTabPress={onNavigate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  content: {
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 24,
  },
  title: {
    color: colors.ink,
    marginBottom: 18,
  },
  guestCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 16,
    marginBottom: 14,
    ...shadows.soft,
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: colors.ink,
    alignItems: 'center',
    justifyContent: 'center',
  },
  guestText: {
    flex: 1,
    gap: 3,
  },
  guestTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  guestSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    lineHeight: 17,
    color: colors.clay,
  },
  signInButton: {
    backgroundColor: colors.ink,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
    marginBottom: 24,
  },
  signInText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.cream,
  },
  menu: {
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    ...shadows.soft,
  },
  menuRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 63, 50, 0.08)',
  },
  menuRowLast: {
    borderBottomWidth: 0,
  },
  menuIconWrap: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.cream,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuLabel: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  version: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.clay,
    textAlign: 'center',
    marginTop: 20,
  },
});
