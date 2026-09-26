import React, { useState, useEffect } from 'react';
import { Bot, CheckCircle2, AlertCircle, RefreshCw, FileText, Calendar, Clock } from 'lucide-react';
import api from '../../utils/api';

const MemberTrainerReview = () => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchRecommendation();
  }, []);

  const fetchRecommendation = async () => {
    try {
      const res = await api.get(`/ai/member/latest`);
      setRecommendation(res.data.recommendation);
      setHistory(res.data.history || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-[#687B78]">Loading trainer feedback...</div>;
  if (!recommendation) return <div className="text-center py-20 text-[#EF4444]">No AI Plan found.</div>;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#202828] tracking-tight">Trainer Review & Feedback</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${
          recommendation.status === 'Trainer Approved' ? 'bg-[#F1F5F3] border-[#D3DFDA] text-[#0F766E]' 
          : recommendation.status === 'Revision Requested' ? 'bg-[#FFFBEB] border-[#FEF3C7] text-[#B45309]'
          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
        }`}>
          {recommendation.status === 'Trainer Approved' ? <CheckCircle2 size={14} /> 
           : recommendation.status === 'Revision Requested' ? <RefreshCw size={14} /> 
           : <Bot size={14} />}
          {recommendation.status} (Version {recommendation.version})
        </div>
      </div>

      <div className="bg-gradient-to-r from-[#202828] to-[#164A4A] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10 -mr-20 -mt-20"></div>
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <FileText size={24} className="text-[#D2B48C]" /> Plan Status
            </h2>
            <p className="text-[#D3DFDA]">
              {recommendation.status === 'Trainer Approved' 
                ? "Your trainer has reviewed and approved your AI-generated plan. You are good to go!" 
                : recommendation.status === 'Revision Requested'
                ? "Your trainer has requested some revisions to your plan. Please check the feedback below."
                : "Your AI plan is currently pending review by your trainer. They may leave feedback or adjust your routine soon."}
            </p>
          </div>
          {recommendation.trainerId && (
            <div className="bg-white/10 p-4 rounded-xl text-center min-w-[200px] border border-white/20 backdrop-blur-sm">
              <div className="text-xs text-[#D3DFDA] uppercase tracking-wider mb-1 font-semibold">Reviewed By</div>
              <div className="font-bold text-lg">{recommendation.trainerId.name || 'Your Assigned Trainer'}</div>
            </div>
          )}
        </div>
      </div>

      {recommendation.trainerNotes && (
        <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#B45309] mb-4 flex items-center"><AlertCircle className="mr-2" size={20} /> Professional Trainer Notes</h2>
          <div className="bg-white/50 border border-[#FEF3C7] rounded-xl p-4 text-[#92400E] min-h-[100px] whitespace-pre-wrap font-medium">
            {recommendation.trainerNotes}
          </div>
        </div>
      )}

      {recommendation.revisionDetails && recommendation.status === 'Revision Requested' && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center"><RefreshCw className="mr-2" size={20} /> Revision Request Details</h2>
          <div className="bg-white border border-red-100 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-red-100">
              <div className="flex items-center gap-3 text-sm text-[#455250]">
                <Calendar size={16} className="text-red-500" />
                <span className="font-semibold text-[#202828]">Date:</span> {new Date(recommendation.revisionDetails.date).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#455250]">
                <Clock size={16} className="text-red-500" />
                <span className="font-semibold text-[#202828]">Time:</span> {new Date(recommendation.revisionDetails.date).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#455250]">
                <Bot size={16} className="text-red-500" />
                <span className="font-semibold text-[#202828]">Trainer:</span> {recommendation.revisionDetails.trainerName}
              </div>
            </div>
            <div>
              <span className="block text-sm font-bold text-red-700 mb-2">Reason for Revision:</span>
              <div className="text-red-900 whitespace-pre-wrap">
                {recommendation.revisionDetails.reason}
              </div>
            </div>
          </div>
        </div>
      )}

      {!recommendation.trainerNotes && recommendation.status !== 'Trainer Approved' && (
        <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-2xl p-8 text-center shadow-sm">
          <Bot size={48} className="mx-auto text-[#A8ADA9] mb-4" />
          <h3 className="text-lg font-bold text-[#687B78] mb-2">Awaiting Trainer Feedback</h3>
          <p className="text-[#A8ADA9] max-w-md mx-auto">Your trainer hasn't left any notes yet. Once they review your AI plan and leave feedback, it will appear here.</p>
        </div>
      )}

      {!recommendation.trainerNotes && recommendation.status === 'Trainer Approved' && (
        <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-[#86EFAC] mb-4" />
          <h3 className="text-lg font-bold text-[#166534] mb-2">Plan Approved</h3>
          <p className="text-[#15803D] max-w-md mx-auto">Your trainer has reviewed and approved your plan without any additional notes. You can view your routine in the Workout and Diet sections.</p>
        </div>
      )}

      {history.length > 0 && history[0].trainerNotes && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#475569] mb-4 flex items-center"><Clock className="mr-2" size={18} /> Previous Trainer Notes (Version {history[0].version})</h2>
          <div className="bg-white/50 border border-[#E2E8F0] rounded-xl p-4 text-[#475569] min-h-[100px] whitespace-pre-wrap font-medium">
            {history[0].trainerNotes}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTrainerReview;
