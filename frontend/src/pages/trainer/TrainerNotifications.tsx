import { Bell, Info, Calendar, MessageSquare, AlertCircle } from 'lucide-react';

const TrainerNotifications = () => {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-[#CCFBF1] pb-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-[#475569]">Alerts, messages and updates</p>
        </div>
        <button className="text-sm text-[#16A34A] hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {[
          { title: 'New Training Request', msg: 'Peter Parker requested you as a personal trainer.', time: '2h ago', icon: Info, color: 'text-[#16A34A]', bg:'bg-[#16A34A]/10', unread: true },
          { title: 'Session Reminder', msg: 'You have a 1-on-1 session with Sarah Connor in 30 mins.', time: '30m ago', icon: Calendar, color: 'text-blue-500', bg:'bg-blue-500/10', unread: true },
          { title: 'New Message', msg: 'Mike Tyson sent you a message regarding the new diet plan.', time: 'Yesterday', icon: MessageSquare, color: 'text-green-500', bg:'bg-green-500/10', unread: false },
          { title: 'System Alert', msg: 'The gym will be closed tomorrow for maintenance. Please reschedule your offline sessions.', time: '2 days ago', icon: AlertCircle, color: 'text-[#0D9488]', bg:'bg-[#0D9488]/10', unread: false },
        ].map((notif, i) => (
          <div key={i} className={`p-4 rounded-xl border ${notif.unread ? 'bg-[#FFFFFF] border-[#CCFBF1]' : 'bg-transparent border-transparent'} flex gap-4 transition-colors`}>
            <div className={`w-10 h-10 rounded-full ${notif.bg} flex items-center justify-center shrink-0 ${notif.color}`}>
              <notif.icon size={18} />
            </div>
            <div className="flex-1">
              <div className="flex justify-between items-start mb-1">
                <h4 className={`font-bold ${notif.unread ? 'text-[#1E293B]' : 'text-[#475569]'}`}>{notif.title}</h4>
                <span className="text-xs text-[#475569]">{notif.time}</span>
              </div>
              <p className="text-sm text-[#475569]">{notif.msg}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TrainerNotifications;