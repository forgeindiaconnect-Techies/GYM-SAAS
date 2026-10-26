import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import {
  Calendar,
  Clock,
  Video,
  MapPin,
  Building2,
  ExternalLink,
  CheckCircle,
  AlertCircle,
  Briefcase
} from 'lucide-react';

export default function TrainerInterviews() {
  const [interviews, setInterviews] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const res = await axios.get('http://localhost:5600/api/hiring/trainer/interviews', {
        headers: { Authorization: `Bearer ${token}` }
      });
      if (res.data.success) {
        setInterviews(res.data.data);
      }
    } catch (err) {
      console.error('Failed to load interviews:', err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Scheduled':
        return 'bg-cyan-500/10 text-cyan-300 border-cyan-500/30';
      case 'Completed':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30';
      case 'Cancelled':
        return 'bg-rose-500/10 text-rose-400 border-rose-500/30';
      case 'Rescheduled':
        return 'bg-yellow-500/10 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-slate-800 text-slate-400 border-slate-700';
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-white flex items-center gap-2">
            <Calendar className="w-7 h-7 text-cyan-400" />
            Interview Schedule
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Upcoming screening sessions, technical discussions, and practical gym floor trials
          </p>
        </div>
        <div className="flex items-center gap-3">
          <Link
            to="/trainer/applications"
            className="px-4 py-2 bg-[#141D1E] hover:bg-[#1B2728] text-slate-300 rounded-xl border border-[#2A3A3A] text-sm flex items-center gap-2"
          >
            <Briefcase className="w-4 h-4 text-[#2DD4BF]" />
            Applications
          </Link>
          <Link
            to="/trainer/job-offers"
            className="px-4 py-2 bg-[#2DD4BF]/10 hover:bg-[#2DD4BF]/20 text-[#2DD4BF] border border-[#2DD4BF]/30 rounded-xl text-sm font-semibold"
          >
            Job Offers
          </Link>
        </div>
      </div>

      {loading ? (
        <div className="p-12 text-center text-slate-400 bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <div className="inline-block animate-spin w-8 h-8 border-4 border-cyan-400 border-t-transparent rounded-full mb-3" />
          <p>Loading your interview invites...</p>
        </div>
      ) : interviews.length === 0 ? (
        <div className="p-12 text-center bg-[#0E1415] rounded-2xl border border-[#2A3A3A]">
          <Calendar className="w-12 h-12 text-cyan-500/30 mx-auto mb-3" />
          <h3 className="text-lg font-semibold text-white mb-1">No interviews scheduled yet</h3>
          <p className="text-sm text-slate-400 max-w-md mx-auto mb-4">
            Once a gym owner reviews your profile and schedules an interview, the meeting details and links will appear here.
          </p>
          <Link
            to="/trainer/jobs"
            className="px-4 py-2 bg-[#2DD4BF] text-black font-semibold rounded-xl text-xs inline-block"
          >
            Explore Vacancies
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {interviews.map((inv) => (
            <div
              key={inv._id}
              className="bg-[#0E1415] border border-[#2A3A3A] hover:border-cyan-500/40 rounded-2xl p-5 transition-all flex flex-col justify-between space-y-4"
            >
              <div>
                <div className="flex items-start justify-between gap-2 mb-2">
                  <div>
                    <span className="text-xs text-[#2DD4BF] font-semibold flex items-center gap-1">
                      <Building2 className="w-3.5 h-3.5" />
                      {inv.jobId?.gymName || 'Fitness Club'}
                    </span>
                    <h3 className="text-base font-bold text-white mt-1">
                      {inv.jobId?.title || 'Gym Trainer'}
                    </h3>
                  </div>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-medium ${getStatusBadge(
                      inv.status
                    )}`}
                  >
                    {inv.status}
                  </span>
                </div>

                <div className="bg-[#141D1E] p-3 rounded-xl border border-[#2A3A3A] space-y-2 text-xs mt-3">
                  <div className="flex items-center gap-2 text-slate-300">
                    <Calendar className="w-3.5 h-3.5 text-cyan-400" />
                    <span className="font-semibold text-white">
                      {new Date(inv.date).toLocaleDateString(undefined, {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                        year: 'numeric'
                      })}
                    </span>
                  </div>
                  <div className="flex items-center gap-2 text-slate-400">
                    <Clock className="w-3.5 h-3.5 text-cyan-400" />
                    <span>{inv.time}</span>
                    <span className="text-slate-600">•</span>
                    <span>{inv.duration}</span>
                    <span className="text-slate-600">•</span>
                    <span className="text-cyan-300 font-medium">{inv.mode}</span>
                  </div>
                </div>

                {/* Venue or Link */}
                <div className="mt-3 text-xs bg-[#1B2728] p-3 rounded-xl border border-[#2A3A3A]">
                  <span className="text-slate-500 block uppercase font-semibold text-[10px] mb-1">
                    Meeting Location / Link
                  </span>
                  {inv.locationOrLink?.startsWith('http') ? (
                    <a
                      href={inv.locationOrLink}
                      target="_blank"
                      rel="noreferrer"
                      className="text-cyan-400 hover:text-cyan-300 font-mono text-xs flex items-center gap-1.5 break-all"
                    >
                      <Video className="w-3.5 h-3.5 shrink-0" />
                      Join Video Call <ExternalLink className="w-3 h-3 shrink-0" />
                    </a>
                  ) : (
                    <div className="text-slate-200 flex items-center gap-1.5">
                      <MapPin className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                      <span>{inv.locationOrLink}</span>
                    </div>
                  )}
                </div>

                {inv.instructions && (
                  <div className="mt-3 text-xs text-slate-300 italic bg-[#141D1E] p-2.5 rounded-lg border border-[#2A3A3A]">
                    <span className="text-slate-500 not-italic uppercase font-semibold text-[10px] block mb-0.5">
                      Instructions from Gym Owner
                    </span>
                    "{inv.instructions}"
                  </div>
                )}
              </div>

              {inv.status === 'Completed' && (
                <div className="pt-2 text-xs text-emerald-400 font-medium flex items-center gap-1.5">
                  <CheckCircle className="w-3.5 h-3.5" />
                  Interview Completed
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
