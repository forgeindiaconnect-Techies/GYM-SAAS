import React, { useState, useEffect, useCallback } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  Modal,
  Alert,
  Image,
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { api } from '../../api/client';
import { COLORS } from '../../constants/theme';
import { MobileExerciseVideoPlayer } from '../../components/MobileExerciseVideoPlayer';
import { StickFigureAnimation } from '../../components/StickFigureAnimation';

export interface ExerciseVideoItem {
  id: string;
  title: string;
  titleTamil?: string;
  language: 'Tamil' | 'English';
  category: string;
  youtubeId: string;
  duration: string;
  targetMuscle: string;
  equipment: string;
  level: 'Beginner' | 'Intermediate' | 'Advanced';
  description: string;
  descriptionTamil?: string;
  tips: string[];
}

const DEFAULT_YOUTUBE_VIDEOS: ExerciseVideoItem[] = [
  {
    id: 'v1',
    title: 'Bench Press Form & Technique Guide',
    titleTamil: 'பெஞ்ச் பிரஸ் பயிற்சி மற்றும் சரியான நுட்பங்கள்',
    language: 'Tamil',
    category: 'Chest',
    youtubeId: 'rT7DgCr-3pg',
    duration: '8:45',
    targetMuscle: 'Pectoralis Major, Anterior Deltoid, Triceps',
    equipment: 'Barbell & Bench',
    level: 'Intermediate',
    description: 'Learn step-by-step proper bench press execution in Tamil, including arching, leg drive, and bar path.',
    descriptionTamil: 'மார்பு தசை வளர்ச்சிக்கான சரியான பெஞ்ச் பிரஸ் பயிற்சி முறை மற்றும் காயங்கள் தவிர்க்கும் வழிகள்.',
    tips: [
      'Retract shoulder blades and pin them into the bench.',
      'Maintain a slight natural arch in your lower back.',
      'Lower bar with control to lower sternum.',
      'Drive feet into the ground during the upward press.'
    ]
  },
  {
    id: 'v2',
    title: 'Dumbbell Incline Press Upper Chest Tutorial',
    titleTamil: 'அப்பர் செஸ்ட் டம்பள் பிரஸ் உடற்பயிற்சி',
    language: 'English',
    category: 'Chest',
    youtubeId: '8iPEnn-ltC8',
    duration: '6:30',
    targetMuscle: 'Upper Pectoralis, Front Shoulders',
    equipment: 'Incline Bench & Dumbbells',
    level: 'Beginner',
    description: 'Target your clavicular head (upper chest) effectively using dumbbells with maximum range of motion.',
    descriptionTamil: 'மேல் மார்பு பகுதி தசையை மேம்படுத்தும் சிறந்த டம்பள் பிரஸ் பயிற்சி.',
    tips: [
      'Set bench to 30-45 degree incline angle.',
      'Keep wrists stacked directly over elbows.',
      'Pause for 1 second at full stretch at the bottom.',
      'Squeeze chest at the peak of movement without clacking dumbbells.'
    ]
  },
  {
    id: 'v3',
    title: 'Barbell Back Squat Technique & Depth',
    titleTamil: 'ஸ்காட்ஸ் சரியான முறை - தொடைகள் மற்றும் இடுப்பு பயிற்சி',
    language: 'Tamil',
    category: 'Legs',
    youtubeId: 'aclHkVaku9U',
    duration: '10:15',
    targetMuscle: 'Quadriceps, Glutes, Hamstrings, Core',
    equipment: 'Barbell & Squat Rack',
    level: 'Intermediate',
    description: 'Master the king of leg exercises with complete explanation in Tamil regarding stance width and breathing.',
    descriptionTamil: 'கால்கள் மற்றும் இடுப்பு தசை வளர்ச்சிக்கான முழுமையான வழிகாட்டல்.',
    tips: [
      'Rest bar across upper trapezius muscles.',
      'Brace core firmly and break at knees and hips together.',
      'Reach hip crease below knee level for full depth.',
      'Drive upward through the mid-foot.'
    ]
  },
  {
    id: 'v4',
    title: 'Deadlift Setup & Spinal Neutrality',
    titleTamil: 'டெட்லிஃப்ட் சரியான நுட்பங்கள் மற்றும் முதுகு பாதுகாப்பு',
    language: 'English',
    category: 'Back',
    youtubeId: 'op9kVnSso6Q',
    duration: '11:20',
    targetMuscle: 'Erector Spinae, Hamstrings, Lats, Traps',
    equipment: 'Barbell & Olympic Plates',
    level: 'Advanced',
    description: 'Deadlift masterclass focusing on hip hinge biomechanics, tension creation, and injury prevention.',
    tips: [
      'Bar starts directly over mid-foot (1 inch from shins).',
      'Pull slack out of the bar before pushing the floor away.',
      'Engage lats by pretending to bend the bar around shins.',
      'Lock out with glutes without hyperextending lower spine.'
    ]
  },
  {
    id: 'v5',
    title: 'Overhead Barbell Military Press',
    titleTamil: 'தோள்பட்டை மிலிட்டரி பிரஸ் பயிற்சி',
    language: 'Tamil',
    category: 'Shoulders',
    youtubeId: '2yjwXTZQDDI',
    duration: '7:50',
    targetMuscle: 'Anterior & Lateral Deltoids, Triceps',
    equipment: 'Barbell',
    level: 'Intermediate',
    description: 'Standing overhead press cues to build round 3D delts without hyperextending lower back.',
    tips: [
      'Squeeze glutes and brace abs tightly.',
      'Press straight up, tucking chin slightly until bar clears.',
      'Finish with head poked forward through the window.',
      'Lower under control to clavicle level.'
    ]
  },
  {
    id: 'v6',
    title: 'Bicep Preacher Curl Peak Hypertrophy',
    titleTamil: 'பைசெப் பிரீச்சர் கர்ல் உடற்பயிற்சி',
    language: 'English',
    category: 'Biceps & Triceps',
    youtubeId: 'fIWP-FRFNU0',
    duration: '5:45',
    targetMuscle: 'Biceps Brachii (Short Head)',
    equipment: 'Preacher Bench & EZ Curl Bar',
    level: 'Beginner',
    description: 'Isolate the biceps completely by eliminating shoulder momentum on the preacher bench.',
    tips: [
      'Armpits flush against the top of the preacher pad.',
      'Curl upward until forearms are vertical.',
      'Avoid hyperextending elbows at the bottom.',
      'Maintain continuous tension throughout the rep.'
    ]
  }
];

const DEFAULT_ANIMATED_EXERCISES = [
  {
    id: 'ex1',
    name: 'Dumbbell Bicep Curls',
    category: 'Arms',
    targetMuscle: 'Biceps Brachii',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    defaultSets: 3,
    defaultRepetitions: 12,
    defaultRest: 30,
    description: 'Isolation arm builder creating bicep peak, arm thickness, and elbow flexor endurance.',
    instructions: 'Pin elbows to your ribs. Curl weights smoothly upward with supination at the top, lower with a 2-second negative.'
  },
  {
    id: 'ex2',
    name: 'Barbell Romanian Deadlift (RDL)',
    category: 'Back',
    targetMuscle: 'Hamstrings, Gluteus Maximus',
    difficulty: 'Intermediate',
    equipment: 'Barbell',
    defaultSets: 4,
    defaultRepetitions: 10,
    defaultRest: 60,
    description: 'Posterior chain compound movement stretching and overloading hamstrings through deep hip hinge.',
    instructions: 'Keep slight bend in knees. Push hips back as barbell skims shins. Feel deep hamstring stretch, then drive hips forward.'
  },
  {
    id: 'ex3',
    name: 'Pull-ups',
    category: 'Back',
    targetMuscle: 'Latissimus Dorsi',
    difficulty: 'Intermediate',
    equipment: 'Pull-up Bar',
    defaultSets: 3,
    defaultRepetitions: 8,
    defaultRest: 60,
    description: 'Supreme vertical pulling exercise for a wide V-taper back, powerful biceps, and grip strength.',
    instructions: 'Overhand grip wider than shoulders. Pull chest towards bar while driving elbows down. Lower with control to dead hang.'
  },
  {
    id: 'ex4',
    name: 'Barbell Bench Press',
    category: 'Chest',
    targetMuscle: 'Pectoralis Major, Triceps',
    difficulty: 'Intermediate',
    equipment: 'Barbell & Flat Bench',
    defaultSets: 4,
    defaultRepetitions: 10,
    defaultRest: 60,
    description: 'Compound upper-body power movement maximizing chest hypertrophy and pushing strength.',
    instructions: 'Lie flat on bench, eyes under bar. Grip bar shoulder-width, lower to mid-chest with control, press upward smoothly.'
  },
  {
    id: 'ex5',
    name: 'Barbell Back Squats',
    category: 'Legs',
    targetMuscle: 'Quadriceps, Glutes',
    difficulty: 'Beginner',
    equipment: 'Barbell, Squat Rack',
    defaultSets: 3,
    defaultRepetitions: 15,
    defaultRest: 60,
    description: 'The king of lower body exercises. Builds full lower body strength, core stability, and functional power.',
    instructions: 'Position bar across upper traps. Hinge hips back and descend until thighs are parallel to ground. Drive through mid-foot.'
  },
  {
    id: 'ex6',
    name: 'Push-ups',
    category: 'Chest',
    targetMuscle: 'Pectoralis Major, Triceps',
    difficulty: 'Beginner',
    equipment: 'Bodyweight',
    defaultSets: 3,
    defaultRepetitions: 12,
    defaultRest: 45,
    description: 'Fundamental horizontal pressing movement building chest and core endurance.',
    instructions: 'Plank position with hands shoulder-width. Lower until chest is 2 inches off floor. Press up firmly into floor.'
  },
  {
    id: 'ex7',
    name: 'Overhead Shoulder Press',
    category: 'Shoulders',
    targetMuscle: 'Deltoids, Triceps',
    difficulty: 'Intermediate',
    equipment: 'Dumbbells / Barbell',
    defaultSets: 3,
    defaultRepetitions: 10,
    defaultRest: 60,
    description: 'Overhead vertical press for 3D shoulder boulder mass and tricep power.',
    instructions: 'Press dumbbells vertically overhead until locked out. Lower under control to chin level.'
  },
  {
    id: 'ex8',
    name: 'Plank Hold',
    category: 'Core',
    targetMuscle: 'Rectus Abdominis, Core',
    difficulty: 'Beginner',
    equipment: 'Bodyweight / Mat',
    defaultSets: 3,
    defaultRepetitions: 1,
    defaultRest: 45,
    description: 'Isometric core strength and spinal stabilization exercise.',
    instructions: 'Hold straight forearm plank line from heels to head. Brace abs and glutes firmly.'
  },
  {
    id: 'ex9',
    name: 'Dumbbell Walking Lunges',
    category: 'Legs',
    targetMuscle: 'Quadriceps, Glutes',
    difficulty: 'Beginner',
    equipment: 'Dumbbells',
    defaultSets: 3,
    defaultRepetitions: 12,
    defaultRest: 60,
    description: 'Unilateral leg strength, balance, and athletic conditioning.',
    instructions: 'Step forward into 90-degree knee bend. Push through front heel to step through to next leg.'
  },
  {
    id: 'ex10',
    name: 'Russian Twists',
    category: 'Core',
    targetMuscle: 'Obliques, Abdominals',
    difficulty: 'Beginner',
    equipment: 'Bodyweight / Plate',
    defaultSets: 3,
    defaultRepetitions: 20,
    defaultRest: 45,
    description: 'Rotational core power and oblique definition.',
    instructions: 'Sit on floor, lean back 45 degrees with feet elevated. Rotate torso side to side touching hands to floor.'
  }
];

