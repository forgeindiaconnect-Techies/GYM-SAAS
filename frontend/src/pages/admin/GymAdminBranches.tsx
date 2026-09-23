import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Plus, MapPin, Building2, Phone, Mail, MoreVertical, Eye, Edit, Power, Trash2, ShieldCheck, Activity } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import api from '../../utils/api';

const PLAN_BRANCH_LIMITS: Record<string, number> = {
  FREE_TRIAL: 1,
  SILVER: 1,
  GOLD: 2,
  PREMIUM: 5
};

const GymAdminBranches = () => {
  const [branches, setBranches] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  const currentPlan = user?.subscriptionPlan || 'FREE_TRIAL';
  const branchLimit = PLAN_BRANCH_LIMITS[currentPlan] || 1;
  const currentBranchesCount = branches.length; // Including the main gym which acts as a branch logically? No, the branches list is strictly what's created in the Branches collection. Wait, the prompt says "Total Branches: 1 / 2. Example: Gold Plan Branches 1 / 2 used". So branches array length is the used count.

  const fetchBranches = async () => {
    try {
      setLoading(true);
      const res = await api.get('/branches');
      if (res.data.success) {
        setBranches(res.data.branches);
      }
    } catch (err) {
      console.error('Error fetching branches:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranches();
  }, []);

  const handleAddBranch = () => {
    if (currentBranchesCount >= branchLimit) {
      alert(`You have reached your ${branchLimit}-branch limit on the ${currentPlan} plan.`);
      // Optionally redirect to subscription page or show modal
      navigate('/admin/subscription');
      return;
    }
    navigate('/admin/add-branch');
  };

  const handleStatusChange = async (branchId: string, newStatus: string) => {
    try {
      await api.patch(`/branches/${branchId}/status`, { status: newStatus });
      fetchBranches();
    } catch (err) {
      alert('Failed to update branch status');
    }
  };

  const handleDelete = async (branchId: string) => {
    if (!window.confirm('Are you sure you want to delete this branch? All associated data may be lost.')) return;
    try {
      await api.delete(`/branches/${branchId}`);
      fetchBranches();
    } catch (err) {
      alert('Failed to delete branch');
    }
  };

  if (loading) {
    return <div className="flex justify-center items-center h-64"><Activity className="animate-spin text-[#34483F]" size={32} /></div>;
  }

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202522] tracking-tight">Branches</h1>
          <p className="text-[#4A514D] mt-1">Manage all branches under your gym.</p>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="bg-white border border-[#DCD9CD] rounded-xl p-3 flex flex-col shadow-sm">
            <span className="text-xs text-[#4A514D] font-bold uppercase tracking-wider">{currentPlan} Plan</span>
            <span className="text-sm text-[#202522] font-bold">Branches: <span className={currentBranchesCount >= branchLimit ? 'text-red-500' : 'text-[#34483F]'}>{currentBranchesCount} / {branchLimit}</span> used</span>
          </div>
          <button 
            onClick={handleAddBranch}
            disabled={currentBranchesCount >= branchLimit}
            className={`px-4 py-3 font-bold rounded-xl flex items-center gap-2 shadow-lg transition-colors ${
              currentBranchesCount >= branchLimit 
                ? 'bg-gray-200 text-gray-500 cursor-not-allowed shadow-none' 
                : 'bg-[#34483F] text-white hover:bg-[#C6A77D] shadow-[#34483F]/20'
            }`}
          >
            <Plus size={20} /> Add Branch
          </button>
        </div>
      </div>

      {branches.length === 0 ? (
        <div className="bg-white rounded-2xl border border-[#DCD9CD] p-12 text-center flex flex-col items-center">
          <div className="w-16 h-16 bg-[#F5F3EE] rounded-full flex items-center justify-center mb-4">
            <Building2 className="text-[#34483F]" size={32} />
          </div>
          <h3 className="text-xl font-bold text-[#202522] mb-2">No Branches Yet</h3>
          <p className="text-[#4A514D] mb-6 max-w-md">You haven't created any branches yet. Expand your gym's presence by adding a new location.</p>
          <button onClick={handleAddBranch} className="px-6 py-3 bg-[#34483F] text-white font-bold rounded-xl hover:bg-[#C6A77D] transition-colors">
            Create First Branch
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {branches.map(branch => (
            <div key={branch._id} className="bg-white border border-[#DCD9CD] rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow relative group flex flex-col">
              <div className="flex justify-between items-start mb-4">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-[#F5F3EE] flex items-center justify-center text-[#34483F] shrink-0 border border-[#DCD9CD]">
                    <Building2 size={24} />
                  </div>
                  <div className="truncate">
                    <h3 className="font-bold text-[#202522] text-lg truncate" title={branch.branchName}>{branch.branchName}</h3>
                    <p className="text-xs font-semibold text-[#4A514D] uppercase tracking-wider">CODE: {branch.branchCode}</p>
                  </div>
                </div>
                
                {/* Status Badge */}
                <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider border ${
                  branch.status === 'ACTIVE' ? 'bg-green-50 text-green-700 border-green-200' :
                  branch.status === 'SUSPENDED' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                  'bg-gray-50 text-gray-700 border-gray-200'
                }`}>
                  {branch.status}
                </span>
              </div>

              <div className="space-y-2 mb-6 flex-1">
                <div className="flex items-center gap-2 text-sm text-[#4A514D] truncate">
                  <MapPin size={16} className="text-[#34483F] shrink-0" />
                  <span className="truncate" title={`${branch.location.address}, ${branch.location.city}`}>{branch.location.address}, {branch.location.city}</span>
                </div>
                {branch.phone && (
                  <div className="flex items-center gap-2 text-sm text-[#4A514D]">
                    <Phone size={16} className="text-[#34483F] shrink-0" />
                    <span>{branch.phone}</span>
                  </div>
                )}
                {branch.managerId && (
                  <div className="flex items-center gap-2 text-sm text-[#4A514D]">
                    <ShieldCheck size={16} className="text-purple-500 shrink-0" />
                    <span>Manager: {branch.managerId.firstName} {branch.managerId.lastName}</span>
                  </div>
                )}
                <div className="flex items-center gap-2 text-sm text-[#4A514D]">
                  <Activity size={16} className="text-[#34483F] shrink-0" />
                  <span className="capitalize">{branch.trainingMode} Training</span>
                </div>
              </div>

              <div className="pt-4 border-t border-[#DCD9CD] flex gap-2">
                <Link to={`/admin/branches/${branch._id}`} className="flex-1 py-2 bg-[#F2EFE8] border border-[#E8E5DA] text-[#202522] rounded-lg text-sm font-bold text-center hover:bg-[#E8E5DA] transition-colors flex justify-center items-center gap-1">
                  <Eye size={16} /> View
                </Link>
                <select 
                  value={branch.status}
                  onChange={(e) => handleStatusChange(branch._id, e.target.value)}
                  className={`flex-1 py-2 border rounded-lg text-sm font-bold text-center transition-colors outline-none cursor-pointer appearance-none ${
                    branch.status === 'ACTIVE' ? 'bg-green-50 border-green-200 text-green-700 hover:bg-green-100' :
                    branch.status === 'SUSPENDED' ? 'bg-orange-50 border-orange-200 text-orange-700 hover:bg-orange-100' :
                    branch.status === 'INACTIVE' ? 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100' :
                    'bg-red-50 border-red-200 text-red-700 hover:bg-red-100'
                  }`}
                  style={{ textAlignLast: 'center' }}
                >
                  <option value="ACTIVE">Active</option>
                  <option value="INACTIVE">Inactive</option>
                  <option value="SUSPENDED">Suspended</option>
                  <option value="REJECTED">Reject</option>
                </select>
                <button 
                  onClick={() => handleDelete(branch._id)}
                  className="w-10 flex items-center justify-center bg-red-50 border border-red-200 text-red-600 rounded-lg hover:bg-red-100 transition-colors shrink-0"
                  title="Delete Branch"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default GymAdminBranches;
