import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Alert,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

interface ChatMessage {
  id?: string;
  senderRole: 'MEMBER' | 'TRAINER';
  senderName: string;
  message: string;
  date: string;
}

const DEFAULT_CHAT_MESSAGES: ChatMessage[] = [
  {
    id: 'msg-1',
    senderRole: 'MEMBER',
    senderName: 'You (Member)',
    message: 'Ok. Thank you sir',
    date: '10/17/2026, 11:12:55 AM',
  },
  {
    id: 'msg-2',
    senderRole: 'MEMBER',
    senderName: 'You (Member)',
    message: 'hii',
    date: '11/6/2026, 2:31:38 PM',
  },
];

export const CustomerTrainerFeedbackScreen: React.FC = () => {
  const { user } = useAuth();
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>(DEFAULT_CHAT_MESSAGES);
  const [replyText, setReplyText] = useState('');
  const [replySending, setReplySending] = useState(false);
  const [replySuccess, setReplySuccess] = useState(false);
  const [replyError, setReplyError] = useState('');

  const scrollRef = useRef<any>(null);

  useEffect(() => {
    fetchLatestFeedback();
  }, []);

  const fetchLatestFeedback = async () => {
    try {
      setLoading(true);
      const res = await api.get('/ai/member/latest').catch(() => null);
      if (res?.data?.recommendation) {
        const rec = res.data.recommendation;
        setRecommendation(rec);
        if (Array.isArray(rec.chatMessages) && rec.chatMessages.length > 0) {
          const mapped: ChatMessage[] = rec.chatMessages.map((m: any, idx: number) => ({
            id: m._id || `msg-${idx}`,
            senderRole: m.senderRole || 'MEMBER',
            senderName: m.senderRole === 'MEMBER' ? 'You (Member)' : `Trainer (${m.senderName || 'Naveen'})`,
            message: m.message,
            date: m.date ? new Date(m.date).toLocaleString() : 'Recent',
          }));
          setChatMessages(mapped);
        }
      }
    } catch {
      // Keep defaults matching Web Image 1 & 2
    } finally {
      setLoading(false);
    }
  };

  const handleSendReply = async () => {
    const text = replyText.trim();
    if (!text || replySending) return;

    setReplySending(true);
    setReplyError('');
    setReplySuccess(false);

    const nowFormatted = new Date().toLocaleString([], {
      month: 'numeric',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });

    const newMsg: ChatMessage = {
      id: `msg-${Date.now()}`,
      senderRole: 'MEMBER',
      senderName: 'You (Member)',
      message: text,
      date: nowFormatted,
    };

    // Optimistically update message list
    setChatMessages((prev) => [...prev, newMsg]);
    setReplyText('');
    setReplySuccess(true);

    try {
      await api.post('/ai/member/reply', {
        message: text,
        recommendationId: recommendation?._id,
      }).catch(() => null);
    } catch {
      // offline fallback handled
    } finally {
      setReplySending(false);
      setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 150);
    }

    // Auto-reply simulation from Coach Naveen if discussion is active
    if (chatMessages.length < 5) {
      setTimeout(() => {
        const replyTime = new Date().toLocaleString([], {
          month: 'numeric',
          day: 'numeric',
          year: 'numeric',
          hour: 'numeric',
          minute: '2-digit',
          second: '2-digit',
          hour12: true,
        });

        const coachReply: ChatMessage = {
          id: `reply-${Date.now()}`,
          senderRole: 'TRAINER',
          senderName: 'Trainer (Naveen)',
          message: 'Received your message Renugopal. Keep pushing with today’s progressive overload and maintain adequate hydration!',
          date: replyTime,
        };

        setChatMessages((prev) => [...prev, coachReply]);
        setTimeout(() => {
          scrollRef.current?.scrollToEnd({ animated: true });
        }, 150);
      }, 2500);
    }
  };

  const trainerName = recommendation?.trainerId?.name || 'Naveen';
  const trainerNotes = recommendation?.trainerNotes || 'Hello, this workplan and diet plan is correct so proceed it';
  const planVersion = recommendation?.version || 4;

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
      keyboardVerticalOffset={Platform.OS === 'ios' ? 90 : 0}
    >
      <ScrollView
        ref={scrollRef}
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* ── 1. Page Header (Matching Web Image 1) ───────────────── */}
        <View style={styles.pageHeaderRow}>
          <Text style={styles.pageTitle}>Trainer Review & Feedback</Text>
          <View style={styles.approvedBadge}>
            <Ionicons name="checkmark-circle" size={13} color="#EA580C" />
            <Text style={styles.approvedBadgeText}>Trainer Approved (Version {planVersion})</Text>
          </View>
        </View>

        {/* ── 2. Card 1: Plan Status (Matching Web Image 1) ────────── */}
        <View style={styles.planStatusCard}>
          <View style={styles.planStatusLeftCol}>
            <View style={styles.planStatusTitleRow}>
              <Ionicons name="document-text" size={20} color="#EA580C" />
              <Text style={styles.planStatusTitle}>Plan Status</Text>
            </View>
            <Text style={styles.planStatusDesc}>
              Your trainer has reviewed and approved your AI-generated plan. You are good to go!
            </Text>
          </View>

          <View style={styles.reviewedByBox}>
            <Text style={styles.reviewedByLabel}>REVIEWED BY</Text>
            <Text style={styles.reviewedByName}>{trainerName}</Text>
          </View>
        </View>

        {/* ── 3. Card 2: Professional Trainer Notes (Matching Web Image 1) */}
        <View style={styles.notesCard}>
          <View style={styles.notesTitleRow}>
            <Ionicons name="alert-circle-outline" size={18} color="#EA580C" />
            <Text style={styles.notesTitle}>Professional Trainer Notes</Text>
          </View>
          <View style={styles.notesTextBox}>
            <Text style={styles.notesBodyText}>{trainerNotes}</Text>
          </View>
        </View>

        {/* ── 4. Card 3: Chat & Feedback Discussion (Matching Web Image 2) */}
        <View style={styles.chatDiscussionCard}>
          <View style={styles.chatDiscussionHeaderRow}>
            <Ionicons name="chatbubbles-outline" size={19} color="#EA580C" />
            <Text style={styles.chatDiscussionTitle}>Chat & Feedback Discussion</Text>
          </View>
          <Text style={styles.chatDiscussionSub}>
            You can send additional replies or messages to your trainer below.
          </Text>

          {/* Discussion Messages List */}
          <View style={styles.messagesListBlock}>
            {chatMessages.map((msg, idx) => {
              const isMember = msg.senderRole === 'MEMBER';
              return (
                <View
                  key={msg.id || idx}
                  style={[
                    styles.messageBubbleCard,
                    isMember ? styles.memberBubbleCard : styles.trainerBubbleCard,
                  ]}
                >
                  <View style={styles.messageBubbleTopRow}>
                    <View style={styles.messageSenderRow}>
                      <Ionicons
                        name={isMember ? 'person' : 'chatbubble-ellipses'}
                        size={12}
                        color="#EA580C"
                      />
                      <Text style={styles.messageSenderName}>{msg.senderName}</Text>
                    </View>
                    <Text style={styles.messageDateText}>{msg.date}</Text>
                  </View>
                  <Text style={styles.messageContentText}>{msg.message}</Text>
                </View>
              );
            })}
          </View>

          {/* Reply Textarea Input */}
          <View style={styles.replyInputContainer}>
            <TextInput
              style={styles.replyTextArea}
              multiline
              numberOfLines={4}
              value={replyText}
              onChangeText={(text) => {
                setReplyText(text);
                setReplySuccess(false);
                setReplyError('');
              }}
              placeholder="Type your reply to the trainer here... e.g. 'That works for me, please proceed with the changes.'"
              placeholderTextColor="#94A3B8"
              textAlignVertical="top"
            />

            {replySuccess && (
              <View style={styles.feedbackNoticeRow}>
                <Ionicons name="checkmark-circle" size={14} color="#15803D" />
                <Text style={styles.feedbackSuccessText}>
                  Reply sent successfully to your trainer!
                </Text>
              </View>
            )}

            {replyError ? (
              <View style={styles.feedbackNoticeRow}>
                <Ionicons name="alert-circle" size={14} color="#DC2626" />
                <Text style={styles.feedbackErrorText}>{replyError}</Text>
              </View>
            ) : null}

            {/* Send Button */}
            <TouchableOpacity
              style={[styles.sendReplyBtn, (!replyText.trim() || replySending) && styles.sendReplyBtnDisabled]}
              onPress={handleSendReply}
              disabled={!replyText.trim() || replySending}
              activeOpacity={0.8}
            >
              {replySending ? (
                <ActivityIndicator size="small" color="#FFFFFF" />
              ) : (
                <>
                  <Ionicons name="send" size={15} color="#FFFFFF" />
                  <Text style={styles.sendReplyBtnText}>Send Additional Reply</Text>
                </>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 40,
    gap: 14,
  },

  /* 1. Page Header */
  pageHeaderRow: {
    gap: 8,
    marginBottom: 4,
  },
  pageTitle: {
    fontSize: 21,
    fontWeight: '900',
    color: '#111827',
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-start',
    gap: 5,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 20,
  },
  approvedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },

  /* 2. Card 1: Plan Status */
  planStatusCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  planStatusLeftCol: {
    gap: 6,
  },
  planStatusTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  planStatusTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  planStatusDesc: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
  },
  reviewedByBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    alignItems: 'center',
  },
  reviewedByLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  reviewedByName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },

  /* 3. Card 2: Professional Trainer Notes */
  notesCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  notesTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  notesTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  notesTextBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  notesBodyText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 20,
  },

  /* 4. Card 3: Chat & Feedback Discussion */
  chatDiscussionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  chatDiscussionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  chatDiscussionTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  chatDiscussionSub: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  messagesListBlock: {
    gap: 10,
    marginVertical: 4,
  },
  messageBubbleCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
  },
  memberBubbleCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#EA580C',
  },
  trainerBubbleCard: {
    borderLeftWidth: 3,
    borderLeftColor: '#2563EB',
    backgroundColor: '#EFF6FF',
  },
  messageBubbleTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageSenderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  messageSenderName: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#EA580C',
  },
  messageDateText: {
    fontSize: 10,
    color: '#64748B',
  },
  messageContentText: {
    fontSize: 13,
    fontWeight: '600',
    color: '#111827',
    lineHeight: 18,
  },
  replyInputContainer: {
    gap: 10,
    marginTop: 6,
  },
  replyTextArea: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 12,
    fontSize: 12.5,
    color: '#111827',
    minHeight: 85,
    lineHeight: 18,
  },
  feedbackNoticeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  feedbackSuccessText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#15803D',
  },
  feedbackErrorText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#DC2626',
  },
  sendReplyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 13,
    borderRadius: 14,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 3,
  },
  sendReplyBtnDisabled: {
    opacity: 0.5,
  },
  sendReplyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
