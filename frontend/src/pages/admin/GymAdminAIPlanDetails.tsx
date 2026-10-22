import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { 
  Bot, ArrowLeft, CheckCircle2, User, AlertCircle, 
  Clock, FileEdit, Layers, ShieldCheck, Award
} from 'lucide-react';
import api from '../../utils/api';

const GymAdminAIPlanDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'diff' | 'original' | 'modifications' | 'final'>('diff');

  useEffect(() => {
    fetchDetails();
  }, [id]);

  const fetchDetails = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/ai/admin/recommendation/${id}`);
      setRecommendation(res.data.recommendation);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="text-center py-24 text-[#697778]">
        <div className="w-10 h-10 border-4 border-[#167D78] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
        <p className="font-semibold text-sm">Loading audit and version tracking details...</p>
      </div>
    );
  }

  if (!recommendation) {
    return (
      <div className="text-center py-20 text-red-600">
        <AlertCircle size={40} className="mx-auto mb-2" />
        <h2 className="text-xl font-bold">Plan Not Found</h2>
        <button onClick={() => navigate('/admin/ai-plans')} className="mt-4 px-6 py-2 bg-[#167D78] text-white rounded-xl text-xs font-bold">
          Back to Plans Monitor
        </button>
      </div>
    );
  }

  const customer = recommendation.customerId || {};
  const trainer = recommendation.trainerId || {};
  const profile = recommendation.fitnessProfile || {};
  const measurements = profile.bodyMeasurements || {};
  const originalAi = recommendation.originalAiDraft || {};
  const modifications = recommendation.trainerModifications || {};
  const finalPlan = recommendation.finalApprovedPlan || {};

  const isApproved = recommendation.status === 'Trainer Approved' || recommendation.status === 'Published to Customer';
  const hasModifications = modifications.hasModifications;

  // Workflow Status Steps (Requirement 8)
  const workflowSteps = [
    { label: 'AI Generated', desc: 'Customer submitted assessment' },
    { label: 'Pending Trainer Review', desc: 'Draft routed to coach' },
    { label: 'Under Trainer Review', desc: 'Coach opened draft' },
    { label: hasModifications ? 'Trainer Edited' : 'Trainer Verified', desc: hasModifications ? 'Modifications applied' : 'AI Draft confirmed' },
    { label: 'Trainer Approved', desc: 'Approved as official plan' },
    { label: 'Published to Customer', desc: 'Live in My Fitness Plan' },
  ];

  // Helper to determine step status
  const getStepState = (stepLabel: string) => {
    const current = recommendation.status;
    if (current === 'Published to Customer' || current === 'Trainer Approved') {
      return 'completed';
    }
    if (current === 'Trainer Edited' && (stepLabel === 'AI Generated' || stepLabel === 'Pending Trainer Review' || stepLabel === 'Under Trainer Review' || stepLabel === 'Trainer Edited')) {
      return 'completed';
    }
    if (current === 'Under Trainer Review' && (stepLabel === 'AI Generated' || stepLabel === 'Pending Trainer Review' || stepLabel === 'Under Trainer Review')) {
      return 'completed';
    }
    if (current === 'Pending Trainer Review' && (stepLabel === 'AI Generated' || stepLabel === 'Pending Trainer Review')) {
      return 'completed';
    }
    if (current === 'AI Generated' && stepLabel === 'AI Generated') {
      return 'completed';
    }
    return 'pending';
  };

  return (
    <div className="max-w-7xl mx-auto space-y-8 pb-16">
      {/* Top Back Navigation */}
      <button 
        onClick={() => navigate('/admin/ai-plans')}
        className="flex items-center text-xs font-bold text-[#697778] hover:text-[#167D78] transition-colors"
      >
        <ArrowLeft className="mr-1.5" size={16} /> Back to Plans Monitor
      </button>

      {/* Main Header */}
      <div className="bg-white border border-[#D9E2E3] rounded-3xl p-6 md:p-8 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div className="flex items-center gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#167D78] to-teal-700 rounded-2xl flex items-center justify-center text-white font-black text-xl shadow-md">
            {customer.firstName?.[0] || 'C'}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <span className="px-3 py-0.5 rounded-full text-xs font-extrabold bg-[#167D78]/10 text-[#167D78]">
                Version {recommendation.version || 1} Audit Trail
              </span>
              <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${
                isApproved 
                  ? 'bg-emerald-100 text-emerald-800 border-emerald-300' 
                  : 'bg-amber-100 text-amber-800 border-amber-300'
              }`}>
                {recommendation.status}
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-[#344B4A] tracking-tight">
              {customer.firstName} {customer.lastName}&apos;s Fitness Workflow
            </h1>
            <p className="text-xs text-[#697778] mt-0.5">
              Target: <strong className="text-[#167D78]">{profile.fitnessGoal}</strong> • Assigned Coach: <strong className="text-[#344B4A]">{trainer.name || 'Unassigned'}</strong>
            </p>
          </div>
        </div>

        <div className="text-right text-xs text-[#697778] bg-[#E8EFF0] p-3 rounded-2xl border border-[#D8EAE7]">
          <p>Assigned Date: <strong>{new Date(recommendation.createdAt).toLocaleDateString()}</strong></p>
          <p className="mt-0.5">Last Review Update: <strong>{new Date(recommendation.updatedAt).toLocaleDateString()}</strong></p>
        </div>
      </div>

      {/* WORKFLOW STATUS TIMELINE (Requirement 8) */}
      <div className="bg-white border border-[#D9E2E3] rounded-3xl p-6 shadow-sm">
        <div className="flex items-center gap-2 mb-4">
          <Clock size={18} className="text-[#167D78]" />
          <h2 className="text-sm font-extrabold uppercase tracking-wider text-[#344B4A]">
            Workflow Progression (Status Timeline)
          </h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {workflowSteps.map((step, idx) => {
            const state = getStepState(step.label);
            const isCompleted = state === 'completed';

            return (
              <div 
                key={idx} 
                className={`p-3.5 rounded-2xl border text-center transition-all ${
                  isCompleted 
                    ? 'bg-emerald-50/60 border-emerald-200 text-emerald-950' 
                    : 'bg-[#E8EFF0] border-[#D8EAE7] text-[#697778]'
                }`}
              >
                <div className={`w-6 h-6 rounded-full mx-auto mb-2 flex items-center justify-center text-[10px] font-bold ${
                  isCompleted ? 'bg-emerald-600 text-white' : 'bg-[#D8EAE7] text-[#697778]'
                }`}>
                  {isCompleted ? <CheckCircle2 size={14} /> : idx + 1}
                </div>
                <h4 className="font-extrabold text-xs">{step.label}</h4>
                <p className="text-[10px] mt-0.5 opacity-80">{step.desc}</p>
              </div>
            );
          })}
        </div>
      </div>

      {/* CUSTOMER & TRAINER DETAILS OVERVIEW */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Customer Biometrics */}
        <div className="md:col-span-2 bg-white border border-[#D9E2E3] rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-[#D8EAE7] pb-3">
            <User size={18} className="text-[#167D78]" />
            <h3 className="font-bold text-sm text-[#344B4A]">Customer Assessment Biometrics</h3>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs text-center">
            <div className="p-2.5 bg-[#E8EFF0] rounded-xl border border-[#D8EAE7]">
              <span className="text-[#697778] uppercase text-[10px] font-bold block">Age / Gender</span>
              <strong>{profile.age || '-'} yrs • {profile.gender}</strong>
            </div>
            <div className="p-2.5 bg-[#E8EFF0] rounded-xl border border-[#D8EAE7]">
              <span className="text-[#697778] uppercase text-[10px] font-bold block">Height / Weight</span>
              <strong>{profile.height || '-'} cm / {profile.weight || '-'} kg</strong>
            </div>
            <div className="p-2.5 bg-[#E8EFF0] rounded-xl border border-[#D8EAE7]">
              <span className="text-[#697778] uppercase text-[10px] font-bold block">Level</span>
              <strong>{profile.currentFitnessLevel || profile.experienceLevel || 'Beginner'}</strong>
            </div>
            <div className="p-2.5 bg-[#E8EFF0] rounded-xl border border-[#D8EAE7]">
              <span className="text-[#697778] uppercase text-[10px] font-bold block">Workout Days</span>
              <strong>{profile.availableWorkoutDays || '4 Days'}</strong>
            </div>
          </div>

          {measurements && Object.keys(measurements).length > 0 && (
            <div className="p-3 bg-[#E8EFF0] rounded-xl text-xs flex flex-wrap items-center gap-3">
              <span className="text-[11px] font-bold text-[#697778] uppercase">Measurements:</span>
              {Object.entries(measurements).map(([k, v]: any) => (
                <span key={k} className="bg-white px-2 py-0.5 rounded border border-[#D8EAE7]">
                  {k}: <strong>{v}</strong>
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Assigned Trainer Information */}
        <div className="bg-white border border-[#D9E2E3] rounded-3xl p-6 shadow-sm space-y-3">
          <div className="flex items-center gap-2 border-b border-[#D8EAE7] pb-3">
            <ShieldCheck size={18} className="text-[#167D78]" />
            <h3 className="font-bold text-sm text-[#344B4A]">Assigned Trainer Information</h3>
          </div>

          {trainer.name ? (
            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-[#167D78]/10 text-[#167D78] flex items-center justify-center font-bold">
                  {trainer.name[0]}
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-[#344B4A]">{trainer.name}</h4>
                  <p className="text-[11px] text-[#697778]">{trainer.specialization || 'Certified Trainer'}</p>
                </div>
              </div>

              <div className="pt-2 flex items-center justify-between border-t border-[#D8EAE7]">
                <span className="text-[#697778]">Availability Status:</span>
                <span className="font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-200">
                  {trainer.availabilityStatus || 'Online'}
                </span>
              </div>
            </div>
          ) : (
            <p className="text-xs text-[#697778] italic py-4">No trainer currently assigned.</p>
          )}
        </div>
      </div>

      {/* AUDIT & VERSION TRACKING HUB (Requirement 7 & 9) */}
      <div className="bg-white border border-[#D9E2E3] rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#D8EAE7] pb-4">
          <div className="flex items-center gap-2">
            <Layers size={20} className="text-[#167D78]" />
            <div>
              <h2 className="text-xl font-bold text-[#344B4A]">
                Audit &amp; Version Tracking: AI Baseline vs Trainer Modifications
              </h2>
              <p className="text-xs text-[#697778]">
                Compares the original AI draft suggestions against trainer changes and the final published plan.
              </p>
            </div>
          </div>

          {/* Tab Controls */}
          <div className="flex items-center gap-1.5 bg-[#E8EFF0] border border-[#D8EAE7] p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('diff')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'diff' ? 'bg-[#167D78] text-white shadow-sm' : 'text-[#697778] hover:text-[#167D78]'
              }`}
            >
              Side-by-Side Diff
            </button>
            <button
              onClick={() => setActiveTab('original')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'original' ? 'bg-[#167D78] text-white shadow-sm' : 'text-[#697778] hover:text-[#167D78]'
              }`}
            >
              Original AI Output
            </button>
            <button
              onClick={() => setActiveTab('modifications')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'modifications' ? 'bg-[#167D78] text-white shadow-sm' : 'text-[#697778] hover:text-[#167D78]'
              }`}
            >
              Trainer Changes
            </button>
            <button
              onClick={() => setActiveTab('final')}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
                activeTab === 'final' ? 'bg-[#167D78] text-white shadow-sm' : 'text-[#697778] hover:text-[#167D78]'
              }`}
            >
              Final Approved Plan
            </button>
          </div>
        </div>

        {/* Tab 1: Side-by-Side Audit Diff View */}
        {activeTab === 'diff' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Column 1: Original AI Draft */}
            <div className="space-y-4 border border-[#D8EAE7] rounded-2xl p-4 bg-[#E8EFF0]">
              <div className="flex items-center justify-between border-b border-[#D8EAE7] pb-2">
                <span className="text-xs font-extrabold uppercase text-blue-900 flex items-center gap-1.5">
                  <Bot size={15} /> 1. Original AI Suggestions
                </span>
                <span className="text-[10px] text-[#697778] font-bold">Unmodified</span>
              </div>

              <div className="space-y-2.5 text-xs">
                <p className="font-bold text-[#344B4A] mb-1">AI Exercises Suggested:</p>
                {originalAi.workoutRecommendation?.exercises?.map((ex: any, idx: number) => (
                  <div key={idx} className="p-2.5 bg-white border border-[#D8EAE7] rounded-xl">
                    <p className="font-bold text-[#344B4A]">{ex.name}</p>
                    <p className="text-[11px] text-[#697778]">
                      {ex.sets} Sets × {ex.reps} Reps • {ex.duration}
                    </p>
                  </div>
                ))}
              </div>

              <div className="pt-2 border-t border-[#D8EAE7] text-xs">
                <p className="font-bold text-[#344B4A] mb-1">AI Diet Guidelines:</p>
                <p className="text-[#697778] line-clamp-3">{originalAi.dietRecommendation?.lunch}</p>
              </div>
            </div>

            {/* Column 2: Trainer Modifications & Changes */}
            <div className="space-y-4 border border-[#D9E2E3] rounded-2xl p-4 bg-[#E8EFF0]/20">
              <div className="flex items-center justify-between border-b border-[#D9E2E3] pb-2">
                <span className="text-xs font-extrabold uppercase text-[#344B4A] flex items-center gap-1.5">
                  <FileEdit size={15} /> 2. Trainer Modifications
                </span>
                <span className="text-[10px] font-bold text-[#167D78]">
                  {modifications.workoutModifications?.length || 0} change(s)
                </span>
              </div>

              {hasModifications ? (
                <div className="space-y-2.5 text-xs">
                  <p className="font-bold text-[#344B4A] mb-1">Adjustments Made by Coach:</p>
                  {modifications.workoutModifications?.map((mod: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white border border-[#D9E2E3] rounded-xl text-[#344B4A]">
                      <span className="text-[10px] font-extrabold uppercase px-1.5 py-0.5 rounded bg-[#D8EAE7] text-[#116660] mr-1.5">
                        {mod.changeType}
                      </span>
                      <strong className="block mt-0.5">{mod.exerciseName}</strong>
                      <p className="text-[11px] text-[#697778] mt-0.5">{mod.details}</p>
                    </div>
                  ))}

                  {modifications.trainerNotes && (
                    <div className="mt-3 p-2.5 bg-white border border-[#D9E2E3] rounded-xl">
                      <strong className="text-[11px] block text-[#344B4A]">Trainer Note:</strong>
                      <p className="text-[11px] text-[#697778]">{modifications.trainerNotes}</p>
                    </div>
                  )}
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#697778] bg-white rounded-xl border border-dashed border-[#D9E2E3]">
                  <CheckCircle2 size={24} className="text-emerald-600 mx-auto mb-1" />
                  <p className="font-bold">No Changes Made</p>
                  <p className="text-[11px]">The trainer approved the original AI output without modifications.</p>
                </div>
              )}
            </div>

            {/* Column 3: Final Approved Customer Output */}
            <div className="space-y-4 border border-emerald-200 rounded-2xl p-4 bg-emerald-50/20">
              <div className="flex items-center justify-between border-b border-emerald-200 pb-2">
                <span className="text-xs font-extrabold uppercase text-emerald-900 flex items-center gap-1.5">
                  <Award size={15} /> 3. Final Approved Plan
                </span>
                <span className="text-[10px] font-bold text-emerald-700">Customer Facing</span>
              </div>

              {isApproved ? (
                <div className="space-y-2.5 text-xs">
                  <p className="font-bold text-emerald-950 mb-1">Final Customer Exercises:</p>
                  {(finalPlan.workoutPlan?.exercises || recommendation.workoutRecommendation?.exercises)?.map((ex: any, idx: number) => (
                    <div key={idx} className="p-2.5 bg-white border border-emerald-200 rounded-xl">
                      <p className="font-bold text-[#344B4A]">{ex.name}</p>
                      <p className="text-[11px] text-emerald-800 font-semibold">
                        {ex.sets} Sets × {ex.reps} Reps • Rest: {ex.rest || '60s'}
                      </p>
                    </div>
                  ))}

                  <div className="p-2.5 bg-white border border-emerald-200 rounded-xl mt-3">
                    <strong className="text-[11px] block text-emerald-900">Official Approval:</strong>
                    <p className="text-[10px] text-[#697778]">
                      Approved by {trainer.name || 'Assigned Coach'} on {new Date(recommendation.updatedAt).toLocaleDateString()}
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-6 text-center text-xs text-[#697778] bg-white rounded-xl border border-dashed border-emerald-200">
                  <Clock size={24} className="text-amber-500 mx-auto mb-1 animate-pulse" />
                  <p className="font-bold text-[#344B4A]">Awaiting Approval</p>
                  <p className="text-[11px]">Final customer output will be generated once trainer approves.</p>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 2: Original AI Output Detail */}
        {activeTab === 'original' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#344B4A] uppercase tracking-wider">
              Original AI Baseline Snapshot
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="p-4 bg-[#E8EFF0] border border-[#D8EAE7] rounded-2xl">
                <strong className="block text-[#167D78] mb-1">AI Assessment Summary:</strong>
                <p className="text-[#344B4A]">{originalAi.aiAnalysis?.assessment}</p>
              </div>
              <div className="p-4 bg-[#E8EFF0] border border-[#D8EAE7] rounded-2xl">
                <strong className="block text-[#167D78] mb-1">Original Goal Analysis:</strong>
                <p className="text-[#344B4A]">{originalAi.aiAnalysis?.goalAnalysis}</p>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: Trainer Modifications Detail */}
        {activeTab === 'modifications' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#344B4A] uppercase tracking-wider">
              Trainer Modifications Audit Trail
            </h3>
            {hasModifications ? (
              <div className="space-y-3">
                {modifications.workoutModifications?.map((mod: any, idx: number) => (
                  <div key={idx} className="p-3 bg-[#E8EFF0]/50 border border-[#D9E2E3] rounded-xl text-xs">
                    <span className="font-extrabold uppercase text-[#344B4A] mr-2">[{mod.changeType}]</span>
                    <strong>{mod.exerciseName}:</strong> {mod.details}
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-xs text-[#697778]">No modifications made to the original AI draft.</p>
            )}
          </div>
        )}

        {/* Tab 4: Final Plan Detail */}
        {activeTab === 'final' && (
          <div className="space-y-4">
            <h3 className="text-sm font-bold text-[#344B4A] uppercase tracking-wider">
              Official Customer Plan Output
            </h3>
            <div className="p-4 bg-emerald-50/40 border border-emerald-200 rounded-2xl text-xs space-y-2">
              <p><strong>Status:</strong> {recommendation.status}</p>
              <p><strong>Approved By:</strong> {trainer.name || 'Trainer'}</p>
              <p><strong>Approved Date:</strong> {new Date(recommendation.updatedAt).toLocaleDateString()}</p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymAdminAIPlanDetails;