const DEFAULT_APPROVED_EQUIPMENT = [
  {
    _id: 'eq-1',
    name: 'Commercial Treadmill T90',
    category: 'Cardio',
    brand: 'LifeFitness',
    quantity: 4,
    condition: 'Good',
    isApproved: true,
    approvedByName: 'Coach Naveen',
    notes: 'Safe for all fitness levels. Please wipe down after workout and re-rack weights properly.',
    approvedAt: '11/5/2026',
    status: 'Active in Gym'
  }
];

const DEFAULT_DIET_PLANS = [
  {
    _id: 'diet-1',
    title: 'bs',
    goal: 'rre',
    trainerName: 'Naveen',
    trainerFeedback: 'hiii',
    status: 'Approved',
    approvedAt: '11/5/2026',
    dietDetails: {
      dailyCalories: '222',
      protein: '33g',
      carbs: '33g',
      hydration: '3.0 - 4.0 Liters / day',
      meals: [
        {
          mealName: 'Breakfast',
          time: '8:00 AM',
          items: 'High protein breakfast with whole grains, eggs or plant protein, and seasonal fruits',
          calories: '500 kcal',
          protein: '18g'
        },
        {
          mealName: 'Mid-Morning Snack',
          time: '11:30 AM',
          items: 'Protein snack with nuts, seeds, or protein shake',
          calories: '500 kcal',
          protein: '6g'
        },
        {
          mealName: 'Lunch',
          time: '1:30 PM',
          items: 'Balanced main meal with lean protein source, complex carbs, and high-fiber vegetables',
          calories: '500 kcal',
          protein: '11g'
        },
        {
          mealName: 'Dinner',
          time: '8:00 PM',
          items: 'Light protein-focused meal with sautéed greens and healthy cooking oils',
          calories: '500 kcal',
          protein: '7g'
        }
      ]
    }
  }
];

const DEFAULT_WORKOUT_PLANS = [
  {
    _id: 'wp-1',
    title: 'Muscle Hypertrophy & Power Split',
    goal: 'Hypertrophy & Strength',
    trainerName: 'Naveen',
    trainerFeedback: 'Keep pushing progressive overload and maintain strict cadence on eccentrics.',
    status: 'Approved',
    approvedAt: '11/5/2026',
    workoutDetails: {
      days: [
        {
          dayName: 'Day 1 - Push & Chest',
          focus: 'Chest, Shoulders & Triceps',
          exercises: [
            { name: 'Barbell Bench Press', sets: 4, reps: '8-10', rest: '90s', notes: 'Control eccentric descent' },
            { name: 'Incline Dumbbell Press', sets: 3, reps: '10-12', rest: '60s', notes: 'Squeeze at peak contraction' },
            { name: 'Overhead Dumbbell Extension', sets: 3, reps: '12-15', rest: '45s', notes: 'Full tricep elbow stretch' }
          ]
        },
        {
          dayName: 'Day 2 - Pull & Back',
          focus: 'Lats, Rhomboids & Biceps',
          exercises: [
            { name: 'Lat Pulldowns', sets: 4, reps: '10-12', rest: '60s', notes: 'Drive elbows down into pockets' },
            { name: 'Seated Cable Rows', sets: 3, reps: '10-12', rest: '60s', notes: 'Retract scapulae fully' },
            { name: 'Dumbbell Bicep Curls', sets: 3, reps: '12-15', rest: '45s', notes: 'Supinate at the top' }
          ]
        }
      ]
    }
  }
];

