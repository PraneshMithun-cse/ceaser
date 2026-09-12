import { createContext, useContext, useEffect, useRef, useState, type ReactNode } from 'react';
import * as Location from 'expo-location';

type Coords = {
  latitude: number;
  longitude: number;
};

type LocationContextValue = {
  label: string;
  coords: Coords | null;
  detecting: boolean;
  error: string | null;
  detectLocation: () => Promise<void>;
};

const DEFAULT_LABEL = 'Detecting your location...';

const LocationContext = createContext<LocationContextValue | null>(null);

export function LocationProvider({ children }: { children: ReactNode }) {
  const [label, setLabel] = useState(DEFAULT_LABEL);
  const [coords, setCoords] = useState<Coords | null>(null);
  const [detecting, setDetecting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const hasDetectedOnce = useRef(false);

  const detectLocation = async () => {
    setDetecting(true);
    setError(null);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        setError('Location permission denied. Set your location manually.');
        setLabel('Set your location');
        return;
      }

      const position = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.Balanced,
      });

      setCoords({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      const [place] = await Location.reverseGeocodeAsync({
        latitude: position.coords.latitude,
        longitude: position.coords.longitude,
      });

      if (place) {
        const area = place.district || place.subregion || place.city || place.name;
        const city = place.city || place.region;
        const nextLabel = [area, city].filter(Boolean).join(', ');
        setLabel(nextLabel || 'Current location');
      } else {
        setLabel('Current location');
        setError('Could not resolve address for this location.');
      }
    } catch (err: any) {
      setLabel('Set your location');
      setError(err?.message || 'Failed to detect location.');
    } finally {
      setDetecting(false);
    }
  };

  useEffect(() => {
    if (hasDetectedOnce.current) return;
    hasDetectedOnce.current = true;
    detectLocation();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <LocationContext.Provider value={{ label, coords, detecting, error, detectLocation }}>
      {children}
    </LocationContext.Provider>
  );
}

export function useLocation() {
  const ctx = useContext(LocationContext);
  if (!ctx) throw new Error('useLocation must be used within a LocationProvider');
  return ctx;
}
