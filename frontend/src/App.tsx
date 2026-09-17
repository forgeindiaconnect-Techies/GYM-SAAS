import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';

// Public
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/auth/LoginPage';
import CustomerRegisterPage from './pages/auth/CustomerRegisterPage';
import GymOwnerRegisterPage from './pages/auth/GymOwnerRegisterPage';
import GymOwnerIntroduction from './pages/auth/GymOwnerIntroduction';
import PendingPage from './pages/auth/PendingPage';
import ForgotPassword from './pages/auth/ForgotPassword';
import StatusPage from './pages/auth/StatusPage';
import TrainerInvitationPage from './pages/auth/TrainerInvitationPage';
import TrainerOnboarding from './pages/auth/TrainerOnboarding';

// Public Marketplace
import GymMarketplace from './pages/marketplace/GymMarketplace';
import GymDetails from './pages/marketplace/GymDetails';
import GymCheckout from './pages/marketplace/GymCheckout';

// Subscription
import SubscriptionPlansPage from './pages/subscription/SubscriptionPlansPage';
import GymOwnerSubscriptionPage from './pages/subscription/GymOwnerSubscriptionPage';
import PaymentPage from './pages/subscription/PaymentPage';

// Company
import AboutUs from './pages/company/AboutUs';
import Careers from './pages/company/Careers';
import Blog from './pages/company/Blog';
import Contact from './pages/company/Contact';

// Legal
import PrivacyPolicy from './pages/legal/PrivacyPolicy';
import TermsOfService from './pages/legal/TermsOfService';

// Gym Admin
import GymAdminLayout from './layouts/GymAdminLayout';
import GymAdminDashboard from './pages/admin/GymAdminDashboard';
import GymAdminProfile from './pages/admin/GymAdminProfile';
import GymAdminTrainers from './pages/admin/GymAdminTrainers';
import GymAdminMembers from './pages/admin/GymAdminMembers';
import GymAdminEquipment from './pages/admin/GymAdminEquipment';
import GymAdminMembershipPlans from './pages/admin/GymAdminMembershipPlans';
import GymAdminTrainerSchedule from './pages/admin/GymAdminTrainerSchedule';
import GymAdminSessionBookings from './pages/admin/GymAdminSessionBookings';
import GymAdminPayments from './pages/admin/GymAdminPayments';
import GymAdminAttendance from './pages/admin/GymAdminAttendance';
import GymAdminReports from './pages/admin/GymAdminReports';
import GymAdminNotifications from './pages/admin/GymAdminNotifications';
import GymAdminUserProfile from './pages/admin/GymAdminUserProfile';
import GymAdminSettings from './pages/admin/GymAdminSettings';
import GymAdminSubscription from './pages/admin/GymAdminSubscription';
import GymAdminDeletedDetails from './pages/admin/GymAdminDeletedDetails';
import GymAdminBranches from './pages/admin/GymAdminBranches';
import GymAdminAddBranch from './pages/admin/GymAdminAddBranch';
import GymAdminBranchProfile from './pages/admin/GymAdminBranchProfile';
import GymAdminImportCustomers from './pages/admin/GymAdminImportCustomers';

// Super Admin
import SuperAdminLayout from './layouts/SuperAdminLayout';
import SuperAdminDashboard from './pages/super-admin/SuperAdminDashboard';
import SuperAdminLeads from './pages/super-admin/SuperAdminLeads';
import SuperAdminAddGym from './pages/super-admin/SuperAdminAddGym';
import SuperAdminGymApprovals from './pages/super-admin/SuperAdminGymApprovals';
import SuperAdminInvitations from './pages/super-admin/SuperAdminInvitations';
import SuperAdminProfile from './pages/super-admin/SuperAdminProfile';
import SuperAdminSettings from './pages/super-admin/SuperAdminSettings';
import SuperAdminGymsDetails from './pages/super-admin/SuperAdminGymsDetails';
import SuperAdminGymsEdit from './pages/super-admin/SuperAdminGymsEdit';
import SuperAdminCustomers from './pages/super-admin/SuperAdminCustomers';
import SuperAdminGymOwners from './pages/super-admin/SuperAdminGymOwners';
import SuperAdminSubscriptions from './pages/super-admin/SuperAdminSubscriptions';
import SuperAdminDeletedDetails from './pages/super-admin/SuperAdminDeletedDetails';

