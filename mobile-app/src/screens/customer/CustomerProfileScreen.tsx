import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
  Platform,
  Image,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { sanitizeTenDigitPhone, isValidTenDigitPhone, sanitizeSixDigitPinCode, isValidSixDigitPinCode } from '../../utils/phoneUtils';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

// Default Fallback Data strictly matching Web Image 1
const DEFAULT_PROFILE = {
  firstName: 'Renugopal',
  lastName: 'Y',
  email: 'renugopal5457@gmail.com',
  mobile: '9877899877',
  city: 'Krishnagiri',
  pinCode: '635002',
  gender: 'Male',
  height: '180',
  weight: '85',
  emergencyContact: {
    mobile: '9876556789',
  },
  subscriptionPlan: 'Weight Loss',
  fitnessGoal: 'Weight Loss',
  experienceLevel: 'Beginner',
};

export const CustomerProfileScreen: React.FC = () => {
  const { user: authUser, refreshProfile, updateUser } = useAuth();

  const [user, setUser] = useState<any>({
    ...DEFAULT_PROFILE,
    profilePhoto: authUser?.profilePhoto || undefined,
  });
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Photo Upload States
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);

  // Edit Profile State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>(DEFAULT_PROFILE);
  const [saving, setSaving] = useState(false);

  const resolvePhotoUri = (photo?: string | null): string | null => {
    if (!photo) return null;
    if (photo.startsWith('data:') || photo.startsWith('file:') || photo.startsWith('content:')) {
      return photo;
    }
    if (photo.startsWith('http://') || photo.startsWith('https://')) {
      return photo;
    }
    const baseUrl = api.defaults.baseURL || '';
    const origin = baseUrl.replace(/\/api\/?$/, '');
    const cleanPath = photo.startsWith('/') ? photo : `/${photo}`;
    return `${origin}${cleanPath}`;
  };

  const handleCameraIconPress = () => {
    setShowPhotoOptions(true);
  };

  const handleChooseFromGallery = async () => {
    setShowPhotoOptions(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your photo library to choose a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processAndUploadPhoto(result.assets[0]);
      }
    } catch (error: any) {
      console.warn('Gallery picker error:', error);
      Alert.alert('Error', 'Unable to pick image from gallery. Please try again.');
    }
  };

  const handleTakePhoto = async () => {
    setShowPhotoOptions(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Permission Required',
          'Please allow access to your camera to take a profile picture.'
        );
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        allowsEditing: true,
        aspect: [1, 1],
        quality: 0.7,
        base64: true,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        await processAndUploadPhoto(result.assets[0]);
      }
    } catch (error: any) {
      console.warn('Camera error:', error);
      Alert.alert('Error', 'Unable to capture photo. Please try again.');
    }
  };

  const processAndUploadPhoto = async (asset: ImagePicker.ImagePickerAsset) => {
    const localUri = asset.uri;
    const base64Data = asset.base64 ? `data:image/jpeg;base64,${asset.base64}` : null;
    const immediatePhoto = base64Data || localUri;

    // Immediately update local profile state so user sees it instantly
    setUser((prev: any) => ({
      ...prev,
      profilePhoto: immediatePhoto,
    }));
    if (updateUser) {
      updateUser({ profilePhoto: immediatePhoto });
    }

    setUploadingPhoto(true);
    try {
      const uid = user?._id || user?.id || authUser?._id || authUser?.id;
      let uploadedUrl = '';

      // Upload file via multipart
      try {
        const formData = new FormData();
        const filename = asset.fileName || `profile_${Date.now()}.jpg`;
        const mimeType = asset.mimeType || 'image/jpeg';

        formData.append('photo', {
          uri: Platform.OS === 'android' ? asset.uri : asset.uri.replace('file://', ''),
          name: filename,
          type: mimeType,
        } as any);

        const uploadRes = await api.post('/users/profile-photo', formData, {
          headers: {
            'Content-Type': 'multipart/form-data',
          },
        });

        if (uploadRes.data?.success && uploadRes.data?.profilePhoto) {
          uploadedUrl = uploadRes.data.profilePhoto;
        }
      } catch (uploadErr) {
        console.log('[CustomerProfile] Multipart upload note:', uploadErr);
      }

      const finalPhoto = uploadedUrl || base64Data || localUri;

      // Persist to user record in backend
      if (uid) {
        await api.put(`/users/${uid}`, { profilePhoto: finalPhoto }).catch(() => { });
      }

      if (updateUser) {
        await updateUser({ profilePhoto: finalPhoto });
      }
      if (refreshProfile) {
        refreshProfile().catch(() => { });
      }

      Alert.alert('Success! 🎉', 'Profile picture updated successfully.');
    } catch (err: any) {
      console.warn('[CustomerProfile] Photo upload warning:', err);
      Alert.alert('Notice', 'Profile photo updated locally.');
    } finally {
      setUploadingPhoto(false);
    }
  };

  const fetchProfile = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/auth/me');
      if (res.data?.success && res.data?.user) {
        const u = res.data.user;
        setUser((prev: any) => ({
          ...DEFAULT_PROFILE,
          ...u,
          profilePhoto: u.profilePhoto || prev?.profilePhoto || undefined,
          firstName: u.firstName || (u.name ? u.name.split(' ')[0] : DEFAULT_PROFILE.firstName),
          lastName: u.lastName || (u.name && u.name.split(' ').length > 1 ? u.name.split(' ').slice(1).join(' ') : DEFAULT_PROFILE.lastName),
          email: u.email || DEFAULT_PROFILE.email,
          mobile: u.mobile || u.phone || DEFAULT_PROFILE.mobile,
          city: u.city || DEFAULT_PROFILE.city,
          pinCode: u.pinCode || DEFAULT_PROFILE.pinCode,
          gender: u.gender || DEFAULT_PROFILE.gender,
          height: u.height ? String(u.height) : DEFAULT_PROFILE.height,
          weight: u.weight ? String(u.weight) : DEFAULT_PROFILE.weight,
          emergencyContact: {
            mobile: u.emergencyContact?.mobile || u.emergencyMobile || DEFAULT_PROFILE.emergencyContact.mobile,
          },
          subscriptionPlan: u.subscriptionPlan || DEFAULT_PROFILE.subscriptionPlan,
          fitnessGoal: u.fitnessGoal || DEFAULT_PROFILE.fitnessGoal,
          experienceLevel: u.experienceLevel || DEFAULT_PROFILE.experienceLevel,
        }));
      }
    } catch (err) {
  console.log('[CustomerProfile] Note:', err);
} finally {
  setLoading(false);
  setRefreshing(false);
}
  }, []);

