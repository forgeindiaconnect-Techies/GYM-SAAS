import { useState, useEffect } from 'react';
import { Search, Plus, Wrench, CheckCircle2, AlertTriangle, Edit2, X, Download } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useOutletContext } from 'react-router-dom';
import api from '../../utils/api';
import { exportToPDF } from '../../utils/export';

const mockEquipment = [
  { id: 'EQ001', name: 'Treadmill Series X', category: 'Cardio', status: 'Active', nextService: '2026-01-15', brand: 'LifeFitness' },
  { id: 'EQ002', name: 'Elliptical Trainer', category: 'Cardio', status: 'Maintenance', nextService: '2025-09-10', brand: 'Precor' },
  { id: 'EQ003', name: 'Leg Press Machine', category: 'Strength', status: 'Active', nextService: '2025-11-20', brand: 'Hammer Strength' },
  { id: 'EQ004', name: 'Cable Crossover', category: 'Strength', status: 'Out of Order', nextService: '2025-09-01', brand: 'Matrix' },
  { id: 'EQ005', name: 'Rowing Machine', category: 'Cardio', status: 'Active', nextService: '2025-12-05', brand: 'Concept2' },
  { id: 'EQ006', name: 'Smith Machine', category: 'Strength', status: 'Active', nextService: '2026-02-10', brand: 'Rogue' },
];