// Member
import MemberLayout from './layouts/MemberLayout';
import MemberDashboard from './pages/member/MemberDashboard';
import MemberProfile from './pages/member/MemberProfile';
import MemberGymProfile from './pages/member/MemberGymProfile';
import MemberFindTrainers from './pages/member/MemberFindTrainers';
import MemberMyTrainer from './pages/member/MemberMyTrainer';
import MemberBookSession from './pages/member/MemberBookSession';
import MemberMyBookings from './pages/member/MemberMyBookings';
import MemberWorkoutPlan from './pages/member/MemberWorkoutPlan';
import MemberDietPlan from './pages/member/MemberDietPlan';
import MemberAIFitness from './pages/member/MemberAIFitness';
import MemberProgress from './pages/member/MemberProgress';
import MemberAttendance from './pages/member/MemberAttendance';
import MemberSubscription from './pages/member/MemberSubscription';
import MemberPayments from './pages/member/MemberPayments';
import MemberMessages from './pages/member/MemberMessages';
import MemberNotifications from './pages/member/MemberNotifications';
import MemberSettings from './pages/member/MemberSettings';

// Trainer
import TrainerLayout from './layouts/TrainerLayout';
import TrainerDashboard from './pages/trainer/TrainerDashboard';
import TrainerProfile from './pages/trainer/TrainerProfile';
import TrainerMembers from './pages/trainer/TrainerMembers';
import TrainerSchedule from './pages/trainer/TrainerSchedule';
import TrainerSessionBookings from './pages/trainer/TrainerSessionBookings';
import TrainerWorkoutPlans from './pages/trainer/TrainerWorkoutPlans';
import TrainerDietPlans from './pages/trainer/TrainerDietPlans';
import TrainerMemberProgress from './pages/trainer/TrainerMemberProgress';
import TrainerAttendance from './pages/trainer/TrainerAttendance';
import TrainerMessages from './pages/trainer/TrainerMessages';
import TrainerNotifications from './pages/trainer/TrainerNotifications';
import TrainerEarnings from './pages/trainer/TrainerEarnings';
import TrainerSettings from './pages/trainer/TrainerSettings';

// Stub dashboards
import stubDashboard from './pages/StubDashboard';
const ManagerDashboard = stubDashboard('Manager');
const ReceptionistDashboard = stubDashboard('Receptionist');

function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/register" element={<Navigate to="/register/customer" replace />} />
          <Route path="/register/customer" element={<CustomerRegisterPage />} />
          <Route path="/gym-owner-introduction" element={<GymOwnerIntroduction />} />
          <Route path="/register/gym-owner" element={<GymOwnerRegisterPage />} />
          <Route path="/invite/trainer/:token" element={<TrainerInvitationPage />} />
          <Route path="/invite/trainer/onboarding" element={<TrainerOnboarding />} />
          <Route path="/forgot-password" element={<ForgotPassword />} />
          
          {/* Gym Marketplace */}
          <Route path="/gyms" element={<GymMarketplace />} />
          <Route path="/gyms/:id" element={<GymDetails />} />
          <Route path="/gyms/:id/checkout" element={
            <ProtectedRoute allowedRoles={['MEMBER']}><GymCheckout /></ProtectedRoute>
          } />

          {/* Company Routes */}
          <Route path="/about" element={<AboutUs />} />
          <Route path="/careers" element={<Careers />} />
          <Route path="/blog" element={<Blog />} />
          <Route path="/contact" element={<Contact />} />
          
          {/* Legal Routes */}
          <Route path="/privacy-policy" element={<PrivacyPolicy />} />
          <Route path="/terms-of-service" element={<TermsOfService />} />

          {/* Post-Registration Routes (auth required) */}
          <Route path="/pending" element={<Navigate to="/status?type=pending" replace />} />
          <Route path="/status" element={
            <ProtectedRoute><StatusPage /></ProtectedRoute>
          } />
          <Route path="/subscription-plans" element={
            <ProtectedRoute><SubscriptionPlansPage /></ProtectedRoute>
          } />
          <Route path="/gym-owner/subscription" element={
            <ProtectedRoute><GymOwnerSubscriptionPage /></ProtectedRoute>
          } />
          <Route path="/gym-owner/payment" element={
            <ProtectedRoute><PaymentPage /></ProtectedRoute>
          } />

          {/* Member Routes */}
          <Route path="/member" element={
            <ProtectedRoute allowedRoles={['MEMBER']} requireSubscription>
              <MemberLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<MemberDashboard />} />
            <Route path="profile" element={<MemberProfile />} />
            <Route path="my-gym" element={<MemberGymProfile />} />
            <Route path="find-trainers" element={<MemberFindTrainers />} />
            <Route path="trainer" element={<MemberMyTrainer />} />
            <Route path="book-session" element={<MemberBookSession />} />
            <Route path="bookings" element={<MemberMyBookings />} />
            <Route path="workout" element={<MemberWorkoutPlan />} />
            <Route path="diet" element={<MemberDietPlan />} />
            <Route path="ai-assistant" element={<MemberAIFitness />} />
            <Route path="progress" element={<MemberProgress />} />
            <Route path="attendance" element={<MemberAttendance />} />
            <Route path="subscription" element={<MemberSubscription />} />
            <Route path="payments" element={<MemberPayments />} />
            <Route path="chat" element={<MemberMessages />} />
            <Route path="notifications" element={<MemberNotifications />} />
            <Route path="settings" element={<MemberSettings />} />
          </Route>

                    {/* Trainer Routes */}
          <Route path="/trainer" element={
            <ProtectedRoute allowedRoles={['TRAINER']}>
              <TrainerLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<TrainerDashboard />} />
            <Route path="profile" element={<TrainerProfile />} />
            <Route path="members" element={<TrainerMembers />} />
            <Route path="schedule" element={<TrainerSchedule />} />
            <Route path="session-bookings" element={<TrainerSessionBookings />} />
            <Route path="workout-plans" element={<TrainerWorkoutPlans />} />
            <Route path="diet-plans" element={<TrainerDietPlans />} />
            <Route path="member-progress" element={<TrainerMemberProgress />} />
            <Route path="attendance" element={<TrainerAttendance />} />
            <Route path="messages" element={<TrainerMessages />} />
            <Route path="earnings" element={<TrainerEarnings />} />
            <Route path="notifications" element={<TrainerNotifications />} />
            <Route path="settings" element={<TrainerSettings />} />
          </Route>

