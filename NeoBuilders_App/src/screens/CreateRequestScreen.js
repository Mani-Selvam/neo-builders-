import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, TextInput, Alert, Modal, FlatList, ActivityIndicator, TouchableWithoutFeedback, Platform } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Calendar } from 'react-native-calendars';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { LinearGradient } from 'expo-linear-gradient';
import AsyncStorage from '@react-native-async-storage/async-storage';

const BG = '#F7F3EC';
const CARD = '#FFFEFB';
const INK = '#241C14';
const MIST = '#8A7C68';
const CLAY = '#E0693E';
const TEAL = '#1F6F6B';
const BORDER = '#E7DDCC';

export default function CreateRequestScreen({ navigation, route }) {
  const editItem = route?.params?.editItem;
  const [site, setSite] = useState(null);
  const [priority, setPriority] = useState('Medium');
  const [requiredDate, setRequiredDate] = useState('');
  const [dateObj, setDateObj] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [purpose, setPurpose] = useState('');
  const [material, setMaterial] = useState('');
  const [files, setFiles] = useState([]);

  const [sitesList, setSitesList] = useState([]);
  const [isSiteModalVisible, setSiteModalVisible] = useState(false);
  const [loadingSites, setLoadingSites] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  // Use current date formatted
  const currentDate = new Date().toLocaleString('en-GB', {
    day: '2-digit', month: '2-digit', year: 'numeric',
    hour: '2-digit', minute: '2-digit'
  }).replace(',', '');

  const baseURL = process.env.EXPO_PUBLIC_API_URL || 'http://192.168.1.101:8001/api';

  useEffect(() => {
    fetchSites();
    if (editItem) {
      setPriority(editItem.priority || 'Medium');
      setRequiredDate(editItem.requiredDate || '');
      setPurpose(editItem.purpose || '');
      setMaterial(editItem.material || '');
      if (editItem.siteTypeId) {
        setSite(editItem.siteTypeId);
      }
    }
  }, [editItem]);

  const onDateChange = (day) => {
    const d = String(day.day).padStart(2, '0');
    const m = String(day.month).padStart(2, '0');
    const y = day.year;
    
    setRequiredDate(`${d}-${m}-${y}`);
    setDateObj(new Date(day.timestamp));
    setShowDatePicker(false);
  };

  const fetchSites = async () => {
    setLoadingSites(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const response = await fetch(`${baseURL}/v1/site-types/all?t=${Date.now()}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Cache-Control': 'no-cache'
        }
      });
      const data = await response.json();
      if (data.success) {
        setSitesList(data.data);
        // Auto-select if there is exactly one site assigned to the employee
        if (data.data && data.data.length === 1) {
          setSite(data.data[0]);
        }
      }
    } catch (err) {
      console.log('Failed to fetch sites', err);
    } finally {
      setLoadingSites(false);
    }
  };

  const handlePickFile = async () => {
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        multiple: true,
      });
      if (!result.canceled && result.assets) {
        setFiles(prev => [...prev, ...result.assets]);
      }
    } catch (err) {
      console.log('Document picking failed', err);
    }
  };

  const handleTakePhoto = async () => {
    const permissionResult = await ImagePicker.requestCameraPermissionsAsync();
    
    if (permissionResult.granted === false) {
      Alert.alert("Permission Required", "You've refused to allow this app to access your camera!");
      return;
    }
    
    const result = await ImagePicker.launchCameraAsync({
      mediaTypes: ImagePicker.MediaTypeOptions.Images,
      allowsEditing: true,
      quality: 0.8,
    });
    
    if (!result.canceled && result.assets) {
      const newFiles = result.assets.map(asset => ({
        uri: asset.uri,
        name: asset.fileName || `photo_${Date.now()}.jpg`,
        mimeType: asset.mimeType || 'image/jpeg',
      }));
      setFiles(prev => [...prev, ...newFiles]);
    }
  };

  const handleSubmit = async () => {
    if (!site || !requiredDate || !purpose || !material) {
      Alert.alert('Error', 'Please fill all required (*) fields.');
      return;
    }

    setSubmitting(true);
    try {
      const token = await AsyncStorage.getItem('accessToken');
      const employeeDataStr = await AsyncStorage.getItem('employeeData');
      const employee = JSON.parse(employeeDataStr);

      let uploadedFileUrls = [];
      if (files.length > 0) {
        const formData = new FormData();
        files.forEach((file) => {
          formData.append('files', {
            uri: file.uri,
            name: file.name,
            type: file.mimeType || 'application/octet-stream',
          });
        });

        const uploadRes = await fetch(`${baseURL}/v1/upload-attachment`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${token}`
          },
          body: formData
        });
        const uploadData = await uploadRes.json();
        if (uploadData.status === 'success') {
          uploadedFileUrls = uploadData.data.fileUrls;
        }
      }

      const requestBody = {
        siteTypeId: site._id,
        priority,
        requiredDate,
        purpose,
        material,
        photos: uploadedFileUrls,
        createdBy: employee.id || employee._id
      };

      let method = 'POST';
      let url = `${baseURL}/v1/material-requests`;
      if (editItem) {
        method = 'PUT';
        url = `${baseURL}/v1/material-requests/${editItem._id || editItem.id}`;
      }

      const response = await fetch(url, {
        method: method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(requestBody)
      });

      const data = await response.json();
      if (data.success) {
        Alert.alert('Success', `Request ${editItem ? 'updated' : 'created'} successfully!`, [
          { text: 'OK', onPress: () => navigation.goBack() }
        ]);
      } else {
        Alert.alert('Error', data.message || 'Failed to create request');
      }
    } catch (err) {
      Alert.alert('Network Error', 'Could not submit request');
      console.log(err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerLeft}>
          <TouchableOpacity style={styles.backButton} onPress={() => navigation.goBack()}>
            <Ionicons name="arrow-back" size={24} color={INK} />
          </TouchableOpacity>
          <Text style={styles.title}>{editItem ? 'Edit Request' : 'Create Request'}</Text>
        </View>
        <Text style={styles.headerDate}>{currentDate}</Text>
      </View>

      <KeyboardAwareScrollView 
        style={styles.content} 
        contentContainerStyle={styles.scrollContent}
        enableOnAndroid={true}
        extraScrollHeight={20}
        keyboardShouldPersistTaps="handled"
      >

        {/* Site */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Site Type*</Text>
          <TouchableOpacity
            style={styles.dropdown}
            onPress={() => {
              fetchSites();
              setSiteModalVisible(true);
            }}
          >
            <Text style={[styles.dropdownText, !site && { color: MIST }]}>
              {site ? site.siteType : 'Select Site Type'}
            </Text>
            <Ionicons name="chevron-down" size={20} color={MIST} />
          </TouchableOpacity>
        </View>

        {/* Priority */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Priority*</Text>
          <View style={styles.priorityGroup}>
            {['High', 'Medium', 'Low'].map(level => (
              <TouchableOpacity
                key={level}
                style={[
                  styles.priorityBtn,
                  priority === level && styles.priorityBtnActive,
                  priority === level && level === 'High' && { backgroundColor: '#FEE2E2', borderColor: '#EF4444' },
                  priority === level && level === 'Medium' && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
                  priority === level && level === 'Low' && { backgroundColor: '#D1FAE5', borderColor: '#10B981' }
                ]}
                onPress={() => setPriority(level)}
              >
                <Text style={[
                  styles.priorityText,
                  priority === level && level === 'High' && { color: '#B91C1C' },
                  priority === level && level === 'Medium' && { color: '#B45309' },
                  priority === level && level === 'Low' && { color: '#047857' }
                ]}>
                  {level}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Required Date */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Required Date*</Text>
          <TouchableOpacity 
            style={styles.dropdown} 
            onPress={() => setShowDatePicker(true)}
          >
            <Text style={[styles.dropdownText, !requiredDate && { color: MIST }]}>
              {requiredDate || 'dd-mm-yyyy'}
            </Text>
            <Ionicons name="calendar-outline" size={20} color={MIST} />
          </TouchableOpacity>
        </View>

        {/* Purpose Of PR */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Purpose Of PR*</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="Enter purpose"
            placeholderTextColor={MIST}
            multiline
            numberOfLines={3}
            value={purpose}
            onChangeText={setPurpose}
          />
        </View>

        {/* Material Required */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Material Required*</Text>
          <TextInput
            style={[styles.input, styles.textArea]}
            placeholder="List materials"
            placeholderTextColor={MIST}
            multiline
            numberOfLines={4}
            value={material}
            onChangeText={setMaterial}
          />
        </View>

        {/* Attach Photos */}
        <View style={styles.fieldGroup}>
          <Text style={styles.label}>Attach Photos & Files</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity style={[styles.attachBtn, { flex: 1 }]} onPress={handlePickFile}>
              <Ionicons name="document-attach-outline" size={20} color={TEAL} style={styles.attachIcon} />
              <Text style={styles.attachBtnText}>Open File</Text>
            </TouchableOpacity>
            
            <TouchableOpacity style={[styles.attachBtn, { flex: 1 }]} onPress={handleTakePhoto}>
              <Ionicons name="camera-outline" size={20} color={TEAL} style={styles.attachIcon} />
              <Text style={styles.attachBtnText}>Take Photo</Text>
            </TouchableOpacity>
          </View>
          {files.map((file, idx) => (
            <View key={idx} style={styles.fileItem}>
              <Ionicons name="image-outline" size={16} color={MIST} />
              <Text style={styles.fileName}>{file.name}</Text>
            </View>
          ))}
        </View>

        <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit} disabled={submitting}>
          <LinearGradient
            colors={submitting ? [MIST, MIST] : [CLAY, '#E7A94C']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.submitGradient}
          >
            {submitting ? (
              <ActivityIndicator color="#FFF" />
            ) : (
              <Text style={styles.submitBtnText}>{submitting ? 'Please wait...' : (editItem ? 'Update Request' : 'Submit Request')}</Text>
            )}
          </LinearGradient>
        </TouchableOpacity>

      </KeyboardAwareScrollView>

      {/* Site Selection Modal */}
      <Modal
        visible={isSiteModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setSiteModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setSiteModalVisible(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Site Type</Text>
                <TouchableOpacity onPress={() => setSiteModalVisible(false)}>
                  <Ionicons name="close" size={24} color={INK} />
                </TouchableOpacity>
              </View>
              {loadingSites ? (
                <ActivityIndicator size="large" color={TEAL} style={{ margin: 20 }} />
              ) : (
                <FlatList
                  data={sitesList}
                  keyExtractor={item => item._id}
                  renderItem={({ item }) => (
                    <TouchableOpacity
                      style={[styles.modalItem, site?._id === item._id && styles.modalItemActive]}
                      onPress={() => {
                        setSite(item);
                        setSiteModalVisible(false);
                      }}
                    >
                      <Text style={[styles.modalItemText, site?._id === item._id && styles.modalItemTextActive]}>
                        {item.siteType}
                      </Text>
                      {site?._id === item._id && <Ionicons name="checkmark" size={20} color={TEAL} />}
                    </TouchableOpacity>
                  )}
                  ListEmptyComponent={<Text style={{ padding: 20, textAlign: 'center', color: MIST }}>No sites available</Text>}
                />
              )}
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>

      {/* Date Selection Modal */}
      <Modal
        visible={showDatePicker}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setShowDatePicker(false)}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPressOut={() => setShowDatePicker(false)}
        >
          <TouchableWithoutFeedback>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Date</Text>
                <TouchableOpacity onPress={() => setShowDatePicker(false)}>
                  <Ionicons name="close" size={24} color={INK} />
                </TouchableOpacity>
              </View>
              <Calendar
                minDate={new Date().toISOString().split('T')[0]}
                onDayPress={onDateChange}
                theme={{
                  selectedDayBackgroundColor: TEAL,
                  todayTextColor: TEAL,
                  arrowColor: TEAL,
                  textDayFontWeight: '500',
                  textMonthFontWeight: 'bold',
                  textDayHeaderFontWeight: '600',
                }}
              />
            </View>
          </TouchableWithoutFeedback>
        </TouchableOpacity>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: BG,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingHorizontal: 20,
    paddingBottom: 20,
    backgroundColor: CARD,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerDate: {
    fontSize: 14,
    color: MIST,
    fontWeight: '500',
  },
  backButton: {
    marginRight: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: '700',
    color: INK,
  },
  content: {
    flex: 1,
  },
  scrollContent: {
    padding: 24,
    paddingBottom: 60,
  },
  fieldGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontWeight: '600',
    color: INK,
    marginBottom: 8,
  },
  readOnlyInput: {
    backgroundColor: '#EBE6DC',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  readOnlyText: {
    fontSize: 15,
    color: MIST,
    fontWeight: '500',
  },
  input: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 15,
    color: INK,
  },
  textArea: {
    minHeight: 80,
    textAlignVertical: 'top',
  },
  priorityGroup: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  priorityBtn: {
    flex: 1,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingVertical: 10,
    alignItems: 'center',
    marginHorizontal: 4,
    backgroundColor: CARD,
  },
  priorityBtnActive: {
    borderColor: TEAL,
    backgroundColor: '#E6F0EF',
  },
  priorityText: {
    fontSize: 14,
    fontWeight: '600',
    color: MIST,
  },
  attachBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: TEAL,
    borderRadius: 8,
    borderStyle: 'dashed',
    paddingVertical: 16,
    backgroundColor: 'rgba(31, 111, 107, 0.05)',
  },
  attachIcon: {
    marginRight: 8,
  },
  attachBtnText: {
    fontSize: 15,
    fontWeight: '600',
    color: TEAL,
  },
  fileItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 8,
    paddingHorizontal: 8,
  },
  fileName: {
    marginLeft: 8,
    fontSize: 13,
    color: MIST,
  },
  submitBtn: {
    marginTop: 20,
    shadowColor: CLAY,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 4,
  },
  submitGradient: {
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  submitBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: '700',
    letterSpacing: 0.5,
  },
  dropdown: {
    backgroundColor: CARD,
    borderWidth: 1,
    borderColor: BORDER,
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdownText: {
    fontSize: 15,
    color: INK,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: CARD,
    borderRadius: 20,
    width: '100%',
    maxHeight: '75%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: BORDER,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: INK,
  },
  modalItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 18,
    paddingHorizontal: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0EBE1',
  },
  modalItemActive: {
    backgroundColor: 'rgba(31, 111, 107, 0.08)',
  },
  modalItemText: {
    fontSize: 16,
    color: INK,
    fontWeight: '500',
  },
  modalItemTextActive: {
    color: TEAL,
    fontWeight: '700',
  }
});
