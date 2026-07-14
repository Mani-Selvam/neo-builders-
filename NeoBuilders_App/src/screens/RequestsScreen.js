import React, { useState, useEffect, useRef } from 'react';
import { View, Text, StyleSheet, FlatList, TouchableOpacity, Alert, ActivityIndicator, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useIsFocused } from '@react-navigation/native';

const BG = '#F7F3EC';
const CARD = '#FFFEFB';
const INK = '#241C14';
const MIST = '#8A7C68';
const CLAY = '#E0693E';
const TEAL = '#1F6F6B';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const RequestCard = ({ item, handleCardClick, handleEdit, handleDelete }) => {
  const blinkAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (item.priority === 'High') {
      Animated.loop(
        Animated.sequence([
          Animated.timing(blinkAnim, { toValue: 0.4, duration: 800, useNativeDriver: true }),
          Animated.timing(blinkAnim, { toValue: 1, duration: 800, useNativeDriver: true })
        ])
      ).start();
    }
  }, [item.priority]);

  let siteName = 'Unknown Site';
  if (item.siteTypeId && item.siteTypeId.siteType) {
    siteName = item.siteTypeId.siteType;
  } else if (item.siteTypeId) {
    siteName = item.siteTypeId.toString();
  }

  const dateFormatted = item.createdAt ? new Date(item.createdAt).toLocaleDateString('en-GB') : 'N/A';
  const statusStr = item.status || 'Pending';
  const statusColor = statusStr === 'Approved' ? TEAL : statusStr === 'Rejected' ? CLAY : '#E7A94C';
  const priorityStr = item.priority || 'Medium';
  const priorityColor = priorityStr === 'High' ? CLAY : priorityStr === 'Low' ? '#7E9A98' : '#E7A94C';

  return (
    <AnimatedTouchable 
      style={[styles.card, item.priority === 'High' && { opacity: blinkAnim, borderColor: CLAY, borderWidth: 1.5 }]} 
      activeOpacity={0.8} 
      onPress={() => handleCardClick(item)}
    >
      <View style={styles.cardRow}>
        <View style={[styles.cardIconWrap, { backgroundColor: priorityColor + '1A' }]}>
          <Ionicons name="document-text" size={20} color={priorityColor} />
        </View>
        <View style={styles.cardContent}>
          <View style={styles.cardTop}>
            <View style={styles.cardHeaderLeft}>
              <Text style={styles.siteText}>{siteName}</Text>
              <Text style={styles.dateText}>{dateFormatted}</Text>
            </View>
            <View style={[styles.statusBadge, { backgroundColor: statusColor + '1A' }]}>
              <Text style={[styles.statusText, { color: statusColor }]}>{statusStr}</Text>
            </View>
          </View>
          <Text style={styles.purposeText} numberOfLines={2}>{item.purpose}</Text>
          <View style={styles.cardFooter}>
            <View style={styles.footerInfo}>
              <View style={styles.tagWrap}>
                <Ionicons name="cube-outline" size={12} color={MIST} style={{marginRight: 4}} />
                <Text style={styles.tagText}>{item.material || 'N/A'}</Text>
              </View>
              <View style={[styles.tagWrap, { marginLeft: 12 }]}>
                <Ionicons name="flag" size={12} color={priorityColor} style={{marginRight: 4}} />
                <Text style={[styles.tagText, { color: priorityColor }]}>{priorityStr}</Text>
              </View>
            </View>
            <View style={styles.cardActions}>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(item)}>
                <Ionicons name="pencil" size={16} color={MIST} />
              </TouchableOpacity>
              <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item._id || item.id)}>
                <Ionicons name="trash" size={16} color={CLAY} />
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </AnimatedTouchable>
  );
};

