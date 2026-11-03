import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, BackHandler, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

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

  const programModules = [
    { key: 'exercises' as ProgramSectionKey, title: 'Exercise Library', icon: 'barbell-outline', count: '140+ Exercises', desc: 'Technique cues, target muscle groups & equipment' },
    { key: 'videos' as ProgramSectionKey, title: 'Gym Exercise Videos', icon: 'videocam-outline', count: '48 Clips', desc: 'Instructional video walkthroughs for clients' },
    { key: 'workout-plans' as ProgramSectionKey, title: 'Workout Plans', icon: 'document-text-outline', count: '12 Templates', desc: 'Push-Pull-Legs, Upper/Lower & Hypertrophy splits' },
    { key: 'diet-plans' as ProgramSectionKey, title: 'Diet Plans', icon: 'nutrition-outline', count: '8 Templates', desc: 'Macro breakdown, calorie targets & meal guides' },
    { key: 'equipments' as ProgramSectionKey, title: 'Gym Equipments', icon: 'construct-outline', count: '28 Machines', desc: 'Inventory, maintenance status & usage instructions' },
    { key: 'customer-workplan-completed' as ProgramSectionKey, title: 'Customer Workplan Completed', icon: 'checkmark-done-circle-outline', count: '16 Completed', desc: 'Review completed member splits & compliance sign-offs' },
  ];

  /* ----------------- SUB-VIEWS ----------------- */

  // 1. Exercise Library
  const renderExercises = () => {
    const exercises = [
      { name: 'Barbell Flat Bench Press', muscle: 'Chest & Triceps', equip: 'Olympic Barbell', diff: 'Intermediate' },
      { name: 'Barbell Back Squat', muscle: 'Quads & Glutes', equip: 'Squat Rack', diff: 'Intermediate' },
      { name: 'Conventional Deadlift', muscle: 'Posterior Chain', equip: 'Olympic Barbell', diff: 'Advanced' },
      { name: 'Incline Dumbbell Press', muscle: 'Upper Chest', equip: 'Dumbbells', diff: 'Beginner' },
      { name: 'Cable Lat Pulldown', muscle: 'Lats & Biceps', equip: 'Cable Tower', diff: 'Beginner' },
      { name: 'Romanian Deadlift (RDL)', muscle: 'Hamstrings', equip: 'Barbell / Dumbbells', diff: 'Intermediate' },
    ];

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.subList}>
          {exercises.map((ex, i) => (
            <View key={i} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>{ex.name}</Text>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>{ex.diff}</Text>
                </View>
              </View>
              <Text style={styles.subCardSub}>Target: <Text style={styles.boldDark}>{ex.muscle}</Text></Text>
              <Text style={styles.subCardMeta}>Equipment: {ex.equip}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // 2. Gym Exercise Videos
  const renderVideos = () => {
    const videos = [
      { title: 'Bench Press Arch & Leg Drive Tutorial', duration: '4:15 min', coach: 'Coach Vikram', views: '280 views' },
      { title: 'Squat Depth & Hip Hinge Masterclass', duration: '5:40 min', coach: 'Coach Vikram', views: '340 views' },
      { title: 'Deadlift Setup: Avoid Lower Back Rounding', duration: '6:10 min', coach: 'Coach Vikram', views: '410 views' },
      { title: 'Strict Overhead Press Shoulder Mobility', duration: '3:50 min', coach: 'Coach Vikram', views: '190 views' },
    ];

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.subList}>
          {videos.map((v, i) => (
            <View key={i} style={styles.subCard}>
              <View style={styles.videoHeader}>
                <View style={styles.videoPlayBadge}>
                  <Ionicons name="play" size={14} color={COLORS.white} />
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.subCardTitle}>{v.title}</Text>
                  <Text style={styles.subCardMeta}>{v.coach} • {v.duration} • {v.views}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // 3. Workout Plans
  const renderWorkoutPlans = () => {
    const plans = [
      { name: '8-Week Hypertrophy Overload', days: '5 Days / week', level: 'Intermediate', assigned: '6 Clients' },
      { name: '4-Week Rapid Fat Loss HIIT Split', days: '4 Days / week', level: 'All Levels', assigned: '4 Clients' },
      { name: 'Push-Pull-Legs Classic Foundation', days: '6 Days / week', level: 'Advanced', assigned: '5 Clients' },
      { name: 'Upper/Lower Strength Rebuild', days: '4 Days / week', level: 'Beginner', assigned: '3 Clients' },
    ];

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.subList}>
          {plans.map((p, i) => (
            <View key={i} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>{p.name}</Text>
                <View style={styles.pillBadgePrimary}>
                  <Text style={styles.pillBadgePrimaryText}>{p.assigned}</Text>
                </View>
              </View>
              <Text style={styles.subCardSub}>Frequency: {p.days} • Level: {p.level}</Text>
              <TouchableOpacity style={styles.actionRowBtn}>
                <Text style={styles.actionRowBtnText}>Assign Split to Client →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // 4. Diet Plans
  const renderDietPlans = () => {
    const diets = [
      { name: 'High Protein Lean Bulk (2,600 kcal)', macros: 'P: 180g | C: 260g | F: 70g', goal: 'Muscle Gain' },
      { name: 'Targeted Caloric Deficit (1,800 kcal)', macros: 'P: 160g | C: 140g | F: 50g', goal: 'Fat Loss' },
      { name: 'Vegetarian High Protein Plan (2,200 kcal)', macros: 'P: 140g | C: 240g | F: 60g', goal: 'Tone & Health' },
    ];

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.subList}>
          {diets.map((d, i) => (
            <View key={i} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>{d.name}</Text>
                <View style={styles.pillBadge}>
                  <Text style={styles.pillBadgeText}>{d.goal}</Text>
                </View>
              </View>
              <Text style={styles.subCardSub}>Macros: <Text style={styles.boldDark}>{d.macros}</Text></Text>
              <TouchableOpacity style={styles.actionRowBtn}>
                <Text style={styles.actionRowBtnText}>Send Meal Schedule →</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // 5. Gym Equipments
  const renderEquipments = () => {
    const equipments = [
      { name: 'Eleiko Olympic Powerlifting Barbell (20kg)', count: '6 Available', location: 'Platform 1-4', status: 'Optimal' },
      { name: 'Hammer Strength Iso-Lateral Chest Press', count: '2 Machines', location: 'Zone B', status: 'Optimal' },
      { name: 'Dual Adjustable Cable Pulley Station', count: '3 Units', location: 'Zone C', status: 'Optimal' },
      { name: 'Watson Dumbbell Rack (2.5kg - 50kg)', count: 'Full Set', location: 'Free Weights', status: 'Optimal' },
    ];

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.subList}>
          {equipments.map((eq, i) => (
            <View key={i} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <Text style={styles.subCardTitle}>{eq.name}</Text>
                <View style={styles.statusOptimalBadge}>
                  <Text style={styles.statusOptimalText}>{eq.status}</Text>
                </View>
              </View>
              <Text style={styles.subCardSub}>Location: {eq.location} • {eq.count}</Text>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  // 6. Customer Workplan Completed
  const renderCustomerWorkplanCompleted = () => {
    const completedWorkplans = [
      { client: 'Naveen Kumar', plan: 'Push Day (Chest, Shoulders, Triceps)', date: 'Today, 09:55 AM', compliance: '100% (6 of 6 sets hit)', feedback: 'Felt strong on incline dumbbell press. Increased reps to 12.' },
      { client: 'Priya Sharma', plan: 'HIIT Core & Glute Activation', date: 'Yesterday, 12:20 PM', compliance: '92% (5 of 6 sets)', feedback: 'Skipped last plank set due to wrist fatigue.' },
      { client: 'Rahul Varma', plan: 'Back & Biceps Pull Hypertrophy', date: '01 Nov, 04:50 PM', compliance: '100% (7 of 7 sets)', feedback: 'Heavy deadlifts hit target 140kg x 5 reps cleanly.' },
    ];

    return (
      <ScrollView style={styles.subScroll} contentContainerStyle={styles.subScrollContent}>
        <View style={styles.subList}>
          {completedWorkplans.map((wp, i) => (
            <View key={i} style={styles.subCard}>
              <View style={styles.subCardHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.subCardTitle}>{wp.client}</Text>
                  <Text style={styles.subCardSub}>{wp.plan}</Text>
                </View>
                <View style={styles.statusDoneBadge}>
                  <Ionicons name="checkmark-circle" size={13} color={COLORS.emerald} />
                  <Text style={styles.statusDoneText}>Verified</Text>
                </View>
              </View>

              <View style={styles.metaBox}>
                <Text style={styles.metaBoxText}>Completed: {wp.date}</Text>
                <Text style={styles.metaBoxText}>Compliance: <Text style={styles.boldDark}>{wp.compliance}</Text></Text>
                <Text style={[styles.metaBoxText, { marginTop: 4, fontStyle: 'italic' }]}>"{wp.feedback}"</Text>
              </View>

              <TouchableOpacity style={styles.signOffBtn}>
                <Ionicons name="shield-checkmark" size={14} color={COLORS.primaryDark} />
                <Text style={styles.signOffBtnText}>Coach Sign-Off Completed ✓</Text>
              </TouchableOpacity>
            </View>
          ))}
        </View>
      </ScrollView>
    );
  };

  /* ----------------- MAIN PROGRAMS MENU ----------------- */

  if (activeSection !== 'none') {
    const activeModule = programModules.find(m => m.key === activeSection);
    return (
      <View style={styles.container}>
        <View style={styles.subHeader}>
          <TouchableOpacity 
            style={styles.backBtn}
            onPress={() => setActiveSection('none')}
            activeOpacity={0.7}
          >
            <Ionicons name="arrow-back" size={20} color={COLORS.textDark} />
            <Text style={styles.backBtnText}>Programs</Text>
          </TouchableOpacity>
          <Text style={styles.subHeaderTitle} numberOfLines={1}>{activeModule?.title}</Text>
        </View>

        {activeSection === 'exercises' && renderExercises()}
        {activeSection === 'videos' && renderVideos()}
        {activeSection === 'workout-plans' && renderWorkoutPlans()}
        {activeSection === 'diet-plans' && renderDietPlans()}
        {activeSection === 'equipments' && renderEquipments()}
        {activeSection === 'customer-workplan-completed' && renderCustomerWorkplanCompleted()}
      </View>
    );
  }

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.menuContent}
      showsVerticalScrollIndicator={true}
    >
      <View style={styles.banner}>
        <Text style={styles.bannerTitle}>Training Programs & Resources</Text>
        <Text style={styles.bannerSub}>Curate workout plans, video libraries, and verify client routines</Text>
      </View>

      <View style={styles.menuList}>
        {programModules.map((item) => (
          <TouchableOpacity
            key={item.key}
            style={styles.menuItem}
            onPress={() => setActiveSection(item.key)}
            activeOpacity={0.7}
          >
            <View style={styles.menuItemLeft}>
              <View style={styles.iconBox}>
                <Ionicons name={item.icon as any} size={20} color={COLORS.primary} />
              </View>
              <View style={{ flex: 1 }}>
                <View style={styles.titleRow}>
                  <Text style={styles.itemTitle}>{item.title}</Text>
                  <Text style={styles.itemCountBadge}>{item.count}</Text>
                </View>
                <Text style={styles.itemDesc}>{item.desc}</Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={16} color={COLORS.textMuted} />
          </TouchableOpacity>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  menuContent: { padding: 14, paddingBottom: 100 },
  banner: {
    backgroundColor: COLORS.primaryDark,
    borderRadius: 18,
    padding: 16,
    marginBottom: 14,
  },
  bannerTitle: { fontSize: 16, fontWeight: '800', color: COLORS.white },
  bannerSub: { fontSize: 11, color: COLORS.primaryLight, marginTop: 4 },
  menuList: { gap: 10 },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.white,
    padding: 14,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  menuItemLeft: { flexDirection: 'row', alignItems: 'center', gap: 12, flex: 1 },
  iconBox: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.primaryLight,
    alignItems: 'center',
    justifyContent: 'center',
  },
  titleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  itemTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark },
  itemCountBadge: {
    fontSize: 9,
    fontWeight: '700',
    color: COLORS.primaryDark,
    backgroundColor: COLORS.primaryLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
  },
  itemDesc: { fontSize: 10, color: COLORS.textMuted, marginTop: 3 },
  subHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.white,
    paddingHorizontal: 14,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 10,
  },
  backBtn: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  backBtnText: { fontSize: 12, fontWeight: '700', color: COLORS.primaryDark },
  subHeaderTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark, flex: 1, textAlign: 'right' },
  subScroll: { flex: 1 },
  subScrollContent: { padding: 14, paddingBottom: 100 },
  subList: { gap: 10 },
  subCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  subCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 6,
  },
  subCardTitle: { fontSize: 13, fontWeight: '800', color: COLORS.textDark, flex: 1 },
  subCardSub: { fontSize: 11, color: COLORS.textMedium, marginTop: 2 },
  subCardMeta: { fontSize: 10, color: COLORS.textMuted, marginTop: 3 },
  boldDark: { fontWeight: '700', color: COLORS.textDark },
  pillBadge: {
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillBadgeText: { fontSize: 9, fontWeight: '700', color: COLORS.textMedium },
  pillBadgePrimary: {
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 8,
  },
  pillBadgePrimaryText: { fontSize: 9, fontWeight: '700', color: COLORS.primaryDark },
  videoHeader: { flexDirection: 'row', alignItems: 'center' },
  videoPlayBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: COLORS.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  actionRowBtn: {
    marginTop: 10,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
  },
  actionRowBtnText: { fontSize: 11, fontWeight: '700', color: COLORS.primaryDark },
  statusOptimalBadge: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusOptimalText: { fontSize: 9, fontWeight: '700', color: COLORS.emerald },
  statusDoneBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statusDoneText: { fontSize: 9, fontWeight: '700', color: COLORS.emerald },
  metaBox: {
    backgroundColor: COLORS.background,
    padding: 10,
    borderRadius: 10,
    marginTop: 8,
    gap: 2,
  },
  metaBoxText: { fontSize: 10, color: COLORS.textDark },
  signOffBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: COLORS.primaryLight,
    borderWidth: 1,
    borderColor: COLORS.primaryBorder,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
    marginTop: 10,
    alignSelf: 'flex-start',
  },
  signOffBtnText: { fontSize: 10, fontWeight: '800', color: COLORS.primaryDark },
});

