import React, { useEffect, useRef, useState } from 'react';
import { View, Text, TouchableOpacity, Dimensions, StyleSheet, ActivityIndicator } from 'react-native';
import { WebView } from 'react-native-webview';
import * as Location from 'expo-location';
import { Ionicons } from '@expo/vector-icons';
import { Typography } from '../../constants/typography';
import tw from 'twrnc';

interface FreeOpenStreetMapProps {
  isOnline: boolean;
  activeOrder: any;
  currentHub: string;
  onSimulateOrder: () => void;
  onSelectHub?: (hubName: string) => void;
}

export const FreeOpenStreetMap: React.FC<FreeOpenStreetMapProps> = ({
  isOnline,
  activeOrder,
  currentHub,
  onSimulateOrder,
  onSelectHub,
}) => {
  const webViewRef = useRef<WebView>(null);
  const [mapLoaded, setMapLoaded] = useState(false);
  const [currentCoords, setCurrentCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9352,
    lng: 77.6245,
  });
  const [isLocating, setIsLocating] = useState(false);
  const [showSurgeZones, setShowSurgeZones] = useState(true);

  // Fetch real device current location on mount
  useEffect(() => {
    (async () => {
      try {
        const { status } = await Location.requestForegroundPermissionsAsync();
        if (status === 'granted') {
          const loc = await Location.getCurrentPositionAsync({
            accuracy: Location.Accuracy.Balanced,
          });
          const newCoords = {
            lat: loc.coords.latitude,
            lng: loc.coords.longitude,
          };
          setCurrentCoords(newCoords);
          webViewRef.current?.injectJavaScript(`
            if (window.updateRiderLocation) {
              window.updateRiderLocation(${newCoords.lat}, ${newCoords.lng});
            }
            true;
          `);
        }
      } catch (err) {
        console.log('Location fetch fallback:', err);
      }
    })();
  }, []);

  const handleRecenter = async () => {
    setIsLocating(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.High,
        });
        const newCoords = {
          lat: loc.coords.latitude,
          lng: loc.coords.longitude,
        };
        setCurrentCoords(newCoords);
        webViewRef.current?.injectJavaScript(`
          if (window.updateRiderLocation) {
            window.updateRiderLocation(${newCoords.lat}, ${newCoords.lng});
            window.map.flyTo([${newCoords.lat}, ${newCoords.lng}], 15, { duration: 1.2 });
          }
          true;
        `);
      } else {
        webViewRef.current?.injectJavaScript(`if (window.recenter) window.recenter(); true;`);
      }
    } catch (e) {
      webViewRef.current?.injectJavaScript(`if (window.recenter) window.recenter(); true;`);
    } finally {
      setIsLocating(false);
    }
  };

  const stores = [
    { id: '1', name: 'Koramangala Hub #04', lat: currentCoords.lat + 0.004, lng: currentCoords.lng + 0.003, surge: '+₹35', radius: 450 },
    { id: '2', name: 'HSR Layout Sector 2', lat: currentCoords.lat - 0.008, lng: currentCoords.lng + 0.006, surge: '+₹25', radius: 350 },
    { id: '3', name: 'Indiranagar 100ft Hub', lat: currentCoords.lat + 0.012, lng: currentCoords.lng - 0.005, surge: '+₹30', radius: 400 },
  ];

  const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no" />
  <title>GroceryMart Live Map</title>
  <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
  <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
  <style>
    html, body, #map {
      height: 100%;
      width: 100%;
      margin: 0;
      padding: 0;
      background: #F1F5F9;
    }
    .custom-delivery-rider {
      background: transparent;
      border: none;
    }
    .rider-container {
      position: relative;
      width: 48px;
      height: 48px;
      display: flex;
      align-items: center;
      justify-content: center;
    }
    .rider-pulse {
      position: absolute;
      width: 44px;
      height: 44px;
      border-radius: 50%;
      background: rgba(16, 185, 129, 0.35);
      animation: pulse-ring 1.8s infinite ease-out;
    }
    @keyframes pulse-ring {
      0% { transform: scale(0.7); opacity: 1; }
      100% { transform: scale(2.0); opacity: 0; }
    }
    .store-badge {
      background: #0F172A;
      color: #FFFFFF;
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      font-size: 11px;
      font-weight: 800;
      padding: 3px 8px;
      border-radius: 12px;
      border: 1.5px solid #10B981;
      box-shadow: 0 2px 8px rgba(0,0,0,0.3);
      white-space: nowrap;
    }
    .drop-pin {
      background: #DC2626;
      color: #FFFFFF;
      width: 28px;
      height: 28px;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      border: 2px solid #FFFFFF;
      box-shadow: 0 3px 8px rgba(0,0,0,0.4);
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div id="map"></div>
  <script>
    var currentLat = ${currentCoords.lat};
    var currentLng = ${currentCoords.lng};

    var map = L.map('map', { 
      zoomControl: false,
      attributionControl: true
    }).setView([currentLat, currentLng], 15);

    window.map = map;

    // Free OpenStreetMap Tile Layer
    L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      maxZoom: 19,
      attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    }).addTo(map);

    // Live Hotspot Surge Heatmap Circles
    ${stores
      .map(
        (s) => `
      L.circle([${s.lat}, ${s.lng}], {
        color: '#F59E0B',
        fillColor: '#FEF3C7',
        fillOpacity: 0.35,
        radius: ${s.radius},
        weight: 1.5,
        dashArray: '4, 4'
      }).addTo(map);
    `
      )
      .join('\n')}

    // 3D Delivery Motorcycle Icon (Blinkit / Swiggy / Zepto Style)
    var deliveryBoyBikeSvg = \`
      <div class="rider-container">
        <div class="rider-pulse"></div>
        <div style="width: 44px; height: 44px; border-radius: 50%; background: #047857; border: 2.5px solid #FFFFFF; display: flex; align-items: center; justify-content: center; box-shadow: 0 4px 10px rgba(0,0,0,0.3); overflow: hidden;">
          <img src="https://img.icons8.com/color/96/delivery-bike.png" style="width: 32px; height: 32px; object-fit: contain;" alt="Rider" onerror="this.src='https://cdn-icons-png.flaticon.com/512/2830/2830305.png'" />
        </div>
      </div>
    \`;

    var riderIcon = L.divIcon({
      className: 'custom-delivery-rider',
      html: deliveryBoyBikeSvg,
      iconSize: [48, 48],
      iconAnchor: [24, 24]
    });
    var riderMarker = L.marker([currentLat, currentLng], { icon: riderIcon }).addTo(map);
    window.riderMarker = riderMarker;

    // Dynamic Live GPS Updater Function
    window.updateRiderLocation = function(lat, lng) {
      currentLat = lat;
      currentLng = lng;
      riderMarker.setLatLng([lat, lng]);
    };

    // Dark Store Location Markers
    ${stores
      .map(
        (s) => `
      var storeIcon_${s.id} = L.divIcon({
        className: 'custom-store',
        html: '<div class="store-badge">🏬 ${s.surge}</div>',
        iconSize: [64, 26],
        iconAnchor: [32, 13]
      });
      L.marker([${s.lat}, ${s.lng}], { icon: storeIcon_${s.id} })
        .addTo(map)
        .on('click', function() {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_HUB', name: '${s.name}' }));
        });
    `
      )
      .join('\n')}

    ${
      activeOrder
        ? `
      var dropLat = currentLat + 0.012;
      var dropLng = currentLng + 0.010;
      var dropIcon = L.divIcon({
        className: 'custom-drop',
        html: '<div class="drop-pin">🏠</div>',
        iconSize: [28, 28],
        iconAnchor: [14, 14]
      });
      L.marker([dropLat, dropLng], { icon: dropIcon }).addTo(map);

      var routeLine = L.polyline([
        [currentLat, currentLng],
        [currentLat + 0.005, currentLng + 0.004],
        [dropLat, dropLng]
      ], { 
        color: '#047857', 
        weight: 5, 
        dashArray: '6, 6',
        opacity: 0.9 
      }).addTo(map);

      map.fitBounds(routeLine.getBounds(), { padding: [50, 50] });
    `
        : ''
    }

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(function(pos) {
        window.updateRiderLocation(pos.coords.latitude, pos.coords.longitude);
        map.setView([pos.coords.latitude, pos.coords.longitude], 15);
      }, function() {}, { enableHighAccuracy: true, timeout: 5000 });
    }

    window.recenter = function() {
      map.flyTo([currentLat, currentLng], 15, { duration: 1.0 });
    };
  </script>
</body>
</html>
`;

  return (
    <View style={styles.container}>
      <WebView
        ref={webViewRef}
        originWhitelist={['*']}
        source={{ html: htmlContent }}
        style={styles.map}
        javaScriptEnabled={true}
        domStorageEnabled={true}
        onLoadEnd={() => setMapLoaded(true)}
        onMessage={(event) => {
          try {
            const data = JSON.parse(event.nativeEvent.data);
            if (data.type === 'SELECT_HUB' && onSelectHub) {
              onSelectHub(data.name);
            }
          } catch (e) {}
        }}
      />

      {!mapLoaded && (
        <View style={styles.loadingOverlay}>
          <ActivityIndicator size="small" color="#047857" />
          <Text style={[Typography.caption, { color: '#64748B', fontSize: 10, marginTop: 4 }]}>
            Loading GPS Route Map...
          </Text>
        </View>
      )}

      {/* Floating Surge Hotspot Pill (Top Left) */}
      <View style={tw`absolute top-3 left-3 px-2.5 py-1 rounded-full bg-slate-900/90 border border-amber-400/80 shadow-md flex-row items-center z-20`}>
        <Ionicons name="flame" size={12} color="#F59E0B" style={tw`mr-1`} />
        <Text style={[Typography.badge, { color: '#FCD34D', fontSize: 9.5 }]}>
          High Surge Active (+₹35)
        </Text>
      </View>

      {/* Floating Recenter GPS Button */}
      <TouchableOpacity
        activeOpacity={0.85}
        onPress={handleRecenter}
        style={tw`absolute top-3 right-3 w-9 h-9 rounded-full bg-white border border-slate-200 shadow-md items-center justify-center z-20`}
      >
        {isLocating ? (
          <ActivityIndicator size="small" color="#047857" />
        ) : (
          <Ionicons name="locate" size={18} color="#047857" />
        )}
      </TouchableOpacity>

      {/* Floating Quick Test Order Button (Bottom Left) */}
      <TouchableOpacity
        activeOpacity={0.88}
        onPress={onSimulateOrder}
        style={tw`absolute bottom-3 left-3 px-3 py-1.5 rounded-full bg-emerald-600 border border-emerald-500 shadow-md flex-row items-center z-20`}
      >
        <Ionicons name="flash" size={12} color="#FFFFFF" style={tw`mr-1`} />
        <Text style={[Typography.buttonText, { color: '#FFFFFF', fontSize: 10.5 }]}>
          + Test Order
        </Text>
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
    position: 'relative',
  },
  map: {
    flex: 1,
    width: '100%',
    height: '100%',
    backgroundColor: '#F1F5F9',
  },
  loadingOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#F8FAFC',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
});
