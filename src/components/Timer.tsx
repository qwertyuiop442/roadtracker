
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/timeTracking";

interface TimerProps {
  startTime?: Date;
  className?: string;
}

const Timer = ({ startTime, className }: TimerProps) => {
  const [elapsedMinutes, setElapsedMinutes] = useState<number>(0);
  
  useEffect(() => {
    if (!startTime) {
      setElapsedMinutes(0);
      return;
    }
    
    // Initial calculation
    const calcElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / (1000 * 60));
      setElapsedMinutes(elapsed);
    };
    
    calcElapsed();
    
    // Update every minute
    const interval = setInterval(calcElapsed, 60000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  const hours = Math.floor(elapsedMinutes / 60);
  const minutes = elapsedMinutes % 60;
  
  return (
    <div className={cn("timer-display", className)}>
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}
    </div>
  );
};

export default Timer;
