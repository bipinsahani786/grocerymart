import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Product } from '../data/groceryData';

interface SavedItemsContextType {
  savedItems: Product[];
  isSaved: (productId: string) => boolean;
  toggleSaveItem: (product: Product) => Promise<void>;
  removeSavedItem: (productId: string) => Promise<void>;
  clearSavedItems: () => Promise<void>;
  totalSavedCount: number;
}

const STORAGE_KEY = '@grocerymart_saved_items';

const SavedItemsContext = createContext<SavedItemsContextType | undefined>(undefined);

export const SavedItemsProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [savedItems, setSavedItems] = useState<Product[]>([]);

  useEffect(() => {
    loadSavedItems();
  }, []);

  const loadSavedItems = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      if (stored) {
        setSavedItems(JSON.parse(stored));
      }
    } catch (err) {
      console.error('Failed to load saved items from storage', err);
    }
  };

  const saveToStorage = async (items: Product[]) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    } catch (err) {
      console.error('Failed to persist saved items to storage', err);
    }
  };

  const isSaved = (productId: string): boolean => {
    return savedItems.some((item) => item.id === productId);
  };

  const toggleSaveItem = async (product: Product) => {
    let updated: Product[];
    if (isSaved(product.id)) {
      updated = savedItems.filter((item) => item.id !== product.id);
    } else {
      updated = [product, ...savedItems];
    }
    setSavedItems(updated);
    await saveToStorage(updated);
  };

  const removeSavedItem = async (productId: string) => {
    const updated = savedItems.filter((item) => item.id !== productId);
    setSavedItems(updated);
    await saveToStorage(updated);
  };

  const clearSavedItems = async () => {
    setSavedItems([]);
    await AsyncStorage.removeItem(STORAGE_KEY);
  };

  return (
    <SavedItemsContext.Provider
      value={{
        savedItems,
        isSaved,
        toggleSaveItem,
        removeSavedItem,
        clearSavedItems,
        totalSavedCount: savedItems.length,
      }}
    >
      {children}
    </SavedItemsContext.Provider>
  );
};

export const useSavedItems = () => {
  const context = useContext(SavedItemsContext);
  if (!context) {
    throw new Error('useSavedItems must be used within a SavedItemsProvider');
  }
  return context;
};
