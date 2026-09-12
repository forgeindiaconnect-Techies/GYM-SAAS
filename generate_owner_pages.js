const fs = require('fs');
const path = require('path');

const pages = [
  { name: 'OwnerMembers', label: 'Members', icon: 'Users' },
  { name: 'OwnerLeads', label: 'Leads / CRM', icon: 'Target' },
  { name: 'OwnerMemberships', label: 'Memberships', icon: 'CreditCard' },
  { name: 'OwnerPayments', label: 'Payments', icon: 'DollarSign' },
  { name: 'OwnerPendingDues', label: 'Pending Dues', icon: 'ClipboardList' },
  { name: 'OwnerAttendance', label: 'Attendance', icon: 'Activity' },
  { name: 'OwnerTrainers', label: 'Trainers', icon: 'Dumbbell' },
  { name: 'OwnerClasses', label: 'Classes & Sessions', icon: 'Calendar' },
  { name: 'OwnerWorkoutPlans', label: 'Workout Plans', icon: 'FileText' },
  { name: 'OwnerDietPlans', label: 'Diet Plans', icon: 'Utensils' },
  { name: 'OwnerOnlineTraining', label: 'Online Training', icon: 'Video' },
  { name: 'OwnerMemberProgress', label: 'Member Progress', icon: 'TrendingUp' },
  { name: 'OwnerEquipment', label: 'Equipment', icon: 'Wrench' },
  { name: 'OwnerMaintenance', label: 'Maintenance', icon: 'Tool' },
  { name: 'OwnerInventory', label: 'Inventory', icon: 'ShoppingCart' },
  { name: 'OwnerCommunication', label: 'Communication', icon: 'MessageSquare' },
  { name: 'OwnerOffers', label: 'Offers', icon: 'Gift' },
  { name: 'OwnerReports', label: 'Reports', icon: 'BarChart' },
  { name: 'OwnerAIAssistant', label: 'AI Business Assistant', icon: 'Bot' },
  { name: 'OwnerBranches', label: 'Branches', icon: 'Building' },
  { name: 'OwnerSettings', label: 'Settings', icon: 'Settings' }
];

const dir = path.join(__dirname, 'frontend/src/pages/gym-owner');
if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

pages.forEach(p => {
  const code = `import { ${p.icon} } from 'lucide-react';

const ${p.name} = () => {
  return (
    <div className="max-w-6xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">${p.label}</h1>
        <p className="text-[#A1A1AA]">Manage your gym's ${p.label.toLowerCase()} from here.</p>
      </div>

      <div className="bg-[#151515] border border-[#272727] rounded-2xl p-10 flex flex-col items-center justify-center text-center min-h-[50vh]">
        <div className="w-20 h-20 bg-[#D4FF00]/10 rounded-full flex items-center justify-center mb-6">
          <${p.icon} size={40} className="text-[#D4FF00]" />
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">No ${p.label} Found</h2>
        <p className="text-[#A1A1AA] max-w-md mb-8">
          You haven't added any ${p.label.toLowerCase()} yet. Start by creating your first entry to populate this section.
        </p>
        <button className="px-6 py-3 bg-[#D4FF00] text-black font-semibold rounded-xl hover:bg-[#bce600] transition-colors">
          Add New ${p.label}
        </button>
      </div>
    </div>
  );
};

export default ${p.name};
`;
  fs.writeFileSync(path.join(dir, p.name + '.tsx'), code);
});
console.log('Generated ' + pages.length + ' gym-owner stub pages.');
