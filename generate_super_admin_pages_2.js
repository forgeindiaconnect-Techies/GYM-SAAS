const fs = require('fs');
const path = require('path');

const writePage = (page, content) => {
  const filePath = path.join(__dirname, 'frontend', 'src', 'pages', 'super-admin', `${page}.tsx`);
  fs.writeFileSync(filePath, content);
  console.log(`Created: ${filePath}`);
};

const appsContent = `import { useState, useEffect } from 'react';
import { getDb, updateItem, addItem } from '../../../utils/mockDb';
import { Search, CheckCircle, XCircle, Eye } from 'lucide-react';

const SuperAdminApplications = () => {
  const [apps, setApps] = useState([]);
  const [search, setSearch] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [selectedApp, setSelectedApp] = useState(null);
  const [reason, setReason] = useState('');

  useEffect(() => {
    // Generate some mock applications if empty
    let stored = getDb('gymApplications');
    if (stored.length === 0) {
      stored = [
        { id: '1', gymName: 'Iron Palace', owner: 'Arnold', email: 'arnold@iron.com', phone: '123-456', location: 'LA', date: '2025-05-01', status: 'Pending' },
        { id: '2', gymName: 'CrossFit Beta', owner: 'Sarah', email: 'sarah@cf.com', phone: '999-999', location: 'SF', date: '2025-05-02', status: 'Pending' },
      ];
      stored.forEach(a => addItem('gymApplications', a));
      setApps(stored);
    } else {
      setApps(stored);
    }
  }, []);

  const handleApprove = (app) => {
    updateItem('gymApplications', app.id, { status: 'Approved' });
    addItem('gyms', {
      gymName: app.gymName,
      owner: app.owner,
      location: app.location,
      admin: app.owner,
      trainersCount: 0,
      membersCapacity: 100,
      status: 'Active',
      onboardedDate: new Date().toISOString().split('T')[0]
    });
    setApps(apps.map(a => a.id === app.id ? { ...a, status: 'Approved' } : a));
    alert('Gym Approved and added to Active Gyms!');
  };

  const handleReject = (e) => {
    e.preventDefault();
    updateItem('gymApplications', selectedApp.id, { status: 'Rejected', rejectReason: reason });
    setApps(apps.map(a => a.id === selectedApp.id ? { ...a, status: 'Rejected', rejectReason: reason } : a));
    setShowRejectModal(false);
  };

  const filtered = apps.filter(a => a.gymName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Gym Applications</h1>
        <p className="text-[#A1A1AA] mt-1">Review all gym registration applications.</p>
      </div>

      <div className="relative w-full md:w-96">
        <input 
          type="text" placeholder="Search applications..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#101010] border border-[#272727] rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-red-500"
        />
        <Search className="absolute left-3 top-2.5 text-[#A1A1AA]" size={18} />
      </div>

      <div className="bg-[#101010] border border-[#272727] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#A1A1AA]">
          <thead className="bg-[#151515] border-b border-[#272727] text-white">
            <tr>
              <th className="px-6 py-4 font-medium">Gym Name</th>
              <th className="px-6 py-4 font-medium">Owner & Contact</th>
              <th className="px-6 py-4 font-medium">Date</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272727]">
            {filtered.map(app => (
              <tr key={app.id} className="hover:bg-[#151515]/50">
                <td className="px-6 py-4 font-semibold text-white">{app.gymName}</td>
                <td className="px-6 py-4">
                  <div className="text-white">{app.owner}</div>
                  <div className="text-xs">{app.email}</div>
                </td>
                <td className="px-6 py-4">{app.date}</td>
                <td className="px-6 py-4">
                  <span className={\`px-2 py-1 rounded-full text-xs font-semibold \${app.status === 'Approved' ? 'bg-green-500/10 text-green-500' : app.status === 'Rejected' ? 'bg-red-500/10 text-red-500' : 'bg-yellow-500/10 text-yellow-500'}\`}>{app.status}</span>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button className="text-[#A1A1AA] hover:text-white" title="View"><Eye size={18} /></button>
                  {app.status === 'Pending' && (
                    <>
                      <button onClick={() => handleApprove(app)} className="text-green-500 hover:text-green-400" title="Approve"><CheckCircle size={18} /></button>
                      <button onClick={() => { setSelectedApp(app); setShowRejectModal(true); }} className="text-red-500 hover:text-red-400" title="Reject"><XCircle size={18} /></button>
                    </>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showRejectModal && (
        <div className="fixed inset-0 bg-black/80 flex items-center justify-center z-50 p-4">
          <div className="bg-[#101010] border border-[#272727] rounded-2xl w-full max-w-lg p-6">
            <h2 className="text-xl font-bold text-white mb-4">Reject Application</h2>
            <form onSubmit={handleReject} className="space-y-4">
              <div>
                <label className="block text-sm text-[#A1A1AA] mb-1">Reason for Rejection *</label>
                <textarea required rows={3} value={reason} onChange={e => setReason(e.target.value)} className="w-full bg-[#151515] border border-[#272727] rounded-xl p-3 text-white outline-none focus:border-red-500" />
              </div>
              <div className="flex justify-end space-x-3">
                <button type="button" onClick={() => setShowRejectModal(false)} className="px-4 py-2 text-[#A1A1AA]">Cancel</button>
                <button type="submit" className="px-6 py-2 bg-red-500 text-white rounded-xl font-bold">Reject Gym</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SuperAdminApplications;`;

