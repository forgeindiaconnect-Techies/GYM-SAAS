import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const CustomerProgressTrackingScreen: React.FC = () => {
  const metrics = [
    { label: 'Current Weight', val: '74.2 kg', change: '-3.8 kg', positive: true, icon: 'speedometer-outline' },
    { label: 'Body Fat %', val: '15.4%', change: '-2.6%', positive: true, icon: 'analytics-outline' },
    { label: 'Muscle Mass', val: '36.1 kg', change: '+1.8 kg', positive: true, icon: 'barbell-outline' },
    { label: 'BMI Index', val: '22.8', change: 'Normal', positive: true, icon: 'fitness-outline' },
  ];

  const bodyCircumferences = [
    { part: 'Chest', current: '40.5 in', diff: '+1.5 in' },
    { part: 'Arms / Biceps', current: '15.2 in', diff: '+0.8 in' },
    { part: 'Waist', current: '31.8 in', diff: '-2.2 in' },
    { part: 'Thighs', current: '23.4 in', diff: '+1.0 in' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Overview Cards */}
      <View style={styles.metricsGrid}>
        {metrics.map((m, idx) => (
          <View key={idx} style={styles.metricCard}>
            <View style={styles.metricHeader}>
              <Text style={styles.metricLabel}>{m.label}</Text>
              <Ionicons name={m.icon as any} size={15} color={COLORS.primary} />
            </View>
            <Text style={styles.metricVal}>{m.val}</Text>
            <View style={styles.changeRow}>
              <Ionicons name="trending-up-outline" size={11} color={COLORS.emerald} />
              <Text style={styles.changeText}>{m.change} overall</Text>
            </View>
          </View>
        ))}
      </View>

      {/* Body Circumference Measurements */}
      <Text style={styles.sectionTitle}>Body Tape Measurements</Text>
      <View style={styles.measureCard}>
        {bodyCircumferences.map((c, idx) => (
          <View key={idx} style={[styles.measureRow, idx < bodyCircumferences.length - 1 && styles.borderBottom]}>
            <Text style={styles.partText}>{c.part}</Text>
            <View style={styles.measureRight}>
              <Text style={styles.partVal}>{c.current}</Text>
              <View style={styles.diffBadge}>
                <Text style={styles.diffText}>{c.diff}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>

      {/* Monthly Check-in Recommendation */}
      <View style={styles.coachReviewBanner}>
        <Ionicons name="sparkles" size={18} color={COLORS.primary} />
        <View style={styles.reviewBannerInfo}>
          <Text style={styles.reviewBannerTitle}>Next InBody Scan Scheduled</Text>
          <Text style={styles.reviewBannerSub}>Saturday, 08 Nov at Front Desk Lounge</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 36 },
  metricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricCard: {
    width: '48%',
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  metricHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  metricLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  metricVal: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginBottom: 4 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeText: { fontSize: 10, fontWeight: '700', color: COLORS.emerald },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  measureCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 14,
    marginBottom: 16,
  },
  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
  },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.cardBorder },
  partText: { fontSize: 13, fontWeight: '600', color: COLORS.textDark },
  measureRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partVal: { fontSize: 13, fontWeight: '800', color: COLORS.textDark },
  diffBadge: {
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  diffText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  coachReviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    padding: 14,
    borderRadius: 16,
  },
  reviewBannerInfo: { flex: 1 },
  reviewBannerTitle: { fontSize: 12, fontWeight: '800', color: COLORS.primaryDark },
  reviewBannerSub: { fontSize: 10, color: COLORS.textMedium, marginTop: 1 },
});

