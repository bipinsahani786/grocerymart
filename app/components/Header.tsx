import React from 'react';
import { Text, View, TextInput, TouchableOpacity, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useCart } from '../context/CartContext';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
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
    let timer: NodeJS.Timeout;

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
    <View style={[tw`px-4 pb-2 bg-white`, { paddingTop: Math.max(insets.top, 12) + 4 }]}>
      {/* Top Location and Cart Bar */}
      <View style={tw`flex-row justify-between items-center mb-3`}>
        <View style={tw`flex-row items-center flex-1 mr-3`}>
          <Ionicons name="location" size={20} color="#10B981" />
          <View style={tw`ml-1 flex-1`}>
            <Text style={tw`text-[10px] font-black text-gray-400 tracking-wider`}>DELIVER TO</Text>
            <View style={tw`flex-row items-center`}>
              <Text style={tw`text-sm font-bold text-gray-950 mr-1 max-w-[85%]`} numberOfLines={1}>
                Home - 123 Main Street, New York
              </Text>
              <Ionicons name="chevron-down" size={14} color="#111827" />
            </View>
          </View>
        </View>

        <View style={tw`flex-row items-center`}>
          <TouchableOpacity style={tw`relative w-10 h-10 rounded-full bg-gray-100 justify-center items-center ml-2`} onPress={onToggleLogin}>
            <Ionicons
              name={isLoggedIn ? "person" : "person-outline"}
              size={22}
              color={isLoggedIn ? "#047857" : "#111827"}
            />
            <View
              style={[
                tw`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-white`,
                { backgroundColor: isLoggedIn ? "#10B981" : "#9CA3AF" },
              ]}
            />
          </TouchableOpacity>

          <TouchableOpacity style={tw`relative w-10 h-10 rounded-full bg-gray-100 justify-center items-center ml-2`}>
            <Ionicons name="notifications-outline" size={22} color="#111827" />
            <View style={tw`absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 border border-white`} />
          </TouchableOpacity>

          <TouchableOpacity style={tw`relative w-10 h-10 rounded-full bg-gray-100 justify-center items-center ml-2`}>
            <Ionicons name="cart-outline" size={22} color="#111827" />
            {totalItems > 0 && (
              <View style={tw`absolute -top-1 -right-1 min-w-[18px] h-[18px] rounded-full bg-emerald-500 justify-center items-center px-1 border border-white`}>
                <Text style={tw`color-white text-[9px] font-bold`}>{totalItems}</Text>
              </View>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Input Bar */}
      <View style={tw`flex-row items-center bg-gray-100 rounded-xl px-4 h-12 border border-gray-200`}>
        <Ionicons name="search" size={20} color="#9CA3AF" style={tw`mr-1`} />
        <TextInput
          placeholder={placeholderText}
          placeholderTextColor="#9CA3AF"
          style={tw`flex-1 h-full text-sm font-semibold text-gray-900`}
          value={searchQuery}
          onChangeText={onSearchQueryChange}
        />
        {searchQuery.length > 0 && (
          <TouchableOpacity onPress={() => onSearchQueryChange('')} style={tw`mr-2`}>
            <Ionicons name="close-circle" size={18} color="#9CA3AF" />
          </TouchableOpacity>
        )}
        <TouchableOpacity style={tw`p-1`}>
          <Ionicons name="options-outline" size={20} color="#10B981" />
        </TouchableOpacity>
      </View>
    </View>
  );
};
