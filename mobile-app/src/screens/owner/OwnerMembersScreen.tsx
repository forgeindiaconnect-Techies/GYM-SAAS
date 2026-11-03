import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const OwnerMembersScreen: React.FC = () => {
  const [activeSection, setActiveSection] = useState<'members' | 'enquiries'>('members');

  // Members state
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<'All' | 'Active' | 'Expiring' | 'Expired'>('All');
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPlan, setNewMemberPlan] = useState('Gold Annual');

  const [members, setMembers] = useState([
    { id: '1', name: 'Naveen Kumar', phone: '+91 98765 43210', email: 'naveen@example.com', plan: 'Gold Annual', validUntil: '14 Jan 2027', status: 'Active' },
    { id: '2', name: 'Priya Sharma', phone: '+91 98451 11223', email: 'priya@example.com', plan: 'Silver Quarterly', validUntil: '05 Nov 2026', status: 'Expiring' },
    { id: '3', name: 'Rahul Varma', phone: '+91 99001 23456', email: 'rahul@example.com', plan: 'Platinum VIP', validUntil: '10 Mar 2027', status: 'Active' },
    { id: '4', name: 'Sneha Patel', phone: '+91 98888 77766', email: 'sneha@example.com', plan: 'Monthly Pass', validUntil: '31 Oct 2026', status: 'Expired' },
    { id: '5', name: 'Vikram Singh', phone: '+91 97777 55544', email: 'vikram@example.com', plan: 'Gold Annual', validUntil: '11 Apr 2027', status: 'Active' },
  ]);

  // Customer Enquiries state (from /admin/enquiries)
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryFilter, setEnquiryFilter] = useState<'All' | 'New Lead' | 'Follow-up' | 'Converted'>('All');
  const [addEnquiryModalVisible, setAddEnquiryModalVisible] = useState(false);
  const [enquiryLeadName, setEnquiryLeadName] = useState('');
  const [enquiryLeadPhone, setEnquiryLeadPhone] = useState('');
  const [enquiryInterest, setEnquiryInterest] = useState('Strength & Weight Loss');

  const [enquiries, setEnquiries] = useState([
    { id: 'E1', name: 'Aditya Roy', phone: '+91 99112 33445', interest: 'Personal Training + Gold', source: 'Instagram Ad', date: 'Today, 11:30 AM', status: 'New Lead' },
    { id: 'E2', name: 'Meera Nair', phone: '+91 98334 55667', interest: 'Yoga & Pilates Pass', source: 'Google Maps Walk-in', date: 'Yesterday', status: 'Follow-up' },
    { id: 'E3', name: 'Kunal Deshmukh', phone: '+91 97223 44556', interest: 'Annual VIP Pass', source: 'Member Referral', date: '28 Oct', status: 'Converted' },
    { id: 'E4', name: 'Ananya Basu', phone: '+91 98110 22334', interest: 'Corporate Discount Plan', source: 'Website Enquiry', date: '26 Oct', status: 'Follow-up' },
  ]);

  const filteredMembers = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(memberSearch.toLowerCase()) || m.phone.includes(memberSearch);
    const matchFilter = memberFilter === 'All' || m.status === memberFilter;
    return matchSearch && matchFilter;
  });

  const filteredEnquiries = enquiries.filter((e) => {
    const matchSearch = e.name.toLowerCase().includes(enquirySearch.toLowerCase()) || e.phone.includes(enquirySearch);
    const matchFilter = enquiryFilter === 'All' || e.status === enquiryFilter;
    return matchSearch && matchFilter;
  });

  const handleCall = (phone: string) => {
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Dialer Unavailable', `Unable to initiate call to ${phone}.`);
    });
  };

  const handleCreateMember = () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter Member Name and Phone number.');
      return;
    }

    const created = {
      id: Date.now().toString(),
      name: newMemberName.trim(),
      phone: newMemberPhone.trim(),
      email: newMemberEmail.trim() || 'member@gymora.com',
      plan: newMemberPlan,
      validUntil: '03 Nov 2027',
      status: 'Active'
    };

    setMembers([created, ...members]);
    setNewMemberName('');
    setNewMemberPhone('');
    setNewMemberEmail('');
    setAddMemberModalVisible(false);

    Alert.alert('Member Enrolled', `${created.name} is now registered under ${created.plan}. QR pass generated.`);
  };

  const handleCreateEnquiry = () => {
    if (!enquiryLeadName.trim() || !enquiryLeadPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter Lead Name and Contact number.');
      return;
    }

    const created = {
      id: `E${Date.now()}`,
      name: enquiryLeadName.trim(),
      phone: enquiryLeadPhone.trim(),
      interest: enquiryInterest,
      source: 'Direct Lead',
      date: 'Just now',
      status: 'New Lead'
    };

    setEnquiries([created, ...enquiries]);
    setEnquiryLeadName('');
    setEnquiryLeadPhone('');
    setAddEnquiryModalVisible(false);

    Alert.alert('Enquiry Recorded', `Lead ${created.name} saved under Customer Enquiries.`);
  };

  const handleUpdateEnquiryStatus = (id: string, currentStatus: string) => {
    const nextStatus = currentStatus === 'New Lead' ? 'Follow-up' : currentStatus === 'Follow-up' ? 'Converted' : 'New Lead';
    setEnquiries(prev => prev.map(e => e.id === id ? { ...e, status: nextStatus } : e));
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Selector */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeSection === 'members' && styles.segmentBtnActive]}
          onPress={() => setActiveSection('members')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="people" 
            size={16} 
            color={activeSection === 'members' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.segmentText, activeSection === 'members' && styles.segmentTextActive]}>
            Members ({members.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeSection === 'enquiries' && styles.segmentBtnActive]}
          onPress={() => setActiveSection('enquiries')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="chatbubbles" 
            size={16} 
            color={activeSection === 'enquiries' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.segmentText, activeSection === 'enquiries' && styles.segmentTextActive]}>
            Customer Enquiries ({enquiries.length})
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeSection === 'members' ? (
          <>
            {/* Search & Add Member */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color={COLORS.textMuted} />
                <TextInput
                  placeholder="Search member name or mobile..."
                  placeholderTextColor={COLORS.textMuted}
                  value={memberSearch}
                  onChangeText={setMemberSearch}
                  style={styles.searchInput}
                />
              </View>
              <TouchableOpacity 
                style={styles.addBtn} 
                activeOpacity={0.8}
                onPress={() => setAddMemberModalVisible(true)}
              >
                <Ionicons name="person-add" size={17} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Filter Tabs */}
            <View style={styles.filtersRow}>
              {(['All', 'Active', 'Expiring', 'Expired'] as const).map((tab) => {
                const isActive = memberFilter === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setMemberFilter(tab)}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Members List */}
            <View style={styles.list}>
              {filteredMembers.map((m) => (
                <View key={m.id} style={styles.memberCard}>
                  <View style={styles.cardHeader}>
                    <View style={styles.memberLeft}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>{m.name.charAt(0)}</Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.memberName}>{m.name}</Text>
                        <Text style={styles.memberPhone}>{m.phone}</Text>
                      </View>
                    </View>
                    <View style={[
                      styles.statusBadge, 
                      m.status === 'Active' ? styles.bgActive : m.status === 'Expiring' ? styles.bgExpiring : styles.bgExpired
                    ]}>
                      <Text style={[
                        styles.statusBadgeText,
                        m.status === 'Active' ? styles.textActive : m.status === 'Expiring' ? styles.textExpiring : styles.textExpired
                      ]}>
                        {m.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.cardFooter}>
                    <View style={styles.planBadge}>
                      <Text style={styles.planText}>{m.plan}</Text>
                    </View>
                    <View style={styles.cardActions}>
                      <Text style={styles.expiryText}>Expires: {m.validUntil}</Text>
                      <TouchableOpacity 
                        style={styles.iconAction}
                        onPress={() => handleCall(m.phone)}
                      >
                        <Ionicons name="call-outline" size={15} color={COLORS.primary} />
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Enquiries Search & Add */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color={COLORS.textMuted} />
                <TextInput
                  placeholder="Search lead or mobile number..."
                  placeholderTextColor={COLORS.textMuted}
                  value={enquirySearch}
                  onChangeText={setEnquirySearch}
                  style={styles.searchInput}
                />
              </View>
              <TouchableOpacity 
                style={styles.addBtn} 
                activeOpacity={0.8}
                onPress={() => setAddEnquiryModalVisible(true)}
              >
                <Ionicons name="add" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Enquiry Filters */}
            <View style={styles.filtersRow}>
              {(['All', 'New Lead', 'Follow-up', 'Converted'] as const).map((tab) => {
                const isActive = enquiryFilter === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setEnquiryFilter(tab)}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Enquiries List */}
            <View style={styles.list}>
              {filteredEnquiries.map((e) => (
                <View key={e.id} style={styles.enquiryCard}>
                  <View style={styles.enquiryTop}>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.enquiryName}>{e.name}</Text>
                      <Text style={styles.enquiryInterest}>{e.interest}</Text>
                    </View>
                    <TouchableOpacity 
                      style={[
                        styles.enquiryBadge,
                        e.status === 'Converted' ? styles.bgActive : e.status === 'Follow-up' ? styles.bgExpiring : styles.bgNewLead
                      ]}
                      onPress={() => handleUpdateEnquiryStatus(e.id, e.status)}
                    >
                      <Text style={[
                        styles.enquiryBadgeText,
                        e.status === 'Converted' ? styles.textActive : e.status === 'Follow-up' ? styles.textExpiring : styles.textNewLead
                      ]}>
                        {e.status} ↻
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <View style={styles.enquiryDetailsRow}>
                    <Text style={styles.enquirySource}>Source: {e.source}</Text>
                    <Text style={styles.enquiryDate}>{e.date}</Text>
                  </View>

                  <View style={styles.enquiryBottomRow}>
                    <TouchableOpacity 
                      style={styles.enquiryCallBtn}
                      onPress={() => handleCall(e.phone)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call" size={13} color={COLORS.white} />
                      <Text style={styles.enquiryCallText}>Call {e.phone}</Text>
                    </TouchableOpacity>

                    <TouchableOpacity 
                      style={styles.enquiryConvertBtn}
                      onPress={() => {
                        setNewMemberName(e.name);
                        setNewMemberPhone(e.phone);
                        setActiveSection('members');
                        setAddMemberModalVisible(true);
                      }}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="checkmark-circle-outline" size={14} color={COLORS.emerald} />
                      <Text style={styles.enquiryConvertText}>Convert to Member</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        )}
      </ScrollView>

      {/* ADD MEMBER MODAL */}
      <Modal visible={addMemberModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Enroll New Member</Text>
              <TouchableOpacity onPress={() => setAddMemberModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Rahul Sharma"
              placeholderTextColor={COLORS.textMuted}
              value={newMemberName}
              onChangeText={setNewMemberName}
            />

            <Text style={styles.inputLabel}>Phone Number *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              value={newMemberPhone}
              onChangeText={setNewMemberPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Email (Optional)</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. rahul@gmail.com"
              placeholderTextColor={COLORS.textMuted}
              value={newMemberEmail}
              onChangeText={setNewMemberEmail}
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Membership Tier</Text>
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
                onPress={handleCreateMember}
              >
                <Text style={styles.modalSubmitText}>Save & Issue Pass</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ADD ENQUIRY MODAL */}
      <Modal visible={addEnquiryModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Record Customer Enquiry</Text>
              <TouchableOpacity onPress={() => setAddEnquiryModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Lead Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Siddharth Joshi"
              placeholderTextColor={COLORS.textMuted}
              value={enquiryLeadName}
              onChangeText={setEnquiryLeadName}
            />

            <Text style={styles.inputLabel}>Contact Phone *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. +91 99887 66554"
              placeholderTextColor={COLORS.textMuted}
              value={enquiryLeadPhone}
              onChangeText={setEnquiryLeadPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Interested Program</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Weight Loss / Personal Training"
              placeholderTextColor={COLORS.textMuted}
              value={enquiryInterest}
              onChangeText={setEnquiryInterest}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setAddEnquiryModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleCreateEnquiry}
              >
                <Text style={styles.modalSubmitText}>Save Lead</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    backgroundColor: COLORS.background 
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 8,
    marginHorizontal: 16,
    marginTop: 12,
    marginBottom: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 8,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: COLORS.primaryLight,
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
  },
  scrollArea: {
    flex: 1,
  },
  content: { 
    padding: 16, 
    paddingBottom: 110 
  },
  searchRow: { 
    flexDirection: 'row', 
    gap: 10, 
    marginBottom: 12 
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 12,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    gap: 8,
    height: 44,
  },
  searchInput: { 
    flex: 1, 
    fontSize: 13, 
    color: COLORS.textDark 
  },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersRow: { 
    flexDirection: 'row', 
    gap: 8, 
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: { 
    backgroundColor: COLORS.primary, 
    borderColor: COLORS.primary 
  },
  filterText: { 
    fontSize: 11, 
    fontWeight: '600', 
    color: COLORS.textMedium 
  },
  filterTextActive: { 
    color: COLORS.white, 
    fontWeight: '700' 
  },
  list: { 
    gap: 10 
  },
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardHeader: { 
    flexDirection: 'row', 
    justifyContent: 'space-between', 
    alignItems: 'flex-start' 
  },
  memberLeft: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 10, 
    flex: 1, 
    marginRight: 8 
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: COLORS.primary 
  },
  memberName: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.textDark 
  },
  memberPhone: { 
    fontSize: 11, 
    color: COLORS.textMuted, 
    marginTop: 2 
  },
  statusBadge: { 
    paddingHorizontal: 8, 
    paddingVertical: 3, 
    borderRadius: 10 
  },
  statusBadgeText: { 
    fontSize: 10, 
    fontWeight: '700' 
  },
  bgActive: { backgroundColor: COLORS.emeraldLight },
  textActive: { color: COLORS.emerald },
  bgExpiring: { backgroundColor: '#FEF3C7' },
  textExpiring: { color: '#D97706' },
  bgExpired: { backgroundColor: COLORS.roseLight },
  textExpired: { color: COLORS.rose },
  bgNewLead: { backgroundColor: '#EFF6FF' },
  textNewLead: { color: '#2563EB' },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  cardActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  planBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  planText: { 
    fontSize: 10, 
    fontWeight: '700', 
    color: COLORS.primary 
  },
  expiryText: { 
    fontSize: 10, 
    color: COLORS.textMuted 
  },
  iconAction: {
    padding: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  enquiryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  enquiryTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  enquiryName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  enquiryInterest: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  enquiryBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  enquiryBadgeText: {
    fontSize: 10,
    fontWeight: '700',
  },
  enquiryDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  enquirySource: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  enquiryDate: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  enquiryBottomRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  enquiryCallBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.primary,
    paddingVertical: 8,
    borderRadius: 10,
  },
  enquiryCallText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  enquiryConvertBtn: {
    flex: 1.2,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: COLORS.emeraldLight,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  enquiryConvertText: {
    color: COLORS.emerald,
    fontSize: 11,
    fontWeight: '700',
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
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  inputLabel: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  modalInput: {
    backgroundColor: '#F1F5F9',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    color: COLORS.textDark,
    marginBottom: 12,
    fontWeight: '600',
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
