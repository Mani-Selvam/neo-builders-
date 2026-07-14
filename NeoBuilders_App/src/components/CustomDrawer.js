import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, SafeAreaView, Dimensions, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

const { height } = Dimensions.get('window');

const BG = '#F7F3EC';
const CARD = '#FFFEFB';
const INK = '#241C14';
const MIST = '#8A7C68';
const TEAL = '#1F6F6B';

const MENU_ITEMS = [
  { label: 'HOME', icon: 'home' },
  { label: 'CREATE REQUEST', icon: 'add-circle' },
  { label: 'TRACK REQUEST', icon: 'location' },
  { label: 'UPDATE DELIVERY', icon: 'bus' },
  { label: 'STOCK OVERVIEW', icon: 'cube' },
  { label: 'SITE EXPENSES', icon: 'wallet' },
  { label: 'VIEW EXPENSES', icon: 'document-text' },
  { label: 'DAYBOOK', icon: 'book' },
  { label: 'CHANGE PASSWORD', icon: 'key' },
  { label: 'LOGOUT', icon: 'log-out', isLogout: true },
];

export default function CustomDrawer({ navigation, route, employee, company }) {
  const handlePress = async (item) => {
    if (item.isLogout) {
      const AsyncStorage = require('@react-native-async-storage/async-storage').default;
      await AsyncStorage.removeItem('employeeData');
      await AsyncStorage.removeItem('companyData');
      navigation.reset({ index: 0, routes: [{ name: 'Intro' }] });
    } else if (item.label === 'HOME') {
      navigation.navigate('DashboardHome');
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        
        {/* Profile Header Section */}
        <View style={styles.profileSection}>
          <View style={styles.profileImageCircle}>
            {/* Can replace with Image component later when avatars are added */}
            <Ionicons name="person" size={40} color={TEAL} />
          </View>
          <Text style={styles.profileName}>{employee?.empName || 'Employee'}</Text>
          <Text style={styles.companyName}>{company?.companyName || 'Company'}</Text>
        </View>

        <View style={styles.menuContainer}>
          {MENU_ITEMS.map((item, index) => (
            <TouchableOpacity 
              key={index} 
              style={styles.menuItem}
              onPress={() => handlePress(item)}
              activeOpacity={0.7}
            >
              <View style={styles.iconContainer}>
                <Ionicons name={item.icon} size={22} color={TEAL} />
              </View>
              <Text style={styles.menuText}>{item.label}</Text>
            </TouchableOpacity>
          ))}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: CARD,
  },
  scrollContent: {
    paddingVertical: 24,
  },
  profileSection: {
    alignItems: 'center',
    paddingVertical: 32,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EBDF',
    marginBottom: 10,
  },
  profileImageCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: BG,
    borderWidth: 2,
    borderColor: TEAL,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
    shadowColor: TEAL,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  profileName: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
  },
  companyName: {
    fontSize: 14,
    color: MIST,
    fontWeight: '500',
  },
  menuContainer: {
    paddingHorizontal: 24,
    marginTop: 20,
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 18,
    borderBottomWidth: 1,
    borderBottomColor: '#F1EBDF',
  },
  iconContainer: {
    width: 36,
    alignItems: 'flex-start',
  },
  menuText: {
    fontSize: 14,
    fontWeight: '600',
    color: TEAL,
    letterSpacing: 0.5,
  }
});
