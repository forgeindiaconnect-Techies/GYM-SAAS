import { Dumbbell, Clock, Flame, Play, Plus } from 'lucide-react';

const MemberWorkout = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Workout Plan</h1>
          <p className="text-[#4A514D]">Your customized routine for today</p>
        </div>
        <button className="bg-[#34483F] text-white px-4 py-2 rounded-xl font-bold flex items-center gap-2 hover:bg-[#C6A77D] transition-colors">
          <Plus size={18} /> Custom Workout
        </button>
      </div>

      <div className="bg-gradient-to-r from-[#FFFFFF] to-[#1a1a1a] border border-[#DCD9CD] rounded-2xl p-6 flex flex-col md:flex-row justify-between items-center gap-6">
        <div>
          <div className="inline-block px-3 py-1 bg-[#34483F]/10 text-[#34483F] rounded-full text-xs font-bold mb-3">TODAY'S FOCUS</div>
          <h2 className="text-2xl font-bold mb-2">Upper Body Power</h2>
          <div className="flex gap-4 text-sm text-[#4A514D]">
            <span className="flex items-center gap-1"><Clock size={16} /> 45 Mins</span>
            <span className="flex items-center gap-1"><Flame size={16} /> 320 kcal</span>
            <span className="flex items-center gap-1"><Dumbbell size={16} /> Intermediate</span>
          </div>
        </div>
        <button className="w-full md:w-auto px-8 py-3 bg-[#34483F] text-[#202522] font-bold rounded-xl flex items-center justify-center gap-2 hover:scale-105 transition-transform">
          <Play size={18} fill="currentColor" /> Start Workout
        </button>
      </div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-xl font-bold">Exercises (6)</h3>
          {[
            { name: 'Bench Press', sets: '4', reps: '8-10', weight: '60kg' },
            { name: 'Incline Dumbbell Press', sets: '3', reps: '10-12', weight: '24kg' },
            { name: 'Lat Pulldown', sets: '4', reps: '10-12', weight: '55kg' },
            { name: 'Seated Cable Row', sets: '3', reps: '12', weight: '50kg' },
            { name: 'Overhead Press', sets: '3', reps: '8-10', weight: '40kg' },
            { name: 'Tricep Pushdown', sets: '3', reps: '15', weight: '20kg' },
          ].map((ex, i) => (
            <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-xl p-4 flex items-center justify-between group hover:border-[#34483F]/50 transition-colors">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-[#FFFFFF] rounded-lg flex items-center justify-center font-bold text-[#4A514D]">
                  {i + 1}
                </div>
                <div>
                  <h4 className="font-bold text-lg">{ex.name}</h4>
                  <p className="text-sm text-[#4A514D]">{ex.sets} Sets × {ex.reps} Reps</p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-[#EF4444] font-bold">{ex.weight}</span>
              </div>
            </div>
          ))}
        </div>
        
        <div className="space-y-6">
          <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
            <h3 className="font-bold mb-4">Weekly Progress</h3>
            <div className="space-y-3">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day, i) => (
                <div key={i} className="flex items-center justify-between">
                  <span className="text-sm text-[#4A514D] w-8">{day}</span>
                  <div className="flex-1 mx-3 h-2 bg-[#E8E5DA] rounded-full overflow-hidden">
                    <div className={`h-full rounded-full ${[0, 2, 4].includes(i) ? 'bg-[#34483F]' : i === 1 ? 'bg-[#34483F]/50' : ''}`} style={{ width: [0, 2, 4].includes(i) ? '100%' : i === 1 ? '50%' : '0%' }}></div>
                  </div>
                  <span className="text-xs w-6 text-right">
                    {[0, 2, 4].includes(i) ? '✓' : i === 1 ? 'Half' : '-'}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MemberWorkout;