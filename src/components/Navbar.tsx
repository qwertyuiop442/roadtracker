
import { Link, useLocation } from "react-router-dom";
import { Truck, Timer, Calendar, Settings, BarChart2 } from "lucide-react";
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
      icon: BarChart2,
      label: "Resumen",
      path: "/activity-summary",
    },
    {
      icon: Settings,
      label: "Ajustes",
      path: "/settings",
    },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-900 border-t border-slate-200 dark:border-slate-800 shadow-lg z-10 pb-safe transition-colors duration-300">
      <div className="container mx-auto px-1 sm:px-4">
        <div className="flex justify-around items-center py-1 sm:py-2">
          {navItems.map((item) => (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex flex-col items-center px-1 py-2 rounded-lg transition-colors duration-200",
                location.pathname === item.path
                  ? "text-truck-primary dark:text-truck-secondary animate-pulse-subtle"
                  : "text-slate-500 dark:text-slate-400 hover:text-truck-primary dark:hover:text-truck-secondary"
              )}
            >
              <item.icon className="w-5 h-5 sm:w-6 sm:h-6 mb-1" />
              <span className="text-[10px] sm:text-xs font-medium max-w-[60px] truncate text-center">{item.label}</span>
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
