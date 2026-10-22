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
  const [duration, setDuration] = useState(initialDuration || 0);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    const handleLoadedMetadata = () => {
      if (audio.duration && !isNaN(audio.duration) && isFinite(audio.duration)) {
        setDuration(Math.round(audio.duration));
      }
    };

    const handleTimeUpdate = () => {
      setCurrentTime(audio.currentTime);
    };

    const handleEnded = () => {
      setIsPlaying(false);
      setCurrentTime(0);
    };

    const handleError = () => {
      setHasError(true);
      setIsPlaying(false);
    };

    audio.addEventListener('loadedmetadata', handleLoadedMetadata);
    audio.addEventListener('timeupdate', handleTimeUpdate);
    audio.addEventListener('ended', handleEnded);
    audio.addEventListener('error', handleError);

    return () => {
      audio.removeEventListener('loadedmetadata', handleLoadedMetadata);
      audio.removeEventListener('timeupdate', handleTimeUpdate);
      audio.removeEventListener('ended', handleEnded);
      audio.removeEventListener('error', handleError);
    };
  }, [src]);

  const togglePlay = () => {
    if (!audioRef.current || hasError) return;

    if (isPlaying) {
      audioRef.current.pause();
      setIsPlaying(false);
    } else {
      audioRef.current.play().then(() => {
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

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  if (hasError) {
    return (
      <div className={`flex items-center gap-2 p-2 rounded-xl text-xs ${
        isMine ? 'bg-orange-700/40 text-white' : 'bg-red-50 text-red-600'
      }`}>
        <AlertCircle size={14} />
        <span>Audio could not be loaded</span>
        <a href={src} target="_blank" rel="noreferrer" className="underline font-bold ml-1">Open link</a>
      </div>
    );
  }

  return (
    <div className={`flex items-center gap-3 py-1.5 px-1 min-w-[220px] sm:min-w-[260px] select-none ${
      isMine ? 'text-white' : 'text-[#344B4A]'
    }`}>
      <audio ref={audioRef} src={src} preload="metadata" />

      {/* Play / Pause Button */}
      <button
        type="button"
        onClick={togglePlay}
        className={`w-9 h-9 rounded-full flex items-center justify-center shrink-0 shadow-xs transition-transform active:scale-95 cursor-pointer ${
          isMine 
            ? 'bg-white text-[#167D78] hover:bg-white/90' 
            : 'bg-[#167D78] text-white hover:bg-[#116660]'
        }`}
        title={isPlaying ? 'Pause' : 'Play'}
      >
        {isPlaying ? <Pause size={16} className="fill-current" /> : <Play size={16} className="fill-current ml-0.5" />}
      </button>

      {/* Progress & Waveform bars */}
      <div className="flex-1 flex flex-col justify-center">
        <div className="relative flex items-center h-5">
          {/* Custom Track */}
          <div className="absolute inset-x-0 h-1.5 rounded-full overflow-hidden bg-black/15">
            <div 
              className={`h-full transition-all duration-100 ${isMine ? 'bg-white' : 'bg-[#167D78]'}`}
              style={{ width: `${progressPercent}%` }}
            />
          </div>
          {/* Range Slider for scrubbing */}
          <input
            type="range"
            min="0"
            max={duration || 1}
            step="0.1"
            value={currentTime}
            onChange={handleSeek}
            className="absolute inset-x-0 w-full opacity-0 cursor-pointer h-5 z-10"
          />
        </div>

        {/* Timestamps */}
        <div className="flex justify-between items-center text-[10px] font-semibold mt-0.5 opacity-80">
          <span>{formatTime(currentTime)}</span>
          <span className="flex items-center gap-1">
            <Volume2 size={10} />
            {formatTime(duration)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AudioMessagePlayer;
