export type ActivityType = 'driving' | 'rest' | 'additional' | 'available';
export type TimeRange = 'day' | 'week' | 'biweek';

export interface TimeEntry {
  id: string;
  type: ActivityType;
  startTime: Date;
  endTime: Date | null;
  notes?: string;
  isManualEntry?: boolean;
  durationMinutes?: number; // For manual entries
}

export interface HolidayEntry {
  id: string;
  date: Date;
  description: string;
  isSixthDay: boolean;
}

// European regulations for driving and rest times (in minutes) - 2024 Update
export const EU_REGULATIONS_2024 = {
  driving: {
    daily: 9 * 60,       // 9 hours standard
    extendedDaily: 10 * 60, // 10 hours extended (max 2 times per week)
    weekly: 56 * 60,     // 56 hours weekly maximum
    biweekly: 90 * 60,   // 90 hours over 2 weeks
    continuous: 4.5 * 60   // 4.5 hours continuous driving before a break
  },
  rest: {
    daily: 12 * 60,      // 12 hours daily rest
    reducedDaily: 11 * 60, // 11 hours reduced daily rest
    weekly: 48 * 60,     // 48 hours weekly rest
    reducedWeekly: 24 * 60, // 24 hours reduced weekly rest (compensation required)
    break: 45,           // 45 minutes break after 4.5 hours driving
    splitBreak1: 15,     // 15 minutes for first part of split break
    splitBreak2: 30      // 30 minutes for second part of split break
  },
  available: {
    daily: 15 * 60,      // 15 hours daily availability limit (max 3 times per week)
    weekly: 60 * 60      // Soft limit for weekly availability
  },
  additional: {
    weekly: 40 * 60,     // 40 hours weekly maximum
    biweekly: 80 * 60    // 80 hours over 2 weeks
  }
};

// For backward compatibility, keep the SPAIN_REGULATIONS constant
export const SPAIN_REGULATIONS = EU_REGULATIONS_2024;

