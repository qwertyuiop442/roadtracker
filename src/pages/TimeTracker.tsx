
import { useState } from "react";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { es } from "date-fns/locale";
import { Truck, Coffee, Clock, Bell } from "lucide-react";
import { ActivityType, EU_REGULATIONS_2024, formatTimeWithLimit } from "@/lib/timeTracking";
import ActivityButton from "@/components/ActivityButton";
import ManualTimeEntry from "@/components/ManualTimeEntry";
import TimeEntriesList from "@/components/TimeEntriesList";

const TimeTracker = () => {
  const { 
    currentActivity, 
    timeEntries, 
    startActivity, 
    stopActivity,
    drivingTimeToday,
    restTimeToday,
    additionalTimeToday,
    availabilityTimeToday,
    extendedDrivingDays,
    extendedAvailabilityDays
  } = useTimeTracking();
  const [activeTab, setActiveTab] = useState<ActivityType>('driving');

  // Determine the limits based on extended days
  const drivingLimit = extendedDrivingDays < 2 
    ? EU_REGULATIONS_2024.driving.extendedDaily 
    : EU_REGULATIONS_2024.driving.daily;
    
  const availabilityLimit = extendedAvailabilityDays < 3
    ? EU_REGULATIONS_2024.available.daily
    : 12 * 60;

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-3xl mb-6">Registro de Tiempos</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <Card className="border-2 shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Actividad actual</CardTitle>
          </CardHeader>
          <CardContent className="pt-2">
            <div className="grid grid-cols-2 gap-3">
              <ActivityButton 
                type="driving" 
                onClick={() => startActivity('driving')} 
                active={currentActivity === 'driving'}
                className="mb-2"
              />
              <ActivityButton 
                type="rest" 
                onClick={() => startActivity('rest')} 
                active={currentActivity === 'rest'}
                className="mb-2"
              />
              <ActivityButton 
                type="additional" 
                onClick={() => startActivity('additional')} 
                active={currentActivity === 'additional'}
                className="mb-2"
              />
              <ActivityButton 
                type="available" 
                onClick={() => startActivity('available')} 
                active={currentActivity === 'available'}
                className="mb-2"
              />
            </div>
            
            {currentActivity && (
              <Button 
                variant="outline" 
                size="lg"
                className="w-full mt-4 bg-white border-2 border-gray-300 text-gray-800 hover:bg-gray-100"
                onClick={stopActivity}
              >
                Detener actividad actual
              </Button>
            )}
          </CardContent>
        </Card>
        
        <ManualTimeEntry />
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <Card className="p-4 bg-gray-50 border">
          <div className="flex items-center space-x-3">
            <Truck className="h-6 w-6 text-truck-primary" />
            <div>
              <p className="text-muted-foreground text-xs">Conducción hoy</p>
              <p className="font-semibold">
                {formatTimeWithLimit(drivingTimeToday, drivingLimit)}
              </p>
              {extendedDrivingDays > 0 && (
                <p className="text-xs text-muted-foreground">
                  Día {extendedDrivingDays}/2 de conducción extendida
                </p>
              )}
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gray-50 border">
          <div className="flex items-center space-x-3">
            <Coffee className="h-6 w-6 text-truck-rest" />
            <div>
              <p className="text-muted-foreground text-xs">Descanso hoy</p>
              <p className="font-semibold">
                {formatTimeWithLimit(restTimeToday, EU_REGULATIONS_2024.rest.daily)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gray-50 border">
          <div className="flex items-center space-x-3">
            <Clock className="h-6 w-6 text-truck-tertiary" />
            <div>
              <p className="text-muted-foreground text-xs">Otros trabajos hoy</p>
              <p className="font-semibold">
                {formatTimeWithLimit(additionalTimeToday, 8 * 60)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4 bg-gray-50 border">
          <div className="flex items-center space-x-3">
            <Bell className="h-6 w-6 text-truck-secondary" />
            <div>
              <p className="text-muted-foreground text-xs">Disponibilidad hoy</p>
              <p className="font-semibold">
                {formatTimeWithLimit(availabilityTimeToday, availabilityLimit)}
              </p>
              {extendedAvailabilityDays > 0 && (
                <p className="text-xs text-muted-foreground">
                  Día {extendedAvailabilityDays}/3 de disponibilidad máxima
                </p>
              )}
            </div>
          </div>
        </Card>
      </div>
      
      <Tabs defaultValue="driving" value={activeTab} onValueChange={(value) => setActiveTab(value as ActivityType)}>
        <TabsList className="grid grid-cols-4 mb-6">
          <TabsTrigger value="driving" className="data-[state=active]:bg-truck-primary">
            <Truck className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Conducción</span>
          </TabsTrigger>
          <TabsTrigger value="rest" className="data-[state=active]:bg-truck-rest">
            <Coffee className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Descanso</span>
          </TabsTrigger>
          <TabsTrigger value="additional" className="data-[state=active]:bg-truck-tertiary">
            <Clock className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Otros Trabajos</span>
          </TabsTrigger>
          <TabsTrigger value="available" className="data-[state=active]:bg-truck-secondary">
            <Bell className="h-4 w-4 mr-1" />
            <span className="hidden md:inline">Disponible</span>
          </TabsTrigger>
        </TabsList>
        
        {['driving', 'rest', 'additional', 'available'].map((type) => (
          <TabsContent key={type} value={type} className="mt-0">
            <TimeEntriesList type={type as ActivityType} />
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TimeTracker;