export default function RequestsScreen({ navigation }) {
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const isFocused = useIsFocused();
  const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.101:8001/api';

  useEffect(() => {
    if (isFocused) {
      fetchRequests();
      const interval = setInterval(fetchRequests, 5000);
      return () => clearInterval(interval);
    }
  }, [isFocused]);

  const isFirstLoad = useRef(true);

  const fetchRequests = async () => {
    if (isFirstLoad.current) setLoading(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${baseURL}/v1/material-requests`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      const data = await response.json();
      if (data.success) {
        const sortedData = (data.data || []).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
        setRequests(sortedData);
      } else {
        console.log('API returned false for success:', data.message);
      }
    } catch (err) {
      console.log('Error fetching requests', err);
    } finally {
      if (isFirstLoad.current) {
        setLoading(false);
        isFirstLoad.current = false;
      }
    }
  };
  
  const handleCardClick = (item) => {
    navigation.navigate('DetailedTrackingView', { requestItem: item });
  };

  const handleEdit = (item) => {
    navigation.navigate('CreateRequestForm', { editItem: item });
  };

  const handleDelete = (id) => {
    Alert.alert('Delete Request', 'Are you sure you want to delete this request?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Delete', style: 'destructive', onPress: async () => {
        try {
          const token = await AsyncStorage.getItem('accessToken');
          const res = await fetch(`${baseURL}/v1/material-requests/${id}`, {
            method: 'DELETE',
            headers: { 'Authorization': `Bearer ${token}` }
          });
          const data = await res.json();
          if (data.success) {
            fetchRequests();
          } else {
            Alert.alert('Error', data.message || 'Failed to delete');
          }
        } catch (err) {
          Alert.alert('Error', 'Network error while deleting');
        }
      }}
    ]);
  };

  const renderItem = ({ item }) => (
    <RequestCard 
      item={item} 
      handleCardClick={handleCardClick} 
      handleEdit={handleEdit} 
      handleDelete={handleDelete} 
    />
  );

  return (
    <View style={styles.container}>
      {loading ? (
        <View style={styles.center}>
          <ActivityIndicator size="large" color={TEAL} />
        </View>
      ) : (
        <FlatList
          data={requests}
          renderItem={renderItem}
          keyExtractor={item => item._id || item.id}
          contentContainerStyle={styles.listContent}
          ListHeaderComponent={() => null}
          ListEmptyComponent={() => (
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No requests found.</Text>
            </View>
          )}
        />
      )}

      {/* Floating Action Button */}
      <TouchableOpacity 
        style={styles.fab} 
        activeOpacity={0.85}
        onPress={() => navigation.navigate('CreateRequestForm')}
      >
        <LinearGradient
          colors={[CLAY, '#E7A94C']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.fabGradient}
        >
          <Ionicons name="add" size={32} color="#FFF" />
        </LinearGradient>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  listContent: {
    padding: 20,
    paddingBottom: 100, // Space for FAB
  },
  headerArea: {
    marginBottom: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    color: MIST,
  },
  card: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E7DDCC',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.04,
    shadowRadius: 10,
    elevation: 2,
  },
  cardRow: {
    flexDirection: 'row',
  },
  cardIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 20,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 12,
  },
  cardContent: {
    flex: 1,
  },
  cardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  cardHeaderLeft: {
    flex: 1,
  },
  siteText: {
    fontSize: 16,
    fontWeight: '700',
    color: INK,
    marginBottom: 2,
  },
  dateText: {
    fontSize: 11,
    color: MIST,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  statusText: {
    fontSize: 11,
    fontWeight: '600',
  },
  purposeText: {
    fontSize: 14,
    color: INK,
    lineHeight: 20,
    marginBottom: 12,
  },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  footerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagWrap: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  tagText: {
    fontSize: 12,
    fontWeight: '500',
    color: MIST,
  },
  cardActions: {
    flexDirection: 'row',
  },
  iconButton: {
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  fab: {
    position: 'absolute',
    bottom: 24,
    right: 24,
    shadowColor: CLAY,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.3,
    shadowRadius: 12,
    elevation: 8,
    borderRadius: 28,
  },
  fabGradient: {
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyWrap: {
    paddingVertical: 40,
    alignItems: 'center',
  },
  emptyText: {
    color: MIST,
    fontSize: 16,
  }
});
