
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
        return <Truck className="mr-2 h-5 w-5" />;
      case 'rest':
        return <Coffee className="mr-2 h-5 w-5" />;
      case 'additional':
        return <Clock className="mr-2 h-5 w-5" />;
      case 'available':
        return <Bell className="mr-2 h-5 w-5" />;
    }
  };
  
  const getLabel = () => {
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
        "h-16 text-lg rounded-xl shadow-sm", 
        getColorClass(),
        className
      )}
    >
      {getIcon()}
      {getLabel()}
    </Button>
  );
};

export default ActivityButton;
