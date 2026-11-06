import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Modal,
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';
import { useAuth } from '../../context/AuthContext';

type SubPlanTab = 'workout' | 'nutrition' | 'recovery' | 'notes' | 'analysis';

interface Exercise {
  id: string;
  name: string;
  level: string;
  sets: number;
  reps: string;
  duration: string;
  rest: string;
  targetMuscles: string;
  coachTip: string;
}

interface DaySchedule {
  day: string;
  focusName: string;
  targetMuscles: string;
  duration: string;
  exercises: Exercise[];
}

const WEEKLY_WORKOUT_SCHEDULE: Record<string, DaySchedule> = {
  Monday: {
    day: 'Monday',
    focusName: 'Lower Body & Core Fundamentals',
    targetMuscles: 'Quadriceps, Glutes, Hamstrings & Core',
    duration: '50 Minutes',
    exercises: [
      {
        id: 'mon-1',
        name: 'Barbell Squats',
        level: 'Beginner / Intermediate',
        sets: 4,
        reps: '8 - 12 Reps',
        duration: '12m Duration',
        rest: '90s Rest',
        targetMuscles: 'Quadriceps, Glutes, Hamstrings',
        coachTip: 'Feet shoulder-width apart. Keep chest upright, brace core, and descend until thighs are parallel to ground.',
      },
      {
        id: 'mon-2',
        name: 'Flat Dumbbell Bench Press',
        level: 'Beginner',
        sets: 3,
        reps: '10 - 12 Reps',
        duration: '10m Duration',
        rest: '60s Rest',
        targetMuscles: 'Chest, Front Deltoids, Triceps',
        coachTip: 'Lie flat on bench with feet planted. Lower dumbbells with control to chest level, press up smoothly.',
      },
      {
        id: 'mon-3',
        name: 'Push-ups / Close-Grip Pushups',
        level: 'Beginner',
        sets: 3,
        reps: '12 - 15 Reps',
        duration: '8m Duration',
        rest: '60s Rest',
        targetMuscles: 'Chest, Triceps, Shoulders',
        coachTip: 'Maintain straight plank line from head to heels. Elbows tucked at 45 degrees, lower smoothly.',
      },
      {
        id: 'mon-4',
        name: 'Plank with Shoulder Taps',
        level: 'Beginner',
        sets: 3,
        reps: '45 - 60 sec hold',
        duration: '6m Duration',
        rest: '45s Rest',
        targetMuscles: 'Transverse Abdominis, Obliques',
        coachTip: 'Hold high plank with feet slightly wide for stability. Tap opposite shoulder without rocking hips.',
      },
    ],
  },
  Tuesday: {
    day: 'Tuesday',
    focusName: 'Upper Body Push & Pull Strength',
    targetMuscles: 'Upper Back, Lats, Biceps & Shoulders',
    duration: '45 Minutes',
    exercises: [
      {
        id: 'tue-1',
        name: 'Lat Pulldowns',
        level: 'Beginner',
        sets: 4,
        reps: '10 - 12 Reps',
        duration: '10m Duration',
        rest: '60s Rest',
        targetMuscles: 'Latissimus Dorsi, Biceps',
        coachTip: 'Slight lean back in torso. Pull the bar down to upper chest level, driving elbows downward.',
      },
      {
        id: 'tue-2',
        name: 'Seated Cable Row',
        level: 'Beginner',
        sets: 3,
        reps: '10 - 12 Reps',
        duration: '10m Duration',
        rest: '60s Rest',
        targetMuscles: 'Rhomboids, Middle Traps, Lats',
        coachTip: 'Keep back flat with neutral spine. Pull handle toward belly button, squeezing shoulder blades.',
      },
      {
        id: 'tue-3',
        name: 'Standing Dumbbell Bicep Curls',
        level: 'Beginner',
        sets: 3,
        reps: '12 - 15 Reps',
        duration: '8m Duration',
        rest: '45s Rest',
        targetMuscles: 'Biceps Brachii',
        coachTip: 'Pin elbows to your ribs. Curl weights smoothly upward with supination at peak.',
      },
      {
        id: 'tue-4',
        name: 'Overhead Dumbbell Shoulder Press',
        level: 'Beginner / Intermediate',
        sets: 3,
        reps: '10 - 12 Reps',
        duration: '10m Duration',
        rest: '60s Rest',
        targetMuscles: 'Anterior & Lateral Deltoids',
        coachTip: 'Sit tall with lower back supported. Press dumbbells upward in a slight arc overhead.',
      },
    ],
  },
  Wednesday: {
    day: 'Wednesday',
    focusName: 'Active Recovery & Functional Mobility',
    targetMuscles: 'Joint Mobility, Core Stabilizers & Aerobic Conditioning',
    duration: '30 Minutes',
    exercises: [
      {
        id: 'wed-1',
        name: 'Deep Squat Mobility Holds & Hip Openers',
        level: 'Beginner',
        sets: 3,
        reps: '60 sec hold',
        duration: '8m Duration',
        rest: '30s Rest',
        targetMuscles: 'Hip Flexors, Adductors, Ankles',
        coachTip: 'Descend into a deep primal squat. Press knees outward with elbows to decompress hips.',
      },
      {
        id: 'wed-2',
        name: 'Cat-Cow & Thoracic Spine Rotations',
        level: 'Beginner',
        sets: 3,
        reps: '12 reps',
        duration: '6m Duration',
        rest: '30s Rest',
        targetMuscles: 'Spinal Erectors, Thoracic Cage',
        coachTip: 'On hands and knees, cycle through gentle arching and rounding while breathing rhythmically.',
      },
      {
        id: 'wed-3',
        name: 'Hanging Knee Raises & Core Plank',
        level: 'Beginner',
        sets: 3,
        reps: '12 - 15 Reps',
        duration: '8m Duration',
        rest: '45s Rest',
        targetMuscles: 'Lower Abs, Hip Flexors',
        coachTip: 'Hang from pull-up bar with firm grip. Lift knees toward chest with controlled motion.',
      },
      {
        id: 'wed-4',
        name: 'Zone 2 Low-Intensity Incline Walk',
        level: 'Beginner',
        sets: 1,
        reps: '20 mins steady',
        duration: '20m Duration',
        rest: '0s Rest',
        targetMuscles: 'Cardiovascular Health',
        coachTip: 'Set treadmill to 4-6% incline at comfortable walking pace (5 km/h). Maintain easy nasal breathing.',
      },
    ],
  },
  Thursday: {
    day: 'Thursday',
    focusName: 'Posterior Chain & Legs Power',
    targetMuscles: 'Hamstrings, Gluteus Maximus & Calves',
    duration: '50 Minutes',
    exercises: [
      {
        id: 'thu-1',
        name: 'Dumbbell Romanian Deadlifts',
        level: 'Beginner / Intermediate',
        sets: 4,
        reps: '10 - 12 Reps',
        duration: '12m Duration',
        rest: '75s Rest',
        targetMuscles: 'Hamstrings, Glutes, Lower Back',
        coachTip: 'Keep slight bend in knees. Hinge backwards at hips, keeping dumbbells close to your shins.',
      },
      {
        id: 'thu-2',
        name: 'Dumbbell Walking Lunges',
        level: 'Beginner',
        sets: 3,
        reps: '12 reps / leg',
        duration: '10m Duration',
        rest: '60s Rest',
        targetMuscles: 'Quadriceps, Glutes',
        coachTip: 'Step forward into a lunge with 90-degree bend in front knee. Push through front heel.',
      },
      {
        id: 'thu-3',
        name: 'Glute Bridges / Hip Thrusts',
        level: 'Beginner',
        sets: 3,
        reps: '15 reps (2s hold)',
        duration: '8m Duration',
        rest: '45s Rest',
        targetMuscles: 'Gluteus Maximus & Core',
        coachTip: 'Lie on back with knees bent and feet flat. Drive hips upward, pause and squeeze glutes.',
      },
      {
        id: 'thu-4',
        name: 'Standing Calf Raises',
        level: 'Beginner',
        sets: 4,
        reps: '15 - 20 Reps',
        duration: '6m Duration',
        rest: '45s Rest',
        targetMuscles: 'Gastrocnemius, Soleus',
        coachTip: 'Elevate balls of feet on step. Lower heels for full stretch, push through toes to peak.',
      },
    ],
  },
  Friday: {
    day: 'Friday',
    focusName: 'Hypertrophy & Arm Sculpting',
    targetMuscles: 'Chest, Triceps, Deltoids & Lats',
    duration: '45 Minutes',
    exercises: [
      {
        id: 'fri-1',
        name: 'Incline Dumbbell Chest Press',
        level: 'Beginner / Intermediate',
        sets: 4,
        reps: '10 - 12 Reps',
        duration: '10m Duration',
        rest: '60s Rest',
        targetMuscles: 'Clavicular Head (Upper Chest), Triceps',
        coachTip: 'Bench at 30-degree incline. Press dumbbells upward with elbows at a 45-degree angle to torso.',
      },
      {
        id: 'fri-2',
        name: 'Incline Dumbbell Hammer Curls',
        level: 'Beginner',
        sets: 3,
        reps: '12 reps Reps',
        duration: '8m Duration',
        rest: '45s Rest',
        targetMuscles: 'Brachialis, Biceps, Forearms',
        coachTip: 'Palms facing each other throughout movement. Curl weights with full range of motion.',
      },
      {
        id: 'fri-3',
        name: 'Cable Tricep Pushdown',
        level: 'Beginner',
        sets: 3,
        reps: '12 - 15 Reps',
        duration: '8m Duration',
        rest: '45s Rest',
        targetMuscles: 'Triceps Lateral & Medial Head',
        coachTip: 'Lock elbows at ribs. Push cable bar or rope down until arms are fully extended.',
      },
      {
        id: 'fri-4',
        name: 'Dumbbell Lateral Raises',
        level: 'Beginner',
        sets: 4,
        reps: '12 - 15 Reps',
        duration: '8m Duration',
        rest: '45s Rest',
        targetMuscles: 'Lateral Deltoids (Shoulder Width)',
        coachTip: 'Raise dumbbells to sides with slight elbow bend until parallel with floor. Lead with elbows.',
      },
    ],
  },
  Saturday: {
    day: 'Saturday',
    focusName: 'Conditioning & HIIT Burn',
    targetMuscles: 'Cardiovascular, Total Body & Core Endurance',
    duration: '35 Minutes',
    exercises: [
      {
        id: 'sat-1',
        name: 'Kettlebell Swings / Deadlifts',
        level: 'Beginner / Intermediate',
        sets: 4,
        reps: '20 Reps',
        duration: '10m Duration',
        rest: '60s Rest',
        targetMuscles: 'Posterior Chain, Glutes, Hips',
        coachTip: 'Snap hips forward explosively. The swing power comes from glutes and hips, not arms.',
      },
      {
        id: 'sat-2',
        name: 'Bodyweight Jump Squats',
        level: 'Intermediate',
        sets: 3,
        reps: '15 Reps',
        duration: '8m Duration',
        rest: '45s Rest',
        targetMuscles: 'Quadriceps, Calves, Power Output',
        coachTip: 'Squat down smoothly, explode upward into a jump, and land softly absorbing impact.',
      },
      {
        id: 'sat-3',
        name: 'Mountain Climbers & Plank Hold',
        level: 'Beginner',
        sets: 3,
        reps: '45 sec continuous',
        duration: '6m Duration',
        rest: '30s Rest',
        targetMuscles: 'Core, Shoulder Stabilizers',
        coachTip: 'High plank position. Drive knees alternately towards chest at a rapid, controlled tempo.',
      },
      {
        id: 'sat-4',
        name: 'Russian Twists',
        level: 'Beginner',
        sets: 3,
        reps: '20 Reps',
        duration: '6m Duration',
        rest: '45s Rest',
        targetMuscles: 'Internal & External Obliques',
        coachTip: 'Sit with knees bent, lean back 45 degrees. Rotate torso from left to right tapping floor.',
      },
    ],
  },
  Sunday: {
    day: 'Sunday',
    focusName: 'Rest & Neural Regeneration',
    targetMuscles: 'Myofascial Tissue, Flexibility & Recovery',
    duration: '25 Minutes',
    exercises: [
      {
        id: 'sun-1',
        name: 'Foam Roller Full Body Release',
        level: 'All Levels',
        sets: 1,
        reps: '10 mins flow',
        duration: '10m Duration',
        rest: '0s Rest',
        targetMuscles: 'IT Bands, Quads, Lats, Calves',
        coachTip: 'Slowly roll over tender muscle knots, pausing on trigger points for 20-30 seconds.',
      },
      {
        id: 'sun-2',
        name: 'Dynamic Yoga Flow & Child’s Pose',
        level: 'All Levels',
        sets: 1,
        reps: '15 mins flow',
        duration: '15m Duration',
        rest: '0s Rest',
        targetMuscles: 'Full Body Flexibility',
        coachTip: 'Flow through downward dog, cobra, and deep child’s pose with slow diaphragmatic breathing.',
      },
      {
        id: 'sun-3',
        name: 'Light Outdoor Nature Walk',
        level: 'All Levels',
        sets: 1,
        reps: '20 mins walk',
        duration: '20m Duration',
        rest: '0s Rest',
        targetMuscles: 'Aerobic System & Mental Reset',
        coachTip: 'Unhurried outdoor stroll to encourage blood circulation and reduce systemic inflammation.',
      },
    ],
  },
};

