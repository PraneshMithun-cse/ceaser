import { useEffect, useMemo, useRef, useState } from 'react';
import { Image } from 'expo-image';
import {
  Animated,
  Easing,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useLocation } from '../context/LocationContext';
import { useOrders } from '../context/OrdersContext';
import BottomTabBar from '../components/dashboard/BottomTabBar';
import BuyloMap, { type MapVendor } from '../components/map/BuyloMap';
import { generateNearbyVendors, nearestVendor } from '../lib/vendors';
import { colors, displayScript, fonts, headlineStyle, radii, shadows } from '../theme/theme';

const DELIVERY_FEE = 25;
const TRIP_ETA_MS = 12 * 60 * 1000;

const SERVICE_TIME_OPTIONS: { label: string; icon: keyof typeof Ionicons.glyphMap }[] = [
  { label: 'As soon as possible', icon: 'flash' },
  { label: 'Morning (8–11 AM)', icon: 'partly-sunny-outline' },
  { label: 'Afternoon (12–4 PM)', icon: 'sunny-outline' },
  { label: 'Evening (5–8 PM)', icon: 'moon-outline' },
];

const SENDING_STEPS = [
  'Finding nearby vendors…',
  'Matching best price…',
  'Confirming availability…',
];

type Stage = 'form' | 'sending';

type Props = {
  onNavigate: (screen: 'home' | 'categories' | 'cart' | 'profile') => void;
};

