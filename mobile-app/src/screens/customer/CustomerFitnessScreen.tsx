import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { CustomerAIFitnessScreen } from './CustomerAIFitnessScreen';
import { CustomerWorkoutsScreen } from './CustomerWorkoutsScreen';
import { CustomerDietScreen } from './CustomerDietScreen';
import { CustomerProgressTrackingScreen } from './CustomerProgressTrackingScreen';
import { CustomerAttendanceScreen } from './CustomerAttendanceScreen';

export const CustomerFitnessScreen: React.FC<{ initialSubTab?: string }> = ({ initialSubTab = 'ai' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'ai' | 'workout' | 'diet' | 'progress' | 'attendance'>(
    initialSubTab === 'workout' ? 'workout' : initialSubTab === 'diet' ? 'diet' : initialSubTab === 'attendance' ? 'attendance' : initialSubTab === 'progress' ? 'progress' : 'ai'
  );

  useEffect(() => {
    if (initialSubTab === 'ai' || initialSubTab === 'workout' || initialSubTab === 'diet' || initialSubTab === 'attendance' || initialSubTab === 'progress') {
      setActiveSubTab(initialSubTab);
    }
  }, [initialSubTab]);

  return (
    <View style={styles.container}>
      {/* 5 Fitness Subtabs: AI Assistant | Workout Plan | Diet Plan | Progress Tracking | Attendance */}
      <View style={styles.subTabBarContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.tabsScrollContent}>
          <TouchableOpacity
            style={[styles.subTabBtn, activeSubTab === 'ai' && styles.subTabBtnActive]}
            onPress={() => setActiveSubTab('ai')}
            activeOpacity={0.7}
          >
            <Ionicons name="sparkles" size={14} color={activeSubTab === 'ai' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, activeSubTab === 'ai' && styles.subTabTextActive]}>
              AI Coach
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeSubTab === 'workout' && styles.subTabBtnActive]}
            onPress={() => setActiveSubTab('workout')}
            activeOpacity={0.7}
          >
            <Ionicons name="barbell" size={14} color={activeSubTab === 'workout' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, activeSubTab === 'workout' && styles.subTabTextActive]}>
              Workout
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeSubTab === 'diet' && styles.subTabBtnActive]}
            onPress={() => setActiveSubTab('diet')}
            activeOpacity={0.7}
          >
            <Ionicons name="nutrition" size={14} color={activeSubTab === 'diet' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, activeSubTab === 'diet' && styles.subTabTextActive]}>
              Diet Plan
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeSubTab === 'progress' && styles.subTabBtnActive]}
            onPress={() => setActiveSubTab('progress')}
            activeOpacity={0.7}
          >
            <Ionicons name="trending-up" size={14} color={activeSubTab === 'progress' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, activeSubTab === 'progress' && styles.subTabTextActive]}>
              Progress
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.subTabBtn, activeSubTab === 'attendance' && styles.subTabBtnActive]}
            onPress={() => setActiveSubTab('attendance')}
            activeOpacity={0.7}
          >
            <Ionicons name="calendar" size={14} color={activeSubTab === 'attendance' ? '#FFFFFF' : '#64748B'} />
            <Text style={[styles.subTabText, activeSubTab === 'attendance' && styles.subTabTextActive]}>
              Attendance
            </Text>
          </TouchableOpacity>
        </ScrollView>
      </View>

      <View style={styles.body}>
        {activeSubTab === 'ai' && <CustomerAIFitnessScreen />}
        {activeSubTab === 'workout' && <CustomerWorkoutsScreen />}
        {activeSubTab === 'diet' && <CustomerDietScreen />}
        {activeSubTab === 'progress' && <CustomerProgressTrackingScreen />}
        {activeSubTab === 'attendance' && <CustomerAttendanceScreen />}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  subTabBarContainer: {
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
    paddingVertical: 10,
  },
  tabsScrollContent: {
    paddingHorizontal: 14,
    gap: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  subTabBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F1F5F9',
  },
  subTabBtnActive: {
    backgroundColor: '#EA580C',
  },
  subTabText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#64748B',
  },
  subTabTextActive: {
    color: '#FFFFFF',
  },
  body: {
    flex: 1,
  },
});

