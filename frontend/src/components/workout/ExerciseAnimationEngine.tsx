import React, { useRef, useEffect, useState, useCallback } from 'react';
import { Play, Pause, RotateCcw, Zap, Activity, FastForward, Rewind, Eye, Compass } from 'lucide-react';

interface ExerciseAnimationEngineProps {
  exerciseName: string;
  category?: string;
  targetMuscle?: string;
  duration?: number; // total duration in seconds, default 60 (1 minute)
  autoPlay?: boolean;
  compact?: boolean;
  className?: string;
  isPlayingExternal?: boolean;
  resetTrigger?: number;
}

export const ExerciseAnimationEngine: React.FC<ExerciseAnimationEngineProps> = ({
  exerciseName = '',
  category = '',
  targetMuscle = '',
  duration = 60, // Fixed 1-minute video demonstration by default
  autoPlay = true,
  compact = false,
  className = '',
  isPlayingExternal,
  resetTrigger
}) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const progressBarRef = useRef<HTMLDivElement>(null);

  // Normalize exercise type
  const exLower = exerciseName.toLowerCase();

  const isSquat = exLower.includes('squat');
  const isPushUp = exLower.includes('push-up') || exLower.includes('pushup');
  const isBenchPress = exLower.includes('bench press');
  const isPullUp = exLower.includes('pull-up') || exLower.includes('pullup');
  const isDeadlift = exLower.includes('deadlift') || exLower.includes('rdl');
  const isCurl = exLower.includes('curl') || exLower.includes('bicep');
  const isPlank = exLower.includes('plank');
  const isOverheadPress = exLower.includes('press') && (exLower.includes('overhead') || exLower.includes('shoulder'));
  const isLunge = exLower.includes('lunge');
  const isTwist = exLower.includes('twist');

  // Default natural perspective: Side profile for Squat/Deadlift/Plank/Pushup/Bench/Lunge, Front for Curls/Press/Pullup/Twist
  const initialAngle: 'front' | 'side' = (isSquat || isDeadlift || isPushUp || isBenchPress || isPlank || isLunge) ? 'side' : 'front';

  const [isPlaying, setIsPlaying] = useState(isPlayingExternal !== undefined ? isPlayingExternal : autoPlay);
  const [speed, setSpeed] = useState<number>(1.0);
  const [currentPhase, setCurrentPhase] = useState<string>('Setup');
  const [repsSimulated, setRepsSimulated] = useState<number>(1);
  const [highlightMuscles, setHighlightMuscles] = useState<boolean>(true);
  const [showFormGuides, setShowFormGuides] = useState<boolean>(true);
  const [viewAngle, setViewAngle] = useState<'front' | 'side'>(initialAngle);
  const [currentTimeSec, setCurrentTimeSec] = useState<number>(0);
  const [hoverTime, setHoverTime] = useState<number | null>(null);

  const totalDuration = duration > 0 ? duration : 60; // 60s (1 Minute)

  const animFrameRef = useRef<number>(0);
  const startTimeRef = useRef<number>(Date.now());
  const pausedAtRef = useRef<number | null>(null);
  const totalPausedTimeRef = useRef<number>(0);
  const repCountRef = useRef<number>(1);
  const lastPhaseRef = useRef<string>('Setup');
  const lastSecRef = useRef<number>(0);

  useEffect(() => {
    if (isPlayingExternal !== undefined) {
      setIsPlaying(isPlayingExternal);
    }
  }, [isPlayingExternal]);

  useEffect(() => {
    if (resetTrigger !== undefined && resetTrigger > 0) {
      startTimeRef.current = Date.now();
      totalPausedTimeRef.current = 0;
      pausedAtRef.current = null;
      repCountRef.current = 1;
      setRepsSimulated(1);
      setCurrentTimeSec(0);
      setIsPlaying(isPlayingExternal ?? true);
    }
  }, [resetTrigger, isPlayingExternal]);

  useEffect(() => {
    if (!isPlaying) {
      if (pausedAtRef.current === null) {
        pausedAtRef.current = Date.now();
      }
    } else {
      if (pausedAtRef.current !== null) {
        totalPausedTimeRef.current += (Date.now() - pausedAtRef.current);
        pausedAtRef.current = null;
      }
    }
  }, [isPlaying]);

  const formatTime = (totalSeconds: number) => {
    const mins = Math.floor(totalSeconds / 60);
    const secs = Math.floor(totalSeconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let running = isPlaying;

    const render = () => {
      if (!canvas || !ctx) return;

      const width = canvas.width;
      const height = canvas.height;
      const now = Date.now();
      const currentPauseGap = (!running && pausedAtRef.current !== null) ? (now - pausedAtRef.current) : 0;
      const elapsedTotal = Math.max(0, ((now - startTimeRef.current - totalPausedTimeRef.current - currentPauseGap) / 1000) * speed);

      // 1-Minute Video Timeline (loops smoothly across 60 seconds)
      const currentVideoTime = elapsedTotal % totalDuration;
      const currentSecFloor = Math.floor(currentVideoTime);
      if (currentSecFloor !== lastSecRef.current) {
        lastSecRef.current = currentSecFloor;
        setCurrentTimeSec(currentSecFloor);
      }

      // Clear Canvas & Draw Premium Dark Gym Studio Backdrop
      ctx.clearRect(0, 0, width, height);

      // Studio Radial lighting gradient
      const bgGrad = ctx.createRadialGradient(width / 2, height / 2 - 20, 30, width / 2, height / 2, width / 1.3);
      bgGrad.addColorStop(0, '#292524');
      bgGrad.addColorStop(0.5, '#0F172A');
      bgGrad.addColorStop(1, '#090D16');
      ctx.fillStyle = bgGrad;
      ctx.fillRect(0, 0, width, height);

      // Floor boundary line
      const floorY = height - 42;
      ctx.strokeStyle = 'rgba(22, 74, 74, 0.45)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20, floorY);
      ctx.lineTo(width - 20, floorY);
      ctx.stroke();

      // Floor perspective grid lines
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.04)';
      ctx.lineWidth = 1;
      for (let x = 40; x < width; x += 50) {
        ctx.beginPath();
        ctx.moveTo(x, floorY);
        ctx.lineTo(x + (x - width / 2) * 0.35, height);
        ctx.stroke();
      }

      // Rep cycle timing
      const repCycleDuration = 3.6; // 3.6s per rep cycle (~16 reps in 60s)
      const cycleProgress = (elapsedTotal % repCycleDuration) / repCycleDuration;

      // Track rep count in 1-minute video
      const currentTotalReps = Math.floor(elapsedTotal / repCycleDuration) + 1;
      if (currentTotalReps !== repCountRef.current) {
        repCountRef.current = currentTotalReps;
        setRepsSimulated(currentTotalReps);
      }

      // Smooth Ease-in-out cosine: 0 -> 1 -> 0
      const t = 0.5 - 0.5 * Math.cos(cycleProgress * 2 * Math.PI);

      // Determine movement phase
      let phaseLabel = 'Setup';
      if (cycleProgress < 0.45) {
        phaseLabel = isSquat || isPushUp || isDeadlift || isLunge ? 'Eccentric (Lowering)' : 'Concentric (Lifting / Curl)';
      } else if (cycleProgress >= 0.45 && cycleProgress <= 0.55) {
        phaseLabel = 'Peak Contraction & Squeeze';
      } else {
        phaseLabel = isSquat || isPushUp || isDeadlift || isLunge ? 'Concentric (Drive Up)' : 'Eccentric (Controlled Lowering)';
      }

      if (lastPhaseRef.current !== phaseLabel) {
        lastPhaseRef.current = phaseLabel;
        setCurrentPhase(phaseLabel);
      }

      // Biomechanical Style Configuration
      const mannequinColor = '#E2E8F0';
      const jointColor = '#38BDF8';
      const highlightColor = '#10B981'; // Emerald neon glow for active target muscles
      const accentGlow = '#06B6D4';

      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';

      const drawLimb = (x1: number, y1: number, x2: number, y2: number, limbWidth: number, isTarget: boolean = false, opacity: number = 1.0) => {
        ctx.save();
        if (opacity < 1.0) {
          ctx.globalAlpha = opacity;
        }
        ctx.beginPath();
        ctx.moveTo(x1, y1);
        ctx.lineTo(x2, y2);
        ctx.lineWidth = limbWidth;

        if (isTarget && highlightMuscles) {
          ctx.strokeStyle = highlightColor;
          ctx.shadowColor = highlightColor;
          ctx.shadowBlur = 18;
        } else {
          ctx.strokeStyle = mannequinColor;
          ctx.shadowColor = accentGlow;
          ctx.shadowBlur = 4;
        }
        ctx.stroke();
        ctx.shadowBlur = 0;

        // Joint pin point
        ctx.fillStyle = jointColor;
        ctx.beginPath();
        ctx.arc(x2, y2, limbWidth * 0.42, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      };

      const drawHead = (hx: number, hy: number, radius: number = 15, facingRight: boolean = false) => {
        ctx.fillStyle = mannequinColor;
        ctx.shadowColor = accentGlow;
        ctx.shadowBlur = 8;
        ctx.beginPath();
        ctx.arc(hx, hy, radius, 0, Math.PI * 2);
        ctx.fill();

        // Visor glow
        ctx.strokeStyle = '#38BDF8';
        ctx.lineWidth = 2.5;
        ctx.beginPath();
        if (facingRight) {
          ctx.arc(hx + 6, hy, radius * 0.6, -0.6, 0.6);
        } else {
          ctx.arc(hx + 3, hy - 1, radius * 0.65, -0.4, 0.4);
        }
        ctx.stroke();
        ctx.shadowBlur = 0;
      };

      const drawDumbbell = (cx: number, cy: number, rot: number = 0) => {
        ctx.save();
        ctx.translate(cx, cy);
        ctx.rotate(rot);

        // Bar handle
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 3.5;
        ctx.beginPath();
        ctx.moveTo(-13, 0);
        ctx.lineTo(13, 0);
        ctx.stroke();

        // Hex plates
        ctx.fillStyle = '#334155';
        ctx.strokeStyle = '#06B6D4';
        ctx.lineWidth = 1.5;

        ctx.fillRect(-16, -10, 5, 20);
        ctx.strokeRect(-16, -10, 5, 20);

        ctx.fillRect(11, -10, 5, 20);
        ctx.strokeRect(11, -10, 5, 20);

        ctx.restore();
      };

      const drawBarbell = (bx: number, by: number, widthPx: number = 210) => {
        ctx.strokeStyle = '#CBD5E1';
        ctx.lineWidth = 5;
        ctx.beginPath();
        ctx.moveTo(bx - widthPx / 2, by);
        ctx.lineTo(bx + widthPx / 2, by);
        ctx.stroke();

        ctx.fillStyle = '#EF4444';
        ctx.strokeStyle = '#FCA5A5';
        ctx.lineWidth = 2;

        [-1, 1].forEach(side => {
          const px = bx + side * (widthPx / 2 - 12);
          ctx.fillRect(px - 5, by - 24, 10, 48);
          ctx.strokeRect(px - 5, by - 24, 10, 48);
        });
      };

      // Form Trajectory Guide Arc drawer
      const drawMotionGuideArc = (cx: number, cy: number, radius: number, startAngle: number, endAngle: number, label: string) => {
        if (!showFormGuides || compact) return;
        ctx.save();
        ctx.setLineDash([4, 4]);
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.45)';
        ctx.lineWidth = 1.5;
        ctx.beginPath();
        ctx.arc(cx, cy, radius, startAngle, endAngle);
        ctx.stroke();
        ctx.setLineDash([]);

        // Label along arc
        ctx.fillStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.font = 'bold 9px sans-serif';
        const midAngle = (startAngle + endAngle) / 2;
        const textX = cx + Math.cos(midAngle) * (radius + 14);
        const textY = cy + Math.sin(midAngle) * (radius + 14);
        ctx.fillText(label, textX - 16, textY);
        ctx.restore();
      };

      const centerX = width / 2;

      // =====================================================================
      // 1. DUMBBELL BICEP CURLS: PROPER FORM (ELBOWS PINNED, CURL TO CHEST)
      // =====================================================================
      if (isCurl) {
        const shoulderY = floorY - 175;
        const hipY = floorY - 105;

        if (viewAngle === 'side') {
          // --- SIDE PROFILE VIEW ---
          const torsoX = centerX - 10;
          const headX = torsoX;

          // Head & Spine
          drawHead(headX, shoulderY - 26, 15, true);
          drawLimb(torsoX, shoulderY - 10, torsoX, shoulderY, 8, false); // neck
          drawLimb(torsoX, shoulderY, torsoX, hipY, 14, false); // vertical spine

          // BOTH LEGS (Far Leg behind with slight offset & depth opacity)
          drawLimb(torsoX - 10, hipY, torsoX - 8, floorY - 50, 10, false, 0.5); // Far thigh
          drawLimb(torsoX - 8, floorY - 50, torsoX - 10, floorY, 9, false, 0.5); // Far shin

          drawLimb(torsoX, hipY, torsoX + 2, floorY - 50, 11, false); // Near thigh
          drawLimb(torsoX + 2, floorY - 50, torsoX, floorY, 10, false); // Near shin

          // UPPER ARMS: Pinned vertically against side ribs
          const elbowX = torsoX + 2;
          const elbowY = shoulderY + 52;

          const forearmLen = 44;
          const curlAngleRad = (Math.PI / 2) - (t * 2.5);
          const handX = elbowX + Math.cos(curlAngleRad) * forearmLen;
          const handY = elbowY + Math.sin(curlAngleRad) * forearmLen;

          // BOTH ARMS (Far Arm rendered first in background)
          drawLimb(torsoX - 10, shoulderY, elbowX - 10, elbowY, 10, true, 0.5); // Far Upper Arm
          drawLimb(elbowX - 10, elbowY, handX - 10, handY, 7, false, 0.5); // Far Forearm
          drawDumbbell(handX - 10, handY, t * 0.4);

          drawLimb(torsoX, shoulderY, elbowX, elbowY, 11, true); // Near Upper Arm
          drawLimb(elbowX, elbowY, handX, handY, 8, false); // Near Forearm
          drawDumbbell(handX, handY, t * 0.4);

          // Motion Guide Arc showing curl trajectory
          drawMotionGuideArc(elbowX, elbowY, forearmLen, 0.1, Math.PI / 2, 'Curl Arc');

          if (showFormGuides && !compact) {
            ctx.fillStyle = '#38BDF8';
            ctx.beginPath();
            ctx.arc(elbowX, elbowY, 4, 0, Math.PI * 2);
            ctx.fill();
            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = '#67E8F9';
            ctx.fillText('📌 Elbows Pinned to Ribs', elbowX + 8, elbowY + 4);
          }

        } else {
          // --- FRONT VIEW ---
          const shoulderSpan = 24;
          const shoulderL_X = centerX - shoulderSpan;
          const shoulderR_X = centerX + shoulderSpan;

          const hipSpan = 14;
          const hipL_X = centerX - hipSpan;
          const hipR_X = centerX + hipSpan;

          // Head, Neck, Clavicles, Spine & Pelvis
          drawHead(centerX, shoulderY - 26, 15, false);
          drawLimb(centerX, shoulderY - 10, centerX, shoulderY, 8, false);
          drawLimb(shoulderL_X, shoulderY, shoulderR_X, shoulderY, 12, false);
          drawLimb(centerX, shoulderY, centerX, hipY, 14, false);
          drawLimb(hipL_X, hipY, hipR_X, hipY, 12, false);

          // BOTH LEGS with knees
          const kneeY = floorY - 50;
          drawLimb(hipL_X, hipY, centerX - 20, kneeY, 11, false);
          drawLimb(centerX - 20, kneeY, centerX - 18, floorY, 10, false);

          drawLimb(hipR_X, hipY, centerX + 20, kneeY, 11, false);
          drawLimb(centerX + 20, kneeY, centerX + 18, floorY, 10, false);

          // BOTH ARMS
          const elbowY = shoulderY + 52;
          const elbowX_L = shoulderL_X;
          const elbowX_R = shoulderR_X;

          drawLimb(shoulderL_X, shoulderY, elbowX_L, elbowY, 11, true); // Left Bicep
          drawLimb(shoulderR_X, shoulderY, elbowX_R, elbowY, 11, true); // Right Bicep

          const forearmLen = 42;
          const curlAngle = t * Math.PI * 0.85;

          const handY_L = elbowY + Math.cos(curlAngle) * forearmLen;
          const handX_L = elbowX_L - Math.sin(curlAngle) * 5;

          const handY_R = elbowY + Math.cos(curlAngle) * forearmLen;
          const handX_R = elbowX_R + Math.sin(curlAngle) * 5;

          drawLimb(elbowX_L, elbowY, handX_L, handY_L, 8, false);
          drawLimb(elbowX_R, elbowY, handX_R, handY_R, 8, false);

          drawDumbbell(handX_L, handY_L, 0);
          drawDumbbell(handX_R, handY_R, 0);

          if (showFormGuides && !compact) {
            ctx.fillStyle = '#06B6D4';
            ctx.beginPath();
            ctx.arc(elbowX_L, elbowY, 4, 0, Math.PI * 2);
            ctx.arc(elbowX_R, elbowY, 4, 0, Math.PI * 2);
            ctx.fill();

            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = '#38BDF8';
            ctx.fillText('Fixed Pivot', elbowX_L - 55, elbowY + 3);
            ctx.fillText('Fixed Pivot', elbowX_R + 8, elbowY + 3);
          }
        }

      // =====================================================================
      // 2. BARBELL BACK SQUATS (PARALLEL DEPTH, PROPER HIP HINGE)
      // =====================================================================
      } else if (isSquat) {
        if (viewAngle === 'side') {
          // --- SQUAT SIDE PROFILE ---
          const squatDepth = t * 60;
          const hipPushBack = t * 32;
          const kneeForward = t * 24;
          const torsoAngle = t * 0.35;

          const hipY = floorY - 110 + squatDepth;
          const hipX = centerX - hipPushBack;

          const kneeX = centerX + kneeForward - 10;
          const kneeY = floorY - 55 + squatDepth * 0.25;

          const ankleX = centerX - 10;
          const ankleY = floorY;

          const torsoLen = 70;
          const shoulderX = hipX + Math.sin(torsoAngle) * torsoLen;
          const shoulderY = hipY - Math.cos(torsoAngle) * torsoLen;

          drawHead(shoulderX + 6, shoulderY - 24, 15, true);
          drawLimb(shoulderX, shoulderY, hipX, hipY, 14, false); // Spine

          // BOTH LEGS (Far Leg in background with opacity)
          drawLimb(hipX - 12, hipY, kneeX - 12, kneeY, 12, true, 0.5); // Far Thigh
          drawLimb(kneeX - 12, kneeY, ankleX - 12, ankleY, 9, false, 0.5); // Far Shin

          drawLimb(hipX, hipY, kneeX, kneeY, 13, true); // Near Thigh
          drawLimb(kneeX, kneeY, ankleX, ankleY, 10, false); // Near Shin

          // Barbell
          drawBarbell(shoulderX, shoulderY + 2, 80);

          // BOTH ARMS holding bar
          drawLimb(shoulderX - 10, shoulderY, shoulderX - 22, shoulderY + 22, 7, false, 0.5);
          drawLimb(shoulderX - 22, shoulderY + 22, shoulderX - 10, shoulderY + 2, 6, false, 0.5);

          drawLimb(shoulderX, shoulderY, shoulderX - 12, shoulderY + 22, 8, false);
          drawLimb(shoulderX - 12, shoulderY + 22, shoulderX, shoulderY + 2, 7, false);

          if (showFormGuides && !compact) {
            ctx.strokeStyle = 'rgba(16, 185, 129, 0.4)';
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(hipX - 25, kneeY);
            ctx.lineTo(kneeX + 35, kneeY);
            ctx.stroke();
            ctx.setLineDash([]);

            ctx.font = 'bold 9px sans-serif';
            ctx.fillStyle = '#34D399';
            ctx.fillText('Parallel Depth', hipX - 85, kneeY + 3);
          }

        } else {
          // --- SQUAT FRONT VIEW ---
          const squatDepth = t * 56;
          const hipY = floorY - 105 + squatDepth;
          const shoulderY = floorY - 175 + squatDepth;

          drawHead(centerX, shoulderY - 26, 15, false);
          drawLimb(centerX, shoulderY, centerX, hipY, 14, false);

          // BOTH LEGS tracking outward over toes
          const kneeSpread = 28 + t * 14;
          const kneeY = floorY - 50 + squatDepth * 0.3;

          drawLimb(centerX - 10, hipY, centerX - kneeSpread, kneeY, 13, true); // Left Quad
          drawLimb(centerX + 10, hipY, centerX + kneeSpread, kneeY, 13, true); // Right Quad

          drawLimb(centerX - kneeSpread, kneeY, centerX - 32, floorY, 10, false);
          drawLimb(centerX + kneeSpread, kneeY, centerX + 32, floorY, 10, false);

          drawBarbell(centerX, shoulderY + 4, 220);

          // BOTH ARMS holding barbell
          drawLimb(centerX - 24, shoulderY, centerX - 55, shoulderY + 18, 9, false);
          drawLimb(centerX - 55, shoulderY + 18, centerX - 55, shoulderY + 4, 8, false);

          drawLimb(centerX + 24, shoulderY, centerX + 55, shoulderY + 18, 9, false);
          drawLimb(centerX + 55, shoulderY + 18, centerX + 55, shoulderY + 4, 8, false);
        }

      // =====================================================================
      // 3. BARBELL ROMANIAN DEADLIFT (RDL) (HIP HINGE, BOTH ARMS & LEGS VISIBLE)
      // =====================================================================
      } else if (isDeadlift) {
        const hingeAngle = t * 1.15;
        const hipX = centerX - t * 36;
        const hipY = floorY - 110 + t * 12;

        const torsoLen = 72;
        const shoulderX = hipX + Math.sin(hingeAngle + 0.2) * torsoLen;
        const shoulderY = hipY - Math.cos(hingeAngle + 0.2) * torsoLen;

        drawHead(shoulderX + 10, shoulderY - 20, 15, true);
        drawLimb(shoulderX, shoulderY, hipX, hipY, 14, false); // Spine

        const kneeX = centerX - 10;
        const kneeY = floorY - 54;
        const footX = centerX - 12;

        // BOTH LEGS (Far Leg in background with opacity offset)
        drawLimb(hipX - 14, hipY, kneeX - 14, kneeY, 12, true, 0.5); // Far Hamstring
        drawLimb(kneeX - 14, kneeY, footX - 14, floorY, 9, false, 0.5); // Far Shin

        drawLimb(hipX, hipY, kneeX, kneeY, 13, true); // Near Hamstring
        drawLimb(kneeX, kneeY, footX, floorY, 10, false); // Near Shin

        const barX = shoulderX;
        const barY = shoulderY + 68;

        // BOTH ARMS hanging vertically with barbell
        drawLimb(shoulderX - 12, shoulderY, barX - 12, barY, 7, false, 0.5); // Far Arm
        drawLimb(shoulderX + 6, shoulderY, barX + 6, barY, 8, false); // Near Arm

        drawBarbell(barX, barY, 80);

        if (showFormGuides && !compact) {
          ctx.strokeStyle = 'rgba(56, 189, 248, 0.4)';
          ctx.setLineDash([3, 3]);
          ctx.beginPath();
          ctx.moveTo(hipX, hipY);
          ctx.lineTo(hipX - 45, hipY);
          ctx.stroke();
          ctx.setLineDash([]);

          ctx.font = 'bold 9px sans-serif';
          ctx.fillStyle = '#38BDF8';
          ctx.fillText('Hips Back ➔', hipX - 85, hipY + 3);
        }

      // =====================================================================
      // 4. PUSH-UPS & BARBELL BENCH PRESS (BOTH ARMS & LEGS RENDERED)
      // =====================================================================
      } else if (isPushUp || isBenchPress) {
        const baseFloor = isBenchPress ? floorY - 40 : floorY;

        if (isBenchPress) {
          ctx.fillStyle = '#334155';
          ctx.fillRect(centerX - 105, baseFloor + 12, 210, 16);
          ctx.fillStyle = '#0F172A';
          ctx.fillRect(centerX - 85, baseFloor + 28, 14, 22);
          ctx.fillRect(centerX + 70, baseFloor + 28, 14, 22);
        }

        const pressDepth = t * 44;
        const chestY = baseFloor - 24;
        const barY = baseFloor - 78 + pressDepth;

        drawHead(centerX - 75, chestY - 10, 14, true);
        drawLimb(centerX - 60, chestY, centerX + 38, chestY, 14, true); // Torso/Pectorals

        // BOTH LEGS
        drawLimb(centerX + 38, chestY - 7, centerX + 105, baseFloor - 7, 9, false, 0.5); // Far Leg
        drawLimb(centerX + 38, chestY + 4, centerX + 105, baseFloor + 4, 10, false); // Near Leg

        const elbowX = centerX - 18;
        const elbowY = isBenchPress ? barY + 28 : baseFloor - 10 + pressDepth * 0.6;
        const handX = centerX - 18;
        const handY = isBenchPress ? barY : baseFloor;

        // BOTH ARMS
        drawLimb(centerX - 48, chestY, elbowX - 10, elbowY - 6, 8, true, 0.5); // Far Upper Arm
        drawLimb(elbowX - 10, elbowY - 6, handX - 10, handY - 6, 7, false, 0.5); // Far Forearm

        drawLimb(centerX - 28, chestY, elbowX + 10, elbowY + 6, 9, true); // Near Upper Arm
        drawLimb(elbowX + 10, elbowY + 6, handX + 10, handY + 6, 8, false); // Near Forearm

        if (isBenchPress) {
          drawBarbell(handX, barY, 205);
        }

      // =====================================================================
      // 5. PULL-UPS (BOTH ARMS & BOTH LEGS PROPERLY ARRANGED)
      // =====================================================================
      } else if (isPullUp) {
        const barY = 38;
        const barX = centerX;

        ctx.strokeStyle = '#64748B';
        ctx.lineWidth = 7;
        ctx.beginPath();
        ctx.moveTo(barX - 110, barY);
        ctx.lineTo(barX + 110, barY);
        ctx.stroke();

        const pullHeight = t * 62;
        const headY = barY + 72 - pullHeight;
        const shoulderY = headY + 28;
        const hipY = shoulderY + 62;
        const kneeY = hipY + 48;

        drawHead(barX, headY, 15, false);
        drawLimb(barX, shoulderY, barX, hipY, 15, true); // Torso / Lats

        // BOTH LEGS (Left and Right legs hanging below hips)
        drawLimb(barX - 8, hipY, barX - 14, kneeY, 10, false); // Left Thigh
        drawLimb(barX - 14, kneeY, barX - 18, kneeY + 38, 9, false); // Left Shin

        drawLimb(barX + 8, hipY, barX + 14, kneeY, 10, false); // Right Thigh
        drawLimb(barX + 14, kneeY, barX + 18, kneeY + 38, 9, false); // Right Shin

        // BOTH ARMS
        const handX_L = barX - 48;
        const handX_R = barX + 48;
        const elbowY = barY + 32 + (1 - t) * 34;
        const elbowX_L = barX - 58 - t * 10;
        const elbowX_R = barX + 58 + t * 10;

        drawLimb(barX - 14, shoulderY, elbowX_L, elbowY, 10, true);
        drawLimb(barX + 14, shoulderY, elbowX_R, elbowY, 10, true);
        drawLimb(elbowX_L, elbowY, handX_L, barY, 8, false);
        drawLimb(elbowX_R, elbowY, handX_R, barY, 8, false);

      // =====================================================================
      // 6. FOREARM PLANK (BOTH FOREARMS & BOTH LEGS VISIBLE)
      // =====================================================================
      } else if (isPlank) {
        const plankY = floorY - 32;
        const pulse = Math.sin(elapsedTotal * 6) * 2;

        drawHead(centerX - 90, plankY - 14 + pulse, 14, true);
        drawLimb(centerX - 76, plankY + pulse, centerX + 38, plankY + pulse, 15, true); // Core

        // BOTH LEGS
        drawLimb(centerX + 38, plankY + pulse - 6, centerX + 105, floorY - 6, 9, false, 0.5); // Far Leg
        drawLimb(centerX + 38, plankY + pulse + 3, centerX + 105, floorY + 3, 11, false); // Near Leg

        // BOTH FOREARMS
        drawLimb(centerX - 66, plankY + pulse, centerX - 66, floorY, 8, false, 0.5);
        drawLimb(centerX - 66, floorY, centerX - 38, floorY, 7, false, 0.5);

        drawLimb(centerX - 46, plankY + pulse, centerX - 46, floorY, 9, false);
        drawLimb(centerX - 46, floorY, centerX - 18, floorY, 8, false);

        if (highlightMuscles) {
          ctx.strokeStyle = 'rgba(16, 185, 129, 0.65)';
          ctx.lineWidth = 2;
          ctx.beginPath();
          ctx.arc(centerX - 18, plankY, 22 + pulse * 2, 0, Math.PI * 2);
          ctx.stroke();
        }

      // =====================================================================
      // 7. STANDING OVERHEAD PRESS (BOTH ARMS & BOTH LEGS)
      // =====================================================================
      } else if (isOverheadPress) {
        const shoulderY = floorY - 170;
        const hipY = floorY - 105;
        const shoulderSpan = 24;

        drawHead(centerX, shoulderY - 26, 15, false);
        drawLimb(centerX - shoulderSpan, shoulderY, centerX + shoulderSpan, shoulderY, 12, false);
        drawLimb(centerX, shoulderY, centerX, hipY, 14, false);

        // BOTH LEGS
        const kneeY = floorY - 50;
        drawLimb(centerX - 12, hipY, centerX - 22, kneeY, 10, false);
        drawLimb(centerX - 22, kneeY, centerX - 20, floorY, 9, false);

        drawLimb(centerX + 12, hipY, centerX + 22, kneeY, 10, false);
        drawLimb(centerX + 22, kneeY, centerX + 20, floorY, 9, false);

        const pressHeight = t * 64;
        const handY = shoulderY - 8 - pressHeight;

        [-1, 1].forEach(side => {
          const sx = centerX + side * shoulderSpan;
          const ex = centerX + side * (shoulderSpan + 14);
          const ey = shoulderY + 14 - pressHeight * 0.4;
          const hx = centerX + side * (shoulderSpan + 14);

          drawLimb(sx, shoulderY, ex, ey, 10, true);
          drawLimb(ex, ey, hx, handY, 8, false);
          drawDumbbell(hx, handY, 0);
        });

      // =====================================================================
      // 8. RUSSIAN TWISTS (BOTH ARMS & BOTH LEGS VISIBLE IN V-SIT)
      // =====================================================================
      } else if (isTwist) {
        const seatedY = floorY - 35;
        const twistAngle = Math.sin(elapsedTotal * 3.5);

        const torsoTopX = centerX - 25;
        const torsoTopY = seatedY - 45;

        drawHead(torsoTopX - 10, torsoTopY - 16, 14, false);
        drawLimb(torsoTopX, torsoTopY, centerX, seatedY, 15, true); // Spine/Core

        const kneeX = centerX + 40;
        const kneeY = seatedY - 30;

        // BOTH LEGS
        drawLimb(centerX - 6, seatedY, kneeX - 6, kneeY - 4, 10, false, 0.5);
        drawLimb(kneeX - 6, kneeY - 4, kneeX + 18, seatedY - 14, 9, false, 0.5);

        drawLimb(centerX + 6, seatedY, kneeX + 6, kneeY, 11, false);
        drawLimb(kneeX + 6, kneeY, kneeX + 30, seatedY - 6, 10, false);

        const ballX = centerX - 10 + twistAngle * 38;
        const ballY = seatedY - 5;

        // BOTH ARMS holding ball
        drawLimb(torsoTopX - 10, torsoTopY + 4, ballX - 4, ballY - 4, 7, false, 0.5);
        drawLimb(torsoTopX + 10, torsoTopY + 4, ballX, ballY, 8, false);

        ctx.fillStyle = '#E11D48';
        ctx.beginPath();
        ctx.arc(ballX, ballY, 12, 0, Math.PI * 2);
        ctx.fill();
        ctx.strokeStyle = '#FECDD3';
        ctx.lineWidth = 1.5;
        ctx.stroke();

      // =====================================================================
      // 9. WALKING DUMBBELL LUNGES (BOTH LEGS & BOTH ARMS VISIBLE)
      // =====================================================================
      } else if (isLunge) {
        const lungeDepth = t * 40;
        const hipY = floorY - 100 + lungeDepth;
        const shoulderY = floorY - 170 + lungeDepth;

        drawHead(centerX, shoulderY - 26, 15, true);
        drawLimb(centerX, shoulderY, centerX, hipY, 14, false);

        // BOTH LEGS (Front leg pair & Rear leg pair)
        const frontFootX = centerX + 45;
        const backKneeY = floorY - 10;

        // Rear Leg (Far background)
        drawLimb(centerX - 6, hipY, centerX - 36, backKneeY, 11, true, 0.5);
        drawLimb(centerX - 36, backKneeY, centerX - 50, floorY, 9, false, 0.5);

        // Front Leg (Near foreground)
        drawLimb(centerX + 6, hipY, centerX + 25, floorY - 35, 12, true);
        drawLimb(centerX + 25, floorY - 35, frontFootX, floorY, 10, false);

        // BOTH ARMS holding dumbbells
        drawLimb(centerX - 14, shoulderY, centerX - 14, shoulderY + 45, 7, false, 0.5); // Far Arm
        drawDumbbell(centerX - 14, shoulderY + 45, 0);

        drawLimb(centerX + 14, shoulderY, centerX + 14, shoulderY + 45, 8, false); // Near Arm
        drawDumbbell(centerX + 14, shoulderY + 45, 0);

      } else {
        // --- 10. GENERAL / DYNAMIC RESISTANCE MOVEMENT ---
        const dip = t * 35;
        const hipY = floorY - 110 + dip;
        const shoulderY = floorY - 180 + dip;

        drawHead(centerX, shoulderY - 26, 15, false);
        drawLimb(centerX - 24, shoulderY, centerX + 24, shoulderY, 12, false);
        drawLimb(centerX, shoulderY, centerX, hipY, 14, true);

        // BOTH LEGS
        const kneeY = floorY - 50;
        drawLimb(centerX - 14, hipY, centerX - 24, kneeY, 11, false);
        drawLimb(centerX - 24, kneeY, centerX - 20, floorY, 10, false);

        drawLimb(centerX + 14, hipY, centerX + 24, kneeY, 11, false);
        drawLimb(centerX + 24, kneeY, centerX + 20, floorY, 10, false);

        // BOTH ARMS
        drawLimb(centerX - 24, shoulderY, centerX - 34, shoulderY + 40, 9, false);
        drawLimb(centerX + 24, shoulderY, centerX + 34, shoulderY + 40, 9, false);
        drawDumbbell(centerX - 34, shoulderY + 40, 0);
        drawDumbbell(centerX + 34, shoulderY + 40, 0);
      }

      // Top HUD overlay inside canvas
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.roundRect(12, 12, 220, 50, 10);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#38BDF8';
      ctx.font = 'bold 9px monospace';
      ctx.fillText(`1-MIN AI FORM VIDEO • ${formatTime(currentVideoTime)} / ${formatTime(totalDuration)}`, 22, 28);

      ctx.fillStyle = '#F8FAFC';
      ctx.font = 'bold 12px sans-serif';
      ctx.fillText(phaseLabel, 22, 48);

      if (running) {
        animFrameRef.current = requestAnimationFrame(render);
      }
    };

    if (isPlaying) {
      animFrameRef.current = requestAnimationFrame(render);
    } else {
      render();
    }

    return () => {
      cancelAnimationFrame(animFrameRef.current);
    };
  }, [isPlaying, speed, highlightMuscles, showFormGuides, viewAngle, exerciseName, category, totalDuration, isSquat, isPushUp, isBenchPress, isPullUp, isDeadlift, isCurl, isPlank, isOverheadPress, isTwist, isLunge]);

  const togglePlay = () => {
    setIsPlaying(!isPlaying);
  };

  const handleRestart = () => {
    startTimeRef.current = Date.now();
    repCountRef.current = 1;
    setRepsSimulated(1);
    setCurrentTimeSec(0);
    setIsPlaying(true);
  };

  const handleSkip = (secondsDelta: number) => {
    const newTime = Math.max(0, Math.min(totalDuration, currentTimeSec + secondsDelta));
    startTimeRef.current = Date.now() - (newTime / speed) * 1000;
    setCurrentTimeSec(newTime);
  };

  const handleSeek = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    const targetSecond = (clickX / rect.width) * totalDuration;
    startTimeRef.current = Date.now() - (targetSecond / speed) * 1000;
    setCurrentTimeSec(targetSecond);
  }, [totalDuration, speed]);

  const handleMouseMoveBar = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!progressBarRef.current) return;
    const rect = progressBarRef.current.getBoundingClientRect();
    const clickX = Math.max(0, Math.min(rect.width, e.clientX - rect.left));
    setHoverTime((clickX / rect.width) * totalDuration);
  };

  return (
    <div className={`relative rounded-2xl overflow-hidden bg-[#0F172A] border border-white/10 flex flex-col ${className}`}>
      {/* 60fps Canvas Display */}
      <div className={`relative w-full bg-[#090D16] flex items-center justify-center overflow-hidden ${
        compact ? 'h-full' : 'aspect-video min-h-[220px] max-h-[360px]'
      }`}>
        <canvas
          ref={canvasRef}
          width={600}
          height={340}
          className="w-full h-full object-contain pointer-events-none"
        />

        {/* Compact Mode Badge */}
        {compact && (
          <div className="absolute bottom-2 left-2 z-10 flex items-center gap-1.5 px-2 py-0.5 rounded-md bg-black/70 backdrop-blur-sm border border-emerald-500/40 text-[9px] font-extrabold text-emerald-400 uppercase tracking-wider">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>1-Min Form Demo</span>
          </div>
        )}

        {/* Floating Quick Action Overlay (Full Mode Only) */}
        {!compact && (
          <div className="absolute top-3 right-3 flex items-center gap-2 z-10">
            {/* View Angle Switcher: Front vs Side Profile */}
            <button
              onClick={() => setViewAngle(viewAngle === 'front' ? 'side' : 'front')}
              className="px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 bg-black/60 hover:bg-black/80 text-white/90 border border-white/15 backdrop-blur-md cursor-pointer shadow-md"
              title="Toggle Front View vs Side Profile"
            >
              <Compass size={12} className="text-cyan-400" />
              <span>{viewAngle === 'front' ? 'Side Profile' : 'Front View'}</span>
            </button>

            {/* Form Guides Toggle */}
            <button
              onClick={() => setShowFormGuides(!showFormGuides)}
              className={`px-2.5 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-1.5 border backdrop-blur-md cursor-pointer shadow-md ${
                showFormGuides
                  ? 'bg-sky-500/20 text-sky-400 border-sky-500/40'
                  : 'bg-black/60 text-white/50 border-white/10'
              }`}
              title="Toggle Form Alignment Guidelines"
            >
              <Eye size={12} />
              <span>Form Guides</span>
            </button>

            {/* Target Muscle Activation Glow Toggle */}
            <button
              onClick={() => setHighlightMuscles(!highlightMuscles)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-extrabold uppercase tracking-wider transition-all flex items-center gap-1.5 border backdrop-blur-md cursor-pointer shadow-md ${
                highlightMuscles
                  ? 'bg-emerald-500/20 text-emerald-400 border-emerald-500/50 shadow-emerald-500/20'
                  : 'bg-black/60 text-white/50 border-white/10'
              }`}
              title="Toggle Target Muscle Activation Glow"
            >
              <Zap size={12} className={highlightMuscles ? 'fill-emerald-400' : ''} />
              <span>{targetMuscle ? `${targetMuscle.toUpperCase()} GLOW` : 'MUSCLE GLOW'}</span>
            </button>
          </div>
        )}

        {/* Center Pause/Play overlay when Paused */}
        {!compact && !isPlaying && (
          <div
            onClick={togglePlay}
            className="absolute inset-0 bg-black/40 backdrop-blur-[2px] flex items-center justify-center cursor-pointer group"
          >
            <div className="w-14 h-14 rounded-full bg-emerald-500 text-[#090D16] flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
              <Play size={24} className="ml-1 fill-current" />
            </div>
          </div>
        )}
      </div>

      {/* 1-Minute Video Scrubber & Playback HUD (Full Mode Only) */}
      {!compact && (
        <div className="bg-[#292524]/95 border-t border-white/10 px-4 py-3 flex flex-col gap-2.5">
          {/* Row 1: Interactive 1-Minute Scrubber Bar */}
          <div className="flex items-center gap-3">
            <div
              ref={progressBarRef}
              onClick={handleSeek}
              onMouseMove={handleMouseMoveBar}
              onMouseLeave={() => setHoverTime(null)}
              className="relative flex-1 h-2 hover:h-3 bg-white/15 rounded-full overflow-hidden cursor-pointer transition-all group/scrub"
              title="Seek through 1-minute animated video"
            >
              <div
                className="h-full bg-gradient-to-r from-emerald-500 via-teal-400 to-cyan-400 rounded-full transition-all duration-75 relative"
                style={{ width: `${Math.min(100, (currentTimeSec / totalDuration) * 100)}%` }}
              >
                <div className="absolute right-0 top-1/2 -translate-y-1/2 w-3 h-3 bg-white rounded-full shadow-md scale-0 group-hover/scrub:scale-100 transition-transform" />
              </div>

              {hoverTime !== null && (
                <div
                  className="absolute bottom-4 -translate-x-1/2 bg-black/80 text-white text-[9px] font-mono px-1.5 py-0.5 rounded border border-white/20 pointer-events-none"
                  style={{ left: `${(hoverTime / totalDuration) * 100}%` }}
                >
                  {formatTime(hoverTime)}
                </div>
              )}
            </div>

            {/* 1-Minute Counter */}
            <div className="flex items-center gap-1 shrink-0 font-mono text-xs">
              <span className="font-bold text-white">{formatTime(currentTimeSec)}</span>
              <span className="text-white/40">/</span>
              <span className="text-white/70 font-bold">{formatTime(totalDuration)}</span>
              <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20 ml-1">
                1-MIN
              </span>
            </div>
          </div>

          {/* Row 2: Media Controls & Phase Indicator */}
          <div className="flex items-center justify-between gap-3 text-xs text-white/80 flex-wrap">
            <div className="flex items-center gap-1.5">
              <button
                onClick={togglePlay}
                className="p-1.5 rounded-lg bg-emerald-500 text-black hover:bg-emerald-400 transition-colors cursor-pointer"
                title={isPlaying ? 'Pause' : 'Play'}
              >
                {isPlaying ? <Pause size={15} /> : <Play size={15} className="fill-current" />}
              </button>

              <button
                onClick={() => handleSkip(-10)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Rewind 10 Seconds"
              >
                <Rewind size={14} />
              </button>

              <button
                onClick={() => handleSkip(10)}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/80 hover:text-white transition-colors cursor-pointer"
                title="Forward 10 Seconds"
              >
                <FastForward size={14} />
              </button>

              <button
                onClick={handleRestart}
                className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white/70 hover:text-white transition-colors cursor-pointer"
                title="Restart 1-Minute Animation"
              >
                <RotateCcw size={14} />
              </button>

              <span className="text-[11px] font-mono text-emerald-400 font-bold ml-1.5 bg-black/30 px-2 py-0.5 rounded border border-white/10">
                Rep #{repsSimulated}
              </span>
            </div>

            {/* Current Form Phase Pill */}
            <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-black/40 border border-white/10 text-[11px] font-semibold text-white/90">
              <Activity size={12} className="text-teal-400" />
              <span>{currentPhase}</span>
            </div>

            {/* Speed Selector */}
            <div className="flex items-center gap-1 bg-black/40 p-1 rounded-lg border border-white/10">
              {[0.5, 1.0, 1.5].map(s => (
                <button
                  key={s}
                  onClick={() => setSpeed(s)}
                  className={`px-2 py-0.5 rounded text-[10px] font-extrabold transition-colors cursor-pointer ${
                    speed === s
                      ? 'bg-emerald-500 text-[#090D16]'
                      : 'text-white/60 hover:text-white'
                  }`}
                >
                  {s}x
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default ExerciseAnimationEngine;
