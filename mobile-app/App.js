import React, { useState, useEffect } from 'react';
import { View, StyleSheet, Platform, StatusBar as RNStatusBar, ActivityIndicator, Text, BackHandler } from 'react-native';
import { SafeAreaProvider, SafeAreaView } from 'react-native-safe-area-context';
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
import { CustomerFitnessScreen } from './src/screens/customer/CustomerFitnessScreen';
import { CustomerStoreScreen } from './src/screens/customer/CustomerStoreScreen';
import { CustomerMoreScreen } from './src/screens/customer/CustomerMoreScreen';

const MainAppContent = () => {
  const { isAuthenticated, activeRole, isLoading } = useAuth();
  const [activeTab, setActiveTab] = useState('home');
  const [activeSub, setActiveSub] = useState(null);
  const [navHistory, setNavHistory] = useState([]);
  const [customerQrVisible, setCustomerQrVisible] = useState(false);

  // Set default tab based on authenticated role
  useEffect(() => {
    if (activeRole === 'GYM_OWNER') {
      setActiveTab('overview');
      setActiveSub(null);
    } else if (activeRole === 'TRAINER') {
      setActiveTab('home');
      setActiveSub(null);
    } else if (activeRole === 'CUSTOMER') {
      setActiveTab('home');
      setActiveSub(null);
    }
    setNavHistory([]);
  }, [activeRole]);

  // Navigate helper with history stack
  const navigateTo = (newTab, newSub = null) => {
    if (newTab === activeTab && newSub === activeSub) return;
    setNavHistory(prev => [...prev.slice(-20), { tab: activeTab, sub: activeSub }]);
    setActiveTab(newTab);
    setActiveSub(newSub);
  };

  // Android hardware Back button handling
  useEffect(() => {
    const onBackPress = () => {
      // 1. Close QR Pass modal if open
      if (customerQrVisible) {
        setCustomerQrVisible(false);
        return true;
      }

      // 2. Clear sub-section if active
      if (activeSub) {
        setActiveSub(null);
        return true;
      }

      // 3. Pop history stack if not empty
      if (navHistory.length > 0) {
        const last = navHistory[navHistory.length - 1];
        setNavHistory(prev => prev.slice(0, -1));
        setActiveTab(last.tab);
        setActiveSub(last.sub || null);
        return true;
      }

      // 4. Return to root tab if not already there
      const defaultTab = activeRole === 'GYM_OWNER' ? 'overview' : 'home';
      if (activeTab !== defaultTab) {
        setActiveTab(defaultTab);
        setActiveSub(null);
        return true;
      }

      return false; // Exit app
    };

    const backHandler = BackHandler.addEventListener('hardwareBackPress', onBackPress);
    return () => backHandler.remove();
  }, [customerQrVisible, activeSub, navHistory, activeTab, activeRole]);

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

  const handleCustomerNavigate = (tab, sub = null) => {
    if (tab === 'today' || tab === 'home' || tab === 'dashboard') {
      navigateTo('home', sub || 'dashboard');
    } else if (tab === 'workouts' || tab === 'trainers' || tab === 'training') {
      navigateTo('training', sub || (tab === 'workouts' ? 'workout_plan' : 'training'));
    } else if (tab === 'fitness' || tab === 'diet' || tab === 'progress') {
      navigateTo('fitness', sub || (tab === 'diet' ? 'diet' : tab === 'progress' ? 'progress' : 'workout'));
    } else if (tab === 'store' || tab === 'cart' || tab === 'orders' || tab === 'payments') {
      navigateTo('store', sub || (tab === 'cart' ? 'cart' : tab === 'orders' ? 'orders' : tab === 'payments' ? 'payments' : 'store'));
    } else if (tab === 'referrals' || tab === 'rewards' || tab === 'reviews' || tab === 'membership' || tab === 'notifications') {
      navigateTo('more', tab);
    } else if (tab === 'profile' || tab === 'more') {
      navigateTo('more', sub || 'none');
    } else {
      navigateTo(tab, sub);
    }
  };

  const handleTrainerNavigate = (tab, sub = null) => {
    if (tab === 'home' || tab === 'dashboard') {
      navigateTo('home', null);
    } else if (tab === 'clients') {
      navigateTo('clients', null);
    } else if (tab === 'schedule') {
      navigateTo('schedule', null);
    } else if (tab === 'programs' || tab === 'workouts') {
      navigateTo('programs', sub || (tab === 'workouts' ? 'workout-plans' : 'none'));
    } else if (tab === 'more' || tab === 'profile' || tab === 'earnings') {
      navigateTo('more', sub || (tab === 'earnings' ? 'financials' : (tab === 'profile' ? 'profile' : 'none')));
    } else {
      navigateTo(tab, sub);
    }
  };

  const handleOwnerNavigate = (tab, sub = null) => {
    if (tab === 'overview' || tab === 'home' || tab === 'dashboard') {
      navigateTo('overview', null);
    } else if (tab === 'members') {
      navigateTo('members', sub || 'members');
    } else if (tab === 'enquiries') {
      navigateTo('members', 'enquiries');
    } else if (tab === 'trainers') {
      navigateTo('trainers', sub || 'trainers');
    } else if (tab === 'hiring' || tab === 'trainer_hiring' || tab === 'jobs') {
      navigateTo('trainers', 'hiring');
    } else if (tab === 'finances' || tab === 'revenue') {
      navigateTo('finances', sub || 'analytics');
    } else if (tab === 'payments') {
      navigateTo('finances', 'payments');
    } else if (
      tab === 'equipment' || 
      tab === 'session_bookings' || 
      tab === 'bookings' || 
      tab === 'attendance' || 
      tab === 'notifications' || 
      tab === 'store_history' || 
      tab === 'store_orders' || 
      tab === 'store_products' || 
      tab === 'store_inventory' || 
      tab === 'store_overview' || 
      tab === 'reviews' || 
      tab === 'plans' || 
      tab === 'branches' || 
      tab === 'gym_profile' || 
      tab === 'reports' || 
      tab === 'rewards' || 
      tab === 'referrals'
    ) {
      const subTarget = tab === 'bookings' ? 'session_bookings' : tab;
      navigateTo('more', sub || subTarget);
    } else if (tab === 'more' || tab === 'settings' || tab === 'operations' || tab === 'store') {
      navigateTo('more', sub || null);
    } else {
      navigateTo(tab, sub);
    }
  };

  const handleBottomTabSelect = (tabKey) => {
    if (tabKey === activeTab && !activeSub) return;
    navigateTo(tabKey, null);
  };

  const handleGoMainPage = () => {
    setCustomerQrVisible(false);
    if (activeRole === 'GYM_OWNER') {
      setActiveTab('overview');
      setActiveSub(null);
    } else if (activeRole === 'TRAINER') {
      setActiveTab('home');
      setActiveSub(null);
    } else if (activeRole === 'CUSTOMER') {
      setActiveTab('home');
      setActiveSub('dashboard');
    }
  };

  const renderActiveScreen = () => {
    if (activeRole === 'GYM_OWNER') {
      switch (activeTab) {
        case 'overview':
        case 'dashboard':
          return <OwnerDashboardScreen onNavigateTab={handleOwnerNavigate} />;
        case 'members':
        case 'enquiries':
          return <OwnerMembersScreen initialSection={activeSub === 'enquiries' ? 'enquiries' : 'members'} />;
        case 'trainers':
        case 'hiring':
        case 'trainer_hiring':
          return <OwnerTrainersScreen initialTab={activeSub === 'hiring' || activeTab === 'trainer_hiring' ? 'hiring' : 'trainers'} />;
        case 'finances':
        case 'revenue':
        case 'payments':
          return <OwnerFinancesScreen initialTab={activeSub === 'payments' ? 'payments' : 'analytics'} />;
        case 'more':
        case 'settings':
        case 'operations':
        case 'store':
        case 'equipment':
        case 'session_bookings':
        case 'attendance':
        case 'notifications':
        case 'store_history':
        case 'store_orders':
          return (
            <OwnerMoreScreen 
              initialSubPage={activeSub || (activeTab !== 'more' && activeTab !== 'settings' && activeTab !== 'operations' && activeTab !== 'store' ? activeTab : undefined)} 
              onCloseSubPage={() => setActiveSub(null)} 
              onNavigateTab={handleOwnerNavigate} 
            />
          );
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
          return <TrainerClientsScreen onNavigateTab={handleTrainerNavigate} />;
        case 'schedule':
          return <TrainerScheduleScreen onNavigateTab={handleTrainerNavigate} />;
        case 'programs':
        case 'workouts':
          return <TrainerProgramsScreen initialSection={activeSub || 'none'} />;
        case 'more':
        case 'profile':
        case 'earnings':
          return <TrainerMoreScreen initialSection={activeSub || (activeTab === 'profile' ? 'profile' : (activeTab === 'earnings' ? 'financials' : 'none'))} />;
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
              initialSubTab={activeSub === 'gym' ? 'gym' : 'dashboard'}
            />
          );
        case 'training':
        case 'trainers':
          if (activeSub === 'workout' || activeSub === 'workout_plan' || activeSub === 'workouts') {
            return <CustomerFitnessScreen initialSubTab="workout" />;
          }
          return <CustomerTrainingScreen initialSubTab={activeSub || 'training'} />;
        case 'workouts':
        case 'workout':
        case 'workout_plan':
        case 'fitness':
        case 'diet':
        case 'progress':
          return (
            <CustomerFitnessScreen 
              initialSubTab={
                activeSub === 'workout' || activeSub === 'workout_plan' || activeSub === 'workouts' || activeTab === 'workouts' || activeTab === 'workout' || activeTab === 'workout_plan'
                  ? 'workout'
                  : (activeSub || (activeTab === 'diet' ? 'diet' : activeTab === 'progress' ? 'progress' : 'ai'))
              } 
            />
          );
        case 'store':
        case 'cart':
        case 'orders':
          return (
            <CustomerStoreScreen 
              initialSubTab={activeSub || (activeTab === 'cart' ? 'cart' : activeTab === 'orders' ? 'orders' : 'store')} 
            />
          );
        case 'more':
        case 'profile':
        case 'rewards':
        case 'referrals':
        case 'reviews':
          return (
            <CustomerMoreScreen 
              initialSection={(activeTab === 'rewards' || activeTab === 'referrals' || activeTab === 'reviews') ? activeTab : (activeSub || 'none')} 
              onNavigateTab={handleCustomerNavigate}
            />
          );
        default:
          return (
            <CustomerHomeScreen 
              onNavigateTab={handleCustomerNavigate} 
              externalQrVisible={customerQrVisible}
              onCloseExternalQr={() => setCustomerQrVisible(false)}
              initialSubTab={activeSub === 'gym' ? 'gym' : 'dashboard'}
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
        onPressBrand={handleGoMainPage}
        onOpenNotifications={() => {
          if (activeRole === 'GYM_OWNER') handleOwnerNavigate('more', 'notifications');
          else if (activeRole === 'TRAINER') handleTrainerNavigate('more', 'notifications');
          else if (activeRole === 'CUSTOMER') handleCustomerNavigate('more', 'notifications');
        }}
      />
      <View style={styles.body}>
        {renderActiveScreen()}
      </View>
      <BottomTabBar activeTab={activeTab} onSelectTab={handleBottomTabSelect} />
    </SafeAreaView>
  );
};

export default function App() {
  return (
    <SafeAreaProvider>
      <AuthProvider>
        <MainAppContent />
      </AuthProvider>
    </SafeAreaProvider>
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
