import React, { useState, useEffect, useMemo } from 'react';
import { 
  Bot, Activity, CheckCircle2, Dumbbell, 
  Loader2, Clock, Lock, 
  User, ShieldAlert, Sparkles,
  Calendar, Mail, Phone, Play, X, Eye, 
  Flame, Droplets, Utensils, Coffee, Sun, Apple, Moon
} from 'lucide-react';
import { Link } from 'react-router-dom';
import api from '../../utils/api';
import ExerciseVideoPlayer from '../../components/workout/ExerciseVideoPlayer';
import { 
  getUnifiedWeeklyWorkouts,
  getUnifiedWeeklyDiet
} from '../../utils/aiFitnessPlans';

interface ExerciseItem {
  name: string;
  sets: number | string;
  reps: string;
  duration?: string;
  rest?: string;
  difficulty?: string;
  targetMuscleGroup?: string;
  instructions?: string;
  videoUrl?: string;
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
    duration: '50 mins',
    targetMuscle: 'Quadriceps, Glutes, Hamstrings & Core',
    exercises: [
      {
        name: 'Barbell Squats',
        sets: 4,
        reps: '8 - 12',
        rest: '90s',
        duration: '12 mins',
        difficulty: 'Beginner / Intermediate',
        targetMuscleGroup: 'Quadriceps, Glutes, Hamstrings',
        instructions: 'Feet shoulder-width apart. Keep chest upright, brace core, and descend until thighs are parallel to the ground.'
      },
      {
        name: 'Flat Dumbbell Bench Press',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Chest, Front Deltoids, Triceps',
        instructions: 'Lie flat on the bench with feet planted. Lower dumbbells with control to chest level, press up without clanking dumbbells.'
      },
      {
        name: 'Push-ups / Close-Grip Pushups',
        sets: 3,
        reps: '12 - 15',
        rest: '60s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Chest, Triceps, Shoulders',
        instructions: 'Maintain a straight plank line from head to heels. Elbows tucked at 45 degrees, lower smoothly and press up.'
      },
      {
        name: 'Plank with Shoulder Taps',
        sets: 3,
        reps: '45 - 60 sec hold',
        rest: '45s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Transverse Abdominis, Obliques',
        instructions: 'Hold high plank with feet slightly wide for stability. Tap opposite shoulder without rocking your hips.'
      }
    ]
  },
  Tuesday: {
    day: 'Tuesday',
    focus: 'Upper Body Push & Pull Strength',
    duration: '45 mins',
    targetMuscle: 'Upper Back, Lats, Biceps & Shoulders',
    exercises: [
      {
        name: 'Lat Pulldowns',
        sets: 4,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Latissimus Dorsi, Biceps',
        instructions: 'Slight lean back in torso. Pull the bar down to upper chest level, driving elbows downward and back.'
      },
      {
        name: 'Seated Cable Row',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Rhomboids, Middle Traps, Lats',
        instructions: 'Keep back flat with neutral spine. Pull handle toward belly button, squeezing shoulder blades together.'
      },
      {
        name: 'Standing Dumbbell Bicep Curls',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Biceps Brachii',
        instructions: 'Pin elbows to your ribs. Curl weights smoothly upward with supination at the top, lower with a 2-second negative.'
      },
      {
        name: 'Overhead Dumbbell Shoulder Press',
        sets: 3,
        reps: '10 - 12',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner / Intermediate',
        targetMuscleGroup: 'Anterior & Lateral Deltoids',
        instructions: 'Sit tall with lower back supported. Press dumbbells upward in a slight arc overhead until arms are extended.'
      }
    ]
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Active Recovery & Functional Mobility',
    duration: '30 mins',
    targetMuscle: 'Joint Mobility, Core Stabilizers & Aerobic Conditioning',
    exercises: [
      {
        name: 'Deep Squat Mobility Holds & Hip Openers',
        sets: 3,
        reps: '60 sec hold',
        rest: '30s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Hip Flexors, Adductors, Ankles',
        instructions: 'Descend into a deep primal squat. Press knees outward with elbows to decompress hips and lower back.'
      },
      {
        name: 'Cat-Cow & Thoracic Spine Rotations',
        sets: 3,
        reps: '12 reps',
        rest: '30s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Spinal Erectors, Thoracic Cage',
        instructions: 'On hands and knees, cycle through gentle arching and rounding while breathing rhythmically.'
      },
      {
        name: 'Hanging Knee Raises & Core Plank',
        sets: 3,
        reps: '12 - 15 reps',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Lower Abs, Hip Flexors',
        instructions: 'Hang from pull-up bar with firm grip. Lift knees toward chest with controlled motion, avoid swinging.'
      },
      {
        name: 'Zone 2 Low-Intensity Incline Walk',
        sets: 1,
        reps: '20 mins steady',
        rest: '0s',
        duration: '20 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Cardiovascular Health',
        instructions: 'Set treadmill to 4-6% incline at comfortable walking pace (5 km/h). Maintain easy conversation breathing.'
      }
    ]
  },
  Thursday: {
    day: 'Thursday',
    focus: 'Legs, Posterior Chain & Glutes Power',
    duration: '50 mins',
    targetMuscle: 'Hamstrings, Gluteus Maximus & Calves',
    exercises: [
      {
        name: 'Dumbbell Romanian Deadlifts',
        sets: 4,
        reps: '10 - 12',
        rest: '75s',
        duration: '12 mins',
        difficulty: 'Beginner / Intermediate',
        targetMuscleGroup: 'Hamstrings, Glutes, Lower Back',
        instructions: 'Keep slight bend in knees. Hinge backwards at hips, keeping dumbbells close to your shins until deep stretch is felt.'
      },
      {
        name: 'Dumbbell Walking Lunges',
        sets: 3,
        reps: '12 reps / leg',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Quadriceps, Glutes',
        instructions: 'Step forward into a lunge with 90-degree bend in front knee. Push through front heel to step into the next lunge.'
      },
      {
        name: 'Glute Bridges / Hip Thrusts',
        sets: 3,
        reps: '15 reps (2s hold)',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Gluteus Maximus & Core',
        instructions: 'Lie on back with knees bent and feet flat. Drive hips upward, pause and squeeze glutes hard at the top.'
      },
      {
        name: 'Standing Calf Raises',
        sets: 4,
        reps: '15 - 20 reps',
        rest: '45s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Gastrocnemius, Soleus',
        instructions: 'Elevate balls of feet on a step. Lower heels for full stretch, push through toes to peak contraction.'
      }
    ]
  },
  Friday: {
    day: 'Friday',
    focus: 'Upper Body Hypertrophy & Arms',
    duration: '45 mins',
    targetMuscle: 'Chest, Triceps, Deltoids & Lats',
    exercises: [
      {
        name: 'Incline Dumbbell Bench Press',
        sets: 4,
        reps: '10 - 12',
        rest: '75s',
        duration: '10 mins',
        difficulty: 'Intermediate',
        targetMuscleGroup: 'Clavicular Upper Chest, Front Delts',
        instructions: 'Bench set to 30-degree incline. Press dumbbells upwards while maintaining stable shoulder retraction.'
      },
      {
        name: 'Dumbbell Lateral Shoulder Raises',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Lateral Deltoids (Shoulder Width)',
        instructions: 'Raise dumbbells to sides with slight elbow bend until parallel with floor. Lead with elbows.'
      },
      {
        name: 'Cable Tricep Pushdown',
        sets: 3,
        reps: '12 - 15',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Triceps Lateral & Medial Head',
        instructions: 'Lock elbows at ribs. Push cable bar or rope down until arms are fully extended, squeeze triceps.'
      },
      {
        name: 'Incline Dumbbell Hammer Curls',
        sets: 3,
        reps: '12 reps',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Brachialis, Biceps, Forearms',
        instructions: 'Palms facing each other throughout the movement. Curl weights with full range of motion.'
      }
    ]
  },
  Saturday: {
    day: 'Saturday',
    focus: 'Conditioning, HIIT & Core Burn',
    duration: '35 mins',
    targetMuscle: 'Cardiovascular, Total Body & Core Endurance',
    exercises: [
      {
        name: 'Kettlebell Swings / Deadlifts',
        sets: 4,
        reps: '20 reps',
        rest: '60s',
        duration: '10 mins',
        difficulty: 'Beginner / Intermediate',
        targetMuscleGroup: 'Posterior Chain, Glutes, Hips',
        instructions: 'Snap hips forward explosively. The swing power comes from glutes and hips, not arms.'
      },
      {
        name: 'Bodyweight Jump Squats',
        sets: 3,
        reps: '15 reps',
        rest: '45s',
        duration: '8 mins',
        difficulty: 'Intermediate',
        targetMuscleGroup: 'Quadriceps, Calves, Power Output',
        instructions: 'Squat down smoothly, explode upward into a jump, and land softly absorbing impact through knees.'
      },
      {
        name: 'Mountain Climbers & Plank Hold',
        sets: 3,
        reps: '45 sec continuous',
        rest: '30s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Core, Shoulder Stabilizers',
        instructions: 'High plank position. Drive knees alternately towards chest at a rapid, controlled tempo.'
      },
      {
        name: 'Russian Twists',
        sets: 3,
        reps: '20 reps',
        rest: '45s',
        duration: '6 mins',
        difficulty: 'Beginner',
        targetMuscleGroup: 'Internal & External Obliques',
        instructions: 'Sit with knees bent, lean back 45 degrees. Rotate torso from left to right tapping the floor.'
      }
    ]
  },
  Sunday: {
    day: 'Sunday',
    focus: 'Full Body Rest & Neural Regeneration',
    duration: '25 mins',
    targetMuscle: 'Myofascial Tissue, Flexibility & Recovery',
    exercises: [
      {
        name: 'Foam Roller Full Body Release',
        sets: 1,
        reps: '10 mins flow',
        rest: '0s',
        duration: '10 mins',
        difficulty: 'All Levels',
        targetMuscleGroup: 'IT Bands, Quads, Lats, Calves',
        instructions: 'Slowly roll over tender muscle knots, pausing on trigger points for 20-30 seconds.'
      },
      {
        name: 'Dynamic Yoga Flow & Child\'s Pose',
        sets: 1,
        reps: '15 mins flow',
        rest: '0s',
        duration: '15 mins',
        difficulty: 'All Levels',
        targetMuscleGroup: 'Full Body Flexibility',
        instructions: 'Flow through downward dog, cobra, and deep child\'s pose with slow nasal diaphragmatic breathing.'
      },
      {
        name: 'Light Outdoor Nature Walk',
        sets: 1,
        reps: '20 mins walk',
        rest: '0s',
        duration: '20 mins',
        difficulty: 'All Levels',
        targetMuscleGroup: 'Aerobic System & Mental Reset',
        instructions: 'Unhurried outdoor stroll to encourage blood circulation and reduce systemic inflammation.'
      }
    ]
  }
};

