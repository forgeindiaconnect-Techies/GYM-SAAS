import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TextInput, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const TrainerClientsScreen: React.FC = () => {
  const [search, setSearch] = useState('');

  const clients = [
    { id: '1', name: 'Naveen Kumar', goal: 'Hypertrophy & Strength', sessionsLeft: 12, adherence: '96%', currentWt: '78 kg', targetWt: '82 kg' },
    { id: '2', name: 'Priya Sharma', goal: 'Weight Loss & Tone', sessionsLeft: 8, adherence: '92%', currentWt: '68 kg', targetWt: '60 kg' },
    { id: '3', name: 'Rahul Varma', goal: 'Endurance & Core', sessionsLeft: 15, adherence: '88%', currentWt: '74 kg', targetWt: '72 kg' },
    { id: '4', name: 'Vikram Singh', goal: 'Shoulder Rehab', sessionsLeft: 6, adherence: '100%', currentWt: '85 kg', targetWt: '80 kg' },
  ];

  const filtered = clients.filter(c => c.name.toLowerCase().includes(search.toLowerCase()) || c.goal.toLowerCase().includes(search.toLowerCase()));

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.searchBox}>
        <Ionicons name="search" size={16} color={COLORS.textMuted} />
        <TextInput
          placeholder="Search assigned client or goal..."
          placeholderTextColor={COLORS.textMuted}
          value={search}
          onChangeText={setSearch}
          style={styles.searchInput}
        />
      </View>

      <View style={styles.list}>
        {filtered.map((c) => (
          <View key={c.id} style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.clientLeft}>
                <View style={styles.avatar}>
                  <Text style={styles.avatarText}>{c.name.charAt(0)}</Text>
                </View>
                <View>
                  <Text style={styles.clientName}>{c.name}</Text>
                  <Text style={styles.goalText}>{c.goal}</Text>
                </View>
              </View>
              <View style={styles.adherenceBadge}>
                <Text style={styles.adherenceText}>{c.adherence} Attendance</Text>
              </View>
            </View>

            <View style={styles.statsRow}>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Sessions Left</Text>
                <Text style={styles.statVal}>{c.sessionsLeft}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Current Wt</Text>
                <Text style={styles.statVal}>{c.currentWt}</Text>
              </View>
              <View style={styles.statBox}>
                <Text style={styles.statLabel}>Target Wt</Text>
                <Text style={[styles.statVal, { color: COLORS.emerald }]}>{c.targetWt}</Text>
              </View>
            </View>

            <View style={styles.cardFooter}>
              <TouchableOpacity style={styles.footerBtn}>
                <Ionicons name="call-outline" size={14} color={COLORS.textMedium} />
                <Text style={styles.footerBtnText}>Contact</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.footerBtnPrimary}>
                <Text style={styles.footerBtnPrimaryText}>View Plan →</Text>
              </TouchableOpacity>
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
  searchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    height: 44,
    marginBottom: 16,
  },
  searchInput: { flex: 1, marginLeft: 8, fontSize: 13, color: COLORS.textDark },
  list: { gap: 12 },
  card: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  clientLeft: { flexDirection: 'row', alignItems: 'center', gap: 10 },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarText: { fontSize: 16, fontWeight: '800', color: COLORS.primary },
  clientName: { fontSize: 14, fontWeight: '700', color: COLORS.textDark },
  goalText: { fontSize: 11, color: COLORS.primary, fontWeight: '600', marginTop: 1 },
  adherenceBadge: { backgroundColor: COLORS.emeraldLight, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 10 },
  adherenceText: { fontSize: 9, fontWeight: '700', color: COLORS.emerald },
  statsRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
    paddingVertical: 10,
    borderTopWidth: 1,
    borderBottomWidth: 1,
    borderColor: COLORS.divider,
  },
  statBox: { flex: 1, backgroundColor: COLORS.background, borderRadius: 10, padding: 8, alignItems: 'center' },
  statLabel: { fontSize: 9, color: COLORS.textMuted },
  statVal: { fontSize: 12, fontWeight: '800', color: COLORS.textDark, marginTop: 2 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  footerBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  footerBtnText: { fontSize: 11, color: COLORS.textMedium, fontWeight: '600' },
  footerBtnPrimary: {},
  footerBtnPrimaryText: { fontSize: 11, color: COLORS.primary, fontWeight: '700' },
});

