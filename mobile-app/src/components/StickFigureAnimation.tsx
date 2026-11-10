import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Animated, Easing, Text } from 'react-native';

interface StickFigureProps {
  exerciseName: string;
  category?: string;
  isDetail?: boolean;
}

export const StickFigureAnimation: React.FC<StickFigureProps> = ({
  exerciseName,
  category = 'Arms',
  isDetail = false
}) => {
  const anim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(anim, {
          toValue: 1,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
        Animated.timing(anim, {
          toValue: 0,
          duration: 1400,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [anim]);

  const name = (exerciseName || '').toLowerCase();
  const isCurl = name.includes('curl') || name.includes('bicep');
  const isRDL = name.includes('rdl') || name.includes('deadlift');
  const isPullUp = name.includes('pull-up') || name.includes('pullup') || name.includes('lat pull');
  const isSquat = name.includes('squat');
  const isBench = name.includes('bench');
  const isPushup = name.includes('push-up') || name.includes('pushup');
  const isOverhead = name.includes('overhead') || name.includes('shoulder');
  const isLunge = name.includes('lunge');
  const isPlank = name.includes('plank');
  const isTwist = name.includes('twist');

  const scale = isDetail ? 1.3 : 1.0;

  // Render specific animated stick figure based on exercise
  if (isCurl) {
    // Dumbbell Bicep Curls: Frontal stick figure curling dumbbells up and down with glowing green biceps
    const curlTranslateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -18],
    });
    const bicepScale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.35],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        {/* Head */}
        <View style={styles.head} />
        {/* Neck */}
        <View style={styles.neck} />
        {/* Torso */}
        <View style={styles.torso} />

        {/* Left Arm & Bicep */}
        <View style={[styles.upperArm, { left: 24, top: 28 }]}>
          <Animated.View style={[styles.bicepGlow, { transform: [{ scale: bicepScale }] }]} />
        </View>
        <Animated.View style={[styles.dumbbellGroup, { left: 16, top: 46, transform: [{ translateY: curlTranslateY }] }]}>
          <View style={styles.forearm} />
          <View style={styles.dumbbellWeight} />
          <View style={styles.dumbbellBar} />
          <View style={styles.dumbbellWeight} />
        </Animated.View>

        {/* Right Arm & Bicep */}
        <View style={[styles.upperArm, { right: 24, top: 28 }]}>
          <Animated.View style={[styles.bicepGlow, { transform: [{ scale: bicepScale }] }]} />
        </View>
        <Animated.View style={[styles.dumbbellGroup, { right: 16, top: 46, transform: [{ translateY: curlTranslateY }] }]}>
          <View style={styles.forearm} />
          <View style={styles.dumbbellWeight} />
          <View style={styles.dumbbellBar} />
          <View style={styles.dumbbellWeight} />
        </Animated.View>

        {/* Hips */}
        <View style={styles.hips} />

        {/* Legs */}
        <View style={[styles.leg, { left: 32 }]} />
        <View style={[styles.leg, { right: 32 }]} />
      </View>
    );
  }

  if (isRDL) {
    // Romanian Deadlift: Side profile hip hinge with green hamstring/glute highlight and red barbell moving down shins
    const hingeRotate = anim.interpolate({
      inputRange: [0, 1],
      outputRange: ['0deg', '32deg'],
    });
    const barTranslateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 22],
    });
    const chainGlowScale = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.4],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        {/* Hips / Posterior chain with glowing green */}
        <Animated.View style={[styles.rdlPosteriorGlow, { transform: [{ scale: chainGlowScale }] }]} />

        {/* Upper Body (Hinged at hips) */}
        <Animated.View
          style={[
            styles.rdlUpperBody,
            {
              transform: [{ rotate: hingeRotate }],
            },
          ]}
        >
          {/* Head */}
          <View style={[styles.head, { alignSelf: 'flex-start', marginLeft: 16 }]} />
          {/* Neck */}
          <View style={[styles.neck, { alignSelf: 'flex-start', marginLeft: 23 }]} />
          {/* Back Torso */}
          <View style={[styles.torso, { alignSelf: 'flex-start', marginLeft: 22, height: 34 }]} />
        </Animated.View>

        {/* Arms holding Barbell moving down along shins */}
        <Animated.View style={[styles.rdlBarbellGroup, { transform: [{ translateY: barTranslateY }] }]}>
          <View style={styles.rdlArmLine} />
          {/* Barbell Weight Plate (Red) */}
          <View style={styles.rdlBarbellPlate} />
        </Animated.View>

        {/* Legs (Soft knees) */}
        <View style={[styles.rdlLegThigh, { left: 42, top: 48 }]} />
        <View style={[styles.rdlLegShin, { left: 40, top: 68 }]} />
        {/* Foot floor line */}
        <View style={styles.floorLine} />
      </View>
    );
  }

  if (isPullUp) {
    // Pull-ups: Pullup bar at top, stick figure pulling up and lowering with glowing green back/lats
    const pullTranslateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -18],
    });
    const latGlow = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0.9, 1.4],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        {/* Top Pullup Bar */}
        <View style={styles.pullUpBar} />

        {/* Entire Body Pulling Up */}
        <Animated.View style={[styles.pullUpBody, { transform: [{ translateY: pullTranslateY }] }]}>
          {/* Angled Arms holding bar */}
          <View style={[styles.pullArmLeft]} />
          <View style={[styles.pullArmRight]} />

          {/* Head */}
          <View style={[styles.head, { top: 12 }]} />
          {/* Torso with glowing back highlight */}
          <Animated.View style={[styles.latGlowBox, { top: 26, transform: [{ scale: latGlow }] }]} />
          <View style={[styles.torso, { top: 26, height: 32 }]} />

          {/* Legs hanging down */}
          <View style={[styles.leg, { left: 33, top: 60, height: 36 }]} />
          <View style={[styles.leg, { right: 33, top: 60, height: 36 }]} />
        </Animated.View>
      </View>
    );
  }

  if (isSquat) {
    // Squat: Barbell across shoulders, dipping down to parallel and standing up with glowing quads
    const squatTranslateY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 16],
    });
    const quadGlow = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.35],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        <Animated.View style={{ alignItems: 'center', transform: [{ translateY: squatTranslateY }] }}>
          {/* Barbell Across Shoulders */}
          <View style={styles.squatBar} />
          {/* Head */}
          <View style={styles.head} />
          {/* Torso */}
          <View style={[styles.torso, { height: 30 }]} />
          {/* Hips */}
          <View style={styles.hips} />
          {/* Quad Glow */}
          <Animated.View style={[styles.quadGlowBox, { transform: [{ scale: quadGlow }] }]} />
        </Animated.View>
        {/* Legs */}
        <View style={[styles.leg, { left: 30, top: 56, height: 38 }]} />
        <View style={[styles.leg, { right: 30, top: 56, height: 38 }]} />
        <View style={styles.floorLine} />
      </View>
    );
  }

  if (isBench) {
    // Bench Press: Lying on bench pad, pressing barbell vertically with chest glow
    const pressY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 16],
    });
    const chestGlow = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.4],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.floorLine} />
        <View style={[styles.benchLeg, { left: 24 }]} />
        <View style={[styles.benchLeg, { left: 70 }]} />
        <View style={styles.benchPad} />

        <View style={styles.benchHead} />
        <View style={styles.benchTorso} />
        <Animated.View style={[styles.benchChestGlow, { transform: [{ scale: chestGlow }] }]} />
        <View style={styles.benchHips} />
        <View style={styles.benchLegThigh} />
        <View style={styles.benchLegShin} />

        <Animated.View style={[styles.benchBarbellGroup, { transform: [{ translateY: pressY }] }]}>
          <View style={[styles.benchArm, { left: 34 }]} />
          <View style={[styles.benchArm, { left: 54 }]} />
          <View style={styles.benchBarbellBar} />
          <View style={[styles.benchBarbellPlate, { left: 10 }]} />
          <View style={[styles.benchBarbellPlate, { right: 10 }]} />
        </Animated.View>
      </View>
    );
  }

  if (isOverhead) {
    // Overhead Press: Pressing barbell overhead with deltoid glows
    const pressY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, -18],
    });
    const deltGlow = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.35],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.head} />
        <View style={styles.neck} />
        <View style={styles.torso} />
        <Animated.View style={[styles.deltGlowLeft, { transform: [{ scale: deltGlow }] }]} />
        <Animated.View style={[styles.deltGlowRight, { transform: [{ scale: deltGlow }] }]} />

        <Animated.View style={[styles.overheadGroup, { transform: [{ translateY: pressY }] }]}>
          <View style={[styles.overheadArm, { left: 28 }]} />
          <View style={[styles.overheadArm, { right: 28 }]} />
          <View style={styles.overheadBar} />
          <View style={[styles.rdlBarbellPlate, { left: 14, top: 4 }]} />
          <View style={[styles.rdlBarbellPlate, { right: 14, top: 4 }]} />
        </Animated.View>

        <View style={styles.hips} />
        <View style={[styles.leg, { left: 32 }]} />
        <View style={[styles.leg, { right: 32 }]} />
        <View style={styles.floorLine} />
      </View>
    );
  }

  if (isPushup) {
    // Push-up: Horizontal plank lowering to floor with glowing chest
    const pushY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 14],
    });
    const chestGlow = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.4],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.floorLine} />
        <Animated.View style={{ width: 90, height: 60, transform: [{ translateY: pushY }] }}>
          <View style={styles.pushupHead} />
          <View style={styles.pushupTorso} />
          <Animated.View style={[styles.pushupChestGlow, { transform: [{ scale: chestGlow }] }]} />
          <View style={styles.pushupArmUpper} />
          <View style={styles.pushupArmForearm} />
          <View style={styles.pushupLegs} />
        </Animated.View>
      </View>
    );
  }

  if (isPlank) {
    // Plank: Solid core bridge with pulsing aura
    const corePulse = anim.interpolate({
      inputRange: [0, 0.5, 1],
      outputRange: [1, 1.3, 1],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.floorLine} />
        <View style={{ width: 90, height: 60 }}>
          <View style={styles.pushupHead} />
          <View style={styles.pushupTorso} />
          <Animated.View style={[styles.pushupChestGlow, { transform: [{ scale: corePulse }] }]} />
          <View style={styles.pushupArmForearm} />
          <View style={styles.pushupLegs} />
        </View>
      </View>
    );
  }

  if (isLunge) {
    // Lunges: Lowering split squat with glowing quads
    const lungeY = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [0, 14],
    });
    const quadGlow = anim.interpolate({
      inputRange: [0, 1],
      outputRange: [1, 1.35],
    });

    return (
      <View style={[styles.container, { transform: [{ scale }] }]}>
        <View style={styles.floorLine} />
        <Animated.View style={{ alignItems: 'center', transform: [{ translateY: lungeY }] }}>
          <View style={styles.head} />
          <View style={styles.neck} />
          <View style={styles.torso} />
          <View style={styles.hips} />
          <Animated.View style={[styles.quadGlowBox, { top: 32, transform: [{ scale: quadGlow }] }]} />
          <View style={[styles.leg, { left: 42, top: 48, transform: [{ rotate: '20deg' }] }]} />
          <View style={[styles.leg, { left: 24, top: 48, transform: [{ rotate: '-20deg' }] }]} />
        </Animated.View>
      </View>
    );
  }

  // Default Generic Biomechanical Exercise Animation (Bench/Pushup/Press/Plank/Twist/etc.)
  const defaultTranslate = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -10],
  });
  const defaultPulse = anim.interpolate({
    inputRange: [0, 1],
    outputRange: [1, 1.25],
  });

  return (
    <View style={[styles.container, { transform: [{ scale }] }]}>
      <Animated.View style={{ alignItems: 'center', transform: [{ translateY: defaultTranslate }] }}>
        <View style={styles.head} />
        <View style={styles.neck} />
        <View style={styles.torso} />
        {/* Glowing active core/muscle aura */}
        <Animated.View style={[styles.genericMuscleGlow, { transform: [{ scale: defaultPulse }] }]} />
        {/* Side arms */}
        <View style={[styles.upperArm, { left: 24, top: 26 }]} />
        <View style={[styles.upperArm, { right: 24, top: 26 }]} />
      </Animated.View>
      <View style={[styles.leg, { left: 32, top: 58 }]} />
      <View style={[styles.leg, { right: 32, top: 58 }]} />
      <View style={styles.floorLine} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 100,
    height: 104,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  head: {
    width: 18,
    height: 18,
    borderRadius: 9,
    borderWidth: 2.5,
    borderColor: '#0284C7',
    backgroundColor: '#E0F2FE',
    zIndex: 10,
  },
  neck: {
    width: 3,
    height: 5,
    backgroundColor: '#0284C7',
    zIndex: 9,
  },
  torso: {
    width: 4.5,
    height: 30,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    zIndex: 9,
  },
  hips: {
    width: 16,
    height: 3,
    backgroundColor: '#0284C7',
    borderRadius: 1.5,
    zIndex: 8,
  },
  leg: {
    position: 'absolute',
    top: 56,
    width: 4,
    height: 40,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  upperArm: {
    position: 'absolute',
    width: 3.5,
    height: 18,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  bicepGlow: {
    position: 'absolute',
    top: -2,
    left: -4,
    width: 12,
    height: 20,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    opacity: 0.85,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  forearm: {
    width: 3.5,
    height: 16,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  dumbbellGroup: {
    position: 'absolute',
    alignItems: 'center',
    zIndex: 12,
  },
  dumbbellWeight: {
    width: 14,
    height: 4.5,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  dumbbellBar: {
    width: 3.5,
    height: 6,
    backgroundColor: '#64748B',
  },
  // Romanian Deadlift Styles
  rdlPosteriorGlow: {
    position: 'absolute',
    left: 36,
    top: 40,
    width: 16,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    opacity: 0.85,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 5,
  },
  rdlUpperBody: {
    position: 'absolute',
    top: 6,
    left: 20,
    width: 50,
    height: 46,
    zIndex: 8,
  },
  rdlBarbellGroup: {
    position: 'absolute',
    left: 48,
    top: 36,
    alignItems: 'center',
    zIndex: 14,
  },
  rdlArmLine: {
    width: 3.5,
    height: 22,
    backgroundColor: '#0284C7',
    borderRadius: 1.5,
  },
  rdlBarbellPlate: {
    width: 6,
    height: 24,
    backgroundColor: '#EF4444',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#B91C1C',
  },
  rdlLegThigh: {
    position: 'absolute',
    width: 4.5,
    height: 22,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    transform: [{ rotate: '12deg' }],
  },
  rdlLegShin: {
    position: 'absolute',
    width: 4,
    height: 26,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  floorLine: {
    position: 'absolute',
    bottom: 2,
    width: 70,
    height: 2,
    backgroundColor: '#CBD5E1',
    borderRadius: 1,
  },
  // Pull-up Styles
  pullUpBar: {
    position: 'absolute',
    top: 4,
    width: 86,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    zIndex: 20,
  },
  pullUpBody: {
    alignItems: 'center',
    width: 80,
    height: 96,
  },
  pullArmLeft: {
    position: 'absolute',
    top: 4,
    left: 18,
    width: 3.5,
    height: 18,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    transform: [{ rotate: '-35deg' }],
  },
  pullArmRight: {
    position: 'absolute',
    top: 4,
    right: 18,
    width: 3.5,
    height: 18,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    transform: [{ rotate: '35deg' }],
  },
  latGlowBox: {
    position: 'absolute',
    width: 22,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#22C55E',
    opacity: 0.85,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
    zIndex: 6,
  },
  // Squat Styles
  squatBar: {
    position: 'absolute',
    top: 14,
    width: 74,
    height: 4,
    backgroundColor: '#475569',
    borderRadius: 2,
    zIndex: 15,
  },
  quadGlowBox: {
    position: 'absolute',
    top: 26,
    width: 20,
    height: 22,
    borderRadius: 8,
    backgroundColor: '#22C55E',
    opacity: 0.85,
    shadowColor: '#22C55E',
    shadowOffset: { width: 0, height: 0 },
    shadowOpacity: 0.9,
    shadowRadius: 6,
    elevation: 4,
  },
  // Bench Press
  benchLeg: {
    position: 'absolute',
    bottom: 2,
    width: 3.5,
    height: 20,
    backgroundColor: '#475569',
    borderRadius: 1,
  },
  benchPad: {
    position: 'absolute',
    bottom: 22,
    left: 16,
    width: 68,
    height: 6,
    backgroundColor: '#475569',
    borderRadius: 3,
  },
  benchHead: {
    position: 'absolute',
    bottom: 28,
    left: 14,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0284C7',
    zIndex: 10,
  },
  benchTorso: {
    position: 'absolute',
    bottom: 28,
    left: 28,
    width: 36,
    height: 4.5,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    zIndex: 9,
  },
  benchChestGlow: {
    position: 'absolute',
    bottom: 27,
    left: 36,
    width: 14,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    opacity: 0.85,
    zIndex: 11,
  },
  benchHips: {
    position: 'absolute',
    bottom: 27,
    left: 62,
    width: 8,
    height: 6,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  benchLegThigh: {
    position: 'absolute',
    bottom: 14,
    left: 68,
    width: 4,
    height: 14,
    backgroundColor: '#0284C7',
    borderRadius: 2,
    transform: [{ rotate: '-30deg' }],
  },
  benchLegShin: {
    position: 'absolute',
    bottom: 2,
    left: 76,
    width: 3.5,
    height: 14,
    backgroundColor: '#0284C7',
    borderRadius: 1.5,
  },
  benchBarbellGroup: {
    position: 'absolute',
    bottom: 30,
    left: 10,
    width: 80,
    height: 24,
    alignItems: 'center',
    zIndex: 12,
  },
  benchArm: {
    position: 'absolute',
    bottom: 0,
    width: 3,
    height: 16,
    backgroundColor: '#0284C7',
    borderRadius: 1.5,
  },
  benchBarbellBar: {
    position: 'absolute',
    top: 2,
    width: 76,
    height: 3.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 1.5,
  },
  benchBarbellPlate: {
    position: 'absolute',
    top: -5,
    width: 5,
    height: 18,
    backgroundColor: '#EF4444',
    borderRadius: 2,
    borderWidth: 1,
    borderColor: '#B91C1C',
  },

  // Overhead
  deltGlowLeft: {
    position: 'absolute',
    left: 20,
    top: 24,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    opacity: 0.85,
  },
  deltGlowRight: {
    position: 'absolute',
    right: 20,
    top: 24,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#22C55E',
    opacity: 0.85,
  },
  overheadGroup: {
    position: 'absolute',
    top: 10,
    width: 90,
    height: 28,
    alignItems: 'center',
    zIndex: 12,
  },
  overheadArm: {
    position: 'absolute',
    bottom: 0,
    width: 3.5,
    height: 18,
    backgroundColor: '#0284C7',
    borderRadius: 1.5,
  },
  overheadBar: {
    position: 'absolute',
    top: 4,
    width: 70,
    height: 3.5,
    backgroundColor: '#CBD5E1',
    borderRadius: 1.5,
  },

  // Pushup
  pushupHead: {
    position: 'absolute',
    left: 8,
    top: 24,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#E0F2FE',
    borderWidth: 2,
    borderColor: '#0284C7',
  },
  pushupTorso: {
    position: 'absolute',
    left: 22,
    top: 27,
    width: 36,
    height: 4.5,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },
  pushupChestGlow: {
    position: 'absolute',
    left: 26,
    top: 24,
    width: 14,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#22C55E',
    opacity: 0.85,
  },
  pushupArmUpper: {
    position: 'absolute',
    left: 28,
    top: 28,
    width: 3.5,
    height: 14,
    backgroundColor: '#0284C7',
    borderRadius: 1.5,
  },
  pushupArmForearm: {
    position: 'absolute',
    left: 28,
    top: 40,
    width: 3.5,
    height: 14,
    backgroundColor: '#64748B',
    borderRadius: 1.5,
  },
  pushupLegs: {
    position: 'absolute',
    left: 56,
    top: 28,
    width: 32,
    height: 4,
    backgroundColor: '#0284C7',
    borderRadius: 2,
  },

  // Generic
  genericMuscleGlow: {
    position: 'absolute',
    top: 16,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#22C55E',
    opacity: 0.8,
  },
});

export default StickFigureAnimation;

