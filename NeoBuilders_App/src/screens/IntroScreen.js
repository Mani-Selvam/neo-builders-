
import React, { useEffect, useMemo, useRef } from 'react';
import {
  View,
  Text,
  Image,
  StyleSheet,
  SafeAreaView,
  Dimensions,
  Animated,
  Easing,
  StatusBar,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Svg, { Circle } from 'react-native-svg';

const { width, height } = Dimensions.get('window');

const LOGO = require('../assets/logo.png');

// ── Palette ──────────────────────────────────────────────────────
const INK_DEEP = '#02040A';
const INK = '#060B14';
const BRAND_BLUE = '#22ABF2';
const BRAND_BLUE_SOFT = '#4FC3F7';
const VIOLET = '#8A5CF6';
const MIST = '#7C8AA0';

const FONT_SEMIBOLD = Platform.select({ default: 'Sora_600SemiBold' });
const FONT_MEDIUM = Platform.select({ default: 'Sora_500Medium' });


const PARTICLE_COUNT = 26;

function buildSpiral(startAngleDeg, startRadius, revolutions, steps = 24) {
  const inputRange = [];
  const xRange = [];
  const yRange = [];
  for (let i = 0; i <= steps; i++) {
    const t = i / steps;
    inputRange.push(t);
    const radius = startRadius * (1 - t);
    const angle = ((startAngleDeg + revolutions * 360 * t) * Math.PI) / 180;
    xRange.push(radius * Math.cos(angle));
    yRange.push(radius * Math.sin(angle));
  }
  return { inputRange, xRange, yRange };
}

const PARTICLES = new Array(PARTICLE_COUNT).fill(0).map((_, i) => {
  const angle = (360 / PARTICLE_COUNT) * i + Math.random() * 8;
  const layer = i % 3; // 0 = far dust, 1 = mid, 2 = near/bright
  const radius = 80 + layer * 35 + Math.random() * 40;
  const revolutions = 0.7 + Math.random() * 0.9;
  const size = layer === 2 ? 3.5 + Math.random() * 3 : 2 + Math.random() * 2.5;
  const t = Math.random();
  const color = t < 0.45 ? BRAND_BLUE : t < 0.8 ? BRAND_BLUE_SOFT : VIOLET;
  const baseOpacity = layer === 0 ? 0.5 : layer === 1 ? 0.75 : 1;
  return { id: i, angle, radius, revolutions, size, color, baseOpacity };
});

const SPARKLES = new Array(10).fill(0).map((_, i) => ({
  id: i,
  left: Math.random() * width,
  top: Math.random() * height * 0.75 + height * 0.1,
  size: 2 + Math.random() * 2,
  delay: Math.random() * 2600,
  duration: 1500 + Math.random() * 1500,
}));

// Shockwave rings — staggered concentric bursts instead of one flash blob
const SHOCK_RINGS = [
  { color: '#FFFFFF', delay: 0, maxScale: 1.6, strokeWidth: 3 },
  { color: BRAND_BLUE_SOFT, delay: 90, maxScale: 2.1, strokeWidth: 2.5 },
  { color: VIOLET, delay: 180, maxScale: 2.6, strokeWidth: 2 },
];

// Orbit ring system (idle state, after everything settles)
const ORBIT_RINGS = [
  { radius: 92, dash: '2 8', strokeWidth: 1.2, color: 'rgba(79,195,247,0.55)', duration: 9000, dotColor: BRAND_BLUE_SOFT, dotSize: 6, reverse: false },
  { radius: 118, dash: '1 10', strokeWidth: 1, color: 'rgba(138,92,246,0.4)', duration: 13000, dotColor: VIOLET, dotSize: 5, reverse: true },
];

export default function IntroScreen({ navigation }) {
  const progress = useRef(new Animated.Value(0)).current;

  const shockAnims = useRef(SHOCK_RINGS.map(() => new Animated.Value(0))).current;

  const logoScale = useRef(new Animated.Value(0.2)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const logoFloat = useRef(new Animated.Value(0)).current;

  const wordOpacity = useRef(new Animated.Value(0)).current;
  const wordTranslate = useRef(new Animated.Value(14)).current;
  const underlineScale = useRef(new Animated.Value(0)).current;

  const particleOpacity = useRef(new Animated.Value(1)).current;
  const sparkleAnims = useRef(SPARKLES.map(() => new Animated.Value(0))).current;

  const orbitOpacity = useRef(new Animated.Value(0)).current;
  const orbitRotations = useRef(ORBIT_RINGS.map(() => new Animated.Value(0))).current;

  const spirals = useMemo(
    () => PARTICLES.map((p) => buildSpiral(p.angle, p.radius, p.revolutions)),
    []
  );

  useEffect(() => {
    SPARKLES.forEach((s, i) => {
      const loopAnim = () =>
        Animated.sequence([
          Animated.timing(sparkleAnims[i], { toValue: 1, duration: s.duration, delay: s.delay, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(sparkleAnims[i], { toValue: 0, duration: s.duration, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ]);
      Animated.loop(loopAnim()).start();
    });

    // Main reveal sequence
    Animated.sequence([
      Animated.timing(progress, {
        toValue: 1,
        duration: 1650,
        easing: Easing.in(Easing.cubic),
        useNativeDriver: true,
      }),
      Animated.parallel([
        Animated.timing(particleOpacity, { toValue: 0, duration: 250, useNativeDriver: true }),
        // Staggered shockwave rings
        Animated.stagger(
          90,
          shockAnims.map((v) =>
            Animated.timing(v, {
              toValue: 1,
              duration: 650,
              easing: Easing.out(Easing.cubic),
              useNativeDriver: true,
            })
          )
        ),
        Animated.sequence([
          Animated.delay(120),
          Animated.parallel([
            Animated.spring(logoScale, { toValue: 1, friction: 6.5, tension: 60, useNativeDriver: true }),
            Animated.timing(logoOpacity, { toValue: 1, duration: 520, useNativeDriver: true }),
          ]),
        ]),
      ]),
      Animated.parallel([
        Animated.timing(wordOpacity, { toValue: 1, duration: 550, useNativeDriver: true }),
        Animated.timing(wordTranslate, { toValue: 0, duration: 550, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      ]),
      Animated.timing(underlineScale, { toValue: 1, duration: 440, easing: Easing.out(Easing.cubic), useNativeDriver: true }),
      Animated.timing(orbitOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start(() => {
      // Idle float
      Animated.loop(
        Animated.sequence([
          Animated.timing(logoFloat, { toValue: 1, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
          Animated.timing(logoFloat, { toValue: 0, duration: 1600, easing: Easing.inOut(Easing.ease), useNativeDriver: true }),
        ])
      ).start();

      // Continuous orbit ring rotation, each ring its own speed/direction
      orbitRotations.forEach((v, i) => {
        v.setValue(0);
        Animated.loop(
          Animated.timing(v, {
            toValue: 1,
            duration: ORBIT_RINGS[i].duration,
            easing: Easing.linear,
            useNativeDriver: true,
          })
        ).start();
      });
      
      // Check auth state and navigate accordingly
      const checkAuthAndNavigate = async () => {
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        try {
          const employeeDataStr = await AsyncStorage.getItem('employeeData');
          const companyDataStr = await AsyncStorage.getItem('companyData');
          const hasFinishedOnboarding = await AsyncStorage.getItem('hasFinishedOnboarding');
          const showOnboardingEnv = process.env.EXPO_PUBLIC_SHOW_ONBOARDING === 'true';

          if (employeeDataStr && companyDataStr) {
            navigation.replace('Dashboard', {
              employee: JSON.parse(employeeDataStr),
              company: JSON.parse(companyDataStr)
            });
          } else if (showOnboardingEnv && hasFinishedOnboarding !== 'true') {
            navigation.replace('Onboarding');
          } else {
            navigation.replace('Login');
          }
        } catch (e) {
          navigation.replace('Login');
        }
      };
      
      setTimeout(() => {
        checkAuthAndNavigate();
      }, 600); // slight delay to show the final animated state
    });
  }, []);

  const floatY = logoFloat.interpolate({ inputRange: [0, 1], outputRange: [0, -7] });

  return (
    <SafeAreaView style={styles.container}>
      <StatusBar barStyle="light-content" />

      <LinearGradient
        colors={[INK_DEEP, INK, '#0A1220']}
        start={{ x: 0.15, y: 0 }}
        end={{ x: 0.9, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      <LinearGradient
        pointerEvents="none"
        colors={['rgba(0,0,0,0.55)', 'transparent', 'transparent', 'rgba(0,0,0,0.55)']}
        locations={[0, 0.25, 0.75, 1]}
        style={StyleSheet.absoluteFill}
      />

      {SPARKLES.map((s, i) => (
        <Animated.View
          key={s.id}
          pointerEvents="none"
          style={[
            styles.sparkle,
            {
              left: s.left,
              top: s.top,
              width: s.size,
              height: s.size,
              borderRadius: s.size / 2,
              opacity: sparkleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.08, 0.85] }),
              transform: [{ scale: sparkleAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.6, 1.4] }) }],
            },
          ]}
        />
      ))}

      <View style={styles.center}>
        {/* Converging particles (three depth layers) */}
        {PARTICLES.map((p, i) => {
          const { inputRange, xRange, yRange } = spirals[i];
          return (
            <Animated.View
              key={p.id}
              pointerEvents="none"
              style={[
                styles.particle,
                {
                  width: p.size,
                  height: p.size,
                  borderRadius: p.size / 2,
                  backgroundColor: p.color,
                  opacity: Animated.multiply(particleOpacity, p.baseOpacity),
                  transform: [
                    { translateX: progress.interpolate({ inputRange, outputRange: xRange }) },
                    { translateY: progress.interpolate({ inputRange, outputRange: yRange }) },
                  ],
                },
              ]}
            />
          );
        })}

        {/* Staggered multi-ring shockwave burst */}
        {SHOCK_RINGS.map((ring, i) => (
          <Animated.View
            key={i}
            pointerEvents="none"
            style={[
              styles.shockWrap,
              {
                opacity: shockAnims[i].interpolate({ inputRange: [0, 0.15, 1], outputRange: [0, 0.9, 0] }),
                transform: [
                  {
                    scale: shockAnims[i].interpolate({ inputRange: [0, 1], outputRange: [0.3, ring.maxScale] }),
                  },
                ],
              },
            ]}
          >
            <Svg width={150} height={150} viewBox="0 0 150 150">
              <Circle cx={75} cy={75} r={70} stroke={ring.color} strokeWidth={ring.strokeWidth} fill="none" />
            </Svg>
          </Animated.View>
        ))}

        {/* Idle orbit-ring system (fades in after the reveal settles) */}
        <Animated.View pointerEvents="none" style={[styles.orbitWrap, { opacity: orbitOpacity }]}>
          {ORBIT_RINGS.map((ring, i) => {
            const rotate = orbitRotations[i].interpolate({
              inputRange: [0, 1],
              outputRange: ring.reverse ? ['360deg', '0deg'] : ['0deg', '360deg'],
            });
            const size = ring.radius * 2;
            return (
              <Animated.View
                key={i}
                style={[
                  styles.orbitRing,
                  { width: size, height: size, borderRadius: size / 2, transform: [{ rotate }] },
                ]}
              >
                <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
                  <Circle
                    cx={size / 2}
                    cy={size / 2}
                    r={ring.radius - ring.strokeWidth}
                    stroke={ring.color}
                    strokeWidth={ring.strokeWidth}
                    strokeDasharray={ring.dash}
                    fill="none"
                  />
                </Svg>
                {/* Satellite dot riding the ring */}
                <View
                  style={[
                    styles.orbitDot,
                    {
                      width: ring.dotSize,
                      height: ring.dotSize,
                      borderRadius: ring.dotSize / 2,
                      backgroundColor: ring.dotColor,
                      top: 0,
                      left: size / 2 - ring.dotSize / 2,
                      shadowColor: ring.dotColor,
                    },
                  ]}
                />
              </Animated.View>
            );
          })}
        </Animated.View>

        {/* Logo */}
        <Animated.View
          style={[
            styles.logoWrap,
            { opacity: logoOpacity, transform: [{ scale: logoScale }, { translateY: floatY }] },
          ]}
        >
          <Image source={LOGO} style={styles.logo} resizeMode="contain" />
        </Animated.View>

        {/* Wordmark */}
        <Animated.View
          style={{
            opacity: wordOpacity,
            transform: [{ translateY: wordTranslate }],
            marginTop: 22,
            alignItems: 'center',
          }}
        >
          <Text style={styles.wordmark}>
            <Text style={styles.wordmarkLight}>NEO </Text>
            <Text style={styles.wordmarkBold}>BUILDERS</Text>
          </Text>
          <Animated.View style={{ transform: [{ scaleX: underlineScale }], marginTop: 10 }}>
            <LinearGradient
              colors={[BRAND_BLUE, VIOLET]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.underline}
            />
          </Animated.View>
        </Animated.View>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: INK, overflow: 'hidden' },
  center: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  sparkle: { position: 'absolute', backgroundColor: '#FFFFFF' },
  particle: { position: 'absolute' },
  shockWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  orbitWrap: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  orbitRing: { position: 'absolute', alignItems: 'center', justifyContent: 'center' },
  orbitDot: {
    position: 'absolute',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 6,
  },
  logoWrap: { width: 128, height: 128, alignItems: 'center', justifyContent: 'center' },
  logo: { width: 128, height: 128 },
  wordmark: { fontSize: 23, letterSpacing: 3, textAlign: 'center' },
  wordmarkLight: { fontFamily: FONT_MEDIUM, fontWeight: '400', color: MIST },
  wordmarkBold: { fontFamily: FONT_SEMIBOLD, fontWeight: '700', color: '#F5F8FC' },
  underline: { height: 2, width: 150, borderRadius: 1 },
});