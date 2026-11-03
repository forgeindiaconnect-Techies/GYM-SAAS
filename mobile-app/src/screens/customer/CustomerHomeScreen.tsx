import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';
import { CustomerDashboardScreen } from './CustomerDashboardScreen';
import { CustomerGymScreen } from './CustomerGymScreen';

export const CustomerHomeScreen: React.FC<{
  onNavigateTab: (tab: string, sub?: string) => void;
  externalQrVisible?: boolean;
  onCloseExternalQr?: () => void;
}> = ({ onNavigateTab, externalQrVisible, onCloseExternalQr }) => {
  const [activeSubTab, setActiveSubTab] = useState<'dashboard' | 'gym'>('dashboard');

  return (
    <View style={styles.container}>
      {/* Sub Navigation Bar: Dashboard | My Gym */}
      <View style={styles.subTabBar}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'dashboard' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('dashboard')}
          activeOpacity={0.7}
        >
          <Text style={[styles.subTabText, activeSubTab === 'dashboard' && styles.subTabTextActive]}>
            Dashboard
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'gym' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('gym')}
          activeOpacity={0.7}
        >
          <Text style={[styles.subTabText, activeSubTab === 'gym' && styles.subTabTextActive]}>
            My Gym
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen View */}
      <View style={styles.content}>
        {activeSubTab === 'dashboard' ? (
          <CustomerDashboardScreen 
            onNavigateTab={onNavigateTab} 
            externalQrVisible={externalQrVisible}
            onCloseExternalQr={onCloseExternalQr}
          />
        ) : (
          <CustomerGymScreen />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 8,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subTabBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryBorder,
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  subTabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  content: { flex: 1 },
});

