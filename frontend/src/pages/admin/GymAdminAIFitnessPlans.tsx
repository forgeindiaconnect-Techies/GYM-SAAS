import { useState, useEffect } from 'react';
import { Search, Eye, Filter, Bot, CheckCircle2, Clock, FileEdit } from 'lucide-react';
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
      setLoading(true);
      const res = await api.get('/ai/admin/recommendations');
      setPlans(res.data || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const getWorkflowBadge = (status: string) => {
    switch (status) {
      case 'AI Generated':
      case 'Pending Trainer Review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300 inline-flex items-center gap-1">
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'Under Trainer Review':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD] inline-flex items-center gap-1">
            <Clock size={12} /> Under Review
          </span>
        );
      case 'Trainer Edited':
      case 'Trainer Modified':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F3E8E8] text-[#9F5965] border border-[#E7DADD] inline-flex items-center gap-1">
            <FileEdit size={12} /> Trainer Edited
          </span>
        );
      case 'Trainer Approved':
      case 'Published to Customer':
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-bold bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD] inline-flex items-center gap-1">
            <CheckCircle2 size={12} /> Trainer Approved
          </span>
        );
      default:
        return (
          <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-[#F3E8E8] text-[#292524]">
            {status}
          </span>
        );
    }
  };

  const filteredPlans = plans.filter(p => {
    const customerName = `${p.customer?.firstName || ''} ${p.customer?.lastName || ''}`.trim();
    const matchName = customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      p.latestRecommendation?.fitnessProfile?.fitnessGoal?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const status = p.latestRecommendation?.status;
    const matchStatus = 
      filterStatus === 'All' || 
      (filterStatus === 'Pending' && (status === 'Pending Trainer Review' || status === 'Under Trainer Review' || status === 'AI Generated')) ||
      (filterStatus === 'Approved' && (status === 'Trainer Approved' || status === 'Published to Customer')) ||
      status === filterStatus;

    return matchName && matchStatus;
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <h1 className="text-3xl font-bold text-[#292524]">AI Fitness Plans &amp; Trainer Review Monitor</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#B76E79]/10 text-[#B76E79]">
              Owner Visibility Hub
            </span>
          </div>
          <p className="text-sm text-[#57534E]">
            Audit customer AI analyses, assigned trainer reviews, modifications diff, and final approved plans.
          </p>
        </div>
      </div>

      {/* Search & Filter Toolbar */}
      <div className="bg-[#FFFFFF] p-4 rounded-3xl border border-[#E7DADD] shadow-sm flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#57534E]" size={18} />
          <input 
            type="text" 
            placeholder="Search customers by name or fitness goal..." 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 border border-[#F3E8E8] rounded-2xl outline-none focus:border-[#B76E79] bg-[#F3E8E8] text-sm text-[#292524]"
          />
        </div>
        <div className="flex items-center gap-2">
          <Filter className="text-[#57534E]" size={18} />
          <select 
            value={filterStatus}
            onChange={e => setFilterStatus(e.target.value)}
            className="border border-[#F3E8E8] rounded-2xl px-4 py-2.5 outline-none focus:border-[#B76E79] bg-[#F3E8E8] text-xs font-bold text-[#292524]"
          >
            <option value="All">All Workflow Statuses</option>
            <option value="Pending">Pending Trainer Review</option>
            <option value="Approved">Trainer Approved</option>
            <option value="AI Generated">AI Generated</option>
            <option value="Under Trainer Review">Under Trainer Review</option>
          </select>
        </div>
      </div>

      {/* Data Table (Requirement 9: Customer, Assigned Trainer, AI Status, Review Status, Approval, Modifications, Date) */}
      <div className="bg-[#FFFFFF] rounded-3xl border border-[#E7DADD] shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-[#F3E8E8] text-[#57534E] text-xs font-bold uppercase tracking-wider">
              <tr>
                <th className="px-6 py-4">Customer</th>
                <th className="px-6 py-4">Fitness Goal</th>
                <th className="px-6 py-4">Assigned Trainer</th>
                <th className="px-6 py-4">AI Analysis</th>
                <th className="px-6 py-4">Review Status</th>
                <th className="px-6 py-4">Trainer Modifications</th>
                <th className="px-6 py-4">Last Updated</th>
                <th className="px-6 py-4 text-right">Audit &amp; Plan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#F3E8E8]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#57534E]">
                    <div className="w-8 h-8 border-4 border-[#B76E79] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="font-semibold text-xs">Loading plans...</p>
                  </td>
                </tr>
              ) : filteredPlans.length === 0 ? (
                <tr>
                  <td colSpan={8} className="text-center py-16 text-[#57534E]">
                    <Bot size={36} className="mx-auto text-[#E7DADD] mb-2" />
                    <p className="font-bold text-sm text-[#292524]">No customer plans found</p>
                  </td>
                </tr>
              ) : (
                filteredPlans.map((plan: any) => {
                  const rec = plan.latestRecommendation || {};
                  const modifications = rec.trainerModifications;
                  const hasModifications = modifications?.hasModifications;
                  const modCount = modifications?.workoutModifications?.length || 0;
                  const isApproved = rec.status === 'Trainer Approved' || rec.status === 'Published to Customer';

                  return (
                    <tr key={plan._id} className="hover:bg-[#F3E8E8] transition-colors">
                      {/* Customer */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-[#B76E79]/10 text-[#B76E79] flex items-center justify-center font-bold text-sm overflow-hidden shrink-0">
                            {plan.customer?.profileImage || plan.customer?.profilePhoto ? (
                              <img src={plan.customer.profileImage || plan.customer.profilePhoto} alt="" className="w-full h-full object-cover" />
                            ) : (
                              plan.customer?.firstName?.[0] || 'C'
                            )}
                          </div>
                          <div>
                            <div className="font-bold text-sm text-[#292524]">
                              {plan.customer?.firstName} {plan.customer?.lastName}
                            </div>
                            <div className="text-xs text-[#57534E]">{plan.customer?.email}</div>
                          </div>
                        </div>
                      </td>

                      {/* Fitness Goal */}
                      <td className="px-6 py-4">
                        <span className="text-sm font-semibold text-[#B76E79]">
                          {rec.fitnessProfile?.fitnessGoal || 'General Fitness'}
                        </span>
                      </td>

                      {/* Assigned Trainer */}
                      <td className="px-6 py-4">
                        {plan.trainer ? (
                          <div>
                            <span className="text-sm font-bold text-[#292524] block">
                              {plan.trainer.name || `${plan.trainer.firstName} ${plan.trainer.lastName || ''}`}
                            </span>
                            <span className="inline-flex items-center gap-1 text-[10px] text-[#B76E79] font-bold">
                              <span className="w-1.5 h-1.5 rounded-full bg-[#B76E79]" />
                              {plan.trainer.availabilityStatus || 'Online'}
                            </span>
                          </div>
                        ) : (
                          <span className="text-xs text-[#57534E] italic">Unassigned</span>
                        )}
                      </td>

                      {/* AI Analysis Status */}
                      <td className="px-6 py-4">
                        <span className="px-2 py-0.5 rounded text-[11px] font-extrabold bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]">
                          AI Draft Generated
                        </span>
                      </td>

                      {/* Trainer Review Status */}
                      <td className="px-6 py-4">
                        {getWorkflowBadge(rec.status)}
                      </td>

                      {/* Trainer Modifications */}
                      <td className="px-6 py-4">
                        {hasModifications ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-extrabold bg-[#F3E8E8] text-[#9F5965] border border-[#E7DADD] inline-flex items-center gap-1">
                            <FileEdit size={11} /> {modCount} Edit(s) Made
                          </span>
                        ) : isApproved ? (
                          <span className="px-2.5 py-1 rounded-full text-[11px] font-bold bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD]">
                            Approved as AI Draft
                          </span>
                        ) : (
                          <span className="text-xs text-[#57534E]">-</span>
                        )}
                      </td>

                      {/* Review Date */}
                      <td className="px-6 py-4">
                        <span className="text-xs text-[#57534E]">
                          {rec.updatedAt ? new Date(rec.updatedAt).toLocaleDateString() : '-'}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4 text-right">
                        <Link 
                          to={`/admin/ai-plans/${rec._id}`}
                          className="inline-flex items-center gap-1.5 px-4 py-2 bg-[#FFFFFF] border border-[#E7DADD] hover:border-[#B76E79] text-[#B76E79] rounded-xl text-xs font-bold hover:bg-[#F3E8E8] transition-colors shadow-sm"
                        >
                          <Eye size={14} /> View Audit
                        </Link>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default GymAdminAIFitnessPlans;
