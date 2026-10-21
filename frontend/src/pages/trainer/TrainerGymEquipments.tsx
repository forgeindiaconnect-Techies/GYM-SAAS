import React, { useState, useEffect } from 'react';
import {
  Wrench, Search, CheckCircle2, AlertTriangle, ShieldCheck,
  RefreshCw, Dumbbell, Activity, Check, X, Sparkles, Filter,
  Building2, Calendar, Layers, ExternalLink
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface GymEquipmentItem {
  _id?: string;
  id?: string;
  name: string;
  category: string;
  brand?: string;
  quantity: number;
  condition: string;
  status: string;
  availability: string;
  nextService?: string;
  image?: string;
  isApproved?: boolean;
  approvedBy?: string;
  approvedByName?: string;
  approvedAt?: string;
}

const TrainerGymEquipments: React.FC = () => {
  const { user } = useAuth();
  const [equipments, setEquipments] = useState<GymEquipmentItem[]>([]);
  const [gymName, setGymName] = useState('Gym');
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Approved' | 'Pending'>('All');
  const [approvingId, setApprovingId] = useState<string | null>(null);
  const [successToast, setSuccessToast] = useState('');

  useEffect(() => {
    fetchEquipments();
  }, []);

  const fetchEquipments = async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-plans/equipments/trainer');
      if (res.data?.success) {
        setEquipments(res.data.equipment || []);
        if (res.data.gymName) setGymName(res.data.gymName);
      }
    } catch (err) {
      console.error('Failed to load gym equipments:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleToggleApproval = async (eq: GymEquipmentItem) => {
    const eqId = eq._id || eq.id;
    if (!eqId) return;

    const nextApproved = !eq.isApproved;
    try {
      setApprovingId(eqId);
      const res = await api.patch(`/trainer-plans/equipments/${eqId}/approve`, {
        isApproved: nextApproved
      });

      if (res.data?.success) {
        setEquipments(prev => prev.map(item => {
          if ((item._id && item._id === eqId) || item.id === eqId) {
            return {
              ...item,
              isApproved: nextApproved,
              approvedByName: nextApproved ? `${user?.firstName || ''} ${user?.lastName || ''}`.trim() || 'Trainer' : undefined,
              approvedAt: nextApproved ? new Date().toISOString() : undefined
            };
          }
          return item;
        }));

        setSuccessToast(
          nextApproved
            ? `"${eq.name}" has been Approved and is now LIVE on customer dashboard!`
            : `"${eq.name}" approval removed from customer dashboard.`
        );
        setTimeout(() => setSuccessToast(''), 4000);
      }
    } catch (err: any) {
      console.error('Failed to update equipment approval:', err);
      alert(err.response?.data?.message || 'Failed to update equipment approval status');
    } finally {
      setApprovingId(null);
    }
  };

  const handleApproveAll = async () => {
    const pendingItems = equipments.filter(e => !e.isApproved);
    if (pendingItems.length === 0) {
      alert('All equipments are already approved!');
      return;
    }

    if (!confirm(`Approve all ${pendingItems.length} equipments for the customer dashboard?`)) return;

    for (const item of pendingItems) {
      const eqId = item._id || item.id;
      if (eqId) {
        try {
          await api.patch(`/trainer-plans/equipments/${eqId}/approve`, { isApproved: true });
        } catch (_) {}
      }
    }

    fetchEquipments();
    setSuccessToast(`All equipments approved! They are now visible on the customer dashboard.`);
    setTimeout(() => setSuccessToast(''), 4000);
  };

  // Categories list
  const categories = ['All', ...Array.from(new Set(equipments.map(e => e.category).filter(Boolean)))];

  // Filtered list
  const filtered = equipments.filter(e => {
    const matchesSearch =
      e.name.toLowerCase().includes(search.toLowerCase()) ||
      (e.brand && e.brand.toLowerCase().includes(search.toLowerCase())) ||
      e.category.toLowerCase().includes(search.toLowerCase());

    const matchesCategory = selectedCategory === 'All' || e.category === selectedCategory;

    const matchesStatus =
      statusFilter === 'All' ||
      (statusFilter === 'Approved' && e.isApproved) ||
      (statusFilter === 'Pending' && !e.isApproved);

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const totalCount = equipments.length;
  const approvedCount = equipments.filter(e => e.isApproved).length;
  const pendingCount = totalCount - approvedCount;

  return (
    <div className="max-w-7xl mx-auto space-y-6 pb-16 animate-fade-in">
      {/* Toast Alert */}
      {successToast && (
        <div className="fixed top-6 right-6 z-50 bg-emerald-600 text-white font-bold text-sm px-5 py-3.5 rounded-2xl shadow-xl flex items-center gap-3 animate-in slide-in-from-top-4">
          <CheckCircle2 size={20} className="shrink-0" />
          <span>{successToast}</span>
          <button onClick={() => setSuccessToast('')} className="ml-2 hover:opacity-80">
            <X size={16} />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white border border-[#E5DDEB] rounded-3xl p-6 md:p-8 shadow-sm">
        <div>
          <div className="flex items-center gap-2 mb-1.5">
            <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#A991D4]/10 text-[#A991D4] flex items-center gap-1.5">
              <Wrench size={13} /> Gym Equipment Approvals
            </span>
            <span className="text-xs text-[#6B5E78]">• {gymName} Equipment Inventory</span>
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-[#292431] tracking-tight">
            Gym Equipments Management
          </h1>
          <p className="text-sm text-[#6B5E78] mt-1 max-w-2xl">
            Equipments added by gym owners appear here. Click <strong>Approval</strong> on any equipment to verify safety and automatically publish it to the customer dashboard.
          </p>
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto">
          <button
            onClick={fetchEquipments}
            className="p-2.5 text-[#6B5E78] hover:text-[#292431] bg-[#F7F4FA] border border-[#E5DDEB] rounded-2xl transition-all hover:bg-[#E9DFF4]/30"
            title="Refresh equipment list"
          >
            <RefreshCw size={18} className={loading ? 'animate-spin' : ''} />
          </button>
          {pendingCount > 0 && (
            <button
              onClick={handleApproveAll}
              className="flex-1 md:flex-none px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-2xl font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <CheckCircle2 size={16} /> Approve All Pending ({pendingCount})
            </button>
          )}
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="bg-white border border-[#E5DDEB] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#6B5E78] uppercase tracking-wider">Total Equipments</span>
            <Layers size={18} className="text-[#A991D4]" />
          </div>
          <div className="text-3xl font-black text-[#292431]">{totalCount}</div>
          <p className="text-[11px] text-[#6B5E78] mt-1">Added by gym owner</p>
        </div>

        <div className="bg-white border border-emerald-200 rounded-2xl p-5 shadow-xs bg-emerald-50/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-emerald-800 uppercase tracking-wider">Approved for Customers</span>
            <ShieldCheck size={18} className="text-emerald-600" />
          </div>
          <div className="text-3xl font-black text-emerald-700">{approvedCount}</div>
          <p className="text-[11px] text-emerald-600 mt-1">Live on customer dashboard</p>
        </div>

        <div className="bg-white border border-amber-200 rounded-2xl p-5 shadow-xs bg-amber-50/20">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-amber-800 uppercase tracking-wider">Pending Approval</span>
            <AlertTriangle size={18} className="text-amber-500" />
          </div>
          <div className="text-3xl font-black text-amber-700">{pendingCount}</div>
          <p className="text-[11px] text-amber-600 mt-1">Needs trainer verification</p>
        </div>

        <div className="bg-white border border-[#E5DDEB] rounded-2xl p-5 shadow-xs">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-bold text-[#6B5E78] uppercase tracking-wider">Service Status</span>
            <Activity size={18} className="text-blue-500" />
          </div>
          <div className="text-3xl font-black text-[#292431]">
            {equipments.filter(e => e.condition === 'Good' || e.condition === 'Excellent').length}
          </div>
          <p className="text-[11px] text-[#6B5E78] mt-1">Operational condition</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-[#E5DDEB] rounded-2xl p-4 shadow-sm flex flex-col md:flex-row justify-between items-center gap-3">
        <div className="relative flex-1 w-full md:w-auto">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#6B5E78]" />
          <input
            type="text"
            placeholder="Search equipment by name, brand, or category..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F7F4FA] border border-[#E5DDEB] rounded-xl text-sm outline-none focus:border-[#A991D4] text-[#292431]"
          />
        </div>

        {/* Category Pills */}
        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-1 md:pb-0 scrollbar-none">
          {categories.slice(0, 5).map(cat => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap ${
                selectedCategory === cat
                  ? 'bg-[#A991D4] text-[#292431]'
                  : 'bg-[#F7F4FA] text-[#6B5E78] hover:bg-[#E9DFF4]'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* Status Filter */}
        <div className="flex items-center gap-1.5 border-l border-[#E5DDEB] pl-3 shrink-0">
          {(['All', 'Approved', 'Pending'] as const).map(st => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-2.5 py-1 rounded-lg text-xs font-bold transition-colors ${
                statusFilter === st
                  ? 'bg-stone-900 text-white'
                  : 'text-[#6B5E78] hover:bg-stone-100'
              }`}
            >
              {st}
            </button>
          ))}
        </div>
      </div>

      {/* Equipment Grid */}
      {loading ? (
        <div className="text-center py-20 text-[#6B5E78]">
          <div className="w-10 h-10 border-4 border-[#A991D4] border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <p className="font-semibold text-sm">Loading gym equipments...</p>
        </div>
      ) : filtered.length === 0 ? (
        <div className="bg-white border border-[#E5DDEB] rounded-3xl p-12 text-center">
          <Wrench size={48} className="mx-auto text-[#6B5E78] mb-3" />
          <h3 className="text-base font-bold text-[#292431]">No equipments found</h3>
          <p className="text-xs text-[#6B5E78] mt-1">
            {search ? 'Try clearing your search query' : 'Equipments added by gym owners will automatically appear here for trainer review and approval.'}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filtered.map((eq, idx) => {
            const isApproved = Boolean(eq.isApproved);
            const eqId = eq._id || eq.id || String(idx);
            const isProcessing = approvingId === eqId;

            return (
              <div
                key={eqId}
                className={`bg-white border rounded-3xl p-6 shadow-sm hover:shadow-md transition-all flex flex-col justify-between ${
                  isApproved ? 'border-emerald-200 ring-1 ring-emerald-500/10' : 'border-[#E5DDEB]'
                }`}
              >
                <div>
                  {/* Status Badges */}
                  <div className="flex justify-between items-start gap-2 mb-3">
                    <span className="px-2.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider bg-orange-50 text-orange-700 border border-orange-200">
                      {eq.category}
                    </span>
                    <span
                      className={`px-2.5 py-1 rounded-full text-[11px] font-extrabold flex items-center gap-1 ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                          : 'bg-amber-100 text-amber-800 border border-amber-300'
                      }`}
                    >
                      {isApproved ? (
                        <>
                          <CheckCircle2 size={12} className="text-emerald-700" /> Approved
                        </>
                      ) : (
                        <>
                          <AlertTriangle size={12} className="text-amber-700" /> Pending Approval
                        </>
                      )}
                    </span>
                  </div>

                  {/* Equipment Title & Brand */}
                  <h3 className="font-extrabold text-lg text-[#292431] mb-1 leading-snug">
                    {eq.name}
                  </h3>
                  {eq.brand && (
                    <p className="text-xs font-semibold text-[#6B5E78] mb-4">
                      Brand: <span className="text-[#292431]">{eq.brand}</span>
                    </p>
                  )}

                  {/* Attributes Details */}
                  <div className="grid grid-cols-2 gap-2 bg-[#F7F4FA] p-3 rounded-2xl border border-[#E5DDEB] text-xs mb-4">
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E78] block">Quantity</span>
                      <strong className="text-[#292431]">{eq.quantity || 1} Units</strong>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E78] block">Condition</span>
                      <span className="font-semibold text-emerald-700">{eq.condition || 'Good'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E78] block">Availability</span>
                      <span className="font-semibold text-[#292431]">{eq.availability || 'Available'}</span>
                    </div>
                    <div>
                      <span className="text-[10px] uppercase font-bold text-[#6B5E78] block">Next Service</span>
                      <span className="font-medium text-[#6B5E78]">{eq.nextService || 'Up to date'}</span>
                    </div>
                  </div>

                  {/* Trainer Approval Meta */}
                  {isApproved && (
                    <div className="bg-emerald-50/70 p-3 rounded-xl border border-emerald-200 text-[11px] text-emerald-900 mb-4 flex items-center justify-between">
                      <div className="flex items-center gap-1.5">
                        <ShieldCheck size={14} className="text-emerald-600 shrink-0" />
                        <span>Verified by {eq.approvedByName || 'Trainer'}</span>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                        Live on Customer App
                      </span>
                    </div>
                  )}
                </div>

                {/* APPROVAL ACTION BUTTON */}
                <div className="pt-3 border-t border-[#E5DDEB] mt-2">
                  <button
                    onClick={() => handleToggleApproval(eq)}
                    disabled={isProcessing}
                    className={`w-full py-2.5 px-4 rounded-xl text-xs font-extrabold transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer ${
                      isApproved
                        ? 'bg-emerald-50 hover:bg-rose-50 text-emerald-800 hover:text-rose-700 border border-emerald-300 hover:border-rose-300'
                        : 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-emerald-600/20'
                    }`}
                  >
                    {isProcessing ? (
                      <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
                    ) : isApproved ? (
                      <>
                        <CheckCircle2 size={15} className="text-emerald-600" />
                        <span>Approved (Click to Revoke)</span>
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={15} />
                        <span>Approval & Publish to Customer</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TrainerGymEquipments;
