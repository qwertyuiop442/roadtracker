
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5e468c28fc1846f384b92941af3b0b6b',
  appName: 'restful-roadtracker',
  webDir: 'dist',
  server: {
    url: 'https://5e468c28-fc18-46f3-84b9-2941af3b0b6b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#fffbf5",
      spinnerColor: "#FFA07A"
    }
  }
};

export default config;
