import { useState, useEffect } from 'react';
import { Search, Eye, Filter, Users } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const GymAdminAIFitnessPlans = () => {
  const [plans, setPlans] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('All');

  useEffect(() => {
    fetchPlans();
  }, []);

  const fetchPlans = async () => {
    try {
      const res = await api.get('/ai/admin/recommendations');
      setPlans(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'AI Generated': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'Under Trainer Review': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'Revision Requested': return 'bg-orange-100 text-orange-800 border-orange-200';
      case 'Trainer Modified': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'Trainer Approved': return 'bg-green-100 text-green-800 border-green-200';
      case 'Archived': return 'bg-gray-100 text-gray-800 border-gray-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const filteredPlans = plans.filter(p => {
    const customerName = `${p.customer?.firstName || ''} ${p.customer?.lastName || ''}`.trim();
    const matchName = customerName.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatus = filterStatus === 'All' || p.latestRecommendation?.status === filterStatus;
    return matchName && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-3xl font-bold text-[#202828] mb-1">AI Fitness Plans Monitor</h1>
          <p className="text-[#687B78]">Monitor all AI-generated fitness plans and trainer reviews across your gym.</p>
        </div>
      </div>

      <div className="bg-white p-4 rounded-2xl border border-[#E8E5DA] shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#A8ADA9]" size={20} />
          <input 
            type="text" 
            placeholder="Search customers..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-[#E8E5DA] rounded-xl outline-none focus:border-[#164A4A] bg-[#F9F8F6]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-[#687B78]" size={20} />
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-[#E8E5DA] rounded-xl px-4 py-2 outline-none focus:border-[#164A4A] bg-[#F9F8F6] text-[#202828]"
          >
            <option value="All">All Statuses</option>
            <option value="AI Generated">AI Generated</option>
            <option value="Under Trainer Review">Under Trainer Review</option>
            <option value="Trainer Approved">Trainer Approved</option>
            <option value="Revision Requested">Revision Requested</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-[#E8E5DA] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F2EFE8] text-[#687B78] text-sm uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4 font-bold">Customer</th>
                <th className="px-6 py-4 font-bold">Fitness Goal</th>
                <th className="px-6 py-4 font-bold">Assigned Trainer</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold">Version</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DA]">
              {loading ? (
                <tr><td colSpan={6} className="text-center py-8 text-[#687B78]">Loading plans...</td></tr>
              ) : filteredPlans.length === 0 ? (
                <tr><td colSpan={6} className="text-center py-8 text-[#687B78]">No plans found.</td></tr>
              ) : (
                filteredPlans.map((plan: any) => (
                  <tr key={plan._id} className="hover:bg-[#F9F8F6] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E8E5DA] flex items-center justify-center text-[#164A4A] font-bold overflow-hidden">
                          {plan.customer?.profileImage ? (
                            <img src={plan.customer.profileImage} alt="" className="w-full h-full object-cover" />
                          ) : (
                            plan.customer?.name?.charAt(0).toUpperCase()
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#202828]">
                            {plan.customer?.firstName} {plan.customer?.lastName}
                          </div>
                          <div className="text-sm text-[#687B78]">{plan.customer?.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#202828] font-medium capitalize">
                        {plan.latestRecommendation?.fitnessProfile?.fitnessGoal?.replace(/-/g, ' ') || 'General Fitness'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {plan.trainer ? (
                        <div className="flex items-center gap-2">
                          <Users size={16} className="text-[#A8ADA9]" />
                          <span className="text-[#202828] font-medium">
                            {plan.trainer.firstName} {plan.trainer.lastName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-[#A8ADA9] italic">Unassigned</span>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold border ${getStatusColor(plan.latestRecommendation?.status)}`}>
                        {plan.latestRecommendation?.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-[#687B78] font-bold">V{plan.latestRecommendation?.version}</span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/admin/ai-plans/${plan.latestRecommendation?._id}`}
                        className="inline-flex items-center gap-2 px-4 py-2 bg-white border-2 border-[#164A4A] text-[#164A4A] rounded-lg font-bold hover:bg-[#164A4A] hover:text-white transition-colors"
                      >
                        <Eye size={16} /> Details
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GymAdminAIFitnessPlans;
