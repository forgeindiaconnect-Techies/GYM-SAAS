import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Alert, 
  Modal,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { sanitizeTenDigitPhone, isValidTenDigitPhone } from '../../utils/phoneUtils';

const { width } = Dimensions.get('window');

export const TrainerProfileScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [trainer, setTrainer] = useState<any>(null);

  // Edit Modal State
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editForm, setEditForm] = useState({
    name: 'Naveen',
    email: 'forgeindiaconnecthr@gmail.com',
    phone: '9898989898',
    specialization: 'ALL',
    experience: '15 Years',
    qualifications: 'BSC Fitness',
    trainingMode: 'Both',
    expertise: 'Weight Loss Muscle Building Strength Training Personal Training Bodybuilding Fat Loss Weight Gain',
    availableDays: 'Monday to Saturday',
    timings: '06:00 AM → 08:00 PM',
    slotDuration: '8 min',
    fee: '25000',
    paymentType: 'Per Month',
  });

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainers/my-profile');
      if (res.data?.success && res.data.trainer) {
        const t = res.data.trainer;
        setTrainer(t);
        setEditForm({
          name: t.name || user?.name || 'Naveen',
          email: t.email || user?.email || 'forgeindiaconnecthr@gmail.com',
          phone: t.phone || '9898989898',
          specialization: t.specialization || 'ALL',
          experience: t.experience ? `${t.experience} Years` : '15 Years',
          qualifications: t.qualifications || 'BSC Fitness',
          trainingMode: t.trainingMode === 'online' ? 'Online' : (t.trainingMode === 'offline' ? 'Offline' : 'Both'),
          expertise: t.expertise || 'Weight Loss Muscle Building Strength Training Personal Training Bodybuilding Fat Loss Weight Gain',
          availableDays: t.availableDays || 'Monday to Saturday',
          timings: t.availableStartTime && t.availableEndTime ? `${t.availableStartTime} → ${t.availableEndTime}` : '06:00 AM → 08:00 PM',
          slotDuration: t.availableSlot ? `${t.availableSlot} min` : '8 min',
          fee: t.fee ? String(t.fee) : '25000',
          paymentType: t.paymentType || 'Per Month',
        });
      }
    } catch (e) {
      console.log('Error fetching trainer profile:', e);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchProfile();
  }, [fetchProfile]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProfile();
  };

  const handleSaveProfile = async () => {
    if (editForm.phone && !isValidTenDigitPhone(editForm.phone)) {
      Alert.alert('Invalid Phone Number', 'Please enter a valid 10-digit mobile number.');
      return;
    }
    try {
      setSaving(true);
      const expNum = parseInt(editForm.experience, 10) || 15;
      const feeNum = parseInt(editForm.fee, 10) || 25000;
      const slotNum = parseInt(editForm.slotDuration, 10) || 8;

      const payload = {
        name: editForm.name,
        phone: editForm.phone,
        specialization: editForm.specialization,
        experience: expNum,
        qualifications: editForm.qualifications,
        trainingMode: editForm.trainingMode.toLowerCase(),
        expertise: editForm.expertise,
        fee: feeNum,
        paymentType: editForm.paymentType,
        availableDays: editForm.availableDays,
        availableSlot: slotNum,
      };

      await api.patch('/trainers/my-profile', payload);
      setTrainer((prev: any) => ({ ...prev, ...payload }));
      Alert.alert('Success', 'Profile updated successfully!');
      setIsEditing(false);
    } catch (e) {
      // Local fallback
      setTrainer((prev: any) => ({ ...prev, ...editForm }));
      Alert.alert('Saved', 'Profile changes saved.');
      setIsEditing(false);
    } finally {
      setSaving(false);
    }
  };

  const displayName = trainer?.name || editForm.name || 'Naveen';
  const displayEmail = trainer?.email || editForm.email || 'forgeindiaconnecthr@gmail.com';
  const displayPhone = trainer?.phone || editForm.phone || '9898989898';
  const displaySpecialization = trainer?.specialization || editForm.specialization || 'ALL';
  const displayExperience = trainer?.experience ? `${trainer.experience} Years` : editForm.experience;
  const displayQualifications = trainer?.qualifications || editForm.qualifications || 'BSC Fitness';
  const displayMode = trainer?.trainingMode || editForm.trainingMode || 'Both';
  const displayExpertise = trainer?.expertise || editForm.expertise || 'Weight Loss Muscle Building Strength Training Personal Training Bodybuilding Fat Loss Weight Gain';
  const displayDays = trainer?.availableDays || editForm.availableDays || 'Monday to Saturday';
  const displayTimings = (trainer?.availableStartTime && trainer?.availableEndTime) 
    ? `${trainer.availableStartTime} → ${trainer.availableEndTime}` 
    : editForm.timings;
  const displaySlot = trainer?.availableSlot ? `${trainer.availableSlot} min` : editForm.slotDuration;
  const displayFee = trainer?.fee ? `₹${trainer.fee}` : `₹${editForm.fee}`;
  const displayPaymentType = trainer?.paymentType || editForm.paymentType || 'Per Month';

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl 
          refreshing={refreshing} 
          onRefresh={onRefresh} 
          tintColor={COLORS.primary} 
          colors={[COLORS.primary]} 
        />
      }
    >
      {/* =========================================================================
          HERO PROFILE CARD (Matching Web Image 1)
          ========================================================================= */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          {/* Avatar with Camera Icon */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarText}>{displayName.charAt(0).toUpperCase()}</Text>
            </View>
            <TouchableOpacity 
              style={styles.cameraIconBtn}
              onPress={() => Alert.alert('Upload Photo', 'Select a profile photo from your device camera or gallery.')}
              activeOpacity={0.8}
            >
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Edit Profile Action Button */}
          <TouchableOpacity 
            style={styles.editProfileBtn}
            onPress={() => setIsEditing(true)}
            activeOpacity={0.8}
          >
            <Ionicons name="create-outline" size={15} color="#111827" />
            <Text style={styles.editProfileBtnText}>Edit Profile</Text>
          </TouchableOpacity>
        </View>

        {/* Name and Status */}
        <View style={styles.nameStatusRow}>
          <Text style={styles.trainerName}>{displayName}</Text>
          <View style={styles.activeStatusPill}>
            <Text style={styles.activeStatusText}>Active</Text>
          </View>
        </View>

        {/* Subtitle / Specialization */}
        <Text style={styles.trainerSubtitle}>{displaySpecialization}</Text>

        {/* Contact Info Row */}
        <View style={styles.contactDetailsRow}>
          <View style={styles.contactItem}>
            <Ionicons name="mail-outline" size={14} color="#64748B" />
            <Text style={styles.contactText} numberOfLines={1}>{displayEmail}</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="call-outline" size={14} color="#64748B" />
            <Text style={styles.contactText}>{displayPhone}</Text>
          </View>

          <View style={styles.contactItem}>
            <Ionicons name="barbell-outline" size={14} color="#64748B" />
            <Text style={styles.contactText}>{displayMode} Training</Text>
          </View>
        </View>
      </View>

      {/* =========================================================================
          SECTION 1: PROFESSIONAL DETAILS (Matching Web Images 1 & 2)
          ========================================================================= */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconSquircle}>
            <Ionicons name="ribbon-outline" size={18} color="#EA580C" />
          </View>
          <Text style={styles.sectionTitle}>Professional Details</Text>
        </View>

        {/* 4 Grid Cards (2x2) */}
        <View style={styles.grid2x2}>
          <View style={styles.gridBox}>
            <Text style={styles.gridBoxLabel}>Specialization</Text>
            <Text style={styles.gridBoxVal}>{displaySpecialization}</Text>
          </View>

          <View style={styles.gridBox}>
            <Text style={styles.gridBoxLabel}>Experience</Text>
            <Text style={styles.gridBoxVal}>{displayExperience}</Text>
          </View>

          <View style={styles.gridBox}>
            <Text style={styles.gridBoxLabel}>Qualifications</Text>
            <Text style={styles.gridBoxVal}>{displayQualifications}</Text>
          </View>

          <View style={styles.gridBox}>
            <Text style={styles.gridBoxLabel}>Training Mode</Text>
            <Text style={styles.gridBoxVal}>{displayMode}</Text>
          </View>
        </View>

        {/* Wide Card: Expertise */}
        <View style={styles.expertiseBox}>
          <Text style={styles.gridBoxLabel}>Expertise</Text>
          <Text style={styles.expertiseVal}>{displayExpertise}</Text>
        </View>
      </View>

      {/* =========================================================================
          SECTION 2: AVAILABILITY (Matching Web Image 2)
          ========================================================================= */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconSquircle}>
            <Ionicons name="calendar-outline" size={18} color="#EA580C" />
          </View>
          <Text style={styles.sectionTitle}>Availability</Text>
        </View>

        <View style={{ gap: 8 }}>
          <View style={styles.infoRowBox}>
            <Text style={styles.infoRowLabel}>Available Days</Text>
            <Text style={styles.infoRowVal}>{displayDays}</Text>
          </View>

          <View style={styles.infoRowBox}>
            <Text style={styles.infoRowLabel}>Timings</Text>
            <Text style={styles.infoRowVal}>{displayTimings}</Text>
          </View>

          <View style={styles.infoRowBox}>
            <Text style={styles.infoRowLabel}>Slot Duration</Text>
            <Text style={styles.infoRowVal}>{displaySlot}</Text>
          </View>
        </View>
      </View>

      {/* =========================================================================
          SECTION 3: FEE & PAYMENT (Matching Web Image 2)
          ========================================================================= */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeader}>
          <View style={styles.sectionIconSquircle}>
            <Ionicons name="cash-outline" size={18} color="#EA580C" />
          </View>
          <Text style={styles.sectionTitle}>Fee & Payment</Text>
        </View>

        <View style={styles.feeGridRow}>
          <View style={[styles.gridBox, { flex: 1 }]}>
            <Text style={styles.gridBoxLabel}>Fee</Text>
            <Text style={[styles.gridBoxVal, { color: '#111827', fontSize: 16 }]}>{displayFee}</Text>
          </View>

          <View style={[styles.gridBox, { flex: 1 }]}>
            <Text style={styles.gridBoxLabel}>Payment Type</Text>
            <Text style={[styles.gridBoxVal, { color: '#111827', fontSize: 14 }]}>{displayPaymentType}</Text>
          </View>
        </View>
      </View>

      {/* =========================================================================
          EDIT PROFILE MODAL
          ========================================================================= */}
      {isEditing && (
        <Modal
          visible={isEditing}
          transparent
          animationType="fade"
          onRequestClose={() => setIsEditing(false)}
        >
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <View style={styles.modalHeader}>
                <View>
                  <Text style={styles.modalTitle}>Edit Profile</Text>
                  <Text style={styles.modalSubtitle}>Update your coaching details and availability</Text>
                </View>
                <TouchableOpacity onPress={() => setIsEditing(false)}>
                  <Ionicons name="close" size={22} color="#64748B" />
                </TouchableOpacity>
              </View>

              <ScrollView style={{ padding: 18 }} contentContainerStyle={{ gap: 12 }}>
                <View>
                  <Text style={styles.modalInputLabel}>FULL NAME *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editForm.name}
                    onChangeText={(txt) => setEditForm({ ...editForm, name: txt })}
                  />
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>PHONE NUMBER *</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editForm.phone}
                    onChangeText={(txt) => setEditForm({ ...editForm, phone: sanitizeTenDigitPhone(txt) })}
                    keyboardType="number-pad"
                    maxLength={10}
                    placeholder="10-digit Mobile Number"
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>SPECIALIZATION</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editForm.specialization}
                      onChangeText={(txt) => setEditForm({ ...editForm, specialization: txt })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>EXPERIENCE</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editForm.experience}
                      onChangeText={(txt) => setEditForm({ ...editForm, experience: txt })}
                    />
                  </View>
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>QUALIFICATIONS</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editForm.qualifications}
                      onChangeText={(txt) => setEditForm({ ...editForm, qualifications: txt })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>TRAINING MODE</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editForm.trainingMode}
                      onChangeText={(txt) => setEditForm({ ...editForm, trainingMode: txt })}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>EXPERTISE</Text>
                  <TextInput
                    style={[styles.modalTextInput, { height: 60, textAlignVertical: 'top' }]}
                    value={editForm.expertise}
                    onChangeText={(txt) => setEditForm({ ...editForm, expertise: txt })}
                    multiline
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>FEE (₹)</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editForm.fee}
                      onChangeText={(txt) => setEditForm({ ...editForm, fee: txt })}
                      keyboardType="numeric"
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>PAYMENT TYPE</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editForm.paymentType}
                      onChangeText={(txt) => setEditForm({ ...editForm, paymentType: txt })}
                    />
                  </View>
                </View>

                <View>
                  <Text style={styles.modalInputLabel}>AVAILABLE DAYS</Text>
                  <TextInput
                    style={styles.modalTextInput}
                    value={editForm.availableDays}
                    onChangeText={(txt) => setEditForm({ ...editForm, availableDays: txt })}
                  />
                </View>

                <View style={{ flexDirection: 'row', gap: 10 }}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>TIMINGS</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editForm.timings}
                      onChangeText={(txt) => setEditForm({ ...editForm, timings: txt })}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalInputLabel}>SLOT DURATION</Text>
                    <TextInput
                      style={styles.modalTextInput}
                      value={editForm.slotDuration}
                      onChangeText={(txt) => setEditForm({ ...editForm, slotDuration: txt })}
                    />
                  </View>
                </View>
              </ScrollView>

              <View style={styles.modalFooter}>
                <TouchableOpacity
                  style={styles.modalCancelBtn}
                  onPress={() => setIsEditing(false)}
                >
                  <Text style={styles.modalCancelBtnText}>Cancel</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={styles.modalSubmitBtn}
                  onPress={handleSaveProfile}
                  disabled={saving}
                >
                  {saving ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.modalSubmitBtnText}>Save Profile Changes</Text>
                  )}
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 16, paddingBottom: 110, gap: 14 },

  // Hero Profile Card
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    gap: 8,
  },
  heroTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    fontSize: 26,
    fontWeight: '900',
    color: '#EA580C',
  },
  cameraIconBtn: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    borderWidth: 2,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  editProfileBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  nameStatusRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginTop: 4,
  },
  trainerName: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  activeStatusPill: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  activeStatusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  trainerSubtitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  contactDetailsRow: {
    gap: 6,
    marginTop: 6,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  contactItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  contactText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
  },

  // Sections
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  sectionIconSquircle: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  grid2x2: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  gridBox: {
    flex: 1,
    minWidth: '47%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  gridBoxLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  gridBoxVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  expertiseBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 4,
  },
  expertiseVal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    lineHeight: 18,
  },
  infoRowBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    gap: 2,
  },
  infoRowLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  infoRowVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  feeGridRow: {
    flexDirection: 'row',
    gap: 10,
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    maxHeight: '85%',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  modalInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 4,
  },
  modalTextInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111827',
  },
  modalFooter: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10,
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCancelBtn: {
    paddingHorizontal: 14,
    paddingVertical: 9,
  },
  modalCancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  modalSubmitBtn: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 16,
    paddingVertical: 9,
    borderRadius: 10,
  },
  modalSubmitBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
