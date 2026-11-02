import React from 'react';
import { Routes, Route, Navigate, useNavigate, useLocation } from 'react-router-dom';
import { AuthProvider, useMobileAuth } from './shared/auth/AuthContext';
import { MobileLayout } from './shared/components/MobileLayout';
import { MobileHeader } from './shared/components/MobileHeader';
import { MobileBottomNav } from './shared/components/MobileBottomNav';

// Auth Screens
import RoleSelectorScreen from './modules/auth/screens/RoleSelectorScreen';
import MobileLoginScreen from './modules/auth/screens/MobileLoginScreen';

// Gym Owner Module Screens
import GymOwnerDashboardScreen from './modules/gym-owner/screens/GymOwnerDashboardScreen';
import GymOwnerMembersScreen from './modules/gym-owner/screens/GymOwnerMembersScreen';
import GymOwnerTrainersScreen from './modules/gym-owner/screens/GymOwnerTrainersScreen';
import GymOwnerFinancesScreen from './modules/gym-owner/screens/GymOwnerFinancesScreen';
import GymOwnerSettingsScreen from './modules/gym-owner/screens/GymOwnerSettingsScreen';

// Trainer Module Screens
import TrainerDashboardScreen from './modules/trainer/screens/TrainerDashboardScreen';
import TrainerClientsScreen from './modules/trainer/screens/TrainerClientsScreen';
import TrainerWorkoutsScreen from './modules/trainer/screens/TrainerWorkoutsScreen';
import TrainerEarningsScreen from './modules/trainer/screens/TrainerEarningsScreen';
import TrainerProfileScreen from './modules/trainer/screens/TrainerProfileScreen';

// Customer Module Screens
import CustomerDashboardScreen from './modules/customer/screens/CustomerDashboardScreen';
import CustomerWorkoutsScreen from './modules/customer/screens/CustomerWorkoutsScreen';
import CustomerDietScreen from './modules/customer/screens/CustomerDietScreen';
import CustomerTrainersScreen from './modules/customer/screens/CustomerTrainersScreen';
import CustomerProfileScreen from './modules/customer/screens/CustomerProfileScreen';

// Generic Protected Container with Header & Bottom Nav
const ModuleContainer: React.FC<{
  role: 'GYM_OWNER' | 'TRAINER' | 'CUSTOMER';
  title: string;
  subtitle?: string;
  showBack?: boolean;
  children: React.ReactNode;
}> = ({ role, title, subtitle, showBack, children }) => {
  const navigate = useNavigate();
  return (
    <MobileLayout>
      <MobileHeader 
        title={title} 
        subtitle={subtitle} 
        showBack={showBack} 
        onBack={() => navigate(-1)} 
      />
      <div className="flex-1 p-4 overflow-y-auto">
        {children}
      </div>
      <MobileBottomNav role={role} />
    </MobileLayout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <Routes>
        {/* Onboarding & Authentication */}
        <Route path="/" element={<RoleSelectorScreen />} />
        <Route path="/login" element={<MobileLoginScreen />} />

        {/* 1. Gym Owner Mobile Application Module */}
        <Route 
          path="/owner" 
          element={
            <ModuleContainer role="GYM_OWNER" title="Gym Overview" subtitle="Downtown Flagship">
              <GymOwnerDashboardScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/owner/members" 
          element={
            <ModuleContainer role="GYM_OWNER" title="Member Roster" subtitle="All registered passes" showBack>
              <GymOwnerMembersScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/owner/trainers" 
          element={
            <ModuleContainer role="GYM_OWNER" title="Trainer Staff" subtitle="Certified coaches & commissions" showBack>
              <GymOwnerTrainersScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/owner/finances" 
          element={
            <ModuleContainer role="GYM_OWNER" title="Revenue & Payouts" subtitle="Financial health" showBack>
              <GymOwnerFinancesScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/owner/settings" 
          element={
            <ModuleContainer role="GYM_OWNER" title="Gym Settings" subtitle="Branches & profile" showBack>
              <GymOwnerSettingsScreen />
            </ModuleContainer>
          } 
        />

        {/* 2. Trainer Mobile Application Module */}
        <Route 
          path="/trainer" 
          element={
            <ModuleContainer role="TRAINER" title="Trainer Portal" subtitle="Today's coaching agenda">
              <TrainerDashboardScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/trainer/clients" 
          element={
            <ModuleContainer role="TRAINER" title="My Clients" subtitle="Adherence & fitness tracks" showBack>
              <TrainerClientsScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/trainer/workouts" 
          element={
            <ModuleContainer role="TRAINER" title="Workout Library" subtitle="Training splits & exercise moves" showBack>
              <TrainerWorkoutsScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/trainer/earnings" 
          element={
            <ModuleContainer role="TRAINER" title="Earnings & Wallet" subtitle="Commission breakdown" showBack>
              <TrainerEarningsScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/trainer/profile" 
          element={
            <ModuleContainer role="TRAINER" title="Coach Profile" subtitle="Badges & credentials" showBack>
              <TrainerProfileScreen />
            </ModuleContainer>
          } 
        />

        {/* 3. Customer Mobile Application Module */}
        <Route 
          path="/customer" 
          element={
            <ModuleContainer role="CUSTOMER" title="Gymora Fitness" subtitle="Your personal workout companion">
              <CustomerDashboardScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/customer/workouts" 
          element={
            <ModuleContainer role="CUSTOMER" title="Workout Splits" subtitle="Log today's exercises" showBack>
              <CustomerWorkoutsScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/customer/diet" 
          element={
            <ModuleContainer role="CUSTOMER" title="Daily Nutrition" subtitle="Calorie & macro tracker" showBack>
              <CustomerDietScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/customer/trainers" 
          element={
            <ModuleContainer role="CUSTOMER" title="Elite Trainers" subtitle="1-on-1 PT booking" showBack>
              <CustomerTrainersScreen />
            </ModuleContainer>
          } 
        />
        <Route 
          path="/customer/profile" 
          element={
            <ModuleContainer role="CUSTOMER" title="Member Profile" subtitle="Card pass & attendance history" showBack>
              <CustomerProfileScreen />
            </ModuleContainer>
          } 
        />

        {/* Fallback */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </AuthProvider>
  );
};
export default App;

