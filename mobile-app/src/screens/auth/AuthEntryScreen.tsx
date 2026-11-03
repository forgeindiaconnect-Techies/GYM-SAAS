import React, { useState } from 'react';
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
import { useAuth, UserRole } from '../../context/AuthContext';
import { CustomerRegisterForm } from './CustomerRegisterForm';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';

export const AuthEntryScreen: React.FC = () => {
  const { selectedPortalRole, setSelectedPortalRole, login } = useAuth();

  // Mode switcher: 'login' | 'signup' (Customer only) | 'forgot'
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  const portals: UserRole[] = ['GYM_OWNER', 'TRAINER', 'CUSTOMER'];

  const getRoleDisplayName = (role: UserRole): string => {
    switch (role) {
      case 'GYM_OWNER': return 'Gym Owner';
      case 'TRAINER': return 'Trainer';
      case 'CUSTOMER': return 'Customer';
    }
  };

  const getPageTitle = (role: UserRole): string => {
    switch (role) {
      case 'GYM_OWNER': return 'Gym Owner Login';
      case 'TRAINER': return 'Trainer Login';
      case 'CUSTOMER': return 'Customer Login';
    }
  };

  const validateLoginForm = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Email address is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    if (!password) {
      errs.password = 'Password is required';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleLoginSubmit = async () => {
    setErrorMessage('');
    setSuccessNotice('');
    if (!validateLoginForm()) return;

    setIsLoading(true);
    const result = await login(email, password, selectedPortalRole);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Invalid email or password.');
    }
  };

  const handlePortalSwitch = (role: UserRole) => {
    setSelectedPortalRole(role);
    setErrorMessage('');
    setSuccessNotice('');
    setFieldErrors({});
    setAuthView('login');
  };

  // View: Customer Sign Up Flow
  if (selectedPortalRole === 'CUSTOMER' && authView === 'signup') {
    return <CustomerRegisterForm onBackToLogin={() => setAuthView('login')} />;
  }

  // View: Forgot Password Flow (available for Gym Owner, Trainer, Customer)
  if (authView === 'forgot') {
    return (
      <ForgotPasswordScreen
        initialEmail={email}
        role={selectedPortalRole}
        onBackToLogin={(resetEmail?: string) => {
          if (resetEmail) {
            setEmail(resetEmail);
            setPassword('');
            setSuccessNotice('Password reset successfully. You can now log in with your new password.');
          }
          setAuthView('login');
        }}
      />
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.keyboardAvoid}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      <ScrollView
        style={styles.container}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Logo & Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="fitness" size={26} color={COLORS.white} />
          </View>
          <Text style={styles.brandName}>Gymora</Text>
          <Text style={styles.brandSub}>Gym Management & Fitness Platform</Text>
        </View>

        {/* Role Portal Selector: Gym Owner, Trainer, Customer */}
        <View style={styles.portalCard}>
          <Text style={styles.portalCardLabel}>Select Role Login Portal</Text>
          <View style={styles.portalTabsRow}>
            {portals.map(role => {
              const isSelected = selectedPortalRole === role;
              return (
                <TouchableOpacity
                  key={role}
                  style={[styles.portalTab, isSelected && styles.portalTabActive]}
                  onPress={() => handlePortalSwitch(role)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={role === 'GYM_OWNER' ? 'business' : role === 'TRAINER' ? 'barbell' : 'person'}
                    size={14}
                    color={isSelected ? COLORS.primary : COLORS.textMuted}
                    style={{ marginRight: 4 }}
                  />
                  <Text
                    style={[styles.portalTabText, isSelected && styles.portalTabTextActive]}
                    numberOfLines={1}
                  >
                    {getRoleDisplayName(role)}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Main Login Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>{getPageTitle(selectedPortalRole)}</Text>
          <Text style={styles.formSub}>
            Sign in with your verified {getRoleDisplayName(selectedPortalRole)} credentials
          </Text>

          {/* Success Banner (e.g. after password reset) */}
          {successNotice ? (
            <View style={styles.successBanner}>
              <Ionicons name="checkmark-circle" size={17} color={COLORS.emerald} />
              <Text style={styles.successBannerText}>{successNotice}</Text>
            </View>
          ) : null}

          {/* Error Banner */}
          {errorMessage ? (
            <View style={styles.errorBanner}>
              <Ionicons name="alert-circle" size={17} color={COLORS.rose} />
              <Text style={styles.errorBannerText}>{errorMessage}</Text>
            </View>
          ) : null}

          {/* Email Address Field */}
          <Text style={styles.fieldLabel}>Email Address</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="mail-outline" size={17} color={COLORS.textMedium} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, fieldErrors.email && styles.inputError]}
              placeholder="e.g. user@gymora.com"
              placeholderTextColor={COLORS.textMuted}
              keyboardType="email-address"
              autoCapitalize="none"
              autoCorrect={false}
              autoComplete="email"
              textContentType="emailAddress"
              value={email}
              onChangeText={val => {
                setEmail(val);
                setFieldErrors(prev => {
                  const n = { ...prev };
                  delete n.email;
                  return n;
                });
              }}
              returnKeyType="next"
            />
          </View>
          {fieldErrors.email && <Text style={styles.fieldErrorText}>{fieldErrors.email}</Text>}

          {/* Password Field */}
          <Text style={styles.fieldLabel}>Password</Text>
          <View style={styles.inputWrapper}>
            <Ionicons name="lock-closed-outline" size={17} color={COLORS.textMedium} style={styles.inputIcon} />
            <TextInput
              style={[styles.input, fieldErrors.password && styles.inputError, { paddingRight: 42 }]}
              placeholder="Enter your account password"
              placeholderTextColor={COLORS.textMuted}
              secureTextEntry={!showPassword}
              autoComplete="password"
              textContentType="password"
              value={password}
              onChangeText={val => {
                setPassword(val);
                setFieldErrors(prev => {
                  const n = { ...prev };
                  delete n.password;
                  return n;
                });
              }}
              returnKeyType="done"
              onSubmitEditing={handleLoginSubmit}
            />
            <TouchableOpacity
              style={styles.eyeBtn}
              onPress={() => setShowPassword(p => !p)}
              activeOpacity={0.7}
              accessibilityLabel={showPassword ? 'Hide password' : 'Show password'}
            >
              <Ionicons
                name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                size={18}
                color={COLORS.textMedium}
              />
            </TouchableOpacity>
          </View>
          {fieldErrors.password && <Text style={styles.fieldErrorText}>{fieldErrors.password}</Text>}

          {/* Visible Forgot Password Link */}
          <View style={styles.forgotPasswordRow}>
            <TouchableOpacity
              onPress={() => {
                setErrorMessage('');
                setSuccessNotice('');
                setAuthView('forgot');
              }}
              activeOpacity={0.7}
            >
              <Text style={styles.forgotPasswordLink}>Forgot Password?</Text>
            </TouchableOpacity>
          </View>

          {/* Primary Login Button (Full-width orange, labeled 'Login' for ALL roles) */}
          <TouchableOpacity
            style={[styles.loginBtn, isLoading && styles.loginBtnDisabled]}
            onPress={handleLoginSubmit}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            {isLoading ? (
              <View style={styles.loadingRow}>
                <ActivityIndicator color={COLORS.white} size="small" />
                <Text style={styles.loginBtnText}>Logging in…</Text>
              </View>
            ) : (
              <Text style={styles.loginBtnText}>Login</Text>
            )}
          </TouchableOpacity>

          {/* Customer Call to Action for Sign Up */}
          {selectedPortalRole === 'CUSTOMER' && (
            <View style={styles.signUpPromptRow}>
              <Text style={styles.signUpPromptText}>New to Gymora? </Text>
              <TouchableOpacity onPress={() => setAuthView('signup')} activeOpacity={0.7}>
                <Text style={styles.signUpPromptLink}>Sign Up</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.securityNoteText}>Secure account access</Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  keyboardAvoid: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  container: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: 16,
    paddingTop: 28,
    paddingBottom: 36,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 8,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  brandName: {
    fontSize: 22,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  portalCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  portalCardLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMedium,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  portalTabsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  portalTab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 9,
    paddingHorizontal: 4,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  portalTabActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  portalTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  portalTabTextActive: {
    color: COLORS.primary,
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  formSub: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginBottom: 16,
    lineHeight: 16,
  },
  successBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.emeraldLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  successBannerText: {
    color: COLORS.emerald,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  errorBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: COLORS.roseLight,
    padding: 10,
    borderRadius: 10,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  errorBannerText: {
    color: COLORS.rose,
    fontSize: 11,
    fontWeight: '600',
    flex: 1,
  },
  fieldLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 12,
    marginBottom: 4,
    height: 48,
  },
  inputIcon: {
    marginRight: 8,
  },
  input: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    height: '100%',
  },
  inputError: {
    borderColor: COLORS.rose,
  },
  fieldErrorText: {
    fontSize: 10,
    color: COLORS.rose,
    marginBottom: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  eyeBtn: {
    position: 'absolute',
    right: 12,
    padding: 4,
  },
  forgotPasswordRow: {
    alignItems: 'flex-end',
    marginTop: 6,
    marginBottom: 16,
  },
  forgotPasswordLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  loginBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  loginBtnDisabled: {
    opacity: 0.7,
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loginBtnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  signUpPromptRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 16,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  signUpPromptText: {
    fontSize: 12,
    color: COLORS.textMedium,
  },
  signUpPromptLink: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 20,
  },
  securityNoteText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
});
