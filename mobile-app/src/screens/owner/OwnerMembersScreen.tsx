import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TextInput, 
  TouchableOpacity, 
  Alert, 
  Modal, 
  Linking,
  ActivityIndicator,
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export const OwnerMembersScreen: React.FC<{ initialSection?: 'members' | 'enquiries' }> = ({ initialSection = 'members' }) => {
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<'members' | 'enquiries'>(initialSection);

  useEffect(() => {
    if (initialSection) {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Members state
  const [members, setMembers] = useState<any[]>([]);
  const [memberSearch, setMemberSearch] = useState('');
  const [memberFilter, setMemberFilter] = useState<string>('All');
  const [expandedPlanMemberId, setExpandedPlanMemberId] = useState<string | null>(null);

  // Selected Member for View / Edit / Status
  const [selectedMember, setSelectedMember] = useState<any | null>(null);
  const [viewMemberModalVisible, setViewMemberModalVisible] = useState(false);
  const [editMemberModalVisible, setEditMemberModalVisible] = useState(false);
  const [statusModalVisible, setStatusModalVisible] = useState(false);
  const [memberToChangeStatus, setMemberToChangeStatus] = useState<any | null>(null);
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false);

  // Full Edit form state
  const [editName, setEditName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editEmail, setEditEmail] = useState('');
  const [editPlan, setEditPlan] = useState('');
  const [editGender, setEditGender] = useState('Male');
  const [editDob, setEditDob] = useState('');
  const [editFitnessGoal, setEditFitnessGoal] = useState('General Fitness');
  const [editStatus, setEditStatus] = useState('Active');
  const [editHeight, setEditHeight] = useState('');
  const [editWeight, setEditWeight] = useState('');
  const [editCity, setEditCity] = useState('');
  const [editPinCode, setEditPinCode] = useState('');
  const [editTrainer, setEditTrainer] = useState('');
  const [editEmergencyName, setEditEmergencyName] = useState('');
  const [editEmergencyPhone, setEditEmergencyPhone] = useState('');
  const [editEmergencyRelation, setEditEmergencyRelation] = useState('');
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  // Add Member Modal state
  const [addMemberModalVisible, setAddMemberModalVisible] = useState(false);
  const [newMemberName, setNewMemberName] = useState('');
  const [newMemberPhone, setNewMemberPhone] = useState('');
  const [newMemberEmail, setNewMemberEmail] = useState('');
  const [newMemberPlan, setNewMemberPlan] = useState('Starter');
  const [isSubmittingMember, setIsSubmittingMember] = useState(false);

  // Customer Enquiries state (matching Web /admin/enquiries)
  const [enquiries, setEnquiries] = useState<any[]>([]);
  const [enquirySearch, setEnquirySearch] = useState('');
  const [enquiryFilter, setEnquiryFilter] = useState<string>('All');
  const [selectedEnquiry, setSelectedEnquiry] = useState<any | null>(null);
  const [enquiryDetailModalVisible, setEnquiryDetailModalVisible] = useState(false);
  const [enquiryNotes, setEnquiryNotes] = useState('');
  const [isUpdatingEnquiry, setIsUpdatingEnquiry] = useState(false);

  // Add Enquiry Modal
  const [addEnquiryModalVisible, setAddEnquiryModalVisible] = useState(false);
  const [newEnquiryName, setNewEnquiryName] = useState('');
  const [newEnquiryPhone, setNewEnquiryPhone] = useState('');
  const [newEnquiryEmail, setNewEnquiryEmail] = useState('');
  const [newEnquiryType, setNewEnquiryType] = useState('Website Contact Message');
  const [newEnquiryMsg, setNewEnquiryMsg] = useState('');
  const [isSubmittingEnquiry, setIsSubmittingEnquiry] = useState(false);

  // Helper date formatter
  const formatDateTime = (dateStr?: string | Date) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      const datePart = d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
      const timePart = d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });
      return `${datePart}, ${timePart}`;
    } catch {
      return 'N/A';
    }
  };

  const formatDateOnly = (dateStr?: string | Date) => {
    if (!dateStr) return 'N/A';
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return 'N/A';
      return d.toLocaleDateString('en-US', { month: 'short', day: '2-digit', year: 'numeric' });
    } catch {
      return 'N/A';
    }
  };

  const fetchMembersAndEnquiries = useCallback(async () => {
    try {
      const branchParam = user?.branchId ? `?branchId=${user.branchId}` : '';
      const userBranchParam = user?.branchId ? `&branchId=${user.branchId}` : '';

      const [usersRes, membershipsRes, enquiriesRes] = await Promise.allSettled([
        api.get(`/users?role=MEMBER${userBranchParam}`),
        api.get(`/memberships/gym${branchParam}`),
        api.get('/enquiries')
      ]);

      // 1. Process members identical to web GymAdminMembers.tsx
      const rawUsers = usersRes.status === 'fulfilled' ? (usersRes.value.data?.users || []) : [];
      const rawMemberships = membershipsRes.status === 'fulfilled' ? (membershipsRes.value.data?.memberships || []) : [];

      const membershipMap: Record<string, any> = {};
      const allMembershipsMap: Record<string, any[]> = {};

      for (const m of rawMemberships) {
        const uid = (m.userId?._id ?? m.userId)?.toString?.() ?? String(m.userId);
        if (uid) {
          if (!membershipMap[uid]) membershipMap[uid] = m;
          if (!allMembershipsMap[uid]) allMembershipsMap[uid] = [];
          allMembershipsMap[uid].push(m);
        }
      }

      const formattedMembers = rawUsers.map((u: any) => {
        const userId = u._id?.toString?.() ?? String(u._id);
        const membership = membershipMap[userId] || null;
        let membershipHistory = allMembershipsMap[userId] || [];

        membershipHistory.sort((a, b) => new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime());

        if (membershipHistory.length === 0) {
          membershipHistory = [{
            _id: 'default-' + userId,
            planName: u.subscriptionPlan || 'Starter',
            status: u.subscriptionStatus || 'Active',
            duration: '1 Month',
            startDate: u.createdAt,
            endDate: u.subscriptionExpiry,
            paymentMethod: 'Membership',
          }];
        }

        const hasTrial = membershipHistory.some((h: any) => 
          (h.planName || '').toLowerCase().includes('trial') || 
          h.status === 'Free Trial' || 
          h.paymentMethod === 'Trial'
        );
        if (!hasTrial && u.subscriptionStatus === 'Free Trial') {
          membershipHistory.push({
            _id: 'trial-' + userId,
            planName: 'Free Trial',
            status: 'Free Trial',
            duration: '1 Day',
            startDate: u.createdAt,
            endDate: new Date(new Date(u.createdAt).getTime() + 24 * 60 * 60 * 1000).toISOString(),
            paymentMethod: 'Trial',
            createdAt: u.createdAt,
          });
        }

        membershipHistory.sort((a, b) => new Date(b.createdAt || b.startDate || 0).getTime() - new Date(a.createdAt || a.startDate || 0).getTime());

        const status = u.approvalStatus === 'PENDING' ? 'Pending' :
                       u.approvalStatus === 'APPROVED' ? 'Active' :
                       u.approvalStatus === 'REJECTED' ? 'Rejected' :
                       u.approvalStatus === 'SUSPENDED' ? 'Inactive' : (u.subscriptionStatus || 'Inactive');

        const fullName = `${u.firstName || ''} ${u.lastName || ''}`.trim() || u.name || 'Member';

        return {
          id: userId,
          name: fullName,
          firstName: u.firstName || '',
          lastName: u.lastName || '',
          email: u.email || 'N/A',
          phone: u.mobile || u.phone || 'N/A',
          plan: u.subscriptionPlan || membership?.planName || 'Starter',
          status: status,
          approvalStatus: u.approvalStatus,
          joined: formatDateTime(u.createdAt),
          expires: formatDateTime(membership?.endDate || u.subscriptionExpiry),
          customerType: u.customerType === 'NEW_CUSTOMER' ? 'New Customer' : 'Existing Customer',
          gender: u.gender || 'Not Specified',
          dob: u.dateOfBirth ? formatDateOnly(u.dateOfBirth) : 'Not Specified',
          rawDob: u.dateOfBirth || '',
          height: u.height ? `${u.height} cm` : 'Not specified',
          rawHeight: u.height || '',
          weight: u.weight ? `${u.weight} kg` : 'Not specified',
          rawWeight: u.weight || '',
          city: u.city || 'Not specified',
          pinCode: u.pinCode || '',
          fitnessGoal: u.fitnessGoal || 'General Fitness',
          experienceLevel: u.experienceLevel || 'Beginner',
          preferredTraining: u.preferredTraining || 'General Fitness',
          preferredWorkoutTime: u.preferredWorkoutTime || 'Morning (06:00 AM - 08:00 AM)',
          trainer: u.trainer || 'Unassigned',
          lastLogin: u.lastLogin ? formatDateTime(u.lastLogin) : 'Never',
          emergencyName: u.emergencyContact?.name || 'N/A',
          emergencyPhone: u.emergencyContact?.mobile || 'N/A',
          emergencyRelation: u.emergencyContact?.relationship || 'N/A',
          membership,
          membershipHistory,
          originalUser: u,
        };
      });

      // 2. Process enquiries identical to web GymAdminEnquiries.tsx
      const rawEnquiries = enquiriesRes.status === 'fulfilled' ? (enquiriesRes.value.data?.enquiries || enquiriesRes.value.data || []) : [];
      const formattedEnquiries = (Array.isArray(rawEnquiries) ? rawEnquiries : []).map((e: any) => {
        const createdDate = e.createdAt ? new Date(e.createdAt) : new Date();
        const dateStr = createdDate.toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' });
        const timeStr = createdDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

        return {
          id: e._id || e.id || `ENQ_${Date.now()}`,
          customerName: e.customerName || e.name || 'Prospective Lead',
          enquiryId: e.enquiryId || `ENQ${Date.now().toString().slice(-6)}`,
          phone: e.mobileNumber || e.mobile || e.phone || 'N/A',
          email: e.email || 'N/A',
          enquiryType: e.enquiryType || e.interest || e.type || 'Website Contact Message',
          date: dateStr,
          time: timeStr,
          createdAt: e.createdAt,
          status: (e.status || 'NEW').toUpperCase(),
          ownerNotes: e.ownerNotes || '',
          message: e.message || 'No additional message provided.',
          city: e.city || '',
        };
      });

      setMembers(formattedMembers);
      setEnquiries(formattedEnquiries);
    } catch (err) {
      console.error('[OwnerMembers] Error loading records:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [user]);

  useEffect(() => {
    fetchMembersAndEnquiries();
  }, [fetchMembersAndEnquiries]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchMembersAndEnquiries();
  };

  // Member filter matching Web: All, Active, Free Trial, Inactive, Pending, Rejected, New
  const memberFilterTabs = ['All', 'Active', 'Free Trial', 'Inactive', 'Pending', 'Rejected', 'New'];

  const filteredMembers = members.filter((m) => {
    const q = memberSearch.trim().toLowerCase();
    const matchesSearch = !q || 
      (m.name || '').toLowerCase().includes(q) || 
      (m.email || '').toLowerCase().includes(q) || 
      (m.phone || '').includes(q);

    if (!matchesSearch) return false;
    if (memberFilter === 'All') return true;
    if (memberFilter === 'Free Trial') {
      return (
        m.plan?.toLowerCase().includes('trial') ||
        m.membership?.status === 'Free Trial' ||
        m.originalUser?.subscriptionStatus === 'Free Trial' ||
        m.membershipHistory?.some((h: any) => 
          (h.planName || '').toLowerCase().includes('trial') || 
          h.status === 'Free Trial' || 
          h.paymentMethod === 'Trial'
        )
      );
    }
    if (memberFilter === 'New') return m.customerType === 'New Customer';
    return m.status === memberFilter;
  });

  // Enquiry filters matching Web: All, NEW, CONTACTED, FOLLOW_UP, CONVERTED, CLOSED
  const enquiryFilterTabs = ['All', 'NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'];

  const filteredEnquiries = enquiries.filter((e) => {
    const q = enquirySearch.trim().toLowerCase();
    const matchesSearch = !q || 
      (e.customerName || '').toLowerCase().includes(q) || 
      (e.email || '').toLowerCase().includes(q) || 
      (e.phone || '').includes(q) ||
      (e.enquiryId || '').toLowerCase().includes(q);

    if (!matchesSearch) return false;
    if (enquiryFilter === 'All') return true;
    return e.status === enquiryFilter;
  });

  const handleCall = (phone: string) => {
    if (!phone || phone === 'N/A') {
      Alert.alert('Phone Unavailable', 'No valid contact number on file.');
      return;
    }
    const cleanPhone = phone.replace(/[^\d+]/g, '');
    Linking.openURL(`tel:${cleanPhone}`).catch(() => {
      Alert.alert('Dialer Notice', `Unable to initiate dialer for ${phone}.`);
    });
  };

  const handleMail = (email: string) => {
    if (!email || email === 'N/A') {
      Alert.alert('Email Unavailable', 'No email address on file.');
      return;
    }
    Linking.openURL(`mailto:${email}`).catch(() => {
      Alert.alert('Email Notice', `Unable to launch email client for ${email}.`);
    });
  };

  // Status Change handler
  const handleOpenStatusModal = (member: any) => {
    setMemberToChangeStatus(member);
    setStatusModalVisible(true);
  };

  const handleSaveMemberStatus = async (newStatus: string) => {
    if (!memberToChangeStatus) return;
    let apiStatus = 'PENDING';
    if (newStatus === 'Active') apiStatus = 'APPROVED';
    else if (newStatus === 'Inactive') apiStatus = 'SUSPENDED';
    else if (newStatus === 'Rejected') apiStatus = 'REJECTED';

    try {
      setIsUpdatingStatus(true);
      await api.put(`/users/${memberToChangeStatus.id}/status`, { status: apiStatus });
      setMembers(prev => prev.map(m => m.id === memberToChangeStatus.id ? { ...m, status: newStatus } : m));
      setStatusModalVisible(false);
      Alert.alert('Status Updated', `${memberToChangeStatus.name}'s status is now ${newStatus}.`);
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to update member status.');
    } finally {
      setIsUpdatingStatus(false);
    }
  };

  // Delete Member handler
  const handleDeleteMember = (member: any) => {
    Alert.alert(
      'Delete Member',
      `Are you sure you want to delete ${member.name}? This will remove their membership and access records.`,
      [
        { text: 'Cancel', style: 'cancel' },
        { 
          text: 'Delete', 
          style: 'destructive',
          onPress: async () => {
            try {
              await api.delete(`/users/${member.id}`).catch(() => {});
              setMembers(prev => prev.filter(m => m.id !== member.id));
              if (selectedMember?.id === member.id) {
                setViewMemberModalVisible(false);
                setSelectedMember(null);
              }
              Alert.alert('Member Removed', `${member.name} was removed from the member directory.`);
            } catch (err: any) {
              Alert.alert('Error', err.response?.data?.message || 'Could not delete member.');
            }
          }
        }
      ]
    );
  };

  // Open Edit Modal with ALL details pre-populated
  const handleOpenEdit = (member: any) => {
    setSelectedMember(member);
    setEditName(member.name);
    setEditPhone(member.phone === 'N/A' ? '' : member.phone);
    setEditEmail(member.email === 'N/A' ? '' : member.email);
    setEditPlan(member.plan || 'Starter');
    setEditGender(member.gender !== 'Not Specified' ? member.gender : 'Male');
    setEditDob(member.rawDob || (member.dob !== 'Not Specified' ? member.dob : ''));
    setEditFitnessGoal(member.fitnessGoal || 'General Fitness');
    setEditStatus(member.status || 'Active');
    setEditHeight(member.rawHeight ? String(member.rawHeight) : '');
    setEditWeight(member.rawWeight ? String(member.rawWeight) : '');
    setEditCity(member.city !== 'Not specified' ? member.city : '');
    setEditPinCode(member.pinCode || '');
    setEditTrainer(member.trainer !== 'Unassigned' ? member.trainer : '');
    setEditEmergencyName(member.emergencyName !== 'N/A' ? member.emergencyName : '');
    setEditEmergencyPhone(member.emergencyPhone !== 'N/A' ? member.emergencyPhone : '');
    setEditEmergencyRelation(member.emergencyRelation !== 'N/A' ? member.emergencyRelation : '');
    setEditMemberModalVisible(true);
  };

  const handleSaveEdit = async () => {
    if (!selectedMember) return;
    try {
      setIsSavingEdit(true);
      const nameParts = editName.trim().split(' ');
      const firstName = nameParts[0] || editName.trim();
      const lastName = nameParts.slice(1).join(' ') || '';

      await api.put(`/users/${selectedMember.id}`, {
        firstName,
        lastName,
        name: editName.trim(),
        mobile: editPhone.trim(),
        email: editEmail.trim(),
        gender: editGender,
        dateOfBirth: editDob,
        fitnessGoal: editFitnessGoal,
        subscriptionPlan: editPlan,
        height: editHeight ? Number(editHeight) : undefined,
        weight: editWeight ? Number(editWeight) : undefined,
        city: editCity,
        pinCode: editPinCode,
        trainer: editTrainer,
        emergencyContact: {
          name: editEmergencyName,
          mobile: editEmergencyPhone,
          relationship: editEmergencyRelation
        }
      }).catch(() => {});

      // If status changed, update via /users/:id/status
      if (editStatus !== selectedMember.status) {
        let apiStatus = 'PENDING';
        if (editStatus === 'Active') apiStatus = 'APPROVED';
        else if (editStatus === 'Inactive') apiStatus = 'SUSPENDED';
        else if (editStatus === 'Rejected') apiStatus = 'REJECTED';
        await api.put(`/users/${selectedMember.id}/status`, { status: apiStatus }).catch(() => {});
      }

      setMembers(prev => prev.map(m => m.id === selectedMember.id ? {
        ...m,
        name: editName.trim(),
        phone: editPhone.trim() || 'N/A',
        email: editEmail.trim() || 'N/A',
        plan: editPlan,
        status: editStatus,
        gender: editGender,
        dob: editDob ? formatDateOnly(editDob) : 'Not Specified',
        rawDob: editDob,
        fitnessGoal: editFitnessGoal,
        height: editHeight ? `${editHeight} cm` : 'Not specified',
        rawHeight: editHeight,
        weight: editWeight ? `${editWeight} kg` : 'Not specified',
        rawWeight: editWeight,
        city: editCity || 'Not specified',
        pinCode: editPinCode,
        trainer: editTrainer || 'Unassigned',
        emergencyName: editEmergencyName || 'N/A',
        emergencyPhone: editEmergencyPhone || 'N/A',
        emergencyRelation: editEmergencyRelation || 'N/A'
      } : m));

      setEditMemberModalVisible(false);
      Alert.alert('Member Updated', 'All member profile details saved successfully.');
    } catch (err: any) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Could not save member updates.');
    } finally {
      setIsSavingEdit(false);
    }
  };

  // Create Member handler
  const handleCreateMember = async () => {
    if (!newMemberName.trim() || !newMemberPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter Member Name and Phone number.');
      return;
    }

    try {
      setIsSubmittingMember(true);
      const nameParts = newMemberName.trim().split(' ');
      const firstName = nameParts[0] || newMemberName.trim();
      const lastName = nameParts.slice(1).join(' ') || '';

      const res = await api.post('/users', {
        firstName,
        lastName,
        name: newMemberName.trim(),
        email: newMemberEmail.trim() || `member_${Date.now()}@gymora.com`,
        mobile: newMemberPhone.trim(),
        role: 'MEMBER',
        subscriptionPlan: newMemberPlan,
        gymId: user?.gymId,
        branchId: user?.branchId
      }).catch(() => null);

      const created = {
        id: res?.data?.user?._id || `M_${Date.now()}`,
        name: newMemberName.trim(),
        phone: newMemberPhone.trim(),
        email: newMemberEmail.trim() || 'N/A',
        plan: newMemberPlan,
        joined: formatDateTime(new Date()),
        expires: '1 Year from today',
        status: 'Active',
        customerType: 'New Customer',
        gender: 'Not Specified',
        dob: 'Not Specified',
        height: 'Not specified',
        weight: 'Not specified',
        city: 'Not specified',
        fitnessGoal: 'General Fitness',
        trainer: 'Unassigned',
        emergencyName: 'N/A',
        emergencyPhone: 'N/A',
        membershipHistory: [{
          _id: `plan_${Date.now()}`,
          planName: newMemberPlan,
          status: 'Active',
          startDate: new Date().toISOString()
        }]
      };

      setMembers([created, ...members]);
      setNewMemberName('');
      setNewMemberPhone('');
      setNewMemberEmail('');
      setAddMemberModalVisible(false);

      Alert.alert('Member Enrolled', `${created.name} registered successfully.`);
    } catch (err: any) {
      Alert.alert('Enrollment Error', err.response?.data?.message || 'Failed to save member.');
    } finally {
      setIsSubmittingMember(false);
    }
  };

  // Enquiry Update Status & Notes handler
  const handleUpdateEnquiry = async (newStatus: string) => {
    if (!selectedEnquiry) return;
    try {
      setIsUpdatingEnquiry(true);
      const res = await api.put(`/enquiries/${selectedEnquiry.id}/status`, {
        status: newStatus,
        ownerNotes: enquiryNotes
      });

      const updated = res.data?.enquiry;
      setEnquiries(prev => prev.map(e => e.id === selectedEnquiry.id ? {
        ...e,
        status: newStatus,
        ownerNotes: enquiryNotes
      } : e));

      setSelectedEnquiry((prev: any) => prev ? { ...prev, status: newStatus, ownerNotes: enquiryNotes } : null);
      Alert.alert('Enquiry Updated', `Status updated to ${newStatus}.`);
    } catch (err: any) {
      Alert.alert('Update Failed', err.response?.data?.message || 'Failed to update enquiry status.');
    } finally {
      setIsUpdatingEnquiry(false);
    }
  };

  const handleSaveEnquiryNotes = async () => {
    if (!selectedEnquiry) return;
    try {
      setIsUpdatingEnquiry(true);
      await api.put(`/enquiries/${selectedEnquiry.id}/status`, {
        status: selectedEnquiry.status,
        ownerNotes: enquiryNotes
      });

      setEnquiries(prev => prev.map(e => e.id === selectedEnquiry.id ? {
        ...e,
        ownerNotes: enquiryNotes
      } : e));

      Alert.alert('Notes Saved', 'Owner follow-up notes recorded.');
    } catch (err: any) {
      Alert.alert('Error', err.response?.data?.message || 'Failed to save notes.');
    } finally {
      setIsUpdatingEnquiry(false);
    }
  };

  // Convert Enquiry to Member
  const handleConvertEnquiry = (enquiry: any) => {
    setNewMemberName(enquiry.customerName);
    setNewMemberPhone(enquiry.phone === 'N/A' ? '' : enquiry.phone);
    setNewMemberEmail(enquiry.email === 'N/A' ? '' : enquiry.email);
    setEnquiryDetailModalVisible(false);
    setActiveSection('members');
    setAddMemberModalVisible(true);
  };

  // Create Enquiry handler
  const handleCreateEnquiry = async () => {
    if (!newEnquiryName.trim() || !newEnquiryPhone.trim()) {
      Alert.alert('Required Fields', 'Please enter Customer Name and Phone number.');
      return;
    }

    try {
      setIsSubmittingEnquiry(true);
      const res = await api.post('/enquiries', {
        customerName: newEnquiryName.trim(),
        mobileNumber: newEnquiryPhone.trim(),
        email: newEnquiryEmail.trim() || `lead_${Date.now()}@example.com`,
        enquiryType: newEnquiryType,
        message: newEnquiryMsg.trim() || 'Customer walk-in enquiry',
        gymId: user?.gymId,
        branchId: user?.branchId
      }).catch(() => null);

      const created = {
        id: res?.data?.enquiry?._id || `E${Date.now()}`,
        customerName: newEnquiryName.trim(),
        enquiryId: res?.data?.enquiry?.enquiryId || `ENQ${Date.now().toString().slice(-6)}`,
        phone: newEnquiryPhone.trim(),
        email: newEnquiryEmail.trim() || 'N/A',
        enquiryType: newEnquiryType,
        date: new Date().toLocaleDateString('en-US', { month: '2-digit', day: '2-digit', year: 'numeric' }),
        time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true }),
        status: 'NEW',
        ownerNotes: '',
        message: newEnquiryMsg.trim() || 'Customer walk-in enquiry'
      };

      setEnquiries([created, ...enquiries]);
      setNewEnquiryName('');
      setNewEnquiryPhone('');
      setNewEnquiryEmail('');
      setNewEnquiryMsg('');
      setAddEnquiryModalVisible(false);

      Alert.alert('Enquiry Created', `Lead for ${created.customerName} recorded successfully.`);
    } catch (err: any) {
      Alert.alert('Creation Failed', err.response?.data?.message || 'Could not save enquiry.');
    } finally {
      setIsSubmittingEnquiry(false);
    }
  };

  return (
    <View style={styles.container}>
      {/* Top Segmented Selector: Members | Customer Enquiries */}
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
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[COLORS.primary]} />
        }
      >
        {loading ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={styles.loadingText}>Fetching database records…</Text>
          </View>
        ) : activeSection === 'members' ? (
          <>
            {/* Search & Add Member */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color={COLORS.textMuted} />
                <TextInput
                  placeholder="Search by name, email or phone..."
                  placeholderTextColor={COLORS.textMuted}
                  value={memberSearch}
                  onChangeText={setMemberSearch}
                  style={styles.searchInput}
                />
                {memberSearch.length > 0 && (
                  <TouchableOpacity onPress={() => setMemberSearch('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity 
                style={styles.addBtn} 
                activeOpacity={0.8}
                onPress={() => setAddMemberModalVisible(true)}
              >
                <Ionicons name="person-add" size={17} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Filter Tabs matching Web App */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.filtersScroll}
            >
              {memberFilterTabs.map((tab) => {
                const isActive = memberFilter === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setMemberFilter(tab)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Members List (Matching Web Design in Image 3) */}
            <View style={styles.list}>
              {filteredMembers.length === 0 ? (
                <View style={styles.emptyCardBox}>
                  <Ionicons name="people-outline" size={36} color={COLORS.textMuted} />
                  <Text style={styles.emptyCardTitle}>No Members Found</Text>
                  <Text style={styles.emptyCardText}>Enroll members to view their profile, pass, and expiry status.</Text>
                </View>
              ) : (
                filteredMembers.map((m) => {
                  const isPending = m.status === 'Pending';
                  const isActive = m.status === 'Active';
                  const isRejected = m.status === 'Rejected';
                  const isExpanded = expandedPlanMemberId === m.id;
                  const plansCount = m.membershipHistory?.length || 1;

                  return (
                    <View key={m.id} style={styles.webMemberCard}>
                      {/* Member Header Row */}
                      <View style={styles.cardHeaderRow}>
                        <View style={styles.memberIdentRow}>
                          <View style={styles.avatarCircle}>
                            <Text style={styles.avatarInitial}>{m.name.charAt(0).toUpperCase()}</Text>
                          </View>
                          <View style={{ flex: 1 }}>
                            <Text style={styles.webMemberName}>{m.name}</Text>
                            <View style={styles.contactSubRow}>
                              <Ionicons name="mail-outline" size={12} color={COLORS.textMuted} />
                              <Text style={styles.contactEmailText} numberOfLines={1}>{m.email}</Text>
                            </View>
                            <TouchableOpacity 
                              style={styles.contactSubRow}
                              onPress={() => handleCall(m.phone)}
                            >
                              <Ionicons name="call-outline" size={12} color={COLORS.primary} />
                              <Text style={styles.contactPhoneText}>{m.phone}</Text>
                            </TouchableOpacity>
                          </View>
                        </View>

                        {/* Status Badge */}
                        <TouchableOpacity 
                          style={[
                            styles.webStatusBadge,
                            isPending ? styles.statusBadgePending :
                            isActive ? styles.statusBadgeActive :
                            isRejected ? styles.statusBadgeRejected : styles.statusBadgeInactive
                          ]}
                          onPress={() => handleOpenStatusModal(m)}
                        >
                          <Text style={[
                            styles.webStatusText,
                            isPending ? styles.statusTextPending :
                            isActive ? styles.statusTextActive :
                            isRejected ? styles.statusTextRejected : styles.statusTextInactive
                          ]}>
                            {m.status}
                          </Text>
                        </TouchableOpacity>
                      </View>

                      {/* Membership Details Block */}
                      <View style={styles.membershipDetailsBlock}>
                        <View style={styles.planBadgeRow}>
                          {/* Plan Pill */}
                          <View style={styles.shieldPlanPill}>
                            <Ionicons name="shield-checkmark" size={12} color={COLORS.primary} />
                            <Text style={styles.shieldPlanText}>{m.plan}</Text>
                          </View>

                          {/* Multiple Plans Badge */}
                          {plansCount > 1 && (
                            <TouchableOpacity 
                              style={styles.multiPlanBadge}
                              onPress={() => setExpandedPlanMemberId(isExpanded ? null : m.id)}
                            >
                              <Ionicons name="time-outline" size={11} color="#C2410C" />
                              <Text style={styles.multiPlanText}>{plansCount} Plans</Text>
                              <Ionicons name={isExpanded ? "chevron-up" : "chevron-down"} size={11} color="#C2410C" />
                            </TouchableOpacity>
                          )}
                        </View>

                        {/* Expandable Plan History Breakdown (Matching Image 3) */}
                        {isExpanded && m.membershipHistory && (
                          <View style={styles.planHistoryContainer}>
                            <Text style={styles.historyHeading}>Subscription History:</Text>
                            {m.membershipHistory.map((h: any, idx: number) => (
                              <View key={h._id || idx} style={styles.historyItemRow}>
                                <Text style={styles.historyIndex}>{idx + 1}.</Text>
                                <View style={styles.historyPlanPill}>
                                  <Ionicons name="shield-checkmark" size={10} color={COLORS.primary} />
                                  <Text style={styles.historyPlanName}>{h.planName || 'Plan'}</Text>
                                </View>
                                <Text style={styles.historyDate}>
                                  {formatDateOnly(h.startDate || h.createdAt)}
                                </Text>
                              </View>
                            ))}
                          </View>
                        )}

                        {/* Joined & Expires Timestamps */}
                        <View style={styles.datesGrid}>
                          <View style={styles.dateCol}>
                            <Ionicons name="calendar-outline" size={12} color={COLORS.textMuted} />
                            <Text style={styles.dateLabelText}>Joined: {m.joined}</Text>
                          </View>
                          <View style={styles.dateCol}>
                            <Ionicons name="timer-outline" size={12} color={COLORS.textMuted} />
                            <Text style={styles.dateLabelText}>Expires: {m.expires}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Web Actions Row: View, Edit, Delete, Status */}
                      <View style={styles.webActionsRow}>
                        <TouchableOpacity 
                          style={styles.webActionBtn}
                          onPress={() => {
                            setSelectedMember(m);
                            setViewMemberModalVisible(true);
                          }}
                        >
                          <Ionicons name="eye-outline" size={16} color={COLORS.textMedium} />
                          <Text style={styles.webActionLabel}>View</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.webActionBtn}
                          onPress={() => handleOpenEdit(m)}
                        >
                          <Ionicons name="pencil-outline" size={15} color={COLORS.blue} />
                          <Text style={[styles.webActionLabel, { color: COLORS.blue }]}>Edit</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.webActionBtn}
                          onPress={() => handleDeleteMember(m)}
                        >
                          <Ionicons name="trash-outline" size={15} color={COLORS.rose} />
                          <Text style={[styles.webActionLabel, { color: COLORS.rose }]}>Delete</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={[styles.webActionBtn, styles.statusActionBtn]}
                          onPress={() => handleOpenStatusModal(m)}
                        >
                          <Ionicons name="flash-outline" size={14} color={COLORS.primary} />
                          <Text style={[styles.webActionLabel, { color: COLORS.primary, fontWeight: '700' }]}>Status</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        ) : (
          <>
            {/* Enquiries Header, Search & Add (Matching Web Image 4) */}
            <View style={styles.enquiriesTitleBox}>
              <Text style={styles.enquiriesTitle}>Customer Enquiries</Text>
              <Text style={styles.enquiriesSub}>Manage leads and prospective members who want to join your gym.</Text>
            </View>

            {/* Search Row */}
            <View style={styles.searchRow}>
              <View style={styles.searchBox}>
                <Ionicons name="search" size={16} color={COLORS.textMuted} />
                <TextInput
                  placeholder="Search leads..."
                  placeholderTextColor={COLORS.textMuted}
                  value={enquirySearch}
                  onChangeText={setEnquirySearch}
                  style={styles.searchInput}
                />
                {enquirySearch.length > 0 && (
                  <TouchableOpacity onPress={() => setEnquirySearch('')}>
                    <Ionicons name="close-circle" size={16} color={COLORS.textMuted} />
                  </TouchableOpacity>
                )}
              </View>
              <TouchableOpacity 
                style={styles.addBtn} 
                activeOpacity={0.8}
                onPress={() => setAddEnquiryModalVisible(true)}
              >
                <Ionicons name="add" size={20} color={COLORS.white} />
              </TouchableOpacity>
            </View>

            {/* Enquiry Filters matching Web App */}
            <ScrollView 
              horizontal 
              showsHorizontalScrollIndicator={false} 
              contentContainerStyle={styles.filtersScroll}
            >
              {enquiryFilterTabs.map((tab) => {
                const isActive = enquiryFilter === tab;
                return (
                  <TouchableOpacity
                    key={tab}
                    style={[styles.filterChip, isActive && styles.filterChipActive]}
                    onPress={() => setEnquiryFilter(tab)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{tab}</Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>

            {/* Enquiries List (Matching Web Image 4) */}
            <View style={styles.list}>
              {filteredEnquiries.length === 0 ? (
                <View style={styles.emptyCardBox}>
                  <Ionicons name="chatbubbles-outline" size={36} color={COLORS.textMuted} />
                  <Text style={styles.emptyCardTitle}>No Enquiries Found</Text>
                  <Text style={styles.emptyCardText}>Walk-in leads and prospective members will appear here.</Text>
                </View>
              ) : (
                filteredEnquiries.map((e) => {
                  const isNew = e.status === 'NEW';
                  const isConverted = e.status === 'CONVERTED';
                  const isContacted = e.status === 'CONTACTED';
                  const isFollowUp = e.status === 'FOLLOW_UP';

                  return (
                    <View key={e.id} style={styles.webEnquiryCard}>
                      {/* Top Row: Customer Name, Code & Status */}
                      <View style={styles.enquiryTopRow}>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.webEnquiryName}>{e.customerName}</Text>
                          <Text style={styles.webEnquiryCode}>{e.enquiryId}</Text>
                        </View>
                        <View style={[
                          styles.webEnquiryStatusBadge,
                          isNew ? styles.enquiryBadgeNew :
                          isConverted ? styles.enquiryBadgeConverted :
                          isContacted ? styles.enquiryBadgeContacted :
                          isFollowUp ? styles.enquiryBadgeFollowUp : styles.enquiryBadgeClosed
                        ]}>
                          <Text style={[
                            styles.webEnquiryStatusText,
                            isNew ? styles.enquiryTextNew :
                            isConverted ? styles.enquiryTextConverted :
                            isContacted ? styles.enquiryTextContacted :
                            isFollowUp ? styles.enquiryTextFollowUp : styles.enquiryTextClosed
                          ]}>
                            {e.status}
                          </Text>
                        </View>
                      </View>

                      {/* Contact Details */}
                      <View style={styles.enquiryContactBox}>
                        <TouchableOpacity 
                          style={styles.enquiryContactLine}
                          onPress={() => handleCall(e.phone)}
                        >
                          <Ionicons name="call-outline" size={13} color={COLORS.textDark} />
                          <Text style={styles.enquiryContactValue}>{e.phone}</Text>
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.enquiryContactLine}
                          onPress={() => handleMail(e.email)}
                        >
                          <Ionicons name="mail-outline" size={13} color={COLORS.textMuted} />
                          <Text style={styles.enquiryContactValueMuted} numberOfLines={1}>{e.email}</Text>
                        </TouchableOpacity>
                      </View>

                      {/* Type & Timestamp Row */}
                      <View style={styles.enquiryMetaRow}>
                        <View style={styles.enquiryTypePill}>
                          <Text style={styles.enquiryTypeText}>{e.enquiryType}</Text>
                        </View>

                        <View style={styles.enquiryTimeBox}>
                          <Ionicons name="time-outline" size={12} color={COLORS.primary} />
                          <Text style={styles.enquiryTimeText}>{e.date} • {e.time}</Text>
                        </View>
                      </View>

                      {/* Action Row matching Web: View Details → and Convert to Member */}
                      <View style={styles.enquiryActionRow}>
                        <TouchableOpacity 
                          style={styles.viewDetailsBtn}
                          onPress={() => {
                            setSelectedEnquiry(e);
                            setEnquiryNotes(e.ownerNotes || '');
                            setEnquiryDetailModalVisible(true);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.viewDetailsText}>View Details</Text>
                          <Ionicons name="arrow-forward" size={15} color={COLORS.primary} />
                        </TouchableOpacity>

                        <TouchableOpacity 
                          style={styles.quickConvertBtn}
                          onPress={() => handleConvertEnquiry(e)}
                          activeOpacity={0.7}
                        >
                          <Ionicons name="person-add-outline" size={14} color={COLORS.emerald} />
                          <Text style={styles.quickConvertText}>Convert</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                })
              )}
            </View>
          </>
        )}
      </ScrollView>

      {/* FULL DETAILS VIEW MEMBER MODAL (Matching Web GymAdminMembers.tsx View Profile) */}
      <Modal visible={viewMemberModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardLarge}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Member Profile</Text>
                <Text style={styles.modalSubtitle}>Comprehensive membership & personal details</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setViewMemberModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            {selectedMember && (
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {/* 1. Member Profile Banner */}
                <View style={styles.profileBanner}>
                  <View style={styles.avatarCircleHuge}>
                    <Text style={styles.avatarInitialHuge}>{selectedMember.name.charAt(0).toUpperCase()}</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 14 }}>
                    <Text style={styles.profileBannerName}>{selectedMember.name}</Text>
                    <View style={styles.profileBadgesRow}>
                      <View style={[
                        styles.webStatusBadge,
                        selectedMember.status === 'Active' ? styles.statusBadgeActive :
                        selectedMember.status === 'Pending' ? styles.statusBadgePending :
                        selectedMember.status === 'Rejected' ? styles.statusBadgeRejected : styles.statusBadgeInactive
                      ]}>
                        <Text style={[
                          styles.webStatusText,
                          selectedMember.status === 'Active' ? styles.statusTextActive :
                          selectedMember.status === 'Pending' ? styles.statusTextPending :
                          selectedMember.status === 'Rejected' ? styles.statusTextRejected : styles.statusTextInactive
                        ]}>
                          {selectedMember.status}
                        </Text>
                      </View>

                      <View style={styles.customerTypeBadge}>
                        <Text style={styles.customerTypeText}>{selectedMember.customerType}</Text>
                      </View>
                    </View>
                  </View>
                </View>

                {/* Quick Contact Bar */}
                <View style={styles.quickContactBar}>
                  <TouchableOpacity 
                    style={styles.quickContactBtn}
                    onPress={() => handleCall(selectedMember.phone)}
                  >
                    <Ionicons name="call" size={15} color={COLORS.primary} />
                    <Text style={styles.quickContactText}>{selectedMember.phone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.quickContactBtn}
                    onPress={() => handleMail(selectedMember.email)}
                  >
                    <Ionicons name="mail" size={15} color={COLORS.blue} />
                    <Text style={[styles.quickContactText, { color: COLORS.blue }]} numberOfLines={1}>
                      {selectedMember.email}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* 2. Membership Information Box */}
                <View style={styles.infoCardBox}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="shield-checkmark" size={16} color={COLORS.primary} />
                    <Text style={styles.infoCardTitle}>Membership & Subscription</Text>
                  </View>

                  <View style={styles.grid2Col}>
                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Current Plan</Text>
                      <View style={styles.shieldPlanPill}>
                        <Ionicons name="shield-checkmark" size={11} color={COLORS.primary} />
                        <Text style={styles.shieldPlanText}>{selectedMember.plan}</Text>
                      </View>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Total Plans Enrolled</Text>
                      <Text style={styles.gridValueHighlight}>
                        {selectedMember.membershipHistory?.length || 1} Total Plans
                      </Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Joined Date & Time</Text>
                      <Text style={styles.gridValue}>{selectedMember.joined}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Expiry Date & Time</Text>
                      <Text style={[styles.gridValue, { color: selectedMember.status === 'Active' ? COLORS.emerald : '#D97706', fontWeight: '700' }]}>
                        {selectedMember.expires}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* 3. Personal & Physical Profile Box */}
                <View style={styles.infoCardBox}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="person" size={16} color={COLORS.primary} />
                    <Text style={styles.infoCardTitle}>Personal & Fitness Profile</Text>
                  </View>

                  <View style={styles.grid2Col}>
                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Fitness Goal</Text>
                      <Text style={styles.gridValue}>{selectedMember.fitnessGoal}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Gender</Text>
                      <Text style={styles.gridValue}>{selectedMember.gender}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Date of Birth</Text>
                      <Text style={styles.gridValue}>{selectedMember.dob}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Height & Weight</Text>
                      <Text style={styles.gridValue}>{selectedMember.height} / {selectedMember.weight}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>City & PIN</Text>
                      <Text style={styles.gridValue}>{selectedMember.city} {selectedMember.pinCode ? `- ${selectedMember.pinCode}` : ''}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Experience Level</Text>
                      <Text style={styles.gridValue}>{selectedMember.experienceLevel}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Preferred Training</Text>
                      <Text style={styles.gridValue}>{selectedMember.preferredTraining}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Workout Schedule</Text>
                      <Text style={styles.gridValue}>{selectedMember.preferredWorkoutTime}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Assigned Trainer</Text>
                      <Text style={styles.gridValue}>{selectedMember.trainer}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Last App Login</Text>
                      <Text style={styles.gridValue}>{selectedMember.lastLogin}</Text>
                    </View>
                  </View>
                </View>

                {/* 4. Emergency Contact Details */}
                <View style={styles.infoCardBox}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="call" size={16} color={COLORS.primary} />
                    <Text style={styles.infoCardTitle}>Emergency Contact</Text>
                  </View>

                  <View style={styles.grid2Col}>
                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Contact Person</Text>
                      <Text style={styles.gridValue}>{selectedMember.emergencyName}</Text>
                    </View>

                    <View style={styles.gridColItem}>
                      <Text style={styles.gridLabel}>Relationship</Text>
                      <Text style={styles.gridValue}>{selectedMember.emergencyRelation}</Text>
                    </View>

                    <View style={[styles.gridColItem, { width: '100%' }]}>
                      <Text style={styles.gridLabel}>Emergency Phone</Text>
                      <TouchableOpacity onPress={() => handleCall(selectedMember.emergencyPhone)}>
                        <Text style={[styles.gridValue, { color: COLORS.primary, fontWeight: '700' }]}>
                          {selectedMember.emergencyPhone}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </View>

                {/* 5. Complete Membership & Plan History (Matching Web View Profile) */}
                <View style={styles.infoCardBox}>
                  <View style={styles.infoCardHeader}>
                    <Ionicons name="time" size={16} color={COLORS.primary} />
                    <Text style={styles.infoCardTitle}>Membership & Plan History</Text>
                    <View style={styles.countBadge}>
                      <Text style={styles.countBadgeText}>{selectedMember.membershipHistory?.length || 1} Records</Text>
                    </View>
                  </View>

                  <View style={{ gap: 8, marginTop: 8 }}>
                    {selectedMember.membershipHistory?.map((h: any, idx: number) => {
                      const isFirst = idx === 0;
                      return (
                        <View key={h._id || idx} style={[styles.historyCardRow, isFirst && styles.historyCardRowCurrent]}>
                          <View style={styles.historyCardHeader}>
                            <View style={styles.shieldPlanPill}>
                              <Ionicons name="shield-checkmark" size={11} color={COLORS.primary} />
                              <Text style={styles.shieldPlanText}>{h.planName || 'Plan'}</Text>
                            </View>
                            <Text style={styles.historyStatusText}>{h.status || 'Active'}</Text>
                          </View>

                          <View style={styles.historyCardMeta}>
                            <Text style={styles.historyDateText}>
                              📅 {formatDateOnly(h.startDate || h.createdAt)} - {formatDateOnly(h.endDate) || 'Continuous'}
                            </Text>
                            {h.duration && <Text style={styles.historyDurationText}>⏱ {h.duration}</Text>}
                          </View>
                        </View>
                      );
                    })}
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Bottom Actions Bar */}
            <View style={styles.modalBottomBar}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setViewMemberModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { backgroundColor: COLORS.blue }]} 
                onPress={() => {
                  setViewMemberModalVisible(false);
                  handleOpenEdit(selectedMember);
                }}
              >
                <Ionicons name="pencil" size={14} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.modalSubmitText}>Edit Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* FULL DETAILS EDIT MEMBER MODAL (Matching Web GymAdminMembers.tsx Edit Form) */}
      <Modal visible={editMemberModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardLarge}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Edit Member Profile</Text>
                <Text style={styles.modalSubtitle}>Update personal, membership and fitness details</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setEditMemberModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
              {/* Section 1: Personal Details */}
              <View style={styles.editSection}>
                <View style={styles.editSectionHeader}>
                  <Ionicons name="person-outline" size={15} color={COLORS.primary} />
                  <Text style={styles.editSectionTitle}>Personal Information</Text>
                </View>

                <Text style={styles.inputLabel}>Full Name *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editName}
                  onChangeText={setEditName}
                  placeholder="Full Name"
                />

                <Text style={styles.inputLabel}>Phone Number *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editPhone}
                  onChangeText={setEditPhone}
                  placeholder="10-digit Mobile Number"
                  keyboardType="phone-pad"
                  maxLength={10}
                />

                <Text style={styles.inputLabel}>Email Address *</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editEmail}
                  onChangeText={setEditEmail}
                  placeholder="Email Address"
                  keyboardType="email-address"
                />

                <View style={styles.grid2Col}>
                  <View style={[styles.gridColItem, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Gender</Text>
                    <View style={styles.pillSelectorRow}>
                      {['Male', 'Female', 'Other'].map((g) => (
                        <TouchableOpacity
                          key={g}
                          style={[styles.smallPill, editGender === g && styles.smallPillActive]}
                          onPress={() => setEditGender(g)}
                        >
                          <Text style={[styles.smallPillText, editGender === g && styles.smallPillTextActive]}>{g}</Text>
                        </TouchableOpacity>
                      ))}
                    </View>
                  </View>

                  <View style={[styles.gridColItem, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Date of Birth</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editDob}
                      onChangeText={setEditDob}
                      placeholder="YYYY-MM-DD"
                    />
                  </View>
                </View>

                <View style={styles.grid2Col}>
                  <View style={[styles.gridColItem, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Height (cm)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editHeight}
                      onChangeText={setEditHeight}
                      placeholder="e.g. 175"
                      keyboardType="numeric"
                    />
                  </View>

                  <View style={[styles.gridColItem, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>Weight (kg)</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editWeight}
                      onChangeText={setEditWeight}
                      placeholder="e.g. 72"
                      keyboardType="numeric"
                    />
                  </View>
                </View>

                <View style={styles.grid2Col}>
                  <View style={[styles.gridColItem, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>City</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editCity}
                      onChangeText={setEditCity}
                      placeholder="City Name"
                    />
                  </View>

                  <View style={[styles.gridColItem, { flex: 1 }]}>
                    <Text style={styles.inputLabel}>PIN Code</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editPinCode}
                      onChangeText={setEditPinCode}
                      placeholder="PIN Code"
                      keyboardType="numeric"
                    />
                  </View>
                </View>
              </View>

              {/* Section 2: Membership & Plan */}
              <View style={styles.editSection}>
                <View style={styles.editSectionHeader}>
                  <Ionicons name="shield-checkmark-outline" size={15} color={COLORS.primary} />
                  <Text style={styles.editSectionTitle}>Membership & Status</Text>
                </View>

                <Text style={styles.inputLabel}>Subscription Plan</Text>
                <View style={styles.pillSelectorRow}>
                  {['Starter', 'weight Loss', 'Strength', 'Free Trial', 'Gold Annual'].map((p) => (
                    <TouchableOpacity
                      key={p}
                      style={[styles.smallPill, editPlan === p && styles.smallPillActive]}
                      onPress={() => setEditPlan(p)}
                    >
                      <Text style={[styles.smallPillText, editPlan === p && styles.smallPillTextActive]}>{p}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Account Status</Text>
                <View style={styles.pillSelectorRow}>
                  {['Active', 'Pending', 'Inactive', 'Rejected'].map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[styles.smallPill, editStatus === st && styles.smallPillActive]}
                      onPress={() => setEditStatus(st)}
                    >
                      <Text style={[styles.smallPillText, editStatus === st && styles.smallPillTextActive]}>{st}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Fitness Goal</Text>
                <View style={styles.pillSelectorRow}>
                  {['General Fitness', 'Weight Loss', 'Muscle Gain', 'Endurance', 'Flexibility'].map((fg) => (
                    <TouchableOpacity
                      key={fg}
                      style={[styles.smallPill, editFitnessGoal === fg && styles.smallPillActive]}
                      onPress={() => setEditFitnessGoal(fg)}
                    >
                      <Text style={[styles.smallPillText, editFitnessGoal === fg && styles.smallPillTextActive]}>{fg}</Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.inputLabel}>Assigned Trainer</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editTrainer}
                  onChangeText={setEditTrainer}
                  placeholder="Trainer Name"
                />
              </View>

              {/* Section 3: Emergency Contact */}
              <View style={styles.editSection}>
                <View style={styles.editSectionHeader}>
                  <Ionicons name="call-outline" size={15} color={COLORS.primary} />
                  <Text style={styles.editSectionTitle}>Emergency Contact</Text>
                </View>

                <Text style={styles.inputLabel}>Contact Person Name</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editEmergencyName}
                  onChangeText={setEditEmergencyName}
                  placeholder="Contact Name"
                />

                <Text style={styles.inputLabel}>Emergency Phone</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editEmergencyPhone}
                  onChangeText={setEditEmergencyPhone}
                  placeholder="Contact Phone"
                  keyboardType="phone-pad"
                />

                <Text style={styles.inputLabel}>Relationship</Text>
                <TextInput
                  style={styles.modalInput}
                  value={editEmergencyRelation}
                  onChangeText={setEditEmergencyRelation}
                  placeholder="e.g. Parent / Spouse / Friend"
                />
              </View>
            </ScrollView>

            <View style={styles.modalBottomBar}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setEditMemberModalVisible(false)}
                disabled={isSavingEdit}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, isSavingEdit && { opacity: 0.7 }]} 
                onPress={handleSaveEdit}
                disabled={isSavingEdit}
              >
                {isSavingEdit ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <>
                    <Ionicons name="checkmark-done" size={15} color={COLORS.white} style={{ marginRight: 6 }} />
                    <Text style={styles.modalSubmitText}>Save Changes</Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* MEMBER STATUS CHANGE SHEET */}
      <Modal visible={statusModalVisible} transparent animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Update Member Status</Text>
              <TouchableOpacity onPress={() => setStatusModalVisible(false)}>
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            <Text style={{ fontSize: 13, color: COLORS.textMuted, marginBottom: 14 }}>
              Select account approval status for {memberToChangeStatus?.name}:
            </Text>

            {['Active', 'Pending', 'Inactive', 'Rejected'].map((st) => (
              <TouchableOpacity
                key={st}
                style={[
                  styles.statusSelectRow,
                  memberToChangeStatus?.status === st && styles.statusSelectRowActive
                ]}
                onPress={() => handleSaveMemberStatus(st)}
                disabled={isUpdatingStatus}
              >
                <View style={[
                  styles.statusSelectDot,
                  st === 'Active' ? { backgroundColor: COLORS.emerald } :
                  st === 'Pending' ? { backgroundColor: '#F59E0B' } :
                  st === 'Rejected' ? { backgroundColor: COLORS.rose } : { backgroundColor: COLORS.textMuted }
                ]} />
                <Text style={[
                  styles.statusSelectLabel,
                  memberToChangeStatus?.status === st && { fontWeight: '800', color: COLORS.primary }
                ]}>
                  {st} {st === 'Active' ? '(Approved)' : st === 'Inactive' ? '(Suspended)' : ''}
                </Text>
                {memberToChangeStatus?.status === st && (
                  <Ionicons name="checkmark" size={18} color={COLORS.primary} style={{ marginLeft: 'auto' }} />
                )}
              </TouchableOpacity>
            ))}

            <TouchableOpacity 
              style={[styles.modalCancelBtn, { marginTop: 12 }]} 
              onPress={() => setStatusModalVisible(false)}
            >
              <Text style={styles.modalCancelText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* ENQUIRY DETAIL MODAL (Matching Web GymAdminEnquiries.tsx) */}
      <Modal visible={enquiryDetailModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCardLarge}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Enquiry Details</Text>
                <Text style={styles.modalSubtitle}>Prospective member lead overview</Text>
              </View>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setEnquiryDetailModalVisible(false)}
              >
                <Ionicons name="close" size={22} color={COLORS.textMedium} />
              </TouchableOpacity>
            </View>

            {selectedEnquiry && (
              <ScrollView style={styles.modalScrollView} showsVerticalScrollIndicator={false}>
                {/* Header Profile */}
                <View style={styles.enquiryModalTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.modalEnquiryName}>{selectedEnquiry.customerName}</Text>
                    <Text style={styles.modalEnquiryCode}>ID: {selectedEnquiry.enquiryId}</Text>
                  </View>
                  <View style={styles.enquiryBadgeNew}>
                    <Text style={styles.enquiryTextNew}>{selectedEnquiry.status}</Text>
                  </View>
                </View>

                {/* Contact Row */}
                <View style={styles.enquiryDetailGrid}>
                  <TouchableOpacity 
                    style={styles.detailActionPill}
                    onPress={() => handleCall(selectedEnquiry.phone)}
                  >
                    <Ionicons name="call" size={14} color={COLORS.primary} />
                    <Text style={styles.detailActionPillText}>{selectedEnquiry.phone}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity 
                    style={styles.detailActionPill}
                    onPress={() => handleMail(selectedEnquiry.email)}
                  >
                    <Ionicons name="mail" size={14} color={COLORS.blue} />
                    <Text style={[styles.detailActionPillText, { color: COLORS.blue }]} numberOfLines={1}>
                      {selectedEnquiry.email}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Type & Date */}
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Training Type:</Text>
                  <Text style={styles.detailValue}>{selectedEnquiry.enquiryType}</Text>
                </View>
                <View style={styles.detailRow}>
                  <Text style={styles.detailLabel}>Submission Date:</Text>
                  <Text style={styles.detailValue}>{selectedEnquiry.date} at {selectedEnquiry.time}</Text>
                </View>

                {/* Customer Message */}
                <View style={{ marginTop: 10 }}>
                  <Text style={styles.inputLabel}>Customer Message / Query</Text>
                  <View style={styles.messageDisplayBox}>
                    <Text style={styles.messageDisplayText}>{selectedEnquiry.message}</Text>
                  </View>
                </View>

                {/* Owner Follow-up Notes */}
                <View style={{ marginTop: 12 }}>
                  <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text style={styles.inputLabel}>Owner Follow-up Notes</Text>
                    <TouchableOpacity onPress={handleSaveEnquiryNotes} disabled={isUpdatingEnquiry}>
                      <Text style={{ fontSize: 11, fontWeight: '700', color: COLORS.primary }}>Save Notes</Text>
                    </TouchableOpacity>
                  </View>
                  <TextInput
                    style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
                    multiline
                    value={enquiryNotes}
                    onChangeText={setEnquiryNotes}
                    placeholder="Record call summary or follow-up notes..."
                    placeholderTextColor={COLORS.textMuted}
                  />
                </View>

                {/* Quick Status Updates */}
                <Text style={[styles.inputLabel, { marginTop: 12 }]}>Change Status</Text>
                <View style={styles.statusChipsGrid}>
                  {['NEW', 'CONTACTED', 'FOLLOW_UP', 'CONVERTED', 'CLOSED'].map((st) => (
                    <TouchableOpacity
                      key={st}
                      style={[
                        styles.enquiryStatusChip,
                        selectedEnquiry.status === st && styles.enquiryStatusChipActive
                      ]}
                      onPress={() => handleUpdateEnquiry(st)}
                      disabled={isUpdatingEnquiry}
                    >
                      <Text style={[
                        styles.enquiryStatusChipText,
                        selectedEnquiry.status === st && styles.enquiryStatusChipTextActive
                      ]}>
                        {st.replace('_', ' ')}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </ScrollView>
            )}

            <View style={styles.modalBottomBar}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setEnquiryDetailModalVisible(false)}
              >
                <Text style={styles.modalCancelText}>Close</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, { backgroundColor: COLORS.emerald }]} 
                onPress={() => handleConvertEnquiry(selectedEnquiry)}
              >
                <Ionicons name="person-add" size={14} color={COLORS.white} style={{ marginRight: 6 }} />
                <Text style={styles.modalSubmitText}>Convert to Member</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

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
              placeholder="e.g. 9876543210"
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

            <Text style={styles.inputLabel}>Membership Plan</Text>
            <View style={styles.planSelectorRow}>
              {['Starter', 'weight Loss', 'Strength', 'Free Trial'].map((plan) => (
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
                disabled={isSubmittingMember}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, isSubmittingMember && { opacity: 0.7 }]} 
                onPress={handleCreateMember}
                disabled={isSubmittingMember}
              >
                {isSubmittingMember ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Member</Text>
                )}
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

            <Text style={styles.inputLabel}>Customer Name *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. Siddharth Joshi"
              placeholderTextColor={COLORS.textMuted}
              value={newEnquiryName}
              onChangeText={setNewEnquiryName}
            />

            <Text style={styles.inputLabel}>Contact Phone *</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. 9988766554"
              placeholderTextColor={COLORS.textMuted}
              value={newEnquiryPhone}
              onChangeText={setNewEnquiryPhone}
              keyboardType="phone-pad"
            />

            <Text style={styles.inputLabel}>Email Address</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="e.g. siddharth@gmail.com"
              placeholderTextColor={COLORS.textMuted}
              value={newEnquiryEmail}
              onChangeText={setNewEnquiryEmail}
              keyboardType="email-address"
            />

            <Text style={styles.inputLabel}>Enquiry Type</Text>
            <View style={styles.planSelectorRow}>
              {['Website Contact Message', 'Trial', 'Personal Training'].map((type) => (
                <TouchableOpacity
                  key={type}
                  style={[styles.planChip, newEnquiryType === type && styles.planChipActive]}
                  onPress={() => setNewEnquiryType(type)}
                >
                  <Text style={[styles.planChipText, newEnquiryType === type && styles.planChipTextActive]}>
                    {type}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.inputLabel}>Message / Request</Text>
            <TextInput
              style={[styles.modalInput, { height: 60, textAlignVertical: 'top' }]}
              multiline
              placeholder="Inquiry details or customer requirements..."
              placeholderTextColor={COLORS.textMuted}
              value={newEnquiryMsg}
              onChangeText={setNewEnquiryMsg}
            />

            <View style={styles.modalActions}>
              <TouchableOpacity 
                style={styles.modalCancelBtn} 
                onPress={() => setAddEnquiryModalVisible(false)}
                disabled={isSubmittingEnquiry}
              >
                <Text style={styles.modalCancelText}>Cancel</Text>
              </TouchableOpacity>
              <TouchableOpacity 
                style={[styles.modalSubmitBtn, isSubmittingEnquiry && { opacity: 0.7 }]} 
                onPress={handleCreateEnquiry}
                disabled={isSubmittingEnquiry}
              >
                {isSubmittingEnquiry ? (
                  <ActivityIndicator size="small" color={COLORS.white} />
                ) : (
                  <Text style={styles.modalSubmitText}>Save Enquiry</Text>
                )}
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
    backgroundColor: '#F8FAFC',
  },
  segmentedContainer: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    padding: 6,
    marginHorizontal: 14,
    marginTop: 10,
    marginBottom: 6,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 6,
  },
  segmentBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    paddingVertical: 9,
    borderRadius: 10,
  },
  segmentBtnActive: {
    backgroundColor: '#FFF7ED',
  },
  segmentText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  segmentTextActive: {
    color: COLORS.primary,
    fontWeight: '800',
  },
  scrollArea: {
    flex: 1,
  },
  content: {
    paddingHorizontal: 14,
    paddingBottom: 28,
  },
  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  enquiriesTitleBox: {
    marginTop: 6,
    marginBottom: 10,
  },
  enquiriesTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.3,
  },
  enquiriesSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    fontWeight: '500',
  },
  searchRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginVertical: 8,
  },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    height: 42,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    paddingVertical: 0,
  },
  addBtn: {
    width: 42,
    height: 42,
    borderRadius: 12,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  filtersScroll: {
    flexDirection: 'row',
    gap: 6,
    paddingBottom: 8,
    paddingTop: 2,
  },
  filterChip: {
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  filterChipActive: {
    backgroundColor: COLORS.primary,
    borderColor: COLORS.primary,
  },
  filterText: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  filterTextActive: {
    color: COLORS.white,
    fontWeight: '700',
  },
  list: {
    gap: 12,
    marginTop: 6,
  },
  emptyCardBox: {
    backgroundColor: COLORS.white,
    padding: 30,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 12,
  },
  emptyCardTitle: {
    fontSize: 15,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 10,
  },
  emptyCardText: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
  },

  // Member Card Styles (Matching Image 3)
  webMemberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  cardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  memberIdentRow: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  avatarCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitial: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.primary,
  },
  webMemberName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: -0.2,
  },
  contactSubRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginTop: 2,
  },
  contactEmailText: {
    fontSize: 11,
    color: COLORS.textMuted,
    maxWidth: 200,
  },
  contactPhoneText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.primary,
  },
  webStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
    borderWidth: 1,
  },
  statusBadgePending: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
  },
  statusBadgeActive: {
    backgroundColor: '#DCFCE7',
    borderColor: '#BBF7D0',
  },
  statusBadgeRejected: {
    backgroundColor: '#FEE2E2',
    borderColor: '#FECDD3',
  },
  statusBadgeInactive: {
    backgroundColor: '#F1F5F9',
    borderColor: '#E2E8F0',
  },
  webStatusText: {
    fontSize: 10,
    fontWeight: '700',
  },
  statusTextPending: {
    color: '#B45309',
  },
  statusTextActive: {
    color: '#15803D',
  },
  statusTextRejected: {
    color: '#B91C1C',
  },
  statusTextInactive: {
    color: '#475569',
  },
  membershipDetailsBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 10,
    padding: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#F1F5F9',
  },
  planBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  shieldPlanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  shieldPlanText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.primary,
  },
  multiPlanBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FDBA74',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
  },
  multiPlanText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#C2410C',
  },
  planHistoryContainer: {
    backgroundColor: COLORS.white,
    borderRadius: 8,
    padding: 8,
    marginTop: 8,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    gap: 4,
  },
  historyHeading: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginBottom: 2,
    textTransform: 'uppercase',
  },
  historyItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 2,
  },
  historyIndex: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMuted,
    width: 14,
  },
  historyPlanPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  historyPlanName: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyDate: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 'auto',
  },
  datesGrid: {
    marginTop: 8,
    gap: 4,
  },
  dateCol: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
  },
  dateLabelText: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  webActionsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
    paddingTop: 10,
  },
  webActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 6,
  },
  statusActionBtn: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 10,
  },
  webActionLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // Enquiry Card Styles (Matching Image 4)
  webEnquiryCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    shadowColor: '#000',
    shadowOpacity: 0.03,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
    elevation: 1,
  },
  enquiryTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    gap: 8,
  },
  webEnquiryName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  webEnquiryCode: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '600',
    marginTop: 2,
  },
  webEnquiryStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  enquiryBadgeNew: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  enquiryBadgeContacted: {
    backgroundColor: '#FEF9C3',
    borderWidth: 1,
    borderColor: '#FEF08A',
  },
  enquiryBadgeFollowUp: {
    backgroundColor: '#EFF6FF',
    borderWidth: 1,
    borderColor: '#DBEAFE',
  },
  enquiryBadgeConverted: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  enquiryBadgeClosed: {
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  webEnquiryStatusText: {
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  enquiryTextNew: { color: COLORS.primary },
  enquiryTextContacted: { color: '#A16207' },
  enquiryTextFollowUp: { color: '#2563EB' },
  enquiryTextConverted: { color: '#15803D' },
  enquiryTextClosed: { color: '#475569' },
  enquiryContactBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 8,
    padding: 8,
    marginTop: 10,
    gap: 4,
  },
  enquiryContactLine: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  enquiryContactValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  enquiryContactValueMuted: {
    fontSize: 11,
    color: COLORS.textMuted,
    maxWidth: 240,
  },
  enquiryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  enquiryTypePill: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  enquiryTypeText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  enquiryTimeBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  enquiryTimeText: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  enquiryActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    marginTop: 10,
    paddingTop: 10,
  },
  viewDetailsBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewDetailsText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.primary,
  },
  quickConvertBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  quickConvertText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#15803D',
  },

  // Modals Styling
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.55)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 12,
  },
  modalCard: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 18,
    maxHeight: '90%',
  },
  modalCardLarge: {
    width: '100%',
    backgroundColor: COLORS.white,
    borderRadius: 20,
    padding: 18,
    maxHeight: '92%',
    flexDirection: 'column',
  },
  modalScrollView: {
    maxHeight: 520,
    marginVertical: 4,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
    marginTop: 2,
  },
  modalCloseBtn: {
    padding: 4,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
  },
  profileBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFF7ED',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    marginBottom: 12,
  },
  avatarCircleHuge: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.white,
    borderWidth: 2,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarInitialHuge: {
    fontSize: 24,
    fontWeight: '800',
    color: COLORS.primary,
  },
  profileBannerName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  profileBadgesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 6,
  },
  customerTypeBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  customerTypeText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#475569',
  },
  quickContactBar: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  quickContactBtn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 8,
    borderRadius: 10,
  },
  quickContactText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  infoCardBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 12,
  },
  infoCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  infoCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    textTransform: 'uppercase',
    letterSpacing: 0.3,
  },
  countBadge: {
    marginLeft: 'auto',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#FFEDD5',
  },
  countBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  grid2Col: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
  },
  gridColItem: {
    width: '47%',
  },
  gridLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    marginBottom: 2,
  },
  gridValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  gridValueHighlight: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyCardRow: {
    backgroundColor: COLORS.white,
    padding: 10,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  historyCardRowCurrent: {
    borderColor: '#FDBA74',
    backgroundColor: '#FFFBF7',
  },
  historyCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  historyStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.primary,
  },
  historyCardMeta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  historyDateText: {
    fontSize: 10,
    color: COLORS.textMuted,
  },
  historyDurationText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  modalBottomBar: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  modalActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 16,
  },
  modalCancelBtn: {
    flex: 1,
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCancelText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textMedium,
  },
  modalSubmitBtn: {
    flex: 1,
    flexDirection: 'row',
    paddingVertical: 11,
    borderRadius: 10,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalSubmitText: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.white,
  },

  // Edit Section Styles
  editSection: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 14,
  },
  editSectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingBottom: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    marginBottom: 8,
  },
  editSectionTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.primary,
    textTransform: 'uppercase',
  },
  inputLabel: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
    marginBottom: 4,
    marginTop: 8,
  },
  modalInput: {
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    fontSize: 12,
    color: COLORS.textDark,
  },
  pillSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginVertical: 4,
  },
  smallPill: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  smallPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: COLORS.primary,
  },
  smallPillText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  smallPillTextActive: {
    color: COLORS.primary,
    fontWeight: '700',
  },
  planSelectorRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
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
    backgroundColor: '#FFF7ED',
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
  statusSelectRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 6,
  },
  statusSelectRowActive: {
    backgroundColor: '#FFF7ED',
    borderColor: COLORS.primary,
  },
  statusSelectDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 10,
  },
  statusSelectLabel: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },

  // Enquiry Detail specific
  enquiryModalTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 10,
  },
  modalEnquiryName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalEnquiryCode: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMuted,
    marginTop: 2,
  },
  enquiryDetailGrid: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 8,
  },
  detailActionPill: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 6,
    borderRadius: 8,
  },
  detailActionPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
  },
  detailLabel: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '500',
  },
  detailValue: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  messageDisplayBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  messageDisplayText: {
    fontSize: 12,
    color: COLORS.textDark,
    lineHeight: 17,
  },
  statusChipsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  enquiryStatusChip: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#F1F5F9',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  enquiryStatusChipActive: {
    backgroundColor: '#FFF7ED',
    borderColor: COLORS.primary,
  },
  enquiryStatusChipText: {
    fontSize: 10,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  enquiryStatusChipTextActive: {
    color: COLORS.primary,
  },
});