export default function CartScreen({ onNavigate }: Props) {
  const { lines, increment, decrement, removeItem, totalCount, totalPrice } = useCart();
  const { label: detectedLocation, coords } = useLocation();
  const { ongoing, createOrder, openTracking } = useOrders();

  const vendors = useMemo<MapVendor[]>(
    () => (coords ? generateNearbyVendors(coords.latitude, coords.longitude, 4) : []),
    [coords],
  );

  const [showRequestModal, setShowRequestModal] = useState(false);
  const [requestLocation, setRequestLocation] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [stage, setStage] = useState<Stage>('form');
  const [sendingStep, setSendingStep] = useState(0);

  const pulse = useRef(new Animated.Value(0)).current;
  const activeOrder = ongoing[0] ?? null;

  useEffect(() => {
    if (stage !== 'sending') return;
    pulse.setValue(0);
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pulse, { toValue: 1, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        Animated.timing(pulse, { toValue: 0, duration: 650, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
      ]),
    );
    loop.start();

    setSendingStep(0);
    const stepTimer = setInterval(() => {
      setSendingStep((s) => Math.min(s + 1, SENDING_STEPS.length - 1));
    }, 800);

    return () => {
      loop.stop();
      clearInterval(stepTimer);
    };
  }, [stage, pulse]);

  const openRequestModal = () => {
    setRequestLocation(detectedLocation);
    setPreferredTime('');
    setFormError(null);
    setStage('form');
    setShowRequestModal(true);
  };

  const closeRequestModal = () => setShowRequestModal(false);

  const submitRequest = () => {
    if (!requestLocation.trim()) {
      setFormError('Please enter a delivery location.');
      return;
    }
    if (!preferredTime.trim()) {
      setFormError('Please choose or enter a preferred service time.');
      return;
    }
    if (!coords) {
      setFormError('Still detecting your location — try again in a moment.');
      return;
    }
    setFormError(null);
    setStage('sending');

    setTimeout(() => {
      const vendor = vendors.length > 0 ? nearestVendor(coords.latitude, coords.longitude, vendors) : null;
      if (!vendor) {
        setStage('form');
        setFormError('No vendors found nearby. Please try again.');
        return;
      }
      const id = createOrder({
        vendor,
        items: lines.map((l) => ({ name: l.product.name, qty: l.qty, price: l.product.price })),
        totalCount,
        totalPrice: totalPrice + DELIVERY_FEE,
        location: requestLocation,
        serviceTime: preferredTime,
        userLatitude: coords.latitude,
        userLongitude: coords.longitude,
        etaMs: TRIP_ETA_MS,
      });
      setShowRequestModal(false);
      setStage('form');
      openTracking(id);
    }, 2400);
  };

  return (
    <SafeAreaView style={styles.root} edges={['top', 'left', 'right', 'bottom']}>
      <View style={styles.header}>
        <Text style={[headlineStyle(24), styles.title]}>Cart</Text>
        {totalCount > 0 && <Text style={styles.subtitle}>{totalCount} items</Text>}
      </View>

      {activeOrder && (
        <TouchableOpacity
          style={styles.trackBanner}
          activeOpacity={0.85}
          onPress={() => openTracking(activeOrder.id)}
        >
          <View style={styles.trackBannerIcon}>
            <Ionicons name="bicycle" size={18} color={colors.salt} />
          </View>
          <View style={styles.trackBannerInfo}>
            <Text style={styles.trackBannerTitle}>{activeOrder.vendor.name} is on the way</Text>
            <Text style={styles.trackBannerSubtitle}>Tap to track your order live</Text>
          </View>
          <Ionicons name="chevron-forward" size={18} color={colors.ink} />
        </TouchableOpacity>
      )}

      {lines.length === 0 ? (
        <View style={styles.emptyState}>
          <Ionicons name="cart-outline" size={64} color="rgba(21, 63, 50, 0.2)" />
          <Text style={styles.emptyTitle}>Your cart is empty</Text>
          <Text style={[styles.emptyText, displayScript]}>Add items from the dashboard to see them here.</Text>
          <TouchableOpacity
            style={styles.shopButton}
            activeOpacity={0.85}
            onPress={() => onNavigate('home')}
          >
            <Text style={styles.shopButtonText}>Start Shopping</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <>
          <ScrollView contentContainerStyle={styles.list} showsVerticalScrollIndicator={false}>
            {coords && (
              <View style={styles.vendorMapCard}>
                <View style={styles.vendorMapHeader}>
                  <Ionicons name="storefront-outline" size={16} color={colors.ink} />
                  <Text style={styles.vendorMapTitle}>Nearby vendors</Text>
                </View>
                <View style={styles.vendorMap}>
                  <BuyloMap
                    latitude={coords.latitude}
                    longitude={coords.longitude}
                    label={detectedLocation}
                    vendors={vendors}
                    zoom={14}
                  />
                </View>
              </View>
            )}

            {lines.map(({ product, qty }) => (
              <View key={product.id} style={styles.line}>
                <Image
                  source={{ uri: product.imageUri }}
                  style={styles.lineImage}
                  contentFit="cover"
                  transition={200}
                  cachePolicy="memory-disk"
                />
                <View style={styles.lineInfo}>
                  <Text style={styles.lineName} numberOfLines={2}>
                    {product.name}
                  </Text>
                  <Text style={styles.lineUnit}>{product.unit}</Text>
                  <Text style={styles.linePrice}>₹{product.price * qty}</Text>
                </View>
                <View style={styles.lineActions}>
                  <View style={styles.stepper}>
                    <TouchableOpacity
                      style={styles.stepperButton}
                      activeOpacity={0.8}
                      onPress={() => decrement(product.id)}
                    >
                      <Ionicons name="remove" size={14} color={colors.salt} />
                    </TouchableOpacity>
                    <Text style={styles.stepperQty}>{qty}</Text>
                    <TouchableOpacity
                      style={styles.stepperButton}
                      activeOpacity={0.8}
                      onPress={() => increment(product.id)}
                    >
                      <Ionicons name="add" size={14} color={colors.salt} />
                    </TouchableOpacity>
                  </View>
                  <TouchableOpacity onPress={() => removeItem(product.id)} activeOpacity={0.7}>
                    <Text style={styles.removeText}>Remove</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}

            <View style={styles.summary}>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Subtotal</Text>
                <Text style={styles.summaryValue}>₹{totalPrice}</Text>
              </View>
              <View style={styles.summaryRow}>
                <Text style={styles.summaryLabel}>Delivery fee</Text>
                <Text style={styles.summaryValue}>₹{DELIVERY_FEE}</Text>
              </View>
              <View style={[styles.summaryRow, styles.summaryTotalRow]}>
                <Text style={styles.summaryTotalLabel}>Total</Text>
                <Text style={styles.summaryTotalValue}>₹{totalPrice + DELIVERY_FEE}</Text>
              </View>
            </View>
          </ScrollView>

          <View style={styles.checkoutBar}>
            <View>
              <Text style={styles.checkoutTotalLabel}>Total</Text>
              <Text style={styles.checkoutTotalValue}>₹{totalPrice + DELIVERY_FEE}</Text>
            </View>
            <TouchableOpacity
              style={styles.checkoutButton}
              activeOpacity={0.85}
              onPress={openRequestModal}
            >
              <Text style={styles.checkoutButtonText}>Place Request</Text>
            </TouchableOpacity>
          </View>
        </>
      )}

      <Modal
        visible={showRequestModal}
        animationType="slide"
        presentationStyle="pageSheet"
        onRequestClose={closeRequestModal}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.modalRoot}
        >
          <View style={styles.modalHeader}>
            <Text style={[headlineStyle(22), styles.modalTitle]}>
              {stage === 'sending' ? 'Placing request' : 'Confirm your request'}
            </Text>
            <TouchableOpacity
              style={styles.modalCloseButton}
              onPress={closeRequestModal}
              hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            >
              <Ionicons name="close" size={22} color={colors.ink} />
            </TouchableOpacity>
          </View>

          {stage === 'sending' ? (
            <View style={styles.sendingContent}>
              <View style={styles.sendingTrack}>
                <Animated.View
                  style={[
                    styles.sendingRider,
                    {
                      transform: [
                        {
                          translateX: pulse.interpolate({ inputRange: [0, 1], outputRange: [-8, 8] }),
                        },
                      ],
                    },
                  ]}
                >
                  <Ionicons name="bicycle" size={30} color={colors.salt} />
                </Animated.View>
              </View>
              <Text style={styles.sendingTitle}>{SENDING_STEPS[sendingStep]}</Text>
              <View style={styles.sendingDots}>
                {SENDING_STEPS.map((_, i) => (
                  <View key={i} style={[styles.sendingDot, i <= sendingStep && styles.sendingDotActive]} />
                ))}
              </View>
            </View>
          ) : (
            <ScrollView contentContainerStyle={styles.modalContent} keyboardShouldPersistTaps="handled">
              <Text style={styles.modalSubtitle}>
                We'll send this request to {vendors.length || 'nearby'} vendors so they can respond with availability and price.
              </Text>

              {formError && (
                <View style={styles.errorBox}>
                  <Ionicons name="alert-circle" size={18} color={colors.coral} />
                  <Text style={styles.errorText}>{formError}</Text>
                </View>
              )}

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Delivery Location</Text>
                <View style={styles.locationInputRow}>
                  <TextInput
                    style={[styles.input, styles.locationInput]}
                    placeholder="Enter your address or area"
                    placeholderTextColor={colors.clay}
                    value={requestLocation}
                    onChangeText={setRequestLocation}
                  />
                  <TouchableOpacity
                    style={styles.locationButton}
                    onPress={() => setRequestLocation(detectedLocation)}
                  >
                    <Ionicons name="locate" size={18} color={colors.ink} />
                  </TouchableOpacity>
                </View>
              </View>

              <View style={styles.inputGroup}>
                <Text style={styles.inputLabel}>Preferred Service Time</Text>
                <View style={styles.timeGrid}>
                  {SERVICE_TIME_OPTIONS.map((option) => (
                    <TouchableOpacity
                      key={option.label}
                      style={[
                        styles.timeCard,
                        preferredTime === option.label && styles.timeCardActive,
                      ]}
                      onPress={() => setPreferredTime(option.label)}
                    >
                      <Ionicons
                        name={option.icon}
                        size={18}
                        color={preferredTime === option.label ? colors.cream : colors.ink}
                      />
                      <Text
                        style={[
                          styles.timeCardText,
                          preferredTime === option.label && styles.timeCardTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
                <TextInput
                  style={styles.input}
                  placeholder="Or type a custom time"
                  placeholderTextColor={colors.clay}
                  value={preferredTime}
                  onChangeText={setPreferredTime}
                />
              </View>

              <TouchableOpacity style={styles.submitButton} activeOpacity={0.85} onPress={submitRequest}>
                <Text style={styles.submitButtonText}>Submit Request</Text>
              </TouchableOpacity>
            </ScrollView>
          )}
        </KeyboardAvoidingView>
      </Modal>

      <BottomTabBar active="cart" onTabPress={onNavigate} />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 10,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: 16,
  },
  title: {
    color: colors.ink,
  },
  subtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.clay,
    marginBottom: 4,
  },
  trackBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: colors.ink,
    borderRadius: radii.md,
    padding: 14,
    marginHorizontal: 20,
    marginBottom: 16,
    ...shadows.soft,
  },
  trackBannerIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  trackBannerInfo: {
    flex: 1,
    gap: 2,
  },
  trackBannerTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.salt,
  },
  trackBannerSubtitle: {
    fontFamily: fonts.body,
    fontSize: 11,
    color: 'rgba(255,250,240,0.7)',
  },
  emptyState: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 40,
    gap: 8,
  },
  emptyTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    lineHeight: 22,
    color: colors.ink,
    marginTop: 8,
  },
  emptyText: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.clay,
    textAlign: 'center',
    marginBottom: 12,
  },
  shopButton: {
    backgroundColor: colors.ink,
    paddingHorizontal: 24,
    paddingVertical: 12,
    borderRadius: radii.pill,
  },
  shopButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.cream,
  },
  list: {
    paddingHorizontal: 20,
    paddingBottom: 24,
  },
  line: {
    flexDirection: 'row',
    gap: 12,
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 10,
    marginBottom: 12,
    ...shadows.soft,
  },
  lineImage: {
    width: 64,
    height: 64,
    borderRadius: radii.sm,
    backgroundColor: colors.cream,
  },
  lineInfo: {
    flex: 1,
    gap: 2,
  },
  lineName: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  lineUnit: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.clay,
  },
  linePrice: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
    marginTop: 4,
  },
  lineActions: {
    alignItems: 'flex-end',
    justifyContent: 'space-between',
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
    lineHeight: 16,
    color: colors.salt,
    minWidth: 14,
    textAlign: 'center',
  },
  removeText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 11,
    lineHeight: 15,
    color: colors.clay,
    textDecorationLine: 'underline',
  },
  summary: {
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 16,
    gap: 10,
    marginTop: 8,
  },
  summaryRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  summaryLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 18,
    color: colors.clay,
  },
  summaryValue: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    lineHeight: 18,
    color: colors.ink,
  },
  summaryTotalRow: {
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 63, 50, 0.1)',
    paddingTop: 10,
  },
  summaryTotalLabel: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  summaryTotalValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 14,
    lineHeight: 19,
    color: colors.ink,
  },
  checkoutBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 14,
    backgroundColor: colors.salt,
    borderTopWidth: 1,
    borderTopColor: 'rgba(21, 63, 50, 0.08)',
  },
  checkoutTotalLabel: {
    fontFamily: fonts.body,
    fontSize: 11,
    lineHeight: 15,
    color: colors.clay,
  },
  checkoutTotalValue: {
    fontFamily: fonts.bodyBold,
    fontSize: 17,
    lineHeight: 22,
    color: colors.ink,
  },
  checkoutButton: {
    backgroundColor: colors.ink,
    paddingHorizontal: 22,
    paddingVertical: 13,
    borderRadius: radii.pill,
  },
  checkoutButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    lineHeight: 18,
    color: colors.cream,
  },
  modalRoot: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(21, 63, 50, 0.08)',
  },
  modalTitle: {
    color: colors.ink,
  },
  modalCloseButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.salt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalContent: {
    padding: 24,
    gap: 20,
  },
  modalSubtitle: {
    fontFamily: fonts.body,
    fontSize: 13,
    lineHeight: 19,
    color: colors.clay,
  },
  inputGroup: {
    gap: 8,
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
  locationInputRow: {
    flexDirection: 'row',
    gap: 8,
  },
  locationInput: {
    flex: 1,
  },
  locationButton: {
    width: 46,
    height: 46,
    borderRadius: 12,
    backgroundColor: colors.salt,
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.15)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  timeGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginBottom: 4,
  },
  timeCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    width: '48%',
    borderWidth: 1,
    borderColor: 'rgba(21, 63, 50, 0.15)',
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    paddingHorizontal: 12,
    paddingVertical: 12,
  },
  timeCardActive: {
    backgroundColor: colors.ink,
    borderColor: colors.ink,
  },
  timeCardText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 12,
    color: colors.ink,
  },
  timeCardTextActive: {
    color: colors.cream,
  },
  submitButton: {
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 15,
    alignItems: 'center',
    marginTop: 8,
  },
  submitButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.cream,
  },
  errorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#FDE8E8',
    padding: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F8B4B4',
  },
  errorText: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.coral,
  },
  vendorMapCard: {
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 10,
    marginBottom: 16,
    ...shadows.soft,
  },
  vendorMapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 4,
    paddingBottom: 8,
  },
  vendorMapTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 13,
    color: colors.ink,
  },
  vendorMap: {
    height: 180,
    borderRadius: radii.sm,
    overflow: 'hidden',
  },
  sendingContent: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 24,
    padding: 32,
  },
  sendingTrack: {
    width: 160,
    height: 4,
    borderRadius: 2,
    backgroundColor: 'rgba(21, 63, 50, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendingRider: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
    ...shadows.soft,
  },
  sendingTitle: {
    fontFamily: fonts.bodySemiBold,
    fontSize: 15,
    color: colors.ink,
    textAlign: 'center',
  },
  sendingDots: {
    flexDirection: 'row',
    gap: 8,
  },
  sendingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(21, 63, 50, 0.15)',
  },
  sendingDotActive: {
    backgroundColor: colors.coral,
  },
});
