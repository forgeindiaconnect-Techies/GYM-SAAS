import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  UserCheck,
  Calendar,
  DollarSign,
  Briefcase,
  Mail,
  Phone,
  Search,
  ExternalLink,
  Users,
  Award,
  Clock,
  ShieldCheck,
  Sparkles,
  Building2
} from 'lucide-react';

interface HiredItem {
  id: string;
  sourceType: 'DIRECT_HIRE' | 'JOB_OFFER';
  trainerName: string;
  trainerEmail?: string;
  trainerPhone?: string;
  trainerPhoto?: string;
  role: string;
  employmentType: string;
  confirmedSalary: number;
  salaryPeriod?: string;
  personalTrainingFee?: number;
  joiningDate?: string;
  status: string;
  confirmedDate?: string;
  notes?: string;
}

export default function GymAdminHiredTrainers() {
  const [hiredList, setHiredList] = useState<HiredItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [sourceFilter, setSourceFilter] = useState<'ALL' | 'DIRECT_HIRE' | 'JOB_OFFER'>('ALL');

  useEffect(() => {
    fetchHired();
  }, []);

  const fetchHired = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = { Authorization: `Bearer ${token}` };

      // 1. Fetch Job Offers that are Accepted
      const offersPromise = axios
        .get('http://localhost:5600/api/hiring/owner/offers', { headers })
        .catch(() => ({ data: { success: false, data: [] } }));

      // 2. Fetch Direct Hiring Requests that are Confirmed
      const directHiresPromise = axios
        .get('http://localhost:5600/api/hiring/owner/hiring-requests', { headers })
        .catch(() => ({ data: { success: false, requests: [] } }));

      const [offersRes, directRes] = await Promise.all([offersPromise, directHiresPromise]);

      const items: HiredItem[] = [];

      // Process direct hiring requests
      if (directRes.data?.success) {
        const directRequests = directRes.data.requests || directRes.data.data || [];
        directRequests
          .filter((r: any) => r.status === 'Confirmed')
          .forEach((r: any) => {
            items.push({
              id: `direct_${r._id}`,
              sourceType: 'DIRECT_HIRE',
              trainerName: r.trainerName || 'Trainer',
              trainerEmail: r.trainerEmail,
              trainerPhone: r.trainerPhone,
              trainerPhoto: r.trainerId?.profilePhoto,
              role: r.role || 'Fitness Coach',
              employmentType: r.employmentType || 'Full-time',
              confirmedSalary: r.offeredCompensation || 0,
              salaryPeriod: 'month',
              personalTrainingFee: r.personalTrainingFee || 0,
              joiningDate: r.expectedJoiningDate,
              status: 'Hired & Active',
              confirmedDate: r.confirmedAt || r.updatedAt,
              notes: r.additionalTerms
            });
          });
      }

      // Process accepted job offers
      if (offersRes.data?.success) {
        const offers = offersRes.data.offers || offersRes.data.data || [];
        offers
          .filter((o: any) => o.status === 'Accepted')
          .forEach((o: any) => {
            const trainer = o.trainerId;
            const app = o.applicationId;
            const job = o.jobId;

            items.push({
              id: `offer_${o._id}`,
              sourceType: 'JOB_OFFER',
              trainerName: app?.fullName || trainer?.name || 'Trainer',
              trainerEmail: app?.email || trainer?.email,
              trainerPhone: app?.phone || trainer?.phone,
              trainerPhoto: trainer?.profilePhoto,
              role: job?.title || 'Gym Trainer',
              employmentType: o.employmentType || job?.employmentType || 'Full-time',
              confirmedSalary: o.offeredSalary || 0,
              salaryPeriod: o.salaryPeriod || 'month',
              personalTrainingFee: 0,
              joiningDate: o.joiningDate,
              status: 'Offer Accepted',
              confirmedDate: o.updatedAt,
              notes: o.terms
            });
          });
      }

      setHiredList(items);
    } catch (err) {
      console.error('Failed to load hired trainers:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = hiredList.filter((item) => {
    const matchesSource = sourceFilter === 'ALL' || item.sourceType === sourceFilter;
    const term = search.toLowerCase();
    const matchesSearch =
      item.trainerName.toLowerCase().includes(term) ||
      item.role.toLowerCase().includes(term) ||
      item.employmentType.toLowerCase().includes(term);
    return matchesSource && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#292524] flex items-center gap-2">
            <UserCheck className="w-7 h-7 text-[#B76E79]" />
            Hired Trainers & Coaching Roster
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Confirmed fitness trainers recruited via Direct Hiring and Vacancy Placements, connected to your active gym roster
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/admin/trainers"
            className="px-4 py-2 bg-[#B76E79] hover:bg-[#9F5965] text-white font-semibold rounded-xl text-sm transition-all flex items-center gap-2"
          >
            <Users className="w-4 h-4" />
            Gym Trainer Roster
          </Link>
        </div>
      </div>

      {/* Summary KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="bg-[#F3E8E8] border border-[#E7DADD] p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Total Confirmed Hires
          </span>
          <span className="text-2xl font-bold mt-1 text-white font-mono block">
            {hiredList.length}
          </span>
        </div>
        <div className="bg-[#F3E8E8] border border-[#E7DADD] p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Direct Hiring Method
          </span>
          <span className="text-2xl font-bold mt-1 text-[#B76E79] font-mono block">
            {hiredList.filter((h) => h.sourceType === 'DIRECT_HIRE').length}
          </span>
        </div>
        <div className="bg-[#F3E8E8] border border-[#E7DADD] p-4 rounded-xl">
          <span className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
            Job Vacancy Placements
          </span>
          <span className="text-2xl font-bold mt-1 text-teal-300 font-mono block">
            {hiredList.filter((h) => h.sourceType === 'JOB_OFFER').length}
          </span>
        </div>
      </div>

      {/* Search & Filter Controls */}
      <div className="bg-[#F3E8E8] p-4 rounded-2xl border border-[#E7DADD] flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by trainer or role..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#FFFFFF] border border-[#E7DADD] rounded-xl text-white placeholder-slate-500 text-sm focus:outline-none focus:border-[#B76E79]"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <button
            onClick={() => setSourceFilter('ALL')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              sourceFilter === 'ALL'
                ? 'bg-[#B76E79] text-white shadow-md shadow-[#B76E79]/20'
                : 'bg-[#FFFFFF] text-slate-400 hover:text-white border border-[#E7DADD]'
            }`}
          >
            All Recruitment Streams
          </button>
          <button
            onClick={() => setSourceFilter('DIRECT_HIRE')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              sourceFilter === 'DIRECT_HIRE'
                ? 'bg-[#B76E79] text-white shadow-md shadow-[#B76E79]/20'
                : 'bg-[#FFFFFF] text-slate-400 hover:text-white border border-[#E7DADD]'
            }`}
          >
            Direct Hires
          </button>
          <button
            onClick={() => setSourceFilter('JOB_OFFER')}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold transition-all ${
              sourceFilter === 'JOB_OFFER'
                ? 'bg-[#B76E79] text-white shadow-md shadow-[#B76E79]/20'
                : 'bg-[#FFFFFF] text-slate-400 hover:text-white border border-[#E7DADD]'
            }`}
          >
            Job Vacancy Offers
          </button>
        </div>
      </div>

      {loading ? (
        <div className="p-16 text-center text-slate-400 bg-[#F3E8E8] rounded-2xl border border-[#E7DADD]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-[#B76E79] border-t-transparent rounded-full mb-3" />
          <p className="text-sm">Loading hired trainers...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="p-16 text-center bg-[#F3E8E8] rounded-2xl border border-[#E7DADD]">
          <UserCheck className="w-12 h-12 text-[#B76E79]/40 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-[#292524] mb-1">No confirmed hires found</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-5">
            When you confirm accepted hiring requests or when candidates accept your published job offers, they are automatically placed here and added to your gym roster.
          </p>
          <div className="flex items-center justify-center gap-3">
            <Link
              to="/admin/hiring/trainers"
              className="px-4 py-2 bg-[#B76E79] text-white font-semibold rounded-xl text-xs hover:bg-[#9F5965] transition-all"
            >
              Browse Trainers
            </Link>
            <Link
              to="/admin/hiring/applications"
              className="px-4 py-2 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-300 border border-[#E7DADD] rounded-xl text-xs font-semibold transition-all"
            >
              Review Applications
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map((item) => {
            return (
              <div
                key={item.id}
                className="bg-[#F3E8E8] border border-teal-500/30 rounded-2xl p-5 hover:border-[#B76E79] transition-all flex flex-col justify-between space-y-4 shadow-lg shadow-black/30"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-xl bg-[#FFFFFF] border border-[#E7DADD] flex items-center justify-center text-base font-bold text-[#B76E79] overflow-hidden shrink-0">
                        {item.trainerPhoto ? (
                          <img
                            src={item.trainerPhoto}
                            alt={item.trainerName}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          item.trainerName[0]?.toUpperCase() || 'T'
                        )}
                      </div>
                      <div>
                        <h3 className="text-base font-bold text-[#292524] flex items-center gap-1.5">
                          {item.trainerName}
                          <ShieldCheck className="w-4 h-4 text-[#B76E79]" />
                        </h3>
                        <span className="text-xs text-[#B76E79] font-medium block">
                          {item.role}
                        </span>
                      </div>
                    </div>

                    <span
                      className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                        item.sourceType === 'DIRECT_HIRE'
                          ? 'bg-purple-500/15 text-purple-300 border border-purple-500/30'
                          : 'bg-teal-500/15 text-teal-300 border border-teal-500/30'
                      }`}
                    >
                      {item.sourceType === 'DIRECT_HIRE' ? 'Direct Hire' : 'Vacancy Offer'}
                    </span>
                  </div>

                  <div className="space-y-2 text-xs text-slate-400 bg-[#FFFFFF] p-3.5 rounded-xl border border-[#E7DADD] mt-3">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Confirmed Salary:</span>
                      <span className="font-bold text-[#B76E79] font-mono">
                        ₹{item.confirmedSalary?.toLocaleString()} / {item.salaryPeriod || 'month'}
                      </span>
                    </div>

                    {item.personalTrainingFee ? (
                      <div className="flex items-center justify-between">
                        <span className="text-slate-500">PT Session Fee:</span>
                        <span className="font-bold text-teal-300 font-mono">
                          ₹{item.personalTrainingFee.toLocaleString()} / session
                        </span>
                      </div>
                    ) : null}

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Employment Type:</span>
                      <span className="text-white font-medium">{item.employmentType}</span>
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-slate-500">Joining Date:</span>
                      <span className="text-white font-medium">
                        {item.joiningDate
                          ? new Date(item.joiningDate).toLocaleDateString()
                          : 'Immediate'}
                      </span>
                    </div>
                  </div>

                  <div className="mt-3 text-xs text-slate-400 space-y-1">
                    {item.trainerEmail && (
                      <div className="flex items-center gap-1.5">
                        <Mail className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span className="truncate">{item.trainerEmail}</span>
                      </div>
                    )}
                    {item.trainerPhone && (
                      <div className="flex items-center gap-1.5">
                        <Phone className="w-3.5 h-3.5 text-slate-500 shrink-0" />
                        <span>{item.trainerPhone}</span>
                      </div>
                    )}
                  </div>

                  {item.notes && (
                    <div className="mt-3 text-[11px] text-slate-400 bg-[#F3E8E8] p-2.5 rounded-lg border border-[#E7DADD]">
                      <span className="text-slate-500 uppercase font-semibold text-[10px] block mb-0.5">
                        Agreed Terms
                      </span>
                      {item.notes}
                    </div>
                  )}
                </div>

                <div className="pt-3 border-t border-[#E7DADD]">
                  <Link
                    to="/admin/trainers"
                    className="w-full py-2 bg-[#FFFFFF] hover:bg-[#F3E8E8] text-slate-200 hover:text-white text-xs font-semibold rounded-xl border border-[#E7DADD] flex items-center justify-center gap-1.5 transition-all"
                  >
                    Manage in Gym Trainer Roster
                    <ExternalLink className="w-3.5 h-3.5 text-[#B76E79]" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
