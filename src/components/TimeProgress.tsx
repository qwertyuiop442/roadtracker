
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";

interface TimeProgressProps {
  value: number;
  max: number;
  type: 'driving' | 'rest' | 'additional' | 'available';
  label?: string;
  showValue?: boolean;
}

const TimeProgress = ({ value, max, type, label, showValue = true }: TimeProgressProps) => {
  const percentage = Math.min((value / max) * 100, 100);
  
  const getColorClass = () => {
    switch (type) {
      case 'driving':
        return percentage > 90 ? 'bg-truck-alert' : 'bg-truck-primary';
      case 'rest':
        return 'bg-truck-rest';
      case 'additional':
        return 'bg-truck-tertiary';
      case 'available':
        return 'bg-truck-secondary';
    }
  };
  
  // Format hours and minutes
  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  return (
    <div className="w-full space-y-2">
      <div className="flex justify-between items-center">
        <p className="text-sm font-medium text-muted-foreground">{label || type}</p>
        {showValue && (
          <p className="text-sm font-medium">
            {formatTime(value)} / {formatTime(max)}
          </p>
        )}
      </div>
      <Progress
        value={percentage}
        className="h-3 bg-muted"
        indicatorClassName={cn("transition-all", getColorClass())}
      />
    </div>
  );
};

export default TimeProgress;