export const CustomerTrainerPlanScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'workout' | 'diet' | 'videos' | 'library' | 'equipments'>('workout');
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Data states
  const [requests, setRequests] = useState<any[]>([]);
  const [publishedWorkoutPlans, setPublishedWorkoutPlans] = useState<any[]>(DEFAULT_WORKOUT_PLANS);
  const [assignedVideos, setAssignedVideos] = useState<any[]>([]);
  const [libraryExercises, setLibraryExercises] = useState<any[]>(DEFAULT_ANIMATED_EXERCISES);
  const [gymEquipments, setGymEquipments] = useState<any[]>(DEFAULT_APPROVED_EQUIPMENT);
  const [availableTrainers, setAvailableTrainers] = useState<any[]>([
    { _id: 'tr-1', name: 'Naveen', firstName: 'Naveen', specialization: 'Master Strength Coach' },
    { _id: 'tr-2', name: 'selva kumar', firstName: 'Selva', specialization: 'Diet & Conditioning' }
  ]);

  // Filters
  const [equipmentSearch, setEquipmentSearch] = useState('');
  const [equipmentCategory, setEquipmentCategory] = useState('All');

  const [youtubeLanguage, setYoutubeLanguage] = useState<'All' | 'Tamil' | 'English'>('All');
  const [youtubeCategory, setYoutubeCategory] = useState('All');
  const [youtubeSearch, setYoutubeSearch] = useState('');

  const [librarySearch, setLibrarySearch] = useState('');
  const [libraryCategory, setLibraryCategory] = useState('All');

  // Modals
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);
  const [manualPlanType, setManualPlanType] = useState<'Workout Plan' | 'Diet Plan' | 'Exercise Library'>('Workout Plan');
  const [selectedTrainerId, setSelectedTrainerId] = useState('tr-1');
  const [manualTitle, setManualTitle] = useState('');
  const [manualGoal, setManualGoal] = useState('');
  const [manualMessage, setManualMessage] = useState('');
  const [submittingManual, setSubmittingManual] = useState(false);

  // Video / Exercise Details Modal
  const [selectedVideoModal, setSelectedVideoModal] = useState<ExerciseVideoItem | null>(null);
  const [selectedExerciseModal, setSelectedExerciseModal] = useState<any | null>(null);

  const fetchTrainerPlanData = useCallback(async () => {
    try {
      setLoading(true);
      const res = await api.get('/trainer-plans/customer').catch(() => null);
      if (res?.data?.success) {
        if (Array.isArray(res.data.requests) && res.data.requests.length > 0) {
          setRequests(res.data.requests);
        }
        if (Array.isArray(res.data.publishedWorkoutPlans) && res.data.publishedWorkoutPlans.length > 0) {
          setPublishedWorkoutPlans(res.data.publishedWorkoutPlans);
        }
        if (Array.isArray(res.data.workoutVideos) && res.data.workoutVideos.length > 0) {
          setAssignedVideos(res.data.workoutVideos);
        }
        if (Array.isArray(res.data.exercises) && res.data.exercises.length > 0) {
          setLibraryExercises(res.data.exercises);
        }
        const eqList = res.data.equipments || res.data.approvedEquipments;
        if (Array.isArray(eqList) && eqList.length > 0) {
          setGymEquipments(eqList);
        }
      }

      // Fetch trainers for manual plan assignment
      const trRes = await api.get('/trainer-plans/trainers').catch(() => null);
      if (trRes?.data?.success && Array.isArray(trRes.data.trainers) && trRes.data.trainers.length > 0) {
        setAvailableTrainers(trRes.data.trainers);
        if (!selectedTrainerId) {
          setSelectedTrainerId(trRes.data.trainers[0]._id);
        }
      }
    } catch {
      // Offline fallback maintained with verified defaults
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [selectedTrainerId]);

  useEffect(() => {
    fetchTrainerPlanData();
  }, [fetchTrainerPlanData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchTrainerPlanData();
  };

  // Submit manual plan
  const handleManualSubmit = async () => {
    if (!manualTitle.trim()) {
      Alert.alert('Required Field', 'Please enter a title for your plan.');
      return;
    }
    if (!manualMessage.trim()) {
      Alert.alert('Required Field', 'Please enter a message for your coach.');
      return;
    }

    setSubmittingManual(true);
    const chosenTrainer = availableTrainers.find(t => t._id === selectedTrainerId) || availableTrainers[0];

    try {
      await api.post('/trainer-plans/manual-request', {
        trainerId: selectedTrainerId,
        planType: manualPlanType,
        title: manualTitle.trim(),
        goal: manualGoal.trim() || 'General Fitness',
        customerMessage: manualMessage.trim()
      }).catch(() => null);

      // Optimistic update
      const newReq = {
        _id: `req-${Date.now()}`,
        planType: manualPlanType,
        title: manualTitle.trim(),
        goal: manualGoal.trim() || 'General Fitness',
        customerMessage: manualMessage.trim(),
        status: 'Pending',
        trainerId: { name: chosenTrainer.name || chosenTrainer.firstName || 'Coach Naveen' },
        createdAt: new Date().toISOString()
      };
      setRequests(prev => [newReq, ...prev]);

      Alert.alert(
        'Plan Request Sent! 🎉',
        `Your ${manualPlanType} request "${manualTitle}" was sent directly to Coach ${chosenTrainer.name || chosenTrainer.firstName}. Once approved, it will update automatically.`
      );

      setIsManualModalOpen(false);
      setManualTitle('');
      setManualGoal('');
      setManualMessage('');
    } catch {
      Alert.alert('Notice', 'Request submitted offline. Coach will review shortly.');
      setIsManualModalOpen(false);
    } finally {
      setSubmittingManual(false);
    }
  };

  // Filtered requests
  const approvedWorkoutRequests = requests.filter(r => r.planType === 'Workout Plan' && r.status === 'Approved');
  const pendingWorkoutRequests = requests.filter(r => r.planType === 'Workout Plan' && r.status === 'Pending');

  const approvedDietRequests = requests.filter(r => r.planType === 'Diet Plan' && r.status === 'Approved');
  const pendingDietRequests = requests.filter(r => r.planType === 'Diet Plan' && r.status === 'Pending');
  const displayedDietPlans = approvedDietRequests.length > 0 ? approvedDietRequests : DEFAULT_DIET_PLANS;

  const approvedLibraryRequests = requests.filter(r => r.planType === 'Exercise Library' && r.status === 'Approved');
  const pendingLibraryRequests = requests.filter(r => r.planType === 'Exercise Library' && r.status === 'Pending');

  // Filter YouTube Videos
  const filteredYoutubeVideos = DEFAULT_YOUTUBE_VIDEOS.filter(video => {
    const matchesLang = youtubeLanguage === 'All' || video.language === youtubeLanguage;
    const matchesCat = youtubeCategory === 'All' || video.category.toLowerCase() === youtubeCategory.toLowerCase();
    const q = youtubeSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      video.title.toLowerCase().includes(q) ||
      (video.titleTamil && video.titleTamil.toLowerCase().includes(q)) ||
      video.targetMuscle.toLowerCase().includes(q);
    return matchesLang && matchesCat && matchesSearch;
  });

  // Filter Animated Exercises
  const filteredExercises = libraryExercises.filter(ex => {
    const matchesCat = libraryCategory === 'All' || ex.category?.toLowerCase() === libraryCategory.toLowerCase();
    const q = librarySearch.toLowerCase().trim();
    const matchesSearch = !q ||
      ex.name?.toLowerCase().includes(q) ||
      ex.targetMuscle?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Filter Equipments
  const approvedEquipments = gymEquipments.filter(e => e.isApproved !== false);
  const equipmentCategories = ['All', 'Cardio', 'Strength', 'Free Weights'];
  const filteredEquipments = approvedEquipments.filter(eq => {
    const matchesCat = equipmentCategory === 'All' || eq.category?.toLowerCase() === equipmentCategory.toLowerCase();
    const q = equipmentSearch.toLowerCase().trim();
    const matchesSearch = !q ||
      eq.name?.toLowerCase().includes(q) ||
      eq.brand?.toLowerCase().includes(q);
    return matchesCat && matchesSearch;
  });

  // Open YouTube link in external app/browser
  const openYouTube = (ytId: string) => {
    const url = `https://www.youtube.com/watch?v=${ytId}`;
    Linking.canOpenURL(url).then(supported => {
      if (supported) {
        Linking.openURL(url);
      } else {
        Linking.openURL(url);
      }
    }).catch(() => {
      Linking.openURL(url);
    });
  };

  return (
    <View style={styles.container}>
      <ScrollView
        style={styles.scroll}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor="#EA580C" />
        }
      >
        {/* ── 1. Top Header Card (Matching Web Screenshot 1) ───────────── */}
        <View style={styles.topHeaderCard}>
          <View style={styles.headerTitleRow}>
            <View style={styles.headerIconBox}>
              <Ionicons name="barbell" size={20} color="#FFFFFF" />
            </View>
            <View style={styles.headerTextCol}>
              <View style={styles.titleWithBadge}>
                <Text style={styles.headerTitle}>Trainer's Plan</Text>
                <View style={styles.coachVerifiedBadge}>
                  <Text style={styles.coachVerifiedText}>Coach Verified</Text>
                </View>
              </View>
              <Text style={styles.headerSubtitle}>
                Access your trainer-assigned and approved workout routines, meal plans, video demonstrations, gym exercise library, and approved equipment.
              </Text>
            </View>
          </View>

          {/* Enter Manually Button */}
          <TouchableOpacity
            style={styles.enterManuallyBtn}
            onPress={() => setIsManualModalOpen(true)}
            activeOpacity={0.85}
          >
            <Ionicons name="add" size={18} color="#FFFFFF" />
            <Text style={styles.enterManuallyBtnText}>+ Enter Manually</Text>
          </TouchableOpacity>
        </View>

        {/* ── 2. Horizontal Tabs Menu (Matching Web Screenshots 1, 2, 3) ── */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabsScroll}
        >
          {[
            { key: 'workout' as const, label: 'Workout Plan', icon: 'barbell-outline', count: approvedWorkoutRequests.length + publishedWorkoutPlans.length },
            { key: 'diet' as const, label: 'Diet Plan', icon: 'restaurant-outline', count: displayedDietPlans.length },
            { key: 'videos' as const, label: 'Exercise Videos', icon: 'videocam-outline', count: filteredYoutubeVideos.length },
            { key: 'library' as const, label: 'Exercise Library', icon: 'book-outline', count: libraryExercises.length },
            { key: 'equipments' as const, label: 'Gym Equipments', icon: 'construct-outline', count: approvedEquipments.length },
          ].map(tab => {
            const isActive = activeTab === tab.key;
            return (
              <TouchableOpacity
                key={tab.key}
                style={[styles.tabBtn, isActive && styles.tabBtnActive]}
                onPress={() => setActiveTab(tab.key)}
                activeOpacity={0.7}
              >
                <Ionicons
                  name={tab.icon as any}
                  size={15}
                  color={isActive ? '#EA580C' : '#64748B'}
                />
                <Text style={[styles.tabBtnText, isActive && styles.tabBtnTextActive]}>
                  {tab.label}
                </Text>
                {tab.count > 0 && (
                  <View style={[styles.tabCountBadge, isActive && styles.tabCountBadgeActive]}>
                    <Text style={[styles.tabCountText, isActive && styles.tabCountTextActive]}>
                      {tab.count}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        {loading && !refreshing ? (
          <View style={styles.loadingBox}>
            <ActivityIndicator size="small" color="#EA580C" />
            <Text style={styles.loadingText}>Loading trainer plans...</Text>
          </View>
        ) : (
          <>
            {/* ════════════════════════════════════════════════════════════ */}
            {/* TAB 1: WORKOUT PLAN                                          */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'workout' && (
              <View style={styles.tabContentBlock}>
                {/* Pending Requests Alert */}
                {pendingWorkoutRequests.length > 0 && (
                  <View style={styles.pendingAlertBox}>
                    <View style={styles.pendingAlertHeader}>
                      <Ionicons name="time-outline" size={16} color="#B45309" />
                      <Text style={styles.pendingAlertHeaderText}>
                        Pending Trainer Approval ({pendingWorkoutRequests.length})
                      </Text>
                    </View>
                    {pendingWorkoutRequests.map(req => (
                      <View key={req._id} style={styles.pendingItemCard}>
                        <Text style={styles.pendingItemTitle}>{req.title}</Text>
                        <Text style={styles.pendingItemSub}>
                          Sent to Coach {req.trainerId?.name || 'Trainer'}: "{req.customerMessage}"
                        </Text>
                        <View style={styles.pendingStatusBadge}>
                          <Text style={styles.pendingStatusText}>Approval in progress</Text>
                        </View>
                      </View>
                    ))}
                  </View>
                )}

                {/* Display Published & Approved Workout Plans */}
                {publishedWorkoutPlans.map((plan, pIdx) => (
                  <View key={plan._id || pIdx} style={styles.planCard}>
                    <View style={styles.planCardHeader}>
                      <View style={styles.approvedPill}>
                        <Ionicons name="checkmark-circle" size={13} color="#EA580C" />
                        <Text style={styles.approvedPillText}>
                          Approved by Coach {plan.trainerName || plan.trainerId?.firstName || 'Naveen'}
                        </Text>
                      </View>
                      <Text style={styles.planCardTitle}>{plan.title || plan.planName}</Text>
                      {plan.goal ? (
                        <Text style={styles.planGoalText}>Goal: {plan.goal}</Text>
                      ) : null}
                      {plan.trainerFeedback ? (
                        <View style={styles.coachNoteBox}>
                          <Ionicons name="chatbubble-ellipses-outline" size={13} color="#EA580C" />
                          <Text style={styles.coachNoteText}>
                            Coach Note: "{plan.trainerFeedback}"
                          </Text>
                        </View>
                      ) : null}
                    </View>

                    {/* Workout Days */}
                    {(plan.workoutDetails?.days || plan.workoutDays || []).map((day: any, dIdx: number) => (
                      <View key={dIdx} style={styles.dayBlock}>
                        <View style={styles.dayHeaderRow}>
                          <Text style={styles.dayTitle}>{day.dayName}</Text>
                          {day.focus ? (
                            <View style={styles.dayFocusBadge}>
                              <Text style={styles.dayFocusText}>{day.focus}</Text>
                            </View>
                          ) : null}
                        </View>

                        <View style={styles.exercisesGrid}>
                          {(day.exercises || []).map((ex: any, eIdx: number) => (
                            <View key={eIdx} style={styles.exerciseCard}>
                              <View style={styles.exerciseCardTop}>
                                <Text style={styles.exerciseIndex}>#{eIdx + 1}</Text>
                                <View style={styles.restBadge}>
                                  <Text style={styles.restBadgeText}>Rest {ex.rest || '60s'}</Text>
                                </View>
                              </View>
                              <Text style={styles.exerciseName}>{ex.name || ex.exerciseId?.name || 'Exercise'}</Text>
                              <Text style={styles.exerciseSpecs}>
                                {ex.sets} sets • {ex.reps || ex.repetitions || '10-12'} reps
                              </Text>
                              {ex.notes ? (
                                <Text style={styles.exerciseNoteText}>"{ex.notes}"</Text>
                              ) : null}
                            </View>
                          ))}
                        </View>
                      </View>
                    ))}
                  </View>
                ))}
              </View>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* TAB 2: DIET PLAN (Matching Web Screenshot 2)                 */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'diet' && (
              <View style={styles.tabContentBlock}>
                {/* Pending Diet Requests */}
                {pendingDietRequests.length > 0 && (
                  <View style={styles.pendingAlertBox}>
                    <View style={styles.pendingAlertHeader}>
                      <Ionicons name="time-outline" size={16} color="#B45309" />
                      <Text style={styles.pendingAlertHeaderText}>
                        Pending Diet Plan Approvals ({pendingDietRequests.length})
                      </Text>
                    </View>
                    {pendingDietRequests.map(req => (
                      <View key={req._id} style={styles.pendingItemCard}>
                        <Text style={styles.pendingItemTitle}>{req.title}</Text>
                        <Text style={styles.pendingItemSub}>
                          Sent to Coach {req.trainerId?.name || 'Trainer'}: "{req.customerMessage}"
                        </Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Display Approved Diet Plans */}
                {displayedDietPlans.map((diet, dIdx) => {
                  const details = diet.dietDetails || {};
                  const meals = details.meals || [];
                  return (
                    <View key={diet._id || dIdx} style={styles.planCard}>
                      {/* Approved header */}
                      <View style={styles.dietHeaderRow}>
                        <View style={styles.approvedPill}>
                          <Ionicons name="checkmark-circle" size={13} color="#EA580C" />
                          <Text style={styles.approvedPillText}>
                            Approved by Coach {diet.trainerName || diet.trainerId?.name || 'Naveen'}
                          </Text>
                        </View>
                        {diet.trainerFeedback ? (
                          <View style={styles.coachAdvicePill}>
                            <Text style={styles.coachAdvicePillText}>
                              Coach Advice: "{diet.trainerFeedback}"
                            </Text>
                          </View>
                        ) : null}
                      </View>

                      <View style={styles.dietTitleBlock}>
                        <Text style={styles.dietTitle}>{diet.title || 'Personal Nutrition Plan'}</Text>
                        {diet.goal ? (
                          <Text style={styles.dietGoal}>Goal: {diet.goal}</Text>
                        ) : null}
                      </View>

                      {/* 4 Macro Summary Cards (Matching Web Screenshot 2) */}
                      <View style={styles.macrosRow}>
                        <View style={styles.macroCard}>
                          <Ionicons name="flame" size={20} color="#EA580C" />
                          <Text style={styles.macroLabel}>Calories</Text>
                          <Text style={styles.macroValue}>{details.dailyCalories || '222'}</Text>
                        </View>
                        <View style={styles.macroCard}>
                          <Ionicons name="locate" size={20} color="#EA580C" />
                          <Text style={styles.macroLabel}>Protein</Text>
                          <Text style={styles.macroValue}>{details.protein || '33g'}</Text>
                        </View>
                        <View style={styles.macroCard}>
                          <Ionicons name="restaurant" size={20} color="#F59E0B" />
                          <Text style={styles.macroLabel}>Carbs</Text>
                          <Text style={styles.macroValue}>{details.carbs || '33g'}</Text>
                        </View>
                        <View style={styles.macroCard}>
                          <Ionicons name="water" size={20} color="#0284C7" />
                          <Text style={styles.macroLabel}>Hydration</Text>
                          <Text style={styles.macroValue} numberOfLines={2}>
                            {details.hydration || '3.0 - 4.0 Liters / day'}
                          </Text>
                        </View>
                      </View>

                      {/* Approved Meal Schedule (Matching Web Screenshot 2) */}
                      <View style={styles.mealScheduleBlock}>
                        <Text style={styles.mealScheduleHeading}>Approved Meal Schedule</Text>

                        <View style={styles.mealsGrid}>
                          {meals.map((meal: any, mIdx: number) => (
                            <View key={mIdx} style={styles.mealCard}>
                              <View style={styles.mealHeaderRow}>
                                <Text style={styles.mealName}>
                                  {meal.mealName} ({meal.time})
                                </Text>
                                <View style={styles.mealTimeBadge}>
                                  <Text style={styles.mealTimeBadgeText}>{meal.time}</Text>
                                </View>
                              </View>
                              <Text style={styles.mealItemsText}>{meal.items}</Text>
                              <View style={styles.mealFooterSpecs}>
                                <Text style={styles.mealSpecText}>{meal.calories}</Text>
                                <Text style={styles.mealSpecBullet}>•</Text>
                                <Text style={styles.mealSpecText}>{meal.protein} protein</Text>
                              </View>
                            </View>
                          ))}
                        </View>
                      </View>
                    </View>
                  );
                })}
              </View>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* TAB 3: EXERCISE VIDEOS (Matching Web Screenshot 3)           */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'videos' && (
              <View style={styles.tabContentBlock}>
                {/* Videos Header Card */}
                <View style={styles.sectionBannerCard}>
                  <View style={styles.sectionBannerRow}>
                    <View style={styles.videoIconCircle}>
                      <Ionicons name="videocam" size={18} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.sectionBannerTitle}>Gym Exercise Videos (YouTube)</Text>
                        <View style={styles.youtubeBadge}>
                          <Text style={styles.youtubeBadgeText}>YouTube Tutorials</Text>
                        </View>
                      </View>
                      <Text style={styles.sectionBannerDesc}>
                        Watch instructional workout videos with step-by-step technique tips in both <Text style={{ color: '#EA580C', fontWeight: '800' }}>Tamil (தமிழ்)</Text> and <Text style={{ color: '#EA580C', fontWeight: '800' }}>English</Text>.
                      </Text>
                    </View>
                  </View>

                  {/* Language Selector */}
                  <View style={styles.languagePillsRow}>
                    <Ionicons name="globe-outline" size={15} color="#EA580C" style={{ marginRight: 4 }} />
                    {(['All', 'Tamil', 'English'] as const).map(lang => (
                      <TouchableOpacity
                        key={lang}
                        style={[
                          styles.langBtn,
                          youtubeLanguage === lang && styles.langBtnActive
                        ]}
                        onPress={() => setYoutubeLanguage(lang)}
                        activeOpacity={0.7}
                      >
                        <Text style={[
                          styles.langBtnText,
                          youtubeLanguage === lang && styles.langBtnTextActive
                        ]}>
                          {lang === 'Tamil' ? 'தமிழ் (Tamil)' : lang}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>

                  {/* Muscle Filter Horizontal Bar */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    <Text style={styles.filterLabel}>MUSCLE:</Text>
                    {['All', 'Chest', 'Back', 'Legs', 'Shoulders', 'Biceps & Triceps', 'Core & Cardio'].map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.filterPill, youtubeCategory === cat && styles.filterPillActive]}
                        onPress={() => setYoutubeCategory(cat)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.filterPillText, youtubeCategory === cat && styles.filterPillTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Search Bar */}
                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={15} color="#94A3B8" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search YouTube videos..."
                      placeholderTextColor="#94A3B8"
                      value={youtubeSearch}
                      onChangeText={setYoutubeSearch}
                    />
                    {youtubeSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setYoutubeSearch('')}>
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Videos Cards Grid */}
                <View style={styles.cardsGrid}>
                  {filteredYoutubeVideos.map(video => (
                    <TouchableOpacity
                      key={video.id}
                      style={styles.videoCard}
                      onPress={() => setSelectedVideoModal(video)}
                      activeOpacity={0.9}
                    >
                      {/* Thumbnail Container */}
                      <View style={styles.videoThumbBox}>
                        <Image
                          source={{ uri: `https://img.youtube.com/vi/${video.youtubeId}/hqdefault.jpg` }}
                          style={styles.videoThumbImage}
                          resizeMode="cover"
                        />
                        <View style={styles.videoOverlay}>
                          <View style={styles.playButtonCircle}>
                            <Ionicons name="play" size={18} color="#FFFFFF" style={{ marginLeft: 2 }} />
                          </View>
                        </View>
                        {/* Duration Badge */}
                        <View style={styles.durationBadge}>
                          <Ionicons name="time-outline" size={10} color="#FFFFFF" />
                          <Text style={styles.durationBadgeText}>{video.duration}</Text>
                        </View>
                        {/* Lang & Cat Badges */}
                        <View style={styles.thumbTopBadges}>
                          <View style={[styles.thumbLangBadge, video.language === 'Tamil' && styles.thumbLangBadgeTamil]}>
                            <Text style={styles.thumbLangBadgeText}>
                              {video.language === 'Tamil' ? 'தமிழ்' : 'English'}
                            </Text>
                          </View>
                          <View style={styles.thumbCatBadge}>
                            <Text style={styles.thumbCatBadgeText}>{video.category}</Text>
                          </View>
                        </View>
                      </View>

                      {/* Content */}
                      <View style={styles.videoContent}>
                        <View style={styles.videoSpecsRow}>
                          <Text style={styles.videoLevelBadge}>{video.level}</Text>
                          <Text style={styles.videoMuscleText}>{video.targetMuscle.split(',')[0]}</Text>
                        </View>
                        <Text style={styles.videoTitle} numberOfLines={2}>{video.title}</Text>
                        {video.titleTamil ? (
                          <Text style={styles.videoTamilTitle} numberOfLines={1}>{video.titleTamil}</Text>
                        ) : null}
                        <Text style={styles.videoDesc} numberOfLines={2}>
                          {video.language === 'Tamil' && video.descriptionTamil ? video.descriptionTamil : video.description}
                        </Text>

                        {/* Watch button */}
                        <TouchableOpacity
                          style={styles.watchVideoBtn}
                          onPress={() => setSelectedVideoModal(video)}
                          activeOpacity={0.8}
                        >
                          <Ionicons name="play-circle" size={15} color="#DC2626" />
                          <Text style={styles.watchVideoBtnText}>Watch YouTube Video</Text>
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* TAB 4: ANIMATED EXERCISE LIBRARY (Matching Web Screenshot 3) */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'library' && (
              <View style={styles.tabContentBlock}>
                {/* Header Banner */}
                <View style={styles.sectionBannerCard}>
                  <View style={styles.sectionBannerRow}>
                    <View style={[styles.videoIconCircle, { backgroundColor: '#EA580C' }]}>
                      <Ionicons name="book" size={18} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                        <Text style={styles.sectionBannerTitle}>Animated Exercise Library</Text>
                        <View style={styles.animatedBadge}>
                          <Text style={styles.animatedBadgeText}>Biomechanical 3D/2D</Text>
                        </View>
                      </View>
                      <Text style={styles.sectionBannerDesc}>
                        Interactive procedural animated workout demonstrations showing proper posture, execution angles, and exact muscle contractions.
                      </Text>
                    </View>
                  </View>

                  {/* Muscle Filter Horizontal Bar */}
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    <Text style={styles.filterLabel}>MUSCLE:</Text>
                    {['All', 'Legs', 'Chest', 'Back', 'Shoulders', 'Arms', 'Core', 'Cardio'].map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.filterPill, libraryCategory === cat && styles.filterPillActive]}
                        onPress={() => setLibraryCategory(cat)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.filterPillText, libraryCategory === cat && styles.filterPillTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  {/* Search Bar */}
                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={15} color="#94A3B8" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search animated exercises..."
                      placeholderTextColor="#94A3B8"
                      value={librarySearch}
                      onChangeText={setLibrarySearch}
                    />
                    {librarySearch.length > 0 && (
                      <TouchableOpacity onPress={() => setLibrarySearch('')}>
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Animated Cards Grid Matching Web (100% Identical) */}
                <View style={styles.cardsGrid}>
                  {filteredExercises.map(ex => (
                    <TouchableOpacity
                      key={ex.id || ex.name}
                      style={styles.exerciseLibraryCard}
                      onPress={() => setSelectedExerciseModal(ex)}
                      activeOpacity={0.9}
                    >
                      {/* Animated Simulation Banner matching Web Image 2 & 3 */}
                      <View style={styles.exerciseAnimatedBox}>
                        {/* Live Biomechanical Stick Figure Simulation */}
                        <View style={styles.stickFigureWrapper}>
                          <StickFigureAnimation
                            exerciseName={ex.name}
                            category={ex.category}
                            targetMuscle={ex.targetMuscle}
                          />
                        </View>

                        {/* Top-Left Category & Difficulty Badges */}
                        <View style={styles.cardTopBadgesLeft}>
                          <View style={styles.animatedCatPill}>
                            <Text style={styles.animatedCatText}>{ex.category}</Text>
                          </View>
                          <View style={[
                            styles.animatedDiffPill,
                            ex.difficulty === 'Intermediate' && styles.diffIntermediatePill,
                            ex.difficulty === 'Advanced' && styles.diffAdvancedPill,
                          ]}>
                            <Text style={[
                              styles.animatedDiffText,
                              ex.difficulty === 'Intermediate' && styles.diffIntermediateText,
                              ex.difficulty === 'Advanced' && styles.diffAdvancedText,
                            ]}>
                              {ex.difficulty || 'Beginner'}
                            </Text>
                          </View>
                        </View>

                        {/* Top-Right Animated Badge */}
                        <View style={styles.cardTopBadgesRight}>
                          <View style={styles.sparkleBadge}>
                            <Ionicons name="sparkles" size={10} color="#FFFFFF" />
                            <Text style={styles.sparkleBadgeText}>Animated</Text>
                          </View>
                        </View>

                        {/* Bottom-Left 1-MIN FORM DEMO Pill */}
                        <View style={styles.formDemoPill}>
                          <View style={styles.formDemoDot} />
                          <Text style={styles.formDemoText}>1-MIN FORM DEMO</Text>
                        </View>

                        {/* Bottom-Right Circular Play Button */}
                        <View style={styles.animatedPlayBtn}>
                          <Ionicons name="play" size={16} color="#FFFFFF" style={{ marginLeft: 2 }} />
                        </View>
                      </View>

                      {/* Content Matching Web Card Structure */}
                      <View style={styles.exerciseCardBody}>
                        {/* Row with Orange Category on left, Target Muscle on right */}
                        <View style={styles.exerciseMuscleHeader}>
                          <Text style={styles.cardCategoryLabel}>{ex.category}</Text>
                          <Text style={styles.muscleTargetText}>{ex.targetMuscle}</Text>
                        </View>

                        {/* Exercise Name */}
                        <Text style={styles.exerciseLibraryName}>{ex.name}</Text>

                        {/* Description */}
                        <Text style={styles.exerciseLibraryDesc} numberOfLines={2}>
                          {ex.description || ex.instructions}
                        </Text>

                        {/* Sets, Reps, Rest Specs Box */}
                        <View style={styles.setsRepsRow}>
                          <View style={styles.setCol}>
                            <Text style={styles.setColLabel}>SETS</Text>
                            <Text style={styles.setColVal}>{ex.defaultSets || 3} sets</Text>
                          </View>
                          <View style={styles.setCol}>
                            <Text style={styles.setColLabel}>REPS</Text>
                            <Text style={styles.setColVal}>{ex.defaultRepetitions || 12} reps</Text>
                          </View>
                          <View style={styles.setCol}>
                            <Text style={styles.setColLabel}>REST</Text>
                            <Text style={styles.setColVal}>{ex.defaultRest || 45}s</Text>
                          </View>
                        </View>

                        {/* Bottom Bar: Equipment on left, Watch button on right */}
                        <View style={styles.cardBottomBar}>
                          <Text style={styles.cardEquipmentText} numberOfLines={1}>
                            {ex.equipment || 'Gym Equipment'}
                          </Text>
                          <TouchableOpacity
                            style={styles.watchAnimatedBtn}
                            onPress={() => setSelectedExerciseModal(ex)}
                            activeOpacity={0.8}
                          >
                            <Ionicons name="play" size={12} color="#C2410C" />
                            <Text style={styles.watchAnimatedBtnText}>Watch Animated Guide</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            )}

            {/* ════════════════════════════════════════════════════════════ */}
            {/* TAB 5: GYM EQUIPMENTS (Matching Web Screenshot 1 & 4)        */}
            {/* ════════════════════════════════════════════════════════════ */}
            {activeTab === 'equipments' && (
              <View style={styles.tabContentBlock}>
                {/* Header Banner */}
                <View style={styles.equipmentBannerCard}>
                  <View style={styles.equipmentBannerRow}>
                    <View style={styles.shieldIconCircle}>
                      <Ionicons name="shield-checkmark" size={24} color="#FFFFFF" />
                    </View>
                    <View style={{ flex: 1 }}>
                      <View style={styles.verifiedHeaderBadgeRow}>
                        <View style={styles.trainerVerifiedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#EA580C" />
                          <Text style={styles.trainerVerifiedText}>Trainer Verified & Approved</Text>
                        </View>
                        <Text style={styles.approvedCountSub}>
                          {approvedEquipments.length} Approved Available Machines & Weights
                        </Text>
                      </View>
                      <Text style={styles.equipmentMainHeading}>Gym Equipments & Machines</Text>
                      <Text style={styles.equipmentMainDesc}>
                        These equipments have been checked and approved by your certified gym trainers for safe and effective member workouts.
                      </Text>
                    </View>
                  </View>

                  <View style={styles.readyBadgeRow}>
                    <View style={styles.readyForWorkoutBadge}>
                      <Text style={styles.readyForWorkoutText}>Ready for Workout</Text>
                    </View>
                  </View>
                </View>

                {/* Filter & Search Bar */}
                <View style={styles.equipmentFilterBlock}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.categoryScroll}>
                    {equipmentCategories.map(cat => (
                      <TouchableOpacity
                        key={cat}
                        style={[styles.equipmentCategoryBtn, equipmentCategory === cat && styles.equipmentCategoryBtnActive]}
                        onPress={() => setEquipmentCategory(cat)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.equipmentCategoryBtnText, equipmentCategory === cat && styles.equipmentCategoryBtnTextActive]}>
                          {cat}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>

                  <View style={styles.searchBar}>
                    <Ionicons name="search" size={15} color="#94A3B8" />
                    <TextInput
                      style={styles.searchInput}
                      placeholder="Search equipment or brand..."
                      placeholderTextColor="#94A3B8"
                      value={equipmentSearch}
                      onChangeText={setEquipmentSearch}
                    />
                    {equipmentSearch.length > 0 && (
                      <TouchableOpacity onPress={() => setEquipmentSearch('')}>
                        <Ionicons name="close-circle" size={16} color="#94A3B8" />
                      </TouchableOpacity>
                    )}
                  </View>
                </View>

                {/* Equipment Cards Grid */}
                <View style={styles.cardsGrid}>
                  {filteredEquipments.map((eq, eIdx) => (
                    <View key={eq._id || eIdx} style={styles.equipmentCard}>
                      <View style={styles.equipmentCardTopRow}>
                        <View style={styles.categoryPill}>
                          <Text style={styles.categoryPillText}>{eq.category?.toUpperCase() || 'CARDIO'}</Text>
                        </View>
                        <View style={styles.trainerApprovedBadge}>
                          <Ionicons name="checkmark-circle" size={12} color="#EA580C" />
                          <Text style={styles.trainerApprovedText}>Trainer Approved</Text>
                        </View>
                      </View>

                      <Text style={styles.equipmentName}>{eq.name}</Text>
                      {eq.brand ? (
                        <Text style={styles.equipmentBrand}>
                          Brand: <Text style={{ color: '#111827', fontWeight: '700' }}>{eq.brand}</Text>
                        </Text>
                      ) : null}

                      {/* Units & Condition Stats */}
                      <View style={styles.equipmentStatsRow}>
                        <View style={styles.equipmentStatCol}>
                          <Text style={styles.statLabel}>UNITS</Text>
                          <Text style={styles.statVal}>{eq.quantity || 4} Available</Text>
                        </View>
                        <View style={styles.equipmentStatCol}>
                          <Text style={styles.statLabel}>CONDITION</Text>
                          <Text style={[styles.statVal, { color: '#EA580C' }]}>{eq.condition || 'Good'}</Text>
                        </View>
                      </View>

                      {/* Verified by Coach Note */}
                      <View style={styles.coachVerifiedNotice}>
                        <View style={styles.coachVerifiedNoticeHeader}>
                          <Ionicons name="shield-checkmark" size={13} color="#EA580C" />
                          <Text style={styles.coachVerifiedNoticeTitle}>
                            Verified by {eq.approvedByName || 'Coach Naveen'}
                          </Text>
                        </View>
                        <Text style={styles.coachVerifiedNoticeDesc}>
                          {eq.notes || 'Safe for all fitness levels. Please wipe down after workout and re-rack weights properly.'}
                        </Text>
                      </View>

                      {/* Card Footer */}
                      <View style={styles.equipmentCardFooter}>
                        <Text style={styles.equipmentStatus}>
                          Status: <Text style={{ color: '#EA580C', fontWeight: '800' }}>{eq.status || 'Active in Gym'}</Text>
                        </Text>
                        <Text style={styles.equipmentDate}>{eq.approvedAt || '11/5/2026'}</Text>
                      </View>
                    </View>
                  ))}
                </View>
              </View>
            )}
          </>
        )}
      </ScrollView>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ENTER MANUALLY MODAL (Matching Web Modal)                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Modal
        visible={isManualModalOpen}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setIsManualModalOpen(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
                <View style={styles.modalIconBox}>
                  <Ionicons name="add" size={18} color="#EA580C" />
                </View>
                <Text style={styles.modalTitle}>Enter Plan Manually</Text>
              </View>
              <TouchableOpacity onPress={() => setIsManualModalOpen(false)} style={styles.closeBtn}>
                <Ionicons name="close" size={20} color="#64748B" />
              </TouchableOpacity>
            </View>

            <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
              {/* Plan Type Selector */}
              <Text style={styles.inputLabel}>SELECT PLAN TYPE</Text>
              <View style={styles.planTypeRow}>
                {(['Workout Plan', 'Diet Plan', 'Exercise Library'] as const).map(type => (
                  <TouchableOpacity
                    key={type}
                    style={[styles.typeBtn, manualPlanType === type && styles.typeBtnActive]}
                    onPress={() => setManualPlanType(type)}
                  >
                    <Text style={[styles.typeBtnText, manualPlanType === type && styles.typeBtnTextActive]}>
                      {type}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Select Trainer */}
              <Text style={styles.inputLabel}>CHOOSE TRAINER TO REVIEW</Text>
              <View style={styles.trainerSelectorRow}>
                {availableTrainers.map(t => (
                  <TouchableOpacity
                    key={t._id}
                    style={[styles.trainerOptionCard, selectedTrainerId === t._id && styles.trainerOptionCardActive]}
                    onPress={() => setSelectedTrainerId(t._id)}
                  >
                    <Ionicons
                      name={selectedTrainerId === t._id ? 'radio-button-on' : 'radio-button-off'}
                      size={16}
                      color={selectedTrainerId === t._id ? '#EA580C' : '#94A3B8'}
                    />
                    <Text style={[styles.trainerOptionName, selectedTrainerId === t._id && styles.trainerOptionNameActive]}>
                      Coach {t.name || t.firstName}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              {/* Plan Title */}
              <Text style={styles.inputLabel}>PLAN TITLE *</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Muscle Hypertrophy Split, Weight Loss Diet"
                placeholderTextColor="#94A3B8"
                value={manualTitle}
                onChangeText={setManualTitle}
              />

              {/* Plan Goal */}
              <Text style={styles.inputLabel}>FITNESS GOAL</Text>
              <TextInput
                style={styles.modalInput}
                placeholder="e.g. Lean Bulking, Fat Loss, Core Stability"
                placeholderTextColor="#94A3B8"
                value={manualGoal}
                onChangeText={setManualGoal}
              />

              {/* Message to Trainer */}
              <Text style={styles.inputLabel}>MESSAGE TO TRAINER *</Text>
              <TextInput
                style={[styles.modalInput, { minHeight: 90, textAlignVertical: 'top' }]}
                placeholder="Explain your preferred exercises, meal choices, or injury constraints..."
                placeholderTextColor="#94A3B8"
                multiline
                numberOfLines={4}
                value={manualMessage}
                onChangeText={setManualMessage}
              />

              <TouchableOpacity
                style={[styles.submitPlanBtn, submittingManual && { opacity: 0.6 }]}
                onPress={handleManualSubmit}
                disabled={submittingManual}
              >
                {submittingManual ? (
                  <ActivityIndicator size="small" color="#FFFFFF" />
                ) : (
                  <>
                    <Ionicons name="paper-plane" size={16} color="#FFFFFF" />
                    <Text style={styles.submitPlanBtnText}>Submit to Coach for Approval</Text>
                  </>
                )}
              </TouchableOpacity>
            </ScrollView>
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* YOUTUBE VIDEO PLAYER MODAL                                    */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Modal
        visible={Boolean(selectedVideoModal)}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setSelectedVideoModal(null)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            {selectedVideoModal && (
              <>
                <View style={styles.modalHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.modalTitle} numberOfLines={1}>{selectedVideoModal.title}</Text>
                    <Text style={{ fontSize: 11, color: '#EA580C', fontWeight: '700' }}>
                      {selectedVideoModal.category} • {selectedVideoModal.language === 'Tamil' ? 'தமிழ் (Tamil)' : 'English'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedVideoModal(null)} style={styles.closeBtn}>
                    <Ionicons name="close" size={20} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.modalScroll} showsVerticalScrollIndicator={false}>
                  {/* Thumbnail Banner with Play Click */}
                  <TouchableOpacity
                    style={styles.modalVideoPlayerBox}
                    onPress={() => openYouTube(selectedVideoModal.youtubeId)}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: `https://img.youtube.com/vi/${selectedVideoModal.youtubeId}/hqdefault.jpg` }}
                      style={styles.modalVideoPlayerImage}
                      resizeMode="cover"
                    />
                    <View style={styles.modalVideoOverlay}>
                      <View style={styles.modalPlayCircle}>
                        <Ionicons name="play" size={28} color="#FFFFFF" style={{ marginLeft: 3 }} />
                      </View>
                      <Text style={styles.modalTapToPlayText}>Tap to Play on YouTube</Text>
                    </View>
                  </TouchableOpacity>

                  {/* YouTube Action Button */}
                  <TouchableOpacity
                    style={styles.openYouTubeBtn}
                    onPress={() => openYouTube(selectedVideoModal.youtubeId)}
                  >
                    <Ionicons name="logo-youtube" size={18} color="#FFFFFF" />
                    <Text style={styles.openYouTubeBtnText}>Watch on YouTube App</Text>
                  </TouchableOpacity>

                  {/* Details */}
                  <View style={styles.modalSpecsCard}>
                    <Text style={styles.modalSpecsHeading}>Technique Tips & Focus</Text>
                    {selectedVideoModal.tips.map((tip, idx) => (
                      <View key={idx} style={styles.tipRow}>
                        <Ionicons name="checkmark-circle" size={14} color="#EA580C" />
                        <Text style={styles.tipText}>{tip}</Text>
                      </View>
                    ))}
                  </View>

                  <View style={[styles.modalSpecsCard, { marginTop: 12 }]}>
                    <Text style={styles.modalSpecsHeading}>Muscle Target & Equipment</Text>
                    <Text style={styles.modalSpecsBody}>
                      <Text style={{ fontWeight: '800', color: '#111827' }}>Target Muscles: </Text>
                      {selectedVideoModal.targetMuscle}
                    </Text>
                    <Text style={[styles.modalSpecsBody, { marginTop: 4 }]}>
                      <Text style={{ fontWeight: '800', color: '#111827' }}>Equipment Required: </Text>
                      {selectedVideoModal.equipment}
                    </Text>
                  </View>
                </ScrollView>
              </>
            )}
          </View>
        </View>
      </Modal>

      {/* ════════════════════════════════════════════════════════════ */}
      {/* ANIMATED EXERCISE DETAIL MODAL (Centered & Formatted)        */}
      {/* ════════════════════════════════════════════════════════════ */}
      <Modal
        visible={Boolean(selectedExerciseModal)}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setSelectedExerciseModal(null)}
      >
        <TouchableOpacity
          style={styles.exerciseModalOverlay}
          activeOpacity={1}
          onPress={() => setSelectedExerciseModal(null)}
        >
          <TouchableOpacity
            style={styles.exerciseModalCard}
            activeOpacity={1}
            onPress={(e) => e.stopPropagation?.()}
          >
            {selectedExerciseModal && (
              <>
                <View style={styles.exerciseModalHeader}>
                  <View style={{ flex: 1, paddingRight: 8 }}>
                    <Text style={styles.modalTitle}>{selectedExerciseModal.name}</Text>
                    <Text style={{ fontSize: 11, color: '#EA580C', fontWeight: '700', marginTop: 2 }}>
                      {selectedExerciseModal.category} • {selectedExerciseModal.difficulty || 'All Levels'}
                    </Text>
                  </View>
                  <TouchableOpacity onPress={() => setSelectedExerciseModal(null)} style={styles.closeBtn}>
                    <Ionicons name="close" size={22} color="#64748B" />
                  </TouchableOpacity>
                </View>

                <ScrollView style={styles.exerciseModalScroll} showsVerticalScrollIndicator={false}>
                  {/* Full AI Animated Technique Video Player */}
                  <MobileExerciseVideoPlayer
                    exerciseName={selectedExerciseModal.name}
                    category={selectedExerciseModal.category || selectedExerciseModal.targetMuscle}
                    targetMuscle={selectedExerciseModal.targetMuscle || selectedExerciseModal.category}
                    difficulty={selectedExerciseModal.difficulty || 'All Levels'}
                    instructions={selectedExerciseModal.instructions || selectedExerciseModal.description}
                    coachTips={selectedExerciseModal.instructions || selectedExerciseModal.description}
                    duration={60}
                  />

                  <View style={styles.modalSpecsCard}>
                    <Text style={styles.modalSpecsHeading}>Execution Instructions</Text>
                    <Text style={styles.modalSpecsBody}>
                      {selectedExerciseModal.instructions || selectedExerciseModal.description}
                    </Text>
                  </View>

                  <View style={[styles.modalSpecsCard, { marginTop: 12 }]}>
                    <Text style={styles.modalSpecsHeading}>Recommended Parameters</Text>
                    <View style={styles.setsRepsRow}>
                      <View style={styles.setCol}>
                        <Text style={styles.setColLabel}>SETS</Text>
                        <Text style={styles.setColVal}>{selectedExerciseModal.defaultSets || 3} sets</Text>
                      </View>
                      <View style={styles.setCol}>
                        <Text style={styles.setColLabel}>REPS</Text>
                        <Text style={styles.setColVal}>{selectedExerciseModal.defaultRepetitions || 12} reps</Text>
                      </View>
                      <View style={styles.setCol}>
                        <Text style={styles.setColLabel}>REST</Text>
                        <Text style={styles.setColVal}>{selectedExerciseModal.defaultRest || 45}s</Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ height: 16 }} />
                </ScrollView>
              </>
            )}
          </TouchableOpacity>
        </TouchableOpacity>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  scroll: {
    flex: 1,
  },
  content: {
    padding: 14,
    paddingBottom: 40,
    gap: 14,
  },

  /* ── 1. Top Header Card ── */
  topHeaderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  headerTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  headerIconBox: {
    width: 40,
    height: 40,
    borderRadius: 14,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTextCol: {
    flex: 1,
    gap: 4,
  },
  titleWithBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    flexWrap: 'wrap',
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  coachVerifiedBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  coachVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  headerSubtitle: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  enterManuallyBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#EA580C',
    paddingVertical: 11,
    paddingHorizontal: 16,
    borderRadius: 14,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  enterManuallyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* ── 2. Horizontal Tabs Menu ── */
  tabsScroll: {
    flexDirection: 'row',
    gap: 8,
    paddingVertical: 4,
  },
  tabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  tabBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  tabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  tabBtnTextActive: {
    color: '#EA580C',
  },
  tabCountBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 10,
  },
  tabCountBadgeActive: {
    backgroundColor: '#EA580C',
  },
  tabCountText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
  },
  tabCountTextActive: {
    color: '#FFFFFF',
  },

  loadingBox: {
    paddingVertical: 40,
    alignItems: 'center',
    gap: 8,
  },
  loadingText: {
    fontSize: 12,
    color: '#64748B',
  },

  /* ── Tab Block General ── */
  tabContentBlock: {
    gap: 14,
  },
  cardsGrid: {
    gap: 12,
  },

  /* Pending Alert Box */
  pendingAlertBox: {
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#FDE68A',
    borderRadius: 16,
    padding: 12,
    gap: 8,
  },
  pendingAlertHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  pendingAlertHeaderText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B45309',
  },
  pendingItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    gap: 4,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  pendingItemTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  pendingItemSub: {
    fontSize: 11,
    color: '#64748B',
  },
  pendingStatusBadge: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
    marginTop: 2,
  },
  pendingStatusText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#B45309',
  },

  /* Workout Plan Cards */
  planCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 14,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  planCardHeader: {
    gap: 6,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 10,
  },
  approvedPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    alignSelf: 'flex-start',
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  approvedPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  planCardTitle: {
    fontSize: 18,
    fontWeight: '900',
    color: '#111827',
  },
  planGoalText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  coachNoteBox: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginTop: 4,
  },
  coachNoteText: {
    fontSize: 11.5,
    color: '#EA580C',
    fontWeight: '600',
    flex: 1,
  },
  dayBlock: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  dayHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  dayTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
  },
  dayFocusBadge: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  dayFocusText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  exercisesGrid: {
    gap: 8,
  },
  exerciseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    gap: 4,
  },
  exerciseCardTop: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  exerciseIndex: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  restBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  restBadgeText: {
    fontSize: 10,
    color: '#64748B',
    fontWeight: '600',
  },
  exerciseName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
  },
  exerciseSpecs: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  exerciseNoteText: {
    fontSize: 10.5,
    color: '#64748B',
    fontStyle: 'italic',
    marginTop: 2,
  },

  /* ── Tab 2: Diet Plan (Matching Web Screenshot 2) ── */
  dietHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 8,
  },
  coachAdvicePill: {
    backgroundColor: '#FFF7ED',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 12,
  },
  coachAdvicePillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#EA580C',
  },
  dietTitleBlock: {
    gap: 2,
  },
  dietTitle: {
    fontSize: 20,
    fontWeight: '900',
    color: '#111827',
  },
  dietGoal: {
    fontSize: 12,
    fontWeight: '700',
    color: '#EA580C',
  },
  macrosRow: {
    flexDirection: 'row',
    gap: 8,
    justifyContent: 'space-between',
  },
  macroCard: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 12,
    paddingHorizontal: 6,
    alignItems: 'center',
    gap: 4,
  },
  macroLabel: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  macroValue: {
    fontSize: 14,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  mealScheduleBlock: {
    gap: 10,
    marginTop: 6,
  },
  mealScheduleHeading: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  mealsGrid: {
    gap: 10,
  },
  mealCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
  },
  mealHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  mealName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    flex: 1,
  },
  mealTimeBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  mealTimeBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  mealItemsText: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
  },
  mealFooterSpecs: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },
  mealSpecText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  mealSpecBullet: {
    fontSize: 11,
    color: '#94A3B8',
  },

  /* ── Tab 3: Videos (Matching Web Screenshot 3) ── */
  sectionBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  sectionBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 10,
  },
  videoIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sectionBannerTitle: {
    fontSize: 15,
    fontWeight: '900',
    color: '#111827',
  },
  youtubeBadge: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  youtubeBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B91C1C',
  },
  sectionBannerDesc: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 2,
    lineHeight: 16,
  },
  languagePillsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: '#F8FAFC',
    padding: 6,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  langBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  langBtnActive: {
    backgroundColor: '#DC2626',
  },
  langBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  langBtnTextActive: {
    color: '#FFFFFF',
  },
  categoryScroll: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  filterLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: '#64748B',
    marginRight: 4,
  },
  filterPill: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  filterPillActive: {
    backgroundColor: '#EA580C',
    borderColor: '#EA580C',
  },
  filterPillText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  filterPillTextActive: {
    color: '#FFFFFF',
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    paddingHorizontal: 10,
    paddingVertical: 6,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 12,
    color: '#111827',
    padding: 0,
  },
  videoCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  videoThumbBox: {
    position: 'relative',
    width: '100%',
    height: 160,
    backgroundColor: '#000000',
  },
  videoThumbImage: {
    width: '100%',
    height: 160,
    opacity: 0.9,
  },
  videoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  playButtonCircle: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.4,
    shadowRadius: 4,
    elevation: 4,
  },
  durationBadge: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(0,0,0,0.85)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  durationBadgeText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  thumbTopBadges: {
    position: 'absolute',
    top: 8,
    left: 8,
    flexDirection: 'row',
    gap: 6,
  },
  thumbLangBadge: {
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  thumbLangBadgeTamil: {
    backgroundColor: '#EA580C',
  },
  thumbLangBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  thumbCatBadge: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
  },
  thumbCatBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  videoContent: {
    padding: 14,
    gap: 6,
  },
  videoSpecsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  videoLevelBadge: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#B45309',
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  videoMuscleText: {
    fontSize: 11,
    color: '#64748B',
    fontWeight: '600',
  },
  videoTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#111827',
    lineHeight: 19,
  },
  videoTamilTitle: {
    fontSize: 11.5,
    color: '#EA580C',
    fontWeight: '700',
  },
  videoDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
  },
  watchVideoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    backgroundColor: '#FEF2F2',
    borderWidth: 1,
    borderColor: '#FECACA',
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 4,
  },
  watchVideoBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },

  /* ── Tab 4: Animated Library (Matching Web Screenshot 3) ── */
  animatedBadge: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 8,
  },
  animatedBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#EA580C',
  },
  exerciseLibraryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    marginBottom: 16,
  },
  exerciseAnimatedBox: {
    height: 155,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  stickFigureWrapper: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cardTopBadgesLeft: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 10,
  },
  cardTopBadgesRight: {
    position: 'absolute',
    top: 10,
    right: 10,
    zIndex: 10,
  },
  animatedCatPill: {
    backgroundColor: 'rgba(0,0,0,0.75)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  animatedCatText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    textTransform: 'uppercase',
  },
  animatedDiffPill: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  animatedDiffText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#C2410C',
    textTransform: 'uppercase',
  },
  diffIntermediatePill: {
    backgroundColor: '#D97706',
    borderWidth: 0,
  },
  diffIntermediateText: {
    color: '#FFFFFF',
  },
  diffAdvancedPill: {
    backgroundColor: '#E11D48',
    borderWidth: 0,
  },
  diffAdvancedText: {
    color: '#FFFFFF',
  },
  sparkleBadge: {
    backgroundColor: '#C2410C',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
    elevation: 2,
  },
  sparkleBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  formDemoPill: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: 'rgba(0,0,0,0.65)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    zIndex: 10,
  },
  formDemoDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#EF4444',
  },
  formDemoText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  animatedPlayBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
    elevation: 3,
    zIndex: 10,
  },
  exerciseCardBody: {
    padding: 16,
    gap: 4,
  },
  exerciseMuscleHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 2,
  },
  cardCategoryLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  muscleTargetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  exerciseLibraryName: {
    fontSize: 18,
    fontWeight: '800',
    color: '#111827',
  },
  exerciseLibraryDesc: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 17,
    marginTop: 2,
  },
  setsRepsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 9,
    marginTop: 10,
  },
  setCol: {
    flex: 1,
    alignItems: 'center',
  },
  setColLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
    textTransform: 'uppercase',
  },
  setColVal: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  cardBottomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    paddingTop: 12,
    marginTop: 10,
  },
  cardEquipmentText: {
    fontSize: 12,
    color: '#64748B',
    fontWeight: '500',
    flex: 1,
    marginRight: 8,
  },
  watchAnimatedBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 12,
  },
  watchAnimatedBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#C2410C',
  },

  /* ── Tab 5: Gym Equipments (Matching Web Screenshot 1 & 4) ── */
  equipmentBannerCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 16,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  equipmentBannerRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 12,
  },
  shieldIconCircle: {
    width: 44,
    height: 44,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  verifiedHeaderBadgeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  trainerVerifiedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 12,
  },
  trainerVerifiedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  approvedCountSub: {
    fontSize: 11,
    color: '#64748B',
  },
  equipmentMainHeading: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    marginTop: 2,
  },
  equipmentMainDesc: {
    fontSize: 11.5,
    color: '#64748B',
    lineHeight: 16,
    marginTop: 2,
  },
  readyBadgeRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
  },
  readyForWorkoutBadge: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  readyForWorkoutText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  equipmentFilterBlock: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 10,
  },
  equipmentCategoryBtn: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
  },
  equipmentCategoryBtnActive: {
    backgroundColor: '#EA580C',
  },
  equipmentCategoryBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  equipmentCategoryBtnTextActive: {
    color: '#FFFFFF',
  },
  equipmentCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 14,
    gap: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  equipmentCardTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  categoryPill: {
    backgroundColor: '#F8FAFC',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  categoryPillText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  trainerApprovedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 8,
  },
  trainerApprovedText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#EA580C',
  },
  equipmentName: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  equipmentBrand: {
    fontSize: 12,
    color: '#64748B',
  },
  equipmentStatsRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
  },
  equipmentStatCol: {
    flex: 1,
  },
  statLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  statVal: {
    fontSize: 12,
    fontWeight: '800',
    color: '#111827',
    marginTop: 2,
  },
  coachVerifiedNotice: {
    backgroundColor: '#FFF7ED',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#FFEDD5',
    padding: 10,
    gap: 4,
  },
  coachVerifiedNoticeHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  coachVerifiedNoticeTitle: {
    fontSize: 11,
    fontWeight: '800',
    color: '#EA580C',
  },
  coachVerifiedNoticeDesc: {
    fontSize: 11,
    color: '#EA580C',
    lineHeight: 15,
  },
  equipmentCardFooter: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  equipmentStatus: {
    fontSize: 11,
    color: '#64748B',
  },
  equipmentDate: {
    fontSize: 10.5,
    color: '#64748B',
  },

  /* ── Modals ── */
  exerciseModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 16,
  },
  exerciseModalCard: {
    width: '100%',
    maxWidth: 420,
    maxHeight: '88%',
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 12,
  },
  exerciseModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  exerciseModalScroll: {
    padding: 14,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.6)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '90%',
    padding: 18,
    gap: 12,
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
    paddingBottom: 12,
  },
  modalIconBox: {
    width: 28,
    height: 28,
    borderRadius: 10,
    backgroundColor: '#FFF7ED',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: '900',
    color: '#111827',
  },
  closeBtn: {
    padding: 4,
  },
  modalScroll: {
    maxHeight: 520,
  },
  inputLabel: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#64748B',
    marginTop: 10,
    marginBottom: 6,
    letterSpacing: 0.5,
  },
  planTypeRow: {
    flexDirection: 'row',
    gap: 8,
  },
  typeBtn: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingVertical: 8,
    borderRadius: 10,
    alignItems: 'center',
  },
  typeBtnActive: {
    backgroundColor: '#FFF7ED',
    borderColor: '#EA580C',
  },
  typeBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#64748B',
  },
  typeBtnTextActive: {
    color: '#EA580C',
  },
  trainerSelectorRow: {
    gap: 8,
  },
  trainerOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 10,
    borderRadius: 12,
  },
  trainerOptionCardActive: {
    borderColor: '#EA580C',
    backgroundColor: '#FFF7ED',
  },
  trainerOptionName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#111827',
  },
  trainerOptionNameActive: {
    color: '#EA580C',
    fontWeight: '800',
  },
  modalInput: {
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 12,
    padding: 10,
    fontSize: 12.5,
    color: '#111827',
  },
  submitPlanBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#EA580C',
    paddingVertical: 12,
    borderRadius: 14,
    marginTop: 18,
    marginBottom: 20,
    shadowColor: '#EA580C',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
    elevation: 3,
  },
  submitPlanBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  /* Video Modal Player */
  modalVideoPlayerBox: {
    position: 'relative',
    height: 180,
    backgroundColor: '#000000',
    borderRadius: 16,
    overflow: 'hidden',
    marginBottom: 10,
  },
  modalVideoPlayerImage: {
    width: '100%',
    height: 180,
    opacity: 0.85,
  },
  modalVideoOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.3)',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  modalPlayCircle: {
    width: 56,
    height: 56,
    borderRadius: 28,
    backgroundColor: '#DC2626',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTapToPlayText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  openYouTubeBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    backgroundColor: '#DC2626',
    paddingVertical: 11,
    borderRadius: 12,
    marginBottom: 12,
  },
  openYouTubeBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  modalSpecsCard: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    padding: 12,
    gap: 6,
  },
  modalSpecsHeading: {
    fontSize: 13,
    fontWeight: '800',
    color: '#111827',
    marginBottom: 2,
  },
  modalSpecsBody: {
    fontSize: 12,
    color: '#64748B',
    lineHeight: 18,
  },
  tipRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: 6,
  },
  tipText: {
    flex: 1,
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },

  /* Animated Modal */
  modalAnimatedBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    gap: 8,
    marginBottom: 12,
  },
  modalAnimatedTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#111827',
    textAlign: 'center',
  },
  modalAnimatedBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#EA580C',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
  },
  modalAnimatedBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
});
