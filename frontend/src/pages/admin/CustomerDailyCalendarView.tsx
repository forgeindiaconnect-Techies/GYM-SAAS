import React, { useState, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  ChevronLeft,
  ChevronRight,
  Dumbbell,
  Utensils,
  CalendarCheck,
  CheckCircle2,
  Clock,
  User,
  Flame,
  TrendingUp,
  Info
} from 'lucide-react';

interface CustomerDailyCalendarViewProps {
  customers: any[];
  selectedCustomerId?: string | null;
  onSelectCustomer?: (customer: any) => void;
  trainers?: any[];
  onClose?: () => void;
}

// Helper to format date as YYYY-MM-DD in local time
const formatLocalDateKey = (d: Date): string => {
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

// Helper to reliably extract YYYY-MM-DD from various date representations
const extractDateKey = (val: string | Date | undefined | null): string => {
  if (!val) return '';
  if (typeof val === 'string') {
    const match = val.match(/^(\d{4})-(\d{2})-(\d{2})/);
    if (match) {
      if (val.length === 10) return val;
      const d = new Date(val);
      if (!isNaN(d.getTime())) return formatLocalDateKey(d);
      return `${match[1]}-${match[2]}-${match[3]}`;
    }
  }
  if (val instanceof Date && !isNaN(val.getTime())) {
    return formatLocalDateKey(val);
  }
  return '';
};

export default function CustomerDailyCalendarView({
  customers,
  selectedCustomerId,
  onSelectCustomer,
  trainers = [],
  onClose
}: CustomerDailyCalendarViewProps) {
  // Current active customer ID
  const [activeCustomerId, setActiveCustomerId] = useState<string>(() => {
    if (selectedCustomerId) return selectedCustomerId;
    if (customers && customers.length > 0) {
      return customers[0].customerId || customers[0]._id;
    }
    return '';
  });

  // Keep activeCustomerId synchronized when selectedCustomerId prop changes
  React.useEffect(() => {
    if (selectedCustomerId) {
      setActiveCustomerId(selectedCustomerId);
    }
  }, [selectedCustomerId]);

  // Selected date for day inspection (defaults to today)
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  // Current calendar viewing month
  const [viewMonth, setViewMonth] = useState<Date>(() => new Date());

  // Active section tab in the day detail view: 'all' | 'workout' | 'diet' | 'attendance'
  const [daySectionTab, setDaySectionTab] = useState<'all' | 'workout' | 'diet' | 'attendance'>('all');

  // Find active customer object
  const activeCustomer = useMemo(() => {
    if (!customers || customers.length === 0) return null;
    return (
      customers.find(
        (c) => String(c.customerId || c._id) === String(activeCustomerId)
      ) || customers[0]
    );
  }, [customers, activeCustomerId]);

  const selectedDateKey = useMemo(() => formatLocalDateKey(selectedDate), [selectedDate]);

  // Day of the week for the selected date
  const selectedWeekdayName = useMemo(() => {
    return selectedDate.toLocaleDateString('en-US', { weekday: 'long' });
  }, [selectedDate]);

  // Calendar month days calculation
  const calendarGridDays = useMemo(() => {
    const year = viewMonth.getFullYear();
    const month = viewMonth.getMonth();

    const firstDayIndex = new Date(year, month, 1).getDay(); // 0 = Sunday
    const daysInCurrentMonth = new Date(year, month + 1, 0).getDate();
    const daysInPrevMonth = new Date(year, month, 0).getDate();

    const days: Array<{
      date: Date;
      dateKey: string;
      dayNumber: number;
      isCurrentMonth: boolean;
      isToday: boolean;
      isSelected: boolean;
    }> = [];

    const todayKey = formatLocalDateKey(new Date());

    // Previous month padding
    for (let i = firstDayIndex - 1; i >= 0; i--) {
      const d = new Date(year, month - 1, daysInPrevMonth - i);
      const dKey = formatLocalDateKey(d);
      days.push({
        date: d,
        dateKey: dKey,
        dayNumber: d.getDate(),
        isCurrentMonth: false,
        isToday: dKey === todayKey,
        isSelected: dKey === selectedDateKey
      });
    }

    // Current month days
    for (let i = 1; i <= daysInCurrentMonth; i++) {
      const d = new Date(year, month, i);
      const dKey = formatLocalDateKey(d);
      days.push({
        date: d,
        dateKey: dKey,
        dayNumber: i,
        isCurrentMonth: true,
        isToday: dKey === todayKey,
        isSelected: dKey === selectedDateKey
      });
    }

    // Next month padding to complete 35 or 42 cells grid
    const remainingCells = (7 - (days.length % 7)) % 7;
    for (let i = 1; i <= remainingCells; i++) {
      const d = new Date(year, month + 1, i);
      const dKey = formatLocalDateKey(d);
      days.push({
        date: d,
        dateKey: dKey,
        dayNumber: i,
        isCurrentMonth: false,
        isToday: dKey === todayKey,
        isSelected: dKey === selectedDateKey
      });
    }

    return days;
  }, [viewMonth, selectedDateKey]);

  // Index of events for the active customer for fast lookup across dates (ONLY completed items)
  const customerEventsMap = useMemo(() => {
    if (!activeCustomer) return new Map<string, { hasWorkout: boolean; hasDiet: boolean; hasAttendance: boolean }>();

    const map = new Map<string, { hasWorkout: boolean; hasDiet: boolean; hasAttendance: boolean }>();

    const ensureEntry = (key: string) => {
      if (!map.has(key)) {
        map.set(key, { hasWorkout: false, hasDiet: false, hasAttendance: false });
      }
      return map.get(key)!;
    };

    // 1. Attendance visits
    const attendanceLogs = activeCustomer.attendanceSummary?.attendanceLogs || [];
    for (const log of attendanceLogs) {
      const dStr = extractDateKey(log.date || log.checkInTime);
      if (dStr) {
        ensureEntry(dStr).hasAttendance = true;
      }
    }

    // 2. Completed Workout logs ONLY
    const workoutsList =
      activeCustomer.workoutSummary?.completedWorkoutsList ||
      (activeCustomer.workoutSummary?.allWorkoutsList || []).filter((w: any) => w.status === 'Completed');
    for (const w of workoutsList) {
      if (w.completedAt && (w.status === 'Completed' || (w.completedSets && w.completedSets > 0))) {
        const dStr = extractDateKey(w.completedAt);
        if (dStr) {
          ensureEntry(dStr).hasWorkout = true;
        }
      }
    }

    // 3. Completed Diet meal check-ins ONLY
    const mealsList =
      activeCustomer.dietSummary?.completedMealsList ||
      (activeCustomer.dietSummary?.allMealsList || []).filter((m: any) => m.completed !== false);
    for (const m of mealsList) {
      if (m.completedAt && m.completed !== false) {
        const dStr = extractDateKey(m.completedAt);
        if (dStr) {
          ensureEntry(dStr).hasDiet = true;
        }
      }
    }

    return map;
  }, [activeCustomer]);

  // Calculate day-specific details for the selected date (ONLY COMPLETED ITEMS, OTHERWISE EMPTY)
  const selectedDayData = useMemo(() => {
    if (!activeCustomer) {
      return {
        attendance: null,
        completedWorkouts: [],
        completedMeals: []
      };
    }

    // 1. Attendance lookup from DB only
    const attendanceLogs = activeCustomer.attendanceSummary?.attendanceLogs || [];
    const attendance = attendanceLogs.find((log: any) => {
      const dStr = extractDateKey(log.date || log.checkInTime);
      return dStr === selectedDateKey;
    }) || null;

    // 2. Completed Workouts on this date ONLY
    const allWorkouts =
      activeCustomer.workoutSummary?.completedWorkoutsList ||
      activeCustomer.workoutSummary?.allWorkoutsList ||
      [];
    const completedWorkouts = allWorkouts.filter((w: any) => {
      if (!w.completedAt) return false;
      if (w.status && w.status !== 'Completed') return false;
      const dStr = extractDateKey(w.completedAt);
      return dStr === selectedDateKey;
    });

    // 3. Completed Meals on this date ONLY
    const allMeals =
      activeCustomer.dietSummary?.completedMealsList ||
      activeCustomer.dietSummary?.allMealsList ||
      [];
    const completedMeals = allMeals.filter((m: any) => {
      if (!m.completedAt) return false;
      if (m.completed === false) return false;
      const dStr = extractDateKey(m.completedAt);
      return dStr === selectedDateKey;
    });

    return {
      attendance,
      completedWorkouts,
      completedMeals
    };
  }, [activeCustomer, selectedDateKey]);

  // Navigate day by -1 or +1
  const changeSelectedDay = (offsetDays: number) => {
    setSelectedDate((prev) => {
      const next = new Date(prev);
      next.setDate(next.getDate() + offsetDays);
      return next;
    });
    // Sync view month if stepping into a different month
    setViewMonth((prev) => {
      const nextDate = new Date(selectedDate);
      nextDate.setDate(nextDate.getDate() + offsetDays);
      if (nextDate.getMonth() !== prev.getMonth() || nextDate.getFullYear() !== prev.getFullYear()) {
        return new Date(nextDate.getFullYear(), nextDate.getMonth(), 1);
      }
      return prev;
    });
  };

  // Navigate calendar month
  const changeViewMonth = (offsetMonths: number) => {
    setViewMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + offsetMonths, 1));
  };

  // Jump to today
  const jumpToToday = () => {
    const today = new Date();
    setSelectedDate(today);
    setViewMonth(new Date(today.getFullYear(), today.getMonth(), 1));
  };

  if (!activeCustomer) {
    return (
      <div className="p-8 text-center bg-[#FFFFFF] rounded-2xl border border-[#E7DADD]">
        <User className="w-10 h-10 mx-auto text-[#57534E] mb-2" />
        <p className="text-[#57534E] font-medium">No customers found to display in the calendar view.</p>
      </div>
    );
  }

  const hasAnyActivityToday =
    Boolean(selectedDayData.attendance) ||
    selectedDayData.completedWorkouts.length > 0 ||
    selectedDayData.completedMeals.length > 0;

  return (
    <div className="space-y-6">
      {/* ======================================================== */}
      {/* TOP BAR: CUSTOMER SELECTOR & CUSTOMER OVERVIEW CARD      */}
      {/* ======================================================== */}
      <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-sm">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          {/* Member Picker Dropdown */}
          <div className="w-full lg:w-96 space-y-1.5">
            <label className="text-xs font-bold text-[#57534E] uppercase tracking-wider flex items-center gap-1.5">
              <User className="w-3.5 h-3.5 text-[#B76E79]" />
              Select Customer for Daily Calendar
            </label>
            <div className="relative">
              <select
                value={activeCustomerId}
                onChange={(e) => {
                  setActiveCustomerId(e.target.value);
                  const found = customers.find(
                    (c) => String(c.customerId || c._id) === String(e.target.value)
                  );
                  if (found && onSelectCustomer) onSelectCustomer(found);
                }}
                className="w-full px-3.5 py-2.5 rounded-xl text-sm font-semibold border border-[#E7DADD] bg-[#F3E8E8] text-[#292524] focus:outline-none focus:border-[#B76E79] focus:ring-1 focus:ring-[#B76E79] cursor-pointer"
              >
                {customers.map((c) => {
                  const id = c.customerId || c._id;
                  return (
                    <option key={id} value={id} className="bg-[#F3E8E8] text-[#292524]">
                      {c.name} — ({c.membership?.planName || 'Member'} • {c.membership?.status || 'Active'})
                    </option>
                  );
                })}
              </select>
            </div>
          </div>

          {/* Active Member Quick Stats Badge Strip */}
          <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
            <div className="px-3.5 py-2 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#F3E8E8] text-[#B76E79] font-bold flex items-center justify-center text-xs border border-[#E7DADD]">
                {activeCustomer.name?.charAt(0) || 'C'}
              </div>
              <div>
                <div className="text-xs font-bold text-[#292524]">{activeCustomer.name}</div>
                <div className="text-[11px] text-[#57534E]">
                  {activeCustomer.membership?.status} • {activeCustomer.membership?.planName}
                </div>
              </div>
            </div>

            <div className="px-3 py-2 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] text-xs">
              <span className="text-[#57534E] block text-[10px] font-semibold">ATTENDANCE</span>
              <span className="font-bold text-[#B45309] flex items-center gap-1">
                <Flame className="w-3 h-3 text-[#B45309]" />
                {activeCustomer.attendanceSummary?.attendanceStreak || 0}d streak ({activeCustomer.attendanceSummary?.totalVerifiedVisits || 0} visits)
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] text-xs">
              <span className="text-[#57534E] block text-[10px] font-semibold">WORKOUT COMPLETION</span>
              <span className="font-bold text-[#B76E79] flex items-center gap-1">
                <TrendingUp className="w-3 h-3 text-[#B76E79]" />
                {activeCustomer.workoutSummary?.completionPercentage !== null
                  ? `${activeCustomer.workoutSummary.completionPercentage}%`
                  : 'N/A'}
              </span>
            </div>

            <div className="px-3 py-2 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] text-xs">
              <span className="text-[#57534E] block text-[10px] font-semibold">DIET PLAN</span>
              <span className="font-bold text-[#15803D] flex items-center gap-1">
                <Utensils className="w-3 h-3 text-[#15803D]" />
                {activeCustomer.dietSummary?.totalMealCheckins || 0} logged
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ======================================================== */}
      {/* MAIN TWO-COLUMN LAYOUT: CALENDAR + PER-DAY DETAIL PANEL  */}
      {/* ======================================================== */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* ====================================================== */}
        {/* LEFT COLUMN: INTERACTIVE MONTH CALENDAR (5 COLS)       */}
        {/* ====================================================== */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-sm">
            {/* Calendar Month Header & Controls */}
            <div className="flex items-center justify-between pb-4 border-b border-[#E7DADD]">
              <div>
                <h3 className="font-bold text-base text-[#292524]">
                  {viewMonth.toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </h3>
                <p className="text-[11px] text-[#57534E]">Click any date to see completed plans</p>
              </div>

              <div className="flex items-center gap-1.5">
                <button
                  onClick={jumpToToday}
                  className="px-2.5 py-1 text-xs font-bold rounded-lg border border-[#E7DADD] bg-[#F3E8E8] hover:bg-[#F3E8E8] text-[#292524] cursor-pointer transition"
                  title="Jump to today"
                >
                  Today
                </button>
                <button
                  onClick={() => changeViewMonth(-1)}
                  className="p-1.5 rounded-lg border border-[#E7DADD] bg-[#F3E8E8] hover:bg-[#F3E8E8] text-[#57534E] hover:text-[#292524] cursor-pointer transition"
                  title="Previous month"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
                <button
                  onClick={() => changeViewMonth(1)}
                  className="p-1.5 rounded-lg border border-[#E7DADD] bg-[#F3E8E8] hover:bg-[#F3E8E8] text-[#57534E] hover:text-[#292524] cursor-pointer transition"
                  title="Next month"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Weekday Labels */}
            <div className="grid grid-cols-7 gap-1 pt-3 pb-2 text-center text-[11px] font-bold text-[#57534E] uppercase tracking-wider">
              <span>Sun</span>
              <span>Mon</span>
              <span>Tue</span>
              <span>Wed</span>
              <span>Thu</span>
              <span>Fri</span>
              <span>Sat</span>
            </div>

            {/* Calendar Day Grid */}
            <div className="grid grid-cols-7 gap-1.5">
              {calendarGridDays.map((cell, idx) => {
                const events = customerEventsMap.get(cell.dateKey);
                const isSelected = cell.isSelected;
                const isToday = cell.isToday;

                return (
                  <button
                    key={`${cell.dateKey}-${idx}`}
                    onClick={() => {
                      setSelectedDate(cell.date);
                      if (!cell.isCurrentMonth) {
                        setViewMonth(new Date(cell.date.getFullYear(), cell.date.getMonth(), 1));
                      }
                    }}
                    className={`min-h-[58px] p-1 rounded-xl flex flex-col justify-between items-center transition-all cursor-pointer relative border ${
                      isSelected
                        ? 'bg-[#B76E79] text-white shadow-lg border-[#B76E79] ring-2 ring-[#B76E79]/50'
                        : cell.isCurrentMonth
                        ? 'bg-[#F3E8E8] hover:bg-[#F3E8E8] text-[#292524] border-[#E7DADD]'
                        : 'bg-[#F3E8E8]/40 text-[#57534E]/40 border-transparent hover:bg-[#F3E8E8]'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full px-1 pt-0.5">
                      <span
                        className={`text-xs font-semibold ${
                          isSelected
                            ? 'text-white font-bold'
                            : isToday
                            ? 'text-[#B76E79] font-black'
                            : cell.isCurrentMonth
                            ? 'text-[#292524]'
                            : 'text-[#57534E]/40'
                        }`}
                      >
                        {cell.dayNumber}
                      </span>
                      {isToday && (
                        <span
                          className={`text-[8px] font-extrabold uppercase px-1 py-0.2 rounded ${
                            isSelected ? 'bg-[#FFFFFF]/20 text-white' : 'bg-[#B76E79] text-white'
                          }`}
                        >
                          Today
                        </span>
                      )}
                    </div>

                    {/* Indicator dots for Completed Workout, Diet, and Attendance */}
                    <div className="flex items-center gap-1 pb-1">
                      {events?.hasWorkout && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-[#FFFFFF] ring-1 ring-white/50' : 'bg-[#B76E79]'
                          }`}
                          title="Workout Completed"
                        />
                      )}
                      {events?.hasDiet && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-[#B76E79] ring-1 ring-white/50' : 'bg-[#15803D]'
                          }`}
                          title="Diet Logged"
                        />
                      )}
                      {events?.hasAttendance && (
                        <span
                          className={`w-1.5 h-1.5 rounded-full ${
                            isSelected ? 'bg-amber-300 ring-1 ring-white/50' : 'bg-[#B45309]'
                          }`}
                          title="Gym Visit Logged"
                        />
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Calendar Legend */}
            <div className="pt-4 mt-3 border-t border-[#E7DADD] flex flex-wrap items-center justify-between gap-2 text-[11px] text-[#57534E]">
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B76E79]" />
                <span>Workout Done</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#15803D]" />
                <span>Diet Logged</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full bg-[#B45309]" />
                <span>Gym Visit</span>
              </div>
            </div>
          </div>

          {/* Quick Date Stepper Card */}
          <div className="bg-[#FFFFFF] p-4 rounded-2xl border border-[#E7DADD] shadow-sm flex items-center justify-between text-xs">
            <button
              onClick={() => changeSelectedDay(-1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E7DADD] bg-[#F3E8E8] hover:bg-[#F3E8E8] text-[#292524] font-semibold cursor-pointer transition"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
              Previous Day
            </button>

            <div className="text-center font-bold text-[#292524]">
              {selectedDate.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
            </div>

            <button
              onClick={() => changeSelectedDay(1)}
              className="flex items-center gap-1 px-3 py-1.5 rounded-xl border border-[#E7DADD] bg-[#F3E8E8] hover:bg-[#F3E8E8] text-[#292524] font-semibold cursor-pointer transition"
            >
              Next Day
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* ====================================================== */}
        {/* RIGHT COLUMN: PER-DAY COMPLETED DETAILS ONLY (7 COLS)  */}
        {/* ====================================================== */}
        <div className="lg:col-span-7 space-y-4">
          {/* Header Card for Selected Date */}
          <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-sm space-y-3">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-[#E7DADD]">
              <div>
                <span className="text-xs font-bold text-[#B76E79] uppercase tracking-wider block">
                  Daily Performance Inspection
                </span>
                <h3 className="font-extrabold text-lg text-[#292524] flex items-center gap-2">
                  <CalendarIcon className="w-5 h-5 text-[#B76E79]" />
                  {selectedDate.toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </h3>
              </div>

              {/* Status Pill for the Day */}
              <div
                className={`px-3 py-1 rounded-xl text-xs font-bold border ${
                  hasAnyActivityToday
                    ? 'bg-[#B76E79]/15 text-[#15803D] border-[#E7DADD]/30'
                    : 'bg-[#F3E8E8] text-[#57534E] border-[#E7DADD]'
                }`}
              >
                {hasAnyActivityToday ? 'Completed Activity Found' : 'No Completed Activity (Empty)'}
              </div>
            </div>

            {/* Quick 3 Status Badges for the Day */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
              {/* 1. Attendance Pill */}
              <div
                className={`p-3 rounded-xl border text-xs ${
                  selectedDayData.attendance
                    ? 'bg-[#F3E8E8] border-[#B45309]/30 text-[#B45309]'
                    : 'bg-[#F3E8E8] border-[#E7DADD] text-[#57534E]'
                }`}
              >
                <div className="text-[10px] font-bold text-[#57534E] uppercase">GYM ATTENDANCE</div>
                <div className="font-bold mt-0.5 flex items-center gap-1.5 text-[#292524]">
                  <CalendarCheck
                    className={`w-3.5 h-3.5 ${
                      selectedDayData.attendance ? 'text-[#B45309]' : 'text-[#57534E]'
                    }`}
                  />
                  {selectedDayData.attendance ? (
                    <span className="text-[#B45309]">
                      Visited ({selectedDayData.attendance.checkInTime || 'Checked in'})
                    </span>
                  ) : (
                    <span className="text-[#57534E]">Empty (No Visit)</span>
                  )}
                </div>
              </div>

              {/* 2. Workout Pill */}
              <div
                className={`p-3 rounded-xl border text-xs ${
                  selectedDayData.completedWorkouts.length > 0
                    ? 'bg-[#F3E8E8] border-[#B76E79]/40 text-[#B76E79]'
                    : 'bg-[#F3E8E8] border-[#E7DADD] text-[#57534E]'
                }`}
              >
                <div className="text-[10px] font-bold text-[#57534E] uppercase">WORKOUT LOGS</div>
                <div className="font-bold mt-0.5 flex items-center gap-1.5 text-[#292524]">
                  <Dumbbell
                    className={`w-3.5 h-3.5 ${
                      selectedDayData.completedWorkouts.length > 0 ? 'text-[#B76E79]' : 'text-[#57534E]'
                    }`}
                  />
                  {selectedDayData.completedWorkouts.length > 0 ? (
                    <span className="text-[#B76E79]">{selectedDayData.completedWorkouts.length} Completed</span>
                  ) : (
                    <span className="text-[#57534E]">Empty (0 Completed)</span>
                  )}
                </div>
              </div>

              {/* 3. Diet Pill */}
              <div
                className={`p-3 rounded-xl border text-xs ${
                  selectedDayData.completedMeals.length > 0
                    ? 'bg-[#F3E8E8] border-[#E7DADD]/30 text-[#15803D]'
                    : 'bg-[#F3E8E8] border-[#E7DADD] text-[#57534E]'
                }`}
              >
                <div className="text-[10px] font-bold text-[#57534E] uppercase">DIET & MEALS</div>
                <div className="font-bold mt-0.5 flex items-center gap-1.5 text-[#292524]">
                  <Utensils
                    className={`w-3.5 h-3.5 ${
                      selectedDayData.completedMeals.length > 0 ? 'text-[#15803D]' : 'text-[#57534E]'
                    }`}
                  />
                  {selectedDayData.completedMeals.length > 0 ? (
                    <span className="text-[#15803D]">{selectedDayData.completedMeals.length} Meals Logged</span>
                  ) : (
                    <span className="text-[#57534E]">Empty (0 Meals Logged)</span>
                  )}
                </div>
              </div>
            </div>

            {/* Filter Sub-Tabs for Section Focusing */}
            <div className="flex items-center gap-2 pt-2 border-t border-[#E7DADD]">
              <button
                onClick={() => setDaySectionTab('all')}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  daySectionTab === 'all'
                    ? 'bg-[#B76E79] text-white shadow-xs'
                    : 'bg-[#F3E8E8] text-[#57534E] hover:text-[#292524] border border-[#E7DADD]'
                }`}
              >
                All Details
              </button>
              <button
                onClick={() => setDaySectionTab('workout')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  daySectionTab === 'workout'
                    ? 'bg-[#B76E79] text-white shadow-xs'
                    : 'bg-[#F3E8E8] text-[#57534E] hover:text-[#292524] border border-[#E7DADD]'
                }`}
              >
                <Dumbbell className="w-3.5 h-3.5" />
                Workout Plan
              </button>
              <button
                onClick={() => setDaySectionTab('diet')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  daySectionTab === 'diet'
                    ? 'bg-[#B76E79] text-white shadow-xs'
                    : 'bg-[#F3E8E8] text-[#57534E] hover:text-[#292524] border border-[#E7DADD]'
                }`}
              >
                <Utensils className="w-3.5 h-3.5" />
                Diet Plan
              </button>
              <button
                onClick={() => setDaySectionTab('attendance')}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition cursor-pointer ${
                  daySectionTab === 'attendance'
                    ? 'bg-[#B76E79] text-white shadow-xs'
                    : 'bg-[#F3E8E8] text-[#57534E] hover:text-[#292524] border border-[#E7DADD]'
                }`}
              >
                <CalendarCheck className="w-3.5 h-3.5" />
                Attendance
              </button>
            </div>
          </div>

          {/* ==================================================== */}
          {/* 1. PER-DAY COMPLETED WORKOUT PLAN                    */}
          {/* ==================================================== */}
          {(daySectionTab === 'all' || daySectionTab === 'workout') && (
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E7DADD]">
                <h4 className="font-bold text-[#292524] flex items-center gap-2 text-sm">
                  <Dumbbell className="w-4 h-4 text-[#B76E79]" />
                  Workout Plan — {selectedWeekdayName} ({selectedDate.toLocaleDateString()})
                </h4>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    selectedDayData.completedWorkouts.length > 0
                      ? 'bg-[#B76E79]/15 text-[#15803D] border-[#E7DADD]/30'
                      : 'bg-[#F3E8E8] text-[#57534E] border-[#E7DADD]'
                  }`}
                >
                  {selectedDayData.completedWorkouts.length > 0
                    ? `${selectedDayData.completedWorkouts.length} Completed`
                    : 'Empty (0 Completed)'}
                </span>
              </div>

              {selectedDayData.completedWorkouts.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedDayData.completedWorkouts.map((w: any, idx: number) => (
                    <div
                      key={w._id || idx}
                      className="p-4 rounded-xl border border-[#E7DADD] bg-[#F3E8E8] hover:bg-[#F3E8E8] transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#292524] text-sm flex items-center gap-2">
                          <span>{w.exerciseName || 'Exercise Session'}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-[#F3E8E8] text-[#B76E79] font-semibold border border-[#E7DADD]">
                            {w.dayName || selectedWeekdayName}
                          </span>
                        </div>
                        <div className="text-[11px] text-[#57534E] mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>
                            Sets: <strong className="text-[#292524]">{w.completedSets || 0}/{w.totalSets || 3}</strong>
                          </span>
                          {w.completedRepetitions > 0 && (
                            <span>
                              Reps: <strong className="text-[#292524]">{w.completedRepetitions}</strong>
                            </span>
                          )}
                          {w.duration > 0 && (
                            <span>
                              Duration: <strong className="text-[#292524]">{Math.round(w.duration / 60)} min</strong>
                            </span>
                          )}
                          {w.completedAt && (
                            <span className="text-[#57534E]">
                              Time: <strong className="text-[#292524]">{new Date(w.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</strong>
                            </span>
                          )}
                        </div>
                        {w.notes && (
                          <p className="text-[11px] text-[#57534E] italic mt-1 bg-[#F3E8E8] px-2.5 py-1 rounded border border-[#E7DADD] inline-block">
                            {w.notes}
                          </p>
                        )}
                      </div>

                      <div className="flex items-center gap-2 sm:self-center">
                        <span className="px-3 py-1 rounded-full font-bold bg-[#B76E79]/15 text-[#15803D] border border-[#E7DADD]/30 text-xs inline-flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-[#15803D]" />
                          Completed
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-6 text-center rounded-xl bg-[#F3E8E8] border border-[#E7DADD] flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3E8E8] border border-[#E7DADD] flex items-center justify-center text-[#57534E] mb-3">
                    <Dumbbell className="w-6 h-6 text-[#57534E]" />
                  </div>
                  <h5 className="font-bold text-[#292524] text-sm">No Completed Workout</h5>
                  <p className="text-xs text-[#57534E] mt-1 max-w-sm">
                    No completed workout plan or exercise logs found for this date.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 2. PER-DAY COMPLETED DIET PLAN                       */}
          {/* ==================================================== */}
          {(daySectionTab === 'all' || daySectionTab === 'diet') && (
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E7DADD]">
                <h4 className="font-bold text-[#292524] flex items-center gap-2 text-sm">
                  <Utensils className="w-4 h-4 text-[#15803D]" />
                  Diet Plan — {selectedWeekdayName} ({selectedDate.toLocaleDateString()})
                </h4>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    selectedDayData.completedMeals.length > 0
                      ? 'bg-[#B76E79]/15 text-[#15803D] border-[#E7DADD]/30'
                      : 'bg-[#F3E8E8] text-[#57534E] border-[#E7DADD]'
                  }`}
                >
                  {selectedDayData.completedMeals.length > 0
                    ? `${selectedDayData.completedMeals.length} Meals Logged`
                    : 'Empty (0 Meals Logged)'}
                </span>
              </div>

              {selectedDayData.completedMeals.length > 0 ? (
                <div className="space-y-2.5">
                  {selectedDayData.completedMeals.map((m: any, idx: number) => (
                    <div
                      key={m._id || idx}
                      className="p-4 rounded-xl border border-[#E7DADD] bg-[#F3E8E8] hover:bg-[#F3E8E8] transition flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 text-xs"
                    >
                      <div>
                        <div className="font-bold text-[#292524] text-sm flex items-center gap-2">
                          <span>{m.mealType || `Meal #${idx + 1}`}</span>
                          <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#B76E79]/15 text-[#15803D] border border-[#E7DADD]/30 font-semibold inline-flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-[#15803D]" />
                            Completed
                          </span>
                        </div>
                        {m.items && m.items.length > 0 && (
                          <div className="flex flex-wrap gap-1.5 mt-2">
                            {m.items.map((it: string, i: number) => (
                              <span key={i} className="px-2.5 py-0.5 bg-[#F3E8E8] border border-[#E7DADD] rounded-md text-[11px] text-[#292524]">
                                {it}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>

                      <div className="text-left sm:text-right sm:self-center">
                        <div className="font-bold text-[#292524] text-xs">
                          {m.calories > 0 ? `${m.calories} kcal` : ''} {m.protein > 0 ? `• ${m.protein}g Protein` : ''}
                        </div>
                        <div className="text-[11px] text-[#57534E] mt-0.5">
                          {m.completedAt ? new Date(m.completedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Logged'}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="py-12 px-6 text-center rounded-xl bg-[#F3E8E8] border border-[#E7DADD] flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3E8E8] border border-[#E7DADD] flex items-center justify-center text-[#57534E] mb-3">
                    <Utensils className="w-6 h-6 text-[#57534E]" />
                  </div>
                  <h5 className="font-bold text-[#292524] text-sm">No Completed Diet Plan</h5>
                  <p className="text-xs text-[#57534E] mt-1 max-w-sm">
                    No completed meals or diet logs recorded on this date.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* ==================================================== */}
          {/* 3. VERIFIED ATTENDANCE RECORD FOR THIS DATE          */}
          {/* ==================================================== */}
          {(daySectionTab === 'all' || daySectionTab === 'attendance') && (
            <div className="bg-[#FFFFFF] p-5 rounded-2xl border border-[#E7DADD] shadow-sm space-y-4">
              <div className="flex justify-between items-center pb-3 border-b border-[#E7DADD]">
                <h4 className="font-bold text-[#292524] flex items-center gap-2 text-sm">
                  <CalendarCheck className="w-4 h-4 text-[#B45309]" />
                  Gym Attendance — {selectedWeekdayName} ({selectedDate.toLocaleDateString()})
                </h4>
                <span
                  className={`text-xs px-2.5 py-0.5 rounded-full font-bold border ${
                    selectedDayData.attendance
                      ? 'bg-amber-500/15 text-[#B45309] border-amber-500/30'
                      : 'bg-[#F3E8E8] text-[#57534E] border-[#E7DADD]'
                  }`}
                >
                  {selectedDayData.attendance ? 'Visited' : 'Not Attended'}
                </span>
              </div>

              {selectedDayData.attendance ? (
                <div className="p-4 rounded-xl bg-[#F3E8E8] border border-[#E7DADD] text-xs space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-[#B45309] text-sm flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#15803D]" />
                      Member Checked In
                    </span>
                    <span className="px-2.5 py-0.5 rounded-full font-bold bg-[#F3E8E8] text-[#B76E79] border border-[#E7DADD] text-[10px]">
                      {selectedDayData.attendance.status || 'Verified Present'}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-1 text-[11px]">
                    <div className="p-2.5 rounded-lg bg-[#F3E8E8] border border-[#E7DADD]">
                      <span className="text-[#57534E] block text-[10px] font-semibold uppercase">CHECK-IN / OUT</span>
                      <strong className="text-[#292524] text-xs mt-0.5 block">
                        {selectedDayData.attendance.checkInTime || '—'} {selectedDayData.attendance.checkOutTime && selectedDayData.attendance.checkOutTime !== '—' ? `to ${selectedDayData.attendance.checkOutTime}` : ''}
                      </strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F3E8E8] border border-[#E7DADD]">
                      <span className="text-[#57534E] block text-[10px] font-semibold uppercase">VISIT MODE</span>
                      <strong className="text-[#292524] text-xs mt-0.5 block">{selectedDayData.attendance.mode || 'In-Person Gym Visit'}</strong>
                    </div>
                    <div className="p-2.5 rounded-lg bg-[#F3E8E8] border border-[#E7DADD]">
                      <span className="text-[#57534E] block text-[10px] font-semibold uppercase">VERIFIED BY</span>
                      <strong className="text-[#292524] text-xs mt-0.5 block">{selectedDayData.attendance.trainerName || 'Gym Floor Admin'}</strong>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="py-12 px-6 text-center rounded-xl bg-[#F3E8E8] border border-[#E7DADD] flex flex-col items-center justify-center">
                  <div className="w-12 h-12 rounded-2xl bg-[#F3E8E8] border border-[#E7DADD] flex items-center justify-center text-[#57534E] mb-3">
                    <CalendarCheck className="w-6 h-6 text-[#57534E]" />
                  </div>
                  <h5 className="font-bold text-[#292524] text-sm">No Gym Attendance</h5>
                  <p className="text-xs text-[#57534E] mt-1 max-w-sm">
                    No attendance or check-in recorded for this member on this date.
                  </p>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
