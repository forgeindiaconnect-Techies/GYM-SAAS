import { TrendingUp, Target } from 'lucide-react';

const TrainerUserProgress = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Progress</h1>
        <p className="text-[#57534E]">Monitor and log metrics for your clients</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Sarah Connor', metric: 'Weight', old: '75kg', new: '72kg', trend: 'down', text: 'On track for weight loss goal' },
          { name: 'Mike Tyson', metric: 'Bench Press', old: '100kg', new: '110kg', trend: 'up', text: 'Hit new PR this week!' },
          { name: 'John Doe', metric: 'Body Fat', old: '18%', new: '17.5%', trend: 'down', text: 'Slow and steady progress' },
        ].map((prog, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-6 shadow-lg">
            <div className="flex items-center gap-3 mb-4 border-b border-[#E7DADD] pb-4">
              <div className="w-10 h-10 bg-[#F3E8E8] rounded-full flex items-center justify-center font-bold">
                {prog.name[0]}
              </div>
              <h3 className="font-bold">{prog.name}</h3>
            </div>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm text-[#57534E] mb-1">{prog.metric}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{prog.old}</span>
                  <span className="text-[#57534E]">→</span>
                  <span className={`text-xl font-bold ${prog.trend === 'up' ? 'text-[#B76E79]' : 'text-green-500'}`}>{prog.new}</span>
                </div>
              </div>
              <div className={`p-2 rounded-lg ${prog.trend === 'up' ? 'bg-[#B76E79]/10 text-[#B76E79]' : 'bg-green-500/10 text-green-500'}`}>
                <TrendingUp size={20} className={prog.trend === 'down' ? 'rotate-180' : ''} />
              </div>
            </div>
            <p className="text-sm text-[#57534E] flex items-center gap-2">
              <Target size={14} /> {prog.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerUserProgress;