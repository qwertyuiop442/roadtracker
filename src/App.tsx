
import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import TimeTracker from "./pages/TimeTracker";
import Calendar from "./pages/Calendar";
import Settings from "./pages/Settings";
import ActivitySummary from "./pages/ActivitySummary";
import Layout from "./components/Layout";
import NotFound from "./pages/NotFound";
import { ThemeProvider } from "./context/ThemeContext";
import SplashScreen from "./components/SplashScreen";
import OfflineIndicator from "./components/OfflineIndicator";
import { useEffect, useState } from "react";

// Configure QueryClient to work completely offline
const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      retry: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
      staleTime: Infinity,
      networkMode: 'always'
    },
  },
});

const App = () => {
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Only show splash screen on first load or when installed
    const hasVisited = sessionStorage.getItem('hasVisited');
    if (hasVisited) {
      setShowSplash(false);
    } else {
      sessionStorage.setItem('hasVisited', 'true');
      
      // Hide splash after animation completes
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500); // Slightly longer than the animation
      
      return () => clearTimeout(timer);
    }
  }, []);

  return (
    <>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <TooltipProvider>
            {showSplash && <SplashScreen />}
            <Toaster />
            <Sonner />
            <OfflineIndicator />
            <BrowserRouter>
              <Routes>
                <Route path="/" element={<Layout />}>
                  <Route index element={<Dashboard />} />
                  <Route path="tracker" element={<TimeTracker />} />
                  <Route path="calendar" element={<Calendar />} />
                  <Route path="activity-summary" element={<ActivitySummary />} />
                  <Route path="settings" element={<Settings />} />
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </BrowserRouter>
          </TooltipProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </>
  );
};

export default App;
