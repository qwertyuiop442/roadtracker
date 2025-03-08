
import { useState, useEffect } from "react";
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import { useToast } from "@/components/ui/use-toast";

const Layout = () => {
  const { toast } = useToast();
  const [online, setOnline] = useState(navigator.onLine);

  useEffect(() => {
    const handleOnline = () => {
      setOnline(true);
      toast({
        title: "Conexión restaurada",
        description: "Su conexión a internet ha sido restaurada.",
        variant: "default",
      });
    };

    const handleOffline = () => {
      setOnline(false);
      toast({
        title: "Sin conexión",
        description: "Funcionando en modo sin conexión.",
        variant: "destructive",
      });
    };

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, [toast]);

  return (
    <div className="min-h-screen flex flex-col">
      <main className="flex-1 container mx-auto px-4 py-6 pb-20">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export default Layout;
