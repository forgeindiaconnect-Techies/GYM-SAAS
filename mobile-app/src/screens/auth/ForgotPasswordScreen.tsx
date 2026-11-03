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
import { useAuth, UserRole, mapMobileRoleToHuman } from '../../context/AuthContext';

export interface ForgotPasswordScreenProps {
  initialEmail?: string;
  role?: UserRole;
  onBackToLogin: (resetSuccessEmail?: string) => void;
}

export const ForgotPasswordScreen: React.FC<ForgotPasswordScreenProps> = ({
  initialEmail = '',
  role,
  onBackToLogin,
}) => {
  const { requestPasswordReset, confirmPasswordReset } = useAuth();
  const roleDisplayName = role ? mapMobileRoleToHuman(role) : 'Gymora';

  // Reset steps: 'request' (enter email) -> 'verify' (enter OTP & new password) -> 'success'
  const [step, setStep] = useState<'request' | 'verify' | 'success'>('request');
  const [email, setEmail] = useState(initialEmail);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [statusMessage, setStatusMessage] = useState<{ text: string; isError: boolean } | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

  // Resend OTP countdown cooldown (60 seconds)
  const [resendCooldown, setResendCooldown] = useState(0);

  useEffect(() => {
    let timer: ReturnType<typeof setTimeout>;
    if (resendCooldown > 0) {
      timer = setTimeout(() => setResendCooldown(c => c - 1), 1000);
    }
    return () => clearTimeout(timer);
  }, [resendCooldown]);

  const validateEmailStep = () => {
    const errs: Record<string, string> = {};
    if (!email.trim()) {
      errs.email = 'Registered email is required';
    } else if (!/\S+@\S+\.\S+/.test(email.trim())) {
      errs.email = 'Please enter a valid email address';
    }
    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleRequestOtp = async () => {
    setStatusMessage(null);
    if (!validateEmailStep()) return;

    setIsLoading(true);
    const result = await requestPasswordReset(email.trim());
    setIsLoading(false);

    if (result.success) {
      setStatusMessage({
        text: result.message || 'If an eligible account exists, you’ll receive password-reset instructions.',
        isError: false,
      });
      setResendCooldown(60);
      setStep('verify');
    } else {
      setStatusMessage({
        text: result.message || 'Unable to send reset instructions. Please check your email.',
        isError: true,
      });
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || isLoading) return;
    setStatusMessage(null);

    setIsLoading(true);
    const result = await requestPasswordReset(email.trim());
    setIsLoading(false);

    if (result.success) {
      setStatusMessage({
        text: 'A fresh 6-digit verification code has been dispatched to your email.',
        isError: false,
      });
      setResendCooldown(60);
    } else {
      setStatusMessage({
        text: result.message || 'Failed to resend code. Please try again.',
        isError: true,
      });
    }
  };

  const validateVerifyStep = () => {
    const errs: Record<string, string> = {};
    if (!otp.trim()) {
      errs.otp = '6-digit verification code is required';
    } else if (otp.trim().length !== 6) {
      errs.otp = 'Code must be exactly 6 digits';
    }

    if (!newPassword) {
      errs.newPassword = 'New password is required';
    } else if (newPassword.length < 6) {
      errs.newPassword = 'Password must be at least 6 characters';
    }

    if (!confirmPassword) {
      errs.confirmPassword = 'Confirmation password is required';
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = 'Passwords do not match';
    }

    setFieldErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleConfirmReset = async () => {
    setStatusMessage(null);
    if (!validateVerifyStep()) return;

    setIsLoading(true);
    const result = await confirmPasswordReset(email.trim(), otp.trim(), newPassword);
    setIsLoading(false);

    if (result.success) {
      setStep('success');
    } else {
      setStatusMessage({
        text: result.message || 'Verification failed. Please check the code and try again.',
        isError: true,
      });
    }
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
        showsVerticalScrollIndicator={false}
      >
        {/* Compact Brand Header */}
        <View style={styles.brandContainer}>
          <View style={styles.logoBadge}>
            <Ionicons name="fitness" size={24} color={COLORS.white} />
          </View>
          <Text style={styles.brandName}>Gymora</Text>
          <View style={styles.roleTag}>
            <Text style={styles.roleTagText}>{roleDisplayName} Account</Text>
          </View>
        </View>

        {/* Card Container */}
        <View style={styles.card}>
          {step === 'request' && (
            <>
              <Text style={styles.cardTitle}>Reset Password</Text>
              <Text style={styles.cardSub}>
                Enter your {roleDisplayName} registered email address to receive password-reset instructions.
              </Text>

              {/* Status Message */}
              {statusMessage && (
                <View style={[styles.statusBanner, statusMessage.isError ? styles.statusError : styles.statusSuccess]}>
                  <Ionicons
                    name={statusMessage.isError ? 'alert-circle' : 'checkmark-circle'}
                    size={18}
                    color={statusMessage.isError ? COLORS.rose : COLORS.emerald}
                  />
                  <Text style={[styles.statusText, statusMessage.isError ? styles.statusTextError : styles.statusTextSuccess]}>
                    {statusMessage.text}
                  </Text>
                </View>
              )}

              {/* Email Input */}
              <Text style={styles.inputLabel}>Registered Email Address</Text>
              <View style={styles.inputBox}>
                <Ionicons name="mail-outline" size={18} color={COLORS.textMedium} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, fieldErrors.email && styles.inputError]}
                  placeholder="e.g. name@gymora.com"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  value={email}
                  onChangeText={v => {
                    setEmail(v);
                    setFieldErrors(prev => {
                      const n = { ...prev };
                      delete n.email;
                      return n;
                    });
                  }}
                  returnKeyType="done"
                  onSubmitEditing={handleRequestOtp}
                />
              </View>
              {fieldErrors.email && <Text style={styles.errorText}>{fieldErrors.email}</Text>}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleRequestOtp}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.btnText}>Sending Instructions…</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>Send Reset Instructions</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 'verify' && (
            <>
              <Text style={styles.cardTitle}>Set New Password</Text>
              <Text style={styles.cardSub}>
                Enter the 6-digit code sent to <Text style={{ fontWeight: '700', color: COLORS.textDark }}>{email}</Text> and choose your new password.
              </Text>

              {/* Status Message */}
              {statusMessage && (
                <View style={[styles.statusBanner, statusMessage.isError ? styles.statusError : styles.statusSuccess]}>
                  <Ionicons
                    name={statusMessage.isError ? 'alert-circle' : 'checkmark-circle'}
                    size={18}
                    color={statusMessage.isError ? COLORS.rose : COLORS.emerald}
                  />
                  <Text style={[styles.statusText, statusMessage.isError ? styles.statusTextError : styles.statusTextSuccess]}>
                    {statusMessage.text}
                  </Text>
                </View>
              )}

              {/* OTP Input */}
              <Text style={styles.inputLabel}>6-Digit Verification Code</Text>
              <View style={styles.inputBox}>
                <Ionicons name="key-outline" size={18} color={COLORS.textMedium} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, fieldErrors.otp && styles.inputError, { letterSpacing: 4, fontWeight: '700' }]}
                  placeholder="123456"
                  placeholderTextColor={COLORS.textMuted}
                  keyboardType="number-pad"
                  maxLength={6}
                  value={otp}
                  onChangeText={v => {
                    setOtp(v);
                    setFieldErrors(prev => {
                      const n = { ...prev };
                      delete n.otp;
                      return n;
                    });
                  }}
                />
              </View>
              {fieldErrors.otp && <Text style={styles.errorText}>{fieldErrors.otp}</Text>}

              {/* Resend Cooldown */}
              <View style={styles.resendRow}>
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={resendCooldown > 0 || isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.resendLink, resendCooldown > 0 && styles.resendDisabled]}>
                    {resendCooldown > 0 ? `Resend code in ${resendCooldown}s` : 'Resend verification code'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setStep('request');
                    setStatusMessage(null);
                  }}
                >
                  <Text style={styles.changeEmailLink}>Change email</Text>
                </TouchableOpacity>
              </View>

              {/* New Password */}
              <Text style={styles.inputLabel}>New Password</Text>
              <View style={styles.inputBox}>
                <Ionicons name="lock-closed-outline" size={18} color={COLORS.textMedium} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, fieldErrors.newPassword && styles.inputError, { paddingRight: 40 }]}
                  placeholder="At least 6 characters"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showPassword}
                  value={newPassword}
                  onChangeText={v => {
                    setNewPassword(v);
                    setFieldErrors(prev => {
                      const n = { ...prev };
                      delete n.newPassword;
                      return n;
                    });
                  }}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowPassword(p => !p)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMedium}
                  />
                </TouchableOpacity>
              </View>
              {fieldErrors.newPassword && <Text style={styles.errorText}>{fieldErrors.newPassword}</Text>}

              {/* Confirm Password */}
              <Text style={styles.inputLabel}>Confirm New Password</Text>
              <View style={styles.inputBox}>
                <Ionicons name="shield-checkmark-outline" size={18} color={COLORS.textMedium} style={styles.inputIcon} />
                <TextInput
                  style={[styles.input, fieldErrors.confirmPassword && styles.inputError, { paddingRight: 40 }]}
                  placeholder="Repeat new password"
                  placeholderTextColor={COLORS.textMuted}
                  secureTextEntry={!showConfirmPassword}
                  value={confirmPassword}
                  onChangeText={v => {
                    setConfirmPassword(v);
                    setFieldErrors(prev => {
                      const n = { ...prev };
                      delete n.confirmPassword;
                      return n;
                    });
                  }}
                  returnKeyType="done"
                  onSubmitEditing={handleConfirmReset}
                />
                <TouchableOpacity
                  style={styles.eyeBtn}
                  onPress={() => setShowConfirmPassword(p => !p)}
                  activeOpacity={0.7}
                >
                  <Ionicons
                    name={showConfirmPassword ? 'eye-off-outline' : 'eye-outline'}
                    size={18}
                    color={COLORS.textMedium}
                  />
                </TouchableOpacity>
              </View>
              {fieldErrors.confirmPassword && <Text style={styles.errorText}>{fieldErrors.confirmPassword}</Text>}

              {/* Submit Button */}
              <TouchableOpacity
                style={[styles.primaryBtn, isLoading && styles.btnDisabled]}
                onPress={handleConfirmReset}
                disabled={isLoading}
                activeOpacity={0.8}
              >
                {isLoading ? (
                  <View style={styles.loadingRow}>
                    <ActivityIndicator size="small" color={COLORS.white} />
                    <Text style={styles.btnText}>Updating Password…</Text>
                  </View>
                ) : (
                  <Text style={styles.btnText}>Reset Password</Text>
                )}
              </TouchableOpacity>
            </>
          )}

          {step === 'success' && (
            <View style={styles.successContainer}>
              <View style={styles.successIconCircle}>
                <Ionicons name="checkmark" size={32} color={COLORS.white} />
              </View>
              <Text style={styles.successTitle}>Password Reset Complete</Text>
              <Text style={styles.successSub}>
                Your {roleDisplayName} account password has been updated securely. You can now log in using your new password.
              </Text>

              <TouchableOpacity
                style={styles.primaryBtn}
                onPress={() => onBackToLogin(email)}
                activeOpacity={0.8}
              >
                <Text style={styles.btnText}>Back to Login</Text>
              </TouchableOpacity>
            </View>
          )}

          {/* Back to Login link */}
          {step !== 'success' && (
            <TouchableOpacity
              style={styles.backToLoginBtn}
              onPress={() => onBackToLogin()}
              activeOpacity={0.7}
            >
              <Ionicons name="arrow-back" size={15} color={COLORS.primary} />
              <Text style={styles.backToLoginText}>Back to Login</Text>
            </TouchableOpacity>
          )}
        </View>

        {/* Security Footer Note */}
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
    paddingHorizontal: 20,
    paddingTop: 36,
    paddingBottom: 40,
    alignItems: 'center',
  },
  brandContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  logoBadge: {
    width: 44,
    height: 44,
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
  roleTag: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    marginTop: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  roleTagText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  card: {
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
    shadowRadius: 10,
    elevation: 3,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  cardSub: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginBottom: 16,
    lineHeight: 18,
  },
  statusBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    padding: 12,
    borderRadius: 12,
    marginBottom: 16,
    borderWidth: 1,
  },
  statusError: {
    backgroundColor: COLORS.roseLight,
    borderColor: '#FECDD3',
  },
  statusSuccess: {
    backgroundColor: COLORS.emeraldLight,
    borderColor: '#A7F3D0',
  },
  statusText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
  statusTextError: {
    color: COLORS.rose,
    fontWeight: '600',
  },
  statusTextSuccess: {
    color: COLORS.emerald,
    fontWeight: '600',
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 6,
  },
  inputBox: {
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
    fontSize: 14,
    color: COLORS.textDark,
    height: '100%',
  },
  inputError: {
    borderColor: COLORS.rose,
  },
  errorText: {
    fontSize: 11,
    color: COLORS.rose,
    marginBottom: 10,
    marginTop: 2,
    fontWeight: '600',
  },
  eyeBtn: {
    padding: 6,
  },
  resendRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 14,
    marginTop: 4,
  },
  resendLink: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  resendDisabled: {
    color: COLORS.textMuted,
  },
  changeEmailLink: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  primaryBtn: {
    backgroundColor: COLORS.primary,
    borderRadius: 12,
    paddingVertical: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 14,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 3,
  },
  btnDisabled: {
    opacity: 0.7,
  },
  btnText: {
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '800',
  },
  loadingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  backToLoginBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginTop: 16,
    paddingVertical: 8,
  },
  backToLoginText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  successContainer: {
    alignItems: 'center',
    paddingVertical: 12,
  },
  successIconCircle: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: COLORS.emerald,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  successTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 6,
    textAlign: 'center',
  },
  successSub: {
    fontSize: 12,
    color: COLORS.textMedium,
    textAlign: 'center',
    lineHeight: 18,
    marginBottom: 12,
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
