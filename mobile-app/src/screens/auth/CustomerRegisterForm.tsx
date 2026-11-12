import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';
import { sanitizeTenDigitPhone, isValidTenDigitPhone, sanitizeSixDigitPinCode, isValidSixDigitPinCode } from '../../utils/phoneUtils';

export interface CustomerRegisterFormProps {
  onBackToLogin: () => void;
}

const STEPS = ['Account', 'Personal', 'Fitness', 'Package', 'Consent'];

const FITNESS_GOALS = [
  'Weight Loss', 'Muscle Gain', 'Strength', 'General Fitness',
  'Bodybuilding', 'Yoga', 'CrossFit', 'Personal Training', 'Online Coaching'
];
const EXPERIENCE_LEVELS = ['Beginner', 'Intermediate', 'Advanced'];
const TRAINING_TYPES = ['Offline', 'Online', 'Hybrid'];
const WORKOUT_DAYS = ['1-2 days', '3-4 days', '5-6 days', 'Everyday'];
const WORKOUT_TIMES = [
  'Early Morning (5-7am)', 'Morning (7-9am)', 'Mid Morning (9-11am)',
  'Afternoon (12-3pm)', 'Evening (5-8pm)', 'Night (8-11pm)', 'Flexible'
];
const GENDERS = ['Male', 'Female', 'Other', 'Prefer not to say'];

