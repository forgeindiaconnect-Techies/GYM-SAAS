import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { 
  Search, Send, Loader2, MessageSquare, RefreshCw, 
  Dumbbell, Paperclip, Mic, AlertCircle, FilePlus
} from 'lucide-react';
import api from '../../utils/api';
import { useAuth } from '../../contexts/AuthContext';
import MemberTrainingTabs from '../../components/Member/MemberTrainingTabs';
import MessageBubble from '../../components/Messages/MessageBubble';
import type { MessageData, MessageAttachment } from '../../components/Messages/MessageBubble';
import VoiceRecorder from '../../components/Messages/VoiceRecorder';
import AttachmentPreview, { formatFileSize } from '../../components/Messages/AttachmentPreview';
import type { PendingAttachment } from '../../components/Messages/AttachmentPreview';

interface Contact {
  id: string;
  _id: string;
  name: string;
  email?: string;
  role?: string;
  specialization?: string;
  profilePhoto?: string;
  lastMsg?: string;
  lastMsgTime?: string | Date | null;
  unreadCount?: number;
}

const MAX_FILE_SIZE_BYTES = 50 * 1024 * 1024; // 50MB

const MemberMessages = () => {
  const [searchParams] = useSearchParams();
  const targetTrainerId = searchParams.get('trainerId');
  const { user: currentUser } = useAuth();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [selectedContact, setSelectedContact] = useState<Contact | null>(null);
  const [messages, setMessages] = useState<MessageData[]>([]);
  const [messageText, setMessageText] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [loadingContacts, setLoadingContacts] = useState(true);
  const [loadingMessages, setLoadingMessages] = useState(false);
  const [sending, setSending] = useState(false);

  // Voice recording & file attachments states
  const [isRecordingVoice, setIsRecordingVoice] = useState(false);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // 1. Fetch contacts (Trainers)
  const fetchContacts = useCallback(async (autoSelectTarget = false) => {
    try {
      const res = await api.get('/direct-messages/contacts');
      if (res.data.success) {
        const fetchedContacts: Contact[] = res.data.contacts || [];
        setContacts(fetchedContacts);

        if (fetchedContacts.length > 0) {
          if (autoSelectTarget && targetTrainerId) {
            const match = fetchedContacts.find(c => c.id === targetTrainerId || c._id === targetTrainerId);
            if (match) {
              setSelectedContact(match);
              return;
            }
          }
          if (!selectedContact) {
            setSelectedContact(fetchedContacts[0]);
          }
        }
      }
    } catch (err) {
      console.error('Failed to fetch contacts:', err);
    } finally {
      setLoadingContacts(false);
    }
  }, [targetTrainerId, selectedContact]);

  useEffect(() => {
    fetchContacts(true);
  }, [fetchContacts]);

  // 2. Fetch history for selected trainer
  const fetchHistory = useCallback(async (contactId: string, quiet = false) => {
    if (!quiet) setLoadingMessages(true);
    try {
      const res = await api.get(`/direct-messages/history/${contactId}`);
      if (res.data.success) {
        setMessages(res.data.messages || []);
      }
    } catch (err) {
      console.error('Failed to fetch messages:', err);
    } finally {
      if (!quiet) setLoadingMessages(false);
    }
  }, []);

  useEffect(() => {
    if (selectedContact) {
      fetchHistory(selectedContact.id);
    }
  }, [selectedContact, fetchHistory]);

  // 3. Polling every 3 seconds
  useEffect(() => {
    if (!selectedContact) return;
    const interval = setInterval(() => {
      fetchHistory(selectedContact.id, true);
      fetchContacts(false);
    }, 3000);

    return () => clearInterval(interval);
  }, [selectedContact, fetchHistory, fetchContacts]);

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Handle selected file inputs
  const handleFiles = (files: FileList | File[]) => {
    setUploadError(null);
    const newPending: PendingAttachment[] = [];

    Array.from(files).forEach((file) => {
      if (file.size > MAX_FILE_SIZE_BYTES) {
        setUploadError(`File "${file.name}" exceeds the 50MB limit.`);
        return;
      }

      let type: PendingAttachment['type'] = 'other';
      if (file.type.startsWith('image/')) type = 'image';
      else if (file.type.startsWith('video/')) type = 'video';
      else if (file.type.startsWith('audio/')) type = 'audio';
      else if (
        file.type.includes('pdf') ||
        file.type.includes('msword') ||
        file.type.includes('officedocument') ||
        file.type.includes('excel') ||
        file.type.startsWith('text/')
      ) {
        type = 'document';
      }

      const previewUrl = type === 'image' ? URL.createObjectURL(file) : undefined;
      newPending.push({
        file,
        previewUrl,
        type,
        sizeFormatted: formatFileSize(file.size)
      });
    });

    if (newPending.length > 0) {
      setPendingAttachments((prev) => [...prev, ...newPending]);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      handleFiles(e.target.files);
      e.target.value = ''; // Reset input so same file can be reselected
    }
  };

  const handleRemoveAttachment = (idx: number) => {
    setPendingAttachments((prev) => {
      const removed = prev[idx];
      if (removed?.previewUrl) URL.revokeObjectURL(removed.previewUrl);
      return prev.filter((_, i) => i !== idx);
    });
  };

  // Upload single file to backend Cloudinary upload route
  const uploadSingleFile = async (file: File, isVoice = false, duration?: number): Promise<MessageAttachment> => {
    const formData = new FormData();
    formData.append('file', file);
    if (isVoice) formData.append('isVoice', 'true');
    if (duration) formData.append('duration', duration.toString());

    const res = await api.post('/direct-messages/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' }
    });

    if (!res.data?.success || !res.data?.attachment) {
      throw new Error(res.data?.message || 'Failed to upload attachment');
    }

    return res.data.attachment;
  };

  // Send voice message
  const handleSendVoice = async (audioBlob: Blob, duration: number) => {
    if (!selectedContact || sending) return;
    setSending(true);
    setUploadError(null);

    try {
      const audioFile = new File([audioBlob], `voice_${Date.now()}.webm`, { type: audioBlob.type || 'audio/webm' });
      const uploadedAttachment = await uploadSingleFile(audioFile, true, duration);

      const res = await api.post('/direct-messages/send', {
        receiverId: selectedContact.id,
        message: '',
        messageType: 'voice',
        duration,
        attachmentUrl: uploadedAttachment.url,
        fileName: uploadedAttachment.fileName,
        fileType: 'audio',
        fileSize: uploadedAttachment.fileSize,
        attachments: [uploadedAttachment]
      });

      if (res.data.success) {
        const newMsg: MessageData = res.data.message;
        setMessages((prev) => [...prev, newMsg]);
        setIsRecordingVoice(false);

        setContacts((prev) =>
          prev.map((c) =>
            c.id === selectedContact.id
              ? { ...c, lastMsg: '🎤 Voice message', lastMsgTime: new Date() }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to send voice recording:', err);
      setUploadError(err.response?.data?.message || err.message || 'Failed to send voice message.');
    } finally {
      setSending(false);
    }
  };

  // Send message (text and/or attachments)
  const handleSend = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!selectedContact || sending) return;

    const hasText = messageText.trim().length > 0;
    const hasAttachments = pendingAttachments.length > 0;

    if (!hasText && !hasAttachments) return;

    setSending(true);
    setUploadError(null);

    try {
      let uploadedList: MessageAttachment[] = [];

      // 1. Upload all pending attachments
      if (hasAttachments) {
        for (const item of pendingAttachments) {
          const uploaded = await uploadSingleFile(item.file);
          uploadedList.push(uploaded);
        }
      }

      // 2. Determine primary messageType
      let primaryType: MessageData['messageType'] = 'text';
      if (uploadedList.length > 0) {
        const first = uploadedList[0].fileType;
        if (first === 'image') primaryType = 'image';
        else if (first === 'video') primaryType = 'video';
        else if (first === 'audio') primaryType = 'voice';
        else primaryType = 'file';
      }

      const textToSend = messageText.trim();

      // 3. Send message payload
      const res = await api.post('/direct-messages/send', {
        receiverId: selectedContact.id,
        message: textToSend,
        messageType: primaryType,
        attachments: uploadedList,
        attachmentUrl: uploadedList[0]?.url,
        fileName: uploadedList[0]?.fileName,
        fileType: uploadedList[0]?.fileType,
        fileSize: uploadedList[0]?.fileSize
      });

      if (res.data.success) {
        const newMsg: MessageData = res.data.message;
        setMessages((prev) => [...prev, newMsg]);

        // Clean up previews
        pendingAttachments.forEach((a) => {
          if (a.previewUrl) URL.revokeObjectURL(a.previewUrl);
        });
        setPendingAttachments([]);
        setMessageText('');

        const previewSnippet = textToSend || (uploadedList.length > 0 ? `📎 ${uploadedList[0].fileName}` : 'Attachment');
        setContacts((prev) =>
          prev.map((c) =>
            c.id === selectedContact.id
              ? { ...c, lastMsg: previewSnippet, lastMsgTime: new Date() }
              : c
          )
        );
      }
    } catch (err: any) {
      console.error('Failed to send message:', err);
      setUploadError(err.response?.data?.message || err.message || 'Failed to send message.');
    } finally {
      setSending(false);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const filteredContacts = contacts.filter((c) =>
    c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    (c.specialization && c.specialization.toLowerCase().includes(searchQuery.toLowerCase()))
  );

  return (
    <div className="max-w-6xl mx-auto space-y-4">
      <MemberTrainingTabs />

      <div className="flex justify-between items-end">
        <div>
          <h1 className="text-3xl font-bold text-[#F5FAFA] tracking-tight">Trainer Messages</h1>
          <p className="text-[#9AAEAE] text-sm mt-1">
            Direct 2-way real-time communication with voice notes and file attachments.
          </p>
        </div>
      </div>

      <div 
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`h-[calc(100vh-12rem)] bg-[#141D1E] border rounded-2xl shadow-sm overflow-hidden flex flex-col md:flex-row relative transition-all ${
          isDragging ? 'border-2 border-dashed border-[#2DD4BF] ring-4 ring-[#2DD4BF]/10' : 'border-[#2A3A3A]'
        }`}
      >
        {/* Drag Overlay */}
        {isDragging && (
          <div className="absolute inset-0 bg-[#2DD4BF]/10 backdrop-blur-xs z-50 flex items-center justify-center pointer-events-none">
            <div className="bg-[#141D1E] p-6 rounded-2xl shadow-xl flex flex-col items-center gap-2 border-2 border-[#2DD4BF]">
              <FilePlus size={40} className="text-[#2DD4BF] animate-bounce" />
              <p className="font-extrabold text-[#F5FAFA] text-base">Drop files here to attach</p>
              <p className="text-xs text-[#9AAEAE]">Images, videos, documents up to 50MB</p>
            </div>
          </div>
        )}

        {/* Left Contacts Panel */}
        <div className="w-full md:w-80 border-r border-[#2A3A3A] flex flex-col bg-[#141D1E]">
          <div className="p-3.5 border-b border-[#2A3A3A] flex items-center justify-between gap-2">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9AAEAE]" size={16} />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search trainers..."
                className="w-full pl-9 pr-3 py-2 bg-[#0E1415] border border-[#2A3A3A] rounded-xl text-sm focus:border-[#2DD4BF] outline-none"
              />
            </div>
            <button
              onClick={() => fetchContacts(false)}
              title="Refresh list"
              className="p-2 text-[#9AAEAE] hover:text-[#2DD4BF] hover:bg-[#0E1415] rounded-lg transition-colors cursor-pointer"
            >
              <RefreshCw size={16} />
            </button>
          </div>

          <div className="flex-1 overflow-y-auto divide-y divide-[#2A3A3A]/60">
            {loadingContacts ? (
              <div className="flex flex-col items-center justify-center p-8 text-[#9AAEAE] gap-2">
                <Loader2 size={24} className="animate-spin text-[#2DD4BF]" />
                <span className="text-xs">Loading trainers...</span>
              </div>
            ) : filteredContacts.length === 0 ? (
              <div className="p-8 text-center text-sm text-[#9AAEAE] flex flex-col items-center gap-2">
                <Dumbbell size={28} className="text-[#9AAEAE]" />
                <span>No trainers found</span>
              </div>
            ) : (
              filteredContacts.map((contact) => {
                const isSelected = selectedContact?.id === contact.id;
                return (
                  <div
                    key={contact.id}
                    onClick={() => setSelectedContact(contact)}
                    className={`flex items-center p-4 cursor-pointer transition-colors ${
                      isSelected ? 'bg-[#2DD4BF]/10 border-l-4 border-l-[#2DD4BF]' : 'hover:bg-[#0E1415]'
                    }`}
                  >
                    <div className="relative shrink-0">
                      {contact.profilePhoto ? (
                        <img
                          src={contact.profilePhoto}
                          alt={contact.name}
                          className="w-11 h-11 rounded-full object-cover border border-[#2A3A3A]"
                        />
                      ) : (
                        <div className="w-11 h-11 bg-[#2DD4BF]/15 rounded-full flex items-center justify-center font-bold text-[#2DD4BF] text-base border border-[#2A3A3A]">
                          {contact.name[0] || 'T'}
                        </div>
                      )}
                      <span className="absolute bottom-0 right-0 w-3 h-3 bg-[#2DD4BF] border-2 border-white rounded-full"></span>
                    </div>
                    <div className="ml-3 flex-1 overflow-hidden">
                      <div className="flex justify-between items-baseline">
                        <h4 className="font-bold text-[#F5FAFA] text-sm truncate">{contact.name}</h4>
                        {contact.unreadCount && contact.unreadCount > 0 ? (
                          <span className="bg-[#2DD4BF] text-[#06201D] font-bold text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                            {contact.unreadCount}
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs text-[#9AAEAE] truncate mt-0.5">
                        {contact.specialization ? `${contact.specialization} · ` : ''}
                        {contact.lastMsg}
                      </p>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* Right Chat Area */}
        <div className="flex-1 flex flex-col bg-[#0E1415]">
          {selectedContact ? (
            <>
              {/* Header */}
              <div className="p-4 bg-[#141D1E] border-b border-[#2A3A3A] flex justify-between items-center">
                <div className="flex items-center space-x-3">
                  <div className="w-10 h-10 bg-[#2DD4BF]/15 rounded-full flex items-center justify-center font-bold text-[#2DD4BF] border border-[#2A3A3A] shrink-0 overflow-hidden">
                    {selectedContact.profilePhoto ? (
                      <img src={selectedContact.profilePhoto} alt="" className="w-full h-full object-cover" />
                    ) : (
                      selectedContact.name[0] || 'T'
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-[#F5FAFA]">{selectedContact.name}</h3>
                    <p className="text-xs text-[#2DD4BF] font-medium">
                      {selectedContact.specialization || 'Personal Trainer'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-[11px] text-[#9AAEAE] font-semibold bg-[#1B2728] px-2.5 py-1 rounded-full">
                    Max file size: 50MB
                  </span>
                </div>
              </div>

              {/* Chat Messages List */}
              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {loadingMessages ? (
                  <div className="flex flex-col items-center justify-center py-12 text-[#9AAEAE] gap-2">
                    <Loader2 size={24} className="animate-spin text-[#2DD4BF]" />
                    <span className="text-xs">Loading chat history...</span>
                  </div>
                ) : messages.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-16 text-[#9AAEAE] gap-2 text-center">
                    <MessageSquare size={36} className="text-[#9AAEAE]" />
                    <p className="text-sm font-semibold text-[#F5FAFA]">No messages yet</p>
                    <p className="text-xs text-[#9AAEAE] max-w-sm">
                      Send a message, voice recording, or workout/diet photo to start conversation with {selectedContact.name}.
                    </p>
                  </div>
                ) : (
                  messages.map((msg) => {
                    const isMine = msg.senderId?.toString() === currentUser?.id?.toString();
                    const senderLabel = isMine
                      ? `You (${currentUser?.firstName || 'Customer'} ${currentUser?.lastName || ''})`.trim()
                      : `${selectedContact.name} (Trainer)`;
                    const avatarChar = isMine
                      ? (currentUser?.firstName?.charAt(0) || 'M')
                      : (selectedContact.name[0] || 'T');

                    return (
                      <MessageBubble
                        key={msg._id}
                        message={msg}
                        isMine={isMine}
                        senderLabel={senderLabel}
                        avatarChar={avatarChar}
                      />
                    );
                  })
                )}
                <div ref={messagesEndRef} />
              </div>

              {/* Error banner */}
              {uploadError && (
                <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-xs text-red-600 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <AlertCircle size={14} /> {uploadError}
                  </span>
                  <button onClick={() => setUploadError(null)} className="font-bold underline cursor-pointer">
                    Dismiss
                  </button>
                </div>
              )}

              {/* Input Area */}
              <div className="p-3 bg-[#141D1E] border-t border-[#2A3A3A] flex flex-col gap-2">
                {/* Pending attachments preview */}
                <AttachmentPreview
                  attachments={pendingAttachments}
                  onRemove={handleRemoveAttachment}
                />

                {/* Hidden File Input */}
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileSelect}
                  multiple
                  accept="image/*,video/*,audio/*,.pdf,.doc,.docx,.xls,.xlsx,.txt"
                  className="hidden"
                />

                {/* Active Voice Recorder or Standard Message Input */}
                {isRecordingVoice ? (
                  <VoiceRecorder
                    onSend={handleSendVoice}
                    onCancel={() => setIsRecordingVoice(false)}
                    isUploading={sending}
                  />
                ) : (
                  <form onSubmit={handleSend} className="relative flex items-center gap-2">
                    {/* Attachment Paperclip Button */}
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      disabled={sending}
                      className="p-2.5 text-[#9AAEAE] hover:text-[#2DD4BF] hover:bg-[#1B2728] rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Attach file (Images, Videos, Audio, Documents)"
                    >
                      <Paperclip size={18} />
                    </button>

                    {/* Voice Recording Mic Button */}
                    <button
                      type="button"
                      onClick={() => setIsRecordingVoice(true)}
                      disabled={sending}
                      className="p-2.5 text-[#9AAEAE] hover:text-[#2DD4BF] hover:bg-[#1B2728] rounded-xl transition-colors cursor-pointer shrink-0"
                      title="Record voice message"
                    >
                      <Mic size={18} />
                    </button>

                    {/* Text Input */}
                    <input
                      type="text"
                      placeholder={
                        pendingAttachments.length > 0
                          ? `Add caption for ${pendingAttachments.length} attachment(s)...`
                          : `Message ${selectedContact.name}...`
                      }
                      className="w-full bg-[#0E1415] border border-[#2A3A3A] rounded-xl pl-4 pr-12 py-3 text-sm focus:border-[#2DD4BF] outline-none"
                      value={messageText}
                      onChange={(e) => setMessageText(e.target.value)}
                      disabled={sending}
                    />

                    {/* Send Button */}
                    <button
                      type="submit"
                      disabled={(!messageText.trim() && pendingAttachments.length === 0) || sending}
                      className="absolute right-2 p-2.5 bg-[#2DD4BF] text-[#06201D] font-bold rounded-lg hover:bg-[#5EEAD4] transition-colors disabled:opacity-40 cursor-pointer shadow-xs"
                      title="Send message"
                    >
                      {sending ? <Loader2 size={16} className="animate-spin" /> : <Send size={16} />}
                    </button>
                  </form>
                )}
              </div>
            </>
          ) : (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center text-[#9AAEAE] gap-3">
              <MessageSquare size={48} className="text-[#9AAEAE]" />
              <h3 className="text-lg font-bold text-[#F5FAFA]">Select a trainer to message</h3>
              <p className="text-sm max-w-xs">
                Pick a trainer from the list on the left to start a conversation.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MemberMessages;
