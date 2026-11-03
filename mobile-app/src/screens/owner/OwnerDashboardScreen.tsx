import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  TextInput, 
  Platform 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';

export const OwnerDashboardScreen: React.FC<{ 
  onNavigateTab: (tab: string, sub?: string) => void;
}> = ({ onNavigateTab }) => {
  const { user } = useAuth();

  const [scanModalVisible, setScanModalVisible] = useState(false);
  const [scannedPassCode, setScannedPassCode] = useState('');
  const [scanResult, setScanResult] = useState<{
    valid: boolean;
    name: string;
    plan: string;
    message: string;
  } | null>(null);

  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberPlan, setNewMemberPlan] = useState('Gold Annual');

  const [remindedList, setRemindedList] = useState<string[]>([]);

  const [recentCheckins, setRecentCheckins] = useState([
    { id: '1', name: 'Naveen Kumar', plan: 'Gold Annual', time: '10 mins ago', status: 'Active' },
    { id: '2', name: 'Priya Sharma', plan: 'Silver Quarterly', time: '22 mins ago', status: 'Active' },
    { id: '3', name: 'Rahul Varma', plan: 'Platinum VIP', time: '45 mins ago', status: 'Active' },
    { id: '4', name: 'Sneha Patel', plan: 'Monthly Pass', time: '1 hr ago', status: 'Expiring Soon' },
  ]);

  const expiringAlerts = [
    { id: '101', name: 'Arjun Menon', days: 2, plan: 'Silver Monthly', phone: '+91 98765 43210' },
    { id: '102', name: 'Divya Iyer', days: 3, plan: 'Gold Annual', phone: '+91 98451 23456' },
  ];

  const handleRemindMember = (member: { id: string; name: string; phone: string; plan: string; days: number }) => {
    Alert.alert(
      'Send Renewal Reminder',
      `Send membership renewal notification to ${member.name} (${member.phone})?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Send Reminder',
          onPress: () => {
            setRemindedList(prev => [...prev, member.id]);
            Alert.alert('Reminder Delivered', `Renewal notice successfully dispatched to ${member.name} via WhatsApp & SMS.`);
          }
        }
      ]
    );
  };

  const handleVerifyPass = () => {
    const code = scannedPassCode.trim().toUpperCase();
    if (!code) {
      Alert.alert('Scan Required', 'Please enter a pass barcode or member ID to verify.');
      return;
    }

    if (code.includes('9921') || code.includes('NAVEEN') || code.includes('GOLD')) {
      setScanResult({
        valid: true,
        name: 'Naveen Kumar',
        plan: 'Gold Annual Pass • Active',
        message: 'Pass Verified! Door Access Granted.'
      });
      // Add to checkins list
      setRecentCheckins(prev => [
        { id: Date.now().toString(), name: 'Naveen Kumar', plan: 'Gold Annual', time: 'Just now', status: 'Active' },
        ...prev
      ]);
    } else {
      setScanResult({
        valid: false,
        name: 'Unregistered or Expired Pass',
        plan: code,
        message: 'Pass could not be verified in this branch system.'
      });
    }
  };

  const handleSaveMember = () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      Alert.alert('Validation Error', 'Please provide member full name and phone number.');
      return;
    }

    const newMember = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      plan: newMemberPlan,
      time: 'Just now',
      status: 'Active'
    };

    setRecentCheckins(prev => [newMember, ...prev]);
    setNewMemberName('');
    setNewMemberPhone('');
    setAddMemberModalVisible(false);

    Alert.alert(
      'Member Enrolled',
      `${newMember.name} has been enrolled under ${newMember.plan}. An onboarding link and QR Pass have been issued via SMS.`
    );
  };

  return (
    <ScrollView 
      style={styles.container} 
      showsVerticalScrollIndicator={false} 
      contentContainerStyle={styles.content}
    >
      {/* Welcome Banner */}
      <View style={styles.banner}>
        <View style={styles.bannerTop}>
          <View style={styles.bannerLeft}>
            <View style={styles.badgeRow}>
              <Ionicons name="shield-checkmark" size={10} color="#FFFFFF" style={{ marginRight: 4 }} />
              <Text style={styles.badgeText} numberOfLines={1}>
                {user?.gymName || 'Gymora Flagship Arena'}
              </Text>
            </View>
            <Text style={styles.bannerTitle} numberOfLines={1}>
              Hello, {user?.name || 'Gym Owner'} 👋
            </Text>
            <Text style={styles.bannerSub}>Main Floor • Geo-Fence Active</Text>
          </View>
          <View style={styles.avatarCircle}>
            <Text style={styles.avatarText}>{user?.avatarLetter || 'O'}</Text>
          </View>
        </View>

        {/* Live Occupancy Row */}
        <View style={styles.liveRow}>
          <View style={styles.liveLeft}>
            <View style={styles.pulseDot} />
            <Text style={styles.liveLabel}>Live on floor:</Text>
            <Text style={styles.liveCount}>38 Members</Text>
          </View>
          <Text style={styles.liveToday}>Today: 84</Text>
        </View>
      </View>

      {/* Quick Actions Bar */}
      <View style={styles.actionsGrid}>
        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => setAddMemberModalVisible(true)}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#FFF7ED' }]}>
            <Ionicons name="person-add" size={20} color={COLORS.primary} />
          </View>
          <Text style={styles.actionText}>Add Member</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => {
            setScannedPassCode('');
            setScanResult(null);
            setScanModalVisible(true);
          }}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#EFF6FF' }]}>
            <Ionicons name="qr-code" size={20} color={COLORS.blue} />
          </View>
          <Text style={styles.actionText}>Scan Pass</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => onNavigateTab('trainers')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#ECFDF5' }]}>
            <Ionicons name="barbell" size={20} color={COLORS.emerald} />
          </View>
          <Text style={styles.actionText}>Trainers</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={styles.actionBtn} 
          onPress={() => onNavigateTab('finances')}
          activeOpacity={0.7}
        >
          <View style={[styles.actionIconBox, { backgroundColor: '#FFFBEB' }]}>
            <Ionicons name="wallet" size={20} color={COLORS.amber} />
          </View>
          <Text style={styles.actionText}>Payouts</Text>
        </TouchableOpacity>
      </View>

      {/* KPI Cards Grid */}
      <Text style={styles.sectionTitle}>Gym Performance</Text>
      <View style={styles.kpiGrid}>
        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Monthly Revenue</Text>
            <View style={[styles.kpiIcon, { backgroundColor: '#FFF7ED' }]}>
              <Ionicons name="cash" size={16} color={COLORS.primary} />
            </View>
          </View>
          <Text style={styles.kpiValue}>₹4,82,000</Text>
          <Text style={styles.kpiTrendPositive}>↑ +18% vs last month</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Total Members</Text>
            <View style={[styles.kpiIcon, { backgroundColor: '#EFF6FF' }]}>
              <Ionicons name="people" size={16} color={COLORS.blue} />
            </View>
          </View>
          <Text style={styles.kpiValue}>1,248</Text>
          <Text style={styles.kpiTrendPositive}>↑ +12% this month</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Member Retention</Text>
            <View style={[styles.kpiIcon, { backgroundColor: '#ECFDF5' }]}>
              <Ionicons name="trending-up" size={16} color={COLORS.emerald} />
            </View>
          </View>
          <Text style={styles.kpiValue}>92%</Text>
          <Text style={styles.kpiTrendPositive}>Top 5% benchmark</Text>
        </View>

        <View style={styles.kpiCard}>
          <View style={styles.kpiTop}>
            <Text style={styles.kpiLabel}>Active Passes</Text>
            <View style={[styles.kpiIcon, { backgroundColor: '#FDF4FF' }]}>
              <Ionicons name="checkmark-done" size={16} color="#A855F7" />
            </View>
          </View>
          <Text style={styles.kpiValue}>1,140</Text>
          <Text style={styles.kpiTrendPositive}>94% attendance</Text>
        </View>
      </View>

      {/* Urgent Renewals Alert Card */}
      <View style={styles.alertCard}>
        <View style={styles.alertTop}>
          <View style={styles.alertHeader}>
            <Ionicons name="alert-circle" size={18} color="#D97706" />
            <Text style={styles.alertTitle}>Renewals Expiring Soon</Text>
          </View>
          <View style={styles.urgentBadge}>
            <Text style={styles.urgentText}>2 Urgent</Text>
          </View>
        </View>

        {expiringAlerts.map((item) => {
          const isReminded = remindedList.includes(item.id);
          return (
            <View key={item.id} style={styles.alertItem}>
              <View style={{ flex: 1, marginRight: 8 }}>
                <Text style={styles.alertItemName}>{item.name}</Text>
                <Text style={styles.alertItemSub}>{item.plan} • {item.days} days left</Text>
              </View>
              <TouchableOpacity 
                style={[styles.remindBtn, isReminded && styles.remindedBtn]}
                onPress={() => handleRemindMember(item)}
                disabled={isReminded}
                activeOpacity={0.7}
              >
                <Text style={styles.remindBtnText}>{isReminded ? 'Sent ✓' : 'Remind'}</Text>
              </TouchableOpacity>
            </View>
          );
        })}
      </View>

      {/* Recent Check-ins */}
      <View style={styles.sectionHeaderRow}>
        <Text style={styles.sectionTitle}>Live Check-ins</Text>
        <TouchableOpacity onPress={() => onNavigateTab('members')}>
          <Text style={styles.viewAllText}>View All →</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.cardList}>
        {recentCheckins.map((m) => (
          <View key={m.id} style={styles.checkinRow}>
            <View style={styles.checkinLeft}>
              <View style={styles.checkinAvatar}>
                <Text style={styles.checkinAvatarText}>{m.name.charAt(0)}</Text>
              </View>
              <View>
                <Text style={styles.checkinName}>{m.name}</Text>
                <Text style={styles.checkinPlan}>{m.plan}</Text>
              </View>
            </View>
            <View style={styles.checkinRight}>
              <View style={styles.statusPill}>
                <Text style={styles.statusText}>{m.status}</Text>
              </View>
              <Text style={styles.checkinTime}>{m.time}</Text>
            </View>
          </View>
        ))}
      </View>

      {/* QR PASS SCANNER MODAL */}
      <Modal visible={scanModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="qr-code-outline" size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Scan Member Pass</Text>
              </View>
              <TouchableOpacity onPress={() => setScanModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <View style={styles.scannerBox}>
              <Ionicons name="scan-outline" size={64} color={COLORS.primary} />
              <Text style={styles.scanInstruction}>
                Point camera at member pass barcode or enter member code below
              </Text>
            </View>

            <TextInput
              style={styles.modalInput}
              placeholder="Enter Pass ID (e.g. GYM-9921)"
              placeholderTextColor={COLORS.textMuted}
              value={scannedPassCode}
              onChangeText={setScannedPassCode}
              autoCapitalize="characters"
            />

            <View style={styles.quickCodeRow}>
              <TouchableOpacity 
                style={styles.quickCodePill}
                onPress={() => setScannedPassCode('GYM-9921')}
              >
                <Text style={styles.quickCodeText}>Autofill: GYM-9921</Text>
              </TouchableOpacity>
            </View>

            {scanResult && (
              <View style={[styles.resultCard, scanResult.valid ? styles.resultValid : styles.resultInvalid]}>
                <Ionicons 
                  name={scanResult.valid ? "checkmark-circle" : "close-circle"} 
                  size={24} 
                  color={scanResult.valid ? COLORS.emerald : COLORS.rose} 
                />
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={[styles.resultName, { color: scanResult.valid ? COLORS.emerald : COLORS.rose }]}>
                    {scanResult.name}
                  </Text>
                  <Text style={styles.resultMsg}>{scanResult.message}</Text>
                </View>
              </View>
            )}

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setScanModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleVerifyPass}
              >
                <Text style={styles.modalSubmitText}>Verify & Check-In</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* QUICK ADD MEMBER MODAL */}
      <Modal visible={addMemberModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleRow}>
                <Ionicons name="person-add-outline" size={20} color={COLORS.primary} />
                <Text style={styles.modalTitle}>Quick Add Member</Text>
              </View>
              <TouchableOpacity onPress={() => setAddMemberModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Ramesh Chandra"
              placeholderTextColor={COLORS.textMuted}
              value={newMemberName}
              onChangeText={setNewMemberName}
            />

            <Text style={styles.inputLabel}>Mobile Number</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              value={newMemberPhone}
              onChangeText={setNewMemberPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Select Membership Plan</Text>
            <View style={styles.planSelectorRow}>
              {['Gold Annual', 'Silver Quarterly', 'Monthly Pass'].map((plan) => (
                <TouchableOpacity
                  key={plan}
                  style={[styles.planChip, newMemberPlan === plan && styles.planChipActive]}
                  onPress={() => setNewMemberPlan(plan)}
                >
                  <Text style={[styles.planChipText, newMemberPlan === plan && styles.planChipTextActive]}>
                    {plan}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setAddMemberModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleSaveMember}
              >
                <Text style={styles.modalSubmitText}>Enroll & Issue Pass</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  content: {
    padding: 16,
    paddingBottom: 110,
  },
  banner: {
    backgroundColor: COLORS.primary,
    borderRadius: 20,
    padding: 18,
    marginBottom: 16,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 6,
  },
  bannerTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bannerLeft: {
    flex: 1,
    marginRight: 12,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255,255,255,0.2)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    alignSelf: 'flex-start',
    marginBottom: 6,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '700',
    textTransform: 'uppercase',
  },
  bannerTitle: {
    color: COLORS.white,
    fontSize: 19,
    fontWeight: '800',
    letterSpacing: -0.3,
  },
  bannerSub: {
    color: '#FED7AA',
    fontSize: 11,
    marginTop: 2,
  },
  avatarCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255,255,255,0.25)',
    borderWidth: 1.5,
    borderColor: 'rgba(255,255,255,0.4)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: {
    color: COLORS.white,
    fontSize: 18,
    fontWeight: '800',
  },
  liveRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 14,
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: 'rgba(255,255,255,0.2)',
  },
  liveLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  pulseDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#22C55E',
  },
  liveLabel: {
    color: 'rgba(255,255,255,0.9)',
    fontSize: 12,
    fontWeight: '500',
  },
  liveCount: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  liveToday: {
    color: 'rgba(255,255,255,0.85)',
    fontSize: 11,
    fontWeight: '600',
  },
  actionsGrid: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
    backgroundColor: COLORS.white,
    paddingVertical: 14,
    paddingHorizontal: 10,
    borderRadius: 18,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  actionBtn: {
    alignItems: 'center',
    flex: 1,
  },
  actionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 6,
  },
  actionText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 12,
    letterSpacing: -0.3,
  },
  kpiGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 20,
  },
  kpiCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    width: '48.5%',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  kpiTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  kpiLabel: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  kpiIcon: {
    width: 28,
    height: 28,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  kpiValue: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  kpiTrendPositive: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.emerald,
    marginTop: 4,
  },
  alertCard: {
    backgroundColor: '#FFFBEB',
    borderRadius: 18,
    padding: 14,
    borderWidth: 1,
    borderColor: '#FDE68A',
    marginBottom: 20,
  },
  alertTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  alertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  alertTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#92400E',
  },
  urgentBadge: {
    backgroundColor: '#F59E0B',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  urgentText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: '800',
  },
  alertItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#FEF3C7',
  },
  alertItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  alertItemSub: {
    fontSize: 10,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  remindBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 8,
  },
  remindedBtn: {
    backgroundColor: COLORS.emerald,
  },
  remindBtnText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  viewAllText: {
    color: COLORS.primary,
    fontSize: 12,
    fontWeight: '700',
  },
  cardList: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  checkinRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  checkinLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  checkinAvatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkinAvatarText: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.primary,
  },
  checkinName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  checkinPlan: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  checkinRight: {
    alignItems: 'flex-end',
  },
  statusPill: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
  },
  statusText: {
    color: COLORS.emerald,
    fontSize: 9,
    fontWeight: '700',
  },
  checkinTime: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 3,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    padding: 20,
  },
  modalCard: {
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 8,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  modalHeaderTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  scannerBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1.5,
    borderStyle: 'dashed',
    borderColor: COLORS.primary,
    padding: 24,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  scanInstruction: {
    fontSize: 11,
    color: COLORS.textMedium,
    textAlign: 'center',
    marginTop: 10,
    lineHeight: 16,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 10,
    fontWeight: '600',
  },
  quickCodeRow: {
    flexDirection: 'row',
    marginBottom: 14,
  },
  quickCodePill: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  quickCodeText: {
    color: COLORS.primary,
    fontSize: 10,
    fontWeight: '700',
  },
  resultCard: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 12,
    marginBottom: 14,
  },
  resultValid: {
    backgroundColor: COLORS.emeraldLight,
  },
  resultInvalid: {
    backgroundColor: COLORS.roseLight,
  },
  resultName: {
    fontSize: 13,
    fontWeight: '800',
  },
  resultMsg: {
    fontSize: 11,
    color: COLORS.textMedium,
    marginTop: 2,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  planSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 18,
  },
  planChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  planChipActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primary,
  },
  planChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  planChipTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 10,
    marginTop: 6,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
  },
  modalCancelText: {
    color: COLORS.textMedium,
    fontSize: 13,
    fontWeight: '700',
  },
  modalSubmitBtn: {
    flex: 2,
    paddingVertical: 12,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
  },
  modalSubmitText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
});
