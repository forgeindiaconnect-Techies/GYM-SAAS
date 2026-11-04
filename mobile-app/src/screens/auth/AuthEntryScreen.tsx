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
  Modal,
  Alert,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { CustomerRegisterForm } from './CustomerRegisterForm';
import { ForgotPasswordScreen } from './ForgotPasswordScreen';
import {
  getActiveBaseUrl,
  setActiveBaseUrl,
  resetDefaultBaseUrl,
  BACKEND_PRESETS,
  checkBackendHealth,
} from '../../api/client';

export const AuthEntryScreen: React.FC = () => {
  const { login } = useAuth();

  // Mode switcher: 'login' | 'signup' | 'forgot'
  const [authView, setAuthView] = useState<'login' | 'signup' | 'forgot'>('login');

  // Login form state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');
  const [successNotice, setSuccessNotice] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Backend connection configuration state
  const [showServerModal, setShowServerModal] = useState(false);
  const [activeUrl, setActiveUrl] = useState(getActiveBaseUrl());
  const [customInputUrl, setCustomInputUrl] = useState(getActiveBaseUrl());
  const [isTestingHealth, setIsTestingHealth] = useState(false);
  const [healthStatus, setHealthStatus] = useState<'idle' | 'ok' | 'failed'>('idle');

  useEffect(() => {
    const current = getActiveBaseUrl();
    setActiveUrl(current);
    setCustomInputUrl(current);
  }, []);

  const handleTestConnection = async (targetUrl?: string) => {
    setIsTestingHealth(true);
    setHealthStatus('idle');
    try {
      const ok = await checkBackendHealth();
      setHealthStatus(ok ? 'ok' : 'failed');
    } catch {
      setHealthStatus('failed');
    } finally {
      setIsTestingHealth(false);
    }
  };

  const handleSelectPreset = async (url: string) => {
    await setActiveBaseUrl(url);
    setActiveUrl(url);
    setCustomInputUrl(url);
    setHealthStatus('idle');
    Alert.alert('Backend Updated', `Mobile app is now connected to:\n${url}`);
  };

  const handleSaveCustomUrl = async () => {
    if (!customInputUrl.trim() || !customInputUrl.startsWith('http')) {
      Alert.alert('Invalid URL', 'Please enter a valid HTTP or HTTPS backend URL.');
      return;
    }
    await setActiveBaseUrl(customInputUrl.trim());
    setActiveUrl(customInputUrl.trim());
    Alert.alert('Backend Saved', `Connected to:\n${customInputUrl.trim()}`);
    setShowServerModal(false);
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
    // Authenticate with server - server returns user and role, automatically opening respective dashboard
    const result = await login(email, password);
    setIsLoading(false);

    if (!result.success) {
      setErrorMessage(result.message || 'Invalid email or password.');
    }
  };

  // View: Customer Sign Up Flow
  if (authView === 'signup') {
    return <CustomerRegisterForm onBackToLogin={() => setAuthView('login')} />;
  }

  // View: Forgot Password Flow
  if (authView === 'forgot') {
    return (
      <ForgotPasswordScreen
        initialEmail={email}
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
            <Ionicons name="fitness" size={28} color={COLORS.white} />
          </View>
          <Text style={styles.brandName}>Gymora</Text>
          <Text style={styles.brandSub}>Gym Management & Fitness Platform</Text>

          {/* Active Backend Connection Pill */}
          <TouchableOpacity
            style={styles.serverPill}
            onPress={() => {
              setActiveUrl(getActiveBaseUrl());
              setCustomInputUrl(getActiveBaseUrl());
              setHealthStatus('idle');
              setShowServerModal(true);
            }}
            activeOpacity={0.8}
          >
            <View style={[styles.serverDot, { backgroundColor: activeUrl.includes('render.com') ? '#10B981' : '#F59E0B' }]} />
            <Text style={styles.serverPillText} numberOfLines={1}>
              {activeUrl.includes('render.com')
                ? 'Cloud (Atlas ai-gym)'
                : activeUrl.includes('192.168')
                ? 'Local PC (Port 5600)'
                : activeUrl.includes('localhost')
                ? 'Localhost (Port 5600)'
                : 'Custom Backend'}
            </Text>
            <Ionicons name="settings-outline" size={13} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Main Login Form Card */}
        <View style={styles.formCard}>
          <Text style={styles.formTitle}>Sign In</Text>
          <Text style={styles.formSub}>
            Enter your account credentials to access your dashboard
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

          {/* Primary Login Button (Full-width orange, labeled 'Login') */}
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
          <View style={styles.signUpPromptRow}>
            <Text style={styles.signUpPromptText}>New to Gymora? </Text>
            <TouchableOpacity onPress={() => setAuthView('signup')} activeOpacity={0.7}>
              <Text style={styles.signUpPromptLink}>Sign Up</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Security Note */}
        <View style={styles.securityNote}>
          <Ionicons name="shield-checkmark-outline" size={14} color={COLORS.textMuted} />
          <Text style={styles.securityNoteText}>Secure account access</Text>
        </View>
      </ScrollView>

      {/* Backend & Database Connection Modal */}
      <Modal
        visible={showServerModal}
        transparent={true}
        animationType="slide"
        onRequestClose={() => setShowServerModal(false)}
      >
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : undefined}
          style={styles.serverModalOverlay}
        >
          <View style={styles.serverModalCard}>
            {/* Modal Header */}
            <View style={styles.serverModalHeader}>
              <View style={{ flex: 1 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                  <Ionicons name="server" size={18} color={COLORS.primary} />
                  <Text style={styles.serverModalTitle}>Backend & Database</Text>
                </View>
                <Text style={styles.serverModalSub}>
                  MongoDB Atlas Database: <Text style={{ color: COLORS.primary, fontWeight: '700' }}>ai-gym</Text>
                </Text>
              </View>
              <TouchableOpacity
                onPress={() => setShowServerModal(false)}
                style={styles.serverModalCloseBtn}
              >
                <Ionicons name="close" size={20} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView style={{ padding: 16 }} showsVerticalScrollIndicator={false}>
              <Text style={styles.serverSectionHeader}>CHOOSE BACKEND ENVIRONMENT</Text>

              {/* Presets List */}
              {BACKEND_PRESETS.map((preset) => {
                const isSelected = activeUrl === preset.url;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[
                      styles.serverPresetCard,
                      isSelected && styles.serverPresetCardSelected,
                    ]}
                    onPress={() => handleSelectPreset(preset.url)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={[styles.serverPresetName, isSelected && styles.serverPresetNameSelected]}>
                          {preset.name}
                        </Text>
                        {preset.isProduction ? (
                          <View style={styles.liveCloudBadge}>
                            <Text style={styles.liveCloudBadgeText}>Live Cloud</Text>
                          </View>
                        ) : null}
                      </View>
                      <Text style={styles.serverPresetDesc}>{preset.desc}</Text>
                      <Text style={styles.serverPresetUrl} numberOfLines={1}>
                        {preset.url}
                      </Text>
                    </View>
                    <Ionicons
                      name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                      size={20}
                      color={isSelected ? COLORS.primary : '#94A3B8'}
                    />
                  </TouchableOpacity>
                );
              })}

              {/* Custom URL Input */}
              <Text style={[styles.serverSectionHeader, { marginTop: 14 }]}>CUSTOM API ENDPOINT</Text>
              <View style={styles.customUrlInputRow}>
                <TextInput
                  style={styles.customUrlInput}
                  value={customInputUrl}
                  onChangeText={setCustomInputUrl}
                  placeholder="https://your-backend.com/api"
                  placeholderTextColor={COLORS.textMuted}
                  autoCapitalize="none"
                  autoCorrect={false}
                />
                <TouchableOpacity
                  style={styles.saveCustomBtn}
                  onPress={handleSaveCustomUrl}
                  activeOpacity={0.8}
                >
                  <Text style={styles.saveCustomBtnText}>Apply</Text>
                </TouchableOpacity>
              </View>

              {/* Health Check Bar */}
              <View style={styles.healthCheckRow}>
                <TouchableOpacity
                  style={[styles.testConnectionBtn, isTestingHealth && styles.testConnectionBtnDisabled]}
                  onPress={() => handleTestConnection()}
                  disabled={isTestingHealth}
                  activeOpacity={0.8}
                >
                  {isTestingHealth ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <>
                      <Ionicons name="pulse-outline" size={16} color="#FFFFFF" />
                      <Text style={styles.testConnectionText}>Test Live Connection</Text>
                    </>
                  )}
                </TouchableOpacity>

                {healthStatus === 'ok' ? (
                  <View style={styles.healthSuccessPill}>
                    <Ionicons name="checkmark-circle" size={14} color="#059669" />
                    <Text style={styles.healthSuccessText}>200 OK (Connected)</Text>
                  </View>
                ) : healthStatus === 'failed' ? (
                  <View style={styles.healthErrorPill}>
                    <Ionicons name="close-circle" size={14} color="#DC2626" />
                    <Text style={styles.healthErrorText}>Cannot Connect</Text>
                  </View>
                ) : null}
              </View>
            </ScrollView>
          </View>
        </KeyboardAvoidingView>
      </Modal>
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
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  logoBadge: {
    width: 52,
    height: 52,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  brandName: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.5,
  },
  brandSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  formCard: {
    width: '100%',
    maxWidth: 420,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 22,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
  },
  formTitle: {
    fontSize: 20,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
    letterSpacing: -0.3,
  },
  formSub: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginBottom: 18,
    lineHeight: 17,
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
    marginBottom: 18,
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
    marginTop: 18,
    paddingTop: 14,
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
    marginTop: 22,
  },
  securityNoteText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  serverPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  serverDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
  },
  serverPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#334155',
  },
  serverModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.65)',
    justifyContent: 'flex-end',
  },
  serverModalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  serverModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  serverModalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#0F172A',
  },
  serverModalSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  serverModalCloseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  serverSectionHeader: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.8,
    color: '#94A3B8',
    marginBottom: 8,
  },
  serverPresetCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    marginBottom: 8,
  },
  serverPresetCardSelected: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  serverPresetName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#1E293B',
  },
  serverPresetNameSelected: {
    color: '#EA580C',
  },
  liveCloudBadge: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  liveCloudBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#059669',
  },
  serverPresetDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  serverPresetUrl: {
    fontSize: 10,
    color: '#94A3B8',
    marginTop: 2,
    fontFamily: Platform.OS === 'ios' ? 'Courier' : 'monospace',
  },
  customUrlInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  customUrlInput: {
    flex: 1,
    height: 44,
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    fontSize: 12,
    color: '#1E293B',
  },
  saveCustomBtn: {
    backgroundColor: '#EA580C',
    height: 44,
    paddingHorizontal: 16,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  saveCustomBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  healthCheckRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  testConnectionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#0F172A',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 10,
  },
  testConnectionBtnDisabled: {
    opacity: 0.6,
  },
  testConnectionText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  healthSuccessPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  healthSuccessText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  healthErrorPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  healthErrorText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#DC2626',
  },
});
