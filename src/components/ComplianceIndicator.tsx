
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { 
  ActivityType, 
  TimeRange, 
  getStartDateForRange, 
  getActivityTime,
  checkCompliancePercentage,
  getComplianceStatus, 
  formatTime
} from "@/lib/timeTracking";
import { AlertTriangle, CheckCircle, AlertCircle } from "lucide-react";

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
          </div>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

export default ComplianceIndicator;
