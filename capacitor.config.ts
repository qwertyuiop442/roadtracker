
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.roadtrackerpro',
  appName: 'RoadTracker Pro 2024',
  webDir: 'dist',
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#1e40af",
      spinnerColor: "#ffffff",
      showSpinner: true,
      androidScaleType: "CENTER_CROP"
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
