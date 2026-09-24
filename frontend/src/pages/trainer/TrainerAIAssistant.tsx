import React, { useState, useEffect } from 'react';
import { Bot, Search, ArrowRight, UserCheck, CheckCircle2, Clock, FileEdit, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

const TrainerAIAssistant = () => {
  const [customers, setCustomers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await api.get('/ai/trainer/customers');
      setCustomers(res.data.customers || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    `${c.firstName} ${c.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.goal.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#D2B48C] to-[#0369A1] rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Bot size={24} className="text-white" />
          </div>
          <div>
            <h1 className="text-3xl font-bold text-[#202828] tracking-tight">AI Trainer Assistant</h1>
            <p className="text-[#455250] mt-1">Review, optimize, and approve AI-generated plans for your clients.</p>
          </div>
        </div>
        
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#A8ADA9]" size={20} />
          <input
            type="text"
            placeholder="Search clients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full md:w-64 pl-10 pr-4 py-3 bg-white border border-[#E8E5DA] rounded-xl focus:border-[#D2B48C] focus:ring-1 focus:ring-[#D2B48C] transition-all outline-none text-[#202828]"
          />
        </div>
      </div>

      <div className="bg-white border border-[#E8E5DA] rounded-2xl shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="bg-[#F2EFE8] border-b border-[#E8E5DA] text-left">
                <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">Client Name</th>
                <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">Goal</th>
                <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">AI Status</th>
                <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider">Last Updated</th>
                <th className="px-6 py-4 text-xs font-bold text-[#687B78] uppercase tracking-wider text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E8E5DA]">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#A8ADA9]">Loading clients...</td>
                </tr>
              ) : filteredCustomers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-[#A8ADA9]">No clients found.</td>
                </tr>
              ) : (
                filteredCustomers.map((customer) => (
                  <tr key={customer._id} className="hover:bg-[#F2EFE8] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-[#F1F5F9] rounded-full flex items-center justify-center text-[#0F172A] font-bold text-sm">
                          {customer.firstName[0]}
                        </div>
                        <div>
                          <p className="font-bold text-[#202828]">{customer.firstName} {customer.lastName}</p>
                          <p className="text-xs text-[#687B78]">Member</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm font-medium text-[#455250]">{customer.goal}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
                        customer.aiStatus === 'Trainer Approved' ? 'bg-[#F1F5F3] text-[#0F766E]' 
                        : customer.aiStatus === 'AI Generated' ? 'bg-[#EFF6FF] text-[#1D4ED8]'
                        : customer.aiStatus === 'No Data' ? 'bg-[#F1F5F9] text-[#687B78]'
                        : 'bg-[#FFFBEB] text-[#B45309]'
                      }`}>
                        {customer.aiStatus === 'Trainer Approved' ? <CheckCircle2 size={12} />
                        : customer.aiStatus === 'AI Generated' ? <Bot size={12} />
                        : customer.aiStatus === 'No Data' ? <UserCheck size={12} />
                        : <Clock size={12} />}
                        {customer.aiStatus}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-sm text-[#455250]">
                        {customer.lastUpdated ? new Date(customer.lastUpdated).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link 
                        to={`/trainer/ai-review/${customer._id}`}
                        className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
                          customer.aiStatus === 'No Data' 
                          ? 'bg-[#F1F5F9] text-[#A8ADA9] pointer-events-none'
                          : 'bg-[#D2B48C] text-white hover:bg-[#0891B2]'
                        }`}
                      >
                        <FileEdit size={16} /> 
                        {customer.aiStatus === 'Trainer Approved' ? 'Edit Plan' : 'Review Plan'}
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
