
import { useState, useEffect } from "react";
import { cn } from "@/lib/utils";
import { formatMinutes } from "@/lib/timeTracking";

interface TimerProps {
  startTime?: Date;
  className?: string;
}

const Timer = ({ startTime, className }: TimerProps) => {
  const [elapsedSeconds, setElapsedSeconds] = useState<number>(0);
  
  useEffect(() => {
    if (!startTime) {
      setElapsedSeconds(0);
      return;
    }
    
    // Initial calculation
    const calcElapsed = () => {
      const now = new Date();
      const elapsed = Math.floor((now.getTime() - startTime.getTime()) / 1000);
      setElapsedSeconds(elapsed);
    };
    
    calcElapsed();
    
    // Update every second for more accurate tracking
    const interval = setInterval(calcElapsed, 1000);
    
    return () => clearInterval(interval);
  }, [startTime]);
  
  const hours = Math.floor(elapsedSeconds / 3600);
  const minutes = Math.floor((elapsedSeconds % 3600) / 60);
  const seconds = elapsedSeconds % 60;
  
  return (
    <div className={cn("timer-display", className)}>
      {hours.toString().padStart(2, '0')}:{minutes.toString().padStart(2, '0')}:{seconds.toString().padStart(2, '0')}
    </div>
  );
};

export default Timer;