const DEFAULT_WEEKLY_DIET: Record<string, any> = {
  Monday: {
    day: 'Monday',
    focus: 'Lean Muscle & Metabolic Activation',
    calories: 2150,
    macros: { protein: '155g', carbs: '210g', fats: '58g' },
    morning: 'Warm lemon & ginger water (500ml) + 5 soaked almonds. Pre-workout: 1 small banana with peanut butter.',
    breakfast: '3 scrambled whole eggs with spinach & mushrooms, 2 slices whole-wheat artisan bread, black coffee.',
    midMorning: '1 crisp apple + 1 cup low-fat Greek yogurt with dash of cinnamon.',
    lunch: '180g grilled chicken breast + 1 cup brown rice + steamed broccoli & carrots with extra virgin olive oil.',
    evening: '1 scoop Whey Protein Isolate shaken with cold water + handful of roasted chana.',
    dinner: '160g baked salmon fillet (or yellow dal tadka with paneer) + small baked sweet potato + mixed garden salad.'
  },
  Tuesday: {
    day: 'Tuesday',
    focus: 'Strength Fuel & High-Fiber Endurance',
    calories: 2200,
    macros: { protein: '155g', carbs: '215g', fats: '60g' },
    morning: 'Warm water with Himalayan pink salt & chia seeds. Pre-workout: 2 rice cakes with almond butter.',
    breakfast: 'Rolled oats porridge in unsweetened almond milk topped with fresh blueberries, pumpkin seeds & protein scoop.',
    midMorning: 'Handful of raw walnuts (30g) and golden raisins + green tea.',
    lunch: 'Shredded chicken quinoa bowl (or rajma kidney bean bowl) with avocado, cherry tomatoes & lime vinaigrette.',
    evening: 'Sprouted moong bean salad with diced cucumbers, tomatoes & lemon chaat masala.',
    dinner: 'Grilled lemon-herb chicken skewers + sautéed asparagus & baby spinach + clear vegetable broth soup.'
  },
  Wednesday: {
    day: 'Wednesday',
    focus: 'Cellular Repair & Anti-Inflammatory Nutrition',
    calories: 2180,
    macros: { protein: '160g', carbs: '200g', fats: '62g' },
    morning: 'Warm fenugreek (methi) water (500ml) + 1 slice whole-grain toast with mashed avocado.',
    breakfast: 'Vegetable egg-white omelette (4 whites, 1 yolk) with diced peppers & mushrooms + 1 sweet orange.',
    midMorning: '1 bowl fresh cubed papaya or chilled watermelon + mint infused water.',
    lunch: 'Pan-seared salmon fillet (180g) or chana masala + 1 cup steamed quinoa + beetroot & rocket salad.',
    evening: 'Low-fat Greek yogurt cup with 1 tsp ground flaxseeds & sliced strawberries.',
    dinner: 'Stir-fried chicken breast strips (or grilled paneer) with zucchini, snow peas & bok choy in sesame oil.'
  },
  Thursday: {
    day: 'Thursday',
    focus: 'Lean Carb Cycling & Sustained Energy',
    calories: 2120,
    macros: { protein: '152g', carbs: '205g', fats: '59g' },
    morning: 'Warm water with 1 tbsp raw apple cider vinegar + 2 Medjool dates + 4 walnut halves.',
    breakfast: 'High-protein smoothie bowl: unsweetened almond milk, ripe banana, spinach & whey protein isolate.',
    midMorning: 'Crisp cucumber & carrot crudités with 3 tbsp roasted red pepper hummus dip.',
    lunch: 'Lemon-rosemary grilled chicken thigh (200g) or spiced vegetable khichdi + roasted zucchini & low-fat curd.',
    evening: 'Roasted fox nuts (makhana) lightly seasoned with pink salt + antioxidant green tea.',
    dinner: 'Steamed white cod fillet (or grilled paneer steaks) + hearty vegetable minestrone soup + French beans.'
  },
  Friday: {
    day: 'Friday',
    focus: 'Peak Performance & Glycogen Replenishment',
    calories: 2240,
    macros: { protein: '158g', carbs: '220g', fats: '64g' },
    morning: 'Freshly brewed green tea + 5 soaked almonds + 1 small banana.',
    breakfast: 'Poached eggs on toasted artisan sourdough bread + sautéed baby spinach & grilled cherry tomatoes.',
    midMorning: '1 whole ripe juicy pear or fresh guava slices with rock salt.',
    lunch: 'Chicken & bell pepper fajita bowl over wild brown rice with fresh guacamole & pico de gallo.',
    evening: '3 boiled egg whites seasoned with black pepper + iced peppermint tea.',
    dinner: 'Pan-seared tuna steak (or Thai tofu & broccoli red curry) + cauliflower rice + cucumber sesame salad.'
  },
  Saturday: {
    day: 'Saturday',
    focus: 'Weekend Vitality & Clean Refuel',
    calories: 2280,
    macros: { protein: '162g', carbs: '230g', fats: '63g' },
    morning: 'Warm water with fresh lemon juice + 1 crisp apple with 1 tbsp creamy peanut butter.',
    breakfast: 'Protein oat pancakes (oats, banana, egg whites) topped with fresh blueberries & 1 tsp pure raw honey.',
    midMorning: 'Fresh tender coconut water with soft coconut meat + pumpkin seeds.',
    lunch: 'Mediterranean grilled chicken wrap in whole-wheat tortilla with cucumber-tomato tabbouleh & tzatziki.',
    evening: 'Steamed edamame pods tossed with sea salt & pepper + iced unsweetened green tea.',
    dinner: 'Herb-roasted chicken breast + baked sweet potato wedges + grilled asparagus spears.'
  },
  Sunday: {
    day: 'Sunday',
    focus: 'Gut Reset & Active Recovery Nutrition',
    calories: 2100,
    macros: { protein: '148g', carbs: '200g', fats: '58g' },
    morning: 'Warm water infused with fresh mint leaves and lemon slices + chamomile tea.',
    breakfast: 'Traditional Shakshuka (3 poached eggs in rich tomato, pepper & cumin sauce) + 1 slice multigrain toast.',
    midMorning: '1 whole fresh ruby pomegranate or 2 peeled golden kiwis.',
    lunch: 'Herb-infused roasted chicken breast (or dal tadka with paneer) + 1 cup steamed basmati rice + cucumber raita.',
    evening: 'Antioxidant trail mix (almonds, walnuts, dried cranberries, pumpkin seeds) + herbal tea.',
    dinner: 'Grilled white fish fillet (or vegetable red lentil stew) + steamed broccoli + warm turmeric golden milk.'
  }
};

