import { useState, useEffect } from 'react';
import { getDb, updateItem, deleteItem } from '../../utils/mockDb';
import { Search, Send, Trash2 } from 'lucide-react';

const SuperAdminInvitations = () => {
  const [invites, setInvites] = useState<any[]>([]);

  useEffect(() => {
    setInvites(getDb('gymInvitations'));
  }, []);

  const handleResend = (invite: any) => {
    alert(`Invitation resent to ${invite.email}!`);
    // update status to Pending to refresh the timer logically
    const updated = updateItem('gymInvitations', invite.id, { status: 'Pending', date: new Date().toISOString().split('T')[0] });
    setInvites(invites.map(i => i.id === invite.id ? updated : i));
  };

  const handleCancel = (invite: any) => {
    import('../../utils/mockDb').then(({ addItem }) => {
      addItem('deletedGymInvitations', { ...invite, deletedAt: new Date().toISOString() });
    });
    deleteItem('gymInvitations', invite.id);
    setInvites(invites.filter(i => i.id !== invite.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Gym Invitations</h1>
        <p className="text-[#4A514D] mt-1">Track and manage invitations sent to potential gym partners.</p>
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#4A514D]">
          <thead className="bg-[#FFFFFF] border-b border-[#DCD9CD] text-[#202522]">
            <tr>
              <th className="px-6 py-4 font-medium">Gym Name</th>
              <th className="px-6 py-4 font-medium">Recipient</th>
              <th className="px-6 py-4 font-medium">Invite Date</th>
              <th className="px-6 py-4 font-medium">Expiry</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#DCD9CD]">
            {invites.map(invite => (
              <tr key={invite.id} className="hover:bg-[#F5F3EE]">
                <td className="px-6 py-4 font-semibold text-[#202522]">{invite.gymName}</td>
                <td className="px-6 py-4">
                  <div className="text-[#202522]">{invite.owner}</div>
                  <div className="text-xs">{invite.email}</div>
                </td>
                <td className="px-6 py-4">{invite.date}</td>
                <td className="px-6 py-4">{invite.expiry || '7 Days'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-semibold ${invite.status === 'Accepted' ? 'bg-green-500/10 text-green-500' : 'bg-blue-500/10 text-blue-500'}`}>{invite.status}</span>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => handleResend(invite)} className="text-blue-500 hover:text-blue-400 flex items-center gap-1" title="Resend"><Send size={16}/></button>
                  <button onClick={() => handleCancel(invite)} className="text-[#8FA89B] hover:text-teal-400 flex items-center gap-1" title="Cancel"><Trash2 size={16}/></button>
                </td>
              </tr>
            ))}
            {invites.length === 0 && <tr><td colSpan={6} className="text-center py-8">No invitations sent yet.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminInvitations;
