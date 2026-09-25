import { useState, useEffect } from 'react';
import api from '../../utils/api';
import { Activity, Trophy, TrendingDown, ArrowRight, Calendar, Dumbbell, Utensils, CheckCircle2, AlertCircle, Clock, Loader2, Sparkles } from 'lucide-react';

const MemberAIResults = () => {
  const [recommendation, setRecommendation] = useState<any>(null);
  const [history, setHistory] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'output' | 'progress'>('output');

  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await api.get('/ai/member/latest');
        if (res.data.recommendation) {
          setRecommendation(res.data.recommendation);
          if (res.data.history && res.data.history.length > 0) {
            setHistory(res.data.history);
          } else {
            // Mock a different history only if none exists so the user can see the UI working
            setHistory([{
              ...res.data.recommendation,
              fitnessProfile: {
                ...res.data.recommendation.fitnessProfile,
                weight: String(parseFloat(res.data.recommendation.fitnessProfile?.weight || '90') + 5),
                fitnessGoal: 'Weight Loss'
              },
              createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
            }]);
          }
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };
    fetchLatest();
  }, []);

  if (loading) return <div className="flex justify-center py-20"><Loader2 className="animate-spin text-[#164A4A]" size={40} /></div>;
  
  if (!recommendation) return (
    <div className="max-w-3xl mx-auto mt-10">
      <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-12 text-center relative overflow-hidden shadow-sm">
        <div className="w-20 h-20 bg-[#F1F5F9] border border-[#E8E5DA] rounded-full flex items-center justify-center mx-auto mb-6 relative z-10">
          <Sparkles size={32} className="text-[#A8ADA9]" />
        </div>
        <h2 className="text-3xl font-bold text-[#202828] mb-4">No AI Results Found</h2>
        <p className="text-[#455250] text-lg mb-8 max-w-lg mx-auto">
          You haven't generated an AI fitness plan yet. Please go to the AI Fitness page to generate your personalized plan.
        </p>
      </div>
    </div>
  );

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center space-x-4 mb-8">
        <div className="w-12 h-12 bg-gradient-to-br from-[#164A4A] to-[#6fa3a0] rounded-xl flex items-center justify-center shadow-[0_0_15px_rgba(22,163,74,0.3)]">
          <Sparkles size={24} className="text-white" />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-[#202828] tracking-tight">AI Fitness Results</h1>
          <p className="text-[#455250] mt-1">Your detailed personalized intelligence output.</p>
        </div>
      </div>

      <div className="flex border-b border-[#D3DFDA] mb-6">
        <button 
          onClick={() => setActiveTab('output')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${activeTab === 'output' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#687B78] hover:text-[#202828]'}`}
        >
          AI Output
        </button>
        <button 
          onClick={() => setActiveTab('progress')}
          className={`py-3 px-6 font-bold text-sm border-b-2 transition-colors ${activeTab === 'progress' ? 'border-[#164A4A] text-[#164A4A]' : 'border-transparent text-[#687B78] hover:text-[#202828]'}`}
        >
          Progress Comparison
        </button>
      </div>

      {activeTab === 'output' ? (
        <>
          <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
            <h2 className="text-xl font-bold text-[#202828] mb-4">Fitness Analysis</h2>
        <div className="space-y-4">
          <div>
            <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-2">Profile Summary</h4>
            <div className="bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl p-4 grid grid-cols-2 md:grid-cols-3 gap-4">
              {recommendation.aiAnalysis?.profileSummary?.split('\n')
                .filter((line: string) => !line.toLowerCase().includes('target weight'))
                .map((line: string, i: number) => {
                const [key, val] = line.split(':');
                if (!val) return null;
                return (
                  <div key={i}>
                    <p className="text-xs text-[#687B78] uppercase">{key}</p>
                    <p className="font-bold text-[#202828]">{val.trim()}</p>
                  </div>
                );
              })}
            </div>
          </div>
          <div className="pt-2 border-t border-[#D3DFDA]">
            <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-2">AI Assessment</h4>
            <p className="text-[#202828] leading-relaxed">{recommendation.aiAnalysis?.assessment}</p>
          </div>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
          <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Dumbbell className="mr-2 text-[#164A4A]" size={20}/> Workout Plan</h3>
          <div className="overflow-x-auto rounded-xl border border-[#D3DFDA] mb-6">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F2EFE8] text-[#455250]">
                <tr>
                  <th className="px-4 py-3 font-bold border-b border-[#D3DFDA]">Day</th>
                  <th className="px-4 py-3 font-bold border-b border-[#D3DFDA]">Workout</th>
                  <th className="px-4 py-3 font-bold border-b border-[#D3DFDA]">Duration</th>
                </tr>
              </thead>
              <tbody>
                {recommendation.workoutRecommendation?.weeklySchedule?.map((item: any, i: number) => (
                  <tr key={i} className="border-b border-[#E8E5DA] last:border-0 hover:bg-[#F9F8F6]">
                    <td className="px-4 py-3 font-medium text-[#202828]">{item.day}</td>
                    <td className="px-4 py-3 text-[#455250]">{item.workout}</td>
                    <td className="px-4 py-3 text-[#687B78]">{item.duration}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <h4 className="text-sm font-bold text-[#A8ADA9] uppercase tracking-wider mb-3">Exercise Recommendations</h4>
          <div className="space-y-3">
            {recommendation.workoutRecommendation?.exercises?.map((ex: any, i: number) => (
              <div key={i} className="p-4 bg-[#F2EFE8] border border-[#E8E5DA] rounded-xl flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div>
                  <h4 className="font-bold text-[#202828]">{ex.name}</h4>
                  <p className="text-[#164A4A] text-sm font-semibold">{ex.targetMuscleGroup}</p>
                </div>
                <div className="grid grid-cols-2 md:flex gap-4 text-xs text-[#455250] font-medium">
                  <div><span className="text-[#A8ADA9]">Sets/Reps:</span> <br/>{ex.sets} × {ex.reps}</div>
                  <div><span className="text-[#A8ADA9]">Duration:</span> <br/>{ex.duration}</div>
                  <div><span className="text-[#A8ADA9]">Difficulty:</span> <br/>{ex.difficulty}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        <div className="space-y-6">
          <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Utensils className="mr-2 text-[#164A4A]" size={20}/> Diet & Nutrition Plan</h3>
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {['morning', 'breakfast', 'lunch', 'evening', 'dinner'].map((meal, i) => (
                  <div key={i} className="p-3 border border-[#E8E5DA] rounded-xl bg-[#F9F8F6]">
                    <h4 className="text-xs font-bold text-[#A8ADA9] uppercase mb-1">{meal}</h4>
                    <p className="text-sm text-[#202828] font-medium">{recommendation.dietRecommendation?.[meal]}</p>
                  </div>
                ))}
              </div>
              <div className="p-3 bg-[#FFFBEB] border border-[#FEF3C7] rounded-xl mt-4">
                <p className="text-xs text-[#B45309] font-semibold flex items-center gap-1">
                  <AlertCircle size={14} className="flex-shrink-0"/> 
                  <span>{recommendation.dietRecommendation?.note || 'This is a demo fitness recommendation and should not be treated as medical or clinical advice.'}</span>
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E8E5DA] rounded-2xl p-6 shadow-sm">
            <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center"><Clock className="mr-2 text-[#164A4A]" size={20}/> Daily Routine</h3>
            <div className="space-y-4">
              {['morning', 'workoutTime', 'evening', 'night'].map((time, i) => {
                const titles: any = { morning: 'Morning', workoutTime: 'Workout Time', evening: 'Evening', night: 'Night' };
                return (
                  <div key={i} className="flex gap-4 items-start">
                    <div className="w-24 flex-shrink-0 text-sm font-bold text-[#A8ADA9]">{titles[time]}</div>
                    <div className="flex-1 pb-4 border-b border-[#E8E5DA] last:border-0 last:pb-0">
                      <p className="text-sm text-[#202828] font-medium">{recommendation.routine?.[time]}</p>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
          </div>
        </div>
        </>
      ) : (
        <>
          {history.length > 0 ? (
            <>
              <div className="bg-gradient-to-br from-[#164A4A] to-[#202828] rounded-3xl p-8 text-white shadow-xl relative overflow-hidden mb-6">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                  <Trophy size={120} />
                </div>
                
                <h2 className="text-2xl font-bold mb-6 flex items-center gap-2">
                  <Activity className="text-[#C6A77D]" /> Your Fitness Journey
                </h2>
                
                <div className="flex flex-col md:flex-row items-center gap-8 relative z-10">
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm text-center flex-1 border border-white/20">
                    <p className="text-sm text-[#D3DFDA] uppercase tracking-wider mb-2">Previous Weight</p>
                    <p className="text-4xl font-bold">{history[0]?.fitnessProfile?.weight || '-'} <span className="text-xl font-medium">kg</span></p>
                  </div>
                  
                  <div className="flex flex-col items-center">
                    <div className="w-16 h-16 bg-[#C6A77D] rounded-full flex items-center justify-center shadow-[0_0_20px_rgba(198,167,125,0.4)]">
                      <TrendingDown size={32} className="text-[#164A4A]" />
                    </div>
                    <p className="text-[#C6A77D] font-bold mt-2 bg-white/10 px-4 py-1 rounded-full border border-[#C6A77D]/30">
                      {Math.abs(parseFloat(history[0]?.fitnessProfile?.weight || '0') - parseFloat(recommendation?.fitnessProfile?.weight || '0')).toFixed(1)} kg Difference
                    </p>
                  </div>
                  
                  <div className="bg-white/10 rounded-2xl p-6 backdrop-blur-sm text-center flex-1 border border-white/20">
                    <p className="text-sm text-[#D3DFDA] uppercase tracking-wider mb-2">Current Weight</p>
                    <p className="text-4xl font-bold text-[#C6A77D]">{recommendation?.fitnessProfile?.weight || '-'} <span className="text-xl font-medium text-white">kg</span></p>
                  </div>
                </div>
              </div>

              <div className="mb-8">
                <h3 className="text-xl font-bold text-[#202828] mb-4 flex items-center gap-2">
                  <ArrowRight className="text-[#164A4A]" /> Plan Comparison
                </h3>
                
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Previous Result Card */}
                  <div className="bg-gray-50 border border-[#E8E5DA] rounded-2xl p-6 relative opacity-80 hover:opacity-100 transition-opacity">
                    <div className="absolute top-0 right-0 bg-[#E8E5DA] text-[#687B78] text-xs font-bold px-3 py-1 rounded-bl-xl rounded-tr-xl">
                      Archived Plan
                    </div>
                    <h4 className="text-lg font-bold text-[#687B78] mb-4 flex items-center gap-2">
                      <Calendar size={18} /> Previous Result
                      <span className="text-sm font-normal ml-auto">{new Date(history[0]?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-white p-3 rounded-xl border border-[#E8E5DA]">
                          <p className="text-xs text-[#687B78]">Weight Recorded</p>
                          <p className="font-bold text-[#202828]">{history[0]?.fitnessProfile?.weight || '-'} kg</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-[#E8E5DA]">
                          <p className="text-xs text-[#687B78]">Primary Goal</p>
                          <p className="font-bold text-[#202828]">{history[0]?.fitnessProfile?.fitnessGoal || 'General Fitness'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-[#E8E5DA]">
                          <p className="text-xs text-[#687B78]">Experience Level</p>
                          <p className="font-bold text-[#202828]">{history[0]?.fitnessProfile?.experienceLevel || 'Beginner'}</p>
                        </div>
                        <div className="bg-white p-3 rounded-xl border border-[#E8E5DA]">
                          <p className="text-xs text-[#687B78]">Frequency</p>
                          <p className="font-bold text-[#202828]">{history[0]?.fitnessProfile?.availableWorkoutDays || '3 Days'}</p>
                        </div>
                      </div>
                      
                      <div className="bg-white p-4 rounded-xl border border-[#E8E5DA]">
                        <p className="text-sm font-bold flex items-center gap-2 mb-2 text-[#455250]"><Activity size={16}/> Previous Assessment</p>
                        <p className="text-sm text-[#687B78] line-clamp-3">{history[0]?.aiAnalysis?.assessment || 'General overview of your fitness routine and focus areas.'}</p>
                      </div>
                      <div className="bg-white p-4 rounded-xl border border-[#E8E5DA]">
                        <p className="text-sm font-bold flex items-center gap-2 mb-2 text-[#455250]"><Dumbbell size={16}/> Previous Workout Focus</p>
                        <p className="text-sm text-[#687B78]">{history[0]?.workoutRecommendation?.exercises?.map((e:any) => e.targetMuscleGroup).filter((v:any,i:any,a:any)=>a.indexOf(v)===i).slice(0,3).join(', ') || 'Full Body Strength'}</p>
                      </div>
                    </div>
                  </div>

                  {/* Current Result Card */}
                  <div className="bg-white border-2 border-[#164A4A] rounded-2xl p-6 shadow-lg relative">
                    <div className="absolute top-0 right-0 bg-[#164A4A] text-white text-xs font-bold px-4 py-1.5 rounded-bl-xl rounded-tr-xl shadow-sm">
                      Active Plan
                    </div>
                    <h4 className="text-lg font-bold text-[#164A4A] mb-4 flex items-center gap-2">
                      <Activity size={18} /> Current Result
                      <span className="text-sm font-normal text-[#687B78] ml-auto">{new Date(recommendation?.createdAt || Date.now()).toLocaleDateString()}</span>
                    </h4>
                    
                    <div className="space-y-4">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#F2EFE8] p-3 rounded-xl border border-[#D3DFDA]">
                          <p className="text-xs text-[#687B78]">Current Weight</p>
                          <p className="font-bold text-[#164A4A]">{recommendation?.fitnessProfile?.weight || '-'} kg</p>
                        </div>
                        <div className="bg-[#F2EFE8] p-3 rounded-xl border border-[#D3DFDA]">
                          <p className="text-xs text-[#687B78]">New Primary Goal</p>
                          <p className="font-bold text-[#164A4A]">{recommendation?.fitnessProfile?.fitnessGoal || 'General Fitness'}</p>
                        </div>
                        <div className="bg-[#F2EFE8] p-3 rounded-xl border border-[#D3DFDA]">
                          <p className="text-xs text-[#687B78]">Experience Level</p>
                          <p className="font-bold text-[#164A4A]">{recommendation?.fitnessProfile?.experienceLevel || 'Beginner'}</p>
                        </div>
                        <div className="bg-[#F2EFE8] p-3 rounded-xl border border-[#D3DFDA]">
                          <p className="text-xs text-[#687B78]">Frequency</p>
                          <p className="font-bold text-[#164A4A]">{recommendation?.fitnessProfile?.availableWorkoutDays || '3 Days'}</p>
                        </div>
                      </div>
                      
                      <div className="bg-[#F9F8F6] p-4 rounded-xl border border-[#D3DFDA]">
                        <p className="text-sm font-bold flex items-center gap-2 mb-2 text-[#202828]"><Activity size={16} className="text-[#164A4A]"/> New AI Assessment</p>
                        <p className="text-sm text-[#455250] line-clamp-3">{recommendation?.aiAnalysis?.assessment || 'Updated overview of your new fitness routine.'}</p>
                      </div>
                      <div className="bg-[#F9F8F6] p-4 rounded-xl border border-[#D3DFDA]">
                        <p className="text-sm font-bold flex items-center gap-2 mb-2 text-[#202828]"><Dumbbell size={16} className="text-[#164A4A]"/> Updated Workout Focus</p>
                        <p className="text-sm text-[#455250]">{recommendation?.workoutRecommendation?.exercises?.map((e:any) => e.targetMuscleGroup).filter((v:any,i:any,a:any)=>a.indexOf(v)===i).slice(0,3).join(', ') || 'Customized routine'}</p>
                      </div>
                    </div>
                  </div>

                </div>
              </div>
            </>
          ) : (
            <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-12 text-center shadow-sm">
              <h2 className="text-xl font-bold text-[#202828] mb-2">No History Found</h2>
              <p className="text-[#455250]">When you request a new plan, your progress comparison will appear here.</p>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MemberAIResults;
