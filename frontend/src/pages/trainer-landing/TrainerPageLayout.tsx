import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
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
import { FaInstagram, FaTwitter, FaYoutube, FaLinkedin } from 'react-icons/fa';

interface TrainerPageLayoutProps {
  children: React.ReactNode;
}

export const TrainerPageLayout: React.FC<TrainerPageLayoutProps> = ({ children }) => {
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();

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

  return (
    <div className="min-h-screen bg-[#FFFFFF] text-[#111827] flex flex-col font-sans selection:bg-[#C2410C] selection:text-[#FFFFFF]">
      {/* Header Navigation */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
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

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Professional 4-Column Footer */}
      <footer className="border-t border-[#E2E8F0] bg-[#F8FAFC] pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
            {/* Brand Information */}
            <div className="lg:col-span-1">
              <Link to="/trainers" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-9 h-9 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-xl flex items-center justify-center shadow-lg shadow-orange-500/15">
                  <Activity className="text-[#FFFFFF]" size={20} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#111827] group-hover:text-[#EA580C] transition-colors">
                  Gymora
                </span>
              </Link>
              <p className="text-xs text-[#64748B] leading-relaxed mb-4">
                The premier career network and management platform for verified fitness professionals, certified personal trainers, and high-performance gyms.
              </p>
              <div className="flex items-center gap-3 text-[#64748B]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center hover:text-[#EA580C] hover:border-[#FFEDD5] transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram size={14} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center hover:text-[#EA580C] hover:border-[#FFEDD5] transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter size={14} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center hover:text-[#EA580C] hover:border-[#FFEDD5] transition-colors"
                  aria-label="YouTube"
                >
                  <FaYoutube size={14} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] flex items-center justify-center hover:text-[#EA580C] hover:border-[#FFEDD5] transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={14} />
                </a>
              </div>
            </div>

            {/* Column 1 — About */}
            <div>
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]"></span>
                About
              </h3>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li>
                  <Link to="/trainers/about" className="hover:text-[#EA580C] transition-colors block">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/how-it-works" className="hover:text-[#EA580C] transition-colors block">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/benefits" className="hover:text-[#EA580C] transition-colors block">
                    Trainer Benefits
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/contact" className="hover:text-[#EA580C] transition-colors block">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 — Opportunities */}
            <div>
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]"></span>
                Opportunities
              </h3>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li>
                  <Link to="/careers" className="hover:text-[#EA580C] transition-colors block">
                    Explore Opportunities
                  </Link>
                </li>
                <li>
                  <Link to="/login?portal=trainer" className="hover:text-[#EA580C] transition-colors block">
                    Trainer Login
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 — Resources */}
            <div>
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]"></span>
                Resources
              </h3>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li>
                  <Link to="/trainers/faqs" className="hover:text-[#EA580C] transition-colors block">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/guidelines" className="hover:text-[#EA580C] transition-colors block">
                    Trainer Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/support" className="hover:text-[#EA580C] transition-colors block">
                    Help & Support
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 — Legal */}
            <div>
              <h3 className="text-xs font-bold text-[#111827] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#C2410C]"></span>
                Legal
              </h3>
              <ul className="space-y-2.5 text-xs text-[#64748B]">
                <li>
                  <Link to="/trainers/terms" className="hover:text-[#EA580C] transition-colors block">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/privacy" className="hover:text-[#EA580C] transition-colors block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/cookies" className="hover:text-[#EA580C] transition-colors block">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/refund-policy" className="hover:text-[#EA580C] transition-colors block">
                    Refund & Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#E2E8F0] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#64748B]">
            <div className="flex flex-wrap items-center gap-3">
              <span>© {new Date().getFullYear()} Gymora Platform. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[#EA580C]">Dedicated Trainer Ecosystem</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="hover:text-[#EA580C] transition-colors flex items-center gap-1 font-medium"
              >
                <span>Back</span>
                <ChevronRight size={13} />
              </Link>

              <button
                onClick={scrollToTop}
                className="w-8 h-8 rounded-lg bg-[#FFFFFF] border border-[#E2E8F0] hover:border-[#FDBA74] text-[#64748B] hover:text-[#EA580C] flex items-center justify-center transition-all cursor-pointer"
                title="Scroll to Top"
                aria-label="Scroll to top"
              >
                <ArrowUp size={14} />
              </button>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

