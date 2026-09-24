import { Bell } from 'lucide-react';

const AdminNotifications = () => {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-end mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Bell className="text-[#164A4A]" size={32} />
            Notifications Center
          </h1>
          <p className="text-[#455250] mt-2">Send push notifications or emails to all users.</p>
        </div>
        <button className="px-6 py-2 bg-[#164A4A] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors">
          Manage Notifications Center
        </button>
      </div>
      
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Compose Broadcast</h3>
          <div className="space-y-4">
            <input type="text" placeholder="Subject line" className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 outline-none" />
            <textarea placeholder="Message body..." rows={5} className="w-full bg-[#FFFFFF] border border-[#D3DFDA] rounded-xl px-4 py-3 outline-none resize-none"></textarea>
            <div className="flex gap-4">
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Push Notification</label>
              <label className="flex items-center gap-2 text-sm"><input type="checkbox" /> Email Blast</label>
            </div>
            <button className="w-full py-3 bg-[#164A4A] text-white rounded-xl font-bold mt-2">Send Broadcast</button>
          </div>
        </div>
        <div className="bg-[#FFFFFF] border border-[#D3DFDA] rounded-2xl p-6">
          <h3 className="font-bold text-lg mb-4">Recent Broadcasts</h3>
          <div className="space-y-3">
             <div className="p-3 border border-[#D3DFDA] rounded-xl bg-[#FFFFFF]">
               <p className="font-bold text-sm">New App Update Available!</p>
               <p className="text-xs text-[#455250] mt-1">Sent to 1,248 users • Oct 10</p>
             </div>
             <div className="p-3 border border-[#D3DFDA] rounded-xl bg-[#FFFFFF]">
               <p className="font-bold text-sm">Holiday Sale 20% Off</p>
               <p className="text-xs text-[#455250] mt-1">Sent to 8,492 users • Sep 25</p>
             </div>
          </div>
        </div>
      </div>
    
    </div>
  );
};

export default AdminNotifications;