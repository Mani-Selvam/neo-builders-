import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, Animated, Image, Linking } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

const BG = '#F7F3EC';
const CARD = '#FFFEFB';
const INK = '#241C14';
const MIST = '#8A7C68';
const CLAY = '#E0693E';
const TEAL = '#1F6F6B';

export default function DetailedTrackingViewScreen({ route, navigation }) {
  const insets = useSafeAreaInsets();
  const { requestItem } = route.params || {};

  if (!requestItem) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>No details found.</Text>
        <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
          <Text style={styles.backText}>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const dateFormatted = requestItem.createdAt 
    ? new Date(requestItem.createdAt).toLocaleDateString('en-GB') 
    : 'N/A';
  
  let siteName = 'Unknown Site';
  if (requestItem.siteTypeId && requestItem.siteTypeId.siteType) {
    siteName = requestItem.siteTypeId.siteType;
  } else if (requestItem.siteTypeId) {
    siteName = requestItem.siteTypeId.toString();
  }

  const status = requestItem.status || 'Pending';

  const timeline = [
    { label: 'Created', active: true, color: TEAL },
    { label: 'Pending Approval', active: status === 'Pending' || status === 'Approved' || status === 'Rejected', color: '#E7A94C' },
    { label: 'Approved', active: status === 'Approved', color: TEAL },
    { label: 'Rejected', active: status === 'Rejected', color: CLAY }
  ].filter(t => t.label !== 'Rejected' || status === 'Rejected'); // only show rejected if actually rejected

  // Filter out approved if rejected
  const finalTimeline = timeline.filter(t => t.label !== 'Approved' || status !== 'Rejected');

  return (
    <View style={styles.container}>
      <View style={[styles.header, { paddingTop: Math.max(insets.top, 20) + 10 }]}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButtonIcon} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={INK} />
          </TouchableOpacity>
          <Text style={styles.title}>Tracking View</Text>
        </View>
        <View style={styles.headerRight}>
          <View style={styles.iconCircle}>
            <Ionicons name="map-outline" size={22} color={TEAL} />
          </View>
        </View>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        <View style={styles.summaryCard}>
          <Text style={styles.siteText}>{siteName}</Text>
          <Text style={styles.dateText}>Created: {dateFormatted}</Text>
          <View style={styles.divider} />
          <View style={styles.row}>
            <Text style={styles.label}>Priority:</Text>
            <Text style={styles.value}>{requestItem.priority || 'Medium'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Required By:</Text>
            <Text style={styles.value}>{requestItem.requiredDate || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Purpose:</Text>
            <Text style={styles.value}>{requestItem.purpose || 'N/A'}</Text>
          </View>
          <View style={styles.row}>
            <Text style={styles.label}>Material:</Text>
            <Text style={styles.value}>{requestItem.material || 'N/A'}</Text>
          </View>
          
          {requestItem.photos && requestItem.photos.length > 0 && (
            <View style={{ marginTop: 8 }}>
              <View style={styles.divider} />
              <Text style={[styles.label, { marginBottom: 12, color: INK, fontWeight: '600' }]}>Attachments</Text>
              <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
                {requestItem.photos.map((photoUrl, index) => {
                  const isImage = /\.(jpg|jpeg|png|gif|webp)$/i.test(photoUrl);
                  const baseURL = process.env.EXPO_PUBLIC_API_URL ? process.env.EXPO_PUBLIC_API_URL.replace('/api', '') : 'http://192.168.1.101:8001';
                  const fullUrl = photoUrl.startsWith('http') ? photoUrl : `${baseURL}${photoUrl.startsWith('/') ? '' : '/'}${photoUrl}`;
                  
                  return (
                    <TouchableOpacity 
                      key={index} 
                      style={styles.attachmentBox}
                      onPress={() => Linking.openURL(fullUrl).catch(err => console.log('Error opening URL:', err))}
                    >
                      {isImage ? (
                        <Image source={{ uri: fullUrl }} style={styles.attachmentImage} resizeMode="cover" />
                      ) : (
                        <View style={styles.attachmentIconContainer}>
                          <Ionicons name="document-attach-outline" size={24} color={TEAL} />
                        </View>
                      )}
                      <Text style={styles.attachmentText} numberOfLines={1} ellipsizeMode="middle">
                        {photoUrl.split('/').pop() || `Attachment ${index + 1}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>
          )}
        </View>

        <Text style={styles.sectionTitle}>Status Timeline</Text>
        <View style={styles.timelineContainer}>
          {finalTimeline.map((step, index) => (
            <View key={index} style={styles.timelineRow}>
              <View style={styles.timelineLeft}>
                <View style={[styles.timelineDot, step.active && { backgroundColor: step.color, borderColor: step.color }]} />
                {index < finalTimeline.length - 1 && (
                  <View style={[styles.timelineLine, step.active && finalTimeline[index+1].active && { backgroundColor: TEAL }]} />
                )}
              </View>
              <View style={styles.timelineRight}>
                <Text style={[styles.timelineLabel, step.active && { color: INK, fontWeight: '600' }]}>
                  {step.label}
                </Text>
              </View>
            </View>
          ))}
        </View>

      </ScrollView>
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
    alignItems: 'center'
  },
  errorText: {
    fontSize: 16,
    color: INK,
    marginBottom: 16
  },
  backText: {
    color: TEAL,
    fontSize: 16,
    fontWeight: '600'
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingBottom: 20,
    backgroundColor: BG,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  backButtonIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#E7DDCC',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 16,
  },
  title: {
    fontSize: 24,
    fontWeight: '700',
    color: INK,
  },
  headerRight: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFEFB',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
    borderWidth: 1,
    borderColor: '#E7DDCC',
  },
  content: {
    padding: 24,
  },
  summaryCard: {
    backgroundColor: CARD,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#101828',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 12,
    elevation: 2,
    marginBottom: 32,
  },
  siteText: {
    fontSize: 20,
    fontWeight: '700',
    color: INK,
    marginBottom: 4,
  },
  dateText: {
    fontSize: 14,
    color: MIST,
    marginBottom: 16,
  },
  divider: {
    height: 1,
    backgroundColor: '#E7DDCC',
    marginBottom: 16,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  label: {
    fontSize: 15,
    color: MIST,
    flex: 1,
  },
  value: {
    fontSize: 15,
    fontWeight: '500',
    color: INK,
    flex: 2,
    textAlign: 'right'
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: INK,
    marginBottom: 20,
  },
  timelineContainer: {
    paddingLeft: 10,
  },
  timelineRow: {
    flexDirection: 'row',
  },
  timelineLeft: {
    alignItems: 'center',
    width: 30,
  },
  timelineDot: {
    width: 16,
    height: 16,
    borderRadius: 8,
    borderWidth: 2,
    borderColor: '#E7DDCC',
    backgroundColor: BG,
  },
  timelineLine: {
    width: 2,
    height: 40,
    backgroundColor: '#E7DDCC',
    marginVertical: 4,
  },
  timelineRight: {
    paddingLeft: 16,
    paddingTop: 0,
  },
  timelineLabel: {
    fontSize: 16,
    color: MIST,
    fontWeight: '400',
  },
  attachmentBox: {
    width: 80,
    alignItems: 'center',
    marginBottom: 8,
  },
  attachmentImage: {
    width: 64,
    height: 64,
    borderRadius: 8,
    marginBottom: 4,
    backgroundColor: '#f0f0f0',
    borderWidth: 1,
    borderColor: '#E7DDCC',
  },
  attachmentIconContainer: {
    width: 64,
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F7F3EC',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 4,
    borderWidth: 1,
    borderColor: '#E7DDCC',
  },
  attachmentText: {
    fontSize: 10,
    color: MIST,
    textAlign: 'center',
    width: '100%',
  }
});
