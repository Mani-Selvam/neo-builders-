import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Image,
  Animated,
  Easing,
  Dimensions,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import logo from '../../assets/logo.png';

const { width } = Dimensions.get('window');

// Warm, paper-toned palette
const BG = '#F7F3EC';
const CARD = '#FFFEFB';
const FIELD = '#F1EBDF';
const BORDER = '#E7DDCC';
const INK = '#241C14';
const MIST = '#8A7C68';
const CLAY = '#E0693E';
const TEAL = '#1F6F6B';
const GOLD = '#E7A94C';

export function FloatingBlob({ size, colors, style, duration, delay = 0 }) {
  const drift = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(drift, {
          toValue: 1,
          duration,
          delay,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(drift, {
          toValue: 0,
          duration,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [drift, duration, delay]);

  const translateY = drift.interpolate({ inputRange: [0, 1], outputRange: [0, -26] });
  const translateX = drift.interpolate({ inputRange: [0, 1], outputRange: [0, 18] });
  const scale = drift.interpolate({ inputRange: [0, 1], outputRange: [1, 1.08] });

  return (
    <Animated.View
      pointerEvents="none"
      style={[
        { width: size, height: size, borderRadius: size / 2, position: 'absolute' },
        style,
        { transform: [{ translateY }, { translateX }, { scale }] },
      ]}
    >
      <LinearGradient
        colors={colors}
        start={{ x: 0.2, y: 0 }}
        end={{ x: 0.8, y: 1 }}
        style={{ flex: 1, borderRadius: size / 2, opacity: 0.35 }}
      />
    </Animated.View>
  );
}

export default function LoginScreen({ navigation }) {
  const [loginId, setLoginId] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const logoScale = useRef(new Animated.Value(0.85)).current;
  const logoOpacity = useRef(new Animated.Value(0)).current;
  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(16)).current;
  const ringPulse = useRef(new Animated.Value(0)).current;
  const ringRotate = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.spring(logoScale, { toValue: 1, friction: 6, tension: 60, useNativeDriver: true }),
      Animated.timing(logoOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
    ]).start();

    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 600,
      delay: 200,
      useNativeDriver: true,
    }).start();
    Animated.timing(formTranslate, {
      toValue: 0,
      duration: 600,
      delay: 200,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();

    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(ringPulse, {
          toValue: 1,
          duration: 1800,
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(ringPulse, { toValue: 0, duration: 0, useNativeDriver: true }),
      ])
    );
    pulse.start();

    const rotate = Animated.loop(
      Animated.timing(ringRotate, {
        toValue: 1,
        duration: 9000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    rotate.start();

    return () => {
      pulse.stop();
      rotate.stop();
    };
  }, []);

  const handleLogin = async () => {
    if (!loginId || !password) {
      Alert.alert('Error', 'Please enter your email/mobile and password');
      return;
    }

    setLoading(true);
    try {
      const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.101:8001/api';
      const response = await fetch(`${baseURL}/v1/employee-auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, password })
      });
      const data = await response.json();
      
      if (data.success) {
        // Save auth data to storage
        const AsyncStorage = require('@react-native-async-storage/async-storage').default;
        await AsyncStorage.setItem('employeeData', JSON.stringify(data.data.employee));
        await AsyncStorage.setItem('companyData', JSON.stringify(data.data.company));
        if (data.data.accessToken) {
          await AsyncStorage.setItem('accessToken', data.data.accessToken);
        }
        
        navigation.navigate('Dashboard', { 
          employee: data.data.employee, 
          company: data.data.company 
        });
      } else {
        Alert.alert('Login Failed', data.message || 'Invalid credentials');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const ringScale = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [1, 1.35] });
  const ringOpacity = ringPulse.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });
  const ringSpin = ringRotate.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  return (
    <SafeAreaView style={styles.container}>
      {/* Soft animated background */}
      <View style={StyleSheet.absoluteFill}>
        <LinearGradient colors={[BG, '#F1EADD']} style={StyleSheet.absoluteFill} />
        <FloatingBlob
          size={width * 0.95}
          colors={['#F3C9A8', '#F7E3CC']}
          style={{ top: -width * 0.4, left: -width * 0.3 }}
          duration={5400}
        />
        <FloatingBlob
          size={width * 0.7}
          colors={['#BFE0DC', '#DCEEEB']}
          style={{ bottom: -width * 0.28, right: -width * 0.22 }}
          duration={6600}
          delay={300}
        />
        <FloatingBlob
          size={width * 0.45}
          colors={['#F6DFAE', '#FBEFD6']}
          style={{ top: width * 0.5, left: -width * 0.12 }}
          duration={4800}
          delay={600}
        />
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <View style={styles.content}>
          {/* Logo */}
          <View style={styles.logoWrap}>
            <Animated.View
              style={[
                styles.pulseRing,
                { opacity: ringOpacity, transform: [{ scale: ringScale }] },
              ]}
            />
            <Animated.View style={[styles.spinRing, { transform: [{ rotate: ringSpin }] }]}>
              <LinearGradient
                colors={[CLAY, GOLD, TEAL, CLAY]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.spinRingGradient}
              />
            </Animated.View>
            <Animated.View
              style={[
                styles.logoCircle,
                { opacity: logoOpacity, transform: [{ scale: logoScale }] },
              ]}
            >
              <Image source={logo} style={styles.logoImage} resizeMode="contain" />
            </Animated.View>
          </View>

          <Text style={styles.title}>Welcome Back</Text>
          <Text style={styles.subtitle}>Sign in to continue to your workspace</Text>

          <Animated.View
            style={[
              styles.form,
              { opacity: formOpacity, transform: [{ translateY: formTranslate }] },
            ]}
          >
            <View style={styles.inputContainer}>
              <Text style={styles.label}>Email or Mobile Number</Text>
              <TextInput
                style={styles.input}
                placeholder="Email or Mobile number"
                placeholderTextColor="#A6AFBD"
                autoCapitalize="none"
                value={loginId}
                onChangeText={setLoginId}
              />
            </View>

            <View style={styles.inputContainer}>
              <Text style={styles.label}>Password</Text>
              <View style={styles.passwordWrapper}>
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="••••••••"
                  placeholderTextColor="#A6AFBD"
                  secureTextEntry={!showPassword}
                  value={password}
                  onChangeText={setPassword}
                />
                <TouchableOpacity
                  style={styles.eyeIcon}
                  onPress={() => setShowPassword(!showPassword)}
                >
                  <Ionicons 
                    name={showPassword ? "eye-off-outline" : "eye-outline"} 
                    size={22} 
                    color={MIST} 
                  />
                </TouchableOpacity>
              </View>
            </View>

            <TouchableOpacity style={styles.forgotBtn} onPress={() => navigation.navigate('ForgotPassword')}>
              <Text style={styles.forgotText}>Forgot password?</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.loginBtn} activeOpacity={0.9} onPress={handleLogin} disabled={loading}>
              <LinearGradient
                colors={[CLAY, GOLD]}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.loginBtnGradient}
              >
                <Text style={styles.loginText}>{loading ? 'Signing In...' : 'Sign In'}</Text>
              </LinearGradient>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

export const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: BG },
  keyboardView: { flex: 1 },
  content: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 28,
  },
  logoWrap: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 22,
    height: 108,
  },
  pulseRing: {
    position: 'absolute',
    width: 96,
    height: 96,
    borderRadius: 48,
    borderWidth: 2,
    borderColor: CLAY,
  },
  spinRing: {
    position: 'absolute',
    width: 92,
    height: 92,
    borderRadius: 46,
  },
  spinRingGradient: {
    flex: 1,
    borderRadius: 46,
    padding: 2,
  },
  logoCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: CARD,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    borderWidth: 3,
    borderColor: CARD,
    shadowColor: CLAY,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 6,
  },
  logoImage: {
    width: '70%',
    height: '70%',
  },
  title: {
    fontSize: 30,
    fontWeight: '700',
    color: INK,
    textAlign: 'center',
    marginBottom: 8,
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 15,
    color: MIST,
    textAlign: 'center',
    marginBottom: 34,
  },
  form: {
    width: '100%',
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: BORDER,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
  },
  inputContainer: {
    marginBottom: 18,
  },
  label: {
    color: MIST,
    fontSize: 13,
    marginBottom: 8,
    fontWeight: '600',
  },
  input: {
    backgroundColor: FIELD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
    padding: 16,
    color: INK,
    fontSize: 16,
  },
  passwordWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: FIELD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 12,
  },
  passwordInput: {
    flex: 1,
    borderWidth: 0,
    backgroundColor: 'transparent',
  },
  eyeIcon: {
    padding: 16,
  },
  forgotBtn: {
    alignSelf: 'flex-end',
    marginBottom: 24,
  },
  forgotText: {
    color: TEAL,
    fontSize: 14,
    fontWeight: '700',
  },
  loginBtn: {
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: CLAY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.28,
    shadowRadius: 15,
    elevation: 8,
  },
  loginBtnGradient: {
    paddingVertical: 18,
    alignItems: 'center',
  },
  loginText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 1,
  },
});
