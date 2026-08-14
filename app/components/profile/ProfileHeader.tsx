import React from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { theme } from '../../constants/theme';
import tw from 'twrnc';

interface ProfileHeaderProps {
  user: any;
  isEditing: boolean;
  onToggleEdit: () => void;
  onBack?: () => void;
}

/**
 * Single Responsibility: Top gradient profile header with avatar, name, phone, back button, and edit action.
 */
export const ProfileHeader: React.FC<ProfileHeaderProps> = ({
  user,
  isEditing,
  onToggleEdit,
  onBack,
}) => {
  return (
    <LinearGradient
      colors={[theme.colors.primary, theme.colors.primaryDark || '#047857']}
      style={tw`pt-14 pb-16 px-6 rounded-b-[36px] shadow-lg`}
    >
      <View style={tw`flex-row justify-between items-center mb-5`}>
        {onBack ? (
          <TouchableOpacity
            onPress={onBack}
            style={tw`w-10 h-10 rounded-full bg-white/20 justify-center items-center backdrop-blur-md`}
          >
            <Ionicons name="arrow-back" size={22} color="#FFFFFF" />
          </TouchableOpacity>
        ) : (
          <View style={tw`w-10 h-10`} />
        )}
        <Text style={tw`text-xl font-black text-white tracking-wide`}>My Profile</Text>
        <TouchableOpacity
          onPress={onToggleEdit}
          style={tw`w-10 h-10 rounded-full bg-white/20 justify-center items-center backdrop-blur-md`}
        >
          <Ionicons name={isEditing ? 'close' : 'create-outline'} size={20} color="#FFFFFF" />
        </TouchableOpacity>
      </View>

      {/* User Avatar & Basic Info */}
      <View style={tw`items-center`}>
        <View style={tw`relative`}>
          <View style={tw`w-22 h-22 rounded-full bg-white/30 border-4 border-white justify-center items-center overflow-hidden shadow-md`}>
            {user?.avatar ? (
              <Image source={{ uri: user.avatar }} style={tw`w-full h-full`} />
            ) : (
              <Ionicons name="person" size={44} color="#FFFFFF" />
            )}
          </View>
          {isEditing && (
            <TouchableOpacity
              style={[
                tw`absolute bottom-0 right-0 w-7 h-7 rounded-full justify-center items-center border-2 border-white shadow-sm`,
                { backgroundColor: theme.colors.primary },
              ]}
            >
              <Ionicons name="camera" size={14} color="#FFFFFF" />
            </TouchableOpacity>
          )}
        </View>
        <Text style={tw`text-xl font-black text-white mt-2.5`}>{user?.name || 'Valued Customer'}</Text>
        <Text style={tw`text-xs font-semibold text-white/80`}>{user?.phone || '+91 98765 43210'}</Text>
      </View>
    </LinearGradient>
  );
};
