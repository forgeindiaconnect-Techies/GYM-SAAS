import React, { useRef, useState, useEffect } from 'react';
import { Play, Pause, RotateCcw, Maximize, Volume2, VolumeX, Sparkles, Video, Activity } from 'lucide-react';
import ExerciseAnimationEngine from './ExerciseAnimationEngine';

interface ExerciseVideoPlayerProps {
  videoUrl?: string;
  thumbnailUrl?: string;
  exerciseName?: string;
  title?: string;
  targetMuscle?: string;
  category?: string;
  duration?: number;
  animationType?: 'video' | 'animation' | 'gif';
  autoPlay?: boolean;
  loop?: boolean;
  compact?: boolean;
  className?: string;
  isPlaying?: boolean;
  resetTrigger?: number;
}

export const ExerciseVideoPlayer: React.FC<ExerciseVideoPlayerProps> = ({
  videoUrl,
  thumbnailUrl,
  exerciseName,
  title,
  targetMuscle,
  category,
  duration: initialDuration = 60,
  animationType = 'animation',
  autoPlay = false,
  loop = true,
  compact = false,
  className = '',
  isPlaying: externalIsPlaying,
  resetTrigger
}) => {
  const displayName = title || exerciseName || 'Exercise';
  const videoRef = useRef<HTMLVideoElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [isPlaying, setIsPlaying] = useState(externalIsPlaying !== undefined ? externalIsPlaying : autoPlay);
  const [isMuted, setIsMuted] = useState(true);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(0);
  const [hasError, setHasError] = useState(false);

  // Normalize videoUrl if it points to a local upload path
  // If URL contains mixkit, treat as dead external CDN and ignore
  const isMixkit = Boolean(videoUrl && videoUrl.includes('mixkit.co'));
  const normalizedVideoUrl = (videoUrl && !isMixkit)
    ? (videoUrl.startsWith('http') ? videoUrl : `http://localhost:5600${videoUrl}`)
    : '';

  // Determine initial view mode:
  // If videoUrl is not available, or is mixkit, or animationType is 'animation' -> AI Animation!
  const hasRealVideo = Boolean(normalizedVideoUrl && !hasError && animationType !== 'animation');
  const [viewMode, setViewMode] = useState<'video' | 'animation'>(hasRealVideo ? 'video' : 'animation');

  useEffect(() => {
    setHasError(false);
    if (!normalizedVideoUrl || isMixkit || animationType === 'animation') {
      setViewMode('animation');
    } else {
      setViewMode('video');
    }

    if (videoRef.current) {
      if (autoPlay && hasRealVideo) {
        videoRef.current.play().catch(() => {
          setIsPlaying(false);
        });
      } else {
        videoRef.current.pause();
        setIsPlaying(false);
      }
    }
  }, [normalizedVideoUrl, isMixkit, animationType, autoPlay, hasRealVideo]);

  useEffect(() => {
    if (externalIsPlaying !== undefined) {
      setIsPlaying(externalIsPlaying);
      if (videoRef.current) {
        if (externalIsPlaying) {
          videoRef.current.play().catch(() => {});
        } else {
          videoRef.current.pause();
        }
      }
    }
  }, [externalIsPlaying]);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0 && videoRef.current) {
      videoRef.current.currentTime = 0;
      if (externalIsPlaying !== false) {
        videoRef.current.play().catch(() => {});
      }
    }
  }, [resetTrigger, externalIsPlaying]);

  const togglePlay = () => {
    if (!videoRef.current) return;
    if (isPlaying) {
      videoRef.current.pause();
      setIsPlaying(false);
    } else {
      videoRef.current.play().then(() => setIsPlaying(true)).catch(() => setIsPlaying(false));
    }
  };

  const handleRestart = () => {
    if (!videoRef.current) return;
    videoRef.current.currentTime = 0;
    videoRef.current.play().then(() => setIsPlaying(true)).catch(() => {});
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    videoRef.current.muted = !isMuted;
    setIsMuted(!isMuted);
  };

  const toggleFullscreen = () => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen().catch(() => {});
    } else {
      document.exitFullscreen().catch(() => {});
    }
  };

  const handleTimeUpdate = () => {
    if (videoRef.current) {
      setCurrentTime(videoRef.current.currentTime);
    }
  };

  const handleLoadedMetadata = () => {
    if (videoRef.current) {
      setDuration(videoRef.current.duration);
    }
  };

  const formatSeconds = (sec: number) => {
    const mins = Math.floor(sec / 60);
    const secs = Math.floor(sec % 60);
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  const showAnimation = viewMode === 'animation' || !normalizedVideoUrl || hasError;

  return (
    <div
      ref={containerRef}
      className={`relative overflow-hidden rounded-2xl bg-[#090D16] text-white flex items-center justify-center group select-none shadow-xl ${className}`}
      style={compact ? { height: '100%' } : { minHeight: '260px' }}
    >
      {!showAnimation ? (
        <>
          <video
            ref={videoRef}
            src={normalizedVideoUrl}
            poster={thumbnailUrl}
            loop={loop}
            muted={isMuted}
            playsInline
            onTimeUpdate={handleTimeUpdate}
            onLoadedMetadata={handleLoadedMetadata}
            onError={() => {
              setHasError(true);
              setViewMode('animation');
            }}
            onClick={togglePlay}
            className="w-full h-full object-cover cursor-pointer"
          />

          {/* Big Center Play Button when Paused */}
          {!isPlaying && !compact && (
            <button
              onClick={togglePlay}
              className="absolute inset-0 m-auto w-16 h-16 bg-[#F97316]/90 hover:bg-[#F97316] text-white rounded-full flex items-center justify-center shadow-2xl transition-all hover:scale-110 active:scale-95 z-10 cursor-pointer"
              title="Play Video"
            >
              <Play size={28} className="translate-x-0.5 fill-white" />
            </button>
          )}

          {/* Top Info & Mode Switcher Overlay */}
          {!compact && (
            <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none z-10">
              <span className="bg-black/70 backdrop-blur-md text-xs font-semibold px-2.5 py-1 rounded-full border border-white/10 text-white/90">
                {category || 'Workout'} • {targetMuscle || 'Target Muscle'}
              </span>

              <div className="flex items-center gap-1 pointer-events-auto bg-black/60 backdrop-blur-md p-0.5 rounded-lg border border-white/10">
                <button
                  onClick={() => setViewMode('video')}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold flex items-center gap-1 cursor-pointer ${
                    viewMode === 'video' ? 'bg-[#F97316] text-white' : 'text-white/60 hover:text-white'
                  }`}
                >
                  <Video size={10} /> Video
                </button>
                <button
                  onClick={() => setViewMode('animation')}
                  className="px-2 py-0.5 rounded text-[10px] font-bold text-white/60 hover:text-white flex items-center gap-1 cursor-pointer"
                >
                  <Sparkles size={10} /> AI Animation
                </button>
              </div>
            </div>
          )}

          {/* Bottom Control Bar */}
          {!compact && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/90 via-black/50 to-transparent p-3 pt-6 flex flex-col gap-1.5 opacity-90 group-hover:opacity-100 transition-opacity z-10">
              {/* Progress Bar */}
              <div
                className="w-full h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer"
                onClick={(e) => {
                  if (!videoRef.current || !duration) return;
                  const rect = e.currentTarget.getBoundingClientRect();
                  const pos = (e.clientX - rect.left) / rect.width;
                  videoRef.current.currentTime = pos * duration;
                }}
              >
                <div
                  className="h-full bg-emerald-400 transition-all duration-100"
                  style={{ width: `${duration > 0 ? (currentTime / duration) * 100 : 0}%` }}
                />
              </div>

              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={togglePlay}
                    className="p-1 hover:text-[#EA580C] transition-colors cursor-pointer"
                    title={isPlaying ? 'Pause' : 'Play'}
                  >
                    {isPlaying ? <Pause size={18} /> : <Play size={18} />}
                  </button>
                  <button
                    type="button"
                    onClick={handleRestart}
                    className="p-1 hover:text-[#EA580C] transition-colors cursor-pointer"
                    title="Restart"
                  >
                    <RotateCcw size={16} />
                  </button>
                  <span className="text-white/70 text-[11px] font-mono">
                    {formatSeconds(currentTime)} / {formatSeconds(duration)}
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={toggleMute}
                    className="p-1 hover:text-[#EA580C] transition-colors cursor-pointer"
                    title={isMuted ? 'Unmute' : 'Mute'}
                  >
                    {isMuted ? <VolumeX size={16} /> : <Volume2 size={16} />}
                  </button>
                  <button
                    type="button"
                    onClick={toggleFullscreen}
                    className="p-1 hover:text-[#EA580C] transition-colors cursor-pointer"
                    title="Fullscreen"
                  >
                    <Maximize size={16} />
                  </button>
                </div>
              </div>
            </div>
          )}
        </>
      ) : (
        /* State-of-the-Art Animated Biomechanical Exercise Engine */
        <div className="w-full h-full relative flex flex-col">
          {/* Top Switcher if a real custom video was also uploaded */}
          {!compact && normalizedVideoUrl && !hasError && (
            <div className="absolute top-3 right-3 z-20 flex items-center gap-1 bg-black/70 backdrop-blur-md p-0.5 rounded-lg border border-white/10">
              <button
                onClick={() => setViewMode('video')}
                className="px-2 py-0.5 rounded text-[10px] font-bold text-white/70 hover:text-white flex items-center gap-1 cursor-pointer"
              >
                <Video size={10} /> Video
              </button>
              <button
                onClick={() => setViewMode('animation')}
                className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500 text-black flex items-center gap-1 cursor-pointer"
              >
                <Activity size={10} /> Animation Active
              </button>
            </div>
          )}

          <ExerciseAnimationEngine
            exerciseName={displayName}
            category={category}
            targetMuscle={targetMuscle}
            duration={initialDuration}
            autoPlay={autoPlay}
            compact={compact}
            isPlayingExternal={externalIsPlaying !== undefined ? externalIsPlaying : isPlaying}
            resetTrigger={resetTrigger}
            className="w-full h-full rounded-2xl"
          />
        </div>
      )}
    </div>
  );
};

export default ExerciseVideoPlayer;