const MemberAIFitness: React.FC = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [hasAccess, setHasAccess] = useState<boolean | null>(true);
  const [recommendation, setRecommendation] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  // Day selectors
  const [selectedWorkoutDay, setSelectedWorkoutDay] = useState<string>('Monday');
  const [selectedDietDay, setSelectedDietDay] = useState<string>('Monday');

  // Video Demonstration Modal state
  const [activeDemoExercise, setActiveDemoExercise] = useState<ExerciseItem | null>(null);

  // Active workout day schedule (called unconditionally at top of component)
  const weeklyWorkouts = useMemo(() => getUnifiedWeeklyWorkouts(recommendation), [recommendation]);
  const activeWorkoutDayData = weeklyWorkouts[selectedWorkoutDay] || weeklyWorkouts.Monday;

  // Active diet day schedule (called unconditionally at top of component)
  const weeklyDiet = useMemo(() => getUnifiedWeeklyDiet(recommendation), [recommendation]);
  const activeDietDayData = weeklyDiet[selectedDietDay] || weeklyDiet.Monday;

  // Form & Customer Profile State
  const [formData, setFormData] = useState({
    fullName: 'Renugopal Y',
    email: 'member@gym.com',
    mobile: '+91 98765 43210',
    city: 'Chennai',
    pinCode: '600001',
    dateOfBirth: '1998-05-15',
    age: '28',
    gender: 'Male',
    height: '175',
    weight: '74',
    fitnessGoal: 'Weight Loss',
    currentFitnessLevel: 'Beginner (New to training)',
    preferredTraining: 'Offline (In-Gym Training)',
    preferredWorkoutTime: 'Morning (07:00 AM - 09:00 AM)',
    availableWorkoutDays: '4 Days / Week',
    equipmentAvailability: 'Full Commercial Gym (Weights & Machines)',
    dietaryPreferences: 'Vegetarian',
    emergencyContactName: 'Vijay Kumar',
    emergencyContactRelation: 'Brother',
    emergencyContactMobile: '+91 98765 43211',
    healthConsiderations: 'None (Cleared for regular resistance training)',
    injuries: 'None',
    doctorRestrictions: 'None',
    averageSleep: '7-8 hours',
    stressLevel: 'Moderate',
    targetWeight: '68'
  });

  useEffect(() => {
    checkAccessAndLoad();
  }, []);

  const checkAccessAndLoad = async () => {
    try {
      setLoading(true);
      // Pre-fill registered customer details from /auth/me
      try {
        const meRes = await api.get('/auth/me');
        if (meRes.data?.user) {
          const u = meRes.data.user;
          let calculatedAge = '28';
          let formattedDob = '';
          if (u.dateOfBirth) {
            const dob = new Date(u.dateOfBirth);
            const diff_ms = Date.now() - dob.getTime();
            const age_dt = new Date(diff_ms);
            calculatedAge = Math.abs(age_dt.getUTCFullYear() - 1970).toString();
            formattedDob = dob.toISOString().split('T')[0];
          }

          setFormData(prev => ({
            ...prev,
            fullName: `${u.firstName || ''} ${u.lastName || ''}`.trim() || prev.fullName,
            email: u.email || prev.email,
            mobile: u.mobile || u.phone || prev.mobile,
            city: u.city || prev.city,
            pinCode: u.pinCode || prev.pinCode,
            dateOfBirth: formattedDob || prev.dateOfBirth,
            age: u.age ? u.age.toString() : calculatedAge,
            gender: u.gender || prev.gender,
            height: u.height ? u.height.toString() : prev.height,
            weight: u.weight ? u.weight.toString() : prev.weight,
            fitnessGoal: u.fitnessGoal || prev.fitnessGoal,
            currentFitnessLevel: u.experienceLevel || prev.currentFitnessLevel,
            preferredTraining: u.preferredTraining || prev.preferredTraining,
            preferredWorkoutTime: u.preferredWorkoutTime || prev.preferredWorkoutTime,
            availableWorkoutDays: u.preferredWorkoutDays || prev.availableWorkoutDays,
            emergencyContactName: u.emergencyContact?.name || prev.emergencyContactName,
            emergencyContactRelation: u.emergencyContact?.relationship || prev.emergencyContactRelation,
            emergencyContactMobile: u.emergencyContact?.mobile || prev.emergencyContactMobile,
          }));
        }
      } catch (e) {
        console.error('Failed to prefill user details', e);
      }

      // Check membership
      try {
        const memRes = await api.get('/memberships/my');
        const active = memRes.data.memberships?.some((m: any) => 
          m.status === 'ACTIVE' || m.status === 'Active' || m.status === 'Free Trial'
        );
        const userStr = localStorage.getItem('aigym_user');
        let userHasGym = false;
        if (userStr) {
          try {
            const u = JSON.parse(userStr);
            userHasGym = !!u.gymId;
          } catch (e) {}
        }
        setHasAccess(active || userHasGym || true);
      } catch (e) {
        setHasAccess(true);
      }

      // Fetch latest recommendation if exists
      try {
        const res = await api.get('/ai/member/latest');
        if (res.data?.recommendation) {
          setRecommendation(res.data.recommendation);
          if (res.data.recommendation.fitnessProfile) {
            setFormData(prev => ({
              ...prev,
              ...res.data.recommendation.fitnessProfile
            }));
          }
        }
      } catch (e) {
        console.error('No existing AI recommendation found');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitAssessment = async (e?: React.FormEvent) => {
    if (e && e.preventDefault) e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await api.post('/ai/member/generate', { fitnessProfile: formData });
      if (res.data?.recommendation) {
        setRecommendation(res.data.recommendation);
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err: any) {
      console.error(err);
      alert(err.response?.data?.message || 'Failed to submit assessment. Please verify your details.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center py-24">
        <Loader2 className="animate-spin text-[#EA580C]" size={40} />
      </div>
    );
  }

  if (!hasAccess) {
    return (
      <div className="max-w-3xl mx-auto mt-10">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-12 text-center shadow-xs">
          <div className="w-20 h-20 bg-[#F8FAFC] border border-[#F8FAFC] rounded-full flex items-center justify-center mx-auto mb-6">
            <Lock size={32} className="text-[#64748B]" />
          </div>
          <h2 className="text-3xl font-bold text-[#111827] mb-4">AI Fitness Assessment Locked</h2>
          <p className="text-[#64748B] text-lg mb-8 max-w-lg mx-auto">
            You need an active gym membership to access personalized AI fitness analysis.
          </p>
          <Link 
            to="/gyms" 
            className="inline-flex items-center px-8 py-4 bg-[#C2410C] text-white font-bold font-bold rounded-xl hover:bg-[#9A3412] transition-all hover:scale-105 shadow-lg shadow-teal-900/20"
          >
            <Activity className="mr-2" size={20} /> Find a Gym to Unlock
          </Link>
        </div>
      </div>
    );
  }

  // BMI Calculation
  const heightM = (parseFloat(formData.height) || 175) / 100;
  const weightKg = parseFloat(formData.weight) || 74;
  const bmi = (weightKg / (heightM * heightM)).toFixed(1);

  return (
    <div className="max-w-6xl mx-auto space-y-8 pb-16 animate-fade-in">

      {/* Header Bar */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="w-12 h-12 bg-gradient-to-br from-[#EA580C] to-[#C2410C] rounded-2xl flex items-center justify-center shadow-md shadow-orange-500/15 text-[#FFFFFF] font-bold shrink-0">
            <Bot size={26} />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl sm:text-3xl font-black text-[#111827] tracking-tight">AI Fitness Assistant</h1>
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#FFF7ED] text-[#EA580C] border border-[#FFEDD5]">
                Personalized Plan
              </span>
            </div>
            <p className="text-[#64748B] mt-1 text-xs sm:text-sm">
              Comprehensive customer profile, Monday to Sunday workout plan with animated video guides, and 7-day varied diet plan.
            </p>
          </div>
        </div>

        <button
          onClick={handleSubmitAssessment}
          disabled={isSubmitting}
          className="px-6 py-3.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-95 text-[#FFFFFF] font-bold font-extrabold rounded-2xl text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/15 transition-all cursor-pointer active:scale-95 disabled:opacity-50 shrink-0"
        >
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="animate-spin" />
              <span>Generating with AI...</span>
            </>
          ) : (
            <>
              <Sparkles size={16} />
              <span>Generate with AI</span>
            </>
          )}
        </button>
      </div>

      {/* ===================== 1. VERIFIED CUSTOMER PROFILE CARD ===================== */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center font-bold text-base shrink-0">
              <User size={20} />
            </div>
            <div>
              <h2 className="text-xl font-bold text-[#111827]">Customer Details &amp; Fitness Profile</h2>
              <p className="text-xs text-[#64748B]">Verified member biometrics &amp; training preferences</p>
            </div>
          </div>
          <span className="px-3 py-1 rounded-full text-xs font-extrabold bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0] self-start sm:self-auto">
            ✓ Active Member Profile
          </span>
        </div>

        {/* Details Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3.5 text-center">
          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">Customer Name</span>
            <p className="text-sm font-extrabold text-[#111827] truncate">{formData.fullName}</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">Age / Gender</span>
            <p className="text-sm font-extrabold text-[#111827]">{formData.age} yrs • {formData.gender}</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">Height / Weight</span>
            <p className="text-sm font-extrabold text-[#111827]">{formData.height} cm • {formData.weight} kg</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">BMI (Calculated)</span>
            <p className="text-sm font-extrabold text-[#EA580C]">{bmi} <span className="text-[10px] font-normal text-[#EA580C]">(Normal)</span></p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">Target Weight</span>
            <p className="text-sm font-extrabold text-[#EA580C]">{formData.targetWeight} kg</p>
          </div>

          <div className="p-3 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="text-[10px] text-[#64748B] uppercase font-bold block mb-1">Primary Goal</span>
            <p className="text-sm font-extrabold text-[#EA580C] truncate">{formData.fitnessGoal}</p>
          </div>
        </div>

        {/* Secondary Details Row */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-3 text-xs">
          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="font-bold text-[#64748B] block text-[10px] uppercase mb-1">Training Mode &amp; Frequency</span>
            <p className="font-semibold text-[#111827]">{formData.preferredTraining} • {formData.availableWorkoutDays}</p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="font-bold text-[#64748B] block text-[10px] uppercase mb-1">Preferred Time &amp; Gym Access</span>
            <p className="font-semibold text-[#111827]">{formData.preferredWorkoutTime}</p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="font-bold text-[#64748B] block text-[10px] uppercase mb-1">Dietary Preference</span>
            <p className="font-semibold text-[#111827]">{formData.dietaryPreferences}</p>
          </div>

          <div className="p-3.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl">
            <span className="font-bold text-[#64748B] block text-[10px] uppercase mb-1">Emergency Contact</span>
            <p className="font-semibold text-[#111827]">{formData.emergencyContactName} ({formData.emergencyContactRelation})</p>
          </div>
        </div>
      </div>

      {/* ===================== 2. MONDAY TO SUNDAY WORKOUT PLAN (WITH ANIMATED VIDEO DEMOS) ===================== */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center font-bold text-base shrink-0">
              <Dumbbell size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#111827]">Workout Plan (Monday – Sunday)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#C2410C] text-white font-bold">
                  With Animated Video Guides
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Select any day from Monday to Sunday. Click any workout to watch its animated video demonstration.
              </p>
            </div>
          </div>

          <span className="text-xs font-bold text-[#EA580C] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {activeWorkoutDayData.duration} • {activeWorkoutDayData.focus}
          </span>
        </div>

        {/* 7-Day Workout Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const isSelected = selectedWorkoutDay === day;
            const dayData = DEFAULT_WEEKLY_WORKOUTS[day];

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedWorkoutDay(day)}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#EA580C] to-[#C2410C] text-white border-[#FDBA74] shadow-md shadow-orange-500/15 scale-[1.02]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#FDBA74] hover:text-[#C2410C]'
                }`}
              >
                <span className="text-sm font-extrabold">{day}</span>
                <span className={`text-[10px] mt-0.5 font-medium truncate max-w-full ${isSelected ? 'text-white/80' : 'text-[#64748B]'}`}>
                  {dayData?.exercises.length || 4} Exercises
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Day Routine Banner */}
        <div className="p-4 bg-[#F8FAFC]/70 border border-[#E2E8F0] rounded-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
          <div>
            <span className="font-extrabold text-[#EA580C] uppercase text-[10px] block">
              {activeWorkoutDayData.day} Workout Split
            </span>
            <p className="text-sm font-extrabold text-[#111827] mt-0.5">
              {activeWorkoutDayData.focus}
            </p>
            <p className="text-[#64748B] mt-0.5">
              Target Muscle Focus: <strong className="text-[#111827]">{activeWorkoutDayData.targetMuscle}</strong>
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#EA580C] px-3 py-1.5 rounded-xl font-extrabold text-xs">
              ⏱ {activeWorkoutDayData.duration}
            </span>
          </div>
        </div>

        {/* Exercises List for the Selected Day */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-xs font-extrabold text-[#64748B] uppercase tracking-wider flex items-center gap-1.5">
              <Dumbbell size={14} className="text-[#EA580C]" /> 
              Exercises for {selectedWorkoutDay} ({activeWorkoutDayData.exercises.length} Exercises)
            </h3>
            <span className="text-[11px] text-[#64748B] font-semibold">
              Click &quot;Watch Demo&quot; to open animated form coach
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
            {activeWorkoutDayData.exercises.map((ex: ExerciseItem, idx: number) => (
              <div
                key={idx}
                className="bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl p-4.5 hover:border-[#FDBA74] hover:shadow-xs transition-all flex flex-col justify-between gap-3 group"
              >
                <div>
                  <div className="flex items-start justify-between gap-2 mb-1.5">
                    <div className="flex items-center gap-2.5">
                      <span className="w-6 h-6 rounded-lg bg-[#F8FAFC] text-[#EA580C] font-black text-xs flex items-center justify-center shrink-0">
                        {idx + 1}
                      </span>
                      <h4 className="font-extrabold text-[#111827] text-base group-hover:text-[#EA580C] transition-colors">
                        {ex.name}
                      </h4>
                    </div>
                    <span className="text-[10px] font-extrabold bg-[#F8FAFC] text-[#111827] px-2 py-0.5 rounded-md uppercase">
                      {ex.difficulty || 'All Levels'}
                    </span>
                  </div>

                  <p className="text-xs text-[#64748B] font-medium mb-3">
                    Target Muscle: <strong className="text-[#111827]">{ex.targetMuscleGroup}</strong>
                  </p>

                  {/* Sets / Reps / Rest Badges */}
                  <div className="flex items-center gap-2 flex-wrap text-xs font-bold">
                    <span className="bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0] px-2.5 py-1 rounded-lg">
                      SETS: {ex.sets}
                    </span>
                    <span className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#111827] px-2.5 py-1 rounded-lg">
                      REPS: {ex.reps}
                    </span>
                    <span className="bg-[#FFFFFF] border border-[#E2E8F0] text-[#64748B] px-2.5 py-1 rounded-lg">
                      REST: {ex.rest || '60s'}
                    </span>
                  </div>

                  {ex.instructions && (
                    <p className="text-[11px] text-[#64748B] mt-2.5 line-clamp-2 italic">
                      &quot;{ex.instructions}&quot;
                    </p>
                  )}
                </div>

                {/* Animated Video Guide Button */}
                <button
                  type="button"
                  onClick={() => setActiveDemoExercise(ex)}
                  className="w-full mt-2 py-2.5 px-3 bg-[#FFFFFF] border border-[#F8FAFC] hover:border-[#FDBA74] text-[#EA580C] hover:bg-[#FFF7ED] rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer shadow-2xs group-hover:bg-[#C2410C] group-hover:text-[#FFFFFF] font-bold"
                >
                  <Play size={13} className="fill-current" />
                  <span>Watch Animated Video Guide</span>
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* ===================== 3. MONDAY TO SUNDAY DIET PLAN (NON-REPEATING MEALS) ===================== */}
      <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-[#F8FAFC] text-[#EA580C] flex items-center justify-center font-bold text-base shrink-0">
              <Utensils size={20} />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl font-bold text-[#111827]">Diet &amp; Nutrition Plan (Monday – Sunday)</h2>
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#F8FAFC] text-[#EA580C] border border-[#E2E8F0]">
                  7 Days Varied
                </span>
              </div>
              <p className="text-xs text-[#64748B]">
                Non-repeating daily meal schedules from Monday to Sunday tailored to your caloric and macronutrient targets.
              </p>
            </div>
          </div>

          <span className="text-xs font-extrabold text-[#EA580C] bg-[#F8FAFC] border border-[#E2E8F0] px-3 py-1.5 rounded-xl self-start sm:self-auto">
            {activeDietDayData.calories} kcal • P: {activeDietDayData.macros.protein} | C: {activeDietDayData.macros.carbs} | F: {activeDietDayData.macros.fats}
          </span>
        </div>

        {/* 7-Day Diet Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-2">
          {['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday', 'Sunday'].map((day) => {
            const isSelected = selectedDietDay === day;
            const dietData = DEFAULT_WEEKLY_DIET[day];

            return (
              <button
                key={day}
                type="button"
                onClick={() => setSelectedDietDay(day)}
                className={`py-3 px-2 rounded-2xl text-xs font-bold transition-all cursor-pointer flex flex-col items-center justify-center border ${
                  isSelected
                    ? 'bg-gradient-to-b from-[#EA580C] to-[#C2410C] text-white border-[#FDBA74] shadow-md shadow-orange-500/15 scale-[1.02]'
                    : 'bg-[#F8FAFC] text-[#64748B] border-[#E2E8F0] hover:border-[#FDBA74] hover:text-[#C2410C]'
                }`}
              >
                <span className="text-sm font-extrabold">{day}</span>
                <span className={`text-[10px] mt-0.5 font-medium ${isSelected ? 'text-white/80' : 'text-[#64748B]'}`}>
                  {dietData?.calories} kcal
                </span>
              </button>
            );
          })}
        </div>

        {/* 6 Meals Grid for Selected Day */}
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5 text-xs">
          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-1.5 hover:border-[#FFEDD5] transition-colors">
            <div className="flex items-center gap-1.5 text-amber-600 font-extrabold text-[10px] uppercase">
              <Sun size={13} /> Morning Hydration &amp; Pre-Workout
            </div>
            <p className="text-[#111827] leading-relaxed font-medium">
              {activeDietDayData.morning}
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-1.5 hover:border-[#FFEDD5] transition-colors">
            <div className="flex items-center gap-1.5 text-[#EA580C] font-extrabold text-[10px] uppercase">
              <Coffee size={13} /> Breakfast
            </div>
            <p className="text-[#111827] leading-relaxed font-medium">
              {activeDietDayData.breakfast}
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-1.5 hover:border-[#FFEDD5] transition-colors">
            <div className="flex items-center gap-1.5 text-[#EA580C] font-extrabold text-[10px] uppercase">
              <Apple size={13} /> Mid-Morning Snack
            </div>
            <p className="text-[#111827] leading-relaxed font-medium">
              {activeDietDayData.midMorning}
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-1.5 hover:border-[#FFEDD5] transition-colors">
            <div className="flex items-center gap-1.5 text-[#EA580C] font-extrabold text-[10px] uppercase">
              <Utensils size={13} /> High-Protein Lunch
            </div>
            <p className="text-[#111827] leading-relaxed font-medium">
              {activeDietDayData.lunch}
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-1.5 hover:border-[#FFEDD5] transition-colors">
            <div className="flex items-center gap-1.5 text-[#EA580C] font-extrabold text-[10px] uppercase">
              <Apple size={13} /> Evening Snack / Post-Workout
            </div>
            <p className="text-[#111827] leading-relaxed font-medium">
              {activeDietDayData.evening}
            </p>
          </div>

          <div className="p-4 bg-[#F8FAFC] border border-[#E2E8F0] rounded-2xl space-y-1.5 hover:border-[#FFEDD5] transition-colors">
            <div className="flex items-center gap-1.5 text-indigo-600 font-extrabold text-[10px] uppercase">
              <Moon size={13} /> Recovery Dinner
            </div>
            <p className="text-[#111827] leading-relaxed font-medium">
              {activeDietDayData.dinner}
            </p>
          </div>
        </div>

        {/* Daily Hydration Banner */}
        <div className="p-3.5 bg-gradient-to-r from-blue-50 to-indigo-50 border border-[#E2E8F0] rounded-2xl text-xs text-[#EA580C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Droplets size={18} className="text-[#EA580C] shrink-0" />
            <span><strong>Hydration Protocol:</strong> 3.5 - 4 Liters of clean water daily, spread evenly before and after workout blocks.</span>
          </div>
          <span className="font-extrabold text-[#EA580C] shrink-0">Optimal Electrolyte Balance</span>
        </div>
      </div>

      {/* ===================== 4. INTERACTIVE PREFERENCES & AI GENERATOR FORM ===================== */}
      <form onSubmit={handleSubmitAssessment} className="space-y-6">
        <div className="bg-[#FFFFFF] border border-[#E2E8F0] rounded-3xl p-6 md:p-8 shadow-xs space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#E2E8F0] gap-2">
            <div>
              <h3 className="text-lg font-bold text-[#111827]">Calibrate AI Fitness Preferences</h3>
              <p className="text-xs text-[#64748B] mt-0.5">
                Modify your goals or training environment and click &quot;Generate with AI&quot; to re-calculate your plan.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase mb-1.5">Primary Fitness Goal</label>
              <select
                value={formData.fitnessGoal}
                onChange={e => setFormData({ ...formData, fitnessGoal: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#FDBA74]"
              >
                <option value="Weight Loss">Weight Loss</option>
                <option value="Muscle Building">Muscle Building / Hypertrophy</option>
                <option value="Strength Training">Strength &amp; Conditioning</option>
                <option value="Endurance">Endurance &amp; Stamina</option>
                <option value="Flexibility">Flexibility &amp; Mobility</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase mb-1.5">Current Fitness Level</label>
              <select
                value={formData.currentFitnessLevel}
                onChange={e => setFormData({ ...formData, currentFitnessLevel: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#FDBA74]"
              >
                <option value="Beginner (New to training)">Beginner (New to training)</option>
                <option value="Intermediate (1-3 yrs)">Intermediate (1-3 yrs experience)</option>
                <option value="Advanced (3+ yrs)">Advanced (3+ yrs consistent lifting)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase mb-1.5">Training Mode</label>
              <select
                value={formData.preferredTraining}
                onChange={e => setFormData({ ...formData, preferredTraining: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#FDBA74]"
              >
                <option value="Offline (In-Gym Training)">Offline (In-Gym Training)</option>
                <option value="Online / Home Workout">Online / Home Workout</option>
                <option value="Hybrid (Gym + Home)">Hybrid (Gym + Home)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase mb-1.5">Workout Days / Week</label>
              <select
                value={formData.availableWorkoutDays}
                onChange={e => setFormData({ ...formData, availableWorkoutDays: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#FDBA74]"
              >
                <option value="3 Days / Week">3 Days / Week</option>
                <option value="4 Days / Week">4 Days / Week</option>
                <option value="5 Days / Week">5 Days / Week</option>
                <option value="6 Days / Week">6 Days / Week</option>
                <option value="Every day (7 Days)">Every day (7 Days)</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase mb-1.5">Equipment Access</label>
              <select
                value={formData.equipmentAvailability}
                onChange={e => setFormData({ ...formData, equipmentAvailability: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#FDBA74]"
              >
                <option value="Full Commercial Gym (Weights &amp; Machines)">Full Commercial Gym (Weights &amp; Machines)</option>
                <option value="Home Gym (Dumbbells &amp; Bands)">Home Gym (Dumbbells &amp; Bands)</option>
                <option value="Bodyweight Only (No Equipment)">Bodyweight Only (No Equipment)</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase mb-1.5">Dietary Preference</label>
              <select
                value={formData.dietaryPreferences}
                onChange={e => setFormData({ ...formData, dietaryPreferences: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#FDBA74]"
              >
                <option value="Vegetarian">Vegetarian</option>
                <option value="Non-Vegetarian">Non-Vegetarian</option>
                <option value="Vegan">Vegan</option>
                <option value="Eggetarian">Eggetarian</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-bold text-[#111827] uppercase mb-1.5">Medical Notes / Considerations</label>
              <input
                type="text"
                value={formData.healthConsiderations}
                onChange={e => setFormData({ ...formData, healthConsiderations: e.target.value })}
                className="w-full px-3.5 py-2.5 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-bold text-[#111827] outline-none focus:border-[#FDBA74]"
                placeholder="None (Healthy)"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-[#E2E8F0]">
            <p className="text-xs text-[#64748B]">
              Clicking generate triggers the Gemini AI engine to personalize your 7-day Monday–Sunday schedules.
            </p>

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-8 py-3.5 bg-gradient-to-r from-[#EA580C] to-[#C2410C] hover:opacity-95 text-[#FFFFFF] font-bold font-extrabold rounded-2xl text-sm flex items-center justify-center gap-2 shadow-md shadow-orange-500/15 transition-all cursor-pointer active:scale-95 disabled:opacity-50"
            >
              {isSubmitting ? (
                <>
                  <Loader2 size={16} className="animate-spin" />
                  <span>Generating with AI...</span>
                </>
              ) : (
                <>
                  <Sparkles size={16} />
                  <span>Generate with AI</span>
                </>
              )}
            </button>
          </div>
        </div>
      </form>

      {/* ===================== ANIMATED VIDEO DEMONSTRATION MODAL ===================== */}
      {activeDemoExercise && (
        <div 
          className="fixed inset-0 z-[200] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 sm:p-6 md:p-8 overflow-y-auto animate-in fade-in"
          onClick={(e) => {
            if (e.target === e.currentTarget) setActiveDemoExercise(null);
          }}
        >
          <div className="relative bg-[#FFFFFF] rounded-3xl max-w-2xl w-full shadow-2xl border border-[#F8FAFC] my-auto max-h-[88vh] flex flex-col overflow-hidden animate-in zoom-in-95 duration-200">
            {/* Modal Header */}
            <div className="p-4 sm:p-5 bg-gradient-to-r from-stone-900 to-[#FFFFFF] text-white flex items-center justify-between shrink-0 border-b border-[#E2E8F0]">
              <div>
                <div className="flex items-center gap-2">
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-[#C2410C] text-white font-bold shadow-xs">
                    Animated Video Guide
                  </span>
                  <span className="text-xs text-white/70">
                    Target: <strong className="text-white">{activeDemoExercise.targetMuscleGroup}</strong>
                  </span>
                </div>
                <h3 className="text-lg sm:text-xl font-black mt-1 text-[#111827]">{activeDemoExercise.name}</h3>
              </div>

              <button
                type="button"
                onClick={() => setActiveDemoExercise(null)}
                className="p-2 text-white/70 hover:text-white bg-[#FFFFFF]/10 hover:bg-[#FFFFFF]/20 rounded-full transition-colors cursor-pointer"
                title="Close Guide"
              >
                <X size={20} />
              </button>
            </div>

            {/* Scrollable Modal Content */}
            <div className="overflow-y-auto flex-1 divide-y divide-[#E2E8F0]/60">
              {/* Video / Animated Simulation Canvas */}
              <div className="p-3 sm:p-4 bg-[#FFFFFF] flex justify-center items-center">
                <ExerciseVideoPlayer
                  exerciseName={activeDemoExercise.name}
                  targetMuscle={activeDemoExercise.targetMuscleGroup}
                  duration={60}
                  autoPlay={true}
                  className="w-full max-h-[250px] sm:max-h-[280px] rounded-2xl overflow-hidden shadow-md"
                />
              </div>

              {/* Prescribed Sets & Reps Details */}
              <div className="p-4 sm:p-5 bg-[#FFFFFF] space-y-3.5">
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs font-bold text-center">
                  <div className="bg-[#F8FAFC] text-[#EA580C] px-3 py-2 rounded-xl border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase block text-[#9A3412] font-semibold">Prescribed Sets</span>
                    <strong className="text-sm">{activeDemoExercise.sets} Sets</strong>
                  </div>
                  <div className="bg-[#F8FAFC] text-[#111827] px-3 py-2 rounded-xl border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase block text-[#64748B] font-semibold">Rep Range</span>
                    <strong className="text-sm">{activeDemoExercise.reps} Reps</strong>
                  </div>
                  <div className="bg-[#F8FAFC] text-[#111827] px-3 py-2 rounded-xl border border-[#E2E8F0]">
                    <span className="text-[10px] uppercase block text-[#64748B] font-semibold">Rest Between Sets</span>
                    <strong className="text-sm">{activeDemoExercise.rest || '60s'}</strong>
                  </div>
                </div>

                {activeDemoExercise.instructions && (
                  <div>
                    <h4 className="text-xs font-extrabold text-[#64748B] uppercase mb-1 flex items-center gap-1.5">
                      <Sparkles size={13} className="text-[#EA580C]" />
                      Biomechanical Form Cues:
                    </h4>
                    <p className="text-xs text-[#111827] leading-relaxed bg-[#F8FAFC] p-3.5 rounded-xl border border-[#E2E8F0] font-medium">
                      {activeDemoExercise.instructions}
                    </p>
                  </div>
                )}

                <button
                  type="button"
                  onClick={() => setActiveDemoExercise(null)}
                  className="w-full py-3 bg-[#C2410C] text-white font-bold font-extrabold rounded-xl text-xs hover:bg-[#9A3412] transition-colors cursor-pointer shadow-xs active:scale-[0.99]"
                >
                  Got It, Return to Plan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default MemberAIFitness;