{/* Manager Dashboard */}
          <Route path="/manager/dashboard" element={
            <ProtectedRoute allowedRoles={['GYM_MANAGER']}>
              <ManagerDashboard />
            </ProtectedRoute>
          } />

          {/* Receptionist Dashboard */}
          <Route path="/receptionist/dashboard" element={
            <ProtectedRoute allowedRoles={['RECEPTIONIST']}>
              <ReceptionistDashboard />
            </ProtectedRoute>
          } />

                    {/* Gym Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'GYM_OWNER']} requireSubscription>
              <GymAdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<GymAdminDashboard />} />
            <Route path="gym-profile" element={<GymAdminProfile />} />
            <Route path="branches" element={<GymAdminBranches />} />
            <Route path="add-branch" element={<GymAdminAddBranch />} />
            <Route path="branches/:id" element={<GymAdminBranchProfile />} />
            <Route path="trainers" element={<GymAdminTrainers />} />
            <Route path="members" element={<GymAdminMembers />} />
            <Route path="equipment" element={<GymAdminEquipment />} />
            <Route path="membership-plans" element={<GymAdminMembershipPlans />} />
            <Route path="trainer-schedule" element={<GymAdminTrainerSchedule />} />
            <Route path="session-bookings" element={<GymAdminSessionBookings />} />
            <Route path="payments" element={<GymAdminPayments />} />
            <Route path="attendance" element={<GymAdminAttendance />} />
            <Route path="reports" element={<GymAdminReports />} />
            <Route path="notifications" element={<GymAdminNotifications />} />
            <Route path="profile" element={<GymAdminUserProfile />} />
            <Route path="settings" element={<GymAdminSettings />} />
            <Route path="subscription" element={<GymAdminSubscription />} />
            <Route path="deleted-details" element={<GymAdminDeletedDetails />} />
            <Route path="import-customers" element={<GymAdminImportCustomers />} />
          </Route>

{/* Super Admin Routes */}
          <Route path="/super-admin" element={
            <ProtectedRoute allowedRoles={['SUPER_ADMIN']}>
              <SuperAdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<SuperAdminDashboard />} />
            <Route path="leads" element={<SuperAdminLeads />} />
            <Route path="gyms/add" element={<SuperAdminAddGym />} />
            <Route path="gyms/details" element={<SuperAdminGymsDetails />} />
            <Route path="gyms/edit/:id" element={<SuperAdminGymsEdit />} />
            <Route path="customers" element={<SuperAdminCustomers />} />
            <Route path="gym-owners" element={<SuperAdminGymOwners />} />
            <Route path="gym-approvals" element={<SuperAdminGymApprovals />} />
            <Route path="invitations" element={<SuperAdminInvitations />} />
            <Route path="subscriptions" element={<SuperAdminSubscriptions />} />
            <Route path="deleted" element={<SuperAdminDeletedDetails />} />
            <Route path="profile" element={<SuperAdminProfile />} />
            <Route path="settings" element={<SuperAdminSettings />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

export default App;
