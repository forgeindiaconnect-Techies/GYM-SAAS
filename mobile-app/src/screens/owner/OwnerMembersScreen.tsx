import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const OwnerMembersScreen: React.FC = () => {
  const [search, setSearch] = useState('');
  const [filter, setFilter] = useState<'All' | 'Active' | 'Expiring' | 'Expired'>('All');

  const members = [
    { id: '1', name: 'Naveen Kumar', phone: '+91 98765 43210', plan: 'Gold Annual', validUntil: '14 Jan 2027', status: 'Active' },
    { id: '2', name: 'Priya Sharma', phone: '+91 98451 11223', plan: 'Silver Quarterly', validUntil: '05 Nov 2026', status: 'Expiring' },
    { id: '3', name: 'Rahul Varma', phone: '+91 99001 23456', plan: 'Platinum VIP', validUntil: '10 Mar 2027', status: 'Active' },
    { id: '4', name: 'Sneha Patel', phone: '+91 98888 77766', plan: 'Monthly Pass', validUntil: '31 Oct 2026', status: 'Expired' },
    { id: '5', name: 'Vikram Singh', phone: '+91 97777 55544', plan: 'Gold Annual', validUntil: '11 Apr 2027', status: 'Active' },
  ];

  const filtered = members.filter((m) => {
    const matchSearch = m.name.toLowerCase().includes(search.toLowerCase()) || m.phone.includes(search);
    const matchFilter = filter === 'All' || m.status === filter;
    return matchSearch && matchFilter;
  });

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Top Search & Add */}
      <View style={styles.searchRow}>
        <View style={styles.searchBox}>
          <Ionicons name="search" size={16} color={COLORS.textMuted} />
          <TextInput
            placeholder="Search member name or mobile..."
            placeholderTextColor={COLORS.textMuted}
            value={search}
            onChangeText={setSearch}
            style={styles.searchInput}
          />
        </View>
        <TouchableOpacity style={styles.addBtn} activeOpacity={0.8}>
          <Ionicons name="add" size={20} color={COLORS.white} />
        </TouchableOpacity>
      </View>

      {/* Filter Tabs */}
      <View style={styles.filtersRow}>
        {(['All', 'Active', 'Expiring', 'Expired'] as const).map((tab) => {
          const isActive = filter === tab;
          return (
            <TouchableOpacity
              key={tab}
              style={[styles.filterChip, isActive && styles.filterChipActive]}
              onPress={() => setFilter(tab)}
            >
              <Text style={[styles.filterText, isActive && styles.filterTextActive]}>{tab}</Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* Member Cards */}
      <View style={styles.list}>
        {filtered.map((m) => (
          <View key={m.id} style={styles.memberCard}>
            <View style={styles.cardHeader}>
              <View style={styles.memberLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{m.name.charAt(0)}</Text>
                </View>
                <View>
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
              <Text style={styles.expiryText}>Valid until: {m.validUntil}</Text>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  searchRow: { flexDirection: 'row', gap: 10, marginBottom: 12 },
  searchBox: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    height: 44,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: COLORS.textDark },
  addBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 3,
  },
  filtersRow: { flexDirection: 'row', gap: 8, marginBottom: 16 },
  filterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  filterChipActive: { backgroundColor: COLORS.primary, borderColor: COLORS.primary },
  filterText: { fontSize: 11, fontWeight: '700', color: COLORS.textMedium },
  filterTextActive: { color: COLORS.white },
  list: { gap: 10 },
  memberCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  memberLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 15, fontWeight: '800', color: COLORS.primary },
  memberName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  memberPhone: { fontSize: 11, color: COLORS.textMuted, marginTop: 1 },
  statusBadge: { paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  statusBadgeText: { fontSize: 9, fontWeight: '700' },
  bgActive: { backgroundColor: COLORS.emeraldLight },
  textActive: { color: COLORS.emerald },
  bgExpiring: { backgroundColor: COLORS.amberLight },
  textExpiring: { color: COLORS.amber },
  bgExpired: { backgroundColor: COLORS.roseLight },
  textExpired: { color: COLORS.rose },
  cardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  planBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  planText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  expiryText: { fontSize: 10, color: COLORS.textMuted },
});

