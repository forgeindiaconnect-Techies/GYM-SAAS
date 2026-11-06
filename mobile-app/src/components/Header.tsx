import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth, UserRole } from '../context/AuthContext';

export const Header: React.FC<{ 
  title?: string; 
  subtitle?: string;
  onOpenNotifications?: () => void;
}> = ({ title, subtitle, onOpenNotifications }) => {
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

        {/* Action Controls: Authenticated Role Badge + Notification + Logout (Safe clearance from floating dev menu) */}
        <View style={styles.controlsRow}>

          {/* Authenticated Role Badge */}
          <TouchableOpacity 
            style={styles.roleBadge}
            onPress={handleLogoutPress}
            activeOpacity={0.7}
            accessibilityLabel={`Signed in as ${getRoleLabel(activeRole)}. Tap to sign out.`}
          >
            <View style={styles.activeDot} />
            <Text style={styles.roleBadgeText}>{getRoleLabel(activeRole)}</Text>
          </TouchableOpacity>

          {/* Header Notifications Shortcut */}
          {onOpenNotifications && (
            <TouchableOpacity
              style={styles.notifBtn}
              onPress={onOpenNotifications}
              activeOpacity={0.7}
              accessibilityLabel="View notifications"
            >
              <Ionicons name="notifications-outline" size={16} color={COLORS.textDark} />
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
            <Ionicons name="log-out-outline" size={16} color={COLORS.rose} />
          </TouchableOpacity>
        </View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingTop: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
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
    flex: 1,
    flexShrink: 1,
  },
  logoBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    lineHeight: 18,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
    lineHeight: 13,
    maxWidth: 110,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    // Safe clearance to ensure floating developer gear (Expo Go / Android overlay) never covers buttons
    marginRight: 68,
  },
  roleBadge: {
    height: 32,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 5,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    borderRadius: 8,
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
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  logoutBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.roseLight,
    borderWidth: 1,
    borderColor: '#FECDD3',
    alignItems: 'center',
    justifyContent: 'center',
  },
  notifBtn: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: COLORS.card,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  notifDot: {
    position: 'absolute',
    top: 5,
    right: 5,
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
});