export const CustomerRegisterForm: React.FC<CustomerRegisterFormProps> = ({ onBackToLogin }) => {
  const { registerCustomer } = useAuth();
  const [step, setStep] = useState(0);

  // Form state
  const [form, setForm] = useState({
    firstName: '',
    lastName: '',
    email: '',
    mobile: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
    dateOfBirth: '',
    gender: 'Male',
    city: '',
    pinCode: '',
    height: '',
    weight: '',
    emergencyContactName: '',
    emergencyContactMobile: '',
    emergencyContactRelation: '',
    fitnessGoal: 'Muscle Gain',
    experienceLevel: 'Beginner',
    preferredTraining: 'Offline',
    preferredWorkoutDays: '3-4 days',
    preferredWorkoutTime: 'Evening (5-8pm)',
    selectedBillingPlan: 'monthly' as 'monthly' | 'annual',
    selectedPackageName: 'Gold Fitness & Gym Access',
    acceptTerms: false,
    acceptPrivacy: false,
  });

  const [showPassword, setShowPassword] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [apiError, setApiError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [gyms, setGyms] = useState<any[]>([]);
  const [selectedGymId, setSelectedGymId] = useState<string>('');

  // Fetch public gyms on mount
  useEffect(() => {
    api.get('/gyms/public')
      .then(res => {
        if (res.data?.gyms && res.data.gyms.length > 0) {
          setGyms(res.data.gyms);
          setSelectedGymId(res.data.gyms[0]._id || res.data.gyms[0].id);
        }
      })
      .catch(() => {
        // Fallback demo gym id
        setGyms([{ _id: 'gym-flagship-1', name: 'Gymora Flagship Arena' }]);
      });
  }, []);

  const updateField = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
    setErrors(prev => {
      const n = { ...prev };
      delete n[field];
      return n;
    });
  };

  const validateStep = (s: number): boolean => {
    const errs: Record<string, string> = {};

    if (s === 0) {
      if (!form.firstName.trim()) errs.firstName = 'First name is required';
      if (!form.lastName.trim()) errs.lastName = 'Last name is required';
      if (!form.email.trim()) errs.email = 'Email address is required';
      else if (!/\S+@\S+\.\S+/.test(form.email)) errs.email = 'Enter a valid email address';
      if (!form.mobile.trim()) errs.mobile = 'Mobile number is required';
      else if (!/^\d{10}$/.test(form.mobile.replace(/\D/g, ''))) errs.mobile = 'Enter a valid 10-digit mobile number';
      if (!form.password) errs.password = 'Password is required';
      else if (form.password.length < 8) errs.password = 'Password must be at least 8 characters';
      if (form.password !== form.confirmPassword) errs.confirmPassword = 'Passwords do not match';
    }

    if (s === 1) {
      if (!form.gender) errs.gender = 'Gender is required';
      if (!form.city.trim()) errs.city = 'City is required';
      if (form.pinCode.trim() && !isValidSixDigitPinCode(form.pinCode.trim())) errs.pinCode = 'Enter a valid 6-digit PIN code';
      if (!form.height.trim()) errs.height = 'Height is required (cm)';
      if (!form.weight.trim()) errs.weight = 'Weight is required (kg)';
      if (!form.emergencyContactName.trim()) errs.emergencyContactName = 'Emergency contact name is required';
      if (!form.emergencyContactMobile.trim()) errs.emergencyContactMobile = 'Emergency contact mobile is required';
      else if (!isValidTenDigitPhone(form.emergencyContactMobile)) errs.emergencyContactMobile = 'Enter a valid 10-digit mobile number';
      if (!form.emergencyContactRelation.trim()) errs.emergencyContactRelation = 'Relationship is required';
    }

    if (s === 2) {
      if (!form.fitnessGoal) errs.fitnessGoal = 'Please select a fitness goal';
      if (!form.experienceLevel) errs.experienceLevel = 'Please select experience level';
      if (!form.preferredTraining) errs.preferredTraining = 'Please select training type';
      if (!form.preferredWorkoutDays) errs.preferredWorkoutDays = 'Please select weekly frequency';
      if (!form.preferredWorkoutTime) errs.preferredWorkoutTime = 'Please select workout slot';
    }

    if (s === 3) {
      // Package step - default is auto-selected
    }

    if (s === 4) {
      if (!form.acceptTerms) errs.acceptTerms = 'You must accept the Terms & Conditions';
      if (!form.acceptPrivacy) errs.acceptPrivacy = 'You must accept the Privacy Policy';
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep(prev => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep(prev => Math.max(0, prev - 1));
  };

  const handleSubmit = async () => {
    if (!validateStep(4)) return;

    setIsLoading(true);
    setApiError('');

    const payload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim().toLowerCase(),
      mobile: form.mobile.trim(),
      password: form.password,
      dateOfBirth: form.dateOfBirth || undefined,
      gender: form.gender,
      city: form.city.trim(),
      pinCode: form.pinCode.trim() || undefined,
      height: Number(form.height) || undefined,
      weight: Number(form.weight) || undefined,
      fitnessGoal: form.fitnessGoal,
      experienceLevel: form.experienceLevel,
      preferredTraining: form.preferredTraining,
      preferredWorkoutDays: form.preferredWorkoutDays,
      preferredWorkoutTime: form.preferredWorkoutTime,
      emergencyContact: {
        name: form.emergencyContactName.trim(),
        mobile: form.emergencyContactMobile.trim(),
        relationship: form.emergencyContactRelation.trim(),
      },
      gymId: selectedGymId || undefined,
      planName: form.selectedPackageName,
      billingPlan: form.selectedBillingPlan,
      referralCode: form.referralCode.trim() || undefined,
    };

    const res = await registerCustomer(payload);

    setIsLoading(false);
    if (!res.success) {
      setApiError(res.message || 'Registration failed. Please check your inputs.');
    }
    // If successful, AuthContext automatically updates and logs the user in!
  };

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Top Header */}
        <View style={styles.headerRow}>
          <TouchableOpacity onPress={onBackToLogin} style={styles.backToLoginBtn}>
            <Ionicons name="arrow-back" size={18} color={COLORS.primaryDark} />
            <Text style={styles.backToLoginText}>Back to Login</Text>
          </TouchableOpacity>
          <Text style={styles.stepIndicatorText}>Step {step + 1} of {STEPS.length}</Text>
        </View>

        <Text style={styles.formTitle}>Customer Registration</Text>
        <Text style={styles.formSub}>{STEPS[step]}: Create your Gymora account</Text>

        {/* Step Progress Bar */}
        <View style={styles.stepProgressBar}>
          {STEPS.map((s, idx) => (
            <View
              key={idx}
              style={[
                styles.stepProgressSegment,
                idx <= step ? styles.stepSegmentActive : styles.stepSegmentInactive,
              ]}
            />
          ))}
        </View>

        {apiError ? (
          <View style={styles.apiErrorBox}>
            <Ionicons name="alert-circle" size={16} color={COLORS.rose} />
            <Text style={styles.apiErrorText}>{apiError}</Text>
          </View>
        ) : null}

        {/* STEP 0: ACCOUNT DETAILS */}
        {step === 0 && (
          <View style={styles.stepContainer}>
            <Text style={styles.fieldLabel}>First Name *</Text>
            <TextInput
              style={[styles.input, errors.firstName && styles.inputError]}
              placeholder="e.g. Naveen"
              placeholderTextColor={COLORS.textMuted}
              value={form.firstName}
              onChangeText={val => updateField('firstName', val)}
            />
            {errors.firstName && <Text style={styles.errorText}>{errors.firstName}</Text>}

            <Text style={styles.fieldLabel}>Last Name *</Text>
            <TextInput
              style={[styles.input, errors.lastName && styles.inputError]}
              placeholder="e.g. Kumar"
              placeholderTextColor={COLORS.textMuted}
              value={form.lastName}
              onChangeText={val => updateField('lastName', val)}
            />
            {errors.lastName && <Text style={styles.errorText}>{errors.lastName}</Text>}

            <Text style={styles.fieldLabel}>Email Address *</Text>
            <TextInput
              style={[styles.input, errors.email && styles.inputError]}
              placeholder="e.g. naveen@example.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              value={form.email}
              onChangeText={val => updateField('email', val)}
            />
            {errors.email && <Text style={styles.errorText}>{errors.email}</Text>}

            <Text style={styles.fieldLabel}>Mobile Number (10 Digits) *</Text>
            <TextInput
              style={[styles.input, errors.mobile && styles.inputError]}
              placeholder="e.g. 9876543210"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              value={form.mobile}
              onChangeText={val => updateField('mobile', sanitizeTenDigitPhone(val))}
            />
            {errors.mobile && <Text style={styles.errorText}>{errors.mobile}</Text>}

            <Text style={styles.fieldLabel}>Password (Min 8 Characters) *</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.inputPassword, errors.password && styles.inputError]}
                placeholder="Enter strong password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showPassword}
                value={form.password}
                onChangeText={val => updateField('password', val)}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setShowPassword(p => !p)}
              >
                <Ionicons
                  name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textMedium}
                />
              </TouchableOpacity>
            </View>
            {errors.password && <Text style={styles.errorText}>{errors.password}</Text>}

            <Text style={styles.fieldLabel}>Confirm Password *</Text>
            <View style={styles.passwordWrapper}>
              <TextInput
                style={[styles.inputPassword, errors.confirmPassword && styles.inputError]}
                placeholder="Re-enter password"
                placeholderTextColor={COLORS.textMuted}
                secureTextEntry={!showConfirm}
                value={form.confirmPassword}
                onChangeText={val => updateField('confirmPassword', val)}
              />
              <TouchableOpacity
                style={styles.eyeIconBtn}
                onPress={() => setShowConfirm(p => !p)}
              >
                <Ionicons
                  name={showConfirm ? 'eye-off-outline' : 'eye-outline'}
                  size={18}
                  color={COLORS.textMedium}
                />
              </TouchableOpacity>
            </View>
            {errors.confirmPassword && <Text style={styles.errorText}>{errors.confirmPassword}</Text>}

            <Text style={styles.fieldLabel}>Referral Code (Optional)</Text>
            <TextInput
              style={styles.input}
              placeholder="e.g. GYMORA500"
              placeholderTextColor={COLORS.textMuted}
              autoCapitalize="characters"
              value={form.referralCode}
              onChangeText={val => updateField('referralCode', val.toUpperCase())}
            />
          </View>
        )}

        {/* STEP 1: PERSONAL DETAILS */}
        {step === 1 && (
          <View style={styles.stepContainer}>
            <Text style={styles.fieldLabel}>Gender *</Text>
            <View style={styles.chipRow}>
              {GENDERS.map(g => (
                <TouchableOpacity
                  key={g}
                  style={[styles.chip, form.gender === g && styles.chipActive]}
                  onPress={() => updateField('gender', g)}
                >
                  <Text style={[styles.chipText, form.gender === g && styles.chipTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>City *</Text>
            <TextInput
              style={[styles.input, errors.city && styles.inputError]}
              placeholder="e.g. Bengaluru"
              placeholderTextColor={COLORS.textMuted}
              value={form.city}
              onChangeText={val => updateField('city', val)}
            />
            {errors.city && <Text style={styles.errorText}>{errors.city}</Text>}

            <Text style={styles.fieldLabel}>PIN Code (Optional)</Text>
            <TextInput
              style={[styles.input, errors.pinCode && styles.inputError]}
              placeholder="e.g. 560038"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={6}
              value={form.pinCode}
              onChangeText={val => updateField('pinCode', sanitizeSixDigitPinCode(val))}
            />
            {errors.pinCode && <Text style={styles.errorText}>{errors.pinCode}</Text>}

            <View style={styles.rowTwoCols}>
              <View style={styles.colHalf}>
                <Text style={styles.fieldLabel}>Height (cm) *</Text>
                <TextInput
                  style={[styles.input, errors.height && styles.inputError]}
                  placeholder="175"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={form.height}
                  onChangeText={val => updateField('height', val)}
                />
                {errors.height && <Text style={styles.errorText}>{errors.height}</Text>}
              </View>

              <View style={styles.colHalf}>
                <Text style={styles.fieldLabel}>Weight (kg) *</Text>
                <TextInput
                  style={[styles.input, errors.weight && styles.inputError]}
                  placeholder="72"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  value={form.weight}
                  onChangeText={val => updateField('weight', val)}
                />
                {errors.weight && <Text style={styles.errorText}>{errors.weight}</Text>}
              </View>
            </View>

            <Text style={[styles.fieldLabel, { marginTop: 12 }]}>Emergency Contact Name *</Text>
            <TextInput
              style={[styles.input, errors.emergencyContactName && styles.inputError]}
              placeholder="e.g. Ramesh Kumar"
              placeholderTextColor={COLORS.textMuted}
              value={form.emergencyContactName}
              onChangeText={val => updateField('emergencyContactName', val)}
            />
            {errors.emergencyContactName && <Text style={styles.errorText}>{errors.emergencyContactName}</Text>}

            <Text style={styles.fieldLabel}>Emergency Contact Mobile *</Text>
            <TextInput
              style={[styles.input, errors.emergencyContactMobile && styles.inputError]}
              placeholder="e.g. 9811223344"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="number-pad"
              maxLength={10}
              value={form.emergencyContactMobile}
              onChangeText={val => updateField('emergencyContactMobile', sanitizeTenDigitPhone(val))}
            />
            {errors.emergencyContactMobile && <Text style={styles.errorText}>{errors.emergencyContactMobile}</Text>}

            <Text style={styles.fieldLabel}>Relationship *</Text>
            <TextInput
              style={[styles.input, errors.emergencyContactRelation && styles.inputError]}
              placeholder="e.g. Parent / Spouse / Sibling"
              placeholderTextColor={COLORS.textMuted}
              value={form.emergencyContactRelation}
              onChangeText={val => updateField('emergencyContactRelation', val)}
            />
            {errors.emergencyContactRelation && <Text style={styles.errorText}>{errors.emergencyContactRelation}</Text>}
          </View>
        )}

        {/* STEP 2: FITNESS PROFILE */}
        {step === 2 && (
          <View style={styles.stepContainer}>
            <Text style={styles.fieldLabel}>Primary Fitness Goal *</Text>
            <View style={styles.chipRow}>
              {FITNESS_GOALS.map(goal => (
                <TouchableOpacity
                  key={goal}
                  style={[styles.chip, form.fitnessGoal === goal && styles.chipActive]}
                  onPress={() => updateField('fitnessGoal', goal)}
                >
                  <Text style={[styles.chipText, form.fitnessGoal === goal && styles.chipTextActive]}>
                    {goal}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Experience Level *</Text>
            <View style={styles.chipRow}>
              {EXPERIENCE_LEVELS.map(lvl => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.chip, form.experienceLevel === lvl && styles.chipActive]}
                  onPress={() => updateField('experienceLevel', lvl)}
                >
                  <Text style={[styles.chipText, form.experienceLevel === lvl && styles.chipTextActive]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Preferred Training Mode *</Text>
            <View style={styles.chipRow}>
              {TRAINING_TYPES.map(t => (
                <TouchableOpacity
                  key={t}
                  style={[styles.chip, form.preferredTraining === t && styles.chipActive]}
                  onPress={() => updateField('preferredTraining', t)}
                >
                  <Text style={[styles.chipText, form.preferredTraining === t && styles.chipTextActive]}>
                    {t}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Preferred Workout Days *</Text>
            <View style={styles.chipRow}>
              {WORKOUT_DAYS.map(d => (
                <TouchableOpacity
                  key={d}
                  style={[styles.chip, form.preferredWorkoutDays === d && styles.chipActive]}
                  onPress={() => updateField('preferredWorkoutDays', d)}
                >
                  <Text style={[styles.chipText, form.preferredWorkoutDays === d && styles.chipTextActive]}>
                    {d}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.fieldLabel}>Preferred Workout Time *</Text>
            <View style={styles.chipRow}>
              {WORKOUT_TIMES.map(tm => (
                <TouchableOpacity
                  key={tm}
                  style={[styles.chip, form.preferredWorkoutTime === tm && styles.chipActive]}
                  onPress={() => updateField('preferredWorkoutTime', tm)}
                >
                  <Text style={[styles.chipText, form.preferredWorkoutTime === tm && styles.chipTextActive]}>
                    {tm}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        )}

        {/* STEP 3: PACKAGE SELECTION */}
        {step === 3 && (
          <View style={styles.stepContainer}>
            <Text style={styles.fieldLabel}>Choose Your Primary Gym</Text>
            <View style={styles.gymCard}>
              <Ionicons name="business" size={24} color={COLORS.primary} />
              <View style={{ flex: 1, marginLeft: 10 }}>
                <Text style={styles.gymName}>Gymora Flagship Arena</Text>
                <Text style={styles.gymDesc}>Indiranagar, Bengaluru • Certified Equipment</Text>
              </View>
              <Ionicons name="checkmark-circle" size={20} color={COLORS.emerald} />
            </View>

            <Text style={styles.fieldLabel}>Selected Membership Plan</Text>
            <View style={styles.packageCard}>
              <View style={styles.packageHeader}>
                <Text style={styles.packageTitle}>{form.selectedPackageName}</Text>
                <View style={styles.popularBadge}>
                  <Text style={styles.popularBadgeText}>POPULAR</Text>
                </View>
              </View>
              <Text style={styles.packageDesc}>Full equipment access, locker, shower, and initial assessment.</Text>

              <View style={styles.billingToggleRow}>
                <TouchableOpacity
                  style={[
                    styles.billingBtn,
                    form.selectedBillingPlan === 'monthly' && styles.billingBtnActive,
                  ]}
                  onPress={() => updateField('selectedBillingPlan', 'monthly')}
                >
                  <Text
                    style={[
                      styles.billingBtnText,
                      form.selectedBillingPlan === 'monthly' && styles.billingBtnTextActive,
                    ]}
                  >
                    Monthly (₹2,499)
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    styles.billingBtn,
                    form.selectedBillingPlan === 'annual' && styles.billingBtnActive,
                  ]}
                  onPress={() => updateField('selectedBillingPlan', 'annual')}
                >
                  <Text
                    style={[
                      styles.billingBtnText,
                      form.selectedBillingPlan === 'annual' && styles.billingBtnTextActive,
                    ]}
                  >
                    Annual (₹19,999 • Save 33%)
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        {/* STEP 4: CONSENT & TERMS */}
        {step === 4 && (
          <View style={styles.stepContainer}>
            <Text style={styles.summaryHeading}>Review & Consent</Text>
            <View style={styles.summaryBox}>
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryBold}>Name: </Text>{form.firstName} {form.lastName}
              </Text>
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryBold}>Email: </Text>{form.email}
              </Text>
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryBold}>Mobile: </Text>{form.mobile}
              </Text>
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryBold}>Goal: </Text>{form.fitnessGoal} ({form.preferredTraining})
              </Text>
              <Text style={styles.summaryLine}>
                <Text style={styles.summaryBold}>Plan: </Text>{form.selectedPackageName} ({form.selectedBillingPlan})
              </Text>
            </View>

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateField('acceptTerms', !form.acceptTerms)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={form.acceptTerms ? 'checkbox' : 'square-outline'}
                size={22}
                color={form.acceptTerms ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={styles.checkboxLabel}>
                I accept the <Text style={styles.linkText}>Terms & Conditions</Text> for gym facility use and safety protocols. *
              </Text>
            </TouchableOpacity>
            {errors.acceptTerms && <Text style={styles.errorText}>{errors.acceptTerms}</Text>}

            <TouchableOpacity
              style={styles.checkboxRow}
              onPress={() => updateField('acceptPrivacy', !form.acceptPrivacy)}
              activeOpacity={0.8}
            >
              <Ionicons
                name={form.acceptPrivacy ? 'checkbox' : 'square-outline'}
                size={22}
                color={form.acceptPrivacy ? COLORS.primary : COLORS.textMuted}
              />
              <Text style={styles.checkboxLabel}>
                I accept the <Text style={styles.linkText}>Privacy Policy</Text> regarding fitness records and health metrics. *
              </Text>
            </TouchableOpacity>
            {errors.acceptPrivacy && <Text style={styles.errorText}>{errors.acceptPrivacy}</Text>}
          </View>
        )}

        {/* Action Buttons: Prev / Next / Submit */}
        <View style={styles.navButtonsRow}>
          {step > 0 && (
            <TouchableOpacity style={styles.prevBtn} onPress={handlePrev} disabled={isLoading}>
              <Ionicons name="arrow-back" size={16} color={COLORS.textDark} />
              <Text style={styles.prevBtnText}>Previous</Text>
            </TouchableOpacity>
          )}

          {step < STEPS.length - 1 ? (
            <TouchableOpacity style={styles.nextBtn} onPress={handleNext}>
              <Text style={styles.nextBtnText}>Continue</Text>
              <Ionicons name="arrow-forward" size={16} color={COLORS.white} />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.submitBtn, isLoading && styles.btnDisabled]}
              onPress={handleSubmit}
              disabled={isLoading}
            >
              {isLoading ? (
                <ActivityIndicator color={COLORS.white} size="small" />
              ) : (
                <>
                  <Text style={styles.submitBtnText}>Complete Registration</Text>
                  <Ionicons name="checkmark-circle" size={18} color={COLORS.white} />
                </>
              )}
            </TouchableOpacity>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: { flex: 1, backgroundColor: COLORS.white },
  container: { flex: 1 },
  scrollContent: { padding: 18, paddingBottom: 48 },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  backToLoginText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  stepIndicatorText: { fontSize: 11, fontWeight: '700', color: COLORS.textMuted },
  formTitle: { fontSize: 20, fontWeight: '800', color: COLORS.textDark, letterSpacing: -0.3 },
  formSub: { fontSize: 12, color: COLORS.textMedium, marginTop: 2, marginBottom: 12 },
  stepProgressBar: {
    flexDirection: 'row',
    gap: 4,
    marginBottom: 18,
  },
  stepProgressSegment: {
    flex: 1,
    height: 4,
    borderRadius: 2,
  },
  stepSegmentActive: { backgroundColor: COLORS.primary },
  stepSegmentInactive: { backgroundColor: COLORS.cardBorder },
  stepContainer: { gap: 4 },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 4,
  },
  input: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textDark,
  },
  inputError: {
    borderColor: COLORS.rose,
    backgroundColor: COLORS.roseLight,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.rose,
    marginTop: 2,
    fontWeight: '600',
  },
  passwordWrapper: {
    position: 'relative',
    justifyContent: 'center',
  },
  inputPassword: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    borderRadius: 12,
    paddingLeft: 14,
    paddingRight: 42,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textDark,
  },
  eyeIconBtn: {
    position: 'absolute',
    right: 12,
    padding: 6,
  },
  rowTwoCols: {
    flexDirection: 'row',
    gap: 12,
  },
  colHalf: { flex: 1 },
  chipRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginVertical: 4,
  },
  chip: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  chipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryBorder,
  },
  chipText: { fontSize: 11, color: COLORS.textDark, fontWeight: '600' },
  chipTextActive: { color: COLORS.primaryDark, fontWeight: '800' },
  gymCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 12,
    borderRadius: 14,
    marginBottom: 12,
  },
  gymName: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  gymDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  packageCard: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 14,
    borderRadius: 16,
  },
  packageHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  packageTitle: { fontSize: 14, fontWeight: '800', color: COLORS.primaryDark },
  popularBadge: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  popularBadgeText: { fontSize: 9, fontWeight: '800', color: COLORS.white },
  packageDesc: { fontSize: 11, color: COLORS.textDark, marginTop: 4, marginBottom: 12 },
  billingToggleRow: { flexDirection: 'row', gap: 8 },
  billingBtn: {
    flex: 1,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  billingBtnActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  billingBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.textDark },
  billingBtnTextActive: { color: COLORS.white },
  summaryHeading: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 8 },
  summaryBox: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    padding: 14,
    borderRadius: 14,
    marginBottom: 16,
    gap: 4,
  },
  summaryLine: { fontSize: 12, color: COLORS.textDark },
  summaryBold: { fontWeight: '700' },
  checkboxRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
    marginBottom: 10,
  },
  checkboxLabel: { flex: 1, fontSize: 12, color: COLORS.textDark, lineHeight: 18 },
  linkText: { color: COLORS.primaryDark, fontWeight: '700' },
  apiErrorBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.roseLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 12,
  },
  apiErrorText: { fontSize: 11, color: COLORS.rose, flex: 1, fontWeight: '600' },
  navButtonsRow: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 24,
  },
  prevBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingVertical: 13,
    borderRadius: 14,
  },
  prevBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  nextBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 13,
    borderRadius: 14,
  },
  nextBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.white },
  submitBtn: {
    flex: 2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.emerald,
    paddingVertical: 13,
    borderRadius: 14,
  },
  submitBtnText: { fontSize: 13, fontWeight: '800', color: COLORS.white },
  btnDisabled: { opacity: 0.6 },
});

