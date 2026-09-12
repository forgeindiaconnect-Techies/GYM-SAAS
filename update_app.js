const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, 'frontend', 'src', 'App.tsx');
let appContent = fs.readFileSync(appPath, 'utf8');

// Replace the Admin Routes section
const gymAdminImports = `// Gym Admin
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
import GymAdminSettings from './pages/admin/GymAdminSettings';`;

const trainerImports = `// Trainer
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
import TrainerSettings from './pages/trainer/TrainerSettings';`;

const memberImports = `// Member
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
import MemberSettings from './pages/member/MemberSettings';`;

const gymAdminRoutes = `          {/* Gym Admin Routes */}
          <Route path="/admin" element={
            <ProtectedRoute allowedRoles={['ADMIN', 'GYM_OWNER']}>
              <GymAdminLayout />
            </ProtectedRoute>
          }>
            <Route path="dashboard" element={<GymAdminDashboard />} />
            <Route path="gym-profile" element={<GymAdminProfile />} />
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
          </Route>`;

const trainerRoutes = `          {/* Trainer Routes */}
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
          </Route>`;

const memberRoutes = `          {/* Member Routes */}
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
          </Route>`;

// Replace Imports
appContent = appContent.replace(/\/\/ Admin[\s\S]*?(?=\/\/ Super Admin)/, gymAdminImports + '\n\n');
appContent = appContent.replace(/\/\/ Trainer[\s\S]*?(?=\/\/ Stub dashboards)/, trainerImports + '\n\n');
appContent = appContent.replace(/\/\/ Member[\s\S]*?(?=\/\/ Trainer)/, memberImports + '\n\n');

// Replace Routes
appContent = appContent.replace(/\{\/\* Admin Routes \*\/\}[\s\S]*?(?=\{\/\* Super Admin Routes \*\/})/, gymAdminRoutes + '\n\n');
appContent = appContent.replace(/\{\/\* Trainer Dashboard \*\/\}[\s\S]*?(?=\{\/\* Manager Dashboard \*\/})/, trainerRoutes + '\n\n');
appContent = appContent.replace(/\{\/\* Member Routes \(requires active subscription\) \*\/\}[\s\S]*?(?=\{\/\* Trainer Dashboard \*\/})/, memberRoutes + '\n\n');

fs.writeFileSync(appPath, appContent);
console.log("Updated App.tsx successfully.");
