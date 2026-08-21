import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import tw from 'twrnc';

interface SearchEmptyStateProps {
  query: string;
  onSelectSuggested: (term: string) => void;
}

export const SearchEmptyState: React.FC<SearchEmptyStateProps> = ({ query, onSelectSuggested }) => {
  const suggestions = ['Milk', 'Paneer', 'Eggs', 'Atta', 'Oil', 'Apples'];

  return (
    <View style={tw`px-6 py-16 items-center bg-white rounded-md border border-slate-200/80 mx-4 mt-6 shadow-sm`}>
      <Text style={tw`text-5xl mb-3`}>🔍</Text>
      <Text style={tw`text-base font-black text-slate-800 text-center`}>
        {`No products found for "${query}"`}
      </Text>
      <Text style={tw`text-xs text-center text-slate-400 mt-1 px-4`}>
        Try searching with another keyword or explore popular items.
      </Text>

      <View style={tw`flex-row flex-wrap justify-center gap-2 mt-5`}>
        {suggestions.map((t) => (
          <TouchableOpacity
            key={t}
            onPress={() => onSelectSuggested(t)}
            style={tw`px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200/80`}
          >
            <Text style={tw`text-[11px] font-black text-emerald-800`}>{t}</Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};
