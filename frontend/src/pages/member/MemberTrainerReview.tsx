import { useState, useEffect } from 'react';
import {
  Bot, CheckCircle2, AlertCircle, RefreshCw, FileText,
  Calendar, Clock, Send, MessageSquare, User
} from 'lucide-react';
import api from '../../utils/api';

const MemberTrainerReview = () => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // Reply state
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [replyError, setReplyError] = useState('');

  useEffect(() => { fetchRecommendation(); }, []);

  const fetchRecommendation = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/member/latest`);
      setRecommendation(res.data.recommendation);
      setHistory(res.data.history || []);
      // Pre-fill reply if already sent
      if (res.data.recommendation?.memberReply?.message) {
        setReplyText(res.data.recommendation.memberReply.message);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const sendReply = async () => {
    if (!replyText.trim()) return;
    try {
      setReplySending(true);
      setReplyError('');
      await api.post('/ai/member/reply', { message: replyText.trim() });
      setReplySuccess(true);
      fetchRecommendation(); // refresh to show saved reply
    } catch (err: any) {
      setReplyError(err.response?.data?.message || 'Failed to send reply.');
    } finally {
      setReplySending(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-[#78716C]">Loading trainer feedback...</div>;
  if (!recommendation) return <div className="text-center py-20 text-[#EF4444]">No AI Plan found.</div>;

  const isRevisionRequested = recommendation.status === 'Revision Requested';
  const isApproved = recommendation.status === 'Trainer Approved' || recommendation.status === 'Published to Customer' || recommendation.status === 'Published';
  const isPending = recommendation.status === 'AI Generated' || recommendation.status === 'Pending' || recommendation.status === 'Under Trainer Review' || recommendation.status === 'Pending Trainer Review';
  
  const revisionReason = recommendation.revisionDetails?.reason || history.find((h: any) => h.revisionDetails?.reason)?.revisionDetails?.reason;
  const revisionDate = recommendation.revisionDetails?.date || history.find((h: any) => h.revisionDetails?.date)?.revisionDetails?.date;
  const revisionTrainer = recommendation.revisionDetails?.trainerName || recommendation.trainerId?.name || history.find((h: any) => h.revisionDetails?.trainerName)?.revisionDetails?.trainerName || 'Assigned Trainer';

  const trainerNotes = recommendation.trainerNotes || history.find((h: any) => h.trainerNotes)?.trainerNotes;

  const hasFeedbackOrChat =
    !!revisionReason ||
    !!trainerNotes ||
    !!recommendation.memberReply?.message ||
    !!recommendation.trainerReply?.message ||
    (recommendation.chatMessages && recommendation.chatMessages.length > 0) ||
    isRevisionRequested ||
    isApproved;

  const alreadyReplied = !!recommendation.memberReply?.message;

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">

      {/* Header */}
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Trainer Review &amp; Feedback</h1>
        <div className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-2 ${
          isApproved ? 'bg-[#FFFDF8] border-[#E7E5E4] text-[#0F766E]'
          : isRevisionRequested ? 'bg-[#FFFBEB] border-[#FEF3C7] text-[#B45309]'
          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
        }`}>
          {isApproved ? <CheckCircle2 size={14} />
           : isRevisionRequested ? <RefreshCw size={14} />
           : <Bot size={14} />}
          {recommendation.status} (Version {recommendation.version})
        </div>
      </div>

      {/* Plan Status Banner */}
      <div className="bg-gradient-to-r from-[#292524] to-[#F97316] rounded-2xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white rounded-full blur-3xl opacity-10 -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2">
              <FileText size={24} className="text-[#FED7AA]" /> Plan Status
            </h2>
            <p className="text-[#E7E5E4]">
              {isApproved
                ? "Your trainer has reviewed and approved your AI-generated plan. You are good to go!"
                : isRevisionRequested
                ? "Your trainer has requested some revisions to your plan. Please check the feedback below and reply."
                : "Your AI plan is currently pending review by your trainer. They may leave feedback or adjust your routine soon."}
            </p>
          </div>
          {recommendation.trainerId && (
            <div className="bg-white/10 p-4 rounded-xl text-center min-w-[200px] border border-white/20 backdrop-blur-sm">
              <div className="text-xs text-[#E7E5E4] uppercase tracking-wider mb-1 font-semibold">Reviewed By</div>
              <div className="font-bold text-lg">{recommendation.trainerId.name || 'Your Assigned Trainer'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Trainer Notes */}
      {trainerNotes && (
        <div className="bg-[#FFFBEB] border border-[#FEF3C7] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#B45309] mb-4 flex items-center"><AlertCircle className="mr-2" size={20} /> Professional Trainer Notes</h2>
          <div className="bg-white/50 border border-[#FEF3C7] rounded-xl p-4 text-[#92400E] min-h-[80px] whitespace-pre-wrap font-medium">
            {trainerNotes}
          </div>
        </div>
      )}

      {/* Revision Request Details */}
      {(isRevisionRequested || revisionReason) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center"><RefreshCw className="mr-2" size={20} /> Revision Request Details</h2>
          <div className="bg-white border border-red-100 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-red-100">
              <div className="flex items-center gap-3 text-sm text-[#78716C]">
                <Calendar size={16} className="text-red-500" />
                <span className="font-semibold text-[#292524]">Date:</span> {revisionDate ? new Date(revisionDate).toLocaleDateString() : new Date(recommendation.updatedAt || recommendation.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#78716C]">
                <Clock size={16} className="text-red-500" />
                <span className="font-semibold text-[#292524]">Time:</span> {revisionDate ? new Date(revisionDate).toLocaleTimeString() : new Date(recommendation.updatedAt || recommendation.createdAt).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#78716C]">
                <User size={16} className="text-red-500" />
                <span className="font-semibold text-[#292524]">Trainer:</span> {revisionTrainer}
              </div>
            </div>
            {revisionReason && (
              <div>
                <span className="block text-sm font-bold text-red-700 mb-2">Reason for Revision:</span>
                <div className="text-red-900 whitespace-pre-wrap">{revisionReason}</div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── REPLY TO TRAINER & CHAT SECTION ────────────────────────── */}
      {hasFeedbackOrChat && (
        <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#292524] mb-1 flex items-center gap-2">
            <MessageSquare size={20} className="text-[#FED7AA]" /> Chat &amp; Feedback Discussion
          </h2>
          <p className="text-sm text-[#78716C] mb-4">
            {alreadyReplied
              ? 'You can send additional replies or messages to your trainer below.'
              : 'Send a reply or message to your trainer regarding their feedback.'}
          </p>

          {/* Show chat history if any */}
          {recommendation.chatMessages && recommendation.chatMessages.length > 0 ? (
            <div className="space-y-3 mb-5 max-h-72 overflow-y-auto pr-1">
              {recommendation.chatMessages.map((msg: any, idx: number) => (
                <div
                  key={idx}
                  className={`p-4 rounded-xl border ${
                    msg.senderRole === 'MEMBER'
                      ? 'bg-[#F0F7F6] border-[#FED7AA]/40 mr-6'
                      : 'bg-blue-50 border-blue-200 ml-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className={msg.senderRole === 'MEMBER' ? 'text-[#F97316]' : 'text-blue-900'}>
                      {msg.senderRole === 'MEMBER' ? '👤 You (Member)' : `💬 Trainer (${msg.senderName || 'Assigned Trainer'})`}
                    </span>
                    <span className="text-[#78716C] font-normal">{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-sm text-[#334155] whitespace-pre-wrap font-medium">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              {alreadyReplied && (
                <div className="bg-[#F0F7F6] border border-[#FED7AA]/40 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={15} className="text-[#F97316]" />
                    <span className="text-xs font-bold text-[#F97316] uppercase tracking-wider">Your Reply</span>
                    <span className="text-xs text-[#78716C] ml-auto">{new Date(recommendation.memberReply.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#78716C] whitespace-pre-wrap">{recommendation.memberReply.message}</p>
                </div>
              )}
              {recommendation.trainerReply?.message && (
                <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={15} className="text-blue-700" />
                    <span className="text-xs font-bold text-blue-900 uppercase tracking-wider">Trainer's Reply</span>
                    <span className="text-xs text-[#78716C] ml-auto">{new Date(recommendation.trainerReply.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#334155] whitespace-pre-wrap">{recommendation.trainerReply.message}</p>
                </div>
              )}
            </>
          )}

          {/* Reply Textarea */}
          <div className="space-y-3">
            <textarea
              rows={4}
              value={replyText}
              onChange={e => { setReplyText(e.target.value); setReplySuccess(false); setReplyError(''); }}
              placeholder="Type your reply to the trainer here... e.g. 'That works for me, please proceed with the changes.'"
              className="w-full px-4 py-3 rounded-xl border border-[#E7E5E4] focus:outline-none focus:border-[#F97316] focus:ring-1 focus:ring-[#F97316]/20 text-sm text-[#292524] resize-none placeholder:text-[#78716C] transition-all"
            />

            {replyError && (
              <p className="text-sm text-red-600 flex items-center gap-1.5">
                <AlertCircle size={14} /> {replyError}
              </p>
            )}

            {replySuccess && (
              <p className="text-sm text-green-700 flex items-center gap-1.5 font-semibold">
                <CheckCircle2 size={14} /> Reply sent successfully to your trainer!
              </p>
            )}

            <button
              onClick={sendReply}
              disabled={replySending || !replyText.trim()}
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#F97316] to-[#EA580C] text-white font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-orange-200 text-sm"
            >
              {replySending
                ? <><RefreshCw size={16} className="animate-spin" /> Sending...</>
                : <><Send size={16} /> {alreadyReplied ? 'Send Additional Reply' : 'Send Reply to Trainer'}</>}
            </button>
          </div>
        </div>
      )}

      {/* Awaiting Trainer Review (Only when pending & no feedback/chat) */}
      {isPending && !hasFeedbackOrChat && (
        <div className="bg-[#FFFDF8] border border-[#FED7AA] rounded-2xl p-8 text-center shadow-sm">
          <Bot size={48} className="mx-auto text-[#78716C] mb-4" />
          <h3 className="text-lg font-bold text-[#78716C] mb-2">Awaiting Trainer Feedback</h3>
          <p className="text-[#78716C] max-w-md mx-auto">Your trainer hasn't left any notes yet. Once they review your AI plan and leave feedback, it will appear here.</p>
        </div>
      )}

      {isApproved && !hasFeedbackOrChat && (
        <div className="bg-[#F0FDF4] border border-[#DCFCE7] rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-[#86EFAC] mb-4" />
          <h3 className="text-lg font-bold text-[#166534] mb-2">Plan Approved</h3>
          <p className="text-[#15803D] max-w-md mx-auto">Your trainer has reviewed and approved your plan. You can view your routine in the Workout and Diet sections.</p>
        </div>
      )}

      {/* Previous Version Notes */}
      {history.length > 0 && history[0].trainerNotes && (
        <div className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#475569] mb-4 flex items-center"><Clock className="mr-2" size={18} /> Previous Trainer Notes (Version {history[0].version})</h2>
          <div className="bg-white/50 border border-[#E2E8F0] rounded-xl p-4 text-[#475569] min-h-[80px] whitespace-pre-wrap font-medium">
            {history[0].trainerNotes}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTrainerReview;
