
import React, { useState, useEffect } from 'react';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Download } from "lucide-react";

const PWAInstallPrompt = () => {
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isAppInstalled, setIsAppInstalled] = useState(false);
  const [showPrompt, setShowPrompt] = useState(false);

  useEffect(() => {
    // Check if app is already installed
    if (window.matchMedia('(display-mode: standalone)').matches || 
        window.navigator.standalone === true) {
      setIsAppInstalled(true);
      return;
    }

    // Capture the install prompt
    const handleBeforeInstallPrompt = (e: Event) => {
      // Prevent Chrome 67 and earlier from automatically showing the prompt
      e.preventDefault();
      // Stash the event so it can be triggered later
      setDeferredPrompt(e);
      // Show prompt after a delay
      setTimeout(() => setShowPrompt(true), 5000);
    };

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    
    // Detect when app is installed
    window.addEventListener('appinstalled', () => {
      setIsAppInstalled(true);
      setShowPrompt(false);
      console.log('PWA was installed');
    });

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    };
  }, []);

  const handleInstallClick = async () => {
    if (!deferredPrompt) return;
    
    // Show the install prompt
    deferredPrompt.prompt();
    
    // Wait for the user to respond to the prompt
    const { outcome } = await deferredPrompt.userChoice;
    console.log(`User ${outcome} the installation`);
    
    // We've used the prompt, so it can't be used again
    setDeferredPrompt(null);
    setShowPrompt(false);
  };

  const dismissPrompt = () => {
    setShowPrompt(false);
  };

  if (!showPrompt || isAppInstalled) return null;

  return (
    <Card className="fixed bottom-20 left-4 right-4 p-4 z-50 bg-white dark:bg-gray-800 shadow-lg">
      <div className="flex flex-col space-y-3">
        <p className="text-sm">Instala RoadTracker Pro para una mejor experiencia sin conexión</p>
        <div className="flex space-x-2 justify-end">
          <Button variant="outline" size="sm" onClick={dismissPrompt}>
            Ahora no
          </Button>
          <Button size="sm" onClick={handleInstallClick} className="bg-truck-primary hover:bg-truck-primary/90">
            <Download className="h-4 w-4 mr-1" />
            Instalar
          </Button>
        </div>
      </div>
    </Card>
  );
};

export default PWAInstallPrompt;
