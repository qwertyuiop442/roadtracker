
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.roadtrackerpro',
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
      spinnerColor: "#ffffff",
      showSpinner: true,
      androidScaleType: "CENTER_CROP"
    },
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
    },
    LocalNotifications: {
      smallIcon: "ic_stat_truck",
      iconColor: "#1e40af"
    },
    Keyboard: {
      resize: true,
      style: "dark",
      resizeOnFullScreen: true
    }
  },
  android: {
    buildOptions: {
      keystorePath: "roadtracker.keystore",
      keystoreAlias: "roadtracker",
      minSdkVersion: 29, // Android 10
      targetSdkVersion: 33,
      versionCode: 1,
      versionName: "1.0.0"
    }
  },
  ios: {
    contentInset: "always",
    allowsLinkPreview: false
  }
};

export default config;
