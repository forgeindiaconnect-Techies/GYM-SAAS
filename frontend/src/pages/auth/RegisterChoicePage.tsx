import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, Building2, UserCheck, Dumbbell, ArrowLeft, ArrowRight, CheckCircle2 } from 'lucide-react';

const RegisterChoicePage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-[#FFFFFF] flex flex-col items-center justify-center px-4 py-12 sm:py-16 relative">
      {/* Back to Home Button */}
      <div className="absolute top-6 left-6 z-20">
        <Link
          to="/"
          className="inline-flex items-center gap-2 text-xs font-bold text-[#64748B] hover:text-[#EA580C] px-3.5 py-2 rounded-xl bg-[#FFFFFF] border border-[#E2E8F0] shadow-xs hover:border-[#FFEDD5] hover:bg-[#FFF7ED] transition-all"
        >
          <ArrowLeft size={16} />
          <span>Back to Home</span>
        </Link>
      </div>

      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_rgba(234,88,12,0.07)_0%,_transparent_65%)] pointer-events-none" />

      {/* Logo */}
      <Link to="/" className="flex items-center space-x-2.5 mb-6 group z-10">
        <div className="w-10 h-10 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
          <Activity className="text-[#FFFFFF]" size={22} strokeWidth={2.5} />
        </div>
        <span className="text-2xl font-bold tracking-tight text-[#111827] group-hover:text-[#EA580C] transition-colors">Gymora</span>
      </Link>

      <div className="w-full max-w-5xl z-10 space-y-6">
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-extrabold text-[#111827] tracking-tight sm:text-4xl">
            Choose Your Registration Type
          </h1>
          <p className="text-sm text-[#64748B] max-w-lg mx-auto">
            Select how you want to use Gymora — as a Gym Owner, Member, or Certified Trainer.
          </p>
        </div>

        {/* Choice Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
          {/* 1. Gym Owner Registration Card */}
          <div
            onClick={() => navigate('/register/gym-owner')}
            className="group relative bg-[#FFFFFF] border-2 border-[#E2E8F0] hover:border-[#EA580C] rounded-2xl p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] group-hover:scale-110 transition-transform">
                <Building2 size={28} />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
                  For Gym Owners
                </span>
                <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                  Gym Owner Registration
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Register your fitness facility, manage trainers, track customer memberships, manage equipment & store orders, and scale your revenue.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-[#475569]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Multi-branch facility management</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Trainer hiring and payroll tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Direct QR code member check-ins</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <div className="w-full py-3 bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white font-bold text-xs rounded-xl flex items-center justify-center gap-2 group-hover:shadow-md group-hover:shadow-orange-500/25 transition-all">
                <span>Register as Gym Owner</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* 2. Customer / Member Registration Card */}
          <div
            onClick={() => navigate('/register/customer')}
            className="group relative bg-[#FFFFFF] border-2 border-[#E2E8F0] hover:border-[#EA580C] rounded-2xl p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] group-hover:scale-110 transition-transform">
                <UserCheck size={28} />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
                  For Members
                </span>
                <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                  Customer Registration
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Join certified gyms, purchase workout packages, access personalized exercise and diet plans, and hire elite personal trainers.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-[#475569]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Tailored AI workout & nutrition plans</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Personal trainer booking and tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Member rewards, challenges & store access</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <div className="w-full py-3 bg-[#FFFFFF] border-2 border-[#EA580C] text-[#EA580C] hover:bg-[#FFF7ED] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                <span>Sign Up as Customer</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* 3. Trainer Registration Card */}
          <div
            onClick={() => navigate('/register/trainer')}
            className="group relative bg-[#FFFFFF] border-2 border-[#E2E8F0] hover:border-[#EA580C] rounded-2xl p-6 sm:p-7 shadow-lg hover:shadow-xl transition-all duration-300 flex flex-col justify-between cursor-pointer hover:-translate-y-1"
          >
            <div className="space-y-4">
              <div className="w-14 h-14 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] group-hover:scale-110 transition-transform">
                <Dumbbell size={28} />
              </div>
              <div>
                <span className="inline-block px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#FFF7ED] text-[#C2410C] border border-[#FED7AA] mb-2">
                  For Fitness Coaches
                </span>
                <h3 className="text-xl font-bold text-[#111827] group-hover:text-[#EA580C] transition-colors">
                  Trainer Registration
                </h3>
                <p className="text-xs text-[#64748B] mt-2 leading-relaxed">
                  Join gym rosters, conduct 1-on-1 and group personal training, manage workout & diet plans, and grow your fitness career.
                </p>
              </div>

              <ul className="space-y-2 pt-2 text-xs text-[#475569]">
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Connect with top verified gyms</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Client scheduling and attendance tracking</span>
                </li>
                <li className="flex items-center gap-2">
                  <CheckCircle2 size={14} className="text-[#16A34A] shrink-0" />
                  <span>Session logging and earnings management</span>
                </li>
              </ul>
            </div>

            <div className="pt-6">
              <div className="w-full py-3 bg-[#FFFFFF] border-2 border-[#EA580C] text-[#EA580C] hover:bg-[#FFF7ED] font-bold text-xs rounded-xl flex items-center justify-center gap-2 transition-all">
                <span>Register as Trainer</span>
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        </div>

        {/* Footer Login Link */}
        <div className="text-center pt-2 text-xs text-[#64748B]">
          Already have an account?{' '}
          <Link to="/login" className="text-[#EA580C] font-bold hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
};

export default RegisterChoicePage;