useEffect(() => {
  fetchProfile();
}, [fetchProfile]);

const onRefresh = () => {
  setRefreshing(true);
  fetchProfile();
};

const handleOpenEdit = () => {
  setFormData({
    firstName: user.firstName || '',
    lastName: user.lastName || '',
    mobile: sanitizeTenDigitPhone(user.mobile || ''),
    city: user.city || '',
    pinCode: sanitizeSixDigitPinCode(user.pinCode || ''),
    gender: user.gender || 'Male',
    height: user.height || '180',
    weight: user.weight || '85',
    emergencyMobile: sanitizeTenDigitPhone(user.emergencyContact?.mobile || '9876556789'),
    fitnessGoal: user.fitnessGoal || 'Weight Loss',
    experienceLevel: user.experienceLevel || 'Beginner',
  });
  setIsEditing(true);
};

const handleSaveChanges = async () => {
  if (!formData.firstName.trim()) {
    Alert.alert('Required Field', 'Please enter your first name.');
    return;
  }
  if (formData.mobile && !isValidTenDigitPhone(formData.mobile)) {
    Alert.alert('Invalid Mobile Number', 'Please enter a valid 10-digit mobile number.');
    return;
  }
  if (formData.pinCode.trim() && !isValidSixDigitPinCode(formData.pinCode.trim())) {
    Alert.alert('Invalid PIN Code', 'Please enter a valid 6-digit PIN code.');
    return;
  }
  if (formData.emergencyMobile && !isValidTenDigitPhone(formData.emergencyMobile)) {
    Alert.alert('Invalid Emergency Contact', 'Please enter a valid 10-digit emergency mobile number.');
    return;
  }
  try {
    setSaving(true);
    const uid = user?._id || user?.id || authUser?._id || authUser?.id;
    const payload = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      name: `${formData.firstName.trim()} ${formData.lastName.trim()}`.trim(),
      mobile: formData.mobile.trim(),
      city: formData.city.trim(),
      pinCode: formData.pinCode.trim(),
      gender: formData.gender,
      height: formData.height,
      weight: formData.weight,
      emergencyContact: { mobile: formData.emergencyMobile.trim() },
      fitnessGoal: formData.fitnessGoal,
      experienceLevel: formData.experienceLevel,
    };

    if (uid) {
      await api.put(`/users/${uid}`, payload).catch(() => { });
    }

    setUser((prev: any) => ({
      ...prev,
      ...payload,
    }));

    setIsEditing(false);
    Alert.alert('Success! 🎉', 'Your profile details have been updated successfully.');
  } catch (err: any) {
    Alert.alert('Notice', 'Profile updated locally.');
    setIsEditing(false);
  } finally {
    setSaving(false);
  }
};

