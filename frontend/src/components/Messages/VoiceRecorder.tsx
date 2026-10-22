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
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const audioBlobRef = useRef<Blob | null>(null);
  const audioUrlRef = useRef<string | null>(null);
  const previewAudioRef = useRef<HTMLAudioElement | null>(null);
  const timerRef = useRef<any>(null);
  const streamRef = useRef<MediaStream | null>(null);

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

  const startRecording = async () => {
    setErrorMsg(null);
    audioChunksRef.current = [];
    audioBlobRef.current = null;
    setRecordDuration(0);

    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      setErrorMsg('Voice recording is not supported in this browser.');
      setRecordingState('idle');
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

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
        const mime = mimeType || 'audio/webm';
        const blob = new Blob(audioChunksRef.current, { type: mime });
        audioBlobRef.current = blob;
        const url = URL.createObjectURL(blob);
        audioUrlRef.current = url;
        setRecordingState('preview');
      };

      mediaRecorder.start(200); // 200ms slice
      setRecordingState('recording');

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordDuration(prev => prev + 1);
      }, 1000);

    } catch (err: any) {
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
    startRecording();

    return () => {
      // Clean up timer
      if (timerRef.current) clearInterval(timerRef.current);
      // Clean up stream tracks
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      // Revoke preview URL
      if (audioUrlRef.current) {
        URL.revokeObjectURL(audioUrlRef.current);
      }
    };
  }, []);

  const stopRecording = () => {
    if (timerRef.current) clearInterval(timerRef.current);

    if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
      mediaRecorderRef.current.stop();
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
    }
  };

  const handleCancel = () => {
    stopRecording();
    if (audioUrlRef.current) URL.revokeObjectURL(audioUrlRef.current);
    onCancel();
  };

  const handleSendRecording = async () => {
    if (!audioBlobRef.current || recordDuration < 1) {
      setErrorMsg('Recording is too short. Please record for at least 1 second.');
      return;
    }
    await onSend(audioBlobRef.current, recordDuration);
  };

  const togglePreviewPlay = () => {
    if (!previewAudioRef.current) return;
    if (previewPlaying) {
      previewAudioRef.current.pause();
      setPreviewPlaying(false);
    } else {
      previewAudioRef.current.play().then(() => {
        setPreviewPlaying(true);
      }).catch(err => {
        console.error('Preview error:', err);
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
            className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-bold hover:bg-red-700 transition-colors"
          >
            Retry
          </button>
          <button
            type="button"
            onClick={handleCancel}
            className="px-2.5 py-1 bg-white text-stone-700 border border-stone-200 rounded-lg font-bold hover:bg-stone-50"
          >
            Cancel
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center justify-between gap-2.5 w-full bg-[#E8EFF0] border-2 border-[#167D78] rounded-xl px-4 py-2.5 shadow-sm animate-in fade-in">
      {recordingState === 'recording' ? (
        <>
          {/* Active Recording State */}
          <div className="flex items-center gap-3 flex-1">
            {/* Blinking red recording dot */}
            <div className="flex items-center gap-2">
              <span className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-red-600"></span>
              </span>
              <span className="text-xs font-bold text-red-600 uppercase tracking-wider">Recording</span>
            </div>

            {/* Live timer */}
            <span className="text-sm font-extrabold text-[#344B4A] tabular-nums">
              {formatTime(recordDuration)}
            </span>

            {/* Audio wave pulse animation */}
            <div className="hidden sm:flex items-center gap-1">
              {[4, 8, 14, 20, 16, 24, 18, 12, 6, 16, 22, 10, 4].map((h, i) => (
                <div
                  key={i}
                  className="w-1 bg-[#167D78] rounded-full animate-pulse"
                  style={{ 
                    height: `${h}px`, 
                    animationDelay: `${i * 80}ms`,
                    animationDuration: '600ms'
                  }}
                />
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex items-center gap-2 shrink-0">
            {/* Cancel */}
            <button
              type="button"
              onClick={handleCancel}
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Cancel recording"
            >
              <Trash2 size={18} />
            </button>

            {/* Stop & Preview */}
            <button
              type="button"
              onClick={stopRecording}
              className="px-3 py-1.5 bg-[#167D78] text-white rounded-lg text-xs font-bold hover:bg-[#116660] transition-colors flex items-center gap-1.5 cursor-pointer shadow-xs"
              title="Stop and preview voice message"
            >
              <Square size={13} className="fill-current" /> Stop
            </button>
          </div>
        </>
      ) : (
        <>
          {/* Preview State */}
          {audioUrlRef.current && (
            <audio
              ref={previewAudioRef}
              src={audioUrlRef.current}
              onEnded={() => setPreviewPlaying(false)}
            />
          )}

          <div className="flex items-center gap-3 flex-1">
            <button
              type="button"
              onClick={togglePreviewPlay}
              className="w-8 h-8 rounded-full bg-[#167D78] text-white flex items-center justify-center shrink-0 hover:bg-[#116660] transition-transform active:scale-95 cursor-pointer shadow-xs"
              title={previewPlaying ? 'Pause' : 'Play preview'}
            >
              {previewPlaying ? <Pause size={14} className="fill-current" /> : <Play size={14} className="fill-current ml-0.5" />}
            </button>

            <div className="flex flex-col">
              <span className="text-xs font-bold text-[#344B4A] flex items-center gap-1.5">
                <Mic size={13} className="text-[#167D78]" /> Voice Message Preview
              </span>
              <span className="text-[11px] text-[#697778] font-semibold tabular-nums">
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
              className="p-2 text-stone-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
              title="Discard recording"
            >
              <Trash2 size={18} />
            </button>

            {/* Send voice message */}
            <button
              type="button"
              onClick={handleSendRecording}
              disabled={isUploading}
              className="px-4 py-2 bg-gradient-to-r from-[#167D78] to-[#116660] text-white rounded-xl text-xs font-black hover:opacity-95 transition-all flex items-center gap-1.5 cursor-pointer shadow-sm disabled:opacity-50"
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
