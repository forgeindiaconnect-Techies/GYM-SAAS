import { useState, useEffect } from 'react';
import { Search, MessageSquare, ExternalLink, RefreshCw } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import api from '../../utils/api';

const TrainerAIFeedback = () => {
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [feedbacks, setFeedbacks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    fetchFeedbacks();
  }, []);

  const fetchFeedbacks = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/trainer/recommendations');
      if (res.data.recommendations) {
        setFeedbacks(res.data.recommendations);
      }
    } catch (err) {
      console.error('Failed to fetch AI feedback:', err);
    } finally {
      setLoading(false);
    }
  };

  const filteredFeedbacks = feedbacks.filter(f => {
    const name = f.customerId ? `${f.customerId.firstName} ${f.customerId.lastName}`.toLowerCase() : 'Unknown';
    return name.includes(search.toLowerCase()) || (f.status && f.status.toLowerCase().includes(search.toLowerCase()));
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828]">AI Feedback</h1>
          <p className="text-[#455250]">Manage and review AI-generated feedback sent to your clients.</p>
        </div>
        <button 
          onClick={fetchFeedbacks}
          className="p-2 text-[#455250] hover:bg-[#F8FAFC] rounded-lg transition-colors border border-transparent hover:border-[#D3DFDA]"
          title="Refresh"
        >
          <RefreshCw size={20} className={loading ? 'animate-spin text-[#164A4A]' : ''} />
        </button>
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-[#D3DFDA] overflow-hidden">
        <div className="p-4 border-b border-[#D3DFDA] flex gap-4 bg-[#F8FAFC]">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#455250]" size={20} />
            <input 
              type="text"
              placeholder="Search by client or type..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[#D3DFDA] focus:outline-none focus:border-[#164A4A] bg-white"
            />
          </div>
        </div>

        <div className="divide-y divide-[#D3DFDA]">
          {loading ? (
             <div className="p-12 text-center text-[#455250]">
               <RefreshCw size={48} className="mx-auto mb-4 opacity-20 animate-spin" />
               <p className="text-lg font-medium">Loading feedback...</p>
             </div>
          ) : filteredFeedbacks.length > 0 ? (
            filteredFeedbacks.map((feedback: any) => (
              <div key={feedback._id || feedback.id} className="p-6 hover:bg-[#F8FAFC] transition-colors">
                <div className="flex flex-col sm:flex-row gap-4 justify-between">
                  <div className="flex items-start gap-4">
                    <div className="w-12 h-12 rounded-xl bg-green-100 flex items-center justify-center text-green-700 shrink-0">
                      <MessageSquare size={24} />
                    </div>
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <h3 className="font-bold text-[#202828] text-lg">
                          {feedback.customerId ? `${feedback.customerId.firstName} ${feedback.customerId.lastName}` : 'Unknown'}
                        </h3>
                        <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          feedback.status === 'Trainer Approved' || feedback.status === 'Sent' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                        }`}>
                          {feedback.status}
                        </span>
                      </div>
                      <p className="text-sm font-semibold text-[#164A4A] mb-2">Fitness Plan • {new Date(feedback.createdAt || feedback.date).toLocaleDateString()}</p>
                      <p className="text-[#455250] text-sm line-clamp-2 max-w-2xl">{feedback.revisionDetails?.reason || feedback.trainerNotes || feedback.aiAnalysis?.profileSummary || feedback.aiAnalysis?.assessment || 'AI Plan generated.'}</p>
                    </div>
                  </div>
                </div>
              </div>
            ))
          ) : (
            <div className="p-12 text-center text-[#455250]">
              <MessageSquare size={48} className="mx-auto mb-4 opacity-20" />
              <p className="text-lg font-medium">No feedback records found.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TrainerAIFeedback;
