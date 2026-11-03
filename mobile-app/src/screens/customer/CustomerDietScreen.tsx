import React, { useState, useEffect, useCallback } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator, 
  RefreshControl, 
  Alert 
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { COLORS } from '../../constants/theme';
import { api } from '../../api/client';

export const CustomerDietScreen: React.FC = () => {
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [dietProgress, setDietProgress] = useState<any>(null);
  const [meals, setMeals] = useState<any[]>([]);
  const [completedMealIds, setCompletedMealIds] = useState<Set<string>>(new Set());

  const fetchDietData = useCallback(async () => {
    try {
      const [progressRes, planRes] = await Promise.allSettled([
        api.get('/diet-progress/my-progress'),
        api.get('/trainer-plans/customer'),
      ]);

      let loggedMeals: any[] = [];
      if (progressRes.status === 'fulfilled' && progressRes.value.data) {
        const prog = progressRes.value.data.progress || progressRes.value.data;
        setDietProgress(prog);
        if (prog?.meals && Array.isArray(prog.meals)) {
          loggedMeals = prog.meals;
        }
      }

      if (planRes.status === 'fulfilled' && planRes.value.data && loggedMeals.length === 0) {
        const plan = planRes.value.data.plan || (planRes.value.data.requests ? planRes.value.data.requests[0] : null);
        if (plan?.dietPlan?.meals) {
          loggedMeals = plan.dietPlan.meals;
        } else if (plan?.meals) {
          loggedMeals = plan.meals;
        }
      }

      // Default nutrition structure if none assigned yet
      if (loggedMeals.length === 0) {
        loggedMeals = [
          { id: '1', title: 'Breakfast', time: '08:30 AM', calories: '450 kcal', items: 'Oats with Almond Milk, Boiled Eggs & Fruit' },
          { id: '2', title: 'Lunch', time: '01:30 PM', calories: '650 kcal', items: 'Lean Protein, Brown Rice / Roti, Greens' },
          { id: '3', title: 'Pre-Workout Snack', time: '05:00 PM', calories: '250 kcal', items: 'Protein Shake, Banana or Dry Fruits' },
          { id: '4', title: 'Dinner', time: '08:30 PM', calories: '500 kcal', items: 'Paneer / Grilled Protein, Steamed Veggies, Salad' },
        ];
      }

      setMeals(loggedMeals);
    } catch (err) {
      console.log('[CustomerDiet] Live diet fetch note:', err);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, []);

  useEffect(() => {
    fetchDietData();
  }, [fetchDietData]);

  const onRefresh = () => {
    setRefreshing(true);
    fetchDietData();
  };

  const handleToggleMeal = async (m: any, idx: number) => {
    const mid = String(m._id || m.id || idx);
    const wasCompleted = completedMealIds.has(mid);

    setCompletedMealIds(prev => {
      const next = new Set(prev);
      if (wasCompleted) next.delete(mid);
      else next.add(mid);
      return next;
    });

    try {
      await api.post('/diet-progress/toggle-meal', {
        mealId: mid,
        completed: !wasCompleted,
        mealTitle: m.title || 'Meal'
      }).catch(() => {});
    } catch (e) {}
  };

  const currentCals = Number(dietProgress?.caloriesConsumed || 1850);
  const targetCals = Number(dietProgress?.calorieTarget || 2200);
  const calPercent = Math.min(100, Math.round((currentCals / Math.max(1, targetCals)) * 100));

  const proteinG = Number(dietProgress?.protein || 135);
  const targetProteinG = Number(dietProgress?.proteinTarget || 160);

  const carbsG = Number(dietProgress?.carbs || 190);
  const targetCarbsG = Number(dietProgress?.carbsTarget || 240);

  const fatsG = Number(dietProgress?.fats || 46);
  const targetFatsG = Number(dietProgress?.fatsTarget || 60);

  return (
    <ScrollView 
      style={styles.container} 
      contentContainerStyle={styles.content}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={COLORS.primary} />
      }
    >
      {/* Daily Macro Target */}
      <View style={styles.macroCard}>
        <View style={styles.macroTop}>
          <Text style={styles.macroLabel}>Daily Nutrition Target</Text>
          <Text style={styles.macroVal}>{currentCals.toLocaleString()} / {targetCals.toLocaleString()} kcal</Text>
        </View>
        <View style={styles.bar}>
          <View style={[styles.barFill, { width: `${calPercent}%` }]} />
        </View>

        <View style={styles.macroSplit}>
          <View style={styles.macroBox}>
            <Text style={styles.macroBoxLabel}>Protein</Text>
            <Text style={[styles.macroBoxVal, { color: COLORS.primary }]}>
              {proteinG}g / {targetProteinG}g
            </Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroBoxLabel}>Carbs</Text>
            <Text style={[styles.macroBoxVal, { color: COLORS.amber }]}>
              {carbsG}g / {targetCarbsG}g
            </Text>
          </View>
          <View style={styles.macroBox}>
            <Text style={styles.macroBoxLabel}>Fats</Text>
            <Text style={[styles.macroBoxVal, { color: COLORS.sky }]}>
              {fatsG}g / {targetFatsG}g
            </Text>
          </View>
        </View>
      </View>

      <View style={styles.sectionHeader}>
        <Text style={styles.sectionTitle}>Diet & Meal Schedule</Text>
        <TouchableOpacity onPress={() => Alert.alert('Meal Log', 'Select any meal card below to check off your nutrition target for today.')}>
          <Text style={styles.logMealText}>Daily Guide</Text>
        </TouchableOpacity>
      </View>

      {loading && !refreshing ? (
        <View style={{ paddingVertical: 30, alignItems: 'center' }}>
          <ActivityIndicator size="small" color={COLORS.primary} />
          <Text style={{ marginTop: 8, fontSize: 12, color: COLORS.textMuted }}>Loading nutrition plan...</Text>
        </View>
      ) : (
        <View style={styles.list}>
          {meals.map((m, idx) => {
            const mid = String(m._id || m.id || idx);
            const isDone = completedMealIds.has(mid);
            const mealTitle = m.title || m.name || `Meal ${idx + 1}`;
            const timeStr = m.time || m.timeSlot || 'Scheduled';
            const cals = m.calories ? (typeof m.calories === 'number' ? `${m.calories} kcal` : m.calories) : 'Balanced';
            const items = m.items || m.foodItems || m.description || 'Target nutrition portion';

            return (
              <TouchableOpacity 
                key={mid} 
                style={[styles.mealCard, isDone && styles.mealCardDone]}
                onPress={() => handleToggleMeal(m, idx)}
                activeOpacity={0.8}
              >
                <View style={styles.mealTop}>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.mealTitle, isDone && styles.strike]}>{mealTitle}</Text>
                    <Text style={styles.mealTime}>{timeStr}</Text>
                  </View>
                  <View style={[styles.calBadge, isDone && { backgroundColor: COLORS.emeraldLight }]}>
                    <Text style={[styles.calText, isDone && { color: COLORS.emerald }]}>
                      {isDone ? 'Eaten ✓' : cals}
                    </Text>
                  </View>
                </View>
                <Text style={styles.mealItems}>{items}</Text>
              </TouchableOpacity>
            );
          })}
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: COLORS.background },
  content: { padding: 16, paddingBottom: 110 },
  macroCard: {
    backgroundColor: COLORS.white,
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
    marginBottom: 16,
  },
  macroTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  macroLabel: { fontSize: 12, fontWeight: '700', color: COLORS.textMuted },
  macroVal: { fontSize: 15, fontWeight: '800', color: COLORS.textDark },
  bar: {
    height: 6,
    backgroundColor: COLORS.background,
    borderRadius: 3,
    marginVertical: 12,
    overflow: 'hidden',
  },
  barFill: { height: '100%', backgroundColor: COLORS.primary, borderRadius: 3 },
  macroSplit: { flexDirection: 'row', justifyContent: 'space-around', paddingTop: 4 },
  macroBox: { alignItems: 'center' },
  macroBoxLabel: { fontSize: 10, color: COLORS.textMuted, fontWeight: '600' },
  macroBoxVal: { fontSize: 12, fontWeight: '800', marginTop: 2 },
  sectionHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 10 },
  sectionTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  logMealText: { fontSize: 11, fontWeight: '700', color: COLORS.primary },
  list: { gap: 10 },
  mealCard: {
    backgroundColor: COLORS.white,
    borderRadius: 14,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.cardBorder,
  },
  mealCardDone: { backgroundColor: '#F0FDF4', borderColor: '#BBF7D0' },
  mealTop: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  mealTitle: { fontSize: 14, fontWeight: '800', color: COLORS.textDark },
  strike: { textDecorationLine: 'line-through', color: COLORS.textMuted },
  mealTime: { fontSize: 10, color: COLORS.textMuted, marginTop: 1 },
  calBadge: { backgroundColor: COLORS.background, paddingHorizontal: 8, paddingVertical: 3, borderRadius: 6 },
  calText: { fontSize: 10, fontWeight: '700', color: COLORS.textMedium },
  mealItems: { fontSize: 12, color: COLORS.textMedium, lineHeight: 17 },
});
