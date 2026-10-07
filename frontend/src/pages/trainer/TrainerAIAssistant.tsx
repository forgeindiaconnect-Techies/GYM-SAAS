import { useState, useEffect } from 'react';
import { 
  Bot, Search, UserCheck, CheckCircle2, Clock, FileEdit 
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const TrainerAIAssistant = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/trainer/customers');
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => {
    const nameMatch = `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
      c.goal?.toLowerCase().includes(searchTerm.toLowerCase());
    
    if (!nameMatch) return false;

    if (statusFilter === 'Pending') {
      return c.aiStatus === 'Pending Trainer Review' || c.aiStatus === 'Under Trainer Review' || c.aiStatus === 'AI Generated';
    }
    if (statusFilter === 'Approved') {
      return c.aiStatus === 'Trainer Approved' || c.aiStatus === 'Published to Customer';
    }
    return true;
  });

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'Pending Trainer Review':
      case 'AI Generated':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-amber-100 text-amber-800 border border-amber-300">
            <Clock size={12} /> Pending Review
          </span>
        );
      case 'Under Trainer Review':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-blue-100 text-blue-800 border border-blue-300">
            <Clock size={12} /> Under Review
          </span>
        );
      case 'Trainer Edited':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-purple-100 text-purple-800 border border-purple-300">
            <FileEdit size={12} /> Trainer Edited
          </span>
        );
      case 'Trainer Approved':
      case 'Published to Customer':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800 border border-emerald-300">
            <CheckCircle2 size={12} /> Trainer Approved
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-gray-100 text-gray-700">
            <UserCheck size={12} /> {status || 'No Data'}
          </span>
        );
    }
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#F97316] to-teal-700 rounded-2xl flex items-center justify-center shadow-lg shadow-teal-900/20 text-white">
            <Bot size={26} />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#292524] tracking-tight">AI Analysis Review Hub</h1>
            <p className="text-[#78716C] mt-1 text-sm">
              Review customer assessments, adjust exercises, calibrate sets & reps, and approve final customer plans.
            </p>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3.5 top-1/2 transform -translate-y-1/2 text-[#78716C]" size={18} />
          <input
            type="text"
            placeholder="Search clients by name or goal..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-72 pl-10 pr-4 py-2.5 bg-white border border-[#FED7AA] rounded-xl focus:border-[#F97316] transition-all outline-none text-sm text-[#292524]"
          />
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2 border-b border-[#FED7AA] pb-2 overflow-x-auto no-scrollbar">
        {[
          { key: 'All', label: 'All Clients' },
          { key: 'Pending', label: 'Pending Trainer Review' },
          { key: 'Approved', label: 'Trainer Approved' },
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setStatusFilter(tab.key)}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all shrink-0 ${
              statusFilter === tab.key
                ? 'bg-[#F97316] text-white shadow-sm'
                : 'bg-white text-[#78716C] hover:bg-[#F9F8F6] border border-[#FED7AA]'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Table Card */}
      <div className="bg-white border border-[#E7E5E4] rounded-3xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-[#FFFDF8] border-b border-[#FED7AA] text-xs font-bold text-[#78716C] uppercase tracking-wider">
                <th className="px-6 py-4">Client Name</th>
                <th className="px-6 py-4">Fitness Goal</th>
                <th className="px-6 py-4">Fitness Level</th>
                <th className="px-6 py-4">Workflow Status</th>
                <th className="px-6 py-4">Assessment Date</th>
                <th className="px-6 py-4 text-right">Review Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#FED7AA]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[#78716C]">
                    <div className="w-8 h-8 border-4 border-[#F97316] border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                    <p className="font-semibold text-xs text-[#78716C]">Loading clients...</p>
                  </td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-16 text-center text-[#78716C]">
                    <Bot size={36} className="mx-auto text-[#E7E5E4] mb-2" />
                    <p className="font-bold text-sm text-[#292524]">No clients found</p>
                    <p className="text-xs text-[#78716C] mt-1">No customer assessment records matching this filter.</p>
                  </td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-[#F9F8F6] transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#F97316]/10 text-[#F97316] rounded-full flex items-center justify-center font-bold text-sm shrink-0">
                          {customer.profilePhoto ? (
                            <img src={customer.profilePhoto} alt="profile" className="w-full h-full object-cover rounded-full" />
                          ) : (
                            customer.firstName?.[0] || 'C'
                          )}
                        </div>
                        <div>
                          <p className="font-bold text-sm text-[#292524]">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs text-[#78716C]">{customer.email}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-semibold text-[#F97316]">{customer.goal}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-semibold text-[#78716C] bg-[#FFFDF8] px-2.5 py-1 rounded-lg">
                        {customer.level}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(customer.aiStatus)}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-[#78716C]">
                        {customer.lastUpdated ? new Date(customer.lastUpdated).toLocaleDateString() : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/trainer/ai-review/${customer._id}`}
                        className={`inline-flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all shadow-sm ${
                          customer.aiStatus === 'No Data' 
                            ? 'bg-gray-100 text-gray-400 pointer-events-none'
                            : customer.aiStatus === 'Trainer Approved' || customer.aiStatus === 'Published to Customer'
                            ? 'bg-white border border-[#E7E5E4] text-[#F97316] hover:bg-[#F9F8F6]'
                            : 'bg-[#F97316] text-white hover:bg-[#EA580C]'
                        }`}
                      >
                        <FileEdit size={14} /> 
                        {customer.aiStatus === 'Trainer Approved' ? 'Edit / View Plan' : 'Review & Approve'}
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

export default TrainerAIAssistant;
