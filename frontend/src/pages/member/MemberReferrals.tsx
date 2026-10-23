import React, { useState, useEffect } from 'react';
import {
  Gift, Share2, Copy, Check, MessageCircle, Users, Award,
  Sparkles, ArrowUpRight, Clock, CheckCircle2, AlertCircle,
  TrendingUp, CreditCard, ShieldCheck, ChevronRight,
  Coins, HelpCircle, FileText, Mail, Send, Smartphone, QrCode,
  ExternalLink, CheckCircle, Info
} from 'lucide-react';
import QRCode from 'react-qr-code';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface CustomerReferralStats {
  totalInvited: number;
  registeredCount: number;
  pendingPaymentCount: number;
  successfulCount: number;
  pendingRewardsCount: number;
  totalEarned: number;
  totalRedeemed: number;
  availableBalance: number;
  rewardType: string;
}

interface CustomerReferralItem {
  _id: string;
  refereeName?: string;
  referredName?: string;
  inviteeEmail?: string;
  inviteChannel?: string;
  registrationDate?: string;
  createdAt?: string;
  membershipPlan?: string;
  membershipPlanName?: string;
  status: 'Invited' | 'Registered' | 'Membership Pending' | 'Payment Verified' | 'Reward Pending' | 'Reward Issued' | 'Expired' | 'Cancelled' | 'Rejected' | string;
  rewardType: string;
  rewardAmount: number;
  rewardStatus: string;
  rewardIssuedAt?: string;
}

interface RewardTransaction {
  _id: string;
  rewardType: string;
  amount: number;
  status: 'Pending' | 'Available' | 'Redeemed' | 'Reversed' | 'Expired';
  sourceEvent: string;
  issuedAt: string;
  expiryDate?: string;
}

