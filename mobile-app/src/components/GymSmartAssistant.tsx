import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Modal,
  ScrollView,
  TextInput,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Image,
  Linking,
  Alert,
} from 'react-native';
import { Ionicons, MaterialCommunityIcons } from '@expo/vector-icons';
import { api, resolveMediaUrl } from '../api/client';
import { useAuth } from '../context/AuthContext';
import { COLORS, SHADOWS } from '../constants/theme';
import {
  searchGymFeatures,
  getRoleSuggestedQuestions,
  type AssistantRouteItem,
} from '../utils/smartAssistantEngine';

export interface LiveItem {
  id: string;
  title: string;
  subtitle?: string;
  price?: number;
  tag?: string;
  route?: string;
  image?: string;
}

export interface AssistantAction {
  label: string;
  route: string;
  variant?: 'primary' | 'secondary' | 'outline';
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'bot';
  text: string;
  timestamp: string;
  category?: string;
  matchedItems?: AssistantRouteItem[];
  liveItems?: LiveItem[];
  actions?: AssistantAction[];
  followUps?: string[];
  isRestricted?: boolean;
}

interface GymSmartAssistantProps {
  pageTitle?: string;
  onNavigateRoute?: (route: string) => void;
  bottomOffset?: number;
}

const CATEGORY_META: Record<
  string,
  { label: string; icon: keyof typeof Ionicons.glyphMap }
> = {
  STORE: { label: 'Available in Store / Catalog', icon: 'bag-handle-outline' },
  ADMIN: { label: 'Registered Gym Owners & Facilities', icon: 'business-outline' },
  TRAINERS: { label: 'Featured Coaches & Trainers', icon: 'barbell-outline' },
  TRAINER: { label: 'Featured Coaches & Trainers', icon: 'barbell-outline' },
  MEMBERS: { label: 'Customer & Member Records', icon: 'people-outline' },
};

const DEFAULT_CATEGORY_META = {
  label: 'Direct Records & Navigation',
  icon: 'layers-outline' as keyof typeof Ionicons.glyphMap,
};

const formatTime = (): string => {
  const d = new Date();
  return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
};

/**
 * Renders markdown-lite formatting (**bold**, `code`, ### headings, and bullets)
 * consistent with the web GymSmartAssistant formatting.
 */
