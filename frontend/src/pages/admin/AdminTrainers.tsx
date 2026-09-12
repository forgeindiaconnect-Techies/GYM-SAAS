import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Dumbbell, Plus, MoreVertical, Trash2, Edit2, UserSquare, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';

const AdminTrainers = () => {
  const [trainers, setTrainers] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchTrainers = async () => {
    try {
      const res = await api.get('/trainers');
      setTrainers(res.data.trainers);
    } catch (err: any) {
      setError('Failed to fetch trainers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchTrainers();
  }, []);

  const handleStatusToggle = async (id: string, currentStatus: string, currentIsActive: boolean) => {
    try {
      // Toggle logic: if it's PENDING or not active, we approve & activate it.
      // If it's already APPROVED and active, we deactivate it (or suspend).
      let newApprovalStatus = currentStatus;
      let newIsActive = !currentIsActive;
      
      if (currentStatus === 'PENDING') {
        newApprovalStatus = 'APPROVED';
        newIsActive = true;
      }

      await api.patch(`/trainers/${id}/status`, {
        approvalStatus: newApprovalStatus,
        isActive: newIsActive
      });
      fetchTrainers();
    } catch (err) {
      alert('Failed to update status');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this trainer? This cannot be undone.')) return;
    try {
      await api.delete(`/trainers/${id}`);
      fetchTrainers();
    } catch (err) {
      alert('Failed to delete trainer');
    }
  };

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold flex items-center gap-3">
            <Dumbbell className="text-[#16A34A]" size={32} />
            Trainer Directory
          </h1>
          <p className="text-[#475569] mt-2">Manage all registered and active fitness professionals.</p>
        </div>
        <Link 
          to="/admin/trainers/new"
          className="px-6 py-2.5 bg-[#16A34A] text-white rounded-xl font-bold hover:bg-[#15803D] transition-colors flex items-center gap-2 shrink-0"
        >
          <Plus size={20} />
          <span>Add New Trainers</span>
        </Link>
      </div>
      
      {error && (
        <div className="bg-[#0D9488]/10 text-teal-400 p-4 rounded-xl text-sm border border-[#0D9488]/30">
          {error}
        </div>
      )}

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-[#475569]">
            <thead className="text-xs text-[#555] uppercase bg-[#FFFFFF] border-b border-[#CCFBF1]">
              <tr>
                <th className="px-6 py-4 font-bold">Trainer Name</th>
                <th className="px-6 py-4 font-bold">Specialization</th>
                <th className="px-6 py-4 font-bold">Experience</th>
                <th className="px-6 py-4 font-bold">Employment</th>
                <th className="px-6 py-4 font-bold">Joining Date</th>
                <th className="px-6 py-4 font-bold">Status</th>
                <th className="px-6 py-4 font-bold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#CCFBF1]">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center">Loading trainers...</td>
                </tr>
              ) : trainers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-[#555]">No trainers found. Click "Add New Trainers" to hire one.</td>
                </tr>
              ) : (
                trainers.map((trainer) => (
                  <tr key={trainer._id} className="hover:bg-[#FFFFFF] transition-colors group">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-[#E2E8F0] flex items-center justify-center shrink-0 overflow-hidden">
                          {trainer.profilePhoto ? (
                            <img src={trainer.profilePhoto} alt={trainer.firstName} className="w-full h-full object-cover" />
                          ) : (
                            <span className="font-bold text-[#1E293B] text-xs">{trainer.firstName[0]}{trainer.lastName[0]}</span>
                          )}
                        </div>
                        <div>
                          <div className="font-bold text-[#1E293B] group-hover:text-[#16A34A] transition transition-colors">
                            {trainer.firstName} {trainer.lastName}
                          </div>
                          <div className="text-xs text-[#555]">{trainer.email}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 font-medium text-[#1E293B]">{trainer.specialization || '-'}</td>
                    <td className="px-6 py-4">{trainer.experienceYears} Yrs</td>
                    <td className="px-6 py-4">{trainer.employmentType || '-'}</td>
                    <td className="px-6 py-4">
                      {trainer.joiningDate ? new Date(trainer.joiningDate).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${
                        trainer.approvalStatus === 'PENDING' ? 'bg-orange-500/10 text-orange-500 border-orange-500/20' :
                        trainer.isActive ? 'bg-[#16A34A]/10 text-[#16A34A] border-[#16A34A]/20' :
                        'bg-[#0D9488]/10 text-[#0D9488] border-[#0D9488]/20'
                      }`}>
                        {trainer.approvalStatus === 'PENDING' ? 'Pending' : (trainer.isActive ? 'Active' : 'Inactive')}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-3 opacity-0 group-hover:opacity-100 transition-opacity">
                        <button title="View Profile" className="text-[#475569] hover:text-[#16A34A] transition-colors">
                          <UserSquare size={18} />
                        </button>
                        <button title="Edit Trainer" className="text-[#475569] hover:text-blue-400 transition-colors">
                          <Edit2 size={18} />
                        </button>
                        <button 
                          onClick={() => handleStatusToggle(trainer._id, trainer.approvalStatus, trainer.isActive)}
                          title={trainer.isActive ? "Deactivate" : "Activate"} 
                          className={`transition-colors ${trainer.isActive ? 'text-[#475569] hover:text-orange-400' : 'text-[#475569] hover:text-[#16A34A]'}`}
                        >
                          {trainer.isActive ? <XCircle size={18} /> : <CheckCircle size={18} />}
                        </button>
                        <button 
                          onClick={() => handleDelete(trainer._id)}
                          title="Delete Trainer" 
                          className="text-[#475569] hover:text-[#0D9488] transition-colors"
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

export default AdminTrainers;