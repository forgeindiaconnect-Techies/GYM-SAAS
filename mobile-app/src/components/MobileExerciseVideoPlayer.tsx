import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { StickFigureAnimation } from './StickFigureAnimation';

interface MobileExerciseVideoPlayerProps {
  exerciseName: string;
  category?: string;
  targetMuscle?: string;
  difficulty?: string;
  instructions?: string;
  coachTips?: string;
  duration?: number; // In seconds, default 60 (1-minute video demo)
}

export const MobileExerciseVideoPlayer: React.FC<MobileExerciseVideoPlayerProps> = ({
  exerciseName = 'Exercise',
  category = 'Strength',
  targetMuscle = 'Full Body',
  difficulty = 'Intermediate',
  instructions,
  coachTips,
  duration = 60,
}) => {
  const nameLower = (exerciseName || '').toLowerCase();
  const isSideDefault =
    nameLower.includes('squat') ||
    nameLower.includes('deadlift') ||
    nameLower.includes('rdl') ||
    nameLower.includes('push-up') ||
    nameLower.includes('pushup') ||
    nameLower.includes('bench') ||
    nameLower.includes('plank') ||
    nameLower.includes('lunge');

  const [isPlaying, setIsPlaying] = useState(true);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1.0);
  const [viewAngle, setViewAngle] = useState<'front' | 'side'>(isSideDefault ? 'side' : 'front');
  const [showFormGuides, setShowFormGuides] = useState(true);
  const [highlightMuscles, setHighlightMuscles] = useState(true);
  const [currentSeconds, setCurrentSeconds] = useState(0);
  const [currentRep, setCurrentRep] = useState(1);
  const [currentPhase, setCurrentPhase] = useState('Setup');

  useEffect(() => {
    setViewAngle(isSideDefault ? 'side' : 'front');
  }, [isSideDefault]);

  useEffect(() => {
    if (!isPlaying) return;
    const timer = setInterval(() => {
      setCurrentSeconds(prev => (prev >= duration ? 0 : prev + 1));
    }, 1000 / playbackSpeed);
    return () => clearInterval(timer);
  }, [isPlaying, playbackSpeed, duration]);

  const handleFrameStats = useCallback((stats: { rep: number; phase: string; elapsedSec: number }) => {
    setCurrentRep(stats.rep);
    setCurrentPhase(stats.phase);
  }, []);

  const handleRestart = () => {
    setCurrentSeconds(0);
    setCurrentRep(1);
    if (!isPlaying) setIsPlaying(true);
  };

  const handleSkip = (delta: number) => {
    setCurrentSeconds(prev => Math.max(0, Math.min(duration, prev + delta)));
  };

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const progressPercent = Math.min(100, (currentSeconds / duration) * 100);

  return (
    <View style={styles.playerContainer}>
      {/* Top Overlay Controls (Matching Web ExerciseAnimationEngine) */}
      <View style={styles.videoStage}>
        <View style={styles.topHudRow}>
          <View style={styles.hudStatusCard}>
            <Text style={styles.hudTimerText}>
              1-MIN AI FORM VIDEO · {formatTime(currentSeconds)} / {formatTime(duration)}
            </Text>
            <Text style={styles.hudPhaseText} numberOfLines={1}>
              {currentPhase}
            </Text>
          </View>

          <View style={styles.topToggleGroup}>
            <TouchableOpacity
              onPress={() => setViewAngle(v => (v === 'front' ? 'side' : 'front'))}
              style={styles.toggleChip}
              activeOpacity={0.8}
            >
              <Ionicons name="compass-outline" size={12} color="#EA580C" />
              <Text style={styles.toggleChipText}>{viewAngle === 'front' ? 'Side Profile' : 'Front View'}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <View style={styles.secondaryTogglesRow}>
          <TouchableOpacity
            onPress={() => setShowFormGuides(g => !g)}
            style={[styles.miniFilterChip, showFormGuides && styles.miniFilterChipSky]}
            activeOpacity={0.8}
          >
            <Ionicons name="eye-outline" size={11} color={showFormGuides ? '#0284C7' : '#64748B'} />
            <Text style={[styles.miniFilterText, showFormGuides && { color: '#0284C7' }]}>Form Guides</Text>
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setHighlightMuscles(m => !m)}
            style={[styles.miniFilterChip, highlightMuscles && styles.miniFilterChipGreen]}
            activeOpacity={0.8}
          >
            <Ionicons name="flash" size={11} color={highlightMuscles ? '#15803D' : '#64748B'} />
            <Text style={[styles.miniFilterText, highlightMuscles && { color: '#15803D' }]}>
              {targetMuscle ? `${targetMuscle.toUpperCase()} GLOW` : 'MUSCLE GLOW'}
            </Text>
          </TouchableOpacity>
        </View>

        {/* Center Biomechanical Canvas Stage */}
        <TouchableOpacity
          style={styles.centerStageArea}
          activeOpacity={0.9}
          onPress={() => setIsPlaying(p => !p)}
        >
          <StickFigureAnimation
            exerciseName={exerciseName}
            category={category}
            targetMuscle={targetMuscle}
            isDetail={true}
            isPlaying={isPlaying}
            speed={playbackSpeed}
            viewAngle={viewAngle}
            highlightMuscles={highlightMuscles}
            showFormGuides={showFormGuides}
            width={300}
            height={175}
            onFrameStats={handleFrameStats}
          />

          {!isPlaying && (
            <View style={styles.pausedOverlay}>
              <View style={styles.pausedPlayCircle}>
                <Ionicons name="play" size={24} color="#FFFFFF" style={{ marginLeft: 3 }} />
              </View>
            </View>
          )}
        </TouchableOpacity>

        {/* Scrubber & Controls Bar */}
        <View style={styles.controlsBar}>
          <View style={styles.timelineTrack}>
            <View style={[styles.timelineProgress, { width: `${progressPercent}%` }]} />
          </View>

          <View style={styles.controlsRow}>
            <TouchableOpacity onPress={() => setIsPlaying(p => !p)} style={styles.playPauseBtn} activeOpacity={0.85}>
              <Ionicons name={isPlaying ? 'pause' : 'play'} size={16} color="#FFFFFF" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSkip(-10)} style={styles.controlSmallBtn} activeOpacity={0.75}>
              <Ionicons name="play-back" size={13} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity onPress={() => handleSkip(10)} style={styles.controlSmallBtn} activeOpacity={0.75}>
              <Ionicons name="play-forward" size={13} color="#475569" />
            </TouchableOpacity>

            <TouchableOpacity onPress={handleRestart} style={styles.controlSmallBtn} activeOpacity={0.75}>
              <Ionicons name="refresh" size={14} color="#475569" />
            </TouchableOpacity>

            <View style={styles.repBadge}>
              <Text style={styles.repBadgeText}>Rep #{currentRep}</Text>
            </View>

            <View style={styles.speedSegmented}>
              {[0.5, 1.0, 1.5].map(s => (
                <TouchableOpacity
                  key={s}
                  style={[styles.speedSegBtn, playbackSpeed === s && styles.speedSegBtnActive]}
                  onPress={() => setPlaybackSpeed(s)}
                >
                  <Text style={[styles.speedSegText, playbackSpeed === s && styles.speedSegTextActive]}>
                    {s}x
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>
        </View>
      </View>

      {/* Form Technique & Coaching Cues */}
      {(instructions || coachTips) && (
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
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  playerContainer: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 4,
  },
  videoStage: {
    width: '100%',
    backgroundColor: '#FFFFFF',
    padding: 12,
    gap: 8,
  },
  topHudRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 8,
  },
  hudStatusCard: {
    flex: 1,
    backgroundColor: '#0F172A',
    borderRadius: 10,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  hudTimerText: {
    color: '#38BDF8',
    fontSize: 9,
    fontWeight: '800',
    fontFamily: 'monospace',
  },
  hudPhaseText: {
    color: '#F8FAFC',
    fontSize: 11,
    fontWeight: '800',
    marginTop: 1,
  },
  topToggleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  toggleChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#0F172A',
    paddingHorizontal: 9,
    paddingVertical: 6,
    borderRadius: 10,
  },
  toggleChipText: {
    color: '#F8FAFC',
    fontSize: 10,
    fontWeight: '800',
  },
  secondaryTogglesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    flexWrap: 'wrap',
  },
  miniFilterChip: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  miniFilterChipSky: {
    backgroundColor: '#F0F9FF',
    borderColor: '#BAE6FD',
  },
  miniFilterChipGreen: {
    backgroundColor: '#F0FDF4',
    borderColor: '#BBF7D0',
  },
  miniFilterText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#64748B',
  },
  centerStageArea: {
    width: '100%',
    minHeight: 175,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  pausedOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(15, 23, 42, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 12,
  },
  pausedPlayCircle: {
    width: 52,
    height: 52,
    borderRadius: 26,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlsBar: {
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
    paddingTop: 8,
    gap: 8,
  },
  timelineTrack: {
    width: '100%',
    height: 5,
    backgroundColor: '#E2E8F0',
    borderRadius: 3,
    overflow: 'hidden',
  },
  timelineProgress: {
    height: '100%',
    backgroundColor: '#EA580C',
    borderRadius: 3,
  },
  controlsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  playPauseBtn: {
    width: 32,
    height: 32,
    borderRadius: 10,
    backgroundColor: '#C2410C',
    alignItems: 'center',
    justifyContent: 'center',
  },
  controlSmallBtn: {
    width: 28,
    height: 28,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    justifyContent: 'center',
  },
  repBadge: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  repBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#15803D',
  },
  speedSegmented: {
    marginLeft: 'auto',
    flexDirection: 'row',
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    borderRadius: 8,
    padding: 2,
    gap: 2,
  },
  speedSegBtn: {
    paddingHorizontal: 6,
    paddingVertical: 3,
    borderRadius: 6,
  },
  speedSegBtnActive: {
    backgroundColor: '#C2410C',
  },
  speedSegText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#64748B',
  },
  speedSegTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  cuesContainer: {
    padding: 12,
    backgroundColor: '#F8FAFC',
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
    gap: 8,
  },
  cueBox: {
    backgroundColor: '#F0FDF4',
    borderWidth: 1,
    borderColor: '#BBF7D0',
    borderRadius: 12,
    padding: 10,
  },
  tipBox: {
    backgroundColor: '#FFF7ED',
    borderWidth: 1,
    borderColor: '#FFEDD5',
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
    color: '#15803D',
    letterSpacing: 0.4,
  },
  tipTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#EA580C',
    letterSpacing: 0.4,
  },
  cueBody: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
  tipBody: {
    fontSize: 11.5,
    color: '#334155',
    lineHeight: 16,
  },
});

export default MobileExerciseVideoPlayer;
