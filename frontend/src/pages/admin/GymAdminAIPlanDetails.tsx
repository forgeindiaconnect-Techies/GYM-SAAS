import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Bot, ArrowLeft, CheckCircle2, History, User, AlertCircle, ClipboardList, Target } from 'lucide-react';
import api from '../../utils/api';

const GymAdminAIPlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      const res = await api.get(`/ai/admin/recommendation/${id}`);
      setRecommendation(res.data.recommendation);
      setHistory(res.data.history);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="text-center py-20 text-[#687B78]">Loading plan details...</div>;
  if (!recommendation) return <div className="text-center py-20 text-[#EF4444]">Plan not found.</div>;

  const customer = recommendation.customerId || {};
  const profile = recommendation.fitnessProfile || {};
  const isFinal = recommendation.status === 'Trainer Approved';

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <button 
        onClick={() => navigate('/admin/ai-plans')}
        className="flex items-center text-[#687B78] hover:text-[#164A4A] transition-colors mb-4"
      >
        <ArrowLeft className="mr-2" size={20} /> Back to Plans
      </button>

      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">{customer.firstName} {customer.lastName}'s Fitness Plan</h1>
          <p className="text-[#687B78]">Version {recommendation.version} - Last updated {new Date(recommendation.updatedAt).toLocaleDateString()}</p>
        </div>
        <div className={`px-4 py-2 rounded-full text-sm font-bold border flex items-center gap-2 ${
          isFinal ? 'bg-[#F1F5F3] border-[#D3DFDA] text-[#0F766E]' 
          : recommendation.status === 'Revision Requested' ? 'bg-[#FFFBEB] border-[#FEF3C7] text-[#B45309]'
          : 'bg-[#EFF6FF] border-[#BFDBFE] text-[#1D4ED8]'
        }`}>
          {isFinal ? <CheckCircle2 size={18} /> : <Bot size={18} />}
          {recommendation.status}
        </div>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        {/* Left Column: Customer Details & Progress */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E5DA] rounded-3xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#202828] mb-4 flex items-center gap-2"><User size={20} className="text-[#164A4A]" /> Customer Profile</h2>
            <div className="space-y-4 text-sm">
              <div className="flex justify-between border-b border-[#E8E5DA] pb-2">
                <span className="text-[#687B78]">Age</span>
                <span className="font-bold text-[#202828]">{profile.age || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E5DA] pb-2">
                <span className="text-[#687B78]">Gender</span>
                <span className="font-bold text-[#202828] capitalize">{profile.gender || 'N/A'}</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E5DA] pb-2">
                <span className="text-[#687B78]">Initial Weight</span>
                <span className="font-bold text-[#202828]">{profile.weight} kg</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E5DA] pb-2">
                <span className="text-[#687B78]">Target Weight</span>
                <span className="font-bold text-[#164A4A]">{profile.targetWeight || 'N/A'} kg</span>
              </div>
              <div className="flex justify-between border-b border-[#E8E5DA] pb-2">
                <span className="text-[#687B78]">Goal</span>
                <span className="font-bold text-[#202828] capitalize">{profile.fitnessGoal?.replace(/-/g, ' ')}</span>
              </div>
              <div className="flex justify-between pb-2">
                <span className="text-[#687B78]">Activity Level</span>
                <span className="font-bold text-[#202828] capitalize">{profile.activityLevel?.replace(/-/g, ' ')}</span>
              </div>
            </div>
          </div>

          <div className="bg-[#164A4A] border border-[#164A4A] rounded-3xl p-6 text-white shadow-sm relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full blur-2xl -mr-10 -mt-10"></div>
            <h2 className="text-xl font-bold mb-4 relative z-10 flex items-center gap-2"><Target size={20} className="text-[#D2B48C]" /> Progress Snapshot</h2>
            <div className="relative z-10 space-y-4">
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#D3DFDA]">Weight Progress</span>
                  <span className="font-bold">-4.5 kg</span>
                </div>
                <div className="w-full bg-white/20 rounded-full h-2">
                  <div className="bg-[#D2B48C] h-2 rounded-full" style={{ width: '45%' }}></div>
                </div>
              </div>
              <div>
                <div className="flex justify-between text-sm mb-1">
                  <span className="text-[#D3DFDA]">Current Plan</span>
                  <span className="font-bold">Version {recommendation.version}</span>
                </div>
              </div>
            </div>
          </div>
          
          {history.length > 0 && (
            <div className="bg-white border border-[#E8E5DA] rounded-3xl p-6 shadow-sm">
              <h2 className="text-xl font-bold text-[#202828] mb-4 flex items-center gap-2"><History size={20} className="text-[#164A4A]" /> Version History</h2>
              <div className="space-y-4 relative before:absolute before:inset-0 before:ml-2.5 before:-translate-x-px md:before:mx-auto md:before:translate-x-0 before:h-full before:w-0.5 before:bg-gradient-to-b before:from-transparent before:via-[#E8E5DA] before:to-transparent">
                {/* Current Version */}
                <div className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group is-active">
                  <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#164A4A] text-white shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10">
                    <CheckCircle2 size={12} />
                  </div>
                  <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-[#164A4A]/20 bg-[#F2EFE8] shadow-sm">
                    <div className="font-bold text-[#202828] text-sm mb-1">V{recommendation.version} (Current)</div>
                    <div className="text-xs text-[#687B78]">{new Date(recommendation.updatedAt).toLocaleDateString()}</div>
                  </div>
                </div>
                
                {history.map((h, i) => (
                  <div key={i} className="relative flex items-center justify-between md:justify-normal md:odd:flex-row-reverse group">
                    <div className="flex items-center justify-center w-6 h-6 rounded-full border-2 border-white bg-[#E8E5DA] text-[#687B78] shadow shrink-0 md:order-1 md:group-odd:-translate-x-1/2 md:group-even:translate-x-1/2 z-10"></div>
                    <div className="w-[calc(100%-2.5rem)] md:w-[calc(50%-1.5rem)] p-3 rounded-xl border border-[#E8E5DA] bg-white shadow-sm">
                      <div className="font-bold text-[#202828] text-sm mb-1">V{h.version}</div>
                      <div className="text-xs text-[#687B78]">{new Date(h.createdAt).toLocaleDateString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Column: AI Draft & Trainer Review */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E8E5DA] rounded-3xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4 border-b border-[#E8E5DA] pb-4">
              <h2 className="text-xl font-bold text-[#202828] flex items-center gap-2">
                <Bot size={24} className="text-[#1D4ED8]" /> 
                AI-Generated Draft
              </h2>
              <span className="text-xs font-bold px-2 py-1 bg-gray-100 text-gray-500 rounded uppercase tracking-wider">Read Only</span>
            </div>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-bold text-[#687B78] uppercase tracking-wider mb-2">AI Assessment</h3>
                <p className="text-[#455250] bg-[#F9F8F6] p-4 rounded-xl text-sm leading-relaxed border border-[#E8E5DA]">
                  {recommendation.aiAnalysis?.assessment || 'No assessment generated.'}
                </p>
              </div>

              <div>
                <h3 className="text-sm font-bold text-[#687B78] uppercase tracking-wider mb-2">Initial Weekly Schedule</h3>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  {recommendation.workoutRecommendation?.weeklySchedule?.map((day: any, i: number) => (
                    <div key={i} className="bg-[#F2EFE8] p-3 rounded-lg border border-[#E8E5DA] text-center">
                      <div className="text-xs font-bold text-[#687B78] mb-1">{day.day}</div>
                      <div className="text-sm font-bold text-[#202828]">{day.workout}</div>
                    </div>
                  ))}
                </div>
              </div>

              {recommendation.workoutRecommendation?.exercises?.length > 0 && (
                <div>
                  <h3 className="text-sm font-bold text-[#687B78] uppercase tracking-wider mb-4">Initial Exercises</h3>
                  <div className="space-y-3">
                    {recommendation.workoutRecommendation.exercises.map((ex: any, idx: number) => (
                      <div key={idx} className="bg-[#F9F8F6] border border-[#E8E5DA] p-4 rounded-xl flex items-center justify-between">
                        <div>
                          <div className="font-bold text-[#202828]">{ex.name}</div>
                          <div className="text-xs text-[#687B78] uppercase tracking-wider mt-1">{ex.targetMuscleGroup}</div>
                        </div>
                        <div className="text-right">
                          <div className="font-bold text-[#164A4A]">{ex.sets} Sets × {ex.reps}</div>
                          <div className="text-xs text-[#687B78] uppercase mt-1">Rest: {ex.rest}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {recommendation.dietRecommendation && (
                <div>
                  <h3 className="text-sm font-bold text-[#687B78] uppercase tracking-wider mb-4">Initial Diet Recommendation</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {['morning', 'breakfast', 'lunch', 'evening', 'dinner'].map((meal) => (
                       <div key={meal} className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-lg p-3">
                          <label className="text-xs text-[#687B78] font-bold uppercase block mb-1">{meal}</label>
                          <div className="text-sm font-medium text-[#202828]">
                            {(recommendation.dietRecommendation as any)[meal] || 'Not specified'}
                          </div>
                       </div>
                    ))}
                  </div>
                  {recommendation.dietRecommendation.note && (
                    <p className="text-xs text-[#687B78] mt-3 italic bg-white p-3 rounded-lg border border-[#E8E5DA]">
                      Note: {recommendation.dietRecommendation.note}
                    </p>
                  )}
                </div>
              )}
            </div>
          </div>

          <div className={`${isFinal ? 'bg-green-50 border-green-200' : 'bg-[#FFFBEB] border-[#FEF3C7]'} border rounded-3xl p-6 shadow-sm transition-colors`}>
            <div className={`flex items-center justify-between mb-4 border-b pb-4 ${isFinal ? 'border-green-100' : 'border-[#FEF3C7]'}`}>
              <h2 className={`text-xl font-bold flex items-center gap-2 ${isFinal ? 'text-green-800' : 'text-[#B45309]'}`}>
                {isFinal ? <CheckCircle2 size={24} className="text-green-600" /> : <AlertCircle size={24} className="text-[#B45309]" />}
                Trainer Review & Final Plan
              </h2>
              <span className={`text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider ${isFinal ? 'bg-green-200 text-green-900' : 'bg-orange-200 text-orange-900'}`}>
                {isFinal ? 'Approved' : 'Pending Action'}
              </span>
            </div>

            <div className="space-y-4">
              <div>
                <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Trainer Assigned</h3>
                <div className="font-bold text-lg text-gray-900">
                  {recommendation.trainerId?.name || 'Unassigned'}
                </div>
              </div>

              {recommendation.trainerNotes && (
                <div>
                  <h3 className="text-sm font-bold text-gray-500 uppercase tracking-wider mb-2">Trainer Notes & Adjustments</h3>
                  <div className="bg-white/60 p-4 rounded-xl text-sm leading-relaxed border border-black/5 font-medium text-gray-800">
                    {recommendation.trainerNotes}
                  </div>
                </div>
              )}

              {recommendation.revisionDetails && recommendation.status === 'Revision Requested' && (
                <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                  <h3 className="text-sm font-bold text-red-800 uppercase tracking-wider mb-2 flex items-center gap-2">
                    <AlertCircle size={16} /> Revision Reason
                  </h3>
                  <p className="text-red-900 text-sm">
                    {recommendation.revisionDetails.reason}
                  </p>
                </div>
              )}

              {isFinal && (
                <div className="pt-4 mt-4 border-t border-green-200/50">
                  <h3 className="text-sm font-bold text-green-800 uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ClipboardList size={18} /> Final Approved Routine Snapshot
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    <div className="bg-white/60 p-3 rounded-lg border border-green-100">
                      <div className="text-xs text-green-600 font-bold mb-1">Morning</div>
                      <div className="text-sm font-medium text-gray-800">{recommendation.routine?.morning || 'N/A'}</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-green-100">
                      <div className="text-xs text-green-600 font-bold mb-1">Workout</div>
                      <div className="text-sm font-medium text-gray-800">{recommendation.routine?.workoutTime || 'N/A'}</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-green-100">
                      <div className="text-xs text-green-600 font-bold mb-1">Evening</div>
                      <div className="text-sm font-medium text-gray-800">{recommendation.routine?.evening || 'N/A'}</div>
                    </div>
                    <div className="bg-white/60 p-3 rounded-lg border border-green-100">
                      <div className="text-xs text-green-600 font-bold mb-1">Night</div>
                      <div className="text-sm font-medium text-gray-800">{recommendation.routine?.night || 'N/A'}</div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminAIPlanDetails;