const MemberReferrals: React.FC = () => {
  const { user } = useAuth();
  const [referralCode, setReferralCode] = useState<string>('');
  const [shareLink, setShareLink] = useState<string>('');
  const [networkShareLink, setNetworkShareLink] = useState<string>('');
  const [gymName, setGymName] = useState<string>('Our Gym');
  const [activeCampaign, setActiveCampaign] = useState<any>(null);
  const [stats, setStats] = useState<CustomerReferralStats>({
    totalInvited: 0,
    registeredCount: 0,
    pendingPaymentCount: 0,
    successfulCount: 0,
    pendingRewardsCount: 0,
    totalEarned: 0,
    totalRedeemed: 0,
    availableBalance: 0,
    rewardType: 'Membership Credit'
  });
  const [referrals, setReferrals] = useState<CustomerReferralItem[]>([]);
  const [transactions, setTransactions] = useState<RewardTransaction[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [copiedCode, setCopiedCode] = useState<boolean>(false);
  const [copiedLink, setCopiedLink] = useState<boolean>(false);
  const [redeemLoading, setRedeemLoading] = useState<boolean>(false);

  // Email Referral Form State
  const [inviteName, setInviteName] = useState<string>('');
  const [inviteEmail, setInviteEmail] = useState<string>('');
  const [inviteMessage, setInviteMessage] = useState<string>(
    "Hey! Come workout with me at our gym. Use my referral link to get an exclusive discount on your membership!"
  );
  const [sendingInvite, setSendingInvite] = useState<boolean>(false);
  const [inviteFeedback, setInviteFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Modal / View controls
  const [showQrModal, setShowQrModal] = useState<boolean>(false);

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const [codeRes, statsRes, histRes, ledgerRes] = await Promise.all([
        api.get('/referrals/my-code'),
        api.get('/referrals/my-stats'),
        api.get('/referrals/my-history'),
        api.get('/referrals/my-rewards-ledger').catch(() => ({ data: { success: true, transactions: [] } }))
      ]);

      if (codeRes.data?.success) {
        setReferralCode(codeRes.data.referralCode || '');
        setShareLink(codeRes.data.shareLink || '');
        setNetworkShareLink(codeRes.data.networkShareLink || '');
        setGymName(codeRes.data.gymName || user?.gymName || 'Our Gym');
        setActiveCampaign(codeRes.data.campaign);
      } else {
        // Fallback referral code generation if API gave blank
        const fallbackCode = `${(user?.firstName || 'MEMBER').toUpperCase().slice(0, 5)}${Math.floor(1000 + Math.random() * 9000)}`;
        setReferralCode(fallbackCode);
        setShareLink(`${window.location.origin}/register/customer?ref=${fallbackCode}`);
      }

      if (statsRes.data?.success) {
        const s = statsRes.data.stats || {};
        setStats({
          totalInvited: s.totalInvited ?? s.totalInvitations ?? 0,
          registeredCount: s.registeredCount ?? s.registeredReferrals ?? 0,
          pendingPaymentCount: s.pendingPaymentCount ?? s.pendingMembershipPayments ?? 0,
          successfulCount: s.successfulCount ?? s.successfulReferrals ?? 0,
          pendingRewardsCount: s.pendingRewardsCount ?? s.pendingRewards ?? 0,
          totalEarned: s.totalEarned ?? s.totalRewardsEarned ?? 0,
          totalRedeemed: s.totalRedeemed ?? s.totalRewardsRedeemed ?? 0,
          availableBalance: s.availableBalance ?? s.creditsBalance ?? 0,
          rewardType: s.rewardType || 'Membership Credit'
        });
      }

      if (histRes.data?.success) {
        setReferrals(histRes.data.history || histRes.data.referrals || []);
      }

      if (ledgerRes.data?.success) {
        setTransactions(ledgerRes.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load referral data', err);
      // Fallback referral code for immediate usability
      if (!referralCode) {
        const fallbackCode = `${(user?.firstName || 'MEMBER').toUpperCase().slice(0, 5)}${Math.floor(1000 + Math.random() * 9000)}`;
        setReferralCode(fallbackCode);
        setShareLink(`${window.location.origin}/register/customer?ref=${fallbackCode}`);
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchReferralData();
  }, []);

  const handleCopyCode = () => {
    if (!referralCode) return;
    navigator.clipboard.writeText(referralCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  const handleCopyLink = () => {
    if (!shareLink) return;
    navigator.clipboard.writeText(shareLink);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const friendBenefit = activeCampaign
    ? activeCampaign.refereeDiscountType === 'Percentage'
      ? `${activeCampaign.refereeRewardValue}% off`
      : `₹${activeCampaign.refereeRewardValue} off`
    : 'exclusive discount';

  const defaultShareText = `Hey! I workout at ${gymName || 'our gym'}. Use my referral code ${referralCode} to get ${friendBenefit} on your membership! Join here: ${shareLink}`;

  // 1. WhatsApp Share
  const handleWhatsAppShare = () => {
    const text = encodeURIComponent(defaultShareText);
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
  };

  // 2. SMS Share
  const handleSmsShare = () => {
    const text = encodeURIComponent(defaultShareText);
    window.open(`sms:?body=${text}`, '_blank');
  };

  // 3. Mail Client (mailto:)
  const handleMailtoClient = () => {
    const subject = encodeURIComponent(`Invitation to workout together at ${gymName}!`);
    const body = encodeURIComponent(
      `Hi ${inviteName || 'there'},\n\n${inviteMessage}\n\nPromo Code: ${referralCode}\nDiscount: ${friendBenefit}\nJoin here: ${shareLink}\n\nCheers,\n${user?.firstName || 'Your friend'}`
    );
    window.open(`mailto:${inviteEmail}?subject=${subject}&body=${body}`, '_blank');
  };

  // 4. Native Device Share
  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Join ${gymName} with my referral!`,
          text: defaultShareText,
          url: shareLink
        });
      } catch (err) {
        console.log('Share dismissed');
      }
    } else {
      handleCopyLink();
    }
  };

  // Share QR Code URL
  const handleShareQrCode = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: `Scan QR Code to Join ${gymName}!`,
          text: `Scan or click this QR link to join ${gymName} with my referral code (${referralCode}) for an exclusive discount!`,
          url: targetRegistrationUrl
        });
        return;
      } catch (err) {
        console.log('Share dismissed');
      }
    }
    navigator.clipboard.writeText(targetRegistrationUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  // 5. Send Direct Email Invite via Backend API
  const handleSendEmailInvite = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !inviteEmail.includes('@')) {
      setInviteFeedback({ type: 'error', message: 'Please enter a valid email address.' });
      return;
    }

    try {
      setSendingInvite(true);
      setInviteFeedback(null);
      const res = await api.post('/referrals/invite-email', {
        friendName: inviteName,
        friendEmail: inviteEmail,
        personalMessage: inviteMessage
      });

      if (res.data?.success) {
        setInviteFeedback({
          type: 'success',
          message: `Referral invite successfully sent to ${inviteEmail}!`
        });
        setInviteName('');
        setInviteEmail('');
        fetchReferralData();
      } else {
        setInviteFeedback({
          type: 'error',
          message: res.data?.message || 'Failed to send invite email.'
        });
      }
    } catch (err: any) {
      setInviteFeedback({
        type: 'error',
        message: err.response?.data?.message || 'Failed to send invite email. Please try again or use the Mail App option.'
      });
    } finally {
      setSendingInvite(false);
    }
  };

  const handleRedeemBalance = async () => {
    if (stats.availableBalance <= 0) {
      alert('You have no available reward balance to redeem.');
      return;
    }
    if (!window.confirm(`Do you want to apply ₹${stats.availableBalance} credit towards your gym membership renewal?`)) {
      return;
    }
    try {
      setRedeemLoading(true);
      const res = await api.post('/referrals/redeem', {
        amount: stats.availableBalance,
        redemptionNote: 'Applied to next membership invoice'
      });
      alert(res.data?.message || 'Reward redeemed successfully!');
      fetchReferralData();
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to redeem reward');
    } finally {
      setRedeemLoading(false);
    }
  };

  // Target Customer Registration URL for QR Code and direct links
  const targetRegistrationUrl = (() => {
    // If backend provided a LAN IP network link and we are on localhost, prioritize it so phone camera scans work across Wi-Fi
    if (networkShareLink && (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1')) {
      return networkShareLink;
    }
    if (shareLink && !shareLink.includes('localhost') && !shareLink.includes('127.0.0.1')) {
      return shareLink;
    }
    const code = referralCode || (user?.firstName ? `${user.firstName.toUpperCase().slice(0, 5)}2026` : 'MEMBER2026');
    const gymId = user?.gymId ? `&gymId=${user.gymId}` : '';
    return `${window.location.origin}/register/customer?ref=${code}${gymId}`;
  })();

  return (
    <div className="min-h-screen bg-[#050505] text-[#FFFFFF] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Top Header Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-[#11111F] via-[#151515] to-[#0B0B12] border border-[#292940] p-6 sm:p-8 shadow-2xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[radial-gradient(circle,_rgba(99, 102, 241,0.12)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-3xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#818CF8]/15 border border-[#818CF8]/30 rounded-full text-xs font-bold uppercase tracking-wider text-[#818CF8]">
            <Gift size={14} className="text-[#818CF8]" />
            Refer & Earn Rewards
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-[#FFFFFF]">
            Invite Friends & Family, <span className="text-[#818CF8]">Get Rewarded Together!</span>
          </h1>
          <p className="text-[#A1A1AA] text-sm sm:text-base leading-relaxed">
            Give your friends an exclusive gym membership discount at <strong className="text-[#FFFFFF]">{gymName}</strong>, 
            and earn membership credits or rewards for every friend who joins!
          </p>
        </div>
      </div>

      {/* Main 2-Column Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column (2 Cols wide): Referral Code, Share Links, and Email Invitation Form */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* 1. Referral Code & Quick Share Bar */}
          <div className="bg-[#11111F] rounded-3xl border border-[#292940] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#292940] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/30">
                  <Share2 size={20} />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-[#FFFFFF]">Your Unique Referral Invite</h2>
                  <p className="text-xs text-[#A1A1AA]">Share with friends via link, mail, QR, or chat apps.</p>
                </div>
              </div>
            </div>

            {/* Referral Code Box */}
            <div className="p-5 bg-[#0B0B12] border border-[#292940] rounded-2xl space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                  Your Referral Promo Code
                </span>
                <span className="text-[11px] text-[#22C55E] font-medium flex items-center gap-1">
                  <ShieldCheck size={13} /> Active & Verified
                </span>
              </div>

              <div className="flex flex-col sm:flex-row items-center gap-3">
                <div className="flex-1 w-full bg-[#050505] border border-[#292940] rounded-2xl px-5 py-3 text-center sm:text-left font-mono font-extrabold text-2xl tracking-widest text-[#818CF8] shadow-inner select-all">
                  {referralCode || (loading ? 'FETCHING...' : 'FITCLUB2026')}
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <button
                    onClick={handleCopyCode}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-[#6366F1] hover:bg-[#4F46E5] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-[#6366F1]/25 cursor-pointer"
                  >
                    {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                    {copiedCode ? 'Copied!' : 'Copy Code'}
                  </button>

                  <button
                    onClick={handleCopyLink}
                    className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-[#11111F] border border-[#292940] hover:border-[#6366F1] text-[#FFFFFF] hover:text-[#6366F1] rounded-2xl text-xs font-bold transition-all cursor-pointer"
                  >
                    {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                    {copiedLink ? 'Link Copied!' : 'Copy Link'}
                  </button>
                </div>
              </div>

              {/* Multi-channel Quick Action Sharing Buttons */}
              <div className="pt-2">
                <p className="text-[11px] text-[#A1A1AA] font-semibold uppercase tracking-wider mb-2">
                  Instant Sharing Options
                </p>
                <div className="grid grid-cols-3 gap-2.5">
                  {/* WhatsApp */}
                  <button
                    onClick={handleWhatsAppShare}
                    className="py-2.5 px-3 bg-emerald-950/40 hover:bg-emerald-900/60 border border-emerald-700/50 text-emerald-400 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-sm cursor-pointer"
                  >
                    <MessageCircle size={15} />
                    WhatsApp
                  </button>

                  {/* QR Code */}
                  <button
                    onClick={() => setShowQrModal(!showQrModal)}
                    className="py-2.5 px-3 bg-[#0B0B12] hover:bg-[#17172A] border border-[#292940] hover:border-[#6366F1] text-[#FFFFFF] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <QrCode size={15} className="text-[#818CF8]" />
                    {showQrModal ? 'Hide QR' : 'Show QR'}
                  </button>

                  {/* Device Native Share */}
                  <button
                    onClick={handleNativeShare}
                    className="py-2.5 px-3 bg-[#0B0B12] hover:bg-[#17172A] border border-[#292940] hover:border-[#6366F1] text-[#FFFFFF] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  >
                    <ArrowUpRight size={15} className="text-[#6366F1]" />
                    Share More
                  </button>
                </div>
              </div>
            </div>

            {/* QR Code Inline Preview (if toggled) */}
            {showQrModal && (
              <div className="p-5 bg-[#0B0B12] border border-[#6366F1]/40 rounded-2xl flex flex-col sm:flex-row items-center gap-5 shadow-xl">
                <div className="bg-white p-3 rounded-xl shrink-0 shadow-lg">
                  <QRCode value={targetRegistrationUrl} size={135} />
                </div>
                <div className="space-y-2.5 text-center sm:text-left flex-1 min-w-0">
                  <div className="flex items-center justify-center sm:justify-start gap-2">
                    <span className="text-xs font-bold text-[#818CF8] uppercase tracking-wider flex items-center gap-1.5">
                      <QrCode size={14} className="text-[#818CF8]" /> In-Person Scan to Join
                    </span>
                    <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/15 text-emerald-400 border border-emerald-500/30">
                      Customer Registration
                    </span>
                  </div>
                  <p className="text-xs text-[#A1A1AA] leading-relaxed">
                    Show this QR code to a friend or relative. When scanned with their phone camera, it will instantly open the Customer Registration page with your referral code (<strong className="text-white">{referralCode}</strong>) pre-filled!
                  </p>
                  <div className="pt-1 flex flex-wrap items-center gap-3 justify-center sm:justify-start">
                    <button
                      type="button"
                      onClick={handleShareQrCode}
                      className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl bg-[#6366F1] hover:bg-[#4F46E5] text-white text-xs font-bold transition shadow-md shadow-[#6366F1]/25 cursor-pointer"
                    >
                      <Share2 size={13} />
                      <span>{copiedLink ? 'Link Copied!' : 'Share QR Code'}</span>
                    </button>
                    <a
                      href={targetRegistrationUrl}
                      target="_blank"
                      rel="noreferrer"
                      className="text-xs text-[#A1A1AA] hover:text-[#6366F1] transition inline-flex items-center gap-1 font-semibold"
                    >
                      <ExternalLink size={12} />
                      <span>Preview Form</span>
                    </a>
                    <button
                      onClick={() => setShowQrModal(false)}
                      className="text-xs text-[#A1A1AA] hover:text-white font-semibold cursor-pointer"
                    >
                      Close QR View
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* 2. Direct Email Invitation Form (The User's Core Request) */}
          <div className="bg-[#11111F] rounded-3xl border border-[#292940] p-6 sm:p-8 space-y-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-[#292940] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-[#6366F1]/15 text-[#6366F1] flex items-center justify-center border border-[#6366F1]/30">
                  <Mail size={20} />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-[#FFFFFF]">Send Invitation Link to Email</h3>
                  <p className="text-xs text-[#A1A1AA]">
                    Directly deliver a branded invitation with your referral link and discount coupon to their inbox.
                  </p>
                </div>
              </div>
              <span className="hidden sm:inline-flex px-2.5 py-1 bg-[#6366F1]/10 border border-[#6366F1]/20 text-white text-[11px] font-bold rounded-full">
                Auto-Tracked
              </span>
            </div>

            <form onSubmit={handleSendEmailInvite} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Friend's Name */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                    Friend or Relative's Name
                  </label>
                  <input
                    type="text"
                    value={inviteName}
                    onChange={(e) => setInviteName(e.target.value)}
                    placeholder="e.g. Rahul Sharma"
                    className="w-full px-4 py-3 bg-[#050505] border border-[#292940] focus:border-[#6366F1] rounded-xl text-sm text-[#FFFFFF] placeholder-[#737373] focus:outline-none transition-colors"
                  />
                </div>

                {/* Friend's Email */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                    Friend's Email Address <span className="text-[#6366F1]">*</span>
                  </label>
                  <input
                    type="email"
                    required
                    value={inviteEmail}
                    onChange={(e) => setInviteEmail(e.target.value)}
                    placeholder="e.g. friend@gmail.com"
                    className="w-full px-4 py-3 bg-[#050505] border border-[#292940] focus:border-[#6366F1] rounded-xl text-sm text-[#FFFFFF] placeholder-[#737373] focus:outline-none transition-colors"
                  />
                </div>
              </div>

              {/* Personal Message */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-[#A1A1AA] uppercase tracking-wider">
                    Personal Message (Optional)
                  </label>
                  <span className="text-[11px] text-[#737373]">Included in invitation email</span>
                </div>
                <textarea
                  rows={2}
                  value={inviteMessage}
                  onChange={(e) => setInviteMessage(e.target.value)}
                  placeholder="Add a personal encouragement..."
                  className="w-full px-4 py-2.5 bg-[#050505] border border-[#292940] focus:border-[#6366F1] rounded-xl text-xs text-[#FFFFFF] placeholder-[#737373] focus:outline-none transition-colors resize-none"
                />
              </div>

              {/* Feedback Alert */}
              {inviteFeedback && (
                <div
                  className={`p-3.5 rounded-xl border text-xs font-medium flex items-center gap-2 ${
                    inviteFeedback.type === 'success'
                      ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300'
                      : 'bg-red-950/40 border-red-800 text-red-300'
                  }`}
                >
                  {inviteFeedback.type === 'success' ? (
                    <CheckCircle2 size={16} className="shrink-0 text-emerald-400" />
                  ) : (
                    <AlertCircle size={16} className="shrink-0 text-red-400" />
                  )}
                  <span>{inviteFeedback.message}</span>
                </div>
              )}

              {/* Form Action Buttons */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  type="submit"
                  disabled={sendingInvite}
                  className="w-full sm:flex-1 py-3 px-5 bg-[#6366F1] hover:bg-[#4F46E5] disabled:opacity-50 text-white rounded-xl text-xs font-extrabold flex items-center justify-center gap-2 transition-all shadow-md shadow-[#6366F1]/25 cursor-pointer"
                >
                  <Send size={15} className={sendingInvite ? 'animate-pulse' : ''} />
                  {sendingInvite ? 'Sending Invitation...' : 'Send Invitation Email'}
                </button>

                <button
                  type="button"
                  onClick={handleMailtoClient}
                  className="w-full sm:w-auto py-3 px-4 bg-[#0B0B12] hover:bg-[#17172A] border border-[#292940] hover:border-[#6366F1] text-[#FFFFFF] rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all cursor-pointer"
                  title="Open draft in your local mail client (Gmail, Outlook, etc.)"
                >
                  <ExternalLink size={14} className="text-[#A1A1AA]" />
                  Open in Your Mail App
                </button>
              </div>
            </form>
          </div>

          {/* 3. Current Campaign Perks Breakdown Banner */}
          {activeCampaign && (
            <div className="p-6 bg-gradient-to-r from-[#11111F] to-[#141414] border border-[#292940] rounded-3xl space-y-4 shadow-md">
              <h3 className="text-xs font-bold text-[#818CF8] uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} className="text-[#818CF8]" />
                Current Active Referral Campaign Perks
              </h3>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-4 bg-[#0B0B12] rounded-2xl border border-[#292940] space-y-1">
                  <p className="text-[#A1A1AA]">You Earn (When Friend Joins):</p>
                  <p className="text-xl font-black text-[#818CF8]">
                    {activeCampaign.referrerRewardType === 'Membership Credit' ? '₹' : ''}
                    {activeCampaign.referrerRewardValue}
                    {activeCampaign.referrerRewardType === 'Wallet Points' ? ' Points' : ''}
                    {activeCampaign.referrerRewardType === 'Free Membership Days' ? ' Free Days' : ''}
                  </p>
                  <span className="text-[11px] text-[#22C55E] font-medium block">
                    Credited directly to your gym account
                  </span>
                </div>

                <div className="p-4 bg-[#0B0B12] rounded-2xl border border-[#292940] space-y-1">
                  <p className="text-[#A1A1AA]">Your Friend Gets:</p>
                  <p className="text-xl font-black text-[#22C55E]">
                    {activeCampaign.refereeDiscountType === 'Percentage'
                      ? `${activeCampaign.refereeRewardValue}% Discount`
                      : `₹${activeCampaign.refereeRewardValue} Discount`}
                  </p>
                  <span className="text-[11px] text-[#A1A1AA] font-medium block">
                    Applied instantly at membership checkout
                  </span>
                </div>
              </div>

              {activeCampaign.termsAndConditions && (
                <div className="text-[11px] text-[#A1A1AA] flex items-start gap-1.5 pt-1 border-t border-[#17172A]">
                  <FileText size={13} className="shrink-0 mt-0.5 text-[#818CF8]" />
                  <span><strong>Terms & Conditions:</strong> {activeCampaign.termsAndConditions}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column (1 Col wide): Rewards Wallet & How It Works */}
        <div className="space-y-6">
          
          {/* Rewards Balance Wallet Card */}
          <div className="bg-[#11111F] rounded-3xl border border-[#292940] p-6 shadow-xl space-y-5">
            <div className="flex items-center justify-between border-b border-[#292940] pb-3">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-[#818CF8]" />
                <h3 className="text-base font-bold text-[#FFFFFF]">My Rewards Balance</h3>
              </div>
              <span className="text-[11px] font-bold px-2.5 py-0.5 bg-[#818CF8]/15 border border-[#818CF8]/30 text-[#818CF8] rounded-full">
                {stats.rewardType}
              </span>
            </div>

            <div className="p-6 bg-gradient-to-br from-[#0B0B12] via-[#151515] to-[#050505] rounded-2xl border border-[#292940] text-center space-y-1.5">
              <span className="text-xs text-[#A1A1AA] font-semibold uppercase tracking-wider">
                Available To Redeem
              </span>
              <div className="text-4xl font-black text-[#818CF8] tracking-tight">
                {stats.rewardType === 'Wallet Points' ? `${stats.availableBalance} Pts` : `₹${stats.availableBalance}`}
              </div>
              <p className="text-[11px] text-[#A1A1AA]">
                Ready to apply towards your gym membership renewals
              </p>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="flex justify-between items-center py-1 border-b border-[#17172A] text-[#A1A1AA]">
                <span>Total Earned:</span>
                <span className="font-bold text-[#FFFFFF]">₹{stats.totalEarned}</span>
              </div>
              <div className="flex justify-between items-center py-1 border-b border-[#17172A] text-[#A1A1AA]">
                <span>Total Redeemed:</span>
                <span className="font-bold text-[#FFFFFF]">₹{stats.totalRedeemed}</span>
              </div>
              <div className="flex justify-between items-center py-1 text-[#A1A1AA]">
                <span>Pending Approvals:</span>
                <span className="font-bold text-amber-500">{stats.pendingRewardsCount}</span>
              </div>
            </div>

            <div className="pt-2">
              <button
                onClick={handleRedeemBalance}
                disabled={stats.availableBalance <= 0 || redeemLoading}
                className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                  stats.availableBalance > 0
                    ? 'bg-[#6366F1] hover:bg-[#4F46E5] text-white shadow-[#6366F1]/25 cursor-pointer'
                    : 'bg-[#17172A] text-[#737373] cursor-not-allowed border border-[#292940]'
                }`}
              >
                {redeemLoading ? 'Redeeming Reward...' : 'Redeem Available Balance'}
              </button>
            </div>
          </div>

          {/* Quick How It Works Card */}
          <div className="bg-[#11111F] rounded-3xl border border-[#292940] p-6 shadow-xl space-y-4">
            <h4 className="text-sm font-bold text-[#FFFFFF] flex items-center gap-2">
              <HelpCircle size={17} className="text-[#6366F1]" />
              How Referral Rewards Work
            </h4>

            <div className="space-y-3.5 text-xs">
              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  1
                </div>
                <div>
                  <p className="font-bold text-[#FFFFFF]">Share Code or Send Mail</p>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Send the link to your friend's email, WhatsApp, or let them scan your QR code.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  2
                </div>
                <div>
                  <p className="font-bold text-[#FFFFFF]">Friend Gets Instant Discount</p>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Your friend gets {friendBenefit} applied automatically during registration and checkout.
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-3">
                <div className="w-6 h-6 rounded-full bg-[#6366F1]/15 text-[#6366F1] border border-[#6366F1]/30 flex items-center justify-center font-bold shrink-0 mt-0.5">
                  3
                </div>
                <div>
                  <p className="font-bold text-[#FFFFFF]">You Receive Member Credits</p>
                  <p className="text-[11px] text-[#A1A1AA] mt-0.5">
                    Once their membership payment is confirmed, rewards are credited straight to your balance.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Referral Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-[#11111F] p-5 rounded-2xl border border-[#292940] shadow-md space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">Total Invited</span>
          <div className="text-2xl font-black text-[#FFFFFF]">{stats.totalInvited}</div>
          <span className="text-[11px] text-[#A1A1AA]">Friends signed up or invited</span>
        </div>

        <div className="bg-[#11111F] p-5 rounded-2xl border border-[#292940] shadow-md space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">Pending Payments</span>
          <div className="text-2xl font-black text-amber-500">{stats.pendingPaymentCount}</div>
          <span className="text-[11px] text-[#A1A1AA]">Awaiting plan purchase</span>
        </div>

        <div className="bg-[#11111F] p-5 rounded-2xl border border-[#292940] shadow-md space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">Successful Referrals</span>
          <div className="text-2xl font-black text-[#22C55E]">{stats.successfulCount}</div>
          <span className="text-[11px] text-[#22C55E] font-medium">Paid members confirmed</span>
        </div>

        <div className="bg-[#11111F] p-5 rounded-2xl border border-[#292940] shadow-md space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#A1A1AA]">Rewards Issued</span>
          <div className="text-2xl font-black text-[#818CF8]">
            {stats.totalEarned > 0 ? `₹${stats.totalEarned}` : '₹0'}
          </div>
          <span className="text-[11px] text-[#818CF8] font-medium">Earned incentives</span>
        </div>
      </div>

      {/* Referral History & Step-by-Step Progress Tracker */}
      <div className="bg-[#11111F] rounded-3xl border border-[#292940] p-6 sm:p-8 shadow-xl space-y-6">
        <div className="flex items-center justify-between border-b border-[#292940] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#FFFFFF]">My Referral History & Progress Tracker</h2>
            <p className="text-xs text-[#A1A1AA]">
              Track your invitations step-by-step from email/invite link to verified member reward.
            </p>
          </div>
          <span className="text-xs font-bold text-[#FFFFFF] bg-[#6366F1]/20 border border-[#6366F1]/40 px-3 py-1 rounded-full">
            {referrals.length} Total Invites
          </span>
        </div>

        {referrals.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#0B0B12] border border-[#292940] text-[#A1A1AA] flex items-center justify-center mx-auto">
              <Users size={28} className="text-[#6366F1]" />
            </div>
            <h3 className="text-base font-bold text-[#FFFFFF]">No Referrals Recorded Yet</h3>
            <p className="text-xs text-[#A1A1AA] max-w-sm mx-auto">
              Use the email form above or share your code <strong className="text-[#818CF8]">{referralCode}</strong> with friends to earn your first reward!
            </p>
            <div className="flex justify-center gap-3 pt-2">
              <button
                onClick={handleWhatsAppShare}
                className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm cursor-pointer"
              >
                Share on WhatsApp
              </button>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map((item) => {
              const displayName = item.refereeName || item.referredName || item.inviteeEmail || 'Invited Friend';
              const displayDate = item.registrationDate || item.createdAt;

              return (
                <div key={item._id} className="p-5 bg-[#0B0B12] border border-[#292940] rounded-2xl space-y-4">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-[#6366F1]/15 border border-[#6366F1]/30 text-[#6366F1] flex items-center justify-center font-bold text-sm">
                        {displayName.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h4 className="text-sm font-bold text-[#FFFFFF]">{displayName}</h4>
                          {item.inviteChannel && (
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#11111F] border border-[#292940] text-[#A1A1AA]">
                              via {item.inviteChannel}
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-[#A1A1AA]">
                          {displayDate ? `Date: ${new Date(displayDate).toLocaleDateString()}` : 'Recently Invited'}
                        </p>
                      </div>
                    </div>

                    <div className="text-left sm:text-right">
                      <span className="text-xs font-bold text-[#818CF8]">
                        Reward: +₹{item.rewardAmount || 300} ({item.rewardType || 'Credit'})
                      </span>
                      <div className="text-[11px] text-[#A1A1AA] mt-0.5">
                        Status:{' '}
                        <span
                          className={`font-semibold ${
                            item.status === 'Reward Issued'
                              ? 'text-[#818CF8]'
                              : item.status === 'Payment Verified'
                              ? 'text-[#22C55E]'
                              : item.status === 'Invited'
                              ? 'text-amber-500'
                              : 'text-sky-400'
                          }`}
                        >
                          {item.status}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Step-by-Step Progress Timeline */}
                  <div className="pt-2">
                    <div className="flex items-center justify-between text-[11px] font-semibold text-[#A1A1AA] mb-2 overflow-x-auto gap-2">
                      {['Invited', 'Registered', 'Membership Pending', 'Payment Verified', 'Reward Issued'].map(
                        (stage, idx) => {
                          const isComplete =
                            stage === 'Invited' ||
                            (stage === 'Registered' && item.status !== 'Invited') ||
                            (stage === 'Membership Pending' &&
                              ['Membership Pending', 'Payment Verified', 'Reward Pending', 'Reward Issued'].includes(
                                item.status
                              )) ||
                            (stage === 'Payment Verified' &&
                              ['Payment Verified', 'Reward Pending', 'Reward Issued'].includes(item.status)) ||
                            (stage === 'Reward Issued' && item.status === 'Reward Issued');

                          return (
                            <div key={stage} className="flex items-center gap-1.5 shrink-0">
                              <div
                                className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                                  isComplete
                                    ? 'bg-[#6366F1] text-white'
                                    : 'bg-[#17172A] text-[#737373] border border-[#292940]'
                                }`}
                              >
                                {isComplete ? <Check size={11} /> : idx + 1}
                              </div>
                              <span className={isComplete ? 'text-[#FFFFFF] font-bold' : 'text-[#737373]'}>
                                {stage}
                              </span>
                            </div>
                          );
                        }
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Rewards Ledger History (if transactions exist) */}
      {transactions.length > 0 && (
        <div className="bg-[#11111F] rounded-3xl border border-[#292940] p-6 shadow-xl space-y-4">
          <h3 className="text-base font-bold text-[#FFFFFF]">Reward Transactions Ledger</h3>
          <div className="divide-y divide-[#292940]">
            {transactions.map((tx) => (
              <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[#FFFFFF]">{tx.sourceEvent}</p>
                  <p className="text-[11px] text-[#A1A1AA]">{new Date(tx.issuedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${tx.status === 'Redeemed' ? 'text-amber-500' : 'text-[#22C55E]'}`}>
                    {tx.status === 'Redeemed' ? '-' : '+'} ₹{tx.amount}
                  </span>
                  <p className="text-[10px] text-[#A1A1AA]">{tx.status}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberReferrals;
