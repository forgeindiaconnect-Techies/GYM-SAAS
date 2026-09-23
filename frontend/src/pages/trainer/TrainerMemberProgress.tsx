import { TrendingUp, Award, Target } from 'lucide-react';

const TrainerMemberProgress = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold">User Progress</h1>
        <p className="text-[#4A514D]">Monitor and log metrics for your clients</p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[
          { name: 'Sarah Connor', metric: 'Weight', old: '75kg', new: '72kg', trend: 'down', text: 'On track for weight loss goal' },
          { name: 'Mike Tyson', metric: 'Bench Press', old: '100kg', new: '110kg', trend: 'up', text: 'Hit new PR this week!' },
          { name: 'John Doe', metric: 'Body Fat', old: '18%', new: '17.5%', trend: 'down', text: 'Slow and steady progress' },
        ].map((prog, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4 border-b border-[#DCD9CD] pb-4">
              <div className="w-10 h-10 bg-[#E8E5DA] rounded-full flex items-center justify-center font-bold">
                {prog.name[0]}
              </div>
              <h3 className="font-bold">{prog.name}</h3>
            </div>
            
            <div className="flex justify-between items-end mb-4">
              <div>
                <p className="text-sm text-[#4A514D] mb-1">{prog.metric}</p>
                <div className="flex items-center gap-2">
                  <span className="text-xl font-bold">{prog.old}</span>
                  <span className="text-[#4A514D]">→</span>
                  <span className={`text-xl font-bold ${prog.trend === 'up' ? 'text-[#34483F]' : 'text-green-500'}`}>{prog.new}</span>
                </div>
              </div>
              <div className={`p-2 rounded-lg ${prog.trend === 'up' ? 'bg-[#34483F]/10 text-[#34483F]' : 'bg-green-500/10 text-green-500'}`}>
                <TrendingUp size={20} className={prog.trend === 'down' ? 'rotate-180' : ''} />
              </div>
            </div>
            <p className="text-sm text-[#4A514D] flex items-center gap-2">
              <Target size={14} /> {prog.text}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerMemberProgress;