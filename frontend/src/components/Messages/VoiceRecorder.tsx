import React, { useState, useRef, useEffect } from 'react';
import { Mic, Square, Trash2, Send, Play, Pause, AlertCircle, Loader2 } from 'lucide-react';

interface VoiceRecorderProps {
  onSend: (audioBlob: Blob, duration: number) => Promise<void>;
  onCancel: () => void;
  isUploading?: boolean;
}

export const VoiceRecorder: React.FC<VoiceRecorderProps> = ({ onSend, onCancel, isUploading = false }) => {
  const [recordingState, setRecordingState] = useState<'idle' | 'recording' | 'preview'>('recording');
  const [recordDuration, setRecordDuration] = useState(0);
  const [previewPlaying, setPreviewPlaying] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [audioLevels, setAudioLevels] = useState<number[]>([6, 10, 14, 18, 22, 18, 14, 10, 8, 6, 4]);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const visualizerTrackRef = useRef<MediaStreamTrack | null>(null);
  const audioCtxRef = useRef<AudioContext | null>(null);
  const animFrameRef = useRef<number | null>(null);
  const startTimeRef = useRef<number>(0);
  const sendImmediateRef = useRef<boolean>(false);
  const isDestroyedRef = useRef<boolean>(false);

  // Pick best supported MIME type
  const getSupportedMimeType = () => {
    if (typeof MediaRecorder === 'undefined') return '';
    const types = [
      'audio/webm;codecs=opus',
      'audio/webm',
      'audio/ogg;codecs=opus',
      'audio/mp4',
      'audio/aac'
    ];
    for (const t of types) {
      if (MediaRecorder.isTypeSupported(t)) return t;
    }
    return '';
  };

  const cleanupRecordingHardware = () => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }
    if (animFrameRef.current) {
      cancelAnimationFrame(animFrameRef.current);
      animFrameRef.current = null;
    }
    if (visualizerTrackRef.current) {
      try { visualizerTrackRef.current.stop(); } catch {}
      visualizerTrackRef.current = null;
    }
    if (audioCtxRef.current) {
      try { audioCtxRef.current.close(); } catch {}
      audioCtxRef.current = null;
    }
    if (streamRef.current) {
      try {
        streamRef.current.getTracks().forEach(track => track.stop());
      } catch {}
      streamRef.current = null;
    }
  };

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    audioBlobRef.current = null;
    setRecordDuration(0);
    sendImmediateRef.current = false;

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Voice recording is not supported in this browser.');
      setRecordingState('idle');
      return;
    }

    try {
      // 1. Request microphone stream with clean settings (no aggressive filters that mute voice)
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });

      if (isDestroyedRef.current) {
        stream.getTracks().forEach(t => t.stop());
        return;
      }
      streamRef.current = stream;

      // 2. Setup isolated visualizer track so Web Audio never touches or mutes the main recording stream
      try {
        const audioTracks = stream.getAudioTracks();
        if (audioTracks.length > 0) {
          const clonedTrack = audioTracks[0].clone();
          visualizerTrackRef.current = clonedTrack;
          const cloneStream = new MediaStream([clonedTrack]);

          const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
          if (AudioContextClass) {
            const audioCtx = new AudioContextClass();
            audioCtxRef.current = audioCtx;
            if (audioCtx.state === 'suspended') {
              audioCtx.resume().catch(() => {});
            }

            const source = audioCtx.createMediaStreamSource(cloneStream);
            const analyser = audioCtx.createAnalyser();
            analyser.fftSize = 64;
            source.connect(analyser);

            const dataArray = new Uint8Array(analyser.frequencyBinCount);
            const updateAudioLevels = () => {
              if (isDestroyedRef.current || !analyser) return;
              analyser.getByteFrequencyData(dataArray);

              const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
                const sample = dataArray[i * 2] || dataArray[i] || 0;
                return Math.max(4, Math.min(26, Math.round((sample / 255) * 26) + 4));
              });
              setAudioLevels(bars);
              animFrameRef.current = requestAnimationFrame(updateAudioLevels);
            };
            animFrameRef.current = requestAnimationFrame(updateAudioLevels);
          }
        }
      } catch (visErr) {
        console.warn('Audio visualizer fallback:', visErr);
        // Fallback rhythmic waveform
        const updateFallbackLevels = () => {
          if (isDestroyedRef.current) return;
          const t = Date.now() / 150;
          const bars = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map(i => {
            return Math.max(4, Math.min(24, Math.round(6 + Math.sin(t + i * 0.7) * 8 + 4)));
          });
          setAudioLevels(bars);
          animFrameRef.current = requestAnimationFrame(updateFallbackLevels);
        };
        animFrameRef.current = requestAnimationFrame(updateFallbackLevels);
      }

      // 3. Initialize MediaRecorder on master stream
      const mimeType = getSupportedMimeType();
      const options = mimeType ? { mimeType } : undefined;
      const mediaRecorder = new MediaRecorder(stream, options);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (e) => {
        if (e.data && e.data.size > 0) {
          audioChunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        cleanupRecordingHardware();

        const actualMime = mimeType || mediaRecorder.mimeType || 'audio/webm';
        const finalBlob = new Blob(audioChunksRef.current, { type: actualMime });
        audioBlobRef.current = finalBlob;

        const url = URL.createObjectURL(finalBlob);
        setPreviewUrl(url);

        const durationSecs = startTimeRef.current 
          ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000))
          : 1;

        if (sendImmediateRef.current) {
          onSend(finalBlob, durationSecs);
        } else {
          setRecordingState('preview');
        }
      };

      // 4. Start recording with 250ms chunks
      mediaRecorder.start(250);
      setRecordingState('recording');

      // 5. Timer based on wall-clock time
      startTimeRef.current = Date.now();
      timerRef.current = setInterval(() => {
        if (!startTimeRef.current) return;
        const elapsed = Math.floor((Date.now() - startTimeRef.current) / 1000);
        setRecordDuration(elapsed);
      }, 500);

    } catch (err: any) {
      if (isDestroyedRef.current) return;
      console.error('Microphone access error:', err);
      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setErrorMsg('Microphone access was denied. Please allow microphone permissions in your browser address bar.');
      } else {
        setErrorMsg('Could not access microphone: ' + (err.message || 'Unknown error'));
      }
      setRecordingState('idle');
    }
  };

  useEffect(() => {
    isDestroyedRef.current = false;
    startRecording();

    return () => {
      isDestroyedRef.current = true;
      cleanupRecordingHardware();
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        try { mediaRecorderRef.current.stop(); } catch {}
      }
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl);
      }
    };
  }, []);

  const stopRecording = (andSendImmediately = false) => {
    sendImmediateRef.current = andSendImmediately;

    const finalElapsed = startTimeRef.current 
      ? Math.max(1, Math.round((Date.now() - startTimeRef.current) / 1000)) 
      : 1;
    setRecordDuration(finalElapsed);

    const rec = mediaRecorderRef.current;
    if (rec && rec.state === 'recording') {
      try {
        rec.stop();
      } catch (e) {
        console.error('Error stopping recorder:', e);
      }
    }
  };

  const handleCancel = () => {
    isDestroyedRef.current = true;
    cleanupRecordingHardware();
    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      try { mediaRecorderRef.current.stop(); } catch {}
    }
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    onCancel();
  };

  const handleSendRecording = async () => {
    if (!audioBlobRef.current || recordDuration < 1) {
      setErrorMsg('Recording is too short. Please record for at least 1 second.');
      return;
    }
    await onSend(audioBlobRef.current, Math.max(1, recordDuration));
  };

  const togglePreviewPlay = () => {
    const audio = previewAudioRef.current;
    if (!audio) return;

    if (previewPlaying) {
      audio.pause();
      setPreviewPlaying(false);
    } else {
      if (audio.ended || audio.currentTime >= recordDuration) {
        audio.currentTime = 0;
      }
      audio.play().then(() => {
        setPreviewPlaying(true);
      }).catch(err => {
        console.error('Audio preview playback error:', err);
      });
    }
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  if (errorMsg) {
    return (
      <div className="flex items-center justify-between gap-3 p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 w-full animate-in fade-in">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} className="shrink-0 text-red-600" />
          <span>{errorMsg}</span>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={startRecording}
            className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors cursor-pointer"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-2.5 py-1 bg-[#FFFFFF] text-[#111827] border border-[#E2E8F0] rounded-lg font-bold hover:bg-[#FFF7ED] cursor-pointer"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2.5 w-full bg-[#F8FAFC] border-2 border-[#FDBA74] rounded-xl px-4 py-2.5 shadow-sm animate-in fade-in">
      {recordingState === 'recording' ? (
        <>
          {/* Active Recording State */}
          <div className="flex items-center gap-3 flex-1 min-w-0">
            {/* Blinking red recording indicator */}
            <div className="flex items-center gap-2 shrink-0">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Recording</span>
            </div>

            {/* Live timer */}
            <span className="text-sm font-extrabold text-[#111827] tabular-nums shrink-0">
              {formatTime(recordDuration)}
            </span>

            {/* Real audio waveform visualizer responding to mic voice */}
            <div className="flex items-center gap-1 overflow-hidden">
              {audioLevels.map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#EA580C] rounded-full transition-all duration-75"
                  style={{ height: `${h}px` }}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cancel / Discard */}
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-[#64748B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Cancel recording"
            >
              <Trash2 size={18} />
            </button>

            {/* Stop & Preview button */}
            <button
              type="button"
              onClick={() => stopRecording(false)}
              className="px-3 py-1.5 bg-[#FFFFFF] border border-[#E2E8F0] text-[#111827] font-bold rounded-lg text-xs hover:bg-[#FFF7ED] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Stop and preview voice message"
            >
              <Square size={12} className="fill-current text-[#EA580C]" /> Stop
            </button>

            {/* Direct Send button while recording */}
            <button
              type="button"
              onClick={() => stopRecording(true)}
              disabled={isUploading}
              className="px-3.5 py-1.5 bg-[#EA580C] hover:bg-[#C2410C] text-white font-bold rounded-lg text-xs transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs disabled:opacity-50"
              title="Send voice message now"
            >
              {isUploading ? <Loader2 size={13} className="animate-spin" /> : <Send size={13} />} Send
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Preview State */}
          {previewUrl && (
            <audio
              ref={previewAudioRef}
              src={previewUrl}
              onEnded={() => setPreviewPlaying(false)}
              onPause={() => setPreviewPlaying(false)}
              onPlay={() => setPreviewPlaying(true)}
              playsInline
            />
          )}

          <div className="flex items-center gap-3 flex-1 min-w-0">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-8 h-8 rounded-full bg-[#EA580C] text-white font-bold flex items-center justify-center shrink-0 hover:bg-[#C2410C] transition-transform active:scale-95 cursor-pointer shadow-xs"
              title={previewPlaying ? 'Pause' : 'Play preview'}
            >
              {previewPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
            </button>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#111827] flex items-center gap-1.5">
                <Mic size={13} className="text-[#EA580C]" /> Voice Message Ready
              </span>
              <span className="text-[11px] text-[#64748B] font-semibold tabular-nums">
                Duration: {formatTime(recordDuration)}
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Discard & re-record */}
            <button
              type="button"
              onClick={handleCancel}
              disabled={isUploading}
              className="p-2 text-[#64748B] hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Discard recording"
            >
              <Trash2 size={18} />
            </button>

            {/* Send voice message */}
            <button
              type="button"
              onClick={handleSendRecording}
              disabled={isUploading}
              className="px-4 py-2 bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white font-bold rounded-xl text-xs hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
            >
              {isUploading ? (
                <>
                  <Loader2 size={14} className="animate-spin" /> Sending...
                </>
              ) : (
                <>
                  <Send size={14} /> Send Voice
                </>
              )}
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default VoiceRecorder;
