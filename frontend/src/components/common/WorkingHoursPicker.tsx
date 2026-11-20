import React, { useState, useEffect, useMemo, useRef } from 'react';
import { Clock, Sun, Sunset, Moon, Sparkles, CheckCircle2, AlertCircle } from 'lucide-react';

export interface StructuredShift {
  shift: 'Morning' | 'Evening' | 'Night' | 'Flexible' | 'Custom';
  startTime: string;
  endTime: string;
}

interface WorkingHoursPickerProps {
  value?: string;
  onChange: (formattedValue: string, structured?: StructuredShift) => void;
  error?: string;
  disabled?: boolean;
}

// Generate time options at 30-minute intervals in 12-hour AM/PM format
export const GENERATE_TIME_OPTIONS = (): string[] => {
  const options: string[] = [];
  for (let h = 0; h < 24; h++) {
    for (let m = 0; m < 60; m += 30) {
      const period = h < 12 ? 'AM' : 'PM';
      const displayH = h === 0 ? 12 : h > 12 ? h - 12 : h;
      const formattedH = String(displayH).padStart(2, '0');
      const formattedM = String(m).padStart(2, '0');
      options.push(`${formattedH}:${formattedM} ${period}`);
    }
  }
  return options;
};

export const TIME_OPTIONS = GENERATE_TIME_OPTIONS();

// Shift presets
export const PRESETS = [
  { id: 'Morning', label: 'Morning', icon: Sun, start: '06:00 AM', end: '02:00 PM', desc: '06:00 AM - 02:00 PM' },
  { id: 'Evening', label: 'Evening', icon: Sunset, start: '02:00 PM', end: '10:00 PM', desc: '02:00 PM - 10:00 PM' },
  { id: 'Night', label: 'Night', icon: Moon, start: '10:00 PM', end: '06:00 AM', desc: '10:00 PM - 06:00 AM' },
  { id: 'Flexible', label: 'Flexible', icon: Sparkles, start: '', end: '', desc: 'Open / Any Time' },
  { id: 'Custom', label: 'Custom', icon: Clock, start: '09:00 AM', end: '05:00 PM', desc: 'Select Hours' }
] as const;

// Convert "hh:mm AM/PM" to minutes from midnight (0..1439)
export const timeToMinutes = (timeStr: string): number | null => {
  if (!timeStr) return null;
  const match = timeStr.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return null;
  let hours = parseInt(match[1], 10);
  const minutes = parseInt(match[2], 10);
  const period = match[3].toUpperCase();
  if (period === 'PM' && hours < 12) hours += 12;
  if (period === 'AM' && hours === 12) hours = 0;
  return hours * 60 + minutes;
};

// Calculate shift duration and validity
export const calculateShiftDuration = (
  start: string,
  end: string
): { durationText: string; isValid: boolean; error?: string } => {
  if (!start || !end) {
    return { durationText: '', isValid: false, error: 'Please select both start time and end time' };
  }
  const startMins = timeToMinutes(start);
  const endMins = timeToMinutes(end);
  if (startMins === null || endMins === null) {
    return { durationText: '', isValid: false, error: 'Invalid time format' };
  }
  if (startMins === endMins) {
    return { durationText: '', isValid: false, error: 'Start and end time cannot be identical' };
  }

  let diff = endMins - startMins;
  if (diff < 0) {
    // Crosses midnight (e.g. Night shift: 10:00 PM to 06:00 AM)
    diff += 24 * 60;
  }

  const hours = Math.floor(diff / 60);
  const mins = diff % 60;
  const parts: string[] = [];
  if (hours > 0) parts.push(`${hours} hr${hours > 1 ? 's' : ''}`);
  if (mins > 0) parts.push(`${mins} min${mins > 1 ? 's' : ''}`);

  return { durationText: parts.join(' ') || '0 hrs', isValid: true };
};

// Normalize any time string like "6:00 AM" or "6:00am" to "06:00 AM"
const normalizeTimeStr = (str: string): string => {
  const match = str.trim().match(/^(\d{1,2}):(\d{2})\s*(AM|PM)$/i);
  if (!match) return str.trim();
  const h = String(parseInt(match[1], 10)).padStart(2, '0');
  const m = match[2];
  const p = match[3].toUpperCase();
  return `${h}:${m} ${p}`;
};

