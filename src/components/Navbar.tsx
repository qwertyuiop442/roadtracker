
import { Link, useLocation } from "react-router-dom";
import { Truck, Timer, Calendar, Settings } from "lucide-react";
import { cn } from "@/lib/utils";

const Navbar = () => {
  const location = useLocation();

  const navItems = [
    {
      icon: Truck,
      label: "Inicio",
      path: "/",
    },
    {
      icon: Timer,
      label: "Tiempos",
      path: "/tracker",
    },
    {
      icon: Calendar,
      label: "Calendario",
      path: "/calendar",
    },
    {
      icon: Settings,
      label: "Ajustes",
      path: "/settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t border-slate-200 shadow-lg z-10">
      <div className="container mx-auto px-4">
        <div className="flex justify-around items-center p-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center p-2 rounded-lg transition-colors duration-200",
                location.pathname === item.path
                  ? "text-truck-primary animate-pulse-subtle"
                  : "text-slate-500 hover:text-truck-primary"
              )}
            >
              <item.icon className="w-6 h-6 mb-1" />
              <span className="text-xs font-medium">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
