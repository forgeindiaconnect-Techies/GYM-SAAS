import { Link, useNavigate } from 'react-router-dom';
import {
  Building2, MapPin, LayoutDashboard, Users, UserPlus, BrainCircuit, Activity, ArrowRight, SkipForward
} from 'lucide-react';

const steps = [
  {
    icon: Building2,
    title: 'Register Your Gym',
    desc: 'Provide basic owner and gym information and create your account securely.',
    details: ['Gym Name', 'Owner Full Name', 'Email Address', 'Phone Number', 'Secure Password']
  },
  {
    icon: MapPin,
    title: 'Add Your Gym Details',
    desc: 'Provide comprehensive gym information such as equipment, facilities, location, and AC details.',
    details: ['Gym Address & Location', 'Available Facilities', 'Equipment Inventory', 'AC / Non-AC Status', 'Operating Hours']
  },
  {
    icon: LayoutDashboard,
    title: 'Get Your Gym Dashboard',
    desc: 'After super admin approval, gain access to your dedicated and powerful Gym Owner Dashboard.',
    details: ['Revenue Overview', 'Active Memberships', 'Trainer Statistics', 'Recent Bookings', 'Quick Actions']
  },
  {
    icon: UserPlus,
    title: 'Manage Trainers',
    desc: 'Add and hire trainers, manage trainer information, and approve their platform access.',
    details: ['Add New Trainers', 'Assign Specializations', 'Set Working Hours', 'Manage Salary/Revenue', 'View Performance']
  },
  {
    icon: Users,
    title: 'Manage Members',
    desc: 'Seamlessly manage gym members, memberships, and keep track of all member-related information.',
    details: ['Add New Members', 'Assign Membership Plans', 'Track Attendance', 'Manage Renewals', 'View Health Profiles']
  },
  {
    icon: BrainCircuit,
    title: 'Use AI for Fitness Management',
    desc: 'Member information is used by the AI to generate exercise & diet recommendations, helping trainers guide members.',
    details: ['AI Workout Generation', 'AI Diet Planning', 'Body Metrics Tracking', 'Automated Recommendations', 'Progress Analytics']
  },
  {
    icon: Activity,
    title: 'Start Managing Your Gym',
    desc: 'Registration → Review → Approval → Dashboard → Full Management. It’s that simple!',
    details: ['Fully Automated', 'Cloud Based', 'Secure Data', '24/7 Access', 'Grow Your Business']
  },
];

const GymOwnerIntroduction = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#F2EFE8] font-sans selection:bg-[#164A4A] selection:text-white">
      {/* Navbar */}
      <nav className="bg-white border-b border-[#D3DFDA] sticky top-0 z-50 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/" className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] rounded-lg flex items-center justify-center">
                <Activity className="text-white" size={20} />
              </div>
              <span className="text-xl font-bold tracking-tight text-[#202828]">AI GYM</span>
            </Link>
            <Link 
              to="/register/gym-owner"
              className="text-sm font-semibold text-[#6fa3a0] hover:text-[#164A4A] flex items-center gap-1 transition-colors"
            >
              Skip Introduction <SkipForward size={14} />
            </Link>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 lg:py-24">
        {/* Header Section */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-2 bg-[#164A4A]/10 border border-[#164A4A]/20 rounded-full px-4 py-1.5 text-[#164A4A] text-xs font-bold uppercase tracking-widest mb-6">
            <Building2 size={14} /> For Gym Owners
          </div>
          <h1 className="text-4xl md:text-5xl lg:text-6xl font-extrabold text-[#202828] tracking-tight mb-6 leading-tight">
            Manage Your Gym <br />
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#164A4A] to-[#6fa3a0]">Smarter with AI</span>
          </h1>
          <p className="text-lg md:text-xl text-[#455250] leading-relaxed">
            Learn how our AI-powered gym management platform helps you manage your gym, trainers, members, memberships, and fitness programs.
          </p>
        </div>



        {/* Steps Section */}
        <div className="mb-24">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold text-[#202828]">How It Works</h2>
            <div className="w-20 h-1 bg-[#164A4A] mx-auto mt-4 rounded-full"></div>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {steps.map((step, idx) => {
              const Icon = step.icon;
              return (
                <div key={idx} className="bg-white rounded-2xl p-8 shadow-sm hover:shadow-xl border border-[#D3DFDA] transition-all duration-300 group hover:-translate-y-1 relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-[#D3DFDA]/50 to-transparent rounded-bl-full -z-10 group-hover:scale-110 transition-transform"></div>
                  
                  <div className="flex items-center gap-4 mb-6">
                    <div className="w-14 h-14 bg-[#F1F5F3] text-[#6fa3a0] rounded-xl flex items-center justify-center shrink-0 group-hover:bg-[#164A4A] group-hover:text-white transition-colors shadow-sm">
                      <Icon size={24} />
                    </div>
                    <div className="text-[#A8ADA9] font-black text-4xl opacity-20 group-hover:text-[#164A4A] transition-colors">
                      0{idx + 1}
                    </div>
                  </div>
                  
                  <h3 className="text-xl font-bold text-[#202828] mb-3">{step.title}</h3>
                  <p className="text-[#455250] leading-relaxed">{step.desc}</p>
                </div>
              );
            })}
          </div>
        </div>

        {/* Action Bottom Section */}
        <div className="max-w-4xl mx-auto bg-white rounded-3xl p-10 md:p-14 shadow-xl border border-[#D3DFDA] text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_rgba(22,163,74,0.05)_0%,_transparent_70%)] pointer-events-none"></div>
          
          <h2 className="text-3xl font-bold text-[#202828] mb-4 relative z-10">Ready to Transform Your Gym?</h2>
          <p className="text-[#455250] mb-10 text-lg relative z-10 max-w-xl mx-auto">Join thousands of modern gym owners who are leveraging AI to automate their business and provide better results for members.</p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10">
            <button 
              onClick={() => navigate('/register/gym-owner')}
              className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-[#164A4A] to-[#6fa3a0] text-white rounded-xl font-bold text-lg hover:from-[#C6A77D] hover:to-[#0F766E] shadow-lg shadow-green-200 transition-all hover:-translate-y-0.5 flex items-center justify-center gap-2 group"
            >
              Start Registration
              <ArrowRight className="group-hover:translate-x-1 transition-transform" size={20} />
            </button>
            
            <button 
              onClick={() => navigate('/register/gym-owner')}
              className="w-full sm:w-auto px-8 py-4 bg-white text-[#455250] rounded-xl font-bold text-lg border-2 border-[#D3DFDA] hover:border-[#6fa3a0] hover:text-[#6fa3a0] transition-all flex items-center justify-center gap-2"
            >
              Skip Introduction
            </button>
          </div>
          
          <div className="mt-8 relative z-10">
            <Link 
              to="/register/gym-owner" 
              className="text-sm font-medium text-[#A8ADA9] hover:text-[#164A4A] underline underline-offset-4 decoration-[#D3DFDA] hover:decoration-[#164A4A] transition-all"
            >
              Already know how it works? Skip and register
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
};

export default GymOwnerIntroduction;