// Gets formatted time string from minutes
export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Format time in hours and minutes
export const formatTime = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours}h ${mins}m`;
};

// Format time with limit (for display in the app)
export const formatTimeWithLimit = (minutes: number, limitMinutes: number): string => {
  return `${formatTime(minutes)} / ${formatTime(limitMinutes)}`;
};

// Calculate elapsed time in minutes
export const calculateElapsedMinutes = (start: Date, end: Date = new Date()): number => {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
};

// Calculate remaining rest time in minutes - purely informative
export const calculateRemainingRest = (
  drivingTime: number,
  restTime: number,
  type: 'daily' | 'weekly' | 'break'
): number => {
  if (type === 'break') {
    // Calculate required break time after 4.5 hours of driving
    if (drivingTime >= EU_REGULATIONS_2024.driving.continuous) {
      return Math.max(0, EU_REGULATIONS_2024.rest.break - restTime);
    }
    return 0;
  }
  
  if (type === 'daily') {
    return Math.max(0, EU_REGULATIONS_2024.rest.daily - restTime);
  }
  
  if (type === 'weekly') {
    return Math.max(0, EU_REGULATIONS_2024.rest.weekly - restTime);
  }
  
  return 0;
};

// For informational purposes only - checks if driver should take a break
export const shouldTakeBreak = (drivingTime: number, lastRestTime: number): boolean => {
  return drivingTime >= EU_REGULATIONS_2024.driving.continuous && lastRestTime < EU_REGULATIONS_2024.rest.break;
};

// Get activity time from time entries for a specific timeframe
export const getActivityTime = (
  entries: TimeEntry[],
  activity: ActivityType,
  startDate: Date,
  endDate: Date = new Date()
): number => {
  return entries
    .filter(entry => entry.type === activity && new Date(entry.startTime) >= startDate && new Date(entry.startTime) <= endDate)
    .reduce((acc, entry) => {
      if (entry.isManualEntry && entry.durationMinutes) {
        return acc + entry.durationMinutes;
      } else {
        const entryEnd = entry.endTime || new Date();
        const minutes = calculateElapsedMinutes(new Date(entry.startTime), entryEnd);
        return acc + minutes;
      }
    }, 0);
};

// Get start date based on time range
export const getStartDateForRange = (range: TimeRange): Date => {
  const now = new Date();
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  
  switch (range) {
    case 'day':
      return today;
    case 'week': {
      const weekStart = new Date(today);
      weekStart.setDate(today.getDate() - today.getDay() + (today.getDay() === 0 ? -6 : 1)); // Monday as week start
      return weekStart;
    }
    case 'biweek': {
      const biweekStart = new Date(today);
      biweekStart.setDate(today.getDate() - 13); // 14 days ago
      return biweekStart;
    }
    default:
      return today;
  }
};

// Count days with extended driving time in the current week
export const countExtendedDrivingDays = (
  entries: TimeEntry[],
  todayDate: Date = new Date()
): number => {
  const weekStart = getStartDateForRange('week');
  
  // Group entries by day
  const dailyDrivingTimes: Record<string, number> = {};
  
  entries
    .filter(entry => entry.type === 'driving' && new Date(entry.startTime) >= weekStart && new Date(entry.startTime) <= todayDate)
    .forEach(entry => {
      const entryDate = new Date(entry.startTime);
      const dateString = entryDate.toISOString().split('T')[0];
      
      let minutes: number;
      if (entry.isManualEntry && entry.durationMinutes) {
        minutes = entry.durationMinutes;
      } else {
        const entryEnd = entry.endTime || new Date();
        minutes = calculateElapsedMinutes(entryDate, entryEnd);
      }
      
      dailyDrivingTimes[dateString] = (dailyDrivingTimes[dateString] || 0) + minutes;
    });
  
  // Count days with extended driving (> 9 hours)
  return Object.values(dailyDrivingTimes).filter(time => time > EU_REGULATIONS_2024.driving.daily).length;
};

// Count days with extended availability time in the current week
export const countExtendedAvailabilityDays = (
  entries: TimeEntry[],
  todayDate: Date = new Date()
): number => {
  const weekStart = getStartDateForRange('week');
  
  // Group entries by day
  const dailyAvailabilityTimes: Record<string, number> = {};
  
  entries
    .filter(entry => entry.type === 'available' && new Date(entry.startTime) >= weekStart && new Date(entry.startTime) <= todayDate)
    .forEach(entry => {
      const entryDate = new Date(entry.startTime);
      const dateString = entryDate.toISOString().split('T')[0];
      
      let minutes: number;
      if (entry.isManualEntry && entry.durationMinutes) {
        minutes = entry.durationMinutes;
      } else {
        const entryEnd = entry.endTime || new Date();
        minutes = calculateElapsedMinutes(entryDate, entryEnd);
      }
      
      dailyAvailabilityTimes[dateString] = (dailyAvailabilityTimes[dateString] || 0) + minutes;
    });
  
  // Count days with extended availability (> 15 hours)
  return Object.values(dailyAvailabilityTimes).filter(time => time > EU_REGULATIONS_2024.available.daily).length;
};

// Checks compliance with regulation limits - returns percentage of limit reached
export const checkCompliancePercentage = (
  activityTime: number,
  activityType: ActivityType,
  timeRange: TimeRange,
  extendedDrivingDays: number = 0,
  extendedAvailabilityDays: number = 0
): number => {
  let limit = 1; // Default to avoid division by zero
  
  switch (activityType) {
    case 'driving':
      if (timeRange === 'day') {
        // Check if we can use extended driving time (10h instead of 9h)
        limit = extendedDrivingDays < 2 
          ? EU_REGULATIONS_2024.driving.extendedDaily 
          : EU_REGULATIONS_2024.driving.daily;
      }
      else if (timeRange === 'week') limit = EU_REGULATIONS_2024.driving.weekly;
      else if (timeRange === 'biweek') limit = EU_REGULATIONS_2024.driving.biweekly;
      break;
    case 'rest':
      if (timeRange === 'day') limit = EU_REGULATIONS_2024.rest.daily;
      else if (timeRange === 'week') limit = EU_REGULATIONS_2024.rest.weekly;
      break;
    case 'additional':
      if (timeRange === 'week') limit = EU_REGULATIONS_2024.additional.weekly;
      else if (timeRange === 'biweek') limit = EU_REGULATIONS_2024.additional.biweekly;
      else limit = 480; // 8 hours as default for day
      break;
    case 'available':
      if (timeRange === 'day') {
        // Check if we can use extended availability time (15h)
        limit = extendedAvailabilityDays < 3 
          ? EU_REGULATIONS_2024.available.daily 
          : 12 * 60; // Default to 12h if already used 3 extended days
      }
      else if (timeRange === 'week') limit = EU_REGULATIONS_2024.available.weekly;
      break;
  }
  
  return Math.min(100, (activityTime / limit) * 100);
};

// Get compliance status
export const getComplianceStatus = (percentage: number): 'safe' | 'warning' | 'danger' => {
  if (percentage < 80) return 'safe';
  if (percentage < 95) return 'warning';
  return 'danger';
};

// For getting the EU regulation information in a human-readable format
export const getRegulationInfo = (type: 'driving' | 'rest' | 'additional' | 'available'): string[] => {
  switch (type) {
    case 'driving':
      return [
        '9 horas diarias (estándar)',
        '10 horas diarias (máximo 2 veces por semana)',
        '56 horas semanales máximo',
        '90 horas en dos semanas',
        '4.5 horas de conducción continua antes de descanso obligatorio'
      ];
    case 'rest':
      return [
        '12 horas de descanso diario normal',
        '11 horas de descanso diario reducido',
        '48 horas de descanso semanal normal',
        '24 horas de descanso semanal reducido (requiere compensación)',
        '45 minutos de pausa después de 4.5 horas de conducción',
        'Posibilidad de dividir la pausa de 45 minutos en dos (15 min + 30 min)'
      ];
    case 'additional':
      return [
        'El tiempo máximo de trabajo semanal: 40 horas',
        'Tiempo máximo de trabajo en dos semanas: 80 horas',
        'El trabajo nocturno no debe exceder las 10 horas en cada período de 24 horas'
      ];
    case 'available':
      return [
        'Tiempo máximo de disponibilidad diaria: 15 horas (máx 3 días por semana)',
        'Tiempo máximo de disponibilidad semanal: 60 horas',
        'No se considera tiempo de conducción ni de otros trabajos'
      ];
    default:
      return [];
  }
};

// Check if an activity entry exceeds legal limits
export const checkActivityExceedsLimits = (
  type: ActivityType,
  durationMinutes: number,
  dateToCheck: Date,
  existingEntries: TimeEntry[]
): { exceedsLimit: boolean; reason: string } => {
  // Get entries for the specific day
  const dayStart = new Date(dateToCheck);
  dayStart.setHours(0, 0, 0, 0);
  
  const dayEnd = new Date(dateToCheck);
  dayEnd.setHours(23, 59, 59, 999);
  
  // Get existing time for this activity on this day
  const existingTimeForActivity = getActivityTime(
    existingEntries.filter(e => e.type === type), 
    type, 
    dayStart, 
    dayEnd
  );
  
  // Calculate total time including new entry
  const totalTimeWithNewEntry = existingTimeForActivity + durationMinutes;
  
  if (type === 'driving') {
    // Check weekly extended driving days
    const extendedDrivingDays = countExtendedDrivingDays(existingEntries);
    const limit = extendedDrivingDays < 2 
      ? EU_REGULATIONS_2024.driving.extendedDaily 
      : EU_REGULATIONS_2024.driving.daily;
    
    if (totalTimeWithNewEntry > limit) {
      return { 
        exceedsLimit: true, 
        reason: extendedDrivingDays < 2 
          ? `Excede el límite extendido de 10 horas (${formatTime(totalTimeWithNewEntry)})`
          : `Excede el límite estándar de 9 horas (${formatTime(totalTimeWithNewEntry)})`
      };
    }
    
    // Check weekly limit
    const weeklyDriving = getActivityTime(
      existingEntries.filter(e => e.type === type),
      type,
      getStartDateForRange('week')
    ) + durationMinutes;
    
    if (weeklyDriving > EU_REGULATIONS_2024.driving.weekly) {
      return { 
        exceedsLimit: true, 
        reason: `Excede el límite semanal de 56 horas (${formatTime(weeklyDriving)})`
      };
    }
  } else if (type === 'available') {
    // Check extended availability days
    const extendedAvailabilityDays = countExtendedAvailabilityDays(existingEntries);
    
    if (extendedAvailabilityDays >= 3 && totalTimeWithNewEntry > 12 * 60) {
      return { 
        exceedsLimit: true, 
        reason: `Ya has usado 3 días de disponibilidad extendida esta semana.`
      };
    }
    
    if (totalTimeWithNewEntry > EU_REGULATIONS_2024.available.daily) {
      return { 
        exceedsLimit: true, 
        reason: `Excede el límite de disponibilidad de 15 horas (${formatTime(totalTimeWithNewEntry)})`
      };
    }
  }
  
  return { exceedsLimit: false, reason: '' };
};
