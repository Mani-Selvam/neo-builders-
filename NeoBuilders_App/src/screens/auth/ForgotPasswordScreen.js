import React, { useEffect, useRef, useState } from 'react';
import {
  View,
  Text,
  SafeAreaView,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
  Dimensions,
  StyleSheet,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { FloatingBlob, styles as loginStyles } from './LoginScreen';

const { width } = Dimensions.get('window');

const BG = '#F7F3EC';
const CLAY = '#E0693E';
const GOLD = '#E7A94C';

export default function ForgotPasswordScreen({ navigation }) {
  const [step, setStep] = useState(1);
  const [loginId, setLoginId] = useState('');
  const [otp, setOtp] = useState('');
  const [resetToken, setResetToken] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  const formOpacity = useRef(new Animated.Value(0)).current;
  const formTranslate = useRef(new Animated.Value(16)).current;

  useEffect(() => {
    Animated.timing(formOpacity, {
      toValue: 1,
      duration: 600,
      delay: 100,
      useNativeDriver: true,
    }).start();
    Animated.timing(formTranslate, {
      toValue: 0,
      duration: 600,
      delay: 100,
      easing: Easing.out(Easing.cubic),
      useNativeDriver: true,
    }).start();
  }, [step]); // Re-animate slightly on step change if desired, or keep static

  const getBaseURL = () => process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.101:8001/api';

  const handleSendOtp = async () => {
    if (!loginId) {
      Alert.alert('Error', 'Please enter your email or mobile number');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getBaseURL()}/v1/employee-auth/forgot-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId })
      });
      const data = await response.json();
      
      if (data.success) {
        setStep(2);
      } else {
        Alert.alert('Error', data.message || 'Could not send OTP');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async () => {
    if (!otp) {
      Alert.alert('Error', 'Please enter the OTP');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getBaseURL()}/v1/employee-auth/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, otp })
      });
      const data = await response.json();
      
      if (data.success) {
        setResetToken(data.data.resetToken);
        setStep(3);
      } else {
        Alert.alert('Error', data.message || 'Invalid OTP');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  const handleReset = async () => {
    if (!newPassword) {
      Alert.alert('Error', 'Please enter a new password');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`${getBaseURL()}/v1/employee-auth/reset-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ loginId, resetToken, newPassword })
      });
      const data = await response.json();
      
      if (data.success) {
        Alert.alert('Success', data.message, [
          { text: 'OK', onPress: () => navigation.navigate('Login') }
        ]);
      } else {
        Alert.alert('Reset Failed', data.message || 'Could not reset password');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not connect to the server');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={loginStyles.container}>
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
      </View>

      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={loginStyles.keyboardView}
      >
        <View style={loginStyles.content}>
          <Text style={loginStyles.title}>Reset Password</Text>
          
          <Animated.View
            style={[
              loginStyles.form,
              { opacity: formOpacity, transform: [{ translateY: formTranslate }] },
            ]}
          >
            {step === 1 && (
              <>
                <Text style={loginStyles.subtitle}>Enter your email or mobile to receive an OTP</Text>
                <View style={loginStyles.inputContainer}>
                  <Text style={loginStyles.label}>Email or Mobile Number</Text>
                  <TextInput
                    style={loginStyles.input}
                    placeholder="Email or Mobile Number"
                    placeholderTextColor="#A6AFBD"
                    autoCapitalize="none"
                    value={loginId}
                    onChangeText={setLoginId}
                  />
                </View>

                <TouchableOpacity style={loginStyles.loginBtn} activeOpacity={0.9} onPress={handleSendOtp} disabled={loading}>
                  <LinearGradient
                    colors={[CLAY, GOLD]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={loginStyles.loginBtnGradient}
                  >
                    <Text style={loginStyles.loginText}>{loading ? 'Sending...' : 'Send OTP'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {step === 2 && (
              <>
                <Text style={loginStyles.subtitle}>Enter the 6-digit OTP sent to {loginId}</Text>
                <View style={loginStyles.inputContainer}>
                  <Text style={loginStyles.label}>One-Time Password</Text>
                  <TextInput
                    style={loginStyles.input}
                    placeholder="123456"
                    placeholderTextColor="#A6AFBD"
                    keyboardType="number-pad"
                    maxLength={6}
                    value={otp}
                    onChangeText={setOtp}
                  />
                </View>

                <TouchableOpacity style={loginStyles.loginBtn} activeOpacity={0.9} onPress={handleVerifyOtp} disabled={loading}>
                  <LinearGradient
                    colors={[CLAY, GOLD]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={loginStyles.loginBtnGradient}
                  >
                    <Text style={loginStyles.loginText}>{loading ? 'Verifying...' : 'Verify OTP'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}

            {step === 3 && (
              <>
                <Text style={loginStyles.subtitle}>Please enter your new password</Text>
                <View style={loginStyles.inputContainer}>
                  <Text style={loginStyles.label}>New Password</Text>
                  <View style={loginStyles.passwordWrapper}>
                    <TextInput
                      style={[loginStyles.input, loginStyles.passwordInput]}
                      placeholder="••••••••"
                      placeholderTextColor="#A6AFBD"
                      secureTextEntry={!showNewPassword}
                      value={newPassword}
                      onChangeText={setNewPassword}
                    />
                    <TouchableOpacity
                      style={loginStyles.eyeIcon}
                      onPress={() => setShowNewPassword(!showNewPassword)}
                    >
                      <Ionicons 
                        name={showNewPassword ? "eye-off-outline" : "eye-outline"} 
                        size={22} 
                        color="#8A7C68" 
                      />
                    </TouchableOpacity>
                  </View>
                </View>

                <TouchableOpacity style={loginStyles.loginBtn} activeOpacity={0.9} onPress={handleReset} disabled={loading}>
                  <LinearGradient
                    colors={[CLAY, GOLD]}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 0 }}
                    style={loginStyles.loginBtnGradient}
                  >
                    <Text style={loginStyles.loginText}>{loading ? 'Resetting...' : 'Change Password'}</Text>
                  </LinearGradient>
                </TouchableOpacity>
              </>
            )}
            
            <TouchableOpacity 
              style={{ alignSelf: 'center', marginTop: 24 }} 
              onPress={() => navigation.navigate('Login')}
            >
              <Text style={loginStyles.forgotText}>Back to Login</Text>
            </TouchableOpacity>
          </Animated.View>
        </View>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}
