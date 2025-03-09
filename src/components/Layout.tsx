
import { Outlet } from "react-router-dom";
import Navbar from "./Navbar";
import TruckHeader from "./TruckHeader";

const Layout = () => {
  return (
    <div className="min-h-screen flex flex-col bg-background transition-colors duration-300">
      <TruckHeader />
      <main className="flex-1 container mx-auto px-4 py-6 pb-20 text-foreground">
        <Outlet />
      </main>
      <Navbar />
    </div>
  );
};

export default Layout;
