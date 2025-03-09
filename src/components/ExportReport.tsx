
import React, { useState } from 'react';
import { Button } from "@/components/ui/button";
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { useToast } from "@/hooks/use-toast";
import { Download, Share2, FileText } from "lucide-react";
import { TimeRange } from "@/lib/timeTracking";

interface ExportReportProps {
  className?: string;
}

const ExportReport = ({ className }: ExportReportProps) => {
  const { toast } = useToast();
  const [reportType, setReportType] = useState<'pdf' | 'png' | 'csv'>('pdf');
  const [timeRange, setTimeRange] = useState<TimeRange | 'month' | 'year'>('day');
  
  const handleExport = () => {
    // In a real app, this would generate and download the report
    toast({
      title: "Exportando informe",
      description: `Generando informe en formato ${reportType.toUpperCase()} para el periodo: ${getTimeRangeLabel()}`,
    });
    
    // Simulate download delay
    setTimeout(() => {
      toast({
        title: "Informe generado",
        description: "El informe se ha generado y descargado correctamente.",
      });
    }, 1500);
  };
  
  const handleShare = () => {
    toast({
      title: "Compartir informe",
      description: "Función para compartir en desarrollo.",
    });
  };
  
  const getTimeRangeLabel = () => {
    switch (timeRange) {
      case 'day': return 'Hoy';
      case 'week': return 'Esta semana';
      case 'biweek': return 'Últimas dos semanas';
      case 'month': return 'Este mes';
      case 'year': return 'Este año';
      default: return 'Periodo seleccionado';
    }
  };
  
  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button variant="outline" className={className}>
          <FileText className="mr-2 h-4 w-4" />
          Exportar informe
        </Button>
      </SheetTrigger>
      <SheetContent>
        <SheetHeader>
          <SheetTitle>Exportar informe de actividad</SheetTitle>
          <SheetDescription>
            Genera un informe detallado de tus actividades para el periodo seleccionado.
          </SheetDescription>
        </SheetHeader>
        
        <div className="py-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">Periodo</label>
            <Select 
              value={timeRange as string} 
              onValueChange={(value) => setTimeRange(value as any)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un periodo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="day">Hoy</SelectItem>
                <SelectItem value="week">Esta semana</SelectItem>
                <SelectItem value="biweek">Últimas dos semanas</SelectItem>
                <SelectItem value="month">Este mes</SelectItem>
                <SelectItem value="year">Este año</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="space-y-2">
            <label className="text-sm font-medium">Formato</label>
            <Select 
              value={reportType} 
              onValueChange={(value) => setReportType(value as 'pdf' | 'png' | 'csv')}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecciona un formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="pdf">PDF</SelectItem>
                <SelectItem value="png">Imagen (PNG)</SelectItem>
                <SelectItem value="csv">Datos (CSV)</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="pt-4 flex space-x-2">
            <Button onClick={handleExport} className="flex-1">
              <Download className="mr-2 h-4 w-4" />
              Descargar
            </Button>
            <Button variant="outline" onClick={handleShare}>
              <Share2 className="mr-2 h-4 w-4" />
              Compartir
            </Button>
          </div>
        </div>
      </SheetContent>
    </Sheet>
  );
};

export default ExportReport;
