import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import tw from 'twrnc';

interface SearchLandingViewProps {
  recentSearches: string[];
  onSelectSearch: (term: string) => void;
  onClearRecent: () => void;
  popularTags: string[];
}

export const SearchLandingView: React.FC<SearchLandingViewProps> = ({
  recentSearches,
  onSelectSearch,
  onClearRecent,
  popularTags,
}) => {
  return (
    <View style={tw`px-4 pt-5`}>
      {/* Recent Searches Section */}
      {recentSearches.length > 0 && (
        <View style={tw`mb-5 bg-white p-4 rounded-md border border-slate-200/80 shadow-sm`}>
          <View style={tw`flex-row justify-between items-center mb-3`}>
            <View style={tw`flex-row items-center gap-1.5`}>
              <Ionicons name="time-outline" size={13} color="#64748B" />
              <Text style={tw`text-[11px] font-black uppercase tracking-wider text-slate-500`}>
                Recent Searches
              </Text>
            </View>
            <TouchableOpacity onPress={onClearRecent} activeOpacity={0.7}>
              <Text style={tw`text-[11px] font-black text-rose-600`}>Clear All</Text>
            </TouchableOpacity>
          </View>

          <View style={tw`flex-row flex-wrap gap-2`}>
            {recentSearches.map((term, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => onSelectSearch(term)}
                style={tw`px-3 py-1.5 bg-slate-50 rounded-md border border-slate-200/80 flex-row items-center gap-1.5`}
                activeOpacity={0.8}
              >
                <Ionicons name="search" size={10} color="#94A3B8" />
                <Text style={tw`text-[11px] font-bold text-slate-700`}>{term}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      {/* Trending Search Tags Section */}
      <View style={tw`bg-white p-4 rounded-md border border-slate-200/80 shadow-sm`}>
        <View style={tw`flex-row items-center gap-1.5 mb-3`}>
          <Text style={tw`text-sm`}>🔥</Text>
          <Text style={tw`text-xs font-black text-slate-800 tracking-tight`}>
            Trending Searches
          </Text>
        </View>

        <View style={tw`flex-row flex-wrap gap-2`}>
          {popularTags.map((tag, idx) => (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectSearch(tag)}
              style={tw`px-3 py-1.5 bg-emerald-50/70 rounded-md border border-emerald-200/80 flex-row items-center gap-1`}
              activeOpacity={0.8}
            >
              <Ionicons name="trending-up" size={10} color="#059669" />
              <Text style={tw`text-[10.5px] font-black text-emerald-900`}>{tag}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>
    </View>
  );
};