const renderFormattedText = (text: string, isUser: boolean) => {
  const lines = text.split('\n');
  return lines.map((line, lineIdx) => {
    const trimmed = line.trim();
    const isHeading = trimmed.startsWith('### ');
    const cleanLine = isHeading ? trimmed.replace(/^###\s+/, '') : line;
    const isBullet =
      trimmed.startsWith('•') || trimmed.startsWith('-') || /^\d+\./.test(trimmed);

    const parts = cleanLine.split(/(\*\*.*?\*\*|`[^`]+`)/g);

    return (
      <Text
        key={lineIdx}
        style={[
          styles.msgTextBase,
          isUser ? styles.userMsgText : styles.botMsgText,
          isHeading && styles.msgHeadingText,
          isBullet && styles.msgBulletLine,
          lineIdx > 0 && styles.msgLineSpacing,
        ]}
      >
        {parts.map((part, idx) => {
          if (part.startsWith('**') && part.endsWith('**')) {
            return (
              <Text
                key={idx}
                style={isUser ? styles.userBoldText : styles.botBoldText}
              >
                {part.slice(2, -2)}
              </Text>
            );
          }
          if (part.startsWith('`') && part.endsWith('`')) {
            return (
              <Text
                key={idx}
                style={isUser ? styles.userCodeText : styles.botCodeText}
              >
                {part.slice(1, -1)}
              </Text>
            );
          }
          return part;
        })}
      </Text>
    );
  });
};

export const GymSmartAssistant: React.FC<GymSmartAssistantProps> = ({
  pageTitle = 'Gym Management',
  onNavigateRoute,
  bottomOffset = 14,
}) => {
  const { user, activeRole } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [inputMessage, setInputMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [failedImgIds, setFailedImgIds] = useState<Record<string, boolean>>({});
  const scrollRef = useRef<React.ComponentRef<typeof ScrollView> | null>(null);

  const rawRole = (
    user?.rawRole ||
    (activeRole === 'CUSTOMER' ? 'MEMBER' : activeRole) ||
    'MEMBER'
  ).toUpperCase();
  const userRole = rawRole === 'CUSTOMER' ? 'MEMBER' : rawRole;
  const suggestedQuestions = getRoleSuggestedQuestions(userRole);

  useEffect(() => {
    if (isOpen && !isMinimized) {
      const timer = setTimeout(() => {
        scrollRef.current?.scrollToEnd({ animated: true });
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [messages, isOpen, isMinimized, loading]);

  const handleClearChat = () => {
    setMessages([]);
    setInputMessage('');
  };

  const handleNavigate = async (route: string) => {
    if (!route) return;
    if (
      route.startsWith('tel:') ||
      route.startsWith('mailto:') ||
      route.startsWith('http://') ||
      route.startsWith('https://')
    ) {
      try {
        const supported = await Linking.canOpenURL(route);
        if (supported) {
          await Linking.openURL(route);
        } else {
          Alert.alert('Action', `Unable to open: ${route}`);
        }
      } catch {
        Alert.alert('Action', `Unable to open: ${route}`);
      }
      return;
    }

    setIsMinimized(true);
    if (onNavigateRoute) {
      onNavigateRoute(route);
    }
  };

  const handleSendMessage = async (textToSend?: string) => {
    const rawQuery = (textToSend ?? inputMessage).trim();
    if (!rawQuery || loading) return;

    const userMsg: ChatMessage = {
      id: `user-${Date.now()}`,
      sender: 'user',
      text: rawQuery,
      timestamp: formatTime(),
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInputMessage('');
    setLoading(true);

    // 1. Perform Local Search & Intent Recognition
    const localResult = searchGymFeatures(rawQuery, userRole);

    // 2. Fetch Live Database Enrichment from the exact same backend endpoint as web
    let botReply = localResult.reply;
    let liveItems: LiveItem[] = [];
    const combinedActions = [...localResult.actions];
    let combinedFollowUps = [...localResult.followUps];
    let matchedCategory = localResult.category;

    try {
      const res = await api.post('/ai/member/chat', {
        message: rawQuery,
        pageContext: pageTitle,
      });

      if (res.data?.success) {
        if (res.data.reply) {
          botReply = res.data.reply;
        }
        if (Array.isArray(res.data.items) && res.data.items.length > 0) {
          liveItems = res.data.items;
        }
        if (Array.isArray(res.data.actions) && res.data.actions.length > 0) {
          const existingLabels = new Set(combinedActions.map((a) => a.label));
          for (const act of res.data.actions) {
            if (!existingLabels.has(act.label)) {
              combinedActions.push(act);
            }
          }
        }
        if (Array.isArray(res.data.followUps) && res.data.followUps.length > 0) {
          combinedFollowUps = res.data.followUps;
        }
        if (res.data.category) {
          matchedCategory = res.data.category;
        }
      }
    } catch {
      // Local engine handles responses cleanly when API is unreachable
    }

    const botMsg: ChatMessage = {
      id: `bot-${Date.now()}`,
      sender: 'bot',
      text: botReply,
      timestamp: formatTime(),
      category: matchedCategory,
      matchedItems: localResult.matchedItems,
      liveItems: liveItems.length > 0 ? liveItems : undefined,
      actions: combinedActions.slice(0, 4),
      followUps: combinedFollowUps.slice(0, 4),
      isRestricted: localResult.isRestricted,
    };

    setMessages((prev) => [...prev, botMsg]);
    setLoading(false);
  };

  return (
    <>
      {/* ── Floating Smart Assistant Pill Trigger Button ── */}
      {!isOpen && (
        <View
          pointerEvents="box-none"
          style={[styles.fabOuterAnchor, { bottom: bottomOffset }]}
        >
          <View style={styles.fabHalo}>
            <TouchableOpacity
              style={styles.fabButton}
              onPress={() => {
                setIsOpen(true);
                setIsMinimized(false);
              }}
              activeOpacity={0.85}
              accessibilityLabel="Open Gym Smart Assistant"
              accessibilityRole="button"
            >
              <MaterialCommunityIcons
                name="robot-outline"
                size={20}
                color={COLORS.white}
              />
              <Text style={styles.fabText}>Smart Assistant</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Minimized Compact Floating Bar ── */}
      {isOpen && isMinimized && (
        <View style={[styles.minimizedBar, { bottom: bottomOffset }]}>
          <TouchableOpacity
            style={styles.minimizedLeft}
            onPress={() => setIsMinimized(false)}
            activeOpacity={0.8}
          >
            <View style={styles.headerBotIcon}>
              <MaterialCommunityIcons
                name="robot-outline"
                size={18}
                color={COLORS.white}
              />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.headerTitle} numberOfLines={1}>
                Gym Smart Assistant
              </Text>
              <Text style={styles.headerSub} numberOfLines={1}>
                Tap to expand · {userRole}
              </Text>
            </View>
          </TouchableOpacity>
          <View style={styles.headerActions}>
            <TouchableOpacity
              onPress={() => setIsMinimized(false)}
              style={styles.headerIconBtn}
              accessibilityLabel="Expand Smart Assistant"
            >
              <Ionicons name="expand-outline" size={16} color="#64748B" />
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => setIsOpen(false)}
              style={styles.headerIconBtn}
              accessibilityLabel="Close Smart Assistant"
            >
              <Ionicons name="close" size={18} color="#64748B" />
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* ── Full Smart Assistant Chat Modal ── */}
      <Modal
        visible={isOpen && !isMinimized}
        animationType="slide"
        transparent
        onRequestClose={() => setIsOpen(false)}
      >
        <View style={styles.modalBackdrop}>
          <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.keyboardWrapper}
          >
            <View style={styles.modalSheet}>
              {/* Header Bar */}
              <View style={styles.modalHeader}>
                <View style={styles.modalHeaderLeft}>
                  <View style={styles.headerBotIcon}>
                    <MaterialCommunityIcons
                      name="robot-outline"
                      size={18}
                      color={COLORS.white}
                    />
                  </View>
                  <View style={{ flex: 1 }}>
                    <View style={styles.headerTitleRow}>
                      <Text style={styles.headerTitle} numberOfLines={1}>
                        Gym Smart Assistant
                      </Text>
                      <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                    </View>
                    <View style={styles.headerSubRow}>
                      <View style={styles.pulseDot} />
                      <Text style={styles.headerSub} numberOfLines={1}>
                        Instant Search · {userRole}
                      </Text>
                    </View>
                  </View>
                </View>

                <View style={styles.headerActions}>
                  {messages.length > 0 && (
                    <TouchableOpacity
                      onPress={handleClearChat}
                      style={styles.clearBtn}
                      accessibilityLabel="Clear chat"
                    >
                      <Ionicons name="refresh" size={14} color="#64748B" />
                      <Text style={styles.clearBtnText}>Clear</Text>
                    </TouchableOpacity>
                  )}
                  <TouchableOpacity
                    onPress={() => setIsMinimized(true)}
                    style={styles.headerIconBtn}
                    accessibilityLabel="Minimize Smart Assistant"
                  >
                    <Ionicons name="remove-outline" size={18} color="#64748B" />
                  </TouchableOpacity>
                  <TouchableOpacity
                    onPress={() => setIsOpen(false)}
                    style={styles.headerIconBtn}
                    accessibilityLabel="Close Smart Assistant"
                  >
                    <Ionicons name="close" size={19} color="#64748B" />
                  </TouchableOpacity>
                </View>
              </View>

              {/* Context Breadcrumb */}
              <View style={styles.breadcrumbBar}>
                <View style={styles.breadcrumbLeft}>
                  <Ionicons name="compass-outline" size={13} color={COLORS.primary} />
                  <Text style={styles.breadcrumbLabel} numberOfLines={1}>
                    Screen: <Text style={styles.breadcrumbScreen}>{pageTitle}</Text>
                  </Text>
                </View>
                <Text style={styles.breadcrumbUser} numberOfLines={1}>
                  {user?.firstName ? `Hi, ${user.firstName}` : 'Gym Guest'}
                </Text>
              </View>

              {/* Chat Scroll Area */}
              <ScrollView
                ref={scrollRef}
                style={styles.chatScroll}
                contentContainerStyle={styles.chatScrollContent}
                keyboardShouldPersistTaps="handled"
                showsVerticalScrollIndicator={false}
              >
                {messages.length === 0 ? (
                  <View style={styles.emptyStateWrap}>
                    {/* Welcome Card */}
                    <View style={styles.welcomeCard}>
                      <View style={styles.welcomeIconBox}>
                        <MaterialCommunityIcons
                          name="robot-outline"
                          size={24}
                          color={COLORS.primary}
                        />
                      </View>
                      <Text style={styles.welcomeTitle}>
                        Welcome to Gym Smart Assistant! 👋
                      </Text>
                      <Text style={styles.welcomeDesc}>
                        Search any feature, membership plan, personal trainer, workout
                        routine, diet plan, equipment, or gym store product.
                      </Text>
                    </View>

                    {/* Suggested Searches */}
                    <View style={styles.suggestedSection}>
                      <View style={styles.suggestedHeader}>
                        <Ionicons name="sparkles" size={12} color={COLORS.primary} />
                        <Text style={styles.suggestedHeaderText}>
                          SUGGESTED SEARCHES
                        </Text>
                      </View>
                      <View style={styles.suggestedList}>
                        {suggestedQuestions.map((q, idx) => (
                          <TouchableOpacity
                            key={idx}
                            style={styles.suggestedBtn}
                            onPress={() => handleSendMessage(q)}
                            activeOpacity={0.75}
                          >
                            <Text style={styles.suggestedBtnText} numberOfLines={1}>
                              {q}
                            </Text>
                            <Ionicons
                              name="arrow-forward"
                              size={14}
                              color={COLORS.primary}
                            />
                          </TouchableOpacity>
                        ))}
                      </View>
                    </View>
                  </View>
                ) : (
                  messages.map((msg) => {
                    const isUser = msg.sender === 'user';
                    const catMeta =
                      CATEGORY_META[msg.category || ''] || DEFAULT_CATEGORY_META;

                    return (
                      <View
                        key={msg.id}
                        style={[
                          styles.messageRow,
                          isUser ? styles.messageRowUser : styles.messageRowBot,
                        ]}
                      >
                        {!isUser && (
                          <View style={styles.botAvatarSmall}>
                            <MaterialCommunityIcons
                              name="robot-outline"
                              size={14}
                              color={COLORS.white}
                            />
                          </View>
                        )}

                        <View
                          style={[
                            styles.messageCol,
                            isUser ? styles.messageColUser : styles.messageColBot,
                          ]}
                        >
                          {/* Text Message Bubble */}
                          <View
                            style={[
                              styles.msgBubble,
                              isUser
                                ? styles.userBubble
                                : msg.isRestricted
                                ? styles.restrictedBubble
                                : styles.botBubble,
                            ]}
                          >
                            {msg.isRestricted && (
                              <View style={styles.restrictedHeader}>
                                <Ionicons
                                  name="shield-outline"
                                  size={14}
                                  color="#B91C1C"
                                />
                                <Text style={styles.restrictedTitle}>
                                  Access Restricted
                                </Text>
                              </View>
                            )}
                            {renderFormattedText(msg.text, isUser)}
                          </View>

                          {/* Live Database Records / Products / Plans Cards */}
                          {!isUser && msg.liveItems && msg.liveItems.length > 0 && (
                            <View style={styles.cardsSection}>
                              <View style={styles.sectionLabelRow}>
                                <Ionicons
                                  name={catMeta.icon}
                                  size={12}
                                  color={COLORS.primary}
                                />
                                <Text style={styles.sectionLabelText}>
                                  {catMeta.label}
                                </Text>
                              </View>

                              <View style={styles.liveGrid}>
                                {msg.liveItems.map((live) => {
                                  const resolvedImg = resolveMediaUrl(live.image);
                                  const showImage =
                                    !!resolvedImg && !failedImgIds[live.id];
                                  return (
                                    <TouchableOpacity
                                      key={live.id}
                                      style={styles.liveCard}
                                      activeOpacity={0.8}
                                      onPress={() =>
                                        handleNavigate(
                                          live.route ||
                                            (msg.category === 'ADMIN'
                                              ? '/super-admin/gym-owners'
                                              : '/member/dashboard')
                                        )
                                      }
                                    >
                                      {showImage ? (
                                        <View style={styles.liveImgWrap}>
                                          <Image
                                            source={{ uri: resolvedImg }}
                                            style={styles.liveImg}
                                            resizeMode="contain"
                                            onError={() =>
                                              setFailedImgIds((prev) => ({
                                                ...prev,
                                                [live.id]: true,
                                              }))
                                            }
                                          />
                                        </View>
                                      ) : (
                                        <View style={styles.liveIconPlaceholder}>
                                          <Ionicons
                                            name={catMeta.icon}
                                            size={18}
                                            color={COLORS.primary}
                                          />
                                        </View>
                                      )}
                                      <Text
                                        style={styles.liveCardTitle}
                                        numberOfLines={1}
                                      >
                                        {live.title}
                                      </Text>
                                      <View style={styles.liveCardFooter}>
                                        {live.price !== undefined ? (
                                          <Text style={styles.liveCardPrice}>
                                            ₹{live.price}
                                          </Text>
                                        ) : (
                                          <Text
                                            style={styles.liveCardSub}
                                            numberOfLines={1}
                                          >
                                            {live.subtitle || 'View Details'}
                                          </Text>
                                        )}
                                        {live.tag ? (
                                          <View style={styles.liveTagPill}>
                                            <Text
                                              style={styles.liveTagText}
                                              numberOfLines={1}
                                            >
                                              {live.tag}
                                            </Text>
                                          </View>
                                        ) : null}
                                      </View>
                                    </TouchableOpacity>
                                  );
                                })}
                              </View>
                            </View>
                          )}

                          {/* Matched Feature Registry Cards (when no liveItems) */}
                          {!isUser &&
                            (!msg.liveItems || msg.liveItems.length === 0) &&
                            msg.matchedItems &&
                            msg.matchedItems.length > 0 && (
                              <View style={styles.cardsSection}>
                                <Text style={styles.sectionLabelText}>
                                  MATCHING PAGES & FEATURES
                                </Text>
                                <View style={styles.featureList}>
                                  {msg.matchedItems.map((item) => (
                                    <View key={item.id} style={styles.featureCard}>
                                      <View style={styles.featureInfo}>
                                        <View style={styles.featureTitleRow}>
                                          <Text
                                            style={styles.featureTitle}
                                            numberOfLines={1}
                                          >
                                            {item.title}
                                          </Text>
                                          {item.badge ? (
                                            <View style={styles.liveTagPill}>
                                              <Text style={styles.liveTagText}>
                                                {item.badge}
                                              </Text>
                                            </View>
                                          ) : null}
                                        </View>
                                        <Text
                                          style={styles.featureDesc}
                                          numberOfLines={2}
                                        >
                                          {item.description}
                                        </Text>
                                      </View>
                                      <TouchableOpacity
                                        style={styles.featureActionBtn}
                                        activeOpacity={0.8}
                                        onPress={() => handleNavigate(item.route)}
                                      >
                                        <Text style={styles.featureActionText}>
                                          {item.actionLabel}
                                        </Text>
                                        <Ionicons
                                          name="chevron-forward"
                                          size={12}
                                          color={COLORS.white}
                                        />
                                      </TouchableOpacity>
                                    </View>
                                  ))}
                                </View>
                              </View>
                            )}

                          {/* Direct Action Buttons */}
                          {!isUser && msg.actions && msg.actions.length > 0 && (
                            <View style={styles.actionsWrap}>
                              {msg.actions.map((act, actIdx) => {
                                const isPrimary = act.variant === 'primary';
                                return (
                                  <TouchableOpacity
                                    key={actIdx}
                                    style={[
                                      styles.actionChip,
                                      isPrimary
                                        ? styles.actionChipPrimary
                                        : styles.actionChipOutline,
                                    ]}
                                    activeOpacity={0.8}
                                    onPress={() => handleNavigate(act.route)}
                                  >
                                    <Text
                                      style={[
                                        styles.actionChipText,
                                        isPrimary
                                          ? styles.actionChipTextPrimary
                                          : styles.actionChipTextOutline,
                                      ]}
                                    >
                                      {act.label}
                                    </Text>
                                    <Ionicons
                                      name="arrow-forward"
                                      size={12}
                                      color={
                                        isPrimary ? COLORS.white : COLORS.textDark
                                      }
                                    />
                                  </TouchableOpacity>
                                );
                              })}
                            </View>
                          )}

                          {/* Follow-up Suggestions Chips */}
                          {!isUser && msg.followUps && msg.followUps.length > 0 && (
                            <View style={styles.followUpsBlock}>
                              <Text style={styles.followUpsTitle}>
                                RELATED TOPICS:
                              </Text>
                              <View style={styles.followUpsWrap}>
                                {msg.followUps.map((fu, fIdx) => (
                                  <TouchableOpacity
                                    key={fIdx}
                                    style={styles.followUpChip}
                                    activeOpacity={0.75}
                                    onPress={() => handleSendMessage(fu)}
                                  >
                                    <Text style={styles.followUpText}>{fu}</Text>
                                  </TouchableOpacity>
                                ))}
                              </View>
                            </View>
                          )}

                          <Text
                            style={[
                              styles.timestampText,
                              isUser && styles.timestampRight,
                            ]}
                          >
                            {msg.timestamp}
                          </Text>
                        </View>
                      </View>
                    );
                  })
                )}

                {/* Loading Indicator */}
                {loading && (
                  <View style={[styles.messageRow, styles.messageRowBot]}>
                    <View style={styles.botAvatarSmall}>
                      <MaterialCommunityIcons
                        name="robot-outline"
                        size={14}
                        color={COLORS.white}
                      />
                    </View>
                    <View style={styles.loadingBubble}>
                      <ActivityIndicator size="small" color={COLORS.primary} />
                      <Text style={styles.loadingMsgText}>
                        Searching gym knowledge & features...
                      </Text>
                    </View>
                  </View>
                )}
              </ScrollView>

              {/* Input Footer */}
              <View style={styles.inputFooter}>
                <TextInput
                  style={styles.textInput}
                  value={inputMessage}
                  onChangeText={setInputMessage}
                  placeholder="Ask anything about your gym..."
                  placeholderTextColor="#64748B"
                  editable={!loading}
                  returnKeyType="search"
                  onSubmitEditing={() => handleSendMessage()}
                />
                <TouchableOpacity
                  style={[
                    styles.sendBtn,
                    (!inputMessage.trim() || loading) && styles.sendBtnDisabled,
                  ]}
                  disabled={!inputMessage.trim() || loading}
                  onPress={() => handleSendMessage()}
                  activeOpacity={0.8}
                  accessibilityLabel="Send search query"
                >
                  <Ionicons name="send" size={16} color={COLORS.white} />
                </TouchableOpacity>
              </View>
            </View>
          </KeyboardAvoidingView>
        </View>
      </Modal>
    </>
  );
};

const styles = StyleSheet.create({
  fabOuterAnchor: {
    position: 'absolute',
    right: 14,
    zIndex: 90,
  },
  fabHalo: {
    padding: 4,
    borderRadius: 999,
    backgroundColor: 'rgba(249, 115, 22, 0.25)',
    ...SHADOWS.md,
  },
  fabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#C2410C',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 999,
    borderWidth: 2,
    borderColor: '#FFEDD5',
  },
  fabText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '700',
    letterSpacing: -0.2,
  },
  minimizedBar: {
    position: 'absolute',
    left: 14,
    right: 14,
    zIndex: 95,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 14,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    ...SHADOWS.dark,
  },
  minimizedLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalBackdrop: {
    flex: 1,
    backgroundColor: 'rgba(15, 23, 42, 0.52)',
    justifyContent: 'flex-end',
  },
  keyboardWrapper: {
    width: '100%',
    height: '88%',
    maxHeight: 700,
    justifyContent: 'flex-end',
  },
  modalSheet: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  modalHeader: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 16,
    paddingVertical: 13,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
    paddingRight: 8,
  },
  headerBotIcon: {
    width: 34,
    height: 34,
    borderRadius: 11,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  headerTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
  },
  headerSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginTop: 2,
  },
  pulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#C2410C',
  },
  headerSub: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  clearBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  clearBtnText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  headerIconBtn: {
    padding: 6,
    borderRadius: 8,
  },
  breadcrumbBar: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 16,
    paddingVertical: 7,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  breadcrumbLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    flex: 1,
  },
  breadcrumbLabel: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '500',
    flexShrink: 1,
  },
  breadcrumbScreen: {
    color: '#111827',
    fontWeight: '700',
  },
  breadcrumbUser: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
  },
  chatScroll: {
    flex: 1,
    backgroundColor: '#FFFFFF',
  },
  chatScrollContent: {
    padding: 14,
    paddingBottom: 20,
    gap: 14,
  },
  emptyStateWrap: {
    gap: 14,
  },
  welcomeCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    gap: 8,
  },
  welcomeIconBox: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  welcomeTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: '#111827',
    textAlign: 'center',
  },
  welcomeDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    textAlign: 'center',
  },
  suggestedSection: {
    gap: 8,
  },
  suggestedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 2,
  },
  suggestedHeaderText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  suggestedList: {
    gap: 7,
  },
  suggestedBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 11,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  suggestedBtnText: {
    flex: 1,
    fontSize: 12,
    fontWeight: '600',
    color: '#111827',
  },
  messageRow: {
    flexDirection: 'row',
    gap: 8,
    alignItems: 'flex-start',
  },
  messageRowUser: {
    justifyContent: 'flex-end',
  },
  messageRowBot: {
    justifyContent: 'flex-start',
  },
  botAvatarSmall: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  messageCol: {
    maxWidth: '86%',
    gap: 8,
  },
  messageColUser: {
    alignItems: 'flex-end',
  },
  messageColBot: {
    alignItems: 'flex-start',
    flex: 1,
  },
  msgBubble: {
    padding: 12,
    borderRadius: 16,
  },
  userBubble: {
    backgroundColor: '#C2410C',
    borderTopRightRadius: 4,
  },
  botBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderTopLeftRadius: 4,
    width: '100%',
  },
  restrictedBubble: {
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    borderTopLeftRadius: 4,
    width: '100%',
  },
  restrictedHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    marginBottom: 6,
  },
  restrictedTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#B91C1C',
  },
  msgTextBase: {
    fontSize: 12.5,
    lineHeight: 18,
  },
  userMsgText: {
    color: '#FFFFFF',
    fontWeight: '500',
  },
  botMsgText: {
    color: '#111827',
  },
  msgHeadingText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 4,
  },
  msgBulletLine: {
    paddingLeft: 4,
  },
  msgLineSpacing: {
    marginTop: 3,
  },
  userBoldText: {
    fontWeight: '800',
    color: '#FFFFFF',
  },
  botBoldText: {
    fontWeight: '700',
    color: '#EA580C',
  },
  userCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    fontWeight: '700',
    color: '#FFEDD5',
  },
  botCodeText: {
    fontFamily: Platform.OS === 'ios' ? 'Menlo' : 'monospace',
    backgroundColor: '#F8FAFC',
    color: '#0F172A',
    fontSize: 11.5,
  },
  cardsSection: {
    width: '100%',
    gap: 6,
  },
  sectionLabelRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 2,
  },
  sectionLabelText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    textTransform: 'uppercase',
    letterSpacing: 0.6,
  },
  liveGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  liveCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 8,
  },
  liveImgWrap: {
    width: '100%',
    height: 64,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
    overflow: 'hidden',
    padding: 4,
  },
  liveImg: {
    width: '100%',
    height: '100%',
  },
  liveIconPlaceholder: {
    width: '100%',
    height: 40,
    borderRadius: 8,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  liveCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#111827',
  },
  liveCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 4,
    marginTop: 4,
  },
  liveCardPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: '#EA580C',
  },
  liveCardSub: {
    flex: 1,
    fontSize: 10,
    color: '#64748B',
    fontWeight: '500',
  },
  liveTagPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 999,
    paddingHorizontal: 6,
    paddingVertical: 2,
    maxWidth: 74,
  },
  liveTagText: {
    fontSize: 9,
    fontWeight: '700',
    color: '#EA580C',
  },
  featureList: {
    gap: 6,
  },
  featureCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  featureInfo: {
    flex: 1,
    gap: 2,
  },
  featureTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  featureTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#111827',
    flexShrink: 1,
  },
  featureDesc: {
    fontSize: 11,
    color: '#64748B',
    lineHeight: 15,
  },
  featureActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#C2410C',
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
  },
  featureActionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  actionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  actionChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 9,
  },
  actionChipPrimary: {
    backgroundColor: '#C2410C',
  },
  actionChipOutline: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  actionChipText: {
    fontSize: 11.5,
    fontWeight: '700',
  },
  actionChipTextPrimary: {
    color: '#FFFFFF',
  },
  actionChipTextOutline: {
    color: '#111827',
  },
  followUpsBlock: {
    width: '100%',
    gap: 5,
    paddingTop: 2,
  },
  followUpsTitle: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
    letterSpacing: 0.5,
  },
  followUpsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  followUpChip: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  followUpText: {
    fontSize: 11,
    fontWeight: '500',
    color: '#64748B',
  },
  timestampText: {
    fontSize: 10,
    color: '#64748B',
    paddingHorizontal: 2,
  },
  timestampRight: {
    textAlign: 'right',
  },
  loadingBubble: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    borderTopLeftRadius: 4,
    paddingHorizontal: 12,
    paddingVertical: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  loadingMsgText: {
    fontSize: 12,
    color: '#64748B',
  },
  inputFooter: {
    padding: 12,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  textInput: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: '#111827',
  },
  sendBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendBtnDisabled: {
    opacity: 0.4,
  },
});

export default GymSmartAssistant;

