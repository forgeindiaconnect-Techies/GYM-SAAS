import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';
import { CustomerTrainersScreen } from './CustomerTrainersScreen';
import { CustomerTrainerPlanScreen } from './CustomerTrainerPlanScreen';
import { CustomerWorkoutsScreen } from './CustomerWorkoutsScreen';

export const CustomerTrainingScreen: React.FC<{ initialSubTab?: string }> = ({ initialSubTab = 'training' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'training' | 'trainer_plan' | 'workout_plan'>(
    initialSubTab === 'trainer_plan' ? 'trainer_plan' : initialSubTab === 'workout_plan' ? 'workout_plan' : 'training'
  );

  React.useEffect(() => {
    if (initialSubTab === 'trainer_plan' || initialSubTab === 'workout_plan' || initialSubTab === 'training') {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <View style={styles.container}>
      {/* Sub Navigation Bar: Training | Trainer's Plan | My Workout Plan */}
      <View style={styles.subTabBar}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'training' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('training')}
          activeOpacity={0.7}
        >
          <Text style={[styles.subTabText, activeSubTab === 'training' && styles.subTabTextActive]}>
            Training
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'trainer_plan' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('trainer_plan')}
          activeOpacity={0.7}
        >
          <Text style={[styles.subTabText, activeSubTab === 'trainer_plan' && styles.subTabTextActive]}>
            Trainer’s Plan
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'workout_plan' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('workout_plan')}
          activeOpacity={0.7}
        >
          <Text style={[styles.subTabText, activeSubTab === 'workout_plan' && styles.subTabTextActive]}>
            My Workout Plan
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen View */}
      <View style={styles.content}>
        {activeSubTab === 'training' && <CustomerTrainersScreen />}
        {activeSubTab === 'trainer_plan' && <CustomerTrainerPlanScreen />}
        {activeSubTab === 'workout_plan' && <CustomerWorkoutsScreen />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 6,
  },
  subTabBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 12,
    alignItems: 'center',
    backgroundColor: COLORS.background,
    borderWidth: 1,
    borderColor: 'transparent',
  },
  subTabBtnActive: {
    backgroundColor: COLORS.primaryLight,
    borderColor: COLORS.primaryBorder,
  },
  subTabText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  subTabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  content: { flex: 1 },
});

