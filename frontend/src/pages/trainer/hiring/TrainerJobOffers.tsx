import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Gift,
  Building2,
  DollarSign,
  Calendar,
  Briefcase,
  CheckCircle,
  XCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  AlertCircle
} from 'lucide-react';

export default function TrainerJobOffers() {
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    fetchOffers();
  }, []);

  const fetchOffers = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5600/api/hiring/trainer/offers', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setOffers(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load offers:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleRespondOffer = async (offerId: string, status: 'Accepted' | 'Declined') => {
    const verb = status === 'Accepted' ? 'accept' : 'decline';
    if (!window.confirm(`Are you sure you want to ${verb} this job offer?`)) return;

    setActionLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.patch(
        `http://localhost:5600/api/hiring/trainer/offers/${offerId}/respond`,
        { status },
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (res.data.success) {
        alert(
          status === 'Accepted'
            ? 'Congratulations! You have accepted the job offer. You are now officially integrated into the gym trainer roster!'
            : 'You have declined the job offer.'
        );
        fetchOffers();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || `Failed to ${verb} offer`);
    } finally {
      setActionLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      case 'Accepted':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Declined':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#292524] flex items-center gap-2">
            <Gift className="w-7 h-7 text-[#B76E79]" />
            Official Job Offers
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Review formal employment proposals, compensation, joining dates and benefits
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/trainer/applications"
            className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 rounded-xl border border-[#E7DADD] text-sm flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-[#B76E79]" />
            My Applications
          </Link>
          <Link
            to="/trainer/jobs"
            className="px-4 py-2 bg-[#B76E79]/10 hover:bg-[#B76E79]/20 text-[#B76E79] border border-[#B76E79]/30 rounded-xl text-sm font-semibold"
          >
            Find More Jobs
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-[#F3E8E8] rounded-2xl border border-[#E7DADD]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#B76E79] border-t-transparent rounded-full mb-3" />
          <p>Loading your job offers...</p>
        </div>
      ) : offers.length === 0 ? (
        <div className="p-12 text-center bg-[#F3E8E8] rounded-2xl border border-[#E7DADD]">
          <Gift className="w-12 h-12 text-[#B76E79]/40 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#292524] mb-1">No job offers at present</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            When a gym owner selects you following an interview assessment, your official offer letter and compensation terms will be published here.
          </p>
          <Link
            to="/trainer/jobs"
            className="px-4 py-2 bg-[#B76E79] text-white font-semibold rounded-xl text-xs inline-block"
          >
            Apply to Gyms
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {offers.map((offer) => {
            const isPending = offer.status === 'Pending';
            const isAccepted = offer.status === 'Accepted';

            return (
              <div
                key={offer._id}
                className={`bg-[#F3E8E8] border rounded-2xl p-6 transition-all flex flex-col justify-between space-y-5 shadow-xl ${
                  isAccepted
                    ? 'border-emerald-500/50 bg-gradient-to-b from-[#F3E8E8] to-emerald-950/10'
                    : 'border-[#E7DADD] hover:border-[#B76E79]/50'
                }`}
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div>
                      <span className="text-xs text-[#B76E79] font-semibold flex items-center gap-1">
                        <Building2 className="w-3.5 h-3.5" />
                        {offer.jobId?.gymName || 'Fitness Club'}
                      </span>
                      <h3 className="text-xl font-bold text-[#292524] mt-1">
                        {offer.jobId?.title || 'Gym Trainer Position'}
                      </h3>
                    </div>
                    <span
                      className={`text-xs px-3 py-1 rounded-full border font-semibold ${getStatusBadge(
                        offer.status
                      )}`}
                    >
                      {offer.status}
                    </span>
                  </div>

                  {/* Compensation & Contract Details */}
                  <div className="grid grid-cols-2 gap-3 bg-[#FFFFFF] p-4 rounded-xl border border-[#E7DADD] text-xs mt-4">
                    <div>
                      <span className="text-slate-500 block mb-0.5">Offered Compensation</span>
                      <span className="text-lg font-bold text-[#B76E79] font-mono">
                        ₹{offer.offeredSalary?.toLocaleString()}
                        <span className="text-xs text-slate-400 font-normal">
                          {' '}
                          / {offer.salaryPeriod}
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">Employment Type</span>
                      <span className="font-semibold text-white">{offer.employmentType}</span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">Joining Date</span>
                      <span className="font-semibold text-white flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400" />
                        {offer.joiningDate
                          ? new Date(offer.joiningDate).toLocaleDateString()
                          : 'Immediate'}
                      </span>
                    </div>

                    <div>
                      <span className="text-slate-500 block mb-0.5">Location</span>
                      <span className="font-semibold text-white truncate block">
                        {offer.jobId?.location || 'Gym Facility'}
                      </span>
                    </div>
                  </div>

                  {/* Offer Terms */}
                  {offer.terms && (
                    <div className="mt-4 text-xs text-slate-300 bg-[#F3E8E8] p-3.5 rounded-xl border border-[#E7DADD]">
                      <span className="text-slate-500 uppercase font-semibold text-[10px] block mb-1">
                        Perks & Contract Terms
                      </span>
                      <p className="leading-relaxed">{offer.terms}</p>
                    </div>
                  )}

                  {isAccepted && (
                    <div className="mt-4 p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-xs text-emerald-400 flex items-center gap-2">
                      <ShieldCheck className="w-5 h-5 shrink-0" />
                      <div>
                        <strong className="block">Offer Accepted & Roster Active</strong>
                        You have been connected to this gym's trainer roster. Check your dashboard schedule for upcoming classes.
                      </div>
                    </div>
                  )}
                </div>

                {/* Actions */}
                {isPending && (
                  <div className="pt-4 border-t border-[#E7DADD] flex items-center justify-end gap-3">
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespondOffer(offer._id, 'Declined')}
                      className="px-4 py-2 bg-[#FFFFFF] hover:bg-rose-500/10 text-slate-400 hover:text-rose-400 border border-[#E7DADD] hover:border-rose-500/30 rounded-xl text-xs font-medium transition-all"
                    >
                      Decline Offer
                    </button>
                    <button
                      disabled={actionLoading}
                      onClick={() => handleRespondOffer(offer._id, 'Accepted')}
                      className="px-5 py-2 bg-[#B76E79] hover:bg-[#9F5965] text-white font-semibold rounded-xl text-xs flex items-center gap-1.5 shadow-lg shadow-[#B76E79]/20 transition-all"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Accept & Join Gym
                    </button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
