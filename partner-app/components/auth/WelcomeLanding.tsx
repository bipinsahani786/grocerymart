import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Platform,
  StatusBar as RNStatusBar,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { Ionicons } from '@expo/vector-icons';
import { EdgeInsets } from 'react-native-safe-area-context';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

interface WelcomeLandingProps {
  insets: EdgeInsets;
  onSelectMode: (mode: 'LOGIN' | 'REGISTER') => void;
}

export const WelcomeLanding: React.FC<WelcomeLandingProps> = ({
  insets,
  onSelectMode,
}) => {
  return (
    <View style={tw`flex-1`}>
      <RNStatusBar backgroundColor="#0f9b0f" barStyle="light-content" />
      <StatusBar style="light" />

      {/* Brand Gradient Background (Same theme as splash) */}
      <LinearGradient
        colors={[Colors.splashGradientStart, Colors.splashGradientEnd]}
        style={[
          tw`flex-1 justify-between relative overflow-hidden`,
          {
            paddingTop: Platform.OS === 'ios' ? Math.max(insets.top - 10, 8) : 8,
          },
        ]}
      >
        {/* Background Decorative Diagonal Stripes */}
        <View
          style={[
            tw`absolute rounded-3xl opacity-10`,
            {
              top: -100,
              left: -50,
              width: 120,
              height: 500,
              transform: [{ rotate: '-35deg' }],
              backgroundColor: Colors.stripeColor,
            },
          ]}
        />
        <View
          style={[
            tw`absolute rounded-3xl opacity-10`,
            {
              top: -150,
              left: 140,
              width: 80,
              height: 600,
              transform: [{ rotate: '-35deg' }],
              backgroundColor: Colors.stripeColor,
            },
          ]}
        />

        {/* Top & Center Brand Section */}
        <View style={tw`items-center px-6 pt-6`}>
          {/* Circular Logo Container */}
          <View
            style={[
              tw`w-28 h-28 rounded-full justify-center items-center mb-4 p-4 shadow-2xl elevation-8`,
              { backgroundColor: Colors.white },
            ]}
          >
            <Image
              source={require('../../assets/images/zytrixon.png')}
              style={tw`w-full h-full -ml-1`}
              resizeMode="contain"
            />
          </View>

          {/* App Title */}
          <Text
            style={[
              tw`text-3xl font-black tracking-widest text-center`,
              {
                color: Colors.white,
                textShadowColor: Colors.splashTextShadow,
                textShadowOffset: { width: 0, height: 2 },
                textShadowRadius: 4,
              },
            ]}
          >
            Grocery Mart
          </Text>

          {/* Delivery Partner Badge */}
          <View
            style={[
              tw`flex-row items-center px-3 py-1 rounded-full mt-2.5 mb-2.5 border`,
              {
                backgroundColor: Colors.primaryBg,
                borderColor: Colors.primary,
              },
            ]}
          >
            <Ionicons name="bicycle" size={13} color={Colors.primaryDark} style={tw`mr-1.5`} />
            <Text style={[tw`text-[11px] font-black tracking-wider`, { color: Colors.primaryDark }]}>
              DELIVERY PARTNER
            </Text>
          </View>

          <Text
            style={[
              tw`text-xs text-center font-semibold opacity-90 tracking-wide`,
              { color: Colors.primaryBg },
            ]}
          >
            Deliver Groceries • Earn Daily
          </Text>
        </View>

        {/* Bottom White Container Sheet with Auth Buttons */}
        <View
          style={[
            tw`rounded-t-3xl p-6 shadow-2xl`,
            {
              backgroundColor: Colors.surface,
              paddingBottom: Math.max(insets.bottom, 16) + 12,
            },
          ]}
        >
          {/* Welcome Text */}
          <View style={tw`mb-5`}>
            <Text style={[tw`text-xl font-black`, { color: Colors.text }]}>
              Partner Portal
            </Text>
            <Text style={[tw`text-xs mt-1 leading-4`, { color: Colors.textSecondary }]}>
              Sign in with your registered phone number or register as a new delivery captain.
            </Text>
          </View>

          {/* Action 1: Sign In with Phone Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelectMode('LOGIN')}
            style={[
              tw`rounded-2xl py-4 flex-row justify-center items-center shadow-md mb-3`,
              { backgroundColor: Colors.primary },
            ]}
          >
            <Ionicons name="call" size={18} color={Colors.white} style={tw`mr-2`} />
            <Text style={[tw`text-sm font-black tracking-wide`, { color: Colors.white }]}>
              SIGN IN WITH PHONE NUMBER
            </Text>
          </TouchableOpacity>

          {/* Action 2: Sign Up / Register Button */}
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={() => onSelectMode('REGISTER')}
            style={[
              tw`rounded-2xl py-3.5 flex-row justify-center items-center border`,
              { backgroundColor: Colors.surfaceLight, borderColor: Colors.border },
            ]}
          >
            <Ionicons name="person-add-outline" size={18} color={Colors.primaryDark} style={tw`mr-2`} />
            <Text style={[tw`text-sm font-black`, { color: Colors.primaryDark }]}>
              SIGN UP / REGISTER AS PARTNER
            </Text>
          </TouchableOpacity>

          {/* Terms info */}
          <Text style={[tw`text-[10px] text-center mt-4`, { color: Colors.textMuted }]}>
            By continuing, you agree to Partner Terms & Conditions
          </Text>
        </View>
      </LinearGradient>
    </View>
  );
};
