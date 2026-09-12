export type Vendor = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

const VENDOR_NAMES = [
  'Murugan Fresh Mart',
  'Lakshmi Vegetables',
  'Selvi Provision Store',
  'Kumar Seafood Corner',
  'Anand Flower Shop',
  'Raja Traders',
];

export function generateNearbyVendors(latitude: number, longitude: number, count = 4): Vendor[] {
  return Array.from({ length: count }).map((_, i) => {
    const angle = ((Math.PI * 2) / count) * i + Math.random() * 0.6;
    const distanceKm = 0.3 + Math.random() * 1.4;
    const dLat = (distanceKm / 111) * Math.sin(angle);
    const dLng = (distanceKm / (111 * Math.cos((latitude * Math.PI) / 180))) * Math.cos(angle);
    return {
      id: `vendor-${i}`,
      name: VENDOR_NAMES[i % VENDOR_NAMES.length],
      latitude: latitude + dLat,
      longitude: longitude + dLng,
    };
  });
}

export function distanceKm(a: { latitude: number; longitude: number }, b: { latitude: number; longitude: number }) {
  const R = 6371;
  const dLat = ((b.latitude - a.latitude) * Math.PI) / 180;
  const dLng = ((b.longitude - a.longitude) * Math.PI) / 180;
  const lat1 = (a.latitude * Math.PI) / 180;
  const lat2 = (b.latitude * Math.PI) / 180;
  const h =
    Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(lat1) * Math.cos(lat2);
  return 2 * R * Math.asin(Math.sqrt(h));
}

export function nearestVendor(latitude: number, longitude: number, vendors: Vendor[]): Vendor {
  return vendors.reduce((closest, v) =>
    distanceKm({ latitude, longitude }, v) < distanceKm({ latitude, longitude }, closest) ? v : closest,
  vendors[0]);
}
