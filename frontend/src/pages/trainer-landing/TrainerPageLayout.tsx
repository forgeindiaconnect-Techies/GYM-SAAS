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
    <div className="min-h-screen bg-[#080B0C] text-[#F5FAFA] flex flex-col font-sans selection:bg-[#2DD4BF] selection:text-[#06201D]">
      {/* Header Navigation */}
      <header
        className={`sticky top-0 z-50 w-full transition-all duration-200 border-b ${
          scrolled
            ? 'bg-[#080B0C]/95 backdrop-blur-md border-[#2A3A3A] shadow-xl'
            : 'bg-[#080B0C] border-[#2A3A3A]/60'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between gap-4">
          {/* Logo */}
          <div className="flex items-center gap-3 shrink-0">
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="w-10 h-10 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/10 group-hover:scale-105 transition-transform">
                <Activity className="text-[#06201D]" size={22} strokeWidth={2.5} />
              </div>
              <div>
                <span className="text-xl sm:text-2xl font-bold tracking-tight text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">
                  Gymora
                </span>
                <span className="hidden md:inline-block ml-2 px-2 py-0.5 rounded text-[10px] font-bold bg-[#2DD4BF]/10 text-[#2DD4BF] uppercase tracking-wider border border-[#2DD4BF]/25">
                  Trainer Network
                </span>
              </div>
            </Link>
          </div>

          {/* Action Buttons: Back, Login, Join as a Trainer */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0">
            <Link
              to="/"
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <ArrowLeft size={16} />
              <span>Back</span>
            </Link>
            <Link
              to="/login?portal=trainer"
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <span>Login</span>
            </Link>
            <Link
              to="/invite/trainer/onboarding"
              className="px-3 sm:px-4 py-2 rounded-xl text-xs sm:text-sm font-bold text-[#06201D] bg-[#2DD4BF] hover:bg-[#5EEAD4] transition-all shadow-md shadow-teal-500/20 flex items-center gap-1.5 shrink-0 whitespace-nowrap"
            >
              <UserCheck size={16} />
              <span className="hidden sm:inline">Join as a Trainer</span>
              <span className="sm:hidden">Join</span>
            </Link>
          </div>
        </div>
      </header>

      {/* Main Page Content */}
      <main className="flex-1">{children}</main>

      {/* Professional 4-Column Footer */}
      <footer className="border-t border-[#2A3A3A] bg-[#0E1415] pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-10 lg:gap-8 mb-12">
            {/* Brand Information */}
            <div className="lg:col-span-1">
              <Link to="/trainers" className="flex items-center gap-2.5 mb-4 group">
                <div className="w-9 h-9 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/10">
                  <Activity className="text-[#06201D]" size={20} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">
                  Gymora
                </span>
              </Link>
              <p className="text-xs text-[#9AAEAE] leading-relaxed mb-4">
                The premier career network and management platform for verified fitness professionals, certified personal trainers, and high-performance gyms.
              </p>
              <div className="flex items-center gap-3 text-[#9AAEAE]">
                <a
                  href="https://instagram.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center hover:text-[#2DD4BF] hover:border-[#2DD4BF]/40 transition-colors"
                  aria-label="Instagram"
                >
                  <FaInstagram size={14} />
                </a>
                <a
                  href="https://twitter.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center hover:text-[#2DD4BF] hover:border-[#2DD4BF]/40 transition-colors"
                  aria-label="Twitter"
                >
                  <FaTwitter size={14} />
                </a>
                <a
                  href="https://youtube.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center hover:text-[#2DD4BF] hover:border-[#2DD4BF]/40 transition-colors"
                  aria-label="YouTube"
                >
                  <FaYoutube size={14} />
                </a>
                <a
                  href="https://linkedin.com"
                  target="_blank"
                  rel="noreferrer"
                  className="w-8 h-8 rounded-lg bg-[#141D1E] border border-[#2A3A3A] flex items-center justify-center hover:text-[#2DD4BF] hover:border-[#2DD4BF]/40 transition-colors"
                  aria-label="LinkedIn"
                >
                  <FaLinkedin size={14} />
                </a>
              </div>
            </div>

            {/* Column 1 — About */}
            <div>
              <h3 className="text-xs font-bold text-[#F5FAFA] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></span>
                About
              </h3>
              <ul className="space-y-2.5 text-xs text-[#9AAEAE]">
                <li>
                  <Link to="/trainers/about" className="hover:text-[#2DD4BF] transition-colors block">
                    About Us
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/how-it-works" className="hover:text-[#2DD4BF] transition-colors block">
                    How It Works
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/benefits" className="hover:text-[#2DD4BF] transition-colors block">
                    Trainer Benefits
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/contact" className="hover:text-[#2DD4BF] transition-colors block">
                    Contact Us
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 2 — Opportunities */}
            <div>
              <h3 className="text-xs font-bold text-[#F5FAFA] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></span>
                Opportunities
              </h3>
              <ul className="space-y-2.5 text-xs text-[#9AAEAE]">
                <li>
                  <Link to="/careers" className="hover:text-[#2DD4BF] transition-colors block">
                    Explore Opportunities
                  </Link>
                </li>
                <li>
                  <Link to="/login?portal=trainer" className="hover:text-[#2DD4BF] transition-colors block">
                    Trainer Login
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/directory" className="hover:text-[#2DD4BF] transition-colors block">
                    Trainer Directory
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 3 — Resources */}
            <div>
              <h3 className="text-xs font-bold text-[#F5FAFA] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></span>
                Resources
              </h3>
              <ul className="space-y-2.5 text-xs text-[#9AAEAE]">
                <li>
                  <Link to="/trainers/faqs" className="hover:text-[#2DD4BF] transition-colors block">
                    FAQs
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/guidelines" className="hover:text-[#2DD4BF] transition-colors block">
                    Trainer Guidelines
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/support" className="hover:text-[#2DD4BF] transition-colors block">
                    Help & Support
                  </Link>
                </li>
                <li>
                  <Link to="/portal/customer" className="hover:text-[#2DD4BF] transition-colors block">
                    Customer Portal
                  </Link>
                </li>
              </ul>
            </div>

            {/* Column 4 — Legal */}
            <div>
              <h3 className="text-xs font-bold text-[#F5FAFA] uppercase tracking-wider mb-4 flex items-center gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-[#2DD4BF]"></span>
                Legal
              </h3>
              <ul className="space-y-2.5 text-xs text-[#9AAEAE]">
                <li>
                  <Link to="/trainers/terms" className="hover:text-[#2DD4BF] transition-colors block">
                    Terms & Conditions
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/privacy" className="hover:text-[#2DD4BF] transition-colors block">
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/cookies" className="hover:text-[#2DD4BF] transition-colors block">
                    Cookie Policy
                  </Link>
                </li>
                <li>
                  <Link to="/trainers/refund-policy" className="hover:text-[#2DD4BF] transition-colors block">
                    Refund & Cancellation Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="pt-8 border-t border-[#2A3A3A] flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#9AAEAE]">
            <div className="flex flex-wrap items-center gap-3">
              <span>© {new Date().getFullYear()} Gymora Platform. All rights reserved.</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[#2DD4BF]">Dedicated Trainer Ecosystem</span>
            </div>

            <div className="flex items-center gap-4">
              <Link
                to="/"
                className="hover:text-[#2DD4BF] transition-colors flex items-center gap-1 font-medium"
              >
                <span>Back</span>
                <ChevronRight size={13} />
              </Link>

              <button
                onClick={scrollToTop}
                className="w-8 h-8 rounded-lg bg-[#141D1E] border border-[#2A3A3A] hover:border-[#2DD4BF] text-[#9AAEAE] hover:text-[#2DD4BF] flex items-center justify-center transition-all cursor-pointer"
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

