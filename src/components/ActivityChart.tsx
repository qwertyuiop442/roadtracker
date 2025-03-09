import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer, Cell } from "recharts";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { 
  ActivityType, 
  TimeRange, 
  getStartDateForRange, 
  getActivityTime, 
  EU_REGULATIONS_2024,
  formatTime 
} from "@/lib/timeTracking";
import { format, eachDayOfInterval, startOfWeek, endOfWeek, addDays, isToday } from "date-fns";
import { es } from "date-fns/locale";

interface ActivityChartProps {
  timeRange: TimeRange;
}

// Custom tooltip component
const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white p-3 border rounded-md shadow-md">
        <p className="font-medium">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center mt-1">
            <div 
              className="w-3 h-3 rounded-full mr-2" 
              style={{ backgroundColor: entry.color }}
            />
            <span>{entry.name}: {formatTime(entry.value)}</span>
          </div>
        ))}
      </div>
    );
  }

  return null;
};

const ActivityChart = ({ timeRange }: ActivityChartProps) => {
  const { timeEntries, extendedDrivingDays, extendedAvailabilityDays } = useTimeTracking();
  const [hoveredBar, setHoveredBar] = useState<string | null>(null);
  
  // Generate data based on time range
  const generateChartData = () => {
    const startDate = getStartDateForRange(timeRange);
    const endDate = new Date();
    
    // Format date for display
    const formatDate = (date: Date) => {
      if (timeRange === 'day') {
        return format(date, 'HH:00', { locale: es });
      }
      return format(date, 'dd MMM', { locale: es });
    };
    
    if (timeRange === 'day') {
      // Generate data for each hour of today
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      return Array.from({ length: 24 }, (_, i) => {
        const hourStart = new Date(today);
        hourStart.setHours(i, 0, 0, 0);
        
        const hourEnd = new Date(today);
        hourEnd.setHours(i, 59, 59, 999);
        
        // Get manual entries in this hour
        const manualEntries = timeEntries.filter(entry => {
          if (!entry.isManualEntry) return false;
          
          const entryDate = new Date(entry.startTime);
          // For day view, we don't care about the hour for manual entries
          return entryDate.getDate() === today.getDate() && 
                 entryDate.getMonth() === today.getMonth() &&
                 entryDate.getFullYear() === today.getFullYear();
        });
        
        // Distribute manual entries evenly across hours
        const manualDriving = manualEntries
          .filter(e => e.type === 'driving' && e.durationMinutes)
          .reduce((acc, e) => acc + (e.durationMinutes || 0), 0) / 24;
          
        const manualRest = manualEntries
          .filter(e => e.type === 'rest' && e.durationMinutes)
          .reduce((acc, e) => acc + (e.durationMinutes || 0), 0) / 24;
          
        const manualAdditional = manualEntries
          .filter(e => e.type === 'additional' && e.durationMinutes)
          .reduce((acc, e) => acc + (e.durationMinutes || 0), 0) / 24;
          
        const manualAvailable = manualEntries
          .filter(e => e.type === 'available' && e.durationMinutes)
          .reduce((acc, e) => acc + (e.durationMinutes || 0), 0) / 24;
        
        // Get real-time entries in this hour
        const realtimeDriving = getActivityTime(
          timeEntries.filter(e => !e.isManualEntry && e.type === 'driving'), 
          'driving', 
          hourStart, 
          hourEnd
        );
        
        const realtimeRest = getActivityTime(
          timeEntries.filter(e => !e.isManualEntry && e.type === 'rest'), 
          'rest', 
          hourStart, 
          hourEnd
        );
        
        const realtimeAdditional = getActivityTime(
          timeEntries.filter(e => !e.isManualEntry && e.type === 'additional'), 
          'additional', 
          hourStart, 
          hourEnd
        );
        
        const realtimeAvailable = getActivityTime(
          timeEntries.filter(e => !e.isManualEntry && e.type === 'available'), 
          'available', 
          hourStart, 
          hourEnd
        );
        
        return {
          name: formatDate(hourStart),
          driving: realtimeDriving + manualDriving,
          rest: realtimeRest + manualRest,
          additional: realtimeAdditional + manualAdditional,
          available: realtimeAvailable + manualAvailable,
          hour: i
        };
      });
    } else if (timeRange === 'week') {
      // Generate data for each day of the current week
      const monday = startOfWeek(new Date(), { weekStartsOn: 1 });
      const sunday = endOfWeek(new Date(), { weekStartsOn: 1 });
      
      const days = eachDayOfInterval({ start: monday, end: sunday });
      
      return days.map(day => {
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        
        // For week view, we need to check the exact day for manual entries
        const drivingTime = getActivityTime(timeEntries, 'driving', dayStart, dayEnd);
        const restTime = getActivityTime(timeEntries, 'rest', dayStart, dayEnd);
        const additionalTime = getActivityTime(timeEntries, 'additional', dayStart, dayEnd);
        const availableTime = getActivityTime(timeEntries, 'available', dayStart, dayEnd);
        
        const hasExtendedDriving = drivingTime > EU_REGULATIONS_2024.driving.daily;
        const hasExtendedAvailability = availableTime > 12 * 60;
        
        return {
          name: formatDate(day),
          isToday: isToday(day),
          driving: drivingTime,
          rest: restTime,
          additional: additionalTime,
          available: availableTime,
          hasExtendedDriving,
          hasExtendedAvailability,
          // Calculate non-compliance
          isNonCompliant: 
            drivingTime > EU_REGULATIONS_2024.driving.extendedDaily || 
            restTime < EU_REGULATIONS_2024.rest.reducedDaily ||
            availableTime > EU_REGULATIONS_2024.available.daily
        };
      });
    } else {
      // Generate data for each day of the last 14 days
      const twoWeeksAgo = new Date();
      twoWeeksAgo.setDate(twoWeeksAgo.getDate() - 13);
      twoWeeksAgo.setHours(0, 0, 0, 0);
      
      return Array.from({ length: 14 }, (_, i) => {
        const day = addDays(twoWeeksAgo, i);
        const dayStart = new Date(day);
        dayStart.setHours(0, 0, 0, 0);
        
        const dayEnd = new Date(day);
        dayEnd.setHours(23, 59, 59, 999);
        
        const drivingTime = getActivityTime(timeEntries, 'driving', dayStart, dayEnd);
        const restTime = getActivityTime(timeEntries, 'rest', dayStart, dayEnd);
        const additionalTime = getActivityTime(timeEntries, 'additional', dayStart, dayEnd);
        const availableTime = getActivityTime(timeEntries, 'available', dayStart, dayEnd);
        
        const hasExtendedDriving = drivingTime > EU_REGULATIONS_2024.driving.daily;
        const hasExtendedAvailability = availableTime > 12 * 60;
        
        return {
          name: formatDate(day),
          isToday: isToday(day),
          driving: drivingTime,
          rest: restTime,
          additional: additionalTime,
          available: availableTime,
          hasExtendedDriving,
          hasExtendedAvailability,
          // Calculate non-compliance
          isNonCompliant: 
            drivingTime > EU_REGULATIONS_2024.driving.extendedDaily || 
            restTime < EU_REGULATIONS_2024.rest.reducedDaily ||
            availableTime > EU_REGULATIONS_2024.available.daily
        };
      });
    }
  };
  
  const chartData = generateChartData();
  
  // Determine reference lines based on time range
  const getReferenceLines = () => {
    const lines = [];
    
    // Daily driving limit
    if (timeRange === 'day') {
      // Standard 9h driving limit
      lines.push({
        y: EU_REGULATIONS_2024.driving.daily / 60,
        label: '9h',
        stroke: '#1e40af',
        activity: 'driving',
        strokeDasharray: '3 3'
      });
      
      // Extended 10h driving limit
      lines.push({
        y: EU_REGULATIONS_2024.driving.extendedDaily / 60,
        label: '10h',
        stroke: '#ef4444',
        activity: 'driving'
      });
      
      // Daily rest recommendation
      lines.push({
        y: EU_REGULATIONS_2024.rest.daily / 60,
        label: '12h',
        stroke: '#15803d',
        activity: 'rest'
      });
      
      // Daily availability limit
      lines.push({
        y: EU_REGULATIONS_2024.available.daily / 60,
        label: '15h',
        stroke: '#9333ea',
        activity: 'available'
      });
    }
    
    if (timeRange === 'week') {
      // Weekly driving limit
      lines.push({
        y: EU_REGULATIONS_2024.driving.weekly / (60 * 7),
        label: '56h/sem',
        stroke: '#ef4444',
        activity: 'driving'
      });
      
      // Weekly rest recommendation
      lines.push({
        y: EU_REGULATIONS_2024.rest.weekly / (60 * 7),
        label: '48h/sem',
        stroke: '#15803d',
        activity: 'rest'
      });
    }
    
    return lines;
  };
  
  const referenceLines = getReferenceLines();
  
  // Generate custom cells for each bar to handle conditional styling
  const getDrivingBarCells = () => {
    return chartData.map((entry, index) => {
      let opacity = hoveredBar && hoveredBar !== 'driving' ? 0.5 : 1;
      
      if (entry.isNonCompliant && entry.driving > EU_REGULATIONS_2024.driving.extendedDaily) {
        opacity = 0.5; // Lower opacity for exceeding limits
      } else if (entry.hasExtendedDriving) {
        opacity = 0.8; // Slightly lower opacity for extended days
      }
      
      const stroke = entry.hasExtendedDriving ? '#ef4444' : undefined;
      const strokeWidth = entry.hasExtendedDriving ? 1 : 0;
      
      return (
        <Cell 
          key={`driving-cell-${index}`}
          fill="#1e40af"
          fillOpacity={opacity}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    });
  };
  
  const getAvailabilityBarCells = () => {
    return chartData.map((entry, index) => {
      let opacity = hoveredBar && hoveredBar !== 'available' ? 0.5 : 1;
      
      if (entry.isNonCompliant && entry.available > EU_REGULATIONS_2024.available.daily) {
        opacity = 0.5; // Lower opacity for exceeding limits
      } else if (entry.hasExtendedAvailability) {
        opacity = 0.8; // Slightly lower opacity for extended days
      }
      
      const stroke = entry.hasExtendedAvailability ? '#ef4444' : undefined;
      const strokeWidth = entry.hasExtendedAvailability ? 1 : 0;
      
      return (
        <Cell 
          key={`available-cell-${index}`}
          fill="#9333ea"
          fillOpacity={opacity}
          stroke={stroke}
          strokeWidth={strokeWidth}
        />
      );
    });
  };
  
  return (
    <div className="w-full h-[300px]">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart 
          data={chartData}
          margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
          barGap={0}
          barCategoryGap={timeRange === 'day' ? 4 : 8}
        >
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis 
            dataKey="name" 
            tick={{ fontSize: 12 }}
            tickMargin={10}
          />
          <YAxis 
            tickFormatter={(value) => `${Math.floor(value / 60)}h`}
            label={{ 
              value: 'Horas', 
              angle: -90, 
              position: 'insideLeft',
              style: { textAnchor: 'middle' }
            }}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend formatter={(value) => {
            switch (value) {
              case 'driving': return 'Conducción';
              case 'rest': return 'Descanso';
              case 'additional': return 'Otros Trabajos';
              case 'available': return 'Disponibilidad';
              default: return value;
            }
          }} />
          
          {/* Reference lines (regulation limits) */}
          {referenceLines.map((line, index) => (
            <ReferenceLine 
              key={index}
              y={line.y} 
              label={{ 
                value: line.label, 
                position: 'right',
                fill: line.stroke,
                fontSize: 12 
              }}
              stroke={line.stroke}
              strokeDasharray={line.strokeDasharray || "3 0"}
              ifOverflow="extendDomain"
            />
          ))}
          
          {/* Activity bars */}
          <Bar 
            dataKey="driving" 
            name="Conducción" 
            fill="#1e40af"  // This will be overridden by Cell components
            onMouseOver={() => setHoveredBar('driving')}
            onMouseOut={() => setHoveredBar(null)}
          >
            {getDrivingBarCells()}
          </Bar>
          <Bar 
            dataKey="rest" 
            name="Descanso" 
            fill="#15803d"
            onMouseOver={() => setHoveredBar('rest')}
            onMouseOut={() => setHoveredBar(null)}
            opacity={hoveredBar && hoveredBar !== 'rest' ? 0.5 : 1}
          />
          <Bar 
            dataKey="additional" 
            name="Otros Trabajos" 
            fill="#d97706"
            onMouseOver={() => setHoveredBar('additional')}
            onMouseOut={() => setHoveredBar(null)}
            opacity={hoveredBar && hoveredBar !== 'additional' ? 0.5 : 1}
          />
          <Bar 
            dataKey="available" 
            name="Disponibilidad" 
            fill="#9333ea"  // This will be overridden by Cell components
            onMouseOver={() => setHoveredBar('available')}
            onMouseOut={() => setHoveredBar(null)}
          >
            {getAvailabilityBarCells()}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
