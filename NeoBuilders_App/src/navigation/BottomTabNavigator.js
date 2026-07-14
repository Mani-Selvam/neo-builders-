import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import DashboardScreen from '../screens/DashboardScreen';
import RequestsScreen from '../screens/RequestsScreen';

const Tab = createBottomTabNavigator();

const TEAL = '#1F6F6B';
const MIST = '#8A7C68';
const CARD = '#FFFEFB';

// Placeholder screen for the tabs we haven't built yet
const PlaceholderScreen = ({ route }) => (
  <View style={styles.placeholderContainer}>
    <Text style={styles.placeholderText}>{route.name} Screen</Text>
    <Text style={styles.subText}>Coming soon...</Text>
  </View>
);

export default function BottomTabNavigator({ route }) {
  const { employee, company } = route.params || {};
  const insets = useSafeAreaInsets();
  
  // Calculate padding based on safe area insets to avoid the home gesture bar
  const paddingBottom = Math.max(insets.bottom, 10); // Minimum 10px padding
  const tabHeight = 55 + paddingBottom;

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false, // The top header is handled by the Drawer
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          if (route.name === 'Home') iconName = focused ? 'home' : 'home-outline';
          else if (route.name === 'Requests') iconName = focused ? 'document-text' : 'document-text-outline';
          else if (route.name === 'Delivery') iconName = focused ? 'bus' : 'bus-outline';
          else if (route.name === 'Stock') iconName = focused ? 'cube' : 'cube-outline';

          return <Ionicons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: TEAL,
        tabBarInactiveTintColor: MIST,
        tabBarStyle: {
          backgroundColor: CARD,
          borderTopColor: '#F1EBDF',
          paddingBottom: paddingBottom,
          paddingTop: 8,
          height: tabHeight,
          elevation: 10,
          shadowColor: '#000',
          shadowOffset: { width: 0, height: -2 },
          shadowOpacity: 0.05,
          shadowRadius: 4,
        },
        tabBarLabelStyle: {
          fontSize: 12,
          fontWeight: '500',
          marginTop: 2,
        },
      })}
    >
      <Tab.Screen 
        name="Home" 
        component={DashboardScreen} 
        initialParams={{ employee, company }}
      />
      <Tab.Screen name="Requests" component={RequestsScreen} />
      <Tab.Screen name="Delivery" component={PlaceholderScreen} />
      <Tab.Screen name="Stock" component={PlaceholderScreen} />
    </Tab.Navigator>
  );
}

const styles = StyleSheet.create({
  placeholderContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F7F3EC',
  },
  placeholderText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#241C14',
    marginBottom: 8,
  },
  subText: {
    fontSize: 16,
    color: '#8A7C68',
  }
});
