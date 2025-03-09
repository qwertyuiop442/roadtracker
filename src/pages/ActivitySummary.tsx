
import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { 
  ActivityType, 
  TimeRange, 
  getStartDateForRange, 
  formatTime, 
  EU_REGULATIONS_2024 
} from "@/lib/timeTracking";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import ActivityChart from "@/components/ActivityChart";
import ComplianceIndicator from "@/components/ComplianceIndicator";
import ExportReport from "@/components/ExportReport";
import { Truck, Coffee, Clock, Bell, AlertTriangle, Calendar, CalendarDays, CalendarRange } from "lucide-react";

const ActivitySummary = () => {
  const { timeEntries } = useTimeTracking();
  const [timeRange, setTimeRange] = useState<TimeRange>("day");
  
  // Get activity icon
  const getActivityIcon = (type: ActivityType, className?: string) => {
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
  
  // Get time range icon
  const getTimeRangeIcon = (range: TimeRange) => {
    switch (range) {
      case 'day':
        return <Calendar className="h-4 w-4 mr-1" />;
      case 'week':
        return <CalendarDays className="h-4 w-4 mr-1" />;
      case 'biweek':
        return <CalendarRange className="h-4 w-4 mr-1" />;
    }
  };
  
  // Get time range label
  const getTimeRangeLabel = (range: TimeRange) => {
    switch (range) {
      case 'day':
        return "Hoy";
      case 'week':
        return "Semana";
      case 'biweek':
        return "Bisemanal";
    }
  };
  
  // Get regulation limit for an activity and time range
  const getRegulationLimit = (activity: ActivityType, range: TimeRange): number => {
    switch (activity) {
      case 'driving':
        if (range === 'day') return EU_REGULATIONS_2024.driving.daily;
        if (range === 'week') return EU_REGULATIONS_2024.driving.weekly;
        return EU_REGULATIONS_2024.driving.biweekly;
      case 'rest':
        if (range === 'day') return EU_REGULATIONS_2024.rest.daily;
        if (range === 'week') return EU_REGULATIONS_2024.rest.weekly;
        return EU_REGULATIONS_2024.rest.weekly * 2;
      case 'additional':
        if (range === 'week') return EU_REGULATIONS_2024.additional.weekly;
        if (range === 'biweek') return EU_REGULATIONS_2024.additional.biweekly;
        return 480; // Default 8 hours for day
      case 'available':
        return EU_REGULATIONS_2024.available.daily;
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
        <h1 className="font-bold text-3xl">Resumen de Actividades</h1>
        <ExportReport className="self-start sm:self-auto" />
      </div>
      
      {/* Time range selection */}
      <Tabs 
        defaultValue="day" 
        value={timeRange} 
        onValueChange={(value) => setTimeRange(value as TimeRange)}
        className="mb-6"
      >
        <TabsList className="grid grid-cols-3">
          <TabsTrigger value="day">
            {getTimeRangeIcon('day')}
            <span className="ml-1">Hoy</span>
          </TabsTrigger>
          <TabsTrigger value="week">
            {getTimeRangeIcon('week')}
            <span className="ml-1">Semana</span>
          </TabsTrigger>
          <TabsTrigger value="biweek">
            {getTimeRangeIcon('biweek')}
            <span className="ml-1">Bisemanal</span>
          </TabsTrigger>
        </TabsList>
      </Tabs>
      
      {/* Chart */}
      <Card className="mb-6">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl flex justify-between items-center">
            <span>Actividades ({getTimeRangeLabel(timeRange)})</span>
            <span className="text-sm font-normal text-muted-foreground">
              Normativa Europea 2024
            </span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ActivityChart timeRange={timeRange} />
        </CardContent>
      </Card>
      
      {/* Summaries for each activity type */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {(['driving', 'rest', 'additional', 'available'] as ActivityType[]).map((activity) => (
          <Card key={activity}>
            <CardHeader className="pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-lg flex items-center">
                {getActivityIcon(activity, "w-5 h-5 mr-2")}
                {activity === 'driving' && 'Conducción'}
                {activity === 'rest' && 'Descanso'}
                {activity === 'additional' && 'Otros Trabajos'}
                {activity === 'available' && 'Disponibilidad'}
              </CardTitle>
              <ComplianceIndicator 
                activityType={activity} 
                timeRange={timeRange} 
              />
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-sm">
                    {timeRange === 'day' && 'Hoy'}
                    {timeRange === 'week' && 'Esta semana'}
                    {timeRange === 'biweek' && 'Últimas 2 semanas'}
                  </span>
                  <span className="font-medium">
                    {formatTime(getRegulationLimit(activity, timeRange))}
                  </span>
                </div>
                {activity === 'driving' && timeRange === 'day' && (
                  <div className="mt-4 bg-amber-50 rounded-md p-3 text-sm flex items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      Recuerda que tras 4 horas de conducción se debe realizar una pausa de 45 minutos.
                    </span>
                  </div>
                )}
                {activity === 'rest' && timeRange === 'week' && (
                  <div className="mt-4 bg-amber-50 rounded-md p-3 text-sm flex items-start">
                    <AlertTriangle className="w-4 h-4 text-amber-500 mr-2 mt-0.5 flex-shrink-0" />
                    <span>
                      El descanso semanal debe ser de 48 horas consecutivas cada 7 días.
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
};

export default ActivitySummary;
