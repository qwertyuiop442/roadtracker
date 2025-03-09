
import React, { useState } from 'react';
import { format, parse, addDays, subDays } from 'date-fns';
import { es } from 'date-fns/locale';
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useToast } from "@/hooks/use-toast";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { 
  ActivityType, 
  formatTime,
  checkActivityExceedsLimits 
} from "@/lib/timeTracking";
import { Truck, Clock, Bell, Calendar as CalendarIcon, AlertTriangle } from "lucide-react";
import { cn } from "@/lib/utils";

const ManualTimeEntry = () => {
  const { toast } = useToast();
  const { timeEntries, addManualTimeEntry } = useTimeTracking();
  
  const [selectedDate, setSelectedDate] = useState<Date>(new Date());
  const [activityType, setActivityType] = useState<ActivityType>('driving');
  const [hours, setHours] = useState<string>("0");
  const [minutes, setMinutes] = useState<string>("0");
  const [notes, setNotes] = useState<string>("");
  const [showWarningDialog, setShowWarningDialog] = useState(false);
  const [warningMessage, setWarningMessage] = useState("");
  
  // Handle submission
  const handleSubmit = (forceSubmit: boolean = false) => {
    // Convert hours and minutes to numbers
    const hoursNum = parseInt(hours) || 0;
    const minutesNum = parseInt(minutes) || 0;
    const totalMinutes = hoursNum * 60 + minutesNum;
    
    if (totalMinutes <= 0) {
      toast({
        title: "Tiempo inválido",
        description: "Por favor, introduce un tiempo válido mayor que cero.",
        variant: "destructive",
      });
      return;
    }
    
    // Check if entry would exceed limits
    if (!forceSubmit) {
      const { exceedsLimit, reason } = checkActivityExceedsLimits(
        activityType,
        totalMinutes,
        selectedDate,
        timeEntries
      );
      
      if (exceedsLimit) {
        setWarningMessage(reason);
        setShowWarningDialog(true);
        return;
      }
    }
    
    // Add the manual entry
    addManualTimeEntry(
      activityType,
      selectedDate,
      totalMinutes,
      notes,
      forceSubmit
    );
    
    // Reset form
    setHours("0");
    setMinutes("0");
    setNotes("");
    
    toast({
      title: "Entrada añadida",
      description: `Se ha añadido ${formatTime(totalMinutes)} de ${getActivityName(activityType)} al ${format(selectedDate, 'dd/MM/yyyy')}.`,
    });
  };
  
  // Handle hour input changes (ensure valid values)
  const handleHourChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers
    if (value === "" || /^\d+$/.test(value)) {
      setHours(value);
    }
  };
  
  // Handle minute input changes (ensure valid values between 0-59)
  const handleMinuteChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Allow empty string or numbers between 0-59
    if (value === "" || (/^\d+$/.test(value) && parseInt(value) < 60)) {
      setMinutes(value);
    }
  };
  
  // Helper function to get activity name
  const getActivityName = (type: ActivityType): string => {
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
  };
  
  // Helper function to get activity icon
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'driving':
        return <Truck className="h-5 w-5" />;
      case 'rest':
        return <Clock className="h-5 w-5" />; // Using Clock as a placeholder for rest
      case 'additional':
        return <Clock className="h-5 w-5" />;
      case 'available':
        return <Bell className="h-5 w-5" />;
    }
  };
  
  // Helper function to get color class
  const getColorClass = (type: ActivityType) => {
    switch (type) {
      case 'driving':
        return 'text-truck-primary';
      case 'rest':
        return 'text-truck-rest';
      case 'additional':
        return 'text-truck-tertiary';
      case 'available':
        return 'text-truck-secondary';
    }
  };
  
  return (
    <Card className="border-2 shadow-md">
      <CardHeader>
        <CardTitle className="text-xl">Registro manual de tiempo</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date selection */}
        <div className="space-y-1.5">
          <Label htmlFor="date">Fecha</Label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                id="date"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !selectedDate && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {selectedDate ? (
                  format(selectedDate, "dd 'de' MMMM, yyyy", { locale: es })
                ) : (
                  <span>Seleccionar fecha</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={selectedDate}
                onSelect={(date) => date && setSelectedDate(date)}
                initialFocus
                className="p-3 pointer-events-auto"
              />
            </PopoverContent>
          </Popover>
        </div>
        
        {/* Activity type selection */}
        <div className="space-y-1.5">
          <Label htmlFor="activity-type">Tipo de actividad</Label>
          <Select
            value={activityType}
            onValueChange={(value) => setActivityType(value as ActivityType)}
          >
            <SelectTrigger id="activity-type" className="w-full">
              <SelectValue placeholder="Seleccionar actividad" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="driving" className="flex items-center">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 mr-2 text-truck-primary" />
                  <span>Conducción</span>
                </div>
              </SelectItem>
              <SelectItem value="rest">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-truck-rest" />
                  <span>Descanso</span>
                </div>
              </SelectItem>
              <SelectItem value="additional">
                <div className="flex items-center">
                  <Clock className="h-4 w-4 mr-2 text-truck-tertiary" />
                  <span>Otros Trabajos</span>
                </div>
              </SelectItem>
              <SelectItem value="available">
                <div className="flex items-center">
                  <Bell className="h-4 w-4 mr-2 text-truck-secondary" />
                  <span>Disponibilidad</span>
                </div>
              </SelectItem>
            </SelectContent>
          </Select>
        </div>
        
        {/* Time input (hours and minutes) */}
        <div className="space-y-1.5">
          <Label htmlFor="time">Duración</Label>
          <div className="flex gap-2 items-center">
            <div className="flex-1">
              <Input
                id="hours"
                type="number"
                min="0"
                value={hours}
                onChange={handleHourChange}
                className="text-center"
              />
              <Label htmlFor="hours" className="mt-1 text-center block text-xs text-muted-foreground">
                Horas
              </Label>
            </div>
            <span className="text-2xl">:</span>
            <div className="flex-1">
              <Input
                id="minutes"
                type="number"
                min="0"
                max="59"
                value={minutes}
                onChange={handleMinuteChange}
                className="text-center"
              />
              <Label htmlFor="minutes" className="mt-1 text-center block text-xs text-muted-foreground">
                Minutos
              </Label>
            </div>
          </div>
        </div>
        
        {/* Notes */}
        <div className="space-y-1.5">
          <Label htmlFor="notes">Notas (opcional)</Label>
          <Input
            id="notes"
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Añade detalles sobre esta actividad"
          />
        </div>
      </CardContent>
      <CardFooter>
        <Button 
          onClick={() => handleSubmit(false)} 
          className="w-full"
          variant="default"
        >
          {getActivityIcon(activityType)}
          <span className="ml-2">Registrar {getActivityName(activityType).toLowerCase()}</span>
        </Button>
      </CardFooter>
      
      {/* Warning dialog for exceeding limits */}
      <AlertDialog open={showWarningDialog} onOpenChange={setShowWarningDialog}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="flex items-center">
              <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
              Advertencia de cumplimiento normativo
            </AlertDialogTitle>
            <AlertDialogDescription>
              Esta entrada excede los límites establecidos por la regulación EU 2024:
              <p className="mt-2 font-medium text-destructive">{warningMessage}</p>
              <p className="mt-2">¿Deseas continuar de todas formas? La entrada se guardará pero se marcará como no conforme.</p>
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleSubmit(true)}>
              Guardar de todas formas
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  );
};

export default ManualTimeEntry;
