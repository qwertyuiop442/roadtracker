
import React from 'react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle 
} from "@/components/ui/card";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { ActivityType, TimeEntry, formatTime } from "@/lib/timeTracking";
import { Truck, Coffee, Clock, Bell, Trash2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

interface TimeEntriesListProps {
  date?: Date;
  type?: ActivityType;
  showHeader?: boolean;
  className?: string;
}

const TimeEntriesList = ({ date, type, showHeader = true, className }: TimeEntriesListProps) => {
  const { timeEntries, deleteTimeEntry } = useTimeTracking();
  
  // Filter entries based on date and type
  const filterEntries = () => {
    let filtered = [...timeEntries];
    
    if (date) {
      const dayStart = new Date(date);
      dayStart.setHours(0, 0, 0, 0);
      
      const dayEnd = new Date(date);
      dayEnd.setHours(23, 59, 59, 999);
      
      filtered = filtered.filter(entry => {
        const entryTime = new Date(entry.startTime);
        return entryTime >= dayStart && entryTime <= dayEnd;
      });
    }
    
    if (type) {
      filtered = filtered.filter(entry => entry.type === type);
    }
    
    // Sort by date (newest first)
    return filtered.sort((a, b) => 
      new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
    );
  };
  
  const filteredEntries = filterEntries();
  
  // Helper function to get activity icon
  const getActivityIcon = (type: ActivityType) => {
    switch (type) {
      case 'driving':
        return <Truck className="h-4 w-4 text-truck-primary" />;
      case 'rest':
        return <Coffee className="h-4 w-4 text-truck-rest" />;
      case 'additional':
        return <Clock className="h-4 w-4 text-truck-tertiary" />;
      case 'available':
        return <Bell className="h-4 w-4 text-truck-secondary" />;
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
  
  // Function to format duration
  const formatDuration = (entry: TimeEntry) => {
    if (entry.isManualEntry && entry.durationMinutes) {
      return formatTime(entry.durationMinutes);
    }
    
    const start = new Date(entry.startTime);
    const end = entry.endTime ? new Date(entry.endTime) : new Date();
    const durationMs = end.getTime() - start.getTime();
    const minutes = Math.floor(durationMs / (1000 * 60));
    
    return formatTime(minutes);
  };
  
  if (filteredEntries.length === 0) {
    return (
      <Card className={`${className} shadow-sm`}>
        {showHeader && (
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">{type ? getActivityName(type) : 'Todas las actividades'}</CardTitle>
          </CardHeader>
        )}
        <CardContent>
          <div className="text-center py-8 text-muted-foreground">
            <p>No hay registros para mostrar.</p>
          </div>
        </CardContent>
      </Card>
    );
  }
  
  return (
    <Card className={`${className} shadow-sm`}>
      {showHeader && (
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">{type ? getActivityName(type) : 'Todas las actividades'}</CardTitle>
        </CardHeader>
      )}
      <CardContent>
        <div className="overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fecha</TableHead>
                {!type && <TableHead>Actividad</TableHead>}
                <TableHead>Duración</TableHead>
                <TableHead>Notas</TableHead>
                <TableHead>Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredEntries.map((entry) => (
                <TableRow key={entry.id}>
                  <TableCell className="whitespace-nowrap">
                    {format(new Date(entry.startTime), 'dd/MM/yyyy HH:mm', { locale: es })}
                    {entry.isManualEntry && (
                      <Badge variant="outline" className="ml-2 text-xs">Manual</Badge>
                    )}
                  </TableCell>
                  {!type && (
                    <TableCell className="whitespace-nowrap">
                      <div className="flex items-center space-x-2">
                        {getActivityIcon(entry.type)}
                        <span>{getActivityName(entry.type)}</span>
                      </div>
                    </TableCell>
                  )}
                  <TableCell>{formatDuration(entry)}</TableCell>
                  <TableCell>
                    {entry.notes && (
                      <div className="flex items-start space-x-1">
                        {entry.notes.includes('⚠️') && (
                          <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0 mt-0.5" />
                        )}
                        <span className="text-sm truncate max-w-[200px]">
                          {entry.notes}
                        </span>
                      </div>
                    )}
                  </TableCell>
                  <TableCell>
                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </AlertDialogTrigger>
                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>¿Eliminar este registro?</AlertDialogTitle>
                          <AlertDialogDescription>
                            Esta acción no se puede deshacer. Se eliminará permanentemente este registro de actividad.
                          </AlertDialogDescription>
                        </AlertDialogHeader>
                        <AlertDialogFooter>
                          <AlertDialogCancel>Cancelar</AlertDialogCancel>
                          <AlertDialogAction onClick={() => deleteTimeEntry(entry.id)}>
                            Eliminar
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </CardContent>
    </Card>
  );
};

export default TimeEntriesList;
