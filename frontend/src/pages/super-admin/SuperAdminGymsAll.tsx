import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Building2, Plus, Edit2, Play, Pause, Trash2, Search, ExternalLink } from 'lucide-react';
import api from '../../utils/api';

interface SuperAdminGymsAllProps {
  fixedStatus?: string;
  title?: string;
  description?: string;
}

const SuperAdminGymsAll = ({ 
  fixedStatus, 
  title = "Gym Network", 
  description = "Manage all fitness facilities operating on the platform." 
}: SuperAdminGymsAllProps) => {
  const [gyms, setGyms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState(fixedStatus || '');

  const fetchGyms = async () => {
    try {
      const res = await api.get('/gyms');
      setGyms(res.data.gyms);
    } catch (err) {
      setError('Failed to fetch gyms');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchGyms();
  }, []);

  const handleStatusChange = async (e: React.ChangeEvent<HTMLSelectElement>, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    try {
      const newStatus = e.target.value;
      await api.patch(`/gyms/${id}/status`, { status: newStatus });
      fetchGyms();
    } catch (err) {
      alert('Failed to update gym status');
    }
  };

  const handleDelete = async (e: React.MouseEvent, id: string) => {
    e.preventDefault();
    e.stopPropagation();
    if (!window.confirm('Are you sure you want to delete this gym completely? This action cannot be undone.')) return;
    try {
      await api.delete(`/gyms/${id}`);
      fetchGyms();
    } catch (err) {
      alert('Failed to delete gym');
    }
  };

  const filteredGyms = gyms.filter(gym => {
    const matchesSearch = gym.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          gym.location?.city?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          gym.location?.state?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus = fixedStatus 
      ? gym.status === fixedStatus 
      : (statusFilter === '' ? gym.status !== 'DELETED' : gym.status === statusFilter);
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Building2 className="text-[#34483F]" size={32} />
            {title}
          </h1>
          <p className="text-[#4A514D] mt-2">{description}</p>
        </div>
        <Link 
          to="/super-admin/gyms/add"
          className="px-6 py-2.5 bg-[#34483F] text-white rounded-xl font-bold hover:bg-[#C6A77D] transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus size={20} />
          <span>Add New Gym</span>
        </Link>
      </div>
      
      {error && (
        <div className="bg-[#8FA89B]/10 text-teal-400 p-4 rounded-xl text-sm border border-[#8FA89B]/30">
          {error}
        </div>
      )}

      {/* Controls */}
      <div className="flex flex-col sm:flex-row justify-between gap-4">
        <div className="relative w-full sm:w-96">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#4A514D]" size={20} />
          <input 
            type="text" 
            placeholder="Search gyms by name or location..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#DCD9CD] text-[#202522] rounded-xl pl-10 pr-4 py-2.5 text-sm outline-none focus:border-[#34483F] transition-colors"
          />
        </div>
        {!fixedStatus && (
          <div className="flex gap-2">
            <select 
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="bg-[#FFFFFF] border border-[#DCD9CD] text-[#202522] rounded-xl px-4 py-2.5 text-sm outline-none focus:border-[#34483F] transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="ACTIVE">Active</option>
              <option value="PENDING">Pending</option>
              <option value="SUSPENDED">Suspended</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>
        )}
      </div>

      <div className="bg-[#FFFFFF] border border-[#DCD9CD] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#4A514D]">
            <thead className="text-xs text-[#555] uppercase bg-[#FFFFFF] border-b border-[#DCD9CD]">
              <tr>
                <th className="px-6 py-4 font-bold">Gym</th>
                <th className="px-6 py-4 font-bold">Location</th>
                <th className="px-6 py-4 font-bold">Owner / Admin</th>
                <th className="px-6 py-4 font-bold">Subscription</th>
                <th className="px-6 py-4 font-bold text-center">Members</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#DCD9CD]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">Loading gyms...</td>
                </tr>
              ) : filteredGyms.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#555]">No gyms found matching your criteria.</td>
                </tr>
              ) : (
                filteredGyms.map((gym) => (
                  <tr key={gym._id} className="hover:bg-[#FFFFFF] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-[#E8E5DA] flex items-center justify-center shrink-0 overflow-hidden border border-[#DCD9CD]">
                          {gym.logo ? (
                            <img src={gym.logo} alt={gym.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="text-[#555]" size={20} />
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#202522] group-hover:text-[#34483F] transition transition-colors">
                            {gym.name}
                          </div>
                          <div className="text-xs text-[#555]">{gym.gymType}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#202522]">{gym.location?.city}, {gym.location?.state}</div>
                      <div className="text-xs text-[#555] truncate max-w-[150px]">{gym.location?.address}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-[#202522]">{gym.ownerId?.firstName} {gym.ownerId?.lastName}</div>
                      <div className="text-xs text-[#555]">{gym.ownerId?.email}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="font-medium text-[#202522]">{gym.subscription?.plan || 'N/A'}</div>
                    </td>
                    <td className="px-6 py-4 text-center font-bold text-[#202522]">
                      {/* Placeholder for member count until aggregation is implemented */}
                      -
                    </td>
                    <td className="px-6 py-4">
                      <select 
                        value={gym.status}
                        onChange={(e) => handleStatusChange(e, gym._id)}
                        onClick={(e) => e.stopPropagation()}
                        className={`outline-none cursor-pointer inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border appearance-none ${
                          gym.status === 'ACTIVE' ? 'bg-[#34483F]/10 text-[#34483F] border-[#34483F]/20' :
                          gym.status === 'PENDING' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                          gym.status === 'INACTIVE' ? 'bg-gray-500/10 text-gray-400 border-gray-500/20' :
                          'bg-[#8FA89B]/10 text-[#8FA89B] border-[#8FA89B]/20'
                        }`}
                      >
                        <option value="ACTIVE" className="bg-[#FFFFFF] text-[#202522]">Active</option>
                        <option value="PENDING" className="bg-[#FFFFFF] text-[#202522]">Pending</option>
                        <option value="SUSPENDED" className="bg-[#FFFFFF] text-[#202522]">Suspended</option>
                        <option value="INACTIVE" className="bg-[#FFFFFF] text-[#202522]">Inactive</option>
                        <option value="DELETED" className="bg-[#FFFFFF] text-[#202522]">Deleted</option>
                      </select>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <Link to={`/super-admin/gyms/details?id=${gym._id}`} title="View Details" className="text-[#4A514D] hover:text-[#34483F] transition-colors">
                          <ExternalLink size={18} />
                        </Link>
                        <Link 
                          to={`/super-admin/gyms/edit/${gym._id}`}
                          title="Edit Gym" 
                          className="text-[#4A514D] hover:text-blue-400 transition-colors"
                        >
                          <Edit2 size={18} />
                        </Link>
                        {/* Status toggle button removed since dropdown handles it */}
                        <button 
                          onClick={(e) => handleDelete(e, gym._id)}
                          title="Delete Gym" 
                          className="text-[#4A514D] hover:text-[#8FA89B] transition-colors"
                        >
                          <Trash2 size={18} />
                        </button>
                      </div>
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

export default SuperAdminGymsAll;
