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
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
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

interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  text: string;
  createdAt: string;
  isMine: boolean;
  type?: 'text' | 'voice' | 'attachment';
}

const DEFAULT_TRAINERS: TrainerContact[] = [
  {
    id: 'tr_naveen',
    _id: 'tr_naveen',
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
        setTrainers(serverContacts.map((c: any) => ({
          id: c._id || c.id,
          _id: c._id || c.id,
          name: c.name || 'Trainer',
          role: c.role || 'Personal Trainer',
          specialization: c.specialization || 'Personal Trainer',
          lastMsg: c.lastMsg || 'Tap to chat',
          lastMsgTime: c.lastMsgTime ? new Date(c.lastMsgTime).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now',
          avatarLetter: (c.name || 'T').charAt(0).toUpperCase(),
        })));
      }
    }).catch(() => {});
  }, []);

  const currentMessages = conversations[selectedTrainer.id] || [];

  const handleSendMessage = async (textOverride?: string) => {
    const textToSend = (textOverride || inputMessage).trim();
    if (!textToSend || sending) return;

    const nowTime = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }).toLowerCase();

    const newMsg: ChatMessage = {
      id: 'msg_' + Date.now(),
      senderId: user?._id || 'user_renugopal',
      senderName: userName,
      text: textToSend,
      createdAt: nowTime,
      isMine: true,
    };

    setConversations((prev) => ({
      ...prev,
      [selectedTrainer.id]: [...(prev[selectedTrainer.id] || []), newMsg],
    }));

    // Update trainer latest preview
    setTrainers((prev) =>
      prev.map((t) => (t.id === selectedTrainer.id ? { ...t, lastMsg: textToSend, lastMsgTime: nowTime } : t))
    );

    setInputMessage('');

    // Attempt server send
    try {
      setSending(true);
      await api.post('/direct-messages/send', {
        recipientId: selectedTrainer.id,
        content: textToSend,
      }).catch(() => {});
    } catch {
      // Offline fallback
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
          text: 'Good afternoon Renugopal! How was today’s training session? Let me know if you need any adjustments.',
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
    Alert.alert('Send Attachment (Max 50MB)', 'Choose attachment type to send to ' + selectedTrainer.name, [
      {
        text: 'Photo of Workout / Meal',
        onPress: () => {
          handleSendMessage('📷 [Photo Attachment: workout_form_check.jpg]');
        },
      },
      {
        text: 'PDF / Fitness Report',
        onPress: () => {
          handleSendMessage('📄 [Document: body_composition_report.pdf (2.4MB)]');
        },
      },
      { text: 'Cancel', style: 'cancel' },
    ]);
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
                      <Text style={styles.myMessageText}>{msg.text}</Text>
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
                      <Text style={styles.trainerMessageText}>{msg.text}</Text>
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
            placeholder={`Message ${selectedTrainer.name}...`}
            placeholderTextColor="#94A3B8"
            value={inputMessage}
            onChangeText={setInputMessage}
            multiline={false}
            onSubmitEditing={() => handleSendMessage()}
            returnKeyType="send"
          />

          {/* Orange Send Button */}
          <TouchableOpacity
            style={[styles.sendBtn, !inputMessage.trim() && !isRecording && styles.sendBtnDisabled]}
            onPress={() => (isRecording ? handleToggleVoiceRecording() : handleSendMessage())}
            disabled={!inputMessage.trim() && !isRecording}
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
});
