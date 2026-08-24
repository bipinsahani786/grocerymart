import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

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
}

const DutyContext = createContext<DutyContextType | undefined>(undefined);

const DUTY_STORAGE_KEY = '@grocerymart_partner_duty';

export const DutyProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(true);
  const [shiftSeconds, setShiftSeconds] = useState<number>(19800); // ~5.5 hrs
  const [batteryLevel] = useState<number>(86);
  const [currentHub, setCurrentHub] = useState<string>('Koramangala Express Hub #04');
  const [floatingCash, setFloatingCash] = useState<number>(450);

  useEffect(() => {
    loadDutyState();
  }, []);

  // Timer ticker when online
  useEffect(() => {
    if (!isOnline) return;
    const interval = setInterval(() => {
      setShiftSeconds((prev) => prev + 1);
    }, 1000);
    return () => clearInterval(interval);
  }, [isOnline]);

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