const pendingContent = `import { useState, useEffect } from 'react';
import { getDb, updateItem, addItem } from '../../../utils/mockDb';
import { Search, CheckCircle, XCircle } from 'lucide-react';

const SuperAdminPending = () => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    setApps(getDb('gymApplications').filter(a => a.status === 'Pending'));
  }, []);

  const handleApprove = (app) => {
    updateItem('gymApplications', app.id, { status: 'Approved' });
    addItem('gyms', {
      gymName: app.gymName,
      owner: app.owner,
      location: app.location,
      admin: app.owner,
      trainersCount: 0,
      membersCapacity: 100,
      status: 'Active',
      onboardedDate: new Date().toISOString().split('T')[0]
    });
    setApps(apps.filter(a => a.id !== app.id));
    alert('Gym Approved and added to Active Gyms!');
  };

  const handleReject = (app) => {
    updateItem('gymApplications', app.id, { status: 'Rejected', rejectReason: 'Manually rejected from Pending queue' });
    setApps(apps.filter(a => a.id !== app.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Pending Approval</h1>
        <p className="text-[#A1A1AA] mt-1">Gyms waiting for your final review and approval.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {apps.map(app => (
          <div key={app.id} className="bg-[#101010] border border-[#272727] rounded-2xl p-6 relative">
            <span className="absolute top-4 right-4 px-2 py-1 bg-yellow-500/10 text-yellow-500 rounded-full text-xs font-bold">Pending</span>
            <h3 className="text-xl font-bold text-white">{app.gymName}</h3>
            <p className="text-sm text-[#A1A1AA] mb-4">{app.location}</p>
            
            <div className="space-y-2 mb-6">
              <div className="flex justify-between text-sm"><span className="text-[#555]">Owner</span><span className="text-white">{app.owner}</span></div>
              <div className="flex justify-between text-sm"><span className="text-[#555]">Date</span><span className="text-white">{app.date}</span></div>
            </div>

            <div className="flex space-x-3">
              <button onClick={() => handleApprove(app)} className="flex-1 flex items-center justify-center space-x-2 py-2 bg-green-500/10 text-green-500 hover:bg-green-500 hover:text-white rounded-xl transition-colors font-semibold text-sm">
                <CheckCircle size={16} /> <span>Approve</span>
              </button>
              <button onClick={() => handleReject(app)} className="flex-1 flex items-center justify-center space-x-2 py-2 bg-red-500/10 text-red-500 hover:bg-red-500 hover:text-white rounded-xl transition-colors font-semibold text-sm">
                <XCircle size={16} /> <span>Reject</span>
              </button>
            </div>
          </div>
        ))}
        {apps.length === 0 && <div className="col-span-full p-8 text-center text-[#A1A1AA] bg-[#101010] rounded-2xl border border-[#272727]">No pending applications.</div>}
      </div>
    </div>
  );
};

export default SuperAdminPending;`;

