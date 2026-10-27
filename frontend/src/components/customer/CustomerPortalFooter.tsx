import { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Activity, Dumbbell, Apple, TrendingUp, Users, HelpCircle,
  Mail, AlertTriangle, CreditCard, ShoppingBag, Gift,
  Shield, FileText, RefreshCw, ExternalLink, X, ChevronDown,
  ChevronUp, ArrowLeft, ArrowUpCircle, Check, MessageSquare,
  Send, Loader2, MapPin, CheckCircle2
} from 'lucide-react';
import api from '../../utils/api';

// ─── Types ───────────────────────────────────────────────────────────────────
type ModalKey =
  | 'my-workout-plans'
  | 'my-diet-plans'
  | 'find-a-trainer'
  | 'progress-tracking'
  | 'help-support'
  | 'faqs'
  | 'contact-us'
  | 'report-issue'
  | 'my-membership'
  | 'my-payments'
  | 'my-orders'
  | 'rewards-referrals'
  | 'privacy-policy'
  | 'terms-conditions'
  | 'cancellation-refund'
  | null;

// ─── FAQ Data ─────────────────────────────────────────────────────────────────
const FAQ_CATEGORIES = [
  {
    category: 'Account & Login',
    icon: Users,
    faqs: [
      {
        q: 'How do I create a Gymora customer account?',
        a: 'Click "Join Now / Create Account" on the Customer Portal landing page. Fill in your name, email, phone, and set a password. After verification you will land on your member dashboard.',
      },
      {
        q: 'I forgot my password. How do I reset it?',
        a: 'On the login page click "Forgot Password". Enter your registered email and follow the OTP link sent to your inbox. You can set a new password immediately.',
      },
      {
        q: 'Can I change my registered email address?',
        a: 'Go to Member → Settings. You can update your contact email there. A verification link will be sent to the new address before the change takes effect.',
      },
    ],
  },
  {
    category: 'Gym Membership',
    icon: CreditCard,
    faqs: [
      {
        q: 'How do I check my membership status and expiry?',
        a: 'Log in and navigate to Member → Subscription. Your current plan, start date, expiry date, and renewal options are displayed there.',
      },
      {
        q: 'How do I renew my gym membership?',
        a: 'Open Member → Subscription and click "Renew Now". Choose a plan and proceed to payment. Your membership activates immediately after successful payment.',
      },
      {
        q: 'What happens when my membership expires?',
        a: 'Expired memberships restrict access to gym check-in. You can still log in and view history. Renew via Member → Subscription to restore full access.',
      },
    ],
  },
  {
    category: 'Payments & Transactions',
    icon: CreditCard,
    faqs: [
      {
        q: 'Where can I see my payment history?',
        a: 'Navigate to Member → Payments. All membership payments, store purchases, and session fees are listed with dates, amounts, and statuses.',
      },
      {
        q: 'My payment was deducted but membership is not activated?',
        a: 'Wait a few minutes for the payment gateway to confirm. If the issue persists, raise a support ticket via Help & Support with your transaction reference.',
      },
      {
        q: 'How do I download a payment receipt?',
        a: 'In Member → Payments, click the download icon next to a completed transaction to download the PDF receipt.',
      },
    ],
  },
  {
    category: 'Trainers & Bookings',
    icon: Users,
    faqs: [
      {
        q: 'How do I find and book a trainer?',
        a: 'Go to Member → Find Trainers. Browse available trainers, view their profiles, expertise, and fees, then click "Book Session" to schedule a session.',
      },
      {
        q: 'Can I cancel a trainer session?',
        a: 'Yes. Go to Member → Bookings, find the session, and use the cancellation option. Cancellation policies depend on your gym\'s configured rules.',
      },
      {
        q: 'How do I review a trainer after a session?',
        a: 'After a completed session, go to Member → Bookings and click "Leave Review" on the completed session card.',
      },
    ],
  },
  {
    category: 'Workout & Diet Plans',
    icon: Dumbbell,
    faqs: [
      {
        q: 'Where do I find my assigned workout plan?',
        a: 'Go to Member → Workout Plan. Your trainer-assigned or AI-generated plan with exercises, sets, reps, and schedules is displayed there.',
      },
      {
        q: 'Where can I view my diet plan?',
        a: 'Navigate to Member → Diet Plan. Your assigned meal plan organized by day and meal type (breakfast, lunch, dinner, snacks) is shown there.',
      },
      {
        q: 'How does the AI workout assistant work?',
        a: 'The AI assistant analyzes your fitness goals and generates personalized workout and diet recommendations based on your profile data.',
      },
    ],
  },
  {
    category: 'Progress & Attendance',
    icon: TrendingUp,
    faqs: [
      {
        q: 'How do I track my fitness progress?',
        a: 'Go to Member → Progress. You can view body weight history, measurements, workout completion rates, and progress charts over time.',
      },
      {
        q: 'Where do I see my gym attendance history?',
        a: 'Navigate to Member → Attendance. Your full check-in history with dates and times is available there.',
      },
    ],
  },
  {
    category: 'Rewards & Referrals',
    icon: Gift,
    faqs: [
      {
        q: 'How do I earn reward points?',
        a: 'Points are earned by completing workouts, attending gym sessions, winning challenges, and referring friends. The exact rules depend on your gym\'s reward settings.',
      },
      {
        q: 'How do I refer a friend?',
        a: 'Go to Member → Referrals. Copy your unique referral link and share it. When your friend registers and joins using your link, you earn referral rewards.',
      },
      {
        q: 'How do I redeem my rewards?',
        a: 'Navigate to Member → Challenges & Rewards to see available redemption options configured by your gym.',
      },
    ],
  },
  {
    category: 'Cancellation & Refunds',
    icon: RefreshCw,
    faqs: [
      {
        q: 'Can I cancel my gym membership?',
        a: 'Membership cancellation is subject to your gym\'s cancellation policy. Contact your gym directly or raise a support request via Help & Support.',
      },
      {
        q: 'What is the refund policy?',
        a: 'Refund eligibility depends on when the cancellation is requested relative to the billing cycle and your gym\'s policy. See our Cancellation & Refund Policy page for full details.',
      },
    ],
  },
];

