import React from 'react';
import { Text, View, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface HeaderProps {
  searchQuery: string;
  onSearchQueryChange: (query: string) => void;
  isLoggedIn: boolean;
  onToggleLogin: () => void;
}

export const Header: React.FC<HeaderProps> = ({
  searchQuery,
  onSearchQueryChange,
  isLoggedIn,
  onToggleLogin,
}) => {
  const { totalItems } = useCart();
  const insets = useSafeAreaInsets();
  const [placeholderText, setPlaceholderText] = React.useState('');

  React.useEffect(() => {
    const placeholders = [
      "Search fresh organic apples...",
      "Search farm fresh milk...",
      "Search bakery sourdough...",
      "Search baby spinach leaves...",
      "Search sweet strawberries..."
    ];
    let wordIndex = 0;
    let charIndex = 0;
    let isDeleting = false;
    let typingSpeed = 100;
    let timer: any;

    const type = () => {
      const currentWord = placeholders[wordIndex];
      
      if (isDeleting) {
        setPlaceholderText(currentWord.substring(0, charIndex - 1));
        charIndex--;
        typingSpeed = 40;
      } else {
        setPlaceholderText(currentWord.substring(0, charIndex + 1));
        charIndex++;
        typingSpeed = 80;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        typingSpeed = 1500;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % placeholders.length;
        typingSpeed = 400;
      }

      timer = setTimeout(type, typingSpeed);
    };

    timer = setTimeout(type, 500);
    return () => clearTimeout(timer);
  }, []);

  return (
    <LinearGradient
      colors={['rgba(4, 120, 87, 0.95)', 'rgba(4, 120, 87, 0.5)', 'rgba(4, 120, 87, 0)']}
      start={{ x: 0, y: 0 }}
      end={{ x: 0, y: 1 }}
      style={[
        tw`px-4 pb-8`,
        { paddingTop: Math.max(insets.top, 12) + 6 }
      ]}
    >
      {/* Top Location and Cart Bar */}
      <View style={tw`flex-row justify-between items-center mb-4`}>
        <View style={tw`flex-row items-center flex-1 mr-3`}>
          <View style={[tw`w-9 h-9 rounded-full justify-center items-center`, { backgroundColor: 'rgba(255, 255, 255, 0.2)' }]}>
            <Ionicons name="location" size={18} color={theme.colors.white} />
          </View>
          <View style={tw`ml-2.5 flex-1`}>
            <Text style={[tw`text-[9px] font-black tracking-wider opacity-75`, { color: theme.colors.white }]}>DELIVER TO</Text>
            <View style={tw`flex-row items-center`}>
              <Text style={[tw`text-sm font-extrabold mr-1 max-w-[85%]`, { color: theme.colors.white }]} numberOfLines={1}>
                Home - 123 Main Street, New York
              </Text>
              <Ionicons name="chevron-down" size={14} color={theme.colors.white} />
            </View>
          </View>
        </View>

        {/* Action Circles */}
        <View style={tw`flex-row items-center`}>
          <TouchableOpacity 
            style={[tw`relative w-9 h-9 rounded-full justify-center items-center ml-2 border border-white/10`, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]} 
            onPress={onToggleLogin}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isLoggedIn ? "person" : "person-outline"}
              size={18}
              color={theme.colors.white}
            />
            <View
              style={[
                tw`absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full border border-emerald-600`,
                { 
                  backgroundColor: isLoggedIn ? '#34D399' : '#9CA3AF',
                },
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[tw`relative w-9 h-9 rounded-full justify-center items-center ml-2 border border-white/10`, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="notifications-outline" size={18} color={theme.colors.white} />
            <View style={[tw`absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border border-emerald-600`, { backgroundColor: theme.colors.accent || '#F59E0B' }]} />
          </TouchableOpacity>

          <TouchableOpacity 
            style={[tw`relative w-9 h-9 rounded-full justify-center items-center ml-2 border border-white/10`, { backgroundColor: 'rgba(255, 255, 255, 0.18)' }]}
            activeOpacity={0.8}
          >
            <Ionicons name="cart-outline" size={18} color={theme.colors.white} />
            {totalItems > 0 && (
              <View style={[tw`absolute -top-1 -right-1 min-w-[16px] h-[16px] rounded-full justify-center items-center px-1`, { backgroundColor: theme.colors.accent || '#F59E0B' }]}>
                <Text style={[tw`text-[8px] font-black`, { color: theme.colors.white }]}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Floating Search Input Bar */}
      <View style={[tw`flex-row items-center rounded-2xl px-4 h-13 bg-white shadow-xl`]}>
        <Ionicons name="search" size={20} color="#4B5563" style={tw`mr-2`} />
        <TextInput
          placeholder={placeholderText}
          placeholderTextColor="#9CA3AF"
          style={[tw`flex-1 h-full text-sm font-semibold text-gray-800`]}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchQueryChange('')} style={tw`mr-2`}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={tw`p-1`}>
          <Ionicons name="options-outline" size={20} color={theme.colors.primary} />
        </TouchableOpacity>
      </View>
    </LinearGradient>
  );
};

