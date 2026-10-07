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
    return <div className="flex items-center justify-center h-full p-12 text-[#78716C]">Loading profile...</div>;
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
      <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-8 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#F97316]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex flex-col md:flex-row items-start md:items-center gap-6 relative z-10">
          <div className="w-24 h-24 bg-[#FFFFFF] rounded-full border-2 border-[#F97316] flex items-center justify-center text-[#F97316] text-3xl font-bold shadow-[0_0_15px_rgba(212,255,0,0.2)]">
            {displayUser?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold text-[#292524] mb-1">{displayUser?.firstName || 'User'} {displayUser?.lastName || ''}</h1>
            <p className="text-[#F97316] font-medium capitalize mb-4">{displayUser?.subscriptionPlan || 'Member'} Plan</p>
            <div className="flex flex-wrap gap-4 text-sm text-[#78716C]">
              <div className="flex items-center gap-2"><Mail size={16} /> {displayUser?.email || 'user@example.com'}</div>
              <div className="flex items-center gap-2"><Phone size={16} /> {displayUser?.mobile || 'Not provided'}</div>
              <div className="flex items-center gap-2"><MapPin size={16} /> {displayUser?.city ? `${displayUser.city}${displayUser.pinCode ? `, ${displayUser.pinCode}` : ''}` : 'Location not provided'}</div>
            </div>
          </div>
          {!hideEdit && (
            <button 
              onClick={handleEditClick}
              className="flex items-center gap-2 px-4 py-2 bg-[#F1F5F9] text-[#292524] font-semibold hover:bg-[#FED7AA] rounded-xl transition-colors"
            >
              <Edit3 size={16} /> Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <div className="grid md:grid-cols-2 gap-6">
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Personal Details</h2>
          <div className="space-y-4">
            {[
              { label: 'Date of Birth', value: displayUser?.dateOfBirth ? new Date(displayUser.dateOfBirth).toLocaleDateString() : 'Not provided' },
              { label: 'Gender', value: displayUser?.gender || 'Not provided' },
              { label: 'Height', value: displayUser?.height ? `${displayUser.height} cm` : 'Not provided' },
              { label: 'Weight', value: displayUser?.weight ? `${displayUser.weight} kg` : 'Not provided' },
              { label: 'Emergency Contact', value: displayUser?.emergencyContact?.mobile || 'Not provided' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between py-2 border-b border-[#E7E5E4] last:border-0">
                <span className="text-[#78716C]">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#E7E5E4] rounded-2xl p-6">
          <h2 className="text-xl font-bold mb-4">Fitness Goals</h2>
          <div className="space-y-4">
            {displayUser?.fitnessGoal ? (
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E7E5E4]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#F97316]">Current Goal</span>
                </div>
                <p className="text-lg text-[#292524] font-semibold">{displayUser.fitnessGoal}</p>
                <p className="text-sm text-[#78716C] mt-2">Target set during onboarding.</p>
              </div>
            ) : (
              <div className="p-4 bg-[#FFFDF8] rounded-xl border border-dashed border-[#CBD5E1] text-center">
                <p className="text-[#78716C] mb-2">No specific fitness goal set.</p>
                {!hideEdit && <button onClick={handleEditClick} className="text-sm text-[#F97316] font-bold hover:underline">Set Your Goal</button>}
              </div>
            )}
            
            {displayUser?.experienceLevel && (
              <div className="p-4 bg-[#FFFFFF] rounded-xl border border-[#E7E5E4]">
                <div className="flex justify-between items-center mb-2">
                  <span className="font-medium text-[#292524]">Experience Level</span>
                </div>
                <p className="text-sm text-[#78716C] mt-1 font-medium">{displayUser.experienceLevel}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100] flex items-center justify-center p-4 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-white rounded-2xl w-full max-w-2xl shadow-2xl border border-[#E7E5E4] overflow-hidden flex flex-col max-h-[85vh] my-auto">
            <div className="bg-white p-6 border-b border-[#E7E5E4] flex justify-between items-center shrink-0">
              <h2 className="text-2xl font-bold text-[#292524]">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-[#F1F5F9] rounded-full transition-colors text-[#78716C] hover:text-[#292524]"
              >
                <X size={24} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-6 space-y-6 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-semibold text-[#292524] mb-2">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#292524] mb-2">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#292524] mb-2">Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value })}
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#292524] mb-2">Date of Birth</label>
                  <input
                    type="date"
                    value={formData.dateOfBirth}
                    onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#292524] mb-2">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex gap-4">
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#292524] mb-2">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-sm font-semibold text-[#292524] mb-2">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#292524] mb-2">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-[#292524] mb-2">Pincode</label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-semibold text-[#292524] mb-2">Fitness Goal</label>
                  <input
                    type="text"
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full bg-[#FFFDF8] border border-[#FED7AA] rounded-xl px-4 py-3 focus:border-[#F97316] focus:ring-2 focus:ring-[#F97316]/20 outline-none transition-all"
                    placeholder="e.g. Lose 5kg, Build Muscle, Increase Stamina"
                  />
                </div>
              </div>
              
              <div className="pt-6 border-t border-[#FED7AA] flex justify-end gap-4">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="px-6 py-3 bg-[#F1F5F9] text-[#292524] font-bold rounded-xl hover:bg-[#FED7AA] transition-colors"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="flex items-center gap-2 px-6 py-3 bg-[#F97316] text-white font-bold rounded-xl hover:bg-[#EA580C] transition-colors shadow-lg shadow-orange-500/30 disabled:opacity-70"
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