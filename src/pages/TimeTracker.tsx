
import { useState } from "react";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { format } from "date-fns";
import { Truck, Coffee, Clock, Bell } from "lucide-react";
import { ActivityType } from "@/lib/timeTracking";
import ActivityButton from "@/components/ActivityButton";

const TimeTracker = () => {
  const { 
    currentActivity, 
    timeEntries, 
    startActivity, 
    stopActivity 
  } = useTimeTracking();
  const [activeTab, setActiveTab] = useState<ActivityType>('driving');

  // Get today's date
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Filter entries by type and date (today)
  const filteredEntries = timeEntries.filter(entry => {
    const entryDate = new Date(entry.startTime);
    entryDate.setHours(0, 0, 0, 0);
    return entry.type === activeTab && entryDate.getTime() === today.getTime();
  });

  // Function to format duration
  const formatDuration = (startTime: Date, endTime: Date | null) => {
    const end = endTime || new Date();
    const durationMs = end.getTime() - new Date(startTime).getTime();
    const hours = Math.floor(durationMs / (1000 * 60 * 60));
    const minutes = Math.floor((durationMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  // Function to get total time for current activity type
  const getTotalTime = () => {
    return filteredEntries.reduce((total, entry) => {
      const end = entry.endTime || new Date();
      return total + (end.getTime() - new Date(entry.startTime).getTime());
    }, 0);
  };

  // Format the total time
  const formatTotalTime = () => {
    const totalMs = getTotalTime();
    const hours = Math.floor(totalMs / (1000 * 60 * 60));
    const minutes = Math.floor((totalMs % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}h ${minutes}m`;
  };

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-3xl mb-6">Registro de Tiempos</h1>
      
      <Card className="border-2 shadow-md mb-6">
        <CardContent className="pt-6">
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
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg flex justify-between items-center">
                  <span>Registros de hoy</span>
                  <span className="text-sm font-normal">
                    Total: {formatTotalTime()}
                  </span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {filteredEntries.length > 0 ? (
                  <div className="space-y-3">
                    {filteredEntries.map((entry) => (
                      <div key={entry.id} className="flex justify-between items-center p-3 bg-muted/50 rounded-lg">
                        <div>
                          <p className="font-medium">
                            {format(new Date(entry.startTime), 'HH:mm')} - {entry.endTime ? format(new Date(entry.endTime), 'HH:mm') : 'En progreso'}
                          </p>
                          {entry.notes && (
                            <p className="text-sm text-muted-foreground">{entry.notes}</p>
                          )}
                        </div>
                        <p className="font-medium">
                          {formatDuration(entry.startTime, entry.endTime)}
                        </p>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <p>No hay registros para hoy.</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        ))}
      </Tabs>
    </div>
  );
};

export default TimeTracker;
