
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { Truck, Clock, Coffee, Bell } from "lucide-react";
import { ActivityType } from "@/lib/timeTracking";

interface ActivityButtonProps {
  type: ActivityType;
  onClick: () => void;
  active?: boolean;
  className?: string;
}

const ActivityButton = ({ type, onClick, active, className }: ActivityButtonProps) => {
  const getIcon = () => {
    switch (type) {
      case 'driving':
        return <Truck className="mr-1 h-5 w-5 flex-shrink-0" />;
      case 'rest':
        return <Coffee className="mr-1 h-5 w-5 flex-shrink-0" />;
      case 'additional':
        return <Clock className="mr-1 h-5 w-5 flex-shrink-0" />;
      case 'available':
        return <Bell className="mr-1 h-5 w-5 flex-shrink-0" />;
    }
  };
  
  const getLabel = () => {
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
  
  const getColorClass = () => {
    if (!active) return '';
    
    switch (type) {
      case 'driving':
        return 'bg-truck-primary hover:bg-truck-primary/90';
      case 'rest':
        return 'bg-truck-rest hover:bg-truck-rest/90';
      case 'additional':
        return 'bg-truck-tertiary hover:bg-truck-tertiary/90';
      case 'available':
        return 'bg-truck-secondary hover:bg-truck-secondary/90';
    }
  };

  return (
    <Button
      variant={active ? "default" : "outline"}
      size="lg"
      onClick={onClick}
      className={cn(
        "h-16 text-sm sm:text-base md:text-lg rounded-xl shadow-sm flex items-center justify-center w-full", 
        getColorClass(),
        className
      )}
    >
      <div className="flex items-center justify-center min-w-0">
        {getIcon()}
        <span className="truncate">{getLabel()}</span>
      </div>
    </Button>
  );
};

export default ActivityButton;
