
import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'app.lovable.roadtrackerpro',
  appName: 'RoadTracker Pro 2024',
  webDir: 'dist',
  server: {
    androidScheme: 'https',
    allowNavigation: ['*'],
    cleartext: true
  },
  plugins: {
    SplashScreen: {
      launchAutoHide: false,
      backgroundColor: "#FFA07A",
      spinnerColor: "#ffffff",
      showSpinner: true,
      androidScaleType: "CENTER_CROP"
    },
    LocalNotifications: {
      smallIcon: "ic_stat_truck",
      iconColor: "#FFA07A"
    },
    Keyboard: {
      resize: true,
      style: "dark",
      resizeOnFullScreen: true
    },
    // Add PWAConfig for Capacitor PWA Elements
    PWA: {
      enabled: true
    },
    // Add Push Notifications config
    PushNotifications: {
      presentationOptions: ["badge", "sound", "alert"]
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
    },
    // Android specific configurations for TWA (Trusted Web Activities)
    intentFilters: [
      {
        action: "android.intent.action.VIEW",
        category: ["android.intent.category.DEFAULT", "android.intent.category.BROWSABLE"],
        data: {
          scheme: "https",
          host: "*.roadtrackerpro.com"
        }
      }
    ],
    permissions: [
      "android.permission.CAMERA",
      "android.permission.ACCESS_FINE_LOCATION",
      "android.permission.ACCESS_COARSE_LOCATION",
      "android.permission.WAKE_LOCK",
      "android.permission.VIBRATE"
    ]
  },
  ios: {
    contentInset: "always",
    allowsLinkPreview: false,
    backgroundColor: "#FFA07A",
    preferredContentMode: "mobile",
    // Permission strings
    permissions: {
      camera: "Esta aplicación necesita acceso a la cámara para capturar fotos",
      location: "Esta aplicación necesita acceso a tu ubicación para registrar tus actividades"
    }
  }
};

export default config;
