import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';

export const CustomerDietScreen: React.FC = () => {
  const meals = [
    { id: '1', title: 'Breakfast', time: '08:30 AM', calories: '450 kcal', items: '4 Boiled Eggs, Oats with Almond Milk, Banana' },
    { id: '2', title: 'Lunch', time: '01:30 PM', calories: '650 kcal', items: 'Grilled Chicken Breast, Brown Rice, Mixed Greens' },
    { id: '3', title: 'Pre-Workout Snack', time: '05:00 PM', calories: '250 kcal', items: 'Whey Protein Shake with 1 Apple' },
    { id: '4', title: 'Dinner', time: '08:30 PM', calories: '520 kcal', items: 'Paneer Tikka, Quinoa Salad, Steamed Broccoli' },
  ];

  return (
    <ScrollView style={styles.container} contentContainerStyle={styles.content}>
      {/* Daily Macro Target */}
      <View style={styles.macroCard}>
        <View style={styles.macroTop}>
          <Text style={styles.macroLabel}>Daily Nutrition Target</Text>
          <Text style={styles.macroVal}>1,870 / 2,400 kcal</Text>
        </View>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: '78%' }]} />
        </View>

        <View style={styles.macroSplit}>
          <View style={styles.macroBox}>
            <Text style={styles.macroBoxLabel}>Protein</Text>
            <Text style={[styles.macroBoxVal, { color: COLORS.primary }]}>142g / 160g</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroBoxLabel}>Carbs</Text>
            <Text style={[styles.macroBoxVal, { color: COLORS.amber }]}>195g / 250g</Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroBoxLabel}>Fats</Text>
            <Text style={[styles.macroBoxVal, { color: COLORS.sky }]}>48g / 65g</Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Logged Meals</Text>
        <TouchableOpacity>
          <Text style={styles.logMealText}>+ Add Meal</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.list}>
        {meals.map((m) => (
          <View key={m.id} style={styles.mealCard}>
            <View style={styles.mealTop}>
              <View>
                <Text style={styles.mealTitle}>{m.title}</Text>
                <Text style={styles.mealTime}>{m.time}</Text>
              </View>
              <View style={styles.calBadge}>
                <Text style={styles.calText}>{m.calories}</Text>
              </View>
            </View>
            <Text style={styles.mealItems}>{m.items}</Text>
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 32 },
  macroCard: {
    backgroundColor: COLORS.darkBg,
    borderRadius: 20,
    padding: 18,
    marginBottom: 20,
  },
  macroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  macroLabel: { color: COLORS.textMuted, fontSize: 11, fontWeight: '600' },
  macroVal: { color: COLORS.primary, fontSize: 13, fontWeight: '800' },
  bar: {
    height: 8,
    backgroundColor: COLORS.darkCard,
    borderRadius: 4,
    marginVertical: 12,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 4 },
  macroSplit: { flexDirection: 'row', gap: 8, marginTop: 4 },
  macroBox: { flex: 1, backgroundColor: COLORS.darkCard, padding: 10, borderRadius: 12, alignItems: 'center' },
  macroBoxLabel: { color: COLORS.textMuted, fontSize: 10, fontWeight: '600' },
  macroBoxVal: { fontSize: 11, fontWeight: '800', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  logMealText: { fontSize: 12, fontWeight: '700', color: COLORS.primary },
  list: { gap: 10 },
  mealCard: {
    backgroundColor: COLORS.white,
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  mealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8 },
  mealTitle: { fontSize: 13, fontWeight: '700', color: COLORS.textDark },
  mealTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  calBadge: { backgroundColor: COLORS.primaryLight, paddingHorizontal: 8, paddingVertical: 2, borderRadius: 8 },
  calText: { fontSize: 10, fontWeight: '700', color: COLORS.primaryDark },
  mealItems: { fontSize: 11, color: COLORS.textMedium, lineHeight: 16 },
});

