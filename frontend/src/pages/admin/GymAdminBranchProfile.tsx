import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Clock, ArrowLeft, Loader2, Edit, Save, X, Activity, CheckCircle, Plus } from 'lucide-react';
import api from '../../utils/api';

const GymAdminBranchProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
  const [planForm, setPlanForm] = useState({ name: '', price: '', duration: 'Monthly', features: '' });

  const handleOpenAddPlan = () => {
    setEditingPlanIndex(null);
    setPlanForm({ name: '', price: '', duration: 'Monthly', features: '' });
    setShowPlanModal(true);
  };

  const handleEditPlan = (index: number) => {
    const plans = editMode ? form.subscriptionPlans : branch?.subscriptionPlans;
    const planToEdit = plans?.[index];
    if (!planToEdit) return;

    if (!editMode) {
      setEditMode(true);
      setForm(branch);
    }

    setPlanForm({
      name: planToEdit.name || '',
      price: planToEdit.price !== undefined ? String(planToEdit.price) : '',
      duration: planToEdit.duration || 'Monthly',
      features: planToEdit.features || ''
    });
    setEditingPlanIndex(index);
    setShowPlanModal(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    if (editingPlanIndex !== null) {
      setForm((prev: any) => {
        const plans = [...(prev.subscriptionPlans || branch?.subscriptionPlans || [])];
        plans[editingPlanIndex] = { ...plans[editingPlanIndex], ...planForm };
        return { ...prev, subscriptionPlans: plans };
      });
    } else {
      setForm((prev: any) => ({
        ...prev,
        subscriptionPlans: [...(prev.subscriptionPlans || branch?.subscriptionPlans || []), planForm]
      }));
    }
    setShowPlanModal(false);
    setEditingPlanIndex(null);
    setPlanForm({ name: '', price: '', duration: 'Monthly', features: '' });
  };

  const handleRemovePlan = (index: number) => {
    setForm((prev: any) => {
      const plans = [...(prev.subscriptionPlans || branch?.subscriptionPlans || [])];
      plans.splice(index, 1);
      return { ...prev, subscriptionPlans: plans };
    });
  };

  const fetchBranch = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/branches/${id}`);
      if (res.data.success) {
        setBranch(res.data.branch);
        setForm(res.data.branch);
      }
    } catch (err) {
      console.error('Failed to fetch branch', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBranch();
  }, [id]);

  const handleSave = async () => {
    try {
      setSaving(true);
      const res = await api.put(`/branches/${id}`, form);
      if (res.data.success) {
        setBranch(res.data.branch);
        setEditMode(false);
      }
    } catch (err) {
      alert('Failed to update branch');
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#F97316]" size={32} /></div>;
  if (!branch) return <div className="p-12 text-center text-[#FED7AA]">Branch not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/branches')} className="w-10 h-10 bg-white border border-[#E7E5E4] rounded-xl flex items-center justify-center text-[#78716C] hover:bg-[#FFFDF8] hover:text-[#F97316] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#292524] tracking-tight">{branch.branchName}</h1>
            <p className="text-[#78716C] mt-1 text-sm font-semibold uppercase tracking-wider">Branch Code: {branch.branchCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <button onClick={() => { setEditMode(false); setForm(branch); }} className="px-4 py-2 bg-white border border-[#E7E5E4] text-[#78716C] font-bold rounded-xl hover:bg-gray-50 flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] flex items-center gap-2 disabled:opacity-70">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-[#FFFDF8] border border-[#E7E5E4] text-[#F97316] font-bold rounded-xl hover:bg-green-50 flex items-center gap-2">
              <Edit size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#292524] mb-4 flex items-center gap-2">
              <Building2 className="text-[#F97316]" /> Branch Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#78716C] font-medium mb-1">Branch Name</label>
                {editMode ? (
                  <input type="text" value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                ) : (
                  <p className="font-semibold text-[#292524]">{branch.branchName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#78716C] font-medium mb-1">Phone Number</label>
                {editMode ? (
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                ) : (
                  <p className="font-semibold text-[#292524]">{branch.phone || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#78716C] font-medium mb-1">Email</label>
                {editMode ? (
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                ) : (
                  <p className="font-semibold text-[#292524]">{branch.email || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#292524] mb-4 flex items-center gap-2">
              <MapPin className="text-[#F97316]" /> Location Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#78716C] font-medium mb-1">Address</label>
                {editMode ? (
                  <input type="text" value={form.location.address} onChange={e => setForm({...form, location: {...form.location, address: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                ) : (
                  <p className="font-semibold text-[#292524]">{branch.location.address}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#78716C] font-medium mb-1">Locality</label>
                  {editMode ? (
                    <input type="text" value={form.location.area} onChange={e => setForm({...form, location: {...form.location, area: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                  ) : (
                    <p className="font-semibold text-[#292524]">{branch.location.area || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#78716C] font-medium mb-1">City</label>
                  {editMode ? (
                    <input type="text" value={form.location.city} onChange={e => setForm({...form, location: {...form.location, city: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                  ) : (
                    <p className="font-semibold text-[#292524]">{branch.location.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#78716C] font-medium mb-1">State</label>
                  {editMode ? (
                    <input type="text" value={form.location.state} onChange={e => setForm({...form, location: {...form.location, state: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                  ) : (
                    <p className="font-semibold text-[#292524]">{branch.location.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#78716C] font-medium mb-1">Pincode</label>
                  {editMode ? (
                    <input type="text" value={form.location.pinCode} onChange={e => setForm({...form, location: {...form.location, pinCode: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                  ) : (
                    <p className="font-semibold text-[#292524]">{branch.location.pinCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#292524] mb-4 flex items-center gap-2">
              <Clock className="text-[#F97316]" /> Operating Hours
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#78716C]">Opening Time</span>
                {editMode ? (
                  <div className="flex gap-1 items-center">
                    <input 
                      type="text" 
                      maxLength={5}
                      placeholder="HH:MM"
                      value={form.operatingHours?.openingTime?.split(' ')[0] || ''} 
                      onChange={e => {
                        let val = e.target.value.replace(/[^\d:]/g, '');
                        if (val.length === 2 && !val.includes(':') && e.target.value.length === 2) val += ':';
                        setForm({...form, operatingHours: {...form.operatingHours, openingTime: `${val} ${form.operatingHours?.openingTime?.split(' ')[1] || 'AM'}`}})
                      }} 
                      className="w-16 border rounded-lg px-2 py-1 outline-none focus:border-[#F97316] text-center text-sm" 
                    />
                    <select 
                      value={form.operatingHours?.openingTime?.split(' ')[1] || 'AM'}
                      onChange={e => setForm({...form, operatingHours: {...form.operatingHours, openingTime: `${form.operatingHours?.openingTime?.split(' ')[0] || '06:00'} ${e.target.value}`}})}
                      className="border rounded-lg px-1 py-1 outline-none focus:border-[#F97316] text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                ) : (
                  <span className="font-bold text-[#292524]">{branch.operatingHours.openingTime}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#78716C]">Closing Time</span>
                {editMode ? (
                  <div className="flex gap-1 items-center">
                    <input 
                      type="text" 
                      maxLength={5}
                      placeholder="HH:MM"
                      value={form.operatingHours?.closingTime?.split(' ')[0] || ''} 
                      onChange={e => {
                        let val = e.target.value.replace(/[^\d:]/g, '');
                        if (val.length === 2 && !val.includes(':') && e.target.value.length === 2) val += ':';
                        setForm({...form, operatingHours: {...form.operatingHours, closingTime: `${val} ${form.operatingHours?.closingTime?.split(' ')[1] || 'PM'}`}})
                      }} 
                      className="w-16 border rounded-lg px-2 py-1 outline-none focus:border-[#F97316] text-center text-sm" 
                    />
                    <select 
                      value={form.operatingHours?.closingTime?.split(' ')[1] || 'PM'}
                      onChange={e => setForm({...form, operatingHours: {...form.operatingHours, closingTime: `${form.operatingHours?.closingTime?.split(' ')[0] || '10:00'} ${e.target.value}`}})}
                      className="border rounded-lg px-1 py-1 outline-none focus:border-[#F97316] text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                ) : (
                  <span className="font-bold text-[#292524]">{branch.operatingHours.closingTime}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#78716C]">Approx Members</span>
                {editMode ? (
                  <input type="number" value={form.memberCapacity || ''} onChange={e => setForm({...form, memberCapacity: e.target.value})} className="w-24 border rounded-lg px-2 py-1 outline-none focus:border-[#F97316] text-right" />
                ) : (
                  <span className="font-bold text-[#292524]">{branch.memberCapacity || 'N/A'}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#78716C]">Total Trainers</span>
                {editMode ? (
                  <input type="number" value={form.trainerCapacity || ''} onChange={e => setForm({...form, trainerCapacity: e.target.value})} className="w-24 border rounded-lg px-2 py-1 outline-none focus:border-[#F97316] text-right" />
                ) : (
                  <span className="font-bold text-[#292524]">{branch.trainerCapacity || 'N/A'}</span>
                )}
              </div>
              <div className="pt-2">
                <span className="text-[#78716C] block mb-2">Working Days</span>
                <div className="flex flex-wrap gap-2">
                  {branch.operatingHours.workingDays.map((d: string) => (
                    <span key={d} className="px-2 py-1 bg-green-50 text-[#F97316] text-xs font-bold rounded-lg border border-green-100">{d.substring(0,3)}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#292524] mb-4 flex items-center gap-2">
              <Activity className="text-[#F97316]" /> Services & Facilities
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-[#78716C] text-sm block mb-2">Training Mode</span>
                {editMode ? (
                  <select value={form.trainingMode || 'offline'} onChange={e => setForm({...form, trainingMode: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316] capitalize">
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="both">Both</option>
                  </select>
                ) : (
                  <span className="px-3 py-1 bg-[#292524] text-white text-xs font-bold rounded-full capitalize">{branch.trainingMode}</span>
                )}
              </div>
              <div>
                <span className="text-[#78716C] text-sm block mb-2">Services</span>
                <div className="flex flex-wrap gap-2">
                  {branch.services?.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-[#FFFDF8] border border-[#E7E5E4] text-[#78716C] text-xs font-semibold rounded-lg flex items-center gap-1"><CheckCircle size={10} className="text-[#F97316]" /> {s}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#78716C] text-sm block mb-2">Facilities</span>
                <div className="flex flex-wrap gap-2">
                  {branch.facilities?.map((f: string) => (
                    <span key={f} className="px-2 py-1 bg-[#FFFDF8] border border-[#E7E5E4] text-[#78716C] text-xs font-semibold rounded-lg">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#292524] flex items-center gap-2">
                <CheckCircle className="text-[#F97316]" /> Subscription Plans
              </h3>
              {editMode && (
                <button type="button" onClick={handleOpenAddPlan} className="px-3 py-1.5 bg-[#FFFDF8] border border-[#E7E5E4] text-[#F97316] text-xs font-bold rounded-lg hover:bg-green-50 flex items-center gap-1 transition-colors">
                  <Plus size={14} /> Add Plan
                </button>
              )}
            </div>
            
            {!(editMode ? form.subscriptionPlans : branch.subscriptionPlans)?.length ? (
              <p className="text-sm text-[#78716C] italic">No plans assigned.</p>
            ) : (
              <div className="space-y-3">
                {(editMode ? form.subscriptionPlans : branch.subscriptionPlans).map((plan: any, idx: number) => (
                  <div key={idx} className="border border-[#E7E5E4] rounded-xl p-3 flex justify-between items-start bg-[#F9F8F6] hover:border-[#F97316]/30 transition-colors">
                    <div className="flex-1 pr-3">
                      <h4 className="font-bold text-[#292524] text-base">{plan.name}</h4>
                      <p className="text-sm font-semibold text-[#F97316]">₹{plan.price} / {plan.duration}</p>
                      <p className="text-xs text-[#78716C] mt-1 whitespace-pre-line leading-relaxed">{plan.features}</p>
                    </div>
                    {editMode && (
                      <div className="flex items-center gap-1 shrink-0">
                        <button
                          type="button"
                          onClick={() => handleEditPlan(idx)}
                          className="text-[#F97316] hover:text-[#0f3434] hover:bg-[#F97316]/10 p-1.5 rounded-lg transition-colors"
                          title="Edit Plan & Features"
                        >
                          <Edit size={15} />
                        </button>
                        <button
                          type="button"
                          onClick={() => handleRemovePlan(idx)}
                          className="text-red-500 hover:text-red-700 hover:bg-red-50 p-1.5 rounded-lg transition-colors"
                          title="Delete Plan"
                        >
                          <X size={15} />
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>

      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#E7E5E4] pb-4">
              <h2 className="text-2xl font-bold text-[#292524]">
                {editingPlanIndex !== null ? 'Edit Subscription Plan' : 'Create Subscription Plan'}
              </h2>
              <button
                type="button"
                onClick={() => {
                  setShowPlanModal(false);
                  setEditingPlanIndex(null);
                }}
                className="text-[#78716C] hover:text-[#FED7AA] transition-colors"
              >
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleSavePlan} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#78716C] mb-1">Plan Name</label>
                <input
                  required
                  value={planForm.name}
                  onChange={e => setPlanForm({ ...planForm, name: e.target.value })}
                  className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]"
                  placeholder="e.g. Pro Tier"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Price (₹)</label>
                  <input
                    required
                    type="text"
                    value={planForm.price}
                    onChange={e => setPlanForm({ ...planForm, price: e.target.value.replace(/[^0-9.]/g, '') })}
                    className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]"
                    placeholder="499"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Duration</label>
                  <select
                    value={planForm.duration}
                    onChange={e => setPlanForm({ ...planForm, duration: e.target.value })}
                    className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]"
                  >
                    <option value="Monthly">Monthly</option>
                    <option value="Quarterly">Quarterly</option>
                    <option value="Half-Yearly">Half-Yearly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#78716C] mb-1">Features (Description & Inclusions)</label>
                <textarea
                  required
                  rows={5}
                  value={planForm.features}
                  onChange={e => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]"
                  placeholder="Enter plan features (e.g. Up to 150 Members, Everything in Free Trial, etc.)"
                />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setShowPlanModal(false);
                    setEditingPlanIndex(null);
                  }}
                  className="px-4 py-2 text-[#78716C] hover:bg-[#F1F5F9] rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 bg-[#F97316] text-white font-bold rounded-lg hover:bg-[#EA580C] transition-colors"
                >
                  {editingPlanIndex !== null ? 'Update Plan' : 'Save Plan'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminBranchProfile;
