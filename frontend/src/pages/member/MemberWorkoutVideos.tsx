import { useState, useEffect } from 'react';
import {
  Video, Play, CheckCircle2, Sparkles,
  ChevronRight, ExternalLink, Loader2, Award, ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';

interface AssignedVideo {
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
  trainerId?: {
    _id: string;
    name: string;
    profilePhoto?: string;
    specialization?: string;
  };
  createdAt: string;
}

const MemberWorkoutVideos = () => {
  const [videos, setVideos] = useState<AssignedVideo[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeVideo, setActiveVideo] = useState<AssignedVideo | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'pending' | 'completed'>('all');

  const fetchVideos = async () => {
    try {
      setLoading(true);
      const res = await api.get('/workout-videos/customer');
      if (res.data.success) {
        setVideos(res.data.videos || []);
      }
    } catch (err) {
      console.error('Failed to load customer workout videos', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchVideos();
  }, []);

  const handleMarkComplete = async (videoId: string) => {
    try {
      setUpdatingId(videoId);
      const res = await api.patch(`/workout-videos/${videoId}/status`, { status: 'Completed' });
      if (res.data.success) {
        if (activeVideo?._id === videoId) {
          setActiveVideo({ ...activeVideo, status: 'Completed', completedAt: new Date().toISOString() });
        }
        await fetchVideos();
      }
    } catch (err: any) {
      alert(err.response?.data?.message || 'Failed to update video progress');
    } finally {
      setUpdatingId(null);
    }
  };

  const completedCount = videos.filter((v) => v.status === 'Completed').length;
  const pendingCount = videos.filter((v) => v.status !== 'Completed').length;
  const totalCount = videos.length;
  const completionPercentage = totalCount > 0 ? Math.round((completedCount / totalCount) * 100) : 0;

  const filteredVideos = videos.filter((v) => {
    if (filter === 'pending') return v.status !== 'Completed';
    if (filter === 'completed') return v.status === 'Completed';
    return true;
  });

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#164A4A] via-[#1f5c5c] to-[#2a7575] rounded-3xl p-6 md:p-8 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2 max-w-xl">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 bg-white/15 backdrop-blur-md rounded-full text-xs font-semibold text-emerald-200">
              <Sparkles size={13} />
              Trainer Guided Self-Learning
            </span>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight">Assigned Workout Videos</h1>
            <p className="text-white/80 text-sm leading-relaxed">
              Watch step-by-step exercise demonstrations provided by your online trainer. Complete self-learning routines to maintain consistency or make up for missed sessions.
            </p>
          </div>

          {/* Quick Stats Card */}
          <div className="bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl p-4 shrink-0 min-w-[200px] text-center">
            <div className="flex items-center justify-center gap-2 mb-1">
              <Award className="text-amber-300" size={20} />
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-100">Completion</span>
            </div>
            <p className="text-3xl font-black">{completionPercentage}%</p>
            <p className="text-xs text-white/70 mt-1">
              {completedCount} of {totalCount} completed
            </p>
            <div className="w-full bg-white/20 h-2 rounded-full mt-3 overflow-hidden">
              <div
                className="bg-emerald-400 h-full rounded-full transition-all duration-500"
                style={{ width: `${completionPercentage}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between border-b border-[#D3DFDA] pb-3">
        <div className="flex items-center gap-2">
          {[
            { id: 'all', label: 'All Videos', count: totalCount },
            { id: 'pending', label: 'Pending / In Progress', count: pendingCount },
            { id: 'completed', label: 'Completed', count: completedCount },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setFilter(tab.id as any)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 ${
                filter === tab.id
                  ? 'bg-[#164A4A] text-white shadow-sm'
                  : 'bg-white border border-[#D3DFDA] text-[#455250] hover:text-[#202828]'
              }`}
            >
              <span>{tab.label}</span>
              <span
                className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                  filter === tab.id ? 'bg-white/20 text-white' : 'bg-gray-100 text-gray-600'
                }`}
              >
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        <Link
          to="/member/online-sessions"
          className="text-xs text-[#164A4A] font-bold hover:underline hidden sm:flex items-center gap-1"
        >
          <span>View Live Sessions</span>
          <ArrowRight size={14} />
        </Link>
      </div>

      {/* Content Area */}
      {loading ? (
        <div className="flex items-center justify-center py-24">
          <Loader2 className="animate-spin text-[#164A4A]" size={36} />
        </div>
      ) : filteredVideos.length === 0 ? (
        <div className="bg-white border border-[#D3DFDA] rounded-2xl p-12 text-center shadow-sm">
          <div className="w-16 h-16 bg-[#164A4A]/10 rounded-full flex items-center justify-center mx-auto mb-4">
            <Video size={28} className="text-[#164A4A]" />
          </div>
          <h3 className="text-lg font-bold text-[#202828] mb-1">
            {filter === 'completed'
              ? 'No completed videos yet'
              : filter === 'pending'
              ? 'No pending videos to watch'
              : 'No Workout Videos Assigned'}
          </h3>
          <p className="text-sm text-[#455250] max-w-md mx-auto mb-6">
            When your online trainer assigns workout tutorials or self-learning videos, they will appear here.
          </p>
          <Link
            to="/member/find-trainers"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#164A4A] text-white rounded-xl font-semibold text-sm hover:bg-[#0d3535] transition shadow"
          >
            <span>Book Online Trainer</span>
            <ChevronRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredVideos.map((video) => (
            <div
              key={video._id}
              className={`bg-white border rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition flex flex-col justify-between ${
                video.status === 'Completed' ? 'border-green-200' : 'border-[#D3DFDA]'
              }`}
            >
              <div>
                {/* Header Video Graphic */}
                <div className="bg-gradient-to-br from-slate-900 via-[#164A4A] to-slate-900 p-5 text-white relative">
                  <div className="flex items-center justify-between gap-2 mb-3">
                    <span
                      className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                        video.difficultyLevel === 'Beginner'
                          ? 'bg-emerald-500/30 text-emerald-200 border border-emerald-400/40'
                          : video.difficultyLevel === 'Intermediate'
                          ? 'bg-amber-500/30 text-amber-200 border border-amber-400/40'
                          : 'bg-rose-500/30 text-rose-200 border border-rose-400/40'
                      }`}
                    >
                      {video.difficultyLevel}
                    </span>
                    <span
                      className={`text-[11px] font-bold px-2.5 py-0.5 rounded-full ${
                        video.status === 'Completed'
                          ? 'bg-green-500 text-white shadow-sm'
                          : 'bg-white/20 text-white backdrop-blur-sm'
                      }`}
                    >
                      {video.status}
                    </span>
                  </div>
                  <h3 className="font-bold text-lg leading-snug line-clamp-1">{video.title}</h3>
                  <p className="text-xs text-white/80 line-clamp-1 mt-0.5">{video.exerciseName}</p>
                </div>

                {/* Body Details */}
                <div className="p-4 space-y-3">
                  {/* Trainer badge */}
                  {video.trainerId && (
                    <div className="flex items-center gap-2 text-xs text-[#455250]">
                      <span className="font-semibold text-[#202828]">Assigned by:</span>
                      <span className="text-[#164A4A] font-bold">{video.trainerId.name}</span>
                    </div>
                  )}

                  {/* Workout Specs */}
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <div className="bg-[#F1F5F3] rounded-xl p-2">
                      <span className="text-[#455250] block text-[10px]">Sets</span>
                      <span className="font-bold text-[#202828] text-sm">{video.sets}</span>
                    </div>
                    <div className="bg-[#F1F5F3] rounded-xl p-2">
                      <span className="text-[#455250] block text-[10px]">Reps</span>
                      <span className="font-bold text-[#202828] text-sm">{video.reps}</span>
                    </div>
                    <div className="bg-[#F1F5F3] rounded-xl p-2">
                      <span className="text-[#455250] block text-[10px]">Duration</span>
                      <span className="font-bold text-[#202828] text-sm">{video.duration}</span>
                    </div>
                  </div>

                  {/* Trainer Special Notes */}
                  {video.trainerNotes && (
                    <div className="bg-amber-50 border border-amber-200/70 rounded-xl p-2.5 text-xs text-amber-900">
                      <span className="font-bold block text-[11px] mb-0.5">Trainer Advice:</span>
                      <p className="line-clamp-2">{video.trainerNotes}</p>
                    </div>
                  )}

                  {video.status === 'Completed' && video.completedAt && (
                    <div className="flex items-center gap-1.5 text-xs text-green-700 font-semibold pt-1">
                      <CheckCircle2 size={15} />
                      <span>Completed on {new Date(video.completedAt).toLocaleDateString()}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Action Buttons */}
              <div className="p-4 pt-0 space-y-2">
                <button
                  onClick={() => setActiveVideo(video)}
                  className="w-full py-2.5 bg-[#164A4A] hover:bg-[#0d3535] text-white font-bold text-xs rounded-xl transition flex items-center justify-center gap-2 shadow"
                >
                  <Play size={14} />
                  <span>Watch Video & Instructions</span>
                </button>

                {video.status !== 'Completed' && (
                  <button
                    onClick={() => handleMarkComplete(video._id)}
                    disabled={updatingId === video._id}
                    className="w-full py-2 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border border-emerald-300 font-bold text-xs rounded-xl transition flex items-center justify-center gap-1.5 disabled:opacity-50"
                  >
                    {updatingId === video._id ? (
                      <Loader2 size={13} className="animate-spin" />
                    ) : (
                      <CheckCircle2 size={14} className="text-emerald-600" />
                    )}
                    <span>Mark Workout as Completed</span>
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Video Modal Player */}
      {activeVideo && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto p-6 shadow-2xl relative border border-[#D3DFDA] space-y-4 animate-in fade-in zoom-in-95">
            <div className="flex items-center justify-between pb-3 border-b border-[#D3DFDA]">
              <div>
                <h3 className="text-lg font-bold text-[#202828]">{activeVideo.title}</h3>
                <p className="text-xs text-[#455250]">{activeVideo.exerciseName} • {activeVideo.duration}</p>
              </div>
              <button
                onClick={() => setActiveVideo(null)}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg"
              >
                ✕
              </button>
            </div>

            {/* Embedded Video Player */}
            <div className="aspect-video bg-black rounded-2xl overflow-hidden relative shadow-inner">
              {activeVideo.videoUrl.includes('youtube.com') || activeVideo.videoUrl.includes('youtu.be') ? (
                <iframe
                  src={
                    activeVideo.videoUrl.includes('watch?v=')
                      ? activeVideo.videoUrl.replace('watch?v=', 'embed/')
                      : activeVideo.videoUrl.replace('youtu.be/', 'www.youtube.com/embed/')
                  }
                  className="w-full h-full"
                  allowFullScreen
                  title={activeVideo.title}
                />
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-white p-6 space-y-4">
                  <Play size={48} className="text-emerald-400 animate-bounce" />
                  <p className="text-sm font-semibold">Video Demonstration</p>
                  <a
                    href={activeVideo.videoUrl}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold transition shadow-lg"
                  >
                    <span>Open External Video Player</span>
                    <ExternalLink size={15} />
                  </a>
                </div>
              )}
            </div>

            {/* Exercise Instructions & Details */}
            <div className="grid grid-cols-3 gap-3 text-center text-xs">
              <div className="bg-[#F1F5F3] p-2.5 rounded-xl">
                <span className="text-[#455250] block text-[11px]">Recommended Sets</span>
                <span className="font-bold text-sm text-[#202828]">{activeVideo.sets}</span>
              </div>
              <div className="bg-[#F1F5F3] p-2.5 rounded-xl">
                <span className="text-[#455250] block text-[11px]">Reps per Set</span>
                <span className="font-bold text-sm text-[#202828]">{activeVideo.reps}</span>
              </div>
              <div className="bg-[#F1F5F3] p-2.5 rounded-xl">
                <span className="text-[#455250] block text-[11px]">Difficulty</span>
                <span className="font-bold text-sm text-[#202828]">{activeVideo.difficultyLevel}</span>
              </div>
            </div>

            {activeVideo.instructions && (
              <div className="bg-[#F1F5F3] p-3.5 rounded-2xl text-xs">
                <span className="font-bold text-[#202828] block mb-1">Technique Instructions:</span>
                <p className="text-[#455250] leading-relaxed">{activeVideo.instructions}</p>
              </div>
            )}

            {activeVideo.trainerNotes && (
              <div className="bg-amber-50 border border-amber-200 p-3.5 rounded-2xl text-xs text-amber-900">
                <span className="font-bold block mb-1">Trainer Coach Note:</span>
                <p className="leading-relaxed">{activeVideo.trainerNotes}</p>
              </div>
            )}

            {/* Modal Bottom Actions */}
            <div className="flex items-center justify-between pt-3 border-t border-[#D3DFDA]">
              <button
                onClick={() => setActiveVideo(null)}
                className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold text-xs rounded-xl transition"
              >
                Close
              </button>

              {activeVideo.status !== 'Completed' ? (
                <button
                  onClick={() => handleMarkComplete(activeVideo._id)}
                  disabled={updatingId === activeVideo._id}
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl transition shadow flex items-center gap-2 disabled:opacity-50"
                >
                  {updatingId === activeVideo._id && <Loader2 size={14} className="animate-spin" />}
                  <CheckCircle2 size={16} />
                  <span>Mark Workout Completed</span>
                </button>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-50 px-3 py-1.5 rounded-xl border border-green-200">
                  <CheckCircle2 size={15} />
                  <span>Workout Completed</span>
                </span>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MemberWorkoutVideos;
