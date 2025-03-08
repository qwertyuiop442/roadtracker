
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

// Spanish regulations for driving and rest times (in minutes)
export const SPAIN_REGULATIONS = {
  driving: {
    daily: 9 * 60,       // 9 hours standard (can be extended to 10h twice a week)
    extendedDaily: 10 * 60, // 10 hours extended (max 2 times per week)
    weekly: 56 * 60,     // 56 hours weekly maximum
    biweekly: 90 * 60,   // 90 hours over 2 weeks
    continuous: 4.5 * 60 // 4.5 hours continuous driving before a break
  },
  rest: {
    daily: 11 * 60,      // 11 hours daily rest (can be reduced to 9h three times per week)
    reducedDaily: 9 * 60, // 9 hours reduced daily rest
    weekly: 45 * 60,     // 45 hours weekly rest
    reducedWeekly: 24 * 60, // 24 hours reduced weekly rest (once every two weeks)
    break: 45,           // 45 minutes break after 4.5 hours driving
    splitBreak1: 15,     // 15 minutes for first part of split break
    splitBreak2: 30      // 30 minutes for second part of split break
  }
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

// Calculate remaining rest time in minutes - purely informative
export const calculateRemainingRest = (
  drivingTime: number,
  restTime: number,
  type: 'daily' | 'weekly' | 'break'
): number => {
  if (type === 'break') {
    // Calculate required break time after 4.5 hours of driving
    if (drivingTime >= SPAIN_REGULATIONS.driving.continuous) {
      return Math.max(0, SPAIN_REGULATIONS.rest.break - restTime);
    }
    return 0;
  }
  
  if (type === 'daily') {
    return Math.max(0, SPAIN_REGULATIONS.rest.daily - restTime);
  }
  
  if (type === 'weekly') {
    return Math.max(0, SPAIN_REGULATIONS.rest.weekly - restTime);
  }
  
  return 0;
};

// For informational purposes only - checks if driver should take a break
export const shouldTakeBreak = (drivingTime: number, lastRestTime: number): boolean => {
  return drivingTime >= SPAIN_REGULATIONS.driving.continuous && lastRestTime < SPAIN_REGULATIONS.rest.break;
};

// For getting the Spanish regulation information in a human-readable format
export const getRegulationInfo = (type: 'driving' | 'rest' | 'additional'): string[] => {
  switch (type) {
    case 'driving':
      return [
        '9 horas diarias (estándar)',
        '10 horas diarias (máximo 2 veces por semana)',
        '56 horas semanales máximo',
        '90 horas en dos semanas',
        '4,5 horas de conducción continua antes de descanso obligatorio'
      ];
    case 'rest':
      return [
        '11 horas de descanso diario normal',
        '9 horas de descanso diario reducido (máximo 3 veces por semana)',
        '45 horas de descanso semanal normal',
        '24 horas de descanso semanal reducido (una vez cada dos semanas)',
        '45 minutos de pausa después de 4,5 horas de conducción',
        'Posibilidad de dividir la pausa de 45 minutos en dos (15 min + 30 min)'
      ];
    case 'additional':
      return [
        'El tiempo máximo de trabajo semanal: 60 horas',
        'Tiempo máximo de trabajo en dos semanas: 100 horas',
        'El trabajo nocturno no debe exceder las 10 horas en cada período de 24 horas'
      ];
    default:
      return [];
  }
};
