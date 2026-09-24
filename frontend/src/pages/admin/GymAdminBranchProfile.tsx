import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Clock, ShieldCheck, ArrowLeft, Loader2, Edit, Save, X, Activity, CheckCircle, Plus } from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';

const GymAdminBranchProfile = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [branch, setBranch] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [form, setForm] = useState<any>({});
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [planForm, setPlanForm] = useState({ name: '', price: '', duration: 'Monthly', features: '' });

  const handleAddPlan = (e: React.FormEvent) => {
    e.preventDefault();
    setForm((prev: any) => ({ ...prev, subscriptionPlans: [...(prev.subscriptionPlans || []), planForm] }));
    setShowPlanModal(false);
    setPlanForm({ name: '', price: '', duration: 'Monthly', features: '' });
  };

  const handleRemovePlan = (index: number) => {
    setForm((prev: any) => {
      const plans = [...(prev.subscriptionPlans || [])];
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#164A4A]" size={32} /></div>;
  if (!branch) return <div className="p-12 text-center text-[#6fa3a0]">Branch not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/branches')} className="w-10 h-10 bg-white border border-[#D3DFDA] rounded-xl flex items-center justify-center text-[#455250] hover:bg-[#F1F5F3] hover:text-[#164A4A] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#202828] tracking-tight">{branch.branchName}</h1>
            <p className="text-[#455250] mt-1 text-sm font-semibold uppercase tracking-wider">Branch Code: {branch.branchCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <button onClick={() => { setEditMode(false); setForm(branch); }} className="px-4 py-2 bg-white border border-[#D3DFDA] text-[#455250] font-bold rounded-xl hover:bg-gray-50 flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#164A4A] text-white font-bold rounded-xl hover:bg-[#C6A77D] flex items-center gap-2 disabled:opacity-70">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-[#F2EFE8] border border-[#D3DFDA] text-[#164A4A] font-bold rounded-xl hover:bg-green-50 flex items-center gap-2">
              <Edit size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202828] mb-4 flex items-center gap-2">
              <Building2 className="text-[#164A4A]" /> Branch Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#455250] font-medium mb-1">Branch Name</label>
                {editMode ? (
                  <input type="text" value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A]" />
                ) : (
                  <p className="font-semibold text-[#202828]">{branch.branchName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#455250] font-medium mb-1">Phone Number</label>
                {editMode ? (
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A]" />
                ) : (
                  <p className="font-semibold text-[#202828]">{branch.phone || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#455250] font-medium mb-1">Email</label>
                {editMode ? (
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A]" />
                ) : (
                  <p className="font-semibold text-[#202828]">{branch.email || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202828] mb-4 flex items-center gap-2">
              <MapPin className="text-[#164A4A]" /> Location Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#455250] font-medium mb-1">Address</label>
                {editMode ? (
                  <input type="text" value={form.location.address} onChange={e => setForm({...form, location: {...form.location, address: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A]" />
                ) : (
                  <p className="font-semibold text-[#202828]">{branch.location.address}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#455250] font-medium mb-1">Locality</label>
                  {editMode ? (
                    <input type="text" value={form.location.area} onChange={e => setForm({...form, location: {...form.location, area: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A]" />
                  ) : (
                    <p className="font-semibold text-[#202828]">{branch.location.area || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#455250] font-medium mb-1">City</label>
                  {editMode ? (
                    <input type="text" value={form.location.city} onChange={e => setForm({...form, location: {...form.location, city: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A]" />
                  ) : (
                    <p className="font-semibold text-[#202828]">{branch.location.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#455250] font-medium mb-1">State</label>
                  {editMode ? (
                    <input type="text" value={form.location.state} onChange={e => setForm({...form, location: {...form.location, state: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A]" />
                  ) : (
                    <p className="font-semibold text-[#202828]">{branch.location.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#455250] font-medium mb-1">Pincode</label>
                  {editMode ? (
                    <input type="text" value={form.location.pinCode} onChange={e => setForm({...form, location: {...form.location, pinCode: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A]" />
                  ) : (
                    <p className="font-semibold text-[#202828]">{branch.location.pinCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202828] mb-4 flex items-center gap-2">
              <Clock className="text-[#164A4A]" /> Operating Hours
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#455250]">Opening Time</span>
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
                      className="w-16 border rounded-lg px-2 py-1 outline-none focus:border-[#164A4A] text-center text-sm" 
                    />
                    <select 
                      value={form.operatingHours?.openingTime?.split(' ')[1] || 'AM'}
                      onChange={e => setForm({...form, operatingHours: {...form.operatingHours, openingTime: `${form.operatingHours?.openingTime?.split(' ')[0] || '06:00'} ${e.target.value}`}})}
                      className="border rounded-lg px-1 py-1 outline-none focus:border-[#164A4A] text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                ) : (
                  <span className="font-bold text-[#202828]">{branch.operatingHours.openingTime}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#455250]">Closing Time</span>
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
                      className="w-16 border rounded-lg px-2 py-1 outline-none focus:border-[#164A4A] text-center text-sm" 
                    />
                    <select 
                      value={form.operatingHours?.closingTime?.split(' ')[1] || 'PM'}
                      onChange={e => setForm({...form, operatingHours: {...form.operatingHours, closingTime: `${form.operatingHours?.closingTime?.split(' ')[0] || '10:00'} ${e.target.value}`}})}
                      className="border rounded-lg px-1 py-1 outline-none focus:border-[#164A4A] text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                ) : (
                  <span className="font-bold text-[#202828]">{branch.operatingHours.closingTime}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#455250]">Approx Members</span>
                {editMode ? (
                  <input type="number" value={form.memberCapacity || ''} onChange={e => setForm({...form, memberCapacity: e.target.value})} className="w-24 border rounded-lg px-2 py-1 outline-none focus:border-[#164A4A] text-right" />
                ) : (
                  <span className="font-bold text-[#202828]">{branch.memberCapacity || 'N/A'}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#455250]">Total Trainers</span>
                {editMode ? (
                  <input type="number" value={form.trainerCapacity || ''} onChange={e => setForm({...form, trainerCapacity: e.target.value})} className="w-24 border rounded-lg px-2 py-1 outline-none focus:border-[#164A4A] text-right" />
                ) : (
                  <span className="font-bold text-[#202828]">{branch.trainerCapacity || 'N/A'}</span>
                )}
              </div>
              <div className="pt-2">
                <span className="text-[#455250] block mb-2">Working Days</span>
                <div className="flex flex-wrap gap-2">
                  {branch.operatingHours.workingDays.map((d: string) => (
                    <span key={d} className="px-2 py-1 bg-green-50 text-[#164A4A] text-xs font-bold rounded-lg border border-green-100">{d.substring(0,3)}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202828] mb-4 flex items-center gap-2">
              <Activity className="text-[#164A4A]" /> Services & Facilities
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-[#455250] text-sm block mb-2">Training Mode</span>
                {editMode ? (
                  <select value={form.trainingMode || 'offline'} onChange={e => setForm({...form, trainingMode: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#164A4A] capitalize">
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="both">Both</option>
                  </select>
                ) : (
                  <span className="px-3 py-1 bg-[#202828] text-white text-xs font-bold rounded-full capitalize">{branch.trainingMode}</span>
                )}
              </div>
              <div>
                <span className="text-[#455250] text-sm block mb-2">Services</span>
                <div className="flex flex-wrap gap-2">
                  {branch.services?.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-[#F2EFE8] border border-[#D3DFDA] text-[#455250] text-xs font-semibold rounded-lg flex items-center gap-1"><CheckCircle size={10} className="text-[#164A4A]" /> {s}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#455250] text-sm block mb-2">Facilities</span>
                <div className="flex flex-wrap gap-2">
                  {branch.facilities?.map((f: string) => (
                    <span key={f} className="px-2 py-1 bg-[#F2EFE8] border border-[#D3DFDA] text-[#455250] text-xs font-semibold rounded-lg">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#D3DFDA] rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-[#202828] flex items-center gap-2">
                <CheckCircle className="text-[#164A4A]" /> Subscription Plans
              </h3>
              {editMode && (
                <button type="button" onClick={() => setShowPlanModal(true)} className="px-3 py-1.5 bg-[#F2EFE8] border border-[#D3DFDA] text-[#164A4A] text-xs font-bold rounded-lg hover:bg-green-50 flex items-center gap-1">
                  <Plus size={14} /> Add Plan
                </button>
              )}
            </div>
            
            {!(editMode ? form.subscriptionPlans : branch.subscriptionPlans)?.length ? (
              <p className="text-sm text-[#455250] italic">No plans assigned.</p>
            ) : (
              <div className="space-y-3">
                {(editMode ? form.subscriptionPlans : branch.subscriptionPlans).map((plan: any, idx: number) => (
                  <div key={idx} className="border border-[#D3DFDA] rounded-xl p-3 flex justify-between items-start bg-[#F9F8F6]">
                    <div>
                      <h4 className="font-bold text-[#202828]">{plan.name}</h4>
                      <p className="text-sm font-semibold text-[#164A4A]">₹{plan.price} / {plan.duration}</p>
                      <p className="text-xs text-[#455250] mt-1">{plan.features}</p>
                    </div>
                    {editMode && (
                      <button type="button" onClick={() => handleRemovePlan(idx)} className="text-[#6fa3a0] hover:bg-red-50 p-1 rounded-lg">
                        <X size={14} />
                      </button>
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
            <div className="flex justify-between items-center mb-6 border-b border-[#D3DFDA] pb-4">
              <h2 className="text-2xl font-bold text-[#202828]">Create Subscription Plan</h2>
              <button type="button" onClick={() => setShowPlanModal(false)} className="text-[#455250] hover:text-[#6fa3a0] transition-colors">
                <X size={24} />
              </button>
            </div>

            <form onSubmit={handleAddPlan} className="space-y-4">
              <div>
                <label className="block text-sm font-bold text-[#455250] mb-1">Plan Name</label>
                <input required value={planForm.name} onChange={e => setPlanForm({...planForm, name: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="e.g. Pro Tier" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#455250] mb-1">Price (₹)</label>
                  <input required type="text" value={planForm.price} onChange={e => setPlanForm({...planForm, price: e.target.value.replace(/[^0-9.]/g, '')})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="499" />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#455250] mb-1">Duration</label>
                  <select value={planForm.duration} onChange={e => setPlanForm({...planForm, duration: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]">
                    <option value="Monthly">Monthly</option>
                    <option value="Yearly">Yearly</option>
                  </select>
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#455250] mb-1">Features (comma separated)</label>
                <textarea required rows={4} value={planForm.features} onChange={e => setPlanForm({...planForm, features: e.target.value})} className="w-full border border-[#D3DFDA] rounded-lg px-4 py-2 outline-none focus:border-[#164A4A]" placeholder="Access to gym, 1 PT session, Locker access" />
              </div>
              <div className="pt-4 flex justify-end gap-3">
                <button type="button" onClick={() => setShowPlanModal(false)} className="px-4 py-2 text-[#455250] hover:bg-[#F1F5F9] rounded-lg font-medium transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-6 py-2 bg-[#164A4A] text-white font-bold rounded-lg hover:bg-[#C6A77D] transition-colors">
                  Save Plan
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
