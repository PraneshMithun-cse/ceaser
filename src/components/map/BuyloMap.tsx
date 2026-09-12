import { Platform, StyleSheet, Text, View } from 'react-native';
import { WebView } from 'react-native-webview';
import { VENDOR_ICON_DATA_URL } from '../../assets/vendorIcon';

export type MapVendor = {
  id: string;
  name: string;
  latitude: number;
  longitude: number;
};

type Props = {
  latitude: number;
  longitude: number;
  label?: string;
  zoom?: number;
  vendors?: MapVendor[];
  arrivingVendor?: MapVendor | null;
  /** ms timestamp (Date.now()) the trip started — used to resume progress accurately across remounts */
  tripStartedAt?: number;
  /** total trip duration in ms */
  tripDurationMs?: number;
  onArrived?: () => void;
};

function buildMapHtml({
  latitude,
  longitude,
  label = 'Your location',
  zoom = 15,
  vendors = [],
  arrivingVendor,
  tripStartedAt,
  tripDurationMs,
}: Props) {
  const vendorMarkersJs = vendors
    .map(
      (v) => `
        L.marker([${v.latitude}, ${v.longitude}], {
          icon: vendorCartIcon,
        }).addTo(map).bindPopup(${JSON.stringify(v.name)});
      `,
    )
    .join('\n');

  const arrivingJs = arrivingVendor
    ? `
      (function () {
        var start = [${arrivingVendor.latitude}, ${arrivingVendor.longitude}];
        var end = [${latitude}, ${longitude}];
        var startedAt = ${tripStartedAt ?? 'Date.now()'};
        var durationMs = ${tripDurationMs ?? 720000};
        var rider = L.marker(start, { icon: riderCartIcon }).addTo(map)
          .bindPopup(${JSON.stringify(`${arrivingVendor.name} is on the way`)});
        map.fitBounds([start, end], { padding: [50, 50] });

        var routeCoords = null; // [[lat,lng], ...] once OSRM resolves
        var cumDist = null;     // cumulative distance at each route point
        var totalDist = 0;
        var routeLine = null;
        var arrivedFired = false;
        var straightLineFallback = [start, end];

        function haversine(a, b) {
          var R = 6371000;
          var dLat = (b[0] - a[0]) * Math.PI / 180;
          var dLng = (b[1] - a[1]) * Math.PI / 180;
          var la1 = a[0] * Math.PI / 180, la2 = b[0] * Math.PI / 180;
          var h = Math.sin(dLat / 2) ** 2 + Math.sin(dLng / 2) ** 2 * Math.cos(la1) * Math.cos(la2);
          return 2 * R * Math.asin(Math.sqrt(h));
        }

        function buildCumDist(coords) {
          var cum = [0];
          for (var i = 1; i < coords.length; i++) {
            cum.push(cum[i - 1] + haversine(coords[i - 1], coords[i]));
          }
          return cum;
        }

        function positionAt(t) {
          // t: 0..1 progress along the route
          var coords = routeCoords || straightLineFallback;
          var cum = cumDist || [0, haversine(start, end)];
          var target = t * cum[cum.length - 1];
          for (var i = 1; i < cum.length; i++) {
            if (cum[i] >= target) {
              var segFrac = (target - cum[i - 1]) / Math.max(1, cum[i] - cum[i - 1]);
              var a = coords[i - 1], b = coords[i];
              return [a[0] + (b[0] - a[0]) * segFrac, a[1] + (b[1] - a[1]) * segFrac];
            }
          }
          return coords[coords.length - 1];
        }

        function tick() {
          var elapsed = Date.now() - startedAt;
          var t = Math.max(0, Math.min(1, elapsed / durationMs));
          rider.setLatLng(positionAt(t));
          if (t >= 1) {
            if (!arrivedFired) {
              arrivedFired = true;
              rider.setPopupContent(${JSON.stringify(`${arrivingVendor.name} has arrived!`)});
              rider.openPopup();
              if (window.ReactNativeWebView) {
                window.ReactNativeWebView.postMessage('arrived');
              }
            }
            return;
          }
          requestAnimationFrame(tick);
        }

        fetch('https://router.project-osrm.org/route/v1/driving/' + start[1] + ',' + start[0] + ';' + end[1] + ',' + end[0] + '?overview=full&geometries=geojson')
          .then(function (r) { return r.json(); })
          .then(function (data) {
            var coords = data.routes && data.routes[0] && data.routes[0].geometry.coordinates;
            if (coords && coords.length > 1) {
              routeCoords = coords.map(function (c) { return [c[1], c[0]]; });
              cumDist = buildCumDist(routeCoords);
              routeLine = L.polyline(routeCoords, { color: '#e7654f', weight: 4, opacity: 0.7, dashArray: '1 8' }).addTo(map);
              map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
            }
          })
          .catch(function () {})
          .finally(function () {
            requestAnimationFrame(tick);
          });
      })();
    `
    : '';

  return `<!DOCTYPE html>
<html>
<head>
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <style>
    html, body, #map { height: 100%; margin: 0; padding: 0; }
  </style>
</head>
<body>
  <div id="map"></div>
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <script>
    const map = L.map('map').setView([${latitude}, ${longitude}], ${zoom});
    const vendorCartIcon = L.icon({
      iconUrl: ${JSON.stringify(VENDOR_ICON_DATA_URL)},
      iconSize: [48, 32],
      iconAnchor: [24, 16],
      popupAnchor: [0, -16],
    });
    const riderCartIcon = L.icon({
      iconUrl: ${JSON.stringify(VENDOR_ICON_DATA_URL)},
      iconSize: [66, 44],
      iconAnchor: [33, 22],
      popupAnchor: [0, -22],
    });
    L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
      attribution: '&copy; OpenStreetMap contributors',
    }).addTo(map);
    L.marker([${latitude}, ${longitude}]).addTo(map)
      .bindPopup(${JSON.stringify(`📍 ${label}`)});
    ${vendorMarkersJs}
    ${arrivingJs}
  </script>
</body>
</html>`;
}

export default function BuyloMap(props: Props) {
  if (Platform.OS === 'web') {
    return (
      <View style={[styles.root, styles.webFallback]}>
        <Text style={styles.webFallbackText}>Map view is available on the Buylo mobile app.</Text>
      </View>
    );
  }

  return (
    <View style={styles.root}>
      <WebView
        originWhitelist={['*']}
        source={{ html: buildMapHtml(props) }}
        style={styles.webview}
        javaScriptEnabled
        domStorageEnabled
        onMessage={(e) => {
          if (e.nativeEvent.data === 'arrived') props.onArrived?.();
        }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  webview: {
    flex: 1,
    backgroundColor: 'transparent',
  },
  webFallback: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 24,
  },
  webFallbackText: {
    textAlign: 'center',
    color: '#6b6b6b',
  },
});
