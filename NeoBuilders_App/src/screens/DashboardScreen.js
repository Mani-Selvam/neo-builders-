import React from 'react';
import { View, Text, StyleSheet, SafeAreaView, TouchableOpacity } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';

const BG = '#F7F3EC';
const CARD = '#FFFEFB';
const INK = '#241C14';
const MIST = '#8A7C68';
const CLAY = '#E0693E';
const TEAL = '#1F6F6B';

export default function DashboardScreen({ route, navigation }) {
  const { employee, company } = route.params || {};

  return (
    <View style={styles.container}>
      <LinearGradient colors={[BG, '#F1EADD']} style={StyleSheet.absoluteFill} />
      
      <View style={styles.content}>
        <View style={styles.headerCard}>
          <Text style={styles.welcomeText}>Welcome back,</Text>
          <Text style={styles.nameText}>{employee?.empName || 'Employee'}</Text>
          <View style={styles.divider} />
          <Text style={styles.companyLabel}>Company</Text>
          <Text style={styles.companyName}>{company?.companyName || 'Unknown Company'}</Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  headerCard: {
    backgroundColor: CARD,
    borderRadius: 20,
    padding: 32,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.06,
    shadowRadius: 24,
    elevation: 3,
    alignItems: 'center',
  },
  welcomeText: {
    fontSize: 16,
    color: MIST,
    marginBottom: 8,
  },
  nameText: {
    fontSize: 28,
    fontWeight: '700',
    color: INK,
    marginBottom: 24,
    textAlign: 'center',
  },
  divider: {
    height: 1,
    width: '100%',
    backgroundColor: '#E7DDCC',
    marginBottom: 24,
  },
  companyLabel: {
    fontSize: 14,
    color: MIST,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginBottom: 8,
  },
  companyName: {
    fontSize: 22,
    fontWeight: '600',
    color: TEAL,
    textAlign: 'center',
  },
  logoutBtn: {
    marginTop: 40,
    paddingVertical: 16,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: CLAY,
    alignItems: 'center',
  },
  logoutText: {
    color: CLAY,
    fontSize: 16,
    fontWeight: '600',
  }
});
