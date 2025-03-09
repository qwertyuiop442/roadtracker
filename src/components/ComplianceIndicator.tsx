
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { 
  ActivityType, 
  TimeRange, 
  getStartDateForRange, 
  getActivityTime,
  checkCompliancePercentage,
  getComplianceStatus, 
  formatTime,
  EU_REGULATIONS_2024
} from "@/lib/timeTracking";
import { AlertTriangle, CheckCircle, AlertCircle, Clock } from "lucide-react";

interface ComplianceIndicatorProps {
  activityType: ActivityType;
  timeRange: TimeRange;
}

const ComplianceIndicator = ({ activityType, timeRange }: ComplianceIndicatorProps) => {
  const { timeEntries } = useTimeTracking();
  
  // Calculate compliance
  const calculateCompliance = () => {
    const startDate = getStartDateForRange(timeRange);
    const activityTime = getActivityTime(timeEntries, activityType, startDate);
    const percentage = checkCompliancePercentage(activityTime, activityType, timeRange);
    const status = getComplianceStatus(percentage);
    
    return { percentage, status, activityTime };
  };
  
  const { percentage, status, activityTime } = calculateCompliance();
  
  // Get limits based on activity type and time range
  const getRegulationLimit = () => {
    switch (activityType) {
      case 'driving':
        if (timeRange === 'day') return EU_REGULATIONS_2024.driving.daily;
        if (timeRange === 'week') return EU_REGULATIONS_2024.driving.weekly;
        return EU_REGULATIONS_2024.driving.biweekly;
      case 'rest':
        if (timeRange === 'day') return EU_REGULATIONS_2024.rest.daily;
        if (timeRange === 'week') return EU_REGULATIONS_2024.rest.weekly;
        return EU_REGULATIONS_2024.rest.weekly * 2;
      case 'additional':
        if (timeRange === 'week') return EU_REGULATIONS_2024.additional.weekly;
        if (timeRange === 'biweek') return EU_REGULATIONS_2024.additional.biweekly;
        return 480; // Default 8 hours for day
      case 'available':
        return EU_REGULATIONS_2024.available.daily;
    }
  };
  
  const limit = getRegulationLimit();
  
  const getStatusIcon = () => {
    switch (status) {
      case 'safe':
        return <CheckCircle className="h-5 w-5 text-green-500" />;
      case 'warning':
        return <AlertTriangle className="h-5 w-5 text-amber-500" />;
      case 'danger':
        return <AlertCircle className="h-5 w-5 text-red-500" />;
    }
  };
  
  const getStatusText = () => {
    switch (status) {
      case 'safe':
        return "Límite normativo: Bien";
      case 'warning':
        return "Límite normativo: Atención";
      case 'danger':
        return "Límite normativo: Superado";
    }
  };
  
  const getRemainingTime = () => {
    return Math.max(0, limit - activityTime);
  };
  
  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <div className="flex items-center cursor-help">
            {getStatusIcon()}
          </div>
        </TooltipTrigger>
        <TooltipContent className="p-3 max-w-xs">
          <div className="space-y-2">
            <p className="font-medium">{getStatusText()}</p>
            <p className="text-sm">
              Has utilizado el {Math.round(percentage)}% del tiempo permitido.
            </p>
            <p className="text-sm">
              Tiempo acumulado: {formatTime(activityTime)}
            </p>
            <p className="text-sm flex items-center">
              <Clock className="h-3 w-3 mr-1 inline" /> 
              Tiempo restante: {formatTime(getRemainingTime())}
            </p>
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ComplianceIndicator;