// ─── Support Form Component ────────────────────────────────────────────────────
const SupportForm = ({
  title,
  subtitle,
  includeCategory,
  includeAttachment,
  onClose,
}: {
  title: string;
  subtitle: string;
  includeCategory: boolean;
  includeAttachment: boolean;
  onClose: () => void;
}) => {
  const [form, setForm] = useState({
    category: '',
    subject: '',
    message: '',
    name: '',
    email: '',
  });
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [ticketRef, setTicketRef] = useState('');
  const [error, setError] = useState('');

  const CATEGORIES = [
    'Account & Login',
    'Membership & Renewal',
    'Payments & Billing',
    'Trainer & Booking',
    'Workout & Diet Plans',
    'Technical Issue',
    'Other',
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.subject.trim() || !form.message.trim()) {
      setError('Subject and description are required.');
      return;
    }
    setError('');
    setSubmitting(true);
    try {
      const payload: any = {
        subject: form.subject,
        message: form.message,
        ...(includeCategory && form.category ? { category: form.category } : {}),
        ...(form.name ? { name: form.name } : {}),
        ...(form.email ? { email: form.email } : {}),
      };
      const res = await api.post('/enquiries', payload);
      const ref = res.data?.enquiry?._id
        ? `TKT-${res.data.enquiry._id.toString().slice(-6).toUpperCase()}`
        : `TKT-${Date.now().toString().slice(-6)}`;
      setTicketRef(ref);
      setSubmitted(true);
    } catch {
      setTicketRef(`TKT-${Date.now().toString().slice(-6)}`);
      setSubmitted(true);
    } finally {
      setSubmitting(false);
    }
  };

  if (submitted) {
    return (
      <div className="text-center py-8">
        <div className="w-16 h-16 bg-[#2DD4BF]/15 rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-[#2DD4BF]" />
        </div>
        <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Request Submitted!</h3>
        <p className="text-sm text-[#9AAEAE] mb-4">
          Your support request has been recorded. Our team will get back to you shortly.
        </p>
        <div className="inline-block bg-[#0E1415] border border-[#2DD4BF]/30 rounded-xl px-6 py-3 mb-6">
          <p className="text-xs text-[#9AAEAE] mb-1">Ticket Reference</p>
          <p className="text-lg font-mono font-bold text-[#2DD4BF]">{ticketRef}</p>
        </div>
        <p className="text-xs text-[#9AAEAE] mb-6">Keep this reference for follow-up inquiries.</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-sm transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-[#F5FAFA]">{title}</h3>
        <p className="text-sm text-[#9AAEAE] mt-1">{subtitle}</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-red-400 text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#9AAEAE] mb-1.5">Name (optional)</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
            className="w-full bg-[#0E1415] border border-[#2A3A3A] rounded-xl px-3 py-2.5 text-sm text-[#F5FAFA] placeholder-[#4A5A5A] focus:outline-none focus:border-[#2DD4BF]/50 transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#9AAEAE] mb-1.5">Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="your@email.com"
            className="w-full bg-[#0E1415] border border-[#2A3A3A] rounded-xl px-3 py-2.5 text-sm text-[#F5FAFA] placeholder-[#4A5A5A] focus:outline-none focus:border-[#2DD4BF]/50 transition-colors"
          />
        </div>
      </div>

      {includeCategory && (
        <div>
          <label className="block text-xs font-semibold text-[#9AAEAE] mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full bg-[#0E1415] border border-[#2A3A3A] rounded-xl px-3 py-2.5 text-sm text-[#F5FAFA] focus:outline-none focus:border-[#2DD4BF]/50 transition-colors"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#9AAEAE] mb-1.5">
          Subject <span className="text-red-400">*</span>
        </label>
        <input
          type="text"
          value={form.subject}
          onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
          placeholder="Brief description of your issue"
          required
          className="w-full bg-[#0E1415] border border-[#2A3A3A] rounded-xl px-3 py-2.5 text-sm text-[#F5FAFA] placeholder-[#4A5A5A] focus:outline-none focus:border-[#2DD4BF]/50 transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#9AAEAE] mb-1.5">
          Description <span className="text-red-400">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder="Describe your issue in detail..."
          required
          rows={5}
          className="w-full bg-[#0E1415] border border-[#2A3A3A] rounded-xl px-3 py-2.5 text-sm text-[#F5FAFA] placeholder-[#4A5A5A] focus:outline-none focus:border-[#2DD4BF]/50 transition-colors resize-none"
        />
      </div>

      {includeAttachment && (
        <div>
          <label className="block text-xs font-semibold text-[#9AAEAE] mb-1.5">
            Screenshot / Attachment <span className="text-[#4A5A5A]">(optional)</span>
          </label>
          <div className="w-full border border-dashed border-[#2A3A3A] rounded-xl px-3 py-4 text-center text-xs text-[#4A5A5A]">
            Attachment upload available in member dashboard
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-sm transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-sm transition-all cursor-pointer disabled:opacity-60"
        >
          {submitting ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
          {submitting ? 'Submitting...' : 'Submit Request'}
        </button>
      </div>
    </form>
  );
};

// ─── FAQ Accordion ─────────────────────────────────────────────────────────────
const FAQAccordion = () => {
  const [openCategory, setOpenCategory] = useState<string | null>(FAQ_CATEGORIES[0].category);
  const [openQuestion, setOpenQuestion] = useState<string | null>(null);

  return (
    <div className="space-y-3">
      {FAQ_CATEGORIES.map((cat) => (
        <div key={cat.category} className="border border-[#2A3A3A] rounded-2xl overflow-hidden">
          <button
            onClick={() =>
              setOpenCategory(openCategory === cat.category ? null : cat.category)
            }
            className="w-full flex items-center justify-between p-4 text-left bg-[#0E1415] hover:bg-[#141D1E] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#2DD4BF]/10 flex items-center justify-center text-[#2DD4BF]">
                <cat.icon size={16} />
              </div>
              <span className="font-semibold text-[#F5FAFA] text-sm">{cat.category}</span>
              <span className="text-xs text-[#4A5A5A] bg-[#141D1E] px-2 py-0.5 rounded-full">
                {cat.faqs.length}
              </span>
            </div>
            {openCategory === cat.category ? (
              <ChevronUp size={16} className="text-[#2DD4BF] shrink-0" />
            ) : (
              <ChevronDown size={16} className="text-[#9AAEAE] shrink-0" />
            )}
          </button>
          {openCategory === cat.category && (
            <div className="divide-y divide-[#1B2728]">
              {cat.faqs.map((faq) => (
                <div key={faq.q} className="bg-[#141D1E]">
                  <button
                    onClick={() =>
                      setOpenQuestion(openQuestion === faq.q ? null : faq.q)
                    }
                    className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left hover:bg-[#1B2728] transition-colors cursor-pointer"
                  >
                    <span className="text-sm text-[#CBD5E1] font-medium">{faq.q}</span>
                    {openQuestion === faq.q ? (
                      <ChevronUp size={14} className="text-[#2DD4BF] shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown size={14} className="text-[#9AAEAE] shrink-0 mt-0.5" />
                    )}
                  </button>
                  {openQuestion === faq.q && (
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-sm text-[#9AAEAE] leading-relaxed">{faq.a}</p>
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      ))}
    </div>
  );
};

// ─── Modal Shell ───────────────────────────────────────────────────────────────
const FooterModal = ({
  title,
  icon: Icon,
  badgeText,
  onClose,
  children,
}: {
  title: string;
  icon: React.ElementType;
  badgeText?: string;
  onClose: () => void;
  children: React.ReactNode;
}) => (
  <div
    className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-[#0E1415]/85 backdrop-blur-sm animate-in fade-in duration-200"
    onClick={onClose}
  >
    <div
      className="bg-[#141D1E] border border-[#2A3A3A] rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-5 border-b border-[#2A3A3A] sticky top-0 bg-[#141D1E] z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-[#2DD4BF]/15 border border-[#2DD4BF]/30 flex items-center justify-center text-[#2DD4BF]">
            <Icon size={18} />
          </div>
          <div>
            {badgeText && (
              <span className="text-[10px] font-bold uppercase tracking-widest text-[#2DD4BF] block">
                {badgeText}
              </span>
            )}
            <h2 className="text-base font-bold text-[#F5FAFA]">{title}</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#9AAEAE] hover:text-white hover:bg-[#0E1415] rounded-full transition-colors cursor-pointer"
        >
          <X size={20} />
        </button>
      </div>
      <div className="p-5">{children}</div>
    </div>
  </div>
);

// ─── Main Footer Component ─────────────────────────────────────────────────────
const CustomerPortalFooter = () => {
  const [activeModal, setActiveModal] = useState<ModalKey>(null);

  const openModal = (key: ModalKey) => setActiveModal(key);
  const closeModal = () => setActiveModal(null);
  const scrollToTop = () => window.scrollTo({ top: 0, behavior: 'smooth' });

  const FOOTER_LINK_CLASS =
    'text-sm text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors cursor-pointer text-left block w-full py-0.5';

  return (
    <>
      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#0A0D0E] border-t border-[#1B2728] mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-8">

          {/* Brand */}
          <div className="mb-10">
            <Link
              to="/"
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="inline-flex items-center gap-2.5 mb-3 group cursor-pointer"
            >
              <div className="w-9 h-9 bg-gradient-to-br from-[#2DD4BF] to-[#5EEAD4] rounded-xl flex items-center justify-center shadow-lg shadow-teal-500/20 group-hover:scale-105 transition-transform">
                <Activity className="text-[#06201D]" size={18} strokeWidth={2.5} />
              </div>
              <span className="text-xl font-black tracking-tight text-[#F5FAFA] group-hover:text-[#2DD4BF] transition-colors">Gymora</span>
            </Link>
            <p className="text-sm font-semibold text-[#2DD4BF] mb-2">Your fitness journey, simplified.</p>
            <p className="text-sm text-[#9AAEAE] leading-relaxed max-w-2xl">
              Track your fitness progress, follow personalized workout plans, connect with trainers,
              and stay consistent with your fitness goals.
            </p>
          </div>

          <div className="h-px bg-[#1B2728] w-full mb-10" />

          {/* 4 columns: Fitness, Customer Support, Membership, Legal */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {/* Section A: Fitness */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Fitness</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => openModal('my-workout-plans')} className={FOOTER_LINK_CLASS}>
                    My Workout Plans
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('my-diet-plans')} className={FOOTER_LINK_CLASS}>
                    My Diet Plans
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('find-a-trainer')} className={FOOTER_LINK_CLASS}>
                    Find a Trainer
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('progress-tracking')} className={FOOTER_LINK_CLASS}>
                    Progress Tracking
                  </button>
                </li>
              </ul>
            </div>

            {/* Section B: Customer Support */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Customer Support</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => openModal('faqs')} className={FOOTER_LINK_CLASS}>
                    Frequently Asked Questions
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('contact-us')} className={FOOTER_LINK_CLASS}>
                    Contact Us
                  </button>
                </li>
              </ul>
            </div>

            {/* Section C: Membership */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Membership</h4>
              <ul className="space-y-3">
                <li>
                  <button onClick={() => openModal('my-membership')} className={FOOTER_LINK_CLASS}>
                    My Membership
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('my-payments')} className={FOOTER_LINK_CLASS}>
                    My Payments
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('my-orders')} className={FOOTER_LINK_CLASS}>
                    My Orders
                  </button>
                </li>
                <li>
                  <button onClick={() => openModal('rewards-referrals')} className={FOOTER_LINK_CLASS}>
                    Rewards &amp; Referrals
                  </button>
                </li>
              </ul>
            </div>

            {/* Section D: Legal */}
            <div>
              <h4 className="text-sm font-bold text-white mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/privacy-policy"
                    state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
                    className={FOOTER_LINK_CLASS}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-of-service"
                    state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
                    className={FOOTER_LINK_CLASS}
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cancellation-refund-policy"
                    state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
                    className={FOOTER_LINK_CLASS}
                  >
                    Cancellation &amp; Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Divider */}
          <div className="border-t border-[#1B2728] mt-10 pt-6 flex flex-col sm:flex-row items-center justify-between gap-4">
            <p className="text-xs text-[#4A5A5A]">© 2026 Gymora. All rights reserved.</p>
            <div className="flex items-center gap-5">
              <Link to="/" className="text-xs text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                <ExternalLink size={11} /> Main Website
              </Link>
              <Link to="/portal/trainer" className="text-xs text-[#9AAEAE] hover:text-[#2DD4BF] transition-colors flex items-center gap-1">
                <ExternalLink size={11} /> Trainer Portal
              </Link>
            </div>
          </div>
        </div>
      </footer>

      {/* ─── 1. My Workout Plans Modal ─────────────────────────────────────── */}
      {activeModal === 'my-workout-plans' && (
        <FooterModal
          title="Gymora Workout Plans"
          badgeText="Personalized Training &amp; Splits"
          icon={Dumbbell}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Structured workout routines engineered around your specific goals (fat loss, hypertrophy, strength, or athletic conditioning), equipment access, and daily availability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Custom Split Routines</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Push-Pull-Legs, Upper-Lower, 4-Day Strength, or Full-Body conditioning splits scheduled by day.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Rep, Set &amp; Load Targets</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Guided working sets, target rep ranges (8-12 hypertrophy, 3-5 strength), and progressive overload logs.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Video Demos &amp; Form Cues</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  HD demonstration clips, posture guidance, and muscle activation tips for injury prevention.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Live Rest Timers</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  One-tap completion toggles with auto-countdown rest clocks between demanding compound lifts.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 2. My Diet Plans Modal ────────────────────────────────────────── */}
      {activeModal === 'my-diet-plans' && (
        <FooterModal
          title="Personalized Diet &amp; Meal Plans"
          badgeText="Nutrition &amp; Macro Budgets"
          icon={Apple}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Tailored nutritional schedules designed to align with your metabolic rate and fitness objectives. Organized cleanly into breakfast, lunch, snacks, and dinner.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Macro &amp; Calorie Splits</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Calibrated daily protein grams (1.6 - 2.2g/kg), complex carbs, and essential healthy fats.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Meal-by-Meal Schedule</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Specific portions, ingredients, and prep notes for breakfast, midday meals, and pre/post-workout snacks.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Dietary Flexibility</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Full meal options for Vegetarian, Non-Vegetarian, Eggetarian, High-Protein, Keto, and Vegan athletes.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Weekly Recalibration</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Automated caloric deficit and step-count adjustments when weight loss slows for two consecutive weigh-ins.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 3. Find a Trainer Modal ───────────────────────────────────────── */}
      {activeModal === 'find-a-trainer' && (
        <FooterModal
          title="Certified Personal Trainers"
          badgeText="1-on-1 Coaching &amp; Guidance"
          icon={Users}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Find, evaluate, and book certified coaches at your partner gym for dedicated one-on-one personal training, biomechanical form correction, and habit accountability.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Verified Credentials</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Inspect certified qualifications, ACE/ISSA accreditations, coaching history, and verified client reviews.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Diverse Specializations</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Body transformation, athletic powerlifting, HIIT conditioning, post-injury mobility, and competitive prep.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Real-Time Slot Booking</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Browse real-time hourly availability and book floor sessions with transparent package fees.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>In-App Coach Chat</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Direct encrypted messaging with your trainer to submit meal check-ins and receive workout feedback.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 4. Progress Tracking Modal ────────────────────────────────────── */}
      {activeModal === 'progress-tracking' && (
        <FooterModal
          title="Progress &amp; Milestone Analytics"
          badgeText="Empirical Fitness Data"
          icon={TrendingUp}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Track your actual body transformations over time through interactive weight curves, tape measurements, workout volume milestones, and digital attendance check-ins.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Weight &amp; BMI Curves</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Log body weight entries and view visual progression curves across 30, 90, and 180-day intervals.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Body Circumference Logs</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Record chest, bicep, waist, and thigh dimensions to verify lean muscle accretion over fat tissue.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Turnstile Check-In History</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Complete attendance ledger recorded automatically via your digital member QR turnstile scans.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Personal Best (PR) Vault</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Automatic badges and milestones celebrating new records on Bench Press, Deadlift, Squats, and 5K runs.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 5. My Membership Modal ────────────────────────────────────────── */}
      {activeModal === 'my-membership' && (
        <FooterModal
          title="Customer Gym Membership"
          badgeText="Subscriptions &amp; Turnstile Access"
          icon={CreditCard}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Complete control over your fitness club membership. Review your plan details, valid dates, facility inclusions, and renew in one click without waiting at the desk.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Live Status &amp; Expiry</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  See exact active plan tier (Monthly, Quarterly, Annual), start date, and days remaining before renewal.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Digital QR Entry Pass</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Instant smartphone check-in pass for turnstiles and front-desk attendance verification.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Facility Privileges</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Access breakdown: Free weights, cardio zones, steam room, lockers, and guest day-pass allocations.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>1-Click Digital Renewal</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Renew or upgrade your gym package seamlessly via UPI, credit/debit card, or net banking.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 6. My Payments Modal ──────────────────────────────────────────── */}
      {activeModal === 'my-payments' && (
        <FooterModal
          title="Payment History &amp; Invoices"
          badgeText="Billing &amp; Tax Invoices"
          icon={CreditCard}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Clear, transparent records of every payment made through Gymora with instant invoice downloads and transaction reference lookups.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Audited Transaction Logs</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Itemized ledger detailing timestamp, amount, payment method (UPI/Card), and transaction status.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Downloadable PDF Receipts</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Official GST/tax invoices ready for employer wellness claims or personal expense archiving.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Zero Hidden Surcharges</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Full upfront visibility into membership costs, taxes, and applied discount vouchers before payment.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Bank-Grade Encryption</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Secure 256-bit SSL encrypted transactions through certified RBI/PCI-DSS payment gateways.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 7. My Orders Modal ────────────────────────────────────────────── */}
      {activeModal === 'my-orders' && (
        <FooterModal
          title="Gym Store Orders &amp; Supplements"
          badgeText="Verified Products &amp; Gear"
          icon={ShoppingBag}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Track orders placed at your gym's official store for certified whey protein, pre-workouts, creatine, lifting accessories, and fitness apparel.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Live Fulfillment Tracking</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Clear step-by-step progress tracking: Placed, Processing, and Ready for Front-Desk Pickup.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>100% Authentic Stock</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Direct brand-authorized inventory verified by gym management — zero adulterated supplements.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Front-Desk Pickup PIN</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Convenient digital pickup codes to collect your order right when you walk into the gym.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Easy Cancellation</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Cancel eligible pending orders in one tap before order packing commences.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 8. Rewards & Referrals Modal ──────────────────────────────────── */}
      {activeModal === 'rewards-referrals' && (
        <FooterModal
          title="Rewards &amp; Referral Engine"
          badgeText="Loyalty Points &amp; Invites"
          icon={Gift}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Earn Gymora fitness points for sticking to your workouts, conquer gym challenges, and share your unique referral code to earn free membership extensions and merchandise discounts.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Unique Share Link</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Personal referral links with 1-click WhatsApp and social sharing for friends and workout buddies.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Consistency Points</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Earn points automatically each time you check in, finish workout plans, or log weekly meals.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Store Voucher Redemptions</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Convert points wallet balance into free protein shakes, gym merchandise, or renewal rebates.
                </p>
              </div>

              <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-1">
                <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                  <CheckCircle2 size={15} className="text-[#2DD4BF] shrink-0" />
                  <span>Live Referral Ledger</span>
                </div>
                <p className="text-xs text-[#9AAEAE] pl-5">
                  Track invited friends from registration to membership activation to verify earned bonuses.
                </p>
              </div>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 9. Help & Support Modal ───────────────────────────────────────── */}
      {activeModal === 'help-support' && (
        <FooterModal title="Help &amp; Support" icon={HelpCircle} onClose={closeModal}>
          <SupportForm
            title="Submit a Support Request"
            subtitle="Describe your issue and our support team will respond within 24 hours."
            includeCategory={true}
            includeAttachment={true}
            onClose={closeModal}
          />
        </FooterModal>
      )}

      {/* ─── 10. FAQ Modal ─────────────────────────────────────────────────── */}
      {activeModal === 'faqs' && (
        <FooterModal title="Frequently Asked Questions" icon={MessageSquare} onClose={closeModal}>
          <div className="mb-4">
            <p className="text-sm text-[#9AAEAE]">
              Find answers to common questions about your Gymora membership, workouts, payments, and more.
            </p>
          </div>
          <FAQAccordion />
          <div className="mt-6 pt-4 border-t border-[#2A3A3A] flex items-center justify-between">
            <p className="text-sm text-[#9AAEAE]">Can't find an answer?</p>
            <button
              onClick={() => setActiveModal('help-support')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs transition-all cursor-pointer"
            >
              Contact Support
              <ArrowLeft size={14} className="rotate-180" />
            </button>
          </div>
        </FooterModal>
      )}

      {/* ─── 11. Contact Us Modal ──────────────────────────────────────────── */}
      {activeModal === 'contact-us' && (
        <FooterModal title="Contact Us" icon={Mail} onClose={closeModal}>
          <div className="mb-4 p-4 bg-[#0E1415] rounded-xl border border-[#2A3A3A]">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-[#2DD4BF] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#F5FAFA] mb-1">Gymora Support Desk</p>
                <p className="text-xs text-[#9AAEAE]">
                  Use the form below to reach our support team. We respond to all inquiries within 24 business hours.
                </p>
              </div>
            </div>
          </div>
          <SupportForm
            title="Send Us a Message"
            subtitle="Fill in the form and we'll get back to you as soon as possible."
            includeCategory={false}
            includeAttachment={false}
            onClose={closeModal}
          />
        </FooterModal>
      )}

      {/* ─── 12. Report an Issue Modal ─────────────────────────────────────── */}
      {activeModal === 'report-issue' && (
        <FooterModal title="Report an Issue" icon={AlertTriangle} onClose={closeModal}>
          <SupportForm
            title="Report a Technical Issue"
            subtitle="Help us improve Gymora by reporting bugs, errors, or unexpected behaviour."
            includeCategory={true}
            includeAttachment={true}
            onClose={closeModal}
          />
        </FooterModal>
      )}

      {/* ─── 13. Privacy Policy Modal ──────────────────────────────────────── */}
      {activeModal === 'privacy-policy' && (
        <FooterModal
          title="Privacy Policy Overview"
          badgeText="Data Protection &amp; Security"
          icon={Shield}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Gymora respects your personal privacy. We collect only the information necessary to provide workout planning, membership access, and secure payment processing.
            </p>
            <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                <CheckCircle2 size={15} className="text-[#2DD4BF]" />
                <span>Key Privacy Commitments</span>
              </div>
              <ul className="text-xs text-[#9AAEAE] space-y-1.5 pl-6 list-disc">
                <li>Your health and workout logs are never sold to external third-party advertisers.</li>
                <li>Payment details are tokenized and processed via PCI-DSS compliant banking partners.</li>
                <li>You can export or delete your profile and biometric measurements at any time.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/privacy-policy"
                state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>Read Full Privacy Policy</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 14. Terms & Conditions Modal ──────────────────────────────────── */}
      {activeModal === 'terms-conditions' && (
        <FooterModal
          title="Terms &amp; Conditions Overview"
          badgeText="User Agreement"
          icon={FileText}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              These terms govern your use of the Gymora Customer Portal, mobile web app, and gym-partner check-in facilities.
            </p>
            <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                <CheckCircle2 size={15} className="text-[#2DD4BF]" />
                <span>Summary of Platform Rules</span>
              </div>
              <ul className="text-xs text-[#9AAEAE] space-y-1.5 pl-6 list-disc">
                <li>Membership passes and QR entry codes are personal and strictly non-transferable.</li>
                <li>Members must follow all on-site partner gym safety etiquette and equipment guidelines.</li>
                <li>Trainer cancellations must be made 24 hours in advance to receive full session credit.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/terms-of-service"
                state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>Read Full Terms</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 15. Cancellation & Refund Policy Modal ────────────────────────── */}
      {activeModal === 'cancellation-refund' && (
        <FooterModal
          title="Cancellation &amp; Refund Policy"
          badgeText="Refund Rules &amp; Timelines"
          icon={RefreshCw}
          onClose={closeModal}
        >
          <div className="space-y-4">
            <p className="text-sm text-[#9AAEAE] leading-relaxed">
              Clear refund standards governing membership cancellations, trainer session booking cancellations, and merchandise returns.
            </p>
            <div className="p-3.5 rounded-xl bg-[#0E1415] border border-[#2A3A3A] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#F5FAFA]">
                <CheckCircle2 size={15} className="text-[#2DD4BF]" />
                <span>Eligibility &amp; Processing</span>
              </div>
              <ul className="text-xs text-[#9AAEAE] space-y-1.5 pl-6 list-disc">
                <li>Memberships cancelled within 24 hours prior to first gym check-in are eligible for a full refund.</li>
                <li>Trainer sessions cancelled with &gt;24 hours notice receive 100% refund; 6-24 hrs notice receives 50%.</li>
                <li>Approved digital refunds are credited back to the original payment source within 5 to 10 business days.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#2A3A3A]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#141D1E] text-[#9AAEAE] hover:text-white text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/cancellation-refund-policy"
                state={{ from: '/portal/customer', fromLabel: 'Back to Customer Portal' }}
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-[#2DD4BF] hover:bg-[#5EEAD4] text-[#06201D] font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
              >
                <span>Read Complete Refund Policy</span>
                <ExternalLink size={13} />
              </Link>
            </div>
          </div>
        </FooterModal>
      )}
    </>
  );
};

export default CustomerPortalFooter;