const DEFAULT_FRIDAY_EXERCISES = WEEKLY_WORKOUT_SCHEDULE.Friday.exercises;

const DAYS_OF_WEEK = [
  { day: 'Monday', name: 'Lower Body & Core', count: 4 },
  { day: 'Tuesday', name: 'Upper Body Push & Pull', count: 4 },
  { day: 'Wednesday', name: 'Active Recovery', count: 4 },
  { day: 'Thursday', name: 'Posterior Chain & Legs', count: 4 },
  { day: 'Friday', name: 'Hypertrophy & Arm Sculpting', count: 4 },
  { day: 'Saturday', name: 'Conditioning & HIIT', count: 4 },
  { day: 'Sunday', name: 'Rest & Regeneration', count: 3 },
];

export const CustomerWorkoutsScreen: React.FC<{ onNavigateToMetrics?: () => void }> = ({ onNavigateToMetrics }) => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState<SubPlanTab>('workout');
  const [selectedDay, setSelectedDay] = useState<string>('Friday');
  const [completedExercises, setCompletedExercises] = useState<Set<string>>(new Set());
  const [refreshing, setRefreshing] = useState(false);

  // Exercise preview modal
  const [previewExercise, setPreviewExercise] = useState<Exercise | null>(null);

  // Interactive Live Workout Session Modal
  const [interactiveModalVisible, setInteractiveModalVisible] = useState(false);
  const [currentExerciseIndex, setCurrentExerciseIndex] = useState(0);
  const [currentSet, setCurrentSet] = useState(1);
  const [timerSeconds, setTimerSeconds] = useState(0);
  const [isTimerRunning, setIsTimerRunning] = useState(false);

  // Timer Effect
  useEffect(() => {
    let interval: any = null;
    if (isTimerRunning) {
      interval = setInterval(() => {
        setTimerSeconds(s => s + 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning]);

  const onRefresh = () => {
    setRefreshing(true);
    setTimeout(() => setRefreshing(false), 500);
  };

  const handleToggleComplete = (id: string) => {
    setCompletedExercises(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleStartWorkout = () => {
    setCurrentExerciseIndex(0);
    setCurrentSet(1);
    setTimerSeconds(0);
    setIsTimerRunning(true);
    setInteractiveModalVisible(true);
  };

  const handleNextSet = () => {
    const curSchedule = WEEKLY_WORKOUT_SCHEDULE[selectedDay] || WEEKLY_WORKOUT_SCHEDULE.Monday;
    const curExercises = curSchedule.exercises;
    const curEx = curExercises[currentExerciseIndex];
    if (currentSet < curEx.sets) {
      setCurrentSet(s => s + 1);
    } else {
      // Mark current completed
      handleToggleComplete(curEx.id);
      if (currentExerciseIndex < curExercises.length - 1) {
        setCurrentExerciseIndex(i => i + 1);
        setCurrentSet(1);
      } else {
        setIsTimerRunning(false);
        Alert.alert('Workout Completed! 🎉', `Awesome effort! You finished all exercises in ${selectedDay}'s ${curSchedule.focusName} routine in ${Math.floor(timerSeconds / 60)}m ${timerSeconds % 60}s.`);
        setInteractiveModalVisible(false);
      }
    }
  };

  const formatTimer = (secs: number) => {
    const mins = Math.floor(secs / 60);
    const s = secs % 60;
    return `${mins < 10 ? '0' : ''}${mins}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      showsVerticalScrollIndicator={false}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />}
    >
      {/* ======================================================== */}
      {/* SUB-TABS ROW (Matching Web Page 1 & 15 Exactly) */}
      {/* ======================================================== */}
      <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.subTabsScroll} contentContainerStyle={styles.subTabsContainer}>
        <TouchableOpacity
          style={[styles.subTabPill, activeTab === 'workout' && styles.subTabPillActive]}
          onPress={() => setActiveTab('workout')}
          activeOpacity={0.7}
        >
          <Ionicons name="barbell-outline" size={14} color={activeTab === 'workout' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.subTabPillText, activeTab === 'workout' && styles.subTabPillTextActive]}>
            Workout Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabPill, activeTab === 'nutrition' && styles.subTabPillActive]}
          onPress={() => setActiveTab('nutrition')}
          activeOpacity={0.7}
        >
          <Ionicons name="nutrition-outline" size={14} color={activeTab === 'nutrition' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.subTabPillText, activeTab === 'nutrition' && styles.subTabPillTextActive]}>
            Nutrition & Diet
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabPill, activeTab === 'recovery' && styles.subTabPillActive]}
          onPress={() => setActiveTab('recovery')}
          activeOpacity={0.7}
        >
          <Ionicons name="battery-charging-outline" size={14} color={activeTab === 'recovery' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.subTabPillText, activeTab === 'recovery' && styles.subTabPillTextActive]}>
            Recovery Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabPill, activeTab === 'notes' && styles.subTabPillActive]}
          onPress={() => setActiveTab('notes')}
          activeOpacity={0.7}
        >
          <Ionicons name="document-text-outline" size={14} color={activeTab === 'notes' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.subTabPillText, activeTab === 'notes' && styles.subTabPillTextActive]}>
            Trainer Notes
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabPill, activeTab === 'analysis' && styles.subTabPillActive]}
          onPress={() => setActiveTab('analysis')}
          activeOpacity={0.7}
        >
          <Ionicons name="analytics-outline" size={14} color={activeTab === 'analysis' ? '#FFFFFF' : '#64748B'} />
          <Text style={[styles.subTabPillText, activeTab === 'analysis' && styles.subTabPillTextActive]}>
            Analysis Summary
          </Text>
        </TouchableOpacity>
      </ScrollView>

      {/* ======================================================== */}
      {/* TOP FITNESS PLAN BANNER (Matching Web Page 1) */}
      {/* ======================================================== */}
      <View style={styles.topBannerCard}>
        <View style={styles.badgeRow}>
          <View style={styles.approvedBadge}>
            <Ionicons name="shield-checkmark" size={12} color="#16A34A" />
            <Text style={styles.approvedBadgeText}>Trainer Approved Plan</Text>
          </View>
          <Text style={styles.lastUpdatedText}>Plan Status: Trainer Approved</Text>
        </View>

        <Text style={styles.dateStampText}>Last Updated: 10/17/2026</Text>
        <Text style={styles.bannerTitle}>My Fitness Plan</Text>
        <Text style={styles.bannerSubtitle}>
          Personalized regime verified and approved by coach <Text style={{ fontWeight: '800', color: '#EA580C' }}>Naveen</Text>. Follow your calibrated exercises, repetition ranges, recovery guidelines, and nutrition targets.
        </Text>

        <TouchableOpacity 
          style={styles.startWorkoutButton}
          onPress={handleStartWorkout}
          activeOpacity={0.8}
        >
          <Ionicons name="play" size={16} color="#FFFFFF" />
          <Text style={styles.startWorkoutButtonText}>Start Today's Workout</Text>
        </TouchableOpacity>
      </View>

      {/* ======================================================== */}
      {/* TAB 1: WORKOUT PLAN */}
      {/* ======================================================== */}
      {activeTab === 'workout' && (
        <View>
          {/* Day Selector (Monday - Sunday) */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeaderTitle}>Workout Plan (Monday - Sunday)</Text>
              <Text style={styles.sectionHeaderSubtitle}>7 Days Active • Streak: 0 Days | Completed: 21%</Text>
            </View>
          </View>

          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.daysScrollContainer}>
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = selectedDay === d.day;
              return (
                <TouchableOpacity
                  key={d.day}
                  style={[styles.dayCard, isSelected && styles.dayCardActive]}
                  onPress={() => setSelectedDay(d.day)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayCardTitle, isSelected && styles.dayCardTitleActive]}>{d.day}</Text>
                  <Text style={[styles.dayCardSubtitle, isSelected && styles.dayCardSubtitleActive]}>
                    {d.count} Exercises
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Target Focus Banner */}
          {(() => {
            const currentSchedule = WEEKLY_WORKOUT_SCHEDULE[selectedDay] || WEEKLY_WORKOUT_SCHEDULE.Monday;
            const currentExercises = currentSchedule.exercises;
            const completedCount = currentExercises.filter(e => completedExercises.has(e.id)).length;
            const pctDone = Math.round((completedCount / (currentExercises.length || 1)) * 100);

            return (
              <>
                <View style={styles.focusBannerCard}>
                  <View style={styles.focusIconBadge}>
                    <Ionicons name="fitness" size={14} color="#EA580C" />
                    <Text style={styles.focusBadgeText}>TARGET FOCUS</Text>
                  </View>
                  <Text style={styles.focusTitle}>{selectedDay} - {currentSchedule.focusName}</Text>
                  <Text style={styles.focusSub}>{currentExercises.length} Exercises approved by Naveen for target muscular development</Text>
                  
                  <View style={styles.focusMetaRow}>
                    <View style={styles.focusMetaCol}>
                      <Text style={styles.focusMetaLabel}>Target Muscle Focus:</Text>
                      <Text style={styles.focusMetaVal}>{currentSchedule.targetMuscles}</Text>
                    </View>
                    <View style={styles.focusMetaCol}>
                      <Text style={styles.focusMetaLabel}>ESTIMATED DURATION</Text>
                      <Text style={styles.focusMetaVal}>{currentSchedule.duration}</Text>
                    </View>
                  </View>
                </View>

                {/* Exercises Header & Count */}
                <View style={styles.exerciseHeaderRow}>
                  <Text style={styles.exerciseListTitle}>
                    Exercises in {selectedDay} - {currentSchedule.focusName} ({currentExercises.length})
                  </Text>
                  <Text style={styles.exerciseProgressText}>
                    {completedCount} of {currentExercises.length} Exercises Completed • {pctDone}% Done
                  </Text>
                </View>

                {/* Exercise Cards List Matching Web Page 1 & 2 */}
                <View style={{ gap: 12 }}>
                  {currentExercises.map((ex, idx) => {
                    const isDone = completedExercises.has(ex.id);
                    return (
                      <View key={ex.id} style={[styles.exerciseCard, isDone && styles.exerciseCardDone]}>
                        {/* Number & Name */}
                        <View style={styles.exTopRow}>
                          <View style={styles.exNumberCircle}>
                            <Text style={styles.exNumberText}>{idx + 1}</Text>
                          </View>
                          <View style={{ flex: 1, marginLeft: 10 }}>
                            <Text style={styles.exName}>{ex.name}</Text>
                            <Text style={styles.exLevel}>{ex.level}</Text>
                          </View>
                          <TouchableOpacity onPress={() => handleToggleComplete(ex.id)}>
                            <Ionicons 
                              name={isDone ? "checkbox" : "square-outline"} 
                              size={24} 
                              color={isDone ? "#16A34A" : "#94A3B8"} 
                            />
                          </TouchableOpacity>
                        </View>

                  {/* Metrics Row: Sets, Reps, Duration, Rest */}
                  <View style={styles.exMetricsRow}>
                    <Text style={styles.exMetricPill}>{ex.sets} Sets × {ex.reps}</Text>
                    <Text style={styles.exMetricPill}>• {ex.duration}</Text>
                    <Text style={styles.exMetricPill}>• {ex.rest}</Text>
                  </View>

                  {/* Target Muscles */}
                  <Text style={styles.exMusclesText}>• {ex.targetMuscles}</Text>

                  {/* Coach Tip */}
                  <View style={styles.coachTipBox}>
                    <Text style={styles.coachTipText}>
                      <Text style={{ fontWeight: '800', color: '#EA580C' }}>Coach Tip: </Text>
                      {ex.coachTip}
                    </Text>
                  </View>

                  {/* Watch Exercise Button Matching Web Image 1 & 2 */}
                  <TouchableOpacity 
                    style={styles.watchExButton}
                    onPress={() => setPreviewExercise(ex)}
                    activeOpacity={0.7}
                  >
                    <Ionicons name="play" size={14} color="#FFFFFF" />
                    <Text style={styles.watchExButtonText}>Watch Exercise</Text>
                  </TouchableOpacity>
                </View>
              );
            })}
          </View>
        </>
      );
    })()}

          {/* Start Interactive Session Bottom Button */}
          <TouchableOpacity 
            style={styles.interactiveSessionBtn}
            onPress={handleStartWorkout}
            activeOpacity={0.8}
          >
            <Ionicons name="play-circle" size={18} color="#FFFFFF" />
            <Text style={styles.interactiveSessionBtnText}>Start Interactive Session</Text>
          </TouchableOpacity>
        </View>
      )}

      {/* ======================================================== */}
      {/* TAB 2: NUTRITION & DIET (Matching Web Page 3 Top) */}
      {/* ======================================================== */}
      {activeTab === 'nutrition' && (
        <View style={{ gap: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="restaurant" size={20} color="#EA580C" />
            <View>
              <Text style={styles.cardHeaderTitle}>Diet & Nutrition Recommendations</Text>
              <Text style={styles.cardHeaderSubtitle}>Calibrated by Naveen for your fitness targets.</Text>
            </View>
          </View>

          <View style={styles.nutritionBox}>
            <Text style={styles.nutritionBoxLabel}>PRE-BREAKFAST / MORNING</Text>
            <Text style={styles.nutritionBoxContent}>
              Warm water with pinch of pink Himalayan salt. Pre-workout (5:30 AM): 1 small banana or 2 rice cakes with a spoonful of peanut butter.
            </Text>
          </View>

          <View style={styles.nutritionBox}>
            <Text style={styles.nutritionBoxLabel}>BREAKFAST</Text>
            <Text style={styles.nutritionBoxContent}>
              Post-workout (7:30 AM): 3-4 whole eggs scrambled with spinach and mushrooms (or 150g paneer bhurji), 2 slices of whole-wheat toast, and fresh fruit / shake.
            </Text>
          </View>

          <View style={styles.nutritionBox}>
            <Text style={styles.nutritionBoxLabel}>LUNCH</Text>
            <Text style={styles.nutritionBoxContent}>
              150g low-fat paneer/tofu or large bowl dal/chana with a large serving (1.5 cups) of mixed green salad with olive oil and 1 cup brown rice/quinoa.
            </Text>
          </View>

          <View style={styles.nutritionBox}>
            <Text style={styles.nutritionBoxLabel}>EVENING SNACK</Text>
            <Text style={styles.nutritionBoxContent}>
              Healthy nuts & recovery drink (almonds, walnuts, roasted chana + antioxidant green tea).
            </Text>
          </View>

          <View style={styles.nutritionBox}>
            <Text style={styles.nutritionBoxLabel}>DINNER</Text>
            <Text style={styles.nutritionBoxContent}>
              Grilled paneer/tofu with sautéed bell peppers (or lentils), minimal complex carbs (e.g., small sweet potato or half a cup of lentils), large bowl of mixed vegetable soup.
            </Text>
          </View>

          <View style={[styles.nutritionBox, { borderColor: '#93C5FD', backgroundColor: '#EFF6FF' }]}>
            <Text style={[styles.nutritionBoxLabel, { color: '#1D4ED8' }]}>HYDRATION TARGET</Text>
            <Text style={[styles.nutritionBoxContent, { fontWeight: '700', color: '#1E40AF' }]}>
              💧 3.5 - 4.0 Litres of pure water daily.
            </Text>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* TAB 3: RECOVERY PLAN (Matching Web Page 3 Bottom) */}
      {/* ======================================================== */}
      {activeTab === 'recovery' && (
        <View style={{ gap: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="heart" size={20} color="#EA580C" />
            <View>
              <Text style={styles.cardHeaderTitle}>Recovery & Regeneration Protocol</Text>
              <Text style={styles.cardHeaderSubtitle}>Approved muscle repair and fatigue management guidelines.</Text>
            </View>
          </View>

          <View style={styles.recoveryCard}>
            <Text style={styles.recoveryCardLabel}>SLEEP TARGET</Text>
            <Text style={styles.recoveryCardContent}>
              7.5 - 8.5 Hours of deep restorative sleep. Establish consistent bedtime routines, dim blue light screens 1 hour prior to sleep.
            </Text>
          </View>

          <View style={styles.recoveryCard}>
            <Text style={styles.recoveryCardLabel}>ACTIVE RECOVERY</Text>
            <Text style={styles.recoveryCardContent}>
              20 mins light outdoor walk or low-intensity cycling on non-training days. Encourages systemic circulation and accelerates lactic acid clearance.
            </Text>
          </View>

          <View style={styles.recoveryCard}>
            <Text style={styles.recoveryCardLabel}>STRETCHING & MOBILITY</Text>
            <Text style={styles.recoveryCardContent}>
              15 mins daily dynamic mobility routines and foam rolling focusing on thoracic spine, hip flexors, hamstrings, and calves.
            </Text>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* TAB 4: TRAINER NOTES (Matching Web Page 4 Top) */}
      {/* ======================================================== */}
      {activeTab === 'notes' && (
        <View style={{ gap: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="chatbubbles" size={20} color="#EA580C" />
            <View>
              <Text style={styles.cardHeaderTitle}>Trainer Recommendations & Notes</Text>
              <Text style={styles.cardHeaderSubtitle}>Direct guidance from your coach Naveen.</Text>
            </View>
          </View>

          <View style={styles.notesBox}>
            <Text style={styles.notesBoxLabel}>COACH SPECIFIC RECOMMENDATIONS</Text>
            <Text style={styles.notesBoxContent}>
              "Stay consistent with progressive overload and hit protein targets daily. Don't skip post-workout stretching! BYE"
            </Text>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* TAB 5: ANALYSIS SUMMARY (Matching Web Page 4 Bottom) */}
      {/* ======================================================== */}
      {activeTab === 'analysis' && (
        <View style={{ gap: 12 }}>
          <View style={styles.cardHeader}>
            <Ionicons name="stats-chart" size={20} color="#EA580C" />
            <View>
              <Text style={styles.cardHeaderTitle}>Fitness Analysis Summary</Text>
              <Text style={styles.cardHeaderSubtitle}>Analytical breakdown of your assessment metrics.</Text>
            </View>
          </View>

          <View style={styles.analysisCard}>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Customer</Text>
              <Text style={styles.analysisVal}>Renugopal Y</Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Age / Gender</Text>
              <Text style={styles.analysisVal}>28 / Male</Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Height / Weight</Text>
              <Text style={styles.analysisVal}>180 cm / 85 kg</Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>BMI</Text>
              <Text style={styles.analysisVal}>26.2 (Overweight)</Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Fitness Goal</Text>
              <Text style={styles.analysisVal}>Weight Loss</Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Experience Level</Text>
              <Text style={styles.analysisVal}>Beginner</Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Equipment Access</Text>
              <Text style={styles.analysisVal}>Full Commercial Gym</Text>
            </View>
            <View style={styles.analysisRow}>
              <Text style={styles.analysisLabel}>Body Measurements</Text>
              <Text style={styles.analysisVal}>Chest: 38" • Waist: 33" • Hips: 39" • Arms: 13.5" • Thighs: 22"</Text>
            </View>
          </View>
        </View>
      )}

      {/* ======================================================== */}
      {/* WATCH EXERCISE VIDEO / TECHNIQUE MODAL */}
      {/* ======================================================== */}
      <Modal visible={!!previewExercise} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={styles.modalCard}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Exercise Technique</Text>
              <TouchableOpacity onPress={() => setPreviewExercise(null)}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            {previewExercise && (
              <ScrollView style={{ padding: 18 }}>
                <View style={styles.videoPlaceholder}>
                  <Ionicons name="barbell" size={48} color="#EA580C" />
                  <Text style={styles.videoPlaceholderText}>{previewExercise.name}</Text>
                  <View style={styles.playPill}>
                    <Ionicons name="play" size={14} color="#FFFFFF" />
                    <Text style={styles.playPillText}>Form Demo Animation</Text>
                  </View>
                </View>

                <Text style={styles.modalExTitle}>{previewExercise.name}</Text>
                <Text style={styles.modalExSub}>{previewExercise.level} • {previewExercise.targetMuscles}</Text>

                <View style={styles.modalMetricsGrid}>
                  <View style={styles.modalMetricCol}>
                    <Text style={styles.modalMetricLabel}>SETS & REPS</Text>
                    <Text style={styles.modalMetricVal}>{previewExercise.sets} Sets × {previewExercise.reps}</Text>
                  </View>
                  <View style={styles.modalMetricCol}>
                    <Text style={styles.modalMetricLabel}>REST TIME</Text>
                    <Text style={styles.modalMetricVal}>{previewExercise.rest}</Text>
                  </View>
                </View>

                <Text style={styles.modalSectionLabel}>PROPER FORM TIPS</Text>
                <View style={styles.modalTipBox}>
                  <Text style={styles.modalTipText}>{previewExercise.coachTip}</Text>
                </View>
              </ScrollView>
            )}

            <View style={styles.modalFooter}>
              <TouchableOpacity 
                style={styles.modalCloseBtn}
                onPress={() => setPreviewExercise(null)}
              >
                <Text style={styles.modalCloseBtnText}>Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ======================================================== */}
      {/* LIVE WORKOUT INTERACTIVE SESSION MODAL */}
      {/* ======================================================== */}
      <Modal visible={interactiveModalVisible} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.modalCard, { maxHeight: '90%' }]}>
            <View style={styles.modalHeader}>
              <View>
                <Text style={styles.modalTitle}>Live Workout Session</Text>
                <Text style={styles.modalSubHeader}>Friday - Hypertrophy & Arm Sculpting</Text>
              </View>
              <TouchableOpacity onPress={() => {
                setIsTimerRunning(false);
                setInteractiveModalVisible(false);
              }}>
                <Ionicons name="close" size={24} color="#64748B" />
              </TouchableOpacity>
            </View>

            <View style={{ padding: 18, alignItems: 'center' }}>
              {/* Timer Display */}
              <View style={styles.timerCircle}>
                <Ionicons name="stopwatch-outline" size={20} color="#EA580C" />
                <Text style={styles.timerText}>{formatTimer(timerSeconds)}</Text>
                <Text style={styles.timerLabel}>SESSION TIME</Text>
              </View>

              {/* Current Exercise */}
              {DEFAULT_FRIDAY_EXERCISES[currentExerciseIndex] && (
                <View style={styles.liveExCard}>
                  <Text style={styles.liveExStep}>
                    Exercise {currentExerciseIndex + 1} of {DEFAULT_FRIDAY_EXERCISES.length}
                  </Text>
                  <Text style={styles.liveExName}>
                    {DEFAULT_FRIDAY_EXERCISES[currentExerciseIndex].name}
                  </Text>
                  <Text style={styles.liveExMuscles}>
                    {DEFAULT_FRIDAY_EXERCISES[currentExerciseIndex].targetMuscles}
                  </Text>

                  <View style={styles.liveSetBadge}>
                    <Text style={styles.liveSetText}>
                      SET {currentSet} OF {DEFAULT_FRIDAY_EXERCISES[currentExerciseIndex].sets}
                    </Text>
                  </View>

                  <Text style={styles.liveRepsTarget}>
                    Target: {DEFAULT_FRIDAY_EXERCISES[currentExerciseIndex].reps}
                  </Text>
                </View>
              )}

              {/* Action Buttons */}
              <TouchableOpacity 
                style={styles.completeSetBtn}
                onPress={handleNextSet}
                activeOpacity={0.8}
              >
                <Ionicons name="checkmark-circle" size={18} color="#FFFFFF" />
                <Text style={styles.completeSetBtnText}>
                  {currentSet < (DEFAULT_FRIDAY_EXERCISES[currentExerciseIndex]?.sets || 4)
                    ? `Complete Set ${currentSet}`
                    : (currentExerciseIndex < DEFAULT_FRIDAY_EXERCISES.length - 1 ? 'Next Exercise' : 'Finish Workout')}
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  content: { padding: 14, paddingBottom: 100 },

  // Sub Tabs
  subTabsScroll: { marginBottom: 12 },
  subTabsContainer: { gap: 8 },
  subTabPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  subTabPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  subTabPillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  subTabPillTextActive: {
    color: '#FFFFFF',
  },

  // Top Banner Card Matching Web Page 1
  topBannerCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 20,
    padding: 16,
    marginBottom: 14,
    shadowColor: '#000000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 1,
  },
  badgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  approvedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  approvedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
  },
  lastUpdatedText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#16A34A',
  },
  dateStampText: {
    fontSize: 11,
    color: '#94A3B8',
    marginTop: 2,
    marginBottom: 6,
  },
  bannerTitle: {
    fontSize: 22,
    fontWeight: '900',
    color: '#111827',
  },
  bannerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
    marginBottom: 14,
  },
  startWorkoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 12,
  },
  startWorkoutButtonText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Day Selector
  sectionHeaderRow: {
    marginBottom: 10,
  },
  sectionHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  sectionHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  daysScrollContainer: {
    gap: 8,
    marginBottom: 14,
  },
  dayCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    alignItems: 'center',
  },
  dayCardActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  dayCardTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  dayCardTitleActive: {
    color: '#FFFFFF',
  },
  dayCardSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 2,
  },
  dayCardSubtitleActive: {
    color: 'rgba(255, 255, 255, 0.85)',
  },

  // Focus Banner
  focusBannerCard: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
  },
  focusIconBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 6,
  },
  focusBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  focusTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  focusSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  focusMetaRow: {
    flexDirection: 'row',
    gap: 16,
    marginTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#FED7AA',
    paddingTop: 8,
  },
  focusMetaCol: { flex: 1 },
  focusMetaLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.4,
  },
  focusMetaVal: {
    fontSize: 11,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },

  // Exercise List
  exerciseHeaderRow: {
    marginBottom: 10,
  },
  exerciseListTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  exerciseProgressText: {
    fontSize: 11,
    color: '#16A34A',
    fontWeight: '700',
    marginTop: 2,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  exerciseCardDone: {
    borderColor: '#BBF7D0',
    backgroundColor: '#F0FDF4',
  },
  exTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  exNumberCircle: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  exNumberText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  exName: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  exLevel: {
    fontSize: 10,
    color: '#64748B',
  },
  exMetricsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
  },
  exMetricPill: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  exMusclesText: {
    fontSize: 11,
    color: '#475569',
    marginTop: 4,
  },
  coachTipBox: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
    marginTop: 8,
    marginBottom: 10,
  },
  coachTipText: {
    fontSize: 11,
    color: '#475569',
    lineHeight: 16,
  },
  watchExButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 9,
    borderRadius: 10,
  },
  watchExButtonText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  interactiveSessionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#1E293B',
    paddingVertical: 14,
    borderRadius: 14,
    marginTop: 18,
  },
  interactiveSessionBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Nutrition Boxes
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  cardHeaderTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: '#111827',
  },
  cardHeaderSubtitle: {
    fontSize: 11,
    color: '#64748B',
  },
  nutritionBox: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  nutritionBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  nutritionBoxContent: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  // Recovery Cards
  recoveryCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 14,
    padding: 14,
  },
  recoveryCardLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#16A34A',
    letterSpacing: 0.5,
    marginBottom: 4,
  },
  recoveryCardContent: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  // Notes Box
  notesBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 14,
    padding: 16,
  },
  notesBoxLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  notesBoxContent: {
    fontSize: 13,
    color: '#431407',
    lineHeight: 19,
    fontStyle: 'italic',
  },

  // Analysis Summary
  analysisCard: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 14,
  },
  analysisRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  analysisLabel: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '600',
  },
  analysisVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    maxWidth: '60%',
    textAlign: 'right',
  },

  // Modals
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalCard: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '85%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#111827',
  },
  modalSubHeader: {
    fontSize: 11,
    color: '#64748B',
  },
  videoPlaceholder: {
    height: 140,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 14,
  },
  videoPlaceholderText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 6,
  },
  playPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    marginTop: 8,
  },
  playPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalExTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  modalExSub: {
    fontSize: 12,
    color: '#EA580C',
    fontWeight: '700',
    marginTop: 2,
  },
  modalMetricsGrid: {
    flexDirection: 'row',
    gap: 10,
    marginVertical: 12,
  },
  modalMetricCol: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    padding: 10,
  },
  modalMetricLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#64748B',
  },
  modalMetricVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  modalSectionLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginBottom: 6,
  },
  modalTipBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 12,
    padding: 12,
    marginBottom: 16,
  },
  modalTipText: {
    fontSize: 12,
    color: '#431407',
    lineHeight: 18,
  },
  modalFooter: {
    padding: 16,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalCloseBtn: {
    backgroundColor: '#F1F5F9',
    paddingVertical: 10,
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },

  // Interactive Live Timer
  timerCircle: {
    width: 110,
    height: 110,
    borderRadius: 55,
    backgroundColor: '#FFF7ED',
    borderWidth: 2,
    borderColor: '#FDBA74',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16,
  },
  timerText: {
    fontSize: 22,
    fontWeight: '900',
    color: '#EA580C',
    marginTop: 2,
  },
  timerLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: '#9A3412',
    letterSpacing: 0.5,
  },
  liveExCard: {
    width: '100%',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 16,
    padding: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  liveExStep: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  liveExName: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginTop: 4,
    textAlign: 'center',
  },
  liveExMuscles: {
    fontSize: 11,
    color: '#EA580C',
    fontWeight: '700',
    marginTop: 2,
  },
  liveSetBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 12,
    marginVertical: 10,
  },
  liveSetText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  liveRepsTarget: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  completeSetBtn: {
    width: '100%',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 14,
    borderRadius: 14,
  },
  completeSetBtnText: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