const approvedContent = `import { useState, useEffect } from 'react';
import { getDb, updateItem } from '../../../utils/mockDb';
import { Search, ShieldAlert, Power } from 'lucide-react';

const SuperAdminApproved = () => {
  const [gyms, setGyms] = useState([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    setGyms(getDb('gyms'));
  }, []);

  const handleToggleStatus = (gym) => {
    const newStatus = gym.status === 'Active' ? 'Suspended' : 'Active';
    const updated = updateItem('gyms', gym.id, { status: newStatus });
    setGyms(gyms.map(g => g.id === gym.id ? updated : g));
  };

  const filtered = gyms.filter(g => g.gymName.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Approved Gyms</h1>
        <p className="text-[#A1A1AA] mt-1">Manage active gyms on the platform.</p>
      </div>

      <div className="relative w-full md:w-96">
        <input 
          type="text" placeholder="Search gyms..." value={search} onChange={(e) => setSearch(e.target.value)}
          className="w-full bg-[#101010] border border-[#272727] rounded-xl pl-10 pr-4 py-2 text-white outline-none focus:border-red-500"
        />
        <Search className="absolute left-3 top-2.5 text-[#A1A1AA]" size={18} />
      </div>

      <div className="bg-[#101010] border border-[#272727] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#A1A1AA]">
          <thead className="bg-[#151515] border-b border-[#272727] text-white">
            <tr>
              <th className="px-6 py-4 font-medium">Gym Name</th>
              <th className="px-6 py-4 font-medium">Location</th>
              <th className="px-6 py-4 font-medium">Admin</th>
              <th className="px-6 py-4 font-medium">Onboarded</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272727]">
            {filtered.map(gym => (
              <tr key={gym.id} className="hover:bg-[#151515]/50">
                <td className="px-6 py-4 font-semibold text-white">{gym.gymName}</td>
                <td className="px-6 py-4">{gym.location}</td>
                <td className="px-6 py-4">{gym.admin}</td>
                <td className="px-6 py-4">{gym.onboardedDate}</td>
                <td className="px-6 py-4">
                  <span className={\`px-2 py-1 rounded-full text-xs font-semibold \${gym.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}\`}>{gym.status}</span>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => handleToggleStatus(gym)} className="text-[#A1A1AA] hover:text-white" title={gym.status === 'Active' ? 'Suspend' : 'Reactivate'}>
                    {gym.status === 'Active' ? <ShieldAlert size={18} className="text-red-500"/> : <Power size={18} className="text-green-500"/>}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminApproved;`;

const rejectedContent = `import { useState, useEffect } from 'react';
import { getDb, updateItem } from '../../../utils/mockDb';
import { Search, RefreshCw, Trash2 } from 'lucide-react';

const SuperAdminRejected = () => {
  const [apps, setApps] = useState([]);

  useEffect(() => {
    setApps(getDb('gymApplications').filter(a => a.status === 'Rejected'));
  }, []);

  const handleReconsider = (app) => {
    updateItem('gymApplications', app.id, { status: 'Pending' });
    setApps(apps.filter(a => a.id !== app.id));
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white tracking-tight">Rejected Gyms</h1>
        <p className="text-[#A1A1AA] mt-1">Review previously rejected gym applications.</p>
      </div>

      <div className="bg-[#101010] border border-[#272727] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#A1A1AA]">
          <thead className="bg-[#151515] border-b border-[#272727] text-white">
            <tr>
              <th className="px-6 py-4 font-medium">Gym Name</th>
              <th className="px-6 py-4 font-medium">Owner</th>
              <th className="px-6 py-4 font-medium">Reason</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#272727]">
            {apps.map(app => (
              <tr key={app.id} className="hover:bg-[#151515]/50">
                <td className="px-6 py-4 font-semibold text-white">{app.gymName}</td>
                <td className="px-6 py-4">{app.owner}</td>
                <td className="px-6 py-4 text-red-400">{app.rejectReason || 'N/A'}</td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => handleReconsider(app)} className="text-blue-500 hover:text-blue-400 flex items-center gap-1" title="Reconsider">
                    <RefreshCw size={16} /> <span className="text-xs">Reconsider</span>
                  </button>
                </td>
              </tr>
            ))}
            {apps.length === 0 && <tr><td colSpan={4} className="text-center py-8">No rejected applications.</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SuperAdminRejected;`;


writePage('SuperAdminApplications', appsContent);
writePage('SuperAdminPending', pendingContent);
writePage('SuperAdminApproved', approvedContent);
writePage('SuperAdminRejected', rejectedContent);
console.log('Script 2 complete.');
