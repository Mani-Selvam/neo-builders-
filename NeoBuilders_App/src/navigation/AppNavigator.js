import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';

import IntroScreen from '../screens/IntroScreen';
import OnboardingScreen from '../screens/OnboardingScreen';
import LoginScreen from '../screens/auth/LoginScreen';
import ForgotPasswordScreen from '../screens/auth/ForgotPasswordScreen';
import DashboardNavigator from './DashboardNavigator';
import CreateRequestScreen from '../screens/CreateRequestScreen';
import DetailedTrackingViewScreen from '../screens/DetailedTrackingViewScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  return (
    <NavigationContainer>
      <Stack.Navigator screenOptions={{ headerShown: false }} initialRouteName="Intro">
        <Stack.Screen name="Intro" component={IntroScreen} />
        <Stack.Screen name="Onboarding" component={OnboardingScreen} />
        <Stack.Screen name="Login" component={LoginScreen} />
        <Stack.Screen name="ForgotPassword" component={ForgotPasswordScreen} />
        <Stack.Screen name="Dashboard" component={DashboardNavigator} />
        <Stack.Screen name="CreateRequestForm" component={CreateRequestScreen} />
        <Stack.Screen 
          name="DetailedTrackingView" 
          component={DetailedTrackingViewScreen} 
          options={{ animation: 'slide_from_right' }} 
        />
      </Stack.Navigator>
    </NavigationContainer>
  );
}
