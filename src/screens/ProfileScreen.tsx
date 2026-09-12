import { useState } from 'react';
import {
  Image,
  Linking,
  Modal,
  ScrollView,
  StyleSheet,
  Switch,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuth, useUser } from '@clerk/expo';
import BottomTabBar from '../components/dashboard/BottomTabBar';
import AuthModal from '../components/auth/AuthModal';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLocation } from '../context/LocationContext';
import { useOrders } from '../context/OrdersContext';
import { colors, fonts, headlineStyle, radii, shadows } from '../theme/theme';

type SheetKey =
  | 'orders'
  | 'addresses'
  | 'payments'
  | 'wishlist'
  | 'notifications'
  | 'help'
  | 'settings';

type MenuItem = {
  key: SheetKey;
  icon: keyof typeof Ionicons.glyphMap;
  label: string;
};

const menuItems: MenuItem[] = [
  { key: 'orders', icon: 'receipt-outline', label: 'My Orders' },
  { key: 'addresses', icon: 'location-outline', label: 'Saved Addresses' },
  { key: 'payments', icon: 'card-outline', label: 'Payment Methods' },
  { key: 'wishlist', icon: 'heart-outline', label: 'Wishlist' },
  { key: 'notifications', icon: 'notifications-outline', label: 'Notifications' },
  { key: 'help', icon: 'help-circle-outline', label: 'Help & Support' },
  { key: 'settings', icon: 'settings-outline', label: 'Settings' },
];

const FAQS = [
  {
    q: 'How does BUYLO work?',
    a: 'You add products to your request, place it, and nearby vendors respond with availability and price. You pick the vendor you like.',
  },
  {
    q: 'How do I pay?',
    a: 'Currently BUYLO supports Cash on Delivery — pay the vendor directly when your order arrives.',
  },
  {
    q: 'Can I bargain with vendors?',
    a: 'Yes — once a vendor accepts your request, you can discuss price and quantity directly with them.',
  },
];

type Address = { id: string; label: string; details: string };

