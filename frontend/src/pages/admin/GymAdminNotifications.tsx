import { useState } from 'react';
import { Bell, AlertCircle, MessageSquare, Info, CheckCircle2, Trash2 } from 'lucide-react';

const mockNotifications = [
  { id: 1, title: 'Equipment Alert', message: 'Treadmill EQ004 requires maintenance soon.', type: 'alert', time: '10 mins ago', read: false },
  { id: 2, title: 'New Member Signup', message: 'Emily Davis has joined the Pro Tier plan.', type: 'success', time: '2 hours ago', read: false },
  { id: 3, title: 'Trainer Message', message: 'Sarah C. requested shift swap for tomorrow.', type: 'message', time: '5 hours ago', read: true },
  { id: 4, title: 'System Update', message: 'AI GYM platform will undergo maintenance at 2 AM.', type: 'info', time: '1 day ago', read: true },
  { id: 5, title: 'Payment Failed', message: 'Failed to process monthly payment for Mike Johnson.', type: 'alert', time: '1 day ago', read: true },
];

const GymAdminNotifications = () => {
  const getIcon = (type: string) => {
    switch(type) {
      case 'alert': return <AlertCircle size={20} className="text-[#0D9488]" />;
      case 'success': return <CheckCircle2 size={20} className="text-green-500" />;
      case 'message': return <MessageSquare size={20} className="text-blue-500" />;
      case 'info': return <Info size={20} className="text-purple-500" />;
      default: return <Bell size={20} className="text-gray-500" />;
    }
  };

  const getBg = (type: string) => {
    switch(type) {
      case 'alert': return 'bg-[#0D9488]/10 border-[#0D9488]/20';
      case 'success': return 'bg-green-500/10 border-green-500/20';
      case 'message': return 'bg-blue-500/10 border-blue-500/20';
      case 'info': return 'bg-purple-500/10 border-purple-500/20';
      default: return 'bg-gray-500/10 border-gray-500/20';
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Notifications</h1>
          <p className="text-[#475569] mt-1">System alerts, messages, and gym activity updates.</p>
        </div>
        <div className="flex space-x-3">
          <button className="px-4 py-2 bg-[#FFFFFF] border border-[#CCFBF1] text-[#1E293B] text-sm font-bold rounded-xl hover:bg-[#FFFFFF] transition-colors">
            Mark all as read
          </button>
        </div>
      </div>

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <div className="divide-y divide-[#CCFBF1]">
          {mockNotifications.map((notif) => (
            <div key={notif.id} className={`p-6 flex items-start space-x-4 transition-colors hover:bg-[#FFFFFF] ${!notif.read ? 'bg-[#FFFFFF]/50' : ''}`}>
              <div className={`w-10 h-10 shrink-0 rounded-xl flex items-center justify-center border ${getBg(notif.type)}`}>
                {getIcon(notif.type)}
              </div>
              <div className="flex-1">
                <div className="flex justify-between items-start">
                  <h3 className={`text-base ${!notif.read ? 'font-bold text-[#1E293B]' : 'font-semibold text-[#475569]'}`}>{notif.title}</h3>
                  <span className="text-xs text-[#475569] whitespace-nowrap ml-4">{notif.time}</span>
                </div>
                <p className={`mt-1 text-sm ${!notif.read ? 'text-[#e0e0e0]' : 'text-[#808080]'}`}>{notif.message}</p>
              </div>
              <div className="opacity-0 hover:opacity-100 flex items-center justify-center transition-opacity">
                <button className="p-2 text-[#475569] hover:text-[#0D9488] rounded-lg hover:bg-[#E2E8F0] transition-colors" title="Delete notification">
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
        
        {mockNotifications.length === 0 && (
          <div className="p-12 text-center flex flex-col items-center justify-center">
            <Bell size={48} className="text-[#E2E8F0] mb-4" />
            <h3 className="text-lg font-bold text-[#1E293B]">All caught up!</h3>
            <p className="text-[#475569] text-sm mt-1">You have no new notifications.</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default GymAdminNotifications;
