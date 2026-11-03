import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth, UserRole } from '../context/AuthContext';

export const Header: React.FC<{ 
  title?: string; 
  subtitle?: string;
  onOpenQrPass?: () => void;
  onOpenNotifications?: () => void;
}> = ({ title, subtitle, onOpenQrPass, onOpenNotifications }) => {
  const { user, activeRole, logout } = useAuth();

  const getRoleLabel = (role: UserRole | null) => {
    switch (role) {
      case 'GYM_OWNER': return 'Gym Owner';
      case 'TRAINER': return 'Trainer';
      case 'CUSTOMER': return 'Customer';
      default: return 'User';
    }
  };

  const handleLogoutPress = () => {
    Alert.alert(
      'Sign Out',
      `Are you sure you want to log out of your ${getRoleLabel(activeRole)} account?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Sign Out', 
          style: 'destructive', 
          onPress: () => logout() 
        },
      ]
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Brand & Subtitle */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="fitness" size={18} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.brandName}>Gymora</Text>
            <Text style={styles.brandSub} numberOfLines={1}>
              {subtitle || user?.gymName || user?.name || 'Mobile Platform'}
            </Text>
          </View>
        </View>

        {/* Action Controls: QR Pass + Authenticated Role Badge + Logout (Safe clearance from top-right dev menu) */}
        <View style={styles.controlsRow}>
          {activeRole === 'CUSTOMER' && onOpenQrPass && (
            <TouchableOpacity 
              style={styles.qrHeaderBtn}
              onPress={onOpenQrPass}
              activeOpacity={0.7}
              accessibilityLabel="Open Membership QR Pass"
            >
              <Ionicons name="qr-code" size={15} color={COLORS.primary} />
              <Text style={styles.qrHeaderText}>PASS</Text>
            </TouchableOpacity>
          )}

          {/* Authenticated Role Badge - Displays verified server identity */}
          <View style={styles.roleBadge}>
            <View style={styles.activeDot} />
            <Text style={styles.roleBadgeText}>{getRoleLabel(activeRole)}</Text>
          </View>

          {/* Header Notifications Shortcut */}
          {onOpenNotifications && (
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={onOpenNotifications}
              activeOpacity={0.7}
              accessibilityLabel="View notifications"
            >
              <Ionicons name="notifications-outline" size={17} color={COLORS.textDark} />
              <View style={styles.notifDot} />
            </TouchableOpacity>
          )}

          {/* Logout Button */}
          <TouchableOpacity
            style={styles.logoutBtn}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
            accessibilityLabel="Sign out of your account"
          >
            <Ionicons name="log-out-outline" size={17} color={COLORS.rose} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  topRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexShrink: 1,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 9,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    maxWidth: 120,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    // Add right padding to safely clear Expo Go's floating dev menu gear icon in top-right
    marginRight: 48,
  },
  qrHeaderBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 7,
    paddingVertical: 5,
    borderRadius: 14,
  },
  qrHeaderText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.primaryDark,
    letterSpacing: 0.3,
  },
  roleBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emerald,
  },
  roleBadgeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  logoutBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: COLORS.roseLight,
    borderWidth: 1,
    borderColor: '#FECDD3',
  },
  notifBtn: {
    padding: 6,
    borderRadius: 10,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
