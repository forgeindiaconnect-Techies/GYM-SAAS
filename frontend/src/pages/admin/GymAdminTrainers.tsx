import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { getDb, addItem, deleteItem, updateItem } from '../../utils/mockDb';
import { Plus, Trash2, CheckCircle, XCircle } from 'lucide-react';
import api from '../../utils/api';

const GymAdminTrainers = () => {
  const { user } = useAuth();
  const [gym, setGym] = useState<any>(null);
  const [trainers, setTrainers] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [formData, setFormData] = useState({ name: '', spec: '', experience: '', phone: '', email: '', type: 'Full Time', trainerMode: 'offline' });

  useEffect(() => {
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => setGym(res.data.gym))
        .catch(err => console.error(err));
    }
  }, [user]);

  useEffect(() => {
    setTrainers(getDb('trainers'));
  }, []);

  const handleHire = (e) => {
    e.preventDefault();
    const newTrainer = addItem('trainers', { ...formData, status: 'Active' });
    setTrainers([...trainers, newTrainer]);
    setShowForm(false);
    setFormData({ name: '', spec: '', experience: '', phone: '', email: '', type: 'Full Time', trainerMode: 'offline' });
  };

  const handleToggleStatus = (id, currentStatus) => {
    const updated = updateItem('trainers', id, { status: currentStatus === 'Active' ? 'Inactive' : 'Active' });
    setTrainers(trainers.map(t => t.id === id ? updated : t));
  };

  const handleDelete = (id) => {
    deleteItem('trainers', id);
    setTrainers(trainers.filter(t => t.id !== id));
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-[#1E293B] tracking-tight">Trainers</h1>
          <p className="text-[#475569] mt-1">Manage all trainers hired by this gym.</p>
        </div>
        <button onClick={() => setShowForm(!showForm)} className="flex items-center space-x-2 px-4 py-2 bg-[#16A34A] text-white rounded-xl font-semibold hover:bg-[#15803D] transition-colors">
          <Plus size={20} />
          <span>Hire Trainer</span>
        </button>
      </div>

      {showForm && (
        <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl p-6">
          <h2 className="text-xl font-bold text-[#1E293B] mb-4">Hire New Trainer</h2>
          <form onSubmit={handleHire} className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1">Name</label>
              <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg px-4 py-2 text-[#1E293B]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1">Email</label>
              <input type="email" required value={formData.email} onChange={e => setFormData({...formData, email: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg px-4 py-2 text-[#1E293B]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1">Specialization</label>
              <input required value={formData.spec} onChange={e => setFormData({...formData, spec: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg px-4 py-2 text-[#1E293B]" />
            </div>
            <div>
              <label className="block text-sm font-medium text-[#475569] mb-1">Trainer Mode</label>
              <select required value={formData.trainerMode} onChange={e => setFormData({...formData, trainerMode: e.target.value})} className="w-full bg-[#FFFFFF] border border-[#CCFBF1] rounded-lg px-4 py-2 text-[#1E293B]">
                <option value="offline" disabled={gym?.trainingMode === 'online'}>Offline</option>
                <option value="online" disabled={gym?.trainingMode === 'offline'}>Online</option>
                <option value="both" disabled={gym?.trainingMode !== 'both'}>Both</option>
              </select>
            </div>
            <div className="md:col-span-2 flex justify-end space-x-3 mt-4">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 text-[#475569] hover:text-[#16A34A] transition-colors">Cancel</button>
              <button type="submit" className="px-6 py-2 bg-[#16A34A] text-white rounded-lg font-semibold hover:bg-[#15803D] transition-colors">Hire Trainer</button>
            </div>
          </form>
        </div>
      )}

      <div className="bg-[#FFFFFF] border border-[#CCFBF1] rounded-2xl overflow-hidden">
        <table className="w-full text-left text-sm text-[#475569]">
          <thead className="bg-[#FFFFFF] border-b border-[#CCFBF1] text-[#1E293B]">
            <tr>
              <th className="px-6 py-4 font-medium">Trainer Info</th>
              <th className="px-6 py-4 font-medium">Specialization</th>
              <th className="px-6 py-4 font-medium">Mode</th>
              <th className="px-6 py-4 font-medium">Status</th>
              <th className="px-6 py-4 font-medium">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#CCFBF1]">
            {trainers.map(trainer => (
              <tr key={trainer.id} className="hover:bg-[#F0FDFA] transition-colors">
                <td className="px-6 py-4">
                  <div className="font-semibold text-[#1E293B]">{trainer.name}</div>
                  <div className="text-xs">{trainer.email}</div>
                </td>
                <td className="px-6 py-4">{trainer.spec}</td>
                <td className="px-6 py-4 capitalize">{trainer.trainerMode || 'offline'}</td>
                <td className="px-6 py-4">
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${trainer.status === 'Active' ? 'bg-green-500/10 text-green-500' : 'bg-[#0D9488]/10 text-[#0D9488]'}`}>
                    {trainer.status}
                  </span>
                </td>
                <td className="px-6 py-4 flex space-x-3">
                  <button onClick={() => handleToggleStatus(trainer.id, trainer.status)} className="text-[#475569] hover:text-[#1E293B]" title="Toggle Status">
                    {trainer.status === 'Active' ? <XCircle size={18} /> : <CheckCircle size={18} />}
                  </button>
                  <button onClick={() => handleDelete(trainer.id)} className="text-[#0D9488] hover:text-teal-400" title="Delete">
                    <Trash2 size={18} />
                  </button>
                </td>
              </tr>
            ))}
            {trainers.length === 0 && (
              <tr><td colSpan={4} className="px-6 py-8 text-center">No trainers found. Hire a trainer to get started.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default GymAdminTrainers;
