import React, { useEffect } from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

export const SplashScreen: React.FC = () => {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const { user, isLoading } = useAuthContext();

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }, 2200);

    return () => clearTimeout(timer);
  }, [user, isLoading, router]);

  return (
    <LinearGradient
      colors={[Colors.splashGradientStart, Colors.splashGradientEnd]}
      style={[
        tw`flex-1 justify-between items-center relative overflow-hidden`,
        {
          paddingTop: insets.top,
          paddingBottom: Math.max(insets.bottom, 16),
        },
      ]}
    >
      <StatusBar style="light" />

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
            top: -200,
            left: 100,
            width: 80,
            height: 600,
            transform: [{ rotate: '-35deg' }],
            backgroundColor: Colors.stripeColor,
          },
        ]}
      />
      <View
        style={[
          tw`absolute rounded-3xl opacity-10`,
          {
            bottom: -150,
            right: -50,
            width: 100,
            height: 450,
            transform: [{ rotate: '-35deg' }],
            backgroundColor: Colors.stripeColor,
          },
        ]}
      />

      {/* Main Center Content */}
      <View style={tw`flex-1 justify-center items-center px-5 w-full`}>
        {/* Logo Container */}
        <View
          style={[
            tw`w-35 h-35 rounded-full justify-center items-center mb-6 p-5 shadow-2xl elevation-8`,
            { backgroundColor: Colors.white },
          ]}
        >
          <Image
            source={require('../../assets/images/zytrixon.png')}
            style={tw`w-full h-full -ml-1`}
            resizeMode="contain"
          />
        </View>

        {/* Title */}
        <Text
          style={[
            tw`text-4xl font-black tracking-widest text-center`,
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
            tw`flex-row items-center px-3 py-1 rounded-full mt-2 mb-2.5 border`,
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

        {/* Tagline */}
        <Text
          style={[
            tw`text-sm text-center font-semibold opacity-95 mt-0.5 tracking-wide`,
            { color: Colors.primaryBg },
          ]}
        >
          Fast • Reliable • Instant Payouts
        </Text>
      </View>

      {/* Footer */}
      <View style={tw`items-center w-full pb-2`}>
        <Text style={[tw`text-[11px] tracking-widest opacity-70 font-bold uppercase`, { color: Colors.white }]}>
          POWERED BY
        </Text>
        <Image
          source={require('../../assets/images/zytrixon.png')}
          style={[tw`w-30 h-10 mt-1 opacity-95`, { tintColor: Colors.white }]}
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
};
