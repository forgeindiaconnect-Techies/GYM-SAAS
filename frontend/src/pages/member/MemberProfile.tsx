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
    return <div className="flex items-center justify-center h-full p-12 text-[#57534E]">Loading profile...</div>;
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
    <div className="max-w-4xl mx-auto space-y-4 sm:space-y-6">
      <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-5 sm:p-8 relative overflow-hidden shadow-xl">
        <div className="absolute top-0 right-0 w-64 h-64 bg-[#B76E79]/5 rounded-full blur-3xl -translate-y-1/2 translate-x-1/3 pointer-events-none"></div>
        <div className="flex flex-col sm:flex-row items-center sm:items-start md:items-center gap-5 sm:gap-6 relative z-10 text-center sm:text-left">
          <div className="w-20 h-20 sm:w-24 sm:h-24 bg-[#F3E8E8] rounded-full border-2 border-[#B76E79] flex items-center justify-center text-[#B76E79] text-2xl sm:text-3xl font-bold shadow-[0_0_15px_rgba(183,110,121,0.2)] shrink-0">
            {displayUser?.firstName?.[0] || 'U'}
          </div>
          <div className="flex-1 min-w-0">
            <h1 className="text-2xl sm:text-3xl font-bold text-[#292524] mb-1 truncate">{displayUser?.firstName || 'User'} {displayUser?.lastName || ''}</h1>
            <p className="text-[#B76E79] font-semibold capitalize mb-3 text-sm sm:text-base">{displayUser?.subscriptionPlan || 'Member'} Plan</p>
            <div className="flex flex-wrap justify-center sm:justify-start gap-3 sm:gap-4 text-xs sm:text-sm text-[#57534E]">
              <div className="flex items-center gap-1.5"><Mail size={15} className="text-[#B76E79] shrink-0" /> <span className="truncate">{displayUser?.email || 'user@example.com'}</span></div>
              <div className="flex items-center gap-1.5"><Phone size={15} className="text-[#B76E79] shrink-0" /> <span>{displayUser?.mobile || 'Not provided'}</span></div>
              <div className="flex items-center gap-1.5"><MapPin size={15} className="text-[#B76E79] shrink-0" /> <span className="truncate">{displayUser?.city ? `${displayUser.city}${displayUser.pinCode ? `, ${displayUser.pinCode}` : ''}` : 'Location not provided'}</span></div>
            </div>
          </div>
          {!hideEdit && (
            <button 
              onClick={handleEditClick}
              className="w-full sm:w-auto flex items-center justify-center gap-2 px-5 py-2.5 bg-[#F3E8E8] text-[#292524] font-bold hover:bg-[#F3E8E8] border border-[#E7DADD] hover:border-[#B76E79]/50 rounded-xl transition-all cursor-pointer shadow-sm text-sm shrink-0"
            >
              <Edit3 size={15} /> Edit Profile
            </button>
          )}
        </div>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-5 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#292524] flex items-center gap-2">
            <span>Personal Details</span>
          </h2>
          <div className="space-y-3">
            {[
              { label: 'Gender', value: displayUser?.gender || 'Not provided' },
              { label: 'Height', value: displayUser?.height ? `${displayUser.height} cm` : 'Not provided' },
              { label: 'Weight', value: displayUser?.weight ? `${displayUser.weight} kg` : 'Not provided' },
              { label: 'Emergency Contact', value: displayUser?.emergencyContact?.mobile || 'Not provided' }
            ].map((item, i) => (
              <div key={i} className="flex justify-between items-center py-2.5 border-b border-[#E7DADD] last:border-0 text-xs sm:text-sm">
                <span className="text-[#57534E] font-medium">{item.label}</span>
                <span className="font-semibold text-[#292524] text-right">{item.value}</span>
              </div>
            ))}
          </div>
        </div>
        
        <div className="bg-[#FFFFFF] border border-[#E7DADD] rounded-2xl p-5 sm:p-6 shadow-lg">
          <h2 className="text-lg sm:text-xl font-bold mb-4 text-[#292524] flex items-center gap-2">
            <span>Fitness Goals</span>
          </h2>
          <div className="space-y-4">
            {displayUser?.fitnessGoal ? (
              <div className="p-4 bg-[#F3E8E8] rounded-xl border border-[#E7DADD]">
                <div className="flex justify-between items-center mb-1.5">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#B76E79]">Current Goal</span>
                </div>
                <p className="text-base sm:text-lg text-[#292524] font-bold">{displayUser.fitnessGoal}</p>
                <p className="text-xs text-[#57534E] mt-1.5">Target set during onboarding.</p>
              </div>
            ) : (
              <div className="p-5 bg-[#F3E8E8] rounded-xl border border-dashed border-[#E7DADD] text-center">
                <p className="text-xs sm:text-sm text-[#57534E] mb-2">No specific fitness goal set.</p>
                {!hideEdit && <button onClick={handleEditClick} className="text-xs sm:text-sm text-[#B76E79] font-bold hover:underline cursor-pointer">Set Your Goal</button>}
              </div>
            )}
            
            {displayUser?.experienceLevel && (
              <div className="p-4 bg-[#F3E8E8] rounded-xl border border-[#E7DADD]">
                <div className="flex justify-between items-center mb-1">
                  <span className="font-bold text-xs uppercase tracking-wider text-[#57534E]">Experience Level</span>
                </div>
                <p className="text-sm sm:text-base text-[#292524] font-semibold capitalize">{displayUser.experienceLevel}</p>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Edit Profile Modal */}
      {isEditing && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-[100] flex items-center justify-center p-3 sm:p-6 overflow-y-auto animate-fade-in">
          <div className="bg-[#FFFFFF] rounded-2xl w-full max-w-2xl shadow-2xl border border-[#E7DADD] overflow-hidden flex flex-col max-h-[90vh] my-auto">
            <div className="bg-[#FFFFFF] p-4 sm:p-6 border-b border-[#E7DADD] flex justify-between items-center shrink-0">
              <h2 className="text-xl sm:text-2xl font-bold text-[#292524]">Edit Profile</h2>
              <button 
                onClick={() => setIsEditing(false)}
                className="p-2 hover:bg-[#F3E8E8] rounded-full transition-colors text-[#57534E] hover:text-[#FFFFFF] cursor-pointer"
              >
                <X size={20} />
              </button>
            </div>
            
            <form onSubmit={handleSave} className="p-4 sm:p-6 space-y-4 sm:space-y-5 overflow-y-auto flex-1">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-5">
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">First Name</label>
                  <input
                    type="text"
                    value={formData.firstName}
                    onChange={(e) => setFormData({ ...formData, firstName: e.target.value })}
                    className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">Last Name</label>
                  <input
                    type="text"
                    value={formData.lastName}
                    onChange={(e) => setFormData({ ...formData, lastName: e.target.value })}
                    className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">Mobile</label>
                  <input
                    type="tel"
                    value={formData.mobile}
                    onChange={(e) => setFormData({ ...formData, mobile: e.target.value.replace(/\D/g, '').slice(0, 10) })}
                    maxLength={10}
                    placeholder="10-digit number"
                    className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">Gender</label>
                  <select
                    value={formData.gender}
                    onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                    className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div className="flex gap-3 sm:gap-4 sm:col-span-2">
                  <div className="flex-1">
                    <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">Height (cm)</label>
                    <input
                      type="number"
                      value={formData.height}
                      onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                      className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                    />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">Weight (kg)</label>
                    <input
                      type="number"
                      value={formData.weight}
                      onChange={(e) => setFormData({ ...formData, weight: e.target.value })}
                      className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">City</label>
                  <input
                    type="text"
                    value={formData.city}
                    onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                    className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                  />
                </div>
                <div>
                  <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">Pincode</label>
                  <input
                    type="text"
                    value={formData.pinCode}
                    onChange={(e) => setFormData({ ...formData, pinCode: e.target.value })}
                    className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs sm:text-sm font-semibold text-[#292524] mb-1.5">Fitness Goal</label>
                  <input
                    type="text"
                    value={formData.fitnessGoal}
                    onChange={(e) => setFormData({ ...formData, fitnessGoal: e.target.value })}
                    className="w-full bg-[#F3E8E8] border border-[#E7DADD] rounded-xl px-3.5 py-2.5 sm:py-3 text-xs sm:text-sm text-[#292524] focus:border-[#B76E79] focus:ring-2 focus:ring-[#B76E79]/20 outline-none transition-all"
                    placeholder="e.g. Lose 5kg, Build Muscle, Increase Stamina"
                  />
                </div>
              </div>
              
              <div className="pt-4 border-t border-[#E7DADD] flex flex-col-reverse sm:flex-row justify-end gap-3">
                <button 
                  type="button"
                  onClick={() => setIsEditing(false)}
                  className="w-full sm:w-auto px-5 py-2.5 bg-[#F3E8E8] text-[#292524] font-bold rounded-xl hover:bg-[#F3E8E8] border border-[#E7DADD] transition-colors cursor-pointer text-xs sm:text-sm"
                >
                  Cancel
                </button>
                <button 
                  type="submit"
                  disabled={isSaving}
                  className="w-full sm:w-auto flex items-center justify-center gap-2 px-6 py-2.5 bg-[#B76E79] text-white font-bold rounded-xl hover:bg-[#9F5965] transition-colors shadow-lg shadow-[#B76E79]/15 disabled:opacity-70 cursor-pointer text-xs sm:text-sm"
                >
                  {isSaving ? (
                    'Saving...'
                  ) : (
                    <>
                      <Save size={16} />
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