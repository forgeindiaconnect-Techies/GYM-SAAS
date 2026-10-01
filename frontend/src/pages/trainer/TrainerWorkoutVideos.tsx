import { useState, useEffect } from 'react';
import {
  Video, Plus, Search, Play, CheckCircle2,
  X, ExternalLink, Loader2
} from 'lucide-react';
import api from '../../utils/api';

interface WorkoutVideoItem {
  _id: string;
  title: string;
  exerciseName: string;
  videoUrl: string;
  difficultyLevel: 'Beginner' | 'Intermediate' | 'Advanced';
  duration: string;
  instructions?: string;
  sets: string;
  reps: string;
  trainerNotes?: string;
  status: 'Assigned' | 'In Progress' | 'Completed';
  completedAt?: string;
  customerId?: {
    _id: string;
    firstName: string;
    lastName: string;
    email: string;
    profilePhoto?: string;
  };
  createdAt: string;
}

const TrainerWorkoutVideos = () => {
  const [videos, setVideos] = useState<WorkoutVideoItem[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [previewVideo, setPreviewVideo] = useState<WorkoutVideoItem | null>(null);
  const [submitting, setSubmitting] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    customerId: '',
    title: '',
    exerciseName: '',
    videoUrl: '',
    difficultyLevel: 'Beginner',
    duration: '15 mins',
    sets: '3',
    reps: '12',
    instructions: '',
    trainerNotes: ''
  });

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workout-videos/trainer');
      if (res.data.success) {
        setVideos(res.data.videos || []);
      }
    } catch (err) {
      console.error('Failed to load trainer workout videos', err);
    } finally {
      setLoading(false);
    }
  };

  const fetchMembers = async () => {
    try {
      const res = await api.get('/trainers/my-members');
      if (res.data.success) {
        setMembers(res.data.members || []);
      }
    } catch {
      // Fallback to gym users or recent sessions
      try {
        const fallbackRes = await api.get('/trainer-sessions/trainer');
        if (fallbackRes.data.sessions) {
          const uniqueCustMap = new Map();
          fallbackRes.data.sessions.forEach((s: any) => {
            if (s.customerId && !uniqueCustMap.has(s.customerId._id)) {
              uniqueCustMap.set(s.customerId._id, s.customerId);
            }
          });
          setMembers(Array.from(uniqueCustMap.values()));
        }
      } catch (e) {
        console.error('Failed to fetch fallback members', e);
      }
    }
  };

  useEffect(() => {
    fetchVideos();
    fetchMembers();
  }, []);

  const handleCreateVideo = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.customerId || !formData.title || !formData.exerciseName || !formData.videoUrl) {
      alert('Please fill in client, video title, exercise name, and video URL.');
      return;
    }

    try {
      setSubmitting(true);
      const res = await api.post('/workout-videos', formData);
      if (res.data.success) {
        setShowAssignModal(false);
        setFormData({
          customerId: '',
          title: '',
          exerciseName: '',
          videoUrl: '',
          difficultyLevel: 'Beginner',
          duration: '15 mins',
          sets: '3',
          reps: '12',
          instructions: '',
          trainerNotes: ''
        });
        await fetchVideos();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to assign workout video');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredVideos = videos.filter((v) => {
    const matchesSearch =
      v.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      v.exerciseName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (v.customerId && `${v.customerId.firstName} ${v.customerId.lastName}`.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesStatus = statusFilter === 'All' || v.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const totalAssigned = videos.length;
  const completedCount = videos.filter((v) => v.status === 'Completed').length;
  const inProgressCount = videos.filter((v) => v.status === 'In Progress').length;
  const completionRate = totalAssigned > 0 ? Math.round((completedCount / totalAssigned) * 100) : 0;

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-[#202828] flex items-center gap-2">
            <Video className="text-[#164A4A]" size={28} />
            Workout Videos & Self-Learning
          </h1>
          <p className="text-sm text-[#455250]">
            Assign guided exercise videos to your clients for self-learning and missed session recovery.
          </p>
        </div>
        <button
          onClick={() => setShowAssignModal(true)}
          className="px-5 py-2.5 bg-[#164A4A] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3535] transition-all shadow-md flex items-center justify-center gap-2"
        >
          <Plus size={18} />
          <span>Assign Workout Video</span>
        </button>
      </div>

      {/* Metric Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#455250] font-medium uppercase tracking-wider">Total Assigned</p>
          <p className="text-2xl font-bold text-[#202828] mt-1">{totalAssigned}</p>
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-green-700 font-medium uppercase tracking-wider">Completed</p>
          <p className="text-2xl font-bold text-green-700 mt-1">{completedCount}</p>
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-amber-700 font-medium uppercase tracking-wider">In Progress</p>
          <p className="text-2xl font-bold text-amber-700 mt-1">{inProgressCount}</p>
        </div>
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 shadow-sm">
          <p className="text-xs text-[#164A4A] font-medium uppercase tracking-wider">Completion Rate</p>
          <p className="text-2xl font-bold text-[#164A4A] mt-1">{completionRate}%</p>
        </div>
      </div>

      {/* Filters & Search */}
      <div className="bg-white border border-[#D3DFDA] rounded-2xl p-4 flex flex-col md:flex-row gap-3 justify-between items-center shadow-sm">
        <div className="relative w-full md:w-80">
          <Search size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-[#A8ADA9]" />
          <input
            type="text"
            placeholder="Search by title, exercise, or client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-[#F1F5F3] border border-transparent rounded-xl text-sm focus:border-[#164A4A] focus:bg-white outline-none transition"
          />
        </div>

        <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto">
          {['All', 'Assigned', 'In Progress', 'Completed'].map((status) => (
            <button
              key={status}
              onClick={() => setStatusFilter(status)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
                statusFilter === status
                  ? 'bg-[#164A4A] text-white shadow-sm'
                  : 'bg-[#F1F5F3] text-[#455250] hover:text-[#202828] hover:bg-gray-200'
              }`}
            >
              {status}
            </button>
          ))}
        </div>
      </div>

      {/* Video Cards Grid */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#164A4A]" size={36} />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#164A4A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video size={28} className="text-[#164A4A]" />
          </div>
          <h3 className="text-lg font-bold text-[#202828] mb-1">No Workout Videos Found</h3>
          <p className="text-sm text-[#455250] max-w-md mx-auto mb-6">
            Assign custom video workouts for your clients to practice independently or make up for missed sessions.
          </p>
          <button
            onClick={() => setShowAssignModal(true)}
            className="px-5 py-2.5 bg-[#164A4A] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3535] transition shadow"
          >
            Assign First Video
          </button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video._id}
              className="bg-white border border-[#D3DFDA] rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between"
            >
              <div>
                {/* Header Video Preview Bar */}
                <div className="bg-gradient-to-r from-[#164A4A] to-[#2d6868] p-4 text-white relative">
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                        video.difficultyLevel === 'Beginner'
                          ? 'bg-emerald-500/20 text-emerald-200 border border-emerald-400/30'
                          : video.difficultyLevel === 'Intermediate'
                          ? 'bg-amber-500/20 text-amber-200 border border-amber-400/30'
                          : 'bg-rose-500/20 text-rose-200 border border-rose-400/30'
                      }`}
                    >
                      {video.difficultyLevel}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        video.status === 'Completed'
                          ? 'bg-green-500 text-white shadow-sm'
                          : video.status === 'In Progress'
                          ? 'bg-amber-400 text-amber-950 font-bold'
                          : 'bg-white/20 text-white'
                      }`}
                    >
                      {video.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-base leading-snug line-clamp-1">{video.title}</h3>
                  <p className="text-xs text-white/80 line-clamp-1">{video.exerciseName}</p>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  {/* Assigned Client */}
                  <div className="flex items-center gap-2.5 p-2 bg-[#F1F5F3] rounded-xl">
                    <div className="w-8 h-8 rounded-full bg-[#164A4A] text-white flex items-center justify-center font-bold text-xs shrink-0">
                      {video.customerId?.firstName?.[0] || 'C'}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="text-xs text-[#455250] font-medium">Assigned To</p>
                      <p className="text-sm font-semibold text-[#202828] truncate">
                        {video.customerId ? `${video.customerId.firstName} ${video.customerId.lastName}` : 'Direct Client'}
                      </p>
                    </div>
                  </div>

                  {/* Workout Specs */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                      <span className="text-[#455250] block text-[10px]">Sets</span>
                      <span className="font-bold text-[#202828]">{video.sets}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                      <span className="text-[#455250] block text-[10px]">Reps</span>
                      <span className="font-bold text-[#202828]">{video.reps}</span>
                    </div>
                    <div className="bg-slate-50 border border-slate-100 rounded-lg p-1.5">
                      <span className="text-[#455250] block text-[10px]">Duration</span>
                      <span className="font-bold text-[#202828]">{video.duration}</span>
                    </div>
                  </div>

                  {/* Trainer Notes */}
                  {video.trainerNotes && (
                    <div className="text-xs bg-amber-50/70 border border-amber-200/60 rounded-xl p-2.5 text-amber-900">
                      <span className="font-semibold block text-[11px] mb-0.5">Trainer Instructions:</span>
                      <p className="line-clamp-2">{video.trainerNotes}</p>
                    </div>
                  )}

                  {video.status === 'Completed' && video.completedAt && (
                    <p className="text-[11px] text-green-700 font-medium flex items-center gap-1 pt-1">
                      <CheckCircle2 size={13} />
                      Completed on {new Date(video.completedAt).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>

              {/* Action Button */}
              <div className="p-4 pt-0">
                <button
                  onClick={() => setPreviewVideo(video)}
                  className="w-full py-2 bg-[#F1F5F3] hover:bg-[#164A4A] hover:text-white text-[#164A4A] font-semibold text-xs rounded-xl transition flex items-center justify-center gap-1.5"
                >
                  <Play size={14} />
                  <span>Preview & Details</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Assign Video Modal */}
      {showAssignModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative animate-in fade-in zoom-in-95 border border-[#D3DFDA]">
            <div className="flex items-center justify-between pb-3 border-b border-[#D3DFDA] mb-4">
              <h2 className="text-lg font-bold text-[#202828] flex items-center gap-2">
                <Video size={20} className="text-[#164A4A]" />
                Assign Self-Learning Workout Video
              </h2>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleCreateVideo} className="space-y-4">
              {/* Select Member */}
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Select Client *</label>
                <select
                  required
                  value={formData.customerId}
                  onChange={(e) => setFormData({ ...formData, customerId: e.target.value })}
                  className="w-full px-3.5 py-2.5 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-sm text-[#202828] focus:border-[#164A4A] focus:bg-white outline-none"
                >
                  <option value="">-- Choose Client --</option>
                  {members.map((m: any) => (
                    <option key={m._id || m.id} value={m._id || m.id}>
                      {m.firstName} {m.lastName} ({m.email})
                    </option>
                  ))}
                </select>
              </div>

              {/* Title & Exercise */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Workout Title *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Chest & Core Mastery"
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Exercise Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g., Incline Dumbbell Press"
                    value={formData.exerciseName}
                    onChange={(e) => setFormData({ ...formData, exerciseName: e.target.value })}
                    className="w-full px-3.5 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Video URL */}
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Video Stream / YouTube URL *</label>
                <input
                  type="url"
                  required
                  placeholder="https://www.youtube.com/watch?v=... or MP4 URL"
                  value={formData.videoUrl}
                  onChange={(e) => setFormData({ ...formData, videoUrl: e.target.value })}
                  className="w-full px-3.5 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-sm focus:border-[#164A4A] focus:bg-white outline-none"
                />
              </div>

              {/* Difficulty & Duration */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Difficulty</label>
                  <select
                    value={formData.difficultyLevel}
                    onChange={(e: any) => setFormData({ ...formData, difficultyLevel: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-xs focus:border-[#164A4A] focus:bg-white outline-none"
                  >
                    <option value="Beginner">Beginner</option>
                    <option value="Intermediate">Intermediate</option>
                    <option value="Advanced">Advanced</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Duration</label>
                  <input
                    type="text"
                    placeholder="15 mins"
                    value={formData.duration}
                    onChange={(e) => setFormData({ ...formData, duration: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-xs focus:border-[#164A4A] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Sets</label>
                  <input
                    type="text"
                    placeholder="3"
                    value={formData.sets}
                    onChange={(e) => setFormData({ ...formData, sets: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-xs focus:border-[#164A4A] focus:bg-white outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-[#455250] mb-1">Reps</label>
                  <input
                    type="text"
                    placeholder="12"
                    value={formData.reps}
                    onChange={(e) => setFormData({ ...formData, reps: e.target.value })}
                    className="w-full px-2.5 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-xs focus:border-[#164A4A] focus:bg-white outline-none"
                  />
                </div>
              </div>

              {/* Instructions & Notes */}
              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Technique & Instructions</label>
                <textarea
                  rows={2}
                  placeholder="Explain proper form, cadence, breathing pattern..."
                  value={formData.instructions}
                  onChange={(e) => setFormData({ ...formData, instructions: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-xs focus:border-[#164A4A] focus:bg-white outline-none"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#455250] mb-1">Trainer Special Note</label>
                <textarea
                  rows={2}
                  placeholder="e.g., Complete this today to make up for yesterday's missed online session."
                  value={formData.trainerNotes}
                  onChange={(e) => setFormData({ ...formData, trainerNotes: e.target.value })}
                  className="w-full px-3 py-2 bg-[#F1F5F3] border border-[#D3DFDA] rounded-xl text-xs focus:border-[#164A4A] focus:bg-white outline-none"
                />
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-[#D3DFDA]">
                <button
                  type="button"
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 bg-gray-100 text-gray-700 rounded-xl font-semibold text-xs hover:bg-gray-200 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2 bg-[#164A4A] text-white rounded-xl font-semibold text-xs hover:bg-[#0d3535] transition shadow disabled:opacity-50 flex items-center gap-2"
                >
                  {submitting && <Loader2 size={14} className="animate-spin" />}
                  <span>Assign Video</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Preview Modal */}
      {previewVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="bg-white rounded-2xl max-w-xl w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 border border-[#D3DFDA] space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-[#D3DFDA]">
              <div>
                <h3 className="text-lg font-bold text-[#202828]">{previewVideo.title}</h3>
                <p className="text-xs text-[#455250]">{previewVideo.exerciseName}</p>
              </div>
              <button
                onClick={() => setPreviewVideo(null)}
                className="text-gray-400 hover:text-gray-600 p-1 rounded-lg"
              >
                <X size={20} />
              </button>
            </div>

            {/* Video Player / Link */}
            <div className="aspect-video bg-black rounded-xl overflow-hidden flex items-center justify-center relative">
              {previewVideo.videoUrl.includes('youtube.com') || previewVideo.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={
                    previewVideo.videoUrl.includes('watch?v=')
                      ? previewVideo.videoUrl.replace('watch?v=', 'embed/')
                      : previewVideo.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                  }
                  className="w-full h-full"
                  allowFullScreen
                  title={previewVideo.title}
                />
              ) : (
                <div className="text-center p-6 text-white space-y-3">
                  <Play size={40} className="mx-auto text-emerald-400 animate-pulse" />
                  <p className="text-sm font-medium">Direct Video Link</p>
                  <a
                    href={previewVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition"
                  >
                    <span>Open External Video</span>
                    <ExternalLink size={14} />
                  </a>
                </div>
              )}
            </div>

            {/* Instructions */}
            <div className="space-y-2 text-xs">
              <div className="bg-[#F1F5F3] p-3 rounded-xl">
                <span className="font-bold text-[#202828] block mb-1">Instructions:</span>
                <p className="text-[#455250]">{previewVideo.instructions || 'Follow proper posture and controlled breathing.'}</p>
              </div>
              {previewVideo.trainerNotes && (
                <div className="bg-amber-50 p-3 rounded-xl border border-amber-200">
                  <span className="font-bold text-amber-900 block mb-1">Trainer Special Note:</span>
                  <p className="text-amber-800">{previewVideo.trainerNotes}</p>
                </div>
              )}
            </div>

            <div className="flex justify-end pt-2 border-t border-[#D3DFDA]">
              <button
                onClick={() => setPreviewVideo(null)}
                className="px-4 py-2 bg-[#164A4A] text-white rounded-xl font-semibold text-xs hover:bg-[#0d3535] transition"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TrainerWorkoutVideos;
