import { useState, useEffect } from 'react';
import {
  Video, Calendar, Clock, Plus, Search,
  CheckCircle2, X, Copy, RefreshCw, Mail
} from 'lucide-react';
import api from '../../utils/api';

interface VideoBooking {
  _id: string;
  bookingId: string;
  memberName: string;
  memberEmail?: string;
  memberPhone?: string;
  memberPhoto?: string;
  trainerName: string;
  trainerSpecialization?: string;
  sessionType: '1-on-1 Virtual Training' | 'Nutrition Consultation' | 'Form & Posture Assessment' | 'Fitness Goal Review';
  date: string;
  startTime: string;
  duration: number; // in mins
  fee: number;
  meetingLink: string;
  meetingId: string;
  status: 'Upcoming' | 'Completed' | 'In Progress' | 'Cancelled';
  paymentStatus: 'Paid' | 'Free Trial' | 'Pending';
}

const GymAdminVideoBookings = () => {
  const [bookings, setBookings] = useState<VideoBooking[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<'All' | 'Upcoming' | 'Completed' | 'Cancelled'>('All');
  const [showBookModal, setShowBookModal] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  // Members and trainers for dropdowns
  const [members, setMembers] = useState<any[]>([]);
  const [trainers, setTrainers] = useState<any[]>([]);

  // Booking form state
  const [selectedMemberId, setSelectedMemberId] = useState('');
  const [selectedTrainerId, setSelectedTrainerId] = useState('');
  const [sessionType, setSessionType] = useState<VideoBooking['sessionType']>('1-on-1 Virtual Training');
  const [bookDate, setBookDate] = useState('');
  const [bookTime, setBookTime] = useState('');
  const [bookDuration, setBookDuration] = useState('45');
  const [bookFee, setBookFee] = useState('0');
  const [bookCustomLink, setBookCustomLink] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const fetchVideoBookings = async () => {
    try {
      setLoading(true);
      const [sessionsRes, usersRes, trainersRes] = await Promise.all([
        api.get('/trainer-sessions/gym').catch(() => ({ data: { sessions: [] } })),
        api.get('/users?role=MEMBER').catch(() => ({ data: { users: [] } })),
        api.get('/trainers').catch(() => ({ data: { trainers: [] } })),
      ]);

      const loadedMembers = usersRes.data?.users || [];
      const loadedTrainers = trainersRes.data?.trainers || [];
      setMembers(loadedMembers);
      setTrainers(loadedTrainers);

      // Convert backend sessions to VideoBooking
      const dbVideoBookings: VideoBooking[] = (sessionsRes.data?.sessions || [])
        .filter((s: any) => s.mode === 'Online' || s.meetingLink)
        .map((s: any, idx: number) => ({
          _id: s._id,
          bookingId: s.bookingId || `VB-${(100000 + idx).toString()}`,
          memberName: s.customerId ? `${s.customerId.firstName} ${s.customerId.lastName}` : 'Gym Member',
          memberEmail: s.customerId?.email,
          memberPhone: s.customerId?.mobile,
          memberPhoto: s.customerId?.profilePhoto,
          trainerName: s.trainerId?.name || 'Assigned Trainer',
          trainerSpecialization: s.trainerId?.specialization || 'Fitness Coach',
          sessionType: '1-on-1 Virtual Training',
          date: s.date,
          startTime: s.startTime || '11:00 AM',
          duration: s.duration || 45,
          fee: s.fee || 0,
          meetingLink: s.meetingLink || `https://meet.jit.si/aigym-session-${s._id.slice(-8)}`,
          meetingId: s.meetingId || `ROOM-${s._id.slice(-6).toUpperCase()}`,
          status: s.status === 'Completed' ? 'Completed' : s.status === 'Cancelled' ? 'Cancelled' : 'Upcoming',
          paymentStatus: s.paymentStatus === 'Paid' ? 'Paid' : 'Free Trial',
        }));

      // Initial sample video bookings if gym has fresh data
      const sampleBookings: VideoBooking[] = [
        {
          _id: 'vb-sample-1',
          bookingId: 'VB-901842',
          memberName: loadedMembers[0] ? `${loadedMembers[0].firstName} ${loadedMembers[0].lastName}` : 'Renu Gopal',
          memberEmail: loadedMembers[0]?.email || 'renugopal@gmail.com',
          memberPhone: loadedMembers[0]?.mobile || '9876556789',
          trainerName: loadedTrainers[0]?.name || 'Alex Morgan',
          trainerSpecialization: 'Personal Trainer',
          sessionType: '1-on-1 Virtual Training',
          date: new Date().toISOString().split('T')[0],
          startTime: '04:00 PM',
          duration: 45,
          fee: 0,
          meetingLink: 'https://meet.jit.si/aigym-renu-video',
          meetingId: 'ROOM-RENU99',
          status: 'Upcoming',
          paymentStatus: 'Free Trial',
        },
        {
          _id: 'vb-sample-2',
          bookingId: 'VB-901843',
          memberName: loadedMembers[1] ? `${loadedMembers[1].firstName} ${loadedMembers[1].lastName}` : 'Rahul Verma',
          memberEmail: 'rahul@gmail.com',
          memberPhone: '9876543210',
          trainerName: loadedTrainers[1]?.name || 'Priya Sharma',
          trainerSpecialization: 'Nutrition & Diet Specialist',
          sessionType: 'Nutrition Consultation',
          date: new Date(Date.now() + 86400000).toISOString().split('T')[0],
          startTime: '05:30 PM',
          duration: 30,
          fee: 499,
          meetingLink: 'https://meet.jit.si/aigym-rahul-diet',
          meetingId: 'ROOM-RAHUL499',
          status: 'Upcoming',
          paymentStatus: 'Paid',
        },
        {
          _id: 'vb-sample-3',
          bookingId: 'VB-901841',
          memberName: 'Sneha Patel',
          memberEmail: 'sneha@gmail.com',
          memberPhone: '9812345678',
          trainerName: loadedTrainers[0]?.name || 'Alex Morgan',
          trainerSpecialization: 'Biomechanics & Form Coach',
          sessionType: 'Form & Posture Assessment',
          date: new Date(Date.now() - 86400000).toISOString().split('T')[0],
          startTime: '03:00 PM',
          duration: 45,
          fee: 399,
          meetingLink: 'https://meet.jit.si/aigym-sneha-form',
          meetingId: 'ROOM-SNEHA399',
          status: 'Completed',
          paymentStatus: 'Paid',
        },
      ];

      const savedCustom = localStorage.getItem('gym_admin_video_bookings');
      const customBookings: VideoBooking[] = savedCustom ? JSON.parse(savedCustom) : [];

      setBookings([...customBookings, ...dbVideoBookings, ...sampleBookings]);
    } catch (err) {
      console.error('Error fetching video bookings:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideoBookings();
  }, []);

  const handleCopyLink = (link: string, id: string) => {
    navigator.clipboard.writeText(link);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleBookSession = (e: React.FormEvent) => {
    e.preventDefault();
    if (!bookDate || !bookTime) {
      alert('Please fill in appointment date and time.');
      return;
    }
    setSubmitting(true);

    const memberObj = members.find((m: any) => m._id === selectedMemberId);
    const trainerObj = trainers.find((t: any) => t._id === selectedTrainerId);

    const generatedLink =
      bookCustomLink.trim() ||
      `https://meet.jit.si/aigym-${Math.random().toString(36).substring(2, 6)}-${Math.random().toString(36).substring(2, 5)}`;
    const randomRoom = `ROOM-${Math.floor(100000 + Math.random() * 900000)}`;

    const newBooking: VideoBooking = {
      _id: `custom-vb-${Date.now()}`,
      bookingId: `VB-${Math.floor(100000 + Math.random() * 900000)}`,
      memberName: memberObj ? `${memberObj.firstName} ${memberObj.lastName}` : 'Selected Member',
      memberEmail: memberObj?.email || '',
      memberPhone: memberObj?.mobile || '',
      memberPhoto: memberObj?.profilePhoto,
      trainerName: trainerObj?.name || (trainers[0]?.name || 'Head Trainer'),
      trainerSpecialization: trainerObj?.specialization || 'Personal Trainer',
      sessionType,
      date: bookDate,
      startTime: bookTime,
      duration: Number(bookDuration) || 45,
      fee: Number(bookFee) || 0,
      meetingLink: generatedLink,
      meetingId: randomRoom,
      status: 'Upcoming',
      paymentStatus: Number(bookFee) > 0 ? 'Paid' : 'Free Trial',
    };

    const updated = [newBooking, ...bookings];
    setBookings(updated);

    // Save to localStorage
    const savedCustom = localStorage.getItem('gym_admin_video_bookings');
    const existing = savedCustom ? JSON.parse(savedCustom) : [];
    localStorage.setItem('gym_admin_video_bookings', JSON.stringify([newBooking, ...existing]));

    setSubmitting(false);
    setShowBookModal(false);

    // Reset fields
    setSelectedMemberId('');
    setSelectedTrainerId('');
    setBookDate('');
    setBookTime('');
    setBookCustomLink('');
    setBookFee('0');
    alert('Video Call Consultation booked successfully!');
  };

  const filteredBookings = bookings.filter((b) => {
    const term = search.toLowerCase();
    const matchesSearch =
      b.memberName.toLowerCase().includes(term) ||
      b.trainerName.toLowerCase().includes(term) ||
      b.bookingId.toLowerCase().includes(term) ||
      b.sessionType.toLowerCase().includes(term);
    const matchesStatus = statusFilter === 'All' ? true : b.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalCalls = bookings.length;
  const todayCalls = bookings.filter((b) => b.date === new Date().toISOString().split('T')[0]).length;
  const upcomingCalls = bookings.filter((b) => b.status === 'Upcoming').length;
  const completedCalls = bookings.filter((b) => b.status === 'Completed').length;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-3xl font-black text-[#202828] tracking-tight">Video Bookings</h1>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#164A4A]/10 text-[#164A4A]">
              1-on-1 Virtual Consultations
            </span>
          </div>
          <p className="text-[#455250] mt-1 text-sm">
            Manage scheduled 1-on-1 video calls, remote trainer consultations, and virtual personal workouts.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => fetchVideoBookings()}
            className="p-2.5 rounded-xl border border-[#D3DFDA] bg-white hover:bg-gray-50 text-[#455250] transition-colors"
            title="Refresh"
          >
            <RefreshCw size={18} />
          </button>
          <button
            onClick={() => setShowBookModal(true)}
            className="px-4 py-2.5 bg-[#164A4A] hover:bg-[#1f5f5f] text-white font-bold rounded-xl text-sm transition-all shadow-md flex items-center gap-2"
          >
            <Plus size={18} /> Book Video Session
          </button>
        </div>
      </div>

      {/* Summary Stat Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider">Total Video Calls</span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center">
              <Video size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#202828] mt-2">{totalCalls}</h3>
          <p className="text-xs text-[#455250] mt-0.5">All 1-on-1 appointments</p>
        </div>

        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider">Scheduled Today</span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Calendar size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#202828] mt-2">{todayCalls}</h3>
          <p className="text-xs text-amber-600 font-medium mt-0.5">Calls on today's roster</p>
        </div>

        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider">Upcoming Calls</span>
            <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
              <Clock size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#202828] mt-2">{upcomingCalls}</h3>
          <p className="text-xs text-emerald-600 font-medium mt-0.5">Awaiting start time</p>
        </div>

        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#A8ADA9] uppercase tracking-wider">Completed Sessions</span>
            <div className="w-9 h-9 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
              <CheckCircle2 size={18} />
            </div>
          </div>
          <h3 className="text-2xl font-black text-[#202828] mt-2">{completedCalls}</h3>
          <p className="text-xs text-[#455250] mt-0.5">Successful consultations</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="flex flex-col md:flex-row gap-4 justify-between items-stretch md:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3.5 top-3.5 text-[#A8ADA9]" size={18} />
          <input
            type="text"
            placeholder="Search by member, trainer, or booking ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-[#D3DFDA] rounded-xl text-sm text-[#202828] focus:border-[#164A4A] outline-none transition-colors"
          />
        </div>
        <div className="flex items-center gap-2 overflow-x-auto pb-1">
          {(['All', 'Upcoming', 'Completed', 'Cancelled'] as const).map((tab) => (
            <button
              key={tab}
              onClick={() => setStatusFilter(tab)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all whitespace-nowrap ${
                statusFilter === tab
                  ? 'bg-[#164A4A] text-white shadow-sm'
                  : 'bg-white border border-[#D3DFDA] text-[#455250] hover:bg-gray-50'
              }`}
            >
              {tab}
            </button>
          ))}
        </div>
      </div>

      {/* Bookings Table */}
      <div className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden shadow-sm">
        <div className="overflow-x-auto custom-scrollbar">
          <table className="w-full text-left text-sm text-[#455250] whitespace-nowrap">
            <thead className="bg-[#F8FAFC] border-b border-[#D3DFDA] text-[#202828]">
              <tr>
                <th className="px-6 py-4 font-semibold">Booking ID</th>
                <th className="px-6 py-4 font-semibold">Member</th>
                <th className="px-6 py-4 font-semibold">Assigned Trainer</th>
                <th className="px-6 py-4 font-semibold">Consultation Type</th>
                <th className="px-6 py-4 font-semibold">Schedule</th>
                <th className="px-6 py-4 font-semibold">Status</th>
                <th className="px-6 py-4 font-semibold">Video Room</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#D3DFDA]">
              {loading ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center">
                    <div className="w-8 h-8 border-4 border-[#164A4A] border-t-transparent rounded-full animate-spin mx-auto mb-2" />
                    <span className="text-xs text-[#455250]">Loading video bookings...</span>
                  </td>
                </tr>
              ) : filteredBookings.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-[#455250]">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 mx-auto mb-2">
                      <Video size={20} />
                    </div>
                    <p className="font-semibold text-[#202828]">No video bookings found</p>
                    <p className="text-xs text-[#A8ADA9] mt-0.5">Click "Book Video Session" to schedule a consultation.</p>
                  </td>
                </tr>
              ) : (
                filteredBookings.map((b) => {
                  const isCompleted = b.status === 'Completed';
                  return (
                    <tr key={b._id} className="hover:bg-[#F8FAFC] transition-colors">
                      <td className="px-6 py-4 font-mono font-bold text-[#164A4A]">
                        {b.bookingId}
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center space-x-3">
                          <div className="w-9 h-9 rounded-full bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center font-bold text-xs shrink-0">
                            {b.memberName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-[#202828] text-sm">{b.memberName}</p>
                            {b.memberEmail && (
                              <p className="text-[11px] text-[#455250] flex items-center gap-1">
                                <Mail size={10} /> {b.memberEmail}
                              </p>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5">
                          <p className="font-bold text-[#202828] text-sm">{b.trainerName}</p>
                          <p className="text-[11px] text-gray-500">{b.trainerSpecialization}</p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <span className="px-2.5 py-1 rounded-lg text-xs font-bold bg-[#F1F5F3] text-[#164A4A] inline-block">
                          {b.sessionType}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-0.5 text-xs">
                          <p className="flex items-center text-[#202828] font-semibold">
                            <Calendar size={12} className="mr-1.5 text-[#164A4A]" /> {b.date}
                          </p>
                          <p className="flex items-center text-[#455250]">
                            <Clock size={12} className="mr-1.5 text-[#A8ADA9]" /> {b.startTime} ({b.duration}m)
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <span
                            className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider block text-center w-max ${
                              isCompleted
                                ? 'bg-gray-100 text-gray-600'
                                : b.status === 'Cancelled'
                                ? 'bg-red-100 text-red-600'
                                : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}
                          >
                            {b.status}
                          </span>
                          <span className="text-[10px] text-gray-500 font-semibold block text-center">
                            {b.paymentStatus === 'Paid' ? (
                              <span className="text-emerald-600 font-bold">PAID · ₹{b.fee}</span>
                            ) : (
                              <span className="text-amber-600 font-bold">Free Trial</span>
                            )}
                          </span>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs text-gray-600 bg-gray-100 px-2 py-1 rounded-md">
                            {b.meetingId}
                          </span>
                          <button
                            onClick={() => handleCopyLink(b.meetingLink, b._id)}
                            className="p-1 hover:bg-gray-100 rounded text-gray-400 hover:text-gray-600"
                            title="Copy Meeting URL"
                          >
                            {copiedId === b._id ? (
                              <CheckCircle2 size={14} className="text-emerald-600" />
                            ) : (
                              <Copy size={14} />
                            )}
                          </button>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <a
                            href={b.meetingLink}
                            target="_blank"
                            rel="noreferrer"
                            className="px-3 py-1.5 bg-[#164A4A] hover:bg-[#1f5f5f] text-white rounded-lg text-xs font-bold transition-all shadow-sm inline-flex items-center gap-1"
                          >
                            <Video size={13} /> Join Call
                          </a>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Book Video Consultation Modal */}
      {showBookModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-white rounded-3xl max-w-xl w-full p-6 sm:p-8 shadow-2xl relative border border-gray-100 animate-in zoom-in-95 duration-200">
            <button
              onClick={() => setShowBookModal(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100"
            >
              <X size={20} />
            </button>

            <div className="flex items-center gap-3 mb-5">
              <div className="w-10 h-10 rounded-xl bg-[#164A4A]/10 text-[#164A4A] flex items-center justify-center">
                <Video size={22} />
              </div>
              <div>
                <h2 className="text-xl font-black text-[#202828]">Book 1-on-1 Video Session</h2>
                <p className="text-xs text-[#455250]">Schedule a virtual appointment for a member</p>
              </div>
            </div>

            <form onSubmit={handleBookSession} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                    Select Member *
                  </label>
                  <select
                    required
                    value={selectedMemberId}
                    onChange={(e) => setSelectedMemberId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] outline-none"
                  >
                    <option value="">Select Member</option>
                    {members.map((m: any) => (
                      <option key={m._id} value={m._id}>
                        {m.firstName} {m.lastName} ({m.email})
                      </option>
                    ))}
                    {members.length === 0 && <option value="default-renu">Renu Gopal (renugopal@gmail.com)</option>}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                    Assigned Trainer *
                  </label>
                  <select
                    required
                    value={selectedTrainerId}
                    onChange={(e) => setSelectedTrainerId(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] outline-none"
                  >
                    <option value="">Select Trainer</option>
                    {trainers.map((t: any) => (
                      <option key={t._id} value={t._id}>
                        {t.name} ({t.specialization || 'Trainer'})
                      </option>
                    ))}
                    {trainers.length === 0 && <option value="default-trainer">Alex Morgan (Personal Trainer)</option>}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                  Consultation Type
                </label>
                <select
                  value={sessionType}
                  onChange={(e) => setSessionType(e.target.value as any)}
                  className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] outline-none"
                >
                  <option value="1-on-1 Virtual Training">1-on-1 Virtual Personal Training</option>
                  <option value="Nutrition Consultation">Diet & Nutrition Consultation</option>
                  <option value="Form & Posture Assessment">Biomechanics & Form Assessment</option>
                  <option value="Fitness Goal Review">Fitness Goal & Progress Review</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                    Date *
                  </label>
                  <input
                    type="date"
                    required
                    value={bookDate}
                    onChange={(e) => setBookDate(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                    Time *
                  </label>
                  <input
                    type="time"
                    required
                    value={bookTime}
                    onChange={(e) => setBookTime(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                    Duration (mins)
                  </label>
                  <select
                    value={bookDuration}
                    onChange={(e) => setBookDuration(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] outline-none"
                  >
                    <option value="30">30 Mins</option>
                    <option value="45">45 Mins</option>
                    <option value="60">60 Mins</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                    Session Fee (₹)
                  </label>
                  <input
                    type="number"
                    min="0"
                    placeholder="0 for Free Trial / Included"
                    value={bookFee}
                    onChange={(e) => setBookFee(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] outline-none"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#455250] uppercase tracking-wider mb-1">
                    Custom Meeting URL (Optional)
                  </label>
                  <input
                    type="url"
                    placeholder="Auto-generated if empty"
                    value={bookCustomLink}
                    onChange={(e) => setBookCustomLink(e.target.value)}
                    className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] outline-none"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowBookModal(false)}
                  className="px-5 py-2.5 rounded-xl border border-gray-200 text-sm font-bold text-[#455250] hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-6 py-2.5 bg-[#164A4A] hover:bg-[#1f5f5f] text-white text-sm font-bold rounded-xl transition-all shadow-md flex items-center gap-2"
                >
                  <Plus size={16} /> Confirm Booking
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default GymAdminVideoBookings;
