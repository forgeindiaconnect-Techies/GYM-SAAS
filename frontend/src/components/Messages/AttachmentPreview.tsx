import React from 'react';
import { X, FileText, Image as ImageIcon, Video, Music, File } from 'lucide-react';

export interface PendingAttachment {
  file: File;
  previewUrl?: string;
  type: 'image' | 'video' | 'audio' | 'document' | 'other';
  sizeFormatted: string;
}

interface AttachmentPreviewProps {
  attachments: PendingAttachment[];
  onRemove: (index: number) => void;
}

export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 B';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

export const AttachmentPreview: React.FC<AttachmentPreviewProps> = ({ attachments, onRemove }) => {
  if (!attachments || attachments.length === 0) return null;

  const renderIcon = (type: string) => {
    switch (type) {
      case 'image': return <ImageIcon size={18} className="text-[#EA580C]" />;
      case 'video': return <Video size={18} className="text-[#EA580C]" />;
      case 'audio': return <Music size={18} className="text-[#EA580C]" />;
      case 'document': return <FileText size={18} className="text-[#EA580C]" />;
      default: return <File size={18} className="text-[#64748B]" />;
    }
  };

  return (
    <div className="flex items-center gap-2.5 p-2.5 bg-[#F8FAFC] border-b border-[#E2E8F0] overflow-x-auto">
      {attachments.map((item, idx) => (
        <div
          key={idx}
          className="relative flex items-center gap-2.5 bg-[#FFFFFF] border border-[#E2E8F0] rounded-xl p-2 pr-3 shrink-0 shadow-2xs group hover:border-[#FFEDD5] transition-all"
        >
          {/* Thumbnail / Icon */}
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-[#F8FAFC] flex items-center justify-center shrink-0 border border-[#E2E8F0]/60">
            {item.type === 'image' && item.previewUrl ? (
              <img src={item.previewUrl} alt={item.file.name} className="w-full h-full object-cover" />
            ) : (
              renderIcon(item.type)
            )}
          </div>

          {/* Details */}
          <div className="flex flex-col max-w-[140px] sm:max-w-[180px]">
            <span className="text-xs font-bold text-[#111827] truncate" title={item.file.name}>
              {item.file.name}
            </span>
            <span className="text-[10px] text-[#64748B] font-semibold">
              {item.sizeFormatted}
            </span>
          </div>

          {/* Remove Button */}
          <button
            type="button"
            onClick={() => onRemove(idx)}
            className="w-5 h-5 rounded-full bg-[#F8FAFC] hover:bg-red-100 text-[#64748B] hover:text-red-600 flex items-center justify-center transition-colors cursor-pointer shrink-0 ml-1"
            title="Remove attachment"
          >
            <X size={12} />
          </button>
        </div>
      ))}
    </div>
  );
};

export default AttachmentPreview;
