
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { useTimeTracking } from "@/context/TimeTrackingContext";
import { useToast } from "@/components/ui/use-toast";
import { useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog";

const Settings = () => {
  const { resetTimeEntries } = useTimeTracking();
  const { toast } = useToast();
  const [isResetDialogOpen, setIsResetDialogOpen] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [autoBreak, setAutoBreak] = useState(true);
  
  const handleToggleNotifications = () => {
    setNotifications(!notifications);
    toast({
      title: "Configuración guardada",
      description: `Notificaciones ${!notifications ? 'activadas' : 'desactivadas'}.`,
    });
  };
  
  const handleToggleAutoBreak = () => {
    setAutoBreak(!autoBreak);
    toast({
      title: "Configuración guardada",
      description: `Descansos automáticos ${!autoBreak ? 'activados' : 'desactivados'}.`,
    });
  };
  
  const handleResetData = () => {
    resetTimeEntries();
    setIsResetDialogOpen(false);
  };
  
  return (
    <div className="space-y-6">
      <h1 className="font-bold text-3xl mb-6">Configuración</h1>
      
      <Card>
        <CardHeader>
          <CardTitle>Notificaciones</CardTitle>
          <CardDescription>Configura las notificaciones de la aplicación</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="notifications">Notificaciones de descanso</Label>
              <p className="text-sm text-muted-foreground">
                Recibe alertas cuando sea momento de tomar un descanso
              </p>
            </div>
            <Switch
              id="notifications"
              checked={notifications}
              onCheckedChange={handleToggleNotifications}
            />
          </div>
          
          <div className="flex items-center justify-between">
            <div className="space-y-0.5">
              <Label htmlFor="auto-break">Descansos automáticos</Label>
              <p className="text-sm text-muted-foreground">
                Iniciar automáticamente el descanso cuando se cumplan las horas máximas
              </p>
            </div>
            <Switch
              id="auto-break"
              checked={autoBreak}
              onCheckedChange={handleToggleAutoBreak}
            />
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Exportar datos</CardTitle>
          <CardDescription>Exporta tus registros de tiempos</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Button variant="outline" className="w-full sm:w-auto">
            Exportar a PDF
          </Button>
          <Button variant="outline" className="w-full sm:w-auto">
            Exportar a CSV
          </Button>
        </CardContent>
      </Card>
      
      <Card className="border-destructive/50">
        <CardHeader>
          <CardTitle className="text-destructive flex items-center">
            <AlertTriangle className="h-5 w-5 mr-2" />
            Zona de peligro
          </CardTitle>
          <CardDescription>
            Estas acciones no se pueden deshacer
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Button 
            variant="destructive" 
            onClick={() => setIsResetDialogOpen(true)}
          >
            Reiniciar todos los datos
          </Button>
        </CardContent>
      </Card>
      
      <Dialog open={isResetDialogOpen} onOpenChange={setIsResetDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>¿Estás seguro?</DialogTitle>
            <DialogDescription>
              Esta acción eliminará permanentemente todos tus registros de tiempos y no se puede deshacer.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsResetDialogOpen(false)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleResetData}>
              Sí, eliminar todos los datos
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Settings;
