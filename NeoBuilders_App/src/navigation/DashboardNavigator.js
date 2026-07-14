import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { getFocusedRouteNameFromRoute } from '@react-navigation/native';
import BottomTabNavigator from './BottomTabNavigator';
import CustomDrawer from '../components/CustomDrawer';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const Drawer = createDrawerNavigator();

const INK = '#241C14';
const BG = '#F7F3EC';
const CARD = '#FFFEFB';

export default function DashboardNavigator({ route }) {
  // Pass the initial params from Login (employee, company) to the dashboard screens
  const { employee, company } = route.params || {};

  const getHeaderTitle = (route) => {
    const routeName = getFocusedRouteNameFromRoute(route) ?? 'Home';
    switch (routeName) {
      case 'Home':
        return company?.companyName || 'Dashboard';
      case 'Requests':
        return 'Requests';
      case 'Delivery':
        return 'Delivery';
      case 'Stock':
        return 'Stock';
      default:
        return 'Dashboard';
    }
  };

  return (
    <Drawer.Navigator
      drawerContent={(props) => <CustomDrawer {...props} employee={employee} company={company} />}
      screenOptions={({ navigation }) => ({
        headerStyle: {
          backgroundColor: CARD,
          elevation: 0,
          shadowOpacity: 0,
          borderBottomWidth: 1,
          borderBottomColor: '#F1EBDF',
        },
        headerTitleStyle: {
          color: INK,
          fontSize: 18,
          fontWeight: '600',
        },
        headerTitleAlign: 'center',
        headerLeft: () => (
          <TouchableOpacity 
            style={styles.headerLeftBtn}
            onPress={() => navigation.toggleDrawer()}
          >
            <Ionicons name="menu" size={26} color={INK} />
          </TouchableOpacity>
        ),
        headerRight: () => (
          <TouchableOpacity 
            style={styles.headerRightBtn}
            onPress={() => {
              // Later we can navigate to settings or profile
            }}
          >
            <Ionicons name="person-circle-outline" size={28} color={INK} />
          </TouchableOpacity>
        ),
      })}
    >
      <Drawer.Screen 
        name="DashboardHome" 
        component={BottomTabNavigator} 
        initialParams={{ employee, company }}
        options={({ route }) => ({
          title: getHeaderTitle(route)
        })}
      />
    </Drawer.Navigator>
  );
}

const styles = StyleSheet.create({
  headerLeftBtn: {
    paddingLeft: 20,
    paddingRight: 10,
    paddingVertical: 10,
  },
  headerRightBtn: {
    paddingRight: 20,
    paddingLeft: 10,
    paddingVertical: 10,
  }
});
