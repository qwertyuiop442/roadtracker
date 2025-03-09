
import React, { createContext, useContext, useState, useEffect } from 'react';
import { 
  ActivityType, 
  TimeEntry, 
  HolidayEntry, 
  EU_REGULATIONS_2024,
  getStartDateForRange,
  getActivityTime 
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
  startActivity: (type: ActivityType) => void;
  stopActivity: () => void;
  addHolidayEntry: (entry: Omit<HolidayEntry, 'id'>) => void;
  removeHolidayEntry: (id: string) => void;
  resetTimeEntries: () => void;
}

const TimeTrackingContext = createContext<TimeTrackingContextType | undefined>(undefined);

export const TimeTrackingProvider: React.FC<{children: React.ReactNode}> = ({ children }) => {
  const { toast } = useToast();
  const [currentActivity, setCurrentActivity] = useState<ActivityType | null>(null);
  const [currentEntry, setCurrentEntry] = useState<TimeEntry | null>(null);
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [holidayEntries, setHolidayEntries] = useState<HolidayEntry[]>([]);
  
  // Get date ranges
  const today = getStartDateForRange('day');
  const weekStart = getStartDateForRange('week');
  const biweekStart = getStartDateForRange('biweek');
  
  // Calculate metrics for today
  const drivingTimeToday = getActivityTime(timeEntries, 'driving', today);
  const restTimeToday = getActivityTime(timeEntries, 'rest', today);
  const additionalTimeToday = getActivityTime(timeEntries, 'additional', today);
  const availabilityTimeToday = getActivityTime(timeEntries, 'available', today);
  
  // Calculate weekly and biweekly metrics
  const drivingTimeWeek = getActivityTime(timeEntries, 'driving', weekStart);
  const drivingTimeBiweek = getActivityTime(timeEntries, 'driving', biweekStart);
  const restTimeWeek = getActivityTime(timeEntries, 'rest', weekStart);
  
  // Load data from localStorage on initial load
  useEffect(() => {
    const savedEntries = localStorage.getItem('timeEntries');
    const savedHolidays = localStorage.getItem('holidayEntries');
    const savedCurrentEntry = localStorage.getItem('currentEntry');
    const savedCurrentActivity = localStorage.getItem('currentActivity');
    
    if (savedEntries) {
      setTimeEntries(JSON.parse(savedEntries));
    }
    
    if (savedHolidays) {
      setHolidayEntries(JSON.parse(savedHolidays));
    }
    
    if (savedCurrentEntry) {
      const parsedEntry = JSON.parse(savedCurrentEntry);
      // Convert string dates back to Date objects
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
  
  // Save to localStorage when state changes
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
  
  // Enhanced alerts for 2024 EU regulations - proactive notifications
  useEffect(() => {
    // Check if driver should take a break
    if (currentActivity === 'driving' && drivingTimeToday >= EU_REGULATIONS_2024.driving.continuous && restTimeToday < EU_REGULATIONS_2024.rest.break) {
      // Show both toast and push notification
      toast({
        title: "¡Alerta de descanso!",
        description: "Según la normativa europea 2024, debes tomar un descanso de 45 minutos tras 4 horas de conducción.",
        variant: "destructive",
      });
      
      // Sonner toast for more visible notification
      sonnerToast.error("¡Descanso obligatorio requerido!", {
        description: "Debes detenerte y tomar un descanso de 45 minutos según la normativa EU 2024.",
        duration: 10000,
      });
    }
    
    // Alert when approaching daily driving limit (80%)
    if (currentActivity === 'driving' && drivingTimeToday >= EU_REGULATIONS_2024.driving.daily * 0.8) {
      toast({
        title: "Límite de conducción diaria",
        description: "Te estás acercando al límite de 8 horas de conducción diaria.",
        variant: "default",
      });
    }
    
    // Alert when approaching weekly driving limit
    if (currentActivity === 'driving' && drivingTimeWeek >= EU_REGULATIONS_2024.driving.weekly * 0.9) {
      toast({
        title: "Límite semanal de conducción",
        description: "Te estás acercando al límite de 48 horas de conducción semanal.",
        variant: "default",
      });
    }
    
    // Alert when approaching availability limit
    if (currentActivity === 'available' && availabilityTimeToday >= EU_REGULATIONS_2024.available.daily * 0.8) {
      toast({
        title: "Límite de disponibilidad",
        description: "Te estás acercando al límite de 4 horas de disponibilidad diaria.",
        variant: "default",
      });
    }
    
    // Alert for insufficient rest
    const totalActiveTime = drivingTimeToday + additionalTimeToday + availabilityTimeToday;
    if (totalActiveTime > 12 * 60 && restTimeToday < 8 * 60) {
      toast({
        title: "Descanso insuficiente",
        description: "No has tomado suficiente descanso hoy según la normativa europea 2024.",
        variant: "destructive",
      });
    }
  }, [drivingTimeToday, restTimeToday, drivingTimeWeek, drivingTimeBiweek, availabilityTimeToday, additionalTimeToday, currentActivity, toast]);
  
  // Start a new activity
  const startActivity = (type: ActivityType) => {
    // If there's an ongoing activity, stop it first
    if (currentEntry) {
      stopActivity();
    }
    
    // Check for compliance before starting a new activity
    if (type === 'driving') {
      if (drivingTimeToday >= EU_REGULATIONS_2024.driving.daily) {
        sonnerToast.error("¡Límite de conducción superado!", {
          description: "Has alcanzado el límite de 8 horas diarias de conducción. Debes descansar.",
          duration: 10000,
        });
        return;
      }
    } else if (type === 'available' && availabilityTimeToday >= EU_REGULATIONS_2024.available.daily) {
      sonnerToast.error("¡Límite de disponibilidad superado!", {
        description: "Has alcanzado el límite de 4 horas diarias de disponibilidad.",
        duration: 10000,
      });
      return;
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
  
  // Stop the current activity
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
  
  // Add a holiday entry
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
  
  // Remove a holiday entry
  const removeHolidayEntry = (id: string) => {
    setHolidayEntries(prev => prev.filter(entry => entry.id !== id));
    
    toast({
      title: "Registro eliminado",
      description: "El registro ha sido eliminado correctamente.",
    });
  };
  
  // Reset all time entries (for testing)
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
  
  // Helper function to get activity name in Spanish
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
        startActivity,
        stopActivity,
        addHolidayEntry,
        removeHolidayEntry,
        resetTimeEntries,
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
