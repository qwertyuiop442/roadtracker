
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from "recharts";
import { 
  ActivityType, 
  getStartDateForRange, 
  getActivityTime,
  formatTime
} from "@/lib/timeTracking";
import { useState } from "react";

interface DailyCircleChartProps {
  className?: string;
}

const DailyCircleChart = ({ className }: DailyCircleChartProps) => {
  const { timeEntries } = useTimeTracking();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  
  // Get today's data
  const generateChartData = () => {
    const startDate = getStartDateForRange('day');
    
    const activities: { type: ActivityType; name: string; color: string }[] = [
      { type: 'driving', name: 'Conducción', color: '#1e40af' },
      { type: 'rest', name: 'Descanso', color: '#15803d' },
      { type: 'additional', name: 'Otros Trabajos', color: '#d97706' },
      { type: 'available', name: 'Disponibilidad', color: '#9333ea' }
    ];
    
    const data = activities.map(activity => {
      const minutes = getActivityTime(timeEntries, activity.type, startDate);
      return {
        name: activity.name,
        type: activity.type,
        value: minutes,
        color: activity.color
      };
    });
    
    // Filter out items with zero value
    return data.filter(item => item.value > 0);
  };
  
  const data = generateChartData();
  
  // Ensure we have data to display
  if (data.length === 0) {
    return (
      <div className={`${className} flex items-center justify-center h-[250px] bg-gray-50 rounded-lg`}>
        <p className="text-muted-foreground">No hay datos para mostrar hoy.</p>
      </div>
    );
  }
  
  // Custom tooltip
  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-white p-3 border rounded-md shadow-md">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm">{formatTime(data.value)}</p>
        </div>
      );
    }
    return null;
  };
  
  // Calculate total hours
  const totalMinutes = data.reduce((sum, item) => sum + item.value, 0);
  
  return (
    <div className={`${className} h-[300px]`}>
      <div className="text-center mb-2">
        <h3 className="text-sm font-medium">Distribución de actividades hoy</h3>
        <p className="text-xs text-muted-foreground">Total: {formatTime(totalMinutes)}</p>
      </div>
      <ResponsiveContainer width="100%" height="80%">
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={80}
            paddingAngle={2}
            dataKey="value"
            onMouseEnter={(_, index) => setActiveIndex(index)}
            onMouseLeave={() => setActiveIndex(null)}
          >
            {data.map((entry, index) => (
              <Cell 
                key={`cell-${index}`} 
                fill={entry.color} 
                opacity={activeIndex !== null && activeIndex !== index ? 0.6 : 1}
                stroke="#fff"
                strokeWidth={1}
              />
            ))}
          </Pie>
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            layout="horizontal" 
            verticalAlign="bottom" 
            align="center"
            formatter={(value) => <span className="text-xs">{value}</span>}
          />
        </PieChart>
      </ResponsiveContainer>
    </div>
  );
};

export default DailyCircleChart;
