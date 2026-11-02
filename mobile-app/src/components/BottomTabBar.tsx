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
          { key: 'overview', label: 'Overview', icon: 'grid-outline' },
          { key: 'members', label: 'Members', icon: 'people-outline' },
          { key: 'trainers', label: 'Trainers', icon: 'barbell-outline' },
          { key: 'finances', label: 'Finances', icon: 'wallet-outline' },
          { key: 'settings', label: 'Settings', icon: 'settings-outline' },
        ];
      case 'TRAINER':
        return [
          { key: 'schedule', label: 'Schedule', icon: 'calendar-outline' },
          { key: 'clients', label: 'Clients', icon: 'person-outline' },
          { key: 'workouts', label: 'Workouts', icon: 'fitness-outline' },
          { key: 'earnings', label: 'Earnings', icon: 'cash-outline' },
          { key: 'profile', label: 'Profile', icon: 'trophy-outline' },
        ];
      case 'CUSTOMER':
        return [
          { key: 'today', label: 'Today', icon: 'flame-outline' },
          { key: 'workouts', label: 'Workout', icon: 'barbell-outline' },
          { key: 'diet', label: 'Diet', icon: 'nutrition-outline' },
          { key: 'trainers', label: 'Trainers', icon: 'sparkles-outline' },
          { key: 'profile', label: 'Pass', icon: 'card-outline' },
        ];
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
    padding: 4,
    borderRadius: 12,
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

