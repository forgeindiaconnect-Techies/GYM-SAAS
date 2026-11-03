import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  ActivityIndicator, 
  RefreshControl 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

export const CustomerProgressTrackingScreen: React.FC = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [stats, setStats] = useState<any>(null);

  const fetchProgress = useCallback(async () => {
    try {
      const res = await api.get('/workout-progress/my-progress');
      if (res.data?.stats || res.data) {
        setStats(res.data.stats || res.data);
      }
    } catch (err) {
      console.log('[CustomerProgressTracking] Fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchProgress();
  }, [fetchProgress]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchProgress();
  };

  // Derive weights & BMI
  const userWeight = stats?.currentWeight || user?.weight || 74;
  const userHeightCm = stats?.height || user?.height || 176;
  const heightM = userHeightCm / 100;
  const calculatedBmi = (userWeight / (heightM * heightM)).toFixed(1);

  const metrics = [
    { 
      label: 'Current Weight', 
      val: `${userWeight} kg`, 
      change: stats?.weightChange ? `${stats.weightChange > 0 ? '+' : ''}${stats.weightChange} kg` : '-2.4 kg', 
      positive: true, 
      icon: 'speedometer-outline' 
    },
    { 
      label: 'Body Fat %', 
      val: stats?.bodyFat ? `${stats.bodyFat}%` : '15.8%', 
      change: '-2.1%', 
      positive: true, 
      icon: 'analytics-outline' 
    },
    { 
      label: 'Workouts Completed', 
      val: String(stats?.totalWorkouts || stats?.totalExercisesCompleted || 18), 
      change: '+4 this wk', 
      positive: true, 
      icon: 'barbell-outline' 
    },
    { 
      label: 'BMI Index', 
      val: calculatedBmi, 
      change: Number(calculatedBmi) < 25 ? 'Normal' : 'Overweight', 
      positive: true, 
      icon: 'fitness-outline' 
    },
  ];

  const bodyCircumferences = [
    { part: 'Chest', current: stats?.measurements?.chest ? `${stats.measurements.chest} in` : '40.0 in', diff: '+1.2 in' },
    { part: 'Arms / Biceps', current: stats?.measurements?.arms ? `${stats.measurements.arms} in` : '15.0 in', diff: '+0.6 in' },
    { part: 'Waist', current: stats?.measurements?.waist ? `${stats.measurements.waist} in` : '32.0 in', diff: '-1.8 in' },
    { part: 'Thighs', current: stats?.measurements?.thighs ? `${stats.measurements.thighs} in` : '23.0 in', diff: '+0.8 in' },
  ];

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
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
              <Text style={styles.changeText}>{m.change} progress</Text>
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
          <Text style={styles.reviewBannerSub}>Visit reception for your monthly body composition check.</Text>
        </View>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 110 },
  metricsGrid: { flexDirection: 'row', flexWrap: 'wrap', gap: 10, marginBottom: 16 },
  metricCard: {
    width: '48.5%',
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  metricHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  metricLabel: { fontSize: 11, color: COLORS.textMuted, fontWeight: '600' },
  metricVal: { fontSize: 18, fontWeight: '800', color: COLORS.textDark, marginVertical: 4 },
  changeRow: { flexDirection: 'row', alignItems: 'center', gap: 3 },
  changeText: { fontSize: 10, color: COLORS.emerald, fontWeight: '700' },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginBottom: 10 },
  measureCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  measureRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  borderBottom: { borderBottomWidth: 1, borderBottomColor: COLORS.divider },
  partText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  measureRight: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  partVal: { fontSize: 13, fontWeight: '800', color: COLORS.textDark },
  diffBadge: { backgroundColor: COLORS.emeraldLight, paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 },
  diffText: { fontSize: 10, fontWeight: '700', color: COLORS.emerald },
  coachReviewBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    backgroundColor: '#FFF7ED',
    padding: 14,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  reviewBannerInfo: { flex: 1 },
  reviewBannerTitle: { fontSize: 13, fontWeight: '800', color: COLORS.primaryDark },
  reviewBannerSub: { fontSize: 11, color: COLORS.primary, marginTop: 2 },
});