// Parse an existing workingHours string into structured shift, start, and end
export const parseWorkingHoursString = (
  raw?: string
): { shift: 'Morning' | 'Evening' | 'Night' | 'Flexible' | 'Custom'; startTime: string; endTime: string } => {
  if (!raw || !raw.trim()) {
    return { shift: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM' };
  }
  const trimmed = raw.trim();
  if (/^flexible$/i.test(trimmed)) {
    return { shift: 'Flexible', startTime: '', endTime: '' };
  }

  let detectedShift: 'Morning' | 'Evening' | 'Night' | 'Flexible' | 'Custom' = 'Custom';
  if (/^morning/i.test(trimmed)) detectedShift = 'Morning';
  else if (/^evening/i.test(trimmed)) detectedShift = 'Evening';
  else if (/^night/i.test(trimmed)) detectedShift = 'Night';

  const timeMatches = trimmed.match(/(\d{1,2}:\d{2}\s*(?:AM|PM))/gi);
  if (timeMatches && timeMatches.length >= 2) {
    return {
      shift: detectedShift,
      startTime: normalizeTimeStr(timeMatches[0]),
      endTime: normalizeTimeStr(timeMatches[1])
    };
  }

  if (detectedShift === 'Morning') return { shift: 'Morning', startTime: '06:00 AM', endTime: '02:00 PM' };
  if (detectedShift === 'Evening') return { shift: 'Evening', startTime: '02:00 PM', endTime: '10:00 PM' };
  if (detectedShift === 'Night') return { shift: 'Night', startTime: '10:00 PM', endTime: '06:00 AM' };

  return { shift: 'Custom', startTime: '09:00 AM', endTime: '05:00 PM' };
};

export const formatWorkingHoursString = (
  shift: 'Morning' | 'Evening' | 'Night' | 'Flexible' | 'Custom',
  startTime: string,
  endTime: string
): string => {
  if (shift === 'Flexible') return 'Flexible';
  if (!startTime || !endTime) return '';
  if (shift === 'Custom') return `${startTime} - ${endTime}`;
  return `${shift} (${startTime} - ${endTime})`;
};

const WorkingHoursPicker: React.FC<WorkingHoursPickerProps> = ({
  value,
  onChange,
  error,
  disabled = false
}) => {
  const initial = useMemo(() => parseWorkingHoursString(value), [value]);

  const [selectedShift, setSelectedShift] = useState<'Morning' | 'Evening' | 'Night' | 'Flexible' | 'Custom'>(
    initial.shift
  );
  const [startTime, setStartTime] = useState<string>(initial.startTime);
  const [endTime, setEndTime] = useState<string>(initial.endTime);
  const [customTouched, setCustomTouched] = useState(false);

  // Keep internal state in sync if parent resets value externally
  const prevValueRef = useRef(value);
  useEffect(() => {
    if (value !== prevValueRef.current) {
      prevValueRef.current = value;
      const parsed = parseWorkingHoursString(value);
      setSelectedShift(parsed.shift);
      setStartTime(parsed.startTime);
      setEndTime(parsed.endTime);
    }
  }, [value]);

  const durationResult = useMemo(() => {
    if (selectedShift === 'Flexible') {
      return { durationText: 'Open / Flexible Hours', isValid: true };
    }
    return calculateShiftDuration(startTime, endTime);
  }, [selectedShift, startTime, endTime]);

  const emitChange = (
    nextShift: 'Morning' | 'Evening' | 'Night' | 'Flexible' | 'Custom',
    nextStart: string,
    nextEnd: string
  ) => {
    const formatted = formatWorkingHoursString(nextShift, nextStart, nextEnd);
    onChange(formatted, {
      shift: nextShift,
      startTime: nextShift === 'Flexible' ? '' : nextStart,
      endTime: nextShift === 'Flexible' ? '' : nextEnd
    });
  };

  const handleShiftSelect = (shiftId: 'Morning' | 'Evening' | 'Night' | 'Flexible' | 'Custom') => {
    if (disabled) return;
    setSelectedShift(shiftId);
    setCustomTouched(false);

    if (shiftId === 'Flexible') {
      setStartTime('');
      setEndTime('');
      emitChange('Flexible', '', '');
      return;
    }

    const preset = PRESETS.find(p => p.id === shiftId);
    let nextStart = startTime;
    let nextEnd = endTime;

    if (preset && preset.start && preset.end) {
      nextStart = preset.start;
      nextEnd = preset.end;
      setStartTime(nextStart);
      setEndTime(nextEnd);
    } else if (shiftId === 'Custom') {
      if (!nextStart) nextStart = '09:00 AM';
      if (!nextEnd) nextEnd = '05:00 PM';
      setStartTime(nextStart);
      setEndTime(nextEnd);
    }

    emitChange(shiftId, nextStart, nextEnd);
  };

  const handleStartTimeChange = (newStart: string) => {
    if (disabled) return;
    setStartTime(newStart);
    setCustomTouched(true);

    // If times are altered away from preset, designate as Custom or keep shift
    let nextShift = selectedShift;
    if (selectedShift === 'Flexible') {
      nextShift = 'Custom';
      setSelectedShift('Custom');
    }

    emitChange(nextShift, newStart, endTime);
  };

  const handleEndTimeChange = (newEnd: string) => {
    if (disabled) return;
    setEndTime(newEnd);
    setCustomTouched(true);

    let nextShift = selectedShift;
    if (selectedShift === 'Flexible') {
      nextShift = 'Custom';
      setSelectedShift('Custom');
    }

    emitChange(nextShift, startTime, newEnd);
  };

  return (
    <div className="space-y-2">
      {/* 1. Predefined Shift Option Pills */}
      <div className="flex flex-wrap gap-1.5">
        {PRESETS.map(preset => {
          const Icon = preset.icon;
          const isSelected = selectedShift === preset.id;
          return (
            <button
              type="button"
              key={preset.id}
              disabled={disabled}
              onClick={() => handleShiftSelect(preset.id)}
              className={`px-2.5 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-all duration-150 cursor-pointer ${
                isSelected
                  ? 'bg-gradient-to-r from-[#EA580C] to-[#C2410C] text-white shadow-xs scale-100 ring-2 ring-orange-400/30'
                  : 'bg-[#F8FAFC] hover:bg-[#FFF7ED] text-[#475569] hover:text-[#C2410C] border border-[#E2E8F0]'
              } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              title={preset.desc}
            >
              <Icon size={12} className={isSelected ? 'text-white' : 'text-[#EA580C]'} />
              <span>{preset.label}</span>
            </button>
          );
        })}
      </div>

      {/* 2. Structured Time Selectors or Flexible Banner */}
      {selectedShift === 'Flexible' ? (
        <div className="p-2.5 bg-[#FFF7ED] border border-[#FFEDD5] rounded-xl flex items-center justify-between text-xs text-[#EA580C]">
          <div className="flex items-center gap-2">
            <Sparkles size={14} className="shrink-0 text-[#EA580C]" />
            <span className="font-semibold">Flexible Shift:</span>
            <span className="text-[#9A3412]">Trainers can set agreed session hours or attend open gym shifts.</span>
          </div>
          <span className="px-2 py-0.5 bg-white/80 rounded-md text-[10px] font-bold uppercase tracking-wider text-[#C2410C] border border-[#FDBA74]">
            Any Hours
          </span>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="grid grid-cols-2 gap-2">
            {/* Start Time Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1 flex items-center gap-1">
                <Clock size={11} className="text-[#EA580C]" /> Start Time
              </label>
              <div className="relative">
                <select
                  value={startTime}
                  disabled={disabled}
                  onChange={e => handleStartTimeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#FDBA74] focus:bg-white transition-colors cursor-pointer appearance-none"
                >
                  <option value="" disabled>Select start time</option>
                  {TIME_OPTIONS.map(timeStr => (
                    <option key={`start-${timeStr}`} value={timeStr}>
                      {timeStr}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#64748B]">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>

            {/* End Time Selector */}
            <div>
              <label className="block text-[11px] font-semibold text-[#64748B] mb-1 flex items-center gap-1">
                <Clock size={11} className="text-[#EA580C]" /> End Time
              </label>
              <div className="relative">
                <select
                  value={endTime}
                  disabled={disabled}
                  onChange={e => handleEndTimeChange(e.target.value)}
                  className="w-full px-3 py-2 bg-[#F8FAFC] border border-[#E2E8F0] rounded-xl text-xs font-semibold text-[#111827] focus:outline-none focus:border-[#FDBA74] focus:bg-white transition-colors cursor-pointer appearance-none"
                >
                  <option value="" disabled>Select end time</option>
                  {TIME_OPTIONS.map(timeStr => (
                    <option key={`end-${timeStr}`} value={timeStr}>
                      {timeStr}
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-2 text-[#64748B]">
                  <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 20 20">
                    <path d="M5.293 7.293a1 1 0 011.414 0L10 10.586l3.293-3.293a1 1 0 111.414 1.414l-4 4a1 1 0 01-1.414 0l-4-4a1 1 0 010-1.414z" />
                  </svg>
                </div>
              </div>
            </div>
          </div>

          {/* Validation & Duration Feedback */}
          <div className="flex items-center justify-between pt-0.5 px-0.5 text-[11px]">
            {durationResult.isValid ? (
              <span className="text-emerald-600 font-semibold flex items-center gap-1">
                <CheckCircle2 size={12} className="text-emerald-500" />
                Shift Duration: <strong className="text-emerald-700">{durationResult.durationText}</strong>
              </span>
            ) : (
              <span className="text-rose-600 font-semibold flex items-center gap-1">
                <AlertCircle size={12} className="text-rose-500" />
                {durationResult.error || 'Please choose a valid time range'}
              </span>
            )}

            <span className="text-[#64748B] font-medium text-[10px]">
              {selectedShift !== 'Custom' ? (
                <span className="px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 font-bold uppercase tracking-wider text-[9px]">
                  {selectedShift} Shift
                </span>
              ) : (
                <span className="px-1.5 py-0.5 rounded bg-orange-100 text-[#C2410C] font-bold uppercase tracking-wider text-[9px]">
                  Custom Shift
                </span>
              )}
            </span>
          </div>
        </div>
      )}

      {/* External Form Error if provided */}
      {error && (
        <p className="text-[#B91C1C] text-[11px] font-medium flex items-center gap-1 mt-1">
          <AlertCircle size={11} /> {error}
        </p>
      )}
    </div>
  );
};

export default WorkingHoursPicker;
