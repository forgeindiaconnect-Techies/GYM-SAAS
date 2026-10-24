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
      await api.post('/ai/member/reply', {
        message: replyText.trim(),
        recommendationId: recommendation?._id
      });
      setReplySuccess(true);
      setReplyText('');
      fetchRecommendation(); // refresh to show saved reply
    } catch (err: any) {
      setReplyError(err.response?.data?.message || err.response?.data?.error || 'Failed to send reply.');
    } finally {
      setReplySending(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-[#9AAEAE]">Loading trainer feedback...</div>;
  if (!recommendation) return <div className="text-center py-20 text-[#C43D35]">No AI Plan found.</div>;

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
        <h1 className="text-2xl sm:text-3xl font-bold text-[#F5FAFA] tracking-tight">Trainer Review &amp; Feedback</h1>
        <div className={`px-3.5 py-1.5 rounded-full text-xs font-bold border flex items-center gap-2 ${
          isApproved ? 'bg-[#2DD4BF]/15 border-[#2DD4BF]/30 text-[#2DD4BF]'
          : isRevisionRequested ? 'bg-amber-500/15 border-amber-500/30 text-amber-400'
          : 'bg-sky-500/15 border-sky-500/30 text-sky-400'
        }`}>
          {isApproved ? <CheckCircle2 size={14} />
           : isRevisionRequested ? <RefreshCw size={14} />
           : <Bot size={14} />}
          {recommendation.status} (Version {recommendation.version})
        </div>
      </div>

      {/* Plan Status Banner */}
      <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-80 h-80 bg-[radial-gradient(circle,_rgba(45,212,191,0.12)_0%,_transparent_70%)] pointer-events-none -mr-16 -mt-16" />
        <div className="relative z-10 flex flex-col md:flex-row gap-6 items-center md:items-start justify-between">
          <div className="flex-1">
            <h2 className="text-2xl font-bold mb-2 flex items-center gap-2 text-[#F5FAFA]">
              <FileText size={24} className="text-[#2DD4BF]" /> Plan Status
            </h2>
            <p className="text-[#C1D0D0] text-sm sm:text-base leading-relaxed">
              {isApproved
                ? "Your trainer has reviewed and approved your AI-generated plan. You are good to go!"
                : isRevisionRequested
                ? "Your trainer has requested some revisions to your plan. Please check the feedback below and reply."
                : "Your AI plan is currently pending review by your trainer. They may leave feedback or adjust your routine soon."}
            </p>
          </div>
          {recommendation.trainerId && (
            <div className="bg-[#0E1415] p-4 rounded-xl text-center min-w-[200px] border border-[#2A3A3A] shadow-inner">
              <div className="text-xs text-[#9AAEAE] uppercase tracking-wider mb-1 font-bold">Reviewed By</div>
              <div className="font-bold text-lg text-[#F5FAFA]">{recommendation.trainerId.name || 'Your Assigned Trainer'}</div>
            </div>
          )}
        </div>
      </div>

      {/* Trainer Notes */}
      {trainerNotes && (
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#F5FAFA] mb-4 flex items-center">
            <AlertCircle className="mr-2 text-[#2DD4BF]" size={20} /> Professional Trainer Notes
          </h2>
          <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-xl p-4 text-[#F5FAFA] min-h-[80px] whitespace-pre-wrap font-medium leading-relaxed">
            {trainerNotes}
          </div>
        </div>
      )}

      {/* Revision Request Details */}
      {(isRevisionRequested || revisionReason) && (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-red-700 mb-4 flex items-center"><RefreshCw className="mr-2" size={20} /> Revision Request Details</h2>
          <div className="bg-[#141D1E] border border-red-100 rounded-xl p-6 space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pb-4 border-b border-red-100">
              <div className="flex items-center gap-3 text-sm text-[#9AAEAE]">
                <Calendar size={16} className="text-red-500" />
                <span className="font-semibold text-[#F5FAFA]">Date:</span> {revisionDate ? new Date(revisionDate).toLocaleDateString() : new Date(recommendation.updatedAt || recommendation.createdAt).toLocaleDateString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#9AAEAE]">
                <Clock size={16} className="text-red-500" />
                <span className="font-semibold text-[#F5FAFA]">Time:</span> {revisionDate ? new Date(revisionDate).toLocaleTimeString() : new Date(recommendation.updatedAt || recommendation.createdAt).toLocaleTimeString()}
              </div>
              <div className="flex items-center gap-3 text-sm text-[#9AAEAE]">
                <User size={16} className="text-red-500" />
                <span className="font-semibold text-[#F5FAFA]">Trainer:</span> {revisionTrainer}
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
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-6 shadow-sm">
          <h2 className="text-xl font-bold text-[#F5FAFA] mb-1 flex items-center gap-2">
            <MessageSquare size={20} className="text-[#2DD4BF]" /> Chat &amp; Feedback Discussion
          </h2>
          <p className="text-sm text-[#9AAEAE] mb-4">
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
                      ? 'bg-[#0E1415] border-[#1B2728]/40 mr-6'
                      : 'bg-[#1B2728] border-[#2A3A3A] ml-6'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs font-bold mb-1.5">
                    <span className={msg.senderRole === 'MEMBER' ? 'text-[#2DD4BF]' : 'text-[#2DD4BF]'}>
                      {msg.senderRole === 'MEMBER' ? '👤 You (Member)' : `💬 Trainer (${msg.senderName || 'Assigned Trainer'})`}
                    </span>
                    <span className="text-[#9AAEAE] font-normal">{msg.date ? new Date(msg.date).toLocaleString() : ''}</span>
                  </div>
                  <p className="text-sm text-[#F5FAFA] whitespace-pre-wrap font-medium">{msg.message}</p>
                </div>
              ))}
            </div>
          ) : (
            <>
              {alreadyReplied && (
                <div className="bg-[#0E1415] border border-[#1B2728]/40 rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <CheckCircle2 size={15} className="text-[#2DD4BF]" />
                    <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">Your Reply</span>
                    <span className="text-xs text-[#9AAEAE] ml-auto">{new Date(recommendation.memberReply.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#9AAEAE] whitespace-pre-wrap">{recommendation.memberReply.message}</p>
                </div>
              )}
              {recommendation.trainerReply?.message && (
                <div className="bg-[#1B2728] border border-[#2A3A3A] rounded-xl p-4 mb-4">
                  <div className="flex items-center gap-2 mb-2">
                    <MessageSquare size={15} className="text-[#2DD4BF]" />
                    <span className="text-xs font-bold text-[#2DD4BF] uppercase tracking-wider">Trainer's Reply</span>
                    <span className="text-xs text-[#9AAEAE] ml-auto">{new Date(recommendation.trainerReply.date).toLocaleString()}</span>
                  </div>
                  <p className="text-sm text-[#F5FAFA] whitespace-pre-wrap">{recommendation.trainerReply.message}</p>
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
              className="w-full px-4 py-3 rounded-xl border border-[#2A3A3A] focus:outline-none focus:border-[#2DD4BF] focus:ring-1 focus:ring-[#2DD4BF]/20 text-sm text-[#F5FAFA] resize-none placeholder:text-[#9AAEAE] transition-all"
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
              className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-[#2DD4BF] to-[#5EEAD4] text-[#06201D] font-bold font-bold rounded-xl hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed shadow-md shadow-teal-900/10 text-sm"
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
        <div className="bg-[#0E1415] border border-[#1B2728] rounded-2xl p-8 text-center shadow-sm">
          <Bot size={48} className="mx-auto text-[#9AAEAE] mb-4" />
          <h3 className="text-lg font-bold text-[#9AAEAE] mb-2">Awaiting Trainer Feedback</h3>
          <p className="text-[#9AAEAE] max-w-md mx-auto">Your trainer hasn't left any notes yet. Once they review your AI plan and leave feedback, it will appear here.</p>
        </div>
      )}

      {isApproved && !hasFeedbackOrChat && (
        <div className="bg-[#141D1E] border border-[#2A3A3A] rounded-2xl p-8 text-center shadow-sm">
          <CheckCircle2 size={48} className="mx-auto text-[#34D399] mb-4" />
          <h3 className="text-lg font-bold text-[#F5FAFA] mb-2">Plan Approved</h3>
          <p className="text-[#C1D0D0] max-w-md mx-auto text-sm">Your trainer has reviewed and approved your plan. You can view your routine in the Workout and Diet sections.</p>
        </div>
      )}

      {/* Previous Version Notes */}
      {history.length > 0 && history[0].trainerNotes && (
        <div className="bg-[#0E1415] border border-[#2A3A3A] rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-[#9AAEAE] mb-4 flex items-center"><Clock className="mr-2" size={18} /> Previous Trainer Notes (Version {history[0].version})</h2>
          <div className="bg-[#141D1E]/50 border border-[#2A3A3A] rounded-xl p-4 text-[#9AAEAE] min-h-[80px] whitespace-pre-wrap font-medium">
            {history[0].trainerNotes}
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberTrainerReview;
