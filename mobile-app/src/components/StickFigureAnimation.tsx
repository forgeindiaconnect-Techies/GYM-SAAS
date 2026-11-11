import React, { useEffect, useState, useRef } from 'react';
import { View, StyleSheet, Text, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';

export interface StickFigureProps {
  exerciseName: string;
  category?: string;
  targetMuscle?: string;
  isDetail?: boolean;
  showInteractiveControls?: boolean;
  isPlaying?: boolean;
  speed?: number;
  viewAngle?: 'front' | 'side';
  highlightMuscles?: boolean;
  showFormGuides?: boolean;
  width?: number;
  height?: number;
  onFrameStats?: (stats: { rep: number; phase: string; elapsedSec: number }) => void;
}

// -----------------------------------------------------------------------------
// Shared Lightweight Animation Ticker (1 RAF loop drives all visible cards ~30fps)
// -----------------------------------------------------------------------------
type ClockListener = (nowMs: number) => void;
const clockListeners = new Set<ClockListener>();
let rafId: number | null = null;
let lastEmitMs = 0;

const startSharedClock = () => {
  if (rafId !== null) return;
  const tick = (nowMs: number) => {
    if (clockListeners.size === 0) {
      rafId = null;
      return;
    }
    if (nowMs - lastEmitMs >= 32) {
      lastEmitMs = nowMs;
      clockListeners.forEach(cb => cb(nowMs));
    }
    rafId = requestAnimationFrame(tick);
  };
  rafId = requestAnimationFrame(tick);
};

const subscribeClock = (cb: ClockListener): (() => void) => {
  clockListeners.add(cb);
  startSharedClock();
  return () => {
    clockListeners.delete(cb);
  };
};

// Web canvas virtual coordinate system (600 x 340, floorY = 298)
const VIRTUAL_W = 600;
const CENTER_X = 300;
const FLOOR_Y = 298;

const HIGHLIGHT_COLOR = '#15803D';
const JOINT_COLOR = '#38BDF8';
const MANNEQUIN_COLOR = '#E2E8F0';
const MANNEQUIN_BORDER = 'rgba(6, 182, 212, 0.45)';

interface DrawContext {
  scale: number;
  offsetX: number;
  offsetY: number;
  highlightMuscles: boolean;
  elements: React.ReactNode[];
  keySeq: number;
}

const nextKey = (dc: DrawContext, prefix: string) => `${prefix}-${dc.keySeq++}`;

const drawLimb = (
  dc: DrawContext,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  limbWidth: number,
  isTarget = false,
  opacity = 1.0
) => {
  const { scale, offsetX, offsetY, highlightMuscles } = dc;
  const sx1 = offsetX + x1 * scale;
  const sy1 = offsetY + y1 * scale;
  const sx2 = offsetX + x2 * scale;
  const sy2 = offsetY + y2 * scale;
  const w = Math.max(2, limbWidth * scale);
  const dx = sx2 - sx1;
  const dy = sy2 - sy1;
  const dist = Math.hypot(dx, dy);
  const mx = (sx1 + sx2) / 2;
  const my = (sy1 + sy2) / 2;
  const deg = (Math.atan2(dy, dx) * 180) / Math.PI;
  const active = isTarget && highlightMuscles;

  if (active) {
    // Soft green halo mimicking canvas shadowBlur = 18
    const haloPad = 4 * scale + 2;
    dc.elements.push(
      <View
        key={nextKey(dc, 'halo')}
        pointerEvents="none"
        style={{
          position: 'absolute',
          left: mx - (dist + w + haloPad) / 2,
          top: my - (w + haloPad) / 2,
          width: dist + w + haloPad,
          height: w + haloPad,
          borderRadius: (w + haloPad) / 2,
          backgroundColor: 'rgba(21, 128, 61, 0.25)',
          opacity,
          transform: [{ rotate: `${deg}deg` }],
        }}
      />
    );
  }

  dc.elements.push(
    <View
      key={nextKey(dc, 'limb')}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: mx - (dist + w) / 2,
        top: my - w / 2,
        width: dist + w,
        height: w,
        borderRadius: w / 2,
        backgroundColor: active ? HIGHLIGHT_COLOR : MANNEQUIN_COLOR,
        borderWidth: active ? 0 : 0.8,
        borderColor: MANNEQUIN_BORDER,
        opacity,
        transform: [{ rotate: `${deg}deg` }],
      }}
    />
  );

  // Joint pin dot at (x2, y2) matching Web ExerciseAnimationEngine
  const jr = Math.max(1.8, w * 0.42);
  dc.elements.push(
    <View
      key={nextKey(dc, 'jnt')}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: sx2 - jr,
        top: sy2 - jr,
        width: jr * 2,
        height: jr * 2,
        borderRadius: jr,
        backgroundColor: JOINT_COLOR,
        opacity,
      }}
    />
  );
};

