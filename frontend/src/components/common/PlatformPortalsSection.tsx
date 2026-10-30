import React from 'react';
import { Link } from 'react-router-dom';
import { ShieldCheck, Building2, User, ArrowRight, ExternalLink, Sparkles, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

interface PlatformPortalsSectionProps {
  currentDashboard?: 'SUPER_ADMIN' | 'GYM_OWNER' | 'MEMBER';
}

export const PlatformPortalsSection: React.FC<PlatformPortalsSectionProps> = ({ currentDashboard }) => {
  const { user } = useAuth();
  const effectiveRole = currentDashboard || (user?.role === 'SUPER_ADMIN' ? 'SUPER_ADMIN' : (user?.role === 'ADMIN' || user?.role === 'GYM_OWNER') ? 'GYM_OWNER' : 'MEMBER');

  const portals = [
    {
      id: 'SUPER_ADMIN',
      title: 'Super Admin',
      subtitle: 'Platform governance & management',
      description: 'Enterprise governance suite for platform administration, multi-tenant gym approvals, subscription plans, and platform health.',
      icon: ShieldCheck,
      portalUrl: '/portal/super-admin',
      dashboardUrl: '/super-admin/dashboard',
      dashboardRole: 'SUPER_ADMIN'
    },
    {
      id: 'GYM_OWNER',
      title: 'Gym Owner',
      subtitle: 'Club ops, trainers & billing',
      description: 'Complete operating system for fitness clubs. Manage members, trainer rosters, biometric/QR check-ins, and POS store sales.',
      icon: Building2,
      portalUrl: '/portal/gym-owner',
      dashboardUrl: '/admin/dashboard',
      dashboardRole: 'GYM_OWNER'
    },
    {
      id: 'MEMBER',
      title: 'Customer',
      subtitle: 'AI workouts, coaching & progress',
      description: 'Personalized digital fitness companion with AI workout and diet generation, certified trainer bookings, and progress tracking.',
      icon: User,
      portalUrl: '/portal/customer',
      dashboardUrl: '/member/dashboard',
      dashboardRole: 'MEMBER'
    }
  ];

  return (
    <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-6 sm:p-7 shadow-sm">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6 border-b border-[#E7DADD] pb-5">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-[#B76E79]/10 text-[#B76E79] border border-[#B76E79]/20 mb-2">
            <Sparkles size={13} />
            <span>Platform Ecosystem</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-bold text-[#292524] tracking-tight">
            Role Portals & Ecosystem
          </h2>
          <p className="text-xs sm:text-sm text-[#57534E] mt-0.5">
            Overview of the three dedicated portals and environments powering the Gymora platform.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {portals.map((portal) => {
          const isCurrent = effectiveRole === portal.id;
          const Icon = portal.icon;

          return (
            <div
              key={portal.id}
              className={`rounded-2xl p-5 border flex flex-col justify-between transition-all ${
                isCurrent 
                  ? 'bg-[#F3E8E8]/70 border-[#B76E79]/50 shadow-md shadow-teal-500/5 ring-1 ring-[#B76E79]/20' 
                  : 'bg-[#F3E8E8] border-[#E7DADD] hover:border-[#B76E79]/40'
              }`}
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${
                    isCurrent ? 'bg-[#B76E79] text-white' : 'bg-[#B76E79]/10 text-[#B76E79]'
                  }`}>
                    <Icon size={22} />
                  </div>
                  {isCurrent ? (
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#B76E79]/20 text-[#B76E79] border border-[#B76E79]/30">
                      <CheckCircle2 size={12} />
                      <span>Active Dashboard</span>
                    </span>
                  ) : (
                    <span className="text-[11px] font-semibold text-[#57534E] uppercase tracking-wider">
                      Role Portal
                    </span>
                  )}
                </div>

                <h3 className="text-base font-bold text-[#292524] mb-1">
                  {portal.title}
                </h3>
                <p className="text-xs text-[#B76E79] font-medium mb-3">
                  {portal.subtitle}
                </p>
                <p className="text-xs text-[#57534E] leading-relaxed mb-5 font-normal">
                  {portal.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#E7DADD]/60 flex items-center gap-2">
                <Link
                  to={portal.portalUrl}
                  className="flex-1 py-2 px-3 bg-[#F3E8E8] hover:bg-[#B76E79] text-[#292524] hover:text-[#FFFFFF] font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1.5 border border-[#E7DADD] hover:border-[#B76E79]"
                >
                  <span>Public View</span>
                  <ExternalLink size={13} />
                </Link>
                {isCurrent ? (
                  <span className="py-2 px-3 bg-[#B76E79]/10 text-[#B76E79] font-bold rounded-xl text-xs flex items-center justify-center gap-1 border border-[#B76E79]/20">
                    <span>You are here</span>
                  </span>
                ) : (
                  <Link
                    to={portal.portalUrl}
                    className="py-2 px-3 bg-[#B76E79] hover:bg-[#9F5965] text-white font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-1 shadow-sm"
                  >
                    <span>View</span>
                    <ArrowRight size={13} />
                  </Link>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PlatformPortalsSection;