export default function ProfileScreen({ onNavigate }: { onNavigate: (screen: 'home' | 'categories' | 'cart' | 'profile') => void }) {
  const { isSignedIn, signOut } = useAuth();
  const { user } = useUser();
  const [showAuth, setShowAuth] = useState(false);
  const [activeSheet, setActiveSheet] = useState<SheetKey | null>(null);

  const { clear: clearCart, totalCount } = useCart();
  const { items: wishlistItems, remove: removeWishlist } = useWishlist();
  const { label: locationLabel, detecting, detectLocation } = useLocation();
  const { ongoing: ongoingOrders, history: orderHistory, openTracking } = useOrders();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [newAddressLabel, setNewAddressLabel] = useState('');
  const [newAddressDetails, setNewAddressDetails] = useState('');

  const [notifPrefs, setNotifPrefs] = useState({
    orderUpdates: true,
    promotions: false,
    vendorMessages: true,
  });

  const [openFaq, setOpenFaq] = useState<number | null>(null);

  const displayName = user?.fullName || user?.primaryEmailAddress?.emailAddress || 'Signed in';

  const addAddress = () => {
    if (!newAddressLabel.trim() || !newAddressDetails.trim()) return;
    setAddresses((prev) => [
      ...prev,
      { id: `${Date.now()}`, label: newAddressLabel.trim(), details: newAddressDetails.trim() },
    ]);
    setNewAddressLabel('');
    setNewAddressDetails('');
  };

  const closeSheet = () => setActiveSheet(null);

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <ScrollView contentContainerStyle={styles.content} showsVerticalScrollIndicator={false}>
        <Text style={[headlineStyle(24), styles.title]}>Profile</Text>

        <View style={styles.guestCard}>
          <View style={styles.avatar}>
            <Ionicons name="person" size={28} color={colors.salt} />
          </View>
          <View style={styles.guestText}>
            <Text style={styles.guestTitle} numberOfLines={1}>
              {isSignedIn ? displayName : "You're browsing as a guest"}
            </Text>
            <Text style={styles.guestSubtitle}>
              {isSignedIn
                ? user?.primaryEmailAddress?.emailAddress ?? ''
                : 'Sign in to track orders and save addresses'}
            </Text>
          </View>
        </View>

        {isSignedIn ? (
          <TouchableOpacity
            style={styles.signOutButton}
            activeOpacity={0.85}
            onPress={() => signOut()}
          >
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            style={styles.signInButton}
            activeOpacity={0.85}
            onPress={() => setShowAuth(true)}
          >
            <Text style={styles.signInText}>Sign In</Text>
          </TouchableOpacity>
        )}

        <View style={styles.menu}>
          {menuItems.map((item, i) => (
            <TouchableOpacity
              key={item.key}
              style={[styles.menuRow, i === menuItems.length - 1 && styles.menuRowLast]}
              activeOpacity={0.7}
              onPress={() => setActiveSheet(item.key)}
            >
              <View style={styles.menuIconWrap}>
                <Ionicons name={item.icon} size={18} color={colors.ink} />
              </View>
              <Text style={styles.menuLabel}>{item.label}</Text>
              {item.key === 'wishlist' && wishlistItems.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{wishlistItems.length}</Text>
                </View>
              )}
              {item.key === 'orders' && ongoingOrders.length > 0 && (
                <View style={styles.countBadge}>
                  <Text style={styles.countBadgeText}>{ongoingOrders.length}</Text>
                </View>
              )}
              <Ionicons name="chevron-forward" size={18} color={colors.clay} />
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.version}>Buylo v1.0.0</Text>
      </ScrollView>

      <AuthModal visible={showAuth} onClose={() => setShowAuth(false)} />

      <Modal
        visible={activeSheet !== null}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeSheet}
      >
        <SafeAreaView style={styles.sheetRoot} edges={['top', 'left', 'right', 'bottom']}>
          <View style={styles.sheetHeader}>
            <Text style={[headlineStyle(20), styles.sheetTitle]}>
              {menuItems.find((m) => m.key === activeSheet)?.label}
            </Text>
            <TouchableOpacity
              style={styles.sheetClose}
              onPress={closeSheet}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </TouchableOpacity>
          </View>

          <ScrollView contentContainerStyle={styles.sheetContent} keyboardShouldPersistTaps="handled">
            {activeSheet === 'orders' && (
              <View style={styles.sheetSection}>
                {ongoingOrders.length === 0 && orderHistory.length === 0 ? (
                  <View style={styles.emptySheet}>
                    <Ionicons name="receipt-outline" size={48} color="rgba(21, 63, 50, 0.2)" />
                    <Text style={styles.emptySheetTitle}>No orders yet</Text>
                    <Text style={styles.emptySheetText}>
                      Requests you place will show up here once vendors respond.
                    </Text>
                  </View>
                ) : (
                  <>
                    {ongoingOrders.length > 0 && (
                      <View style={styles.orderGroup}>
                        <Text style={styles.orderGroupTitle}>Ongoing</Text>
                        {ongoingOrders.map((o) => (
                          <TouchableOpacity
                            key={o.id}
                            style={styles.orderCard}
                            activeOpacity={0.85}
                            onPress={() => {
                              closeSheet();
                              openTracking(o.id);
                            }}
                          >
                            <View style={styles.orderIconWrap}>
                              <Ionicons name="bicycle" size={20} color={colors.salt} />
                            </View>
                            <View style={styles.orderInfo}>
                              <Text style={styles.addressLabel}>{o.vendor.name}</Text>
                              <Text style={styles.addressDetails}>
                                {o.totalCount} item{o.totalCount > 1 ? 's' : ''} · ₹{o.totalPrice} · {o.location}
                              </Text>
                            </View>
                            <View style={styles.orderStatusBadge}>
                              <Text style={styles.orderStatusText}>On the way</Text>
                            </View>
                          </TouchableOpacity>
                        ))}
                      </View>
                    )}

                    {orderHistory.length > 0 && (
                      <View style={styles.orderGroup}>
                        <Text style={styles.orderGroupTitle}>Received</Text>
                        {orderHistory.map((o) => (
                          <View key={o.id} style={styles.orderCard}>
                            <View style={[styles.orderIconWrap, styles.orderIconWrapDone]}>
                              <Ionicons name="checkmark" size={20} color={colors.salt} />
                            </View>
                            <View style={styles.orderInfo}>
                              <Text style={styles.addressLabel}>{o.vendor.name}</Text>
                              <Text style={styles.addressDetails}>
                                {o.totalCount} item{o.totalCount > 1 ? 's' : ''} · ₹{o.totalPrice} · {o.location}
                              </Text>
                            </View>
                            <View style={[styles.orderStatusBadge, styles.orderStatusBadgeDone]}>
                              <Text style={[styles.orderStatusText, styles.orderStatusTextDone]}>Delivered</Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </>
                )}
              </View>
            )}

            {activeSheet === 'addresses' && (
              <View style={styles.sheetSection}>
                {addresses.length === 0 && (
                  <Text style={styles.emptySheetText}>No saved addresses yet.</Text>
                )}
                {addresses.map((addr) => (
                  <View key={addr.id} style={styles.addressCard}>
                    <View style={styles.addressInfo}>
                      <Text style={styles.addressLabel}>{addr.label}</Text>
                      <Text style={styles.addressDetails}>{addr.details}</Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => setAddresses((prev) => prev.filter((a) => a.id !== addr.id))}
                    >
                      <Ionicons name="trash-outline" size={18} color={colors.coral} />
                    </TouchableOpacity>
                  </View>
                ))}

                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Label</Text>
                  <TextInputField
                    placeholder="Home, Work, etc."
                    value={newAddressLabel}
                    onChangeText={setNewAddressLabel}
                  />
                </View>
                <View style={styles.inputGroup}>
                  <Text style={styles.inputLabel}>Address</Text>
                  <TextInputField
                    placeholder="House no, street, area"
                    value={newAddressDetails}
                    onChangeText={setNewAddressDetails}
                  />
                </View>
                <TouchableOpacity style={styles.primaryButton} activeOpacity={0.85} onPress={addAddress}>
                  <Text style={styles.primaryButtonText}>Add Address</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeSheet === 'payments' && (
              <View style={styles.sheetSection}>
                <View style={styles.paymentCard}>
                  <Ionicons name="cash-outline" size={22} color={colors.ink} />
                  <View style={styles.paymentInfo}>
                    <Text style={styles.paymentTitle}>Cash on Delivery</Text>
                    <Text style={styles.paymentSubtitle}>Pay the vendor directly when your order arrives.</Text>
                  </View>
                  <View style={styles.activeBadge}>
                    <Text style={styles.activeBadgeText}>Active</Text>
                  </View>
                </View>
                <Text style={styles.emptySheetText}>
                  Card and UPI payments aren't available yet — support is coming soon.
                </Text>
              </View>
            )}

            {activeSheet === 'wishlist' && (
              <View style={styles.sheetSection}>
                {wishlistItems.length === 0 ? (
                  <View style={styles.emptySheet}>
                    <Ionicons name="heart-outline" size={48} color="rgba(21, 63, 50, 0.2)" />
                    <Text style={styles.emptySheetTitle}>Your wishlist is empty</Text>
                    <Text style={styles.emptySheetText}>
                      Tap the heart icon on any product to save it here.
                    </Text>
                  </View>
                ) : (
                  wishlistItems.map((p) => (
                    <View key={p.id} style={styles.wishlistRow}>
                      <Image source={{ uri: p.imageUri }} style={styles.wishlistImage} />
                      <View style={styles.wishlistInfo}>
                        <Text style={styles.addressLabel} numberOfLines={1}>{p.name}</Text>
                        <Text style={styles.addressDetails}>{p.unit} · ₹{p.price}</Text>
                      </View>
                      <TouchableOpacity onPress={() => removeWishlist(p.id)}>
                        <Ionicons name="close-circle" size={22} color={colors.clay} />
                      </TouchableOpacity>
                    </View>
                  ))
                )}
              </View>
            )}

            {activeSheet === 'notifications' && (
              <View style={styles.sheetSection}>
                <ToggleRow
                  label="Order updates"
                  subtitle="Get notified when a vendor accepts or updates your request"
                  value={notifPrefs.orderUpdates}
                  onValueChange={(v) => setNotifPrefs((p) => ({ ...p, orderUpdates: v }))}
                />
                <ToggleRow
                  label="Promotions"
                  subtitle="Offers and discounts from nearby vendors"
                  value={notifPrefs.promotions}
                  onValueChange={(v) => setNotifPrefs((p) => ({ ...p, promotions: v }))}
                />
                <ToggleRow
                  label="Vendor messages"
                  subtitle="Direct messages from vendors about your requests"
                  value={notifPrefs.vendorMessages}
                  onValueChange={(v) => setNotifPrefs((p) => ({ ...p, vendorMessages: v }))}
                />
              </View>
            )}

            {activeSheet === 'help' && (
              <View style={styles.sheetSection}>
                {FAQS.map((faq, i) => (
                  <TouchableOpacity
                    key={faq.q}
                    style={styles.faqCard}
                    activeOpacity={0.8}
                    onPress={() => setOpenFaq(openFaq === i ? null : i)}
                  >
                    <View style={styles.faqHeader}>
                      <Text style={styles.faqQuestion}>{faq.q}</Text>
                      <Ionicons
                        name={openFaq === i ? 'chevron-up' : 'chevron-down'}
                        size={16}
                        color={colors.clay}
                      />
                    </View>
                    {openFaq === i && <Text style={styles.faqAnswer}>{faq.a}</Text>}
                  </TouchableOpacity>
                ))}

                <TouchableOpacity
                  style={styles.primaryButton}
                  activeOpacity={0.85}
                  onPress={() => Linking.openURL('mailto:support@buylo.app')}
                >
                  <Text style={styles.primaryButtonText}>Email Support</Text>
                </TouchableOpacity>
              </View>
            )}

            {activeSheet === 'settings' && (
              <View style={styles.sheetSection}>
                <View style={styles.settingsRow}>
                  <View style={styles.settingsInfo}>
                    <Text style={styles.addressLabel}>Current location</Text>
                    <Text style={styles.addressDetails}>{locationLabel}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.smallOutlineButton}
                    onPress={detectLocation}
                    disabled={detecting}
                  >
                    <Text style={styles.smallOutlineButtonText}>
                      {detecting ? 'Detecting…' : 'Refresh'}
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.settingsRow}>
                  <View style={styles.settingsInfo}>
                    <Text style={styles.addressLabel}>Cart</Text>
                    <Text style={styles.addressDetails}>{totalCount} item{totalCount === 1 ? '' : 's'} in cart</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.smallOutlineButton}
                    onPress={clearCart}
                    disabled={totalCount === 0}
                  >
                    <Text style={styles.smallOutlineButtonText}>Clear</Text>
                  </TouchableOpacity>
                </View>

                {isSignedIn && (
                  <TouchableOpacity
                    style={styles.signOutButton}
                    activeOpacity={0.85}
                    onPress={() => {
                      signOut();
                      closeSheet();
                    }}
                  >
                    <Text style={styles.signOutText}>Sign Out</Text>
                  </TouchableOpacity>
                )}

                <Text style={styles.emptySheetText}>Buylo v1.0.0</Text>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      <BottomTabBar active="profile" onTabPress={onNavigate} />
    </SafeAreaView>
  );
}

function TextInputField({
  placeholder,
  value,
  onChangeText,
}: {
  placeholder: string;
  value: string;
  onChangeText: (v: string) => void;
}) {
  return (
    <TextInput
      style={styles.input}
      placeholder={placeholder}
      placeholderTextColor={colors.clay}
      value={value}
      onChangeText={onChangeText}
    />
  );
}

function ToggleRow({
  label,
  subtitle,
  value,
  onValueChange,
}: {
  label: string;
  subtitle: string;
  value: boolean;
  onValueChange: (v: boolean) => void;
}) {
  return (
    <View style={styles.settingsRow}>
      <View style={styles.settingsInfo}>
        <Text style={styles.addressLabel}>{label}</Text>
        <Text style={styles.addressDetails}>{subtitle}</Text>
      </View>
      <Switch
        value={value}
        onValueChange={onValueChange}
        trackColor={{ false: 'rgba(21, 63, 50, 0.15)', true: colors.coral }}
        thumbColor={colors.salt}
      />
    </View>
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
  signOutButton: {
    backgroundColor: colors.salt,
    borderWidth: 1.5,
    borderColor: colors.coral,
    paddingVertical: 14,
    borderRadius: radii.pill,
    alignItems: 'center',
    marginBottom: 24,
  },
  signOutText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.coral,
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
  countBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 5,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  countBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.salt,
  },
  version: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.clay,
    textAlign: 'center',
    marginTop: 20,
  },
  sheetRoot: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  sheetHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 63, 50, 0.08)',
  },
  sheetTitle: {
    color: colors.ink,
  },
  sheetClose: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.salt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetContent: {
    padding: 20,
  },
  sheetSection: {
    gap: 14,
  },
  emptySheet: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 48,
    gap: 8,
  },
  emptySheetTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.ink,
    marginTop: 8,
  },
  emptySheetText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.clay,
    textAlign: 'center',
  },
  addressCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 14,
  },
  addressInfo: {
    flex: 1,
    gap: 2,
  },
  addressLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  addressDetails: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.clay,
  },
  inputGroup: {
    gap: 6,
  },
  inputLabel: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  input: {
    fontFamily: fonts.body,
    fontSize: 15,
    backgroundColor: colors.salt,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.15)',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    color: colors.ink,
  },
  primaryButton: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 14,
    alignItems: 'center',
  },
  primaryButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    color: colors.cream,
  },
  paymentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 16,
  },
  paymentInfo: {
    flex: 1,
    gap: 2,
  },
  paymentTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 14,
    color: colors.ink,
  },
  paymentSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.clay,
  },
  activeBadge: {
    backgroundColor: 'rgba(21, 63, 50, 0.1)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  activeBadgeText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.ink,
  },
  wishlistRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 10,
  },
  wishlistImage: {
    width: 48,
    height: 48,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
  },
  wishlistInfo: {
    flex: 1,
    gap: 2,
  },
  settingsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 14,
  },
  settingsInfo: {
    flex: 1,
    gap: 2,
  },
  smallOutlineButton: {
    borderWidth: 1,
    borderColor: colors.ink,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 7,
  },
  smallOutlineButtonText: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 12,
    color: colors.ink,
  },
  faqCard: {
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 14,
    gap: 8,
  },
  faqHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 10,
  },
  faqQuestion: {
    flex: 1,
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  faqAnswer: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.clay,
  },
  orderGroup: {
    gap: 10,
  },
  orderGroupTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 12,
    color: colors.clay,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  orderCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 14,
  },
  orderIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  orderIconWrapDone: {
    backgroundColor: colors.ink,
  },
  orderInfo: {
    flex: 1,
    gap: 2,
  },
  orderStatusBadge: {
    backgroundColor: 'rgba(231, 101, 79, 0.12)',
    borderRadius: radii.pill,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  orderStatusBadgeDone: {
    backgroundColor: 'rgba(21, 63, 50, 0.1)',
  },
  orderStatusText: {
    fontFamily: fonts.bodyBold,
    fontSize: 10,
    color: colors.coral,
  },
  orderStatusTextDone: {
    color: colors.ink,
  },
});