const drawHead = (
  dc: DrawContext,
  hx: number,
  hy: number,
  radius = 15,
  facingRight = false
) => {
  const { scale, offsetX, offsetY } = dc;
  const sx = offsetX + hx * scale;
  const sy = offsetY + hy * scale;
  const r = Math.max(4, radius * scale);

  dc.elements.push(
    <View
      key={nextKey(dc, 'head')}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: sx - r,
        top: sy - r,
        width: r * 2,
        height: r * 2,
        borderRadius: r,
        backgroundColor: MANNEQUIN_COLOR,
        borderWidth: 1.2,
        borderColor: 'rgba(6, 182, 212, 0.65)',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      {/* Cyan visor arc indicator */}
      <View
        style={{
          width: r * 0.9,
          height: r * 0.9,
          borderRadius: r * 0.45,
          borderRightWidth: facingRight ? 2 : 0,
          borderTopWidth: facingRight ? 0 : 2,
          borderBottomWidth: facingRight ? 0 : 1.5,
          borderColor: JOINT_COLOR,
          opacity: 0.9,
          transform: [{ translateX: facingRight ? r * 0.25 : 0 }],
        }}
      />
    </View>
  );
};

const drawDumbbell = (dc: DrawContext, cx: number, cy: number, rotRad = 0) => {
  const { scale, offsetX, offsetY } = dc;
  const sx = offsetX + cx * scale;
  const sy = offsetY + cy * scale;
  const boxW = 36 * scale;
  const boxH = 22 * scale;
  const plateW = Math.max(2.5, 5 * scale);
  const plateH = Math.max(7, 20 * scale);
  const deg = (rotRad * 180) / Math.PI;

  dc.elements.push(
    <View
      key={nextKey(dc, 'db')}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: sx - boxW / 2,
        top: sy - boxH / 2,
        width: boxW,
        height: boxH,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        transform: [{ rotate: `${deg}deg` }],
      }}
    >
      <View
        style={{
          width: plateW,
          height: plateH,
          backgroundColor: '#FFFFFF',
          borderWidth: 1.2,
          borderColor: '#06B6D4',
          borderRadius: 1.5,
        }}
      />
      <View
        style={{
          flex: 1,
          height: Math.max(2, 3.5 * scale),
          backgroundColor: '#CBD5E1',
        }}
      />
      <View
        style={{
          width: plateW,
          height: plateH,
          backgroundColor: '#FFFFFF',
          borderWidth: 1.2,
          borderColor: '#06B6D4',
          borderRadius: 1.5,
        }}
      />
    </View>
  );
};

const drawBarbell = (dc: DrawContext, bx: number, by: number, widthPx = 210) => {
  const { scale, offsetX, offsetY } = dc;
  const sx = offsetX + bx * scale;
  const sy = offsetY + by * scale;
  const totalW = widthPx * scale;
  const plateW = Math.max(4, 10 * scale);
  const plateH = Math.max(16, 48 * scale);

  dc.elements.push(
    <View
      key={nextKey(dc, 'bar')}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: sx - totalW / 2,
        top: sy - plateH / 2,
        width: totalW,
        height: plateH,
        justifyContent: 'center',
      }}
    >
      {/* Shaft */}
      <View
        style={{
          width: totalW,
          height: Math.max(2.5, 5 * scale),
          backgroundColor: '#CBD5E1',
          borderRadius: 2,
        }}
      />
      {/* Left Plate */}
      <View
        style={{
          position: 'absolute',
          left: Math.max(2, 7 * scale),
          top: 0,
          width: plateW,
          height: plateH,
          backgroundColor: '#B91C1C',
          borderWidth: 1.2,
          borderColor: '#FCA5A5',
          borderRadius: 2,
        }}
      />
      {/* Right Plate */}
      <View
        style={{
          position: 'absolute',
          right: Math.max(2, 7 * scale),
          top: 0,
          width: plateW,
          height: plateH,
          backgroundColor: '#B91C1C',
          borderWidth: 1.2,
          borderColor: '#FCA5A5',
          borderRadius: 2,
        }}
      />
    </View>
  );
};

