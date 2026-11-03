import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  BackHandler, 
  ActivityIndicator, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

export type ProgramSectionKey = 
  | 'none'
  | 'exercises'
  | 'videos'
  | 'workout-plans'
  | 'diet-plans'
  | 'equipments'
  | 'customer-workplan-completed';

export const TrainerProgramsScreen: React.FC<{ initialSection?: ProgramSectionKey }> = ({ initialSection = 'none' }) => {
  const [activeSection, setActiveSection] = useState<ProgramSectionKey>(initialSection);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Live state arrays
  const [exercises, setExercises] = useState<any[]>([]);
  const [videos, setVideos] = useState<any[]>([]);
  const [workoutPlans, setWorkoutPlans] = useState<any[]>([]);
  const [dietRequests, setDietRequests] = useState<any[]>([]);
  const [equipments, setEquipments] = useState<any[]>([]);
  const [completedWorkplans, setCompletedWorkplans] = useState<any[]>([]);

  const fetchSectionData = useCallback(async (section: ProgramSectionKey) => {
    if (section === 'none') return;
    try {
      setLoading(true);
      if (section === 'exercises') {
        const res = await api.get('/exercises');
        const list = res.data?.exercises || (Array.isArray(res.data) ? res.data : []);
        setExercises(list);
      } else if (section === 'videos') {
        const res = await api.get('/workout-videos');
        const list = res.data?.videos || (Array.isArray(res.data) ? res.data : []);
        setVideos(list);
      } else if (section === 'workout-plans') {
        const res = await api.get('/workout-plans/trainer');
        const list = res.data?.plans || (Array.isArray(res.data) ? res.data : []);
        setWorkoutPlans(list);
      } else if (section === 'diet-plans') {
        const res = await api.get('/trainer-plans/trainer-requests');
        const list = res.data?.requests || (Array.isArray(res.data) ? res.data : []);
        setDietRequests(list);
      } else if (section === 'equipments') {
        const res = await api.get('/equipment').catch(() => api.get('/trainer-plans/equipments/customer'));
        const list = res.data?.equipment || res.data?.equipments || (Array.isArray(res.data) ? res.data : []);
        setEquipments(list);
      } else if (section === 'customer-workplan-completed') {
        const res = await api.get('/workout-progress/trainer/clients-overview');
        const list = res.data?.recentActivity || res.data?.completed || (Array.isArray(res.data) ? res.data : []);
        setCompletedWorkplans(list);
      }
    } catch (err) {
      console.log(`[TrainerPrograms] Fetch note for ${section}:`, err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    if (initialSection && initialSection !== 'none') {
      setActiveSection(initialSection);
    }
  }, [initialSection]);

  useEffect(() => {
    if (activeSection !== 'none') {
      fetchSectionData(activeSection);
    }
  }, [activeSection, fetchSectionData]);

  // Handle hardware back button on Android
  useEffect(() => {
    if (activeSection === 'none') return;
    const backAction = () => {
      setActiveSection('none');
      return true;
    };
    const handler = BackHandler.addEventListener('hardwareBackPress', backAction);
    return () => handler.remove();
  }, [activeSection]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchSectionData(activeSection);
  };

  const programModules = [
    { 
      key: 'exercises' as ProgramSectionKey, 
      title: 'Exercise Library', 
      icon: 'barbell-outline', 
      count: exercises.length > 0 ? `${exercises.length} Exercises` : 'Library', 
      desc: 'Technique cues, target muscle groups & equipment' 
    },
    { 
      key: 'videos' as ProgramSectionKey, 
      title: 'Gym Exercise Videos', 
      icon: 'videocam-outline', 
      count: videos.length > 0 ? `${videos.length} Clips` : 'Video Clips', 
      desc: 'Instructional video walkthroughs for clients' 
    },
    { 
      key: 'workout-plans' as ProgramSectionKey, 
      title: 'Workout Plans', 
      icon: 'document-text-outline', 
      count: workoutPlans.length > 0 ? `${workoutPlans.length} Templates` : 'Plan Splits', 
      desc: 'Push-Pull-Legs, Upper/Lower & Hypertrophy splits' 
    },
    { 
      key: 'diet-plans' as ProgramSectionKey, 
      title: 'Diet Plans', 
      icon: 'nutrition-outline', 
      count: dietRequests.length > 0 ? `${dietRequests.length} Requests` : 'Meal Plans', 
      desc: 'Macro breakdown, calorie targets & meal guides' 
    },
    { 
      key: 'equipments' as ProgramSectionKey, 
      title: 'Gym Equipments', 
      icon: 'construct-outline', 
      count: equipments.length > 0 ? `${equipments.length} Units` : 'Equipment', 
      desc: 'Inventory, maintenance status & usage instructions' 
    },
    { 
      key: 'customer-workplan-completed' as ProgramSectionKey, 
      title: 'Customer Workplan Completed', 
      icon: 'checkmark-done-circle-outline', 
      count: completedWorkplans.length > 0 ? `${completedWorkplans.length} Completed` : 'Logs', 
      desc: 'Review completed member splits & compliance sign-offs' 
    },
  ];

  /* ----------------- SUB-VIEWS ----------------- */

  // 1. Exercise Library
  const renderExercises = () => {
    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading exercises...</Text>
          </View>
        ) : exercises.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="barbell-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Exercises Found</Text>
            <Text style={styles.emptySub}>The gym exercise catalog is currently being updated.</Text>
          </View>
        ) : (
          <View style={styles.subList}>
            {exercises.map((ex, i) => (
              <View key={ex._id || ex.id || i} style={styles.subCard}>
                <View style={styles.subCardHeader}>
                  <Text style={styles.subCardTitle}>{ex.name || ex.title}</Text>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillBadgeText}>{ex.difficulty || ex.level || 'General'}</Text>
                  </View>
                </View>
                <Text style={styles.subCardSub}>
                  Target: <Text style={styles.boldDark}>{ex.muscleGroup || ex.targetMuscle || 'Full Body'}</Text>
                </Text>
                <Text style={styles.subCardMeta}>Equipment: {ex.equipment || ex.category || 'Standard Gym'}</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // 2. Gym Exercise Videos
  const renderVideos = () => {
    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading video clips...</Text>
          </View>
        ) : videos.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="videocam-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Video Clips Available</Text>
            <Text style={styles.emptySub}>Exercise video demonstrations uploaded by coaches will appear here.</Text>
          </View>
        ) : (
          <View style={styles.subList}>
            {videos.map((v, i) => (
              <View key={v._id || v.id || i} style={styles.subCard}>
                <View style={styles.videoHeader}>
                  <View style={styles.videoPlayBadge}>
                    <Ionicons name="play" size={14} color={COLORS.white} />
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.subCardTitle}>{v.title || v.name}</Text>
                    <Text style={styles.subCardMeta}>
                      {v.coachName || v.category || 'Trainer Demo'} • {v.duration || 'Video'}
                    </Text>
                  </View>
                </View>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // 3. Workout Plans
  const renderWorkoutPlans = () => {
    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading workout plans...</Text>
          </View>
        ) : workoutPlans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="document-text-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Workout Plans Configured</Text>
            <Text style={styles.emptySub}>Workout split templates assigned to clients will be listed here.</Text>
          </View>
        ) : (
          <View style={styles.subList}>
            {workoutPlans.map((p, i) => (
              <View key={p._id || p.id || i} style={styles.subCard}>
                <View style={styles.subCardHeader}>
                  <Text style={styles.subCardTitle}>{p.name || p.title || 'Workout Split'}</Text>
                  <View style={styles.pillBadgePrimary}>
                    <Text style={styles.pillBadgePrimaryText}>{p.assignedCount ? `${p.assignedCount} Clients` : 'Active Plan'}</Text>
                  </View>
                </View>
                <Text style={styles.subCardSub}>
                  Frequency: {p.frequency || `${p.days?.length || 4} Days / wk`} • Level: {p.level || 'All Levels'}
                </Text>
                <TouchableOpacity 
                  style={styles.actionRowBtn}
                  onPress={() => Alert.alert('Plan Details', `${p.name || 'Plan'}\nDescription: ${p.description || 'Custom tailored workout plan'}`)}
                >
                  <Text style={styles.actionRowBtnText}>View Plan Split →</Text>
                </TouchableOpacity>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // 4. Diet Plans
  const renderDietPlans = () => {
    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading meal plans...</Text>
          </View>
        ) : dietRequests.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="nutrition-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Diet Plan Requests</Text>
            <Text style={styles.emptySub}>Client nutrition requests and meal templates will display here.</Text>
          </View>
        ) : (
          <View style={styles.subList}>
            {dietRequests.map((d, i) => (
              <View key={d._id || d.id || i} style={styles.subCard}>
                <View style={styles.subCardHeader}>
                  <Text style={styles.subCardTitle}>{d.customerId?.name || d.name || 'Nutrition Guidance'}</Text>
                  <View style={styles.pillBadge}>
                    <Text style={styles.pillBadgeText}>{d.status || 'Active'}</Text>
                  </View>
                </View>
                <Text style={styles.subCardSub}>
                  Goal: <Text style={styles.boldDark}>{d.fitnessGoal || d.goal || 'General Health'}</Text>
                </Text>
                {d.notes && <Text style={styles.subCardMeta}>Notes: {d.notes}</Text>}
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // 5. Gym Equipments
  const renderEquipments = () => {
    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading equipment list...</Text>
          </View>
        ) : equipments.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="construct-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Equipment Registered</Text>
            <Text style={styles.emptySub}>Gym equipment records and maintenance logs will appear here.</Text>
          </View>
        ) : (
          <View style={styles.subList}>
            {equipments.map((eq, i) => (
              <View key={eq._id || eq.id || i} style={styles.subCard}>
                <View style={styles.subCardHeader}>
                  <Text style={styles.subCardTitle}>{eq.name || eq.equipmentName}</Text>
                  <View style={styles.statusOptimalBadge}>
                    <Text style={styles.statusOptimalText}>{eq.status || 'Operational'}</Text>
                  </View>
                </View>
                <Text style={styles.subCardSub}>Location: {eq.zone || eq.location || 'Main Floor'}</Text>
                <Text style={styles.subCardMeta}>Count: {eq.quantity || eq.count || 1} Units</Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  // 6. Customer Workplan Completed
  const renderCompletedWorkplans = () => {
    return (
      <ScrollView 
        style={styles.subScroll} 
        contentContainerStyle={styles.subScrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
      >
        {loading && !refreshing ? (
          <View style={{ paddingVertical: 40, alignItems: 'center' }}>
            <ActivityIndicator size="small" color={COLORS.primary} />
            <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading completed exercises...</Text>
          </View>
        ) : completedWorkplans.length === 0 ? (
          <View style={styles.emptyCard}>
            <Ionicons name="checkmark-done-circle-outline" size={36} color={COLORS.textMuted} />
            <Text style={styles.emptyTitle}>No Completed Routines Logged</Text>
            <Text style={styles.emptySub}>When assigned clients log completed sets or workouts, they show here.</Text>
          </View>
        ) : (
          <View style={styles.subList}>
            {completedWorkplans.map((w, i) => (
              <View key={w._id || w.id || i} style={styles.subCard}>
                <View style={styles.subCardHeader}>
                  <Text style={styles.subCardTitle}>{w.customerName || w.user?.name || 'Client Routine'}</Text>
                  <View style={styles.statusOptimalBadge}>
                    <Text style={styles.statusOptimalText}>Completed</Text>
                  </View>
                </View>
                <Text style={styles.subCardSub}>
                  Exercise: <Text style={styles.boldDark}>{w.exerciseName || w.split || 'Training Session'}</Text>
                </Text>
                <Text style={styles.subCardMeta}>
                  {w.sets ? `${w.sets} Sets` : ''} {w.reps ? `× ${w.reps} Reps` : ''} {w.weight ? `(${w.weight} kg)` : ''}
                </Text>
              </View>
            ))}
          </View>
        )}
      </ScrollView>
    );
  };

  /* ----------------- RENDER ----------------- */

  if (activeSection !== 'none') {
    const activeMod = programModules.find(m => m.key === activeSection);
    return (
      <View style={styles.subContainer}>
        {/* Sub Header */}
        <View style={styles.subNavHeader}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => setActiveSection('none')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
            <Text style={styles.backBtnText}>Programs</Text>
          </TouchableOpacity>
          <Text style={styles.subNavTitle} numberOfLines={1}>{activeMod?.title}</Text>
          <View style={{ width: 60 }} />
        </View>

        {activeSection === 'exercises' && renderExercises()}
        {activeSection === 'videos' && renderVideos()}
        {activeSection === 'workout-plans' && renderWorkoutPlans()}
        {activeSection === 'diet-plans' && renderDietPlans()}
        {activeSection === 'equipments' && renderEquipments()}
        {activeSection === 'customer-workplan-completed' && renderCompletedWorkplans()}
      </View>
    );
  }

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      <View style={styles.introCard}>
        <Text style={styles.introTitle}>Coaching Programs & Assets</Text>
        <Text style={styles.introSub}>
          Access exercise technique manuals, gym video guides, client workout templates and compliance sign-offs.
        </Text>
      </View>

      <View style={styles.moduleGrid}>
        {programModules.map((m) => (
          <TouchableOpacity
            key={m.key}
            style={styles.moduleCard}
            onPress={() => setActiveSection(m.key)}
            activeOpacity={0.7}
          >
            <View style={styles.moduleTop}>
              <View style={styles.iconCircle}>
                <Ionicons name={m.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={styles.moduleCountBadge}>
                <Text style={styles.moduleCountText}>{m.count}</Text>
              </View>
            </View>

            <Text style={styles.moduleTitle}>{m.title}</Text>
            <Text style={styles.moduleDesc}>{m.desc}</Text>

            <View style={styles.moduleFooter}>
              <Text style={styles.openText}>Open Module →</Text>
            </View>
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 14, paddingBottom: 110 },
  introCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 14,
  },
  introTitle: { fontSize: 16, fontWeight: '800', color: COLORS.textDark },
  introSub: { fontSize: 11, color: COLORS.textMuted, marginTop: 4, lineHeight: 16 },
  moduleGrid: { gap: 10 },
  moduleCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  moduleTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  iconCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  moduleCountBadge: {
    backgroundColor: COLORS.background,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  moduleCountText: { fontSize: 10, fontWeight: '700', color: COLORS.textMedium },
  moduleTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, marginTop: 10 },
  moduleDesc: { fontSize: 11, color: COLORS.textMuted, marginTop: 2, lineHeight: 15 },
  moduleFooter: { marginTop: 10, paddingTop: 8, borderTopWidth: 1, borderTopColor: COLORS.divider },
  openText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  subContainer: { flex: 1, backgroundColor: COLORS.background },
  subNavHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 6, width: 80 },
  backBtnText: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  subNavTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, flex: 1, textAlign: 'center' },
  subScroll: { flex: 1 },
  subScrollContent: { padding: 14, paddingBottom: 110 },
  subList: { gap: 10 },
  subCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  subCardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  subCardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, flex: 1, marginRight: 8 },
  pillBadge: { backgroundColor: COLORS.background, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  pillBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.textMedium },
  pillBadgePrimary: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  pillBadgePrimaryText: { fontSize: 9, fontWeight: '700', color: COLORS.primaryDark },
  subCardSub: { fontSize: 11, color: COLORS.textMedium, marginTop: 4 },
  boldDark: { fontWeight: '700', color: COLORS.textDark },
  subCardMeta: { fontSize: 10, color: COLORS.textMuted, marginTop: 2 },
  actionRowBtn: { marginTop: 8, paddingTop: 6, borderTopWidth: 1, borderTopColor: COLORS.divider },
  actionRowBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  videoHeader: { flexDirection: 'row', alignItems: 'center' },
  videoPlayBadge: {
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusOptimalBadge: { backgroundColor: COLORS.emeraldLight, paddingHorizontal: 7, paddingVertical: 3, borderRadius: 6 },
  statusOptimalText: { fontSize: 9, fontWeight: '700', color: COLORS.emerald },
  emptyCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 30,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginTop: 10,
  },
  emptyTitle: { fontSize: 14, fontWeight: '700', color: COLORS.textDark, marginTop: 10 },
  emptySub: { fontSize: 11, color: COLORS.textMuted, textAlign: 'center', marginTop: 4, lineHeight: 16 },
});
