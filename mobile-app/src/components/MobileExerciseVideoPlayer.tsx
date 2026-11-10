import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Animated,
  Easing,
  Dimensions,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';

interface MobileExerciseVideoPlayerProps {
  exerciseName: string;
  category?: string;
  targetMuscle?: string;
  difficulty?: string;
  instructions?: string;
  coachTips?: string;
  duration?: number; // In seconds, default 60 (1-minute video demo)
}

const { width: SCREEN_WIDTH } = Dimensions.get('window');

export const MobileExerciseVideoPlayer: React.FC<MobileExerciseVideoPlayerProps> = ({
  exerciseName = 'Exercise',
  category = 'Strength',
  targetMuscle = 'Full Body',
  difficulty = 'Intermediate',
  instructions,
  coachTips,
  duration = 60,
}) => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [currentPhase, setCurrentPhase] = useState<'Eccentric' | 'Pause' | 'Concentric' | 'Reset'>('Eccentric');

  // Animation drivers
  const cycleAnim = useRef(new Animated.Value(0)).current;
  const loopRef = useRef<Animated.CompositeAnimation | null>(null);
  const timerRef = useRef<any>(null);

  // Derive exercise categories
  const name = (exerciseName || '').toLowerCase();
  const muscle = (targetMuscle || category || '').toLowerCase();

  const isSquat = name.includes('squat') || name.includes('leg press') || name.includes('hack') || name.includes('calf') || muscle.includes('quad') || muscle.includes('legs');
  const isBench = name.includes('bench') || name.includes('chest press') || name.includes('fly') || name.includes('pec') || muscle.includes('chest');
  const isPushup = name.includes('push-up') || name.includes('pushup') || name.includes('press-up') || name.includes('dip');
  const isPullUp = name.includes('pull-up') || name.includes('pullup') || name.includes('pulldown') || name.includes('lat pull') || name.includes('row') || name.includes('chin-up') || muscle.includes('back') || muscle.includes('lat');
  const isDeadlift = name.includes('deadlift') || name.includes('rdl') || name.includes('swing') || name.includes('kettlebell') || name.includes('thrust') || name.includes('bridge') || name.includes('good morning') || muscle.includes('hamstring') || muscle.includes('glute');
  const isCurl = name.includes('curl') || name.includes('bicep') || name.includes('hammer') || name.includes('brachialis') || muscle.includes('bicep') || muscle.includes('arms');
  const isOverhead = name.includes('overhead') || name.includes('shoulder press') || name.includes('military') || name.includes('lateral raise') || name.includes('front raise') || name.includes('delt') || (name.includes('press') && !isBench) || muscle.includes('shoulder') || muscle.includes('delt');
  const isLunge = name.includes('lunge') || name.includes('split squat') || name.includes('step up');
  const isPlank = name.includes('plank') || name.includes('core') || name.includes('hold') || name.includes('crunch') || name.includes('sit-up') || name.includes('situp') || name.includes('ab') || name.includes('twist') || name.includes('mountain') || muscle.includes('abs') || muscle.includes('core');

  // Setup animated repetition loop
  useEffect(() => {
    if (isPlaying) {
      const singleCycleDuration = 2800 / playbackSpeed;
      const animationLoop = Animated.loop(
        Animated.sequence([
          // Phase 1: Lowering / Eccentric (0 to 1)
          Animated.timing(cycleAnim, {
            toValue: 1,
            duration: singleCycleDuration * 0.5,
            easing: Easing.inOut(Easing.quad),
            useNativeDriver: true,
          }),
          // Phase 2: Isometric Pause at peak tension (hold 1)
          Animated.delay(singleCycleDuration * 0.1),
          // Phase 3: Concentric Drive / Lifting (1 to 0)
          Animated.timing(cycleAnim, {
            toValue: 0,
            duration: singleCycleDuration * 0.4,
            easing: Easing.out(Easing.quad),
            useNativeDriver: true,
          }),
        ])
      );

      loopRef.current = animationLoop;
      animationLoop.start();

      // Track phases without saturating React rendering thread
      let lastReportedPhase = 'Eccentric';
      const listenerId = cycleAnim.addListener(({ value }) => {
        const nextPhase = value < 0.25 ? 'Reset' : (value >= 0.25 && value < 0.85 ? 'Eccentric' : 'Pause');
        if (nextPhase !== lastReportedPhase) {
          lastReportedPhase = nextPhase;
          setCurrentPhase(nextPhase as any);
        }
      });

      return () => {
        animationLoop.stop();
        cycleAnim.removeListener(listenerId);
      };
    } else {
      if (loopRef.current) {
        loopRef.current.stop();
      }
    }
  }, [isPlaying, playbackSpeed, cycleAnim]);

  // Track video playback seconds & reps
  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentSeconds(prev => {
          if (prev >= duration) {
            return 0; // Loop 1-minute video demo
          }
          const next = prev + 1;
          if (next % 3 === 0) {
            setCurrentRep(r => (r >= 15 ? 1 : r + 1));
          }
          return next;
        });
      }, 1000 / playbackSpeed);

      return () => {
        if (timerRef.current) clearInterval(timerRef.current);
      };
    }
  }, [isPlaying, playbackSpeed, duration]);

  const handleTogglePlay = () => {
    setIsPlaying(prev => !prev);
  };

  const handleRestart = () => {
    setCurrentSeconds(0);
    setCurrentRep(1);
    cycleAnim.setValue(0);
    if (!isPlaying) setIsPlaying(true);
  };

  const handleCycleSpeed = () => {
    setPlaybackSpeed(prev => (prev === 1.0 ? 1.5 : prev === 1.5 ? 2.0 : 1.0));
  };

  // Format seconds to MM:SS
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (currentSeconds / duration) * 100);

  // -------------------------------------------------------------
  // Biomechanical Animation Interpolations
  // -------------------------------------------------------------

  // Squat Interpolations
  const squatBodyY = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 36],
  });
  const squatHipsX = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -14],
  });
  const squatKneeBend = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '52deg'],
  });
  const quadGlowScale = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  // Pushup / Bench Press Interpolations
  const pushupTorsoY = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32],
  });
  const chestGlowScale = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.5],
  });

  // Pull-up / Row Interpolations
  const pullupBodyY = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [38, 0],
  });
  const latsGlowScale = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.9, 1.5],
  });

  // Deadlift / RDL Interpolations
  const rdlHingeAngle = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ['0deg', '48deg'],
  });
  const rdlBarY = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 44],
  });
  const gluteGlowScale = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  // Bicep Curl Interpolations
  const curlDumbbellY = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [24, 0],
  });
  const bicepGlowScale = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  // Overhead Press Interpolations
  const overheadBarY = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [22, 0],
  });
  const deltoidGlowScale = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.45],
  });

  // Lunge Interpolations
  const lungeDropY = cycleAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 32],
  });

  // Core / Plank Pulse
  const corePulseScale = cycleAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.35, 1],
  });

  // Render Biomechanical Athlete on Animated Stage
  const renderBiomechanicalAthlete = () => {
    // 1. Incline / Flat Bench Press & Dumbbell Press
    if (isBench) {
      const isDumbbell = name.includes('dumbbell');
      const isUpper = name.includes('incline');
      const pressY = cycleAnim.interpolate({
        inputRange: [0, 1],
        outputRange: [22, 0],
      });
      const chestPulse = cycleAnim.interpolate({
        inputRange: [0, 0.5, 1],
        outputRange: [1, 1.45, 1],
      });

      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            {/* Ground Floor Line */}
            <View style={styles.rigFloorLine} />

            {/* Bench Support Legs */}
            <View style={[styles.benchSupportLeg, { left: 34 }]} />
            <View style={[styles.benchSupportLeg, { left: 96 }]} />
            <View style={[styles.benchBaseBeam, { left: 32, width: 68 }]} />

            {/* Bench Pads */}
            {isUpper ? (
              <>
                <View style={[styles.benchMainPad, { width: 66, bottom: 42, left: 22, transform: [{ rotate: '-28deg' }] }]} />
                <View style={[styles.benchSeatPad, { left: 82, bottom: 33 }]} />
              </>
            ) : (
              <>
                <View style={[styles.benchMainPad, { width: 68, bottom: 33, left: 20 }]} />
                <View style={[styles.benchSeatPad, { left: 82, bottom: 33 }]} />
              </>
            )}

            {/* Athlete Anatomical Body on Bench */}
            {isUpper ? (
              <>
                {/* Head resting on incline pad */}
                <View style={[styles.benchAthleteHead, { bottom: 64, left: 22 }]} />
                {/* Torso aligned on incline pad */}
                <View style={[styles.benchAthleteTorso, { transform: [{ rotate: '-28deg' }], bottom: 45, left: 35, width: 44 }]} />
                {/* Pulsing Pec / Clavicular Activation Glow */}
                <Animated.View style={[styles.benchChestGlow, { bottom: 49, left: 45 }, { transform: [{ scale: chestPulse }] }]} />
                {/* Pelvis seated on pad */}
                <View style={[styles.benchAthleteHips, { bottom: 36, left: 80 }]} />
                {/* Thigh angled forward to knee */}
                <View style={[styles.benchThigh, { left: 93, bottom: 20 }]} />
                {/* Shin down to floor */}
                <View style={[styles.benchShin, { left: 105, bottom: 6 }]} />
                {/* Planted Foot */}
                <View style={[styles.benchFoot, { left: 103, bottom: 4 }]} />

                {/* Arms & Weights Moving Vertically Above Chest */}
                <Animated.View style={[styles.benchArmGroup, { left: 38, bottom: 56 }, { transform: [{ translateY: pressY }] }]}>
                  <View style={[styles.benchArmPillar, { left: 6 }]} />
                  <View style={[styles.benchArmPillar, { right: 6 }]} />

                  {isDumbbell ? (
                    <>
                      <View style={[styles.miniDumbbell, { left: 0 }]}>
                        <View style={styles.miniDumbbellPlate} />
                        <View style={styles.miniDumbbellBar} />
                        <View style={styles.miniDumbbellPlate} />
                      </View>
                      <View style={[styles.miniDumbbell, { right: 0 }]}>
                        <View style={styles.miniDumbbellPlate} />
                        <View style={styles.miniDumbbellBar} />
                        <View style={styles.miniDumbbellPlate} />
                      </View>
                    </>
                  ) : (
                    <View style={styles.miniBarbellBar}>
                      <View style={[styles.miniBarbellPlate, { left: -2 }]} />
                      <View style={[styles.miniBarbellPlate, { right: -2 }]} />
                    </View>
                  )}
                </Animated.View>
              </>
            ) : (
              <>
                {/* Flat Bench Athlete */}
                <View style={[styles.benchAthleteHead, { bottom: 39, left: 18 }]} />
                <View style={[styles.benchAthleteTorso, { bottom: 39, left: 32, width: 50 }]} />
                <Animated.View style={[styles.benchChestGlow, { bottom: 38, left: 48 }, { transform: [{ scale: chestPulse }] }]} />
                <View style={[styles.benchAthleteHips, { bottom: 36, left: 80 }]} />
                <View style={[styles.benchThigh, { left: 91, bottom: 20 }]} />
                <View style={[styles.benchShin, { left: 103, bottom: 6 }]} />
                <View style={[styles.benchFoot, { left: 101, bottom: 4 }]} />

                <Animated.View style={[styles.benchArmGroup, { left: 36, bottom: 48 }, { transform: [{ translateY: pressY }] }]}>
                  <View style={[styles.benchArmPillar, { left: 6 }]} />
                  <View style={[styles.benchArmPillar, { right: 6 }]} />
                  {isDumbbell ? (
                    <>
                      <View style={[styles.miniDumbbell, { left: 0 }]}>
                        <View style={styles.miniDumbbellPlate} />
                        <View style={styles.miniDumbbellBar} />
                        <View style={styles.miniDumbbellPlate} />
                      </View>
                      <View style={[styles.miniDumbbell, { right: 0 }]}>
                        <View style={styles.miniDumbbellPlate} />
                        <View style={styles.miniDumbbellBar} />
                        <View style={styles.miniDumbbellPlate} />
                      </View>
                    </>
                  ) : (
                    <View style={styles.miniBarbellBar}>
                      <View style={[styles.miniBarbellPlate, { left: -2 }]} />
                      <View style={[styles.miniBarbellPlate, { right: -2 }]} />
                    </View>
                  )}
                </Animated.View>
              </>
            )}
          </View>
        </View>
      );
    }

    // 2. Push-ups
    if (isPushup) {
      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            <View style={styles.rigFloorLine} />
            <View style={[styles.athleteFoot, { left: 128, bottom: 4 }]} />
            <View style={[styles.pushupHand, { left: 45, bottom: 4 }]} />

            <Animated.View style={[styles.pushupRigBox, { transform: [{ translateY: pushupTorsoY }] }]}>
              <View style={styles.pushupHead} />
              <View style={styles.pushupTorso} />
              <Animated.View style={[styles.muscleGlowChest, { transform: [{ scale: chestGlowScale }] }]} />
              <View style={styles.pushupArmUpper} />
              <View style={styles.pushupArmForearm} />
              <View style={styles.pushupLegs} />
            </Animated.View>
          </View>
        </View>
      );
    }

    // 3. Squat
    if (isSquat) {
      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            <View style={styles.rigFloorLine} />

            {/* Planted Feet on Floor */}
            <View style={[styles.athleteFoot, { left: 70, bottom: 4 }]} />
            <View style={[styles.athleteFoot, { left: 90, bottom: 4 }]} />

            {/* Descending Squat Rig */}
            <Animated.View style={[styles.squatRig, { transform: [{ translateY: squatBodyY }] }]}>
              <View style={[styles.barbellBar, { width: 110, top: 4 }]}>
                <View style={[styles.weightPlateLarge, styles.plateLeft]} />
                <View style={[styles.weightPlateSmall, styles.plateLeftInner]} />
                <View style={[styles.weightPlateSmall, styles.plateRightInner]} />
                <View style={[styles.weightPlateLarge, styles.plateRight]} />
              </View>

              <View style={[styles.athleteHead, { top: 6 }]} />
              <View style={[styles.athleteTorso, { top: 8 }]}>
                <Animated.View style={[styles.muscleGlowCore, { transform: [{ scale: quadGlowScale }] }]} />
              </View>
              <View style={[styles.athletePelvis, { top: 8 }]} />

              <Animated.View style={[styles.thighLine, { left: 72, top: 48, transform: [{ rotate: squatKneeBend }] }]} />
              <Animated.View style={[styles.thighLine, { left: 92, top: 48, transform: [{ rotate: squatKneeBend }] }]} />
              <View style={[styles.shinLine, { left: 74, top: 72 }]} />
              <View style={[styles.shinLine, { left: 91, top: 72 }]} />
            </Animated.View>
          </View>
        </View>
      );
    }

    // 4. Pull-up
    if (isPullUp) {
      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            <View style={styles.overheadPullBar} />
            <Animated.View style={[styles.pullupRig, { transform: [{ translateY: pullupBodyY }] }]}>
              <View style={styles.pullupArmLeft} />
              <View style={styles.pullupArmRight} />
              <View style={styles.athleteHead} />
              <View style={styles.athleteTorso} />
              <Animated.View style={[styles.muscleGlowLats, { transform: [{ scale: latsGlowScale }] }]} />
              <View style={styles.athletePelvis} />
              <View style={[styles.hangingLeg, { left: 74 }]} />
              <View style={[styles.hangingLeg, { right: 74 }]} />
            </Animated.View>
          </View>
        </View>
      );
    }

    // 5. Deadlift / RDL
    if (isDeadlift) {
      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            <View style={styles.rigFloorLine} />
            <View style={[styles.athleteFoot, { left: 76, bottom: 4 }]} />
            <View style={[styles.rdlShin, { left: 80, bottom: 6 }]} />
            <View style={[styles.rdlThigh, { left: 80, bottom: 28 }]} />

            <Animated.View style={[styles.muscleGlowPosterior, { bottom: 40, left: 72, transform: [{ scale: gluteGlowScale }] }]} />

            <Animated.View style={[styles.rdlSpineRig, { transform: [{ rotate: rdlHingeAngle }] }]}>
              <View style={styles.athleteHead} />
              <View style={styles.athleteTorso} />
            </Animated.View>

            <Animated.View style={[styles.rdlBarbellRig, { transform: [{ translateY: rdlBarY }] }]}>
              <View style={styles.rdlArmLine} />
              <View style={styles.rdlWeightPlate} />
            </Animated.View>
          </View>
        </View>
      );
    }

    // 6. Standing Dumbbell Bicep Curls
    if (isCurl) {
      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            {/* Ground Floor */}
            <View style={styles.rigFloorLine} />

            {/* Standing Athlete Feet & Legs */}
            <View style={[styles.athleteFoot, { left: 72, bottom: 4 }]} />
            <View style={[styles.athleteFoot, { left: 88, bottom: 4 }]} />
            <View style={[styles.athleteShin, { left: 75, bottom: 7 }]} />
            <View style={[styles.athleteShin, { left: 91, bottom: 7 }]} />
            <View style={[styles.athleteKnee, { left: 74.5, bottom: 27 }]} />
            <View style={[styles.athleteKnee, { left: 90.5, bottom: 27 }]} />
            <View style={[styles.athleteThigh, { left: 75, bottom: 31 }]} />
            <View style={[styles.athleteThigh, { left: 91, bottom: 31 }]} />

            {/* Pelvis & Torso */}
            <View style={[styles.athletePelvis, { left: 71, bottom: 51 }]} />
            <View style={[styles.athleteTorso, { left: 79, bottom: 57 }]} />

            {/* Shoulder Girdle */}
            <View style={[styles.athleteShoulders, { left: 61, bottom: 81 }]} />

            {/* Head & Neck */}
            <View style={[styles.athleteNeck, { left: 83.5, bottom: 87 }]} />
            <View style={[styles.athleteHead, { left: 77.5, bottom: 91 }]} />

            {/* Attached Upper Arms */}
            <View style={[styles.curlUpperArm, { left: 61, bottom: 60 }]} />
            <View style={[styles.curlUpperArm, { left: 105, bottom: 60 }]} />

            {/* Glowing Active Biceps */}
            <Animated.View style={[styles.muscleGlowBicep, { left: 58, bottom: 63, transform: [{ scale: bicepGlowScale }] }]} />
            <Animated.View style={[styles.muscleGlowBicep, { left: 102, bottom: 63, transform: [{ scale: bicepGlowScale }] }]} />

            {/* Forearms & Dumbbells Curling between Hips & Chest */}
            <Animated.View style={[styles.curlForearmAssembly, { transform: [{ translateY: curlDumbbellY }] }]}>
              {/* Left Forearm & Dumbbell */}
              <View style={[styles.curlForearm, { left: 61, bottom: 44 }]} />
              <View style={[styles.miniDumbbell, { left: 53, bottom: 42 }]}>
                <View style={styles.miniDumbbellPlate} />
                <View style={styles.miniDumbbellBar} />
                <View style={styles.miniDumbbellPlate} />
              </View>

              {/* Right Forearm & Dumbbell */}
              <View style={[styles.curlForearm, { left: 105, bottom: 44 }]} />
              <View style={[styles.miniDumbbell, { left: 97, bottom: 42 }]}>
                <View style={styles.miniDumbbellPlate} />
                <View style={styles.miniDumbbellBar} />
                <View style={styles.miniDumbbellPlate} />
              </View>
            </Animated.View>
          </View>
        </View>
      );
    }

    // 7. Overhead Dumbbell / Barbell Shoulder Press
    if (isOverhead) {
      const isBarbell = name.includes('barbell') || name.includes('military');

      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            {/* Ground Floor */}
            <View style={styles.rigFloorLine} />

            {/* Standing Athlete Feet & Legs */}
            <View style={[styles.athleteFoot, { left: 72, bottom: 4 }]} />
            <View style={[styles.athleteFoot, { left: 88, bottom: 4 }]} />
            <View style={[styles.athleteShin, { left: 75, bottom: 7 }]} />
            <View style={[styles.athleteShin, { left: 91, bottom: 7 }]} />
            <View style={[styles.athleteKnee, { left: 74.5, bottom: 27 }]} />
            <View style={[styles.athleteKnee, { left: 90.5, bottom: 27 }]} />
            <View style={[styles.athleteThigh, { left: 75, bottom: 31 }]} />
            <View style={[styles.athleteThigh, { left: 91, bottom: 31 }]} />

            {/* Pelvis & Torso */}
            <View style={[styles.athletePelvis, { left: 71, bottom: 51 }]} />
            <View style={[styles.athleteTorso, { left: 79, bottom: 57 }]} />

            {/* Shoulder Girdle */}
            <View style={[styles.athleteShoulders, { left: 61, bottom: 81 }]} />

            {/* Pulsing Deltoid Glows */}
            <Animated.View style={[styles.muscleGlowDelts, { left: 57, bottom: 77, transform: [{ scale: deltoidGlowScale }] }]} />
            <Animated.View style={[styles.muscleGlowDelts, { left: 101, bottom: 77, transform: [{ scale: deltoidGlowScale }] }]} />

            {/* Head & Neck */}
            <View style={[styles.athleteNeck, { left: 83.5, bottom: 87 }]} />
            <View style={[styles.athleteHead, { left: 77.5, bottom: 91 }]} />

            {/* Pressing Arms & Weights Overhead */}
            <Animated.View style={[styles.overheadPressAssembly, { transform: [{ translateY: overheadBarY }] }]}>
              {isBarbell ? (
                <>
                  <View style={[styles.overheadArmPillar, { left: 67, bottom: 76 }]} />
                  <View style={[styles.overheadArmPillar, { left: 99, bottom: 76 }]} />
                  <View style={[styles.overheadBarbellBar, { left: 36, bottom: 98 }]}>
                    <View style={[styles.miniBarbellPlate, { left: 0 }]} />
                    <View style={[styles.miniBarbellPlate, { right: 0 }]} />
                  </View>
                </>
              ) : (
                <>
                  {/* Left Arm & Dumbbell */}
                  <View style={[styles.overheadArmPillar, { left: 59, bottom: 76 }]} />
                  <View style={[styles.miniDumbbell, { left: 51, bottom: 98 }]}>
                    <View style={styles.miniDumbbellPlate} />
                    <View style={styles.miniDumbbellBar} />
                    <View style={styles.miniDumbbellPlate} />
                  </View>

                  {/* Right Arm & Dumbbell */}
                  <View style={[styles.overheadArmPillar, { left: 107, bottom: 76 }]} />
                  <View style={[styles.miniDumbbell, { left: 99, bottom: 98 }]}>
                    <View style={styles.miniDumbbellPlate} />
                    <View style={styles.miniDumbbellBar} />
                    <View style={styles.miniDumbbellPlate} />
                  </View>
                </>
              )}
            </Animated.View>
          </View>
        </View>
      );
    }

    // 8. Plank
    if (isPlank) {
      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            <View style={styles.rigFloorLine} />
            <View style={styles.plankRig}>
              <View style={styles.pushupHead} />
              <View style={styles.plankTorso} />
              <Animated.View style={[styles.plankCoreAura, { transform: [{ scale: corePulseScale }] }]} />
              <View style={styles.plankForearms} />
              <View style={styles.plankLegs} />
              <View style={[styles.athleteFoot, { left: 132, bottom: 12 }]} />
            </View>
          </View>
        </View>
      );
    }

    // 9. Lunge
    if (isLunge) {
      return (
        <View style={styles.stageCanvas}>
          <View style={styles.benchRigBox}>
            <View style={styles.rigFloorLine} />
            <View style={[styles.athleteFoot, { left: 94, bottom: 4 }]} />
            <Animated.View style={[styles.lungeRig, { transform: [{ translateY: lungeDropY }] }]}>
              <View style={styles.athleteHead} />
              <View style={styles.athleteTorso} />
              <Animated.View style={[styles.muscleGlowCore, { transform: [{ scale: quadGlowScale }] }]} />
              <View style={styles.athletePelvis} />
              <View style={styles.lungeFrontThigh} />
              <View style={styles.lungeFrontShin} />
              <View style={styles.lungeRearThigh} />
              <View style={styles.lungeRearShin} />
            </Animated.View>
          </View>
        </View>
      );
    }

    // 10. Default General Movement
    return (
      <View style={styles.stageCanvas}>
        <View style={styles.benchRigBox}>
          <View style={styles.rigFloorLine} />
          <View style={[styles.athleteFoot, { left: 72, bottom: 4 }]} />
          <View style={[styles.athleteFoot, { left: 88, bottom: 4 }]} />
          <View style={[styles.athleteShin, { left: 75, bottom: 7 }]} />
          <View style={[styles.athleteShin, { left: 91, bottom: 7 }]} />
          <View style={[styles.athleteKnee, { left: 74.5, bottom: 27 }]} />
          <View style={[styles.athleteKnee, { left: 90.5, bottom: 27 }]} />
          <View style={[styles.athleteThigh, { left: 75, bottom: 31 }]} />
          <View style={[styles.athleteThigh, { left: 91, bottom: 31 }]} />
          <View style={[styles.athletePelvis, { left: 71, bottom: 51 }]} />
          <View style={[styles.athleteTorso, { left: 79, bottom: 57 }]} />
          <Animated.View style={[styles.muscleGlowCore, { left: 75, bottom: 62, transform: [{ scale: quadGlowScale }] }]} />
          <View style={[styles.athleteShoulders, { left: 61, bottom: 81 }]} />
          <View style={[styles.athleteNeck, { left: 83.5, bottom: 87 }]} />
          <View style={[styles.athleteHead, { left: 77.5, bottom: 91 }]} />
        </View>
      </View>
    );
  };

  return (
    <View style={styles.playerContainer}>
      {/* ── 1. Video Screen Header HUD ─────────────────────── */}
      <View style={styles.videoStage}>
        {/* Top Badges */}
        <View style={styles.topHudRow}>
          <View style={styles.liveBadge}>
            <View style={[styles.pulsingDot, isPlaying && styles.pulsingDotActive]} />
            <Text style={styles.liveBadgeText}>AI ANIMATED VIDEO GUIDE</Text>
          </View>

          <View style={styles.hudRightGroup}>
            <TouchableOpacity onPress={handleCycleSpeed} style={styles.speedBadge} activeOpacity={0.7}>
              <Text style={styles.speedBadgeText}>{playbackSpeed}x SPEED</Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => setIsMuted(!isMuted)} style={styles.iconHudBtn} activeOpacity={0.7}>
              <Ionicons name={isMuted ? 'volume-mute' : 'volume-high'} size={15} color="#FFFFFF" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Rep & Phase Counter HUD */}
        <View style={styles.repCounterPill}>
          <Text style={styles.repCounterText}>REP {currentRep}</Text>
          <Text style={styles.repPhaseDivider}>|</Text>
          <Text style={styles.phaseNameText}>{currentPhase}</Text>
        </View>

        {/* Center Stage: The Live Biomechanical Simulation */}
        <View style={styles.centerStageArea}>
          {renderBiomechanicalAthlete()}
        </View>

        {/* Target Muscle Focus Pill */}
        <View style={styles.muscleFocusPill}>
          <Ionicons name="flame" size={13} color="#EA580C" />
          <Text style={styles.muscleFocusText}>
            Target: <Text style={styles.muscleFocusBold}>{targetMuscle}</Text> (94% Activation)
          </Text>
        </View>

        {/* ── 2. Scrubber Timeline & Player Controls ────────── */}
        <View style={styles.controlsBar}>
          {/* Progress Timeline Track */}
          <View style={styles.timelineTrack}>
            <View style={[styles.timelineProgress, { width: `${progressPercent}%` }]} />
          </View>

          {/* Controls Row */}
          <View style={styles.controlsRow}>
            {/* Play / Pause Button */}
            <TouchableOpacity onPress={handleTogglePlay} style={styles.playPauseBtn} activeOpacity={0.8}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={18} color="#FFFFFF" />
            </TouchableOpacity>

            {/* Restart Button */}
            <TouchableOpacity onPress={handleRestart} style={styles.controlSmallBtn} activeOpacity={0.7}>
              <Ionicons name="refresh" size={16} color="#94A3B8" />
            </TouchableOpacity>

            {/* Time Indicator */}
            <View style={styles.timeDisplay}>
              <Text style={styles.currentTimeText}>{formatTime(currentSeconds)}</Text>
              <Text style={styles.durationDivider}>/</Text>
              <Text style={styles.totalDurationText}>{formatTime(duration)}</Text>
            </View>

            {/* Difficulty Badge */}
            <View style={styles.diffPill}>
              <Text style={styles.diffPillText}>{difficulty.toUpperCase()}</Text>
            </View>
          </View>
        </View>
      </View>

      {/* ── 3. Form Technique & Coaching Form Cues ──────────── */}
      <View style={styles.cuesContainer}>
        {instructions ? (
          <View style={styles.cueBox}>
            <View style={styles.cueTitleRow}>
              <Ionicons name="checkmark-circle" size={15} color="#15803D" />
              <Text style={styles.cueTitle}>EXECUTION FORM GUIDE</Text>
            </View>
            <Text style={styles.cueBody}>{instructions}</Text>
          </View>
        ) : null}

        {coachTips ? (
          <View style={styles.tipBox}>
            <View style={styles.cueTitleRow}>
              <Ionicons name="bulb" size={15} color="#EA580C" />
              <Text style={styles.tipTitle}>COACH TECHNIQUE TIP</Text>
            </View>
            <Text style={styles.tipBody}>{coachTips}</Text>
          </View>
        ) : null}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.35,
    shadowRadius: 10,
    elevation: 8,
  },
  videoStage: {
    width: '100%',
    height: 260,
    backgroundColor: '#020617',
    position: 'relative',
    justifyContent: 'space-between',
    padding: 12,
  },
  topHudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    zIndex: 10,
  },
  liveBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.3)',
  },
  pulsingDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#EF4444',
  },
  pulsingDotActive: {
    backgroundColor: '#22C55E',
  },
  liveBadgeText: {
    color: '#F8FAFC',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  hudRightGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  speedBadge: {
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#334155',
  },
  speedBadgeText: {
    color: '#EA580C',
    fontSize: 10,
    fontWeight: '800',
  },
  iconHudBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  repCounterPill: {
    position: 'absolute',
    top: 52,
    left: 12,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(234, 88, 12, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    zIndex: 10,
  },
  repCounterText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '900',
  },
  repPhaseDivider: {
    color: 'rgba(255, 255, 255, 0.5)',
    fontSize: 11,
  },
  phaseNameText: {
    color: '#FFF7ED',
    fontSize: 10.5,
    fontWeight: '700',
  },
  centerStageArea: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stageCanvas: {
    width: '100%',
    maxWidth: 220,
    height: 125,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    overflow: 'hidden',
  },
  groundFloorLine: {
    position: 'absolute',
    bottom: 8,
    left: 10,
    right: 10,
    height: 2,
    backgroundColor: '#334155',
    borderRadius: 1,
  },
  muscleFocusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    backgroundColor: 'rgba(15, 23, 42, 0.9)',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    alignSelf: 'flex-start',
    borderWidth: 1,
    borderColor: '#1E293B',
    marginBottom: 4,
  },
  muscleFocusText: {
    color: '#94A3B8',
    fontSize: 10.5,
  },
  muscleFocusBold: {
    color: '#F8FAFC',
    fontWeight: '800',
  },
  controlsBar: {
    width: '100%',
    paddingTop: 4,
  },
  timelineTrack: {
    width: '100%',
    height: 4,
    backgroundColor: '#334155',
    borderRadius: 2,
    overflow: 'hidden',
    marginBottom: 8,
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 2,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  playPauseBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#EA580C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSmallBtn: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  timeDisplay: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginLeft: 12,
  },
  currentTimeText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '700',
  },
  durationDivider: {
    color: '#64748B',
    fontSize: 11,
  },
  totalDurationText: {
    color: '#94A3B8',
    fontSize: 11,
  },
  diffPill: {
    backgroundColor: '#1E293B',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginLeft: 'auto',
  },
  diffPillText: {
    color: '#22C55E',
    fontSize: 9.5,
    fontWeight: '800',
  },
  cuesContainer: {
    padding: 14,
    backgroundColor: '#0F172A',
    gap: 10,
  },
  cueBox: {
    backgroundColor: 'rgba(21, 128, 61, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(21, 128, 61, 0.25)',
    borderRadius: 12,
    padding: 10,
  },
  tipBox: {
    backgroundColor: 'rgba(234, 88, 12, 0.08)',
    borderWidth: 1,
    borderColor: 'rgba(234, 88, 12, 0.25)',
    borderRadius: 12,
    padding: 10,
  },
  cueTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 4,
  },
  cueTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#22C55E',
    letterSpacing: 0.5,
  },
  tipTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.5,
  },
  cueBody: {
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
  },
  tipBody: {
    fontSize: 11.5,
    color: '#CBD5E1',
    lineHeight: 16,
  },

  // -------------------------------------------------------------
  // Biomechanical Models Styles
  // -------------------------------------------------------------
  athleteHead: {
    position: 'absolute',
    width: 17,
    height: 17,
    borderRadius: 8.5,
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#38BDF8',
    zIndex: 10,
  },
  athleteNeck: {
    position: 'absolute',
    width: 5,
    height: 4,
    backgroundColor: '#94A3B8',
    borderRadius: 1,
    zIndex: 9,
  },
  athleteShoulders: {
    position: 'absolute',
    width: 50,
    height: 6,
    backgroundColor: '#38BDF8',
    borderRadius: 3,
    zIndex: 9,
  },
  athleteTorso: {
    position: 'absolute',
    width: 14,
    height: 26,
    backgroundColor: '#0284C7',
    borderRadius: 4,
    zIndex: 8,
  },
  athletePelvis: {
    position: 'absolute',
    width: 30,
    height: 6,
    backgroundColor: '#0369A1',
    borderRadius: 3,
    zIndex: 8,
  },
  athleteThigh: {
    position: 'absolute',
    width: 5,
    height: 20,
    backgroundColor: '#64748B',
    borderRadius: 2,
    zIndex: 7,
  },
  athleteKnee: {
    position: 'absolute',
    width: 6,
    height: 4,
    backgroundColor: '#94A3B8',
    borderRadius: 2,
    zIndex: 7,
  },
  athleteShin: {
    position: 'absolute',
    width: 4.5,
    height: 20,
    backgroundColor: '#64748B',
    borderRadius: 2,
    zIndex: 7,
  },
  athleteFoot: {
    position: 'absolute',
    width: 12,
    height: 3.5,
    backgroundColor: '#94A3B8',
    borderRadius: 1.5,
    zIndex: 7,
  },
  standingLeg: {
    position: 'absolute',
    top: 56,
    width: 4.5,
    height: 48,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  footBase: {
    position: 'absolute',
    bottom: 8,
    width: 16,
    height: 3,
    backgroundColor: '#94A3B8',
    borderRadius: 1.5,
  },

  // Squat Rig
  squatRig: {
    alignItems: 'center',
    position: 'relative',
    zIndex: 5,
  },
  barbellBar: {
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 1,
  },
  weightPlateLarge: {
    position: 'absolute',
    width: 6,
    height: 28,
    backgroundColor: '#DC2626',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#F87171',
  },
  weightPlateSmall: {
    position: 'absolute',
    width: 4,
    height: 20,
    backgroundColor: '#2563EB',
    borderRadius: 2,
  },
  plateLeft: { left: 4 },
  plateLeftInner: { left: 12 },
  plateRight: { right: 4 },
  plateRightInner: { right: 12 },
  thighLine: {
    position: 'absolute',
    width: 5,
    height: 24,
    backgroundColor: '#E2E8F0',
    borderRadius: 2.5,
  },
  shinLine: {
    position: 'absolute',
    width: 5,
    height: 24,
    backgroundColor: '#CBD5E1',
    borderRadius: 2.5,
  },

  // Bench Rig
  benchRigBox: {
    width: 170,
    height: 124,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  rigFloorLine: {
    position: 'absolute',
    bottom: 4,
    left: 10,
    right: 10,
    height: 2.5,
    backgroundColor: '#334155',
    borderRadius: 1.5,
  },
  benchSupportLeg: {
    position: 'absolute',
    bottom: 4,
    width: 4.5,
    height: 28,
    backgroundColor: '#334155',
    borderRadius: 1,
  },
  benchBaseBeam: {
    position: 'absolute',
    bottom: 4,
    height: 3.5,
    backgroundColor: '#475569',
    borderRadius: 1,
  },
  benchSeatPad: {
    position: 'absolute',
    width: 26,
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  benchMainPad: {
    position: 'absolute',
    height: 7,
    borderRadius: 3.5,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#475569',
  },
  benchAthleteHead: {
    position: 'absolute',
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#38BDF8',
    zIndex: 6,
  },
  benchAthleteTorso: {
    position: 'absolute',
    height: 8,
    borderRadius: 4,
    backgroundColor: '#0284C7',
    zIndex: 6,
  },
  benchChestGlow: {
    position: 'absolute',
    width: 18,
    height: 14,
    borderRadius: 7,
    backgroundColor: 'rgba(234, 88, 12, 0.75)',
    borderWidth: 1.5,
    borderColor: '#EA580C',
    zIndex: 7,
  },
  benchAthleteHips: {
    position: 'absolute',
    width: 14,
    height: 8,
    borderRadius: 3,
    backgroundColor: '#0369A1',
    zIndex: 6,
  },
  benchThigh: {
    position: 'absolute',
    width: 5,
    height: 20,
    borderRadius: 2.5,
    backgroundColor: '#64748B',
    transform: [{ rotate: '-25deg' }],
    zIndex: 5,
  },
  benchShin: {
    position: 'absolute',
    width: 4.5,
    height: 18,
    borderRadius: 2,
    backgroundColor: '#64748B',
    zIndex: 5,
  },
  benchFoot: {
    position: 'absolute',
    width: 12,
    height: 3,
    borderRadius: 1.5,
    backgroundColor: '#94A3B8',
    zIndex: 5,
  },
  benchArmGroup: {
    position: 'absolute',
    width: 44,
    height: 44,
    zIndex: 10,
  },
  benchArmPillar: {
    position: 'absolute',
    bottom: 0,
    width: 4.5,
    height: 22,
    borderRadius: 2,
    backgroundColor: '#38BDF8',
  },
  miniDumbbell: {
    position: 'absolute',
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 11,
  },
  miniDumbbellPlate: {
    width: 4,
    height: 14,
    backgroundColor: '#EA580C',
    borderRadius: 2,
  },
  miniDumbbellBar: {
    width: 10,
    height: 3.5,
    backgroundColor: '#E2E8F0',
  },
  miniBarbellBar: {
    position: 'absolute',
    top: 2,
    width: 58,
    height: 3.5,
    backgroundColor: '#E2E8F0',
    borderRadius: 1.5,
    alignItems: 'center',
    justifyContent: 'center',
  },
  miniBarbellPlate: {
    position: 'absolute',
    width: 5,
    height: 16,
    backgroundColor: '#DC2626',
    borderRadius: 2,
  },

  // Pushup Rig
  pushupRigBox: {
    width: 140,
    height: 70,
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center',
  },
  pushupHand: {
    position: 'absolute',
    width: 8,
    height: 3,
    backgroundColor: '#94A3B8',
    borderRadius: 1.5,
  },
  pushupHead: {
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E0F2FE',
    position: 'absolute',
    left: 20,
    top: 16,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  pushupTorso: {
    width: 50,
    height: 7,
    backgroundColor: '#0284C7',
    borderRadius: 3.5,
    position: 'absolute',
    left: 35,
    top: 20,
  },
  pushupLegs: {
    width: 48,
    height: 5.5,
    backgroundColor: '#64748B',
    borderRadius: 2.5,
    position: 'absolute',
    left: 84,
    top: 21,
  },
  pushupArmUpper: {
    position: 'absolute',
    left: 45,
    top: 20,
    width: 4.5,
    height: 18,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  pushupArmForearm: {
    position: 'absolute',
    left: 45,
    top: 36,
    width: 4.5,
    height: 16,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  benchPressBench: {
    position: 'absolute',
    width: 120,
    height: 8,
    backgroundColor: '#1E293B',
    borderRadius: 4,
    top: 76,
    borderWidth: 1,
    borderColor: '#334155',
  },
  benchBarbellBar: {
    width: 100,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
    position: 'absolute',
    top: 14,
    left: 10,
  },

  // Pullup
  overheadPullBar: {
    position: 'absolute',
    top: 10,
    left: 25,
    right: 25,
    height: 5,
    backgroundColor: '#94A3B8',
    borderRadius: 2.5,
  },
  pullupRig: {
    alignItems: 'center',
    position: 'relative',
    top: 14,
  },
  pullupArmLeft: {
    position: 'absolute',
    left: 56,
    top: 0,
    width: 4.5,
    height: 26,
    backgroundColor: '#38BDF8',
    transform: [{ rotate: '-22deg' }],
  },
  pullupArmRight: {
    position: 'absolute',
    right: 56,
    top: 0,
    width: 4.5,
    height: 26,
    backgroundColor: '#38BDF8',
    transform: [{ rotate: '22deg' }],
  },
  hangingLeg: {
    position: 'absolute',
    top: 54,
    width: 4.5,
    height: 44,
    backgroundColor: '#64748B',
    borderRadius: 2,
  },

  // RDL / Deadlift
  rdlSpineRig: {
    position: 'absolute',
    top: 24,
    left: 70,
  },
  rdlBarbellRig: {
    position: 'absolute',
    top: 48,
    left: 58,
    alignItems: 'center',
  },
  rdlArmLine: {
    width: 4,
    height: 38,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  rdlWeightPlate: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#F87171',
    marginTop: -4,
  },
  rdlThigh: {
    position: 'absolute',
    width: 5,
    height: 24,
    backgroundColor: '#64748B',
    borderRadius: 2,
  },
  rdlShin: {
    position: 'absolute',
    width: 5,
    height: 24,
    backgroundColor: '#64748B',
    borderRadius: 2,
  },

  // Bicep Curl
  curlUpperArm: {
    position: 'absolute',
    width: 5,
    height: 22,
    backgroundColor: '#38BDF8',
    borderRadius: 2.5,
    zIndex: 8,
  },
  curlForearmAssembly: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 9,
  },
  curlForearm: {
    position: 'absolute',
    width: 4.5,
    height: 18,
    backgroundColor: '#CBD5E1',
    borderRadius: 2,
  },
  curlDumbbellPair: {
    position: 'absolute',
    top: 32,
    width: '100%',
  },
  dumbbell: {
    position: 'absolute',
    width: 14,
    height: 8,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#38BDF8',
  },

  // Overhead Press
  overheadPressAssembly: {
    position: 'absolute',
    width: '100%',
    height: '100%',
    zIndex: 10,
  },
  overheadArmPillar: {
    position: 'absolute',
    width: 4.5,
    height: 24,
    backgroundColor: '#38BDF8',
    borderRadius: 2,
  },
  overheadBarbellBar: {
    position: 'absolute',
    width: 98,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },
  overheadBarbellRig: {
    position: 'absolute',
    top: 20,
    width: 110,
    height: 4,
    alignItems: 'center',
  },
  overheadBarLine: {
    width: 100,
    height: 4,
    backgroundColor: '#E2E8F0',
    borderRadius: 2,
  },

  // Plank
  plankRig: {
    position: 'relative',
    width: 140,
    height: 50,
    justifyContent: 'center',
  },
  plankTorso: {
    width: 50,
    height: 7,
    backgroundColor: '#0284C7',
    borderRadius: 3.5,
    position: 'absolute',
    left: 36,
    top: 20,
  },
  plankForearms: {
    width: 4.5,
    height: 18,
    backgroundColor: '#CBD5E1',
    position: 'absolute',
    left: 45,
    top: 24,
    borderRadius: 2,
  },
  plankLegs: {
    width: 50,
    height: 5.5,
    backgroundColor: '#64748B',
    borderRadius: 2.5,
    position: 'absolute',
    left: 85,
    top: 22,
  },
  plankCoreAura: {
    position: 'absolute',
    left: 48,
    top: 14,
    width: 34,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 88, 12, 0.45)',
    borderWidth: 1.5,
    borderColor: '#EA580C',
  },

  // Generic
  genericRig: {
    alignItems: 'center',
    position: 'relative',
    width: '100%',
    height: '100%',
  },

  // Lunge
  lungeRig: {
    alignItems: 'center',
    position: 'relative',
    width: 140,
    height: 110,
  },
  lungeFrontThigh: {
    position: 'absolute',
    top: 56,
    left: 70,
    width: 26,
    height: 5,
    backgroundColor: '#64748B',
    borderRadius: 2.5,
  },
  lungeFrontShin: {
    position: 'absolute',
    top: 58,
    left: 92,
    width: 5,
    height: 34,
    backgroundColor: '#64748B',
    borderRadius: 2,
  },
  lungeRearThigh: {
    position: 'absolute',
    top: 58,
    left: 48,
    width: 26,
    height: 5,
    backgroundColor: '#64748B',
    borderRadius: 2.5,
  },
  lungeRearShin: {
    position: 'absolute',
    top: 60,
    left: 46,
    width: 5,
    height: 34,
    backgroundColor: '#64748B',
    borderRadius: 2,
  },

  // Muscle Glows
  muscleGlowCore: {
    position: 'absolute',
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: 'rgba(34, 197, 94, 0.55)',
    borderWidth: 1,
    borderColor: '#22C55E',
    alignSelf: 'center',
  },
  muscleGlowLegs: {
    position: 'absolute',
    top: 60,
    left: 74,
    width: 22,
    height: 38,
    borderRadius: 11,
    backgroundColor: 'rgba(34, 197, 94, 0.4)',
    borderWidth: 1,
    borderColor: '#22C55E',
  },
  muscleGlowChest: {
    position: 'absolute',
    left: 46,
    top: 14,
    width: 22,
    height: 18,
    borderRadius: 9,
    backgroundColor: 'rgba(234, 88, 12, 0.65)',
    borderWidth: 1.5,
    borderColor: '#EA580C',
  },
  muscleGlowLats: {
    position: 'absolute',
    top: 14,
    width: 36,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(34, 197, 94, 0.6)',
    borderWidth: 1.5,
    borderColor: '#22C55E',
    alignSelf: 'center',
  },
  muscleGlowPosterior: {
    position: 'absolute',
    width: 26,
    height: 20,
    borderRadius: 10,
    backgroundColor: 'rgba(234, 88, 12, 0.6)',
    borderWidth: 1.5,
    borderColor: '#EA580C',
  },
  muscleGlowBicep: {
    position: 'absolute',
    width: 11,
    height: 16,
    borderRadius: 5.5,
    backgroundColor: 'rgba(34, 197, 94, 0.7)',
    borderWidth: 1,
    borderColor: '#22C55E',
    zIndex: 9,
  },
  muscleGlowDelts: {
    position: 'absolute',
    width: 13,
    height: 13,
    borderRadius: 6.5,
    backgroundColor: 'rgba(234, 88, 12, 0.75)',
    borderWidth: 1.5,
    borderColor: '#EA580C',
    zIndex: 9,
  },
});
