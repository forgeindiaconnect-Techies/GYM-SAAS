import React, { useState, useEffect } from 'react';
import { View, StyleSheet, SafeAreaView, Platform, StatusBar as RNStatusBar, ActivityIndicator, Text } from 'react-native';
import { StatusBar } from 'expo-status-bar';

// Context & Theme
import { AuthProvider, useAuth } from './src/context/AuthContext';
import { COLORS } from './src/constants/theme';
import { Header } from './src/components/Header';
import { BottomTabBar } from './src/components/BottomTabBar';

// Auth Screen
import { AuthEntryScreen } from './src/screens/auth/AuthEntryScreen';

// Owner Screens
import { OwnerDashboardScreen } from './src/screens/owner/OwnerDashboardScreen';
import { OwnerMembersScreen } from './src/screens/owner/OwnerMembersScreen';
import { OwnerTrainersScreen } from './src/screens/owner/OwnerTrainersScreen';
import { OwnerFinancesScreen } from './src/screens/owner/OwnerFinancesScreen';
import { OwnerMoreScreen } from './src/screens/owner/OwnerMoreScreen';

// Trainer Screens
import { TrainerDashboardScreen } from './src/screens/trainer/TrainerDashboardScreen';
import { TrainerClientsScreen } from './src/screens/trainer/TrainerClientsScreen';
import { TrainerScheduleScreen } from './src/screens/trainer/TrainerScheduleScreen';
import { TrainerProgramsScreen } from './src/screens/trainer/TrainerProgramsScreen';
import { TrainerMoreScreen } from './src/screens/trainer/TrainerMoreScreen';

// Customer Screens
import { CustomerHomeScreen } from './src/screens/customer/CustomerHomeScreen';
import { CustomerTrainingScreen } from './src/screens/customer/CustomerTrainingScreen';
import { CustomerDietScreen } from './src/screens/customer/CustomerDietScreen';
import { CustomerProgressScreen } from './src/screens/customer/CustomerProgressScreen';
import { CustomerMoreScreen } from './src/screens/customer/CustomerMoreScreen';

const MainAppContent = () => {
  const { isAuthenticated, activeRole, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [customerQrVisible, setCustomerQrVisible] = useState(false);

  // Set default tab based on authenticated role
  useEffect(() => {
    if (activeRole === 'GYM_OWNER') setActiveTab('overview');
    else if (activeRole === 'TRAINER') setActiveTab('home');
    else if (activeRole === 'CUSTOMER') setActiveTab('home');
  }, [activeRole]);

  // Loading splash state
  if (isLoading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
        <Text style={styles.loadingText}>Loading Gymora...</Text>
      </View>
    );
  }

  // If not authenticated, show role-based Auth Entry screen
  if (!isAuthenticated) {
    return (
      <SafeAreaView style={styles.safeArea}>
        <StatusBar style="dark" backgroundColor={COLORS.white} />
        <AuthEntryScreen />
      </SafeAreaView>
    );
  }

  const handleCustomerNavigate = (tab, sub) => {
    if (tab === 'today' || tab === 'home' || tab === 'dashboard') setActiveTab('home');
    else if (tab === 'workouts' || tab === 'trainers' || tab === 'training') setActiveTab('training');
    else if (tab === 'diet') setActiveTab('diet');
    else if (tab === 'progress') setActiveTab('progress');
    else if (tab === 'profile' || tab === 'more') setActiveTab('more');
    else setActiveTab(tab);
  };

  const handleTrainerNavigate = (tab, sub) => {
    if (tab === 'home' || tab === 'dashboard') setActiveTab('home');
    else if (tab === 'clients') setActiveTab('clients');
    else if (tab === 'schedule') setActiveTab('schedule');
    else if (tab === 'programs' || tab === 'workouts') setActiveTab('programs');
    else if (tab === 'more' || tab === 'profile' || tab === 'earnings') setActiveTab('more');
    else setActiveTab(tab);
  };

  const handleOwnerNavigate = (tab, sub) => {
    if (tab === 'overview' || tab === 'home' || tab === 'dashboard') setActiveTab('overview');
    else if (tab === 'members' || tab === 'enquiries') setActiveTab('members');
    else if (tab === 'trainers' || tab === 'hiring') setActiveTab('trainers');
    else if (tab === 'finances' || tab === 'revenue' || tab === 'payments') setActiveTab('finances');
    else if (tab === 'more' || tab === 'settings' || tab === 'operations' || tab === 'store') setActiveTab('more');
    else setActiveTab(tab);
  };

  const renderActiveScreen = () => {
    if (activeRole === 'GYM_OWNER') {
      switch (activeTab) {
        case 'overview':
        case 'dashboard':
          return <OwnerDashboardScreen onNavigateTab={handleOwnerNavigate} />;
        case 'members':
        case 'enquiries':
          return <OwnerMembersScreen />;
        case 'trainers':
        case 'hiring':
          return <OwnerTrainersScreen />;
        case 'finances':
        case 'revenue':
        case 'payments':
          return <OwnerFinancesScreen />;
        case 'more':
        case 'settings':
          return <OwnerMoreScreen />;
        default:
          return <OwnerDashboardScreen onNavigateTab={handleOwnerNavigate} />;
      }
    }

    if (activeRole === 'TRAINER') {
      switch (activeTab) {
        case 'home':
        case 'dashboard':
          return <TrainerDashboardScreen onNavigateTab={handleTrainerNavigate} />;
        case 'clients':
          return <TrainerClientsScreen />;
        case 'schedule':
          return <TrainerScheduleScreen onNavigateTab={handleTrainerNavigate} />;
        case 'programs':
        case 'workouts':
          return <TrainerProgramsScreen />;
        case 'more':
        case 'profile':
        case 'earnings':
          return <TrainerMoreScreen />;
        default:
          return <TrainerDashboardScreen onNavigateTab={handleTrainerNavigate} />;
      }
    }

    if (activeRole === 'CUSTOMER') {
      switch (activeTab) {
        case 'home':
        case 'today':
          return (
            <CustomerHomeScreen 
              onNavigateTab={handleCustomerNavigate} 
              externalQrVisible={customerQrVisible}
              onCloseExternalQr={() => setCustomerQrVisible(false)}
            />
          );
        case 'training':
        case 'workouts':
        case 'trainers':
          return <CustomerTrainingScreen />;
        case 'diet':
          return <CustomerDietScreen />;
        case 'progress':
          return <CustomerProgressScreen />;
        case 'more':
        case 'profile':
          return <CustomerMoreScreen />;
        default:
          return (
            <CustomerHomeScreen 
              onNavigateTab={handleCustomerNavigate} 
              externalQrVisible={customerQrVisible}
              onCloseExternalQr={() => setCustomerQrVisible(false)}
            />
          );
      }
    }

    return null;
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar style="dark" backgroundColor={COLORS.white} />
      <Header 
        onOpenQrPass={() => setCustomerQrVisible(true)} 
        onOpenNotifications={() => {
          if (activeRole === 'GYM_OWNER') setActiveTab('more');
          else if (activeRole === 'TRAINER') setActiveTab('more');
          else if (activeRole === 'CUSTOMER') setActiveTab('more');
        }}
      />
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
  loadingContainer: {
    flex: 1,
    backgroundColor: COLORS.white,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 12,
  },
  loadingText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
});
