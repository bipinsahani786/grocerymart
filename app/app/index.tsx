import React from 'react';
import { View, Text, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { useRouter } from 'expo-router';
import { theme } from '../constants/theme';
import { useAuthContext } from '../context/AuthContext';
import tw from 'twrnc';

export default function SplashScreen() {
  const router = useRouter();
  const { user, isLoading } = useAuthContext();

  React.useEffect(() => {
    // Wait until the session loading check is finished
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user && user.name) {
        router.replace('/home');
      } else {
        router.replace('/login');
      }
    }, 2500); // 2.5 second splash display
    return () => clearTimeout(timer);
  }, [isLoading, user, router]);

  return (
    <LinearGradient
      colors={[theme.colors.splashGradientStart, theme.colors.splashGradientEnd]}
      style={tw`flex-1 justify-center items-center`}
    >
      <StatusBar style="light" />
      
      {/* Background Decorative Diagonal Stripes */}
      <View style={[tw`absolute rounded-3xl`, { top: -100, left: -50, width: 120, height: 500, transform: [{ rotate: '-35deg' }], opacity: 0.1, backgroundColor: theme.colors.stripeColor }]} />
      <View style={[tw`absolute rounded-3xl`, { top: -200, left: 100, width: 80, height: 600, transform: [{ rotate: '-35deg' }], opacity: 0.08, backgroundColor: theme.colors.stripeColor }]} />
      <View style={[tw`absolute rounded-3xl`, { bottom: -150, right: -50, width: 100, height: 450, transform: [{ rotate: '-35deg' }], opacity: 0.08, backgroundColor: theme.colors.stripeColor }]} />

      <View style={tw`flex-1 justify-center items-center px-5 w-full`}>
        {/* Logo Container */}
        <View style={[tw`w-35 h-35 rounded-full justify-center items-center mb-6 p-5 shadow-2xl`, { backgroundColor: theme.colors.white, shadowColor: theme.colors.shadowDark, elevation: 8 }]}>
          <Image
            source={require('../assets/images/zytrixon.png')}
            style={tw`w-full h-full -ml-1.5`}
            resizeMode="contain"
          />
        </View>

        {/* Title & Tagline */}
        <Text style={[tw`text-4xl font-extrabold tracking-widest text-center`, { color: theme.colors.white, textShadowColor: theme.colors.splashTextShadow, textShadowOffset: { width: 0, height: 2 }, textShadowRadius: 4 }]}>
          Grocery Mart
        </Text>
        <Text style={[tw`text-base text-center font-medium opacity-90 tracking-wide mt-2.5`, { color: theme.colors.primaryLight }]}>
          Freshness & Quality Delivered Daily
        </Text>
      </View>

      {/* Footer */}
      <View style={tw`items-center mb-10 w-full`}>
        <Text style={[tw`text-[11px] opacity-60 tracking-wider uppercase`, { color: theme.colors.white }]}>
          Powered by
        </Text>
        <Image 
          source={require('../assets/images/zytrixon.png')} 
          style={[tw`w-30 h-10 mt-1.5 opacity-100`, { tintColor: theme.colors.white }]} 
          resizeMode="contain"
        />
      </View>
    </LinearGradient>
  );
}
