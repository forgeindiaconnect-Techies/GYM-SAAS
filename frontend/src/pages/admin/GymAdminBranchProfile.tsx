import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Building2, MapPin, Phone, Mail, Clock, ShieldCheck, ArrowLeft, Loader2, Edit, Save, X, Activity, CheckCircle } from 'lucide-react';
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

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#34483F]" size={32} /></div>;
  if (!branch) return <div className="p-12 text-center text-red-500">Branch not found</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/branches')} className="w-10 h-10 bg-white border border-[#DCD9CD] rounded-xl flex items-center justify-center text-[#4A514D] hover:bg-[#F5F3EE] hover:text-[#34483F] transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-3xl font-bold text-[#202522] tracking-tight">{branch.branchName}</h1>
            <p className="text-[#4A514D] mt-1 text-sm font-semibold uppercase tracking-wider">Branch Code: {branch.branchCode}</p>
          </div>
        </div>
        <div className="flex items-center gap-3">
          {editMode ? (
            <>
              <button onClick={() => { setEditMode(false); setForm(branch); }} className="px-4 py-2 bg-white border border-[#DCD9CD] text-[#4A514D] font-bold rounded-xl hover:bg-gray-50 flex items-center gap-2">
                <X size={16} /> Cancel
              </button>
              <button onClick={handleSave} disabled={saving} className="px-4 py-2 bg-[#34483F] text-white font-bold rounded-xl hover:bg-[#C6A77D] flex items-center gap-2 disabled:opacity-70">
                {saving ? <Loader2 size={16} className="animate-spin" /> : <Save size={16} />} Save Changes
              </button>
            </>
          ) : (
            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-[#F2EFE8] border border-[#DCD9CD] text-[#34483F] font-bold rounded-xl hover:bg-green-50 flex items-center gap-2">
              <Edit size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white border border-[#DCD9CD] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202522] mb-4 flex items-center gap-2">
              <Building2 className="text-[#34483F]" /> Branch Information
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#4A514D] font-medium mb-1">Branch Name</label>
                {editMode ? (
                  <input type="text" value={form.branchName} onChange={e => setForm({...form, branchName: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F]" />
                ) : (
                  <p className="font-semibold text-[#202522]">{branch.branchName}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] font-medium mb-1">Phone Number</label>
                {editMode ? (
                  <input type="text" value={form.phone} onChange={e => setForm({...form, phone: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F]" />
                ) : (
                  <p className="font-semibold text-[#202522]">{branch.phone || 'N/A'}</p>
                )}
              </div>
              <div>
                <label className="block text-sm text-[#4A514D] font-medium mb-1">Email</label>
                {editMode ? (
                  <input type="email" value={form.email} onChange={e => setForm({...form, email: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F]" />
                ) : (
                  <p className="font-semibold text-[#202522]">{branch.email || 'N/A'}</p>
                )}
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DCD9CD] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202522] mb-4 flex items-center gap-2">
              <MapPin className="text-[#34483F]" /> Location Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#4A514D] font-medium mb-1">Address</label>
                {editMode ? (
                  <input type="text" value={form.location.address} onChange={e => setForm({...form, location: {...form.location, address: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F]" />
                ) : (
                  <p className="font-semibold text-[#202522]">{branch.location.address}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#4A514D] font-medium mb-1">Locality</label>
                  {editMode ? (
                    <input type="text" value={form.location.area} onChange={e => setForm({...form, location: {...form.location, area: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F]" />
                  ) : (
                    <p className="font-semibold text-[#202522]">{branch.location.area || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#4A514D] font-medium mb-1">City</label>
                  {editMode ? (
                    <input type="text" value={form.location.city} onChange={e => setForm({...form, location: {...form.location, city: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F]" />
                  ) : (
                    <p className="font-semibold text-[#202522]">{branch.location.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#4A514D] font-medium mb-1">State</label>
                  {editMode ? (
                    <input type="text" value={form.location.state} onChange={e => setForm({...form, location: {...form.location, state: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F]" />
                  ) : (
                    <p className="font-semibold text-[#202522]">{branch.location.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#4A514D] font-medium mb-1">Pincode</label>
                  {editMode ? (
                    <input type="text" value={form.location.pinCode} onChange={e => setForm({...form, location: {...form.location, pinCode: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F]" />
                  ) : (
                    <p className="font-semibold text-[#202522]">{branch.location.pinCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="bg-white border border-[#DCD9CD] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202522] mb-4 flex items-center gap-2">
              <Clock className="text-[#34483F]" /> Operating Hours
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#4A514D]">Opening Time</span>
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
                      className="w-16 border rounded-lg px-2 py-1 outline-none focus:border-[#34483F] text-center text-sm" 
                    />
                    <select 
                      value={form.operatingHours?.openingTime?.split(' ')[1] || 'AM'}
                      onChange={e => setForm({...form, operatingHours: {...form.operatingHours, openingTime: `${form.operatingHours?.openingTime?.split(' ')[0] || '06:00'} ${e.target.value}`}})}
                      className="border rounded-lg px-1 py-1 outline-none focus:border-[#34483F] text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                ) : (
                  <span className="font-bold text-[#202522]">{branch.operatingHours.openingTime}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#4A514D]">Closing Time</span>
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
                      className="w-16 border rounded-lg px-2 py-1 outline-none focus:border-[#34483F] text-center text-sm" 
                    />
                    <select 
                      value={form.operatingHours?.closingTime?.split(' ')[1] || 'PM'}
                      onChange={e => setForm({...form, operatingHours: {...form.operatingHours, closingTime: `${form.operatingHours?.closingTime?.split(' ')[0] || '10:00'} ${e.target.value}`}})}
                      className="border rounded-lg px-1 py-1 outline-none focus:border-[#34483F] text-sm"
                    >
                      <option value="AM">AM</option>
                      <option value="PM">PM</option>
                    </select>
                  </div>
                ) : (
                  <span className="font-bold text-[#202522]">{branch.operatingHours.closingTime}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#4A514D]">Approx Members</span>
                {editMode ? (
                  <input type="number" value={form.memberCapacity || ''} onChange={e => setForm({...form, memberCapacity: e.target.value})} className="w-24 border rounded-lg px-2 py-1 outline-none focus:border-[#34483F] text-right" />
                ) : (
                  <span className="font-bold text-[#202522]">{branch.memberCapacity || 'N/A'}</span>
                )}
              </div>
              <div className="flex justify-between items-center pb-2 border-b">
                <span className="text-[#4A514D]">Total Trainers</span>
                {editMode ? (
                  <input type="number" value={form.trainerCapacity || ''} onChange={e => setForm({...form, trainerCapacity: e.target.value})} className="w-24 border rounded-lg px-2 py-1 outline-none focus:border-[#34483F] text-right" />
                ) : (
                  <span className="font-bold text-[#202522]">{branch.trainerCapacity || 'N/A'}</span>
                )}
              </div>
              <div className="pt-2">
                <span className="text-[#4A514D] block mb-2">Working Days</span>
                <div className="flex flex-wrap gap-2">
                  {branch.operatingHours.workingDays.map((d: string) => (
                    <span key={d} className="px-2 py-1 bg-green-50 text-[#34483F] text-xs font-bold rounded-lg border border-green-100">{d.substring(0,3)}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white border border-[#DCD9CD] rounded-2xl p-6">
            <h3 className="text-lg font-bold text-[#202522] mb-4 flex items-center gap-2">
              <Activity className="text-[#34483F]" /> Services & Facilities
            </h3>
            <div className="space-y-4">
              <div>
                <span className="text-[#4A514D] text-sm block mb-2">Training Mode</span>
                {editMode ? (
                  <select value={form.trainingMode || 'offline'} onChange={e => setForm({...form, trainingMode: e.target.value})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#34483F] capitalize">
                    <option value="offline">Offline</option>
                    <option value="online">Online</option>
                    <option value="both">Both</option>
                  </select>
                ) : (
                  <span className="px-3 py-1 bg-[#202522] text-white text-xs font-bold rounded-full capitalize">{branch.trainingMode}</span>
                )}
              </div>
              <div>
                <span className="text-[#4A514D] text-sm block mb-2">Services</span>
                <div className="flex flex-wrap gap-2">
                  {branch.services?.map((s: string) => (
                    <span key={s} className="px-2 py-1 bg-[#F2EFE8] border border-[#DCD9CD] text-[#4A514D] text-xs font-semibold rounded-lg flex items-center gap-1"><CheckCircle size={10} className="text-[#34483F]" /> {s}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#4A514D] text-sm block mb-2">Facilities</span>
                <div className="flex flex-wrap gap-2">
                  {branch.facilities?.map((f: string) => (
                    <span key={f} className="px-2 py-1 bg-[#F2EFE8] border border-[#DCD9CD] text-[#4A514D] text-xs font-semibold rounded-lg">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GymAdminBranchProfile;
