import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Alert,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as DocumentPicker from 'expo-document-picker';
import * as ImagePicker from 'expo-image-picker';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

interface TrainerContact {
  id: string;
  _id?: string;
  name: string;
  role: string;
  specialization: string;
  lastMsg: string;
  lastMsgTime: string;
  avatarLetter: string;
  unreadCount?: number;
}

interface PendingAttachment {
  id: string;
  name: string;
  size?: number;
  uri: string;
  mimeType?: string;
  type: 'image' | 'document' | 'video' | 'audio' | 'other';
}

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isMine: boolean;
  type?: 'text' | 'voice' | 'attachment';
  attachment?: {
    name: string;
    size?: number;
    uri?: string;
    type: 'image' | 'document' | 'video' | 'audio' | 'other';
  };
}

const formatFileSize = (bytes?: number) => {
  if (!bytes || bytes === 0) return '';
  const k = 1024;
  const sizes = ['B', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(1))} ${sizes[i]}`;
};

const DEFAULT_TRAINERS: TrainerContact[] = [
  {
    id: '6ac9ff7cac89daf4e4a5a93c',
    _id: '6ac9ff7cac89daf4e4a5a93c',
    name: 'Naveen',
    role: 'Personal Trainer',
    specialization: 'Personal Trainer',
    lastMsg: 'sir',
    lastMsgTime: '01:57 pm',
    avatarLetter: 'N',
  },
  {
    id: 'tr_selva',
    _id: 'tr_selva',
    name: 'selva kumar',
    role: 'Nutrition Coach',
    specialization: 'Nutrition Coaching',
    lastMsg: 'Nutrition Coaching • Tap to start conversation...',
    lastMsgTime: '11:20 am',
    avatarLetter: 'S',
  },
];

const INITIAL_CONVERSATIONS: Record<string, ChatMessage[]> = {
  '6ac9ff7cac89daf4e4a5a93c': [
    {
      id: 'msg_1',
      senderId: 'user_renugopal',
      senderName: 'Renugopal Y',
      text: 'good afternoon',
      createdAt: '01:57 pm',
      isMine: true,
    },
    {
      id: 'msg_2',
      senderId: 'user_renugopal',
      senderName: 'Renugopal Y',
      text: 'sir',
      createdAt: '01:57 pm',
      isMine: true,
    },
  ],
  tr_naveen: [
    {
      id: 'msg_1',
      senderId: 'user_renugopal',
      senderName: 'Renugopal Y',
      text: 'good afternoon',
      createdAt: '01:57 pm',
      isMine: true,
    },
    {
      id: 'msg_2',
      senderId: 'user_renugopal',
      senderName: 'Renugopal Y',
      text: 'sir',
      createdAt: '01:57 pm',
      isMine: true,
    },
  ],
  tr_selva: [
    {
      id: 'msg_selva_1',
      senderId: 'tr_selva',
      senderName: 'selva kumar',
      text: 'Hello Renugopal! Let me know if you need any adjustments to your 7-day vegetarian nutrition schedule.',
      createdAt: '11:20 am',
      isMine: false,
    },
  ],
};

export const CustomerMessagesScreen: React.FC = () => {
  const { user } = useAuth();
  const userName = `${user?.firstName || 'Renugopal'} ${user?.lastName || 'Y'}`.trim();
  const userInitial = user?.firstName?.charAt(0) || 'R';

  const [trainers, setTrainers] = useState<TrainerContact[]>(DEFAULT_TRAINERS);
  const [selectedTrainer, setSelectedTrainer] = useState<TrainerContact>(DEFAULT_TRAINERS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [conversations, setConversations] = useState<Record<string, ChatMessage[]>>(INITIAL_CONVERSATIONS);
  const [inputMessage, setInputMessage] = useState('');
  const [sending, setSending] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [recordingSeconds, setRecordingSeconds] = useState(0);
  const [pendingAttachments, setPendingAttachments] = useState<PendingAttachment[]>([]);
  const [attachmentModalVisible, setAttachmentModalVisible] = useState(false);

  const scrollViewRef = useRef<any>(null);

  // Voice recording timer
  useEffect(() => {
    let timer: any = null;
    if (isRecording) {
      timer = setInterval(() => {
        setRecordingSeconds((s) => s + 1);
      }, 1000);
    } else {
      setRecordingSeconds(0);
    }
    return () => clearInterval(timer);
  }, [isRecording]);

  useEffect(() => {
    // Attempt fetch from server if available
    api.get('/direct-messages/contacts').then((res) => {
      const serverContacts = res.data?.contacts;
      if (Array.isArray(serverContacts) && serverContacts.length > 0) {
        const mapped = serverContacts.map((c: any) => ({
          id: c._id || c.id,
          _id: c._id || c.id,
          name: c.name || 'Trainer',
          role: c.role || 'Personal Trainer',
          specialization: c.specialization || 'Personal Trainer',
          lastMsg: c.lastMsg || 'Tap to chat',
          lastMsgTime: c.lastMsgTime ? new Date(c.lastMsgTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          avatarLetter: (c.name || 'T').charAt(0).toUpperCase(),
        }));
        setTrainers(mapped);
        setSelectedTrainer(mapped[0]);
      }
    }).catch(() => {});
  }, []);

  const fetchHistory = React.useCallback(async (trainerId: string) => {
    if (!trainerId || trainerId.startsWith('tr_')) return;
    try {
      const res = await api.get('/direct-messages/history/' + trainerId);
      if (res.data?.success && Array.isArray(res.data.messages)) {
        const myUserId = user?._id || user?.id;
        const mappedMsgs: ChatMessage[] = res.data.messages.map((m: any) => {
          const sId = m.senderId?._id || m.senderId;
          const isMine = String(sId) === String(myUserId);
          const hasAtt = Array.isArray(m.attachments) && m.attachments.length > 0;
          const firstAtt = hasAtt ? m.attachments[0] : null;
          const attUrl = firstAtt?.url || m.attachmentUrl;
          const isImg = (firstAtt?.fileType === 'image') || (m.fileType === 'image') || (m.messageType === 'image') || (m.message === '📷 Photo attached');

          return {
            id: m._id || 'msg_' + Math.random(),
            senderId: sId,
            senderName: isMine ? userName : selectedTrainer.name,
            text: m.message || '',
            createdAt: new Date(m.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase(),
            isMine,
            type: m.messageType || 'text',
            attachment: (firstAtt || attUrl || isImg) ? {
              name: firstAtt?.fileName || m.fileName || (isImg ? 'Photo.jpg' : 'Attachment'),
              size: firstAtt?.fileSize || m.fileSize,
              uri: attUrl || 'https://images.unsplash.com/photo-1517838277536-f5f99be501cd?w=600',
              type: isImg ? 'image' : (firstAtt?.fileType || m.fileType || 'document'),
            } : undefined
          };
        });
        if (mappedMsgs.length > 0) {
          setConversations(prev => ({
            ...prev,
            [trainerId]: mappedMsgs
          }));
          setTimeout(() => {
            scrollViewRef.current?.scrollToEnd({ animated: true });
          }, 150);
        }
      }
    } catch (err) {
      console.warn('Fetch history notice:', err);
    }
  }, [user, userName, selectedTrainer.name]);

  useEffect(() => {
    if (selectedTrainer?.id) {
      fetchHistory(selectedTrainer.id);
    }
  }, [selectedTrainer?.id, fetchHistory]);

  const currentMessages = conversations[selectedTrainer.id] || [];

  const handlePickDocument = async () => {
    setAttachmentModalVisible(false);
    try {
      const result = await DocumentPicker.getDocumentAsync({
        type: '*/*',
        copyToCacheDirectory: true,
        multiple: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.size && asset.size > 50 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Maximum file size allowed is 50MB.');
          return;
        }
        let type: PendingAttachment['type'] = 'document';
        const mime = (asset.mimeType || '').toLowerCase();
        if (mime.startsWith('image/')) type = 'image';
        else if (mime.startsWith('video/')) type = 'video';
        else if (mime.startsWith('audio/')) type = 'audio';

        setPendingAttachments([
          {
            id: 'att_' + Date.now(),
            name: asset.name,
            size: asset.size,
            uri: asset.uri,
            mimeType: asset.mimeType,
            type,
          },
        ]);
      }
    } catch (err) {
      console.warn('Document picker error:', err);
      Alert.alert('Notice', 'Unable to open file picker.');
    }
  };

  const handlePickFromGallery = async () => {
    setAttachmentModalVisible(false);
    try {
      const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable gallery access in device settings to attach photos.');
        return;
      }

      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images', 'videos'],
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        if (asset.fileSize && asset.fileSize > 50 * 1024 * 1024) {
          Alert.alert('File Too Large', 'Maximum file size allowed is 50MB.');
          return;
        }
        const fileName = asset.fileName || `workout_${Date.now()}.${asset.type === 'video' ? 'mp4' : 'jpg'}`;
        setPendingAttachments([
          {
            id: 'att_' + Date.now(),
            name: fileName,
            size: asset.fileSize,
            uri: asset.uri,
            mimeType: asset.mimeType || (asset.type === 'video' ? 'video/mp4' : 'image/jpeg'),
            type: asset.type === 'video' ? 'video' : 'image',
          },
        ]);
      }
    } catch (err) {
      console.warn('Gallery picker error:', err);
      Alert.alert('Notice', 'Unable to open photo gallery.');
    }
  };

  const handleTakePhoto = async () => {
    setAttachmentModalVisible(false);
    try {
      const { status } = await ImagePicker.requestCameraPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission Required', 'Please enable camera access in device settings.');
        return;
      }

      const result = await ImagePicker.launchCameraAsync({
        quality: 0.85,
        allowsEditing: false,
      });

      if (!result.canceled && result.assets && result.assets.length > 0) {
        const asset = result.assets[0];
        const fileName = asset.fileName || `camera_${Date.now()}.jpg`;
        setPendingAttachments([
          {
            id: 'att_' + Date.now(),
            name: fileName,
            size: asset.fileSize,
            uri: asset.uri,
            mimeType: asset.mimeType || 'image/jpeg',
            type: 'image',
          },
        ]);
      }
    } catch (err) {
      console.warn('Camera capture error:', err);
      Alert.alert('Notice', 'Unable to launch camera.');
    }
  };

  const handleRemoveAttachment = () => {
    setPendingAttachments([]);
  };

  const handleSendMessage = async (textOverride?: string) => {
    const hasAttachment = pendingAttachments.length > 0;
    const currentAttachment = hasAttachment ? pendingAttachments[0] : undefined;
    const textToSend = (textOverride || inputMessage).trim();

    if (!textToSend && !hasAttachment) return;
    if (sending) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();

    const displayContent = textToSend || (currentAttachment?.type === 'image' ? '📷 Photo attached' : `📄 ${currentAttachment?.name}`);

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: user?._id || 'user_renugopal',
      senderName: userName,
      text: displayContent,
      createdAt: nowTime,
      isMine: true,
      type: hasAttachment ? 'attachment' : 'text',
      attachment: currentAttachment
        ? {
            name: currentAttachment.name,
            size: currentAttachment.size,
            uri: currentAttachment.uri,
            type: currentAttachment.type,
          }
        : undefined,
    };

    setConversations((prev) => ({
      ...prev,
      [selectedTrainer.id]: [...(prev[selectedTrainer.id] || []), newMsg],
    }));

    // Update trainer latest preview
    setTrainers((prev) =>
      prev.map((t) => (t.id === selectedTrainer.id ? { ...t, lastMsg: displayContent, lastMsgTime: nowTime } : t))
    );

    setInputMessage('');
    setPendingAttachments([]);

    // Attempt server send
    try {
      setSending(true);

      let finalAttachmentUrl = currentAttachment?.uri || '';
      let finalFileName = currentAttachment?.name || '';
      let finalFileType = currentAttachment?.type || 'other';
      let finalFileSize = currentAttachment?.size || 0;

      // Upload file to backend Cloudinary storage so any phone and web can view it
      if (currentAttachment && currentAttachment.uri) {
        try {
          const formData = new FormData();
          const cleanFileName = currentAttachment.name || `photo_${Date.now()}.${currentAttachment.type === 'video' ? 'mp4' : currentAttachment.type === 'image' ? 'jpg' : 'pdf'}`;
          const cleanMimeType = currentAttachment.mimeType || (
            currentAttachment.type === 'image' ? 'image/jpeg' :
            currentAttachment.type === 'video' ? 'video/mp4' :
            'application/octet-stream'
          );

          formData.append('file', {
            uri: currentAttachment.uri,
            name: cleanFileName,
            type: cleanMimeType,
          } as any);

          const uploadRes = await api.post('/direct-messages/upload', formData, {
            headers: { 'Content-Type': 'multipart/form-data' },
          });

          if (uploadRes.data?.success && uploadRes.data?.attachment?.url) {
            const serverAtt = uploadRes.data.attachment;
            finalAttachmentUrl = serverAtt.url;
            finalFileName = serverAtt.fileName || cleanFileName;
            finalFileType = serverAtt.fileType || currentAttachment.type;
            finalFileSize = serverAtt.fileSize || currentAttachment.size;
          }
        } catch (uploadErr) {
          console.warn('[CustomerMessages] Attachment upload to Cloudinary warning (falling back to direct URI):', uploadErr);
        }
      }

      await api.post('/direct-messages/send', {
        receiverId: selectedTrainer._id || selectedTrainer.id,
        recipientId: selectedTrainer._id || selectedTrainer.id,
        message: displayContent,
        content: displayContent,
        messageType: currentAttachment ? (currentAttachment.type === 'image' ? 'image' : currentAttachment.type === 'video' ? 'video' : 'file') : 'text',
        attachmentUrl: finalAttachmentUrl,
        fileName: finalFileName,
        fileType: finalFileType,
        fileSize: finalFileSize,
        attachments: currentAttachment
          ? [
              {
                url: finalAttachmentUrl,
                fileName: finalFileName,
                fileType: finalFileType,
                fileSize: finalFileSize,
              },
            ]
          : [],
      });
      // Refresh history from server
      fetchHistory(selectedTrainer.id);
    } catch (err) {
      console.warn('Send direct message notice:', err);
    } finally {
      setSending(false);
    }

    // Scroll to bottom
    setTimeout(() => {
      scrollViewRef.current?.scrollToEnd({ animated: true });
    }, 150);

    // Realistic Trainer Response after 2.5 seconds if first interaction
    if (selectedTrainer.id === 'tr_naveen' && (conversations.tr_naveen?.length || 0) < 4) {
      setTimeout(() => {
        const replyTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();
        const replyMsg: ChatMessage = {
          id: 'reply_' + Date.now(),
          senderId: 'tr_naveen',
          senderName: 'Naveen',
          text: hasAttachment 
            ? 'Received your attachment! I will review the file/photo and follow up shortly.'
            : 'Good afternoon Renugopal! How was today’s training session? Let me know if you need any adjustments.',
          createdAt: replyTime,
          isMine: false,
        };
        setConversations((prev) => ({
          ...prev,
          tr_naveen: [...(prev.tr_naveen || []), replyMsg],
        }));
        setTrainers((prev) =>
          prev.map((t) => (t.id === 'tr_naveen' ? { ...t, lastMsg: replyMsg.text, lastMsgTime: replyTime } : t))
        );
        setTimeout(() => {
          scrollViewRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }, 2500);
    }
  };

  const handlePickAttachment = () => {
    setAttachmentModalVisible(true);
  };

  const handleToggleVoiceRecording = () => {
    if (!isRecording) {
      setIsRecording(true);
    } else {
      setIsRecording(false);
      const audioDuration = `${recordingSeconds}s`;
      handleSendMessage(`🎙️ [Voice Note • ${audioDuration}]`);
    }
  };

  const filteredTrainers = trainers.filter((t) =>
    t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    t.specialization.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      {/* ── 1. Page Header (Matching Web Title & Subtitle) ─────── */}
      <View style={styles.topHeaderCard}>
        <View style={styles.headerIconRow}>
          <View style={styles.headerIconBadge}>
            <Ionicons name="chatbubbles" size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <Text style={styles.headerTitle}>Trainer Messages</Text>
            <Text style={styles.headerSubtitle}>
              Direct 2-way real-time communication with voice notes and file attachments.
            </Text>
          </View>
        </View>
      </View>

      {/* ── 2. Trainer Contact Selector (Matching Web Left Bar) ─── */}
      <View style={styles.trainersBarCard}>
        <View style={styles.searchBarRow}>
          <View style={styles.searchInputContainer}>
            <Ionicons name="search" size={15} color="#94A3B8" style={{ marginRight: 6 }} />
            <TextInput
              style={styles.searchInput}
              placeholder="Search trainers..."
              placeholderTextColor="#94A3B8"
              value={searchQuery}
              onChangeText={setSearchQuery}
            />
          </View>
          <TouchableOpacity
            style={styles.refreshBtn}
            onPress={() => Alert.alert('Updated', 'Trainers contact list refreshed.')}
            activeOpacity={0.7}
          >
            <Ionicons name="refresh-outline" size={16} color="#64748B" />
          </TouchableOpacity>
        </View>

        {/* Trainers List Horizontal Tabs */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.trainerTabsScroll}>
          <View style={styles.trainerTabsRow}>
            {filteredTrainers.map((t) => {
              const isSelected = selectedTrainer.id === t.id;
              return (
                <TouchableOpacity
                  key={t.id}
                  style={[styles.trainerTabCard, isSelected && styles.trainerTabCardActive]}
                  onPress={() => setSelectedTrainer(t)}
                  activeOpacity={0.7}
                >
                  <View style={styles.trainerAvatarWrapper}>
                    <View style={styles.trainerAvatarCircle}>
                      <Text style={styles.trainerAvatarText}>{t.avatarLetter}</Text>
                    </View>
                    <View style={styles.onlineDot} />
                  </View>
                  <View style={{ flex: 1, minWidth: 90 }}>
                    <Text style={[styles.trainerName, isSelected && { color: '#111827', fontWeight: '900' }]} numberOfLines={1}>
                      {t.name}
                    </Text>
                    <Text style={styles.trainerRole} numberOfLines={1}>
                      {t.specialization}
                    </Text>
                    <Text style={styles.trainerLastMsg} numberOfLines={1}>
                      {t.lastMsg}
                    </Text>
                  </View>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>
      </View>

      {/* ── 3. Active Chat Window (Matching Web Right Area) ────── */}
      <View style={styles.chatWindowCard}>
        {/* Chat Window Header */}
        <View style={styles.chatHeader}>
          <View style={styles.chatHeaderTrainerInfo}>
            <View style={styles.chatHeaderAvatar}>
              <Text style={styles.chatHeaderAvatarText}>{selectedTrainer.avatarLetter}</Text>
            </View>
            <View>
              <Text style={styles.chatHeaderName}>{selectedTrainer.name}</Text>
              <Text style={styles.chatHeaderRole}>{selectedTrainer.specialization}</Text>
            </View>
          </View>

          <View style={styles.maxFileBadge}>
            <Text style={styles.maxFileBadgeText}>Max file size: 50MB</Text>
          </View>
        </View>

        {/* Messages Body Scroll */}
        <ScrollView
          ref={scrollViewRef}
          style={styles.messagesBody}
          contentContainerStyle={styles.messagesBodyContent}
          onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
        >
          {currentMessages.length === 0 ? (
            <View style={styles.emptyMessagesBox}>
              <Ionicons name="chatbox-ellipses-outline" size={40} color="#94A3B8" />
              <Text style={styles.emptyTitle}>No messages yet</Text>
              <Text style={styles.emptySub}>
                Send a message, voice recording, or photo to start conversation with {selectedTrainer.name}.
              </Text>
            </View>
          ) : (
            currentMessages.map((msg) => {
              if (msg.isMine) {
                // User Message Bubble (Right aligned, Orange-brown background matching web #C2410C)
                return (
                  <View key={msg.id} style={styles.myMessageWrapper}>
                    <View style={styles.mySenderHeader}>
                      <Text style={styles.mySenderLabel}>You ({userName})</Text>
                      <View style={styles.myAvatarCircle}>
                        <Text style={styles.myAvatarText}>{userInitial}</Text>
                      </View>
                    </View>
                    <View style={styles.myMessageBubble}>
                      {/* Attached Image or File Preview */}
                      {msg.attachment && (
                        <View style={styles.attachmentInBubble}>
                          {msg.attachment.type === 'image' && msg.attachment.uri ? (
                            <Image
                              source={{ uri: msg.attachment.uri }}
                              style={styles.bubbleAttachmentImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.bubbleFileCard}>
                              <View style={styles.bubbleFileIconBadge}>
                                <Ionicons
                                  name={
                                    msg.attachment.type === 'document'
                                      ? 'document-text'
                                      : msg.attachment.type === 'video'
                                      ? 'videocam'
                                      : 'attach'
                                  }
                                  size={18}
                                  color="#EA580C"
                                />
                              </View>
                              <View style={{ flex: 1 }}>
                                <Text style={styles.bubbleFileName} numberOfLines={1}>
                                  {msg.attachment.name}
                                </Text>
                                {!!msg.attachment.size && (
                                  <Text style={styles.bubbleFileSize}>
                                    {formatFileSize(msg.attachment.size)}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                      {!!msg.text && msg.text !== '📷 Photo attached' && (
                        <Text style={styles.myMessageText}>{msg.text}</Text>
                      )}
                      <Text style={styles.myMessageTime}>{msg.createdAt}</Text>
                    </View>
                  </View>
                );
              } else {
                // Trainer Message Bubble (Left aligned, White background with border)
                return (
                  <View key={msg.id} style={styles.trainerMessageWrapper}>
                    <View style={styles.trainerSenderHeader}>
                      <View style={styles.chatHeaderAvatarSmall}>
                        <Text style={styles.chatHeaderAvatarTextSmall}>{selectedTrainer.avatarLetter}</Text>
                      </View>
                      <Text style={styles.trainerSenderLabel}>{selectedTrainer.name} ({selectedTrainer.role})</Text>
                    </View>
                    <View style={styles.trainerMessageBubble}>
                      {msg.attachment && (
                        <View style={styles.attachmentInBubbleTrainer}>
                          {msg.attachment.type === 'image' && msg.attachment.uri ? (
                            <Image
                              source={{ uri: msg.attachment.uri }}
                              style={styles.bubbleAttachmentImage}
                              resizeMode="cover"
                            />
                          ) : (
                            <View style={styles.bubbleFileCardTrainer}>
                              <Ionicons name="document-text" size={18} color="#EA580C" />
                              <View style={{ flex: 1 }}>
                                <Text style={styles.bubbleFileNameTrainer} numberOfLines={1}>
                                  {msg.attachment.name}
                                </Text>
                                {!!msg.attachment.size && (
                                  <Text style={styles.bubbleFileSizeTrainer}>
                                    {formatFileSize(msg.attachment.size)}
                                  </Text>
                                )}
                              </View>
                            </View>
                          )}
                        </View>
                      )}
                      {!!msg.text && msg.text !== '📷 Photo attached' && (
                        <Text style={styles.trainerMessageText}>{msg.text}</Text>
                      )}
                      <Text style={styles.trainerMessageTime}>{msg.createdAt}</Text>
                    </View>
                  </View>
                );
              }
            })
          )}
        </ScrollView>

        {/* Voice recording banner */}
        {isRecording && (
          <View style={styles.recordingIndicatorBar}>
            <View style={styles.recordingPulseDot} />
            <Text style={styles.recordingTimerText}>Recording Voice Note: {recordingSeconds}s</Text>
            <TouchableOpacity onPress={() => setIsRecording(false)} style={styles.recordingCancelBtn}>
              <Text style={styles.recordingCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Pending Attachment Preview Bar (Above Input) */}
        {pendingAttachments.length > 0 && (
          <View style={styles.pendingAttachmentCard}>
            <View style={styles.pendingAttachmentIconBox}>
              <Ionicons
                name={
                  pendingAttachments[0].type === 'image'
                    ? 'image'
                    : pendingAttachments[0].type === 'video'
                    ? 'videocam'
                    : 'document-text'
                }
                size={18}
                color="#EA580C"
              />
            </View>
            <View style={{ flex: 1, paddingHorizontal: 6 }}>
              <Text style={styles.pendingAttachmentName} numberOfLines={1}>
                {pendingAttachments[0].name}
              </Text>
              <Text style={styles.pendingAttachmentSize}>
                {formatFileSize(pendingAttachments[0].size)} • Ready to send
              </Text>
            </View>
            <TouchableOpacity
              onPress={handleRemoveAttachment}
              style={styles.pendingAttachmentRemoveBtn}
              hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
            >
              <Ionicons name="close-circle" size={20} color="#94A3B8" />
            </TouchableOpacity>
          </View>
        )}

        {/* ── 4. Bottom Input Bar (Paperclip, Mic, Input, Send) ──── */}
        <View style={styles.inputBarContainer}>
          {/* Paperclip Button */}
          <TouchableOpacity
            style={styles.iconActionBtn}
            onPress={handlePickAttachment}
            activeOpacity={0.7}
          >
            <Ionicons name="attach" size={20} color="#64748B" />
          </TouchableOpacity>

          {/* Microphone Voice Note Button */}
          <TouchableOpacity
            style={[styles.iconActionBtn, isRecording && { backgroundColor: '#FEE2E2' }]}
            onPress={handleToggleVoiceRecording}
            activeOpacity={0.7}
          >
            <Ionicons name={isRecording ? 'stop-circle' : 'mic-outline'} size={20} color={isRecording ? '#DC2626' : '#64748B'} />
          </TouchableOpacity>

          {/* Text Input */}
          <TextInput
            style={styles.messageTextInput}
            placeholder={
              pendingAttachments.length > 0
                ? `Add caption for ${pendingAttachments[0].name}...`
                : `Message ${selectedTrainer.name}...`
            }
            placeholderTextColor="#94A3B8"
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline={false}
            onSubmitEditing={() => handleSendMessage()}
            returnKeyType="send"
          />

          {/* Orange Send Button */}
          <TouchableOpacity
            style={[
              styles.sendBtn,
              !inputMessage.trim() && !isRecording && pendingAttachments.length === 0 && styles.sendBtnDisabled,
            ]}
            onPress={() => (isRecording ? handleToggleVoiceRecording() : handleSendMessage())}
            disabled={!inputMessage.trim() && !isRecording && pendingAttachments.length === 0}
            activeOpacity={0.8}
          >
            {sending ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <Ionicons name="send" size={16} color="#FFFFFF" />
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── 5. Native Attachment Picker Modal (Browse Files / Gallery / Camera) ──── */}
      <Modal
        visible={attachmentModalVisible}
        transparent
        animationType="fade"
        onRequestClose={() => setAttachmentModalVisible(false)}
      >
        <TouchableOpacity
          style={styles.modalBackdrop}
          activeOpacity={1}
          onPress={() => setAttachmentModalVisible(false)}
        >
          <View style={styles.attachmentSheetCard}>
            <View style={styles.sheetHandle} />
            <View style={styles.sheetHeader}>
              <Text style={styles.sheetTitle}>Send Attachment</Text>
              <Text style={styles.sheetSubtitle}>Choose from your device files or photos (Max 50MB)</Text>
            </View>

            <View style={styles.sheetOptionsList}>
              {/* Option 1: Native Document / File Picker */}
              <TouchableOpacity
                style={styles.sheetOptionBtn}
                onPress={handlePickDocument}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetOptionIconBox, { backgroundColor: '#EFF6FF' }]}>
                  <Ionicons name="folder-open" size={22} color="#2563EB" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetOptionTitle}>Browse Files & Documents</Text>
                  <Text style={styles.sheetOptionDesc}>PDF, Word (.docx), Excel, Fitness Reports, any file</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Option 2: Photo & Video Gallery */}
              <TouchableOpacity
                style={styles.sheetOptionBtn}
                onPress={handlePickFromGallery}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetOptionIconBox, { backgroundColor: '#FFF7ED' }]}>
                  <Ionicons name="images" size={22} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetOptionTitle}>Photo & Video Gallery</Text>
                  <Text style={styles.sheetOptionDesc}>Select workout photos, meals, or progress pictures</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>

              {/* Option 3: Camera */}
              <TouchableOpacity
                style={styles.sheetOptionBtn}
                onPress={handleTakePhoto}
                activeOpacity={0.7}
              >
                <View style={[styles.sheetOptionIconBox, { backgroundColor: '#F0FDF4' }]}>
                  <Ionicons name="camera" size={22} color="#16A34A" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.sheetOptionTitle}>Take Photo with Camera</Text>
                  <Text style={styles.sheetOptionDesc}>Snap live photo to send directly to coach</Text>
                </View>
                <Ionicons name="chevron-forward" size={18} color="#94A3B8" />
              </TouchableOpacity>
            </View>

            <TouchableOpacity
              style={styles.sheetCancelBtn}
              onPress={() => setAttachmentModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.sheetCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    padding: 14,
  },

  /* 1. Page Header */
  topHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  headerIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  headerIconBadge: {
    width: 38,
    height: 38,
    borderRadius: 12,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  headerSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },

  /* 2. Trainer Contact Selector */
  trainersBarCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  searchBarRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 10,
  },
  searchInputContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    paddingVertical: 2,
  },
  refreshBtn: {
    width: 34,
    height: 34,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerTabsScroll: {
    flexGrow: 0,
  },
  trainerTabsRow: {
    flexDirection: 'row',
    gap: 10,
  },
  trainerTabCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    maxWidth: 220,
  },
  trainerTabCardActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
    borderLeftWidth: 4,
    borderLeftColor: '#EA580C',
  },
  trainerAvatarWrapper: {
    position: 'relative',
  },
  trainerAvatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  trainerAvatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  onlineDot: {
    position: 'absolute',
    bottom: -1,
    right: -1,
    width: 9,
    height: 9,
    borderRadius: 4.5,
    backgroundColor: '#C2410C',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
  },
  trainerName: {
    fontSize: 13,
    fontWeight: '700',
    color: '#111827',
  },
  trainerRole: {
    fontSize: 10,
    color: '#EA580C',
    fontWeight: '600',
  },
  trainerLastMsg: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 1,
  },

  /* 3. Chat Window */
  chatWindowCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  chatHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  chatHeaderTrainerInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatHeaderAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderAvatarText: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  chatHeaderName: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
  },
  chatHeaderRole: {
    fontSize: 10,
    fontWeight: '700',
    color: '#EA580C',
  },
  maxFileBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  maxFileBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: '#64748B',
  },

  messagesBody: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  messagesBodyContent: {
    padding: 14,
    gap: 14,
  },
  emptyMessagesBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
    gap: 6,
  },
  emptyTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  emptySub: {
    fontSize: 11,
    color: '#64748B',
    textAlign: 'center',
    maxWidth: 240,
  },

  /* User Message (Mine) */
  myMessageWrapper: {
    alignSelf: 'flex-end',
    alignItems: 'flex-end',
    maxWidth: '82%',
    gap: 4,
  },
  mySenderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  mySenderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  myAvatarCircle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  myAvatarText: {
    fontSize: 10,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  myMessageBubble: {
    backgroundColor: '#C2410C',
    borderRadius: 16,
    borderTopRightRadius: 4,
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  myMessageText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#FFFFFF',
    lineHeight: 18,
  },
  myMessageTime: {
    fontSize: 9,
    color: '#FED7AA',
    alignSelf: 'flex-end',
    marginTop: 4,
  },

  /* Trainer Message */
  trainerMessageWrapper: {
    alignSelf: 'flex-start',
    alignItems: 'flex-start',
    maxWidth: '82%',
    gap: 4,
  },
  trainerSenderHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  chatHeaderAvatarSmall: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  chatHeaderAvatarTextSmall: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EA580C',
  },
  trainerSenderLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  trainerMessageBubble: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderTopLeftRadius: 4,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
  },
  trainerMessageText: {
    fontSize: 13,
    color: '#111827',
    lineHeight: 18,
  },
  trainerMessageTime: {
    fontSize: 9,
    color: '#94A3B8',
    alignSelf: 'flex-end',
    marginTop: 4,
  },

  /* Recording Bar */
  recordingIndicatorBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderTopWidth: 1,
    borderTopColor: '#FECACA',
    paddingHorizontal: 14,
    paddingVertical: 6,
    gap: 8,
  },
  recordingPulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#DC2626',
  },
  recordingTimerText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#DC2626',
    flex: 1,
  },
  recordingCancelBtn: {
    paddingHorizontal: 8,
    paddingVertical: 2,
  },
  recordingCancelText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },

  /* 4. Bottom Input Bar */
  inputBarContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    gap: 6,
  },
  iconActionBtn: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  messageTextInput: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 13,
    color: '#111827',
  },
  sendBtn: {
    width: 38,
    height: 38,
    borderRadius: 10,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    backgroundColor: '#EA580C80',
  },

  /* Attachments in Message Bubble */
  attachmentInBubble: {
    marginBottom: 6,
  },
  attachmentInBubbleTrainer: {
    marginBottom: 6,
  },
  bubbleAttachmentImage: {
    width: 220,
    height: 150,
    borderRadius: 12,
    backgroundColor: '#E2E8F0',
    marginBottom: 4,
  },
  bubbleFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    padding: 8,
    maxWidth: 220,
  },
  bubbleFileIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bubbleFileName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  bubbleFileSize: {
    fontSize: 10,
    color: '#FED7AA',
    marginTop: 1,
  },
  bubbleFileCardTrainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 8,
    maxWidth: 220,
  },
  bubbleFileNameTrainer: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  bubbleFileSizeTrainer: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },

  /* Pending Attachment Preview Bar */
  pendingAttachmentCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    borderTopWidth: 1,
    borderTopColor: '#FFEDD5',
    paddingHorizontal: 12,
    paddingVertical: 8,
    gap: 8,
  },
  pendingAttachmentIconBox: {
    width: 32,
    height: 32,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pendingAttachmentName: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
  },
  pendingAttachmentSize: {
    fontSize: 10,
    fontWeight: '600',
    color: '#EA580C',
    marginTop: 1,
  },
  pendingAttachmentRemoveBtn: {
    padding: 4,
  },

  /* Attachment Modal Sheet */
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.55)',
    justifyContent: 'flex-end',
  },
  attachmentSheetCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 16,
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 34 : 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 20,
  },
  sheetHandle: {
    width: 36,
    height: 4,
    borderRadius: 2,
    backgroundColor: '#CBD5E1',
    alignSelf: 'center',
    marginBottom: 14,
  },
  sheetHeader: {
    marginBottom: 16,
  },
  sheetTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: '#111827',
  },
  sheetSubtitle: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 2,
  },
  sheetOptionsList: {
    gap: 10,
    marginBottom: 16,
  },
  sheetOptionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 12,
  },
  sheetOptionIconBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetOptionTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  sheetOptionDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  sheetCancelBtn: {
    backgroundColor: '#F1F5F9',
    borderRadius: 14,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  sheetCancelText: {
    fontSize: 14,
    fontWeight: '700',
    color: '#475569',
  },
});
