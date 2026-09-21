import { useState, useEffect } from 'react';
import { Bell, Info, Calendar as CalIcon, Flame, AlertCircle } from 'lucide-react';
import api from '../../utils/api';

const MemberNotifications = () => {
  const [payments, setPayments] = useState<any[]>([]);

  useEffect(() => {
    const fetchPayments = async () => {
      try {
        const res = await api.get('/payments/my-history');
        setPayments(res.data.payments || []);
      } catch (err) {
        console.error('Failed to fetch payments', err);
      }
    };
    fetchPayments();
  }, []);

  const baseNotifs = [
    { title: 'Upcoming Class', msg: 'Your Yoga Flow class starts in 1 hour.', time: '1h ago', icon: CalIcon, color: 'text-blue-500', unread: true },
    { title: 'Goal Reached!', msg: 'Congratulations! You hit your weekly calorie burn goal.', time: 'Yesterday', icon: Flame, color: 'text-orange-500', unread: true },
    { title: 'Payment Successful', msg: 'Your monthly subscription fee of ₹1999 was successfully processed.', time: '3 days ago', icon: Info, color: 'text-green-500', unread: false },
  ];

  const rejectedPaymentsNotifs = payments
    .filter(p => p.status === 'Rejected')
    .map(p => ({
      title: 'Payment Rejected',
      msg: `Your subscription payment of ₹${p.amount} was rejected by the gym owner. Reason: ${p.rejectionReason || 'No reason provided.'}`,
      time: new Date(p.updatedAt || p.createdAt).toLocaleDateString(),
      icon: AlertCircle,
      color: 'text-red-500',
      unread: true
    }));

  const allNotifs = [...rejectedPaymentsNotifs, ...baseNotifs];

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex justify-between items-end border-b border-[#CCFBF1] pb-4">
        <div>
          <h1 className="text-3xl font-bold">Notifications</h1>
          <p className="text-[#475569]">Stay updated with alerts and messages</p>
        </div>
        <button className="text-sm text-[#16A34A] hover:underline">Mark all as read</button>
      </div>

      <div className="space-y-3">
        {allNotifs.map((notif, i) => (
          <div key={i} className={`p-4 rounded-xl border ${notif.unread ? 'bg-[#FFFFFF] border-[#CCFBF1]' : 'bg-transparent border-transparent'} flex gap-4 transition-colors`}>
            <div className={`w-10 h-10 rounded-full bg-[#FFFFFF] flex items-center justify-center shrink-0 ${notif.color}`}>
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

export default MemberNotifications;