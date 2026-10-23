import { Mail, Phone, MapPin, Edit3, X, Save } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import { useState, useEffect } from 'react';
import api from '../../utils/api';

const MemberProfile = ({ hideEdit = false }: { hideEdit?: boolean }) => {
  const { user: authUser } = useAuth();
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Edit State
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState<any>({});
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    const fetchProfile = async () => {
      try {
        const response = await api.get('/auth/me');
        if (response.data.success) {
          setUser(response.data.user);
        }
      } catch (error) {
        console.error("Failed to fetch user profile:", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchProfile();
  }, []);

  if (isLoading) {
    return <div className="flex items-center justify-center h-full p-12 text-[#A1A1AA]">Loading profile...</div>;
  }

  // Fallback to authUser if full profile fetch fails
  const displayUser = user || authUser;

  const handleEditClick = () => {
    setFormData({
      firstName: displayUser?.firstName || '',
      lastName: displayUser?.lastName || '',
      mobile: displayUser?.mobile || '',
      city: displayUser?.city || '',
      pinCode: displayUser?.pinCode || '',
      dateOfBirth: displayUser?.dateOfBirth ? new Date(displayUser.dateOfBirth).toISOString().split('T')[0] : '',
      gender: displayUser?.gender || '',
      height: displayUser?.height || '',
      weight: displayUser?.weight || '',
      fitnessGoal: displayUser?.fitnessGoal || '',
      experienceLevel: displayUser?.experienceLevel || ''
    });
    setIsEditing(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    try {
      const response = await api.put(`/users/${displayUser.id || displayUser._id}`, formData);
      if (response.data.success) {
        setUser(response.data.user);
        setIsEditing(false);
      }
    } catch (error) {
      console.error("Failed to update profile", error);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#6366F1]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-[#FFFFFF] rounded-full border-2 border-[#6366F1] flex items-center justify-center text-[#6366F1] text-3xl font-bold shadow-[0_0_15px_rgba(212,255,0,0.2)]">
            {displayUser?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#11111F] mb-1">{displayUser?.firstName || 'User'} {displayUser?.lastName || ''}</h1>
            <p className="text-[#6366F1] font-medium capitalize mb-4">{displayUser?.subscriptionPlan || 'Member'} Plan</p>
            <div className="flex flex-wrap gap-4 text-sm text-[#A1A1AA]">
              <div className="flex items-center gap-2"><Mail size={16} /> {displayUser?.email || 'user@example.com'}</div>
              <div className="flex items-center gap-2"><Phone size={16} /> {displayUser?.mobile || 'Not provided'}</div>
              <div className="flex items-center gap-2"><MapPin size={16} /> {displayUser?.city ? `${displayUser.city}${displayUser.pinCode ? `, ${displayUser.pinCode}` : ''}` : 'Location not provided'}</div>
            </div>
          </div>
          {!hideEdit && (
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#0B0B12] text-[#11111F] font-semibold hover:bg-[#17172A] rounded-xl transition-colors"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Personal Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Gender', value: displayUser?.gender || 'Not provided' },
              { label: 'Height', value: displayUser?.height ? `${displayUser.height} cm` : 'Not provided' },
              { label: 'Weight', value: displayUser?.weight ? `${displayUser.weight} kg` : 'Not provided' },
              { label: 'Emergency Contact', value: displayUser?.emergencyContact?.mobile || 'Not provided' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-[#292940] last:border-0">
                <span className="text-[#A1A1AA]">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#292940] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Fitness Goals</h2>
          <div className="space-y-4">
            {displayUser?.fitnessGoal ? (
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#292940]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#6366F1]">Current Goal</span>
                </div>
                <p className="text-lg text-[#11111F] font-semibold">{displayUser.fitnessGoal}</p>
                <p className="text-sm text-[#A1A1AA] mt-2">Target set during onboarding.</p>
              </div>
            ) : (
              <div className="p-4 bg-[#0B0B12] rounded-xl border border-dashed border-[#292940] text-center">
                <p className="text-[#A1A1AA] mb-2">No specific fitness goal set.</p>
                {!hideEdit && <button onClick={handleEditClick} className="text-sm text-[#6366F1] font-bold hover:underline">Set Your Goal</button>}
              </div>
            )}
            
            {displayUser?.experienceLevel && (
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#292940]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#11111F]">Experience Level</span>
                </div>
                <p className="text-sm text-[#A1A1AA] mt-1 font-medium">{displayUser.experienceLevel}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-[#292940] overflow-hidden flex flex-col max-h-[85vh] my-auto">
            <div className="bg-white p-6 border-b border-[#292940] flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-[#11111F]">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-[#0B0B12] rounded-full transition-colors text-[#A1A1AA] hover:text-[#11111F]"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#11111F] mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#11111F] mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#11111F] mb-2">Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    maxLength={10}
                    placeholder="10-digit number"
                    className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#11111F] mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#11111F] mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#11111F] mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#11111F] mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#11111F] mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#11111F] mb-2">Fitness Goal</label>
                  <input
                    type="text"
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full bg-[#0B0B12] border border-[#17172A] rounded-xl px-4 py-3 focus:border-[#6366F1] focus:ring-2 focus:ring-[#6366F1]/20 outline-none transition-all"
                    placeholder="e.g. Lose 5kg, Build Muscle, Increase Stamina"
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-[#17172A] flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-[#0B0B12] text-[#11111F] font-bold rounded-xl hover:bg-[#17172A] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#6366F1] text-white font-bold rounded-xl hover:bg-[#4F46E5] transition-colors shadow-lg shadow-teal-900/10 disabled:opacity-70"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save size={20} />
                      Save Changes
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberProfile;