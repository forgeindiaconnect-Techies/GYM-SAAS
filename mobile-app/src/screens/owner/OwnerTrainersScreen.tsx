import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  Alert, 
  TextInput, 
  Modal, 
  Linking 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const OwnerTrainersScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'trainers' | 'hiring'>('trainers');
  const [hiringSubTab, setHiringSubTab] = useState<'jobs' | 'applications' | 'post' | 'hired'>('jobs');

  // Trainers state
  const [onboardModalVisible, setOnboardModalVisible] = useState(false);
  const [newTrainerName, setNewTrainerName] = useState('');
  const [newTrainerPhone, setNewTrainerPhone] = useState('');
  const [newTrainerSpecialty, setNewTrainerSpecialty] = useState('Strength & Conditioning');
  const [newTrainerCommission, setNewTrainerCommission] = useState('30%');

  const [trainers, setTrainers] = useState([
    { id: '1', name: 'Vikram Malhotra', specialty: 'Strength & Conditioning', rating: '★ 4.9', clients: 18, commission: '30%', phone: '+91 98111 22334', branch: 'Main Arena' },
    { id: '2', name: 'Ananya Deshmukh', specialty: 'Yoga & Pilates', rating: '★ 4.8', clients: 14, commission: '30%', phone: '+91 98222 33445', branch: 'Indiranagar' },
    { id: '3', name: 'Karan Mehra', specialty: 'HIIT & Functional', rating: '★ 4.7', clients: 22, commission: '35%', phone: '+91 98333 44556', branch: 'Main Arena' },
    { id: '4', name: 'Rohit Verma', specialty: 'Bodybuilding & Diet', rating: '★ 4.9', clients: 16, commission: '30%', phone: '+91 98444 55667', branch: 'Koramangala' },
  ]);

  // Hiring state
  const [jobs, setJobs] = useState([
    { id: 'J1', title: 'Senior Functional Coach', type: 'Full Time', exp: '3+ Years', salary: '₹35,000 - ₹50,000/mo', applicants: 8, status: 'Active' },
    { id: 'J2', title: 'Zumba & Aerobics Instructor', type: 'Part Time', exp: '1+ Years', salary: '₹1,200/session', applicants: 5, status: 'Active' },
    { id: 'J3', title: 'Certified Nutritionist / PT', type: 'Full Time', exp: '2+ Years', salary: '₹40,000/mo + Comm.', applicants: 12, status: 'Under Review' },
  ]);

  const [applications, setApplications] = useState([
    { id: 'A1', name: 'Harish Sundaram', role: 'Senior Functional Coach', exp: '4.5 Years', cert: 'CSCS & ACE Certified', rating: '4.9', status: 'Pending Review' },
    { id: 'A2', name: 'Pooja Hegde', role: 'Zumba & Aerobics', exp: '3 Years', cert: 'ZIN Licensed Instructor', rating: '4.8', status: 'Shortlisted' },
    { id: 'A3', name: 'Devendra Joshi', role: 'Certified Nutritionist', exp: '2 Years', cert: 'ISSA Sports Nutrition', rating: '4.7', status: 'Interview Scheduled' },
  ]);

  const [hiredTrainers, setHiredTrainers] = useState([
    { id: 'H1', name: 'Vikram Malhotra', role: 'Master Coach', hiredDate: '15 Jan 2025', contract: '1 Year Renewable', branch: 'Main Arena' },
    { id: 'H2', name: 'Rohit Verma', role: 'Strength Coach', hiredDate: '01 Mar 2025', contract: '1 Year Renewable', branch: 'Koramangala' },
  ]);

  // Post Job form state
  const [jobTitle, setJobTitle] = useState('');
  const [jobType, setJobType] = useState('Full Time');
  const [jobExp, setJobExp] = useState('2+ Years');
  const [jobSalary, setJobSalary] = useState('');
  const [jobDesc, setJobDesc] = useState('');

  const handleCallTrainer = (phone: string) => {
    const clean = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${clean}`).catch(() => {
      Alert.alert('Phone Call', `Unable to initiate call to ${phone}.`);
    });
  };

  const handleSaveTrainer = () => {
    if (!newTrainerName.trim() || !newTrainerPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter trainer name and phone number.');
      return;
    }

    const created = {
      id: Date.now().toString(),
      name: newTrainerName.trim(),
      phone: newTrainerPhone.trim(),
      specialty: newTrainerSpecialty,
      rating: '★ 5.0 (New)',
      clients: 0,
      commission: newTrainerCommission,
      branch: 'Main Arena'
    };

    setTrainers([created, ...trainers]);
    setNewTrainerName('');
    setNewTrainerPhone('');
    setOnboardModalVisible(false);

    Alert.alert('Trainer Onboarded', `${created.name} has been enrolled into your gym coaching staff.`);
  };

  const handlePublishJob = () => {
    if (!jobTitle.trim() || !jobSalary.trim()) {
      Alert.alert('Required Fields', 'Please enter Job Title and Compensation details.');
      return;
    }

    const newJob = {
      id: `J${Date.now()}`,
      title: jobTitle.trim(),
      type: jobType,
      exp: jobExp,
      salary: jobSalary.trim(),
      applicants: 0,
      status: 'Active'
    };

    setJobs([newJob, ...jobs]);
    setJobTitle('');
    setJobSalary('');
    setJobDesc('');
    setHiringSubTab('jobs');

    Alert.alert('Job Published', `Listing "${newJob.title}" is now live on Gymora Trainer Job Portal.`);
  };

  const handleShortlistApp = (id: string, name: string) => {
    setApplications(prev => prev.map(a => a.id === id ? { ...a, status: 'Shortlisted' } : a));
    Alert.alert('Applicant Shortlisted', `${name} has been moved to shortlisted candidates for interview.`);
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Selector */}
      <View style={styles.segmentedContainer}>
        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'trainers' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('trainers')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="barbell" 
            size={16} 
            color={activeTab === 'trainers' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.segmentText, activeTab === 'trainers' && styles.segmentTextActive]}>
            Trainers ({trainers.length})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.segmentBtn, activeTab === 'hiring' && styles.segmentBtnActive]}
          onPress={() => setActiveTab('hiring')}
          activeOpacity={0.7}
        >
          <Ionicons 
            name="briefcase" 
            size={16} 
            color={activeTab === 'hiring' ? COLORS.primary : COLORS.textMuted} 
          />
          <Text style={[styles.segmentText, activeTab === 'hiring' && styles.segmentTextActive]}>
            Trainer Hiring ({jobs.length} Open)
          </Text>
        </TouchableOpacity>
      </View>

      <ScrollView 
        style={styles.scrollArea} 
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {activeTab === 'trainers' ? (
          <>
            {/* Header Summary */}
            <View style={styles.headerBox}>
              <View>
                <Text style={styles.headerTitle}>{trainers.length} Certified Trainers</Text>
                <Text style={styles.headerSub}>Average Rating: 4.85 / 5.0 • All Active</Text>
              </View>
              <TouchableOpacity 
                style={styles.addBtn}
                onPress={() => setOnboardModalVisible(true)}
                activeOpacity={0.7}
              >
                <Text style={styles.addBtnText}>+ Onboard</Text>
              </TouchableOpacity>
            </View>

            {/* Trainers List */}
            <View style={styles.list}>
              {trainers.map((t) => (
                <View key={t.id} style={styles.card}>
                  <View style={styles.cardTop}>
                    <View style={styles.avatar}>
                      <Text style={styles.avatarText}>{t.name.charAt(0)}</Text>
                    </View>
                    <View style={styles.cardInfo}>
                      <Text style={styles.trainerName}>{t.name}</Text>
                      <Text style={styles.specialty}>{t.specialty}</Text>
                      <View style={styles.tagsRow}>
                        <Text style={styles.rating}>{t.rating}</Text>
                        <Text style={styles.dot}>•</Text>
                        <Text style={styles.clientsText}>{t.clients} active clients</Text>
                      </View>
                    </View>
                  </View>

                  <View style={styles.cardBottom}>
                    <View>
                      <Text style={styles.commissionText}>
                        Commission: <Text style={styles.commissionVal}>{t.commission}</Text>
                      </Text>
                      <Text style={styles.branchSubText}>Branch: {t.branch}</Text>
                    </View>

                    <TouchableOpacity 
                      style={styles.callBtn}
                      onPress={() => handleCallTrainer(t.phone)}
                      activeOpacity={0.7}
                    >
                      <Ionicons name="call" size={13} color={COLORS.primary} />
                      <Text style={styles.callText}>Call</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              ))}
            </View>
          </>
        ) : (
          <>
            {/* Hiring Sub-Tabs */}
            <View style={styles.hiringSubTabsRow}>
              {[
                { key: 'jobs', label: 'Manage Jobs' },
                { key: 'applications', label: 'Applications' },
                { key: 'post', label: '+ Post Job' },
                { key: 'hired', label: 'Hired' },
              ].map((sub) => {
                const isActive = hiringSubTab === sub.key;
                return (
                  <TouchableOpacity
                    key={sub.key}
                    style={[styles.hiringChip, isActive && styles.hiringChipActive]}
                    onPress={() => setHiringSubTab(sub.key as any)}
                  >
                    <Text style={[styles.hiringChipText, isActive && styles.hiringChipTextActive]}>
                      {sub.label}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Sub-View: Manage Jobs */}
            {hiringSubTab === 'jobs' && (
              <View style={styles.list}>
                {jobs.map((j) => (
                  <View key={j.id} style={styles.jobCard}>
                    <View style={styles.jobTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.jobTitle}>{j.title}</Text>
                        <Text style={styles.jobSub}>{j.type} • Exp: {j.exp}</Text>
                      </View>
                      <View style={styles.jobBadge}>
                        <Text style={styles.jobBadgeText}>{j.status}</Text>
                      </View>
                    </View>

                    <View style={styles.jobMidRow}>
                      <Text style={styles.jobSalary}>{j.salary}</Text>
                      <Text style={styles.jobApplicants}>{j.applicants} Applicants</Text>
                    </View>

                    <View style={styles.jobActionsRow}>
                      <TouchableOpacity 
                        style={styles.viewAppsBtn}
                        onPress={() => setHiringSubTab('applications')}
                      >
                        <Ionicons name="people-outline" size={14} color={COLORS.primary} />
                        <Text style={styles.viewAppsText}>View Applications</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Sub-View: Job Applications */}
            {hiringSubTab === 'applications' && (
              <View style={styles.list}>
                {applications.map((a) => (
                  <View key={a.id} style={styles.appCard}>
                    <View style={styles.appTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.appName}>{a.name}</Text>
                        <Text style={styles.appRole}>Applied for: {a.role}</Text>
                      </View>
                      <View style={styles.appStatusBadge}>
                        <Text style={styles.appStatusText}>{a.status}</Text>
                      </View>
                    </View>

                    <View style={styles.appDetailsRow}>
                      <Text style={styles.appCert}>{a.cert}</Text>
                      <Text style={styles.appExp}>{a.exp} exp</Text>
                    </View>

                    <View style={styles.appActionsRow}>
                      <TouchableOpacity 
                        style={styles.shortlistBtn}
                        onPress={() => handleShortlistApp(a.id, a.name)}
                      >
                        <Ionicons name="checkmark" size={14} color={COLORS.white} />
                        <Text style={styles.shortlistText}>Shortlist</Text>
                      </TouchableOpacity>

                      <TouchableOpacity 
                        style={styles.scheduleIntBtn}
                        onPress={() => Alert.alert('Interview Invite', `Interview invite sent to ${a.name} via email.`)}
                      >
                        <Ionicons name="calendar-outline" size={14} color={COLORS.textDark} />
                        <Text style={styles.scheduleIntText}>Schedule Call</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}
              </View>
            )}

            {/* Sub-View: Post a Job */}
            {hiringSubTab === 'post' && (
              <View style={styles.postCard}>
                <Text style={styles.postCardTitle}>Post a Trainer Job Opening</Text>
                <Text style={styles.postCardSub}>Reach certified fitness coaches across your region</Text>

                <Text style={styles.inputLabel}>Job Title *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. Strength & Conditioning Coach"
                  placeholderTextColor={COLORS.textMuted}
                  value={jobTitle}
                  onChangeText={setJobTitle}
                />

                <Text style={styles.inputLabel}>Employment Type</Text>
                <View style={styles.planSelectorRow}>
                  {['Full Time', 'Part Time', 'Freelance / Slot'].map((t) => (
                    <TouchableOpacity
                      key={t}
                      style={[styles.planChip, jobType === t && styles.planChipActive]}
                      onPress={() => setJobType(t)}
                    >
                      <Text style={[styles.planChipText, jobType === t && styles.planChipTextActive]}>
                        {t}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Required Experience</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. 2+ Years"
                  placeholderTextColor={COLORS.textMuted}
                  value={jobExp}
                  onChangeText={setJobExp}
                />

                <Text style={styles.inputLabel}>Compensation / Salary *</Text>
                <TextInput
                  style={styles.modalInput}
                  placeholder="e.g. ₹35,000 - ₹50,000/month + commission"
                  placeholderTextColor={COLORS.textMuted}
                  value={jobSalary}
                  onChangeText={setJobSalary}
                />

                <Text style={styles.inputLabel}>Job Description & Requirements</Text>
                <TextInput
                  style={[styles.modalInput, { height: 75, textAlignVertical: 'top' }]}
                  placeholder="Describe certifications required, training slots, and responsibilities..."
                  placeholderTextColor={COLORS.textMuted}
                  value={jobDesc}
                  onChangeText={setJobDesc}
                  multiline
                />

                <TouchableOpacity 
                  style={styles.publishBtn}
                  onPress={handlePublishJob}
                  activeOpacity={0.7}
                >
                  <Ionicons name="megaphone-outline" size={16} color={COLORS.white} />
                  <Text style={styles.publishText}>Publish Job Opening</Text>
                </TouchableOpacity>
              </View>
            )}

            {/* Sub-View: Hired Trainers */}
            {hiringSubTab === 'hired' && (
              <View style={styles.list}>
                {hiredTrainers.map((h) => (
                  <View key={h.id} style={styles.hiredCard}>
                    <View style={styles.hiredTop}>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.hiredName}>{h.name}</Text>
                        <Text style={styles.hiredRole}>{h.role} • {h.branch}</Text>
                      </View>
                      <View style={styles.hiredBadge}>
                        <Text style={styles.hiredBadgeText}>Active Contract</Text>
                      </View>
                    </View>
                    <View style={styles.hiredBottom}>
                      <Text style={styles.hiredDate}>Onboarded: {h.hiredDate}</Text>
                      <Text style={styles.hiredContract}>{h.contract}</Text>
                    </View>
                  </View>
                ))}
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ONBOARD TRAINER MODAL */}
      <Modal visible={onboardModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Onboard New Trainer</Text>
              <TouchableOpacity onPress={() => setOnboardModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <Text style={styles.inputLabel}>Full Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Suresh Raina"
              placeholderTextColor={COLORS.textMuted}
              value={newTrainerName}
              onChangeText={setNewTrainerName}
            />

            <Text style={styles.inputLabel}>Mobile Number *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. +91 98765 43210"
              placeholderTextColor={COLORS.textMuted}
              value={newTrainerPhone}
              onChangeText={setNewTrainerPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Specialization</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Strength & Conditioning"
              placeholderTextColor={COLORS.textMuted}
              value={newTrainerSpecialty}
              onChangeText={setNewTrainerSpecialty}
            />

            <Text style={styles.inputLabel}>Commission Rate</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 30%"
              placeholderTextColor={COLORS.textMuted}
              value={newTrainerCommission}
              onChangeText={setNewTrainerCommission}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setOnboardModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={styles.modalSubmitBtn} 
                onPress={handleSaveTrainer}
              >
                <Text style={styles.modalSubmitText}>Complete Onboarding</Text>
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
  headerBox: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.darkBg,
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
  },
  headerTitle: { 
    fontSize: 16, 
    fontWeight: '800', 
    color: COLORS.white 
  },
  headerSub: { 
    fontSize: 11, 
    color: COLORS.textMuted, 
    marginTop: 2 
  },
  addBtn: {
    backgroundColor: COLORS.primary,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  addBtnText: { 
    color: COLORS.white, 
    fontSize: 11, 
    fontWeight: '700' 
  },
  list: { 
    gap: 10 
  },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardTop: { 
    flexDirection: 'row', 
    gap: 12 
  },
  avatar: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  avatarText: { 
    fontSize: 18, 
    fontWeight: '800', 
    color: COLORS.primary 
  },
  cardInfo: { 
    flex: 1 
  },
  trainerName: { 
    fontSize: 14, 
    fontWeight: '700', 
    color: COLORS.textDark 
  },
  specialty: { 
    fontSize: 11, 
    color: COLORS.textMedium, 
    marginTop: 2 
  },
  tagsRow: { 
    flexDirection: 'row', 
    alignItems: 'center', 
    gap: 6, 
    marginTop: 4 
  },
  rating: { 
    fontSize: 11, 
    fontWeight: '700', 
    color: '#D97706' 
  },
  dot: { 
    color: COLORS.textMuted, 
    fontSize: 10 
  },
  clientsText: { 
    fontSize: 11, 
    color: COLORS.textMuted 
  },
  cardBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  commissionText: { 
    fontSize: 11, 
    color: COLORS.textMuted 
  },
  commissionVal: { 
    fontWeight: '700', 
    color: COLORS.textDark 
  },
  branchSubText: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  callBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  callText: { 
    color: COLORS.primary, 
    fontSize: 11, 
    fontWeight: '700' 
  },
  hiringSubTabsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 14,
    flexWrap: 'wrap',
  },
  hiringChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  hiringChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  hiringChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  hiringChipTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  jobCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  jobTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  jobTitle: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  jobSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  jobBadge: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  jobBadgeText: {
    color: COLORS.emerald,
    fontSize: 10,
    fontWeight: '700',
  },
  jobMidRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingVertical: 8,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  jobSalary: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  jobApplicants: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  jobActionsRow: {
    marginTop: 10,
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  viewAppsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: COLORS.primaryLight,
  },
  viewAppsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  appCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  appTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  appName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  appRole: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  appStatusBadge: {
    backgroundColor: '#EFF6FF',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  appStatusText: {
    color: '#2563EB',
    fontSize: 10,
    fontWeight: '700',
  },
  appDetailsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  appCert: {
    fontSize: 11,
    color: COLORS.textMedium,
  },
  appExp: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  appActionsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  shortlistBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: COLORS.emerald,
    paddingVertical: 8,
    borderRadius: 10,
  },
  shortlistText: {
    color: COLORS.white,
    fontSize: 11,
    fontWeight: '700',
  },
  scheduleIntBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 4,
    backgroundColor: '#F1F5F9',
    paddingVertical: 8,
    borderRadius: 10,
  },
  scheduleIntText: {
    color: COLORS.textDark,
    fontSize: 11,
    fontWeight: '700',
  },
  postCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  postCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  postCardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    marginBottom: 14,
  },
  publishBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 12,
    marginTop: 8,
  },
  publishText: {
    color: COLORS.white,
    fontSize: 13,
    fontWeight: '800',
  },
  hiredCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  hiredTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  hiredName: {
    fontSize: 14,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  hiredRole: {
    fontSize: 11,
    color: COLORS.primary,
    fontWeight: '600',
    marginTop: 2,
  },
  hiredBadge: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  hiredBadgeText: {
    color: COLORS.emerald,
    fontSize: 10,
    fontWeight: '700',
  },
  hiredBottom: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  hiredDate: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  hiredContract: {
    fontSize: 10,
    color: COLORS.textMedium,
    fontWeight: '600',
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
    marginBottom: 14,
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
