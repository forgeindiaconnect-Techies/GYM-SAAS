import React, { useState, useEffect } from 'react';
import {
  Trophy,
  Award,
  Star,
  Users,
  Dumbbell,
  Calendar,
  Sparkles,
  Download,
  Plus,
  CheckCircle2,
  Clock,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  Eye,
  Trash2,
  Send,
  Flame,
  Activity,
  IndianRupee,
  ShieldCheck
} from 'lucide-react';
import api from '../../utils/api';
import { generateAwardCertificatePDF } from '../../utils/certificateGenerator';

export default function AwardsRecognitionSection() {
  const [subTab, setSubTab] = useState<'awards' | 'hall-of-fame'>('awards');
  const [awards, setAwards] = useState<any[]>([]);
  const [hallOfFame, setHallOfFame] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [periodFilter, setPeriodFilter] = useState('ALL');
  const [recipientFilter, setRecipientFilter] = useState('ALL');

  // Create Award Modal
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [creating, setCreating] = useState(false);
  const [awardFormData, setAwardFormData] = useState({
    title: '',
    recipientType: 'Customer',
    category: 'Fitness Champion',
    description: '',
    badgeIcon: 'Trophy',
    awardPeriod: 'Monthly',
    startDate: new Date().toISOString().split('T')[0],
    endDate: '',
    announcementDate: '',
    criteriaMetric: 'workout_completions',
    minCriteriaValue: 10,
    winnerSelectionMethod: 'OWNER_CONFIRMATION',
    prizeBonusAmount: 0,
    prizeDescription: 'Official Certificate & Hall of Fame Feature',
    allowDuplicateWinner: false
  });

  // Candidate Evaluation Modal
  const [selectedAwardForCandidates, setSelectedAwardForCandidates] = useState<any | null>(null);
  const [candidatesList, setCandidatesList] = useState<any[]>([]);
  const [loadingCandidates, setLoadingCandidates] = useState(false);
  const [selectedWinnerId, setSelectedWinnerId] = useState<string>('');
  const [selectedWinnerMetric, setSelectedWinnerMetric] = useState<string>('');
  const [confirmingWinner, setConfirmingWinner] = useState(false);

  // Publish Award Modal
  const [awardToPublish, setAwardToPublish] = useState<any | null>(null);
  const [publishing, setPublishing] = useState(false);

  // Feedback banner
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const fetchAwardsAndHallOfFame = async () => {
    try {
      setLoading(true);
      const [awardsRes, hofRes] = await Promise.allSettled([
        api.get('/awards/owner'),
        api.get('/awards/hall-of-fame')
      ]);

      if (awardsRes.status === 'fulfilled' && awardsRes.value.data?.success) {
        setAwards(awardsRes.value.data.awards || []);
      }
      if (hofRes.status === 'fulfilled' && hofRes.value.data?.success) {
        setHallOfFame(hofRes.value.data.hallOfFame || []);
      }
    } catch (err: any) {
      console.error('Failed to load awards:', err);
      setMessage({ type: 'error', text: 'Failed to load awards & recognition records' });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAwardsAndHallOfFame();
  }, []);

  const handleCreateAward = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      setCreating(true);
      const res = await api.post('/awards', awardFormData);
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Award created successfully!' });
        setIsCreateModalOpen(false);
        setAwardFormData({
          title: '',
          recipientType: 'Customer',
          category: 'Fitness Champion',
          description: '',
          badgeIcon: 'Trophy',
          awardPeriod: 'Monthly',
          startDate: new Date().toISOString().split('T')[0],
          endDate: '',
          announcementDate: '',
          criteriaMetric: 'workout_completions',
          minCriteriaValue: 10,
          winnerSelectionMethod: 'OWNER_CONFIRMATION',
          prizeBonusAmount: 0,
          prizeDescription: 'Official Certificate & Hall of Fame Feature',
          allowDuplicateWinner: false
        });
        fetchAwardsAndHallOfFame();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to create award' });
    } finally {
      setCreating(false);
    }
  };

  const openCandidateEvaluation = async (award: any) => {
    setSelectedAwardForCandidates(award);
    setSelectedWinnerId(award.winnerUserId?._id || award.winnerUserId || '');
    setSelectedWinnerMetric(award.winnerMetricAchieved || '');
    try {
      setLoadingCandidates(true);
      const res = await api.get(`/awards/${award._id}/candidates`);
      if (res.data?.success) {
        setCandidatesList(res.data.candidates || []);
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to evaluate candidates' });
    } finally {
      setLoadingCandidates(false);
    }
  };

  const handleConfirmWinner = async () => {
    if (!selectedAwardForCandidates || !selectedWinnerId) {
      alert('Please select a candidate to confirm as the winner.');
      return;
    }
    try {
      setConfirmingWinner(true);
      const res = await api.put(`/awards/${selectedAwardForCandidates._id}/confirm-winner`, {
        winnerUserId: selectedWinnerId,
        winnerMetricAchieved: selectedWinnerMetric
      });
      if (res.data?.success) {
        setMessage({ type: 'success', text: 'Winner successfully confirmed and moved to Under Review!' });
        setSelectedAwardForCandidates(null);
        fetchAwardsAndHallOfFame();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to confirm winner' });
    } finally {
      setConfirmingWinner(false);
    }
  };

  const handlePublishAward = async () => {
    if (!awardToPublish) return;
    try {
      setPublishing(true);
      const res = await api.put(`/awards/${awardToPublish._id}/publish`);
      if (res.data?.success) {
        setMessage({
          type: 'success',
          text: `🎉 Award officially published! Unique Certificate ID: ${res.data.certificateId}. Winner notified.`
        });
        setAwardToPublish(null);
        fetchAwardsAndHallOfFame();
      }
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to publish award' });
    } finally {
      setPublishing(false);
    }
  };

  const handleDeleteAward = async (awardId: string) => {
    if (!window.confirm('Are you sure you want to delete this award?')) return;
    try {
      await api.delete(`/awards/${awardId}`);
      setMessage({ type: 'success', text: 'Award removed' });
      fetchAwardsAndHallOfFame();
    } catch (err: any) {
      setMessage({ type: 'error', text: err.response?.data?.message || 'Failed to delete award' });
    }
  };

  const handleDownloadCertificate = (award: any) => {
    generateAwardCertificatePDF({
      recipientName: award.winnerName || award.winnerUserId?.firstName ? `${award.winnerUserId?.firstName || ''} ${award.winnerUserId?.lastName || ''}`.trim() : 'Award Recipient',
      recipientRole: award.winnerRole,
      awardTitle: award.title,
      awardCategory: award.category,
      awardDate: award.publishedAt ? new Date(award.publishedAt).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' }) : new Date().toLocaleDateString(),
      certificateId: award.certificateId || 'CERT-VERIFIED',
      metricAchieved: award.winnerMetricAchieved
    });
  };

  const filteredAwards = awards.filter(a => {
    const matchesSearch =
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (a.winnerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPeriod = periodFilter === 'ALL' || a.awardPeriod === periodFilter;
    const matchesRecipient = recipientFilter === 'ALL' || a.recipientType === recipientFilter;
    return matchesSearch && matchesPeriod && matchesRecipient;
  });

  const filteredHallOfFame = hallOfFame.filter(h => {
    const matchesSearch =
      h.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.category?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (h.winnerName || '').toLowerCase().includes(searchQuery.toLowerCase());
    const matchesPeriod = periodFilter === 'ALL' || h.awardPeriod === periodFilter;
    const matchesRecipient = recipientFilter === 'ALL' || h.recipientType === recipientFilter;
    return matchesSearch && matchesPeriod && matchesRecipient;
  });

  return (
    <div className="space-y-6">
      {/* Sub Header & Switcher */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-[#11111F] p-4 rounded-2xl border border-[#292940] shadow-md">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setSubTab('awards')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              subTab === 'awards'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:bg-[#0B0B12] hover:text-[#FFFFFF]'
            }`}
          >
            <Trophy className="w-4 h-4" />
            Active Awards & Approvals ({awards.length})
          </button>
          <button
            onClick={() => setSubTab('hall-of-fame')}
            className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-bold transition cursor-pointer flex items-center gap-2 ${
              subTab === 'hall-of-fame'
                ? 'bg-[#6366F1] text-white shadow-sm'
                : 'text-[#A1A1AA] hover:bg-[#0B0B12] hover:text-[#FFFFFF]'
            }`}
          >
            <Star className="w-4 h-4 text-[#818CF8]" />
            Hall of Fame ({hallOfFame.length})
          </button>
        </div>

        {subTab === 'awards' && (
          <button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-[#6366F1] text-white hover:bg-[#4F46E5] text-xs sm:text-sm font-bold shadow-md shadow-[#6366F1]/25 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            Create New Award
          </button>
        )}
      </div>

      {message && (
        <div className={`p-4 rounded-xl flex items-center justify-between border ${
          message.type === 'success' ? 'bg-emerald-950/40 border-emerald-800 text-emerald-300' : 'bg-red-950/40 border-red-800 text-red-300'
        }`}>
          <span className="text-xs sm:text-sm font-semibold">{message.text}</span>
          <button onClick={() => setMessage(null)} className="cursor-pointer">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Filter Bar */}
      <div className="bg-[#11111F] p-4 rounded-2xl border border-[#292940] shadow-md flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 absolute left-3 top-3 text-[#A1A1AA]" />
          <input
            type="text"
            placeholder="Search awards, category, or winner..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-4 py-2 rounded-xl text-sm bg-[#050505] border border-[#292940] text-[#FFFFFF] placeholder-[#A1A1AA] focus:outline-none focus:border-[#6366F1]"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5 w-full md:w-auto">
          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#A1A1AA]">AUDIENCE:</span>
            <select
              value={recipientFilter}
              onChange={e => setRecipientFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#292940] bg-[#050505] text-[#FFFFFF] focus:outline-none focus:border-[#6366F1]"
            >
              <option value="ALL">All Recipients</option>
              <option value="Customer">Customers</option>
              <option value="Trainer">Trainers</option>
            </select>
          </div>

          <div className="flex items-center gap-1.5">
            <span className="text-xs font-bold text-[#A1A1AA]">PERIOD:</span>
            <select
              value={periodFilter}
              onChange={e => setPeriodFilter(e.target.value)}
              className="px-3 py-1.5 rounded-xl text-xs font-semibold border border-[#292940] bg-[#050505] text-[#FFFFFF] focus:outline-none focus:border-[#6366F1]"
            >
              <option value="ALL">All Periods</option>
              <option value="Monthly">Monthly</option>
              <option value="Quarterly">Quarterly</option>
              <option value="Annual">Annual</option>
              <option value="Custom">Custom</option>
            </select>
          </div>
        </div>
      </div>

      {/* VIEW 1: ACTIVE AWARDS & APPROVALS */}
      {subTab === 'awards' && (
        <div className="space-y-4">
          {loading ? (
            <div className="text-center py-16 bg-[#11111F] rounded-2xl border border-[#292940]">
              <Trophy className="w-8 h-8 animate-bounce mx-auto text-[#818CF8] mb-2" />
              <p className="text-sm font-semibold text-[#A1A1AA]">Loading Awards & Recognition...</p>
            </div>
          ) : filteredAwards.length === 0 ? (
            <div className="text-center py-16 bg-[#11111F] rounded-2xl border border-[#292940]">
              <Trophy className="w-12 h-12 mx-auto text-[#A1A1AA]/40 mb-3" />
              <h3 className="text-base font-bold text-[#FFFFFF]">No Awards Configured</h3>
              <p className="text-xs text-[#A1A1AA] mt-1 max-w-md mx-auto">
                Create awards like "Fitness Champion", "Consistency Award", or "Trainer of the Month" and evaluate winners automatically using verified gym records.
              </p>
              <button
                onClick={() => setIsCreateModalOpen(true)}
                className="mt-4 px-4 py-2 rounded-xl text-white bg-[#6366F1] hover:bg-[#4F46E5] text-xs font-bold transition cursor-pointer shadow-md shadow-[#6366F1]/25"
              >
                Create Award
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {filteredAwards.map(award => {
                const isPublished = award.status === 'Published';
                const hasWinner = Boolean(award.winnerUserId || award.winnerName);

                return (
                  <div
                    key={award._id}
                    className="bg-[#11111F] rounded-2xl border border-[#292940] p-5 shadow-md flex flex-col justify-between hover:border-[#6366F1]/40 transition"
                  >
                    <div className="space-y-3.5">
                      {/* Top Badges */}
                      <div className="flex justify-between items-center">
                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold flex items-center gap-1 border ${
                          award.recipientType === 'Customer' ? 'bg-[#0B0B12] text-[#818CF8] border-[#292940]' : 'bg-[#0B0B12] text-purple-300 border-[#292940]'
                        }`}>
                          {award.recipientType === 'Customer' ? <Users className="w-3 h-3" /> : <Dumbbell className="w-3 h-3" />}
                          {award.recipientType} Award
                        </span>

                        <span className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${
                          award.status === 'Published'
                            ? 'bg-emerald-950/60 text-emerald-300 border-emerald-800'
                            : award.status === 'Under Review'
                            ? 'bg-amber-950/60 text-amber-300 border-amber-800'
                            : 'bg-[#0B0B12] text-[#A1A1AA] border-[#292940]'
                        }`}>
                          {award.status}
                        </span>
                      </div>

                      {/* Header */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="p-2 rounded-xl bg-[#0B0B12] text-[#818CF8] border border-[#292940]">
                            <Trophy className="w-5 h-5" />
                          </span>
                          <div>
                            <h3 className="font-extrabold text-base text-[#FFFFFF] leading-tight">{award.title}</h3>
                            <span className="text-xs text-[#A1A1AA] block">{award.category} • {award.awardPeriod}</span>
                          </div>
                        </div>
                        <p className="text-xs text-[#A1A1AA] mt-2 line-clamp-2">{award.description}</p>
                      </div>

                      {/* Criteria & Prize */}
                      <div className="p-3 rounded-xl bg-[#0B0B12] border border-[#292940] text-xs space-y-1">
                        <div className="flex justify-between">
                          <span className="text-[#A1A1AA]">Evaluation Metric:</span>
                          <span className="font-bold text-[#6366F1] capitalize">{award.criteriaMetric?.replace('_', ' ')}</span>
                        </div>
                        {award.prizeBonusAmount > 0 && (
                          <div className="flex justify-between">
                            <span className="text-[#A1A1AA]">Cash Prize / Bonus:</span>
                            <span className="font-bold text-[#818CF8]">₹{award.prizeBonusAmount}</span>
                          </div>
                        )}
                        {award.certificateId && (
                          <div className="flex justify-between">
                            <span className="text-[#A1A1AA]">Certificate ID:</span>
                            <span className="font-mono font-bold text-[#FFFFFF]">{award.certificateId}</span>
                          </div>
                        )}
                      </div>

                      {/* Winner Showcase Box */}
                      {hasWinner ? (
                        <div className="p-3 rounded-xl border border-emerald-800/80 bg-emerald-950/30 space-y-1">
                          <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 block">
                            🏆 Confirmed Winner
                          </span>
                          <div className="font-bold text-sm text-[#FFFFFF]">
                            {award.winnerName || `${award.winnerUserId?.firstName || ''} ${award.winnerUserId?.lastName || ''}`}
                          </div>
                          <div className="text-[11px] text-[#A1A1AA]">
                            {award.winnerMetricAchieved || 'Top Criteria Achieved'}
                          </div>
                        </div>
                      ) : (
                        <div className="p-3 rounded-xl border border-dashed border-[#292940] bg-[#0B0B12] text-center">
                          <span className="text-xs text-[#A1A1AA] font-medium">No winner confirmed yet</span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="pt-4 border-t border-[#292940] mt-4 flex flex-wrap gap-2 justify-between items-center">
                      {!isPublished ? (
                        <>
                          <button
                            onClick={() => openCandidateEvaluation(award)}
                            className="px-3 py-1.5 rounded-lg text-xs font-bold text-[#FFFFFF] bg-[#0B0B12] hover:bg-[#17172A] border border-[#292940] hover:border-[#6366F1] transition cursor-pointer flex items-center gap-1.5"
                          >
                            <Users className="w-3.5 h-3.5" />
                            {hasWinner ? 'Change Winner' : 'Evaluate Candidates'}
                          </button>

                          {hasWinner && (
                            <button
                              onClick={() => setAwardToPublish(award)}
                              className="px-3 py-1.5 rounded-lg text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] transition cursor-pointer flex items-center gap-1.5 shadow-sm shadow-[#6366F1]/20"
                            >
                              <Send className="w-3.5 h-3.5" />
                              Publish Award
                            </button>
                          )}

                          <button
                            onClick={() => handleDeleteAward(award._id)}
                            className="p-1.5 text-[#A1A1AA] hover:text-rose-400 transition cursor-pointer ml-auto"
                            title="Delete Award"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={() => handleDownloadCertificate(award)}
                            className="w-full px-3 py-2 rounded-xl text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] transition cursor-pointer flex items-center justify-center gap-1.5 shadow-sm shadow-[#6366F1]/25"
                          >
                            <Download className="w-3.5 h-3.5" />
                            Download Official Certificate PDF
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}

      {/* VIEW 2: HALL OF FAME */}
      {subTab === 'hall-of-fame' && (
        <div className="space-y-4">
          {filteredHallOfFame.length === 0 ? (
            <div className="text-center py-16 bg-[#11111F] rounded-2xl border border-[#292940]">
              <Star className="w-12 h-12 mx-auto text-[#818CF8]/40 mb-3" />
              <h3 className="text-base font-bold text-[#FFFFFF]">Hall of Fame is Empty</h3>
              <p className="text-xs text-[#A1A1AA] mt-1 max-w-md mx-auto">
                Once you select winners and publish official awards, they are permanently immortalized in this Hall of Fame showcase.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredHallOfFame.map(award => (
                <div
                  key={award._id}
                  className="bg-gradient-to-br from-[#11111F] via-[#151515] to-[#0B0B12] rounded-2xl border border-[#292940] p-6 shadow-md flex flex-col justify-between hover:border-[#6366F1]/50 transition relative overflow-hidden"
                >
                  <div className="absolute top-0 right-0 w-24 h-24 bg-[#818CF8]/10 rounded-full blur-xl pointer-events-none" />

                  <div className="space-y-4 relative z-10">
                    <div className="flex justify-between items-center">
                      <span className="text-[11px] px-2.5 py-0.5 rounded-full font-black uppercase tracking-wider bg-[#0B0B12] text-[#818CF8] flex items-center gap-1 border border-[#292940]">
                        <Trophy className="w-3 h-3 text-[#818CF8]" />
                        {award.awardPeriod} Award
                      </span>
                      <span className="text-xs font-mono font-bold text-[#A1A1AA]">
                        {award.certificateId}
                      </span>
                    </div>

                    <div className="text-center py-2">
                      <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-[#6366F1] to-[#4F46E5] text-white flex items-center justify-center mx-auto text-2xl font-black shadow-md border-2 border-[#11111F]">
                        {award.winnerName ? award.winnerName.charAt(0).toUpperCase() : 'W'}
                      </div>
                      <h3 className="font-extrabold text-lg text-[#FFFFFF] mt-2.5">
                        {award.winnerName || 'Winner'}
                      </h3>
                      <span className="text-xs font-bold text-[#818CF8] block">
                        {award.winnerRole === 'TRAINER' ? 'Personal Trainer' : 'Gym Member'}
                      </span>
                      <p className="text-xs text-[#A1A1AA] mt-0.5">{award.winnerMetricAchieved}</p>
                    </div>

                    <div className="p-3.5 rounded-xl bg-[#0B0B12] border border-[#292940] text-center space-y-1">
                      <span className="text-xs font-black text-[#818CF8] block">{award.title}</span>
                      <span className="text-[11px] text-[#A1A1AA] block">{award.category}</span>
                      <span className="text-[10px] text-[#A1A1AA]/70 block">
                        Conferred: {new Date(award.publishedAt || award.createdAt).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </span>
                    </div>
                  </div>

                  <button
                    onClick={() => handleDownloadCertificate(award)}
                    className="mt-5 w-full py-2.5 px-4 rounded-xl text-xs font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] shadow-md shadow-[#6366F1]/25 flex items-center justify-center gap-2 transition cursor-pointer"
                  >
                    <Download className="w-4 h-4" />
                    Download Official Certificate
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* MODAL 1: CREATE AWARD */}
      {isCreateModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-[#11111F] rounded-2xl max-w-xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border border-[#292940] text-[#FFFFFF]">
            <div className="flex justify-between items-center border-b border-[#292940] pb-3">
              <div className="flex items-center gap-2">
                <Trophy className="w-6 h-6 text-[#818CF8]" />
                <h2 className="text-lg font-black text-[#FFFFFF]">Create Awards & Recognition</h2>
              </div>
              <button onClick={() => setIsCreateModalOpen(false)} className="cursor-pointer text-[#A1A1AA] hover:text-[#FFFFFF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateAward} className="space-y-4 text-xs sm:text-sm">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#A1A1AA] mb-1">Recipient Audience *</label>
                  <select
                    value={awardFormData.recipientType}
                    onChange={e => {
                      const rec = e.target.value;
                      setAwardFormData({
                        ...awardFormData,
                        recipientType: rec,
                        category: rec === 'Customer' ? 'Fitness Champion' : 'Trainer of the Month',
                        criteriaMetric: rec === 'Customer' ? 'workout_completions' : 'completed_sessions'
                      });
                    }}
                    className="w-full px-3 py-2 rounded-xl border border-[#292940] bg-[#050505] text-[#FFFFFF] font-semibold focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="Customer">Customers Only</option>
                    <option value="Trainer">Trainers Only</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#A1A1AA] mb-1">Award Category *</label>
                  <select
                    value={awardFormData.category}
                    onChange={e => setAwardFormData({ ...awardFormData, category: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#292940] bg-[#050505] text-[#FFFFFF] font-semibold focus:outline-none focus:border-[#6366F1]"
                  >
                    {awardFormData.recipientType === 'Customer' ? (
                      <>
                        <option value="Fitness Champion">Fitness Champion</option>
                        <option value="Consistency Award">Consistency Award</option>
                        <option value="Workout Achievement Award">Workout Achievement Award</option>
                        <option value="Fitness Goal Achievement Award">Fitness Goal Achievement Award</option>
                        <option value="Transformation Achievement Award">Transformation Achievement Award</option>
                        <option value="Custom Award">Custom Customer Award</option>
                      </>
                    ) : (
                      <>
                        <option value="Trainer of the Month">Trainer of the Month</option>
                        <option value="Excellence in Coaching">Excellence in Coaching</option>
                        <option value="Outstanding Customer Support">Outstanding Customer Support</option>
                        <option value="Customer Choice Award">Customer Choice Award</option>
                        <option value="Outstanding Performance Award">Outstanding Performance Award</option>
                        <option value="Custom Award">Custom Trainer Award</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-bold text-[#A1A1AA] mb-1">Award Title *</label>
                <input
                  type="text"
                  required
                  placeholder={awardFormData.recipientType === 'Customer' ? 'e.g. October Fitness Champion of the Month' : 'e.g. Coach of the Quarter Award'}
                  value={awardFormData.title}
                  onChange={e => setAwardFormData({ ...awardFormData, title: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#292940] bg-[#050505] text-[#FFFFFF] placeholder-[#A1A1AA]/60 text-sm focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div>
                <label className="block font-bold text-[#A1A1AA] mb-1">Description *</label>
                <textarea
                  required
                  rows={2}
                  placeholder="Detail award significance and honors..."
                  value={awardFormData.description}
                  onChange={e => setAwardFormData({ ...awardFormData, description: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#292940] bg-[#050505] text-[#FFFFFF] placeholder-[#A1A1AA]/60 text-sm focus:outline-none focus:border-[#6366F1]"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#A1A1AA] mb-1">Award Period *</label>
                  <select
                    value={awardFormData.awardPeriod}
                    onChange={e => setAwardFormData({ ...awardFormData, awardPeriod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#292940] bg-[#050505] text-[#FFFFFF] font-semibold focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Annual">Annual</option>
                    <option value="Custom">Custom</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-[#A1A1AA] mb-1">Evaluation Metric *</label>
                  <select
                    value={awardFormData.criteriaMetric}
                    onChange={e => setAwardFormData({ ...awardFormData, criteriaMetric: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#292940] bg-[#050505] text-[#FFFFFF] font-semibold focus:outline-none focus:border-[#6366F1]"
                  >
                    {awardFormData.recipientType === 'Customer' ? (
                      <>
                        <option value="workout_completions">Completed Workouts Count</option>
                        <option value="attendance_streak">Attendance Streak Days</option>
                        <option value="challenge_completions">Completed Challenges</option>
                        <option value="custom">Overall Consistency & Dedication</option>
                      </>
                    ) : (
                      <>
                        <option value="completed_sessions">Completed Training Sessions</option>
                        <option value="average_rating">Average Customer Rating (⭐)</option>
                        <option value="custom">Coaching Excellence & Client Progress</option>
                      </>
                    )}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-[#A1A1AA] mb-1">Optional Bonus / Prize (₹)</label>
                  <input
                    type="number"
                    min={0}
                    value={awardFormData.prizeBonusAmount}
                    onChange={e => setAwardFormData({ ...awardFormData, prizeBonusAmount: Number(e.target.value) })}
                    className="w-full px-3 py-2 rounded-xl border border-[#292940] bg-[#050505] text-[#FFFFFF] text-sm focus:outline-none focus:border-[#6366F1]"
                  />
                </div>

                <div>
                  <label className="block font-bold text-[#A1A1AA] mb-1">Winner Selection Method</label>
                  <select
                    value={awardFormData.winnerSelectionMethod}
                    onChange={e => setAwardFormData({ ...awardFormData, winnerSelectionMethod: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[#292940] bg-[#050505] text-[#FFFFFF] font-semibold focus:outline-none focus:border-[#6366F1]"
                  >
                    <option value="OWNER_CONFIRMATION">Gym Owner Review & Confirmation</option>
                    <option value="AUTOMATIC_TOP_PERFORMER">Automatic Top Performer Nomination</option>
                  </select>
                </div>
              </div>

              <div className="pt-3 border-t border-[#292940] flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsCreateModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-[#292940] font-bold text-[#A1A1AA] hover:bg-[#0B0B12] hover:text-[#FFFFFF] transition cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={creating}
                  className="px-5 py-2 rounded-xl font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] transition cursor-pointer shadow-md shadow-[#6366F1]/25 disabled:opacity-50"
                >
                  {creating ? 'Creating...' : 'Create Award'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* MODAL 2: CANDIDATE EVALUATION & WINNER CONFIRMATION */}
      {selectedAwardForCandidates && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-[#11111F] rounded-2xl max-w-2xl w-full p-6 shadow-2xl max-h-[90vh] overflow-y-auto space-y-4 border border-[#292940] text-[#FFFFFF]">
            <div className="flex justify-between items-center border-b border-[#292940] pb-3">
              <div>
                <h2 className="text-lg font-black text-[#FFFFFF] flex items-center gap-2">
                  <Trophy className="w-5 h-5 text-[#818CF8]" />
                  Evaluate Candidates for: {selectedAwardForCandidates.title}
                </h2>
                <p className="text-xs text-[#A1A1AA] mt-0.5">
                  Calculated directly from verified gym database records.
                </p>
              </div>
              <button onClick={() => setSelectedAwardForCandidates(null)} className="cursor-pointer text-[#A1A1AA] hover:text-[#FFFFFF]">
                <X className="w-5 h-5" />
              </button>
            </div>

            {loadingCandidates ? (
              <div className="text-center py-12">
                <Activity className="w-8 h-8 animate-spin mx-auto text-[#6366F1] mb-2" />
                <p className="text-xs font-semibold text-[#A1A1AA]">Retrieving real-time performance records...</p>
              </div>
            ) : candidatesList.length === 0 ? (
              <div className="text-center py-10 text-[#A1A1AA] text-xs">
                No eligible candidates found for this criteria metric.
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs font-bold text-[#A1A1AA]">
                  Select the winner candidate to confirm:
                </p>

                <div className="space-y-2 max-h-80 overflow-y-auto pr-1">
                  {candidatesList.map((cand, index) => {
                    const isSelected = selectedWinnerId === cand.userId?.toString();

                    return (
                      <div
                        key={cand.userId}
                        onClick={() => {
                          setSelectedWinnerId(cand.userId?.toString());
                          setSelectedWinnerMetric(cand.metricDescription);
                        }}
                        className={`p-3.5 rounded-xl border flex items-center justify-between transition cursor-pointer ${
                          isSelected
                            ? 'border-[#6366F1] bg-[#6366F1]/10 ring-1 ring-[#6366F1]'
                            : 'border-[#292940] hover:border-[#6366F1]/40 bg-[#0B0B12]'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div className={`w-7 h-7 rounded-full flex items-center justify-center font-bold text-xs ${
                            index === 0 ? 'bg-[#818CF8] text-[#0B0B12]' : 'bg-[#11111F] text-[#A1A1AA]'
                          }`}>
                            #{index + 1}
                          </div>

                          <div>
                            <div className="font-extrabold text-sm text-[#FFFFFF]">{cand.name}</div>
                            <div className="text-xs text-[#A1A1AA]">{cand.email}</div>
                          </div>
                        </div>

                        <div className="text-right">
                          <span className="text-xs font-extrabold text-[#818CF8] block">
                            {cand.metricDescription}
                          </span>
                          <span className="text-[10px] text-[#A1A1AA]">
                            Score: {cand.primaryScore}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            <div className="pt-3 border-t border-[#292940] flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setSelectedAwardForCandidates(null)}
                className="px-4 py-2 rounded-xl border border-[#292940] font-bold text-[#A1A1AA] hover:bg-[#0B0B12] hover:text-[#FFFFFF] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleConfirmWinner}
                disabled={confirmingWinner || !selectedWinnerId}
                className="px-5 py-2 rounded-xl font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] transition cursor-pointer disabled:opacity-50 shadow-md shadow-[#6366F1]/25"
              >
                {confirmingWinner ? 'Confirming...' : 'Confirm Winner'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 3: PUBLISH AWARD CONFIRMATION */}
      {awardToPublish && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="bg-[#11111F] rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-4 border border-[#292940] text-[#FFFFFF]">
            <div className="flex items-center gap-3 text-[#6366F1]">
              <div className="p-3 rounded-2xl bg-[#0B0B12] border border-[#292940]">
                <Send className="w-6 h-6 text-[#6366F1]" />
              </div>
              <div>
                <h2 className="text-base font-extrabold text-[#FFFFFF]">Publish Official Award</h2>
                <p className="text-xs text-[#A1A1AA]">Issue Certificate & Hall of Fame Feature</p>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-[#0B0B12] border border-[#292940] text-xs space-y-2">
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Award:</span>
                <span className="font-bold text-[#FFFFFF]">{awardToPublish.title}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Confirmed Winner:</span>
                <span className="font-bold text-[#818CF8]">{awardToPublish.winnerName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#A1A1AA]">Achievement Record:</span>
                <span className="font-semibold text-[#818CF8]">{awardToPublish.winnerMetricAchieved}</span>
              </div>
            </div>

            <p className="text-xs text-[#A1A1AA]">
              Publishing will generate an official unique Certificate ID, send an instant in-app notification to the winner, and publish them to the Hall of Fame.
            </p>

            <div className="pt-2 flex justify-end gap-2 border-t border-[#292940]">
              <button
                type="button"
                onClick={() => setAwardToPublish(null)}
                className="px-4 py-2 rounded-xl border border-[#292940] font-bold text-[#A1A1AA] hover:bg-[#0B0B12] hover:text-[#FFFFFF] transition cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handlePublishAward}
                disabled={publishing}
                className="px-5 py-2 rounded-xl font-bold text-white bg-[#6366F1] hover:bg-[#4F46E5] transition cursor-pointer shadow-md shadow-[#6366F1]/25"
              >
                {publishing ? 'Publishing...' : 'Confirm & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
