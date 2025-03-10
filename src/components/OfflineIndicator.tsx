
import React, { useEffect, useState } from 'react';
import { Wifi, WifiOff } from 'lucide-react';
import { OfflineManager } from '@/utils/offlineManager';
import { toast } from 'sonner';

const OfflineIndicator = () => {
  const [isOffline, setIsOffline] = useState(OfflineManager.isOffline());
  
  useEffect(() => {
    const handleOffline = () => {
      setIsOffline(true);
      toast.warning('Sin conexión', {
        description: 'Trabajando en modo offline. Tus datos se guardarán localmente.',
      });
    };
    
    const handleOnline = () => {
      setIsOffline(false);
      toast.success('Conexión restaurada', {
        description: 'Tu conexión a internet está activa nuevamente.',
      });
    };
    
    // Initial check
    setIsOffline(OfflineManager.isOffline());
    
    // Register listeners
    OfflineManager.registerNetworkListeners(handleOffline, handleOnline);
    
    return () => {
      OfflineManager.unregisterNetworkListeners(handleOffline, handleOnline);
    };
  }, []);
  
  if (!isOffline) {
    return null;
  }
  
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-3 py-2 rounded-full shadow-md">
      <WifiOff size={16} />
      <span className="text-sm font-medium">Modo Offline</span>
    </div>
  );
};

export default OfflineIndicator;
