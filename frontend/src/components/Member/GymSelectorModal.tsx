import React, { useEffect, useState } from 'react';
import {
  Building2,
  CheckCircle2,
  Dumbbell,
  Info,
  Loader2,
  Mail,
  MapPin,
  Phone,
  Search,
  Sparkles,
  Users,
  X,
  ArrowRight,
  Clock,
  Tag
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

interface GymSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentGymId?: string | null;
  onGymSelected?: (payload: { gym: any; trainers: any[]; packages: any[] }) => void;
}

const GymSelectorModal: React.FC<GymSelectorModalProps> = ({
  isOpen,
  onClose,
  currentGymId,
  onGymSelected
}) => {
  const { updateUser } = useAuth();
  const [gyms, setGyms] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [inspectGym, setInspectGym] = useState<any | null>(null);
  const [inspectDetail, setInspectDetail] = useState<any | null>(null);
  const [inspectLoading, setInspectLoading] = useState(false);
  const [selectingId, setSelectingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!isOpen) return;
    fetchPublicGyms();
  }, [isOpen]);

  const fetchPublicGyms = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get('/gyms/public');
      if (res.data?.success) {
        setGyms(res.data.gyms || []);
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Unable to load available gyms.');
    } finally {
      setLoading(false);
    }
  };

  const handleInspectGym = async (gym: any) => {
    setInspectGym(gym);
    setInspectDetail(null);
    try {
      setInspectLoading(true);
      const res = await api.get(`/gyms/public/${gym._id}`);
      if (res.data?.success) {
        setInspectDetail(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch gym details:', err);
    } finally {
      setInspectLoading(false);
    }
  };

  const handleSelectGym = async (gym: any) => {
    try {
      setSelectingId(gym._id);
      setError(null);
      const res = await api.post('/gyms/select', { gymId: gym._id });
      if (res.data?.success) {
        updateUser({
          gymId: res.data.user?.gymId || gym._id,
          gymName: res.data.gym?.name || gym.name,
          customerId: res.data.user?.customerId
        });
        if (onGymSelected) {
          onGymSelected({
            gym: res.data.gym,
            trainers: res.data.trainers || [],
            packages: res.data.packages || []
          });
        }
        onClose();
      }
    } catch (err: any) {
      setError(err.response?.data?.message || 'Failed to select gym. Please try again.');
    } finally {
      setSelectingId(null);
    }
  };

  if (!isOpen) return null;

  const filteredGyms = gyms.filter((g) => {
    const q = searchQuery.trim().toLowerCase();
    if (!q) return true;
    return (
      g.name?.toLowerCase().includes(q) ||
      g.gymType?.toLowerCase().includes(q) ||
      g.description?.toLowerCase().includes(q) ||
      g.location?.city?.toLowerCase().includes(q) ||
      g.location?.area?.toLowerCase().includes(q) ||
      g.location?.address?.toLowerCase().includes(q)
    );
  });

  const activeInspect = inspectDetail?.gym || inspectGym;
  const activeInspectPackages = inspectDetail?.packages || inspectGym?.packages || [];
  const activeInspectTrainers = inspectDetail?.trainers || [];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xs p-4 overflow-y-auto">
      <div className="bg-white rounded-3xl max-w-5xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-[#E2E8F0] overflow-hidden">
        {/* Header */}
        <div className="px-6 py-5 border-b border-[#E2E8F0] flex items-center justify-between bg-[#FFFBF7]">
          <div>
            <h2 className="text-xl font-black text-[#111827] flex items-center gap-2">
              <Building2 className="text-[#EA580C]" size={22} />
              {currentGymId ? 'Change Selected Gym' : 'Find & Choose Your Gym'}
            </h2>
            <p className="text-xs text-[#64748B] mt-0.5">
              {currentGymId
                ? 'Switch to any active gym below. Your existing memberships, bookings, payments, and progress history remain preserved.'
                : 'Select an active gym from our network to view its profile, trainers, and membership packages.'}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white border border-[#E2E8F0] text-[#64748B] hover:text-[#111827] flex items-center justify-center cursor-pointer"
          >
            <X size={18} />
          </button>
        </div>

        {/* Search */}
        {!inspectGym && (
          <div className="px-6 py-3.5 border-b border-[#F1F5F9] bg-white">
            <div className="relative">
              <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#94A3B8]" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search active gyms by name, city, area, or gym type..."
                className="w-full pl-10 pr-4 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-sm text-[#111827] focus:outline-none focus:border-[#EA580C]"
              />
            </div>
          </div>
        )}

        {error && (
          <div className="mx-6 mt-4 p-3 rounded-xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700">
            {error}
          </div>
        )}

        {/* Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {inspectGym ? (
            <div className="space-y-5">
              <button
                type="button"
                onClick={() => {
                  setInspectGym(null);
                  setInspectDetail(null);
                }}
                className="inline-flex items-center gap-1.5 text-xs font-bold text-[#EA580C] hover:underline cursor-pointer"
              >
                ← Back to all gyms
              </button>

              <div className="flex flex-col md:flex-row gap-5 items-start bg-[#F8FAFC] p-5 rounded-2xl border border-[#E2E8F0]">
                <div className="w-24 h-24 rounded-2xl bg-white border border-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0">
                  {activeInspect.logo || activeInspect.images?.[0] ? (
                    <img
                      src={activeInspect.logo || activeInspect.images[0]}
                      alt={activeInspect.name}
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <Building2 size={32} className="text-[#EA580C]" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-2xl font-black text-[#111827]">{activeInspect.name}</h3>
                    {activeInspect.gymType && (
                      <span className="px-2.5 py-0.5 bg-[#FFF7ED] text-[#C2410C] border border-[#FFEDD5] rounded-full text-xs font-bold">
                        {activeInspect.gymType}
                      </span>
                    )}
                    {String(currentGymId || '') === String(activeInspect._id) && (
                      <span className="px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1">
                        <CheckCircle2 size={12} /> Current Selected Gym
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-[#475569] mt-2 leading-relaxed">
                    {activeInspect.description || 'Active fitness facility.'}
                  </p>
                  <div className="flex flex-wrap gap-4 mt-3 text-xs text-[#64748B]">
                    <span className="flex items-center gap-1.5">
                      <MapPin size={14} className="text-[#EA580C]" />
                      {[
                        activeInspect.location?.address,
                        activeInspect.location?.area,
                        activeInspect.location?.city,
                        activeInspect.location?.state,
                        activeInspect.location?.pinCode
                      ].filter(Boolean).join(', ') || 'Address not specified'}
                    </span>
                    {activeInspect.phone && (
                      <span className="flex items-center gap-1.5">
                        <Phone size={14} className="text-[#EA580C]" /> {activeInspect.phone}
                      </span>
                    )}
                    {activeInspect.email && (
                      <span className="flex items-center gap-1.5">
                        <Mail size={14} className="text-[#EA580C]" /> {activeInspect.email}
                      </span>
                    )}
                    {activeInspect.operatingHours && (
                      <span className="flex items-center gap-1.5">
                        <Clock size={14} className="text-[#EA580C]" /> {activeInspect.operatingHours}
                      </span>
                    )}
                  </div>
                </div>
                <button
                  type="button"
                  disabled={selectingId === activeInspect._id || String(currentGymId || '') === String(activeInspect._id)}
                  onClick={() => handleSelectGym(activeInspect)}
                  className="px-5 py-2.5 bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-200 disabled:text-slate-500 text-white font-bold text-sm rounded-xl transition-colors cursor-pointer shrink-0 flex items-center gap-2"
                >
                  {selectingId === activeInspect._id ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : String(currentGymId || '') === String(activeInspect._id) ? (
                    'Currently Selected'
                  ) : (
                    <>
                      <span>{currentGymId ? 'Switch to This Gym' : 'Select This Gym'}</span>
                      <ArrowRight size={15} />
                    </>
                  )}
                </button>
              </div>

              {inspectLoading ? (
                <div className="py-10 flex justify-center">
                  <Loader2 className="animate-spin text-[#EA580C]" size={26} />
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Facilities & Services */}
                  <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white space-y-3">
                    <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                      <Sparkles size={15} className="text-[#EA580C]" /> Facilities &amp; Services
                    </h4>
                    {(activeInspect.facilities?.length || 0) === 0 && (activeInspect.services?.length || 0) === 0 ? (
                      <p className="text-xs text-[#64748B]">No facilities or services listed yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {(activeInspect.facilities || []).map((f: string, idx: number) => (
                          <span key={`f-${idx}`} className="px-2.5 py-1 bg-[#FFF7ED] text-[#C2410C] rounded-lg text-xs font-medium border border-[#FFEDD5]">
                            {f}
                          </span>
                        ))}
                        {(activeInspect.services || []).map((s: string, idx: number) => (
                          <span key={`s-${idx}`} className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                            {s}
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Equipment */}
                  <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white space-y-3">
                    <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                      <Dumbbell size={15} className="text-[#EA580C]" /> Equipment ({activeInspect.equipment?.length || 0})
                    </h4>
                    {!activeInspect.equipment || activeInspect.equipment.length === 0 ? (
                      <p className="text-xs text-[#64748B]">No equipment details listed yet.</p>
                    ) : (
                      <div className="flex flex-wrap gap-1.5">
                        {activeInspect.equipment.slice(0, 12).map((eq: any, idx: number) => (
                          <span key={idx} className="px-2.5 py-1 bg-[#F8FAFC] border border-[#E2E8F0] rounded-lg text-xs text-[#334155]">
                            {eq.name} ({eq.quantity || 1})
                          </span>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Membership Packages */}
                  <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white space-y-3">
                    <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                      <Tag size={15} className="text-[#EA580C]" /> Membership Packages
                    </h4>
                    {activeInspectPackages.length === 0 && (!activeInspect.subscriptionPlans || activeInspect.subscriptionPlans.length === 0) ? (
                      <p className="text-xs text-[#64748B]">No membership packages published by this gym yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeInspectPackages.map((pkg: any) => (
                          <div key={pkg._id} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                            <div>
                              <p className="font-bold text-[#111827]">{pkg.name}</p>
                              <p className="text-[#64748B]">{pkg.duration || 'Monthly'} • {pkg.trainingType || 'Both'}</p>
                            </div>
                            <span className="font-black text-[#EA580C]">₹{pkg.monthlyPrice ?? pkg.price ?? 0}</span>
                          </div>
                        ))}
                        {activeInspectPackages.length === 0 && activeInspect.subscriptionPlans?.map((plan: any, idx: number) => (
                          <div key={idx} className="flex items-center justify-between p-2.5 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0] text-xs">
                            <div>
                              <p className="font-bold text-[#111827]">{plan.name}</p>
                              <p className="text-[#64748B]">{plan.duration}</p>
                            </div>
                            <span className="font-black text-[#EA580C]">₹{plan.price}</span>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  {/* Active Trainers Preview */}
                  <div className="p-4 rounded-2xl border border-[#E2E8F0] bg-white space-y-3">
                    <h4 className="font-bold text-sm text-[#111827] flex items-center gap-2">
                      <Users size={15} className="text-[#EA580C]" /> Active Trainers ({activeInspectTrainers.length})
                    </h4>
                    {activeInspectTrainers.length === 0 ? (
                      <p className="text-xs text-[#64748B]">No active trainers listed for this gym yet.</p>
                    ) : (
                      <div className="space-y-2">
                        {activeInspectTrainers.slice(0, 5).map((tr: any) => (
                          <div key={tr._id} className="flex items-center gap-2.5 p-2 rounded-xl bg-[#F8FAFC] border border-[#E2E8F0]">
                            <div className="w-8 h-8 rounded-full bg-[#FFF7ED] text-[#C2410C] font-bold text-xs flex items-center justify-center overflow-hidden shrink-0">
                              {tr.profilePhoto ? <img src={tr.profilePhoto} alt={tr.name} className="w-full h-full object-cover" /> : (tr.name?.[0] || 'T')}
                            </div>
                            <div className="min-w-0 flex-1">
                              <p className="text-xs font-bold text-[#111827] truncate">{tr.name}</p>
                              <p className="text-[11px] text-[#64748B] truncate">
                                {tr.specialization || 'Certified Trainer'} • {tr.experienceYears || tr.experience || 0} yrs
                              </p>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>
          ) : loading ? (
            <div className="py-16 flex flex-col items-center justify-center gap-3 text-[#64748B]">
              <Loader2 className="animate-spin text-[#EA580C]" size={30} />
              <p className="text-sm font-medium">Loading active gyms...</p>
            </div>
          ) : filteredGyms.length === 0 ? (
            <div className="py-16 text-center space-y-2">
              <Building2 className="mx-auto text-[#94A3B8]" size={36} />
              <p className="font-bold text-[#111827]">No matching active gyms found</p>
              <p className="text-xs text-[#64748B]">Try adjusting your search criteria.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {filteredGyms.map((g) => {
                const isSelected = String(currentGymId || '') === String(g._id);
                const pkgList = g.packages || [];
                const startingPrice = pkgList.length > 0
                  ? Math.min(...pkgList.map((p: any) => Number(p.monthlyPrice ?? p.price ?? 0)))
                  : null;
                return (
                  <div
                    key={g._id}
                    className={`rounded-2xl border p-4 flex flex-col justify-between gap-4 transition-all ${
                      isSelected ? 'border-[#EA580C] bg-[#FFFBF7] shadow-sm' : 'border-[#E2E8F0] bg-white hover:border-[#FDBA74]'
                    }`}
                  >
                    <div className="space-y-3">
                      <div className="flex items-start gap-3">
                        <div className="w-16 h-16 rounded-2xl bg-[#F8FAFC] border border-[#E2E8F0] flex items-center justify-center overflow-hidden shrink-0">
                          {g.logo || g.images?.[0] ? (
                            <img src={g.logo || g.images[0]} alt={g.name} className="w-full h-full object-cover" />
                          ) : (
                            <Building2 className="text-[#EA580C]" size={24} />
                          )}
                        </div>
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center justify-between gap-2">
                            <h3 className="font-black text-[#111827] text-base truncate">{g.name}</h3>
                            {isSelected && (
                              <span className="px-2 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-[10px] font-bold shrink-0">
                                Selected
                              </span>
                            )}
                          </div>
                          <p className="text-xs text-[#64748B] flex items-center gap-1 mt-0.5 truncate">
                            <MapPin size={12} className="text-[#EA580C] shrink-0" />
                            {[g.location?.area, g.location?.city, g.location?.state].filter(Boolean).join(', ') || g.location?.address || 'Location available'}
                          </p>
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {g.gymType && (
                              <span className="px-2 py-0.5 rounded-md bg-[#FFF7ED] text-[#C2410C] text-[10px] font-bold">
                                {g.gymType}
                              </span>
                            )}
                            <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-700 text-[10px] font-bold">
                              {g.activeTrainerCount ?? 0} Active Trainers
                            </span>
                            {startingPrice !== null && (
                              <span className="px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                                From ₹{startingPrice}/mo
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {g.description && (
                        <p className="text-xs text-[#475569] line-clamp-2">{g.description}</p>
                      )}

                      <div className="flex flex-wrap gap-1.5">
                        {(g.facilities || []).slice(0, 3).map((f: string, idx: number) => (
                          <span key={idx} className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[10px] text-[#475569]">
                            {f}
                          </span>
                        ))}
                        {(g.equipment?.length || 0) > 0 && (
                          <span className="px-2 py-0.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded text-[10px] text-[#475569]">
                            {g.equipment.length} Equipment
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center gap-2 pt-2 border-t border-[#F1F5F9]">
                      <button
                        type="button"
                        onClick={() => handleInspectGym(g)}
                        className="flex-1 py-2 px-3 rounded-xl border border-[#E2E8F0] text-xs font-bold text-[#334155] hover:bg-[#F8FAFC] flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        <Info size={14} /> View Gym Details
                      </button>
                      <button
                        type="button"
                        disabled={selectingId === g._id || isSelected}
                        onClick={() => handleSelectGym(g)}
                        className="flex-1 py-2 px-3 rounded-xl bg-[#EA580C] hover:bg-[#C2410C] disabled:bg-slate-200 disabled:text-slate-500 text-white text-xs font-bold flex items-center justify-center gap-1.5 cursor-pointer"
                      >
                        {selectingId === g._id ? (
                          <Loader2 size={14} className="animate-spin" />
                        ) : isSelected ? (
                          'Selected'
                        ) : (
                          currentGymId ? 'Switch Gym' : 'Choose Gym'
                        )}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default GymSelectorModal;

