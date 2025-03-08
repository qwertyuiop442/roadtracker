
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/components/ui/use-toast";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import TimeProgress from "@/components/TimeProgress";
import ActivityButton from "@/components/ActivityButton";
import Timer from "@/components/Timer";
import { Truck, Coffee, Clock, Bell, AlertTriangle } from "lucide-react";
import { ActivityType } from "@/lib/timeTracking";

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
  
  // Maximum allowed times in minutes
  const MAX_DRIVING_TIME = 9 * 60; // 9 hours
  const MAX_ADDITIONAL_TIME = 3 * 60; // 3 hours
  const REQUIRED_REST_TIME = 11 * 60; // 11 hours
  
  const shouldShowBreakWarning = drivingTimeToday >= 4.5 * 60 && restTimeToday < 45;
  
  const handleStartActivity = (type: ActivityType) => {
    // Check if we're switching from driving without enough rest
    if (currentActivity === 'driving' && type !== 'rest' && shouldShowBreakWarning) {
      toast({
        title: "Advertencia de descanso",
        description: "Deberías tomar un descanso de 45 minutos después de 4.5 horas de conducción.",
        variant: "destructive",
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
              <Timer startTime={currentEntry?.startTime} className="mb-6" />
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
      
      {/* Warning card */}
      {shouldShowBreakWarning && (
        <Card className="bg-truck-alert/10 border-truck-alert">
          <CardContent className="pt-6">
            <div className="flex items-center">
              <AlertTriangle className="w-8 h-8 text-truck-alert mr-3" />
              <div>
                <h3 className="font-medium">Descanso requerido</h3>
                <p className="text-sm">Has conducido por más de 4.5 horas. Se requiere un descanso de 45 minutos.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
      
      {/* Progress cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Truck className="w-5 h-5 mr-2 text-truck-primary" />
              Tiempo de conducción
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
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeProgress 
              value={restTimeToday} 
              max={REQUIRED_REST_TIME} 
              type="rest" 
              label="Descanso realizado" 
            />
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg flex items-center">
              <Clock className="w-5 h-5 mr-2 text-truck-tertiary" />
              Trabajo adicional
            </CardTitle>
          </CardHeader>
          <CardContent>
            <TimeProgress 
              value={additionalTimeToday} 
              max={MAX_ADDITIONAL_TIME} 
              type="additional" 
              label="Tiempo utilizado" 
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
