import { TrendingUp, Activity } from 'lucide-react';

const MemberProgress = () => {
  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold">Progress</h1>
          <p className="text-[#4A514D]">Track your body metrics and achievements</p>
        </div>
        <button className="bg-[#E8E5DA] hover:bg-[#333] text-white px-4 py-2 rounded-xl text-sm font-medium transition-colors">
          Log Metrics
        </button>
      </div>

      <div className="grid md:grid-cols-4 gap-4">
        {[
          { label: 'Weight', value: '74.5', unit: 'kg', trend: '-1.2', color: 'text-green-500' },
          { label: 'Body Fat', value: '14.2', unit: '%', trend: '-0.5', color: 'text-green-500' },
          { label: 'Muscle Mass', value: '38.5', unit: 'kg', trend: '+0.8', color: 'text-green-500' },
          { label: 'BMI', value: '23.4', unit: '', trend: '-0.3', color: 'text-green-500' },
        ].map((metric, i) => (
          <div key={i} className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-5">
            <span className="text-sm text-[#4A514D]">{metric.label}</span>
            <div className="flex items-baseline gap-1 mt-1 mb-2">
              <span className="text-3xl font-bold">{metric.value}</span>
              <span className="text-[#4A514D]">{metric.unit}</span>
            </div>
            <span className={`text-xs font-medium px-2 py-1 rounded bg-[#E8E5DA] ${metric.color}`}>
              {metric.trend}{metric.unit} this month
            </span>
          </div>
        ))}
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl p-8 flex flex-col items-center justify-center text-center min-h-[40vh]">
        <div className="w-16 h-16 bg-[#34483F]/10 rounded-full flex items-center justify-center mb-4">
          <TrendingUp size={32} className="text-[#34483F]" />
        </div>
        <h2 className="text-xl font-bold mb-2">Interactive Charts</h2>
        <p className="text-[#4A514D] max-w-sm">
          Interactive charts showing your weight, body fat, and specific lift progress over time will be available soon.
        </p>
      </div>
    </div>
  );
};

export default MemberProgress;