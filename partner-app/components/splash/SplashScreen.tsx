import React, { useEffect } from 'react';
import { View, Text, Image, StyleSheet, StatusBar as RNStatusBar, Dimensions, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { StatusBar } from 'expo-status-bar';
import { NavigationBar } from 'expo-navigation-bar';
import { useRouter } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { useAuthContext } from '../../context/AuthContext';
import { Colors } from '../../constants/theme';
import tw from 'twrnc';

const { width: screenWidth, height: screenHeight } = Dimensions.get('screen');

export const SplashScreen: React.FC = () => {
  const router = useRouter();
  const { user, isKycCompleted, isLoading } = useAuthContext();

  // Enforce full-screen immersive mode at bottom on Android
  useEffect(() => {
    if (Platform.OS === 'android') {
      NavigationBar.setHidden(true);
    }
    return () => {
      if (Platform.OS === 'android') {
        NavigationBar.setHidden(false);
      }
    };
  }, []);

  useEffect(() => {
    if (isLoading) return;

    const timer = setTimeout(() => {
      if (user) {
        if (isKycCompleted) {
          router.replace('/home');
        } else {
          router.replace('/onboarding');
        }
      } else {
        router.replace('/login');
      }
    }, 2000);

    return () => clearTimeout(timer);
  }, [isLoading, user, isKycCompleted, router]);

  return (
    <View style={styles.container}>
      {/* Full-Screen Edge-to-Edge System Bars without Safe Area Mode */}
      <RNStatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      <StatusBar style="light" />
      <NavigationBar style="light" hidden={true} />

      <LinearGradient
        colors={[Colors.splashGradientStart, Colors.splashGradientEnd]}
        style={styles.gradient}
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
              tw`w-36 h-36 rounded-full justify-center items-center mb-6 p-5 shadow-2xl elevation-8`,
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
              tw`flex-row items-center px-3.5 py-1 rounded-full mt-2.5 mb-2.5 border`,
              {
                backgroundColor: Colors.primaryBg,
                borderColor: Colors.primary,
              },
            ]}
          >
            <Ionicons name="bicycle" size={14} color={Colors.primaryDark} style={tw`mr-1.5`} />
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
        <View style={tw`items-center w-full pb-4`}>
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
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: screenWidth,
    height: screenHeight,
    minHeight: screenHeight,
    backgroundColor: Colors.splashGradientEnd,
  },
  gradient: {
    width: screenWidth,
    height: screenHeight,
    minHeight: screenHeight,
    justifyContent: 'space-between',
    alignItems: 'center',
    position: 'relative',
    overflow: 'hidden',
    paddingTop: 60,
    paddingBottom: 40,
  },
});

