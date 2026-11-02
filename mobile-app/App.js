import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Context & Theme
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/constants/theme';
import { Header } from './src/components/Header';
import { BottomTabBar } from './src/components/BottomTabBar';

// Owner Screens
import { OwnerDashboardScreen } from './src/screens/owner/OwnerDashboardScreen';
import { OwnerMembersScreen } from './src/screens/owner/OwnerMembersScreen';
import { OwnerTrainersScreen } from './src/screens/owner/OwnerTrainersScreen';
import { OwnerFinancesScreen } from './src/screens/owner/OwnerFinancesScreen';
import { OwnerSettingsScreen } from './src/screens/owner/OwnerSettingsScreen';

// Trainer Screens
import { TrainerDashboardScreen } from './src/screens/trainer/TrainerDashboardScreen';
import { TrainerClientsScreen } from './src/screens/trainer/TrainerClientsScreen';
import { TrainerWorkoutsScreen } from './src/screens/trainer/TrainerWorkoutsScreen';
import { TrainerEarningsScreen } from './src/screens/trainer/TrainerEarningsScreen';
import { TrainerProfileScreen } from './src/screens/trainer/TrainerProfileScreen';

// Customer Screens
import { CustomerDashboardScreen } from './src/screens/customer/CustomerDashboardScreen';
import { CustomerWorkoutsScreen } from './src/screens/customer/CustomerWorkoutsScreen';
import { CustomerDietScreen } from './src/screens/customer/CustomerDietScreen';
import { CustomerTrainersScreen } from './src/screens/customer/CustomerTrainersScreen';
import { CustomerProfileScreen } from './src/screens/customer/CustomerProfileScreen';

const MainAppContent = () => {
  const { activeRole } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');

  // Reset to default tab when role switches
  useEffect(() => {
    if (activeRole === 'GYM_OWNER') setActiveTab('overview');
    else if (activeRole === 'TRAINER') setActiveTab('schedule');
    else if (activeRole === 'CUSTOMER') setActiveTab('today');
  }, [activeRole]);

  const renderActiveScreen = () => {
    if (activeRole === 'GYM_OWNER') {
      switch (activeTab) {
        case 'overview': return <OwnerDashboardScreen onNavigateTab={setActiveTab} />;
        case 'members': return <OwnerMembersScreen />;
        case 'trainers': return <OwnerTrainersScreen />;
        case 'finances': return <OwnerFinancesScreen />;
        case 'settings': return <OwnerSettingsScreen />;
        default: return <OwnerDashboardScreen onNavigateTab={setActiveTab} />;
      }
    }

    if (activeRole === 'TRAINER') {
      switch (activeTab) {
        case 'schedule': return <TrainerDashboardScreen onNavigateTab={setActiveTab} />;
        case 'clients': return <TrainerClientsScreen />;
        case 'workouts': return <TrainerWorkoutsScreen />;
        case 'earnings': return <TrainerEarningsScreen />;
        case 'profile': return <TrainerProfileScreen />;
        default: return <TrainerDashboardScreen onNavigateTab={setActiveTab} />;
      }
    }

    if (activeRole === 'CUSTOMER') {
      switch (activeTab) {
        case 'today': return <CustomerDashboardScreen onNavigateTab={setActiveTab} />;
        case 'workouts': return <CustomerWorkoutsScreen />;
        case 'diet': return <CustomerDietScreen />;
        case 'trainers': return <CustomerTrainersScreen />;
        case 'profile': return <CustomerProfileScreen />;
        default: return <CustomerDashboardScreen onNavigateTab={setActiveTab} />;
      }
    }

    return <OwnerDashboardScreen onNavigateTab={setActiveTab} />;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      <Header />
      <View style={styles.body}>
        {renderActiveScreen()}
      </View>
      <BottomTabBar activeTab={activeTab} onSelectTab={setActiveTab} />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <AuthProvider>
      <MainAppContent />
    </AuthProvider>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.white,
    paddingTop: Platform.OS === 'android' ? RNStatusBar.currentHeight : 0,
  },
  body: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
});
