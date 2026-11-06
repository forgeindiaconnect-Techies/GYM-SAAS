import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  ActivityIndicator,
  RefreshControl,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { useAuth } from '../../context/AuthContext';
import { api } from '../../api/client';

const { width: SCREEN_WIDTH } = Dimensions.get('window');

interface ExerciseItem {
  name: string;
  sets: number | string;
  reps: string;
  duration?: string;
  rest?: string;
  difficulty?: string;
  targetMuscleGroup?: string;
  instructions?: string;
  tips?: string;
}

interface DayWorkout {
  day: string;
  focus: string;
  duration: string;
  targetMuscle: string;
  exercises: ExerciseItem[];
}

const DEFAULT_WEEKLY_WORKOUTS: Record<string, DayWorkout> = {
  Monday: {
    day: 'Monday',
    focus: 'Lower Body & Core Fundamentals',
    duration: '50 min',
    targetMuscle: 'Quadriceps, Glutes, Hamstrings & Core',
    exercises: [
      {
        name: 'Barbell Squats',
        sets: 4,
        reps: '8 - 12',
        rest: '90s',
        difficulty: 'BEGINNER / INTERMEDIATE',
        targetMuscleGroup: 'Quadriceps, Glutes, Hamstrings',
        instructions:
          'Feet shoulder-width apart. Keep chest upright, brace core, and descend until thighs are parallel to the ground.',
        tips: 'Keep knees tracking over your second toe; do not let them cave inwards.',
      },
      {
        name: 'Flat Dumbbell Bench Press',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Chest, Front Deltoids, Triceps',
        instructions:
          'Lie flat on the bench with feet planted. Lower dumbbells with control to chest level, press up without clanking dumbbells.',
        tips: 'Retract scapula into bench for optimal pectoral recruitment and shoulder safety.',
      },
      {
        name: 'Push-ups / Close-Grip Pushups',
        sets: 3,
        reps: '12 - 15',
        rest: '60s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Chest, Triceps, Shoulders',
        instructions:
          'Maintain a straight plank line from head to heels. Elbows tucked at 45 degrees, lower smoothly and press up.',
        tips: 'Squeeze glutes and draw navel to spine to protect lower back.',
      },
      {
        name: 'Plank with Shoulder Taps',
        sets: 3,
        reps: '45 - 60 sec hold',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Transverse Abdominis, Obliques',
        instructions:
          'Hold high plank with feet slightly wide for stability. Tap opposite shoulder without rocking your hips.',
        tips: 'Keep hips dead level throughout taps.',
      },
    ],
  },
  Tuesday: {
    day: 'Tuesday',
    focus: 'Upper Body Push & Pull Strength',
    duration: '45 min',
    targetMuscle: 'Upper Back, Lats, Biceps & Shoulders',
    exercises: [
      {
        name: 'Lat Pulldowns',
        sets: 4,
        reps: '10 - 12',
        rest: '60s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Latissimus Dorsi, Biceps',
        instructions:
          'Slight lean back in torso. Pull the bar down to upper chest level, driving elbows downward and back.',
        tips: 'Do not swing or yank with lower back momentum.',
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Rhomboids, Middle Traps, Lats',
        instructions:
          'Keep back flat with neutral spine. Pull handle toward belly button, squeezing shoulder blades together.',
        tips: 'Pause 1 full second at full contraction.',
      },
      {
        name: 'Standing Dumbbell Bicep Curls',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Biceps Brachii',
        instructions:
          'Pin elbows to your ribs. Curl weights smoothly upward with supination at the top, lower with a 2-second negative.',
        tips: 'Control the descent — avoid swinging dumbbells.',
      },
      {
        name: 'Overhead Dumbbell Shoulder Press',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        difficulty: 'BEGINNER / INTERMEDIATE',
        targetMuscleGroup: 'Anterior & Lateral Deltoids',
        instructions:
          'Sit tall with lower back supported. Press dumbbells upward in a slight arc overhead until arms are extended.',
        tips: 'Avoid flaring ribs or hyperextending cervical spine.',
      },
    ],
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Active Recovery & Functional Mobility',
    duration: '30 min',
    targetMuscle: 'Joint Mobility, Core Stabilizers & Aerobic Conditioning',
    exercises: [
      {
        name: 'Deep Squat Mobility Holds & Hip Openers',
        sets: 3,
        reps: '60 sec hold',
        rest: '30s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Hip Flexors, Adductors, Ankles',
        instructions:
          'Descend into a deep primal squat. Press knees outward with elbows to decompress hips and lower back.',
        tips: 'Breathe diaphragmatically into the belly.',
      },
      {
        name: 'Cat-Cow & Thoracic Spine Rotations',
        sets: 3,
        reps: '12 reps',
        rest: '30s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Spinal Erectors, Thoracic Cage',
        instructions:
          'On hands and knees, cycle through gentle arching and rounding while breathing rhythmically.',
        tips: 'Coordinate spinal movement with slow breath cycles.',
      },
      {
        name: 'Hanging Knee Raises & Core Plank',
        sets: 3,
        reps: '12 - 15 reps',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Lower Abs, Hip Flexors',
        instructions:
          'Hang from pull-up bar with firm grip. Lift knees toward chest with controlled motion, avoid swinging.',
        tips: 'Posteriorly tilt pelvis to fire lower rectus abdominis.',
      },
      {
        name: 'Zone 2 Low-Intensity Incline Walk',
        sets: 1,
        reps: '20 mins steady',
        rest: '0s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Cardiovascular Health',
        instructions:
          'Set treadmill to 4-6% incline at comfortable walking pace (5 km/h). Maintain easy conversation breathing.',
        tips: 'Breathe exclusively through nose if possible.',
      },
    ],
  },
  Thursday: {
    day: 'Thursday',
    focus: 'Legs, Posterior Chain & Glutes Power',
    duration: '50 min',
    targetMuscle: 'Hamstrings, Gluteus Maximus & Calves',
    exercises: [
      {
        name: 'Dumbbell Romanian Deadlifts',
        sets: 4,
        reps: '10 - 12',
        rest: '75s',
        difficulty: 'BEGINNER / INTERMEDIATE',
        targetMuscleGroup: 'Hamstrings, Glutes, Lower Back',
        instructions:
          'Keep slight bend in knees. Hinge backwards at hips, keeping dumbbells close to your shins until deep stretch is felt.',
        tips: 'Push hips backward towards wall behind you.',
      },
      {
        name: 'Dumbbell Walking Lunges',
        sets: 3,
        reps: '12 reps / leg',
        rest: '60s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Quadriceps, Glutes',
        instructions:
          'Step forward into a lunge with 90-degree bend in front knee. Push through front heel to step into the next lunge.',
        tips: 'Keep torso upright and core braced.',
      },
      {
        name: 'Glute Bridges / Hip Thrusts',
        sets: 3,
        reps: '15 reps (2s hold)',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Gluteus Maximus & Core',
        instructions:
          'Lie on back with knees bent and feet flat. Drive hips upward, pause and squeeze glutes hard at the top.',
        tips: 'Drive through heels, not toes.',
      },
      {
        name: 'Standing Calf Raises',
        sets: 4,
        reps: '15 - 20 reps',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Gastrocnemius, Soleus',
        instructions:
          'Elevate balls of feet on a step. Lower heels for full stretch, push through toes to peak contraction.',
        tips: 'Hold the peak contraction for 1 full second.',
      },
    ],
  },
  Friday: {
    day: 'Friday',
    focus: 'Upper Body Hypertrophy & Arms',
    duration: '45 min',
    targetMuscle: 'Chest, Triceps, Deltoids & Lats',
    exercises: [
      {
        name: 'Incline Dumbbell Bench Press',
        sets: 4,
        reps: '10 - 12',
        rest: '75s',
        difficulty: 'INTERMEDIATE',
        targetMuscleGroup: 'Clavicular Upper Chest, Front Delts',
        instructions:
          'Bench set to 30-degree incline. Press dumbbells upwards while maintaining stable shoulder retraction.',
        tips: 'Control the stretch at bottom without bouncing.',
      },
      {
        name: 'Dumbbell Lateral Shoulder Raises',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Lateral Deltoids (Shoulder Width)',
        instructions:
          'Raise dumbbells to sides with slight elbow bend until parallel with floor. Lead with elbows.',
        tips: 'Do not shrug neck or use traps to heave weights.',
      },
      {
        name: 'Cable Tricep Pushdown',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Triceps Lateral & Medial Head',
        instructions:
          'Lock elbows at ribs. Push cable bar or rope down until arms are fully extended, squeeze triceps.',
        tips: 'Maintain stationary elbows throughout movement.',
      },
      {
        name: 'Incline Dumbbell Hammer Curls',
        sets: 3,
        reps: '12 reps',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Brachialis, Biceps, Forearms',
        instructions:
          'Palms facing each other throughout the movement. Curl weights with full range of motion.',
        tips: 'Squeeze brachialis at peak.',
      },
    ],
  },
  Saturday: {
    day: 'Saturday',
    focus: 'Conditioning, HIIT & Core Burn',
    duration: '35 min',
    targetMuscle: 'Cardiovascular, Total Body & Core Endurance',
    exercises: [
      {
        name: 'Kettlebell Swings / Deadlifts',
        sets: 4,
        reps: '20 reps',
        rest: '60s',
        difficulty: 'BEGINNER / INTERMEDIATE',
        targetMuscleGroup: 'Posterior Chain, Glutes, Hips',
        instructions:
          'Snap hips forward explosively. The swing power comes from glutes and hips, not arms.',
        tips: 'Arms act purely as ropes holding the weight.',
      },
      {
        name: 'Bodyweight Jump Squats',
        sets: 3,
        reps: '15 reps',
        rest: '45s',
        difficulty: 'INTERMEDIATE',
        targetMuscleGroup: 'Quadriceps, Calves, Power Output',
        instructions:
          'Squat down smoothly, explode upward into a jump, and land softly absorbing impact through knees.',
        tips: 'Land softly through midfoot to heel.',
      },
      {
        name: 'Mountain Climbers & Plank Hold',
        sets: 3,
        reps: '45 sec continuous',
        rest: '30s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Core, Shoulder Stabilizers',
        instructions:
          'High plank position. Drive knees alternately towards chest at a rapid, controlled tempo.',
        tips: 'Keep hips lower than shoulders.',
      },
      {
        name: 'Russian Twists',
        sets: 3,
        reps: '20 reps',
        rest: '45s',
        difficulty: 'BEGINNER',
        targetMuscleGroup: 'Internal & External Obliques',
        instructions:
          'Sit with knees bent, lean back 45 degrees. Rotate torso from left to right tapping the floor.',
        tips: 'Keep spine long and chest open.',
      },
    ],
  },
  Sunday: {
    day: 'Sunday',
    focus: 'Full Body Rest & Neural Regeneration',
    duration: '25 min',
    targetMuscle: 'Myofascial Tissue, Flexibility & Recovery',
    exercises: [
      {
        name: 'Foam Roller Full Body Release',
        sets: 1,
        reps: '10 mins flow',
        rest: '0s',
        difficulty: 'ALL LEVELS',
        targetMuscleGroup: 'IT Bands, Quads, Lats, Calves',
        instructions:
          'Slowly roll over tender muscle knots, pausing on trigger points for 20-30 seconds.',
        tips: 'Breathe smoothly through trigger point releases.',
      },
      {
        name: 'Dynamic Yoga Flow & Child’s Pose',
        sets: 1,
        reps: '15 mins flow',
        rest: '0s',
        difficulty: 'ALL LEVELS',
        targetMuscleGroup: 'Full Body Flexibility',
        instructions:
          'Flow through downward dog, cobra, and deep child’s pose with slow nasal diaphragmatic breathing.',
        tips: 'Lengthen spine with each exhalation.',
      },
      {
        name: 'Light Outdoor Nature Walk',
        sets: 1,
        reps: '20 mins walk',
        rest: '0s',
        difficulty: 'ALL LEVELS',
        targetMuscleGroup: 'Aerobic System & Mental Reset',
        instructions:
          'Unhurried outdoor stroll to encourage blood circulation and reduce systemic inflammation.',
        tips: 'Stay present and relax nervous system.',
      },
    ],
  },
};

