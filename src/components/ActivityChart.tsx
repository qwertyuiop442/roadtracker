
import { useState } from "react";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ReferenceLine, ResponsiveContainer } from "recharts";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { 
  ActivityType, 
  TimeRange, 
  getStartDateForRange, 
  getActivityTime, 
  SPAIN_REGULATIONS,
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
  const { timeEntries } = useTimeTracking();
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
        
        return {
          name: formatDate(hourStart),
          driving: getActivityTime(timeEntries, 'driving', hourStart, hourEnd),
          rest: getActivityTime(timeEntries, 'rest', hourStart, hourEnd),
          additional: getActivityTime(timeEntries, 'additional', hourStart, hourEnd),
          available: getActivityTime(timeEntries, 'available', hourStart, hourEnd),
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
        
        return {
          name: formatDate(day),
          isToday: isToday(day),
          driving: getActivityTime(timeEntries, 'driving', dayStart, dayEnd),
          rest: getActivityTime(timeEntries, 'rest', dayStart, dayEnd),
          additional: getActivityTime(timeEntries, 'additional', dayStart, dayEnd),
          available: getActivityTime(timeEntries, 'available', dayStart, dayEnd),
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
        
        return {
          name: formatDate(day),
          isToday: isToday(day),
          driving: getActivityTime(timeEntries, 'driving', dayStart, dayEnd),
          rest: getActivityTime(timeEntries, 'rest', dayStart, dayEnd),
          additional: getActivityTime(timeEntries, 'additional', dayStart, dayEnd),
          available: getActivityTime(timeEntries, 'available', dayStart, dayEnd),
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
      lines.push({
        y: SPAIN_REGULATIONS.driving.daily / 60,
        label: '9h',
        stroke: '#ef4444',
        activity: 'driving'
      });
    }
    
    return lines;
  };
  
  const referenceLines = getReferenceLines();
  
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
              strokeDasharray="3 3"
              ifOverflow="extendDomain"
            />
          ))}
          
          {/* Activity bars */}
          <Bar 
            dataKey="driving" 
            name="Conducción" 
            fill="#1e40af"
            onMouseOver={() => setHoveredBar('driving')}
            onMouseOut={() => setHoveredBar(null)}
            opacity={hoveredBar && hoveredBar !== 'driving' ? 0.5 : 1}
          />
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
            fill="#9333ea"
            onMouseOver={() => setHoveredBar('available')}
            onMouseOut={() => setHoveredBar(null)}
            opacity={hoveredBar && hoveredBar !== 'available' ? 0.5 : 1}
          />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
};

export default ActivityChart;
