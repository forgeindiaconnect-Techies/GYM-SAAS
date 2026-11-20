import React, { useState, useRef, useEffect } from 'react';
import { Play, Pause, Volume2, AlertCircle } from 'lucide-react';

interface AudioMessagePlayerProps {
  src: string;
  duration?: number;
  isMine?: boolean;
}

export const AudioMessagePlayer: React.FC<AudioMessagePlayerProps> = ({ src, duration: initialDuration, isMine = false }) => {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [currentTime, setCurrentTime] = useState(0);
  const [duration, setDuration] = useState(initialDuration && initialDuration > 0 ? initialDuration : 0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (initialDuration && initialDuration > 0) {
      setDuration(initialDuration);
    }
  }, [initialDuration]);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    setHasError(false);

    const updateAudioDuration = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration) && audio.duration > 0) {
        setDuration(Math.round(audio.duration));
      } else if (initialDuration && initialDuration > 0) {
        setDuration(initialDuration);
      }
    };

    const handleLoadedMetadata = () => {
      updateAudioDuration();
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
      if (audio.currentTime > duration) {
        setDuration(Math.ceil(audio.currentTime));
      }
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = (e: any) => {
      console.warn('Audio playback error on src:', src, e);
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('durationchange', updateAudioDuration);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('durationchange', updateAudioDuration);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src, initialDuration, duration]);

  const togglePlay = () => {
    const audio = audioRef.current;
    if (!audio || hasError) return;

    if (isPlaying) {
      audio.pause();
      setIsPlaying(false);
    } else {
      if (audio.ended || (duration > 0 && audio.currentTime >= duration)) {
        audio.currentTime = 0;
      }
      audio.play().then(() => {
        setIsPlaying(true);
      }).catch((e) => {
        console.error('Audio play error:', e);
        setHasError(true);
      });
    }
  };

  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    const time = parseFloat(e.target.value);
    setCurrentTime(time);
    if (audioRef.current) {
      audioRef.current.currentTime = time;
    }
  };

  const formatTime = (secs: number) => {
    if (!secs || isNaN(secs) || !isFinite(secs)) return '0:00';
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const effectiveDuration = duration > 0 ? duration : (initialDuration || Math.max(1, Math.ceil(currentTime)));
  const progressPercent = effectiveDuration > 0 ? Math.min(100, (currentTime / effectiveDuration) * 100) : 0;

  if (hasError) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-xl text-xs ${
        isMine ? 'bg-[#FFF7ED] text-white' : 'bg-red-50 text-red-600'
      }`}>
        <AlertCircle size={14} />
        <span>Audio could not be loaded</span>
        <a href={src} target="_blank" rel="noreferrer" className="underline font-bold ml-1">Open link</a>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 py-1.5 px-1 min-w-[220px] sm:min-w-[260px] select-none ${
      isMine ? 'text-white' : 'text-[#111827]'
    }`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer ${
          isMine 
            ? 'bg-[#FFFFFF] text-[#EA580C] hover:bg-[#FFFFFF]/90' 
            : 'bg-[#C2410C] text-white hover:bg-[#9A3412]'
        }`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
      </button>

      {/* Progress & Waveform bars */}
      <div className="flex-1 flex flex-col gap-1 min-w-0">
        <div className="relative flex items-center h-4 group">
          {/* Waveform-like background bars */}
          <div className="absolute inset-0 flex items-center justify-between gap-0.5 opacity-60 pointer-events-none">
            {[4, 8, 14, 10, 16, 20, 12, 8, 14, 18, 10, 6, 12, 16, 8, 4].map((h, i) => (
              <div
                key={i}
                className={`w-1 rounded-full transition-colors ${
                  (i / 16) * 100 <= progressPercent
                    ? (isMine ? 'bg-[#FFFFFF]' : 'bg-[#EA580C]')
                    : (isMine ? 'bg-[#FFFFFF]/30' : 'bg-[#CBD5E1]')
                }`}
                style={{ height: `${h}px` }}
              />
            ))}
          </div>

          {/* Seek Input Slider */}
          <input
            type="range"
            min={0}
            max={effectiveDuration || 1}
            step={0.1}
            value={currentTime}
            onChange={handleSeek}
            className="w-full h-4 opacity-0 cursor-pointer z-10"
            title="Seek audio position"
          />
        </div>

        {/* Timestamps */}
        <div className={`flex items-center justify-between text-[10px] font-semibold tabular-nums ${
          isMine ? 'text-white/80' : 'text-[#64748B]'
        }`}>
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1">
            <Volume2 size={11} className="opacity-70" />
            {formatTime(effectiveDuration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioMessagePlayer;
