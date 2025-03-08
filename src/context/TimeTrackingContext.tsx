
import React, { createContext, useContext, useState, useEffect } from 'react';
import { ActivityType, TimeEntry, HolidayEntry, SPAIN_REGULATIONS } from '@/lib/timeTracking';
import { useToast } from "@/components/ui/use-toast";

interface TimeTrackingContextType {
  currentActivity: ActivityType | null;
  timeEntries: TimeEntry[];
  holidayEntries: HolidayEntry[];
  currentEntry: TimeEntry | null;
  drivingTimeToday: number;
  restTimeToday: number;
  additionalTimeToday: number;
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
  
  // Calculate metrics
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  
  const drivingTimeToday = timeEntries
    .filter(entry => entry.type === 'driving' && new Date(entry.startTime) >= today)
    .reduce((acc, entry) => {
      const endTime = entry.endTime || new Date();
      const minutes = Math.floor((endTime.getTime() - new Date(entry.startTime).getTime()) / (1000 * 60));
      return acc + minutes;
    }, 0);
    
  const restTimeToday = timeEntries
    .filter(entry => entry.type === 'rest' && new Date(entry.startTime) >= today)
    .reduce((acc, entry) => {
      const endTime = entry.endTime || new Date();
      const minutes = Math.floor((endTime.getTime() - new Date(entry.startTime).getTime()) / (1000 * 60));
      return acc + minutes;
    }, 0);
    
  const additionalTimeToday = timeEntries
    .filter(entry => entry.type === 'additional' && new Date(entry.startTime) >= today)
    .reduce((acc, entry) => {
      const endTime = entry.endTime || new Date();
      const minutes = Math.floor((endTime.getTime() - new Date(entry.startTime).getTime()) / (1000 * 60));
      return acc + minutes;
    }, 0);
  
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
  
  // Check if driver should take a break - purely informational, no restrictions
  useEffect(() => {
    if (currentActivity === 'driving' && drivingTimeToday >= SPAIN_REGULATIONS.driving.continuous && restTimeToday < SPAIN_REGULATIONS.rest.break) {
      toast({
        title: "Información de descanso",
        description: "Según la normativa española, tras 4.5 horas de conducción se recomienda un descanso de 45 minutos.",
        variant: "default",
      });
    }
  }, [drivingTimeToday, restTimeToday, currentActivity, toast]);
  
  // Start a new activity
  const startActivity = (type: ActivityType) => {
    // If there's an ongoing activity, stop it first
    if (currentEntry) {
      stopActivity();
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
        return 'Trabajo adicional';
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
