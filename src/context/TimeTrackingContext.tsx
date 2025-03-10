import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ActivityType, 
  TimeEntry, 
  HolidayEntry, 
  EU_REGULATIONS_2024,
  getStartDateForRange,
  getActivityTime,
  countExtendedDrivingDays,
  countExtendedAvailabilityDays
} from '@/lib/timeTracking';
import { useToast } from "@/hooks/use-toast";
import { toast as sonnerToast } from "sonner";

interface TimeTrackingContextType {
  currentActivity: ActivityType | null;
  timeEntries: TimeEntry[];
  holidayEntries: HolidayEntry[];
  currentEntry: TimeEntry | null;
  drivingTimeToday: number;
  restTimeToday: number;
  additionalTimeToday: number;
  availabilityTimeToday: number;
  drivingTimeWeek: number;
  drivingTimeBiweek: number;
  restTimeWeek: number;
  extendedDrivingDays: number;
  extendedAvailabilityDays: number;
  startActivity: (type: ActivityType) => void;
  stopActivity: () => void;
  addHolidayEntry: (entry: Omit<HolidayEntry, 'id'>) => void;
  removeHolidayEntry: (id: string) => void;
  resetTimeEntries: () => void;
  addManualTimeEntry: (
    type: ActivityType, 
    date: Date, 
    durationMinutes: number, 
    notes?: string,
    exceedsLimits?: boolean
  ) => void;
  deleteTimeEntry: (id: string) => void;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { toast } = useToast();
  const [currentActivity, setCurrentActivity] = useState<ActivityType | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [holidayEntries, setHolidayEntries] = useState<HolidayEntry[]>([]);
  
  const today = getStartDateForRange('day');
  const weekStart = getStartDateForRange('week');
  const biweekStart = getStartDateForRange('biweek');
  
  const drivingTimeToday = getActivityTime(timeEntries, 'driving', today);
  const restTimeToday = getActivityTime(timeEntries, 'rest', today);
  const additionalTimeToday = getActivityTime(timeEntries, 'additional', today);
  const availabilityTimeToday = getActivityTime(timeEntries, 'available', today);
  
  const drivingTimeWeek = getActivityTime(timeEntries, 'driving', weekStart);
  const drivingTimeBiweek = getActivityTime(timeEntries, 'driving', biweekStart);
  const restTimeWeek = getActivityTime(timeEntries, 'rest', weekStart);
  
  const extendedDrivingDays = countExtendedDrivingDays(timeEntries);
  const extendedAvailabilityDays = countExtendedAvailabilityDays(timeEntries);
  
  useEffect(() => {
    const savedEntries = localStorage.getItem('timeEntries');
    const savedHolidays = localStorage.getItem('holidayEntries');
    const savedCurrentEntry = localStorage.getItem('currentEntry');
    const savedCurrentActivity = localStorage.getItem('currentActivity');
    
    if (savedEntries) {
      const parsedEntries = JSON.parse(savedEntries);
      const convertedEntries = parsedEntries.map((entry: any) => ({
        ...entry,
        startTime: new Date(entry.startTime),
        endTime: entry.endTime ? new Date(entry.endTime) : null
      }));
      setTimeEntries(convertedEntries);
    }
    
    if (savedHolidays) {
      const parsedHolidays = JSON.parse(savedHolidays);
      const convertedHolidays = parsedHolidays.map((holiday: any) => ({
        ...holiday,
        date: new Date(holiday.date)
      }));
      setHolidayEntries(convertedHolidays);
    }
    
    if (savedCurrentEntry) {
      const parsedEntry = JSON.parse(savedCurrentEntry);
      parsedEntry.startTime = new Date(parsedEntry.startTime);
      if (parsedEntry.endTime) {
        parsedEntry.endTime = new Date(parsedEntry.endTime);
      }
      setCurrentEntry(parsedEntry);
    }
    
    if (savedCurrentActivity) {
      setCurrentActivity(JSON.parse(savedCurrentActivity) as ActivityType);
    }
  }, []);
  
  useEffect(() => {
    localStorage.setItem('timeEntries', JSON.stringify(timeEntries));
  }, [timeEntries]);
  
  useEffect(() => {
    localStorage.setItem('holidayEntries', JSON.stringify(holidayEntries));
  }, [holidayEntries]);
  
