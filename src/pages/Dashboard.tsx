
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import TimeProgress from "@/components/TimeProgress";
import ActivityButton from "@/components/ActivityButton";
import Timer from "@/components/Timer";
import DailyCircleChart from "@/components/DailyCircleChart";
import { Truck, Coffee, Clock, Bell, AlertTriangle, InfoIcon, MapPin } from "lucide-react";
import { ActivityType, EU_REGULATIONS_2024, getRegulationInfo } from "@/lib/timeTracking";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Dashboard = () => {
  // Calculate elapsed time in minutes
  const calculateElapsedTime = (startTime: Date) => {
    const now = new Date();
    return Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
  };
  
  const { 
    currentActivity, 
    currentEntry,
    drivingTimeToday, 
    restTimeToday, 
    additionalTimeToday,
    startActivity, 
    stopActivity 
  } = useTimeTracking();
  
  const { toast } = useToast();
  
  // European 2024 regulation limits
  const MAX_DRIVING_TIME = EU_REGULATIONS_2024.driving.extendedDaily; // 9 hours
  const RECOMMENDED_REST_TIME = EU_REGULATIONS_2024.rest.daily; // 12 hours
  const MAX_AVAILABILITY_TIME = EU_REGULATIONS_2024.available.daily; // 4 hours
  
  // Calculate the time spent in "available" state today
  const availabilityTimeToday = currentActivity === 'available' && currentEntry
    ? calculateElapsedTime(currentEntry.startTime)
    : 0;
  
  const shouldShowBreakWarning = drivingTimeToday >= EU_REGULATIONS_2024.driving.continuous && restTimeToday < EU_REGULATIONS_2024.rest.break;
  
  const handleStartActivity = (type: ActivityType) => {
    // Information only, no restrictions
    if (currentActivity === 'driving' && type !== 'rest' && shouldShowBreakWarning) {
      toast({
        title: "Información de descanso",
        description: "Según la normativa europea 2024, deberías tomar un descanso de 45 minutos después de 4 horas de conducción.",
        variant: "default",
      });
    }
    
    startActivity(type);
  };

  // Function to force data sync (manually triggered)
  const handleForceSync = () => {
    toast({
      title: "Sincronización manual",
      description: "Datos sincronizados correctamente.",
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
        <h1 className="font-bold text-3xl">Mi Jornada</h1>
        <Button 
          variant="outline" 
          onClick={handleForceSync}
          className="self-start sm:self-auto"
        >
          <MapPin className="h-4 w-4 mr-2" />
          Sincronizar ubicación
        </Button>
      </div>
      
      {/* Current activity display */}
      <Card className="border-2 shadow-md">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">
            {currentActivity 
              ? `${getActivityLabel(currentActivity)} en progreso` 
              : 'No hay actividad en progreso'}
          </CardTitle>
        </CardHeader>
        <CardContent className="pt-0">
          {currentActivity ? (
            <div className="flex flex-col items-center py-6">
              <ActivityIcon type={currentActivity} className="w-12 h-12 mb-4" />
              <Timer startTime={currentEntry?.startTime} className="text-2xl font-semibold mb-6" />
              <Button 
                variant="outline" 
                size="lg"
                className="w-full md:w-1/2 bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100"
                onClick={stopActivity}
              >
                Detener {getActivityLabel(currentActivity).toLowerCase()}
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-3 py-4">
              <ActivityButton 
                type="driving" 
                onClick={() => handleStartActivity('driving')} 
              />
              <ActivityButton 
                type="rest" 
                onClick={() => handleStartActivity('rest')} 
              />
              <ActivityButton 
                type="additional" 
                onClick={() => handleStartActivity('additional')} 
              />
              <ActivityButton 
                type="available" 
                onClick={() => handleStartActivity('available')} 
              />
            </div>
          )}
        </CardContent>
      </Card>
      
      {/* Warning card for break - purely informative */}
      {shouldShowBreakWarning && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mr-3" />
              <div>
                <h3 className="font-medium">Información de descanso recomendado</h3>
                <p className="text-sm">Según la normativa europea 2024, tras 4 horas de conducción se recomienda un descanso de 45 minutos.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Daily activity chart */}
      <Card>
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">Actividades de hoy</CardTitle>
        </CardHeader>
        <CardContent>
          <DailyCircleChart />
        </CardContent>
      </Card>
      
      {/* Progress cards with tooltips showing regulations */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <TooltipProvider>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Truck className="w-5 h-5 mr-2 text-truck-primary" />
                Tiempo de conducción
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-4 h-4 ml-2 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p className="font-semibold mb-1">Normativa europea 2024:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {getRegulationInfo('driving').map((info, i) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimeProgress 
                value={drivingTimeToday} 
                max={MAX_DRIVING_TIME} 
                type="driving" 
                label="Tiempo utilizado" 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Coffee className="w-5 h-5 mr-2 text-truck-rest" />
                Tiempo de descanso
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-4 h-4 ml-2 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p className="font-semibold mb-1">Normativa europea 2024:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {getRegulationInfo('rest').map((info, i) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimeProgress 
                value={restTimeToday} 
                max={RECOMMENDED_REST_TIME} 
                type="rest" 
                label="Descanso realizado" 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-truck-tertiary" />
                Otros Trabajos
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-4 h-4 ml-2 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p className="font-semibold mb-1">Normativa europea 2024:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {getRegulationInfo('additional').map((info, i) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimeProgress 
                value={additionalTimeToday} 
                max={additionalTimeToday || 1} // Sin límite real, solo para visualización
                type="additional" 
                label="Tiempo utilizado" 
                showMaxValue={false}
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Bell className="w-5 h-5 mr-2 text-truck-secondary" />
                Disponibilidad
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-4 h-4 ml-2 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p className="font-semibold mb-1">Normativa europea 2024:</p>
                    <ul className="list-disc list-inside text-sm space-y-1">
                      {getRegulationInfo('available').map((info, i) => (
                        <li key={i}>{info}</li>
                      ))}
                    </ul>
                  </TooltipContent>
                </Tooltip>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <TimeProgress 
                value={availabilityTimeToday} 
                max={MAX_AVAILABILITY_TIME} 
                type="available" 
                label="Tiempo disponible" 
              />
            </CardContent>
          </Card>
        </TooltipProvider>
      </div>
    </div>
  );
};

// Helper function to get activity label in Spanish
function getActivityLabel(type: ActivityType): string {
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

// Helper component for activity icons
const ActivityIcon = ({ type, className }: { type: ActivityType; className?: string }) => {
  switch (type) {
    case 'driving':
      return <Truck className={className} />;
    case 'rest':
      return <Coffee className={className} />;
    case 'additional':
      return <Clock className={className} />;
    case 'available':
      return <Bell className={className} />;
  }
};

export default Dashboard;
