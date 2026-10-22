import React, { useState, useEffect } from 'react';
import {
  Gift, Share2, Copy, Check, MessageCircle, Users, Award,
  Sparkles, ArrowUpRight, Clock, CheckCircle2, AlertCircle,
  TrendingUp, CreditCard, ShieldCheck, ChevronRight, RefreshCw,
  Coins, HelpCircle, FileText
} from 'lucide-react';
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
  refereeName: string;
  registrationDate: string;
  membershipPlanName?: string;
  status: 'Invited' | 'Registered' | 'Membership Pending' | 'Payment Verified' | 'Reward Pending' | 'Reward Issued' | 'Expired' | 'Cancelled' | 'Rejected';
  rewardType: string;
  rewardAmount: number;
  rewardStatus: string;
  rewardIssuedAt?: string;
  statusTimeline: { step: string; done: boolean; current?: boolean }[];
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

  const fetchReferralData = async () => {
    try {
      setLoading(true);
      const [codeRes, statsRes, histRes, ledgerRes] = await Promise.all([
        api.get('/referrals/my-code'),
        api.get('/referrals/my-stats'),
        api.get('/referrals/my-history'),
        api.get('/referrals/my-rewards-ledger')
      ]);

      if (codeRes.data?.success) {
        setReferralCode(codeRes.data.referralCode);
        setShareLink(codeRes.data.shareLink);
        setActiveCampaign(codeRes.data.campaign);
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
        setReferrals(histRes.data.referrals || []);
      }
      if (ledgerRes.data?.success) {
        setTransactions(ledgerRes.data.transactions || []);
      }
    } catch (err) {
      console.error('Failed to load referral data', err);
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

  const handleWhatsAppShare = () => {
    const friendBenefit = activeCampaign
      ? (activeCampaign.refereeDiscountType === 'Percentage'
          ? `${activeCampaign.refereeRewardValue}% off`
          : `₹${activeCampaign.refereeRewardValue} off`)
      : 'exclusive benefits';

    const text = encodeURIComponent(
      `Hey! I workout at ${user?.gymName || 'our gym'}. Use my referral code ${referralCode} to get ${friendBenefit} on your membership! Join here: ${shareLink}`
    );
    window.open(`https://api.whatsapp.com/send?text=${text}`, '_blank');
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
      const res = await api.post('/referrals/my-rewards/redeem', {
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

  return (
    <div className="min-h-screen bg-[#E8EFF0] p-4 sm:p-6 lg:p-8 space-y-8">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#167D78] to-[#116660] text-white rounded-3xl p-6 sm:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute right-0 top-0 bottom-0 w-1/3 bg-[radial-gradient(ellipse_at_center,_rgba(255,255,255,0.15)_0%,_transparent_70%)] pointer-events-none" />
        
        <div className="max-w-2xl space-y-3 relative z-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold uppercase tracking-wider text-teal-100">
            <Gift size={14} /> Refer & Earn Rewards
          </div>
          <h1 className="text-2xl sm:text-4xl font-extrabold tracking-tight">
            Invite Friends, Get Rewarded Together!
          </h1>
          <p className="text-teal-100 text-sm leading-relaxed">
            Give your friends an exclusive gym membership discount, and earn membership credits or rewards for every friend who joins!
          </p>
        </div>
      </div>

      {/* Referral Code & Shareable Link Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: My Referral Code & Actions */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-[#D9E2E3] p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#D9E2E3] pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#167D78]/10 text-[#167D78] flex items-center justify-center">
                <Share2 size={20} />
              </div>
              <div>
                <h2 className="text-lg font-bold text-[#344B4A]">Your Unique Referral Invite</h2>
                <p className="text-xs text-[#697778]">Share with friends via link or code.</p>
              </div>
            </div>

            <button
              onClick={fetchReferralData}
              className="p-2 border border-[#D9E2E3] hover:border-[#167D78] rounded-xl text-[#697778]"
              title="Refresh"
            >
              <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
            </button>
          </div>

          {/* Referral Code Display Box */}
          <div className="p-5 bg-[#E8EFF0]/70 border border-[#D9E2E3] rounded-2xl space-y-3">
            <span className="text-xs font-bold text-[#697778] uppercase tracking-wider">Your Referral Code</span>
            <div className="flex flex-col sm:flex-row items-center gap-3">
              <div className="flex-1 w-full bg-white border border-[#D9E2E3] rounded-2xl px-5 py-3 text-center sm:text-left font-mono font-extrabold text-2xl tracking-widest text-[#167D78] shadow-inner select-all">
                {referralCode || 'LOADING...'}
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <button
                  onClick={handleCopyCode}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-[#167D78] hover:bg-[#116660] text-white rounded-2xl text-xs font-bold transition-all shadow-md shadow-[#167D78]/20"
                >
                  {copiedCode ? <Check size={16} /> : <Copy size={16} />}
                  {copiedCode ? 'Copied!' : 'Copy Code'}
                </button>

                <button
                  onClick={handleCopyLink}
                  className="flex-1 sm:flex-none flex items-center justify-center gap-1.5 px-4 py-3 bg-white border border-[#D9E2E3] hover:border-[#167D78] text-[#344B4A] rounded-2xl text-xs font-bold transition-all"
                >
                  {copiedLink ? <Check size={16} /> : <Share2 size={16} />}
                  {copiedLink ? 'Link Copied!' : 'Copy Link'}
                </button>
              </div>
            </div>

            {/* Direct WhatsApp Share Button */}
            <div className="pt-2">
              <button
                onClick={handleWhatsAppShare}
                className="w-full py-3.5 px-4 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl text-sm font-bold flex items-center justify-center gap-2 transition-all shadow-md shadow-emerald-600/20"
              >
                <MessageCircle size={18} />
                Share Directly on WhatsApp
              </button>
            </div>
          </div>

          {/* Current Campaign Perks Breakdown */}
          {activeCampaign && (
            <div className="p-5 bg-gradient-to-r from-teal-50/60 to-emerald-50/60 border border-[#D9E2E3] rounded-2xl space-y-3">
              <h3 className="text-xs font-bold text-[#167D78] uppercase tracking-wider flex items-center gap-2">
                <Sparkles size={16} /> Current Referral Offer
              </h3>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                <div className="p-3 bg-white rounded-xl border border-[#D9E2E3]">
                  <p className="text-[#697778]">You Earn (When Friend Joins):</p>
                  <p className="text-lg font-extrabold text-[#344B4A] mt-0.5">
                    {activeCampaign.referrerRewardType === 'Membership Credit' ? '₹' : ''}
                    {activeCampaign.referrerRewardValue}
                    {activeCampaign.referrerRewardType === 'Wallet Points' ? ' Points' : ''}
                    {activeCampaign.referrerRewardType === 'Free Membership Days' ? ' Free Days' : ''}
                  </p>
                  <span className="text-[11px] text-teal-700 font-medium">Credited to your gym account</span>
                </div>

                <div className="p-3 bg-white rounded-xl border border-[#D9E2E3]">
                  <p className="text-[#697778]">Your Friend Gets:</p>
                  <p className="text-lg font-extrabold text-emerald-800 mt-0.5">
                    {activeCampaign.refereeDiscountType === 'Percentage'
                      ? `${activeCampaign.refereeRewardValue}% Discount`
                      : `₹${activeCampaign.refereeRewardValue} Discount`}
                  </p>
                  <span className="text-[11px] text-emerald-700 font-medium">Instant checkout benefit</span>
                </div>
              </div>

              {activeCampaign.termsAndConditions && (
                <div className="text-[11px] text-[#697778] flex items-start gap-1.5 pt-1">
                  <FileText size={13} className="shrink-0 mt-0.5" />
                  <span><strong>Terms:</strong> {activeCampaign.termsAndConditions}</span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right Column: My Rewards Wallet Card */}
        <div className="bg-white rounded-3xl border border-[#D9E2E3] p-6 shadow-sm space-y-6 flex flex-col justify-between">
          <div className="space-y-4">
            <div className="flex items-center justify-between border-b border-[#D9E2E3] pb-3">
              <div className="flex items-center gap-2">
                <Award size={20} className="text-[#167D78]" />
                <h3 className="text-base font-bold text-[#344B4A]">My Rewards Balance</h3>
              </div>
              <span className="text-xs font-semibold px-2 py-0.5 bg-[#D8EAE7] text-[#167D78] rounded-full">
                {stats.rewardType}
              </span>
            </div>

            <div className="p-5 bg-gradient-to-br from-[#167D78]/10 via-[#E8EFF0] to-white rounded-2xl border border-[#D9E2E3] text-center space-y-1">
              <span className="text-xs text-[#697778] font-semibold uppercase tracking-wider">Available Balance</span>
              <div className="text-4xl font-black text-[#167D78]">
                {stats.rewardType === 'Wallet Points' ? `${stats.availableBalance} Pts` : `₹${stats.availableBalance}`}
              </div>
              <p className="text-[11px] text-[#697778]">Ready to redeem on membership renewals</p>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex justify-between text-[#697778]">
                <span>Total Earned:</span>
                <span className="font-bold text-[#344B4A]">₹{stats.totalEarned}</span>
              </div>
              <div className="flex justify-between text-[#697778]">
                <span>Total Redeemed:</span>
                <span className="font-bold text-[#344B4A]">₹{stats.totalRedeemed}</span>
              </div>
              <div className="flex justify-between text-[#697778]">
                <span>Pending Approvals:</span>
                <span className="font-bold text-amber-600">{stats.pendingRewardsCount}</span>
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-[#D9E2E3]">
            <button
              onClick={handleRedeemBalance}
              disabled={stats.availableBalance <= 0 || redeemLoading}
              className={`w-full py-3 rounded-2xl text-xs font-bold transition-all shadow-md ${
                stats.availableBalance > 0
                  ? 'bg-[#167D78] hover:bg-[#116660] text-white shadow-[#167D78]/20 cursor-pointer'
                  : 'bg-[#D8EAE7] text-[#697778] cursor-not-allowed'
              }`}
            >
              {redeemLoading ? 'Redeeming...' : 'Redeem Available Balance'}
            </button>
          </div>
        </div>
      </div>

      {/* Referral Statistics Row */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#D9E2E3] shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697778]">Total Invited</span>
          <div className="text-2xl font-black text-[#344B4A]">{stats.totalInvited}</div>
          <span className="text-[11px] text-[#697778]">Friends signed up</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E2E3] shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697778]">Pending Payments</span>
          <div className="text-2xl font-black text-amber-600">{stats.pendingPaymentCount}</div>
          <span className="text-[11px] text-[#697778]">Awaiting plan purchase</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E2E3] shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697778]">Successful Referrals</span>
          <div className="text-2xl font-black text-emerald-600">{stats.successfulCount}</div>
          <span className="text-[11px] text-emerald-600 font-medium">Paid members confirmed</span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#D9E2E3] shadow-sm space-y-1">
          <span className="text-xs font-semibold uppercase tracking-wider text-[#697778]">Rewards Issued</span>
          <div className="text-2xl font-black text-purple-600">{stats.totalEarned > 0 ? `₹${stats.totalEarned}` : '0'}</div>
          <span className="text-[11px] text-purple-600 font-medium">Earned incentives</span>
        </div>
      </div>

      {/* Referral Milestone Timeline & History */}
      <div className="bg-white rounded-3xl border border-[#D9E2E3] p-6 sm:p-8 shadow-sm space-y-6">
        <div className="flex items-center justify-between border-b border-[#D9E2E3] pb-4">
          <div>
            <h2 className="text-lg font-bold text-[#344B4A]">My Referral History</h2>
            <p className="text-xs text-[#697778]">Track your invitations step-by-step from registration to reward issuance.</p>
          </div>
          <span className="text-xs font-bold text-[#167D78]">{referrals.length} Total Invites</span>
        </div>

        {referrals.length === 0 ? (
          <div className="py-12 text-center space-y-3">
            <div className="w-16 h-16 rounded-full bg-[#E8EFF0] text-[#697778] flex items-center justify-center mx-auto">
              <Users size={28} />
            </div>
            <h3 className="text-base font-bold text-[#344B4A]">No Referrals Yet</h3>
            <p className="text-xs text-[#697778] max-w-sm mx-auto">
              Share your referral code <strong className="text-[#167D78]">{referralCode}</strong> with friends and workout buddies to start earning rewards!
            </p>
            <button
              onClick={handleWhatsAppShare}
              className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold transition-all shadow-sm"
            >
              Share with Friends
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            {referrals.map(item => (
              <div key={item._id} className="p-5 bg-[#E8EFF0]/50 border border-[#D9E2E3] rounded-2xl space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-full bg-[#167D78]/10 text-[#167D78] flex items-center justify-center font-bold text-sm">
                      {item.refereeName.charAt(0)}
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-[#344B4A]">{item.refereeName}</h4>
                      <p className="text-[11px] text-[#697778]">Registered on {new Date(item.registrationDate).toLocaleDateString()}</p>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="text-xs font-bold text-[#167D78]">
                      Reward: +₹{item.rewardAmount} ({item.rewardType})
                    </span>
                    <div className="text-[11px] text-[#697778]">Status: <strong>{item.status}</strong></div>
                  </div>
                </div>

                {/* Milestone Progress Bar */}
                <div className="pt-2">
                  <div className="flex items-center justify-between text-[11px] font-semibold text-[#697778] mb-2 overflow-x-auto gap-2">
                    {['Invited', 'Registered', 'Membership Pending', 'Payment Verified', 'Reward Issued'].map((stage, idx) => {
                      const isComplete =
                        (stage === 'Invited') ||
                        (stage === 'Registered' && item.status !== 'Invited') ||
                        (stage === 'Membership Pending' && ['Membership Pending', 'Payment Verified', 'Reward Pending', 'Reward Issued'].includes(item.status)) ||
                        (stage === 'Payment Verified' && ['Payment Verified', 'Reward Pending', 'Reward Issued'].includes(item.status)) ||
                        (stage === 'Reward Issued' && item.status === 'Reward Issued');

                      return (
                        <div key={stage} className="flex items-center gap-1.5 shrink-0">
                          <div className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
                            isComplete ? 'bg-[#167D78] text-white' : 'bg-gray-200 text-gray-500'
                          }`}>
                            {isComplete ? <Check size={11} /> : idx + 1}
                          </div>
                          <span className={isComplete ? 'text-[#344B4A] font-bold' : 'text-gray-400'}>
                            {stage}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Rewards Ledger History */}
      {transactions.length > 0 && (
        <div className="bg-white rounded-3xl border border-[#D9E2E3] p-6 shadow-sm space-y-4">
          <h3 className="text-base font-bold text-[#344B4A]">Reward Transactions Ledger</h3>
          <div className="divide-y divide-[#D9E2E3]">
            {transactions.map(tx => (
              <div key={tx._id} className="py-3 flex items-center justify-between text-xs">
                <div>
                  <p className="font-semibold text-[#344B4A]">{tx.sourceEvent}</p>
                  <p className="text-[11px] text-[#697778]">{new Date(tx.issuedAt).toLocaleDateString()}</p>
                </div>
                <div className="text-right">
                  <span className={`font-bold ${tx.status === 'Redeemed' ? 'text-amber-600' : 'text-emerald-700'}`}>
                    {tx.status === 'Redeemed' ? '-' : '+'} ₹{tx.amount}
                  </span>
                  <p className="text-[10px] text-[#697778]">{tx.status}</p>
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