const displayName = `${user.firstName || 'Renugopal'} ${user.lastName || 'Y'}`.trim();
const initial = (user.firstName || 'R').charAt(0).toUpperCase();

return (
  <View style={styles.container}>
    <ScrollView
      style={styles.scroll}
      contentContainerStyle={styles.scrollContent}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />}
    >
      {/* ========================================================================= */}
      {/* 1. HERO PROFILE CARD (MATCHING WEB IMAGE 1)                               */}
      {/* ========================================================================= */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          {/* Avatar Circle with Camera Badge */}
          <View style={styles.avatarWrapper}>
            <View style={styles.avatarCircle}>
              <Text style={styles.avatarLetter}>{initial}</Text>
              {user.profilePhoto ? (
                <Image
                  source={{ uri: resolvePhotoUri(user.profilePhoto)! }}
                  style={styles.avatarImage}
                  resizeMode="cover"
                />
              ) : (
                <Text style={styles.avatarLetter}>{initial}</Text>
              )}
              {uploadingPhoto && (
                <View style={styles.avatarLoadingOverlay}>
                  <ActivityIndicator size="small" color="#FFFFFF" />
                </View>
              )}
            </View>
            <TouchableOpacity
              style={styles.cameraBadge}
              activeOpacity={0.8}
              onPress={handleCameraIconPress}
              disabled={uploadingPhoto}
            >
              <Ionicons name="camera" size={13} color="#FFFFFF" />
            </TouchableOpacity>
          </View>

          {/* Name, Plan, & Edit Profile Button */}
          <View style={{ flex: 1 }}>
            <View style={styles.nameActionRow}>
              <View style={{ flex: 1 }}>
                <Text style={styles.userName}>{displayName}</Text>
                <Text style={styles.userPlan}>{user.subscriptionPlan || 'Weight Loss'} Plan</Text>
              </View>

              {/* Edit Profile Button */}
              <TouchableOpacity
                style={styles.editBtn}
                onPress={handleOpenEdit}
                activeOpacity={0.8}
              >
                <Ionicons name="pencil" size={13} color="#111827" />
                <Text style={styles.editBtnText}>Edit Profile</Text>
              </TouchableOpacity>
            </View>

            {/* Contact Meta Info */}
            <View style={styles.contactMetaCol}>
              <View style={styles.metaRow}>
                <Ionicons name="mail-outline" size={14} color="#EA580C" />
                <Text style={styles.metaText}>{user.email || 'renugopal5457@gmail.com'}</Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="call-outline" size={14} color="#EA580C" />
                <Text style={styles.metaText}>{user.mobile || '9877899877'}</Text>
              </View>

              <View style={styles.metaRow}>
                <Ionicons name="location-outline" size={14} color="#EA580C" />
                <Text style={styles.metaText}>
                  {user.city || 'Krishnagiri'}{user.pinCode ? `, ${user.pinCode}` : ', 635002'}
                </Text>
              </View>
            </View>
          </View>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 2. PERSONAL DETAILS CARD                                                  */}
      {/* ========================================================================= */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Personal Details</Text>
        <View style={styles.detailsList}>
          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Gender</Text>
            <Text style={styles.detailValue}>{user.gender || 'Male'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Height</Text>
            <Text style={styles.detailValue}>{user.height ? `${user.height} cm` : '180 cm'}</Text>
          </View>

          <View style={styles.detailItem}>
            <Text style={styles.detailLabel}>Weight</Text>
            <Text style={styles.detailValue}>{user.weight ? `${user.weight} kg` : '85 kg'}</Text>
          </View>

          <View style={[styles.detailItem, { borderBottomWidth: 0 }]}>
            <Text style={styles.detailLabel}>Emergency Contact</Text>
            <Text style={styles.detailValue}>
              {user.emergencyContact?.mobile || '9876556789'}
            </Text>
          </View>
        </View>
      </View>

      {/* ========================================================================= */}
      {/* 3. FITNESS GOALS CARD                                                     */}
      {/* ========================================================================= */}
      <View style={styles.card}>
        <Text style={styles.cardSectionTitle}>Fitness Goals</Text>

        <View style={styles.goalBox}>
          <Text style={styles.goalTag}>CURRENT GOAL</Text>
          <Text style={styles.goalValue}>{user.fitnessGoal || 'Weight Loss'}</Text>
          <Text style={styles.goalHint}>Target set during onboarding.</Text>
        </View>

        <View style={styles.goalBox}>
          <Text style={styles.expTag}>EXPERIENCE LEVEL</Text>
          <Text style={styles.expValue}>{user.experienceLevel || 'Beginner'}</Text>
        </View>
      </View>
    </ScrollView>

    {/* ========================================================================= */}
    {/* 4. EDIT PROFILE MODAL                                                     */}
    {/* ========================================================================= */}
    <Modal visible={isEditing} transparent animationType="slide" onRequestClose={() => setIsEditing(false)}>
      <TouchableOpacity
        style={styles.modalOverlay}
        activeOpacity={1}
        onPress={() => setIsEditing(false)}
      >
        <View style={styles.modalCard}>
          <View style={styles.modalHeader}>
            <Text style={styles.modalTitle}>Edit Profile</Text>
            <TouchableOpacity onPress={() => setIsEditing(false)} style={{ padding: 4 }}>
              <Ionicons name="close" size={20} color="#64748B" />
            </TouchableOpacity>
          </View>

          <ScrollView showsVerticalScrollIndicator={false} style={{ maxHeight: 440 }}>
            <View style={styles.formCol}>
              <View style={styles.formRow2}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.fieldLabel}>First Name</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.firstName}
                    onChangeText={(t) => setFormData({ ...formData, firstName: t })}
                    placeholder="First Name"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.fieldLabel}>Last Name</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.lastName}
                    onChangeText={(t) => setFormData({ ...formData, lastName: t })}
                    placeholder="Last Name"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Mobile Number</Text>
                <TextInput
                  style={styles.fieldInput}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={formData.mobile}
                  onChangeText={(t) => setFormData({ ...formData, mobile: sanitizeTenDigitPhone(t) })}
                  placeholder="10-digit Mobile Number"
                />
              </View>

              <View style={styles.formRow2}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.fieldLabel}>City</Text>
                  <TextInput
                    style={styles.fieldInput}
                    value={formData.city}
                    onChangeText={(t) => setFormData({ ...formData, city: t })}
                    placeholder="City"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.fieldLabel}>Pin Code</Text>
                  <TextInput
                    style={styles.fieldInput}
                    keyboardType="number-pad"
                    maxLength={6}
                    value={formData.pinCode}
                    onChangeText={(t) => setFormData({ ...formData, pinCode: sanitizeSixDigitPinCode(t) })}
                    placeholder="6-digit Pin Code"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Gender</Text>
                <View style={styles.chipsRow}>
                  {['Male', 'Female', 'Other'].map((g) => (
                    <TouchableOpacity
                      key={g}
                      style={[styles.choiceChip, formData.gender === g && styles.choiceChipActive]}
                      onPress={() => setFormData({ ...formData, gender: g })}
                    >
                      <Text style={[styles.choiceChipText, formData.gender === g && styles.choiceChipTextActive]}>
                        {g}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formRow2}>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.fieldLabel}>Height (cm)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    keyboardType="numeric"
                    value={formData.height}
                    onChangeText={(t) => setFormData({ ...formData, height: t })}
                    placeholder="180"
                  />
                </View>
                <View style={styles.formGroupHalf}>
                  <Text style={styles.fieldLabel}>Weight (kg)</Text>
                  <TextInput
                    style={styles.fieldInput}
                    keyboardType="numeric"
                    value={formData.weight}
                    onChangeText={(t) => setFormData({ ...formData, weight: t })}
                    placeholder="85"
                  />
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Emergency Contact</Text>
                <TextInput
                  style={styles.fieldInput}
                  keyboardType="number-pad"
                  maxLength={10}
                  value={formData.emergencyMobile}
                  onChangeText={(t) => setFormData({ ...formData, emergencyMobile: sanitizeTenDigitPhone(t) })}
                  placeholder="10-digit Emergency Contact"
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Fitness Goal</Text>
                <View style={styles.chipsRow}>
                  {['Weight Loss', 'Muscle Gain', 'Strength', 'General Fitness'].map((goal) => (
                    <TouchableOpacity
                      key={goal}
                      style={[styles.choiceChip, formData.fitnessGoal === goal && styles.choiceChipActive]}
                      onPress={() => setFormData({ ...formData, fitnessGoal: goal })}
                    >
                      <Text style={[styles.choiceChipText, formData.fitnessGoal === goal && styles.choiceChipTextActive]}>
                        {goal}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.fieldLabel}>Experience Level</Text>
                <View style={styles.chipsRow}>
                  {['Beginner', 'Intermediate', 'Advanced'].map((lvl) => (
                    <TouchableOpacity
                      key={lvl}
                      style={[styles.choiceChip, formData.experienceLevel === lvl && styles.choiceChipActive]}
                      onPress={() => setFormData({ ...formData, experienceLevel: lvl })}
                    >
                      <Text style={[styles.choiceChipText, formData.experienceLevel === lvl && styles.choiceChipTextActive]}>
                        {lvl}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </ScrollView>

          <View style={styles.modalActionsRow}>
            <TouchableOpacity
              style={styles.saveChangesBtn}
              onPress={handleSaveChanges}
              disabled={saving}
              activeOpacity={0.8}
            >
              {saving ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="save-outline" size={16} color="#FFFFFF" />
                  <Text style={styles.saveChangesBtnText}>Save Changes</Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setIsEditing(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </TouchableOpacity>
    </Modal>

    {/* ========================================================================= */}
    {/* 4. PHOTO PICKER OPTIONS MODAL (GALLERY / TAKE PHOTO)                      */}
    {/* ========================================================================= */}
    <Modal
      visible={showPhotoOptions}
      transparent
      animationType="fade"
      onRequestClose={() => setShowPhotoOptions(false)}
    >
      <TouchableOpacity
        style={styles.photoBackdrop}
        activeOpacity={1}
        onPress={() => setShowPhotoOptions(false)}
      >
        <View style={styles.photoOptionsSheet}>
          <View style={styles.sheetHandle} />
          <Text style={styles.photoOptionsTitle}>Change Profile Photo</Text>
          <Text style={styles.photoOptionsSub}>Select an option to update your photo</Text>

          {/* Choose from Gallery */}
          <TouchableOpacity
            style={styles.photoOptionBtn}
            onPress={handleChooseFromGallery}
            activeOpacity={0.7}
          >
            <View style={[styles.photoOptionIconWrap, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="images-outline" size={22} color="#2563EB" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.photoOptionLabel}>Choose from Gallery</Text>
              <Text style={styles.photoOptionDesc}>Select an existing image from your device library</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Take Photo */}
          <TouchableOpacity
            style={styles.photoOptionBtn}
            onPress={handleTakePhoto}
            activeOpacity={0.7}
          >
            <View style={[styles.photoOptionIconWrap, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="camera-outline" size={22} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.photoOptionLabel}>Take Photo</Text>
              <Text style={styles.photoOptionDesc}>Capture a fresh photo using your camera</Text>
            </View>
            <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
          </TouchableOpacity>

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.photoCancelBtn}
            onPress={() => setShowPhotoOptions(false)}
            activeOpacity={0.7}
          >
            <Text style={styles.photoCancelText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </TouchableOpacity>
    </Modal>
  </View>
);
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  scroll: {
    flex: 1,
  },
  scrollContent: {
    padding: 14,
    paddingBottom: 110,
    gap: 14,
  },
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  avatarWrapper: {
    position: 'relative',
  },
  avatarCircle: {
    width: 68,
    height: 68,
    borderRadius: 34,
    backgroundColor: '#F8FAFC',
    borderWidth: 2,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    borderRadius: 34,
  },
  avatarLoadingOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarLetter: {
    fontSize: 26,
    fontWeight: '900',
    color: '#EA580C',
  },
  cameraBadge: {
    position: 'absolute',
    bottom: -2,
    right: -2,
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },
  nameActionRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  userName: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  userPlan: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
    marginTop: 1,
  },
  editBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 10,
  },
  editBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  contactMetaCol: {
    marginTop: 8,
    gap: 4,
  },
  metaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  metaText: {
    fontSize: 11,
    color: '#64748B',
  },
  card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 2,
  },
  cardSectionTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 8,
  },
  detailsList: {
    gap: 4,
  },
  detailItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 9,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  detailLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  goalBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    gap: 3,
  },
  goalTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  goalValue: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  goalHint: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  expTag: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  expValue: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    gap: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 10,
    elevation: 5,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  formCol: {
    gap: 10,
    paddingTop: 6,
  },
  formRow2: {
    flexDirection: 'row',
    gap: 10,
  },
  formGroupHalf: {
    flex: 1,
    gap: 4,
  },
  formGroup: {
    gap: 4,
  },
  fieldLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: '#111827',
  },
  fieldInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111827',
  },
  chipsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  choiceChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  choiceChipActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  choiceChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  choiceChipTextActive: {
    color: '#FFFFFF',
  },
  modalActionsRow: {
    gap: 8,
    marginTop: 6,
  },
  saveChangesBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  saveChangesBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cancelBtn: {
    alignItems: 'center',
    paddingVertical: 10,
    borderRadius: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cancelBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  photoBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.6)',
    justifyContent: 'flex-end',
  },
  photoOptionsSheet: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 20,
    paddingTop: 12,
    paddingBottom: Platform.OS === 'ios' ? 36 : 24,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: -4 },
    shadowRadius: 12,
    elevation: 10,
  },
  sheetHandle: {
    width: 38,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: 16,
  },
  photoOptionsTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: '#0F172A',
    textAlign: 'center',
  },
  photoOptionsSub: {
    fontSize: 12,
    color: '#64748B',
    textAlign: 'center',
    marginTop: 3,
    marginBottom: 20,
  },
  photoOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
    paddingVertical: 14,
    paddingHorizontal: 16,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  photoOptionIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 22,
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoOptionLabel: {
    fontSize: 14,
    fontWeight: '700',
    color: '#0F172A',
  },
  photoOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  photoCancelBtn: {
    marginTop: 6,
    paddingVertical: 13,
    borderRadius: 14,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  photoCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
