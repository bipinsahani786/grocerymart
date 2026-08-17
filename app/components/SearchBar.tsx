import React, { useState, useEffect } from 'react';
import { View, TextInput, TouchableOpacity, StyleProp, ViewStyle, Keyboard } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { SearchSuggestionsDropdown } from './SearchSuggestionsDropdown';
import { theme } from '../constants/theme';
import tw from 'twrnc';

interface SearchBarProps {
  value: string;
  onChangeText: (text: string) => void;
  onSubmitSearch?: (query: string) => void;
  onClear?: () => void;
  inputRef?: React.RefObject<TextInput | null>;
  onFilterPress?: () => void;
  onFocus?: () => void;
  onBlur?: () => void;
  style?: StyleProp<ViewStyle>;
  customPlaceholder?: string;
}

/**
 * Single Responsibility: Standalone, reusable SearchBar component with animated placeholder,
 * instant autocomplete & live product suggestions dropdown.
 */
export const SearchBar: React.FC<SearchBarProps> = ({
  value,
  onChangeText,
  onSubmitSearch,
  onClear,
  inputRef,
  onFilterPress,
  onFocus,
  onBlur,
  style,
  customPlaceholder,
}) => {
  const [placeholderText, setPlaceholderText] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  useEffect(() => {
    if (customPlaceholder) {
      setPlaceholderText(customPlaceholder);
      return;
    }

    const placeholders = [
      'Search apples...',
      'Search milk...',
      'Search bread...',
      'Search spinach...',
      'Search soap...',
      'Search refined oil...',
      'Search veggies...',
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
        typingSpeed = 35;
      } else {
        setPlaceholderText(currentWord.substring(0, charIndex + 1));
        charIndex++;
        typingSpeed = 75;
      }

      if (!isDeleting && charIndex === currentWord.length) {
        typingSpeed = 1600;
        isDeleting = true;
      } else if (isDeleting && charIndex === 0) {
        isDeleting = false;
        wordIndex = (wordIndex + 1) % placeholders.length;
        typingSpeed = 350;
      }

      timer = setTimeout(type, typingSpeed);
    };

    timer = setTimeout(type, 400);
    return () => clearTimeout(timer);
  }, [customPlaceholder]);

  const handleClear = () => {
    onChangeText('');
    if (onClear) onClear();
  };

  const handleSelectSuggestion = (selected: string) => {
    onChangeText(selected);
    setIsDropdownOpen(false);
    Keyboard.dismiss();
    if (onSubmitSearch) {
      onSubmitSearch(selected);
    }
  };

  return (
    <View style={tw`relative z-50`}>
      <TouchableOpacity
        activeOpacity={1}
        onPress={() => {
          inputRef?.current?.focus();
          setIsDropdownOpen(true);
          if (onFocus) onFocus();
        }}
        style={[
          tw`flex-row items-center rounded-2xl px-4 h-13 bg-white shadow-xl border border-slate-100/80`,
          style,
        ]}
      >
        {/* Search Icon */}
        <Ionicons name="search" size={20} color={theme.colors.primary} style={tw`mr-2.5`} />

        {/* Text Input */}
        <TextInput
          ref={inputRef as any}
          placeholder={placeholderText || 'Search fresh groceries, fruits, milk...'}
          placeholderTextColor="#94A3B8"
          style={[tw`flex-1 h-full text-sm font-semibold text-slate-800`]}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (!isDropdownOpen) setIsDropdownOpen(true);
          }}
          onFocus={() => {
            setIsDropdownOpen(true);
            if (onFocus) onFocus();
          }}
          onBlur={() => {
            if (onBlur) onBlur();
          }}
          returnKeyType="search"
          autoCorrect={false}
          autoCapitalize="none"
          onSubmitEditing={() => {
            setIsDropdownOpen(false);
            Keyboard.dismiss();
            if (onSubmitSearch) {
              onSubmitSearch(value);
            }
          }}
        />

        {/* Clear Button */}
        {value.length > 0 && (
          <TouchableOpacity
            onPress={handleClear}
            hitSlop={{ top: 12, bottom: 12, left: 12, right: 12 }}
            style={tw`mr-2 p-1`}
          >
            <Ionicons name="close-circle" size={19} color="#94A3B8" />
          </TouchableOpacity>
        )}

        {/* Filter / Options Action */}
        <TouchableOpacity
          onPress={onFilterPress}
          hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
          style={tw`p-1.5 rounded-xl bg-slate-50 border border-slate-100`}
        >
          <Ionicons name="options-outline" size={17} color={theme.colors.primary} />
        </TouchableOpacity>
      </TouchableOpacity>

      {/* ── Autocomplete & Suggestions Dropdown (Only shown when search query is typed) ── */}
      {isDropdownOpen && value.trim().length > 0 && (
        <SearchSuggestionsDropdown
          query={value}
          onSelectSuggestion={handleSelectSuggestion}
          onClose={() => setIsDropdownOpen(false)}
        />
      )}
    </View>
  );
};
