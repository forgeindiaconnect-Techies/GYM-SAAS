import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../constants/theme';
import { useAuth } from '../context/AuthContext';

export interface TabItem {
  key: string;
  label: string;
  icon: keyof typeof Ionicons.glyphMap;
}

export const BottomTabBar: React.FC<{
  activeTab: string;
  onSelectTab: (tabKey: string) => void;
}> = ({ activeTab, onSelectTab }) => {
  const { activeRole } = useAuth();

  const getTabsForRole = (): TabItem[] => {
    switch (activeRole) {
      case 'GYM_OWNER':
        return [
          { key: 'overview', label: 'Overview', icon: 'home-outline' },
          { key: 'members', label: 'Members', icon: 'people-outline' },
          { key: 'trainers', label: 'Trainers', icon: 'barbell-outline' },
          { key: 'finances', label: 'Finances', icon: 'wallet-outline' },
          { key: 'more', label: 'More', icon: 'grid-outline' },
        ];
      case 'TRAINER':
        return [
          { key: 'home', label: 'Home', icon: 'home-outline' },
          { key: 'clients', label: 'Clients', icon: 'people-outline' },
          { key: 'schedule', label: 'Schedule', icon: 'calendar-outline' },
          { key: 'programs', label: 'Programs', icon: 'barbell-outline' },
          { key: 'more', label: 'More', icon: 'grid-outline' },
        ];
      case 'CUSTOMER':
        return [
          { key: 'home', label: 'Home', icon: 'home-outline' },
          { key: 'training', label: 'Training', icon: 'barbell-outline' },
          { key: 'fitness', label: 'Fitness', icon: 'fitness-outline' },
          { key: 'store', label: 'Store', icon: 'cart-outline' },
          { key: 'more', label: 'More', icon: 'grid-outline' },
        ];
      default:
        return [];
    }
  };

  const tabs = getTabsForRole();

  return (
    <View style={styles.container}>
      {tabs.map((tab) => {
        const isActive = activeTab === tab.key;
        return (
          <TouchableOpacity
            key={tab.key}
            style={styles.tabBtn}
            onPress={() => onSelectTab(tab.key)}
            activeOpacity={0.7}
          >
            <View style={[styles.iconContainer, isActive && styles.iconActiveContainer]}>
              <Ionicons 
                name={tab.icon} 
                size={22} 
                color={isActive ? COLORS.primary : COLORS.textMuted} 
              />
            </View>
            <Text style={[styles.tabLabel, isActive && styles.tabLabelActive]}>
              {tab.label}
            </Text>
          </TouchableOpacity>
        );
      })}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingTop: 8,
    paddingBottom: 24,
    borderTopWidth: 1,
    borderTopColor: COLORS.cardBorder,
    justifyContent: 'space-around',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 8,
  },
  tabBtn: {
    alignItems: 'center',
    flex: 1,
  },
  iconContainer: {
    width: 44,
    height: 28,
    borderRadius: 14,
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconActiveContainer: {
    backgroundColor: COLORS.primaryLight,
  },
  tabLabel: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  tabLabelActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
});

