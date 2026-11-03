import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { COLORS } from '../../constants/theme';
import { CustomerProgressTrackingScreen } from './CustomerProgressTrackingScreen';
import { CustomerAttendanceScreen } from './CustomerAttendanceScreen';

export const CustomerProgressScreen: React.FC<{ initialSubTab?: string }> = ({ initialSubTab = 'tracking' }) => {
  const [activeSubTab, setActiveSubTab] = useState<'tracking' | 'attendance'>(
    initialSubTab === 'attendance' ? 'attendance' : 'tracking'
  );

  return (
    <View style={styles.container}>
      {/* Sub Navigation Bar: Progress Tracking | Attendance */}
      <View style={styles.subTabBar}>
        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'tracking' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('tracking')}
          activeOpacity={0.7}
        >
          <Text style={[styles.subTabText, activeSubTab === 'tracking' && styles.subTabTextActive]}>
            Progress Tracking
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.subTabBtn, activeSubTab === 'attendance' && styles.subTabBtnActive]}
          onPress={() => setActiveSubTab('attendance')}
          activeOpacity={0.7}
        >
          <Text style={[styles.subTabText, activeSubTab === 'attendance' && styles.subTabTextActive]}>
            Attendance
          </Text>
        </TouchableOpacity>
      </View>

      {/* Screen View */}
      <View style={styles.content}>
        {activeSubTab === 'tracking' ? (
          <CustomerProgressTrackingScreen />
        ) : (
          <CustomerAttendanceScreen />
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  subTabBar: {
    flexDirection: 'row',
    backgroundColor: COLORS.white,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.cardBorder,
    gap: 8,
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
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textMedium,
  },
  subTabTextActive: {
    color: COLORS.primaryDark,
    fontWeight: '800',
  },
  content: { flex: 1 },
});

