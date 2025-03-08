
export type ActivityType = 'driving' | 'rest' | 'additional' | 'available';

export interface TimeEntry {
  id: string;
  type: ActivityType;
  startTime: Date;
  endTime: Date | null;
  notes?: string;
}

export interface HolidayEntry {
  id: string;
  date: Date;
  description: string;
  isSixthDay: boolean;
}

// Constants for calculating required rest periods (in minutes)
export const REQUIRED_REST_TIME = {
  after4Hours: 45,  // 45 min break after 4h30m of driving
  daily: 11 * 60,   // 11 hours daily rest
  weekly: 45 * 60,  // 45 hours weekly rest
};

// Gets formatted time string from minutes
export const formatMinutes = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const mins = minutes % 60;
  return `${hours.toString().padStart(2, '0')}:${mins.toString().padStart(2, '0')}`;
};

// Calculate elapsed time in minutes
export const calculateElapsedMinutes = (start: Date, end: Date = new Date()): number => {
  return Math.floor((end.getTime() - start.getTime()) / (1000 * 60));
};

// Calculate remaining rest time in minutes
export const calculateRemainingRest = (
  drivingTime: number,
  restTime: number,
  type: 'daily' | 'weekly' | 'break'
): number => {
  if (type === 'break') {
    // Calculate required break time after 4.5 hours of driving
    if (drivingTime >= 4.5 * 60) {
      return Math.max(0, REQUIRED_REST_TIME.after4Hours - restTime);
    }
    return 0;
  }
  
  if (type === 'daily') {
    return Math.max(0, REQUIRED_REST_TIME.daily - restTime);
  }
  
  if (type === 'weekly') {
    return Math.max(0, REQUIRED_REST_TIME.weekly - restTime);
  }
  
  return 0;
};

// Calculate if driver should take a break
export const shouldTakeBreak = (drivingTime: number, lastRestTime: number): boolean => {
  return drivingTime >= 4.5 * 60 && lastRestTime < REQUIRED_REST_TIME.after4Hours;
};