const GymAdminEquipment = () => {
  const { user } = useAuth();
  const { selectedBranch } = useOutletContext<{ selectedBranch: string }>();
  const [search, setSearch] = useState('');
  const [gym, setGym] = useState<any>(null);
  const [localEquipmentList, setLocalEquipmentList] = useState<any[]>(mockEquipment);
  const [isLoading, setIsLoading] = useState(true);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingEq, setEditingEq] = useState<any>(null);
  const [selectedEq, setSelectedEq] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: '',
    category: 'Cardio',
    brand: '',
    quantity: 1,
    condition: 'Excellent',
    status: 'Active',
    nextService: ''
  });
  const [editFormData, setEditFormData] = useState({
    name: '',
    category: 'Cardio',
    brand: '',
    quantity: 1,
    condition: 'Excellent',
    status: 'Active',
    nextService: ''
  });

  useEffect(() => {
    setIsLoading(true);
    if (user?.gymId) {
      api.get(`/gyms/${user.gymId}`)
        .then(res => {
          setGym(res.data.gym);
          if (res.data.gym?.equipment) {
            setLocalEquipmentList(res.data.gym.equipment);
          }
        })
        .catch(() => {
          // API failed — keep showing mock data
        })
        .finally(() => setIsLoading(false));
    } else {
      setIsLoading(false);
    }
  }, [user]);

  const equipmentToDisplay = localEquipmentList.filter(eq => {
    // On main branch show everything; on a specific branch filter by branchId
    if (selectedBranch === 'main') return true;
    return eq.branchId === selectedBranch;
  });

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'Active': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Maintenance': return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Out of Order': return 'bg-[#FED7AA]/10 text-[#FED7AA] border-[#FED7AA]/20';
      default: return 'bg-gray-500/10 text-gray-500 border-gray-500/20';
    }
  };

  const getStatusIcon = (status: string) => {
    switch(status) {
      case 'Active': return <CheckCircle2 size={14} className="mr-1.5" />;
      case 'Maintenance': return <Wrench size={14} className="mr-1.5" />;
      case 'Out of Order': return <AlertTriangle size={14} className="mr-1.5" />;
      default: return null;
    }
  };

  const handleAddEquipment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!gym) return;
    
    const newEq = {
      id: `EQ${String(localEquipmentList.length + 1).padStart(3, '0')}`,
      name: formData.name,
      category: formData.category,
      brand: formData.brand,
      quantity: formData.quantity,
      branchId: selectedBranch === 'main' ? undefined : selectedBranch,
      status: formData.status,
      nextService: formData.nextService || 'N/A'
    };

    const updatedEquipment = [newEq, ...localEquipmentList];
    setLocalEquipmentList(updatedEquipment);

    try {
      await api.put(`/gyms/${gym._id}`, { equipment: updatedEquipment });
    } catch (err) {
      console.error('Error saving equipment:', err);
      // Revert on error
      setLocalEquipmentList(localEquipmentList);
    }
    setShowAddModal(false);
    setFormData({ name: '', category: 'Cardio', brand: '', quantity: 1, condition: 'Excellent', status: 'Active', nextService: '' });
  };

  const handleEditClick = (eq: any) => {
    setEditingEq(eq);
    setEditFormData({
      name: eq.name || '',
      category: eq.category || 'Cardio',
      brand: eq.brand || '',
      quantity: eq.quantity || 1,
      condition: eq.condition || 'Excellent',
      status: eq.status || (eq.condition === 'Poor' ? 'Maintenance' : 'Active'),
      nextService: eq.nextService && eq.nextService !== 'N/A' ? eq.nextService : ''
    });
    setShowEditModal(true);
  };

  const handleSaveEdit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingEq || !gym) return;

    const targetId = editingEq.id || editingEq._id;
    const updatedEquipment = localEquipmentList.map((eq: any) => {
      if ((eq.id || eq._id) === targetId) {
        return {
          ...eq,
          name: editFormData.name,
          category: editFormData.category,
          brand: editFormData.brand,
          quantity: editFormData.quantity,
          condition: editFormData.condition,
          status: editFormData.status,
          nextService: editFormData.nextService || 'N/A'
        };
      }
      return eq;
    });

    setLocalEquipmentList(updatedEquipment);
    setShowEditModal(false);
    setEditingEq(null);

    try {
      await api.put(`/gyms/${gym._id}`, { equipment: updatedEquipment });
    } catch (err) {
      console.error('Error updating equipment:', err);
      setLocalEquipmentList(localEquipmentList);
    }
  };

  const handleDeleteEquipment = async (id: string) => {
    if (!gym || !window.confirm('Are you sure you want to delete this equipment?')) return;
    
    const updatedEquipment = localEquipmentList.filter(eq => (eq.id || eq._id) !== id);
    setLocalEquipmentList(updatedEquipment);
    
    try {
      await api.put(`/gyms/${gym._id}`, { equipment: updatedEquipment });
    } catch (err) {
      console.error('Error deleting equipment:', err);
      // Revert on error
      setLocalEquipmentList(localEquipmentList);
    }
  };

  const handleDownloadPDF = () => {
    const columns = ['Equipment Name', 'Category', 'Brand', 'Quantity', 'Condition', 'Status', 'Next Service'];
    const data = equipmentToDisplay.map((eq: any) => [
      eq.name || '-',
      eq.category || '-',
      eq.brand || '-',
      String(eq.quantity || 1),
      eq.condition || '-',
      eq.status || '-',
      eq.nextService || 'N/A'
    ]);
    exportToPDF({
      filename: `Gym_Equipment_${new Date().toISOString().split('T')[0]}`,
      columns,
      data,
      title: 'Gym Equipment Inventory'
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start md:items-center flex-col md:flex-row gap-4 md:gap-0">
        <div>
          <h1 className="text-3xl font-bold text-[#292524] tracking-tight">Equipment</h1>
          <p className="text-[#78716C] mt-1">Manage inventory and track maintenance schedules.</p>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={handleDownloadPDF} 
            className="flex items-center space-x-2 px-4 py-2 bg-white text-[#F97316] border border-[#E7E5E4] rounded-xl font-bold hover:bg-[#FFFDF8] transition-colors shadow-sm cursor-pointer"
          >
            <Download size={18} />
            <span>Download PDF</span>
          </button>
          <button onClick={() => setShowAddModal(true)} className="flex items-center space-x-2 px-4 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20 cursor-pointer">
            <Plus size={20} />
            <span>Add Equipment</span>
          </button>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-4 mb-8">
        <div className="relative flex-1">
          <input 
            type="text" 
            placeholder="Search equipment by name or ID..." 
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full bg-[#FFFFFF] border border-[#E7E5E4] rounded-xl pl-10 pr-4 py-3 text-[#292524] outline-none focus:border-[#F97316]"
          />
          <Search className="absolute left-3 top-3.5 text-[#78716C]" size={18} />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
        {isLoading ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-10 text-[#78716C]">Loading equipment...</div>
        ) : equipmentToDisplay.length === 0 ? (
          <div className="col-span-1 md:col-span-2 xl:col-span-3 text-center py-16 bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl flex flex-col items-center justify-center">
            <div className="w-16 h-16 bg-[#F1F5F9] rounded-full flex items-center justify-center mb-4">
              <Wrench size={32} className="text-[#78716C]" />
            </div>
            <h3 className="text-xl font-bold text-[#292524] mb-2">No Equipment Found</h3>
            <p className="text-[#78716C] max-w-md">There is no equipment in this branch yet. Add your first piece of equipment to start managing your inventory.</p>
            <button onClick={() => setShowAddModal(true)} className="mt-6 flex items-center space-x-2 px-6 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors">
              <Plus size={18} />
              <span>Add Equipment</span>
            </button>
          </div>
        ) : equipmentToDisplay
          .filter((eq: any) => eq.name?.toLowerCase().includes(search.toLowerCase()))
          .map((eq: any, idx: number) => {
            const status = eq.status || (eq.condition === 'Poor' ? 'Maintenance' : 'Active');
            return (
          <div key={eq._id || eq.id || idx} className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6 hover:border-[#F97316]/30 transition-all group relative overflow-hidden">
            <div className="flex justify-between items-start mb-4">
              <div>
                <div className="flex items-center space-x-2 mb-1">
                  <span className="text-xs font-bold text-[#78716C] bg-[#FFFFFF] px-2 py-1 rounded-md">{eq.id || `EQ00${idx+1}`}</span>
                  <span className="text-xs font-semibold text-[#F97316] uppercase tracking-wider">{eq.category || 'General'}</span>
                </div>
                <h3 className="text-lg font-bold text-[#292524]">{eq.name}</h3>
                <p className="text-sm text-[#78716C] mt-0.5">{eq.brand || `Quantity: ${eq.quantity || 1}`}</p>
              </div>
              <button 
                onClick={() => handleEditClick(eq)}
                className="text-[#78716C] hover:text-[#F97316] hover:bg-[#FFFDF8] p-1.5 rounded-lg transition-colors"
                title="Edit Equipment"
              >
                <Edit2 size={18} />
              </button>
            </div>

            <div className="space-y-4">
              <div className="flex justify-between items-center py-3 border-t border-[#E7E5E4]">
                <span className="text-sm text-[#78716C]">Current Status</span>
                <span className={`flex items-center text-xs font-bold px-3 py-1.5 rounded-lg border ${getStatusColor(status)}`}>
                  {getStatusIcon(status)}
                  {status}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-[#78716C]">Next Service</span>
                <span className="text-sm font-semibold text-[#292524] bg-[#FFFFFF] px-3 py-1 rounded-lg">
                  {eq.nextService || 'N/A'}
                </span>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-[#E7E5E4] flex gap-2">
              <button onClick={() => setSelectedEq(eq)} className="flex-1 py-2 bg-[#FFFFFF] border border-[#E7E5E4] hover:bg-[#FED7AA] text-[#292524] text-sm font-bold rounded-xl transition-colors">
                View Details
              </button>
              <button 
                onClick={() => handleEditClick(eq)} 
                className="flex-1 py-2 bg-[#FFFDF8] border border-[#E7E5E4] hover:bg-[#F97316] hover:text-white text-[#F97316] text-sm font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                title="Edit Equipment"
              >
                <Edit2 size={14} />
                <span>Edit</span>
              </button>
              <button 
                onClick={() => handleDeleteEquipment(eq.id || eq._id)}
                className="py-2 px-3 bg-[#FFFFFF] border border-[#E7E5E4] hover:bg-red-50 text-[#FED7AA] hover:border-red-200 text-sm font-bold rounded-xl transition-colors"
                title="Delete Equipment"
              >
                Delete
              </button>
            </div>
          </div>
          )
        })}
      </div>

      {showAddModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E7E5E4] mt-10 mb-10">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <h2 className="text-2xl font-bold text-[#292524]">Add New Equipment</h2>
              <button onClick={() => setShowAddModal(false)} className="text-[#78716C] hover:text-[#292524]"><X size={24} /></button>
            </div>
            <form onSubmit={handleAddEquipment} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Equipment Name *</label>
                  <input required value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" placeholder="e.g. Treadmill Series X" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Category *</label>
                  <select required value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Brand</label>
                  <input value={formData.brand} onChange={e => setFormData({...formData, brand: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" placeholder="e.g. LifeFitness" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Quantity *</label>
                  <input type="number" min="1" required value={formData.quantity} onChange={e => setFormData({...formData, quantity: parseInt(e.target.value) || 1})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Condition</label>
                  <select value={formData.condition} onChange={e => setFormData({...formData, condition: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Status</label>
                  <select value={formData.status} onChange={e => setFormData({...formData, status: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Order">Out of Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Next Service Date</label>
                  <input type="date" value={formData.nextService} onChange={e => setFormData({...formData, nextService: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#E7E5E4]">
                <button type="button" onClick={() => setShowAddModal(false)} className="px-6 py-2 text-[#78716C] font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20">Add Equipment</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showEditModal && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-2xl w-full shadow-2xl border border-[#E7E5E4] mt-10 mb-10">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center sticky top-0 bg-white z-10 rounded-t-2xl">
              <div className="flex items-center space-x-2">
                <div className="w-9 h-9 rounded-lg bg-[#F97316]/10 text-[#F97316] flex items-center justify-center">
                  <Edit2 size={18} />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-[#292524]">Edit Equipment</h2>
                  <p className="text-xs text-[#78716C]">Modify equipment specifications and maintenance status</p>
                </div>
              </div>
              <button onClick={() => setShowEditModal(false)} className="text-[#78716C] hover:text-[#292524]"><X size={24} /></button>
            </div>
            <form onSubmit={handleSaveEdit} className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2">
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Equipment Name *</label>
                  <input required value={editFormData.name} onChange={e => setEditFormData({...editFormData, name: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" placeholder="e.g. Treadmill Series X" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Category *</label>
                  <select required value={editFormData.category} onChange={e => setEditFormData({...editFormData, category: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                    <option value="Cardio">Cardio</option>
                    <option value="Strength">Strength</option>
                    <option value="Free Weights">Free Weights</option>
                    <option value="Accessories">Accessories</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Brand</label>
                  <input value={editFormData.brand} onChange={e => setEditFormData({...editFormData, brand: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" placeholder="e.g. LifeFitness" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Quantity *</label>
                  <input type="number" min="1" required value={editFormData.quantity} onChange={e => setEditFormData({...editFormData, quantity: parseInt(e.target.value) || 1})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Condition</label>
                  <select value={editFormData.condition} onChange={e => setEditFormData({...editFormData, condition: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                    <option value="Excellent">Excellent</option>
                    <option value="Good">Good</option>
                    <option value="Fair">Fair</option>
                    <option value="Poor">Poor</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Status</label>
                  <select value={editFormData.status} onChange={e => setEditFormData({...editFormData, status: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]">
                    <option value="Active">Active</option>
                    <option value="Inactive">Inactive</option>
                    <option value="Maintenance">Maintenance</option>
                    <option value="Out of Order">Out of Order</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Next Service Date</label>
                  <input type="date" value={editFormData.nextService} onChange={e => setEditFormData({...editFormData, nextService: e.target.value})} className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]" />
                </div>
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-[#E7E5E4]">
                <button type="button" onClick={() => setShowEditModal(false)} className="px-6 py-2 text-[#78716C] font-bold hover:bg-gray-100 rounded-xl transition-colors">Cancel</button>
                <button type="submit" className="px-8 py-2 bg-[#F97316] text-white rounded-xl font-bold hover:bg-[#EA580C] transition-colors shadow-lg shadow-[#F97316]/20">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {selectedEq && (
        <div className="fixed inset-0 z-50 flex items-start justify-center p-4 sm:p-6 bg-black/60 backdrop-blur-sm overflow-y-auto">
          <div className="bg-[#FFFFFF] rounded-2xl max-w-md w-full shadow-2xl border border-[#E7E5E4] mt-20 mb-10 overflow-hidden">
            <div className="p-6 border-b border-[#E7E5E4] flex justify-between items-center bg-[#FFFDF8]">
              <h2 className="text-xl font-bold text-[#292524]">Equipment Details</h2>
              <button onClick={() => setSelectedEq(null)} className="text-[#78716C] hover:text-[#292524]"><X size={24} /></button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <span className="text-sm font-bold text-[#78716C]">Name</span>
                <p className="text-[#292524] font-semibold">{selectedEq.name}</p>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Category</span>
                  <p className="text-[#292524] font-semibold capitalize">{selectedEq.category}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Brand</span>
                  <p className="text-[#292524] font-semibold">{selectedEq.brand || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Quantity</span>
                  <p className="text-[#292524] font-semibold">{selectedEq.quantity || 1}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Status</span>
                  <p className="text-[#292524] font-semibold">{selectedEq.status || (selectedEq.condition === 'Poor' ? 'Maintenance' : 'Active')}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Condition</span>
                  <p className="text-[#292524] font-semibold">{selectedEq.condition || 'N/A'}</p>
                </div>
                <div>
                  <span className="text-sm font-bold text-[#78716C]">Next Service Date</span>
                  <p className="text-[#292524] font-semibold">{selectedEq.nextService || 'N/A'}</p>
                </div>
              </div>
            </div>
            <div className="p-6 border-t border-[#E7E5E4] bg-[#FFFDF8] flex justify-end">
              <button onClick={() => setSelectedEq(null)} className="px-6 py-2 bg-[#FFFFFF] border border-[#E7E5E4] text-[#292524] font-bold hover:bg-gray-100 rounded-xl transition-colors">Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminEquipment;