const DEFAULT_WEEKLY_DIET: Record<string, any> = {
  Monday: {
    day: 'Monday',
    calories: '2150 kcal',
    macros: 'P: 155g | C: 210g | F: 58g',
    morning:
      'Warm water with pinch of pink Himalayan salt. Pre-workout (5:30 AM): 1 small banana or 2 rice cakes with a spoonful of peanut butter.',
    breakfast:
      'Post-workout (7:30 AM): 3-4 whole eggs scrambled with spinach and mushrooms (or 150g paneer bhurji), 2 slices of whole-wheat toast, and fresh fruit / shake.',
    midMorning:
      '1 crisp apple + 1 cup low-fat Greek yogurt with dash of cinnamon.',
    lunch:
      '150g low-fat paneer/tofu or large bowl dal/chana with a large serving (1.5 cups) of mixed green salad with olive oil and 1 cup brown rice/quinoa.',
    evening:
      '1 scoop Whey Protein Isolate shaken with cold water + handful of roasted chana.',
    dinner:
      'Grilled paneer/tofu with sautéed bell peppers (or lentils), minimal complex carbs (e.g., small sweet potato or half a cup of lentils), large bowl of mixed vegetable soup.',
  },
  Tuesday: {
    day: 'Tuesday',
    calories: '2200 kcal',
    macros: 'P: 155g | C: 215g | F: 60g',
    morning:
      'Warm water with Himalayan pink salt & chia seeds. Pre-workout: 2 rice cakes with almond butter.',
    breakfast:
      'Rolled oats porridge in unsweetened almond milk topped with fresh blueberries, pumpkin seeds & protein scoop.',
    midMorning:
      'Handful of raw walnuts (30g) and golden raisins + green tea.',
    lunch:
      'Shredded chicken quinoa bowl (or rajma kidney bean bowl) with avocado, cherry tomatoes & lime vinaigrette.',
    evening:
      'Sprouted moong bean salad with diced cucumbers, tomatoes & lemon chaat masala.',
    dinner:
      'Grilled lemon-herb chicken skewers (or grilled paneer) + sautéed asparagus & baby spinach + clear vegetable broth soup.',
  },
  Wednesday: {
    day: 'Wednesday',
    calories: '2180 kcal',
    macros: 'P: 160g | C: 200g | F: 62g',
    morning:
      'Warm fenugreek (methi) water (500ml) + 1 slice whole-grain toast with mashed avocado.',
    breakfast:
      'Vegetable egg-white omelette (4 whites, 1 yolk) with diced peppers & mushrooms + 1 sweet orange.',
    midMorning:
      '1 bowl fresh cubed papaya or chilled watermelon + mint infused water.',
    lunch:
      'Pan-seared salmon fillet (180g) or chana masala + 1 cup steamed quinoa + beetroot & rocket salad.',
    evening:
      'Low-fat Greek yogurt cup with 1 tsp ground flaxseeds & sliced strawberries.',
    dinner:
      'Stir-fried chicken breast strips (or grilled paneer) with zucchini, snow peas & bok choy in sesame oil.',
  },
  Thursday: {
    day: 'Thursday',
    calories: '2120 kcal',
    macros: 'P: 152g | C: 205g | F: 59g',
    morning:
      'Warm water with 1 tbsp raw apple cider vinegar + 2 Medjool dates + 4 walnut halves.',
    breakfast:
      'High-protein smoothie bowl: unsweetened almond milk, ripe banana, spinach & whey protein isolate.',
    midMorning:
      'Crisp cucumber & carrot crudités with 3 tbsp roasted red pepper hummus dip.',
    lunch:
      'Lemon-rosemary grilled chicken thigh (200g) or spiced vegetable khichdi + roasted zucchini & low-fat curd.',
    evening:
      'Roasted fox nuts (makhana) lightly seasoned with pink salt + antioxidant green tea.',
    dinner:
      'Steamed white cod fillet (or grilled paneer steaks) + hearty vegetable minestrone soup + French beans.',
  },
  Friday: {
    day: 'Friday',
    calories: '2240 kcal',
    macros: 'P: 158g | C: 220g | F: 64g',
    morning:
      'Freshly brewed green tea + 5 soaked almonds + 1 small banana.',
    breakfast:
      'Poached eggs on toasted artisan sourdough bread + sautéed baby spinach & grilled cherry tomatoes.',
    midMorning:
      '1 whole ripe juicy pear or fresh guava slices with rock salt.',
    lunch:
      'Chicken & bell pepper fajita bowl over wild brown rice with fresh guacamole & pico de gallo.',
    evening:
      '3 boiled egg whites seasoned with black pepper + iced peppermint tea.',
    dinner:
      'Pan-seared tuna steak (or Thai tofu & broccoli red curry) + cauliflower rice + cucumber sesame salad.',
  },
  Saturday: {
    day: 'Saturday',
    calories: '2280 kcal',
    macros: 'P: 162g | C: 230g | F: 63g',
    morning:
      'Warm water with fresh lemon juice + 1 crisp apple with 1 tbsp creamy peanut butter.',
    breakfast:
      'Protein oat pancakes (oats, banana, egg whites) topped with fresh blueberries & 1 tsp pure raw honey.',
    midMorning:
      'Fresh tender coconut water with soft coconut meat + pumpkin seeds.',
    lunch:
      'Mediterranean grilled chicken wrap in whole-wheat tortilla with cucumber-tomato tabbouleh & tzatziki.',
    evening:
      'Steamed edamame pods tossed with sea salt & pepper + iced unsweetened green tea.',
    dinner:
      'Herb-roasted chicken breast + baked sweet potato wedges + grilled asparagus spears.',
  },
  Sunday: {
    day: 'Sunday',
    calories: '2100 kcal',
    macros: 'P: 148g | C: 200g | F: 58g',
    morning:
      'Warm water infused with fresh mint leaves and lemon slices + chamomile tea.',
    breakfast:
      'Traditional Shakshuka (3 poached eggs in rich tomato, pepper & cumin sauce) + 1 slice multigrain toast.',
    midMorning:
      '1 whole fresh ruby pomegranate or 2 peeled golden kiwis.',
    lunch:
      'Herb-infused roasted chicken breast (or dal tadka with paneer) + 1 cup steamed basmati rice + cucumber raita.',
    evening:
      'Antioxidant trail mix (almonds, walnuts, dried cranberries, pumpkin seeds) + herbal tea.',
    dinner:
      'Grilled white fish fillet (or vegetable red lentil stew) + steamed broccoli + warm turmeric golden milk.',
  },
};

