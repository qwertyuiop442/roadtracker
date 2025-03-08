
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import TimeProgress from "@/components/TimeProgress";
import ActivityButton from "@/components/ActivityButton";
import Timer from "@/components/Timer";
import { Truck, Coffee, Clock, Bell, AlertTriangle, InfoIcon } from "lucide-react";
import { ActivityType, SPAIN_REGULATIONS, getRegulationInfo } from "@/lib/timeTracking";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";

const Dashboard = () => {
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
  
  // Spanish regulation limits (informative only)
  const MAX_DRIVING_TIME = SPAIN_REGULATIONS.driving.daily; // 9 hours
  const MAX_ADDITIONAL_TIME = 3 * 60; // 3 hours as example
  const RECOMMENDED_REST_TIME = SPAIN_REGULATIONS.rest.daily; // 11 hours
  
  const shouldShowBreakWarning = drivingTimeToday >= SPAIN_REGULATIONS.driving.continuous && restTimeToday < SPAIN_REGULATIONS.rest.break;
  
  const handleStartActivity = (type: ActivityType) => {
    // Information only, no restrictions
    if (currentActivity === 'driving' && type !== 'rest' && shouldShowBreakWarning) {
      toast({
        title: "Información de descanso",
        description: "Según la normativa española, deberías tomar un descanso de 45 minutos después de 4.5 horas de conducción.",
        variant: "default",
      });
    }
    
    startActivity(type);
  };

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-3xl mb-6">Mi Jornada</h1>
      
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
      
      {/* Information card with regulations */}
      <Card className="bg-muted/30 border">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg flex items-center">
            <InfoIcon className="w-5 h-5 mr-2 text-muted-foreground" />
            Normativa de tiempos (Informativo)
          </CardTitle>
          <CardDescription>
            Esta información es puramente orientativa según la normativa española
          </CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground mb-3">
            La app no impone restricciones de tiempo, solo muestra información sobre los límites legales en España
          </p>
        </CardContent>
      </Card>
      
      {/* Warning card - purely informative */}
      {shouldShowBreakWarning && (
        <Card className="bg-amber-50 border-amber-200">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-amber-500 mr-3" />
              <div>
                <h3 className="font-medium">Información de descanso recomendado</h3>
                <p className="text-sm">Según la normativa española, tras 4.5 horas de conducción se recomienda un descanso de 45 minutos.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
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
                    <p className="font-semibold mb-1">Normativa española:</p>
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
                label="Tiempo utilizado (informativo)" 
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
                    <p className="font-semibold mb-1">Normativa española:</p>
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
                label="Descanso realizado (informativo)" 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Clock className="w-5 h-5 mr-2 text-truck-tertiary" />
                Trabajo adicional
                <Tooltip>
                  <TooltipTrigger asChild>
                    <InfoIcon className="w-4 h-4 ml-2 text-muted-foreground cursor-pointer" />
                  </TooltipTrigger>
                  <TooltipContent className="w-80">
                    <p className="font-semibold mb-1">Normativa española:</p>
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
                max={MAX_ADDITIONAL_TIME} 
                type="additional" 
                label="Tiempo utilizado (informativo)" 
              />
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center">
                <Bell className="w-5 h-5 mr-2 text-truck-secondary" />
                Disponibilidad
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="py-2 text-center">
                <p className="text-sm text-muted-foreground mb-2">Estado actual</p>
                <p className="font-medium text-lg">
                  {currentActivity === 'available' 
                    ? 'Disponible' 
                    : 'No disponible'}
                </p>
              </div>
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
      return 'Trabajo adicional';
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
