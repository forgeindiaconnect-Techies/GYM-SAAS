import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth, UserRole } from '../context/AuthContext';

export const Header: React.FC<{ title?: string; subtitle?: string }> = ({ title, subtitle }) => {
  const { user, activeRole, setRole } = useAuth();
  const [roleModalVisible, setRoleModalVisible] = useState(false);

  const getRoleLabel = (role: UserRole) => {
    switch (role) {
      case 'GYM_OWNER': return 'Gym Owner App';
      case 'TRAINER': return 'Trainer App';
      case 'CUSTOMER': return 'Customer App';
    }
  };

  const roles: UserRole[] = ['GYM_OWNER', 'TRAINER', 'CUSTOMER'];

  return (
    <View style={styles.container}>
      <View style={styles.topRow}>
        {/* Brand */}
        <View style={styles.brandRow}>
          <View style={styles.logoBadge}>
            <Ionicons name="fitness" size={18} color={COLORS.white} />
          </View>
          <View>
            <Text style={styles.brandName}>Gymora</Text>
            <Text style={styles.brandSub}>{subtitle || user.gymName || 'Mobile Platform'}</Text>
          </View>
        </View>

        {/* Role Pill Switcher */}
        <TouchableOpacity 
          style={styles.rolePill} 
          onPress={() => setRoleModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={styles.activeDot} />
          <Text style={styles.roleText}>{getRoleLabel(activeRole).replace(' App', '')}</Text>
          <Ionicons name="chevron-down" size={14} color={COLORS.primary} />
        </TouchableOpacity>
      </View>

      {/* Role Picker Modal */}
      <Modal
        visible={roleModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setRoleModalVisible(false)}
      >
        <TouchableOpacity 
          style={styles.modalOverlay} 
          activeOpacity={1} 
          onPress={() => setRoleModalVisible(false)}
        >
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>Switch Mobile Dashboard</Text>
            <Text style={styles.modalSub}>Select a role to preview its dedicated mobile interface:</Text>

            {roles.map((r) => {
              const isCurrent = activeRole === r;
              return (
                <TouchableOpacity
                  key={r}
                  style={[styles.roleOption, isCurrent && styles.roleOptionActive]}
                  onPress={() => {
                    setRole(r);
                    setRoleModalVisible(false);
                  }}
                >
                  <View style={styles.roleOptionLeft}>
                    <Ionicons 
                      name={r === 'GYM_OWNER' ? 'business' : r === 'TRAINER' ? 'barbell' : 'person'} 
                      size={20} 
                      color={isCurrent ? COLORS.primary : COLORS.textMedium} 
                    />
                    <Text style={[styles.roleOptionText, isCurrent && styles.roleOptionTextActive]}>
                      {getRoleLabel(r)}
                    </Text>
                  </View>
                  {isCurrent && <Ionicons name="checkmark-circle" size={20} color={COLORS.primary} />}
                </TouchableOpacity>
              );
            })}
          </View>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingTop: 48,
    paddingBottom: 12,
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
    gap: 10,
  },
  logoBadge: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  brandName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  brandSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  rolePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  activeDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.primary,
  },
  roleText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primaryDark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalSub: {
    fontSize: 12,
    color: COLORS.textMedium,
    marginTop: 4,
    marginBottom: 16,
  },
  roleOption: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 14,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 8,
    backgroundColor: COLORS.background,
  },
  roleOptionActive: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.primaryLight,
  },
  roleOptionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  roleOptionText: {
    fontSize: 14,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  roleOptionTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '700',
  },
});

