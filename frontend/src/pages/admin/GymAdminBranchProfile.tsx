import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
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
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'annually'>('monthly');
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlanIndex, setEditingPlanIndex] = useState<number | null>(null);
  const [planForm, setPlanForm] = useState({ name: '', price: '', annualPrice: '', duration: 'Monthly', features: '' });

  const defaultBranchPlans = [
    { 
      name: 'Starter Free', 
      price: '0', 
      annualPrice: '0',
      duration: 'Monthly', 
      features: '1 branch\n50 members\n3 trainers\n5 AI analyses\n3 AI workout generations\n3 AI diet generations\nBasic chatbot\nBasic attendance\nBasic reports\nNo multi-branch management' 
    },
    { 
      name: 'Growth Plan', 
      price: '2999', 
      annualPrice: '29990',
      duration: 'Monthly', 
      features: 'Up to 3 branches\nUp to 1,000 members\n15 trainers\n20 staff\nBranch manager\nCustomer + Trainer dashboards\nComplete billing\nAttendance\nTrainer commission\nSession booking\nOnline sessions\nAI health/customer analysis\nAI workout recommendations\nAI diet recommendations\nWorkout animation/video library\nTrainer review and editing of AI output\nCustomer-trainer chat\nAI chatbot' 
    },
    { 
      name: 'Pro Plan', 
      price: '5999', 
      annualPrice: '59990',
      duration: 'Monthly', 
      features: 'Unlimited branches\nUnlimited members\nUnlimited trainers\nUnlimited staff\nCentralized Head Office Dashboard\nAll-branch consolidated analytics\nBranch comparison\nBranch-wise profit/revenue\nTrainer performance analytics\nAdvanced AI customer insights\nAI business insights\nAI member retention/churn prediction\nAdvanced AI chatbot\nAdvanced workout/diet AI\nUnlimited workout video/animation library\nAdvanced CRM\nAdvanced automation\nAdvanced notifications' 
    }
  ];

  const handleOpenAddPlan = () => {
    setEditingPlanIndex(null);
    setPlanForm({ name: '', price: '', annualPrice: '', duration: 'Monthly', features: '' });
    setShowPlanModal(true);
  };

  const handleEditPlan = (index: number) => {
    const plans = (editMode ? form.subscriptionPlans : branch?.subscriptionPlans)?.length 
      ? (editMode ? form.subscriptionPlans : branch?.subscriptionPlans) 
      : defaultBranchPlans;
    const planToEdit = plans?.[index];
    if (!planToEdit) return;

    if (!editMode) {
      setEditMode(true);
      setForm(branch);
    }

    const mPrice = planToEdit.price !== undefined ? String(planToEdit.price) : '';
    const aPrice = planToEdit.annualPrice !== undefined ? String(planToEdit.annualPrice) : (mPrice ? String(Math.round(Number(mPrice) * 10)) : '');

    setPlanForm({
      name: planToEdit.name || '',
      price: mPrice,
      annualPrice: aPrice,
      duration: planToEdit.duration || 'Monthly',
      features: planToEdit.features || ''
    });
    setEditingPlanIndex(index);
    setShowPlanModal(true);
  };

  const handleSavePlan = (e: React.FormEvent) => {
    e.preventDefault();
    const existingPlans = (form.subscriptionPlans || branch?.subscriptionPlans)?.length 
      ? (form.subscriptionPlans || branch?.subscriptionPlans) 
      : defaultBranchPlans;
    if (editingPlanIndex !== null) {
      setForm((prev: any) => {
        const plans = [...(prev.subscriptionPlans || existingPlans)];
        plans[editingPlanIndex] = { ...plans[editingPlanIndex], ...planForm };
        return { ...prev, subscriptionPlans: plans };
      });
    } else {
      setForm((prev: any) => ({
        ...prev,
        subscriptionPlans: [...(prev.subscriptionPlans || existingPlans), planForm]
      }));
    }
    setShowPlanModal(false);
    setEditingPlanIndex(null);
    setPlanForm({ name: '', price: '', annualPrice: '', duration: 'Monthly', features: '' });
  };

  const handleRemovePlan = (index: number) => {
    const existingPlans = (form.subscriptionPlans || branch?.subscriptionPlans)?.length 
      ? (form.subscriptionPlans || branch?.subscriptionPlans) 
      : defaultBranchPlans;
    setForm((prev: any) => {
      const plans = [...(prev.subscriptionPlans || existingPlans)];
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

  const getAnnualPrice = (plan: any) => {
    if (plan.annualPrice !== undefined && plan.annualPrice !== null && plan.annualPrice !== '') {
      return Number(plan.annualPrice);
    }
    const mPrice = Number(plan.price || 0);
    return Math.round(mPrice * 10);
  };

  if (loading) return <div className="flex justify-center p-12"><Loader2 className="animate-spin text-[#F97316]" size={32} /></div>;
  if (!branch) return <div className="p-12 text-center text-[#FED7AA]">Branch not found</div>;

  const currentPlans = (editMode ? form.subscriptionPlans : branch.subscriptionPlans)?.length 
    ? (editMode ? form.subscriptionPlans : branch.subscriptionPlans) 
    : defaultBranchPlans;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
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
          <Link
            to={`/admin/location?branchId=${branch._id}`}
            className="flex items-center gap-2 px-4 py-2.5 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors shadow-sm text-sm cursor-pointer"
          >
            <MapPin size={16} /> Location Settings
          </Link>
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
            <button onClick={() => setEditMode(true)} className="px-4 py-2 bg-[#FFFDF8] border border-[#E7E5E4] text-[#292524] font-bold rounded-xl hover:bg-green-50 flex items-center gap-2">
              <Edit size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>

      {/* 2-Column Grid for Details & Hours */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left Column */}
        <div className="space-y-6">
          {/* Branch Information */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
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

          {/* Location Details */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
            <h3 className="text-lg font-bold text-[#292524] mb-4 flex items-center gap-2">
              <MapPin className="text-[#F97316]" /> Location Details
            </h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm text-[#78716C] font-medium mb-1">Address</label>
                {editMode ? (
                  <input type="text" value={form.location?.address} onChange={e => setForm({...form, location: {...form.location, address: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                ) : (
                  <p className="font-semibold text-[#292524]">{branch.location?.address}</p>
                )}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-[#78716C] font-medium mb-1">Locality</label>
                  {editMode ? (
                    <input type="text" value={form.location?.area} onChange={e => setForm({...form, location: {...form.location, area: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                  ) : (
                    <p className="font-semibold text-[#292524]">{branch.location?.area || 'N/A'}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#78716C] font-medium mb-1">City</label>
                  {editMode ? (
                    <input type="text" value={form.location?.city} onChange={e => setForm({...form, location: {...form.location, city: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                  ) : (
                    <p className="font-semibold text-[#292524]">{branch.location?.city}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#78716C] font-medium mb-1">State</label>
                  {editMode ? (
                    <input type="text" value={form.location?.state} onChange={e => setForm({...form, location: {...form.location, state: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                  ) : (
                    <p className="font-semibold text-[#292524]">{branch.location?.state}</p>
                  )}
                </div>
                <div>
                  <label className="block text-sm text-[#78716C] font-medium mb-1">Pincode</label>
                  {editMode ? (
                    <input type="text" value={form.location?.pinCode} onChange={e => setForm({...form, location: {...form.location, pinCode: e.target.value}})} className="w-full border rounded-lg px-3 py-2 outline-none focus:border-[#F97316]" />
                  ) : (
                    <p className="font-semibold text-[#292524]">{branch.location?.pinCode}</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="space-y-6">
          {/* Operating Hours */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
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
                  <span className="font-bold text-[#292524]">{branch.operatingHours?.openingTime}</span>
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
                  <span className="font-bold text-[#292524]">{branch.operatingHours?.closingTime}</span>
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
                  {branch.operatingHours?.workingDays?.map((d: string) => (
                    <span key={d} className="px-2.5 py-1 bg-green-50 text-[#F97316] text-xs font-bold rounded-lg border border-green-100">{d.substring(0,3)}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Services & Facilities */}
          <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
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
                    <span key={s} className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E7E5E4] text-[#78716C] text-xs font-semibold rounded-lg flex items-center gap-1"><CheckCircle size={10} className="text-[#F97316]" /> {s}</span>
                  ))}
                </div>
              </div>
              <div>
                <span className="text-[#78716C] text-sm block mb-2">Facilities</span>
                <div className="flex flex-wrap gap-2">
                  {branch.facilities?.map((f: string) => (
                    <span key={f} className="px-2.5 py-1 bg-[#FFFDF8] border border-[#E7E5E4] text-[#78716C] text-xs font-semibold rounded-lg">{f}</span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Package Plans Section - Full Width Card */}
      <div className="bg-white border border-[#E7E5E4] rounded-2xl p-6 shadow-sm">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-5 border-b border-[#E7E5E4] pb-4">
          <div>
            <h3 className="text-lg font-bold text-[#292524] flex items-center gap-2">
              <CheckCircle className="text-[#F97316]" /> Package Plans
            </h3>
            <p className="text-xs text-[#78716C] mt-0.5">Plans and pricing options configured for this branch.</p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="bg-[#F5F5F4] p-1 rounded-xl flex items-center border border-[#E7E5E4]">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  billingCycle === 'monthly'
                    ? 'bg-[#F97316] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#292524]'
                }`}
              >
                Monthly Billed
              </button>
              <button
                type="button"
                onClick={() => setBillingCycle('annually')}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all flex items-center gap-1 ${
                  billingCycle === 'annually'
                    ? 'bg-[#F97316] text-white shadow-xs'
                    : 'text-[#78716C] hover:text-[#292524]'
                }`}
              >
                Annual Billed
                <span className="bg-[#292524] text-[#F97316] text-[9px] px-1.5 py-0.5 rounded font-extrabold uppercase ml-0.5">Save 20%</span>
              </button>
            </div>
            {editMode && (
              <button type="button" onClick={handleOpenAddPlan} className="px-3.5 py-2 bg-[#FFFDF8] border border-[#E7E5E4] text-[#F97316] text-xs font-bold rounded-xl hover:bg-green-50 flex items-center gap-1.5 transition-colors shadow-sm shrink-0">
                <Plus size={15} /> Add Plan
              </button>
            )}
          </div>
        </div>
        
        {!currentPlans?.length ? (
          <p className="text-sm text-[#78716C] italic py-4 text-center">No plans assigned to this branch.</p>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {currentPlans.map((plan: any, idx: number) => {
              const formatPlanName = (name: string) => {
                if (!name) return 'Package Plan';
                const lower = name.trim().toLowerCase();
                if (lower === 'free trial' || lower === 'trial') return 'Starter Free';
                if (lower === 'gold') return 'Growth Plan';
                if (lower === 'premium') return 'Pro Plan';
                return name;
              };

              const annualPrice = getAnnualPrice(plan);

              return (
                <div key={idx} className="border border-[#E7E5E4] rounded-xl p-4 flex flex-col justify-between bg-[#F9F8F6] hover:border-[#F97316]/30 transition-all shadow-sm relative overflow-hidden">
                  {billingCycle === 'annually' && Number(plan.price) > 0 && (
                    <div className="absolute top-0 right-0 bg-[#F97316] text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-bl-lg uppercase tracking-wider">
                      2 Months Free
                    </div>
                  )}
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2 pb-2 border-b border-[#E7E5E4]/60">
                      <div>
                        <h4 className="font-bold text-[#292524] text-base">{formatPlanName(plan.name)}</h4>
                        {billingCycle === 'annually' ? (
                          <div>
                            <p className="text-sm font-bold text-[#F97316] mt-0.5">
                              ₹{annualPrice.toLocaleString('en-IN')} <span className="text-xs text-[#78716C] font-normal">/ Annually</span>
                            </p>
                            {Number(plan.price) > 0 && (
                              <p className="text-[11px] text-emerald-600 font-semibold mt-0.5">
                                Equivalent ₹{Math.round(annualPrice / 12).toLocaleString('en-IN')}/mo Billed Annually
                              </p>
                            )}
                          </div>
                        ) : (
                          <div>
                            <p className="text-sm font-bold text-[#F97316] mt-0.5">
                              ₹{Number(plan.price).toLocaleString('en-IN')} <span className="text-xs text-[#78716C] font-normal">/ {plan.duration || 'Monthly'}</span>
                            </p>
                            {Number(plan.price) > 0 && (
                              <p className="text-[11px] text-[#78716C] font-medium mt-0.5">
                                Annual: ₹{annualPrice.toLocaleString('en-IN')}/yr <span className="text-emerald-600 font-bold">(Save 20%)</span>
                              </p>
                            )}
                          </div>
                        )}
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
                    <p className="text-xs text-[#78716C] mt-2 whitespace-pre-line leading-relaxed">{plan.features}</p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Plan Edit Modal */}
      {showPlanModal && (
        <div className="fixed inset-0 bg-black/60 z-50 flex items-center justify-center p-4">
          <div className="bg-[#FFFFFF] w-full max-w-lg rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-center mb-6 border-b border-[#E7E5E4] pb-4">
              <h2 className="text-2xl font-bold text-[#292524]">
                {editingPlanIndex !== null ? 'Edit Package Plan' : 'Create Package Plan'}
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
                  placeholder="e.g. Growth Plan"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Monthly Price (₹)</label>
                  <input
                    required
                    type="text"
                    value={planForm.price}
                    onChange={e => {
                      const val = e.target.value.replace(/[^0-9.]/g, '');
                      setPlanForm({ 
                        ...planForm, 
                        price: val,
                        annualPrice: val ? String(Math.round(Number(val) * 10)) : '' 
                      });
                    }}
                    className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]"
                    placeholder="2999"
                  />
                </div>
                <div>
                  <label className="block text-sm font-bold text-[#78716C] mb-1">Annual Price (₹)</label>
                  <input
                    type="text"
                    value={planForm.annualPrice}
                    onChange={e => setPlanForm({ ...planForm, annualPrice: e.target.value.replace(/[^0-9.]/g, '') })}
                    className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]"
                    placeholder="29990"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#78716C] mb-1">Billing Duration</label>
                <select
                  value={planForm.duration}
                  onChange={e => setPlanForm({ ...planForm, duration: e.target.value })}
                  className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]"
                >
                  <option value="Monthly">Monthly</option>
                  <option value="Quarterly">Quarterly</option>
                  <option value="Half-Yearly">Half-Yearly</option>
                  <option value="Yearly">Yearly / Annually</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-bold text-[#78716C] mb-1">Features (Description & Inclusions)</label>
                <textarea
                  required
                  rows={5}
                  value={planForm.features}
                  onChange={e => setPlanForm({ ...planForm, features: e.target.value })}
                  className="w-full border border-[#E7E5E4] rounded-lg px-4 py-2 outline-none focus:border-[#F97316]"
                  placeholder="Enter plan features..."
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