  useEffect(() => {
    localStorage.setItem('currentEntry', currentEntry ? JSON.stringify(currentEntry) : '');
    localStorage.setItem('currentActivity', currentActivity ? JSON.stringify(currentActivity) : '');
  }, [currentEntry, currentActivity]);
  
  useEffect(() => {
    if (currentActivity === 'driving' && drivingTimeToday >= EU_REGULATIONS_2024.driving.continuous && restTimeToday < EU_REGULATIONS_2024.rest.break) {
      toast({
        title: "¡Alerta de descanso!",
        description: "Según la normativa europea 2024, debes tomar un descanso de 45 minutos tras 4.5 horas de conducción.",
        variant: "destructive",
      });
      
      sonnerToast.error("¡Descanso obligatorio requerido!", {
        description: "Debes detenerte y tomar un descanso de 45 minutos según la normativa EU 2024.",
        duration: 10000,
      });
    }
    
    const drivingLimit = extendedDrivingDays < 2 
      ? EU_REGULATIONS_2024.driving.extendedDaily 
      : EU_REGULATIONS_2024.driving.daily;
      
    if (currentActivity === 'driving' && drivingTimeToday >= drivingLimit * 0.8) {
      const limitText = extendedDrivingDays < 2 ? "10 horas" : "9 horas";
      toast({
        title: "Límite de conducción diaria",
        description: `Te estás acercando al límite de ${limitText} de conducción diaria.`,
        variant: "default",
      });
    }
    
    if (currentActivity === 'driving' && drivingTimeWeek >= EU_REGULATIONS_2024.driving.weekly * 0.9) {
      toast({
        title: "Límite semanal de conducción",
        description: "Te estás acercando al límite de 56 horas de conducción semanal.",
        variant: "default",
      });
    }
    
    const availabilityLimit = extendedAvailabilityDays < 3 
      ? EU_REGULATIONS_2024.available.daily 
      : 12 * 60;
      
    if (currentActivity === 'available' && availabilityTimeToday >= availabilityLimit * 0.8) {
      const limitText = extendedAvailabilityDays < 3 ? "15 horas" : "12 horas";
      toast({
        title: "Límite de disponibilidad",
        description: `Te estás acercando al límite de ${limitText} de disponibilidad diaria.`,
        variant: "default",
      });
    }
    
    const totalActiveTime = drivingTimeToday + additionalTimeToday + availabilityTimeToday;
    if (totalActiveTime > 12 * 60 && restTimeToday < 8 * 60) {
      toast({
        title: "Descanso insuficiente",
        description: "No has tomado suficiente descanso hoy según la normativa europea 2024.",
        variant: "destructive",
      });
    }
  }, [drivingTimeToday, restTimeToday, drivingTimeWeek, drivingTimeBiweek, availabilityTimeToday, additionalTimeToday, currentActivity, extendedDrivingDays, extendedAvailabilityDays, toast]);
  
  const startActivity = (type: ActivityType) => {
    if (currentEntry) {
      stopActivity();
    }
    
    if (type === 'driving') {
      const drivingLimit = extendedDrivingDays < 2 
        ? EU_REGULATIONS_2024.driving.extendedDaily 
        : EU_REGULATIONS_2024.driving.daily;
        
      if (drivingTimeToday >= drivingLimit) {
        const limitText = extendedDrivingDays < 2 ? "10 horas" : "9 horas";
        sonnerToast.error("¡Límite de conducción superado!", {
          description: `Has alcanzado el límite de ${limitText} diarias de conducción. Debes descansar.`,
          duration: 10000,
        });
        return;
      }
      
      if (drivingTimeWeek >= EU_REGULATIONS_2024.driving.weekly) {
        sonnerToast.error("¡Límite semanal de conducción superado!", {
          description: "Has alcanzado el límite de 56 horas semanales de conducción.",
          duration: 10000,
        });
        return;
      }
    } else if (type === 'available') {
      const availabilityLimit = extendedAvailabilityDays < 3 
        ? EU_REGULATIONS_2024.available.daily 
        : 12 * 60;
        
      if (availabilityTimeToday >= availabilityLimit) {
        const limitText = extendedAvailabilityDays < 3 ? "15 horas" : "12 horas";
        sonnerToast.error("¡Límite de disponibilidad superado!", {
          description: `Has alcanzado el límite de ${limitText} diarias de disponibilidad.`,
          duration: 10000,
        });
        return;
      }
    }
    
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      type,
      startTime: new Date(),
      endTime: null,
    };
    
