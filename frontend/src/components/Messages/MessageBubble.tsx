import React, { useState } from 'react';
import { FileText, Download, ExternalLink, Video, File, X, ZoomIn } from 'lucide-react';
import AudioMessagePlayer from './AudioMessagePlayer';
import { formatFileSize } from './AttachmentPreview';

export interface MessageAttachment {
  url: string;
  fileName: string;
  fileType: 'image' | 'video' | 'audio' | 'document' | 'other';
  mimeType?: string;
  fileSize?: number;
  duration?: number;
}

export interface MessageData {
  _id: string;
  senderId: string;
  receiverId: string;
  message?: string;
  messageType?: 'text' | 'voice' | 'image' | 'video' | 'file';
  attachments?: MessageAttachment[];
  attachmentUrl?: string;
  fileName?: string;
  fileType?: string;
  fileSize?: number;
  duration?: number;
  read?: boolean;
  createdAt: string;
}

interface MessageBubbleProps {
  message: MessageData;
  isMine: boolean;
  senderLabel: string;
  avatarChar: string;
}

export const MessageBubble: React.FC<MessageBubbleProps> = ({
  message,
  isMine,
  senderLabel,
  avatarChar
}) => {
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  const timeFormatted = new Date(message.createdAt).toLocaleTimeString('en-IN', {
    hour: '2-digit',
    minute: '2-digit'
  });

  // Combine attachments from array or fallback single fields
  const attachments: MessageAttachment[] = [];
  if (message.attachments && message.attachments.length > 0) {
    attachments.push(...message.attachments);
  } else if (message.attachmentUrl) {
    attachments.push({
      url: message.attachmentUrl,
      fileName: message.fileName || (message.messageType === 'voice' ? 'voice-message.webm' : 'attachment'),
      fileType: (message.fileType as any) || (message.messageType === 'voice' ? 'audio' : 'other'),
      fileSize: message.fileSize,
      duration: message.duration
    });
  }

  const isVoice = message.messageType === 'voice' || attachments.some(a => a.fileType === 'audio');
  const voiceAttachment = attachments.find(a => a.fileType === 'audio') || (isVoice && attachments[0]);

  return (
    <>
      <div className={`flex gap-2.5 max-w-[85%] sm:max-w-[75%] ${isMine ? 'ml-auto flex-row-reverse' : ''}`}>
        {/* Avatar */}
        <div className={`w-8 h-8 rounded-full flex shrink-0 items-center justify-center font-bold text-xs ${
          isMine ? 'bg-[#6366F1] text-white shadow-xs' : 'bg-[#17172A] text-[#11111F]'
        }`}>
          {avatarChar}
        </div>

        {/* Bubble Container */}
        <div className={`flex flex-col ${isMine ? 'items-end' : 'items-start'} max-w-full overflow-hidden`}>
          <span className="text-[11px] font-bold text-[#A1A1AA] mb-1 px-1">
            {senderLabel}
          </span>

          <div className={`p-3.5 rounded-2xl text-sm shadow-xs transition-all ${
            isMine
              ? 'bg-[#6366F1] text-white rounded-tr-none'
              : 'bg-white border border-[#292940] text-[#11111F] rounded-tl-none'
          }`}>
            {/* 1. Voice Message Player */}
            {isVoice && voiceAttachment && (
              <div className="mb-1">
                <AudioMessagePlayer
                  src={voiceAttachment.url}
                  duration={voiceAttachment.duration || message.duration}
                  isMine={isMine}
                />
              </div>
            )}

            {/* 2. Attachments (Images, Videos, Documents) */}
            {!isVoice && attachments.length > 0 && (
              <div className="space-y-2 mb-2">
                {attachments.map((att, i) => {
                  if (att.fileType === 'image') {
                    return (
                      <div key={i} className="relative group overflow-hidden rounded-xl border border-black/10">
                        <img
                          src={att.url}
                          alt={att.fileName || 'attachment'}
                          className="max-h-72 max-w-full rounded-xl object-cover cursor-pointer hover:opacity-95 transition-opacity"
                          onClick={() => setLightboxUrl(att.url)}
                          loading="lazy"
                        />
                        <button
                          type="button"
                          onClick={() => setLightboxUrl(att.url)}
                          className="absolute bottom-2 right-2 p-1.5 bg-black/60 text-white rounded-lg opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-[10px] font-bold"
                        >
                          <ZoomIn size={12} /> View Full
                        </button>
                      </div>
                    );
                  }

                  if (att.fileType === 'video') {
                    return (
                      <div key={i} className="rounded-xl overflow-hidden border border-black/10 max-w-full">
                        <video
                          src={att.url}
                          controls
                          className="max-h-72 max-w-full rounded-xl bg-black"
                          preload="metadata"
                        />
                      </div>
                    );
                  }

                  // Documents & Other files
                  return (
                    <div
                      key={i}
                      className={`flex items-center justify-between gap-3 p-3 rounded-xl border transition-all ${
                        isMine
                          ? 'bg-orange-600/40 border-orange-400/40 text-white'
                          : 'bg-[#0B0B12] border-[#292940] text-[#11111F]'
                      }`}
                    >
                      <div className="flex items-center gap-2.5 overflow-hidden">
                        <div className={`w-9 h-9 rounded-lg flex items-center justify-center shrink-0 ${
                          isMine ? 'bg-white/20 text-white' : 'bg-orange-100 text-[#6366F1]'
                        }`}>
                          <FileText size={20} />
                        </div>
                        <div className="overflow-hidden">
                          <p className="font-bold text-xs truncate" title={att.fileName}>
                            {att.fileName}
                          </p>
                          {att.fileSize ? (
                            <span className="text-[10px] opacity-80 font-semibold block">
                              {formatFileSize(att.fileSize)}
                            </span>
                          ) : null}
                        </div>
                      </div>

                      <a
                        href={att.url}
                        target="_blank"
                        rel="noreferrer"
                        download={att.fileName}
                        className={`p-2 rounded-lg transition-transform active:scale-95 shrink-0 flex items-center justify-center ${
                          isMine
                            ? 'bg-white text-[#6366F1] hover:bg-white/90'
                            : 'bg-[#6366F1] text-white hover:bg-[#4F46E5]'
                        }`}
                        title="Download or view file"
                      >
                        <Download size={14} />
                      </a>
                    </div>
                  );
                })}
              </div>
            )}

            {/* 3. Text Message content (if present) */}
            {message.message && message.message.trim().length > 0 && (
              <p className="leading-relaxed whitespace-pre-wrap font-medium">
                {message.message}
              </p>
            )}

            {/* 4. Timestamp */}
            <span className={`text-[10px] block mt-1 ${isMine ? 'text-white/80 text-right' : 'text-[#A1A1AA]'}`}>
              {timeFormatted}
            </span>
          </div>
        </div>
      </div>

      {/* Lightbox Modal for Images */}
      {lightboxUrl && (
        <div
          className="fixed inset-0 z-[200] bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 animate-in fade-in"
          onClick={() => setLightboxUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              onClick={() => setLightboxUrl(null)}
              className="absolute -top-10 right-0 p-2 text-white/80 hover:text-white bg-white/10 rounded-full transition-colors"
              title="Close image"
            >
              <X size={20} />
            </button>
            <img
              src={lightboxUrl}
              alt="Preview"
              className="max-h-[85vh] max-w-full rounded-2xl object-contain shadow-2xl"
            />
            <a
              href={lightboxUrl}
              target="_blank"
              rel="noreferrer"
              download
              className="mt-3 px-4 py-2 bg-[#6366F1] text-white rounded-xl text-xs font-bold hover:bg-[#4F46E5] transition-colors flex items-center gap-1.5"
            >
              <ExternalLink size={14} /> Open Full Resolution
            </a>
          </div>
        </div>
      )}
    </>
  );
};

export default MessageBubble;
