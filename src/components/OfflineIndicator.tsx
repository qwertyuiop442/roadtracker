
import React from 'react';
import { WifiOff } from 'lucide-react';

const OfflineIndicator = () => {
  return (
    <div className="fixed bottom-4 left-4 z-50 flex items-center gap-2 bg-yellow-100 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-100 px-3 py-2 rounded-full shadow-md">
      <WifiOff size={16} />
      <span className="text-sm font-medium">Modo Offline Permanente</span>
    </div>
  );
};

export default OfflineIndicator;