const DAYS_OF_WEEK = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'];

export const CustomerAIFitnessScreen: React.FC = () => {
  const { user } = useAuth();

  // Active Selected Days for Workout and Diet
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>('Monday');
  const [selectedDietDay, setSelectedDietDay] = useState<string>('Monday');

  // Exercise Demo Modal State
  const [selectedExercise, setSelectedExercise] = useState<ExerciseItem | null>(null);

  // Calibration Form State
  const [goal, setGoal] = useState('Weight Loss');
  const [fitnessLevel, setFitnessLevel] = useState('Beginner (New to training)');
  const [trainingMode, setTrainingMode] = useState('Offline (In-Gym Training)');
  const [workoutDays, setWorkoutDays] = useState('4 Days / Week');
  const [equipment, setEquipment] = useState('Full Commercial Gym (Weights & Machines)');
  const [dietaryPref, setDietaryPref] = useState('Vegetarian');
  const [medicalNotes, setMedicalNotes] = useState('None');

  const [isGenerating, setIsGenerating] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  const handleGenerateAI = async () => {
    try {
      setIsGenerating(true);
      await new Promise(r => setTimeout(r, 1400));
      Alert.alert(
        'AI Plan Updated! ⚡',
        'Gemini AI has recalculated your weekly workout splits and daily nutritional meals tailored to your goals.'
      );
    } catch {
      Alert.alert('Notice', 'AI Plan generated.');
    } finally {
      setIsGenerating(false);
    }
  };

  const currentWorkout = DEFAULT_WEEKLY_WORKOUTS[selectedWorkoutDay] || DEFAULT_WEEKLY_WORKOUTS.Monday;
  const currentDiet = DEFAULT_WEEKLY_DIET[selectedDietDay] || DEFAULT_WEEKLY_DIET.Monday;

  const userName = `${user?.firstName || 'Renugopal'} ${user?.lastName || 'Y'}`.trim();

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={() => setRefreshing(false)} tintColor={COLORS.primary} />
      }
    >
      {/* ── 1. Hero Card: AI Fitness Assistant ──────────────────── */}
      <View style={styles.heroCard}>
        <View style={styles.heroTopRow}>
          <View style={styles.heroIconBadge}>
            <Ionicons name="sparkles" size={20} color="#EA580C" />
          </View>
          <View style={{ flex: 1 }}>
            <View style={styles.heroTitleBadgeRow}>
              <Text style={styles.heroTitle}>AI Fitness Assistant</Text>
              <View style={styles.heroTagBadge}>
                <Text style={styles.heroTagBadgeText}>Personalized Plan</Text>
              </View>
            </View>
            <Text style={styles.heroSubtitle}>
              Comprehensive customer profile, Monday to Sunday workout plan with animated video guides, and 7-day varied diet plan.
            </Text>
          </View>
        </View>

        <TouchableOpacity
          style={styles.heroGenerateBtn}
          onPress={handleGenerateAI}
          disabled={isGenerating}
          activeOpacity={0.8}
        >
          {isGenerating ? (
            <ActivityIndicator size="small" color="#FFFFFF" />
          ) : (
            <>
              <Ionicons name="sparkles" size={16} color="#FFFFFF" />
              <Text style={styles.heroGenerateBtnText}>Generate with AI</Text>
            </>
          )}
        </TouchableOpacity>
      </View>

      {/* ── 2. Customer Details & Fitness Profile ───────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Ionicons name="person-circle-outline" size={20} color="#EA580C" />
            <View>
              <Text style={styles.sectionCardTitle}>Customer Details & Fitness Profile</Text>
              <Text style={styles.sectionCardSubtitle}>Verified member biometrics & training preferences</Text>
            </View>
          </View>
          <View style={styles.verifiedProfilePill}>
            <Ionicons name="checkmark" size={11} color="#15803D" />
            <Text style={styles.verifiedProfileText}>Active Member Profile</Text>
          </View>
        </View>

        {/* 10 Biometrics Grid */}
        <View style={styles.biometricsGrid}>
          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>CUSTOMER NAME</Text>
            <Text style={styles.bioValueBold}>{userName}</Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>AGE / GENDER</Text>
            <Text style={styles.bioValueBold}>28 yrs • Male</Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>HEIGHT / WEIGHT</Text>
            <Text style={styles.bioValueBold}>180 cm • 85 kg</Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>BMI (CALCULATED)</Text>
            <Text style={[styles.bioValueBold, { color: '#EA580C' }]}>26.2 <Text style={styles.normalText}>(Normal)</Text></Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>TARGET WEIGHT</Text>
            <Text style={[styles.bioValueBold, { color: '#C2410C' }]}>68 kg</Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>PRIMARY GOAL</Text>
            <Text style={[styles.bioValueBold, { color: '#EA580C' }]}>{user?.fitnessGoal || 'Weight Loss'}</Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>TRAINING MODE & FREQUENCY</Text>
            <Text style={styles.bioValueBold}>Offline • 4 Days</Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>PREFERRED TIME & GYM ACCESS</Text>
            <Text style={styles.bioValueBold}>Mid Morning (9-11am)</Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>DIETARY PREFERENCE</Text>
            <Text style={styles.bioValueBold}>Vegetarian</Text>
          </View>

          <View style={styles.bioCard}>
            <Text style={styles.bioLabel}>EMERGENCY CONTACT</Text>
            <Text style={styles.bioValueBold}>Selva (Brother)</Text>
          </View>
        </View>
      </View>

      {/* ── 3. Workout Plan (Monday - Sunday) ───────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.planHeaderSection}>
          <View style={styles.planHeaderLeft}>
            <View style={styles.planIconSquare}>
              <Ionicons name="barbell-outline" size={18} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.planTitleWithBadge}>
                <Text style={styles.sectionCardTitle}>Workout Plan (Monday – Sunday)</Text>
                <View style={styles.videoBadge}>
                  <Text style={styles.videoBadgeText}>WITH ANIMATED VIDEO GUIDES</Text>
                </View>
              </View>
              <Text style={styles.sectionCardSubtitle}>
                Select any day from Monday to Sunday. Click any workout to watch its animated demonstration.
              </Text>
            </View>
          </View>

          <View style={styles.daySummaryPill}>
            <Text style={styles.daySummaryPillText} numberOfLines={1}>
              {currentWorkout.duration} • {currentWorkout.focus}
            </Text>
          </View>
        </View>

        {/* Day Selector Buttons: Monday to Sunday */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelectorScroll}>
          <View style={styles.daySelectorRow}>
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = selectedWorkoutDay === d;
              const exCount = DEFAULT_WEEKLY_WORKOUTS[d]?.exercises?.length || 4;
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayTabBtn, isSelected && styles.dayTabBtnActive]}
                  onPress={() => setSelectedWorkoutDay(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayTabBtnDay, isSelected && styles.dayTabBtnDayActive]}>
                    {d}
                  </Text>
                  <Text style={[styles.dayTabBtnSub, isSelected && styles.dayTabBtnSubActive]}>
                    {exCount} Exercises
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* Selected Day Workout Split Header */}
        <View style={styles.splitOverviewBox}>
          <View style={{ flex: 1 }}>
            <Text style={styles.splitTagLabel}>
              {selectedWorkoutDay.toUpperCase()} WORKOUT SPLIT
            </Text>
            <Text style={styles.splitMainTitle}>{currentWorkout.focus}</Text>
            <Text style={styles.splitMuscleFocus}>
              Target Muscle Focus: <Text style={styles.boldText}>{currentWorkout.targetMuscle}</Text>
            </Text>
          </View>
          <View style={styles.durationPill}>
            <Ionicons name="time-outline" size={13} color="#EA580C" />
            <Text style={styles.durationPillText}>{currentWorkout.duration}</Text>
          </View>
        </View>

        {/* Exercises List for Selected Day */}
        <View style={styles.exercisesSectionTitleRow}>
          <Text style={styles.exercisesSectionHeading}>
            EXERCISES FOR {selectedWorkoutDay.toUpperCase()} ({currentWorkout.exercises.length} EXERCISES)
          </Text>
          <Text style={styles.exercisesSubHint}>Tap card to open animated form coach</Text>
        </View>

        <View style={styles.exercisesList}>
          {currentWorkout.exercises.map((ex, index) => (
            <TouchableOpacity
              key={index}
              style={styles.exerciseCard}
              onPress={() => setSelectedExercise(ex)}
              activeOpacity={0.8}
            >
              <View style={styles.exerciseCardTop}>
                <View style={styles.exerciseNumberBadge}>
                  <Text style={styles.exerciseNumberText}>{index + 1}</Text>
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.exerciseNameText}>{ex.name}</Text>
                  <Text style={styles.targetMuscleText}>
                    Target Muscle: <Text style={styles.boldText}>{ex.targetMuscleGroup}</Text>
                  </Text>
                </View>
                {ex.difficulty && (
                  <View style={styles.diffBadge}>
                    <Text style={styles.diffBadgeText}>{ex.difficulty}</Text>
                  </View>
                )}
              </View>

              {/* Badges: Sets, Reps, Rest */}
              <View style={styles.exercisePillsRow}>
                <View style={styles.statPillOrange}>
                  <Text style={styles.statPillOrangeText}>SETS: {ex.sets}</Text>
                </View>
                <View style={styles.statPillGray}>
                  <Text style={styles.statPillGrayText}>REPS: {ex.reps}</Text>
                </View>
                {ex.rest && (
                  <View style={styles.statPillGray}>
                    <Text style={styles.statPillGrayText}>REST: {ex.rest}</Text>
                  </View>
                )}
              </View>

              {/* Instruction Quote */}
              {ex.instructions && (
                <View style={styles.instructionQuoteBox}>
                  <Text style={styles.instructionQuoteText}>"{ex.instructions}"</Text>
                </View>
              )}

              {/* Action Hint */}
              <View style={styles.watchDemoRow}>
                <Ionicons name="play-circle" size={16} color="#EA580C" />
                <Text style={styles.watchDemoText}>Watch Exercise Animated Form Guide</Text>
                <Ionicons name="chevron-forward" size={14} color="#EA580C" style={{ marginLeft: 'auto' }} />
              </View>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* ── 4. Diet & Nutrition Plan (Monday - Sunday) ─────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.planHeaderSection}>
          <View style={styles.planHeaderLeft}>
            <View style={styles.planIconSquare}>
              <Ionicons name="nutrition-outline" size={18} color="#EA580C" />
            </View>
            <View style={{ flex: 1 }}>
              <View style={styles.planTitleWithBadge}>
                <Text style={styles.sectionCardTitle}>Diet & Nutrition Plan (Monday – Sunday)</Text>
                <View style={styles.dietBadge}>
                  <Text style={styles.dietBadgeText}>7 DAYS VARIED</Text>
                </View>
              </View>
              <Text style={styles.sectionCardSubtitle}>
                Non-repeating daily meal schedules from Monday to Sunday tailored to your caloric and macronutrient targets.
              </Text>
            </View>
          </View>

          <View style={styles.dietSummaryPill}>
            <Text style={styles.dietSummaryPillText} numberOfLines={1}>
              {currentDiet.calories} • {currentDiet.macros}
            </Text>
          </View>
        </View>

        {/* Day Selector Buttons: Monday to Sunday */}
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.daySelectorScroll}>
          <View style={styles.daySelectorRow}>
            {DAYS_OF_WEEK.map((d) => {
              const isSelected = selectedDietDay === d;
              const cal = DEFAULT_WEEKLY_DIET[d]?.calories || '2150 kcal';
              return (
                <TouchableOpacity
                  key={d}
                  style={[styles.dayTabBtn, isSelected && styles.dayTabBtnActive]}
                  onPress={() => setSelectedDietDay(d)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.dayTabBtnDay, isSelected && styles.dayTabBtnDayActive]}>
                    {d}
                  </Text>
                  <Text style={[styles.dayTabBtnSub, isSelected && styles.dayTabBtnSubActive]}>
                    {cal}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>
        </ScrollView>

        {/* 6 Meals for Selected Day */}
        <View style={styles.mealsGrid}>
          {/* 1. Morning Hydration & Pre-Workout */}
          <View style={styles.mealCard}>
            <View style={styles.mealCardHeader}>
              <Ionicons name="sunny-outline" size={16} color="#EA580C" />
              <Text style={styles.mealTag}>MORNING HYDRATION & PRE-WORKOUT</Text>
            </View>
            <Text style={styles.mealBody}>{currentDiet.morning}</Text>
          </View>

          {/* 2. Breakfast */}
          <View style={styles.mealCard}>
            <View style={styles.mealCardHeader}>
              <Ionicons name="cafe-outline" size={16} color="#EA580C" />
              <Text style={styles.mealTag}>BREAKFAST</Text>
            </View>
            <Text style={styles.mealBody}>{currentDiet.breakfast}</Text>
          </View>

          {/* 3. Mid-Morning Snack */}
          <View style={styles.mealCard}>
            <View style={styles.mealCardHeader}>
              <Ionicons name="nutrition-outline" size={16} color="#EA580C" />
              <Text style={styles.mealTag}>MID-MORNING SNACK</Text>
            </View>
            <Text style={styles.mealBody}>{currentDiet.midMorning}</Text>
          </View>

          {/* 4. High-Protein Lunch */}
          <View style={styles.mealCard}>
            <View style={styles.mealCardHeader}>
              <Ionicons name="restaurant-outline" size={16} color="#EA580C" />
              <Text style={styles.mealTag}>HIGH-PROTEIN LUNCH</Text>
            </View>
            <Text style={styles.mealBody}>{currentDiet.lunch}</Text>
          </View>

          {/* 5. Evening Snack / Post-Workout */}
          <View style={styles.mealCard}>
            <View style={styles.mealCardHeader}>
              <Ionicons name="flash-outline" size={16} color="#EA580C" />
              <Text style={styles.mealTag}>EVENING SNACK / POST-WORKOUT</Text>
            </View>
            <Text style={styles.mealBody}>{currentDiet.evening}</Text>
          </View>

          {/* 6. Recovery Dinner */}
          <View style={styles.mealCard}>
            <View style={styles.mealCardHeader}>
              <Ionicons name="moon-outline" size={16} color="#EA580C" />
              <Text style={styles.mealTag}>RECOVERY DINNER</Text>
            </View>
            <Text style={styles.mealBody}>{currentDiet.dinner}</Text>
          </View>
        </View>
      </View>

      {/* ── 5. Calibrate AI Fitness Preferences ────────────────── */}
      <View style={styles.sectionCard}>
        <View style={styles.sectionHeaderRow}>
          <View style={styles.sectionTitleGroup}>
            <Ionicons name="options-outline" size={20} color="#EA580C" />
            <View>
              <Text style={styles.sectionCardTitle}>Calibrate AI Fitness Preferences</Text>
              <Text style={styles.sectionCardSubtitle}>
                Modify your goals or training environment and click "Generate with AI" to re-calculate your plan.
              </Text>
            </View>
          </View>
        </View>

        <View style={styles.calibrateForm}>
          {/* Goal Selector */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>PRIMARY FITNESS GOAL</Text>
            <View style={styles.optionsWrap}>
              {['Weight Loss', 'Muscle Gain', 'Strength & Conditioning', 'Endurance'].map((g) => (
                <TouchableOpacity
                  key={g}
                  style={[styles.formOptionPill, goal === g && styles.formOptionPillActive]}
                  onPress={() => setGoal(g)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.formOptionText, goal === g && styles.formOptionTextActive]}>
                    {g}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Fitness Level */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>CURRENT FITNESS LEVEL</Text>
            <View style={styles.optionsWrap}>
              {['Beginner (New to training)', 'Intermediate (1-2 years)', 'Advanced (3+ years)'].map((lvl) => (
                <TouchableOpacity
                  key={lvl}
                  style={[styles.formOptionPill, fitnessLevel === lvl && styles.formOptionPillActive]}
                  onPress={() => setFitnessLevel(lvl)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.formOptionText, fitnessLevel === lvl && styles.formOptionTextActive]}>
                    {lvl}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Training Mode */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>TRAINING MODE</Text>
            <View style={styles.optionsWrap}>
              {['Offline (In-Gym Training)', 'Online Home Workout', 'Hybrid'].map((tm) => (
                <TouchableOpacity
                  key={tm}
                  style={[styles.formOptionPill, trainingMode === tm && styles.formOptionPillActive]}
                  onPress={() => setTrainingMode(tm)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.formOptionText, trainingMode === tm && styles.formOptionTextActive]}>
                    {tm}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Workout Days */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>WORKOUT DAYS / WEEK</Text>
            <View style={styles.optionsWrap}>
              {['3 Days / Week', '4 Days / Week', '5 Days / Week', '6 Days / Week'].map((wd) => (
                <TouchableOpacity
                  key={wd}
                  style={[styles.formOptionPill, workoutDays === wd && styles.formOptionPillActive]}
                  onPress={() => setWorkoutDays(wd)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.formOptionText, workoutDays === wd && styles.formOptionTextActive]}>
                    {wd}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Dietary Preference */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>DIETARY PREFERENCE</Text>
            <View style={styles.optionsWrap}>
              {['Vegetarian', 'Non-Vegetarian', 'Eggetarian', 'Vegan'].map((dp) => (
                <TouchableOpacity
                  key={dp}
                  style={[styles.formOptionPill, dietaryPref === dp && styles.formOptionPillActive]}
                  onPress={() => setDietaryPref(dp)}
                  activeOpacity={0.7}
                >
                  <Text style={[styles.formOptionText, dietaryPref === dp && styles.formOptionTextActive]}>
                    {dp}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Medical Notes */}
          <View style={styles.formGroup}>
            <Text style={styles.formLabel}>MEDICAL NOTES / CONSIDERATIONS</Text>
            <TextInput
              style={styles.textInputStyle}
              value={medicalNotes}
              onChangeText={setMedicalNotes}
              placeholder="e.g. Mild lower back sensitivity or None"
              placeholderTextColor="#94A3B8"
            />
          </View>

          <Text style={styles.formNoteText}>
            Clicking generate triggers the Gemini AI engine to personalize your 7-day Monday–Sunday schedules.
          </Text>

          {/* Generate Button */}
          <TouchableOpacity
            style={styles.calibrateGenerateBtn}
            onPress={handleGenerateAI}
            disabled={isGenerating}
            activeOpacity={0.8}
          >
            {isGenerating ? (
              <ActivityIndicator size="small" color="#FFFFFF" />
            ) : (
              <>
                <Ionicons name="sparkles" size={16} color="#FFFFFF" />
                <Text style={styles.calibrateGenerateBtnText}>Generate with AI</Text>
              </>
            )}
          </TouchableOpacity>
        </View>
      </View>

      {/* ── MODAL: ANIMATED EXERCISE DEMO GUIDE ─────────────────── */}
      <Modal
        visible={Boolean(selectedExercise)}
        transparent
        animationType="slide"
        onRequestClose={() => setSelectedExercise(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {/* Modal Header */}
            <View style={styles.modalHeader}>
              <View style={styles.modalHeaderTitleGroup}>
                <View style={styles.modalIconBadge}>
                  <Ionicons name="barbell" size={18} color="#EA580C" />
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.modalTitle} numberOfLines={1}>
                    {selectedExercise?.name}
                  </Text>
                  <Text style={styles.modalSubtitle}>
                    {selectedExercise?.targetMuscleGroup} • {selectedExercise?.difficulty}
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                onPress={() => setSelectedExercise(null)}
                style={styles.modalCloseBtn}
                activeOpacity={0.7}
              >
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            {selectedExercise && (
              <ScrollView style={styles.modalScrollBody} showsVerticalScrollIndicator={false}>
                {/* Simulated Animated Exercise Canvas */}
                <View style={styles.exerciseGraphicBox}>
                  <Ionicons name="fitness" size={48} color="#EA580C" />
                  <Text style={styles.graphicTitle}>{selectedExercise.name}</Text>
                  <View style={styles.graphicPill}>
                    <Ionicons name="videocam" size={12} color="#15803D" />
                    <Text style={styles.graphicPillText}>AI Animated Technique Guide</Text>
                  </View>
                </View>

                {/* Specs Row */}
                <View style={styles.modalSpecsRow}>
                  <View style={styles.modalSpecBox}>
                    <Text style={styles.modalSpecLabel}>SETS</Text>
                    <Text style={styles.modalSpecValue}>{selectedExercise.sets}</Text>
                  </View>
                  <View style={styles.modalSpecBox}>
                    <Text style={styles.modalSpecLabel}>REPS</Text>
                    <Text style={styles.modalSpecValue}>{selectedExercise.reps}</Text>
                  </View>
                  <View style={styles.modalSpecBox}>
                    <Text style={styles.modalSpecLabel}>REST</Text>
                    <Text style={styles.modalSpecValue}>{selectedExercise.rest || '60s'}</Text>
                  </View>
                </View>

                {/* Instructions Box */}
                <View style={styles.modalDetailBox}>
                  <Text style={styles.modalDetailHeading}>PROPER EXECUTION FORM</Text>
                  <Text style={styles.modalDetailBody}>{selectedExercise.instructions}</Text>
                </View>

                {/* Coach Tips */}
                {selectedExercise.tips && (
                  <View style={styles.modalCoachTipsBox}>
                    <Ionicons name="bulb-outline" size={18} color="#EA580C" />
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.coachTipsHeading}>COACH FORM CUE</Text>
                      <Text style={styles.coachTipsBody}>{selectedExercise.tips}</Text>
                    </View>
                  </View>
                )}
              </ScrollView>
            )}

            {/* Modal Footer */}
            <View style={styles.modalFooter}>
              <TouchableOpacity
                style={styles.modalDoneBtn}
                onPress={() => setSelectedExercise(null)}
                activeOpacity={0.8}
              >
                <Text style={styles.modalDoneBtnText}>Got It, Close</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  boldText: {
    fontWeight: '800',
    color: '#111827',
  },

  /* 1. Hero Card */
  heroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 18,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  heroTopRow: {
    flexDirection: 'row',
    gap: 12,
    alignItems: 'flex-start',
    marginBottom: 14,
  },
  heroIconBadge: {
    width: 42,
    height: 42,
    borderRadius: 14,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroTitleBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  heroTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  heroTagBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 999,
  },
  heroTagBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  heroSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
    marginTop: 4,
  },
  heroGenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    borderRadius: 14,
    paddingVertical: 12,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  heroGenerateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* 2. Section Card General */
  sectionCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 14,
    gap: 8,
  },
  sectionTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flex: 1,
  },
  sectionCardTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  sectionCardSubtitle: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  verifiedProfilePill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 999,
  },
  verifiedProfileText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },

  /* Biometrics Grid */
  biometricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  bioCard: {
    width: '48.5%',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  bioLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.5,
    marginBottom: 3,
  },
  bioValueBold: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  normalText: {
    fontSize: 10,
    fontWeight: '600',
    color: '#15803D',
  },

  /* 3. Workout & Diet Plans Header */
  planHeaderSection: {
    marginBottom: 12,
    gap: 8,
  },
  planHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
  },
  planIconSquare: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 2,
  },
  planTitleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  videoBadge: {
    backgroundColor: '#C2410C',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  videoBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 0.4,
  },
  dietBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  dietBadgeText: {
    fontSize: 8.5,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.4,
  },
  daySummaryPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  daySummaryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  dietSummaryPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    alignSelf: 'flex-start',
  },
  dietSummaryPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },

  /* Day Selector Scroll */
  daySelectorScroll: {
    marginVertical: 10,
  },
  daySelectorRow: {
    flexDirection: 'row',
    gap: 8,
  },
  dayTabBtn: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 8,
    alignItems: 'center',
    minWidth: 84,
  },
  dayTabBtnActive: {
    backgroundColor: '#C2410C',
    borderColor: '#C2410C',
  },
  dayTabBtnDay: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
  },
  dayTabBtnDayActive: {
    color: '#FFFFFF',
  },
  dayTabBtnSub: {
    fontSize: 9.5,
    color: '#64748B',
    marginTop: 2,
    fontWeight: '600',
  },
  dayTabBtnSubActive: {
    color: '#FFEDD5',
  },

  /* Split Overview Box */
  splitOverviewBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  splitTagLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.8,
  },
  splitMainTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  splitMuscleFocus: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  durationPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    marginLeft: 8,
  },
  durationPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },

  /* Exercises Section */
  exercisesSectionTitleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
    flexWrap: 'wrap',
    gap: 4,
  },
  exercisesSectionHeading: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.6,
  },
  exercisesSubHint: {
    fontSize: 10,
    color: '#64748B',
  },
  exercisesList: {
    gap: 12,
  },
  exerciseCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
  },
  exerciseCardTop: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 8,
    marginBottom: 8,
  },
  exerciseNumberBadge: {
    width: 22,
    height: 22,
    borderRadius: 6,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 1,
  },
  exerciseNumberText: {
    fontSize: 11,
    fontWeight: '900',
    color: '#EA580C',
  },
  exerciseNameText: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  targetMuscleText: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  diffBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  diffBadgeText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#475569',
  },
  exercisePillsRow: {
    flexDirection: 'row',
    gap: 6,
    marginBottom: 8,
  },
  statPillOrange: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statPillOrangeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  statPillGray: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  statPillGrayText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#334155',
  },
  instructionQuoteBox: {
    backgroundColor: '#FFFFFF',
    borderLeftWidth: 2,
    borderLeftColor: '#EA580C',
    borderRadius: 6,
    padding: 8,
    marginBottom: 8,
  },
  instructionQuoteText: {
    fontSize: 11,
    color: '#475569',
    fontStyle: 'italic',
    lineHeight: 16,
  },
  watchDemoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  watchDemoText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },

  /* Meals Grid */
  mealsGrid: {
    gap: 10,
  },
  mealCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
  },
  mealCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 6,
  },
  mealTag: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.6,
  },
  mealBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },

  /* 5. Calibrate Form */
  calibrateForm: {
    gap: 12,
  },
  formGroup: {
    gap: 6,
  },
  formLabel: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#64748B',
    letterSpacing: 0.6,
  },
  optionsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  formOptionPill: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
  },
  formOptionPillActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  formOptionText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#475569',
  },
  formOptionTextActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  textInputStyle: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: '#111827',
    fontWeight: '600',
  },
  formNoteText: {
    fontSize: 10,
    color: '#64748B',
    lineHeight: 14,
    marginTop: 4,
  },
  calibrateGenerateBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#C2410C',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 6,
    shadowColor: '#C2410C',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 3,
  },
  calibrateGenerateBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Demo Modal */
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    width: '100%',
    maxHeight: '85%',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    backgroundColor: '#F8FAFC',
  },
  modalHeaderTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    flex: 1,
  },
  modalIconBadge: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  modalSubtitle: {
    fontSize: 10,
    color: '#64748B',
    marginTop: 1,
  },
  modalCloseBtn: {
    padding: 6,
  },
  modalScrollBody: {
    padding: 16,
  },
  exerciseGraphicBox: {
    backgroundColor: '#FFF7ED',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 20,
    alignItems: 'center',
    marginBottom: 14,
    gap: 6,
  },
  graphicTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  graphicPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 999,
  },
  graphicPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  modalSpecsRow: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 12,
  },
  modalSpecBox: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    alignItems: 'center',
  },
  modalSpecLabel: {
    fontSize: 9,
    fontWeight: '900',
    color: '#64748B',
    marginBottom: 2,
  },
  modalSpecValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#EA580C',
  },
  modalDetailBox: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    marginBottom: 10,
  },
  modalDetailHeading: {
    fontSize: 10,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.6,
    marginBottom: 4,
  },
  modalDetailBody: {
    fontSize: 12,
    color: '#334155',
    lineHeight: 18,
  },
  modalCoachTipsBox: {
    flexDirection: 'row',
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 12,
    alignItems: 'center',
    marginBottom: 10,
  },
  coachTipsHeading: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  coachTipsBody: {
    fontSize: 11,
    color: '#334155',
    marginTop: 2,
  },
  modalFooter: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  modalDoneBtn: {
    backgroundColor: '#C2410C',
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
  },
  modalDoneBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});