    setCurrentEntry(newEntry);
    setCurrentActivity(type);
    
    toast({
      title: `${getActivityName(type)} iniciado`,
      description: `Registro de ${getActivityName(type).toLowerCase()} iniciado correctamente.`,
    });
  };
  
  const stopActivity = () => {
    if (currentEntry) {
      const completedEntry: TimeEntry = {
        ...currentEntry,
        endTime: new Date(),
      };
      
      setTimeEntries(prev => [...prev, completedEntry]);
      setCurrentEntry(null);
      
      toast({
        title: `${getActivityName(currentActivity as ActivityType)} finalizado`,
        description: `Registro de ${getActivityName(currentActivity as ActivityType).toLowerCase()} guardado correctamente.`,
      });
      
      setCurrentActivity(null);
    }
  };
  
  const addManualTimeEntry = (
    type: ActivityType, 
    date: Date, 
    durationMinutes: number, 
    notes?: string,
    exceedsLimits: boolean = false
  ) => {
    const startTime = new Date(date);
    startTime.setHours(8, 0, 0, 0);
    
    const endTime = new Date(startTime);
    endTime.setMinutes(endTime.getMinutes() + durationMinutes);
    
    const newEntry: TimeEntry = {
      id: Date.now().toString(),
      type,
      startTime,
      endTime,
      isManualEntry: true,
      durationMinutes,
      notes: notes || (exceedsLimits ? '⚠️ Excede límites normativos' : undefined),
    };
    
    setTimeEntries(prev => [...prev, newEntry]);
  };
  
  const deleteTimeEntry = (id: string) => {
    setTimeEntries(prev => prev.filter(entry => entry.id !== id));
    
    toast({
      title: "Registro eliminado",
      description: "El registro de tiempo ha sido eliminado correctamente.",
    });
  };
  
  const addHolidayEntry = (entry: Omit<HolidayEntry, 'id'>) => {
    const newEntry: HolidayEntry = {
      ...entry,
      id: Date.now().toString(),
    };
    
    setHolidayEntries(prev => [...prev, newEntry]);
    
    toast({
      title: entry.isSixthDay ? "Sexto día registrado" : "Festivo registrado",
      description: "El registro se ha guardado correctamente.",
    });
  };
  
  const removeHolidayEntry = (id: string) => {
    setHolidayEntries(prev => prev.filter(entry => entry.id !== id));
    
    toast({
      title: "Registro eliminado",
      description: "El registro ha sido eliminado correctamente.",
    });
  };
  
  const resetTimeEntries = () => {
    if (currentEntry) {
      stopActivity();
    }
    
    setTimeEntries([]);
    setCurrentEntry(null);
    setCurrentActivity(null);
    
    toast({
      title: "Registros reiniciados",
      description: "Todos los registros de tiempo han sido eliminados.",
    });
  };
  
  function getActivityName(type: ActivityType): string {
    switch (type) {
      case 'driving':
        return 'Conducción';
      case 'rest':
        return 'Descanso';
      case 'additional':
        return 'Otros Trabajos';
      case 'available':
        return 'Disponibilidad';
    }
  }
  
  return (
    <TimeTrackingContext.Provider
      value={{
        currentActivity,
        timeEntries,
        holidayEntries,
        currentEntry,
        drivingTimeToday,
        restTimeToday,
        additionalTimeToday,
        availabilityTimeToday,
        drivingTimeWeek,
        drivingTimeBiweek,
        restTimeWeek,
        extendedDrivingDays,
        extendedAvailabilityDays,
        startActivity,
        stopActivity,
        addHolidayEntry,
        removeHolidayEntry,
        resetTimeEntries,
        addManualTimeEntry,
        deleteTimeEntry,
      }}
    >
      {children}
    </TimeTrackingContext.Provider>
  );
};

export const useTimeTracking = (): TimeTrackingContextType => {
  const context = useContext(TimeTrackingContext);
  if (context === undefined) {
    throw new Error('useTimeTracking must be used within a TimeTrackingProvider');
  }
  return context;
};
