import { useEffect, useState } from 'react';
import { Modal, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrders } from '../../context/OrdersContext';
import { useCart } from '../../context/CartContext';
import BuyloMap from '../map/BuyloMap';
import { colors, fonts, headlineStyle, radii, shadows } from '../../theme/theme';

type Props = {
  onGoHome: () => void;
};

function formatEta(msRemaining: number) {
  const totalSeconds = Math.max(0, Math.ceil(msRemaining / 1000));
  const mins = Math.floor(totalSeconds / 60);
  const secs = totalSeconds % 60;
  return `${mins}:${secs.toString().padStart(2, '0')}`;
}

export default function OrderTrackingModal({ onGoHome }: Props) {
  const { activeTrackingId, getOrder, markCompleted, closeTracking } = useOrders();
  const { clear: clearCart } = useCart();
  const order = getOrder(activeTrackingId);
  const [now, setNow] = useState(Date.now());

  useEffect(() => {
    if (!order || order.status === 'completed') return;
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, [order?.id, order?.status]);

  if (!order) return null;

  const elapsed = now - order.placedAt;
  const remaining = order.etaMs - elapsed;
  const arrived = order.status === 'completed' || remaining <= 0;

  const handleArrived = () => {
    if (order.status !== 'completed') markCompleted(order.id);
  };

  const handleDone = () => {
    closeTracking();
    clearCart();
    onGoHome();
  };

  return (
    <Modal visible animationType="slide" presentationStyle="pageSheet" onRequestClose={closeTracking}>
      <View style={styles.root}>
        <View style={styles.header}>
          <Text style={[headlineStyle(20), styles.title]} numberOfLines={1}>
            {arrived ? 'Vendor Arrived' : 'Vendor On The Way'}
          </Text>
          <TouchableOpacity style={styles.close} onPress={closeTracking} hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}>
            <Ionicons name="close" size={22} color={colors.ink} />
          </TouchableOpacity>
        </View>

        <View style={styles.mapWrap}>
          <BuyloMap
            latitude={order.userLatitude}
            longitude={order.userLongitude}
            label={order.location}
            arrivingVendor={order.vendor}
            tripStartedAt={order.placedAt}
            tripDurationMs={order.etaMs}
            zoom={14}
            onArrived={handleArrived}
          />

          {!arrived && (
            <View style={styles.etaPill}>
              <Ionicons name="time-outline" size={14} color={colors.ink} />
              <Text style={styles.etaText}>Arriving in {formatEta(remaining)}</Text>
            </View>
          )}
        </View>

        <View style={styles.sheet}>
          <View style={styles.statusRow}>
            <View style={[styles.statusIcon, arrived && styles.statusIconDone]}>
              <Ionicons name={arrived ? 'checkmark-circle' : 'bicycle'} size={22} color={colors.salt} />
            </View>
            <View style={styles.statusInfo}>
              <Text style={styles.statusTitle} numberOfLines={1}>
                {order.vendor.name}
              </Text>
              <Text style={styles.statusSubtitle}>
                {arrived
                  ? `Delivered your order of ${order.totalCount} item${order.totalCount > 1 ? 's' : ''}.`
                  : `Bringing your order of ${order.totalCount} item${order.totalCount > 1 ? 's' : ''}.`}
              </Text>
            </View>
          </View>

          <View style={styles.detailsCard}>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Location</Text>
              <Text style={styles.detailsValue} numberOfLines={1}>{order.location}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Service time</Text>
              <Text style={styles.detailsValue}>{order.serviceTime}</Text>
            </View>
            <View style={styles.detailsRow}>
              <Text style={styles.detailsLabel}>Total</Text>
              <Text style={styles.detailsValue}>₹{order.totalPrice}</Text>
            </View>
          </View>

          {arrived ? (
            <TouchableOpacity style={styles.doneButton} activeOpacity={0.85} onPress={handleDone}>
              <Ionicons name="home-outline" size={18} color={colors.cream} />
              <Text style={styles.doneButtonText}>Done, back to Home</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity style={styles.minimizeButton} activeOpacity={0.85} onPress={closeTracking}>
              <Text style={styles.minimizeButtonText}>Minimize — keep tracking in Cart</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: colors.cream,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingTop: 16,
    paddingBottom: 12,
  },
  title: {
    color: colors.ink,
  },
  close: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: colors.salt,
    alignItems: 'center',
    justifyContent: 'center',
  },
  mapWrap: {
    flex: 1,
    minHeight: 260,
  },
  etaPill: {
    position: 'absolute',
    top: 12,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: colors.salt,
    borderRadius: radii.pill,
    paddingHorizontal: 12,
    paddingVertical: 8,
    ...shadows.soft,
  },
  etaText: {
    fontFamily: fonts.bodyBold,
    fontSize: 13,
    color: colors.ink,
  },
  sheet: {
    backgroundColor: colors.cream,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    marginTop: -20,
    padding: 20,
    gap: 16,
    ...shadows.soft,
  },
  statusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  statusIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.coral,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIconDone: {
    backgroundColor: colors.ink,
  },
  statusInfo: {
    flex: 1,
    gap: 2,
  },
  statusTitle: {
    fontFamily: fonts.bodyBold,
    fontSize: 16,
    color: colors.ink,
  },
  statusSubtitle: {
    fontFamily: fonts.body,
    fontSize: 12,
    color: colors.clay,
  },
  detailsCard: {
    backgroundColor: colors.salt,
    borderRadius: radii.md,
    padding: 16,
    gap: 10,
  },
  detailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 12,
  },
  detailsLabel: {
    fontFamily: fonts.body,
    fontSize: 13,
    color: colors.clay,
  },
  detailsValue: {
    flex: 1,
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.ink,
    textAlign: 'right',
  },
  doneButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: colors.ink,
    borderRadius: radii.pill,
    paddingVertical: 16,
    ...shadows.soft,
  },
  doneButtonText: {
    fontFamily: fonts.bodyBold,
    fontSize: 15,
    color: colors.cream,
  },
  minimizeButton: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  minimizeButtonText: {
    fontFamily: fonts.bodyMedium,
    fontSize: 13,
    color: colors.clay,
    textDecorationLine: 'underline',
  },
});