export const StickFigureAnimation: React.FC<StickFigureProps> = ({
  exerciseName = '',
  category = '',
  targetMuscle = '',
  isDetail = false,
  showInteractiveControls = false,
  isPlaying: externalPlaying,
  speed: externalSpeed,
  viewAngle: externalViewAngle,
  highlightMuscles: externalHighlight,
  showFormGuides: externalGuides,
  width,
  height,
  onFrameStats,
}) => {
  const exLower = `${exerciseName} ${category} ${targetMuscle}`.toLowerCase();
  const nameOnly = (exerciseName || '').toLowerCase();

  const isSquat =
    nameOnly.includes('squat') ||
    nameOnly.includes('leg press') ||
    nameOnly.includes('hack') ||
    (!nameOnly && exLower.includes('quad'));
  const isPushUp = nameOnly.includes('push-up') || nameOnly.includes('pushup') || nameOnly.includes('press-up');
  const isBenchPress =
    nameOnly.includes('bench press') || nameOnly.includes('chest press') || nameOnly.includes('bench') || nameOnly.includes('fly');
  const isPullUp =
    nameOnly.includes('pull-up') ||
    nameOnly.includes('pullup') ||
    nameOnly.includes('chin-up') ||
    nameOnly.includes('pulldown') ||
    nameOnly.includes('lat pull') ||
    nameOnly.includes('row');
  const isDeadlift =
    nameOnly.includes('deadlift') ||
    nameOnly.includes('rdl') ||
    nameOnly.includes('good morning') ||
    nameOnly.includes('kettlebell') ||
    nameOnly.includes('swing') ||
    nameOnly.includes('hip thrust') ||
    nameOnly.includes('bridge');
  const isCurl = nameOnly.includes('curl') || nameOnly.includes('bicep') || nameOnly.includes('hammer');
  const isPlank = nameOnly.includes('plank') || nameOnly.includes('hold');
  const isOverheadPress =
    (nameOnly.includes('press') && (nameOnly.includes('overhead') || nameOnly.includes('shoulder') || nameOnly.includes('military'))) ||
    nameOnly.includes('lateral raise') ||
    nameOnly.includes('front raise') ||
    nameOnly.includes('shoulder');
  const isLunge = nameOnly.includes('lunge') || nameOnly.includes('split squat') || nameOnly.includes('step up');
  const isTwist = nameOnly.includes('twist');

  const defaultAngle: 'front' | 'side' =
    isSquat || isDeadlift || isPushUp || isBenchPress || isPlank || isLunge ? 'side' : 'front';

  const [localPlaying, setLocalPlaying] = useState(true);
  const [localSpeed, setLocalSpeed] = useState(1.0);
  const [localAngle, setLocalAngle] = useState<'front' | 'side'>(defaultAngle);
  const [localGlow, setLocalGlow] = useState(true);
  const [localGuides, setLocalGuides] = useState(true);

  useEffect(() => {
    setLocalAngle(defaultAngle);
  }, [defaultAngle]);

  const isPlaying = externalPlaying !== undefined ? externalPlaying : localPlaying;
  const speed = externalSpeed !== undefined ? externalSpeed : localSpeed;
  const viewAngle = externalViewAngle !== undefined ? externalViewAngle : localAngle;
  const highlightMuscles = externalHighlight !== undefined ? externalHighlight : localGlow;
  const showFormGuides = externalGuides !== undefined ? externalGuides : localGuides;

  const startMsRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const pausedTotalRef = useRef<number>(0);
  const [elapsedSec, setElapsedSec] = useState(0);
  const lastReportedSecRef = useRef(-1);

  useEffect(() => {
    if (!isPlaying) {
      if (pausedAtRef.current === null) pausedAtRef.current = Date.now();
    } else if (pausedAtRef.current !== null) {
      pausedTotalRef.current += Date.now() - pausedAtRef.current;
      pausedAtRef.current = null;
    }
  }, [isPlaying]);

  useEffect(() => {
    if (!isPlaying) return;
    return subscribeClock(() => {
      const now = Date.now();
      const gap = pausedAtRef.current !== null ? now - pausedAtRef.current : 0;
      const secs = Math.max(0, ((now - startMsRef.current - pausedTotalRef.current - gap) / 1000) * speed);
      setElapsedSec(secs);
    });
  }, [isPlaying, speed]);

  // Compute cycle kinematics identical to Web ExerciseAnimationEngine.tsx
  const repCycleDuration = 3.6;
  const cycleProgress = (elapsedSec % repCycleDuration) / repCycleDuration;
  const t = 0.5 - 0.5 * Math.cos(cycleProgress * 2 * Math.PI);
  const currentRep = Math.floor(elapsedSec / repCycleDuration) + 1;

  let phaseLabel = 'Setup';
  if (cycleProgress < 0.45) {
    phaseLabel = isSquat || isPushUp || isDeadlift || isLunge ? 'Eccentric (Lowering)' : 'Concentric (Lifting)';
  } else if (cycleProgress <= 0.55) {
    phaseLabel = 'Peak Contraction';
  } else {
    phaseLabel = isSquat || isPushUp || isDeadlift || isLunge ? 'Concentric (Drive Up)' : 'Eccentric (Controlled)';
  }

  useEffect(() => {
    if (!onFrameStats) return;
    const secFloor = Math.floor(elapsedSec % 60);
    if (secFloor !== lastReportedSecRef.current) {
      lastReportedSecRef.current = secFloor;
      onFrameStats({ rep: currentRep, phase: phaseLabel, elapsedSec: secFloor });
    }
  }, [elapsedSec, currentRep, phaseLabel, onFrameStats]);

  // Dimensions & uniform scaling
  const stageW = width || (isDetail ? 300 : 250);
  const stageH = height || (isDetail ? 165 : 142);
  const scale = isDetail ? Math.min(stageW / 320, stageH / 315) : Math.min(stageW / 320, stageH / 310);
  const offsetX = stageW / 2 - CENTER_X * scale;
  const offsetY = (stageH - 340 * scale) / 2;

  const dc: DrawContext = {
    scale,
    offsetX,
    offsetY,
    highlightMuscles,
    elements: [],
    keySeq: 0,
  };

  // Floor line
  const floorScreenY = offsetY + FLOOR_Y * scale;
  dc.elements.push(
    <View
      key={nextKey(dc, 'floor')}
      pointerEvents="none"
      style={{
        position: 'absolute',
        left: stageW * 0.14,
        right: stageW * 0.14,
        top: floorScreenY,
        height: 1.5,
        backgroundColor: 'rgba(22, 74, 74, 0.35)',
        borderRadius: 1,
      }}
    />
  );

  // 1. DUMBBELL BICEP CURLS
  if (isCurl) {
    const shoulderY = FLOOR_Y - 175;
    const hipY = FLOOR_Y - 105;

    if (viewAngle === 'side') {
      const torsoX = CENTER_X - 10;
      drawHead(dc, torsoX, shoulderY - 26, 15, true);
      drawLimb(dc, torsoX, shoulderY - 10, torsoX, shoulderY, 8, false);
      drawLimb(dc, torsoX, shoulderY, torsoX, hipY, 14, false);

      // Legs
      drawLimb(dc, torsoX - 10, hipY, torsoX - 8, FLOOR_Y - 50, 10, false, 0.5);
      drawLimb(dc, torsoX - 8, FLOOR_Y - 50, torsoX - 10, FLOOR_Y, 9, false, 0.5);
      drawLimb(dc, torsoX, hipY, torsoX + 2, FLOOR_Y - 50, 11, false);
      drawLimb(dc, torsoX + 2, FLOOR_Y - 50, torsoX, FLOOR_Y, 10, false);

      // Arms & curl arc
      const elbowX = torsoX + 2;
      const elbowY = shoulderY + 52;
      const forearmLen = 44;
      const curlAngleRad = Math.PI / 2 - t * 2.5;
      const handX = elbowX + Math.cos(curlAngleRad) * forearmLen;
      const handY = elbowY + Math.sin(curlAngleRad) * forearmLen;

      drawLimb(dc, torsoX - 10, shoulderY, elbowX - 10, elbowY, 10, true, 0.5);
      drawLimb(dc, elbowX - 10, elbowY, handX - 10, handY, 7, false, 0.5);
      drawDumbbell(dc, handX - 10, handY, t * 0.4);

      drawLimb(dc, torsoX, shoulderY, elbowX, elbowY, 11, true);
      drawLimb(dc, elbowX, elbowY, handX, handY, 8, false);
      drawDumbbell(dc, handX, handY, t * 0.4);

      if (showFormGuides && isDetail) {
        dc.elements.push(
          <Text
            key={nextKey(dc, 'guide')}
            style={{
              position: 'absolute',
              left: offsetX + (elbowX + 12) * scale,
              top: offsetY + (elbowY - 6) * scale,
              fontSize: 9,
              fontWeight: '700',
              color: '#0284C7',
            }}
          >
            Elbows Pinned
          </Text>
        );
      }
    } else {
      const shoulderSpan = 24;
      const sL = CENTER_X - shoulderSpan;
      const sR = CENTER_X + shoulderSpan;
      const hL = CENTER_X - 14;
      const hR = CENTER_X + 14;

      drawHead(dc, CENTER_X, shoulderY - 26, 15, false);
      drawLimb(dc, CENTER_X, shoulderY - 10, CENTER_X, shoulderY, 8, false);
      drawLimb(dc, sL, shoulderY, sR, shoulderY, 12, false);
      drawLimb(dc, CENTER_X, shoulderY, CENTER_X, hipY, 14, false);
      drawLimb(dc, hL, hipY, hR, hipY, 12, false);

      const kneeY = FLOOR_Y - 50;
      drawLimb(dc, hL, hipY, CENTER_X - 20, kneeY, 11, false);
      drawLimb(dc, CENTER_X - 20, kneeY, CENTER_X - 18, FLOOR_Y, 10, false);
      drawLimb(dc, hR, hipY, CENTER_X + 20, kneeY, 11, false);
      drawLimb(dc, CENTER_X + 20, kneeY, CENTER_X + 18, FLOOR_Y, 10, false);

      const elbowY = shoulderY + 52;
      drawLimb(dc, sL, shoulderY, sL, elbowY, 11, true);
      drawLimb(dc, sR, shoulderY, sR, elbowY, 11, true);

      const forearmLen = 42;
      const curlAngle = t * Math.PI * 0.85;
      const handY_L = elbowY + Math.cos(curlAngle) * forearmLen;
      const handX_L = sL - Math.sin(curlAngle) * 5;
      const handY_R = elbowY + Math.cos(curlAngle) * forearmLen;
      const handX_R = sR + Math.sin(curlAngle) * 5;

      drawLimb(dc, sL, elbowY, handX_L, handY_L, 8, false);
      drawLimb(dc, sR, elbowY, handX_R, handY_R, 8, false);
      drawDumbbell(dc, handX_L, handY_L, 0);
      drawDumbbell(dc, handX_R, handY_R, 0);
    }

  // 2. SQUATS
  } else if (isSquat) {
    if (viewAngle === 'side') {
      const squatDepth = t * 60;
      const hipPushBack = t * 32;
      const kneeForward = t * 24;
      const torsoAngle = t * 0.35;

      const hipY = FLOOR_Y - 110 + squatDepth;
      const hipX = CENTER_X - hipPushBack;
      const kneeX = CENTER_X + kneeForward - 10;
      const kneeY = FLOOR_Y - 55 + squatDepth * 0.25;
      const ankleX = CENTER_X - 10;
      const torsoLen = 70;
      const shoulderX = hipX + Math.sin(torsoAngle) * torsoLen;
      const shoulderY = hipY - Math.cos(torsoAngle) * torsoLen;

      drawHead(dc, shoulderX + 6, shoulderY - 24, 15, true);
      drawLimb(dc, shoulderX, shoulderY, hipX, hipY, 14, false);

      drawLimb(dc, hipX - 12, hipY, kneeX - 12, kneeY, 12, true, 0.5);
      drawLimb(dc, kneeX - 12, kneeY, ankleX - 12, FLOOR_Y, 9, false, 0.5);

      drawLimb(dc, hipX, hipY, kneeX, kneeY, 13, true);
      drawLimb(dc, kneeX, kneeY, ankleX, FLOOR_Y, 10, false);

      drawBarbell(dc, shoulderX, shoulderY + 2, 80);

      drawLimb(dc, shoulderX - 10, shoulderY, shoulderX - 22, shoulderY + 22, 7, false, 0.5);
      drawLimb(dc, shoulderX - 22, shoulderY + 22, shoulderX - 10, shoulderY + 2, 6, false, 0.5);
      drawLimb(dc, shoulderX, shoulderY, shoulderX - 12, shoulderY + 22, 8, false);
      drawLimb(dc, shoulderX - 12, shoulderY + 22, shoulderX, shoulderY + 2, 7, false);

      if (showFormGuides && isDetail) {
        dc.elements.push(
          <View
            key={nextKey(dc, 'sqg')}
            style={{
              position: 'absolute',
              left: offsetX + (hipX - 35) * scale,
              top: offsetY + kneeY * scale,
              width: (kneeX - hipX + 65) * scale,
              height: 1,
              borderStyle: 'dashed',
              borderWidth: 0.8,
              borderColor: 'rgba(16, 185, 129, 0.65)',
            }}
          />
        );
      }
    } else {
      const squatDepth = t * 56;
      const hipY = FLOOR_Y - 105 + squatDepth;
      const shoulderY = FLOOR_Y - 175 + squatDepth;

      drawHead(dc, CENTER_X, shoulderY - 26, 15, false);
      drawLimb(dc, CENTER_X, shoulderY, CENTER_X, hipY, 14, false);

      const kneeSpread = 28 + t * 14;
      const kneeY = FLOOR_Y - 50 + squatDepth * 0.3;

      drawLimb(dc, CENTER_X - 10, hipY, CENTER_X - kneeSpread, kneeY, 13, true);
      drawLimb(dc, CENTER_X + 10, hipY, CENTER_X + kneeSpread, kneeY, 13, true);
      drawLimb(dc, CENTER_X - kneeSpread, kneeY, CENTER_X - 32, FLOOR_Y, 10, false);
      drawLimb(dc, CENTER_X + kneeSpread, kneeY, CENTER_X + 32, FLOOR_Y, 10, false);

      drawBarbell(dc, CENTER_X, shoulderY + 4, 210);

      drawLimb(dc, CENTER_X - 24, shoulderY, CENTER_X - 55, shoulderY + 18, 9, false);
      drawLimb(dc, CENTER_X - 55, shoulderY + 18, CENTER_X - 55, shoulderY + 4, 8, false);
      drawLimb(dc, CENTER_X + 24, shoulderY, CENTER_X + 55, shoulderY + 18, 9, false);
      drawLimb(dc, CENTER_X + 55, shoulderY + 18, CENTER_X + 55, shoulderY + 4, 8, false);
    }

  // 3. BARBELL ROMANIAN DEADLIFT (RDL)
  } else if (isDeadlift) {
    const hingeAngle = t * 1.15;
    const hipX = CENTER_X - t * 36;
    const hipY = FLOOR_Y - 110 + t * 12;
    const torsoLen = 72;
    const shoulderX = hipX + Math.sin(hingeAngle + 0.2) * torsoLen;
    const shoulderY = hipY - Math.cos(hingeAngle + 0.2) * torsoLen;

    drawHead(dc, shoulderX + 10, shoulderY - 20, 15, true);
    drawLimb(dc, shoulderX, shoulderY, hipX, hipY, 14, false);

    const kneeX = CENTER_X - 10;
    const kneeY = FLOOR_Y - 54;
    const footX = CENTER_X - 12;

    drawLimb(dc, hipX - 14, hipY, kneeX - 14, kneeY, 12, true, 0.5);
    drawLimb(dc, kneeX - 14, kneeY, footX - 14, FLOOR_Y, 9, false, 0.5);
    drawLimb(dc, hipX, hipY, kneeX, kneeY, 13, true);
    drawLimb(dc, kneeX, kneeY, footX, FLOOR_Y, 10, false);

    const barX = shoulderX;
    const barY = shoulderY + 68;
    drawLimb(dc, shoulderX - 12, shoulderY, barX - 12, barY, 7, false, 0.5);
    drawLimb(dc, shoulderX + 6, shoulderY, barX + 6, barY, 8, false);
    drawBarbell(dc, barX, barY, 80);

    if (showFormGuides && isDetail) {
      dc.elements.push(
        <Text
          key={nextKey(dc, 'rdlg')}
          style={{
            position: 'absolute',
            left: Math.max(8, offsetX + (hipX - 75) * scale),
            top: offsetY + (hipY - 8) * scale,
            fontSize: 9,
            fontWeight: '700',
            color: '#0284C7',
          }}
        >
          ← Hips Back
        </Text>
      );
    }

  // 4. PUSH-UPS & BENCH PRESS
  } else if (isPushUp || isBenchPress) {
    const baseFloor = isBenchPress ? FLOOR_Y - 40 : FLOOR_Y;

    if (isBenchPress) {
      // Bench Pad & Supports
      dc.elements.push(
        <View
          key={nextKey(dc, 'bench')}
          style={{
            position: 'absolute',
            left: offsetX + (CENTER_X - 105) * scale,
            top: offsetY + (baseFloor + 12) * scale,
            width: 210 * scale,
            height: 14 * scale,
            backgroundColor: '#1E293B',
            borderRadius: 4,
          }}
        />,
        <View
          key={nextKey(dc, 'bl1')}
          style={{
            position: 'absolute',
            left: offsetX + (CENTER_X - 85) * scale,
            top: offsetY + (baseFloor + 26) * scale,
            width: 14 * scale,
            height: 16 * scale,
            backgroundColor: '#475569',
          }}
        />,
        <View
          key={nextKey(dc, 'bl2')}
          style={{
            position: 'absolute',
            left: offsetX + (CENTER_X + 70) * scale,
            top: offsetY + (baseFloor + 26) * scale,
            width: 14 * scale,
            height: 16 * scale,
            backgroundColor: '#475569',
          }}
        />
      );
    }

    const pressDepth = t * 44;
    const chestY = baseFloor - 24;
    const barY = baseFloor - 78 + pressDepth;

    drawHead(dc, CENTER_X - 75, chestY - 10, 14, true);
    drawLimb(dc, CENTER_X - 60, chestY, CENTER_X + 38, chestY, 14, true);
    drawLimb(dc, CENTER_X + 38, chestY - 7, CENTER_X + 105, baseFloor - 7, 9, false, 0.5);
    drawLimb(dc, CENTER_X + 38, chestY + 4, CENTER_X + 105, baseFloor + 4, 10, false);

    const elbowX = CENTER_X - 18;
    const elbowY = isBenchPress ? barY + 28 : baseFloor - 10 + pressDepth * 0.6;
    const handX = CENTER_X - 18;
    const handY = isBenchPress ? barY : baseFloor;

    drawLimb(dc, CENTER_X - 48, chestY, elbowX - 10, elbowY - 6, 8, true, 0.5);
    drawLimb(dc, elbowX - 10, elbowY - 6, handX - 10, handY - 6, 7, false, 0.5);
    drawLimb(dc, CENTER_X - 28, chestY, elbowX + 10, elbowY + 6, 9, true);
    drawLimb(dc, elbowX + 10, elbowY + 6, handX + 10, handY + 6, 8, false);

    if (isBenchPress) {
      drawBarbell(dc, handX, barY, 200);
    }

  // 5. PULL-UPS
  } else if (isPullUp) {
    const barY = 38;
    const barX = CENTER_X;

    dc.elements.push(
      <View
        key={nextKey(dc, 'pubar')}
        style={{
          position: 'absolute',
          left: offsetX + (barX - 110) * scale,
          top: offsetY + (barY - 3.5) * scale,
          width: 220 * scale,
          height: Math.max(3, 7 * scale),
          backgroundColor: '#64748B',
          borderRadius: 4,
        }}
      />
    );

    const pullHeight = t * 62;
    const headY = barY + 72 - pullHeight;
    const shoulderY = headY + 28;
    const hipY = shoulderY + 62;
    const kneeY = hipY + 48;

    drawHead(dc, barX, headY, 15, false);
    drawLimb(dc, barX, shoulderY, barX, hipY, 15, true);

    drawLimb(dc, barX - 8, hipY, barX - 14, kneeY, 10, false);
    drawLimb(dc, barX - 14, kneeY, barX - 18, kneeY + 38, 9, false);
    drawLimb(dc, barX + 8, hipY, barX + 14, kneeY, 10, false);
    drawLimb(dc, barX + 14, kneeY, barX + 18, kneeY + 38, 9, false);

    const handX_L = barX - 48;
    const handX_R = barX + 48;
    const elbowY = barY + 32 + (1 - t) * 34;
    const elbowX_L = barX - 58 - t * 10;
    const elbowX_R = barX + 58 + t * 10;

    drawLimb(dc, barX - 14, shoulderY, elbowX_L, elbowY, 10, true);
    drawLimb(dc, barX + 14, shoulderY, elbowX_R, elbowY, 10, true);
    drawLimb(dc, elbowX_L, elbowY, handX_L, barY, 8, false);
    drawLimb(dc, elbowX_R, elbowY, handX_R, barY, 8, false);

  // 6. FOREARM PLANK
  } else if (isPlank) {
    const plankY = FLOOR_Y - 32;
    const pulse = Math.sin(elapsedSec * 6) * 2;

    drawHead(dc, CENTER_X - 90, plankY - 14 + pulse, 14, true);
    drawLimb(dc, CENTER_X - 76, plankY + pulse, CENTER_X + 38, plankY + pulse, 15, true);
    drawLimb(dc, CENTER_X + 38, plankY + pulse - 6, CENTER_X + 105, FLOOR_Y - 6, 9, false, 0.5);
    drawLimb(dc, CENTER_X + 38, plankY + pulse + 3, CENTER_X + 105, FLOOR_Y + 3, 11, false);

    drawLimb(dc, CENTER_X - 66, plankY + pulse, CENTER_X - 66, FLOOR_Y, 8, false, 0.5);
    drawLimb(dc, CENTER_X - 66, FLOOR_Y, CENTER_X - 38, FLOOR_Y, 7, false, 0.5);
    drawLimb(dc, CENTER_X - 46, plankY + pulse, CENTER_X - 46, FLOOR_Y, 9, false);
    drawLimb(dc, CENTER_X - 46, FLOOR_Y, CENTER_X - 18, FLOOR_Y, 8, false);

    if (highlightMuscles) {
      const ringR = (22 + pulse * 2) * scale;
      dc.elements.push(
        <View
          key={nextKey(dc, 'core')}
          style={{
            position: 'absolute',
            left: offsetX + (CENTER_X - 18) * scale - ringR,
            top: offsetY + plankY * scale - ringR,
            width: ringR * 2,
            height: ringR * 2,
            borderRadius: ringR,
            borderWidth: 1.5,
            borderColor: 'rgba(16, 185, 129, 0.6)',
          }}
        />
      );
    }

  // 7. STANDING OVERHEAD PRESS
  } else if (isOverheadPress) {
    const shoulderY = FLOOR_Y - 170;
    const hipY = FLOOR_Y - 105;
    const shoulderSpan = 24;

    drawHead(dc, CENTER_X, shoulderY - 26, 15, false);
    drawLimb(dc, CENTER_X - shoulderSpan, shoulderY, CENTER_X + shoulderSpan, shoulderY, 12, false);
    drawLimb(dc, CENTER_X, shoulderY, CENTER_X, hipY, 14, false);

    const kneeY = FLOOR_Y - 50;
    drawLimb(dc, CENTER_X - 12, hipY, CENTER_X - 22, kneeY, 10, false);
    drawLimb(dc, CENTER_X - 22, kneeY, CENTER_X - 20, FLOOR_Y, 9, false);
    drawLimb(dc, CENTER_X + 12, hipY, CENTER_X + 22, kneeY, 10, false);
    drawLimb(dc, CENTER_X + 22, kneeY, CENTER_X + 20, FLOOR_Y, 9, false);

    const pressHeight = t * 64;
    const handY = shoulderY - 8 - pressHeight;

    [-1, 1].forEach(side => {
      const sx = CENTER_X + side * shoulderSpan;
      const ex = CENTER_X + side * (shoulderSpan + 14);
      const ey = shoulderY + 14 - pressHeight * 0.4;
      const hx = CENTER_X + side * (shoulderSpan + 14);

      drawLimb(dc, sx, shoulderY, ex, ey, 10, true);
      drawLimb(dc, ex, ey, hx, handY, 8, false);
      drawDumbbell(dc, hx, handY, 0);
    });

  // 8. RUSSIAN TWISTS
  } else if (isTwist) {
    const seatedY = FLOOR_Y - 35;
    const twistAngle = Math.sin(elapsedSec * 3.5);
    const torsoTopX = CENTER_X - 25;
    const torsoTopY = seatedY - 45;

    drawHead(dc, torsoTopX - 10, torsoTopY - 16, 14, false);
    drawLimb(dc, torsoTopX, torsoTopY, CENTER_X, seatedY, 15, true);

    const kneeX = CENTER_X + 40;
    const kneeY = seatedY - 30;
    drawLimb(dc, CENTER_X - 6, seatedY, kneeX - 6, kneeY - 4, 10, false, 0.5);
    drawLimb(dc, kneeX - 6, kneeY - 4, kneeX + 18, seatedY - 14, 9, false, 0.5);
    drawLimb(dc, CENTER_X + 6, seatedY, kneeX + 6, kneeY, 11, false);
    drawLimb(dc, kneeX + 6, kneeY, kneeX + 30, seatedY - 6, 10, false);

    const ballX = CENTER_X - 10 + twistAngle * 38;
    const ballY = seatedY - 5;
    drawLimb(dc, torsoTopX - 10, torsoTopY + 4, ballX - 4, ballY - 4, 7, false, 0.5);
    drawLimb(dc, torsoTopX + 10, torsoTopY + 4, ballX, ballY, 8, false);

    const br = Math.max(5, 12 * scale);
    dc.elements.push(
      <View
        key={nextKey(dc, 'ball')}
        style={{
          position: 'absolute',
          left: offsetX + ballX * scale - br,
          top: offsetY + ballY * scale - br,
          width: br * 2,
          height: br * 2,
          borderRadius: br,
          backgroundColor: '#B91C1C',
          borderWidth: 1.5,
          borderColor: '#FECDD3',
        }}
      />
    );

  // 9. WALKING LUNGES
  } else if (isLunge) {
    const lungeDepth = t * 40;
    const hipY = FLOOR_Y - 100 + lungeDepth;
    const shoulderY = FLOOR_Y - 170 + lungeDepth;

    drawHead(dc, CENTER_X, shoulderY - 26, 15, true);
    drawLimb(dc, CENTER_X, shoulderY, CENTER_X, hipY, 14, false);

    const frontFootX = CENTER_X + 45;
    const backKneeY = FLOOR_Y - 10;

    drawLimb(dc, CENTER_X - 6, hipY, CENTER_X - 36, backKneeY, 11, true, 0.5);
    drawLimb(dc, CENTER_X - 36, backKneeY, CENTER_X - 50, FLOOR_Y, 9, false, 0.5);

    drawLimb(dc, CENTER_X + 6, hipY, CENTER_X + 25, FLOOR_Y - 35, 12, true);
    drawLimb(dc, CENTER_X + 25, FLOOR_Y - 35, frontFootX, FLOOR_Y, 10, false);

    drawLimb(dc, CENTER_X - 14, shoulderY, CENTER_X - 14, shoulderY + 45, 7, false, 0.5);
    drawDumbbell(dc, CENTER_X - 14, shoulderY + 45, 0);
    drawLimb(dc, CENTER_X + 14, shoulderY, CENTER_X + 14, shoulderY + 45, 8, false);
    drawDumbbell(dc, CENTER_X + 14, shoulderY + 45, 0);

  // 10. GENERAL DYNAMIC RESISTANCE MOVEMENT
  } else {
    const dip = t * 35;
    const hipY = FLOOR_Y - 110 + dip;
    const shoulderY = FLOOR_Y - 180 + dip;

    drawHead(dc, CENTER_X, shoulderY - 26, 15, false);
    drawLimb(dc, CENTER_X - 24, shoulderY, CENTER_X + 24, shoulderY, 12, false);
    drawLimb(dc, CENTER_X, shoulderY, CENTER_X, hipY, 14, true);

    const kneeY = FLOOR_Y - 50;
    drawLimb(dc, CENTER_X - 14, hipY, CENTER_X - 24, kneeY, 11, false);
    drawLimb(dc, CENTER_X - 24, kneeY, CENTER_X - 20, FLOOR_Y, 10, false);
    drawLimb(dc, CENTER_X + 14, hipY, CENTER_X + 24, kneeY, 11, false);
    drawLimb(dc, CENTER_X + 24, kneeY, CENTER_X + 20, FLOOR_Y, 10, false);

    drawLimb(dc, CENTER_X - 24, shoulderY, CENTER_X - 34, shoulderY + 40, 9, false);
    drawLimb(dc, CENTER_X + 24, shoulderY, CENTER_X + 34, shoulderY + 40, 9, false);
    drawDumbbell(dc, CENTER_X - 34, shoulderY + 40, 0);
    drawDumbbell(dc, CENTER_X + 34, shoulderY + 40, 0);
  }

  return (
    <View style={styles.wrapper}>
      {showInteractiveControls && (
        <View style={styles.topControlRow}>
          <TouchableOpacity
            style={styles.ctrlChip}
            onPress={() => setLocalAngle(v => (v === 'front' ? 'side' : 'front'))}
            activeOpacity={0.8}
          >
            <Ionicons name="compass-outline" size={12} color="#EA580C" />
            <Text style={styles.ctrlChipText}>{viewAngle === 'front' ? 'Side Profile' : 'Front View'}</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlChip, showFormGuides && styles.ctrlChipSky]}
            onPress={() => setLocalGuides(g => !g)}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={12} color={showFormGuides ? '#0284C7' : '#64748B'} />
            <Text style={[styles.ctrlChipText, showFormGuides && { color: '#0284C7' }]}>Guides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.ctrlChip, highlightMuscles && styles.ctrlChipGreen]}
            onPress={() => setLocalGlow(g => !g)}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={12} color={highlightMuscles ? '#15803D' : '#64748B'} />
            <Text style={[styles.ctrlChipText, highlightMuscles && { color: '#15803D' }]}>Glow</Text>
          </TouchableOpacity>
        </View>
      )}

      <View style={[styles.stage, { width: stageW, height: stageH }]}>{dc.elements}</View>

      {showInteractiveControls && (
        <View style={styles.bottomHudRow}>
          <TouchableOpacity
            style={styles.playPillBtn}
            onPress={() => setLocalPlaying(p => !p)}
            activeOpacity={0.85}
          >
            <Ionicons name={isPlaying ? 'pause' : 'play'} size={13} color="#FFFFFF" />
            <Text style={styles.playPillText}>{isPlaying ? 'Pause' : 'Play'}</Text>
          </TouchableOpacity>

          <View style={styles.phasePill}>
            <Text style={styles.phasePillText} numberOfLines={1}>
              Rep #{currentRep} · {phaseLabel}
            </Text>
          </View>

          <View style={styles.speedRow}>
            {[0.5, 1.0, 1.5].map(s => (
              <TouchableOpacity
                key={s}
                style={[styles.speedBtn, speed === s && styles.speedBtnActive]}
                onPress={() => setLocalSpeed(s)}
              >
                <Text style={[styles.speedBtnText, speed === s && styles.speedBtnTextActive]}>{s}x</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  wrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
  },
  stage: {
    position: 'relative',
    overflow: 'hidden',
    alignSelf: 'center',
  },
  topControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 6,
    marginBottom: 4,
    flexWrap: 'wrap',
  },
  ctrlChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
  },
  ctrlChipSky: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  ctrlChipGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  ctrlChipText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#475569',
  },
  bottomHudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    width: '100%',
    marginTop: 6,
    paddingHorizontal: 4,
  },
  playPillBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#C2410C',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  playPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  phasePill: {
    flex: 1,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  phasePillText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#1E293B',
  },
  speedRow: {
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  speedBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  speedBtnActive: {
    backgroundColor: '#C2410C',
  },
  speedBtnText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  speedBtnTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
});

export default StickFigureAnimation;
