const fs = require('fs');
const path = require('path');

const generateComponent = (name, role) => `import React from 'react';

const ${name} = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-white tracking-tight">${name.replace(/([A-Z])/g, ' $1').trim()}</h1>
          <p className="text-[#A1A1AA] mt-1">Manage your ${name.replace(/([A-Z])/g, ' $1').trim().toLowerCase()} here.</p>
        </div>
        <button className="px-4 py-2 bg-[#FF3366] text-white rounded-xl font-semibold hover:bg-[#E62E5C] transition-colors">
          Action
        </button>
      </div>

      <div className="bg-[#101010] border border-[#272727] rounded-2xl p-6">
        <p className="text-[#A1A1AA]">This is a placeholder for the ${name} page. Implementation coming soon.</p>
      </div>
    </div>
  );
};

export default ${name};
`;

const pages = {
  admin: [
    'GymAdminDashboard', 'GymAdminProfile', 'GymAdminTrainers', 'GymAdminMembers',
    'GymAdminEquipment', 'GymAdminMembershipPlans', 'GymAdminTrainerSchedule',
    'GymAdminSessionBookings', 'GymAdminPayments', 'GymAdminAttendance',
    'GymAdminReports', 'GymAdminNotifications', 'GymAdminSettings', 'GymAdminUserProfile'
  ],
  trainer: [
    'TrainerDashboard', 'TrainerProfile', 'TrainerMembers', 'TrainerSchedule',
    'TrainerSessionBookings', 'TrainerWorkoutPlans', 'TrainerDietPlans',
    'TrainerMemberProgress', 'TrainerAttendance', 'TrainerMessages',
    'TrainerNotifications', 'TrainerEarnings', 'TrainerSettings'
  ],
  member: [
    'MemberDashboard', 'MemberProfile', 'MemberGymProfile', 'MemberFindTrainers',
    'MemberMyTrainer', 'MemberBookSession', 'MemberMyBookings', 'MemberWorkoutPlan',
    'MemberDietPlan', 'MemberAIFitness', 'MemberProgress', 'MemberAttendance',
    'MemberSubscription', 'MemberPayments', 'MemberMessages', 'MemberNotifications',
    'MemberSettings'
  ]
};

const baseDir = path.join(__dirname, 'frontend', 'src', 'pages');

Object.keys(pages).forEach(role => {
  const dir = path.join(baseDir, role);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  pages[role].forEach(page => {
    const filePath = path.join(dir, `${page}.tsx`);
    if (!fs.existsSync(filePath)) {
      fs.writeFileSync(filePath, generateComponent(page, role));
      console.log(`Created: ${filePath}`);
    }
  });
});

console.log("Finished generating missing pages.");
