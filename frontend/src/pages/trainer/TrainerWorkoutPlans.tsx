import { useState } from 'react';
import { Plus, Search, Dumbbell, MoreVertical, X, Edit, UserPlus, Trash2 } from 'lucide-react';

const defaultPlans = [
  { name: 'Beginner Full Body', category: 'General', duration: '45 Min', level: 'Beginner', users: 12 },
  { name: 'Advanced Push/Pull/Legs', category: 'Hypertrophy', duration: '60 Min', level: 'Advanced', users: 5 },
  { name: 'HIIT Fat Burner', category: 'Cardio', duration: '30 Min', level: 'Intermediate', users: 8 },
  { name: 'Core & Stability', category: 'Strength', duration: '40 Min', level: 'Beginner', users: 3 },
];

const TrainerWorkoutPlans = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [plans, setPlans] = useState(defaultPlans);
  const [activeDropdown, setActiveDropdown] = useState<number | null>(null);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  
  const [form, setForm] = useState({
    name: '',
    category: 'General',
    level: 'Beginner',
    duration: '45 Min',
  });

  const filteredPlans = plans.filter(plan =>
    plan.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.category.toLowerCase().includes(searchTerm.toLowerCase()) ||
    plan.level.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleCreatePlan = (e: React.FormEvent) => {
    e.preventDefault();
    setPlans([{ ...form, users: 0 }, ...plans]);
    setIsCreateModalOpen(false);
    setForm({ name: '', category: 'General', level: 'Beginner', duration: '45 Min' });
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold">Workout Plans</h1>
          <p className="text-[#4A514D]">Manage templates and custom routines</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="relative flex-1 md:w-64">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A514D]" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search plans..."
              className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl pl-10 pr-9 py-2 text-sm focus:border-[#34483F] outline-none"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-[#A8ADA9] hover:text-[#202522]"
              >
                <X size={16} />
              </button>
            )}
          </div>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            className="px-4 py-2 bg-[#34483F] text-white rounded-xl font-bold flex items-center gap-2 shrink-0 hover:bg-[#C6A77D] transition-colors"
          >
            <Plus size={18} /> Create Plan
          </button>
        </div>
      </div>

      {filteredPlans.length === 0 ? (
        <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-12 text-center">
          <Dumbbell size={48} className="mx-auto text-[#A8ADA9] mb-3" />
          <h3 className="text-lg font-bold text-[#202522]">No workout plans found</h3>
          <p className="text-sm text-[#4A514D] mt-1">No plans matching &quot;{searchTerm}&quot;.</p>
        </div>
      ) : (
        <div className="grid md:grid-cols-3 gap-6">
          {filteredPlans.map((plan, i) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-5 relative group hover:border-[#34483F]/50 transition-colors cursor-pointer">
              <button 
                onClick={(e) => {
                  e.stopPropagation();
                  setActiveDropdown(activeDropdown === i ? null : i);
                }}
                className="absolute top-4 right-4 p-1 text-[#4A514D] hover:text-[#202522] hover:bg-gray-100 rounded-lg transition-colors z-10"
              >
                <MoreVertical size={18}/>
              </button>
              
              {activeDropdown === i && (
                <>
                  <div className="fixed inset-0 z-10" onClick={(e) => { e.stopPropagation(); setActiveDropdown(null); }}></div>
                  <div className="absolute top-12 right-4 w-40 bg-[#FFFFFF] border border-[#DCD9CD] shadow-xl rounded-xl overflow-hidden z-20 animate-in fade-in zoom-in-95">
                    <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#202522] hover:bg-[#F5F3EE] flex items-center gap-2 transition-colors">
                      <Edit size={14} /> Edit Plan
                    </button>
                    <button className="w-full text-left px-4 py-2.5 text-sm font-medium text-[#202522] hover:bg-[#F5F3EE] flex items-center gap-2 transition-colors">
                      <UserPlus size={14} /> Assign
                    </button>
                    <button 
                      onClick={(e) => {
                        e.stopPropagation();
                        setPlans(plans.filter((_, idx) => idx !== i));
                        setActiveDropdown(null);
                      }}
                      className="w-full text-left px-4 py-2.5 text-sm font-medium text-red-600 hover:bg-red-50 flex items-center gap-2 transition-colors border-t border-[#DCD9CD]"
                    >
                      <Trash2 size={14} /> Delete
                    </button>
                  </div>
                </>
              )}
              <div className="w-12 h-12 bg-[#34483F]/10 rounded-xl flex items-center justify-center mb-4 text-[#34483F]">
                <Dumbbell size={24} />
              </div>
              <h3 className="font-bold text-lg mb-1">{plan.name}</h3>
              <span className="inline-block px-2 py-1 bg-[#FFFFFF] rounded text-xs text-[#4A514D] mb-4 border border-[#DCD9CD]">
                {plan.category}
              </span>
              
              <div className="grid grid-cols-2 gap-4 text-sm mt-2 pt-4 border-t border-[#DCD9CD]">
                <div>
                  <p className="text-[#4A514D] text-xs">Level</p>
                  <p className="font-medium">{plan.level}</p>
                </div>
                <div>
                  <p className="text-[#4A514D] text-xs">Assigned</p>
                  <p className="font-medium text-[#34483F]">{plan.users} Clients</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#DCD9CD] overflow-hidden">
            <div className="p-6 border-b border-[#DCD9CD] flex justify-between items-center bg-[#F2EFE8]">
              <h2 className="text-xl font-bold text-[#202522]">Create Workout Plan</h2>
              <button 
                onClick={() => setIsCreateModalOpen(false)} 
                className="p-2 text-[#4A514D] hover:text-[#202522] hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X size={22} />
              </button>
            </div>
            
            <form onSubmit={handleCreatePlan} className="p-6 space-y-5">
              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Plan Name *</label>
                <input 
                  type="text"
                  value={form.name}
                  onChange={(e) => setForm({ ...form, name: e.target.value })}
                  placeholder="e.g. 4-Week Shred"
                  className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F]"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[#4A514D] mb-2">Category *</label>
                  <select 
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F]"
                    required
                  >
                    <option value="General">General</option>
                    <option value="Hypertrophy">Hypertrophy</option>
                    <option value="Strength">Strength</option>
                    <option value="Cardio">Cardio</option>
                    <option value="Mobility">Mobility</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#4A514D] mb-2">Level *</label>
                  <select 
                    value={form.level}
                    onChange={(e) => setForm({ ...form, level: e.target.value })}
                    className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F]"
                    required
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#4A514D] mb-2">Duration per session *</label>
                <input 
                  type="text"
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="e.g. 45 Min"
                  className="w-full bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl px-4 py-3 text-sm outline-none focus:border-[#34483F]"
                  required
                />
              </div>

              <div className="pt-4 flex justify-end gap-3 border-t border-[#DCD9CD]">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-5 py-2.5 rounded-xl font-bold text-[#4A514D] hover:bg-[#E8E5DA] transition-colors text-sm"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 rounded-xl font-bold bg-[#34483F] text-white hover:bg-[#C6A77D] transition-colors text-sm"
                >
                  Create Plan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerWorkoutPlans;