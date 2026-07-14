import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Dimensions,
  TouchableOpacity,
  SafeAreaView,
  Image,
  Animated,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Path } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const FONT_BOLD = Platform.select({ default: 'Poppins_700Bold' });
const FONT_SEMIBOLD = Platform.select({ default: 'Poppins_600SemiBold' });
const FONT_REGULAR = Platform.select({ default: 'Poppins_400Regular' });

const SLIDES = [
  {
    id: '1',
    title: 'Digitize Your Workflow',
    description: 'Replace messy manual forms and paperwork with streamlined digital data entry on the job site.',
    image: require('../assets/onboarding3.jpg'),
  },
  {
    id: '2',
    title: 'Reduce Human Error',
    description: 'Capture accurate construction data instantly, ensuring nothing gets lost in translation from field to office.',
    image: require('../assets/onboarding1.jpg'),
  },
  {
    id: '3',
    title: 'Build Smarter & Faster',
    description: 'Empower your crew with modern digital tools designed specifically for the daily demands of construction.',
    image: require('../assets/onboarding2.png'),
  },
];

const Wave = () => (
  <Svg
    width={width}
    height={width * 0.25}
    viewBox={`0 0 ${width} ${width * 0.25}`}
    style={styles.wave}
    preserveAspectRatio="none"
  >
    <Path
      d={`M0,${width * 0.25} C${width * 0.3},0 ${width * 0.6},${width * 0.15} ${width},${width * 0.05} L${width},${width * 0.25} Z`}
      fill="#FFFFFF"
    />
  </Svg>
);

export default function OnboardingScreen({ navigation }) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const flatListRef = useRef(null);
  const scrollX = useRef(new Animated.Value(0)).current;

  const viewableItemsChanged = useRef(({ viewableItems }) => {
    if (viewableItems[0]) {
      setCurrentIndex(viewableItems[0].index);
    }
  }).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 60 }).current;

  const handleNext = async () => {
    if (currentIndex < SLIDES.length - 1) {
      flatListRef.current.scrollToIndex({ index: currentIndex + 1 });
    } else {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.setItem('hasFinishedOnboarding', 'true');
      navigation.replace('Login');
    }
  };

  const renderItem = ({ item, index }) => {
    const inputRange = [(index - 1) * width, index * width, (index + 1) * width];

    const imageScale = scrollX.interpolate({
      inputRange,
      outputRange: [0.8, 1, 0.8],
      extrapolate: 'clamp',
    });
    const textOpacity = scrollX.interpolate({
      inputRange,
      outputRange: [0, 1, 0],
      extrapolate: 'clamp',
    });
    const textTranslateX = scrollX.interpolate({
      inputRange,
      outputRange: [50, 0, -50],
      extrapolate: 'clamp',
    });

    return (
      <View style={styles.slide}>
        <View style={styles.imageSection}>
          <Animated.View style={[styles.imageWrap, { transform: [{ scale: imageScale }] }]}>
            <Image source={item.image} style={styles.image} resizeMode="cover" />
          </Animated.View>
        </View>

        <View style={styles.textSection}>
          <Animated.View style={{ opacity: textOpacity, transform: [{ translateX: textTranslateX }] }}>
            <Text style={styles.title}>{item.title}</Text>
            {item.description ? <Text style={styles.description}>{item.description}</Text> : null}
          </Animated.View>
        </View>
      </View>
    );
  };

  return (
    <SafeAreaView style={styles.container}>
      {/* Background Gradient similar to the reference image */}
      <LinearGradient
        colors={['#E8F0FE', '#D2E3FC', '#AECBFA']}
        style={StyleSheet.absoluteFill}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
      />

      {/* The White Card at the bottom with a curved SVG top */}
      <View style={styles.bottomCardWrap} pointerEvents="none">
        <Wave />
        <View style={styles.bottomCardSolid} />
      </View>

      <Animated.FlatList
        data={SLIDES}
        ref={flatListRef}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        horizontal
        showsHorizontalScrollIndicator={false}
        pagingEnabled
        bounces={false}
        onViewableItemsChanged={viewableItemsChanged}
        viewabilityConfig={viewConfig}
        onScroll={Animated.event([{ nativeEvent: { contentOffset: { x: scrollX } } }], {
          useNativeDriver: false,
        })}
        scrollEventThrottle={16}
      />

      {/* Footer overlays the white card */}
      <View style={styles.footer}>
        <View style={styles.pagination}>
          {SLIDES.map((_, index) => {
            const inputRange = [(index - 1) * width, index * width, (index + 1) * width];
            const dotWidth = scrollX.interpolate({
              inputRange,
              outputRange: [6, 18, 6],
              extrapolate: 'clamp',
            });
            const dotColor = scrollX.interpolate({
              inputRange,
              outputRange: ['#E0E0E0', '#FC5C55', '#E0E0E0'],
              extrapolate: 'clamp',
            });
            return (
              <Animated.View
                key={index}
                style={[styles.dot, { width: dotWidth, backgroundColor: dotColor }]}
              />
            );
          })}
        </View>

        <TouchableOpacity activeOpacity={0.85} onPress={handleNext}>
          <LinearGradient
            colors={['#FF6B6B', '#FC4A42']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.ctaGradient}
          >
            <Text style={styles.ctaLabel}>Get started</Text>
          </LinearGradient>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#E8F0FE',
  },
  bottomCardWrap: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: height * 0.35,
  },
  wave: {
    position: 'absolute',
    top: -(width * 0.25) + 2, // Slight overlap to prevent 1px gap
  },
  bottomCardSolid: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  slide: {
    width,
    height,
  },
  imageSection: {
    height: height * 0.65,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    paddingTop: 40,
  },
  imageWrap: {
    width: width * 0.8,
    height: width * 0.8,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 32,
    backgroundColor: '#FFFFFF', // Helps blend if images have slight transparency
    shadowColor: '#1A202C',
    shadowOffset: { width: 0, height: 16 },
    shadowOpacity: 0.12,
    shadowRadius: 32,
    elevation: 12,
    overflow: 'hidden', // Ensures the image respects the border radius
  },
  image: {
    width: '100%',
    height: '100%',
    borderRadius: 32,
  },
  textSection: {
    height: height * 0.35,
    paddingHorizontal: 32,
    paddingTop: 10,
  },
  title: {
    fontSize: 24,
    fontFamily: FONT_BOLD,
    color: '#1A202C',
    lineHeight: 32,
    marginBottom: 8,
  },
  description: {
    fontSize: 15,
    fontFamily: FONT_REGULAR,
    color: '#718096',
    lineHeight: 24,
  },
  footer: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 40 : 30,
    left: 0,
    right: 0,
    paddingHorizontal: 32,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  pagination: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  dot: {
    height: 6,
    borderRadius: 3,
    marginRight: 6,
  },
  ctaGradient: {
    paddingHorizontal: 24,
    paddingVertical: 14,
    borderRadius: 24,
    shadowColor: '#FC4A42',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 6,
  },
  ctaLabel: {
    color: '#FFFFFF',
    fontSize: 14,
    fontFamily: FONT_SEMIBOLD,
    letterSpacing: 0.2,
  },
});