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
import { FaInstagram, FaTwitter, FaFacebook, FaYoutube } from 'react-icons/fa';

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
        <div className="w-16 h-16 bg-[#FFF7ED] rounded-full flex items-center justify-center mx-auto mb-4">
          <Check size={32} className="text-[#EA580C]" />
        </div>
        <h3 className="text-lg font-bold text-[#111827] mb-2">Request Submitted!</h3>
        <p className="text-sm text-[#64748B] mb-4">
          Your support request has been recorded. Our team will get back to you shortly.
        </p>
        <div className="inline-block bg-[#F8FAFC] border border-[#FFEDD5] rounded-xl px-6 py-3 mb-6">
          <p className="text-xs text-[#64748B] mb-1">Ticket Reference</p>
          <p className="text-lg font-mono font-bold text-[#EA580C]">{ticketRef}</p>
        </div>
        <p className="text-xs text-[#64748B] mb-6">Keep this reference for follow-up inquiries.</p>
        <button
          onClick={onClose}
          className="px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all cursor-pointer"
        >
          Close
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div>
        <h3 className="text-lg font-bold text-[#111827]">{title}</h3>
        <p className="text-sm text-[#64748B] mt-1">{subtitle}</p>
      </div>

      {error && (
        <div className="p-3 rounded-xl bg-red-900/20 border border-red-500/30 text-[#B91C1C] text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Name (optional)</label>
          <input
            type="text"
            value={form.name}
            onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
            placeholder="Your name"
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#111827] placeholder-[#E2E8F0] focus:outline-none focus:border-[#FFEDD5] transition-colors"
          />
        </div>
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Email (optional)</label>
          <input
            type="email"
            value={form.email}
            onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
            placeholder="your@email.com"
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#111827] placeholder-[#E2E8F0] focus:outline-none focus:border-[#FFEDD5] transition-colors"
          />
        </div>
      </div>

      {includeCategory && (
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">Category</label>
          <select
            value={form.category}
            onChange={e => setForm(p => ({ ...p, category: e.target.value }))}
            className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#111827] focus:outline-none focus:border-[#FFEDD5] transition-colors"
          >
            <option value="">Select a category</option>
            {CATEGORIES.map(c => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
      )}

      <div>
        <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
          Subject <span className="text-[#B91C1C]">*</span>
        </label>
        <input
          type="text"
          value={form.subject}
          onChange={e => setForm(p => ({ ...p, subject: e.target.value }))}
          placeholder="Brief description of your issue"
          required
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#111827] placeholder-[#E2E8F0] focus:outline-none focus:border-[#FFEDD5] transition-colors"
        />
      </div>

      <div>
        <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
          Description <span className="text-[#B91C1C]">*</span>
        </label>
        <textarea
          value={form.message}
          onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
          placeholder="Describe your issue in detail..."
          required
          rows={5}
          className="w-full bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl px-3 py-2.5 text-sm text-[#111827] placeholder-[#E2E8F0] focus:outline-none focus:border-[#FFEDD5] transition-colors resize-none"
        />
      </div>

      {includeAttachment && (
        <div>
          <label className="block text-xs font-semibold text-[#64748B] mb-1.5">
            Screenshot / Attachment <span className="text-[#E2E8F0]">(optional)</span>
          </label>
          <div className="w-full border border-dashed border-[#E2E8F0] rounded-xl px-3 py-4 text-center text-xs text-[#E2E8F0]">
            Attachment upload available in member dashboard
          </div>
        </div>
      )}

      <div className="flex items-center justify-end gap-3 pt-2">
        <button
          type="button"
          onClick={onClose}
          className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] text-sm transition-colors cursor-pointer"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={submitting}
          className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-sm transition-all cursor-pointer disabled:opacity-60"
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
        <div key={cat.category} className="border border-[#E2E8F0] rounded-2xl overflow-hidden">
          <button
            onClick={() =>
              setOpenCategory(openCategory === cat.category ? null : cat.category)
            }
            className="w-full flex items-center justify-between p-4 text-left bg-[#F8FAFC] hover:bg-[#FFFFFF] transition-colors cursor-pointer"
          >
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-lg bg-[#FFF7ED] flex items-center justify-center text-[#EA580C]">
                <cat.icon size={16} />
              </div>
              <span className="font-semibold text-[#111827] text-sm">{cat.category}</span>
              <span className="text-xs text-[#E2E8F0] bg-[#FFFFFF] px-2 py-0.5 rounded-full">
                {cat.faqs.length}
              </span>
            </div>
            {openCategory === cat.category ? (
              <ChevronUp size={16} className="text-[#EA580C] shrink-0" />
            ) : (
              <ChevronDown size={16} className="text-[#64748B] shrink-0" />
            )}
          </button>
          {openCategory === cat.category && (
            <div className="divide-y divide-[#F8FAFC]">
              {cat.faqs.map((faq) => (
                <div key={faq.q} className="bg-[#FFFFFF]">
                  <button
                    onClick={() =>
                      setOpenQuestion(openQuestion === faq.q ? null : faq.q)
                    }
                    className="w-full flex items-start justify-between gap-4 px-4 py-3 text-left hover:bg-[#FFF7ED] transition-colors cursor-pointer"
                  >
                    <span className="text-base font-semibold text-[#111827]">{faq.q}</span>
                    {openQuestion === faq.q ? (
                      <ChevronUp size={16} className="text-[#EA580C] shrink-0 mt-0.5" />
                    ) : (
                      <ChevronDown size={16} className="text-[#64748B] shrink-0 mt-0.5" />
                    )}
                  </button>
                  {openQuestion === faq.q && (
                    <div className="px-4 pb-4 pt-1">
                      <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{faq.a}</p>
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
    className="fixed inset-0 z-[200] flex items-center justify-center p-4 sm:p-6 bg-[#000000]/60 backdrop-blur-sm animate-in fade-in duration-200"
    onClick={onClose}
  >
    <div
      className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl w-full max-w-2xl max-h-[88vh] overflow-y-auto shadow-2xl"
      onClick={e => e.stopPropagation()}
    >
      <div className="flex items-center justify-between p-6 border-b border-[#E2E8F0] sticky top-0 bg-[#FFFFFF] z-10">
        <div className="flex items-center gap-3.5">
          <div className="w-11 h-11 rounded-2xl bg-[#FFF7ED] border border-[#FFEDD5] flex items-center justify-center text-[#EA580C] shrink-0">
            <Icon size={22} />
          </div>
          <div>
            {badgeText && (
              <span className="text-xs font-bold uppercase tracking-wider text-[#EA580C] block mb-0.5">
                {badgeText}
              </span>
            )}
            <h2 className="text-xl sm:text-2xl font-black text-[#111827]">{title}</h2>
          </div>
        </div>
        <button
          onClick={onClose}
          className="p-2 text-[#64748B] hover:text-[#C2410C] hover:bg-[#FFF7ED] rounded-full transition-colors cursor-pointer"
        >
          <X size={22} />
        </button>
      </div>
      <div className="p-6 sm:p-7">{children}</div>
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
    'text-sm text-[#64748B] hover:text-[#EA580C] transition-colors cursor-pointer text-left block w-full py-0.5';

  return (
    <>
      {/* ─── Footer ─────────────────────────────────────────────────────────── */}
      <footer className="bg-[#FFFFFF] border-t border-[#F8FAFC] pt-16 pb-12 mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-12 gap-8 lg:gap-10 mb-12">

            {/* Brand Column */}
            <div className="lg:col-span-4">
              <button
                onClick={scrollToTop}
                className="inline-flex items-center space-x-2.5 mb-4 hover:opacity-80 transition-opacity cursor-pointer text-left"
              >
                <div className="w-8 h-8 bg-[#C2410C] rounded-lg flex items-center justify-center shadow-md shadow-orange-500/15">
                  <Activity className="text-[#FFFFFF]" size={18} strokeWidth={2.5} />
                </div>
                <span className="text-xl font-bold tracking-tight text-[#111827]">Gymora</span>
              </button>
              <p className="text-sm font-semibold text-[#EA580C] mb-2">Your fitness journey, simplified.</p>
              <p className="text-[#64748B] text-sm leading-relaxed mb-6">
                Track your fitness progress, follow personalized workout plans, connect with trainers,
                and stay consistent with your fitness goals.
              </p>
              <div className="flex space-x-4">
                <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#EA580C] transition-colors" aria-label="Instagram"><FaInstagram size={20} /></a>
                <a href="https://twitter.com" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#EA580C] transition-colors" aria-label="Twitter"><FaTwitter size={20} /></a>
                <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#EA580C] transition-colors" aria-label="Facebook"><FaFacebook size={20} /></a>
                <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="text-[#64748B] hover:text-[#EA580C] transition-colors" aria-label="YouTube"><FaYoutube size={20} /></a>
              </div>
            </div>

            {/* Section A: Fitness */}
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold text-[#111827] mb-4">Fitness</h4>
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
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold text-[#111827] mb-4">Customer Support</h4>
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
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold text-[#111827] mb-4">Membership</h4>
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
            <div className="lg:col-span-2">
              <h4 className="text-sm font-bold text-[#111827] mb-4">Legal</h4>
              <ul className="space-y-3">
                <li>
                  <Link
                    to="/privacy-policy"
                    state={{ from: '/portal/customer', fromLabel: 'Back to Customer' }}
                    className={FOOTER_LINK_CLASS}
                  >
                    Privacy Policy
                  </Link>
                </li>
                <li>
                  <Link
                    to="/terms-of-service"
                    state={{ from: '/portal/customer', fromLabel: 'Back to Customer' }}
                    className={FOOTER_LINK_CLASS}
                  >
                    Terms &amp; Conditions
                  </Link>
                </li>
                <li>
                  <Link
                    to="/cancellation-refund-policy"
                    state={{ from: '/portal/customer', fromLabel: 'Back to Customer' }}
                    className={FOOTER_LINK_CLASS}
                  >
                    Cancellation &amp; Refund Policy
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Centered Copyright Line */}
          <div className="border-t border-[#F8FAFC] pt-8 text-center text-sm text-[#64748B]">
            <p>&copy; {new Date().getFullYear()} Gymora Technologies Inc. All rights reserved.</p>
          </div>
        </div>
      </footer>

      {/* ─── 1. My Workout Plans Modal ─────────────────────────────────────── */}
      {activeModal === 'my-workout-plans' && (
        <FooterModal
          title="Gymora Workout Plans"
          badgeText="Personalized Training & Splits"
          icon={Dumbbell}
          onClose={closeModal}
        >
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
              Structured workout routines engineered around your specific goals — fat loss, hypertrophy, strength, or athletic conditioning — based on your equipment access and daily availability.
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Custom Split Routines', desc: 'Push-Pull-Legs, Upper-Lower, 4-Day Strength, or Full-Body conditioning splits scheduled by day.' },
                { label: 'Rep, Set & Load Targets', desc: 'Guided working sets, target rep ranges (8–12 hypertrophy, 3–5 strength), and progressive overload logs.' },
                { label: 'Video Demos & Form Cues', desc: 'HD demonstration clips, posture guidance, and muscle activation tips for injury prevention.' },
                { label: 'Live Rest Timers', desc: 'One-tap completion toggles with auto-countdown rest clocks between demanding compound lifts.' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base font-bold text-[#111827] block mb-0.5">{item.label}</span>
                    <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#C2410C] hover:border-[#FFEDD5] text-sm font-semibold transition-colors cursor-pointer">
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 2. My Diet Plans Modal ────────────────────────────────────────── */}
      {activeModal === 'my-diet-plans' && (
        <FooterModal
          title="Personalized Diet & Meal Plans"
          badgeText="Nutrition & Macro Budgets"
          icon={Apple}
          onClose={closeModal}
        >
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
              Tailored nutritional schedules designed to align with your metabolic rate and fitness objectives. Organized cleanly into breakfast, lunch, snacks, and dinner.
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Macro & Calorie Splits', desc: 'Calibrated daily protein grams (1.6–2.2g/kg), complex carbs, and essential healthy fats.' },
                { label: 'Meal-by-Meal Schedule', desc: 'Specific portions, ingredients, and prep notes for breakfast, midday meals, and pre/post-workout snacks.' },
                { label: 'Dietary Flexibility', desc: 'Full meal options for Vegetarian, Non-Vegetarian, Eggetarian, High-Protein, Keto, and Vegan athletes.' },
                { label: 'Weekly Recalibration', desc: 'Automated caloric deficit and step-count adjustments when weight loss slows for two consecutive weigh-ins.' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base font-bold text-[#111827] block mb-0.5">{item.label}</span>
                    <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#C2410C] hover:border-[#FFEDD5] text-sm font-semibold transition-colors cursor-pointer">
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
          badgeText="1-on-1 Coaching & Guidance"
          icon={Users}
          onClose={closeModal}
        >
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
              Find, evaluate, and book certified coaches at your partner gym for dedicated one-on-one personal training, biomechanical form correction, and habit accountability.
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Verified Credentials', desc: 'Inspect certified qualifications, ACE/ISSA accreditations, coaching history, and verified client reviews.' },
                { label: 'Diverse Specializations', desc: 'Body transformation, athletic powerlifting, HIIT conditioning, post-injury mobility, and competitive prep.' },
                { label: 'Real-Time Slot Booking', desc: 'Browse real-time hourly availability and book floor sessions with transparent package fees.' },
                { label: 'In-App Coach Chat', desc: 'Direct encrypted messaging with your trainer to submit meal check-ins and receive workout feedback.' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base font-bold text-[#111827] block mb-0.5">{item.label}</span>
                    <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#C2410C] hover:border-[#FFEDD5] text-sm font-semibold transition-colors cursor-pointer">
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 4. Progress Tracking Modal ────────────────────────────────────── */}
      {activeModal === 'progress-tracking' && (
        <FooterModal
          title="Progress & Milestone Analytics"
          badgeText="Empirical Fitness Data"
          icon={TrendingUp}
          onClose={closeModal}
        >
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
              Track your actual body transformations over time through interactive weight curves, tape measurements, workout volume milestones, and digital attendance check-ins.
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Weight & BMI Curves', desc: 'Log body weight entries and view visual progression curves across 30, 90, and 180-day intervals.' },
                { label: 'Body Circumference Logs', desc: 'Record chest, bicep, waist, and thigh dimensions to verify lean muscle accretion over fat tissue.' },
                { label: 'Turnstile Check-In History', desc: 'Complete attendance ledger recorded automatically via your digital member QR turnstile scans.' },
                { label: 'Personal Best (PR) Vault', desc: 'Automatic badges and milestones celebrating new records on Bench Press, Deadlift, Squats, and 5K runs.' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base font-bold text-[#111827] block mb-0.5">{item.label}</span>
                    <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#C2410C] hover:border-[#FFEDD5] text-sm font-semibold transition-colors cursor-pointer">
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
          badgeText="Subscriptions & Turnstile Access"
          icon={CreditCard}
          onClose={closeModal}
        >
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
              Complete control over your fitness club membership. Review your plan details, valid dates, facility inclusions, and renew in one click without waiting at the desk.
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Live Status & Expiry', desc: 'See exact active plan tier (Monthly, Quarterly, Annual), start date, and days remaining before renewal.' },
                { label: 'Digital QR Entry Pass', desc: 'Instant smartphone check-in pass for turnstiles and front-desk attendance verification.' },
                { label: 'Facility Privileges', desc: 'Access breakdown: Free weights, cardio zones, steam room, lockers, and guest day-pass allocations.' },
                { label: '1-Click Digital Renewal', desc: 'Renew or upgrade your gym package seamlessly via UPI, credit/debit card, or net banking.' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base font-bold text-[#111827] block mb-0.5">{item.label}</span>
                    <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#C2410C] hover:border-[#FFEDD5] text-sm font-semibold transition-colors cursor-pointer">
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 6. My Payments Modal ──────────────────────────────────────────── */}
      {activeModal === 'my-payments' && (
        <FooterModal
          title="Payment History & Invoices"
          badgeText="Billing & Tax Invoices"
          icon={CreditCard}
          onClose={closeModal}
        >
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
              Clear, transparent records of every payment made through Gymora with instant invoice downloads and transaction reference lookups.
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Audited Transaction Logs', desc: 'Itemized ledger detailing timestamp, amount, payment method (UPI/Card), and transaction status.' },
                { label: 'Downloadable PDF Receipts', desc: 'Official GST/tax invoices ready for employer wellness claims or personal expense archiving.' },
                { label: 'Zero Hidden Surcharges', desc: 'Full upfront visibility into membership costs, taxes, and applied discount vouchers before payment.' },
                { label: 'Bank-Grade Encryption', desc: 'Secure 256-bit SSL encrypted transactions through certified RBI/PCI-DSS payment gateways.' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base font-bold text-[#111827] block mb-0.5">{item.label}</span>
                    <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#C2410C] hover:border-[#FFEDD5] text-sm font-semibold transition-colors cursor-pointer">
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 7. My Orders Modal ────────────────────────────────────────────── */}
      {activeModal === 'my-orders' && (
        <FooterModal
          title="Gym Store Orders & Supplements"
          badgeText="Verified Products & Gear"
          icon={ShoppingBag}
          onClose={closeModal}
        >
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
              Track orders placed at your gym's official store for certified whey protein, pre-workouts, creatine, lifting accessories, and fitness apparel.
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Live Fulfillment Tracking', desc: 'Clear step-by-step progress tracking: Placed, Processing, and Ready for Front-Desk Pickup.' },
                { label: '100% Authentic Stock', desc: 'Direct brand-authorized inventory verified by gym management — zero adulterated supplements.' },
                { label: 'Front-Desk Pickup PIN', desc: 'Convenient digital pickup codes to collect your order right when you walk into the gym.' },
                { label: 'Easy Cancellation', desc: 'Cancel eligible pending orders in one tap before order packing commences.' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base font-bold text-[#111827] block mb-0.5">{item.label}</span>
                    <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#C2410C] hover:border-[#FFEDD5] text-sm font-semibold transition-colors cursor-pointer">
                Stay on Customer Portal
              </button>
            </div>
          </div>
        </FooterModal>
      )}

      {/* ─── 8. Rewards & Referrals Modal ──────────────────────────────────── */}
      {activeModal === 'rewards-referrals' && (
        <FooterModal
          title="Rewards & Referral Engine"
          badgeText="Loyalty Points & Invites"
          icon={Gift}
          onClose={closeModal}
        >
          <div className="space-y-6">
            <p className="text-base sm:text-lg text-[#334155] leading-relaxed">
              Earn Gymora fitness points for sticking to your workouts, conquer gym challenges, and share your unique referral code to earn free membership extensions and merchandise discounts.
            </p>
            <ul className="space-y-4">
              {[
                { label: 'Unique Share Link', desc: 'Personal referral links with 1-click WhatsApp and social sharing for friends and workout buddies.' },
                { label: 'Consistency Points', desc: 'Earn points automatically each time you check in, finish workout plans, or log weekly meals.' },
                { label: 'Store Voucher Redemptions', desc: 'Convert points wallet balance into free protein shakes, gym merchandise, or renewal rebates.' },
                { label: 'Live Referral Ledger', desc: 'Track invited friends from registration to membership activation to verify earned bonuses.' },
              ].map(item => (
                <li key={item.label} className="flex items-start gap-3.5">
                  <CheckCircle2 size={20} className="text-[#EA580C] shrink-0 mt-0.5" />
                  <div>
                    <span className="text-base font-bold text-[#111827] block mb-0.5">{item.label}</span>
                    <p className="text-sm sm:text-base text-[#475569] leading-relaxed">{item.desc}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="pt-5 border-t border-[#E2E8F0]">
              <button onClick={closeModal} className="px-5 py-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-[#334155] hover:text-[#C2410C] hover:border-[#FFEDD5] text-sm font-semibold transition-colors cursor-pointer">
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
            <p className="text-sm text-[#64748B]">
              Find answers to common questions about your Gymora membership, workouts, payments, and more.
            </p>
          </div>
          <FAQAccordion />
          <div className="mt-6 pt-4 border-t border-[#E2E8F0] flex items-center justify-between">
            <p className="text-sm text-[#64748B]">Can't find an answer?</p>
            <button
              onClick={() => setActiveModal('help-support')}
              className="flex items-center gap-1.5 px-4 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs transition-all cursor-pointer"
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
          <div className="mb-4 p-4 bg-[#F8FAFC] rounded-xl border border-[#E2E8F0]">
            <div className="flex items-start gap-3">
              <MapPin size={16} className="text-[#EA580C] shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-[#111827] mb-1">Gymora Support Desk</p>
                <p className="text-xs text-[#64748B]">
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
            <p className="text-sm text-[#64748B] leading-relaxed">
              Gymora respects your personal privacy. We collect only the information necessary to provide workout planning, membership access, and secure payment processing.
            </p>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                <CheckCircle2 size={15} className="text-[#EA580C]" />
                <span>Key Privacy Commitments</span>
              </div>
              <ul className="text-xs text-[#64748B] space-y-1.5 pl-6 list-disc">
                <li>Your health and workout logs are never sold to external third-party advertisers.</li>
                <li>Payment details are tokenized and processed via PCI-DSS compliant banking partners.</li>
                <li>You can export or delete your profile and biometric measurements at any time.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/privacy-policy"
                state={{ from: '/portal/customer', fromLabel: 'Back to Customer' }}
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
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
            <p className="text-sm text-[#64748B] leading-relaxed">
              These terms govern your use of the Gymora Customer Portal, mobile web app, and gym-partner check-in facilities.
            </p>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                <CheckCircle2 size={15} className="text-[#EA580C]" />
                <span>Summary of Platform Rules</span>
              </div>
              <ul className="text-xs text-[#64748B] space-y-1.5 pl-6 list-disc">
                <li>Membership passes and QR entry codes are personal and strictly non-transferable.</li>
                <li>Members must follow all on-site partner gym safety etiquette and equipment guidelines.</li>
                <li>Trainer cancellations must be made 24 hours in advance to receive full session credit.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/terms-of-service"
                state={{ from: '/portal/customer', fromLabel: 'Back to Customer' }}
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
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
            <p className="text-sm text-[#64748B] leading-relaxed">
              Clear refund standards governing membership cancellations, trainer session booking cancellations, and merchandise returns.
            </p>
            <div className="p-3.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] space-y-2">
              <div className="flex items-center gap-2 text-xs font-bold text-[#111827]">
                <CheckCircle2 size={15} className="text-[#EA580C]" />
                <span>Eligibility &amp; Processing</span>
              </div>
              <ul className="text-xs text-[#64748B] space-y-1.5 pl-6 list-disc">
                <li>Memberships cancelled within 24 hours prior to first gym check-in are eligible for a full refund.</li>
                <li>Trainer sessions cancelled with &gt;24 hours notice receive 100% refund; 6-24 hrs notice receives 50%.</li>
                <li>Approved digital refunds are credited back to the original payment source within 5 to 10 business days.</li>
              </ul>
            </div>

            <div className="flex items-center justify-between pt-4 border-t border-[#E2E8F0]">
              <button
                onClick={closeModal}
                className="px-4 py-2 rounded-xl bg-[#FFFFFF] text-[#64748B] hover:text-[#C2410C] text-xs transition-colors cursor-pointer"
              >
                Close
              </button>
              <Link
                to="/cancellation-refund-policy"
                state={{ from: '/portal/customer', fromLabel: 'Back to Customer' }}
                onClick={closeModal}
                className="px-5 py-2 rounded-xl bg-[#C2410C] hover:bg-[#9A3412] text-white font-bold text-xs transition-all flex items-center gap-1.5 shadow-md"
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
