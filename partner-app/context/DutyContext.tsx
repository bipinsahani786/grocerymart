import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Location from 'expo-location';

interface DutyContextType {
  isOnline: boolean;
  toggleDuty: () => void;
  setDuty: (online: boolean) => void;
  shiftSeconds: number;
  formattedShiftTime: string;
  batteryLevel: number;
  currentHub: string;
  setCurrentHub: (hub: string) => void;
  floatingCash: number;
  depositCash: (amount: number) => void;
  liveAddress: string;
  liveCoords: { lat: number; lng: number };
  isFetchingLocation: boolean;
  refreshLocation: () => Promise<void>;
  updateLocationFromCoords: (lat: number, lng: number) => Promise<void>;
}


const DutyContext = createContext<DutyContextType | undefined>(undefined);

const DUTY_STORAGE_KEY = '@grocerymart_partner_duty';
const DEFAULT_ADDRESS = '80 Feet Rd, 4th Block, Koramangala, Bengaluru';

export const DutyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [shiftSeconds, setShiftSeconds] = useState<number>(19800); // ~5.5 hrs
  const [batteryLevel] = useState<number>(86);
  const [currentHub, setCurrentHub] = useState<string>('Koramangala Express Hub #04');
  const [floatingCash, setFloatingCash] = useState<number>(450);

  // Live Location Address State
  const [liveAddress, setLiveAddress] = useState<string>(DEFAULT_ADDRESS);
  const [liveCoords, setLiveCoords] = useState<{ lat: number; lng: number }>({
    lat: 12.9352,
    lng: 77.6245,
  });
  const [isFetchingLocation, setIsFetchingLocation] = useState<boolean>(false);

  useEffect(() => {
    loadDutyState();
    fetchLiveLocation();
  }, []);

  // Timer ticker when online
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      setShiftSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnline]);

  const isPlusCode = (str?: string | null): boolean => {
    if (!str) return false;
    return /[A-Z0-9]{2,8}\+[A-Z0-9]{2,8}/i.test(str.trim());
  };

  const fetchLiveLocation = async () => {
    setIsFetchingLocation(true);
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({
          accuracy: Location.Accuracy.Balanced,
        });
        const coords = { lat: loc.coords.latitude, lng: loc.coords.longitude };
        setLiveCoords(coords);

        // 1. Try reverse geocoding via OpenStreetMap Nominatim for highly detailed human-readable address
        try {
          const controller = new AbortController();
          const timeoutId = setTimeout(() => controller.abort(), 2500);

          const nomRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${coords.lat}&lon=${coords.lng}&addressdetails=1`,
            {
              signal: controller.signal,
              headers: {
                'User-Agent': 'GroceryMart-Fleet/2.4',
                'Accept-Language': 'en',
              },
            }
          );
          clearTimeout(timeoutId);

          if (nomRes.ok) {
            const data = await nomRes.json();
            if (data?.address) {
              const a = data.address;
              const building = a.building || a.house_number || a.amenity || a.shop || '';
              const road = a.road || a.pedestrian || a.street || a.footway || '';
              const suburb = a.suburb || a.neighbourhood || a.residential || a.subdistrict || a.city_district || '';
              const city = a.city || a.town || a.village || a.county || a.state_district || 'Bengaluru';
              const state = a.state || '';
              const postcode = a.postcode ? ` - ${a.postcode}` : '';

              const streetPart = [building, road].filter(Boolean).join(' ');
              const parts = Array.from(new Set([streetPart, suburb, city, state].filter(Boolean))) as string[];
              if (parts.length > 0) {
                setLiveAddress(`${parts.join(', ')}${postcode}`);
                return;
              }
            }
          }
        } catch {
          // fallback to expo-location
        }

        // 2. Fallback to Expo Reverse Geocode with Plus Code filtering
        const [geo] = await Location.reverseGeocodeAsync({
          latitude: coords.lat,
          longitude: coords.lng,
        });

        if (geo) {
          const street = [geo.streetNumber, geo.street].filter(Boolean).join(' ');
          const place = geo.name && !isPlusCode(geo.name) && geo.name !== geo.street ? geo.name : '';
          const locality = geo.district || geo.subregion || '';
          const city = geo.city || geo.subregion || 'Bengaluru';
          const state = geo.region || '';
          const postal = geo.postalCode ? ` - ${geo.postalCode}` : '';

          const parts = Array.from(
            new Set([place, street, locality, city, state].filter(Boolean).filter((p) => !isPlusCode(p)))
          );

          if (parts.length > 0) {
            setLiveAddress(`${parts.join(', ')}${postal}`);
            return;
          }
        }
      }
    } catch (err) {
      console.log('Live location error, using default:', err);
    } finally {
      setIsFetchingLocation(false);
    }
  };

  const loadDutyState = async () => {
    try {
      const stored = await AsyncStorage.getItem(DUTY_STORAGE_KEY);
      if (stored !== null) {
        setIsOnline(JSON.parse(stored));
      }
    } catch (e) {
      console.error('Error loading duty state', e);
    }
  };

  const toggleDuty = async () => {
    const nextState = !isOnline;
    setIsOnline(nextState);
    await AsyncStorage.setItem(DUTY_STORAGE_KEY, JSON.stringify(nextState));
  };

  const setDuty = async (online: boolean) => {
    setIsOnline(online);
    await AsyncStorage.setItem(DUTY_STORAGE_KEY, JSON.stringify(online));
  };

  const depositCash = (amount: number) => {
    setFloatingCash((prev) => Math.max(0, prev - amount));
  };

  const formatTime = (totalSecs: number) => {
    const hrs = Math.floor(totalSecs / 3600);
    const mins = Math.floor((totalSecs % 3600) / 60);
    const secs = totalSecs % 60;
    return `${hrs}h ${mins.toString().padStart(2, '0')}m ${secs.toString().padStart(2, '0')}s`;
  };

  const updateLocationFromCoords = async (lat: number, lng: number) => {
    setLiveCoords({ lat, lng });
    try {
      const [geo] = await Location.reverseGeocodeAsync({
        latitude: lat,
        longitude: lng,
      });

      if (geo) {
        const street = [geo.streetNumber, geo.street].filter(Boolean).join(' ');
        const place = geo.name && !isPlusCode(geo.name) && geo.name !== geo.street ? geo.name : '';
        const locality = geo.district || geo.subregion || '';
        const city = geo.city || geo.subregion || 'Bengaluru';
        const postal = geo.postalCode ? ` - ${geo.postalCode}` : '';

        const parts = Array.from(
          new Set([place, street, locality, city].filter(Boolean).filter((p) => !isPlusCode(p)))
        );

        if (parts.length > 0) {
          setLiveAddress(`${parts.join(', ')}${postal}`);
          return;
        }
      }
    } catch (err) {
      console.log('Error reverse geocoding map move:', err);
    }
  };

  return (
    <DutyContext.Provider
      value={{
        isOnline,
        toggleDuty,
        setDuty,
        shiftSeconds,
        formattedShiftTime: formatTime(shiftSeconds),
        batteryLevel,
        currentHub,
        setCurrentHub,
        floatingCash,
        depositCash,
        liveAddress,
        liveCoords,
        isFetchingLocation,
        refreshLocation: fetchLiveLocation,
        updateLocationFromCoords,
      }}
    >
      {children}
    </DutyContext.Provider>
  );

};

export const useDutyContext = () => {
  const context = useContext(DutyContext);
  if (!context) {
    throw new Error('useDutyContext must be used within a DutyProvider');
  }
  return context;
};

