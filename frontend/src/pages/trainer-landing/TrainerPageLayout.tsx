import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  Activity,
  UserCheck,
  ArrowRight,
  ArrowLeft,
  ShieldCheck,
  ChevronRight,
  ArrowUp,
  Mail,
  HelpCircle,
  FileText,
  Lock,
  Cookie,
  RotateCcw,
  Sparkles,
  ExternalLink
} from 'lucide-react';
import { FaInstagram, FaTwitter, FaYoutube, FaLinkedin, FaFacebook } from 'react-icons/fa';
import { AthleteSilhouette } from '../../components/common/AthleteSilhouette';

interface TrainerPageLayoutProps {
  children: React.ReactNode;
  hideHeader?: boolean;
}

export const TrainerPageLayout: React.FC<TrainerPageLayoutProps> = ({ children, hideHeader = false }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 20);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [location.pathname]);

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleFooterLogoClick = (e: React.MouseEvent) => {
    e.preventDefault();
    if (location.pathname === '/trainers') {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } else {
      navigate('/trainers');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] flex flex-col font-sans selection:bg-[#C2410C] selection:text-[#FFFFFF]">
      {/* Header Navigation */}
      {!hideHeader && (
        <header
          className={`sticky top-0 z-50 w-full transition-all duration-200 border-b pt-safe ${
            scrolled
              ? 'bg-[#FFFFFF]/95 backdrop-blur-md border-[#E2E8F0] shadow-xl'
              : 'bg-[#FFFFFF] border-[#E2E8F0]/60'
          }`}
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
            {/* Logo */}
            <div className="flex items-center gap-3 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 group">
                <div className="w-10 h-10 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15 group-hover:scale-105 transition-transform">
                  <Activity className="text-[#FFFFFF]" size={22} strokeWidth={2.5} />
                </div>
                <div>
                  <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#111827] group-hover:text-[#EA580C] transition-colors">
                    Gymora
                  </span>
                  <span className="hidden md:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#FFF7ED] text-[#EA580C] uppercase tracking-wider border border-[#FFEDD5]">
                    Trainer Network
                  </span>
                </div>
              </Link>
            </div>

            {/* Action Buttons: Back, Login */}
            <div className="flex items-center gap-2 sm:gap-3 shrink-0">
              <Link
                to="/"
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <ArrowLeft size={16} />
                <span>Back</span>
              </Link>
              <Link
                to="/login?portal=trainer"
                className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#FFFFFF] bg-[#C2410C] hover:bg-[#9A3412] transition-all shadow-md shadow-orange-500/15 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
              >
                <span>Login</span>
              </Link>
            </div>
          </div>
        </header>
      )}

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Professional Footer Replicated from Reference Design */}
      <footer className="relative overflow-hidden bg-[#FFFFFF] border-t border-[#E2E8F0] pt-14 pb-0 text-[#475569] mt-auto">
        {/* Top-Left Ambient Warm Swoosh */}
        <div className="pointer-events-none absolute -top-24 -left-24 w-96 h-96 bg-gradient-to-br from-[#EA580C]/15 via-orange-300/10 to-transparent rounded-full blur-3xl" />
        
        {/* Top-Right Warm Glow */}
        <div className="pointer-events-none absolute top-0 right-0 w-[520px] h-[420px] bg-gradient-to-bl from-orange-400/15 via-amber-300/10 to-transparent rounded-full blur-3xl" />
        
        {/* Right Athlete Silhouette Watermark */}
        <div className="pointer-events-none absolute right-0 bottom-10 w-72 sm:w-80 md:w-[380px] h-auto opacity-[0.14] select-none text-[#EA580C] overflow-hidden">
          <AthleteSilhouette className="w-full h-full" />
        </div>

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-10 mb-12 md:divide-x md:divide-[#E2E8F0]/70">
            {/* Column 1 — Brand Information */}
            <div className="col-span-1 md:col-span-1 md:pr-8">
              <button 
                onClick={handleFooterLogoClick} 
                className="flex items-center gap-2.5 mb-4 group text-left cursor-pointer"
                title="Go to Trainer Landing Page Front Page"
              >
                <div className="w-9 h-9 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-md shadow-orange-500/20 group-hover:scale-105 transition-transform">
                  <Activity className="text-[#FFFFFF]" size={20} strokeWidth={2.5} />
                </div>
                <span className="text-2xl font-black tracking-tight text-[#111827] group-hover:text-[#EA580C] transition-colors">
                  Gymora
                </span>
              </button>
              <p className="text-sm text-[#475569] leading-relaxed mb-6 font-normal">
                The premier career network and management platform for verified fitness professionals, certified personal trainers, and high-performance gyms.
              </p>
              {/* Circular dark social icons */}
              <div className="flex items-center space-x-3">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-[#EA580C] transition-all shadow-sm hover:scale-110"
                  aria-label="Instagram"
                >
                  <FaInstagram size={14} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-[#EA580C] transition-all shadow-sm hover:scale-110"
                  aria-label="Twitter"
                >
                  <FaTwitter size={14} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-[#EA580C] transition-all shadow-sm hover:scale-110"
                  aria-label="YouTube"
                >
                  <FaYoutube size={14} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-full bg-[#111827] text-white flex items-center justify-center hover:bg-[#EA580C] transition-all shadow-sm hover:scale-110"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={14} />
                </a>
              </div>
            </div>

            {/* Column 2 — About */}
            <div className="md:px-8">
              <h3 className="text-base font-bold text-[#111827] tracking-tight mb-4">
                About
              </h3>
              <ul className="space-y-2.5 text-sm text-[#475569]">
                <li>
                  <Link to="/trainers/about" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>About Us</span>
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/how-it-works" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>How It Works</span>
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/benefits" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Trainer Benefits</span>
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/contact" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Contact Us</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 — Opportunities */}
            <div className="md:px-8">
              <h3 className="text-base font-bold text-[#111827] tracking-tight mb-4">
                Opportunities
              </h3>
              <ul className="space-y-2.5 text-sm text-[#475569]">
                <li>
                  <Link to="/careers" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Explore Opportunities</span>
                  </Link>
                </li>
                <li>
                  <Link to="/login?portal=trainer" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Trainer Login</span>
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 — Resources & Legal */}
            <div className="md:pl-8">
              <h3 className="text-base font-bold text-[#111827] tracking-tight mb-4">
                Resources &amp; Legal
              </h3>
              <ul className="space-y-2.5 text-sm text-[#475569]">
                <li>
                  <Link to="/trainers/faqs" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>FAQs</span>
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/guidelines" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Trainer Guidelines</span>
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/support" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Help &amp; Support</span>
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/terms" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Terms &amp; Conditions</span>
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/privacy" className="flex items-center group py-0.5 hover:text-[#EA580C] transition-colors">
                    <span className="text-[#EA580C] font-bold text-xs mr-2 transition-transform duration-200 group-hover:translate-x-1 select-none">&gt;</span>
                    <span>Privacy Policy</span>
                  </Link>
                </li>
              </ul>
            </div>
          </div>
        </div>

        {/* Arched Dark Bottom Copyright Bar */}
        <div className="relative w-full bg-[#0B132B] text-slate-300 pt-7 pb-6 mt-6">
          {/* Arched Top Orange Accent Curve */}
          <div className="absolute -top-3.5 left-0 right-0 h-4 overflow-hidden pointer-events-none">
            <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="w-full h-full fill-[#0B132B]">
              <path d="M0,30 Q600,0 1200,30 L1200,30 L0,30 Z" />
            </svg>
            <svg viewBox="0 0 1200 30" preserveAspectRatio="none" className="absolute top-0 left-0 w-full h-full fill-none stroke-[#EA580C] stroke-[2.5]">
              <path d="M0,30 Q600,0 1200,30" />
            </svg>
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-center gap-4 text-xs font-medium">
            <div className="hidden sm:block flex-1 h-px bg-slate-700/60 max-w-xs" />
            <p className="text-center text-slate-300">
              &copy; {new Date().getFullYear()} <span className="text-[#FB923C] font-semibold">Gymora Platform.</span> All rights reserved. • <span className="text-[#FB923C]">Dedicated Trainer Ecosystem</span>
            </p>
            <div className="hidden sm:block flex-1 h-px bg-slate-700/60 max-w-xs" />
          </div>
        </div>
      </footer>
    </div>
  );
};

