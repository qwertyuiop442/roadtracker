
import { useState } from "react";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Calendar as CalendarComponent } from "@/components/ui/calendar";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { X, Calendar as CalendarIcon } from "lucide-react";
import { format, isEqual, parse } from "date-fns";
import { es } from "date-fns/locale";

const Calendar = () => {
  const { holidayEntries, addHolidayEntry, removeHolidayEntry } = useTimeTracking();
  const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [description, setDescription] = useState("");
  const [isSixthDay, setIsSixthDay] = useState(false);
  
  // Function to check if a date has a holiday entry
  const hasHolidayEntry = (date: Date) => {
    return holidayEntries.some(entry => {
      const entryDate = new Date(entry.date);
      return isEqual(
        new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    });
  };
  
  // Function to handle form submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (selectedDate && description) {
      addHolidayEntry({
        date: selectedDate,
        description,
        isSixthDay
      });
      
      // Reset form
      setDescription("");
      setIsSixthDay(false);
      setIsDialogOpen(false);
    }
  };
  
  // Get holiday entries for selected date
  const getEntriesForDate = (date: Date) => {
    return holidayEntries.filter(entry => {
      const entryDate = new Date(entry.date);
      return isEqual(
        new Date(entryDate.getFullYear(), entryDate.getMonth(), entryDate.getDate()),
        new Date(date.getFullYear(), date.getMonth(), date.getDate())
      );
    });
  };
  
  const selectedDateEntries = selectedDate ? getEntriesForDate(selectedDate) : [];

  return (
    <div className="space-y-6">
      <h1 className="font-bold text-3xl mb-6">Festivos y Sextos Días</h1>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>Calendario</CardTitle>
              <CardDescription>Selecciona un día para ver o agregar registros</CardDescription>
            </CardHeader>
            <CardContent>
              <CalendarComponent
                mode="single"
                selected={selectedDate}
                onSelect={setSelectedDate}
                className="border rounded-md p-3"
                locale={es}
                modifiers={{
                  holiday: (date) => hasHolidayEntry(date),
                }}
                modifiersClassNames={{
                  holiday: "bg-truck-primary/20 font-bold",
                }}
              />
              
              <div className="mt-4">
                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="w-full">
                      Registrar día festivo o sexto día
                    </Button>
                  </DialogTrigger>
                  <DialogContent>
                    <DialogHeader>
                      <DialogTitle>Registrar festivo o sexto día</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleSubmit} className="space-y-4">
                      <div className="space-y-2">
                        <Label htmlFor="date">Fecha</Label>
                        <div className="flex h-10 items-center rounded-md border bg-background pl-3 text-sm ring-offset-background">
                          <CalendarIcon className="mr-2 h-4 w-4 opacity-50" />
                          <span>
                            {selectedDate ? format(selectedDate, 'PPP', { locale: es }) : 'Selecciona una fecha'}
                          </span>
                        </div>
                      </div>
                      
                      <div className="space-y-2">
                        <Label htmlFor="description">Descripción</Label>
                        <Textarea
                          id="description"
                          placeholder="Describe el trabajo realizado..."
                          value={description}
                          onChange={(e) => setDescription(e.target.value)}
                          required
                        />
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <Switch
                          id="sixth-day"
                          checked={isSixthDay}
                          onCheckedChange={setIsSixthDay}
                        />
                        <Label htmlFor="sixth-day">Es sexto día</Label>
                      </div>
                      
                      <Button type="submit" className="w-full">
                        Guardar registro
                      </Button>
                    </form>
                  </DialogContent>
                </Dialog>
              </div>
            </CardContent>
          </Card>
        </div>
        
        <div>
          <Card className="h-full">
            <CardHeader>
              <CardTitle>
                {selectedDate
                  ? `Registros para ${format(selectedDate, 'PPP', { locale: es })}`
                  : 'Selecciona una fecha'}
              </CardTitle>
            </CardHeader>
            <CardContent>
              {selectedDateEntries.length > 0 ? (
                <div className="space-y-4">
                  {selectedDateEntries.map((entry) => (
                    <Card key={entry.id} className="border-l-4 border-l-truck-primary">
                      <CardContent className="p-4">
                        <div className="flex justify-between items-start">
                          <div>
                            <p className="font-medium mb-1">
                              {entry.isSixthDay ? 'Sexto día' : 'Día festivo'}
                            </p>
                            <p className="text-sm">{entry.description}</p>
                          </div>
                          <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => removeHolidayEntry(entry.id)}
                            aria-label="Eliminar registro"
                          >
                            <X className="h-4 w-4" />
                          </Button>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <div className="flex flex-col items-center justify-center py-8 text-center">
                  <CalendarIcon className="h-12 w-12 text-muted-foreground mb-4 opacity-50" />
                  <p className="text-muted-foreground">
                    No hay registros para esta fecha
                  </p>
                  <Button 
                    variant="outline" 
                    className="mt-4"
                    onClick={() => setIsDialogOpen(true)}
                  >
                    Agregar registro
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Calendar;
