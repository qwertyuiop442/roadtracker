
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.5e468c28fc1846f384b92941af3b0b6b',
  appName: 'RoadTracker Pro 2024',
  webDir: 'dist',
  server: {
    url: 'https://5e468c28-fc18-46f3-84b9-2941af3b0b6b.lovableproject.com?forceHideBadge=true',
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#1e40af",
      spinnerColor: "#ffffff"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_truck",
      iconColor: "#1e40af"
    }
  }
};

export default config;
